import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');
    const orderId = searchParams.get('id');

    let rows;
    if (orderId) {
      rows = await sql`
        SELECT * FROM orders
        WHERE id = ${orderId} OR order_number = ${orderId};
      `;
    } else if (customerEmail) {
      rows = await sql`
        SELECT * FROM orders
        WHERE LOWER(customer_email) = ${customerEmail.toLowerCase().trim()}
        ORDER BY created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT * FROM orders
        ORDER BY created_at DESC
        LIMIT 100;
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
    const body = await request.json();
    const {
      customerData,
      items,
      subtotal,
      deliveryFee,
      discount = 0,
      total,
      paymentMethod = 'momo',
    } = body;

    const timestamp = Date.now();
    const orderId = `ord-${timestamp}`;
    const orderNumber = `CR-${new Date().getFullYear()}-${String(timestamp).slice(-5)}`;

    // 1. Insert Order
    await sql`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name,
        customer_phone, customer_email, delivery_address,
        delivery_area, delivery_method, delivery_notes,
        items, subtotal, delivery_fee, discount, total,
        payment_method, payment_status, order_status
      ) VALUES (
        ${orderId}, ${orderNumber}, ${customerData.id || null}, ${customerData.fullName},
        ${customerData.phone}, ${customerData.email || null}, ${customerData.address || ''},
        ${customerData.area || 'Botwe'}, ${customerData.deliveryMethod || 'doorstep'}, ${customerData.deliveryNotes || ''},
        ${JSON.stringify(items)}, ${subtotal}, ${deliveryFee || 0}, ${discount || 0}, ${total},
        ${paymentMethod}, 'PENDING', 'PENDING'
      );
    `;

    // 2. Reduce Stock and log ledger for each item
    for (const item of items) {
      const prodId = item.id || item.productId;
      const qty = item.quantity || 1;

      // Update product stock
      const updated = await sql`
        UPDATE products
        SET stock_count = GREATEST(0, stock_count - ${qty}),
            in_stock = (stock_count - ${qty}) > 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${prodId}
        RETURNING stock_count, name;
      `;

      if (updated.length > 0) {
        const balanceAfter = updated[0].stock_count;
        const prodName = updated[0].name;

        // Log ledger
        await sql`
          INSERT INTO inventory_ledger (
            product_id, product_name, change_qty, balance_after, reason, reference_id
          ) VALUES (
            ${prodId}, ${prodName}, ${-qty}, ${balanceAfter}, 'ORDER_CREATION', ${orderNumber}
          );
        `;
      }
    }

    // 3. Update customer stats if registered
    if (customerData.email) {
      await sql`
        INSERT INTO customers (id, full_name, phone, email, orders_count, total_spent)
        VALUES (${`cust-${timestamp}`}, ${customerData.fullName}, ${customerData.phone}, ${customerData.email}, 1, ${total})
        ON CONFLICT (email) DO UPDATE SET
          orders_count = customers.orders_count + 1,
          total_spent = customers.total_spent + ${total},
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }

    // 4. Audit Log
    await sql`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES (
        'ORDER_CREATED',
        ${customerData.fullName},
        'CUSTOMER',
        ${`New order created: ${orderNumber} for GHS ${total}`},
        ${JSON.stringify({ orderId, orderNumber, total, itemsCount: items.length })}
      );
    `;

    return Response.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        customerName: customerData.fullName,
        customerPhone: customerData.phone,
        total,
        paymentMethod,
        orderStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API /api/orders POST Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, actorName = 'Admin' } = body;

    if (!orderId) {
      return Response.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    let updatedRows;
    if (orderStatus && paymentStatus) {
      updatedRows = await sql`
        UPDATE orders
        SET order_status = ${orderStatus},
            payment_status = ${paymentStatus},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId} OR order_number = ${orderId}
        RETURNING *;
      `;
    } else if (orderStatus) {
      updatedRows = await sql`
        UPDATE orders
        SET order_status = ${orderStatus},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId} OR order_number = ${orderId}
        RETURNING *;
      `;
    } else if (paymentStatus) {
      updatedRows = await sql`
        UPDATE orders
        SET payment_status = ${paymentStatus},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId} OR order_number = ${orderId}
        RETURNING *;
      `;
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

    return Response.json({ success: true, order: updatedRows[0] });
  } catch (error) {
    console.error('[API /api/orders PATCH Error]:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
