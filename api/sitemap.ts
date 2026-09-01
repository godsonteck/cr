import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { categories, products } from '../src/db/schema';

const BASE_URL = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://cosmeticse.vercel.app');

function toDateString(date: Date | null | undefined) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [allProducts, allCategories] = await Promise.all([
      db.select({ id: products.id, updatedAt: products.updatedAt }).from(products).where(eq(products.isPublished, true)),
      db.select({ id: categories.id, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.isActive, true)),
    ]);

    const staticRoutes = [
      { url: '/', lastmod: toDateString(new Date()), changefreq: 'daily', priority: 1.0 },
      { url: '/beauty', lastmod: toDateString(new Date()), changefreq: 'daily', priority: 0.9 },
      { url: '/groceries', lastmod: toDateString(new Date()), changefreq: 'daily', priority: 0.9 },
      { url: '/shop', lastmod: toDateString(new Date()), changefreq: 'daily', priority: 0.8 },
      { url: '/search', lastmod: toDateString(new Date()), changefreq: 'weekly', priority: 0.7 },
      { url: '/routine-builder', lastmod: toDateString(new Date()), changefreq: 'weekly', priority: 0.6 },
      { url: '/cart', lastmod: toDateString(new Date()), changefreq: 'hourly', priority: 0.5 },
      { url: '/about', lastmod: toDateString(new Date()), changefreq: 'monthly', priority: 0.4 },
      { url: '/contact', lastmod: toDateString(new Date()), changefreq: 'monthly', priority: 0.4 },
      { url: '/offers', lastmod: toDateString(new Date()), changefreq: 'daily', priority: 0.7 },
      { url: '/signin', lastmod: toDateString(new Date()), changefreq: 'yearly', priority: 0.3 },
      { url: '/signup', lastmod: toDateString(new Date()), changefreq: 'yearly', priority: 0.3 },
    ];

    const productRoutes = allProducts.map((product) => ({
      url: `/product/${product.id}`,
      lastmod: toDateString(product.updatedAt),
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryRoutes = allCategories.map((category) => ({
      url: `/category/${category.id}`,
      lastmod: toDateString(category.updatedAt),
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

    const allRoutes = [...staticRoutes, ...productRoutes, ...categoryRoutes];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((route) => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
