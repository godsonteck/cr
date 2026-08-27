'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/shop' },
  { label: 'Brands', href: '/shop' },
  { label: 'About Us', href: '/about' },
];

const Icon = ({ children, size = 19 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;

export default function Header() {
  const pathname = usePathname() || '';
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { customer, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 12), []);
  useEffect(() => { window.addEventListener('scroll', handleScroll, { passive: true }); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  const active = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={`cr-header${scrolled ? ' cr-header--scrolled' : ''}`}>
        <div className="cr-topbar">
          <span>&#9830;&thinsp; FREE DELIVERY OVER GH&#8373; 300</span>
          <i />
          <span>&#10006;&thinsp; 100% AUTHENTIC GUARANTEE</span>
          <i />
          <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="cr-topbar-wa">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.46.1-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.18 1.96 3 4.75 4.2.66.29 1.18.46 1.58.58.67.21 1.27.18 1.75.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.52-.32ZM12 2a10 10 0 0 0-8.65 14.97L2 22l5.18-1.35A10 10 0 1 0 12 2Z"/></svg>
            WhatsApp Order
          </a>
        </div>
        <div className="cr-header-inner">
          <nav className="cr-header-desktop-nav" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className={`cr-nav-link${active(item.href) ? ' cr-nav-link--active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="cr-brand-logo" aria-label="CR Cosmetics & Essentials home">
            <img src="/logo.jpeg" alt="CR Cosmetics & Essentials" className="cr-brand-logo-img" />
            <div className="cr-brand-text">
              <span className="cr-brand-name">CR Cosmetics</span>
              <span className="cr-brand-sub">&amp; Essentials</span>
            </div>
          </Link>
          <div className="cr-header-actions">
            <button className="cr-search-trigger" onClick={openSearch} aria-label="Search products">
              <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
              <span>Search</span>
            </button>
            <Link href={isAuthenticated ? '/account' : '/signin'} className="cr-action-icon" aria-label={isAuthenticated ? `Account — ${customer?.fullName || 'Customer'}` : 'Sign in'}>
              <Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon>
            </Link>
            <Link href="/account/wishlist" className="cr-action-icon" aria-label="Wishlist">
              <Icon><path d="M20.8 8.7c0 5.5-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></Icon>
              {wishlistCount > 0 && <span className="cr-count">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
            </Link>
            <button className="cr-action-icon" onClick={openDrawer} aria-label={`Cart, ${totalCount} items`}>
              <Icon><path d="M5 7h14l-1 13H6L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>
              {totalCount > 0 && <span className="cr-count">{totalCount > 9 ? '9+' : totalCount}</span>}
            </button>
            <button className={`cr-mobile-toggle${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`cr-mobile-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="cr-mobile-drawer-inner">
          <div className="cr-mobile-header">
            <img src="/logo.jpeg" alt="CR Cosmetics & Essentials" className="cr-mobile-logo" />
            <div>
              <p className="cr-mobile-eyebrow">CR Cosmetics &amp; Essentials</p>
              <p className="cr-mobile-location">Botwe, Accra · Galaxy Int. School</p>
            </div>
          </div>
          <nav className="cr-mobile-links" aria-label="Mobile navigation">
            {NAV.map((item, i) => (
              <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="cr-mobile-link">
                <span className="cr-mobile-number">0{i + 1}</span>
                <span>{item.label}</span>
                <span className="cr-mobile-arrow">&#8599;</span>
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="cr-mobile-link">
              <span className="cr-mobile-number">06</span>
              <span>Contact &amp; Delivery</span>
              <span className="cr-mobile-arrow">&#8599;</span>
            </Link>
          </nav>
          <div className="cr-mobile-foot">
            <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="cr-mobile-wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.46.1-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.19 0-.49.07-.74.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.18 1.96 3 4.75 4.2.66.29 1.18.46 1.58.58.67.21 1.27.18 1.75.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.52-.32ZM12 2a10 10 0 0 0-8.65 14.97L2 22l5.18-1.35A10 10 0 1 0 12 2Z"/></svg>
              Chat on WhatsApp
            </a>
            <p>+233 59 215 3306</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cr-header{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #eee3e6;transition:box-shadow .3s ease}
        .cr-header--scrolled{box-shadow:0 2px 24px rgba(55,25,35,.09);border-bottom-color:transparent}
        .cr-topbar{height:36px;background:#1a0f14;color:rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;gap:clamp(14px,4vw,56px);font:600 8px/1 var(--font-primary);letter-spacing:.12em;text-transform:uppercase}
        .cr-topbar i{height:12px;width:1px;background:rgba(255,255,255,.2)}
        .cr-topbar-wa{display:inline-flex;align-items:center;gap:5px;color:#25D366;text-decoration:none;background:rgba(37,211,102,.12);border:1px solid rgba(37,211,102,.25);padding:4px 10px;border-radius:20px;font-weight:700;letter-spacing:.1em;transition:background .2s}
        .cr-topbar-wa:hover{background:rgba(37,211,102,.22)}
        .cr-header-inner{max-width:1480px;height:80px;margin:auto;padding:0 clamp(16px,4vw,60px);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem}
        .cr-header-desktop-nav{display:flex;gap:8px;align-items:center}
        .cr-nav-link{color:#3a2930;text-decoration:none;font:600 10px/1 var(--font-primary);text-transform:uppercase;letter-spacing:.08em;padding:10px 10px;position:relative;transition:color .2s}
        .cr-nav-link::after{content:'';position:absolute;bottom:6px;left:10px;right:10px;height:1.5px;background:var(--gold,#c59b3f);transform:scaleX(0);transform-origin:left;transition:transform .25s ease}
        .cr-nav-link:hover{color:var(--burgundy,#6b1733)}
        .cr-nav-link:hover::after,.cr-nav-link--active::after{transform:scaleX(1)}
        .cr-nav-link--active{color:var(--burgundy,#6b1733)}
        .cr-brand-logo{justify-self:center;display:flex;align-items:center;gap:11px;text-decoration:none;color:#171116}
        .cr-brand-logo-img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold,#c59b3f);box-shadow:0 0 0 3px rgba(197,155,63,.12),0 2px 10px rgba(107,23,51,.1);transition:transform .25s ease,box-shadow .25s ease}
        .cr-brand-logo:hover .cr-brand-logo-img{transform:scale(1.06);box-shadow:0 0 0 4px rgba(197,155,63,.2),0 4px 16px rgba(107,23,51,.16)}
        .cr-brand-text{display:flex;flex-direction:column;line-height:1.1}
        .cr-brand-name{font:700 1.2rem/1 var(--font-display,Georgia,serif);letter-spacing:-.02em;color:var(--text,#171116)}
        .cr-brand-sub{font:600 .62rem/1 var(--font-primary);letter-spacing:.12em;margin-top:3px;color:var(--burgundy,#6b1733);text-transform:uppercase}
        .cr-header-actions{display:flex;justify-content:flex-end;align-items:center;gap:2px}
        .cr-search-trigger,.cr-action-icon{border:0;background:none;color:#3a2930;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;border-radius:50%;transition:color .2s,background .2s}
        .cr-search-trigger{gap:6px;padding:8px 10px;border-radius:24px;font:600 10px var(--font-primary);letter-spacing:.06em}
        .cr-action-icon{width:40px;height:40px}
        .cr-search-trigger:hover,.cr-action-icon:hover{color:var(--burgundy,#6b1733);background:rgba(107,23,51,.05)}
        .cr-count{position:absolute;top:2px;right:2px;min-width:15px;height:15px;border-radius:50%;background:var(--burgundy,#6b1733);color:#fff;display:flex;align-items:center;justify-content:center;font:700 7.5px var(--font-primary)}
        .cr-mobile-toggle{display:none;width:40px;height:40px;flex-direction:column;justify-content:center;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:8px}
        .cr-mobile-toggle span{display:block;width:22px;height:1.5px;background:#3a2930;transition:transform .25s ease,opacity .25s ease}
        .cr-mobile-toggle.is-open span:first-child{transform:translateY(6.5px) rotate(45deg)}
        .cr-mobile-toggle.is-open span:nth-child(2){opacity:0}
        .cr-mobile-toggle.is-open span:last-child{transform:translateY(-6.5px) rotate(-45deg)}
        .cr-mobile-drawer{display:none;position:fixed;inset:0;z-index:99;background:#fdf7f5;opacity:0;pointer-events:none;transition:opacity .25s ease}
        .cr-mobile-drawer.is-open{opacity:1;pointer-events:auto}
        .cr-mobile-drawer-inner{height:100%;padding:100px 28px 30px;display:flex;flex-direction:column;overflow-y:auto}
        .cr-mobile-header{display:flex;align-items:center;gap:14px;margin-bottom:2rem}
        .cr-mobile-logo{width:48px;height:48px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold,#c59b3f)}
        .cr-mobile-eyebrow{font:700 11px/1.2 var(--font-primary);color:#1a0f14;letter-spacing:.06em}
        .cr-mobile-location{font:400 9px/1 var(--font-primary);color:#9b6879;letter-spacing:.08em;text-transform:uppercase;margin-top:5px}
        .cr-mobile-links{border-top:1px solid #e8dade;flex:1}
        .cr-mobile-link{display:grid;grid-template-columns:36px 1fr auto;gap:12px;align-items:baseline;padding:20px 0;border-bottom:1px solid #e8dade;text-decoration:none;color:#1a0f14;font:400 clamp(28px,7vw,36px)/1 var(--font-display,serif);transition:color .2s}
        .cr-mobile-link:hover{color:var(--burgundy,#6b1733)}
        .cr-mobile-number{font:700 9px var(--font-primary);color:#c2a8b2;letter-spacing:.08em;align-self:center}
        .cr-mobile-arrow{font-size:18px;color:#cbb8be;transition:color .2s}
        .cr-mobile-link:hover .cr-mobile-arrow{color:var(--burgundy,#6b1733)}
        .cr-mobile-foot{margin-top:auto;padding-top:24px;border-top:1px solid #e8dade}
        .cr-mobile-wa{display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;padding:.75rem 1.25rem;border-radius:4px;font:700 .72rem/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase;text-decoration:none;margin-bottom:12px}
        .cr-mobile-foot p{font:400 10px/1.5 var(--font-primary);color:#9b7e87}
        @media(max-width:1100px){.cr-header-inner{height:76px}.cr-header-desktop-nav{gap:4px}.cr-nav-link{font-size:9.5px;padding:10px 8px}.cr-brand-logo-img{width:40px;height:40px}.cr-brand-name{font-size:1.08rem}.cr-brand-sub{font-size:.58rem}.cr-search-trigger span{display:none}}
        @media(max-width:820px){.cr-topbar span:not(:first-child){display:none}.cr-topbar i{display:none}.cr-topbar-wa{display:none}.cr-header-inner{height:68px;grid-template-columns:auto 1fr}.cr-header-desktop-nav{display:none}.cr-brand-logo{justify-self:start}.cr-brand-logo-img{width:36px;height:36px}.cr-brand-name{font-size:1rem}.cr-brand-sub{font-size:.54rem}.cr-action-icon{width:36px}.cr-search-trigger{padding:8px}.cr-mobile-toggle{display:flex}.cr-mobile-drawer{display:block}}
      `}</style>
    </>
  );
}
