// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS — Homepage (Server Component)
// ═══════════════════════════════════════════════════════════

import Link from 'next/link';
import { getAllProducts, getFeaturedProducts } from '@/services/productService';
import ProductCard from '@/components/product/ProductCard';
import HomeClient from './HomeClient';

async function getHomepageData() {
  const [allProducts, featuredProducts] = await Promise.all([
    getAllProducts(),
    getFeaturedProducts(8),
  ]);
  return { allProducts, featuredProducts };
}

export default async function HomePage() {
  const { allProducts, featuredProducts } = await getHomepageData();

  return (
    <>
      <HomeClient
        allProducts={allProducts}
        featuredProducts={featuredProducts}
      />
    </>
  );
}