import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

interface BestSellersSectionProps {
  onOpenDetails: (product: Product) => void;
  onViewAllProducts: () => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  onOpenDetails,
  onViewAllProducts
}) => {
  const { products } = useStore();
  
  // Best sellers: items tagged as best seller or the first 6 items
  const bestSellers = products.filter(p => p.isBestSeller).length >= 6
    ? products.filter(p => p.isBestSeller).slice(0, 6)
    : products.slice(0, 6);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF6F4] dark:bg-[#14151B] border-t border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading with Decorative Diamond Line */}
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-[0.2em] uppercase font-sans">
            BEST SELLERS
          </h2>

          <div className="flex items-center justify-center gap-3 text-rose-200 dark:text-rose-900/60">
            <div className="h-px w-16 bg-rose-200 dark:bg-rose-900/60" />
            <div className="w-2 h-2 rotate-45 border border-[#8A3D52] bg-[#8A3D52]" />
            <div className="h-px w-16 bg-rose-200 dark:bg-rose-900/60" />
          </div>
        </div>

        {/* 6-Column Grid (responsive 2 / 3 / 6 cols) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {bestSellers.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
