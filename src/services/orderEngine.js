// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Order Management & State Machine Engine (PostgreSQL Transactional)
// ═══════════════════════════════════════════════════════════

import { sql } from '@/lib/db';
import { BUSINESS_CONFIG } from '@/data/businessConfig';
import { checkStockAvailability, commitStock, releaseStock } from './inventoryService';
import { recordAuditEvent } from './auditService';

function formatOrder(row) {
  return {
    orderId: row.order_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    deliveryStatus: row.delivery_status || 'NOT_DISPATCHED',
    inventoryStatus: row.inventory_status || 'COMMITTED',
    customer: {
      id: row.customer_id,
      fullName: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      deliveryMethod: row.delivery_method,
      area: row.delivery_area,
      address: row.delivery_address,
      deliveryNotes: row.delivery_notes,
    },
    items: row.items || [],
    pricing: {
      subtotal: parseFloat(row.subtotal),
      discount: parseFloat(row.discount || 0),
      promoCodeApplied: row.promo_code,
      deliveryFee: parseFloat(row.delivery_fee || 0),
      total: parseFloat(row.total),
      currency: BUSINESS_CONFIG.identity.currency,
    },
    paymentDetails: {
      method: row.payment_method,
      network: row.payment_network,
      accountNumber: row.payment_account,
      transactionRef: row.payment_transaction_ref,
      paidAt: row.paid_at,
    },
    timeline: row.timeline || [],
    refunds: row.refunds || [],
  };
}

export function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `CR-${year}-${randomSuffix}`;
}

