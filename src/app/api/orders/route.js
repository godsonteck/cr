import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { validateCustomerSession } from '@/services/authService';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_customer_session')?.value;

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await validateCustomerSession(token);
    if (!customer) {
      return Response.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    let rows;
    if (orderId) {
      rows = await sql`
        SELECT * FROM orders
        WHERE (id = ${orderId} OR order_number = ${orderId}) AND customer_id = ${customer.id}
        LIMIT 1;
      `;
    } else {
      rows = await sql`
        SELECT * FROM orders
        WHERE customer_id = ${customer.id}
        ORDER BY created_at DESC
        LIMIT 50;
      `;
    }

    const formatted = rows.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      deliveryAddress: o.delivery_address,
      deliveryArea: o.delivery_area,
      deliveryMethod: o.delivery_method,
      deliveryNotes: o.delivery_notes,
      items: o.items || [],
      subtotal: parseFloat(o.subtotal),
      deliveryFee: parseFloat(o.delivery_fee || 0),
      discount: parseFloat(o.discount || 0),
      total: parseFloat(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));

    return Response.json({ success: true, orders: formatted });
  } catch (error) {
    console.error('[API /api/orders GET Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_customer_session')?.value;

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await validateCustomerSession(token);
    if (!customer) {
      return Response.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      deliveryMethod = 'doorstep',
      paymentMethod = 'momo',
      paymentNetwork = 'MTN MoMo',
      momoWalletNumber = '',
      discountAmount = 0,
      promoCode = null,
      idempotencyKey = null,
    } = body;

    if (!items || items.length === 0) {
      return Response.json({ success: false, error: 'Cannot create an order with an empty cart.' }, { status: 400 });
    }

    // Fetch current products from database to validate prices and stock
    const productIds = items.map(i => i.productId || i.id);
    const products = await sql`
      SELECT id, name, price, stock_count, image, brand, category
      FROM products
      WHERE id = ANY(${productIds})
    `;

    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = p;
    });

    // Validate stock and prices
    const validatedItems = items.map(item => {
      const productId = item.productId || item.id;
      const product = productMap[productId];
      if (!product) throw new Error(`Product ${productId} not found`);
      if (product.stock_count < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock_count}`);
      }
      return {
        product: {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.image,
          brand: product.brand,
        },
        quantity: item.quantity,
      };
    });

    const { createOrder } = await import('@/services/orderEngine');

    const orderRecord = await createOrder({
      customerData: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        area: 'Botwe',
        address: '',
        deliveryNotes: '',
      },
      cartItems: validatedItems,
      deliveryMethod,
      paymentMethod,
      paymentNetwork,
      momoWalletNumber,
      discountAmount,
      promoCode,
      idempotencyKey,
    });

    return Response.json({
      success: true,
      order: {
        id: orderRecord.orderId,
        orderNumber: orderRecord.orderId,
        customerName: orderRecord.customer.fullName,
        customerPhone: orderRecord.customer.phone,
        total: orderRecord.pricing.total,
        paymentMethod,
        orderStatus: orderRecord.orderStatus,
        createdAt: orderRecord.createdAt,
      },
    });
  } catch (error) {
    console.error('[API /api/orders POST Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cr_admin_session')?.value;

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await import('@/services/authService').then(m => m.validateAdminSession(token));
    if (!admin) {
      return Response.json({ success: false, error: 'Invalid admin session' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, actorName = admin.name } = body;

    if (!orderId) {
      return Response.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const { transitionOrderStatus, markOrderPaymentPaid } = await import('@/services/orderEngine');

    let updatedOrder;
    if (orderStatus && paymentStatus) {
      await transitionOrderStatus(orderId, orderStatus, actorName, `Status updated to ${orderStatus}`);
      updatedOrder = await markOrderPaymentPaid(orderId, `MANUAL-${Date.now()}`, actorName);
    } else if (orderStatus) {
      updatedOrder = await transitionOrderStatus(orderId, orderStatus, actorName);
    } else if (paymentStatus) {
      updatedOrder = await markOrderPaymentPaid(orderId, `MANUAL-${Date.now()}`, actorName);
    }

    // Record audit
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES (
        'ORDER_STATUS_TRANSITION',
        ${actorName},
        'ADMIN',
        ${`Order ${orderId} status transitioned to ${orderStatus || paymentStatus}`},
        ${JSON.stringify({ orderId, orderStatus, paymentStatus })}
      );
    `;

    return Response.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('[API /api/orders PATCH Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}