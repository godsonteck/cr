import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, MessageCircle } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

export const HomePage: React.FC = () => {
  const { products, categories, storeSettings, flashDeals } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const activeCategories = categories.filter(cat => cat.isActive);
  const categoryPills = activeCategories.slice(0, 10);
  const homepageSections = storeSettings.homepageSections || {
    flashDeal: true,
    hero: true,
    categories: true,
    bestSellers: true,
    groceryFeed: true,
  };

  const bestSellers = [...publishedProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  const newArrivals = publishedProducts
    .filter(p => p.badge === 'New In')
    .slice(0, 12);

  const hotDeals = publishedProducts
    .filter(p => p.badge === 'Sale' || (p.originalPrice && p.originalPrice > p.price))
    .slice(0, 12);

  const beautyProducts = publishedProducts.filter(p => p.department === 'beauty').slice(0, 12);
  
  const groceryEssentials = publishedProducts
    .filter(product => product.department === 'groceries')
    .slice(0, 12);

  const recommendedForYou = publishedProducts.slice(0, 12);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Category pills - sticky scrollable bar */}
      {homepageSections.categories && categoryPills.length > 0 && (
        <div className="sticky top-0 z-20 mx-auto max-w-[1500px] overflow-hidden border-b border-[var(--border-color)] bg-white dark:bg-[var(--bg-card)] px-3 py-2 sm:px-4">
          <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryPills.map((item, index) => (
              <Link
                key={item.id}
                to={`/category/${item.slug}`}
                className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                  index === 0
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-color)] bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-soft)]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1500px] space-y-3 px-3 pb-12 sm:px-4 sm:space-y-4">
        {/* Flash Deal Banner */}
        {homepageSections.flashDeal && flashDeals.filter(deal => deal.isActive && new Date(deal.expiresAt).getTime() > Date.now()).slice(0, 1).map(deal => (
          <section key={deal.id} className="mt-3 flex items-center justify-between gap-3 rounded-lg border-l-4 border-[var(--accent)] bg-[#1d1519] p-3 text-white sm:p-4">
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{deal.badgeText || 'Flash Sale'}</p>
                <h2 className="truncate text-sm font-bold text-white sm:text-base">{deal.title}</h2>
              </div>
            </div>
            <Link to="/offers" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]">
              -{deal.discountPercentage}% <ArrowRight className="h-3 w-3" />
            </Link>
          </section>
        ))}

        {/* Compact Hero */}
        {homepageSections.hero && (
          <section className="rounded-lg border border-[var(--border-color)] bg-[linear-gradient(135deg,#fff6f8_0%,#fffaf8_100%)] dark:bg-[var(--bg-card-alt)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-[var(--text-primary)] sm:text-xl line-clamp-2">
                  {storeSettings.heroHeadline || 'Beauty, care and everyday essentials'}
                </h1>
                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-1">
                  {storeSettings.heroSubtitle || 'Free delivery in Accra on orders over GHS 100'}
                </p>
                <Link to="/shop" className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]">
                  {storeSettings.heroButtonText || 'Shop now'} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Hot Deals / Flash Sales Section */}
        {homepageSections.hotDeals && hotDeals.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Today's Hot Deals</h3>
              </div>
              <Link to="/shop" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hotDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers Section */}
        {homepageSections.bestSellers && bestSellers.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Best Sellers</h3>
              <Link to="/shop" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals Section */}
        {homepageSections.newArrivals && newArrivals.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">New In</h3>
              <Link to="/shop" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Beauty Section */}
        {homepageSections.beauty && beautyProducts.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Beauty & Skincare</h3>
              <Link to="/beauty" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {beautyProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Groceries & Essentials Section */}
        {homepageSections.groceryFeed && groceryEssentials.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Groceries & Essentials</h3>
              <Link to="/shop?category=groceries" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {groceryEssentials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended For You Section */}
        {homepageSections.recommendedForYou && recommendedForYou.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Recommended for You</h3>
              <Link to="/shop" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {recommendedForYou.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export const BeautyDepartmentPage: React.FC = () => {
  const { products } = useStore();
  const beautyProducts = products.filter(p => p.isPublished !== false && p.department === 'beauty');

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-8 space-y-8 font-sans">
      <div className="bg-[#1C1817] text-white p-6 sm:p-10 rounded-[1.75rem] border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D51]">Department 01</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Beauty &amp; Skincare</h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics.
          </p>
        </div>
        <Link
          to="/routine-builder"
          className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#b05c42] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Routine Builder</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-8 space-y-8 font-sans">
      <div className="bg-[#4A5D4E] text-white p-6 sm:p-10 rounded-[1.75rem] border border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Department 02</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Groceries &amp; Everyday Essentials</h1>
          <p className="text-xs sm:text-sm text-stone-200">
            Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household products.
          </p>
        </div>
        <Link
          to="/shop?category=groceries"
          className="px-5 py-2.5 bg-[#1C1817] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shrink-0 shadow-xs"
        >
          <span>Shop Pantry</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {groceryProducts.map(p => (
          <ProductCard key={p.id} product={p} mode="grocery" />
        ))}
      </div>
    </div>
  );
};
