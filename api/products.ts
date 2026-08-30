import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db';
import { products } from '../src/db/schema';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { z } from 'zod';

const categoryEnum = [
  'all', 'skincare', 'makeup', 'fragrances', 'body-care', 'beauty-tools',
  'rice-grains', 'cooking-oils', 'seasoning-spices', 'beverages',
  'snacks-sweets', 'household-care', 'daily-essentials', 'new-arrivals',
  'best-sellers', 'offers'
] as const;

const productQuerySchema = z.object({
  category: z.enum(categoryEnum).optional(),
  department: z.enum(['beauty', 'groceries']).optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  published: z.coerce.boolean().optional().default(true),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular']).optional().default('newest'),
});

const productCreateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  brand: z.string().min(1).max(100),
  department: z.enum(['beauty', 'groceries']),
  category: z.enum(categoryEnum),
  categoryLabel: z.string().min(1).max(100),
  price: z.string(),
  originalPrice: z.string().optional(),
  discountBadge: z.string().max(20).optional(),
  unit: z.string().min(1).max(100),
  image: z.string().url(),
  images: z.array(z.string().url()).min(1),
  description: z.string().min(1),
  highlights: z.array(z.string()).min(1),
  badge: z.string().max(50).optional(),
  inStock: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  stockCount: z.number().int().min(0).default(0),
  rating: z.string().default('5.0'),
  reviewCount: z.number().int().min(0).default(0),
  origin: z.string().max(100).optional(),
  routineStep: z.enum(['cleanse', 'treat', 'hydrate', 'protect']).optional(),
  skinType: z.array(z.string()).default([]),
  skinConcern: z.array(z.string()).default([]),
  packSize: z.string().max(50).optional(),
  storageInfo: z.string().optional(),
  shelfLife: z.string().max(50).optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    originalPrice: z.number().optional(),
    inStock: z.boolean(),
  })).default([]),
  details: z.object({
    howToUse: z.string().optional(),
    ingredients: z.string().optional(),
    benefits: z.string().optional(),
    nutritionalInfo: z.string().optional(),
  }).optional(),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  brand: z.string().min(1).max(100).optional(),
  department: z.enum(['beauty', 'groceries']).optional(),
  category: z.enum(categoryEnum).optional(),
  categoryLabel: z.string().min(1).max(100).optional(),
  price: z.string().optional(),
  originalPrice: z.string().optional().nullable(),
  discountBadge: z.string().max(20).optional().nullable(),
  unit: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).min(1).optional(),
  description: z.string().min(1).optional(),
  highlights: z.array(z.string()).min(1).optional(),
  badge: z.string().max(50).optional().nullable(),
  inStock: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  stockCount: z.number().int().min(0).optional(),
  rating: z.string().optional(),
  reviewCount: z.number().int().min(0).optional(),
  origin: z.string().max(100).optional().nullable(),
  routineStep: z.enum(['cleanse', 'treat', 'hydrate', 'protect']).optional().nullable(),
  skinType: z.array(z.string()).default([]).optional(),
  skinConcern: z.array(z.string()).default([]).optional(),
  packSize: z.string().max(50).optional().nullable(),
  storageInfo: z.string().optional().nullable(),
  shelfLife: z.string().max(50).optional().nullable(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    originalPrice: z.number().optional(),
    inStock: z.boolean(),
  })).default([]).optional(),
  details: z.object({
    howToUse: z.string().optional(),
    ingredients: z.string().optional(),
    benefits: z.string().optional(),
    nutritionalInfo: z.string().optional(),
  }).optional().nullable(),
}).partial();

function applySort(query: any, sort: string) {
  switch (sort) {
    case 'price-asc':
      return query.orderBy(asc(products.price));
    case 'price-desc':
      return query.orderBy(desc(products.price));
    case 'rating':
      return query.orderBy(desc(products.rating));
    case 'popular':
      return query.orderBy(desc(products.reviewCount));
    case 'newest':
    default:
      return query.orderBy(desc(products.createdAt));
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    if (method === 'GET') {
      if (query.id && typeof query.id === 'string') {
        const [product] = await db.select().from(products).where(eq(products.id, query.id)).limit(1);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json(product);
      }

      const parsed = productQuerySchema.safeParse(query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
      }

      const { category, department, brand, search, published, featured, limit, offset, sort } = parsed.data;

      const conditions = [];

      if (published !== undefined) {
        conditions.push(eq(products.isPublished, published));
      }
      if (category) {
        conditions.push(eq(products.category, category as any));
      }
      if (department) {
        conditions.push(eq(products.department, department));
      }
      if (brand) {
        conditions.push(eq(products.brand, brand));
      }
      if (search) {
        conditions.push(or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.brand, `%${search}%`)
        ));
      }
      if (featured) {
        conditions.push(or(
          eq(products.badge, 'Bestseller'),
          eq(products.badge, 'New In'),
          eq(products.badge, 'CR Exclusive')
        ));
      }

      const baseQuery = db.select().from(products);
      const whereQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
      const sortedQuery = applySort(whereQuery, sort);
      const paginatedQuery = sortedQuery.limit(limit).offset(offset);

      const results = await paginatedQuery;

      const totalQuery = conditions.length > 0
        ? db.select({ count: sql<number>`count(*)` }).from(products).where(and(...conditions))
        : db.select({ count: sql<number>`count(*)` }).from(products);
      const totalResult = await totalQuery;
      const total = totalResult[0]?.count ?? 0;

      return res.status(200).json({
        products: results,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      });
    }

    if (method === 'POST') {
      const parsed = productCreateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
      }

      const productData = {
        ...parsed.data,
        id: parsed.data.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };

      const [newProduct] = await db.insert(products).values(productData).returning();
      return res.status(201).json(newProduct);
    }

    if (method === 'PATCH') {
      const parsed = productUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
      }

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const updateData = { ...parsed.data, updatedAt: new Date() };

      const [updated] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}