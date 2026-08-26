'use client';

import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';

export default function ProductGrid({
  products = [],
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search query or filter options.',
  columns = 4,
}) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Reset Filters"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className={`product-grid cols-${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <style jsx>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }
        @media (min-width: 640px) {
          .product-grid {
            gap: var(--space-4);
          }
        }
        @media (min-width: 768px) {
          .product-grid.cols-3,
          .product-grid.cols-4 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .product-grid.cols-4 {
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-6);
          }
          .product-grid.cols-3 {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-6);
          }
        }
      `}</style>
    </div>
  );
}
