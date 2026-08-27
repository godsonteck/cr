// ═══════════════════════════════════════════════════════════
// Product Service — PostgreSQL Authoritative Catalog
// ═══════════════════════════════════════════════════════════

import { sql } from '@/lib/db';
import { recordAuditEvent } from './auditService';
import { products as fallbackProducts } from '@/data/products';

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
    stockCount: row.stock_count,
    lowStockThreshold: row.low_stock_threshold,
    inStock: row.in_stock && row.stock_count > 0,
    badge: row.badge,
    rating: parseFloat(row.rating || 5.0),
    reviewCount: row.review_count || 0,
    status: row.status,
    image: row.image,
    images: row.images || [],
    description: row.description,
    details: row.details || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
  } catch (e) {
    console.warn('[productService] DB query failed, using fallback catalog');
  }
  return fallbackProducts;
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
  return fallbackProducts;
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
  return fallbackProducts.find((p) => p.slug === slug) || null;
}

export async function getProductById(id) {
  const rows = await sql`
    SELECT * FROM products
    WHERE id = ${id}
    LIMIT 1;
  `;
  return rows.length > 0 ? formatProduct(rows[0]) : null;
}

export async function getProductsByCategory(categorySlug) {
  const rows = await sql`
    SELECT * FROM products
    WHERE category = ${categorySlug} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
    ORDER BY created_at DESC;
  `;
  return rows.map(formatProduct);
}

export async function getProductsBySubcategory(subcategory) {
  const rows = await sql`
    SELECT * FROM products
    WHERE LOWER(subcategory) = ${subcategory.toLowerCase()} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
    ORDER BY created_at DESC;
  `;
  return rows.map(formatProduct);
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
  return fallbackProducts.slice(0, count);
}

export async function getNewArrivals(count = 8) {
  const rows = await sql`
    SELECT * FROM products
    WHERE (badge = 'new' OR created_at > '2026-07-01') AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
    ORDER BY created_at DESC
    LIMIT ${count};
  `;
  return rows.map(formatProduct);
}

export async function getSaleProducts(count = 8) {
  const rows = await sql`
    SELECT * FROM products
    WHERE badge = 'sale' AND original_price IS NOT NULL AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
    ORDER BY created_at DESC
    LIMIT ${count};
  `;
  return rows.map(formatProduct);
}

export async function filterProducts({
  category,
  subcategory,
  brand,
  query,
  minPrice,
  maxPrice,
  inStockOnly,
  sortBy = 'default',
} = {}) {
  let whereClause = "WHERE status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')";
  const params = [];

  if (category) {
    params.push(category);
    whereClause += ` AND category = $${params.length}`;
  }
  if (subcategory) {
    params.push(subcategory.toLowerCase());
    whereClause += ` AND LOWER(subcategory) = $${params.length}`;
  }
  if (brand) {
    params.push(brand.toLowerCase());
    whereClause += ` AND LOWER(brand) = $${params.length}`;
  }
  if (query && query.trim()) {
    const q = `%${query.toLowerCase().trim()}%`;
    params.push(q, q, q, q, q);
    whereClause += ` AND (LOWER(name) LIKE $${params.length - 4} OR LOWER(category) LIKE $${params.length - 3} OR LOWER(subcategory) LIKE $${params.length - 2} OR LOWER(brand) LIKE $${params.length - 1} OR LOWER(description) LIKE $${params.length})`;
  }
  if (minPrice !== undefined) {
    params.push(minPrice);
    whereClause += ` AND price >= $${params.length}`;
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice);
    whereClause += ` AND price <= $${params.length}`;
  }
  if (inStockOnly) {
    whereClause += ` AND in_stock = true AND stock_count > 0`;
  }

  let orderClause = 'ORDER BY created_at DESC';
  switch (sortBy) {
    case 'price-asc':
      orderClause = 'ORDER BY price ASC';
      break;
    case 'price-desc':
      orderClause = 'ORDER BY price DESC';
      break;
    case 'newest':
      orderClause = 'ORDER BY created_at DESC';
      break;
    case 'name-asc':
      orderClause = 'ORDER BY name ASC';
      break;
  }

  const sqlQuery = `SELECT * FROM products ${whereClause} ${orderClause}`;
  const rows = await sql(sqlQuery, params);
  return rows.map(formatProduct);
}

export async function searchProducts(query) {
  if (!query || query.trim().length < 2) return [];
  const q = `%${query.toLowerCase().trim()}%`;
  const rows = await sql`
    SELECT * FROM products
    WHERE status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN') AND (
      LOWER(name) LIKE ${q} OR
      LOWER(category) LIKE ${q} OR
      LOWER(subcategory) LIKE ${q} OR
      LOWER(brand) LIKE ${q} OR
      LOWER(description) LIKE ${q}
    )
    ORDER BY created_at DESC;
  `;
  return rows.map(formatProduct);
}

