import type { CategoryConfig, DepartmentType, Product } from '../types';

export const CATALOG_SORTS = ['featured', 'newest', 'best-sellers', 'price-low', 'price-high', 'rating', 'name'] as const;
export type CatalogSort = typeof CATALOG_SORTS[number];

export interface CatalogFilters {
  query: string;
  department: DepartmentType | null;
  categorySlug: string;
  brand: string;
  onlyInStock: boolean;
  sort: CatalogSort;
}

export function normalizeCatalogText(value: string | null | undefined) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function isCatalogSort(value: string | null): value is CatalogSort {
  return Boolean(value && CATALOG_SORTS.includes(value as CatalogSort));
}

export function readCatalogFilters(
  params: URLSearchParams,
  defaults: { department?: DepartmentType; categorySlug?: string } = {},
): CatalogFilters {
  const department = params.get('dept');
  const sort = params.get('sort');
  return {
    query: params.get('q')?.trim() || '',
    department: defaults.department || (department === 'beauty' || department === 'groceries' ? department : null),
    categorySlug: defaults.categorySlug || params.get('category')?.trim() || '',
    brand: params.get('brand')?.trim() || 'All Brands',
    onlyInStock: params.get('instock') === 'true',
    sort: isCatalogSort(sort) ? sort : 'featured',
  };
}

export function productMatchesCatalogQuery(product: Product, query: string) {
  const terms = normalizeCatalogText(query).split(' ').filter(Boolean);
  if (!terms.length) return true;

  const searchable = normalizeCatalogText([
    product.name,
    product.brand,
    product.categoryLabel,
    product.category,
    product.unit,
    product.packSize,
    product.origin,
    product.description,
    product.highlights.join(' '),
    product.details?.howToUse,
    product.details?.ingredients,
    product.details?.benefits,
    product.skinType?.join(' '),
    product.skinConcern?.join(' '),
    product.variants?.flatMap(variant => [variant.name, ...Object.values(variant.options || {})]).join(' '),
  ].filter(Boolean).join(' '));

  return terms.every(term => searchable.includes(term));
}

export function filterCatalogProducts(products: Product[], filters: CatalogFilters, categories: CategoryConfig[]) {
  const selectedCategory = filters.categorySlug
    ? categories.find(category => category.slug === filters.categorySlug)
    : null;
  if (filters.categorySlug && !selectedCategory) return [];

  const selectedBrand = normalizeCatalogText(filters.brand);
  const originalIndex = new Map(products.map((product, index) => [product.id, index]));
  const filtered = products.filter(product => {
    if (filters.department && product.department !== filters.department) return false;
    if (selectedCategory && product.category !== selectedCategory.id) return false;
    if (filters.brand !== 'All Brands' && normalizeCatalogText(product.brand) !== selectedBrand) return false;
    if (filters.onlyInStock && (!product.inStock || Number(product.stockCount ?? 0) <= 0)) return false;
    return productMatchesCatalogQuery(product, filters.query);
  });

  return filtered.sort((left, right) => {
    const leftIndex = originalIndex.get(left.id) ?? 0;
    const rightIndex = originalIndex.get(right.id) ?? 0;
    if (filters.sort === 'newest') return rightIndex - leftIndex;
    if (filters.sort === 'price-low') return Number(left.price) - Number(right.price) || leftIndex - rightIndex;
    if (filters.sort === 'price-high') return Number(right.price) - Number(left.price) || leftIndex - rightIndex;
    if (filters.sort === 'best-sellers') {
      return Number(right.reviewCount || 0) - Number(left.reviewCount || 0)
        || Number(right.rating || 0) - Number(left.rating || 0)
        || leftIndex - rightIndex;
    }
    if (filters.sort === 'rating') {
      return Number(right.rating || 0) - Number(left.rating || 0)
        || Number(right.reviewCount || 0) - Number(left.reviewCount || 0)
        || leftIndex - rightIndex;
    }
    if (filters.sort === 'name') return normalizeCatalogText(left.name).localeCompare(normalizeCatalogText(right.name)) || leftIndex - rightIndex;
    return leftIndex - rightIndex;
  });
}
