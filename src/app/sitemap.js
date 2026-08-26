import { getAllProducts } from '@/services/productService';

export default async function sitemap() {
  const baseUrl = 'https://crcosmetics.gh';

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
  const products = getAllProducts();
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/shop/${p.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
