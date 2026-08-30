import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo.jpeg';

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
  const { storeSettings } = useStore();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const desktopLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/beauty', label: 'Beauty' },
    { to: '/groceries', label: 'Groceries' },
    { to: '/about', label: 'About' }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[rgba(251,248,245,0.92)] backdrop-blur-xl transition-colors dark:bg-[rgba(25,20,21,0.92)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.7rem] items-center justify-between gap-4">

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-soft)] rounded md:hidden dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-card-alt)]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 shadow-sm">
              <img src={logoImg} alt="CR Cosmetics & Essentials" className="h-8 w-auto object-contain sm:h-9" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-[-0.06em] text-[var(--text-primary)] sm:text-xl">
                {storeSettings.storeName.split(' ')[0] || 'CR'} <span className="text-[var(--accent)]">{storeSettings.storeName.split(' ').slice(1).join(' ') || 'COSMETICS'}</span>
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                &amp; ESSENTIALS
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            {desktopLinks.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? 'text-[var(--text-primary)] dark:text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-xs md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-card-alt)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)]"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-card-alt)]"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#d9b26d]" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenWishlist}
              className="relative rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-card-alt)]"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#bb6d54] text-[9px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--bg-card)] transition-colors hover:opacity-90 dark:bg-[var(--accent)] dark:text-[#1a140d] dark:hover:brightness-110"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{totalItems}</span>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/55" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-full w-4/5 max-w-sm bg-white p-6 dark:bg-[#141211]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-4 dark:border-[#2A2725]">
              <span className="text-base font-bold uppercase">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-[#E8E2DA] bg-[#F5F2EC] py-2.5 pl-9 pr-4 text-xs dark:border-[#2A2725] dark:bg-[#1C1A19]"
              />
            </form>

            <div className="mt-6 space-y-2 text-sm">
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-stone-700 dark:text-stone-200">Shop</Link>
              <Link to="/beauty" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-stone-700 dark:text-stone-200">Beauty</Link>
              <Link to="/groceries" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-stone-700 dark:text-stone-200">Groceries</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-stone-700 dark:text-stone-200">About</Link>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to={isAuthenticated ? "/account" : "/signin"} onClick={() => setIsMobileMenuOpen(false)} className="flex-1 rounded-full border border-[#E8E2DA] px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] dark:border-[#2A2725]">
                {isAuthenticated ? 'Account' : 'Sign in'}
              </Link>
              <button onClick={onOpenCart} className="flex-1 rounded-full bg-[#1f1a18] px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-white">
                Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
