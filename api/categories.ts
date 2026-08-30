import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db.ts';
import { categories } from '../src/schema';
import { eq, asc, and } from 'drizzle-orm';
import { z } from 'zod';

const categoryEnum = [
  'all', 'skincare', 'makeup', 'fragrances', 'body-care', 'beauty-tools',
  'rice-grains', 'cooking-oils', 'seasoning-spices', 'beverages',
  'snacks-sweets', 'household-care', 'daily-essentials', 'new-arrivals',
  'best-sellers', 'offers'
] as const;

const categoryCreateSchema = z.object({
  id: z.enum(categoryEnum),
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  department: z.enum(['beauty', 'groceries']),
  image: z.string().url(),
  description: z.string().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      const { id, department, active } = query;
      
      if (id && typeof id === 'string') {
        const [category] = await db.select().from(categories).where(eq(categories.id, id as any)).limit(1);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        return res.status(200).json(category);
      }

      const conditions = [];
      if (department) {
        conditions.push(eq(categories.department, department as any));
      }
      if (active !== undefined) {
        conditions.push(eq(categories.isActive, active === 'true'));
      }

      const results = conditions.length > 0
        ? await db.select().from(categories).where(and(...conditions)).orderBy(asc(categories.sortOrder))
        : await db.select().from(categories).orderBy(asc(categories.sortOrder));

      return res.status(200).json(results);
    }

    if (method === 'POST') {
      const parsed = categoryCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid category data', details: parsed.error.flatten() });
      }

      const [newCategory] = await db.insert(categories).values(parsed.data).returning();
      return res.status(201).json(newCategory);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}