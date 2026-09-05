import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  ChevronRight,
  X,
  SlidersHorizontal,
  RotateCcw,
  Search
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DepartmentType } from '../../types';
import { ProductCard } from '../product/ProductCard';

export const ShopCatalogPage: React.FC = () => {
  const { products, categories, brands } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategoryObj = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find(c => c.slug === categorySlug);
  }, [categorySlug, categories]);

  const selectedDepartment = searchParams.get('dept') as DepartmentType | null;
  const selectedBrand = searchParams.get('brand') || 'All Brands';
  const selectedSort = searchParams.get('sort') || 'featured';
  const onlyInStock = searchParams.get('instock') === 'true';

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter products based on URL parameters
  const filteredProducts = useMemo(() => {
    return publishedProducts.filter((product) => {
      // Category filter
      if (currentCategoryObj) {
        if (product.category !== currentCategoryObj.id) return false;
      }
      // Department filter
      if (selectedDepartment) {
        if (product.department !== selectedDepartment) return false;
      }
      // Brand filter
      if (selectedBrand !== 'All Brands') {
        if (product.brand !== selectedBrand) return false;
      }
      // In-stock filter
      if (onlyInStock) {
        if (!product.inStock) return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-low') return a.price - b.price;
      if (selectedSort === 'price-high') return b.price - a.price;
      if (selectedSort === 'best-sellers') return b.reviewCount - a.reviewCount;
      return 0; // default featured
    });
  }, [currentCategoryObj, selectedDepartment, selectedBrand, selectedSort, onlyInStock, publishedProducts]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'All Brands' || value === 'featured') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 font-sans sm:space-y-7 sm:px-6 sm:py-10 lg:px-8">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
        <Link to="/" className="hover:text-[#1C1817] dark:hover:text-stone-100">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#1C1817]">Shop</Link>
        {currentCategoryObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1C1817] dark:text-stone-200 uppercase font-bold">{currentCategoryObj.name}</span>
          </>
        )}
      </nav>

      {/* Catalog Header */}
      <div className="pb-6 border-b border-[#E8E2DA] dark:border-[#2A2725]">
        <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">
          {currentCategoryObj ? currentCategoryObj.name : 'All Products & Essentials'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
          {currentCategoryObj
            ? currentCategoryObj.description
            : 'Explore our complete retail catalog across dermatological skincare, cosmetics, rice, oils, and daily household provisions.'}
        </p>
      </div>

      {/* Catalog Grid with Desktop Sidebar */}
      <div className="flex flex-col gap-8 lg:flex-row">

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-60 space-y-6 shrink-0 border-r border-[#E8E2DA] dark:border-[#2A2725] pr-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DA] dark:border-[#2A2725]">
            <span className="text-xs font-extrabold uppercase text-[#1C1817] dark:text-stone-100 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86D51]" />
              Filter Catalog
            </span>
            {(selectedDepartment || selectedBrand !== 'All Brands' || onlyInStock) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#C86D51] hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Department</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('dept', null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !selectedDepartment
                    ? 'bg-[#181214] text-white dark:bg-[#4a85f6] dark:text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Departments
              </button>
              <button
                onClick={() => updateFilter('dept', 'beauty')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedDepartment === 'beauty'
                    ? 'bg-[#181214] text-white dark:bg-[#4a85f6] dark:text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                Beauty &amp; Skincare
              </button>
              <button
                onClick={() => updateFilter('dept', 'groceries')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedDepartment === 'groceries'
                    ? 'bg-[#2e4c36] text-white dark:bg-[#52ba74] dark:text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                Groceries &amp; Essentials
              </button>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Brand</h4>
            <select
              value={selectedBrand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold p-2.5 rounded-xl border border-[var(--border-color)] outline-none focus:border-[var(--accent)]"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="pt-3 border-t border-[#E8E2DA] dark:border-[#2A2725]">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => updateFilter('instock', e.target.checked ? 'true' : null)}
                className="rounded accent-[#C86D51]"
              />
              In-Stock Only
            </label>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-4">

          {/* Toolbar (Mobile Filter toggle + Count + Sort) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] px-3 py-1.5 text-xs font-bold uppercase text-[var(--text-primary)]"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 sm:text-xs">
                <strong className="text-[#1C1817] dark:text-stone-100">{filteredProducts.length}</strong> products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 hidden sm:inline font-semibold">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="max-w-[10.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-soft)] px-2 py-2 text-[11px] font-semibold text-[var(--text-primary)] sm:max-w-none sm:px-2.5 sm:text-xs"
              >
                <option value="featured">Featured</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isMobileFilterOpen && (
            <div className="space-y-4 rounded-2xl border border-[#E8E2DA] bg-white p-4 shadow-sm dark:border-[#2A2725] dark:bg-[#1A1817] lg:hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">Filter catalog</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters" className="rounded-full p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([['', 'All'], ['beauty', 'Beauty'], ['groceries', 'Groceries']] as const).map(([value, label]) => (
                  <button key={value || 'all'} onClick={() => updateFilter('dept', value || null)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${selectedDepartment === (value || null) ? 'border-[#1C1817] bg-[#1C1817] text-white' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-300'}`}>{label}</button>
                ))}
              </div>
              <select value={selectedBrand} onChange={e => updateFilter('brand', e.target.value)} className="w-full rounded-xl border border-[#E8E2DA] bg-white p-2.5 text-xs font-semibold dark:border-[#2A2725] dark:bg-[#1C1A19]">
                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300"><input type="checkbox" checked={onlyInStock} onChange={e => updateFilter('instock', e.target.checked ? 'true' : null)} className="rounded accent-[#C86D51]" />In-stock only</label>
              <button onClick={clearAllFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86D51]"><RotateCcw className="h-3 w-3" />Reset filters</button>
            </div>
          )}

          {/* Active Filter Badges */}
          {(selectedDepartment || selectedBrand !== 'All Brands' || onlyInStock) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {selectedDepartment && (
                <span className="bg-[#1C1817] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                  Dept: {selectedDepartment}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('dept', null)} />
                </span>
              )}
              {selectedBrand !== 'All Brands' && (
                <span className="bg-[#C86D51] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                  Brand: {selectedBrand}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('brand', null)} />
                </span>
              )}
              {onlyInStock && (
                <span className="bg-[#4A5D4E] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                  In Stock Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('instock', null)} />
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A1817] p-12 rounded border border-[#E8E2DA] text-center space-y-3">
              <h3 className="text-base font-bold text-[#1C1817] dark:text-stone-200">No Products Found</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                No catalog items match your selected filters. Try clearing your search parameters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[#1C1817] text-white text-xs font-bold uppercase rounded"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export const SearchResultsPage: React.FC = () => {
  const { products } = useStore();
  const publishedProducts = products.filter(product => product.isPublished !== false);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  React.useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  };

  const matchedProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return publishedProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.highlights.some(h => h.toLowerCase().includes(q))
      );
    });
  }, [query, publishedProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-soft)] p-1.5 shadow-[var(--shadow-soft)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
        <Search className="ml-3 h-4 w-4 shrink-0 text-[var(--text-subtle)]" />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
        />
        <button type="submit" aria-label="Submit search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] transition hover:bg-[var(--accent)]">
          <Search className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="pb-4 border-b border-[#E8E2DA] dark:border-[#2A2725]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase">
          Search Results for &ldquo;<span className="text-[#C86D51]">{query}</span>&rdquo;
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Found <strong>{matchedProducts.length}</strong> matching products.
        </p>
      </div>

      {matchedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
          {matchedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1817] p-12 rounded border border-[#E8E2DA] text-center space-y-4">
          <Search className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-[#1C1817] dark:text-stone-200">No Results Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            We couldn&apos;t find any items matching &ldquo;{query}&rdquo;.
          </p>
          <Link to="/shop" className="inline-block px-4 py-2 bg-[#1C1817] text-white text-xs font-bold uppercase rounded">
            Browse Entire Catalog
          </Link>
        </div>
      )}
    </div>
  );
};
