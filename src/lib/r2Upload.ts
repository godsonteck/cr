const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export class R2UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'R2UploadError';
  }
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const dataUrl = String(event.target?.result ?? '');
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 840;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.78,
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadFallback(file: File, adminToken: string): Promise<string> {
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = (e) => resolve(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  });
  const res = await fetch('/api/products?imageUpload=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ image: dataUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new R2UploadError(err.error || 'Upload failed.');
  }
  const data = await res.json();
  return data.url;
}

interface SignResponse {
  configured?: boolean;
  uploadUrl?: string;
  publicUrl?: string;
}

export async function uploadImageToR2(
  file: File,
  adminToken: string,
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new R2UploadError('Use a JPG, PNG, WEBP, or GIF image.');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new R2UploadError('Image must be smaller than 10 MB.');
  }

  const compressed = await compressImage(file);

  try {
    const signRes = await fetch('/api/r2-sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        contentType: 'image/jpeg',
        size: compressed.size,
      }),
    });

    if (!signRes.ok) {
      return uploadFallback(compressed, adminToken);
    }

    const signData = (await signRes.json()) as SignResponse;

    if (!signData.configured || !signData.uploadUrl || !signData.publicUrl) {
      return uploadFallback(compressed, adminToken);
    }

    const putRes = await fetch(signData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: compressed,
    });

    if (!putRes.ok) {
      return uploadFallback(compressed, adminToken);
    }

    return signData.publicUrl;
  } catch {
    return uploadFallback(compressed, adminToken);
  }
}

export const isR2Image = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL ?? '';
    const r2Domain = r2PublicUrl ? new URL(r2PublicUrl).hostname : '';
    return (
      url.protocol === 'https:' &&
      (r2Domain ? url.hostname === r2Domain : url.hostname.endsWith('.r2.dev'))
    );
  } catch {
    return false;
  }
};

export const isValidProductImageUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};
