import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { validateAdminSession } from '@/services/authService';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cr_admin_session')?.value;

  if (!token) return null;

  return validateAdminSession(token);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const inStockOnly = searchParams.get('inStock') === 'true';
    const adminOnly = searchParams.get('admin') === 'true';

    // For admin requests, verify admin auth
    if (adminOnly) {
      const admin = await checkAdminAuth();
      if (!admin) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    let rows;
    if (category) {
      rows = await sql`
        SELECT * FROM products
        WHERE status != 'ARCHIVED' AND category = ${category}
        ORDER BY created_at DESC;
      `;
    } else if (query) {
      const q = `%${query.toLowerCase().trim()}%`;
      rows = await sql`
        SELECT * FROM products
        WHERE status != 'ARCHIVED' AND (
          LOWER(name) LIKE ${q} OR
          LOWER(category) LIKE ${q} OR
          LOWER(brand) LIKE ${q} OR
          LOWER(description) LIKE ${q}
        )
        ORDER BY created_at DESC;
      `;
    } else {
      if (adminOnly) {
        rows = await sql`
          SELECT * FROM products
          ORDER BY created_at DESC;
        `;
      } else {
        rows = await sql`
          SELECT * FROM products
          WHERE status != 'ARCHIVED'
          ORDER BY created_at DESC;
        `;
      }
    }

    const formatted = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory,
      price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : null,
      costPrice: p.cost_price ? parseFloat(p.cost_price) : null,
      stockCount: p.stock_count,
      lowStockThreshold: p.low_stock_threshold,
      inStock: p.in_stock && p.stock_count > 0,
      badge: p.badge,
      rating: parseFloat(p.rating || 5.0),
      reviewCount: p.review_count || 0,
      status: p.status,
      image: p.image,
      images: p.images || [],
      description: p.description,
      details: p.details || {},
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return Response.json({ success: true, products: formatted });
  } catch (error) {
    console.error('[API /api/products GET Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_products') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id, slug, name, brand, category, subcategory,
      price, originalPrice, costPrice, stockCount,
      lowStockThreshold, badge, image, description, details,
    } = body;

    if (!name || !category || price === undefined) {
      return Response.json({ success: false, error: 'Name, category, and price are required' }, { status: 400 });
    }

    const productId = id || `prod-${Date.now()}`;
    const productSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    await sql`
      INSERT INTO products (
        id, slug, name, brand, category, subcategory,
        price, original_price, cost_price, stock_count,
        low_stock_threshold, in_stock, badge, status,
        image, description, details, updated_at
      ) VALUES (
        ${productId}, ${productSlug}, ${name}, ${brand || null}, ${category}, ${subcategory || null},
        ${price}, ${originalPrice || null}, ${costPrice || null}, ${stockCount || 0},
        ${lowStockThreshold || 5}, ${Boolean(stockCount > 0)}, ${badge || null}, 'PUBLISHED',
        ${image || null}, ${description || null}, ${JSON.stringify(details || {})}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        brand = EXCLUDED.brand,
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        cost_price = EXCLUDED.cost_price,
        stock_count = EXCLUDED.stock_count,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        in_stock = EXCLUDED.in_stock,
        badge = EXCLUDED.badge,
        image = EXCLUDED.image,
        description = EXCLUDED.description,
        details = EXCLUDED.details,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Record audit log
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES ('PRODUCT_UPSERT', ${admin.name}, 'ADMIN', ${`Created or updated product: ${name}`}, ${JSON.stringify({ productId, name, price })});
    `;

    return Response.json({ success: true, productId, slug: productSlug });
  } catch (error) {
    console.error('[API /api/products POST Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_products') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return Response.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

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

    if (setClauses.length === 0) {
      return Response.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(productId);

    const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Record audit log
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES ('PRODUCT_UPDATED', ${admin.name}, 'ADMIN', ${`Updated product: ${productId}`}, ${JSON.stringify({ productId, updates })});
    `;

    return Response.json({ success: true, product: result[0] });
  } catch (error) {
    console.error('[API /api/products PATCH Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_products') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return Response.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await sql`UPDATE products SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ${productId};`;

    // Record audit log
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES ('PRODUCT_ARCHIVED', ${admin.name}, 'ADMIN', ${`Archived product: ${productId}`}, ${JSON.stringify({ productId })});
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error('[API /api/products DELETE Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}