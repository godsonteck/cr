import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, Eye, Download, Package, AlertTriangle, X, Check, Tag, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Product, CategoryType } from '../../../types';
import { isRenderableProductImage } from '../../../lib/productImages';
import {
  filterAndSortAdminProducts,
  type AdminProductSort,
  type AdminPublicationFilter,
  type AdminStockFilter,
} from '../../../lib/adminCatalog';
import { AdminMetricCard, AdminPageHeader } from '../components/AdminPrimitives';
import { BarcodeLabelsModal } from '../../../../POS/components/BarcodeLabelsModal';

interface ProductsScreenProps {
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const AdminProductsScreen: React.FC<ProductsScreenProps> = ({
  onAddProduct,
  onEditProduct,
  onViewProduct,
}) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'beauty' | 'groceries'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryType>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<AdminStockFilter>('all');
  const [publicationFilter, setPublicationFilter] = useState<AdminPublicationFilter>('all');
  const [sortBy, setSortBy] = useState<AdminProductSort>('featured');
  const [loading, setLoading] = useState(false);
  const [migratingImages, setMigratingImages] = useState(false);
  // Per-product delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Barcode labels modal
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeInitialProductId, setBarcodeInitialProductId] = useState<string | undefined>(undefined);

  const brandOptions = useMemo(() => (
    Array.from(new Set((store.products || []).map(product => product.brand.trim()).filter(Boolean)))
      .sort((left, right) => left.localeCompare(right))
  ), [store.products]);

  const categoryOptions = useMemo(() => (
    (store.categories || []).filter(category => category.isActive)
  ), [store.categories]);

  const filteredProducts = useMemo(() => (
    filterAndSortAdminProducts(store.products || [], {
      query: searchTerm,
      department: departmentFilter,
      category: categoryFilter,
      brand: brandFilter,
      stock: stockFilter,
      publication: publicationFilter,
      sort: sortBy,
    })
  ), [store.products, searchTerm, departmentFilter, categoryFilter, brandFilter, stockFilter, publicationFilter, sortBy]);

  const hasActiveFilters = Boolean(
    searchTerm.trim()
    || departmentFilter !== 'all'
    || categoryFilter !== 'all'
    || brandFilter !== 'all'
    || stockFilter !== 'all'
    || publicationFilter !== 'all'
    || sortBy !== 'featured'
  );

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setStockFilter('all');
    setPublicationFilter('all');
    setSortBy('featured');
  };

  const stats = useMemo(() => {
    const products = store.products || [];
    return {
      total:          products.length,
      published:      products.filter(p => p.isPublished).length,
      outOfStock:     products.filter(p => (p.stockCount || 0) === 0).length,
      lowStock:       products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length,
      totalInventory: products.reduce((sum, p) => sum + (p.stockCount || 0), 0),
    };
  }, [store.products]);

  const handleDeleteProduct = async (productId: string) => {
    if (confirmDeleteId !== productId) {
      setConfirmDeleteId(productId);
      setTimeout(() => setConfirmDeleteId(null), 4000);
      return;
    }

    setLoading(true);
    try {
      await store.deleteProduct(productId);
      showAlert('Product deleted successfully', 'success');
    } catch (error: any) {
      showAlert(error?.message || 'Failed to delete product', 'error');
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    setLoading(true);
    try {
      await store.updateProduct(product.id, { isPublished: !product.isPublished });
      showAlert(`Product ${!product.isPublished ? 'published' : 'unpublished'} successfully`, 'success');
    } catch {
      showAlert('Failed to update product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Published', 'Department'],
        ...filteredProducts.map(p => [
          p.id, p.name, p.brand, p.category, p.price, p.stockCount, p.isPublished ? 'Yes' : 'No', p.department,
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      showAlert('Products exported successfully', 'success');
    } catch {
      showAlert('Failed to export products', 'error');
    }
  };

  const handleMigrateImages = async () => {
    if (!window.confirm('Move every legacy product photo into Supabase Storage now? This keeps the catalog unchanged but may take a moment.')) return;
    setMigratingImages(true);
    try {
      const token = localStorage.getItem('admin_auth_token');
      if (!token) throw new Error('Administrator session required. Please sign in again.');
      let migrated = 0;
      let remaining = 1;
      // The API deliberately uses small batches to stay reliable on serverless.
      // Continue here so the admin only needs one action for the whole catalog.
      for (let batch = 0; batch < 25 && remaining > 0; batch++) {
        const result = await fetch('/api/products?migrateImages=true', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
        const data = await result.json();
        if (!result.ok) throw new Error(data.error || 'Image migration failed.');
        migrated += Number(data.migrated || 0);
        remaining = Number(data.remaining || 0);
        if (!data.migrated && remaining > 0) throw new Error('Image migration stopped before it could finish. Please try again.');
      }
      await store.fetchProducts({ includeUnpublished: true });
      showAlert(
        remaining > 0
          ? `${migrated} photos moved. ${remaining} remaining — select “Move legacy photos” again to continue.`
          : `${migrated} product photo${migrated === 1 ? '' : 's'} moved to Supabase Storage.`,
        'success',
      );
    } catch (error: any) {
      showAlert(error?.message || 'Image migration failed.', 'error');
    } finally {
      setMigratingImages(false);
    }
  };

  const stockBadge = (count: number) => {
    if (count === 0)  return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    if (count <= 5)   return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <AdminPageHeader
        eyebrow="Store"
        title="Products"
        description="Add products, update prices, and keep inventory accurate."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMigrateImages}
              disabled={migratingImages}
              className="clay-btn-secondary py-2 px-3 text-xs"
            >
              {migratingImages ? 'Moving photos…' : 'Move legacy photos'}
            </button>
            <button
              onClick={handleExport}
              className="clay-btn-secondary py-2 px-3 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => { setBarcodeInitialProductId(undefined); setBarcodeModalOpen(true); }}
              className="clay-btn-secondary py-2 px-3 text-xs text-[#8A5738] dark:text-[#E8B792]"
            >
              <Tag className="w-3.5 h-3.5" />
              Print Barcodes
            </button>
            <button
              onClick={onAddProduct}
              className="clay-btn-primary py-2 px-3.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <AdminMetricCard label="Products"      value={stats.total}          detail="In catalog"        icon={Package} />
        <AdminMetricCard label="Published"     value={stats.published}      detail="Marked for online display" icon={Check as any} accent="green" />
        <AdminMetricCard label="Stock"         value={stats.totalInventory} detail="Units on hand"      icon={Package} accent="blue" />
        <AdminMetricCard label="Low stock"     value={stats.lowStock}       detail="5 or fewer left"    icon={AlertTriangle} accent={stats.lowStock > 0 ? "amber" : "neutral"} />
        <AdminMetricCard label="Out of stock"  value={stats.outOfStock}     detail="Needs restocking"   icon={X as any} accent={stats.outOfStock > 0 ? "red" : "neutral"} />
      </div>

      {/* Search, filters, and sorting */}
      <div className="clay-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="clay-card-sm p-2.5 text-[#8A5738] dark:text-[#E8B792]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Search &amp; filters</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Find products by name, brand, category, barcode, or stock.</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="clay-btn-secondary py-2 px-3 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Search products</span>
            <span className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="search"
                placeholder="Name, brand, ingredient, barcode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="neu-input w-full pl-10 pr-10"
                aria-label="Search products"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear product search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Department</span>
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value as 'all' | 'beauty' | 'groceries')} className="neu-input w-full cursor-pointer">
              <option value="all">All departments</option>
              <option value="beauty">Beauty</option>
              <option value="groceries">Groceries</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Category</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as 'all' | CategoryType)} className="neu-input w-full cursor-pointer">
              <option value="all">All categories</option>
              {categoryOptions.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Brand</span>
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="neu-input w-full cursor-pointer">
              <option value="all">All brands</option>
              {brandOptions.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Stock</span>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value as AdminStockFilter)} className="neu-input w-full cursor-pointer">
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Status</span>
            <select value={publicationFilter} onChange={e => setPublicationFilter(e.target.value as AdminPublicationFilter)} className="neu-input w-full cursor-pointer">
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Sort by</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as AdminProductSort)} className="neu-input w-full cursor-pointer">
              <option value="featured">Featured</option>
              <option value="newest">Newest first</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="stock-asc">Stock: low to high</option>
              <option value="stock-desc">Stock: high to low</option>
            </select>
          </label>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400" aria-live="polite">
          Showing <span className="font-bold text-stone-900 dark:text-stone-100">{filteredProducts.length}</span> of {stats.total} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="clay-card-interactive p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex gap-4">
                {/* Image Pod */}
                <div className="w-20 h-20 rounded-2xl neu-sunken p-1 flex-shrink-0 overflow-hidden">
                  {isRenderableProductImage(product.image) ? (
                    <img src={product.image} alt={product.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-xl animate-pulse bg-stone-200 dark:bg-stone-700" aria-label="Product image unavailable" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 truncate text-base">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {product.brand} · {product.categoryLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!product.isPublished && (
                        <span className="clay-badge clay-badge-neutral text-[9px] py-0.5 px-2">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 mb-3">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100 text-sm tabular-nums">
                        GHS {Number(product.price || 0).toFixed(2)}
                      </p>
                      {product.wholesalePrice != null && (
                        <p className="text-[11px] font-semibold text-[#8A5738] dark:text-[#E8B792] tabular-nums">
                          WS: GHS {Number(product.wholesalePrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span className={`clay-badge text-[10px] py-0.5 px-2.5 ${
                      (product.stockCount || 0) === 0 ? 'clay-badge-danger' :
                      (product.stockCount || 0) <= 5 ? 'clay-badge-warning' : 'clay-badge-success'
                    }`}>
                      {product.stockCount || 0} units
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-wrap pt-1 border-t border-stone-200/50 dark:border-white/5">
                    <button
                      onClick={() => onViewProduct?.(product)}
                      className="clay-btn-secondary py-1 px-2.5 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => onEditProduct?.(product)}
                      className="clay-btn-secondary py-1 px-2.5 text-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => { setBarcodeInitialProductId(product.id); setBarcodeModalOpen(true); }}
                      className="clay-btn-secondary py-1 px-2.5 text-xs text-[#8A5738] dark:text-[#E8B792]"
                      title="Print barcode label"
                    >
                      <Tag className="w-3 h-3" />
                      Barcode
                    </button>
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={loading}
                      className="clay-btn-secondary py-1 px-2.5 text-xs"
                    >
                      {product.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    {/* Inline delete confirm */}
                    {confirmDeleteId === product.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={loading}
                          className="clay-btn-danger py-1 px-2.5 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="clay-btn-secondary py-1 px-2 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                        className="clay-btn-secondary py-1 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 clay-card p-12 text-center">
            <div className="neu-sunken h-14 w-14 rounded-2xl mx-auto flex items-center justify-center text-stone-400 mb-3">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-stone-700 dark:text-stone-300">No products found</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Try another search or reset the filters.</p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="clay-btn-secondary mt-4 py-2 px-3 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Barcode Labels Modal */}
      {barcodeModalOpen && (
        <BarcodeLabelsModal
          isOpen={true}
          initialProductId={barcodeInitialProductId}
          onClose={() => setBarcodeModalOpen(false)}
        />
      )}
    </div>
  );
};
