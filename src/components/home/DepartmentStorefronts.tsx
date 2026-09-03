import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
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

  const activeFlashDeal = flashDeals
    .filter(deal => deal.isActive && new Date(deal.expiresAt).getTime() > Date.now())
    .slice(0, 1)[0];

  const reservedProductIds = new Set<string>();
  const reserveProducts = (candidates: typeof publishedProducts, limit = 8) => {
    const selected = [] as typeof publishedProducts;
    for (const product of candidates) {
      if (reservedProductIds.has(product.id)) continue;
      reservedProductIds.add(product.id);
      selected.push(product);
      if (selected.length === limit) break;
    }
    return selected;
  };

  const flashDealProducts = activeFlashDeal?.productIds?.length
    ? reserveProducts(activeFlashDeal.productIds.map(id => publishedProducts.find(product => product.id === id)).filter((product): product is typeof publishedProducts[number] => Boolean(product)).map(product => ({
        ...product,
        originalPrice: product.price,
        price: Math.max(0.01, product.price * (1 - activeFlashDeal.discountPercentage / 100)),
        discountBadge: `-${activeFlashDeal.discountPercentage}%`,
        badge: 'Sale' as const,
      })) as typeof publishedProducts, 8)
    : [];

  const hotDeals = homepageSections.hotDeals
    ? reserveProducts(publishedProducts.filter(p => p.badge === 'Sale' || (p.originalPrice && p.originalPrice > p.price)))
    : [];
  const newArrivals = homepageSections.newArrivals
    ? reserveProducts(publishedProducts.filter(p => p.badge === 'New In'))
    : [];
  const beautyProducts = homepageSections.beauty
    ? reserveProducts(publishedProducts.filter(p => p.department === 'beauty'))
    : [];
  const groceryEssentials = homepageSections.groceryFeed
    ? reserveProducts(publishedProducts.filter(product => product.department === 'groceries'))
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Announcement Banner */}
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div 
          className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3"
          style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}
        >
          {storeSettings.announcementText}
        </div>
      )}

      {/* Category pills - sticky scrollable bar */}
      {homepageSections.categories && categoryPills.length > 0 && (
        <div className="sticky top-[4.25rem] z-20 mx-auto max-w-[1500px] overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-main)]/95 px-3 py-2 backdrop-blur sm:top-[4.7rem] sm:px-4">
          <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryPills.map((item, index) => (
              <Link
                key={item.id}
                to={`/category/${item.slug}`}
                className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                    'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]'
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
        {homepageSections.flashDeal && activeFlashDeal && (
          <section key={activeFlashDeal.id} className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--accent)]/35 border-l-4 border-l-[var(--accent)] bg-[var(--bg-card-alt)] p-3 text-[var(--text-primary)] sm:p-4">
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{activeFlashDeal.badgeText || 'Flash Sale'}</p>
                <h2 className="truncate text-sm font-bold text-[var(--text-primary)] sm:text-base">{activeFlashDeal.title}</h2>
              </div>
            </div>
            <Link to="/offers" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]">
              -{activeFlashDeal.discountPercentage}% <ArrowRight className="h-3 w-3" />
            </Link>
          </section>
        )}

        {/* Compact Hero */}
        {homepageSections.hero && (
          <section className="rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(135deg,#fff6f8_0%,#fffaf8_100%)] p-5 sm:p-8 dark:bg-[var(--bg-card-alt)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">CR Cosmetics &amp; Essentials</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-[var(--text-primary)] sm:text-4xl">
                  {storeSettings.heroHeadline || 'Beauty, care, and everyday essentials.'}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{storeSettings.heroSubtitle || 'Thoughtfully chosen beauty products and practical essentials, delivered with care.'}</p>
                <Link to="/shop" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]">
                  {storeSettings.heroButtonText || 'Shop all products'} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {homepageSections.flashDeal && flashDealProducts.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{activeFlashDeal?.title || 'Flash deal picks'}</h3></div>
              <Link to="/offers" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">Shop deal <ArrowRight className="inline h-3 w-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {flashDealProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Shop by department">
          <Link to="/beauty" className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Department 01</p>
            <h2 className="mt-2 text-xl font-black text-[var(--text-primary)]">Beauty &amp; skincare</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Daily care, cosmetics, fragrances, and tools.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Shop beauty <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/groceries" className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Department 02</p>
            <h2 className="mt-2 text-xl font-black text-[var(--text-primary)]">Groceries &amp; essentials</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Pantry staples, household care, and daily needs.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Shop essentials <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </section>

        {/* Hot Deals / Flash Sales Section */}
        {homepageSections.hotDeals && hotDeals.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Today's Hot Deals</h3>
              </div>
              <Link to="/offers" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {hotDeals.map((product) => (
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
              <Link to="/groceries" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {groceryEssentials.map((product) => (
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
  const { products, storeSettings } = useStore();
  const beautyProducts = products.filter(p => p.isPublished !== false && p.department === 'beauty');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Announcement Banner */}
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div 
          className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3"
          style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}
        >
          {storeSettings.announcementText}
        </div>
      )}

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
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const { products, storeSettings } = useStore();
  const groceryProducts = products.filter(p => p.isPublished !== false && p.department === 'groceries');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Announcement Banner */}
      {storeSettings.announcementVisible && storeSettings.announcementText && (
        <div 
          className="w-full px-3 py-2 text-center text-xs font-semibold text-white sm:px-4 sm:py-3"
          style={{ backgroundColor: storeSettings.announcementBg || '#B27A52' }}
        >
          {storeSettings.announcementText}
        </div>
      )}

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
          to="/groceries"
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
    </div>
  );
};
