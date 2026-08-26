'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const NAV = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      label: 'Wishlist',
      href: '/account/wishlist',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      badgeKey: 'wishlist',
    },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      href: isAuthenticated ? '/account' : '/signin',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile bottom navigation">
      <div className="bottom-nav__inner">
        {NAV.map(({ label, href, icon, badgeKey }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]));
          const badge = badgeKey === 'wishlist' ? wishlistCount : 0;

          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav__item${isActive ? ' active' : ''}`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="bottom-nav__icon">
                {icon}
                {badge > 0 && (
                  <span className="bottom-nav__badge" aria-hidden="true">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Cart button */}
        <button
          className={`bottom-nav__item${pathname === '/cart' ? ' active' : ''}`}
          onClick={openDrawer}
          aria-label={`Cart, ${totalCount} items`}
        >
          <span className="bottom-nav__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalCount > 0 && (
              <span className="bottom-nav__badge" aria-hidden="true">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </span>
          <span>Cart</span>
        </button>
      </div>
    </nav>
  );
}
