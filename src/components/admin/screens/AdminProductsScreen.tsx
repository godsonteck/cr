import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, Eye, Download, Package, AlertTriangle, X, Check } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Product } from '../../../types';

interface ProductsScreenProps {
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
function ScreenHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 dark:border-[#2e2428] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">{label}</span>
        <Icon className="h-4 w-4 text-[#B27A52]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>
    </div>
  );
}

// SVG placeholder for broken product images — no external hotlinks
const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f1ece8'/%3E%3Cpath d='M34 60l12-16 9 12 6-8 11 12H34z' fill='%23c9b8ae' opacity='.6'/%3E%3Ccircle cx='38' cy='38' r='5' fill='%23c9b8ae' opacity='.6'/%3E%3C/svg%3E";

export const AdminProductsScreen: React.FC<ProductsScreenProps> = ({
  onAddProduct,
  onEditProduct,
  onViewProduct,
}) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'beauty' | 'groceries'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(false);
  // Per-product delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let products = store.products || [];

    if (departmentFilter !== 'all') {
      products = products.filter(p => p.department === departmentFilter);
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'out')      products = products.filter(p => (p.stockCount || 0) === 0);
      else if (stockFilter === 'low') products = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5);
      else if (stockFilter === 'in')  products = products.filter(p => (p.stockCount || 0) > 5);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      products = products.filter(
        p =>
          (p?.name || '').toLowerCase().includes(q) ||
          (p?.brand || '').toLowerCase().includes(q) ||
          (p?.category || '').toLowerCase().includes(q)
      );
    }

    return products;
  }, [store.products, departmentFilter, stockFilter, searchTerm]);

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
    } catch {
      showAlert('Failed to delete product', 'error');
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

  const stockBadge = (count: number) => {
    if (count === 0)  return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    if (count <= 5)   return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <ScreenHeader
        eyebrow="Store"
        title="Products"
        description="Add products, update prices, and keep stock accurate."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-3 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onAddProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2 text-sm font-semibold text-white hover:bg-[#33282C] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Products"      value={stats.total}          detail="In catalog"        icon={Package} />
        <StatCard label="Live"          value={stats.published}      detail="Shown online"       icon={Check as any} />
        <StatCard label="Stock"         value={stats.totalInventory} detail="Units on hand"      icon={Package} />
        <StatCard label="Low stock"     value={stats.lowStock}       detail="5 or fewer left"    icon={AlertTriangle} />
        <StatCard label="Out of stock"  value={stats.outOfStock}     detail="Needs restocking"   icon={X as any} />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, brand, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 text-sm"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value as 'all' | 'beauty' | 'groceries')}
            className="px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 text-sm"
          >
            <option value="all">All Departments</option>
            <option value="beauty">Beauty</option>
            <option value="groceries">Groceries</option>
          </select>
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as 'all' | 'in' | 'low' | 'out')}
            className="px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 text-sm"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Showing <span className="font-semibold text-stone-900 dark:text-stone-100">{filteredProducts.length}</span> of {stats.total} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white dark:bg-[#201b1a] rounded-2xl border border-stone-200 dark:border-[#2e2428] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-stone-100 dark:bg-[#2a2024] flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => ((e.target as HTMLImageElement).src = IMG_FALLBACK)}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate text-sm">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {product.brand} · {product.categoryLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!product.isPublished && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wide">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 mb-3">
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      GHS {Number(product.price || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stockBadge(product.stockCount || 0)}`}>
                      {product.stockCount || 0} units
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewProduct?.(product)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-[#2e2428] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => onEditProduct?.(product)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-[#2e2428] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors font-medium"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={loading}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border border-[#B27A52]/40 text-[#8A5738] dark:text-[#E8B792] hover:bg-[#F2E3D7] dark:hover:bg-[#3d2a22] transition-colors font-medium disabled:opacity-50"
                    >
                      {product.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    {/* Inline delete confirm */}
                    {confirmDeleteId === product.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-bold disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-[#2e2428] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors font-medium"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium disabled:opacity-50"
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
          <div className="col-span-2 rounded-2xl border border-dashed border-stone-300 dark:border-[#2e2428] py-16 text-center">
            <Package className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No products found</p>
            <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
