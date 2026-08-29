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
  const allProducts = products.slice(0, 20);
  const categoryPills = categories.slice(0, 8);

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

      <main className="mx-auto max-w-[1400px] space-y-3 px-3 pb-16 sm:space-y-4 sm:px-4">
        {/* MEGA FLASH DEAL BANNER */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--violet)] to-[var(--olive)] p-4 text-white shadow-lg sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm">⚡ MEGA FLASH DEAL</div>
              <h2 className="mt-2 text-2xl font-black leading-none sm:text-4xl">UP TO 70% OFF</h2>
              <p className="mt-2 max-w-xs text-xs font-semibold sm:text-sm">Limited time only • Deals reset hourly</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-lg font-black sm:text-2xl">3</div>
                <div className="text-[10px] font-bold uppercase sm:text-xs">Hours</div>
              </div>
              <div className="h-8 w-px bg-white/40"></div>
              <div className="text-center">
                <div className="text-lg font-black sm:text-2xl">24</div>
                <div className="text-[10px] font-bold uppercase sm:text-xs">Min</div>
              </div>
              <div className="h-8 w-px bg-white/40"></div>
              <div className="text-center">
                <div className="text-lg font-black sm:text-2xl">47</div>
                <div className="text-[10px] font-bold uppercase sm:text-xs">Sec</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOT DEALS - 6 PRODUCTS */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xl font-black">🔥</div>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-primary)] sm:text-base">Hot Right Now</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--accent)] hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
            {allProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm transition-transform hover:scale-105 hover:shadow-md sm:rounded-xl">
                <div className="relative overflow-hidden bg-[var(--bg-card-alt)]">
                  <img src={product.image} alt={product.name} className="h-32 w-full object-cover transition-transform group-hover:scale-110 sm:h-40" />
                  <span className="absolute left-2 top-2 animate-pulse-badge rounded-md bg-[var(--accent)] px-1.5 py-1 text-[9px] font-black text-white sm:text-[10px]">
                    -{Math.floor(Math.random() * 50 + 10)}%
                  </span>
                </div>
                <div className="space-y-1 p-2 sm:p-2.5">
                  <div className="text-[9px] font-bold text-[var(--text-muted)] line-clamp-1 sm:text-[10px]">{product.brand}</div>
                  <h4 className="text-[10px] font-semibold leading-tight text-[var(--text-primary)] line-clamp-2 sm:text-xs">
                    {product.name}
                  </h4>
                  <div className="pt-1">
                    <div className="text-xs font-black text-[var(--text-primary)] sm:text-sm">GHS {product.price.toFixed(2)}</div>
                    {product.originalPrice && (
                      <div className="text-[9px] text-[var(--text-subtle)] line-through">GHS {product.originalPrice.toFixed(2)}</div>
                    )}
                  </div>
                  <button className="mt-1 w-full rounded-lg bg-[var(--accent)] py-1.5 text-[9px] font-bold text-white hover:bg-[var(--accent-strong)] sm:text-[10px]">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORY SPOTLIGHT */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xl font-black">💫</div>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-primary)] sm:text-base">Super Savings</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--olive)] hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
            {allProducts.slice(6, 12).map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm transition-transform hover:scale-105 hover:shadow-md sm:rounded-xl">
                <div className="relative overflow-hidden bg-[var(--bg-card-alt)]">
                  <img src={product.image} alt={product.name} className="h-32 w-full object-cover transition-transform group-hover:scale-110 sm:h-40" />
                  <span className="absolute left-2 top-2 rounded-md bg-[var(--olive)] px-1.5 py-1 text-[9px] font-black text-white sm:text-[10px]">
                    -{Math.floor(Math.random() * 40 + 5)}%
                  </span>
                  <span className="absolute right-2 top-2 rounded-md bg-[#ff6b35] px-1.5 py-1 text-[9px] font-black text-white sm:text-[10px]">
                    FREE ⚡
                  </span>
                </div>
                <div className="space-y-1 p-2 sm:p-2.5">
                  <div className="text-[9px] font-bold text-[var(--text-muted)] line-clamp-1 sm:text-[10px]">{product.brand}</div>
                  <h4 className="text-[10px] font-semibold leading-tight text-[var(--text-primary)] line-clamp-2 sm:text-xs">
                    {product.name}
                  </h4>
                  <div className="pt-1">
                    <div className="text-xs font-black text-[var(--text-primary)] sm:text-sm">GHS {product.price.toFixed(2)}</div>
                    {product.originalPrice && (
                      <div className="text-[9px] text-[var(--text-subtle)] line-through">GHS {product.originalPrice.toFixed(2)}</div>
                    )}
                  </div>
                  <button className="mt-1 w-full rounded-lg bg-[var(--olive)] py-1.5 text-[9px] font-bold text-white hover:bg-[var(--olive-strong)] sm:text-[10px]">
                    Grab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BEST SELLERS */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xl font-black">⭐</div>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--text-primary)] sm:text-base">Best Sellers</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[var(--text-primary)] hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
            {allProducts.slice(12, 18).map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm transition-transform hover:scale-105 hover:shadow-md sm:rounded-xl">
                <div className="relative overflow-hidden bg-[var(--bg-card-alt)]">
                  <img src={product.image} alt={product.name} className="h-32 w-full object-cover transition-transform group-hover:scale-110 sm:h-40" />
                  <span className="absolute right-2 top-2 rounded-md bg-[var(--violet)] px-1.5 py-1 text-[9px] font-black text-white sm:text-[10px]">
                    TOP ⬆️
                  </span>
                </div>
                <div className="space-y-1 p-2 sm:p-2.5">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-[#f4b23d] sm:text-[10px]">
                    <span>★</span>
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <h4 className="text-[10px] font-semibold leading-tight text-[var(--text-primary)] line-clamp-2 sm:text-xs">
                    {product.name}
                  </h4>
                  <div className="pt-1">
                    <div className="text-xs font-black text-[var(--text-primary)] sm:text-sm">GHS {product.price.toFixed(2)}</div>
                  </div>
                  <button className="mt-1 w-full rounded-lg bg-[var(--text-primary)] py-1.5 text-[9px] font-bold text-[var(--bg-card)] hover:opacity-90 sm:text-[10px]">
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export const BeautyDepartmentPage: React.FC = () => {
  const { products } = useStore();
  const beautyProducts = products.filter(p => p.department === 'beauty');

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
  const groceryProducts = products.filter(p => p.department === 'groceries');

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
