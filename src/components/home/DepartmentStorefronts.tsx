import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MessageCircle, 
  Star, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const HomePage: React.FC = () => {
  const { products, categories, storeSettings } = useStore();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const publishedProducts = products.filter(product => product.isPublished !== false);
  const activeCategories = categories.filter(cat => cat.isActive);
  const categoryPills = activeCategories.slice(0, 10);
  const topCategories = activeCategories.slice(0, 4);

  const bestSellers = [...publishedProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const beautyProducts = publishedProducts
    .filter(product => product.department === 'beauty')
    .slice(0, 6);

  const groceryProducts = publishedProducts
    .filter(product => product.department === 'groceries')
    .slice(0, 6);

  const flashDeals = publishedProducts
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 6);

  const heroProduct = bestSellers[0] || publishedProducts[0];

  const handleHeroAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (heroProduct) {
      addToCart(heroProduct, 1);
      showToast(`Added ${heroProduct.name} to cart`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      
      {/* 1. QUICK CATEGORY STRIP (TOUCH-FRIENDLY & CLEAN) */}
      {categoryPills.length > 0 && (
        <nav aria-label="Quick Category Filter" className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/70 backdrop-blur-md sticky top-[4.7rem] z-30">
          <div className="mx-auto max-w-[1400px] px-3 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap pl-1 hidden sm:inline-block">
                Browse:
              </span>
              {categoryPills.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/category/${item.slug}`}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200 shrink-0 ${
                    index === 0
                      ? 'bg-[var(--text-primary)] text-[var(--bg-card)] shadow-xs font-bold'
                      : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/shop"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold text-[var(--accent)] hover:underline shrink-0 flex items-center gap-1"
              >
                <span>All Catalog</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-[1400px] px-3 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-14">
        
        {/* 2. EDITORIAL HERO SECTION */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-gradient-to-br from-[#FAF5EE] via-[#F6EFE6] to-[#EFE4D6] dark:from-[#231C1E] dark:via-[#1D1718] dark:to-[#171213] p-6 sm:p-10 lg:p-14 shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/80 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>{storeSettings.heroBadge || '100% ORIGINAL & AUTHENTIC DIRECT IMPORT'}</span>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)]">
                  {storeSettings.heroHeadline || 'Your Beauty. Your Essentials. Your Glow.'}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
                  {storeSettings.heroSubtitle || 'Discover authentic dermatological skincare, signature fragrances, and trusted household groceries delivered across Accra.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/beauty"
                  className="rounded-full bg-[var(--text-primary)] hover:bg-[var(--accent)] text-[var(--bg-card)] px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Shop Beauty &amp; Skincare</span>
                </Link>

                <Link
                  to="/groceries"
                  className="rounded-full border border-[var(--border-color)] bg-white dark:bg-[#251E20] hover:border-[var(--text-primary)] text-[var(--text-primary)] px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Groceries &amp; Pantry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[var(--border-color)]/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] text-[var(--text-muted)] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Same-Day Dispatch in Accra</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9/5 Rating (850+ Accra Customers)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>100% Genuine Guarantee</span>
                </div>
              </div>

            </div>

            {/* Right: Featured Showcase Card */}
            {heroProduct && (
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-sm rounded-3xl border border-[var(--border-color)] bg-white dark:bg-[#231C1E] p-4 sm:p-5 shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                  
                  {/* Floating Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Top Seller This Week</span>
                    </span>
                  </div>

                  <Link to={`/product/${heroProduct.id}`} className="block relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-square mb-4">
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {heroProduct.brand}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[var(--text-primary)] line-clamp-1">
                      {heroProduct.name}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                      <div>
                        <span className="text-lg font-extrabold text-[var(--text-primary)]">
                          GHS {heroProduct.price.toFixed(2)}
                        </span>
                        {heroProduct.originalPrice && (
                          <span className="text-xs text-[var(--text-muted)] line-through ml-2">
                            GHS {heroProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleHeroAddToCart}
                        className="rounded-full bg-[var(--accent)] hover:brightness-110 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </section>

        {/* 3. 4-PILLAR VALUE PROPOSITION BANNER */}
        <section aria-label="Why Shop With CR" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-left shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Same-Day Accra Delivery</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Fast rider dispatch across East Legon, Osu, Spintex, Airport, Tema, and greater Accra.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-left shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">100% Genuine Formulas</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Authentic batches sourced directly from certified US, UK, and Korean laboratories.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-left shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Mobile Money &amp; Cash</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Pay seamlessly with MTN MoMo, Telecel Cash, Card, or Cash on Delivery.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-left shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">WhatsApp Support</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Instant assistance and product consultations via our official line: 0592153306.
            </p>
          </div>
        </section>

        {/* 4. THE TWO WORLDS OF CR (DUAL DEPARTMENT SHOWCASE) */}
        <section aria-label="Department Showcase" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Curated Departments</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Explore Our Two Worlds</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* World 1: Beauty & Cosmetics */}
            <div className="group relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[#20191B] to-[#120E0F] text-[#FAF6F0] p-6 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[300px] shadow-lg">
              <div className="space-y-3 z-10 max-w-md">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Department 01
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Beauty, Skincare &amp; Fragrances
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Targeted dermatological serums, luxury body lotions, original perfumes, and everyday cosmetics.
                </p>
              </div>

              <div className="pt-6 z-10">
                <Link
                  to="/beauty"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF6F0] text-[#1E1719] hover:bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Explore Beauty Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Decorative accent */}
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* World 2: Groceries & Essentials */}
            <div className="group relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[#2D3A30] to-[#172019] text-[#FAF6F0] p-6 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[300px] shadow-lg">
              <div className="space-y-3 z-10 max-w-md">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Department 02
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Groceries &amp; Household Essentials
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Quality Jasmine rice, pure cooking oils, daily provisions, seasoning spices, and household hygiene.
                </p>
              </div>

              <div className="pt-6 z-10">
                <Link
                  to="/groceries"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF6F0] text-[#1E1719] hover:bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Explore Pantry Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Decorative accent */}
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

          </div>
        </section>

        {/* 5. FLASH DEALS / SPECIAL OFFERS (IF ANY EXIST) */}
        {flashDeals.length > 0 && (
          <section aria-label="Flash Deals" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Special Promotional Deals</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Limited quantity offers in Accra while stock lasts</p>
                </div>
              </div>
              <Link to="/shop" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {flashDeals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 6. BESTSELLERS & CUSTOMER FAVORITES */}
        <section aria-label="Bestsellers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Most Loved in Accra</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Customer Bestsellers</h3>
            </div>
            <Link to="/shop" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
              <span>See all</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 7. VISUAL CATEGORY DIRECTORY */}
        {topCategories.length > 0 && (
          <section aria-label="Categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Quick Navigation</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Shop by Category</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {topCategories.map(category => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md text-left"
                >
                  <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] mb-3">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {category.department}
                      </span>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">
                        {category.name}
                      </h4>
                    </div>
                    <span className="rounded-full bg-[var(--bg-soft)] group-hover:bg-[var(--accent)] group-hover:text-white p-1.5 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 8. BEAUTY & DERMATOLOGY SHOWCASE */}
        {beautyProducts.length > 0 && (
          <section aria-label="Beauty Section" className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-7 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Department 01</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Skincare &amp; Cosmetics Picks</h3>
              </div>
              <Link to="/beauty" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
                <span>View beauty catalog</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {beautyProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 9. GROCERY & PANTRY SHOWCASE */}
        {groceryProducts.length > 0 && (
          <section aria-label="Groceries Section" className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-7 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Department 02</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Pantry &amp; Household Essentials</h3>
              </div>
              <Link to="/groceries" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
                <span>View groceries catalog</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {groceryProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 10. ACCRA SHOPPER ASSURANCE & WHATSAPP BANNER */}
        <section aria-label="Customer Assurance" className="rounded-3xl border border-[var(--border-color)] bg-[#1E1719] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8B792]">Direct Accra Service</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">Have questions before ordering?</h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Chat directly with our team on WhatsApp for skin consultations, bulk grocery orders, or delivery confirmations.
            </p>
          </div>

          <a
            href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (0592153306)</span>
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] py-8 font-sans">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 space-y-8">
        
        {/* Luxury Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1C1817] via-[#2A2022] to-[#1C1817] text-white p-8 sm:p-12 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D51]">Department 01</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Beauty, Skincare &amp; Cosmetics</h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Targeted dermatological formulas, hydration serums, luxury fragrances, and professional cosmetics verified for authenticity.
            </p>
          </div>
          <Link
            to="/routine-builder"
            className="px-6 py-3 bg-[#C86D51] hover:bg-[#b05c42] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Routine Builder</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">All Beauty Items ({beautyProducts.length})</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {beautyProducts.map(p => (
              <ProductCard key={p.id} product={p} mode="beauty" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export const GroceryDepartmentPage: React.FC = () => {
  const { products } = useStore();
  const groceryProducts = products.filter(p => p.isPublished !== false && p.department === 'groceries');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] py-8 font-sans">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 space-y-8">
        
        {/* Botanical Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D3A30] via-[#3B4D3F] to-[#2D3A30] text-white p-8 sm:p-12 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Department 02</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Groceries &amp; Daily Essentials</h1>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Premium Jasmine rice, pure vegetable oils, evaporated milk, seasonings, and trusted daily household provisions.
            </p>
          </div>
          <Link
            to="/shop?category=groceries"
            className="px-6 py-3 bg-[#1C1817] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <span>Shop Pantry Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">All Grocery &amp; Essential Items ({groceryProducts.length})</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {groceryProducts.map(p => (
              <ProductCard key={p.id} product={p} mode="grocery" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
