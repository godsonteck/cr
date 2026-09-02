import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { wishlists } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const wishlistAddSchema = z.object({
  productId: z.string().uuid(),
});

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
        conditions.push(eq(wishlists.userId, userId));
      } else {
        conditions.push(eq(wishlists.sessionId, sessionId!));
      }

      const results = await db.select().from(wishlists).where(and(...conditions));
      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const parsed = wishlistAddSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid wishlist data', details: parsed.error.flatten() });
      }

      const conditions = [];
      if (userId) {
        conditions.push(eq(wishlists.userId, userId));
      } else {
        conditions.push(eq(wishlists.sessionId, sessionId!));
      }
      conditions.push(eq(wishlists.productId, parsed.data.productId));

      const [existing] = await db.select().from(wishlists).where(and(...conditions)).limit(1);

      if (existing) {
        // Already in wishlist, remove it (toggle)
        await db.delete(wishlists).where(and(...conditions));
        return res.status(200).json({ success: true, inWishlist: false });
      } else {
        const [newItem] = await db.insert(wishlists).values({
          userId: userId || null,
          sessionId: sessionId || null,
          productId: parsed.data.productId,
        }).returning();
        return res.status(201).json({ success: true, inWishlist: true, item: newItem });
      }
    }

    if (method === 'DELETE') {
      const { productId } = query;
      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const conditions = [];
      if (userId) {
        conditions.push(eq(wishlists.userId, userId));
      } else {
        conditions.push(eq(wishlists.sessionId, sessionId!));
      }
      conditions.push(eq(wishlists.productId, productId));

      await db.delete(wishlists).where(and(...conditions));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}