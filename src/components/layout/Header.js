'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Skincare', href: '/shop?category=skincare' },
  { label: 'Groceries', href: '/shop?category=groceries' },
  { label: 'About Us', href: '/about' },
];

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { customer, isAuthenticated } = useAuth();

  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      {/* ── Main Header ── */}
      <header className={`site-header${scrolled ? ' scrolled' : ''}`} role="banner">
        <div className="site-header__inner">

          {/* Left: Desktop navigation */}
          <nav className="site-header__nav" aria-label="Primary navigation">
            {NAV_LINKS.slice(0, 3).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${isActive(href) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Center: Logo */}
          <Link href="/" className="site-header__logo" aria-label="CR Cosmetics & Essentials — Home">
            <div className="site-header__logo-crown" aria-hidden="true">♛</div>
            <div className="site-header__logo-name">CR</div>
            <div className="site-header__logo-sub">Cosmetics & Essential</div>
            <div className="site-header__logo-script">Beauty • Care • Essentials</div>
          </Link>

          {/* Right: More nav + action icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0' }}>
            <nav className="site-header__nav" aria-label="Secondary navigation">
              {NAV_LINKS.slice(3).map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link${isActive(href) ? ' active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <button
              className="header-icon-btn"
              onClick={openSearch}
              aria-label="Search products"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href={isAuthenticated ? '/account' : '/signin'}
              className="header-icon-btn"
              aria-label={isAuthenticated ? `Account (${customer?.fullName})` : 'Sign In'}
              title={isAuthenticated ? `Signed in as ${customer?.fullName}` : 'Sign In'}
            >
              {isAuthenticated ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#7B2347',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                  }}
                >
                  {customer?.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="header-icon-btn"
              aria-label={`Wishlist — ${wishlistCount} saved`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="header-icon-btn__count">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <button
              className="header-icon-btn"
              onClick={openDrawer}
              aria-label={`Cart — ${totalCount} items`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalCount > 0 && (
                <span className="header-icon-btn__count">{totalCount > 9 ? '9+' : totalCount}</span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              className={`header-menu-btn${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <nav
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="mobile-menu__links">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="mobile-menu__link"
              onClick={() => setMenuOpen(false)}
            >
              {label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
        <div className="mobile-menu__footer">
          <a
            href="https://wa.me/233592153306"
            className="mobile-menu__sub-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            📱 Order via WhatsApp (059 215 3306)
          </a>
          <span className="mobile-menu__sub-link" style={{ opacity: 0.5, fontSize: 'var(--text-xs)' }}>
            Near Galaxy International School, Botwe
          </span>
        </div>
      </nav>
    </>
  );
}
