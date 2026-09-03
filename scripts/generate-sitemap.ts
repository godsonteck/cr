import { db } from '../src/db';
import { products, categories } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://cosmeticse.vercel.app');

async function generateSitemap() {
  console.log('🗺️ Generating sitemap...');

  try {
    const [allProducts, allCategories] = await Promise.all([
      db.select({ id: products.id, updatedAt: products.updatedAt }).from(products).where(eq(products.isPublished, true)),
      db.select({ id: categories.id, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.isActive, true)),
    ]);

    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/beauty', changefreq: 'daily', priority: 0.9 },
      { url: '/groceries', changefreq: 'daily', priority: 0.9 },
      { url: '/shop', changefreq: 'daily', priority: 0.8 },
      { url: '/routine-builder', changefreq: 'weekly', priority: 0.6 },
      { url: '/about', changefreq: 'monthly', priority: 0.4 },
      { url: '/contact', changefreq: 'monthly', priority: 0.4 },
      { url: '/support', changefreq: 'monthly', priority: 0.4 },
      { url: '/offers', changefreq: 'daily', priority: 0.7 },
    ];

    const productRoutes = allProducts.map(p => ({
      url: `/product/${p.id}`,
      lastmod: p.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryRoutes = allCategories.map(c => ({
      url: `/category/${c.id}`,
      lastmod: c.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

    const allRoutes = [...staticRoutes, ...productRoutes, ...categoryRoutes];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    console.log(`✅ Sitemap generated at ${outputPath}`);
    console.log(`📊 Total URLs: ${allRoutes.length} (${staticRoutes.length} static, ${productRoutes.length} products, ${categoryRoutes.length} categories)`);
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    throw error;
  }
}

generateSitemap()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));