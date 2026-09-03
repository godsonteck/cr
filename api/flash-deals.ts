import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { flashDeals } from '../src/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth.js';

const flashDealCreateSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().optional(),
  badgeText: z.string().max(100).optional(),
  discountPercentage: z.number().int().min(1).max(100),
  hoursRemaining: z.number().int().min(0).default(0),
  minutesRemaining: z.number().int().min(0).max(59).default(0),
  secondsRemaining: z.number().int().min(0).max(59).default(0),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime(),
  backgroundGradient: z.string().max(200).optional(),
  productIds: z.array(z.string().min(1)).max(100).default([]),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, active } = query;
      
      if (id && typeof id === 'string') {
        const [deal] = await db.select().from(flashDeals).where(eq(flashDeals.id, id)).limit(1);
        if (!deal) {
          return res.status(404).json({ error: 'Flash deal not found' });
        }
        return res.status(200).json(deal);
      }

      const conditions = [];
      if (active !== undefined) {
        conditions.push(eq(flashDeals.isActive, active === 'true'));
      } else {
        // Default to active and not expired
        conditions.push(eq(flashDeals.isActive, true));
        conditions.push(sql`${flashDeals.expiresAt} > NOW()`);
      }

      const results = conditions.length > 0
        ? await db.select().from(flashDeals).where(and(...conditions)).orderBy(desc(flashDeals.createdAt))
        : await db.select().from(flashDeals).orderBy(desc(flashDeals.createdAt));

      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const parsed = flashDealCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid flash deal data', details: parsed.error.flatten() });
      }

      const [newDeal] = await db.insert(flashDeals).values({
        ...parsed.data,
        expiresAt: new Date(parsed.data.expiresAt),
      }).returning();

      return res.status(201).json(newDeal);
    }

    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Flash deal ID is required' });
      }

      const parsed = z.object({
        isActive: z.boolean().optional(),
        title: z.string().min(1).max(200).optional(),
        subtitle: z.string().max(300).optional(),
        description: z.string().optional(),
        badgeText: z.string().max(100).optional(),
        discountPercentage: z.number().int().min(1).max(100).optional(),
        expiresAt: z.string().datetime().optional(),
        backgroundGradient: z.string().max(200).optional(),
        productIds: z.array(z.string().min(1)).max(100).optional(),
      }).partial().safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid flash deal update', details: parsed.error.flatten() });
      }

      const { expiresAt, ...updates } = parsed.data;
      const [updated] = await db.update(flashDeals).set({
        ...updates,
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
        updatedAt: new Date(),
      }).where(eq(flashDeals.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ error: 'Flash deal not found' });
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Flash deal ID is required' });
      }

      const [deleted] = await db.delete(flashDeals).where(eq(flashDeals.id, id)).returning({ id: flashDeals.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Flash deal not found' });
      }
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Flash Deals API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}