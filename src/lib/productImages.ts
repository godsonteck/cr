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

export const productImageUrls = (images: unknown[]): string[] =>
  Array.from(new Set(images.filter(isSupabaseStorageImage)));
