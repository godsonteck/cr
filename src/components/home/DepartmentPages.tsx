import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

export const BeautyDepartmentPage: React.FC = () => {
  const { products, storeSettings } = useStore();
  const beautyProducts = products.filter(p => p.isPublished !== false && p.department === 'beauty');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div
          className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3"
          style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}
        >
          {storeSettings.announcementText}
        </div>
      )}

      <div className="mx-auto max-w-[1400px] space-y-8 px-3 py-8 font-sans sm:px-4">
        <div
          className="relative flex min-h-[15rem] flex-col items-start justify-end gap-6 overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#1C1817] bg-cover bg-center p-6 text-white shadow-sm sm:min-h-[19rem] sm:p-10 md:flex-row md:items-end md:justify-between"
          style={{ backgroundImage: `url(${storeSettings.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl">Beauty &amp; Skincare</h1>
            <p className="text-xs text-stone-300 sm:text-sm">
              Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics.
            </p>
          </div>
          <Link
            to="/routine-builder"
            className="relative z-10 flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2385ad] shadow-lg transition-colors hover:bg-[#C86D51] hover:text-white"
          >
            <Sparkles className="h-4 w-4" />
            <span>Routine Builder</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {beautyProducts.map(product => (
            <ProductCard key={product.id} product={product} mode="beauty" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const { products, storeSettings } = useStore();
  const groceryProducts = products.filter(p => p.isPublished !== false && p.department === 'groceries');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div
          className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3"
          style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}
        >
          {storeSettings.announcementText}
        </div>
      )}

      <div className="mx-auto max-w-[1400px] space-y-8 px-3 py-8 font-sans sm:px-4">
        <div
          className="relative flex min-h-[15rem] flex-col items-start justify-end gap-6 overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#4A5D4E] bg-cover bg-center p-6 text-white shadow-sm sm:min-h-[19rem] sm:p-10 md:flex-row md:items-end md:justify-between"
          style={{ backgroundImage: `url(${storeSettings.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl">Groceries &amp; Everyday Essentials</h1>
            <p className="text-xs text-stone-200 sm:text-sm">
              Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household products.
            </p>
          </div>
          <Link
            to="/groceries"
            className="relative z-10 shrink-0 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2385ad] shadow-lg transition-colors hover:bg-[#1C1817] hover:text-white"
          >
            <span>Shop Pantry</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {groceryProducts.map(product => (
            <ProductCard key={product.id} product={product} mode="grocery" />
          ))}
        </div>
      </div>
    </div>
  );
};
