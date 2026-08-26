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
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_inventory') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');

    if (type === 'ledger') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const rows = await sql`
        SELECT * FROM inventory_ledger
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;

      return Response.json({
        success: true,
        ledger: rows.map(row => ({
          movementId: row.id,
          productId: row.product_id,
          productName: row.product_name,
          type: row.reason,
          quantity: Math.abs(row.change_qty),
          reason: row.reason,
          referenceId: row.reference_id,
          timestamp: row.created_at,
          balanceAfter: row.balance_after,
        })),
      });
    }

    if (type === 'low-stock') {
      const rows = await sql`
        SELECT id, name, stock_count, low_stock_threshold
        FROM products
        WHERE stock_count <= low_stock_threshold AND status = 'PUBLISHED'
        ORDER BY stock_count ASC;
      `;

      return Response.json({
        success: true,
        lowStock: rows.map(row => ({
          productId: row.id,
          productName: row.name,
          available: row.stock_count,
          lowStockThreshold: row.low_stock_threshold,
        })),
      });
    }

    if (productId) {
      const rows = await sql`
        SELECT id, name, stock_count, low_stock_threshold
        FROM products
        WHERE id = ${productId}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      const row = rows[0];
      return Response.json({
        success: true,
        position: {
          productId: row.id,
          productName: row.name,
          available: row.stock_count,
          lowStockThreshold: row.low_stock_threshold,
        },
      });
    }

    const rows = await sql`
      SELECT id, name, stock_count, low_stock_threshold, status
      FROM products
      WHERE status = 'PUBLISHED'
      ORDER BY name;
    `;

    return Response.json({
      success: true,
      positions: rows.map(row => ({
        productId: row.id,
        productName: row.name,
        available: row.stock_count,
        lowStockThreshold: row.low_stock_threshold,
        status: row.status,
      })),
    });
  } catch (error) {
    console.error('[API /api/admin/inventory GET Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_inventory') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, quantity, reason = 'Manual stock adjustment' } = body;

    if (!productId || quantity === undefined) {
      return Response.json({ success: false, error: 'Product ID and quantity are required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, name, stock_count FROM products WHERE id = ${productId} LIMIT 1;
    `;

    if (rows.length === 0) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const product = rows[0];
    const previousStock = product.stock_count;
    const newStock = Math.max(0, previousStock + quantity);

    await sql`
      UPDATE products
      SET stock_count = ${newStock}, in_stock = ${newStock > 0}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId};
    `;

    await sql`
      INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
      VALUES (${productId}, ${product.name}, ${quantity}, ${newStock}, ${quantity > 0 ? 'RECEIVED' : 'ADJUSTED'}, ${reason});
    `;

    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES ('INVENTORY_ADJUSTED', ${admin.name}, 'ADMIN', ${`Adjusted stock for ${product.name} by ${quantity > 0 ? '+' : ''}${quantity}`}, ${JSON.stringify({ productId, previousStock, newStock, change: quantity, reason })});
    `;

    return Response.json({
      success: true,
      product: {
        productId: product.id,
        productName: product.name,
        available: newStock,
        previousStock,
      },
    });
  } catch (error) {
    console.error('[API /api/admin/inventory POST Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}