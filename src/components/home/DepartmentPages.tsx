import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { CatalogControls, CatalogEmptyState } from '../shop/CatalogControls';
import { useStore } from '../../context/StoreContext';
import { filterCatalogProducts, readCatalogFilters } from '../../lib/catalog';
import { storefrontListings } from '../../lib/storefrontListings';
import type { DepartmentType } from '../../types';

interface DepartmentCatalogProps {
  department: DepartmentType;
  title: string;
  description: string;
  heroClassName: string;
  action: React.ReactNode;
}

function DepartmentCatalog({ department, title, description, heroClassName, action }: DepartmentCatalogProps) {
  const { products, categories, storeSettings, loading } = useStore();
  const [searchParams] = useSearchParams();
  const publishedProducts = useMemo(() => storefrontListings(products), [products]);
  const filters = useMemo(() => readCatalogFilters(searchParams, { department }), [searchParams, department]);
  const filteredProducts = useMemo(() => (
    filterCatalogProducts(publishedProducts, filters, categories)
  ), [publishedProducts, filters, categories]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3" style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}>
          {storeSettings.announcementText}
        </div>
      )}

      <div className="mx-auto max-w-[1400px] space-y-8 px-3 py-8 font-sans sm:px-4">
        <div className={`relative flex min-h-[15rem] flex-col items-start justify-end gap-6 overflow-hidden rounded-[1.75rem] border border-white/20 bg-cover bg-center p-6 text-white shadow-sm sm:min-h-[19rem] sm:p-10 md:flex-row md:items-end md:justify-between ${heroClassName}`} style={{ backgroundImage: `url(${storeSettings.heroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="font-serif text-2xl font-bold sm:text-4xl">{title}</h1>
            <p className="text-xs leading-6 text-stone-200 sm:text-sm">{description}</p>
          </div>
          {action}
        </div>

        <CatalogControls
          products={publishedProducts}
          categories={categories}
          resultCount={filteredProducts.length}
          totalCount={publishedProducts.filter(product => product.department === department).length}
          loading={loading}
          fixedDepartment={department}
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3 animate-pulse">
                <div className="aspect-square rounded-2xl bg-stone-200 dark:bg-stone-800" />
                <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} mode={department === 'beauty' ? 'beauty' : 'grocery'} />)}
          </div>
        ) : (
          <CatalogEmptyState />
        )}
      </div>
    </div>
  );
}

export const BeautyDepartmentPage: React.FC = () => (
  <DepartmentCatalog
    department="beauty"
    title="Beauty & Skincare"
    description="Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics."
    heroClassName="bg-[#1C1817]"
    action={(
      <Link to="/routine-builder" className="relative z-10 flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2385ad] shadow-lg transition-colors hover:bg-[#C86D51] hover:text-white">
        <Sparkles className="h-4 w-4" />
        <span>Routine Builder</span>
      </Link>
    )}
  />
);

export const GroceryDepartmentPage: React.FC = () => (
  <DepartmentCatalog
    department="groceries"
    title="Groceries & Everyday Essentials"
    description="Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household products."
    heroClassName="bg-[#4A5D4E]"
    action={(
      <Link to="/shop?dept=groceries" className="relative z-10 flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2385ad] shadow-lg transition-colors hover:bg-[#1C1817] hover:text-white">
        <span>Shop Pantry</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  />
);
