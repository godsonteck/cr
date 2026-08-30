import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db.ts';
import { brands } from '../src/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';

const brandCreateSchema = z.object({
  name: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, active } = query;
      
      if (id && typeof id === 'string') {
        const [brand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
        if (!brand) {
          return res.status(404).json({ error: 'Brand not found' });
        }
        return res.status(200).json(brand);
      }

      const conditions = [];
      if (active !== undefined) {
        conditions.push(eq(brands.isActive, active === 'true'));
      }

      const results = conditions.length > 0
        ? await db.select().from(brands).where(conditions[0]).orderBy(asc(brands.name))
        : await db.select().from(brands).orderBy(asc(brands.name));

      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const parsed = brandCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid brand data', details: parsed.error.flatten() });
      }

      const [newBrand] = await db.insert(brands).values(parsed.data).returning();
      return res.status(201).json(newBrand);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Brands API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}