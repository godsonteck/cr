'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';

const NAV_LEFT = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Skincare', href: '/shop?category=skincare' },
];

const NAV_RIGHT = [
  { label: 'Groceries', href: '/shop?category=groceries' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname() || '';
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { customer, isAuthenticated } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 30);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      <header className={`cr-header${scrolled ? ' cr-header--scrolled' : ''}`} role="banner">
        <div className="cr-header-inner">
          {/* ── Left Nav ── */}
          <nav className="cr-header-nav cr-header-nav--left" aria-label="Primary navigation">
            {NAV_LEFT.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`cr-nav-link${isActive(href) ? ' cr-nav-link--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Center Brand Signature ── */}
          <Link href="/" className="cr-brand-logo" aria-label="CR Cosmetics & Essentials — Home">
            <span className="cr-brand-name">CR</span>
            <span className="cr-brand-sub">Cosmetics & Essentials</span>
          </Link>

          {/* ── Right Actions ── */}
          <div className="cr-header-right">
            <nav className="cr-header-nav cr-header-nav--right" aria-label="Secondary navigation">
              {NAV_RIGHT.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`cr-nav-link${isActive(href) ? ' cr-nav-link--active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="cr-icon-stack">
              {/* Search */}
              <button
                type="button"
                className="cr-icon-btn"
                onClick={openSearch}
                aria-label="Search products"
                id="header-search-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="cr-icon-btn"
                aria-label={`Wishlist, ${wishlistCount} items`}
                id="header-wishlist-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="cr-badge-counter">{wishlistCount}</span>
                )}
              </Link>

              {/* Account */}
              <Link
                href={isAuthenticated ? '/account' : '/signin'}
                className="cr-icon-btn"
                aria-label={isAuthenticated ? `Account — ${customer?.fullName}` : 'Sign in to account'}
                id="header-account-btn"
              >
                {isAuthenticated ? (
                  <span className="cr-avatar-badge">
                    {customer?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </Link>

              {/* Cart */}
              <button
                type="button"
                className="cr-icon-btn"
                onClick={openDrawer}
                aria-label={`Cart, ${totalCount} items`}
                id="header-cart-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {totalCount > 0 && (
                  <span className="cr-badge-counter">{totalCount > 9 ? '9+' : totalCount}</span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                type="button"
                className={`cr-mobile-toggle${menuOpen ? ' cr-mobile-toggle--active' : ''}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={menuOpen}
                id="header-menu-toggle"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Fullscreen Mobile Drawer ── */}
      <div className={`cr-mobile-drawer${menuOpen ? ' cr-mobile-drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="cr-mobile-drawer-body">
          <div className="cr-mobile-nav-links">
            <Link href="/" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>Home</span>
              <span>→</span>
            </Link>
            <Link href="/shop" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>Shop All</span>
              <span>→</span>
            </Link>
            <Link href="/shop?category=skincare" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>Skincare</span>
              <span>→</span>
            </Link>
            <Link href="/shop?category=groceries" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>Groceries</span>
              <span>→</span>
            </Link>
            <Link href="/about" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>About Us</span>
              <span>→</span>
            </Link>
            <Link href="/contact" className="cr-mobile-nav-item" onClick={() => setMenuOpen(false)}>
              <span>Contact & Delivery</span>
              <span>→</span>
            </Link>
          </div>

          <div className="cr-mobile-footer-info">
            <a
              href="https://wa.me/233592153306"
              className="cr-mobile-wa-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>📱</span>
              <span>WhatsApp: 059 215 3306</span>
            </a>
            <p className="cr-mobile-address">Botwe, near Galaxy International School, Accra</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cr-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-h, 74px);
          z-index: var(--z-overlay, 100);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #F0E8EC;
          transition: all 0.25s ease;
        }

        .cr-header--scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 20px rgba(123, 35, 71, 0.06);
          border-color: #E8DCE2;
        }

        .cr-header-inner {
          max-width: 1320px;
          height: 100%;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 2.5rem);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }

        /* ── Nav Links ── */
        .cr-header-nav {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .cr-header-nav--right {
          justify-content: flex-end;
          margin-right: 1.25rem;
          padding-right: 1.25rem;
          border-right: 1px solid #E8DCE2;
        }

        .cr-nav-link {
          position: relative;
          padding: 0.45rem 0.5rem;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #55454C;
          text-decoration: none;
          transition: color 0.15s ease;
          white-space: nowrap;
        }

        .cr-nav-link:hover {
          color: #7B2347;
        }

        .cr-nav-link--active {
          color: #7B2347;
        }

        .cr-nav-link--active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0.85rem;
          right: 0.85rem;
          height: 2px;
          background: #7B2347;
          border-radius: 1px;
        }

        /* ── Logo ── */
        .cr-brand-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          gap: 1px;
        }

        .cr-brand-name {
          font-family: var(--font-display, serif);
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #1A0D14;
          line-height: 1;
        }

        .cr-brand-sub {
          font-size: 0.52rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8C7C84;
        }

        /* ── Right Actions ── */
        .cr-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.25rem;
        }

        .cr-icon-stack {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .cr-icon-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3D2D35;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .cr-icon-btn:hover {
          color: #7B2347;
          background: #FAF4F7;
        }

        .cr-avatar-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #7B2347;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cr-badge-counter {
          position: absolute;
          top: 3px;
          right: 3px;
          min-width: 16px;
          height: 16px;
          background: #7B2347;
          color: #FFFFFF;
          font-size: 0.62rem;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }

        /* ── Mobile Toggle ── */
        .cr-mobile-toggle {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 38px;
          height: 38px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
        }

        .cr-mobile-toggle span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #1A0D14;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cr-mobile-toggle--active span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }

        .cr-mobile-toggle--active span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .cr-mobile-toggle--active span:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        /* ── Mobile Drawer ── */
        .cr-mobile-drawer {
          position: fixed;
          top: var(--header-h, 74px);
          left: 0;
          right: 0;
          bottom: 0;
          background: #FFFFFF;
          z-index: 99;
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
          overflow-y: auto;
        }

        .cr-mobile-drawer--open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .cr-mobile-drawer-body {
          padding: 2rem clamp(1rem, 5vw, 2.5rem) 4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: calc(100vh - var(--header-h, 74px));
        }

        .cr-mobile-nav-links {
          display: flex;
          flex-direction: column;
        }

        .cr-mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.15rem 0;
          border-bottom: 1px solid #F0E8EC;
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 600;
          color: #1A0D14;
          text-decoration: none;
          transition: color 0.15s, padding-left 0.2s;
        }

        .cr-mobile-nav-item:hover {
          color: #7B2347;
          padding-left: 6px;
        }

        .cr-mobile-footer-info {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #F0E8EC;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .cr-mobile-wa-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1E8E49;
          text-decoration: none;
        }

        .cr-mobile-address {
          font-size: 0.8rem;
          color: #7A6A72;
        }

        /* ── Breakpoints ── */
        @media (max-width: 960px) {
          .cr-header-nav {
            display: none;
          }
          .cr-mobile-toggle {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
