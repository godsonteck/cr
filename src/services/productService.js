// ═══════════════════════════════════════════════════════════
// Product Service — Live Reactive Catalog Engine
// Master Directive Section 04, 05, 06, 14, 15, 16, 17, 18, 19, 20, 21
// ═══════════════════════════════════════════════════════════

import { products as initialProducts, categories as initialCategories, brands as initialBrands } from '@/data/products';
import { recordAuditEvent } from './auditService';
import { storeStorage } from '@/utils/storeStorage';

function getLiveProducts() {
  return storeStorage.getProducts(initialProducts);
}

function saveLiveProducts(list) {
  storeStorage.saveProducts(list);
}

export function getAllProducts() {
  // Public storefront sees published products with active status
  return getLiveProducts().filter(
    (p) => p.status !== 'ARCHIVED' && p.status !== 'DRAFT' && p.status !== 'HIDDEN'
  );
}

export function getAllProductsAdmin() {
  // Admin sees all products (including Draft, Hidden, Archived)
  return getLiveProducts();
}

export function getProductBySlug(slug) {
  return getLiveProducts().find((p) => p.slug === slug) || null;
}

export function getProductById(id) {
  return getLiveProducts().find((p) => p.id === id) || null;
}

export function getProductsByCategory(categorySlug) {
  return getAllProducts().filter((p) => p.category === categorySlug);
}

export function getProductsBySubcategory(subcategory) {
  return getAllProducts().filter(
    (p) => p.subcategory?.toLowerCase() === subcategory.toLowerCase()
  );
}

export function getFeaturedProducts(count = 8) {
  return getAllProducts()
    .filter((p) => p.inStock)
    .slice(0, count);
}

export function getNewArrivals(count = 8) {
  return getAllProducts()
    .filter((p) => p.badge === 'new' || new Date(p.createdAt) > new Date('2026-07-01'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, count);
}

export function getSaleProducts(count = 8) {
  return getAllProducts()
    .filter((p) => p.badge === 'sale' && p.originalPrice)
    .slice(0, count);
}

export function filterProducts({
  category,
  subcategory,
  brand,
  query,
  minPrice,
  maxPrice,
  inStockOnly,
  sortBy = 'default',
} = {}) {
  let list = getAllProducts();

  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (subcategory) {
    list = list.filter((p) => p.subcategory?.toLowerCase() === subcategory.toLowerCase());
  }
  if (brand) {
    list = list.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q))) ||
      p.description?.toLowerCase().includes(q)
    );
  }
  if (minPrice !== undefined) {
    list = list.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    list = list.filter((p) => p.price <= maxPrice);
  }
  if (inStockOnly) {
    list = list.filter((p) => p.inStock);
  }

  // Sorting
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'newest':
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'default':
    default:
      return list;
  }
}

export function searchProducts(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return getAllProducts().filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.subcategory?.toLowerCase().includes(q) ||
    p.brand?.toLowerCase().includes(q) ||
    (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q))) ||
    p.description?.toLowerCase().includes(q)
  );
}

export function searchProductsAdmin(query) {
  if (!query || query.trim().length < 2) return getAllProductsAdmin();
  const q = query.toLowerCase().trim();
  return getLiveProducts().filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.subcategory?.toLowerCase().includes(q) ||
    p.brand?.toLowerCase().includes(q)
  );
}

export function getRelatedProducts(product, count = 4) {
  if (!product) return [];
  return getAllProducts()
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, count);
}

export function getAllCategories() {
  return initialCategories;
}

export function getCategoryBySlug(slug) {
  return initialCategories.find((c) => c.slug === slug) || null;
}

export function getAllBrands() {
  return initialBrands;
}

export function getPriceRange() {
  const prices = getAllProducts().map((p) => p.price);
  return {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 500,
  };
}

/**
 * Admin Product Mutation: Create Product
 */
export function createProduct(productData, operator = 'Admin') {
  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prod-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id,
    slug,
    name: productData.name,
    brand: productData.brand || 'CR Essentials',
    category: productData.category || 'skincare',
    subcategory: productData.subcategory || 'General',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 0,
    badge: productData.badge || 'new',
    inStock: Number(productData.stockCount) > 0,
    stockCount: Number(productData.stockCount) || 20,
    image: productData.image || '/images/products/1.jpeg',
    description: productData.description || '',
    details: productData.details || {},
    tags: productData.tags || [productData.category, productData.subcategory],
    status: productData.status || 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = getLiveProducts();
  list.unshift(newProduct);
  saveLiveProducts(list);

  recordAuditEvent({
    action: 'PRODUCT_CREATED',
    operator,
    entityId: newProduct.id,
    entityType: 'PRODUCT',
    details: { name: newProduct.name, price: newProduct.price, category: newProduct.category },
  });

  return newProduct;
}

/**
 * Admin Product Mutation: Update Product
 */
export function updateProduct(productId, updates, operator = 'Admin') {
  const list = getLiveProducts();
  const index = list.findIndex((p) => p.id === productId);
  if (index === -1) throw new Error(`Product ${productId} not found`);

  const prev = { ...list[index] };
  const updated = {
    ...prev,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.stockCount !== undefined) {
    updated.inStock = Number(updates.stockCount) > 0;
  }

  list[index] = updated;
  saveLiveProducts(list);

  recordAuditEvent({
    action: 'PRODUCT_UPDATED',
    operator,
    entityId: productId,
    entityType: 'PRODUCT',
    details: { before: prev, after: updated },
  });

  return updated;
}

/**
 * Admin Product Mutation: Archive Product (Soft Delete)
 */
export function archiveProduct(productId, operator = 'Admin') {
  return updateProduct(productId, { status: 'ARCHIVED' }, operator);
}
