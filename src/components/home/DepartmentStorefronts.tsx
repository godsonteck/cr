import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, Star, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

const getResponsiveImageSet = (image: string) => {
  if (!image.includes('images.unsplash.com')) return undefined;
  return [600, 900, 1200]
    .map(width => {
      const url = new URL(image);
      url.searchParams.set('w', String(width));
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
};

export const HomePage: React.FC = () => {
  const { products, categories, storeSettings, flashDeals } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const [catalogSort, setCatalogSort] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [catalogDepartment, setCatalogDepartment] = useState<'all' | 'beauty' | 'groceries'>('all');
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

  const fullCollection = useMemo(() => {
    const collection = publishedProducts
      .filter(product => catalogDepartment === 'all' || product.department === catalogDepartment)
      .map((product, index) => ({ product, index }));

    return collection.sort((a, b) => {
      if (catalogSort === 'price-low') return a.product.price - b.product.price;
      if (catalogSort === 'price-high') return b.product.price - a.product.price;
      if (catalogSort === 'rating') return b.product.rating - a.product.rating;
      if (catalogSort === 'newest') return b.index - a.index;
      return a.index - b.index;
    }).map(item => item.product);
  }, [publishedProducts, catalogDepartment, catalogSort]);
  const displayedCollection = fullCollection.slice(0, 12);

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
        <div className="sticky top-[4.25rem] z-20 mx-auto max-w-[1500px] overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-main)]/95 px-3 py-2.5 backdrop-blur sm:top-[4.7rem] sm:px-4">
          <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
            {categoryPills.map((item) => (
              <Link
                key={item.id}
                to={`/category/${item.slug}`}
                className="whitespace-nowrap rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)] transition-all hover:border-[#FD384F] hover:text-[#FD384F] hover:bg-red-50/50 dark:hover:bg-red-950/20 shadow-xs"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1500px] space-y-5 px-3 pb-12 sm:space-y-6 sm:px-4">
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

        {/* Rich AliExpress/Jumia-Style Hero */}
        {homepageSections.hero && (
          <div className="space-y-4 pt-1">
            <section className="relative overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-gradient-to-br from-white via-[#FFF8F5] to-[#FDF1EC] dark:from-[#181315] dark:via-[#1e1719] dark:to-[#140f11] p-6 sm:p-10 shadow-[0_10px_35px_-10px_rgba(253,56,79,0.08)]">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                
                {/* Left Content */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FD384F] dark:bg-red-950/40">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Official Store • Express Delivery Ghana</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.15]">
                    {storeSettings.heroHeadline || 'Your Beauty. Your Essentials. Your Glow.'}
                  </h1>

                  <p className="max-w-xl text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                    {storeSettings.heroSubtitle || 'Discover verified authentic skincare, luxury fragrances, makeup, and daily essentials with fast door-to-door delivery.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-full bg-[#FD384F] hover:bg-[#E02940] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{storeSettings.heroButtonText || 'Shop All Products'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/offers"
                      className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-red-400 text-stone-800 dark:text-stone-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:text-[#FD384F]"
                    >
                      <Flame className="w-4 h-4 text-[#FD384F]" />
                      <span>Today's SuperDeals</span>
                    </Link>
                  </div>

                  {/* Trust Micro-Bullets */}
                  <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-medium text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Same-day delivery in Accra
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      MTN & Telecel MoMo Accepted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FD384F]" />
                      100% Authentic Guaranteed
                    </span>
                  </div>
                </div>

                {/* Right Visual / Product Showcase */}
                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm rounded-3xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-900/90 p-4 shadow-xl transition-all">
                    {/* Top Floating Badge */}
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#FD384F] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Flame className="w-3 h-3" />
                      <span>Featured Pick</span>
                    </div>

                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-800/50 flex items-center justify-center p-2">
                      <img
                        src={storeSettings.heroImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'}
                        alt={storeSettings.heroHeadline || 'CR Cosmetics Featured'}
                        className="h-full w-full object-contain rounded-xl transition-transform duration-300 hover:scale-105"
                      />
                    </div>

                    {/* Bottom Micro Showcase Details */}
                    <div className="mt-3 flex items-center justify-between px-1">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#FD384F]">Top Selling Essential</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">4.9 (120+ reviews)</span>
                        </div>
                      </div>
                      <Link
                        to="/shop"
                        className="rounded-full bg-stone-100 hover:bg-red-50 text-stone-800 hover:text-[#FD384F] dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 px-3 py-1.5 text-xs font-bold transition"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
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
          <Link to="/beauty" className="group rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(135deg,var(--bg-card),var(--bg-soft))] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]">
            <h2 className="mt-2 text-xl font-black text-[var(--text-primary)]">Beauty &amp; skincare</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Daily care, cosmetics, fragrances, and tools.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Shop beauty <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/groceries" className="group rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(135deg,var(--bg-card),var(--bg-soft))] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]">
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

        <section className="space-y-3 border-t border-[var(--border-color)] pt-6" aria-label="All products">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <select aria-label="Filter collection by department" value={catalogDepartment} onChange={event => setCatalogDepartment(event.target.value as typeof catalogDepartment)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                <option value="all">All departments</option>
                <option value="beauty">Beauty</option>
                <option value="groceries">Groceries</option>
              </select>
              <select aria-label="Sort collection" value={catalogSort} onChange={event => setCatalogSort(event.target.value as typeof catalogSort)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                <option value="featured">Featured</option>
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-[var(--text-subtle)]">Showing {displayedCollection.length} of {fullCollection.length} products</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {displayedCollection.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
          {fullCollection.length > displayedCollection.length && (
            <Link to="/shop" className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-soft)]">
              Browse all products <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          )}
        </section>

      </main>
    </div>
  );
};