export async function searchProductsAdmin(query) {
  if (!query || query.trim().length < 2) return getAllProductsAdmin();
  const q = `%${query.toLowerCase().trim()}%`;
  const rows = await sql`
    SELECT * FROM products
    WHERE LOWER(name) LIKE ${q} OR
          LOWER(id) LIKE ${q} OR
          LOWER(category) LIKE ${q} OR
          LOWER(subcategory) LIKE ${q} OR
          LOWER(brand) LIKE ${q}
    ORDER BY created_at DESC;
  `;
  return rows.map(formatProduct);
}

export async function getRelatedProducts(product, count = 4) {
  if (!product) return [];
  const rows = await sql`
    SELECT * FROM products
    WHERE id != ${product.id} AND status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
      AND (category = ${product.category} OR subcategory = ${product.subcategory})
    LIMIT ${count};
  `;
  return rows.map(formatProduct);
}

export async function getAllCategories() {
  const rows = await sql`
    SELECT DISTINCT category, subcategory FROM products
    WHERE status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN')
    ORDER BY category, subcategory;
  `;
  const categories = {};
  rows.forEach(row => {
    if (!categories[row.category]) {
      categories[row.category] = {
        id: row.category,
        name: row.category.charAt(0).toUpperCase() + row.category.slice(1),
        slug: row.category,
        subcategories: [],
      };
    }
    if (row.subcategory && !categories[row.category].subcategories.some(s => s.id === row.subcategory)) {
      categories[row.category].subcategories.push({
        id: row.subcategory,
        name: row.subcategory,
        slug: row.subcategory.toLowerCase().replace(/\s+/g, '-'),
      });
    }
  });
  return Object.values(categories);
}

export async function getCategoryBySlug(slug) {
  const categories = await getAllCategories();
  return categories.find(c => c.slug === slug) || null;
}

export async function getAllBrands() {
  const rows = await sql`
    SELECT DISTINCT brand FROM products
    WHERE brand IS NOT NULL AND brand != ''
    ORDER BY brand;
  `;
  return rows.map(r => r.brand);
}

export async function getPriceRange() {
  const rows = await sql`
    SELECT MIN(price) as min, MAX(price) as max FROM products
    WHERE status NOT IN ('ARCHIVED', 'DRAFT', 'HIDDEN');
  `;
  return {
    min: parseFloat(rows[0]?.min || 0),
    max: parseFloat(rows[0]?.max || 500),
  };
}

export async function createProduct(productData, operator = 'Admin') {
  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prod-${Date.now().toString().slice(-4)}`;

  await sql`
    INSERT INTO products (
      id, slug, name, brand, category, subcategory,
      price, original_price, cost_price, stock_count,
      low_stock_threshold, in_stock, badge, status,
      image, description, details, created_at, updated_at
    ) VALUES (
      ${id}, ${slug}, ${productData.name}, ${productData.brand || 'CR Essentials'}, ${productData.category || 'skincare'}, ${productData.subcategory || 'General'},
      ${Number(productData.price) || 0}, ${productData.originalPrice ? Number(productData.originalPrice) : null}, ${productData.costPrice ? Number(productData.costPrice) : null}, ${Number(productData.stockCount) || 20},
      ${productData.lowStockThreshold || 5}, ${Number(productData.stockCount || 20) > 0}, ${productData.badge || 'new'}, ${productData.status || 'PUBLISHED'},
      ${productData.image || null}, ${productData.description || ''}, ${JSON.stringify(productData.details || {})}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
  `;

  await recordAuditEvent({
    action: 'PRODUCT_CREATED',
    operator,
    entityId: id,
    entityType: 'PRODUCT',
    details: { name: productData.name, price: productData.price, category: productData.category },
  });

  return getProductById(id);
}

export async function updateProduct(productId, updates, operator = 'Admin') {
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
      if (dbKey === 'details') {
        values.push(JSON.stringify(value));
      } else if (dbKey === 'images') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(productId);

  const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
  const result = await sql(query, values);

  if (result.length === 0) throw new Error(`Product ${productId} not found`);

  await recordAuditEvent({
    action: 'PRODUCT_UPDATED',
    operator,
    entityId: productId,
    entityType: 'PRODUCT',
    details: { updates },
  });

  return formatProduct(result[0]);
}

export async function archiveProduct(productId, operator = 'Admin') {
  return updateProduct(productId, { status: 'ARCHIVED' }, operator);
}