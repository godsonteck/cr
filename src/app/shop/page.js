'use client';

import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import {
  filterProducts,
  getAllCategories,
  getAllBrands,
  getPriceRange,
} from '@/services/productService';
import { SORT_OPTIONS } from '@/utils/constants';

/* ─── Helpers ────────────────────────────────────────── */

function FilterItem({ label, active, onClick, count }) {
  return (
    <button
      className={`filter-item${active ? ' active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="filter-item__dot" aria-hidden="true" />
      {label}
      {count !== undefined && (
        <span className="filter-item__count">({count})</span>
      )}
    </button>
  );
}

/* ─── Main content (uses useSearchParams — must be wrapped in Suspense) ─── */

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
  const [selectedSort, setSelectedSort]   = useState(sortParam);
  const [inStockOnly, setInStockOnly]     = useState(inStockParam);
  const [priceLimit, setPriceLimit]       = useState(maxPriceParam || 2000);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

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

  /* ── URL updaters ── */
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

  /* ── Page title ── */
  const pageTitle = categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : subcategoryParam || queryParam
    ? 'Search Results'
    : 'All Products';

  const hasActiveFilters = !!(categoryParam || subcategoryParam || brandParam
    || queryParam || inStockOnly || maxPriceParam);

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const SidebarContent = () => (
    <>
      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="filter-section">
          <button
            onClick={handleClearFilters}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
              color: 'var(--burgundy)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Clear All Filters
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="filter-section">
        <h3 className="filter-title">Category</h3>
        <div className="filter-list">
          <FilterItem
            label="All"
            active={!categoryParam}
            onClick={() => handleCategoryChange('')}
          />
          <FilterItem
            label="Skincare"
            active={categoryParam === 'skincare'}
            onClick={() => handleCategoryChange('skincare')}
          />
          <FilterItem
            label="Groceries"
            active={categoryParam === 'groceries'}
            onClick={() => handleCategoryChange('groceries')}
          />
        </div>
      </div>

      {/* Subcategories — skincare */}
      {categoryParam === 'skincare' && (
        <div className="filter-section">
          <h3 className="filter-title">Skincare Type</h3>
          <div className="filter-list">
            {['Face', 'Body', 'Hair', 'Fragrances'].map((sub) => (
              <FilterItem
                key={sub}
                label={sub}
                active={subcategoryParam === sub}
                onClick={() => handleSubcategoryChange(subcategoryParam === sub ? '' : sub)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subcategories — groceries */}
      {categoryParam === 'groceries' && (
        <div className="filter-section">
          <h3 className="filter-title">Grocery Type</h3>
          <div className="filter-list">
            {['Pantry', 'Beverages', 'Snacks', 'Household', 'Dairy & Fresh'].map((sub) => (
              <FilterItem
                key={sub}
                label={sub}
                active={subcategoryParam === sub}
                onClick={() => handleSubcategoryChange(subcategoryParam === sub ? '' : sub)}
              />
            ))}
          </div>
        </div>
      )}

      {/* In stock */}
      <div className="filter-section">
        <h3 className="filter-title">Availability</h3>
        <div className="filter-list">
          <FilterItem
            label="In Stock Only"
            active={inStockOnly}
            onClick={() => {
              const next = !inStockOnly;
              setInStockOnly(next);
              updateFilter('inStock', next ? 'true' : '');
            }}
          />
        </div>
      </div>

      {/* Price */}
      <div className="filter-section">
        <h3 className="filter-title">Max Price: GHS {priceLimit}</h3>
        <input
          type="range"
          min={priceLimits.min}
          max={priceLimits.max}
          value={priceLimit}
          step={10}
          style={{ width: '100%', accentColor: 'var(--burgundy)', marginTop: 'var(--space-3)' }}
          onChange={(e) => setPriceLimit(Number(e.target.value))}
          onMouseUp={() => updateFilter('maxPrice', priceLimit < priceLimits.max ? priceLimit : '')}
          onTouchEnd={() => updateFilter('maxPrice', priceLimit < priceLimits.max ? priceLimit : '')}
          aria-label={`Maximum price: GHS ${priceLimit}`}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          color: 'var(--text-faint)', marginTop: 'var(--space-2)',
        }}>
          <span>GHS {priceLimits.min}</span>
          <span>GHS {priceLimits.max}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="shop-page">
      {/* ── Page hero ── */}
      <div className="shop-hero">
        {(categoryParam || queryParam) && (
          <p className="shop-hero__eyebrow">
            {queryParam ? `Results for "${queryParam}"` : 'Collection'}
          </p>
        )}
        <h1 className="shop-hero__title">{pageTitle}</h1>
      </div>

      {/* ── Layout ── */}
      <div className="shop-layout">
        {/* Sidebar */}
        <aside
          className={`shop-sidebar${sidebarOpen ? ' open' : ''}`}
          aria-label="Product filters"
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div>
          {/* Toolbar */}
          <div className="shop-toolbar">
            <p className="shop-toolbar__count">
              <strong>{filteredProducts.length}</strong>{' '}
              product{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            <div className="shop-toolbar__actions">
              {/* Mobile filter toggle */}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSidebarOpen(v => !v)}
                aria-expanded={sidebarOpen}
                style={{ display: 'none' }} /* shown via media query override */
                id="mobile-filter-toggle"
              >
                {sidebarOpen ? '✕ Close Filters' : '⊟ Filters'}
              </button>

              {/* Sort */}
              <select
                className="input"
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  updateFilter('sort', e.target.value !== 'default' ? e.target.value : '');
                }}
                aria-label="Sort products"
                style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.5rem 2rem 0.5rem 0.75rem' }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div style={{
              padding: 'var(--space-16)',
              textAlign: 'center',
              color: 'var(--text-dim)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--warm-white)', marginBottom: 'var(--space-4)' }}>
                No products found
              </p>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Try adjusting your filters or search term.
              </p>
              <button className="btn btn-primary btn-sm" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="shop-grid" role="list" aria-label="Products">
              {filteredProducts.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile filter button visibility via CSS hack ─────── */
const mobileFilterStyle = `
  @media (max-width: 1024px) {
    #mobile-filter-toggle { display: inline-flex !important; }
  }
`;

export default function ShopPage() {
  return (
    <>
      <style>{mobileFilterStyle}</style>
      <Suspense fallback={
        <div style={{ padding: 'var(--space-32)', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading shop…
        </div>
      }>
        <ShopContent />
      </Suspense>
    </>
  );
}
