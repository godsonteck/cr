import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { validateAdminSession } from '@/services/authService';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cr_admin_session')?.value;

  if (!token) return null;

  return validateAdminSession(token);
}

function formatOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryAddress: row.delivery_address,
    deliveryArea: row.delivery_area,
    deliveryMethod: row.delivery_method,
    deliveryNotes: row.delivery_notes,
    items: row.items || [],
    subtotal: parseFloat(row.subtotal),
    deliveryFee: parseFloat(row.delivery_fee || 0),
    discount: parseFloat(row.discount || 0),
    total: parseFloat(row.total),
    paymentMethod: row.payment_method,
    paymentNetwork: row.payment_network,
    paymentAccount: row.payment_account,
    paymentTransactionRef: row.payment_transaction_ref,
    paidAt: row.paid_at,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    deliveryStatus: row.delivery_status,
    inventoryStatus: row.inventory_status,
    promoCode: row.promo_code,
    timeline: row.timeline || [],
    refunds: row.refunds || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_orders') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (orderId) {
      const rows = await sql`
        SELECT * FROM orders
        WHERE id = ${orderId} OR order_number = ${orderId}
        LIMIT 1;
      `;
      if (rows.length === 0) {
        return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return Response.json({ success: true, order: formatOrder(rows[0]) });
    }

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND order_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(order_number) LIKE $${params.length} OR LOWER(customer_name) LIKE $${params.length} OR customer_phone LIKE $${params.length})`;
    }

    const countQuery = `SELECT COUNT(*) as count FROM orders ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const totalCount = parseInt(countResult[0]?.count || '0', 10);

    params.push(limit, offset);
    const query = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const rows = await sql(query, params);

    return Response.json({
      success: true,
      orders: rows.map(formatOrder),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[API /api/admin/orders GET Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.permissions.includes('manage_orders') && admin.role !== 'SUPER_ADMIN') {
      return Response.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, actorName = admin.name, note } = body;

    if (!orderId) {
      return Response.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const { transitionOrderStatus, markOrderPaymentPaid, issueRefund } = await import('@/services/orderEngine');

    let updatedOrder;
    if (orderStatus === 'REFUNDED' || orderStatus === 'PARTIALLY_REFUNDED') {
      if (!body.refundAmount) {
        return Response.json({ success: false, error: 'Refund amount required' }, { status: 400 });
      }
      updatedOrder = await issueRefund({
        orderId,
        amount: body.refundAmount,
        reason: body.refundReason || 'Admin refund',
        operator: actorName,
      });
    } else if (orderStatus && paymentStatus) {
      await transitionOrderStatus(orderId, orderStatus, actorName, note);
      updatedOrder = await markOrderPaymentPaid(orderId, body.transactionRef || `MANUAL-${Date.now()}`, actorName);
    } else if (orderStatus) {
      updatedOrder = await transitionOrderStatus(orderId, orderStatus, actorName, note);
    } else if (paymentStatus) {
      updatedOrder = await markOrderPaymentPaid(orderId, body.transactionRef || `MANUAL-${Date.now()}`, actorName);
    }

    // Record audit
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES (
        'ORDER_STATUS_TRANSITION',
        ${actorName},
        'ADMIN',
        ${`Order ${orderId} updated by ${actorName}`},
        ${JSON.stringify({ orderId, orderStatus, paymentStatus, note })}
      );
    `;

    return Response.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('[API /api/admin/orders PATCH Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}