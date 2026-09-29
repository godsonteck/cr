import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { requireAdmin } from '../server-api/_auth.js';

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function buildPresignedPutUrl(opts: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): string {
  const {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    key,
    contentType,
    expiresInSeconds = 300,
  } = opts;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const endpoint = `https://${host}`;
  const service = 's3';
  const region = 'auto';

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 8);
  const datetimeStr = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';

  const credentialScope = `${dateStr}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const canonicalPath = `/${encodeURIComponent(bucket)}/${encodedKey}`;

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
    'X-Amz-Credential': credential,
    'X-Amz-Date': datetimeStr,
    'X-Amz-Expires': String(expiresInSeconds),
    'X-Amz-SignedHeaders': 'content-type;host',
    'content-type': contentType,
  };

  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';

  const canonicalRequest = [
    'PUT',
    canonicalPath,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const canonicalRequestHash = sha256Hex(canonicalRequest);

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetimeStr,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStr);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  const finalQueryString = `${canonicalQueryString}&X-Amz-Signature=${signature}`;
  return `${endpoint}${canonicalPath}?${finalQueryString}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  const { contentType, size } = req.body ?? {};
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Unsupported image type.' });
  }
  if (typeof size !== 'number' || size <= 0 || size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image must be between 1 byte and 10 MB.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return res.status(200).json({ configured: false });
  }

  const ext = contentType === 'image/jpeg' ? 'jpg'
    : contentType === 'image/png' ? 'png'
    : contentType === 'image/webp' ? 'webp'
    : 'gif';

  const date = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const key = `products/${date}/${uuid}.${ext}`;
  try {
    const uploadUrl = buildPresignedPutUrl({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      key,
      contentType,
      expiresInSeconds: 300,
    });

    const publicUrl = `${publicBaseUrl}/${key}`;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, uploadUrl, publicUrl });
  } catch (err) {
    console.error('R2 pre-sign error:', err);
    return res.status(500).json({ error: 'Could not generate an upload URL. Please try again.' });
  }
}
