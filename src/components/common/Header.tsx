import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
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
  const displayStoreName = storeSettings.storeName.replace(/\s+AND\s+/gi, ' & ');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-colors dark:border-[var(--border-color)] dark:bg-[rgba(18,16,15,0.96)]">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-14 items-center justify-between gap-1.5 sm:h-16 sm:gap-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(open => !open)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-stone-200 dark:hover:bg-stone-800 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link to="/" className="flex min-w-0 items-center gap-1.5 text-[#2385ad] sm:gap-2">
              <img
                src={storeSettings.storeLogo || logoImg}
                alt={storeSettings.storeName}
                className="h-7 w-7 shrink-0 rounded-md object-contain sm:h-8 sm:w-8"
                onError={(event) => { event.currentTarget.src = logoImg; }}
              />
              <span className="max-w-[10rem] text-[0.8rem] font-extrabold leading-[1.05] tracking-[-0.025em] sm:max-w-none sm:whitespace-nowrap sm:text-[1.15rem]">
                {displayStoreName}
              </span>
              <span className="-ml-1 text-[1.05rem] font-black leading-none text-[#f2c62c] sm:text-[1.45rem]">.</span>
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex">
            {[
              { to: '/', label: 'Home' },
              { to: '/shop', label: 'Products' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(link => {
              const isActive = location.pathname === link.to;
              return <Link key={link.to} to={link.to} className={`whitespace-nowrap px-1 py-1.5 text-[13px] font-semibold transition ${isActive ? 'text-[#2385ad]' : 'text-slate-700 hover:text-[#2385ad] dark:text-stone-300 dark:hover:text-[#66b8d8]'}`}>
                {link.label}
              </Link>;
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={toggleTheme}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#2385ad] dark:text-stone-200 dark:hover:bg-stone-800 sm:flex"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#2385ad] dark:text-stone-200 dark:hover:bg-stone-800"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <button
              onClick={onOpenWishlist}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#2385ad] dark:text-stone-200 dark:hover:bg-stone-800"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" strokeWidth={1.8} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#2385ad] dark:text-stone-200 dark:hover:bg-stone-800"
              aria-label={`Cart ${totalItems > 0 ? `(${totalItems} items)` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <Link
              to={isAuthenticated ? '/account' : '/signin'}
              className="hidden items-center gap-1.5 rounded-full bg-[#2d8db8] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#247ba2] sm:flex"
            >
              <span>{isAuthenticated ? (user?.fullName?.split(' ')[0] || 'Account') : 'Sign In'}</span>
            </Link>
          </div>
        </div>

      </div>

      </header>

      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/45 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="absolute left-0 top-0 flex h-full w-[min(82vw,20rem)] flex-col bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Products' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#2385ad] dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              to={isAuthenticated ? '/account' : '/signin'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-5 rounded-xl bg-[#2d8db8] px-3 py-3 text-center text-sm font-semibold text-white"
            >
              {isAuthenticated ? 'Account' : 'Sign In'}
            </Link>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
};
