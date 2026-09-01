import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db';
import { orders, products } from '../src/db/schema';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from './_auth';

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
  paymentMethod: z.enum(['momo-mtn', 'momo-telecel', 'momo-at', 'cash-on-delivery', 'card', 'apple-pay']),
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
      const parsed = orderCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid order data', details: parsed.error.flatten() });
      }

      const productIds = parsed.data.items.map((item) => item.product.id);
      const productRows = await db.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(productRows.map((product) => [product.id, product]));

      for (const item of parsed.data.items) {
        const product = productMap.get(item.product.id);
        if (!product) {
          throw new Error(`Product not found: ${item.product.id}`);
        }
        if (product.stockCount < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockCount}, requested: ${item.quantity}`);
        }
      }

      const orderNumber = generateOrderNumber();
      const orderData = {
        ...parsed.data,
        orderNumber,
        subtotal: parsed.data.subtotal.toString(),
        shippingFee: parsed.data.shippingFee.toString(),
        discount: parsed.data.discount.toString(),
        total: parsed.data.total.toString(),
      };

      const newOrder = await db.transaction(async (tx) => {
        const [createdOrder] = await tx.insert(orders).values(orderData).returning();

        for (const item of parsed.data.items) {
          const product = productMap.get(item.product.id);
          if (!product) continue;
          const nextStock = product.stockCount - item.quantity;
          await tx
            .update(products)
            .set({ stockCount: nextStock, inStock: nextStock > 0, updatedAt: new Date() })
            .where(eq(products.id, item.product.id));
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