import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
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
  const { products, storeSettings, flashDeals } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const [catalogSort, setCatalogSort] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [catalogDepartment, setCatalogDepartment] = useState<'all' | 'beauty' | 'groceries'>('all');
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

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-14 sm:space-y-12 sm:px-6">
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

        {/* Editorial storefront introduction */}
        {homepageSections.hero && (
          <section
            className="editorial-hero relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/20 bg-cover bg-center shadow-[0_24px_60px_rgba(32,19,17,0.12)] sm:min-h-[32rem]"
            style={{
              backgroundImage: `url(${storeSettings.heroImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200'})`,
              backgroundPosition: 'center',
            }}
            aria-label="Store hero"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
            <div className="relative flex max-w-xl flex-col justify-end px-5 py-8 text-white sm:px-10 sm:py-14 lg:px-14">
              <h1 className="max-w-[9ch] font-display text-2xl leading-[1] sm:text-4xl lg:text-5xl">
                {storeSettings.heroHeadline || 'Beauty essentials for a better you.'}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/85 sm:text-[0.95rem]">
                {storeSettings.heroSubtitle || 'Skincare, fragrance, and everyday essentials chosen for a cleaner, easier routine.'}
              </p>
              <Link to="/shop" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-white/80 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                {storeSettings.heroButtonText || 'Shop now'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {homepageSections.flashDeal && flashDealProducts.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{activeFlashDeal?.title || storeSettings.homepageFlashDealLabel || 'Flash deal picks'}</h3></div>
              <Link to="/offers" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">Shop deal <ArrowRight className="inline h-3 w-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {flashDealProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        {/* Hot Deals / Flash Sales Section */}
        {homepageSections.hotDeals && hotDeals.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{storeSettings.homepageHotDealsTitle || 'Hot deals'}</h3>
              </div>
              <Link to="/offers" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{storeSettings.homepageNewArrivalsTitle || 'New arrivals'}</h3>
              <Link to="/shop" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{storeSettings.homepageBeautyTitle || 'Beauty'}</h3>
              <Link to="/beauty" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">{storeSettings.homepageGroceryTitle || 'Essentials'}</h3>
              <Link to="/groceries" className="text-[10px] font-bold text-[var(--accent-strong)] hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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

