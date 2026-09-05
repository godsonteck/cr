import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  MessageCircle,
  UserRound,
  ChevronDown,
  Camera,
  Sparkles,
  Zap,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo.jpeg';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import { BRANDS_LIST, CATEGORIES_CONFIG } from '../../data/products';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenWishlist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { storeSettings, categories, brands } = useStore();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState('skincare');
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const activeCategories = categories.length ? categories.filter(c => c.isActive) : CATEGORIES_CONFIG;

  const pageVisibility = storeSettings.pageVisibility || {
    home: true,
    beauty: true,
    groceries: true,
    shop: true,
    products: true,
    search: true,
    account: true,
    checkout: true,
    about: true,
    support: true,
    contact: true,
    offers: true,
  };

  const topNavLinks = [
    pageVisibility.offers !== false ? { to: '/offers', label: storeSettings.navOffersLabel || 'SuperDeals', isHot: true } : null,
    pageVisibility.shop !== false ? { to: '/shop', label: storeSettings.navShopLabel || 'Shop All' } : null,
    pageVisibility.beauty !== false ? { to: '/beauty', label: storeSettings.navBeautyLabel || 'Beauty & Skincare' } : null,
    pageVisibility.groceries !== false ? { to: '/groceries', label: storeSettings.navGroceriesLabel || 'Groceries & Essentials' } : null,
    pageVisibility.about !== false ? { to: '/about', label: storeSettings.navAboutLabel || 'About Us' } : null,
    pageVisibility.choice === true ? { to: '/shop?choice=true', label: 'Choice', isChoice: true } : null,
    pageVisibility.routineBuilder === true ? { to: '/routine-builder', label: 'Routine Builder' } : null,
  ].filter(Boolean) as { to: string; label: string; isHot?: boolean; isChoice?: boolean }[];

  const brandSource = brands && brands.length > 0 ? brands : BRANDS_LIST;
  const featuredBrands = brandSource.filter(b => b !== 'All Brands').slice(0, 10);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMegaMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setSearchInput('');
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const currentCategoryData = activeCategories.find(c => c.slug === activeCategorySlug) || activeCategories[0];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.9)] backdrop-blur-sm transition-colors dark:border-[var(--border-color)] dark:bg-[rgba(18,16,15,0.82)]">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-soft)] md:hidden"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="shrink-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5">
                <img
                  src={storeSettings.storeLogo || logoImg}
                  alt={storeSettings.storeName}
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = logoImg; }}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-sans text-sm sm:text-base font-black tracking-[-0.05em] text-[var(--text-primary)]">
                  {storeSettings.storeName}
                </span>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="mx-2 hidden min-w-0 flex-1 items-center md:flex md:max-w-md lg:max-w-xl">
            <div className="relative flex w-full items-center overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--text-subtle)]" />
              <input
                type="text"
                placeholder="Search products"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full bg-transparent py-2.5 pl-11 pr-12 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] sm:text-sm"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] transition hover:bg-[var(--accent)]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--accent)] md:hidden"
              aria-label={isMobileSearchOpen ? 'Close search' : 'Search'}
              aria-expanded={isMobileSearchOpen}
            >
              {isMobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--bg-soft)]"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenWishlist}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--bg-soft)]"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--bg-soft)]"
              aria-label={`Cart ${totalItems > 0 ? `(${totalItems} items)` : ''}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <Link
              to={isAuthenticated ? '/account' : '/signin'}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--bg-soft)] px-2.5 py-1.5 text-[var(--text-primary)] transition hover:bg-[var(--accent-soft)]"
            >
              <UserRound className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {isAuthenticated ? (user?.fullName?.split(' ')[0] || 'Account') : 'Sign In'}
              </span>
            </Link>
          </div>
        </div>

        {isMobileSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="pb-3 md:hidden">
            <div className="flex min-h-10 w-full items-center overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] shadow-[var(--shadow-soft)] transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
              <Search className="ml-3 h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" />
              <input
                autoFocus
                type="search"
                placeholder="Search products"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] sm:text-sm"
              />
              <button type="submit" aria-label="Submit search" className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] transition hover:bg-[var(--accent)]">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Tier 2: Category Navigation Bar & Mega Menu Toggle */}
      <div
        className="site-secondary-nav hidden md:block border-t border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900 relative"
        style={{ display: storeSettings.homepageSections?.categories === false ? 'none' : undefined }}
      >
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 flex items-center gap-4">
          
          {/* "All Categories ☰" Button (triggers AliExpress Mega Menu) */}
          <div className="relative">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] font-bold text-[10px] uppercase tracking-[0.18em]"
            >
              <Menu className="h-4 w-4" />
              <span>{storeSettings.navAllCategoriesLabel || 'All categories'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Quick Navigation Links */}
          <nav className="flex items-center gap-1 lg:gap-3 py-1 overflow-x-auto no-scrollbar">
            {topNavLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap rounded-md ${
                    link.isHot
                      ? 'text-[var(--accent-strong)] hover:bg-[var(--accent-soft)] font-black'
                      : link.isChoice
                      ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : isActive
                      ? 'text-[var(--accent-strong)] font-black'
                      : 'text-stone-700 hover:text-[var(--accent-strong)] dark:text-stone-300'
                  }`}
                >
                  {link.isHot && <Flame className="h-3.5 w-3.5 fill-[#FD384F] text-[#FD384F]" />}
                  {link.isChoice && <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AliExpress Mega Menu Drawer (Screenshot 3 Style) */}
        {isMegaMenuOpen && (
          <div
            ref={megaMenuRef}
            className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="mx-auto max-w-[1440px] px-3 sm:px-6 py-5">
              <div className="grid grid-cols-12 gap-6">
                
                {/* Left: Category Sidebar */}
                <div className="col-span-3 border-r border-gray-200 dark:border-slate-800 pr-4 space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 px-3 pb-2">
                    Browse Categories
                  </p>
                  {activeCategories.map((cat) => {
                    const isSelected = activeCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setIsMegaMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition text-left ${
                          isSelected
                            ? 'bg-red-50 text-[#FD384F] font-bold dark:bg-red-950/40'
                            : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FD384F]" />
                          {cat.name}
                        </span>
                        <ChevronDown className="h-3 w-3 -rotate-90 text-stone-400" />
                      </button>
                    );
                  })}
                </div>

                {/* Center / Right: Recommended Subcategories & Shop by Brand */}
                <div className="col-span-9 space-y-5">
                  {/* Category Title & Description */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {currentCategoryData.name}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {currentCategoryData.description}
                      </p>
                    </div>
                    <Link
                      to={`/category/${currentCategoryData.slug}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="text-xs font-bold text-[#FD384F] hover:underline flex items-center gap-1"
                    >
                      View All in {currentCategoryData.name} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Recommended Visual Cards */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">
                      Recommended Subcategories
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {activeCategories.slice(0, 4).map((c) => (
                        <Link
                          key={c.id}
                          to={`/category/${c.slug}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="group flex flex-col items-center rounded-xl border border-gray-100 bg-stone-50/60 p-3 hover:border-[#FD384F] hover:bg-white hover:shadow-md transition text-center dark:border-slate-800 dark:bg-slate-800/50"
                        >
                          <img
                            src={c.image}
                            alt={c.name}
                            className="h-16 w-16 rounded-lg object-cover mb-2 group-hover:scale-105 transition"
                          />
                          <span className="text-xs font-bold text-stone-800 group-hover:text-[#FD384F] dark:text-stone-200">
                            {c.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Shop By Brand (as seen in AliExpress screenshot 3) */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">
                      Shop By Brand
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {featuredBrands.map((brand) => (
                        <Link
                          key={brand}
                          to={`/shop?brand=${encodeURIComponent(brand)}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 hover:border-[#FD384F] hover:text-[#FD384F] hover:shadow-xs transition dark:border-slate-700 dark:bg-slate-800 dark:text-stone-200"
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] isolate" role="dialog" aria-modal="true" aria-label="Mobile navigation" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-xs" />
          <div className="relative z-[110] flex h-full w-[min(86vw,22rem)] flex-col overflow-y-auto bg-white p-5 shadow-2xl animate-menu-in dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <img 
                  src={storeSettings.storeLogo || logoImg} 
                  alt={storeSettings.storeName}
                  className="h-8 w-8 rounded-lg object-contain" 
                  onError={(e) => { (e.target as HTMLImageElement).src = logoImg; }}
                />
                <span className="font-bold text-lg text-stone-900 dark:text-white">{storeSettings.storeName}</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1 text-sm">
              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-bold text-[#FD384F] bg-red-50 dark:bg-red-950/40">
                <Flame className="h-4 w-4 fill-[#FD384F]" /> {storeSettings.navOffersLabel || 'SuperDeals'}
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-slate-800">
                {storeSettings.navShopLabel || 'Shop All Products'}
              </Link>
              <Link to="/beauty" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-slate-800">
                {storeSettings.navBeautyLabel || 'Beauty & Skincare'}
              </Link>
              <Link to="/groceries" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-slate-800">
                {storeSettings.navGroceriesLabel || 'Groceries & Essentials'}
              </Link>
              {pageVisibility.choice === true && (
                <Link to="/shop?choice=true" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  <Zap className="h-4 w-4 fill-amber-500 text-amber-500" /> Choice Collection
                </Link>
              )}
              {pageVisibility.routineBuilder === true && (
                <Link to="/routine-builder" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-slate-800">
                  <Sparkles className="h-4 w-4 text-purple-600" /> Skincare Routine Builder
                </Link>
              )}
            </nav>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-slate-800">
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">Categories</p>
              <div className="space-y-1">
                {activeCategories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-800"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link to={isAuthenticated ? "/account" : "/signin"} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-center text-xs font-bold text-stone-800 dark:text-stone-200">
                {isAuthenticated ? 'Account' : 'Sign in'}
              </Link>
              <button onClick={() => { setIsMobileMenuOpen(false); onOpenWishlist(); }} className="rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                Saved ({wishlistIds.length})
              </button>
            </div>

            <a
              href={getWhatsAppUrl(storeSettings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with us on WhatsApp</span>
            </a>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
