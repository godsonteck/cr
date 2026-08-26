import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { validateAdminSession } from '@/services/authService';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_admin_session')?.value;

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await validateAdminSession(token);
    if (!admin) {
      return Response.json({ success: false, error: 'Invalid admin session' }, { status: 401 });
    }

    // Check permission
    if (!admin.permissions.includes('view_dashboard') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // 1. Total revenue
    const revResult = await sql`
      SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as total_orders
      FROM orders
      WHERE order_status != 'CANCELLED';
    `;

    // 2. Pending orders count
    const pendingResult = await sql`
      SELECT COUNT(*) as pending_count
      FROM orders
      WHERE order_status = 'PENDING' OR order_status = 'CONFIRMED';
    `;

    // 3. Low stock count
    const stockResult = await sql`
      SELECT COUNT(*) as low_stock_count
      FROM products
      WHERE stock_count <= low_stock_threshold AND status = 'PUBLISHED';
    `;

    // 4. Total registered customers
    const customerResult = await sql`
      SELECT COUNT(*) as customer_count
      FROM customers;
    `;

    // 5. Recent 5 orders
    const recentOrders = await sql`
      SELECT id, order_number, customer_name, total, payment_method, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5;
    `;

    return Response.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(revResult[0]?.total_revenue || 0),
        totalOrders: parseInt(revResult[0]?.total_orders || '0', 10),
        pendingOrders: parseInt(pendingResult[0]?.pending_count || '0', 10),
        lowStockCount: parseInt(stockResult[0]?.low_stock_count || '0', 10),
        customerCount: parseInt(customerResult[0]?.customer_count || '0', 10),
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          total: parseFloat(o.total),
          paymentMethod: o.payment_method,
          orderStatus: o.order_status,
          createdAt: o.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('[API /api/admin/stats Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}