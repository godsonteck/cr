import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db.ts';
import { carts } from '../src/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const cartUpdateSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    selectedOption: z.string().optional(),
    selectedVariant: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      originalPrice: z.number().optional(),
      inStock: z.boolean(),
    }).optional(),
  })).default([]).optional(),
  promoCode: z.string().max(50).optional().nullable(),
  discountAmount: z.string().optional(),
  hasFreeShippingCoupon: z.boolean().optional(),
  selectedSamples: z.array(z.string()).default([]).optional(),
}).partial();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body, headers } = req;

  const userId = headers['x-user-id'] as string | undefined;
  const sessionId = headers['x-session-id'] as string | undefined;

  if (!userId && !sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (method === 'GET') {
      const conditions = [];
      if (userId) {
        conditions.push(eq(carts.userId, userId));
      } else {
        conditions.push(eq(carts.sessionId, sessionId!));
      }

      const [cart] = await db.select().from(carts).where(and(...conditions)).limit(1);
      
      if (!cart) {
        return res.status(200).json({
          items: [],
          promoCode: null,
          discountAmount: 0,
          hasFreeShippingCoupon: false,
          selectedSamples: [],
        });
      }

      return res.status(200).json(cart);
    }

    if (method === 'POST') {
      const parsed = cartUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid cart data', details: parsed.error.flatten() });
      }

      const conditions = [];
      if (userId) {
        conditions.push(eq(carts.userId, userId));
      } else {
        conditions.push(eq(carts.sessionId, sessionId!));
      }

      const [existingCart] = await db.select().from(carts).where(and(...conditions)).limit(1);

      if (existingCart) {
        const updateData = { ...parsed.data, updatedAt: new Date() };
        const [updated] = await db
          .update(carts)
          .set(updateData)
          .where(and(...conditions))
          .returning();
        return res.status(200).json(updated);
      } else {
        const [newCart] = await db.insert(carts).values({
          userId: userId || null,
          sessionId: sessionId || null,
          items: parsed.data.items || [],
          promoCode: parsed.data.promoCode || null,
          discountAmount: parsed.data.discountAmount || '0',
          hasFreeShippingCoupon: parsed.data.hasFreeShippingCoupon || false,
          selectedSamples: parsed.data.selectedSamples || [],
        }).returning();
        return res.status(201).json(newCart);
      }
    }

    if (method === 'DELETE') {
      const conditions = [];
      if (userId) {
        conditions.push(eq(carts.userId, userId));
      } else {
        conditions.push(eq(carts.sessionId, sessionId!));
      }

      await db.delete(carts).where(and(...conditions));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}