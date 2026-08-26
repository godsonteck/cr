// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Order Management & State Machine Engine (Persistent)
// Master Directive Section 13, 15, 16, 17, 18, 22, 23, 27, 28, 39, 47
// ═══════════════════════════════════════════════════════════

import { BUSINESS_CONFIG } from '@/data/businessConfig';
import { commitStock, releaseStock, checkStockAvailability } from './inventoryService';
import { recordAuditEvent } from './auditService';
import { storeStorage } from '@/utils/storeStorage';

function getLiveOrders() {
  return storeStorage.getOrders([]);
}

function saveLiveOrders(orders) {
  storeStorage.saveOrders(orders);
}

// Cache for idempotency keys to prevent duplicate order generation
const processedIdempotencyKeys = new Set();

/**
 * Generate a unique, recognizable business order number
 */
export function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `CR-${year}-${randomSuffix}`;
}

/**
 * Create a new order with immutable product snapshots and inventory validation
 */
export function createOrder({
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
  // Idempotency check to prevent duplicate orders
  if (idempotencyKey) {
    if (processedIdempotencyKeys.has(idempotencyKey)) {
      throw new Error('This order has already been processed. Preventing duplicate submission.');
    }
    processedIdempotencyKeys.add(idempotencyKey);
  }

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot create an order with an empty cart.');
  }

  // 1. Stock verification
  for (const item of cartItems) {
    const { available, remaining } = checkStockAvailability(item.product.id, item.quantity);
    if (!available) {
      throw new Error(
        `Insufficient stock for "${item.product.name}". Requested: ${item.quantity}, Available in store: ${remaining}`
      );
    }
  }

  // 2. Compute delivery pricing from business configuration
  const deliveryConfig = BUSINESS_CONFIG.fulfillment.methods.find((m) => m.id === deliveryMethod);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let deliveryFee = 0;
  if (deliveryMethod === 'doorstep') {
    deliveryFee = subtotal >= (deliveryConfig?.freeDeliveryThreshold || 300) ? 0 : (deliveryConfig?.baseFee || 25);
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const orderId = generateOrderNumber();
  const timestamp = new Date().toISOString();

  // 3. Create immutable line item snapshots
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

  // 4. Determine initial payment and order state
  const isPayOnDelivery = paymentMethod === 'cash_on_delivery';
  const initialOrderStatus = isPayOnDelivery ? 'CONFIRMED' : 'PENDING';
  const initialPaymentStatus = isPayOnDelivery ? 'AUTHORIZED' : 'PENDING';

  const orderRecord = {
    orderId,
    createdAt: timestamp,
    updatedAt: timestamp,
    orderStatus: initialOrderStatus,
    paymentStatus: initialPaymentStatus,
    deliveryStatus: 'NOT_DISPATCHED',
    inventoryStatus: 'COMMITTED',
    customer: {
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
    timeline: [
      {
        status: 'Order Placed',
        timestamp,
        note: `Order received via website (${deliveryMethod === 'pickup' ? 'Store Pickup' : 'Doorstep Delivery'})`,
      },
    ],
  };

  // 5. Commit inventory
  itemSnapshots.forEach((item) => {
    commitStock(item.productId, item.quantity, orderId, 'Checkout Process');
  });

  const orders = getLiveOrders();
  orders.unshift(orderRecord);
  saveLiveOrders(orders);

  // 6. Record audit trail
  recordAuditEvent({
    action: 'ORDER_CREATED',
    operator: customerData.fullName || 'Customer',
    entityId: orderId,
    entityType: 'ORDER',
    details: { total: finalTotal, itemsCount: itemSnapshots.length, paymentMethod },
  });

  return orderRecord;
}

/**
 * Controlled Order Status State Transition Machine
 */
export function transitionOrderStatus(orderId, nextStatus, operator = 'Store Staff', note = '') {
  const orders = getLiveOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const prevStatus = order.orderStatus;
  const timestamp = new Date().toISOString();

  // Validate status transition
  if (!BUSINESS_CONFIG.orderLifecycle.validStatuses.includes(nextStatus)) {
    throw new Error(`Invalid status "${nextStatus}"`);
  }

  // Handle Cancellation Workflow
  if (nextStatus === 'CANCELLED') {
    if (!BUSINESS_CONFIG.orderLifecycle.cancellableStatuses.includes(prevStatus)) {
      throw new Error(`Cannot cancel order in "${prevStatus}" state without return authorization.`);
    }

    // Release stock back to available pool
    order.items.forEach((item) => {
      releaseStock(item.productId, item.quantity, orderId, operator);
    });

    order.inventoryStatus = 'RESTOCKED';
  }

  // Update order status
  order.orderStatus = nextStatus;
  order.updatedAt = timestamp;

  // Auto-align delivery status
  if (nextStatus === 'DISPATCHED') order.deliveryStatus = 'OUT_FOR_DELIVERY';
  if (nextStatus === 'DELIVERED') order.deliveryStatus = 'DELIVERED';
  if (nextStatus === 'COMPLETED') order.deliveryStatus = order.customer.deliveryMethod === 'pickup' ? 'COLLECTED' : 'DELIVERED';

  order.timeline.push({
    status: `Status changed to ${nextStatus}`,
    timestamp,
    note: note || `Updated by ${operator}`,
  });

  saveLiveOrders(orders);

  recordAuditEvent({
    action: 'ORDER_STATUS_CHANGED',
    operator,
    entityId: orderId,
    entityType: 'ORDER',
    details: { previous: prevStatus, next: nextStatus, note },
  });

  return order;
}

/**
 * Record Verified Payment
 */
export function markOrderPaymentPaid(orderId, transactionRef, operator = 'Payment Gateway') {
  const orders = getLiveOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const timestamp = new Date().toISOString();
  order.paymentStatus = 'PAID';
  order.paymentDetails.transactionRef = transactionRef;
  order.paymentDetails.paidAt = timestamp;
  order.updatedAt = timestamp;

  if (order.orderStatus === 'PENDING') {
    order.orderStatus = 'CONFIRMED';
  }

  order.timeline.push({
    status: 'Payment Verified',
    timestamp,
    note: `Confirmed payment via ${order.paymentDetails.method} (Ref: ${transactionRef})`,
  });

  saveLiveOrders(orders);

  recordAuditEvent({
    action: 'PAYMENT_VERIFIED',
    operator,
    entityId: orderId,
    entityType: 'PAYMENT',
    details: { amount: order.pricing.total, transactionRef },
  });

  return order;
}

/**
 * Query orders
 */
export function getOrderById(orderId) {
  const orders = getLiveOrders();
  return orders.find((o) => o.orderId === orderId) || null;
}

export function getAllOrders() {
  return getLiveOrders();
}

export function getOrdersByStatus(status) {
  const orders = getLiveOrders();
  return orders.filter((o) => o.orderStatus === status);
}

export function getRecentOrders(count = 5) {
  const orders = getLiveOrders();
  return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, count);
}
