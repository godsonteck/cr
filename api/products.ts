import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/neon.js';
import { categories, products, reviews } from '../src/db/schema.js';
import { eq, and, or, ilike, desc, asc, sql, inArray, avg, count, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from './_auth.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
  includeUnpublished: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().min(1).max(500).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular']).optional().default('newest'),
});

/** A variation is a sellable SKU: preserve its option combination and inventory. */
const variantItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  originalPrice: z.union([z.number(), z.string()]).optional().nullable().transform(v =>
    v == null ? undefined : Number(v)
  ),
  image: z.string().optional().nullable().transform(v => v ?? undefined),
  inStock: z.boolean().default(true),
  // Each variation owns its inventory and option combination.
  stockCount: z.union([z.number(), z.string()]).optional().nullable().transform(v =>
    v == null ? 0 : Number(v)
  ),
  options: z.record(z.string()).optional().nullable(),
});

/** Transform details sub-fields: null → undefined to match DB jsonb type */
const detailsSchema = z.object({
  howToUse: z.string().optional().nullable().transform(v => v ?? undefined),
  ingredients: z.string().optional().nullable().transform(v => v ?? undefined),
  benefits: z.string().optional().nullable().transform(v => v ?? undefined),
  nutritionalInfo: z.string().optional().nullable().transform(v => v ?? undefined),
}).optional().nullable();

const productCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  brand: z.string().min(1).max(100),
  department: z.enum(['beauty', 'groceries']),
  category: z.string().min(1),
  categoryLabel: z.string().min(1).max(100),
  price: z.union([z.string(), z.number()]).transform(v => String(v)),
  deliveryPrice: z.union([z.string(), z.number()]).optional().nullable().transform(v =>
    v == null ? null : String(Number(v))
  ),
  originalPrice: z.union([z.string(), z.number()]).optional().nullable().transform(v =>
    v == null ? null : String(v)
  ),
  discountBadge: z.string().max(20).optional().nullable(),
  unit: z.string().min(1).max(100),
  image: z.string().min(1).max(2_100_000),
  images: z.array(z.string().min(1).max(2_100_000)).min(1),
  description: z.string().min(1),
  highlights: z.array(z.string()).default([]),
  badge: z.string().max(50).optional().nullable(),
  inStock: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  stockCount: z.number().int().min(0).default(0),
  options: z.array(z.object({ name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })).default([]),
  rating: z.union([z.string(), z.number()]).default('5.0').transform(v => String(v)),
  reviewCount: z.number().int().min(0).default(0),
  origin: z.string().max(100).optional().nullable(),
  routineStep: z.enum(['cleanse', 'treat', 'hydrate', 'protect']).optional().nullable(),
  skinType: z.array(z.string()).default([]),
  skinConcern: z.array(z.string()).default([]),
  packSize: z.string().max(50).optional().nullable(),
  storageInfo: z.string().optional().nullable(),
  shelfLife: z.string().max(50).optional().nullable(),
  variants: z.array(variantItemSchema).default([]),
  details: detailsSchema,
});

const productUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  brand: z.string().min(1).max(100).optional(),
  department: z.enum(['beauty', 'groceries']).optional(),
  category: z.string().min(1).optional(),
  categoryLabel: z.string().min(1).max(100).optional(),
  price: z.union([z.string(), z.number()]).optional().transform(v =>
    v == null ? undefined : String(v)
  ),
  deliveryPrice: z.union([z.string(), z.number()]).optional().nullable().transform(v =>
    v == null ? null : String(Number(v))
  ),
  originalPrice: z.union([z.string(), z.number()]).optional().nullable().transform(v =>
    v == null ? null : String(v)
  ),
  discountBadge: z.string().max(20).optional().nullable(),
  unit: z.string().min(1).max(100).optional(),
  image: z.string().min(1).optional(),
  images: z.array(z.string().min(1)).min(1).optional(),
  description: z.string().min(1).optional(),
  highlights: z.array(z.string()).optional(),
  badge: z.string().max(50).optional().nullable(),
  inStock: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  stockCount: z.coerce.number().int().min(0).optional(),
  options: z.array(z.object({ name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })).optional(),
  rating: z.union([z.string(), z.number()]).optional().transform(v =>
    v == null ? undefined : String(v)
  ),
  reviewCount: z.number().int().min(0).optional(),
  origin: z.string().max(100).optional().nullable(),
  routineStep: z.enum(['cleanse', 'treat', 'hydrate', 'protect']).optional().nullable(),
  skinType: z.array(z.string()).optional(),
  skinConcern: z.array(z.string()).optional(),
  packSize: z.string().max(50).optional().nullable(),
  storageInfo: z.string().optional().nullable(),
  shelfLife: z.string().max(50).optional().nullable(),
  variants: z.array(variantItemSchema).optional(),
  details: detailsSchema,
}).partial();

const sitemapBaseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://cosmeticse.vercel.app');
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const isStorageUrl = (value: unknown) => typeof value === 'string' && /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\//.test(value);

