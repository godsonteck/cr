'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { filterProducts, getPriceRange } from '@/services/productService';
import { SORT_OPTIONS } from '@/utils/constants';

function ShopContent() {
  const params = useSearchParams();
  const router = useRouter();

  const category = params.get('category') || '';
  const query = params.get('q') || '';
  const sort = params.get('sort') || 'default';
  const inStock = params.get('inStock') === 'true';

  const ranges = getPriceRange();
  const maxPrice = Number(params.get('maxPrice')) || ranges.max;

  const products = useMemo(() => {
    return filterProducts({
      category: category || undefined,
      query: query || undefined,
      maxPrice,
      inStockOnly: inStock || undefined,
      sortBy: sort,
    });
  }, [category, query, maxPrice, inStock, sort]);

  const push = useCallback((changes = {}) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        next.set(key, String(value));
      } else {
        next.delete(key);
      }
    });
    router.push(`/shop${next.toString() ? `?${next}` : ''}`);
  }, [params, router]);

  return (
    <main className="shop-page">
      {/* ── Page Header ── */}
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">
            {category === 'skincare'
              ? 'Skincare & Beauty'
              : category === 'groceries'
              ? 'Groceries & Essentials'
              : query
              ? `Results for "${query}"`
              : 'All Products'}
          </h1>
          <p className="shop-sub">
            Authentic skincare and everyday essentials in Botwe, Accra. Same-day delivery available.
          </p>

          {/* Clean Department Switcher */}
          <div className="dept-tabs">
            <button
              type="button"
              className={`dept-tab ${!category ? 'is-active' : ''}`}
              onClick={() => push({ category: '' })}
            >
              All Products
            </button>
            <button
              type="button"
              className={`dept-tab ${category === 'skincare' ? 'is-active' : ''}`}
              onClick={() => push({ category: 'skincare' })}
            >
              Skincare &amp; Beauty
            </button>
            <button
              type="button"
              className={`dept-tab ${category === 'groceries' ? 'is-active' : ''}`}
              onClick={() => push({ category: 'groceries' })}
            >
              Groceries &amp; Essentials
            </button>
          </div>
        </div>
      </div>

      {/* ── Shop Grid & Controls ── */}
      <div className="container shop-body">
        <div className="controls-row">
          <span className="count-label">{products.length} product{products.length !== 1 ? 's' : ''} available</span>
          
          <div className="sort-wrap">
            <label htmlFor="shop-sort">Sort by:</label>
            <select
              id="shop-sort"
              className="sort-select"
              value={sort}
              onChange={(e) => push({ sort: e.target.value === 'default' ? '' : e.target.value })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try clearing your search or switching departments.</p>
            <button onClick={() => router.push('/shop')} className="btn-reset">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .shop-page {
          background: #FFFFFF;
          color: #111111;
          font-family: var(--font-primary, sans-serif);
          padding-bottom: 5rem;
        }

        .container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .shop-header {
          padding: 3rem 0 2rem;
          background: #FAFAFA;
          border-bottom: 1px solid #EAEAEA;
          margin-bottom: 2.5rem;
        }
        .shop-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          color: #111111;
          margin: 0 0 0.5rem;
        }
        .shop-sub {
          font-size: 0.95rem;
          color: #666666;
          margin: 0 0 1.5rem;
          max-width: 500px;
        }

        .dept-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dept-tab {
          background: #FFFFFF;
          border: 1px solid #D5D5D5;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #444444;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dept-tab:hover {
          border-color: #111111;
          color: #111111;
        }
        .dept-tab.is-active {
          background: #111111;
          color: #FFFFFF;
          border-color: #111111;
        }

        .shop-body {}
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #EAEAEA;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .count-label {
          font-size: 0.88rem;
          color: #666666;
        }
        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #444444;
        }
        .sort-select {
          padding: 6px 12px;
          border: 1px solid #CCCCCC;
          border-radius: 6px;
          background: #FFFFFF;
          font-size: 0.85rem;
          color: #111111;
          outline: none;
          cursor: pointer;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          background: #FAFAFA;
          border-radius: 8px;
          border: 1px solid #EAEAEA;
        }
        .empty-state h3 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem;
        }
        .empty-state p {
          color: #666666;
          margin: 0 0 1.25rem;
        }
        .btn-reset {
          padding: 10px 20px;
          background: #111111;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 960px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
        @media (max-width: 500px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }
      `}</style>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <ShopContent />
    </Suspense>
  );
}
