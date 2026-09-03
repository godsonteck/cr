import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { orders, products, storeSettings, promoCodes, flashDeals } from '../src/db/schema.js';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from './_auth.js';

const orderCreateSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  items: z.array(z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      brand: z.string(),
      price: z.number(),
      originalPrice: z.number().optional(),
      image: z.string(),
      unit: z.string(),
      category: z.string(),
      inStock: z.boolean(),
      stockCount: z.number(),
    }),
    quantity: z.number().int().positive(),
    selectedOption: z.string().optional(),
    selectedVariant: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      originalPrice: z.number().optional(),
      inStock: z.boolean(),
    }).optional(),
  })).min(1),
  subtotal: z.number().positive(),
  shippingFee: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  paymentMethod: z.enum(['korapay', 'paystack', 'momo-mtn', 'momo-telecel', 'momo-at', 'cash-on-delivery', 'card', 'apple-pay']),
  paymentStatus: z.enum(['paid', 'pending']).default('pending'),
  deliveryMethod: z.enum(['accra-express', 'standard-delivery', 'intercity', 'store-pickup']),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    city: z.string().min(1),
    area: z.string().min(1),
    landmarkOrGps: z.string().optional(),
    deliveryNotes: z.string().optional(),
  }),
  estimatedDeliveryTime: z.string().optional(),
  appliedPromoCode: z.string().optional(),
  paymentReference: z.string().max(100).optional(),
  paymentSenderPhone: z.string().max(50).optional(),
  // Server-verified Paystack reference — required for paystack/momo payment methods
  paystackReference: z.string().optional(),
});

