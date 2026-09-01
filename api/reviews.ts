import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db';
import { reviews, products } from '../src/db/schema';
import { eq, desc, and, sql, avg, count } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth';

const reviewCreateSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  authorName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(1),
  verifiedPurchase: z.boolean().default(false),
  skinType: z.string().max(50).optional(),
});

const reviewUpdateSchema = z.object({
  isApproved: z.boolean().optional(),
  adminReply: z.string().optional(),
  helpfulCount: z.number().int().min(0).optional(),
}).partial();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { productId, id, approved } = query;

      if (id && typeof id === 'string') {
        const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }
        return res.status(200).json(review);
      }

      if (productId && typeof productId === 'string') {
        const conditions = [eq(reviews.productId, productId)];
        if (approved !== undefined) {
          conditions.push(eq(reviews.isApproved, approved === 'true'));
        } else {
          conditions.push(eq(reviews.isApproved, true));
        }

        const results = await db
          .select()
          .from(reviews)
          .where(and(...conditions))
          .orderBy(desc(reviews.createdAt));

        const statsResult = await db
          .select({
            avgRating: avg(reviews.rating),
            totalReviews: count(),
            distribution: sql<Record<number, number>>`jsonb_object_agg(rating, cnt)`,
          })
          .from(
            db
              .select({ rating: reviews.rating, cnt: count() })
              .from(reviews)
              .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
              .groupBy(reviews.rating)
              .as('rating_counts')
          );

        const stats = statsResult[0] || { avgRating: '5.0', totalReviews: 0, distribution: {} };
        const avgRating = stats.avgRating ?? '5.0';

        return res.status(200).json({
          reviews: results,
          stats: {
            averageRating: Number(parseFloat(avgRating).toFixed(1)),
            totalReviews: Number(stats.totalReviews ?? 0),
            distribution: stats.distribution || { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
        });
      }

      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (method === 'POST') {
      const parsed = reviewCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid review data', details: parsed.error.flatten() });
      }

      const [newReview] = await db.insert(reviews).values(parsed.data).returning();

      const stats = await db
        .select({
          avgRating: avg(reviews.rating),
          cnt: count(),
        })
        .from(reviews)
        .where(and(eq(reviews.productId, parsed.data.productId), eq(reviews.isApproved, true)));

      if (stats[0] && stats[0].avgRating) {
        await db
          .update(products)
          .set({
            rating: sql`ROUND(${stats[0].avgRating}::numeric, 1)`,
            reviewCount: stats[0].cnt,
            updatedAt: new Date(),
          })
          .where(eq(products.id, parsed.data.productId));
      }

      return res.status(201).json(newReview);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      const parsed = reviewUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid review data', details: parsed.error.flatten() });
      }

      const [updated] = await db
        .update(reviews)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(reviews.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (parsed.data.isApproved !== undefined) {
        const stats = await db
          .select({
            avgRating: avg(reviews.rating),
            cnt: count(),
          })
          .from(reviews)
          .where(and(eq(reviews.productId, updated.productId), eq(reviews.isApproved, true)));

        if (stats[0]) {
          await db
            .update(products)
            .set({
              rating: stats[0].avgRating ? sql`ROUND(${stats[0].avgRating}::numeric, 1)` : sql`'5.0'`,
              reviewCount: stats[0].cnt,
              updatedAt: new Date(),
            })
            .where(eq(products.id, updated.productId));
        }
      }

      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id, productId: reviews.productId });
      if (!deleted) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const stats = await db
        .select({
          avgRating: avg(reviews.rating),
          cnt: count(),
        })
        .from(reviews)
        .where(and(eq(reviews.productId, deleted.productId), eq(reviews.isApproved, true)));

      if (stats[0]) {
        await db
          .update(products)
          .set({
            rating: stats[0].avgRating ? sql`ROUND(${stats[0].avgRating}::numeric, 1)` : sql`'5.0'`,
            reviewCount: stats[0].cnt,
            updatedAt: new Date(),
          })
          .where(eq(products.id, deleted.productId));
      }

      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}