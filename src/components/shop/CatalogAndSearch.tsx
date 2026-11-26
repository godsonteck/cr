import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { filterCatalogProducts, readCatalogFilters } from '../../lib/catalog';
import { storefrontListings } from '../../lib/storefrontListings';
import { ProductCard } from '../product/ProductCard';
import { CatalogControls, CatalogEmptyState } from './CatalogControls';

export const ShopCatalogPage = () => {
  const { products, categories, loading } = useStore();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const publishedProducts = useMemo(() => storefrontListings(products), [products]);
  const filters = useMemo(() => readCatalogFilters(searchParams, { categorySlug }), [searchParams, categorySlug]);
  const currentCategory = useMemo(() => (
    filters.categorySlug ? categories.find(category => category.slug === filters.categorySlug) || null : null
  ), [filters.categorySlug, categories]);
  const filteredProducts = useMemo(() => (
    filterCatalogProducts(publishedProducts, filters, categories)
  ), [publishedProducts, filters, categories]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 font-sans sm:px-6 sm:py-10 lg:px-8">
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[var(--text-primary)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-[var(--text-primary)]">Shop</Link>
        {currentCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold uppercase text-[var(--text-primary)]">{currentCategory.name}</span>
          </>
        )}
      </nav>

      <header className="border-b border-[var(--border-color)] pb-6">
        <h1 className="font-serif text-4xl tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
          {currentCategory?.name || 'Find your everyday'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
          {currentCategory?.description || 'Search and filter skincare, beauty, fragrance, pantry basics, and useful things for home.'}
        </p>
      </header>

      <CatalogControls
        products={publishedProducts}
        categories={categories}
        resultCount={filteredProducts.length}
        totalCount={publishedProducts.length}
        loading={loading}
        fixedCategorySlug={categorySlug || undefined}
      />

      {loading ? (
        <CatalogGridSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <CatalogEmptyState />
      )}
    </div>
  );
};

export const SearchResultsPage = () => {
  const { products, categories, loading } = useStore();
  const [searchParams] = useSearchParams();
  const publishedProducts = useMemo(() => storefrontListings(products), [products]);
  const filters = useMemo(() => readCatalogFilters(searchParams), [searchParams]);
  const filteredProducts = useMemo(() => (
    filterCatalogProducts(publishedProducts, filters, categories)
  ), [publishedProducts, filters, categories]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 font-sans sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-[var(--border-color)] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Catalog search</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
          {filters.query ? <>Results for &ldquo;<span className="text-[var(--accent)]">{filters.query}</span>&rdquo;</> : 'Search the catalog'}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Search by product name, brand, ingredient, category, or pack size, then narrow the results.</p>
      </header>

      <CatalogControls
        products={publishedProducts}
        categories={categories}
        resultCount={filteredProducts.length}
        totalCount={publishedProducts.length}
        loading={loading}
      />

      {loading ? (
        <CatalogGridSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <CatalogEmptyState
          message={filters.query ? `No products match “${filters.query}” with the selected filters. Try a different search or reset the filters.` : undefined}
        />
      )}
    </div>
  );
};

function CatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3 animate-pulse">
          <div className="aspect-square rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
        </div>
      ))}
    </div>
  );
}
