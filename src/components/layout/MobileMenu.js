'use client';

import React from 'react';
import Link from 'next/link';
import Drawer from '@/components/ui/Drawer';
import { useWishlist } from '@/context/WishlistContext';
import { BUSINESS } from '@/utils/constants';

export default function MobileMenu({ isOpen, onClose }) {
  const { count: wishlistCount } = useWishlist();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left" title="Menu">
      <div className="mobile-nav-content">
        <div className="mobile-section">
          <div className="mobile-section-title">Shop by Category</div>
          <div className="mobile-cat-grid">
            <Link
              href="/shop?category=skincare"
              onClick={handleLinkClick}
              className="cat-pill cat-skincare"
            >
              <span className="cat-icon">✨</span>
              <span className="cat-name">Skincare</span>
            </Link>
            <Link
              href="/shop?category=groceries"
              onClick={handleLinkClick}
              className="cat-pill cat-groceries"
            >
              <span className="cat-icon">🛒</span>
              <span className="cat-name">Groceries</span>
            </Link>
          </div>
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Navigation</div>
          <ul className="mobile-link-list">
            <li>
              <Link href="/" onClick={handleLinkClick} className="mobile-link">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" onClick={handleLinkClick} className="mobile-link">
                All Products (Catalogue)
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" onClick={handleLinkClick} className="mobile-link">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/shop?badge=sale" onClick={handleLinkClick} className="mobile-link">
                Special Offers
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={handleLinkClick} className="mobile-link">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={handleLinkClick} className="mobile-link">
                Location & Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Customer Account</div>
          <ul className="mobile-link-list">
            <li>
              <Link href="/account" onClick={handleLinkClick} className="mobile-link">
                My Dashboard
              </Link>
            </li>
            <li>
              <Link href="/account/orders" onClick={handleLinkClick} className="mobile-link">
                Order Tracking
              </Link>
            </li>
            <li>
              <Link href="/account/wishlist" onClick={handleLinkClick} className="mobile-link">
                Saved Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            </li>
          </ul>
        </div>

        <div className="mobile-location-info">
          <div className="loc-label">Physical Store</div>
          <div className="loc-text">{BUSINESS.location}</div>
        </div>
      </div>

      <style jsx>{`
        .mobile-nav-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .mobile-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .mobile-section-title {
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--color-text-tertiary);
        }
        .mobile-cat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        .cat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          transition: all var(--duration-fast);
        }
        .cat-pill:hover {
          border-color: var(--color-primary);
          background-color: var(--color-surface);
        }
        .cat-icon {
          font-size: 20px;
        }
        .cat-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
        }
        .mobile-link-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-link {
          display: block;
          padding: var(--space-2) 0;
          font-size: var(--text-base);
          font-weight: var(--weight-medium);
          color: var(--color-text);
          border-bottom: 1px solid var(--color-border-light);
        }
        .mobile-link:hover {
          color: var(--color-primary);
        }
        .mobile-location-info {
          margin-top: var(--space-4);
          padding: var(--space-3);
          background-color: var(--color-bg-alt);
          border-radius: var(--radius-md);
        }
        .loc-label {
          font-size: 10px;
          font-weight: var(--weight-bold);
          text-transform: uppercase;
          color: var(--color-text-secondary);
        }
        .loc-text {
          font-size: var(--text-xs);
          color: var(--color-text);
          margin-top: 2px;
        }
      `}</style>
    </Drawer>
  );
}
