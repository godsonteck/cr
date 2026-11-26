import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import type { CategoryConfig, DepartmentType, Product } from '../../types';
import { readCatalogFilters } from '../../lib/catalog';

interface CatalogControlsProps {
  products: Product[];
  categories: CategoryConfig[];
  resultCount: number;
  totalCount: number;
  loading?: boolean;
  fixedDepartment?: DepartmentType;
  fixedCategorySlug?: string;
}

export function CatalogControls({
  products,
  categories,
  resultCount,
  totalCount,
  loading = false,
  fixedDepartment,
  fixedCategorySlug,
}: CatalogControlsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const filters = readCatalogFilters(searchParams, { department: fixedDepartment, categorySlug: fixedCategorySlug });
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const brandOptions = useMemo(() => {
    const names = new Set(products.map(product => product.brand.trim()).filter(Boolean));
    return ['All Brands', ...Array.from(names).sort((left, right) => left.localeCompare(right))];
  }, [products]);

  const categoryOptions = useMemo(() => categories.filter(category => (
    category.isActive && (!filters.department || category.department === filters.department)
  )), [categories, filters.department]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    const defaultValue = key === 'brand' ? 'All Brands' : key === 'sort' ? 'featured' : '';
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);

    if (key === 'dept' && filters.categorySlug) {
      const category = categories.find(item => item.slug === filters.categorySlug);
      if (value && category && category.department !== value) next.delete('category');
    }

    if (fixedCategorySlug && (key === 'category' || key === 'dept')) {
      navigate({ pathname: '/shop', search: next.toString() });
      return;
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    if (fixedCategorySlug) navigate('/shop');
    else setSearchParams(new URLSearchParams());
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateFilter('q', searchInput.trim() || null);
  };

  const hasActiveFilters = Boolean(
    query
    || filters.categorySlug
    || (!fixedDepartment && filters.department)
    || filters.brand !== 'All Brands'
    || filters.onlyInStock
    || filters.sort !== 'featured'
  );

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-sm sm:p-4" aria-label="Product search and filters">
      <form role="search" onSubmit={submitSearch} className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-1.5 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
        <Search className="ml-2 h-4 w-4 shrink-0 text-[var(--text-subtle)]" aria-hidden="true" />
        <input
          type="search"
          value={searchInput}
          onChange={event => setSearchInput(event.target.value)}
          placeholder="Search by product, brand, ingredient, or size"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
        />
        {searchInput && (
          <button type="button" onClick={() => { setSearchInput(''); updateFilter('q', null); }} aria-label="Clear product search" className="rounded-full p-2 text-[var(--text-subtle)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="rounded-lg bg-[var(--text-primary)] px-3 py-2 text-xs font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)]">
          Search
        </button>
      </form>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        {!fixedDepartment && (
          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-subtle)]">
            Department
            <select value={filters.department || ''} onChange={event => updateFilter('dept', event.target.value || null)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2.5 text-xs font-semibold normal-case tracking-normal text-[var(--text-primary)]">
              <option value="">All departments</option>
              <option value="beauty">Beauty &amp; Skincare</option>
              <option value="groceries">Groceries &amp; Essentials</option>
            </select>
          </label>
        )}
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-subtle)]">
          Category
          <select value={filters.categorySlug} onChange={event => updateFilter('category', event.target.value || null)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2.5 text-xs font-semibold normal-case tracking-normal text-[var(--text-primary)]">
            <option value="">All categories</option>
            {categoryOptions.map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-subtle)]">
          Brand
          <select value={filters.brand} onChange={event => updateFilter('brand', event.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2.5 text-xs font-semibold normal-case tracking-normal text-[var(--text-primary)]">
            {brandOptions.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-subtle)]">
          Sort by
          <select value={filters.sort} onChange={event => updateFilter('sort', event.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-2.5 text-xs font-semibold normal-case tracking-normal text-[var(--text-primary)]">
            <option value="featured">Featured</option>
            <option value="newest">Newest first</option>
            <option value="best-sellers">Best sellers</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
        <label className="flex items-end gap-2 rounded-xl px-2 pb-2.5 text-xs font-semibold text-[var(--text-primary)]">
          <input type="checkbox" checked={filters.onlyInStock} onChange={event => updateFilter('instock', event.target.checked ? 'true' : null)} className="h-4 w-4 rounded accent-[var(--accent)]" />
          In stock only
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]" aria-live="polite">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
          {loading ? 'Loading products...' : `${resultCount} ${resultCount === 1 ? 'product' : 'products'}${resultCount !== totalCount ? ` of ${totalCount}` : ''}`}
        </p>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline">
            <RotateCcw className="h-3.5 w-3.5" /> Reset filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2" aria-label="Active filters">
          {query && <FilterBadge label={`Search: ${query}`} onRemove={() => updateFilter('q', null)} />}
          {filters.categorySlug && <FilterBadge label={`Category: ${categories.find(category => category.slug === filters.categorySlug)?.name || filters.categorySlug}`} onRemove={() => updateFilter('category', null)} />}
          {!fixedDepartment && filters.department && <FilterBadge label={`Department: ${filters.department}`} onRemove={() => updateFilter('dept', null)} />}
          {filters.brand !== 'All Brands' && <FilterBadge label={`Brand: ${filters.brand}`} onRemove={() => updateFilter('brand', null)} />}
          {filters.onlyInStock && <FilterBadge label="In stock only" onRemove={() => updateFilter('instock', null)} />}
          {filters.sort !== 'featured' && <FilterBadge label={`Sort: ${filters.sort}`} onRemove={() => updateFilter('sort', null)} />}
        </div>
      )}
      <span className="sr-only">Current page: {location.pathname}</span>
    </section>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-primary)]">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="rounded-full p-0.5 hover:bg-[var(--border-color)]">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function CatalogEmptyState({ title = 'No products found', message = 'No products match these filters. Try another search or reset the filters.' }: { title?: string; message?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const clearFilters = () => {
    if (location.pathname.startsWith('/category/')) navigate('/shop');
    else setSearchParams(new URLSearchParams());
  };

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-12 text-center">
      <Search className="mx-auto h-7 w-7 text-[var(--text-subtle)]" />
      <h2 className="mt-3 text-base font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{message}</p>
      <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-xs font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)]">
        Reset filters
      </button>
      {searchParams.toString() && <span className="sr-only">Active parameters: {searchParams.toString()}</span>}
    </div>
  );
}
