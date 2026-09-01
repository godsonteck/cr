import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, MessageCircle } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';

export const HomePage: React.FC = () => {
  const { products, categories, storeSettings, flashDeals } = useStore();
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      
      {/* Category Pills Navigation */}
      {categoryPills.length > 0 && (
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryPills.map((item, index) => (
              <Link
                key={item.id}
                to={`/category/${item.slug}`}
                className={`whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors sm:px-4 sm:py-2 ${
                  index === 0
                    ? 'border-[#8A3D52] bg-[#8A3D52] text-white shadow-xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[#8A3D52] hover:bg-[var(--bg-soft)]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="mx-auto max-w-[1400px] space-y-8 sm:space-y-10 px-3 sm:px-4 pb-16">

        {flashDeals.filter(deal => deal.isActive && new Date(deal.expiresAt).getTime() > Date.now()).slice(0, 1).map(deal => (
          <section key={deal.id} className="flex flex-col gap-4 rounded-[1.5rem] bg-[#1E1719] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#C86D51] p-2.5"><Flame className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8B792]">{deal.badgeText || 'Limited time offer'}</p>
                <h2 className="mt-1 font-serif text-xl font-bold sm:text-2xl">{deal.title}</h2>
                <p className="mt-1 text-xs text-stone-300">{deal.description || deal.subtitle}</p>
              </div>
            </div>
            <Link to="/offers" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1E1719] transition hover:bg-[#F2E3D7]">
              Save {deal.discountPercentage}% <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        ))}
        
        {/* Hero Banner */}
        <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border-color)] bg-[#f3e6df] dark:bg-[#34292b] p-6 sm:p-8 lg:p-12 shadow-sm">
          <div className="space-y-5 max-w-4xl">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/70 dark:bg-[#1d1a19]/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#8A3D52]"></span>
              <span>{storeSettings.heroBadge || '100% ORIGINAL & AUTHENTIC'}</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-tight text-[var(--text-primary)]">
                {storeSettings.heroHeadline || 'Your Beauty. Your Essentials. Your Glow.'}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                {storeSettings.heroSubtitle || 'Carefully selected beauty and everyday essentials chosen to help you feel your best.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                to="/shop" 
                className="rounded-full bg-[#8A3D52] hover:bg-[#722f41] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all cursor-pointer"
              >
                {storeSettings.heroButtonText || 'Shop now'}
              </Link>
              <Link 
                to="/beauty" 
                className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[#8A3D52] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-primary)] transition-all cursor-pointer"
              >
                {storeSettings.heroSecondaryButtonText || 'Explore beauty'}
              </Link>
            </div>

          </div>
        </section>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop intentionally</p>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Top categories</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md text-left"
                >
                  <div className="overflow-hidden rounded-[1rem] bg-[var(--bg-soft)] aspect-[4/3] mb-3">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" 
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{category.department}</p>
                      <h4 className="mt-0.5 text-sm font-bold text-[var(--text-primary)] line-clamp-1">{category.name}</h4>
                    </div>
                    <span className="rounded-full bg-[#8A3D52] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white shrink-0">
                      Shop
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Picks */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Shop by need</p>
              <h3 className="mt-0.5 font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Featured picks</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[#8A3D52] hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {allProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Customer favorites</p>
              <h3 className="mt-0.5 font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Best sellers</h3>
            </div>
            <Link to="/shop" className="text-[11px] font-bold text-[#8A3D52] hover:underline">
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Groceries & Essentials */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Home essentials</p>
              <h3 className="mt-0.5 font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Groceries &amp; daily care</h3>
            </div>
            <Link to="/shop?category=groceries" className="text-[11px] font-bold text-[#8A3D52] hover:underline">
              Shop pantry →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {groceryEssentials.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Direct WhatsApp Consultation Strip */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-alt)] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">Need assistance or want to order directly?</h4>
            <p className="text-xs text-[var(--text-muted)]">Chat with our customer care team on WhatsApp (0592153306) for quick delivery across Accra.</p>
          </div>
          <a
            href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </section>

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
