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
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname() || '';
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();
  const { customer, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const onScroll = useCallback(() => setScrolled(window.scrollY > 8), []);
  useEffect(() => { window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, [onScroll]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className={'hdr' + (scrolled ? ' hdr--up' : '')}>
        {/* Top strip */}
        <div className="hdr-strip">
          Free delivery over GH&#8373;300 &nbsp;·&nbsp; 100% authentic &nbsp;·&nbsp;
          <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </div>

        <div className="hdr-inner">
          {/* Logo */}
          <Link href="/" className="hdr-logo" aria-label="CR Cosmetics home">
            <img src="/logo.jpeg" alt="" className="hdr-logo-img" />
            <div className="hdr-logo-text">
              <span className="hdr-logo-name">CR Cosmetics</span>
              <span className="hdr-logo-sub">&amp; Essentials</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hdr-nav" aria-label="Main">
            {NAV.map(n => (
              <Link key={n.label} href={n.href} className={'hdr-nav-a' + (isActive(n.href) ? ' hdr-nav-a--on' : '')}>
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hdr-actions">
            <button className="hdr-icon" onClick={openSearch} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            </button>
            <Link href={isAuthenticated ? '/account' : '/signin'} className="hdr-icon" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
            </Link>
            <button className="hdr-icon hdr-icon--cart" onClick={openDrawer} aria-label={`Cart (${totalCount})`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
              {totalCount > 0 && <span className="hdr-badge">{totalCount > 9 ? '9+' : totalCount}</span>}
            </button>
            <button className={'hdr-burger' + (open ? ' hdr-burger--x' : '')} onClick={() => setOpen(v => !v)} aria-label="Menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={'hdr-menu' + (open ? ' hdr-menu--open' : '')} aria-hidden={!open}>
        <nav>
          {NAV.map(n => (
            <Link key={n.label} href={n.href} className="hdr-menu-a" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
        <a href="https://wa.me/233592153306" target="_blank" rel="noopener noreferrer" className="hdr-menu-wa">
          WhatsApp us &rarr;
        </a>
        <p className="hdr-menu-loc">Near Galaxy Int. School, Botwe, Accra</p>
      </div>

      <style jsx>{`
        .hdr { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #ece5e8; transition: box-shadow .25s; }
        .hdr--up { box-shadow: 0 2px 20px rgba(0,0,0,.07); }
        .hdr-strip { background: #1a1117; color: rgba(255,255,255,.7); text-align: center; padding: 8px 16px; font: 500 11px/1 var(--font-primary, sans-serif); letter-spacing: .04em; }
        .hdr-strip a { color: #25d366; text-decoration: none; font-weight: 600; }
        .hdr-strip a:hover { text-decoration: underline; }
        .hdr-inner { max-width: 1320px; margin: 0 auto; height: 68px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; padding: 0 32px; gap: 32px; }
        .hdr-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; flex-shrink: 0; }
        .hdr-logo-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid #c59b3f; }
        .hdr-logo-text { display: flex; flex-direction: column; }
        .hdr-logo-name { font: 600 15px/1.1 var(--font-display, Georgia, serif); color: #1a1117; letter-spacing: -.01em; }
        .hdr-logo-sub { font: 600 10px/1 var(--font-primary, sans-serif); color: #6b1733; letter-spacing: .06em; text-transform: uppercase; margin-top: 2px; }
        .hdr-nav { display: flex; align-items: center; gap: 4px; justify-content: center; }
        .hdr-nav-a { font: 500 13px/1 var(--font-primary, sans-serif); color: #4a3840; text-decoration: none; padding: 8px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .hdr-nav-a:hover { color: #6b1733; background: #faf2f5; }
        .hdr-nav-a--on { color: #6b1733; font-weight: 600; }
        .hdr-actions { display: flex; align-items: center; gap: 4px; }
        .hdr-icon { background: none; border: none; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: #4a3840; cursor: pointer; text-decoration: none; position: relative; transition: color .15s, background .15s; }
        .hdr-icon:hover { color: #6b1733; background: #faf2f5; }
        .hdr-badge { position: absolute; top: 4px; right: 4px; min-width: 14px; height: 14px; background: #6b1733; color: #fff; border-radius: 99px; font: 700 8px/14px var(--font-primary, sans-serif); text-align: center; padding: 0 3px; }
        .hdr-burger { background: none; border: none; width: 38px; height: 38px; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; padding: 8px; border-radius: 6px; }
        .hdr-burger span { display: block; width: 20px; height: 1.5px; background: #1a1117; transition: transform .2s, opacity .2s; }
        .hdr-burger--x span:first-child { transform: translateY(6.5px) rotate(45deg); }
        .hdr-burger--x span:nth-child(2) { opacity: 0; }
        .hdr-burger--x span:last-child { transform: translateY(-6.5px) rotate(-45deg); }
        .hdr-menu { display: none; position: fixed; inset: 0; background: #fff; z-index: 99; padding: 100px 32px 40px; flex-direction: column; opacity: 0; pointer-events: none; transition: opacity .2s; }
        .hdr-menu--open { opacity: 1; pointer-events: auto; }
        .hdr-menu nav { display: flex; flex-direction: column; gap: 4px; margin-bottom: 32px; border-bottom: 1px solid #ece5e8; padding-bottom: 32px; }
        .hdr-menu-a { font: 400 32px/1 var(--font-display, Georgia, serif); color: #1a1117; text-decoration: none; padding: 12px 0; transition: color .15s; }
        .hdr-menu-a:hover { color: #6b1733; }
        .hdr-menu-wa { display: inline-flex; background: #25d366; color: #fff; font: 600 13px/1 var(--font-primary, sans-serif); padding: 14px 24px; border-radius: 6px; text-decoration: none; width: fit-content; margin-bottom: 16px; }
        .hdr-menu-loc { font: 400 12px/1.5 var(--font-primary, sans-serif); color: #9a8590; }
        @media (max-width: 860px) {
          .hdr-inner { height: 60px; grid-template-columns: auto 1fr; padding: 0 20px; }
          .hdr-nav { display: none; }
          .hdr-burger { display: flex; }
          .hdr-menu { display: flex; }
          .hdr-icon--cart { display: flex; }
        }
        @media (max-width: 480px) {
          .hdr-logo-text { display: none; }
          .hdr-strip { font-size: 10px; }
        }
      `}</style>
    </>
  );
}
