import { Product } from '../types';

function hasAvailableInventory(product: Product): boolean {
  if (product.variants?.length) {
    return product.variants.some(variant => Boolean(variant.inStock) && Number(variant.stockCount ?? 0) > 0);
  }

  return Boolean(product.inStock) && Number(product.stockCount ?? 0) > 0;
}

/** Keep one inventory record, while making each sellable variation discoverable. */
export function storefrontListings(products: Product[]): Product[] {
  return products.flatMap(product => {
    if (product.isPublished === false || !hasAvailableInventory(product)) return [];

    const variationCards = (product.variants || [])
      .filter(variant => variant.inStock && (variant.stockCount ?? 0) > 0)
      .map(variant => ({
        ...product,
        id: `${product.id}::${variant.id}`,
        listingParentId: product.id,
        listingVariantId: variant.id,
        name: `${product.name} — ${variant.name}`,
        image: variant.image || product.image,
        images: variant.image ? [variant.image, ...product.images.filter(image => image !== variant.image)] : product.images,
        price: Number(variant.price),
        originalPrice: variant.originalPrice ?? product.originalPrice,
        stockCount: Number(variant.stockCount ?? 0),
        inStock: Boolean(variant.inStock),
      }));

    return [product, ...variationCards];
  });
}
