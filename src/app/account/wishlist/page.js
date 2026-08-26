'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { items, count } = useWishlist();

  const breadcrumbs = [
    { label: 'My Account', href: '/account' },
    { label: 'Saved Wishlist' },
  ];

  return (
    <div className="wishlist-page">
      <div className="container">
        <Breadcrumb items={breadcrumbs} />

        <div className="wishlist-header">
          <h1 className="heading-2">My Saved Wishlist</h1>
          <p className="wishlist-count-text">
            {count} item{count !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            }
            title="Your Wishlist is Empty"
            description="Explore our skincare essentials and groceries. Click the heart icon on any product to save it here."
            actionLabel="Explore Shop"
            actionHref="/shop"
          />
        ) : (
          <ProductGrid products={items} columns={4} />
        )}
      </div>

      <style jsx>{`
        .wishlist-page {
          padding-top: calc(var(--header-h, 74px) + 2rem);
          padding-bottom: var(--space-20);
        }
        .wishlist-header {
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border-light);
        }
        .wishlist-count-text {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
