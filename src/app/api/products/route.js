import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const inStockOnly = searchParams.get('inStock') === 'true';

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
      rows = await sql`
        SELECT * FROM products
        WHERE status != 'ARCHIVED'
        ORDER BY created_at DESC;
      `;
    }

    // Format products for frontend consumption
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
    const body = await request.json();
    const {
      id, slug, name, brand, category, subcategory,
      price, originalPrice, costPrice, stockCount,
      lowStockThreshold, badge, image, description, details,
    } = body;

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
      VALUES ('PRODUCT_UPSERT', 'Admin Staff', 'ADMIN', ${`Created or updated product: ${name}`}, ${JSON.stringify({ productId, name, price })});
    `;

    return Response.json({ success: true, productId, slug: productSlug });
  } catch (error) {
    console.error('[API /api/products POST Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
