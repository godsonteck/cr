import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
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

      <main className="mx-auto max-w-[1500px] space-y-4 px-3 pb-12 sm:space-y-5 sm:px-4">
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
          <section className={`rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(135deg,var(--bg-card),var(--bg-card-alt))] p-5 shadow-[var(--shadow-soft)] sm:p-8 ${storeSettings.heroImage ? 'grid gap-5 md:grid-cols-[1fr_minmax(260px,38%)] md:items-center' : ''}`}>
            <div className="order-2 flex items-center justify-between gap-4 md:order-1">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">CR Cosmetics and Essential</p>
                <h1 className="mt-2 max-w-[17ch] text-[1.9rem] font-black leading-[1.05] text-[var(--text-primary)] sm:text-4xl">
                  {storeSettings.heroHeadline || 'Beauty, care, and everyday essentials.'}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{storeSettings.heroSubtitle || 'Thoughtfully chosen beauty products and practical essentials, delivered with care.'}</p>
                <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-strong)]">
                  {storeSettings.heroButtonText || 'Shop all products'} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            {storeSettings.heroImage && (
              <div className="order-1 overflow-hidden rounded-xl border border-[var(--border-color)] bg-white/60 dark:bg-black/10 md:order-2">
                <img src={storeSettings.heroImage} srcSet={getResponsiveImageSet(storeSettings.heroImage)} sizes="(max-width: 767px) 100vw, 38vw" alt="" width="800" height="600" fetchPriority="high" decoding="async" className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            )}
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

