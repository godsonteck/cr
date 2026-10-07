import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/database.js';
import { orders, products, storeSettings, promoCodes, flashDeals, notifications, posPayments, inventoryMovements, auditLogs, users } from '../src/db/schema.js';
import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from './_auth.js';
import { getPaystackSecretKey } from './_paystack.js';
import { escapeHtml, sendEmail } from './_email.js';
import { orderNotificationRows } from './_order-notifications.js';
import { checkRateLimit, getClientIp } from './_ratelimit.js';

import { randomBytes } from 'crypto';

const orderCreateSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  items: z.array(z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      brand: z.string(),
      price: z.coerce.number(),
      originalPrice: z.coerce.number().nullable().optional(),
      image: z.string(),
      unit: z.string(),
      category: z.string(),
      inStock: z.boolean(),
      stockCount: z.coerce.number().int().min(0),
    }),
    quantity: z.number().int().positive(),
    selectedOption: z.string().optional(),
    selectedVariant: z.object({
      id: z.string(),
      name: z.string(),
      price: z.coerce.number(),
      originalPrice: z.coerce.number().nullable().optional(),
      inStock: z.boolean(),
    }).optional(),
  })).min(1),
  subtotal: z.coerce.number().positive(),
  shippingFee: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().positive(),
  paymentMethod: z.enum(['paystack', 'momo-mtn', 'momo-telecel', 'momo-at', 'cash-on-delivery', 'card', 'apple-pay']),
  orderSource: z.enum(['website', 'whatsapp', 'pos']).default('website'),
  paymentStatus: z.enum(['paid', 'pending']).default('pending'),
  deliveryMethod: z.enum(['accra-express', 'standard-delivery', 'intercity', 'store-pickup']),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    city: z.string().min(1),
    region: z.string().optional(),
    area: z.string().min(1),
    landmarkOrGps: z.string().optional(),
    deliveryNotes: z.string().optional(),
  }),
  estimatedDeliveryTime: z.string().optional(),
  appliedPromoCode: z.string().optional(),
  paymentReference: z.string().max(100).optional(),
  paymentSenderPhone: z.string().max(50).optional(),
  deviceId: z.string().trim().max(100).optional(),
  // Server-verified Paystack reference — required for paystack/momo payment methods
  paystackReference: z.string().optional(),
  idempotencyKey: z.string().trim().min(12).max(160).optional(),
  cashReceived: z.coerce.number().nonnegative().optional(),
});

const orderUpdateSchema = z.object({
  status: z.enum(['Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered']).optional(),
  adminNote: z.string().trim().max(1000).optional(),
  estimatedDeliveryTime: z.string().max(100).optional().nullable(),
  paymentStatus: z.enum(['paid', 'pending']).optional(),
  riderInfo: z.object({
    riderName: z.string().optional(),
    riderPhone: z.string().optional(),
    riderLocation: z.string().optional(),
    estimatedArrival: z.string().optional(),
    stageIndex: z.number().int().min(0).max(4).optional(),
  }).optional(),
}).partial();

const posRefundSchema = z.object({ orderId: z.string().uuid() });

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `CR-${year}${month}${day}-${random}`;
}

function describeValidationError(error: z.ZodError) {
  return error.issues.map(issue => `${issue.path.join('.') || 'order'}: ${issue.message}`).join('; ');
}

const paystackConfirmSchema = z.object({ orderId: z.string().uuid(), reference: z.string().min(10).max(100) });

async function releaseFailedPaystackOrder(orderId: string): Promise<boolean> {
  return db.transaction(async tx => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update').limit(1);
    if (!order || order.paymentMethod !== 'paystack' || order.paymentStatus !== 'pending') return false;

    const quantities = new Map<string, { product: number; variants: Map<string, number> }>();
    for (const item of order.items) {
      const productId = item.product.id;
      const entry = quantities.get(productId) || { product: 0, variants: new Map<string, number>() };
      const variantId = item.selectedVariant?.id;
      if (variantId) entry.variants.set(variantId, (entry.variants.get(variantId) || 0) + item.quantity);
      else entry.product += item.quantity;
      quantities.set(productId, entry);
    }

    const productIds = [...quantities.keys()].sort();
    const lockedProducts = await tx.select().from(products)
      .where(inArray(products.id, productIds))
      .orderBy(asc(products.id))
      .for('update');
    const productMap = new Map(lockedProducts.map(product => [product.id, product]));

    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId);
      if (!product) throw new Error(`Cannot release stock for missing product ${productId}`);
      if (quantity.product > 0) {
        const stockAfter = product.stockCount + quantity.product;
        await tx.update(products).set({
          stockCount: stockAfter,
          inStock: stockAfter > 0,
          isPublished: stockAfter > 0 || product.isPublished,
          updatedAt: new Date(),
        }).where(eq(products.id, productId));
        await tx.insert(inventoryMovements).values({
          productId,
          orderId: order.id,
          movementType: 'PAYMENT_RELEASE',
          quantity: quantity.product,
          quantityBefore: product.stockCount,
          quantityAfter: stockAfter,
          reason: `Failed Paystack payment ${order.paymentReference || order.orderNumber}`,
        });
      }
      if (quantity.variants.size > 0) {
        const currentVariants = product.variants || [];
        for (const variantId of quantity.variants.keys()) {
          if (!currentVariants.some(variant => variant.id === variantId)) {
            throw new Error(`Cannot release stock for missing variation ${variantId}`);
          }
        }
        const updatedVariants = currentVariants.map(variant => {
          const restoreQuantity = quantity.variants.get(variant.id) || 0;
          return restoreQuantity > 0 ? {
            ...variant,
            stockCount: Number(variant.stockCount || 0) + restoreQuantity,
            inStock: true,
          } : variant;
        });
        const stockAfter = updatedVariants.reduce((sum, variant) => sum + Number(variant.stockCount || 0), 0) + quantity.product;
        await tx.update(products).set({
          variants: updatedVariants,
          stockCount: stockAfter,
          inStock: stockAfter > 0,
          isPublished: stockAfter > 0 || product.isPublished,
          updatedAt: new Date(),
        }).where(eq(products.id, productId));
        for (const [variantId, restoreQuantity] of quantity.variants) {
          const currentVariant = currentVariants.find(variant => variant.id === variantId)!;
          const quantityBefore = Number(currentVariant.stockCount || 0);
          await tx.insert(inventoryMovements).values({
            productId,
            variantId,
            orderId: order.id,
            movementType: 'PAYMENT_RELEASE',
            quantity: restoreQuantity,
            quantityBefore,
            quantityAfter: quantityBefore + restoreQuantity,
            reason: `Failed Paystack payment ${order.paymentReference || order.orderNumber}`,
          });
        }
      }
    }

    await tx.update(orders).set({
      paymentStatus: 'failed',
      status: 'Cancelled',
      updatedAt: new Date(),
    }).where(eq(orders.id, order.id));
    if (order.appliedPromoCode) {
      await tx.update(promoCodes).set({
        usageCount: sql`GREATEST(${promoCodes.usageCount} - 1, 0)`,
        updatedAt: new Date(),
      }).where(eq(promoCodes.code, order.appliedPromoCode));
    }
    await tx.insert(notifications).values([
      {
        userId: order.userId || null,
        type: 'order',
        title: 'Payment not completed',
        message: `Order #${order.orderNumber} was cancelled and reserved stock was released.`,
        actionUrl: '/account/orders',
      },
      {
        userId: null,
        type: 'order',
        title: 'Unpaid order cancelled',
        message: `Order #${order.orderNumber} was cancelled after Paystack confirmed the payment did not complete.`,
        actionUrl: '/admin?tab=orders',
      },
    ]);
    return true;
  });
}

