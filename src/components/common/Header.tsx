import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, Settings, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { HeaderNotifications } from './HeaderNotifications';
import logoImg from '../../assets/logo.jpeg';

export const Header: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { storeSettings } = useStore();
  const { user, isAuthenticated } = useAuth();
  const [profileImgError, setProfileImgError] = React.useState(false);
  const displayStoreName = storeSettings.storeName.replace(/\s+AND\s+/gi, ' & ');
  const [brandPrimary, brandSecondary] = displayStoreName.split(' & ');

  React.useEffect(() => {
    setProfileImgError(false);
  }, [user?.profileImage]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-card)] transition-colors">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between gap-3">
            <Link to="/" className="flex min-h-14 min-w-0 items-center gap-2 text-[var(--text-primary)] sm:min-h-16">
              <img
                src={storeSettings.storeLogo || logoImg}
                alt={storeSettings.storeName}
                className="h-8 w-8 shrink-0 rounded-md object-contain"
                onError={(event) => { event.currentTarget.src = logoImg; }}
              />
              <span className="flex min-w-0 flex-col leading-none">
                <span className="max-w-[14rem] truncate font-serif text-[0.86rem] font-bold tracking-[0.03em] sm:max-w-none sm:text-[1.05rem]">
                  {brandPrimary || displayStoreName}
                </span>
                {brandSecondary && (
                  <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-[0.64rem]">
                    &amp; {brandSecondary}
                  </span>
                )}
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <HeaderNotifications />
              <Link
                to="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                aria-label={`Open shopping cart ${totalItems > 0 ? `(${totalItems} items)` : ''}`}
                title="Shopping Cart"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white shadow-xs">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              {isAuthenticated && user ? (
                <Link
                  to="/account"
                  className="group flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] p-0.5 pr-2.5 sm:pr-3 text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:shadow-xs focus:outline-hidden"
                  aria-label={`View account for ${user.fullName || 'User'}`}
                  title={user.fullName || 'My Account'}
                >
                  <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-xs ring-1.5 ring-[var(--accent)]/30 group-hover:ring-[var(--accent)] transition">
                    {user.profileImage && !profileImgError ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName || 'Profile'}
                        className="h-full w-full object-cover"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <span className="font-bold text-[11px] sm:text-xs">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate font-medium text-[12px] group-hover:text-[var(--accent)] transition-colors">
                    {user.fullName ? user.fullName.split(' ')[0] : 'Account'}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2 text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  aria-label="Open account or sign in"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border-color)] bg-[var(--bg-card)]/95 px-2 shadow-[0_-8px_24px_rgba(29,23,22,0.08)] backdrop-blur" aria-label="Primary navigation">
        <Link to="/" className={`flex min-w-16 flex-col items-center gap-1 text-[10px] font-semibold ${location.pathname === '/' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`}>
          <House className="h-5 w-5" />
          Home
        </Link>
        <Link to="/shop" className={`flex min-w-16 flex-col items-center gap-1 text-[10px] font-semibold ${location.pathname.startsWith('/shop') || location.pathname.startsWith('/category') ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`}>
          <ShoppingBag className="h-5 w-5" />
          Products
        </Link>
        <Link to="/cart" className={`relative flex min-w-16 flex-col items-center gap-1 text-[10px] font-semibold ${location.pathname === '/cart' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`} aria-label={`Cart ${totalItems > 0 ? `(${totalItems} items)` : ''}`}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && <span className="absolute left-8 top-[-3px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">{totalItems > 99 ? '99+' : totalItems}</span>}
          Cart
        </Link>
        <Link to="/settings" className={`flex min-w-16 flex-col items-center gap-1 text-[10px] font-semibold ${location.pathname === '/settings' ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]'}`}>
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>
    </>
  );
};