const orderUpdateSchema = z.object({
  status: z.enum(['Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered']).optional(),
  paymentStatus: z.enum(['paid', 'pending']).optional(),
  riderInfo: z.object({
    riderName: z.string(),
    riderPhone: z.string(),
    riderLocation: z.string(),
    estimatedArrival: z.string(),
    stageIndex: z.number().int().min(0).max(3),
  }).optional(),
}).partial();

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CR-${year}${month}${day}-${random}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, orderNumber, userId, status, limit = '50', offset = '0' } = query;
      const auth = await requireAuth(req, res);
      if (!auth) return;

      if (id && typeof id === 'string') {
        const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        if (auth.role !== 'admin' && order.userId !== auth.sub) {
          return res.status(403).json({ error: 'You do not have access to this order' });
        }
        return res.status(200).json(order);
      }

      if (orderNumber && typeof orderNumber === 'string') {
        const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        if (auth.role !== 'admin' && order.userId !== auth.sub) {
          return res.status(403).json({ error: 'You do not have access to this order' });
        }
        return res.status(200).json(order);
      }

      const conditions = [];
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

    if (method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const parsed = orderCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid order data', details: parsed.error.flatten() });
      }
      if (parsed.data.paymentMethod.startsWith('momo') && (!parsed.data.paymentReference?.trim() || !parsed.data.paymentSenderPhone?.trim())) {
        return res.status(400).json({ error: 'Mobile-money transaction reference and sender phone are required.' });
      }

      const productIds = parsed.data.items.map((item) => item.product.id);
      const productRows = await db.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(productRows.map((product) => [product.id, product]));
      const [activeDeal] = await db.select().from(flashDeals).where(and(eq(flashDeals.isActive, true), sql`${flashDeals.expiresAt} > NOW()`)).orderBy(desc(flashDeals.createdAt)).limit(1);
      const quantities = new Map<string, number>();
      const verifiedItems = parsed.data.items.map((item) => {
        const product = productMap.get(item.product.id);
        if (!product) throw new Error(`Product not found: ${item.product.id}`);
        const quantity = (quantities.get(product.id) || 0) + item.quantity;
        quantities.set(product.id, quantity);
        const variants = product.variants || [];
        const selectedVariant = item.selectedVariant?.id
          ? variants.find(variant => variant.id === item.selectedVariant?.id)
          : undefined;
        const basePrice = Number(selectedVariant?.price ?? product.price);
        const price = activeDeal?.productIds?.includes(product.id)
          ? Math.max(0.01, basePrice * (1 - activeDeal.discountPercentage / 100))
          : basePrice;
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
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockCount}, requested: ${quantity}`);
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
      };
      const locationText = `${parsed.data.shippingAddress.city} ${parsed.data.shippingAddress.area}`.toLowerCase();
      const matchedZone = (settings.deliveryZones || []).find(zone => (zone.keywords || []).some(keyword => locationText.includes(keyword.toLowerCase())))
        || (settings.deliveryZones || []).find(zone => !(zone.keywords || []).length);
      const zoneFee = Number(matchedZone?.fee ?? settings.standardShippingFee ?? 0);
      const productFees = productRows.map(product => product.deliveryPrice == null ? null : Number(product.deliveryPrice)).filter((fee): fee is number => fee !== null);
      const standardFee = productFees.length > 0 ? Math.max(...productFees) : zoneFee;
      const expectedShippingFee = parsed.data.deliveryMethod === 'store-pickup' ? 0
        : parsed.data.deliveryMethod === 'accra-express' ? Number(settings.expressShippingFee ?? 0)
          : parsed.data.deliveryMethod === 'intercity' ? Number(settings.intercityShippingFee ?? 0)
            : standardFee;
      if (Math.abs(parsed.data.shippingFee - expectedShippingFee) > 0.01) {
        return res.status(400).json({ error: 'Delivery price changed. Please review your delivery option and try again.' });
      }

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
        freeShipping = promo.freeShipping;
        appliedPromoCode = promo.code;
      }
      if (parsed.data.paymentReference) {
        const [usedReference] = await db.select({ id: orders.id }).from(orders).where(eq(orders.paymentReference, parsed.data.paymentReference.trim())).limit(1);
        if (usedReference) return res.status(409).json({ error: 'This payment reference has already been submitted.' });
      }
      const finalShippingFee = freeShipping || calculatedSubtotal >= Number(settings.freeDeliveryThreshold ?? 300) ? 0 : expectedShippingFee;
      const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + finalShippingFee);
      if (Math.abs(parsed.data.total - calculatedTotal) > 0.01 || Math.abs(parsed.data.subtotal - calculatedSubtotal) > 0.01 || Math.abs(parsed.data.discount - calculatedDiscount) > 0.01) {
        return res.status(400).json({ error: 'Cart prices changed. Please review your order and try again.' });
      }

      const onlinePaymentMethods = ['korapay', 'paystack', 'card'];
      if (onlinePaymentMethods.includes(parsed.data.paymentMethod)) {
        if (parsed.data.paymentMethod === 'korapay') {
          const reference = parsed.data.paymentReference?.trim();
          const secretKey = process.env.KORAPAY_SECRET_KEY;
          if (!reference || !secretKey) return res.status(402).json({ error: 'A valid Korapay payment reference is required to complete this order' });
          const korapayRes = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secretKey}` } });
          const korapayPayload = await korapayRes.json() as { status?: boolean; data?: { status?: string; amount?: number; currency?: string; customer?: { email?: string } } };
          if (!korapayRes.ok || !korapayPayload.status || !['success', 'successful', 'completed'].includes((korapayPayload.data?.status || '').toLowerCase()) || Number(korapayPayload.data?.amount) !== Number(calculatedTotal) || korapayPayload.data?.currency !== 'GHS' || korapayPayload.data?.customer?.email?.toLowerCase() !== auth.email.toLowerCase()) {
            return res.status(402).json({ error: 'Korapay payment could not be verified. Please try again.' });
          }
        }
        const reference = parsed.data.paymentReference?.trim();
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (parsed.data.paymentMethod === 'korapay') {
          // Korapay was verified above; skip the legacy Paystack verifier.
        } else {
        if (!reference || !secretKey) return res.status(402).json({ error: 'A valid Paystack payment reference is required to complete this order' });
        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secretKey}` } });
        const paystackPayload = await paystackRes.json() as { status?: boolean; data?: { status?: string; amount?: number; currency?: string; customer?: { email?: string } } };
        if (!paystackRes.ok || !paystackPayload.status || paystackPayload.data?.status !== 'success' || paystackPayload.data?.amount !== Math.round(calculatedTotal * 100) || paystackPayload.data?.currency !== 'GHS' || paystackPayload.data?.customer?.email?.toLowerCase() !== auth.email.toLowerCase()) {
          return res.status(402).json({ error: 'Payment could not be verified. Please try again.' });
        }
        }
      }

      const orderNumber = generateOrderNumber();
      const orderData = {
        ...parsed.data,
        items: verifiedItems,
        appliedPromoCode,
        userId: auth.sub,
        orderNumber,
        subtotal: calculatedSubtotal.toString(),
        shippingFee: finalShippingFee.toString(),
        discount: calculatedDiscount.toString(),
        total: calculatedTotal.toString(),
      };

      const newOrder = await db.transaction(async (tx) => {
        const [createdOrder] = await tx.insert(orders).values(orderData).returning();

        for (const [productId, quantity] of quantities) {
          const product = productMap.get(productId);
          if (!product) continue;
          const nextStock = product.stockCount - quantity;
          await tx
            .update(products)
            .set({ stockCount: nextStock, inStock: nextStock > 0, updatedAt: new Date() })
            .where(eq(products.id, productId));
        }

        return createdOrder;
      });

      return res.status(201).json(newOrder);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const parsed = orderUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid order data', details: parsed.error.flatten() });
      }

      const [updated] = await db
        .update(orders)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}