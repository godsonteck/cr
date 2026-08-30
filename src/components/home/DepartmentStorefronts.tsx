import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBasket,
  ArrowRight
} from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

export const HomePage: React.FC = () => {
  const { products, categories, storeSettings } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const allProducts = publishedProducts.slice(0, 18);
  const activeCategories = categories.filter(cat => cat.isActive);
  const categoryPills = activeCategories.slice(0, 8);
  const topCategories = activeCategories.slice(0, 4);
  const bestSellers = [...publishedProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  const groceryEssentials = publishedProducts
    .filter(product => product.department === 'groceries')
    .slice(0, 6);
  const heroProduct = bestSellers[0] || publishedProducts[0];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-[1400px] px-3 pb-2 pt-3 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-[820px] lg:ml-auto">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
              <span className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">Search</span>
              <span className="ml-2 flex-1 border-l border-[var(--border-color)] pl-2 text-xs text-[var(--text-subtle)] sm:pl-3 sm:text-sm">beauty, groceries, skincare...</span>
              <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white sm:h-9 sm:w-9">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex sm:gap-3">
            <button className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)] sm:px-4 sm:text-[11px]">
              Orders
            </button>
            <button className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)] sm:px-4 sm:text-[11px]">
              Support
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:px-4 sm:text-[11px]">
              <ShoppingBasket className="h-4 w-4" />
              Cart
            </button>
          </div>
        </div>
      </div>

      {categoryPills.length > 0 && (
        <div className="mx-auto max-w-[1400px] px-3 pb-2 sm:px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryPills.map((item, index) => (
              <Link
                key={item.id}
                to={`/category/${item.slug}`}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors sm:px-4 sm:py-2 sm:text-xs ${
                  index === 0
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-md'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] space-y-8 px-3 pb-16 sm:space-y-10 sm:px-4">
        <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border-color)] bg-[#f3e6df] p-4 shadow-sm dark:bg-[#34292b] sm:p-6 lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] dark:bg-[#1d1a19]/80">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]"></span>
              {storeSettings.heroBadge || '100% AUTHENTIC'}
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl font-serif text-3xl leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                {storeSettings.heroHeadline || 'Beauty. Care. Essentials.'}
              </h1>
              <p className="max-w-2xl text-sm text-[var(--text-muted)] sm:text-base">
                {storeSettings.heroSubtitle || 'Curated beauty, wellness, and everyday essentials chosen for simple, confident routines.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-105">
                {storeSettings.heroButtonText || 'Shop now'}
              </Link>
              <Link to="/beauty" className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Explore beauty
              </Link>
            </div>
          </div>
        </section>

        {topCategories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop intentionally</p>
                <h3 className="mt-1 font-serif text-2xl tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">Top categories</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="overflow-hidden rounded-[1rem] bg-[var(--bg-soft)]">
                    <img src={category.image} alt={category.name} className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.04]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{category.department}</p>
                      <h4 className="mt-1 text-sm font-bold text-[var(--text-primary)]">{category.name}</h4>
                    </div>
                    <span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Shop</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop by need</p>
              <h3 className="mt-1 text-lg font-black uppercase tracking-[-0.04em] text-[var(--text-primary)] sm:text-xl">Featured picks</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--accent)] hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {allProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Customer favorites</p>
              <h3 className="mt-1 text-lg font-black uppercase tracking-[-0.04em] text-[var(--text-primary)] sm:text-xl">Best sellers</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--accent)] hover:underline">See all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Home essentials</p>
              <h3 className="mt-1 text-lg font-black uppercase tracking-[-0.04em] text-[var(--text-primary)] sm:text-xl">Groceries & daily care</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--accent)] hover:underline">Shop pantry →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {groceryEssentials.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export const BeautyDepartmentPage: React.FC = () => {
  const { products } = useStore();
  const beautyProducts = products.filter(p => p.isPublished !== false && p.department === 'beauty');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="bg-[#1C1817] text-white p-8 rounded border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D51]">Department 01</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase">Beauty &amp; Skincare</h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics.
          </p>
        </div>
        <Link
          to="/routine-builder"
          className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#b05c42] transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Routine Builder</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {beautyProducts.map(p => (
          <ProductCard key={p.id} product={p} mode="beauty" />
        ))}
      </div>
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const { products } = useStore();
  const groceryProducts = products.filter(p => p.isPublished !== false && p.department === 'groceries');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="bg-[#4A5D4E] text-white p-8 rounded border border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Department 02</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase">Groceries &amp; Everyday Essentials</h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl">
            Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household products.
          </p>
        </div>
        <Link
          to="/shop?category=groceries"
          className="px-5 py-2.5 bg-[#1C1817] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
        >
          <span>Shop Pantry</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groceryProducts.map(p => (
          <ProductCard key={p.id} product={p} mode="grocery" />
        ))}
      </div>
    </div>
  );
};