/** A listing is sellable when its own stock, or at least one of its variants, is available. */
function hasAvailableInventory(product: { stockCount?: number; inStock?: boolean; variants?: Array<{ stockCount?: number; inStock?: boolean }> }) {
  const variants = product.variants || [];
  return variants.length > 0
    ? variants.some(variant => Boolean(variant.inStock) && Number(variant.stockCount ?? 0) > 0)
    : Boolean(product.inStock) && Number(product.stockCount ?? 0) > 0;
}

async function uploadProductImage(dataUrl: unknown) {
  if (typeof dataUrl !== 'string') throw new Error('Image data is required.');
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error('Use a JPG, PNG, WEBP, or GIF image.');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('Image must be smaller than 10 MB.');
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  // New Supabase projects issue sb_secret keys; prefer that current server-only
  // credential, then retain service-role compatibility for older projects.
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase Storage is not configured.');
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const bucket = await fetch(`${supabaseUrl}/storage/v1/bucket/product-media`, { headers });
  const bucketDetail = bucket.ok ? '' : await bucket.text().catch(() => '');
  // Storage returns either 404 or 400/NoSuchBucket when a bucket does not yet exist.
  const bucketMissing = bucket.status === 404 || /NoSuchBucket|Bucket not found/i.test(bucketDetail);
  if (bucketMissing) {
    const created = await fetch(`${supabaseUrl}/storage/v1/bucket`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'product-media', name: 'product-media', public: true }) });
    if (!created.ok && created.status !== 409) throw new Error('Could not create the product image bucket.');
  } else if (!bucket.ok) {
    console.error('Supabase Storage bucket access failed:', bucket.status, bucketDetail.slice(0, 300));
    throw new Error('Supabase Storage access was denied. Check the server secret key.');
  }
  const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
  const path = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const uploaded = await fetch(`${supabaseUrl}/storage/v1/object/product-media/${path}`, { method: 'POST', headers: { ...headers, 'Content-Type': match[1], 'x-upsert': 'false' }, body: bytes });
  if (!uploaded.ok) throw new Error('Supabase Storage rejected the image upload.');
  return `${supabaseUrl}/storage/v1/object/public/product-media/${path}`;
}

async function attachLiveReviewStats<T extends { id: string; rating: string; reviewCount: number }>(productRows: T[]) {
  if (productRows.length === 0) return productRows;

  const stats = await db
    .select({
      productId: reviews.productId,
      averageRating: avg(reviews.rating),
      reviewCount: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.isApproved, true), inArray(reviews.productId, productRows.map(p => p.id))))
    .groupBy(reviews.productId);

  const statsByProduct = new Map(stats.map(stat => [stat.productId, stat]));
  return productRows.map(product => {
    const stat = statsByProduct.get(product.id);
    const reviewCount = Number(stat?.reviewCount ?? 0);
    const rating = reviewCount > 0 && stat?.averageRating
      ? Number(parseFloat(stat.averageRating).toFixed(1)).toFixed(1)
      : '0.0';
    return { ...product, rating, reviewCount };
  });
}

function sitemapDate(date: Date | null | undefined) {
  return (date ? new Date(date) : new Date()).toISOString().split('T')[0];
}

