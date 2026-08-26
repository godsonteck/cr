'use client';

import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import {
  filterProducts,
  getPriceRange,
} from '@/services/productService';
import { SORT_OPTIONS } from '@/utils/constants';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── URL params ── */
  const categoryParam    = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const queryParam       = searchParams.get('q') || '';
  const brandParam       = searchParams.get('brand') || '';
  const sortParam        = searchParams.get('sort') || 'default';
  const inStockParam     = searchParams.get('inStock') === 'true';
  const maxPriceParam    = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  /* ── Local state ── */
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [inStockOnly, setInStockOnly]   = useState(inStockParam);
  const [priceLimit, setPriceLimit]     = useState(maxPriceParam || 2000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const priceLimits = getPriceRange();

  useEffect(() => {
    setSelectedSort(sortParam);
    setInStockOnly(inStockParam);
  }, [sortParam, inStockParam]);

  /* ── Filter logic ── */
  const filteredProducts = useMemo(() =>
    filterProducts({
      category:    categoryParam || undefined,
      subcategory: subcategoryParam || undefined,
      brand:       brandParam || undefined,
      query:       queryParam || undefined,
      maxPrice:    priceLimit,
      inStockOnly: inStockOnly || undefined,
      sortBy:      selectedSort,
    }),
    [categoryParam, subcategoryParam, brandParam, queryParam, priceLimit, inStockOnly, selectedSort]
  );

  /* ── URL Updaters ── */
  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  const handleCategoryChange = useCallback((slug) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    if (queryParam) params.set('q', queryParam);
    router.push(`/shop?${params.toString()}`);
  }, [queryParam, router]);

  const handleSubcategoryChange = useCallback((sub) => {
    const params = new URLSearchParams();
    if (categoryParam) params.set('category', categoryParam);
    if (sub) params.set('subcategory', sub);
    if (queryParam) params.set('q', queryParam);
    router.push(`/shop?${params.toString()}`);
  }, [categoryParam, queryParam, router]);

  const handleClearFilters = useCallback(() => {
    router.push('/shop');
    setSelectedSort('default');
    setInStockOnly(false);
    setPriceLimit(priceLimits.max);
  }, [router, priceLimits.max]);

  /* ── Page title & subtitle ── */
  const pageTitle = categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : subcategoryParam || queryParam
    ? `Results for "${queryParam || subcategoryParam}"`
    : 'All Products';

  const hasActiveFilters = !!(categoryParam || subcategoryParam || brandParam || queryParam || inStockOnly || (maxPriceParam && maxPriceParam < priceLimits.max));

  const FilterSidebar = () => (
    <div className="cr-filter-tray">
      {hasActiveFilters && (
        <div className="cr-filter-clear-block">
          <button type="button" onClick={handleClearFilters} className="cr-btn-clear-filters">
            <span>✕</span> Clear All Filters
          </button>
        </div>
      )}

      {/* Category Section */}
      <div className="cr-filter-group">
        <h4 className="cr-filter-heading">Category</h4>
        <div className="cr-filter-options">
          <button
            type="button"
            className={`cr-filter-pill${!categoryParam ? ' cr-filter-pill--active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </button>
          <button
            type="button"
            className={`cr-filter-pill${categoryParam === 'skincare' ? ' cr-filter-pill--active' : ''}`}
            onClick={() => handleCategoryChange('skincare')}
          >
            Skincare & Body
          </button>
          <button
            type="button"
            className={`cr-filter-pill${categoryParam === 'groceries' ? ' cr-filter-pill--active' : ''}`}
            onClick={() => handleCategoryChange('groceries')}
          >
            Groceries & Household
          </button>
        </div>
      </div>

      {/* Subcategory: Skincare */}
      {categoryParam === 'skincare' && (
        <div className="cr-filter-group">
          <h4 className="cr-filter-heading">Skincare Type</h4>
          <div className="cr-filter-options">
            {['Face', 'Body', 'Hair', 'Fragrances'].map((sub) => (
              <button
                key={sub}
                type="button"
                className={`cr-filter-pill${subcategoryParam === sub ? ' cr-filter-pill--active' : ''}`}
                onClick={() => handleSubcategoryChange(subcategoryParam === sub ? '' : sub)}
              >
                {sub} Care
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subcategory: Groceries */}
      {categoryParam === 'groceries' && (
        <div className="cr-filter-group">
          <h4 className="cr-filter-heading">Pantry Type</h4>
          <div className="cr-filter-options">
            {['Pantry', 'Beverages', 'Snacks', 'Household'].map((sub) => (
              <button
                key={sub}
                type="button"
                className={`cr-filter-pill${subcategoryParam === sub ? ' cr-filter-pill--active' : ''}`}
                onClick={() => handleSubcategoryChange(subcategoryParam === sub ? '' : sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="cr-filter-group">
        <h4 className="cr-filter-heading">Availability</h4>
        <label className="cr-filter-checkbox-label">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              const next = e.target.checked;
              setInStockOnly(next);
              updateFilter('inStock', next ? 'true' : '');
            }}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price Slider */}
      <div className="cr-filter-group">
        <div className="cr-filter-price-header">
          <h4 className="cr-filter-heading">Max Price</h4>
          <span className="cr-price-indicator">GHS {priceLimit}</span>
        </div>
        <input
          type="range"
          min={priceLimits.min}
          max={priceLimits.max}
          value={priceLimit}
          step={10}
          className="cr-range-slider"
          onChange={(e) => setPriceLimit(Number(e.target.value))}
          onMouseUp={() => updateFilter('maxPrice', priceLimit < priceLimits.max ? priceLimit : '')}
          onTouchEnd={() => updateFilter('maxPrice', priceLimit < priceLimits.max ? priceLimit : '')}
          aria-label={`Maximum price: GHS ${priceLimit}`}
        />
        <div className="cr-range-extremes">
          <span>GHS {priceLimits.min}</span>
          <span>GHS {priceLimits.max}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cr-shop-view">
      {/* ── Shop Header Hero ── */}
      <div className="cr-shop-banner">
        <div className="cr-shop-container">
          <div className="cr-shop-banner-inner">
            <span className="cr-shop-breadcrumb">Home / Shop {categoryParam ? `/ ${pageTitle}` : ''}</span>
            <h1 className="cr-shop-title">{pageTitle}</h1>
            <p className="cr-shop-sub">
              Browse authentic skincare, lotions, body oils, and household essentials.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Catalog Workspace ── */}
      <div className="cr-shop-container">
        <div className="cr-shop-grid-layout">
          {/* Desktop Left Sidebar */}
          <aside className="cr-shop-sidebar" aria-label="Catalog Filters">
            <FilterSidebar />
          </aside>

          {/* Main Content Area */}
          <main className="cr-shop-main">
            {/* Toolbar */}
            <div className="cr-shop-toolbar">
              <div className="cr-toolbar-info">
                <span className="cr-product-count">
                  Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              <div className="cr-toolbar-actions">
                {/* Mobile Filter Sheet Trigger */}
                <button
                  type="button"
                  className="cr-mobile-filter-btn"
                  onClick={() => setMobileFilterOpen(true)}
                  id="mobile-filter-open-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="cr-sort-wrapper">
                  <select
                    className="cr-sort-select"
                    value={selectedSort}
                    onChange={(e) => {
                      setSelectedSort(e.target.value);
                      updateFilter('sort', e.target.value !== 'default' ? e.target.value : '');
                    }}
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="cr-empty-shop">
                <div className="cr-empty-icon">🔍</div>
                <h3 className="cr-empty-title">No products match your selection</h3>
                <p className="cr-empty-desc">
                  Try clearing some filters or searching for another beauty or grocery product.
                </p>
                <button type="button" className="cr-btn-reset" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="cr-catalog-grid" role="list" aria-label="Products Catalog">
                {filteredProducts.map((product) => (
                  <div key={product.id} role="listitem" className="cr-catalog-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Modal Sheet ── */}
      {mobileFilterOpen && (
        <div className="cr-modal-backdrop" onClick={() => setMobileFilterOpen(false)}>
          <div className="cr-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3>Filter Products</h3>
              <button
                type="button"
                className="cr-modal-close"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            <div className="cr-modal-body">
              <FilterSidebar />
            </div>
            <div className="cr-modal-footer">
              <button
                type="button"
                className="cr-btn-apply-filters"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cr-shop-view {
          padding-top: var(--header-h, 74px);
          background: #FFFFFF;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        .cr-shop-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 4vw, 2.5rem);
        }

        /* ── Shop Banner ── */
        .cr-shop-banner {
          background: #FAF6F8;
          border-bottom: 1px solid #F0E8EC;
          padding: clamp(2rem, 4vw, 3.5rem) 0;
          margin-bottom: 2.5rem;
        }

        .cr-shop-breadcrumb {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #8C7C84;
          display: block;
          margin-bottom: 0.5rem;
        }

        .cr-shop-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 3.8vw, 3rem);
          font-weight: 700;
          color: #1A0D14;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }

        .cr-shop-sub {
          font-size: 0.92rem;
          color: #63545B;
          max-width: 50ch;
        }

        /* ── Grid Layout ── */
        .cr-shop-grid-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* ── Filter Sidebar ── */
        .cr-shop-sidebar {
          position: sticky;
          top: calc(var(--header-h, 74px) + 1.5rem);
          background: #FAF8F9;
          border: 1px solid #EBE0E6;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .cr-filter-tray {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cr-filter-clear-block {
          padding-bottom: 1rem;
          border-bottom: 1px solid #EBE0E6;
        }

        .cr-btn-clear-filters {
          background: none;
          border: none;
          color: #7B2347;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cr-filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cr-filter-heading {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1A0D14;
        }

        .cr-filter-options {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cr-filter-pill {
          background: #FFFFFF;
          border: 1px solid #E2D6DC;
          border-radius: 4px;
          padding: 0.5rem 0.8rem;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 500;
          color: #3D2D35;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cr-filter-pill:hover {
          border-color: #7B2347;
          color: #7B2347;
        }

        .cr-filter-pill--active {
          background: #7B2347 !important;
          color: #FFFFFF !important;
          border-color: #7B2347 !important;
          font-weight: 600;
        }

        .cr-filter-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: #3D2D35;
          cursor: pointer;
        }

        .cr-filter-checkbox-label input[type='checkbox'] {
          accent-color: #7B2347;
          width: 16px;
          height: 16px;
        }

        .cr-filter-price-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cr-price-indicator {
          font-size: 0.82rem;
          font-weight: 700;
          color: #7B2347;
        }

        .cr-range-slider {
          width: 100%;
          accent-color: #7B2347;
          cursor: pointer;
        }

        .cr-range-extremes {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #8C7C84;
        }

        /* ── Toolbar ── */
        .cr-shop-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #F0E8EC;
          gap: 1rem;
        }

        .cr-product-count {
          font-size: 0.88rem;
          color: #55454C;
        }

        .cr-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cr-mobile-filter-btn {
          display: none;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.9rem;
          background: #FAF8F9;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1A0D14;
          cursor: pointer;
        }

        .cr-sort-select {
          padding: 0.5rem 1rem;
          background: #FFFFFF;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1A0D14;
          cursor: pointer;
          outline: none;
        }

        .cr-sort-select:focus {
          border-color: #7B2347;
        }

        /* ── Catalog Grid ── */
        .cr-catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .cr-catalog-item {
          height: 100%;
        }

        /* ── Empty State ── */
        .cr-empty-shop {
          padding: 4rem 2rem;
          text-align: center;
          background: #FAF8F9;
          border: 1px dashed #D8CAD0;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .cr-empty-icon {
          font-size: 3rem;
          opacity: 0.4;
        }

        .cr-empty-title {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: #1A0D14;
        }

        .cr-empty-desc {
          font-size: 0.88rem;
          color: #7A6A72;
          max-width: 38ch;
        }

        .cr-btn-reset {
          padding: 0.75rem 1.5rem;
          background: #7B2347;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* ── Mobile Modal Sheet ── */
        .cr-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26, 13, 20, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .cr-modal-sheet {
          width: min(380px, 90vw);
          height: 100%;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        }

        .cr-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #F0E8EC;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cr-modal-header h3 {
          font-family: var(--font-display, serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A0D14;
        }

        .cr-modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #7A6A72;
          cursor: pointer;
        }

        .cr-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .cr-modal-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #F0E8EC;
          background: #FAF8F9;
        }

        .cr-btn-apply-filters {
          width: 100%;
          padding: 0.85rem;
          background: #7B2347;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* ── Breakpoints ── */
        @media (max-width: 1024px) {
          .cr-shop-grid-layout {
            grid-template-columns: 1fr;
          }
          .cr-shop-sidebar {
            display: none;
          }
          .cr-mobile-filter-btn {
            display: inline-flex;
          }
          .cr-catalog-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .cr-catalog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B2347', fontWeight: 600 }}>
          Loading Catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
