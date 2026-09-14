import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_auth.js';
import { db } from '../src/neon.js';
import { products } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function parseImage(dataUrl: unknown) {
  if (typeof dataUrl !== 'string') throw new Error('Image data is required.');
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match || !allowedTypes.has(match[1])) throw new Error('Use a JPG, PNG, WEBP, or GIF image.');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('Image must be smaller than 10 MB.');
  return { contentType: match[1], bytes };
}

const isStorageUrl = (value: unknown) => typeof value === 'string' && /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\//.test(value);

async function uploadDataUrl(dataUrl: unknown, supabaseUrl: string, serviceKey: string) {
  const { contentType, bytes } = parseImage(dataUrl);
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
  const objectPath = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const bucket = await fetch(`${supabaseUrl}/storage/v1/bucket/product-media`, { headers });
  if (bucket.status === 404) {
    const created = await fetch(`${supabaseUrl}/storage/v1/bucket`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'product-media', name: 'product-media', public: true }) });
    if (!created.ok && created.status !== 409) throw new Error('Could not create the product image bucket.');
  } else if (!bucket.ok) throw new Error('Could not access the product image bucket.');
  const uploaded = await fetch(`${supabaseUrl}/storage/v1/object/product-media/${objectPath}`, { method: 'POST', headers: { ...headers, 'Content-Type': contentType, 'x-upsert': 'false' }, body: bytes });
  if (!uploaded.ok) throw new Error('Supabase Storage rejected the image upload.');
  return `${supabaseUrl}/storage/v1/object/public/product-media/${objectPath}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!await requireAdmin(req, res)) return;

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(503).json({ error: 'Supabase Storage is not configured.' });

  try {
    if (req.query.migrate === 'true') {
      const rows = await db.select().from(products);
      const legacy = rows.filter(product => !isStorageUrl(product.image));
      let migrated = 0;
      for (const product of legacy) {
        const image = await uploadDataUrl(product.image, supabaseUrl, serviceKey);
        const images = [image, ...(product.images || []).filter(isStorageUrl)];
        await db.update(products).set({ image, images, updatedAt: new Date() }).where(eq(products.id, product.id));
        migrated++;
      }
      return res.status(200).json({ migrated, remaining: 0 });
    }
    return res.status(201).json({ url: await uploadDataUrl(req.body?.image, supabaseUrl, serviceKey) });
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Image upload failed.' });
  }
}