export async function createOrder({
  customerData,
  cartItems,
  deliveryMethod = 'doorstep',
  paymentMethod = 'momo',
  paymentNetwork = 'MTN MoMo',
  momoWalletNumber = '',
  discountAmount = 0,
  promoCode = null,
  idempotencyKey = null,
}) {
  if (idempotencyKey) {
    const existing = await sql`
      SELECT id FROM orders WHERE idempotency_key = ${idempotencyKey} LIMIT 1;
    `;
    if (existing.length > 0) {
      throw new Error('This order has already been processed. Preventing duplicate submission.');
    }
  }

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot create an order with an empty cart.');
  }

  // Verify stock for all items
  for (const item of cartItems) {
    const { available, remaining } = await checkStockAvailability(item.product.id, item.quantity);
    if (!available) {
      throw new Error(
        `Insufficient stock for "${item.product.name}". Requested: ${item.quantity}, Available in store: ${remaining}`
      );
    }
  }

  const deliveryConfig = BUSINESS_CONFIG.fulfillment.methods.find((m) => m.id === deliveryMethod);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let deliveryFee = 0;
  if (deliveryMethod === 'doorstep') {
    deliveryFee = subtotal >= (deliveryConfig?.freeDeliveryThreshold || 300) ? 0 : (deliveryConfig?.baseFee || 25);
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const orderNumber = generateOrderNumber();
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = new Date().toISOString();

  const itemSnapshots = cartItems.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    sku: item.product.id.toUpperCase(),
    unitPrice: Number(item.product.price),
    quantity: item.quantity,
    lineTotal: Number(item.product.price * item.quantity),
    image: item.product.image || '/images/products/1.jpeg',
    brand: item.product.brand || '',
  }));

  const isPayOnDelivery = paymentMethod === 'cash_on_delivery';
  const initialOrderStatus = isPayOnDelivery ? 'CONFIRMED' : 'PENDING';
  const initialPaymentStatus = isPayOnDelivery ? 'AUTHORIZED' : 'PENDING';

  // Use a transaction for atomic order creation
  await sql.begin(async (tx) => {
    // Insert order
    await tx`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name,
        customer_phone, customer_email, delivery_address,
        delivery_area, delivery_method, delivery_notes,
        items, subtotal, delivery_fee, discount, total,
        payment_method, payment_network, payment_account,
        payment_status, order_status, inventory_status,
        promo_code, idempotency_key, timeline
      ) VALUES (
        ${orderId}, ${orderNumber}, ${customerData.id || null}, ${customerData.fullName},
        ${customerData.phone}, ${customerData.email || null}, ${customerData.address || ''},
        ${customerData.area || 'Botwe'}, ${deliveryMethod}, ${customerData.deliveryNotes || ''},
        ${JSON.stringify(itemSnapshots)}, ${subtotal}, ${deliveryFee}, ${discountAmount}, ${finalTotal},
        ${paymentMethod}, ${paymentNetwork}, ${momoWalletNumber},
        ${initialPaymentStatus}, ${initialOrderStatus}, 'COMMITTED',
        ${promoCode}, ${idempotencyKey},
        ${JSON.stringify([{
          status: 'Order Placed',
          timestamp,
          note: `Order received via website (${deliveryMethod === 'pickup' ? 'Store Pickup' : 'Doorstep Delivery'})`,
        }])}
      );
    `;

    // Deduct stock for each item
    for (const item of itemSnapshots) {
      const stockRows = await tx`
        UPDATE products
        SET stock_count = GREATEST(0, stock_count - ${item.quantity}),
            in_stock = (stock_count - ${item.quantity}) > 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${item.productId}
        RETURNING stock_count, name;
      `;

      if (stockRows.length > 0) {
        const balanceAfter = stockRows[0].stock_count;
        const prodName = stockRows[0].name;

        await tx`
          INSERT INTO inventory_ledger (
            product_id, product_name, change_qty, balance_after, reason, reference_id
          ) VALUES (
            ${item.productId}, ${prodName}, ${-item.quantity}, ${balanceAfter}, 'SALE', ${orderNumber}
          );
        `;
      }
    }

    // Update customer stats if registered
    if (customerData.email) {
      await tx`
        INSERT INTO customers (id, full_name, phone, email, orders_count, total_spent)
        VALUES (${`cust-${Date.now()}`}, ${customerData.fullName}, ${customerData.phone}, ${customerData.email}, 1, ${finalTotal})
        ON CONFLICT (email) DO UPDATE SET
          orders_count = customers.orders_count + 1,
          total_spent = customers.total_spent + ${finalTotal},
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }

    // Audit log
    await tx`
      INSERT INTO audit_logs (event_type, actor_name, actor_role, description, details)
      VALUES (
        'ORDER_CREATED',
        ${customerData.fullName},
        'CUSTOMER',
        ${`New order created: ${orderNumber} for GHS ${finalTotal}`},
        ${JSON.stringify({ orderId, orderNumber, total: finalTotal, itemsCount: itemSnapshots.length, paymentMethod })}
      );
    `;
  });

  const orderRecord = {
    orderId: orderNumber,
    createdAt: timestamp,
    updatedAt: timestamp,
    orderStatus: initialOrderStatus,
    paymentStatus: initialPaymentStatus,
    deliveryStatus: 'NOT_DISPATCHED',
    inventoryStatus: 'COMMITTED',
    customer: {
      id: customerData.id,
      fullName: customerData.fullName,
      phone: customerData.phone,
      email: customerData.email || '',
      deliveryMethod,
      area: customerData.area || 'Botwe',
      address: customerData.address || '',
      deliveryNotes: customerData.deliveryNotes || '',
    },
    items: itemSnapshots,
    pricing: {
      subtotal,
      discount: discountAmount,
      promoCodeApplied: promoCode,
      deliveryFee,
      total: finalTotal,
      currency: BUSINESS_CONFIG.identity.currency,
    },
    paymentDetails: {
      method: paymentMethod,
      network: paymentNetwork,
      accountNumber: momoWalletNumber,
      transactionRef: `REF-${Date.now()}`,
      paidAt: isPayOnDelivery ? null : null,
    },
    timeline: [{
      status: 'Order Placed',
      timestamp,
      note: `Order received via website (${deliveryMethod === 'pickup' ? 'Store Pickup' : 'Doorstep Delivery'})`,
    }],
  };

  return orderRecord;
}

export async function transitionOrderStatus(orderId, nextStatus, operator = 'Store Staff', note = '') {
  const orders = await sql`
    SELECT * FROM orders WHERE id = ${orderId} OR order_number = ${orderId} LIMIT 1;
  `;

  if (orders.length === 0) throw new Error(`Order ${orderId} not found`);
  const order = orders[0];

  const prevStatus = order.order_status;

  if (!BUSINESS_CONFIG.orderLifecycle.validStatuses.includes(nextStatus)) {
    throw new Error(`Invalid status "${nextStatus}"`);
  }

  if (nextStatus === 'CANCELLED') {
    if (!BUSINESS_CONFIG.orderLifecycle.cancellableStatuses.includes(prevStatus)) {
      throw new Error(`Cannot cancel order in "${prevStatus}" state without return authorization.`);
    }

    // Release stock back
    const items = order.items || [];
    for (const item of items) {
      await releaseStock(item.productId, item.quantity, orderId, operator);
    }
  }

  const timestamp = new Date().toISOString();

  const timeline = order.timeline || [];
  timeline.push({
    status: `Status changed to ${nextStatus}`,
    timestamp,
    note: note || `Updated by ${operator}`,
  });

  let deliveryStatus = order.delivery_status;
  if (nextStatus === 'DISPATCHED') deliveryStatus = 'OUT_FOR_DELIVERY';
  if (nextStatus === 'DELIVERED') deliveryStatus = 'DELIVERED';
  if (nextStatus === 'COMPLETED') deliveryStatus = order.delivery_method === 'pickup' ? 'COLLECTED' : 'DELIVERED';

  await sql`
    UPDATE orders
    SET order_status = ${nextStatus},
        delivery_status = ${deliveryStatus},
        updated_at = CURRENT_TIMESTAMP,
        timeline = ${JSON.stringify(timeline)}
    WHERE id = ${orderId} OR order_number = ${orderId};
  `;

  await recordAuditEvent({
    action: 'ORDER_STATUS_CHANGED',
    operator,
    entityId: orderId,
    entityType: 'ORDER',
    details: { previous: prevStatus, next: nextStatus, note },
  });

  return getOrderById(orderId);
}

export async function markOrderPaymentPaid(orderId, transactionRef, operator = 'Payment Gateway') {
  const orders = await sql`
    SELECT * FROM orders WHERE id = ${orderId} OR order_number = ${orderId} LIMIT 1;
  `;

  if (orders.length === 0) throw new Error(`Order ${orderId} not found`);
  const order = orders[0];

  const timestamp = new Date().toISOString();
  const timeline = order.timeline || [];
  timeline.push({
    status: 'Payment Verified',
    timestamp,
    note: `Confirmed payment via ${order.payment_method} (Ref: ${transactionRef})`,
  });

  let newOrderStatus = order.order_status;
  if (order.order_status === 'PENDING') newOrderStatus = 'CONFIRMED';

  await sql`
    UPDATE orders
    SET payment_status = 'PAID',
        payment_transaction_ref = ${transactionRef},
        paid_at = ${timestamp},
        order_status = ${newOrderStatus},
        updated_at = CURRENT_TIMESTAMP,
        timeline = ${JSON.stringify(timeline)}
    WHERE id = ${orderId} OR order_number = ${orderId};
  `;

  await recordAuditEvent({
    action: 'PAYMENT_VERIFIED',
    operator,
    entityId: orderId,
    entityType: 'PAYMENT',
    details: { amount: order.total, transactionRef },
  });

  return getOrderById(orderId);
}

export async function issueRefund({ orderId, amount, reason = 'Customer requested refund', operator = 'Store Admin' }) {
  const orders = await sql`
    SELECT * FROM orders WHERE id = ${orderId} OR order_number = ${orderId} LIMIT 1;
  `;

  if (orders.length === 0) throw new Error(`Order ${orderId} not found`);
  const order = orders[0];

  const refundAmount = Number(amount);
  if (isNaN(refundAmount) || refundAmount <= 0) {
    throw new Error('Please specify a valid refund amount.');
  }

  const orderTotal = order.total;
  const alreadyRefunded = (order.refunds || []).reduce((sum, r) => sum + r.amount, 0);
  const maxRefundable = Math.max(0, orderTotal - alreadyRefunded);

  if (refundAmount > maxRefundable) {
    throw new Error(`Refund amount (GHS ${refundAmount}) exceeds maximum refundable balance (GHS ${maxRefundable}).`);
  }

  const timestamp = new Date().toISOString();
  const refundRecord = {
    refundId: `REFUND-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    amount: refundAmount,
    reason,
    operator,
    timestamp,
  };

  const refunds = [...(order.refunds || []), refundRecord];
  const totalRefundedNow = alreadyRefunded + refundAmount;

  let paymentStatus = totalRefundedNow >= orderTotal ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

  const timeline = order.timeline || [];
  timeline.push({
    status: `Refund Issued (GHS ${refundAmount})`,
    timestamp,
    note: `Reason: ${reason} (Processed by ${operator})`,
  });

  await sql`
    UPDATE orders
    SET payment_status = ${paymentStatus},
        refunds = ${JSON.stringify(refunds)},
        updated_at = CURRENT_TIMESTAMP,
        timeline = ${JSON.stringify(timeline)}
    WHERE id = ${orderId} OR order_number = ${orderId};
  `;

  await recordAuditEvent({
    action: 'REFUND_ISSUED',
    operator,
    entityId: orderId,
    entityType: 'PAYMENT',
    details: { refundAmount, totalRefunded: totalRefundedNow, reason },
  });

  return getOrderById(orderId);
}

export async function getOrderById(orderId) {
  const rows = await sql`
    SELECT * FROM orders WHERE id = ${orderId} OR order_number = ${orderId} LIMIT 1;
  `;
  return rows.length > 0 ? formatOrder(rows[0]) : null;
}

export async function getAllOrders() {
  const rows = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT 100;
  `;
  return rows.map(formatOrder);
}

export async function getOrdersByStatus(status) {
  const rows = await sql`
    SELECT * FROM orders WHERE order_status = ${status} ORDER BY created_at DESC;
  `;
  return rows.map(formatOrder);
}

export async function getRecentOrders(count = 5) {
  const rows = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT ${count};
  `;
  return rows.map(formatOrder);
}

export async function getOrdersByCustomer(customerId) {
  const rows = await sql`
    SELECT * FROM orders WHERE customer_id = ${customerId} ORDER BY created_at DESC;
  `;
  return rows.map(formatOrder);
}