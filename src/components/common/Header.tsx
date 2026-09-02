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
  MessageCircle,
  UserRound
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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[4.25rem] border-b border-[var(--border-color)] bg-[rgba(255,247,248,0.94)] backdrop-blur-2xl transition-colors dark:bg-[rgba(23,19,17,0.94)] sm:h-[4.7rem]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-2 py-3 sm:h-[4.7rem] sm:gap-4 sm:py-0">

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-soft)] rounded md:hidden dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-card-alt)]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 shadow-sm">
              <img src={logoImg} alt="CR Cosmetics & Essentials" className="h-8 w-8 object-contain sm:h-9 sm:w-auto" />
            </div>
            <div className="hidden min-w-0 items-center sm:flex sm:flex-col sm:leading-none">
              <span className="truncate font-serif text-lg font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-xl">
                {storeSettings.storeName}
              </span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Beauty & essentials
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.38)] p-1.5 lg:flex lg:gap-1.5">
            {desktopLinks.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={handleSearchSubmit} className="hidden min-w-0 max-w-xs flex-1 md:flex">
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.45)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-card-alt)]"
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

            <Link
              to={isAuthenticated ? '/account' : '/signin'}
              className="hidden rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] sm:inline-flex"
              aria-label={isAuthenticated ? 'Open account' : 'Sign in'}
            >
              <UserRound className="h-4 w-4" />
            </Link>

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

      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] isolate" role="dialog" aria-modal="true" aria-label="Mobile navigation" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 z-[100] bg-black/55" />
          <div className="relative z-[110] flex h-full w-[min(86vw,23rem)] flex-col overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-main)] p-5 shadow-2xl animate-menu-in no-scrollbar dark:bg-[#141211]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <img src={logoImg} alt="CR Cosmetics & Essentials" className="h-8 w-8 rounded-lg object-contain" />
                <span className="font-serif text-lg font-bold text-[var(--text-primary)]">{storeSettings.storeName}</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-soft)]" aria-label="Close menu">
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
                className="w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-card-alt)] text-[var(--text-primary)] py-2.5 pl-9 pr-4 text-xs placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--accent)]"
              />
            </form>

            <nav className="mt-6 space-y-1 text-sm">
              {desktopLinks.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-3 py-3 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]">{item.label}</Link>
              ))}
              <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-3 py-3 font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)]">Offers</Link>
            </nav>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to={isAuthenticated ? "/account" : "/signin"} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border border-[var(--border-color)] px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                {isAuthenticated ? 'Account' : 'Sign in'}
              </Link>
              <button onClick={() => { setIsMobileMenuOpen(false); onOpenWishlist(); }} className="rounded-xl border border-[var(--border-color)] px-3 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Saved items
              </button>
            </div>

            <a
              href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <button onClick={() => { setIsMobileMenuOpen(false); onOpenCart(); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--text-primary)] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--bg-card)]">
              <ShoppingBag className="h-4 w-4" />
              <span>Open cart ({totalItems})</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
