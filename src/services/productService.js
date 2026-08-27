// ═══════════════════════════════════════════════════════════
// Product Service — PostgreSQL & Reactive Storage Catalog
// ═══════════════════════════════════════════════════════════

import { sql } from '@/lib/db';
import { recordAuditEvent } from './auditService';
import { products as initialFallbackProducts, categories as initialCategories, brands as initialBrands } from '@/data/products';
import { storeStorage } from '@/utils/storeStorage';

// In-memory runtime cache for server-side & client-side persistence
let memoryProducts = [...initialFallbackProducts];

function getStoredProducts() {
  if (typeof window !== 'undefined') {
    const stored = storeStorage.getProducts(null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      memoryProducts = stored;
      return stored;
    }
  }
  return memoryProducts;
}

function saveStoredProducts(list) {
  memoryProducts = list;
  if (typeof window !== 'undefined') {
    storeStorage.saveProducts(list);
  }
}

function formatProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    costPrice: row.cost_price ? parseFloat(row.cost_price) : null,
    stockCount: row.stock_count !== undefined ? row.stock_count : 20,
    lowStockThreshold: row.low_stock_threshold || 5,
    inStock: row.in_stock !== false && (row.stock_count === undefined || row.stock_count > 0),
    badge: row.badge,
    rating: parseFloat(row.rating || 5.0),
    reviewCount: row.review_count || 0,
    status: row.status || 'PUBLISHED',
    image: row.image,
    images: row.images || (row.image ? [row.image] : []),
    description: row.description,
    details: row.details || {},
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function getAllProducts() {
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
      ORDER BY created_at DESC;
    `;
    if (rows && rows.length > 0) {
      return rows.map(formatProduct);
    }
  } catch (e) {}
  
  const current = getStoredProducts();
  return current.filter((p) => p.status !== 'ARCHIVED' && p.status !== 'HIDDEN' && p.status !== 'DRAFT');
}

export function getAllProductsSync() {
  const current = getStoredProducts();
  return current.filter((p) => p.status !== 'ARCHIVED' && p.status !== 'HIDDEN' && p.status !== 'DRAFT');
}

export async function getAllProductsAdmin() {
  try {
    const rows = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC;
    `;
    if (rows && rows.length > 0) {
      return rows.map(formatProduct);
    }
  } catch (e) {}
  
  return getStoredProducts();
}

export function getAllProductsAdminSync() {
  return getStoredProducts();
}

export async function getProductBySlug(slug) {
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE slug = ${slug} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
      LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      return formatProduct(rows[0]);
    }
  } catch (e) {}
  
  const current = getStoredProducts();
  return current.find((p) => p.slug === slug && p.status !== 'ARCHIVED' && p.status !== 'HIDDEN') || null;
}

export async function getProductById(id) {
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE id = ${id}
      LIMIT 1;
    `;
    if (rows && rows.length > 0) return formatProduct(rows[0]);
  } catch (e) {}
  
  const current = getStoredProducts();
  return current.find((p) => p.id === id) || null;
}

export async function getProductsByCategory(categorySlug) {
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE category = ${categorySlug} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
      ORDER BY created_at DESC;
    `;
    if (rows && rows.length > 0) return rows.map(formatProduct);
  } catch (e) {}
  
  const current = getStoredProducts();
  return current.filter((p) => p.category === categorySlug && p.status !== 'ARCHIVED' && p.status !== 'HIDDEN');
}

