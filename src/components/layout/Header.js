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
        <div className="cr-topbar"><span>♢ &nbsp; FREE DELIVERY ON ORDERS GH₵ 300+</span><i /> <span>◌ &nbsp; 100% AUTHENTIC PRODUCTS</span><i /> <span>◔ &nbsp; NEED HELP? CHAT WITH US</span></div>
        <div className="cr-header-inner">
          <nav className="cr-header-desktop-nav" aria-label="Primary navigation">
            {NAV.map((item) => <Link key={item.label} href={item.href} className={`cr-nav-link${active(item.href) ? ' cr-nav-link--active' : ''}`}>{item.label}{(item.label === 'Shop' || item.label === 'Categories' || item.label === 'Brands') && <span className="cr-nav-chevron">⌄</span>}</Link>)}
          </nav>
          <Link href="/" className="cr-brand-logo" aria-label="CR Cosmetics & Essentials home"><span className="cr-brand-crown">♛</span><span className="cr-brand-name">CR</span><span className="cr-brand-sub">Cosmetics &amp; Essentials</span><em>Beauty · Care · Essentials</em></Link>
          <div className="cr-header-actions">
            <button className="cr-search-trigger" onClick={openSearch} aria-label="Search products"><Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon><span>Search</span></button>
            <Link href={isAuthenticated ? '/account' : '/signin'} className="cr-action-icon" aria-label={isAuthenticated ? `Account — ${customer?.fullName || 'Customer'}` : 'Sign in'}><Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon></Link>
            <Link href="/account/wishlist" className="cr-action-icon" aria-label="Wishlist"><Icon><path d="M20.8 8.7c0 5.5-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" /></Icon>{wishlistCount > 0 && <span className="cr-count">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}</Link>
            <button className="cr-action-icon" onClick={openDrawer} aria-label={`Cart, ${totalCount} items`}><Icon><path d="M5 7h14l-1 13H6L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>{totalCount > 0 && <span className="cr-count">{totalCount > 9 ? '9+' : totalCount}</span>}</button>
            <button className={`cr-mobile-toggle${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><span /><span /><span /></button>
          </div>
        </div>
      </header>
      <div className={`cr-mobile-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}><div className="cr-mobile-drawer-inner"><p className="cr-mobile-eyebrow">CR COSMETICS &amp; ESSENTIALS</p><nav className="cr-mobile-links" aria-label="Mobile navigation">{NAV.map((item, i) => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="cr-mobile-link"><span className="cr-mobile-number">0{i + 1}</span><span>{item.label}</span><span>↗</span></Link>)}<Link href="/contact" onClick={() => setMenuOpen(false)} className="cr-mobile-link"><span className="cr-mobile-number">06</span><span>Contact &amp; Delivery</span><span>↗</span></Link></nav><div className="cr-mobile-contact"><a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer">WhatsApp support ↗</a><p>Botwe, near Galaxy International School, Accra</p></div></div></div>
      <style jsx>{`
        .cr-header{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #eee3e6;transition:box-shadow .25s ease}.cr-header--scrolled{box-shadow:0 8px 28px rgba(55,25,35,.08)}
        .cr-topbar{height:34px;background:#8d3d59;color:#fff;display:flex;align-items:center;justify-content:center;gap:clamp(18px,5vw,70px);font:600 8px/1 var(--font-primary);letter-spacing:.1em;text-transform:uppercase}.cr-topbar i{height:13px;width:1px;background:rgba(255,255,255,.35)}
        .cr-header-inner{max-width:1480px;height:104px;margin:auto;padding:0 clamp(20px,5vw,64px);display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.cr-header-desktop-nav{display:flex;gap:22px;align-items:center}.cr-nav-link{color:#30242a;text-decoration:none;font:600 10px/1 var(--font-primary);text-transform:uppercase;letter-spacing:.04em;padding:12px 0}.cr-nav-link:hover,.cr-nav-link--active{color:#8d3d59}.cr-nav-chevron{font-size:12px;margin-left:5px;color:#9a808a}
        .cr-brand-logo{position:relative;justify-self:center;display:flex;flex-direction:column;align-items:center;text-decoration:none;color:#171116;line-height:1}.cr-brand-crown{color:#b58a38;font-size:14px;height:13px}.cr-brand-name{font:400 50px/.78 Georgia,serif;letter-spacing:-.1em}.cr-brand-sub{font:600 11px/1 var(--font-primary);letter-spacing:.03em;margin-top:7px}.cr-brand-logo em{font:italic 11px/1 var(--font-display);color:#a05b72;margin-top:5px}
        .cr-header-actions{display:flex;justify-content:flex-end;align-items:center;gap:3px}.cr-search-trigger,.cr-action-icon{border:0;background:none;color:#30242a;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer}.cr-search-trigger{gap:7px;padding:9px 8px;font:500 10px var(--font-primary)}.cr-action-icon{width:40px;height:40px}.cr-search-trigger:hover,.cr-action-icon:hover{color:#8d3d59}.cr-count{position:absolute;top:1px;right:0;min-width:14px;height:14px;border-radius:50%;background:#8d3d59;color:#fff;display:flex;align-items:center;justify-content:center;font:700 7px var(--font-primary)}
        .cr-mobile-toggle{display:none;width:40px;height:40px;flex-direction:column;justify-content:center;gap:5px;padding:8px}.cr-mobile-toggle span{width:22px;height:1.5px;background:#30242a;transition:.2s}.cr-mobile-toggle.is-open span:first-child{transform:translateY(6.5px) rotate(45deg)}.cr-mobile-toggle.is-open span:nth-child(2){opacity:0}.cr-mobile-toggle.is-open span:last-child{transform:translateY(-6.5px) rotate(-45deg)}
        .cr-mobile-drawer{display:none;position:fixed;inset:0;z-index:99;background:#fff8f6;opacity:0;pointer-events:none;transition:opacity .2s}.cr-mobile-drawer.is-open{opacity:1;pointer-events:auto}.cr-mobile-drawer-inner{height:100%;padding:125px 24px 30px;display:flex;flex-direction:column}.cr-mobile-eyebrow{font:700 9px var(--font-primary);letter-spacing:.18em;color:#9b6879;margin:0 0 25px}.cr-mobile-links{border-top:1px solid #e8dade}.cr-mobile-link{display:grid;grid-template-columns:30px 1fr auto;gap:8px;padding:19px 0;border-bottom:1px solid #e8dade;text-decoration:none;color:#281a20;font:400 29px/1 var(--font-display)}.cr-mobile-number{font:700 8px var(--font-primary);color:#aa929b}.cr-mobile-contact{margin-top:auto;font:400 12px/1.6 var(--font-primary);color:#76636b}.cr-mobile-contact a{color:#8d3d59;font-weight:700}.cr-mobile-contact p{margin-top:7px}
        @media(max-width:1100px){.cr-header-inner{height:92px}.cr-header-desktop-nav{gap:12px}.cr-nav-link{font-size:9px}.cr-brand-name{font-size:44px}.cr-brand-sub{font-size:9px}.cr-brand-logo em{font-size:9px}.cr-search-trigger span{display:none}}
        @media(max-width:800px){.cr-topbar{height:30px;font-size:7px;gap:0}.cr-topbar span{display:none}.cr-topbar span:first-child{display:block}.cr-topbar i{display:none}.cr-header-inner{height:72px;display:grid;grid-template-columns:1fr auto}.cr-header-desktop-nav{display:none}.cr-brand-logo{justify-self:start}.cr-brand-crown{font-size:9px;height:9px}.cr-brand-name{font-size:34px}.cr-brand-sub{font-size:7px;margin-top:5px}.cr-brand-logo em{font-size:7px;margin-top:4px}.cr-action-icon{width:35px}.cr-mobile-toggle{display:flex}.cr-mobile-drawer{display:block}}
      `}</style>
    </>
  );
}
