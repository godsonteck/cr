import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { brands, categories } from '../src/db/schema.js';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth.js';

const categoryEnum = ['all', 'skincare', 'makeup', 'fragrances', 'body-care', 'beauty-tools', 'rice-grains', 'cooking-oils', 'seasoning-spices', 'beverages', 'snacks-sweets', 'household-care', 'daily-essentials', 'new-arrivals', 'best-sellers', 'offers'] as const;
const brandCreateSchema = z.object({ name: z.string().min(1).max(100), isActive: z.boolean().default(true) });
const brandUpdateSchema = z.object({ name: z.string().min(1).max(100).optional(), isActive: z.boolean().optional() }).partial();
const categoryCreateSchema = z.object({
  id: z.enum(categoryEnum), slug: z.string().min(1).max(100), name: z.string().min(1).max(100),
  department: z.enum(['beauty', 'groceries']), image: z.string().url(), description: z.string().min(1),
  isActive: z.boolean().default(true), sortOrder: z.number().int().default(0),
});
const categoryUpdateSchema = z.object({
  id: z.enum(categoryEnum).optional(),
  slug: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  department: z.enum(['beauty', 'groceries']).optional(),
  image: z.string().url().optional(),
  description: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).partial();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = req.query.resource === 'categories' ? 'categories' : 'brands';
  const { method, query, body } = req;
  try {
    if (method === 'GET') {
      if (resource === 'brands') {
        const { id, active } = query;
        if (id && typeof id === 'string') {
          const [brand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
          return brand ? res.status(200).json(brand) : res.status(404).json({ error: 'Brand not found' });
        }
        const results = active !== undefined
          ? await db.select().from(brands).where(eq(brands.isActive, active === 'true')).orderBy(asc(brands.name))
          : await db.select().from(brands).orderBy(asc(brands.name));
        return res.status(200).json(results);
      }
      const { id, department, active } = query;
      if (id && typeof id === 'string') {
        const [category] = await db.select().from(categories).where(eq(categories.id, id as any)).limit(1);
        return category ? res.status(200).json(category) : res.status(404).json({ error: 'Category not found' });
      }
      const conditions = [];
      if (department) conditions.push(eq(categories.department, department as any));
      if (active !== undefined) conditions.push(eq(categories.isActive, active === 'true'));
      const results = conditions.length > 0
        ? await db.select().from(categories).where(and(...conditions)).orderBy(asc(categories.sortOrder))
        : await db.select().from(categories).orderBy(asc(categories.sortOrder));
      return res.status(200).json(results);
    }

    const auth = await requireAdmin(req, res);
    if (!auth) return;

    if (method === 'POST') {
      if (resource === 'brands') {
        const parsed = brandCreateSchema.safeParse(body);
        if (!parsed.success) return res.status(400).json({ error: 'Invalid brand data', details: parsed.error.flatten() });
        const [newBrand] = await db.insert(brands).values(parsed.data).returning();
        return res.status(201).json(newBrand);
      }

      const parsed = categoryCreateSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid category data', details: parsed.error.flatten() });
      const [newCategory] = await db.insert(categories).values(parsed.data).returning();
      return res.status(201).json(newCategory);
    }

    if (method === 'PATCH') {
      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Category or brand ID is required' });
      }

      const parsed = resource === 'brands'
        ? brandUpdateSchema.safeParse(body)
        : categoryUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid update data', details: parsed.error.flatten() });
      }

      const table = resource === 'brands' ? brands : categories;
      const [updated] = await db.update(table).set({
        ...parsed.data,
        updatedAt: new Date(),
      } as any).where(eq(table.id as any, id as any)).returning();

      if (!updated) {
        return res.status(404).json({ error: `${resource === 'brands' ? 'Brand' : 'Category'} not found` });
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Category or brand ID is required' });
      }

      const table = resource === 'brands' ? brands : categories;
      const [deleted] = await db.delete(table).where(eq(table.id as any, id as any)).returning({ id: table.id });
      if (!deleted) {
        return res.status(404).json({ error: `${resource === 'brands' ? 'Brand' : 'Category'} not found` });
      }
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`${resource} API error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
