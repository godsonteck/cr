import type { CategoryType, DepartmentType, Product } from '../types';

export type AdminStockFilter = 'all' | 'in' | 'low' | 'out';
export type AdminPublicationFilter = 'all' | 'published' | 'draft';
export type AdminProductSort = 'featured' | 'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export interface AdminCatalogFilters {
  query: string;
  department: 'all' | DepartmentType;
  category: 'all' | CategoryType;
  brand: string;
  stock: AdminStockFilter;
  publication: AdminPublicationFilter;
  sort: AdminProductSort;
}

function normalize(value: string | null | undefined) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function adminProductMatchesQuery(product: Product, query: string) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return true;

  const searchable = normalize([
    product.name,
    product.brand,
    product.category,
    product.categoryLabel,
    product.unit,
    product.packSize,
    product.origin,
    product.description,
    product.highlights.join(' '),
    product.barcode,
    product.serialNumber,
    product.details?.howToUse,
    product.details?.ingredients,
    product.details?.benefits,
    product.variants?.flatMap(variant => [
      variant.name,
      variant.barcode,
      variant.serialNumber,
      ...Object.values(variant.options || {}),
    ]).join(' '),
  ].filter(Boolean).join(' '));

  return terms.every(term => searchable.includes(term));
}

export function filterAndSortAdminProducts(products: Product[], filters: AdminCatalogFilters) {
  const brand = normalize(filters.brand);
  const originalIndex = new Map(products.map((product, index) => [product.id, index]));
  const filtered = products.filter(product => {
    const stock = Number(product.stockCount || 0);
    if (filters.department !== 'all' && product.department !== filters.department) return false;
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.brand !== 'all' && normalize(product.brand) !== brand) return false;
    if (filters.stock === 'out' && stock > 0) return false;
    if (filters.stock === 'low' && (stock <= 0 || stock > 5)) return false;
    if (filters.stock === 'in' && stock <= 0) return false;
    if (filters.publication === 'published' && product.isPublished !== true) return false;
    if (filters.publication === 'draft' && product.isPublished === true) return false;
    return adminProductMatchesQuery(product, filters.query);
  });

  return filtered.sort((left, right) => {
    const leftIndex = originalIndex.get(left.id) ?? 0;
    const rightIndex = originalIndex.get(right.id) ?? 0;
    const leftName = normalize(left.name);
    const rightName = normalize(right.name);
    const leftPrice = Number(left.price || 0);
    const rightPrice = Number(right.price || 0);
    const leftStock = Number(left.stockCount || 0);
    const rightStock = Number(right.stockCount || 0);

    if (filters.sort === 'newest') {
      const leftCreatedAt = Date.parse(left.createdAt || '');
      const rightCreatedAt = Date.parse(right.createdAt || '');
      if (Number.isFinite(leftCreatedAt) && Number.isFinite(rightCreatedAt) && leftCreatedAt !== rightCreatedAt) {
        return rightCreatedAt - leftCreatedAt;
      }
      if (Number.isFinite(leftCreatedAt) !== Number.isFinite(rightCreatedAt)) {
        return Number.isFinite(rightCreatedAt) ? 1 : -1;
      }
      return leftIndex - rightIndex;
    }
    if (filters.sort === 'name-asc') return leftName.localeCompare(rightName) || leftIndex - rightIndex;
    if (filters.sort === 'name-desc') return rightName.localeCompare(leftName) || leftIndex - rightIndex;
    if (filters.sort === 'price-asc') return leftPrice - rightPrice || leftIndex - rightIndex;
    if (filters.sort === 'price-desc') return rightPrice - leftPrice || leftIndex - rightIndex;
    if (filters.sort === 'stock-asc') return leftStock - rightStock || leftIndex - rightIndex;
    if (filters.sort === 'stock-desc') return rightStock - leftStock || leftIndex - rightIndex;
    return leftIndex - rightIndex;
  });
}
