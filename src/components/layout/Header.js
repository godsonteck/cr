'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';

export default function Header() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { totalCount, openDrawer } = useCart();
  const { isAuthenticated } = useAuth();
  const { openSearch } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onScroll = useCallback(() => setScrolled(window.scrollY > 10), []);
  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Top Announcement (Subtle & Clean) ── */}
      <div className="top-banner">
        <span>Authentic Skincare &amp; Daily Groceries &bull; Same-day delivery across Accra &bull; WhatsApp: 059 215 3306</span>
      </div>

      {/* ── Main Header ── */}
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header-container">
          
          {/* Logo */}
          <Link href="/" className="brand-logo">
            <span className="brand-title">CR COSMETICS</span>
            <span className="brand-tagline">&amp; ESSENTIALS</span>
          </Link>

          {/* Simple Navigation */}
          <nav className="nav-links" aria-label="Main Navigation">
            <Link href="/shop" className={`nav-link ${isActive('/shop') && !pathname.includes('category') ? 'is-active' : ''}`}>
              Shop All
            </Link>
            <Link href="/shop?category=skincare" className={`nav-link ${pathname.includes('category=skincare') ? 'is-active' : ''}`}>
              Skincare
            </Link>
            <Link href="/shop?category=groceries" className={`nav-link ${pathname.includes('category=groceries') ? 'is-active' : ''}`}>
              Groceries
            </Link>
            <Link href="/about" className={`nav-link ${isActive('/about') ? 'is-active' : ''}`}>
              About Store
            </Link>
            <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'is-active' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Clean Utility Actions */}
          <div className="header-actions">
            <button
              type="button"
              className="action-btn"
              onClick={openSearch}
              aria-label="Search"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
              </svg>
            </button>

            <Link
              href={isAuthenticated ? '/account' : '/signin'}
              className="action-btn"
              aria-label={isAuthenticated ? 'Account' : 'Sign in'}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>
              </svg>
            </Link>

            <button
              type="button"
              className="action-btn cart-btn"
              onClick={openDrawer}
              aria-label={`Shopping Cart (${totalCount} items)`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            <Link href="/shop?category=skincare" onClick={() => setMobileMenuOpen(false)}>Skincare &amp; Beauty</Link>
            <Link href="/shop?category=groceries" onClick={() => setMobileMenuOpen(false)}>Groceries &amp; Essentials</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Our Store</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact &amp; Location</Link>
            <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="mobile-wa">
              💬 WhatsApp Order (059 215 3306)
            </a>
          </nav>
        </div>
      )}

      <style jsx>{`
        .top-banner {
          background: #111111;
          color: #E5E5E5;
          text-align: center;
          font-size: 0.75rem;
          padding: 6px 1rem;
          letter-spacing: 0.02em;
        }

        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #FFFFFF;
          border-bottom: 1px solid #EAEAEA;
          transition: box-shadow 0.2s ease;
        }
        .site-header.is-scrolled {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .header-container {
          max-width: 1240px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }

        .brand-logo {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .brand-title {
          font-family: var(--font-display, serif);
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #111111;
        }
        .brand-tagline {
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #7B2347;
          margin-top: 2px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.88rem;
          font-weight: 500;
          color: #444444;
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover,
        .nav-link.is-active {
          color: #111111;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .action-btn {
          background: none;
          border: none;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          color: #333333;
          cursor: pointer;
          border-radius: 50%;
          position: relative;
          text-decoration: none;
        }
        .action-btn:hover {
          background: #F5F5F5;
          color: #111111;
        }

        .cart-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          background: #111111;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 700;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #111111;
          padding: 4px 8px;
        }

        .mobile-menu {
          background: #FFFFFF;
          border-bottom: 1px solid #EAEAEA;
          padding: 1.25rem 1.5rem;
        }
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-nav a {
          text-decoration: none;
          font-size: 1rem;
          color: #222222;
          font-weight: 500;
        }
        .mobile-wa {
          margin-top: 0.5rem;
          padding: 10px;
          background: #25D366;
          color: #FFF !important;
          text-align: center;
          border-radius: 6px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </>
  );
}
