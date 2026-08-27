import { getAllProducts } from '@/services/productService';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://cr-cosmetics.vercel.app';

  // Base static routes
  const staticRoutes = [
    '',
    '/shop',
    '/shop?category=skincare',
    '/shop?category=groceries',
    '/about',
    '/contact',
    '/delivery',
    '/returns',
    '/privacy',
    '/terms',
    '/faqs',
    '/cart',
    '/checkout',
    '/signin',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/shop' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/shop' ? 0.9 : 0.7,
  }));

  // Dynamic product routes
  let products = [];
  try {
    products = (await getAllProducts()) || [];
  } catch (e) {
    console.warn('[sitemap] Error fetching products for sitemap:', e?.message);
    products = [];
  }

  const productRoutes = Array.isArray(products)
    ? products.map((p) => ({
        url: `${baseUrl}/shop/${p.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    : [];

  return [...staticRoutes, ...productRoutes];
}