async function reconcilePaystackOrders(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const secretKey = getPaystackSecretKey();
  if (!secretKey) return res.status(503).json({ error: 'Payment verification is unavailable.' });

  const reconciliationConditions = [
    eq(orders.paymentMethod, 'paystack'),
    eq(orders.paymentStatus, 'pending'),
    sql`${orders.createdAt} <= NOW() - INTERVAL '15 minutes'`,
  ];
  if (typeof req.query.orderId === 'string') reconciliationConditions.push(eq(orders.id, req.query.orderId));
  const staleOrders = await db.select().from(orders).where(and(...reconciliationConditions))
    .orderBy(asc(orders.createdAt)).limit(3);

  let confirmed = 0;
  let released = 0;
  for (const order of staleOrders) {
    const reference = order.paymentReference;
    if (!reference) continue;
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === 404) {
        if (await releaseFailedPaystackOrder(order.id)) released += 1;
        continue;
      }
      if (!response.ok) continue;
      const payload = await response.json() as {
        status?: boolean;
        data?: { status?: string; reference?: string; amount?: number; currency?: string; customer?: { email?: string } };
      };
      if (payload.status && payload.data?.status === 'success') {
        const [owner] = order.userId
          ? await db.select({ email: users.email }).from(users).where(eq(users.id, order.userId)).limit(1)
          : [];
        if (payload.data.reference !== reference
          || payload.data.amount !== Math.round(Number(order.total) * 100)
          || payload.data.currency !== 'GHS'
          || payload.data.customer?.email?.toLowerCase() !== owner?.email.toLowerCase()) {
          console.error(JSON.stringify({ event: 'paystack_reconciliation_mismatch', orderId: order.id, reference }));
          continue;
        }
        const changed = await db.transaction(async tx => {
          const [updated] = await tx.update(orders).set({ paymentStatus: 'paid', updatedAt: new Date() })
            .where(and(eq(orders.id, order.id), eq(orders.paymentStatus, 'pending')))
            .returning();
          if (updated) await tx.insert(notifications).values(orderNotificationRows(updated));
          return updated;
        });
        if (changed) confirmed += 1;
      } else if (payload.data?.status === 'failed' || payload.data?.status === 'abandoned') {
        if (await releaseFailedPaystackOrder(order.id)) released += 1;
      }
    } catch (error) {
      console.error(JSON.stringify({ event: 'paystack_reconciliation_error', orderId: order.id, reference, message: error instanceof Error ? error.message : 'Unknown error' }));
    }
  }
  return res.status(200).json({ checked: staleOrders.length, confirmed, released });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET' && query.action === 'reconcile') return await reconcilePaystackOrders(req, res);

    if (method === 'GET') {
      const { id, orderNumber, userId, status, limit = '50', offset = '0' } = query;
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const isCashier = auth.role === 'admin' && auth.adminRole === 'Cashier';

      if (id && typeof id === 'string') {
        const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
        if (!order || (isCashier && order.orderSource !== 'pos')) {
          return res.status(404).json({ error: 'Order not found' });
        }
        if (auth.role !== 'admin' && order.userId !== auth.sub) {
          return res.status(403).json({ error: 'You do not have access to this order' });
        }
        return res.status(200).json(order);
      }

      if (orderNumber && typeof orderNumber === 'string') {
        const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
        if (!order || (isCashier && order.orderSource !== 'pos')) {
          return res.status(404).json({ error: 'Order not found' });
        }
        if (auth.role !== 'admin' && order.userId !== auth.sub) {
          return res.status(403).json({ error: 'You do not have access to this order' });
        }
        return res.status(200).json(order);
      }

      const paymentReference = query.paymentReference || query.reference;
      if (paymentReference && typeof paymentReference === 'string') {
        const [order] = await db.select().from(orders).where(eq(orders.paymentReference, paymentReference.trim())).limit(1);
        if (order) {
          if (isCashier && order.orderSource !== 'pos') {
            return res.status(404).json({ error: 'Order not found' });
          }
          if (auth.role !== 'admin' && order.userId !== auth.sub) {
            return res.status(403).json({ error: 'You do not have access to this order' });
          }
          return res.status(200).json(order);
        }
      }

      const conditions = [];
      if (isCashier) {
        conditions.push(eq(orders.orderSource, 'pos'));
      }
      const effectiveUserId = auth.role === 'admin' ? (typeof userId === 'string' ? userId : undefined) : auth.sub;
      if (effectiveUserId) {
        conditions.push(eq(orders.userId, effectiveUserId));
      }
      if (status && typeof status === 'string') {
        conditions.push(eq(orders.status, status as any));
      }

      const lim = Math.min(parseInt(limit as string, 10), 100);
      const off = parseInt(offset as string, 10);

      const baseQuery = db.select().from(orders);
      const whereQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
      const results = await whereQuery.orderBy(desc(orders.createdAt)).limit(lim).offset(off);

      const totalQuery = conditions.length > 0
        ? db.select({ count: sql<number>`count(*)` }).from(orders).where(and(...conditions))
        : db.select({ count: sql<number>`count(*)` }).from(orders);
      const totalResult = await totalQuery;
      const total = totalResult[0]?.count ?? 0;

      return res.status(200).json({
        orders: results,
        pagination: { total, limit: lim, offset: off, hasMore: off + lim < total },
      });
    }

    if (method === 'POST' && query.action === 'refund') {
      const auth = await requireAdmin(req, res, ['Super Admin', 'Store Manager']);
      if (!auth) return;
      if (!['Super Admin', 'Store Manager'].includes(auth.adminRole || '')) {
        return res.status(403).json({ error: 'Only Store Managers and Super Admins can refund POS sales.' });
      }
      const parsed = posRefundSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: 'A valid POS sale is required for refund.' });
      const refundedOrder = await db.transaction(async tx => {
        const [order] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for('update').limit(1);
        if (!order || order.orderSource !== 'pos') throw new Error('POS sale not found.');
        if (order.status === 'Refunded') throw new Error('This POS sale has already been refunded.');
        const productIds = order.items.map(item => item.product.id);
        const lockedProducts = await tx.select().from(products).where(inArray(products.id, productIds)).for('update');
        const productMap = new Map(lockedProducts.map(product => [product.id, product]));
        for (const item of order.items) {
          const product = productMap.get(item.product.id);
          if (!product) continue;
          const variantId = item.selectedVariant?.id;
          if (variantId) {
            const nextVariants = (product.variants || []).map(variant => variant.id !== variantId ? variant : {
              ...variant,
              stockCount: Number(variant.stockCount || 0) + item.quantity,
              inStock: true,
            });
            const nextStock = nextVariants.reduce((sum, variant) => sum + Number(variant.stockCount || 0), 0);
            await tx.update(products).set({ variants: nextVariants, stockCount: nextStock, inStock: true, isPublished: true, updatedAt: new Date() }).where(eq(products.id, product.id));
            await tx.insert(inventoryMovements).values({ productId: product.id, variantId, orderId: order.id, movementType: 'POS_REFUND', quantity: item.quantity, quantityBefore: Number(product.variants?.find(variant => variant.id === variantId)?.stockCount || 0), quantityAfter: Number(product.variants?.find(variant => variant.id === variantId)?.stockCount || 0) + item.quantity, actorName: auth.adminName, reason: `POS refund ${order.orderNumber}` });
          } else {
            const nextStock = product.stockCount + item.quantity;
            await tx.update(products).set({ stockCount: nextStock, inStock: true, isPublished: true, updatedAt: new Date() }).where(eq(products.id, product.id));
            await tx.insert(inventoryMovements).values({ productId: product.id, orderId: order.id, movementType: 'POS_REFUND', quantity: item.quantity, quantityBefore: product.stockCount, quantityAfter: nextStock, actorName: auth.adminName, reason: `POS refund ${order.orderNumber}` });
          }
        }
        await tx.update(posPayments).set({ status: 'REFUNDED' }).where(eq(posPayments.orderId, order.id));
        await tx.insert(auditLogs).values({ action: 'POS_SALE_REFUNDED', entityType: 'order', entityId: order.id, actorName: auth.adminName, metadata: { orderNumber: order.orderNumber, adminId: auth.sub } });
        const [updated] = await tx.update(orders).set({ status: 'Refunded', updatedAt: new Date() }).where(eq(orders.id, order.id)).returning();
        return updated;
      });
      return res.status(200).json(refundedOrder);
    }

    if (method === 'POST' && query.action === 'confirm-paystack') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const parsed = paystackConfirmSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: 'A valid order and Paystack reference are required.' });

      const [order] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1);
      if (!order || order.userId !== auth.sub || order.paymentMethod !== 'paystack' || order.paymentReference !== parsed.data.reference) {
        return res.status(404).json({ error: 'Order not found for this Paystack reference.' });
      }
      if (order.paymentStatus === 'paid') return res.status(200).json(order);
      if (order.paymentStatus !== 'pending') return res.status(409).json({ error: 'This order is no longer awaiting payment.' });

      const secretKey = getPaystackSecretKey();
      if (!secretKey) return res.status(503).json({ error: 'Payment verification is unavailable.' });
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(parsed.data.reference)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: AbortSignal.timeout(8000),
      });
      const payload = await paystackRes.json() as {
        status?: boolean;
        message?: string;
        data?: { status?: string; reference?: string; amount?: number; currency?: string; customer?: { email?: string } };
      };
      if (!paystackRes.ok || !payload.status || payload.data?.status !== 'success'
        || payload.data.reference !== order.paymentReference
        || payload.data.amount !== Math.round(Number(order.total) * 100)
        || payload.data.currency !== 'GHS') {
        return res.status(402).json({ error: payload.message || 'Payment could not be verified against this order.' });
      }
      if (payload.data.customer?.email?.toLowerCase() !== auth.email.toLowerCase()) {
        return res.status(403).json({ error: 'Payment customer does not match this account.' });
      }

      const confirmedOrder = await db.transaction(async tx => {
        const [updated] = await tx.update(orders)
          .set({ paymentStatus: 'paid', updatedAt: new Date() })
          .where(and(eq(orders.id, order.id), eq(orders.paymentStatus, 'pending')))
          .returning();
        if (updated) await tx.insert(notifications).values(orderNotificationRows(updated));
        return updated;
      });
      if (confirmedOrder) return res.status(200).json(confirmedOrder);

      const [latestOrder] = await db.select().from(orders).where(eq(orders.id, order.id)).limit(1);
      if (latestOrder?.paymentStatus === 'paid') return res.status(200).json(latestOrder);
      return res.status(409).json({ error: 'Order payment status changed. Refresh and try again.' });
    }

    if (method === 'POST') {
      const isPaystackPrepare = query.action === 'prepare-paystack';
      const isWhatsAppOrder = query.channel === 'whatsapp';
      const isPosOrder = query.channel === 'pos';
      const auth = isWhatsAppOrder ? null : isPosOrder ? await requireAdmin(req, res) : await requireAuth(req, res);
      if (!isWhatsAppOrder && !auth) return;
      if (isPosOrder && !['Super Admin', 'Store Manager', 'Cashier'].includes(auth?.adminRole || '')) {
        return res.status(403).json({ error: 'This account cannot record POS sales.' });
      }
      if (isWhatsAppOrder) {
        const rateLimit = checkRateLimit(`whatsapp-order:${getClientIp(req.headers)}`, 10, 60 * 60 * 1000);
        if (!rateLimit.allowed) return res.status(429).json({ error: 'Too many order attempts. Please try again later.' });
      }
      if (isPaystackPrepare) {
        const rateLimit = checkRateLimit(`checkout:${auth?.sub}`, 5, 15 * 60 * 1000);
        if (!rateLimit.allowed) return res.status(429).json({ error: 'Too many checkout attempts. Please try again later.' });
      }
      const parsed = orderCreateSchema.safeParse(body);
      if (!parsed.success) {
        const validationMessage = describeValidationError(parsed.error);
        console.warn('Invalid order data:', validationMessage);
        return res.status(400).json({ error: `Invalid order data: ${validationMessage}`, details: parsed.error.flatten() });
      }
      if (isWhatsAppOrder && parsed.data.paymentMethod !== 'cash-on-delivery') {
        return res.status(400).json({ error: 'WhatsApp orders must be confirmed with the store before payment.' });
      }
      if (isPaystackPrepare && (parsed.data.paymentMethod !== 'paystack' || !parsed.data.idempotencyKey)) {
        return res.status(400).json({ error: 'A Paystack checkout key is required to prepare this order.' });
      }
      if (isPosOrder && parsed.data.orderSource !== 'pos') {
        return res.status(400).json({ error: 'POS sales must use the POS order source.' });
      }
      if (isPosOrder && !parsed.data.idempotencyKey) return res.status(400).json({ error: 'POS sale identifier is required. Please retry the sale.' });
      if ((isPosOrder || isPaystackPrepare) && parsed.data.idempotencyKey) {
        const [existingOrder] = await db.select().from(orders).where(eq(orders.idempotencyKey, parsed.data.idempotencyKey)).limit(1);
        if (existingOrder) {
          if (isPaystackPrepare && existingOrder.userId !== auth?.sub) {
            return res.status(409).json({ error: 'This checkout key is already in use.' });
          }
          return res.status(200).json(existingOrder);
        }
      }
      if (isPosOrder && parsed.data.userId) {
        const [posCustomer] = await db.select({ id: users.id, isActive: users.isActive }).from(users).where(eq(users.id, parsed.data.userId)).limit(1);
        if (!posCustomer || !posCustomer.isActive) return res.status(400).json({ error: 'The selected customer account is unavailable.' });
      }
      if (parsed.data.paymentMethod.startsWith('momo') && (!parsed.data.paymentReference?.trim() || !parsed.data.paymentSenderPhone?.trim())) {
        return res.status(400).json({ error: 'Mobile-money transaction reference and sender phone are required.' });
      }
      if (isPosOrder && parsed.data.paymentMethod === 'card' && !parsed.data.paymentReference?.trim()) {
        return res.status(400).json({ error: 'Card terminal reference is required for a counter card sale.' });
      }

      const productIds = parsed.data.items.map((item) => item.product.id);
      const productRows = await db.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(productRows.map((product) => [product.id, product]));
      const quantities = new Map<string, number>();
      const variantQuantities = new Map<string, number>();
      for (const item of parsed.data.items) {
        const product = productMap.get(item.product.id);
        if (!product) {
          return res.status(400).json({ error: `Product no longer exists: ${item.product.name || item.product.id}. Please refresh your cart.` });
        }
        if (!product.isPublished) {
          return res.status(400).json({ error: `${product.name} is no longer available. Please refresh your cart.` });
        }
        const variants = product.variants || [];
        if (variants.length > 0 && !item.selectedVariant?.id) {
          return res.status(400).json({ error: `Choose a variation for ${product.name}.` });
        }
        if (item.selectedVariant?.id && !variants.some(variant => variant.id === item.selectedVariant?.id)) {
          return res.status(400).json({ error: `That variation for ${product.name} is no longer available. Please refresh your cart.` });
        }
      }

      // Check if buyer has wholesale pricing unlocked
      const buyerId = isPosOrder ? (parsed.data.userId || null) : (auth?.sub || null);
      let isWholesaleBuyer = false;
      if (buyerId) {
        const [buyerRecord] = await db.select({ isWholesale: users.isWholesale }).from(users).where(eq(users.id, buyerId)).limit(1);
        isWholesaleBuyer = Boolean(buyerRecord?.isWholesale);
      }

      const verifiedItems = parsed.data.items.map((item) => {
        const product = productMap.get(item.product.id)!;
        const variants = product.variants || [];
        const selectedVariant = item.selectedVariant?.id
          ? variants.find(variant => variant.id === item.selectedVariant?.id)
          : undefined;
        const stockKey = selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id;
        const quantity = (selectedVariant ? variantQuantities : quantities).get(stockKey) || 0;
        (selectedVariant ? variantQuantities : quantities).set(stockKey, quantity + item.quantity);

        const retailPrice = Number(selectedVariant?.price ?? product.price);
        const rawWholesale = selectedVariant?.wholesalePrice != null
          ? Number(selectedVariant.wholesalePrice)
          : (product.wholesalePrice != null ? Number(product.wholesalePrice) : null);

        // Wholesale price applies if customer is marked wholesale OR if cashier applied wholesale price in POS
        const isWholesaleAllowed = isWholesaleBuyer || (isPosOrder && rawWholesale !== null && Math.abs(item.product.price - rawWholesale) <= 0.01);
        const price = (isWholesaleAllowed && rawWholesale !== null) ? rawWholesale : retailPrice;

        return {
          ...item,
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price,
            originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
            image: product.image,
            unit: product.unit,
            category: product.category,
            inStock: product.inStock,
            stockCount: product.stockCount,
          },
          selectedVariant: selectedVariant ? { ...selectedVariant, price } : undefined,
        };
      });

      for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId);
        if (!product || !product.isPublished) {
          return res.status(400).json({ error: 'One or more products are no longer available.' });
        }
        if (!product.inStock || product.stockCount < quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stockCount}, requested: ${quantity}` });
        }
      }
      for (const [stockKey, quantity] of variantQuantities) {
        const [productId, variantId] = stockKey.split(':');
        const variant = productMap.get(productId)?.variants?.find(item => item.id === variantId);
        if (!variant || !variant.inStock || (variant.stockCount ?? 0) < quantity) {
          return res.status(400).json({ error: `That variation is no longer available in the requested quantity.` });
        }
      }

      const calculatedSubtotal = verifiedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      const settingsRows = await db.select().from(storeSettings);
      const settings = Object.fromEntries(settingsRows.map(setting => [setting.key, setting.value])) as {
        standardShippingFee?: number;
        expressShippingFee?: number;
        intercityShippingFee?: number;
        freeDeliveryThreshold?: number;
        deliveryZones?: Array<{ keywords?: string[]; fee?: number }>;
        deliveryPrices?: Array<{ region?: string; town?: string; fee?: number }>;
      };
      const selectedLocationPrice = settings.deliveryPrices?.find(price => price.region === parsed.data.shippingAddress.region && price.town === parsed.data.shippingAddress.city)?.fee;
      const locationText = `${parsed.data.shippingAddress.city} ${parsed.data.shippingAddress.area}`.toLowerCase();
      const matchedZone = (settings.deliveryZones || []).find(zone => (zone.keywords || []).some(keyword => locationText.includes(keyword.toLowerCase())))
        || (settings.deliveryZones || []).find(zone => !(zone.keywords || []).length);
      const zoneFee = Number(selectedLocationPrice ?? matchedZone?.fee ?? settings.standardShippingFee ?? 0);
      const productFees = productRows.map(product => product.deliveryPrice == null ? null : Number(product.deliveryPrice)).filter((fee): fee is number => fee !== null);
      const standardFee = productFees.length > 0 ? Math.max(...productFees) : zoneFee;
      let calculatedDiscount = 0;
      let freeShipping = false;
      let appliedPromoCode: string | undefined;
      if (parsed.data.appliedPromoCode) {
        const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, parsed.data.appliedPromoCode.toUpperCase())).limit(1);
        if (!promo || !promo.isActive || (promo.expiryDate && promo.expiryDate < new Date()) || (promo.maxUsage != null && promo.usageCount >= promo.maxUsage)) {
          return res.status(400).json({ error: 'Promo code is no longer valid.' });
        }
        if (promo.minSpend != null && calculatedSubtotal < Number(promo.minSpend)) {
          return res.status(400).json({ error: 'Order total no longer meets the promo minimum.' });
        }
        calculatedDiscount = promo.discountType === 'percentage'
          ? calculatedSubtotal * Number(promo.discountValue) / 100
          : Math.min(calculatedSubtotal, Number(promo.discountValue));
        freeShipping = Boolean(promo.freeShipping);
        appliedPromoCode = promo.code;
      }

      const isFreeDelivery = freeShipping || calculatedSubtotal >= Number(settings.freeDeliveryThreshold ?? 300);
      const baseShippingFee = parsed.data.deliveryMethod === 'store-pickup' ? 0
        : parsed.data.deliveryMethod === 'accra-express' ? Number(settings.expressShippingFee ?? 0)
          : parsed.data.deliveryMethod === 'intercity' ? Number(settings.intercityShippingFee ?? 0)
            : standardFee;
      const expectedShippingFee = isFreeDelivery ? 0 : baseShippingFee;

      const shippingMatches = Math.abs(parsed.data.shippingFee - expectedShippingFee) <= 0.01
        || (isFreeDelivery && Math.abs(parsed.data.shippingFee - baseShippingFee) <= 0.01);

      if (!shippingMatches) {
        return res.status(400).json({ error: 'Delivery price changed. Please review your delivery option and try again.' });
      }

      if (parsed.data.paymentReference) {
        const [existingOrder] = await db.select().from(orders).where(eq(orders.paymentReference, parsed.data.paymentReference.trim())).limit(1);
        if (existingOrder) {
          if (!auth || existingOrder.userId === auth.sub) {
            return res.status(200).json(existingOrder);
          }
          return res.status(409).json({ error: 'This payment reference has already been submitted.' });
        }
      }

      const finalShippingFee = isFreeDelivery ? 0 : baseShippingFee;
      const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + finalShippingFee);
      const paymentReference = isPaystackPrepare
        ? `CR-${Date.now()}-${randomBytes(8).toString('hex')}`
        : parsed.data.paymentReference?.trim();

      if (isPosOrder && parsed.data.paymentMethod === 'cash-on-delivery' && (parsed.data.cashReceived == null || parsed.data.cashReceived < calculatedTotal)) {
        return res.status(400).json({ error: 'Cash received must cover the final sale total.' });
      }

      // Card payments at the counter have already been authorised by the
      // terminal. Only customer checkout payments are verified with Paystack.
      const onlinePaymentMethods = isPosOrder ? [] : ['paystack', 'card'];
      let isPaystackVerified = false;
      if (!isPaystackPrepare && onlinePaymentMethods.includes(parsed.data.paymentMethod)) {
        const reference = parsed.data.paymentReference?.trim();
        const secretKey = getPaystackSecretKey();
        if (!reference || !secretKey) return res.status(402).json({ error: 'A valid Paystack payment reference is required to complete this order' });
        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secretKey}` } });
        const paystackPayload = await paystackRes.json() as { status?: boolean; data?: { status?: string; amount?: number; currency?: string; customer?: { email?: string } } };
        if (!paystackRes.ok || !paystackPayload.status || paystackPayload.data?.status !== 'success' || paystackPayload.data?.currency !== 'GHS' || paystackPayload.data?.customer?.email?.toLowerCase() !== auth?.email?.toLowerCase()) {
          return res.status(402).json({ error: 'Payment could not be verified with Paystack. Please try again.' });
        }
        const paidAmount = paystackPayload.data?.amount;
        const calculatedTotalPesewas = Math.round(calculatedTotal * 100);
        if (paidAmount !== calculatedTotalPesewas) {
          return res.status(402).json({ error: 'Paid amount does not match the calculated order total.' });
        }
        isPaystackVerified = true;
      }

      if (!isPaystackVerified && !isPaystackPrepare) {
        if (Math.abs(parsed.data.total - calculatedTotal) > 0.01 || Math.abs(parsed.data.subtotal - calculatedSubtotal) > 0.01 || Math.abs(parsed.data.discount - calculatedDiscount) > 0.01) {
          console.error('Order price mismatch:', {
            received: { total: parsed.data.total, subtotal: parsed.data.subtotal, discount: parsed.data.discount, shipping: parsed.data.shippingFee },
            calculated: { total: calculatedTotal, subtotal: calculatedSubtotal, discount: calculatedDiscount, finalShippingFee, expectedShippingFee },
            items: parsed.data.items.map(i => ({ id: i.product.id, name: i.product.name, sentPrice: i.product.price, qty: i.quantity })),
          });
          return res.status(400).json({
            error: `Cart prices changed. Expected total: GHS ${calculatedTotal.toFixed(2)}, received: GHS ${parsed.data.total.toFixed(2)}. Please review your order and try again.`,
            details: { expectedTotal: calculatedTotal, receivedTotal: parsed.data.total, calculatedSubtotal, receivedSubtotal: parsed.data.subtotal }
          });
        }
      }

      const orderNumber = generateOrderNumber();
      const insertOrderData = {
        ...{
          ...parsed.data,
          items: verifiedItems,
          paymentReference,
          appliedPromoCode,
          userId: isPosOrder ? parsed.data.userId || null : auth?.sub || null,
          orderNumber,
          paymentStatus: !isPaystackPrepare && (isPosOrder || isPaystackVerified) ? 'paid' as const : 'pending' as const,
          subtotal: calculatedSubtotal.toString(),
          shippingFee: finalShippingFee.toString(),
          discount: calculatedDiscount.toString(),
          total: calculatedTotal.toString(),
          ...(isPosOrder ? { status: 'Delivered' as const } : {}),
          ...(isPosOrder ? { idempotencyKey: parsed.data.idempotencyKey, cashierName: auth?.adminName || auth?.name || 'POS cashier' } : {}),
        },
        orderSource: isWhatsAppOrder ? 'whatsapp' as const : isPosOrder ? 'pos' as const : parsed.data.orderSource,
      };

      // Lock every item in one consistently ordered database transaction, then
      // create the order and reduce stock together. This prevents two shoppers
      // from both buying the final unit during concurrent checkouts.
      const transactionResult = await db.transaction(async tx => {
        if ((isPosOrder || isPaystackPrepare) && parsed.data.idempotencyKey) {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${parsed.data.idempotencyKey}))`);
          const [existing] = await tx.select().from(orders).where(eq(orders.idempotencyKey, parsed.data.idempotencyKey)).limit(1);
          if (existing) return { order: existing, replayed: true };
        }
        // Re-fetch flash deal inside the transaction to validate expiry atomically
        const [activeDeal] = await tx.select().from(flashDeals)
          .where(and(eq(flashDeals.isActive, true), sql`${flashDeals.expiresAt} > NOW()`))
          .orderBy(desc(flashDeals.createdAt)).limit(1);
        const lockedProducts = await tx
          .select()
          .from(products)
          .where(inArray(products.id, productIds))
          .orderBy(asc(products.id))
          .for('update');
        const lockedById = new Map(lockedProducts.map(product => [product.id, product]));
        // Recalculate verified item prices using the in-transaction flash deal
        const txVerifiedItems = parsed.data.items.map((item) => {
          const product = lockedById.get(item.product.id);
          if (!product) return item;
          const variants = product.variants || [];
          const selectedVariant = item.selectedVariant?.id
            ? variants.find(v => v.id === item.selectedVariant?.id)
            : undefined;

          const retailPrice = Number(selectedVariant?.price ?? product.price);
          const rawWholesale = selectedVariant?.wholesalePrice != null
            ? Number(selectedVariant.wholesalePrice)
            : (product.wholesalePrice != null ? Number(product.wholesalePrice) : null);

          const isWholesaleAllowed = isWholesaleBuyer || (isPosOrder && rawWholesale !== null && Math.abs(item.product.price - rawWholesale) <= 0.01);
          const basePrice = (isWholesaleAllowed && rawWholesale !== null) ? rawWholesale : retailPrice;
          const price = (!isWholesaleAllowed && activeDeal?.productIds?.includes(product.id))
            ? Math.max(0.01, basePrice * (1 - activeDeal.discountPercentage / 100))
            : basePrice;

          return {
            ...item,
            product: {
              id: product.id,
              name: product.name,
              brand: product.brand,
              price,
              // coerce null → undefined to satisfy the schema type
              originalPrice: product.originalPrice == null ? undefined : Number(product.originalPrice),
              image: product.image,
              unit: product.unit,
              category: product.category,
              inStock: product.inStock,
              stockCount: product.stockCount,
            },
            selectedVariant: selectedVariant ? { ...selectedVariant, price } : item.selectedVariant,
          };
        });
        // Use tx-verified items for the final insert
        const finalInsertData = { ...insertOrderData, items: txVerifiedItems };

        for (const [productId, quantity] of quantities) {
          const product = lockedById.get(productId);
          if (!product || !product.isPublished || !product.inStock || product.stockCount < quantity) {
            throw new Error('One or more products just sold out. Please refresh your cart and try again.');
          }
        }
        for (const [stockKey, quantity] of variantQuantities) {
          const [productId, variantId] = stockKey.split(':');
          const variant = lockedById.get(productId)?.variants?.find(item => item.id === variantId);
          if (!variant || !variant.inStock || (variant.stockCount ?? 0) < quantity) {
            throw new Error('A selected variation just sold out. Please refresh your cart and try again.');
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [order] = await tx.insert(orders).values(finalInsertData as any).returning();

        // Increment promo usage count atomically inside the transaction
        if (appliedPromoCode) {
          await tx.update(promoCodes)
            .set({ usageCount: sql`${promoCodes.usageCount} + 1`, updatedAt: new Date() })
            .where(eq(promoCodes.code, appliedPromoCode));
        }

        if (isPosOrder) {
          const cashReceived = parsed.data.paymentMethod === 'cash-on-delivery' ? parsed.data.cashReceived : undefined;
          await tx.insert(posPayments).values({ orderId: order.id, method: parsed.data.paymentMethod, status: 'SUCCESS', amount: calculatedTotal.toString(), reference: parsed.data.paymentReference?.trim() || undefined, cashReceived: cashReceived?.toString(), changeGiven: cashReceived == null ? undefined : Math.max(0, cashReceived - calculatedTotal).toString(), cashierName: auth?.adminName || auth?.name || 'POS cashier' });
        }

        for (const [productId, quantity] of quantities) {
          const product = lockedById.get(productId)!;
          const nextStock = product.stockCount - quantity;
          await tx.update(products).set({
            stockCount: nextStock,
            inStock: nextStock > 0,
            isPublished: nextStock > 0,
            updatedAt: new Date(),
          }).where(eq(products.id, productId));
          if (isPosOrder) await tx.insert(inventoryMovements).values({ productId, orderId: order.id, movementType: 'POS_SALE', quantity: -quantity, quantityBefore: product.stockCount, quantityAfter: nextStock, actorName: auth?.adminName || auth?.name, reason: `POS sale ${order.orderNumber}` });
        }
        for (const [stockKey, quantity] of variantQuantities) {
          const [productId, variantId] = stockKey.split(':');
          const product = lockedById.get(productId)!;
          const nextVariants = (product.variants || []).map(variant => variant.id !== variantId ? variant : {
            ...variant,
            stockCount: Math.max(0, (variant.stockCount ?? 0) - quantity),
            inStock: (variant.stockCount ?? 0) - quantity > 0,
          });
          const totalStock = nextVariants.reduce((total, variant) => total + Math.max(0, Number(variant.stockCount ?? 0) || 0), 0);
          await tx.update(products).set({
            variants: nextVariants,
            stockCount: totalStock,
            inStock: totalStock > 0,
            ...(totalStock > 0 ? {} : { isPublished: false }),
            updatedAt: new Date(),
          }).where(eq(products.id, productId));
          if (isPosOrder) await tx.insert(inventoryMovements).values({ productId, variantId, orderId: order.id, movementType: 'POS_SALE', quantity: -quantity, quantityBefore: Number(product.variants?.find(v => v.id === variantId)?.stockCount ?? 0), quantityAfter: Math.max(0, Number(product.variants?.find(v => v.id === variantId)?.stockCount ?? 0) - quantity), actorName: auth?.adminName || auth?.name, reason: `POS sale ${order.orderNumber}` });
        }
        if (isPosOrder && order.userId) {
          await tx.update(users).set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${Math.floor(calculatedTotal)}` }).where(eq(users.id, order.userId));
        }
        if (isPosOrder) await tx.insert(auditLogs).values({ action: 'POS_SALE_COMPLETED', entityType: 'order', entityId: order.id, actorName: auth?.adminName || auth?.name, metadata: { orderNumber: order.orderNumber, total: calculatedTotal, idempotencyKey: parsed.data.idempotencyKey, deviceId: parsed.data.deviceId || null, adminId: auth?.sub || null, paymentMethod: parsed.data.paymentMethod } });
        return { order, replayed: false };
      });
      const createdOrder = transactionResult.order;
      if (isPaystackPrepare && createdOrder.userId !== auth?.sub) {
        return res.status(409).json({ error: 'This checkout key is already in use.' });
      }

      if (!transactionResult.replayed && !isPaystackPrepare) {
        await db.insert(notifications).values([
          {
            userId: createdOrder.userId || null,
            type: 'order',
            title: 'Order received',
            message: `Order #${createdOrder.orderNumber} has been received and is being prepared.`,
            actionUrl: `/account/orders`,
          },
          {
            userId: null,
            type: 'order',
            title: 'New order received',
            message: `Order #${createdOrder.orderNumber} was placed and needs fulfillment review.`,
            actionUrl: '/admin?tab=orders',
          },
        ]);
      }

      const newOrder = createdOrder;

      if (!isPaystackPrepare && !transactionResult.replayed) {
        const customerEmail = parsed.data.shippingAddress.email?.trim().toLowerCase() || auth?.email;
        const storeEmail = process.env.STORE_NOTIFICATION_EMAIL || process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1];
        const orderLink = `${process.env.PUBLIC_SITE_URL || ''}/account/orders`;
        await Promise.all([
          customerEmail ? sendEmail({
            to: customerEmail,
            subject: `Order received: ${newOrder.orderNumber}`,
            html: `<p>Hi ${escapeHtml(parsed.data.shippingAddress.fullName)},</p><p>Thanks for your order. We received <strong>${escapeHtml(newOrder.orderNumber)}</strong> and are preparing it now.</p><p>You can track your order in your account.</p><p><a href="${escapeHtml(orderLink)}">View order</a></p>`,
          }) : Promise.resolve(false),
          storeEmail ? sendEmail({
            to: storeEmail,
            subject: `New order: ${newOrder.orderNumber}`,
            html: `<p>A new order has been placed.</p><p><strong>${escapeHtml(newOrder.orderNumber)}</strong> from ${escapeHtml(parsed.data.shippingAddress.fullName)} for GHS ${escapeHtml(newOrder.total)}.</p>`,
          }) : Promise.resolve(false),
        ]);
      }

      return res.status(transactionResult.replayed ? 200 : 201).json(newOrder);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res, ['Super Admin', 'Store Manager', 'Inventory Dispatcher']);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const parsed = orderUpdateSchema.safeParse(body);
      if (!parsed.success) {
        const validationMessage = describeValidationError(parsed.error);
        console.warn('Invalid order data:', validationMessage);
        return res.status(400).json({ error: `Invalid order data: ${validationMessage}`, details: parsed.error.flatten() });
      }

      const [existingOrder] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      if (parsed.data.paymentStatus !== undefined && !['Super Admin', 'Store Manager'].includes(auth.adminRole || '')) {
        return res.status(403).json({ error: 'Only Store Managers and Super Admins can adjust payment status.' });
      }

      if (parsed.data.paymentStatus === 'pending' && existingOrder.paymentStatus !== 'pending') {
        return res.status(409).json({ error: 'A terminal payment status cannot be returned to pending.' });
      }
      if (parsed.data.paymentStatus === 'paid' && existingOrder.paymentStatus !== 'paid' && existingOrder.paymentMethod === 'paystack') {
        return res.status(403).json({ error: 'Paystack payments can only be confirmed by Paystack verification.' });
      }
      if (parsed.data.status && parsed.data.status !== existingOrder.status
        && existingOrder.paymentMethod === 'paystack' && existingOrder.paymentStatus !== 'paid') {
        return res.status(409).json({ error: 'A Paystack order cannot enter fulfillment before payment is confirmed.' });
      }

      const mergedRiderInfo = parsed.data.riderInfo !== undefined
        ? { ...((existingOrder.riderInfo as Record<string, any>) || {}), ...(parsed.data.riderInfo || {}) }
        : existingOrder.riderInfo;

      const { adminNote, ...orderChanges } = parsed.data;
      const updateData: any = {
        ...orderChanges,
        updatedAt: new Date(),
      };
      if (parsed.data.riderInfo !== undefined) {
        updateData.riderInfo = mergedRiderInfo;
      }
      const statusChanged = Boolean(parsed.data.status && parsed.data.status !== existingOrder.status);
      if (parsed.data.status && (statusChanged || adminNote)) {
        updateData.adminNotes = [
          ...((existingOrder.adminNotes as Array<Record<string, string>>) || []),
          {
            note: adminNote || '',
            status: parsed.data.status,
            createdAt: new Date().toISOString(),
            adminName: auth.adminName || auth.name || undefined,
          },
        ];
      }

      const updateConditions = [eq(orders.id, id)];
      if (parsed.data.paymentStatus !== undefined) {
        updateConditions.push(eq(orders.paymentStatus, existingOrder.paymentStatus));
      }
      const [updated] = await db
        .update(orders)
        .set(updateData)
        .where(and(...updateConditions))
        .returning();
      if (!updated) {
        return res.status(409).json({ error: 'Order payment status changed. Refresh and try again.' });
      }
      if (parsed.data.status && updated.userId) {
        await db.insert(notifications).values({
          userId: updated.userId,
          type: 'order',
          title: 'Order status updated',
          message: `Order #${updated.orderNumber} is now ${updated.status.toLowerCase()}.`,
          actionUrl: '/account/orders',
        });
      }
      if (parsed.data.status) {
        const customerEmail = updated.shippingAddress?.email;
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: `Order update: ${updated.orderNumber}`,
            html: `<p>Your order <strong>${escapeHtml(updated.orderNumber)}</strong> is now <strong>${escapeHtml(updated.status)}</strong>.</p><p>Open your account to view the latest delivery details.</p>`,
          });
        }
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;
      if (!['Super Admin', 'Store Manager'].includes(auth.adminRole || '')) {
        return res.status(403).json({ error: 'Only Store Managers and Super Admins can delete orders.' });
      }

      const requestedId = typeof query.id === 'string' ? query.id : undefined;
      const result = await db.transaction(async tx => {
        const targetOrders = requestedId
          ? await tx.select().from(orders).where(eq(orders.id, requestedId)).for('update')
          : await tx.select().from(orders).for('update');

        if (requestedId && targetOrders.length === 0) throw new Error('Order not found');

        const productIds = [...new Set(targetOrders.flatMap(order => order.items.map(item => item.product.id)))];
        const lockedProducts = productIds.length
          ? await tx.select().from(products).where(inArray(products.id, productIds)).for('update')
          : [];
        const productMap = new Map(lockedProducts.map(product => [product.id, product]));

        for (const order of targetOrders) {
          for (const item of order.items) {
            const product = productMap.get(item.product.id);
            if (!product) continue;
            const variantId = item.selectedVariant?.id;
            const variants = Array.isArray(product.variants) ? product.variants : [];
            const variant = variantId ? variants.find(candidate => candidate.id === variantId) : undefined;
            if (variant) {
              const quantityBefore = Number(variant.stockCount || 0);
              const updatedVariants = variants.map(candidate => candidate.id === variantId
                ? { ...candidate, stockCount: quantityBefore + item.quantity, inStock: true }
                : candidate);
              await tx.update(products).set({ variants: updatedVariants, updatedAt: new Date() }).where(eq(products.id, product.id));
              await tx.insert(inventoryMovements).values({ productId: product.id, variantId, orderId: null, movementType: 'ORDER_DELETE', quantity: item.quantity, quantityBefore, quantityAfter: quantityBefore + item.quantity, actorName: auth.adminName, reason: `Deleted order ${order.orderNumber}` });
              product.variants = updatedVariants;
            } else {
              const quantityBefore = product.stockCount;
              await tx.update(products).set({ stockCount: quantityBefore + item.quantity, inStock: true, isPublished: true, updatedAt: new Date() }).where(eq(products.id, product.id));
              await tx.insert(inventoryMovements).values({ productId: product.id, orderId: null, movementType: 'ORDER_DELETE', quantity: item.quantity, quantityBefore, quantityAfter: quantityBefore + item.quantity, actorName: auth.adminName, reason: `Deleted order ${order.orderNumber}` });
              product.stockCount = quantityBefore + item.quantity;
            }
          }
        }

        const orderIds = targetOrders.map(order => order.id);
        if (orderIds.length) {
          await tx.delete(inventoryMovements).where(inArray(inventoryMovements.orderId, orderIds));
          await tx.delete(posPayments).where(inArray(posPayments.orderId, orderIds));
          await tx.delete(orders).where(inArray(orders.id, orderIds));
        }
        await tx.insert(auditLogs).values({ action: requestedId ? 'ORDER_DELETED' : 'ORDERS_DELETED', entityType: 'order', entityId: requestedId || 'all', actorName: auth.adminName, metadata: { orderNumbers: targetOrders.map(order => order.orderNumber), restoredStock: true } });
        return { deleted: targetOrders.length, restoredStock: true };
      });
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API error:', error);
    if (typeof error?.message === 'string' && /just sold out/i.test(error.message)) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
