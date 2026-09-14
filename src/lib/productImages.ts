/** Product media is served only from the store's Supabase Storage bucket. */
export const isSupabaseStorageImage = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname.endsWith('.supabase.co')
      && url.pathname.includes('/storage/v1/object/');
  } catch {
    return false;
  }
};

/** Existing database media remains visible until the admin migration moves it to Storage. */
export const isRenderableProductImage = (value: unknown): value is string =>
  typeof value === 'string' && (value.startsWith('data:image/') || /^https:\/\//.test(value));

export const productImageUrls = (images: unknown[]): string[] =>
  Array.from(new Set(images.filter(isRenderableProductImage)));