async function sendSitemap(res: VercelResponse) {
  const [allProducts, allCategories] = await Promise.all([
    db.select({ id: products.id, updatedAt: products.updatedAt }).from(products).where(eq(products.isPublished, true)),
    db.select({ id: categories.id, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.isActive, true)),
  ]);

  const staticRoutes = [
    ['/', 'daily', 1.0], ['/beauty', 'daily', 0.9], ['/groceries', 'daily', 0.9],
    ['/shop', 'daily', 0.8], ['/routine-builder', 'weekly', 0.6],
    ['/about', 'monthly', 0.5], ['/contact', 'monthly', 0.5], ['/support', 'monthly', 0.5],
    ['/offers', 'daily', 0.7],
  ].map(([url, changefreq, priority]) => ({ url, lastmod: sitemapDate(new Date()), changefreq, priority }));
  const productRoutes = allProducts.map(p => ({ url: `/product/${p.id}`, lastmod: sitemapDate(p.updatedAt), changefreq: 'weekly', priority: 0.8 }));
  const categoryRoutes = allCategories.map(c => ({ url: `/category/${c.id}`, lastmod: sitemapDate(c.updatedAt), changefreq: 'weekly', priority: 0.7 }));
  const routes = [...staticRoutes, ...productRoutes, ...categoryRoutes];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${sitemapBaseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.status(200).send(sitemap);
}

function applySort(query: any, sort: string) {
  switch (sort) {
    case 'price-asc':  return query.orderBy(asc(products.price));
    case 'price-desc': return query.orderBy(desc(products.price));
    case 'rating':     return query.orderBy(desc(products.rating));
    case 'popular':    return query.orderBy(desc(products.reviewCount));
    case 'newest':
    default:           return query.orderBy(desc(products.createdAt));
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (method === 'GET') {
      if (query.sitemap === '1') {
        return sendSitemap(res);
      }

      if (query.id && typeof query.id === 'string') {
        const [product] = await db
          .select()
          .from(products)
          .where(and(eq(products.id, query.id), eq(products.isPublished, true)))
          .limit(1);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const [liveProduct] = await attachLiveReviewStats([product]);
        return res.status(200).json(liveProduct);
      }

      const parsed = productQuerySchema.safeParse(query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
      }

      const { category, department, brand, search, published, featured, includeUnpublished, limit, offset, sort } = parsed.data;

      if (includeUnpublished) {
        const auth = await requireAdmin(req, res);
        if (!auth) return;
        // Admin inventory must always reflect the latest changes.
        res.setHeader('Cache-Control', 'private, no-store');
      } else {
        // The public catalog is safe to cache briefly. Product writes explicitly
        // purge this cache through its short lifetime, without making shoppers
        // download the catalog from the database on every navigation.
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      }

      // Build WHERE conditions with explicit type so push() is always valid
      const conditions: SQL<unknown>[] = [];

      if (!includeUnpublished && published !== undefined) {
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
        ) as SQL<unknown>);
      }
      if (featured) {
        conditions.push(or(
          eq(products.badge, 'Bestseller'),
          eq(products.badge, 'New In'),
          eq(products.badge, 'CR Exclusive')
        ) as SQL<unknown>);
      }

      const baseQuery = db.select().from(products);
      const whereQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
      const sortedQuery = applySort(whereQuery, sort);
      const paginatedQuery = sortedQuery.limit(limit).offset(offset);

      const results = await paginatedQuery;
      const liveResults = await attachLiveReviewStats(results);

      const totalQuery = conditions.length > 0
        ? db.select({ count: sql<number>`count(*)` }).from(products).where(and(...conditions))
        : db.select({ count: sql<number>`count(*)` }).from(products);
      const totalResult = await totalQuery;
      const total = Number(totalResult[0]?.count ?? 0);

      return res.status(200).json({
        products: liveResults,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      if (query.imageUpload === 'true') {
        return res.status(201).json({ url: await uploadProductImage(body?.image) });
      }
      if (query.migrateImages === 'true') {
        const rows = await db.select().from(products);
        const legacy = rows.filter(product => !isStorageUrl(product.image));
        // Keep this bounded so a large catalog never hits the serverless timeout.
        // The admin action can be repeated; each run continues from where it left off.
        const batch = legacy.slice(0, 8);
        let migrated = 0;
        for (const product of batch) {
          const image = await uploadProductImage(product.image);
          await db.update(products).set({ image, images: [image, ...(product.images || []).filter(isStorageUrl)], updatedAt: new Date() }).where(eq(products.id, product.id));
          migrated++;
        }
        return res.status(200).json({ migrated, remaining: Math.max(legacy.length - migrated, 0) });
      }

      const parsed = productCreateSchema.safeParse(body);
      if (!parsed.success) {
        console.error('Product validation failed:', JSON.stringify(parsed.error.flatten()));
        return res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
      }

      const { id: rawId, deliveryPrice, ...rest } = parsed.data;
      const productData = {
        ...rest,
        id: rawId || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        // deliveryPrice is already a string | null from the Zod transform
        deliveryPrice: deliveryPrice ?? null,
      };

      // A product with no available inventory must never be exposed to shoppers.
      const available = hasAvailableInventory(productData);
      const [newProduct] = await db.insert(products).values({
        ...productData,
        inStock: available,
        isPublished: available ? productData.isPublished : false,
      } as any).returning();
      return res.status(201).json(newProduct);
    }

    // ── PATCH ─────────────────────────────────────────────────────────────────
    if (method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const parsed = productUpdateSchema.safeParse(body);
      if (!parsed.success) {
        console.error('Product update validation failed:', JSON.stringify(parsed.error.flatten()));
        return res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
      }

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const { deliveryPrice, ...rest } = parsed.data;
      const updateData: Record<string, unknown> = {
        ...rest,
        // deliveryPrice is already string | null from the Zod transform;
        // only include it if the field was actually sent in the request body
        ...(deliveryPrice !== undefined ? { deliveryPrice: deliveryPrice ?? null } : {}),
        updatedAt: new Date(),
      };

      // Stock can be changed by any admin screen, so enforce the visibility rule
      // here at the source of truth rather than depending on a particular UI.
      if (rest.variants !== undefined) {
        const available = hasAvailableInventory({ variants: rest.variants });
        updateData.inStock = available;
        if (!available) updateData.isPublished = false;
      } else if (rest.stockCount !== undefined) {
        const available = Number(rest.stockCount) > 0 && rest.inStock !== false;
        updateData.inStock = available;
        if (!available) updateData.isPublished = false;
      }

      const [updated] = await db
        .update(products)
        .set(updateData as any)
        .where(eq(products.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(updated);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return;

      const { id } = query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
      if (!deleted) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json({ success: true, id: deleted.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