export async function getFeaturedProducts(count = 8) {
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE in_stock = true AND status = 'PUBLISHED'
      ORDER BY created_at DESC
      LIMIT ${count};
    `;
    if (rows && rows.length > 0) {
      return rows.map(formatProduct);
    }
  } catch (e) {}
  
  const current = getStoredProducts();
  const valid = current.filter((p) => p.inStock && p.status !== 'ARCHIVED' && p.status !== 'HIDDEN');
  return valid.slice(0, count);
}

export async function getRelatedProducts(product, count = 4) {
  if (!product) return [];
  try {
    const rows = await sql`
      SELECT * FROM products
      WHERE id != ${product.id} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
        AND (category = ${product.category} OR subcategory = ${product.subcategory})
      LIMIT ${count};
    `;
    if (rows && rows.length > 0) return rows.map(formatProduct);
  } catch (e) {}
  
  const current = getStoredProducts();
  return current
    .filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory) && p.status !== 'ARCHIVED' && p.status !== 'HIDDEN')
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
  let list = getStoredProducts().filter(
    (p) => p.status !== 'ARCHIVED' && p.status !== 'HIDDEN' && p.status !== 'DRAFT'
  );

  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (subcategory) {
    list = list.filter(
      (p) => p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase()
    );
  }
  if (brand) {
    list = list.filter((p) => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = (p.category || '').toLowerCase().includes(q);
      const subMatch = (p.subcategory || '').toLowerCase().includes(q);
      const brandMatch = (p.brand || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return nameMatch || catMatch || subMatch || brandMatch || descMatch || tagMatch;
    });
  }
  if (minPrice !== undefined) {
    list = list.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    list = list.filter((p) => p.price <= maxPrice);
  }
  if (inStockOnly) {
    list = list.filter((p) => p.inStock && (p.stockCount === undefined || p.stockCount > 0));
  }

  // Sorting
  switch (sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    default:
      // Default: bestsellers & priority
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      break;
  }

  return list;
}

export function searchProducts(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const list = getStoredProducts().filter(
    (p) => p.status !== 'ARCHIVED' && p.status !== 'HIDDEN' && p.status !== 'DRAFT'
  );
  return list.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(q);
    const catMatch = (p.category || '').toLowerCase().includes(q);
    const subMatch = (p.subcategory || '').toLowerCase().includes(q);
    const brandMatch = (p.brand || '').toLowerCase().includes(q);
    const descMatch = (p.description || '').toLowerCase().includes(q);
    return nameMatch || catMatch || subMatch || brandMatch || descMatch;
  });
}

export function searchProductsAdmin(query) {
  if (!query || query.trim().length < 2) return getStoredProducts();
  const q = query.toLowerCase().trim();
  return getStoredProducts().filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(q);
    const idMatch = (p.id || '').toLowerCase().includes(q);
    const catMatch = (p.category || '').toLowerCase().includes(q);
    const brandMatch = (p.brand || '').toLowerCase().includes(q);
    return nameMatch || idMatch || catMatch || brandMatch;
  });
}

export function getAllCategories() {
  return initialCategories;
}

export function getAllBrands() {
  const current = getStoredProducts();
  const set = new Set(current.map((p) => p.brand).filter(Boolean));
  return Array.from(set);
}

export function getPriceRange() {
  const current = getStoredProducts().filter(
    (p) => p.status !== 'ARCHIVED' && p.status !== 'HIDDEN'
  );
  if (current.length === 0) return { min: 0, max: 500 };
  const prices = current.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export async function createProduct(productData, operator = 'Admin') {
  const slug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const id = productData.id || `prod-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id,
    slug,
    name: productData.name,
    brand: productData.brand || 'CR Essentials',
    category: productData.category || 'skincare',
    subcategory: productData.subcategory || (productData.category === 'groceries' ? 'Pantry' : 'Face'),
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    costPrice: productData.costPrice ? Number(productData.costPrice) : null,
    stockCount: Number(productData.stockCount) || 25,
    lowStockThreshold: productData.lowStockThreshold || 5,
    inStock: Number(productData.stockCount || 25) > 0,
    badge: productData.badge || 'new',
    rating: 5.0,
    reviewCount: 1,
    status: productData.status || 'PUBLISHED',
    image: productData.image || '/images/products/1.jpeg',
    images: [productData.image || '/images/products/1.jpeg'],
    description: productData.description || '',
    details: productData.details || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Try PostgreSQL insertion if configured
  try {
    await sql`
      INSERT INTO products (
        id, slug, name, brand, category, subcategory,
        price, original_price, cost_price, stock_count,
        low_stock_threshold, in_stock, badge, status,
        image, description, details, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${newProduct.name}, ${newProduct.brand}, ${newProduct.category}, ${newProduct.subcategory},
        ${newProduct.price}, ${newProduct.originalPrice}, ${newProduct.costPrice}, ${newProduct.stockCount},
        ${newProduct.lowStockThreshold}, ${newProduct.inStock}, ${newProduct.badge}, ${newProduct.status},
        ${newProduct.image}, ${newProduct.description}, ${JSON.stringify(newProduct.details)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    `;
  } catch (e) {}

  // 2. Synchronize memory & local storage
  const current = getStoredProducts();
  const updated = [newProduct, ...current.filter((p) => p.id !== id)];
  saveStoredProducts(updated);

  try {
    await recordAuditEvent({
      action: 'PRODUCT_CREATED',
      operator,
      entityId: id,
      entityType: 'PRODUCT',
      details: { name: newProduct.name, price: newProduct.price, category: newProduct.category },
    });
  } catch (e) {}

  return newProduct;
}

export async function updateProduct(productId, updates, operator = 'Admin') {
  const current = getStoredProducts();
  const existing = current.find((p) => p.id === productId);
  if (!existing) return null;

  const updatedProduct = {
    ...existing,
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    originalPrice: updates.originalPrice !== undefined ? (updates.originalPrice ? Number(updates.originalPrice) : null) : existing.originalPrice,
    stockCount: updates.stockCount !== undefined ? Number(updates.stockCount) : existing.stockCount,
    inStock: updates.stockCount !== undefined ? Number(updates.stockCount) > 0 : (updates.inStock !== undefined ? updates.inStock : existing.inStock),
    updatedAt: new Date().toISOString(),
  };

  // 1. Try DB update
  try {
    const allowedFields = [
      'name', 'brand', 'category', 'subcategory', 'price', 'original_price',
      'cost_price', 'stock_count', 'low_stock_threshold', 'in_stock',
      'badge', 'status', 'image', 'images', 'description', 'details'
    ];
    const setClauses = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${values.length + 1}`);
        if (dbKey === 'details' || dbKey === 'images') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }
    if (setClauses.length > 0) {
      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(productId);
      const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length}`;
      await sql(query, values);
    }
  } catch (e) {}

  // 2. Synchronize memory & local storage
  const updatedList = current.map((p) => (p.id === productId ? updatedProduct : p));
  saveStoredProducts(updatedList);

  try {
    await recordAuditEvent({
      action: 'PRODUCT_UPDATED',
      operator,
      entityId: productId,
      entityType: 'PRODUCT',
      details: { updates },
    });
  } catch (e) {}

  return updatedProduct;
}

export async function archiveProduct(productId, operator = 'Admin') {
  return updateProduct(productId, { status: 'ARCHIVED' }, operator);
}

export async function deleteProduct(productId, operator = 'Admin') {
  // 1. Try SQL deletion
  try {
    await sql`DELETE FROM products WHERE id = ${productId}`;
  } catch (e) {}

  // 2. Delete from storeStorage & memory
  const current = getStoredProducts();
  const updatedList = current.filter((p) => p.id !== productId);
  saveStoredProducts(updatedList);

  try {
    await recordAuditEvent({
      action: 'PRODUCT_DELETED',
      operator,
      entityId: productId,
      entityType: 'PRODUCT',
      details: { productId },
    });
  } catch (e) {}

  return true;
}