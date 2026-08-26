'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Shop', href: '/shop' },
  { label: 'Beauty', href: '/shop?category=skincare' },
  { label: 'Essentials', href: '/shop?category=groceries' },
  { label: 'About', href: '/about' },
];

const Icon = ({ children, size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export default function Header() {
  const pathname = usePathname() || '';
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { customer, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href) => pathname === href || pathname.startsWith(href.split('?')[0]);

  return (
    <>
      <header className={`cr-header${scrolled ? ' cr-header--scrolled' : ''}`}>
        <div className="cr-header-inner">
          <nav className="cr-header-desktop-nav" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`cr-nav-link${isActive(item.href) ? ' cr-nav-link--active' : ''}`}>{item.label}</Link>
            ))}
          </nav>

          <Link href="/" className="cr-brand-logo" aria-label="CR Cosmetics & Essentials home">
            <span className="cr-brand-name">CR</span>
            <span className="cr-brand-sub">Cosmetics & Essentials</span>
          </Link>

          <div className="cr-header-actions">
            <button className="cr-search-trigger" onClick={openSearch} aria-label="Search products">
              <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
              <span>Search</span>
            </button>
            <Link href={isAuthenticated ? '/account' : '/signin'} className="cr-action-icon" aria-label={isAuthenticated ? `Account — ${customer?.fullName || 'Customer'}` : 'Sign in'}>
              <Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon>
            </Link>
            <Link href="/account/wishlist" className="cr-action-icon" aria-label={`Wishlist, ${wishlistCount} items`}>
              <Icon><path d="M20.8 8.7c0 5.5-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></Icon>
              {wishlistCount > 0 && <span className="cr-count">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
            </Link>
            <button className="cr-action-icon" onClick={openDrawer} aria-label={`Cart, ${totalCount} items`}>
              <Icon><path d="M5 7h14l-1 13H6L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>
              {totalCount > 0 && <span className="cr-count">{totalCount > 9 ? '9+' : totalCount}</span>}
            </button>
            <button className={`cr-mobile-toggle${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`cr-mobile-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="cr-mobile-drawer-inner">
          <p className="cr-mobile-eyebrow">CR COSMETICS & ESSENTIALS</p>
          <nav aria-label="Mobile navigation" className="cr-mobile-links">
            {NAV.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="cr-mobile-link">
                <span className="cr-mobile-number">0{index + 1}</span><span>{item.label}</span><span>↗</span>
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="cr-mobile-link"><span className="cr-mobile-number">05</span><span>Contact & Delivery</span><span>↗</span></Link>
          </nav>
          <div className="cr-mobile-contact">
            <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer">WhatsApp support ↗</a>
            <p>Botwe, near Galaxy International School, Accra</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cr-header { position: fixed; inset: 0 0 auto; height: 76px; z-index: 100; background: rgba(255,255,255,.9); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(107,23,51,.08); transition: .25s ease; }
        .cr-header--scrolled { height: 68px; background: rgba(255,255,255,.97); box-shadow: 0 8px 30px rgba(41,17,27,.06); }
        .cr-header-inner { max-width: 1400px; height: 100%; margin: auto; padding: 0 clamp(18px,4vw,56px); display:grid; grid-template-columns:1fr auto 1fr; align-items:center; }
        .cr-header-desktop-nav { display:flex; align-items:center; gap:clamp(14px,2vw,30px); }
        .cr-nav-link { position:relative; color:#4b3941; text-decoration:none; text-transform:uppercase; font-size:11px; font-weight:700; letter-spacing:.13em; padding:8px 0; }
        .cr-nav-link:hover,.cr-nav-link--active { color:#6b1733; }
        .cr-nav-link--active:after { content:''; position:absolute; left:0; right:0; bottom:0; height:1px; background:#6b1733; }
        .cr-brand-logo { justify-self:center; display:flex; flex-direction:column; align-items:center; text-decoration:none; color:#1c1116; line-height:1; }
        .cr-brand-name { font-family:var(--font-display, Georgia, serif); font-size:31px; font-weight:700; letter-spacing:.12em; }
        .cr-brand-sub { margin-top:4px; color:#8d7982; font-size:7px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; }
        .cr-header-actions { display:flex; justify-content:flex-end; align-items:center; gap:4px; }
        .cr-search-trigger,.cr-action-icon { border:0; background:transparent; color:#35272d; text-decoration:none; cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; }
        .cr-search-trigger { height:38px; padding:0 10px; gap:8px; border:1px solid #e9dfe3; border-radius:999px; font-size:11px; letter-spacing:.05em; color:#6d5a63; }
        .cr-search-trigger:hover,.cr-action-icon:hover { color:#6b1733; }
        .cr-action-icon { width:40px; height:40px; border-radius:50%; }
        .cr-action-icon:hover { background:#faf4f7; }
        .cr-count { position:absolute; top:2px; right:1px; min-width:15px; height:15px; padding:0 4px; border-radius:20px; display:flex; align-items:center; justify-content:center; background:#6b1733; color:#fff; font-size:8px; font-weight:800; }
        .cr-mobile-toggle { display:none; width:40px; height:40px; border:0; background:none; flex-direction:column; justify-content:center; gap:5px; padding:8px; }
        .cr-mobile-toggle span { display:block; width:21px; height:1.5px; background:#24171d; transition:.2s ease; }
        .cr-mobile-toggle.is-open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)} .cr-mobile-toggle.is-open span:nth-child(2){opacity:0} .cr-mobile-toggle.is-open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
        .cr-mobile-drawer { display:none; position:fixed; inset:76px 0 0; z-index:99; background:#fbf8f6; transform:translateY(-8px); opacity:0; pointer-events:none; transition:.25s ease; overflow:auto; }
        .cr-mobile-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
        .cr-mobile-drawer-inner { min-height:100%; padding:46px 24px 32px; display:flex; flex-direction:column; }
        .cr-mobile-eyebrow { margin:0 0 28px; color:#987d88; font-size:10px; letter-spacing:.18em; font-weight:700; }
        .cr-mobile-links { border-top:1px solid #e5dadd; }
        .cr-mobile-link { display:grid; grid-template-columns:32px 1fr auto; align-items:center; gap:10px; padding:21px 0; border-bottom:1px solid #e5dadd; text-decoration:none; color:#281a20; font-family:var(--font-display,Georgia,serif); font-size:29px; }
        .cr-mobile-link:hover { color:#6b1733; }
        .cr-mobile-number { font-family:var(--font-body,Arial,sans-serif); color:#aa949d; font-size:9px; letter-spacing:.08em; }
        .cr-mobile-contact { margin-top:auto; padding-top:50px; color:#715e66; font-size:12px; line-height:1.7; }
        .cr-mobile-contact a { color:#6b1733; font-weight:700; text-decoration:none; }
        .cr-mobile-contact p { margin:8px 0 0; }
        @media(max-width:1080px){ .cr-header-desktop-nav{gap:15px}.cr-nav-link{font-size:10px}.cr-search-trigger span{display:none}.cr-search-trigger{width:40px;padding:0;border:0;border-radius:50%} }
        @media(max-width:820px){ .cr-header-inner{grid-template-columns:1fr auto}.cr-header-desktop-nav{display:none}.cr-brand-logo{justify-self:start}.cr-brand-name{font-size:26px}.cr-brand-sub{font-size:6px}.cr-header-actions{gap:0}.cr-action-icon:nth-of-type(2){display:none}.cr-mobile-toggle{display:flex}.cr-mobile-drawer{display:block} }
        @media(max-width:420px){ .cr-header{height:68px}.cr-mobile-drawer{inset:68px 0 0}.cr-action-icon{width:36px;height:36px}.cr-mobile-link{font-size:25px} }
      `}</style>
    </>
  );
}
