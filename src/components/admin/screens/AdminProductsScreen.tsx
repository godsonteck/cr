import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Product } from '../../../types';

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
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = store.products || [];

    if (departmentFilter !== 'all') {
      products = products.filter(p => p.department === departmentFilter);
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'out') {
        products = products.filter(p => (p.stockCount || 0) === 0);
      } else if (stockFilter === 'low') {
        products = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5);
      } else if (stockFilter === 'in') {
        products = products.filter(p => (p.stockCount || 0) > 5);
      }
    }

    if (searchTerm) {
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return products;
  }, [store.products, departmentFilter, stockFilter, searchTerm]);

  const stats = useMemo(() => {
    const products = store.products || [];
    return {
      total: products.length,
      published: products.filter(p => p.isPublished).length,
      outOfStock: products.filter(p => (p.stockCount || 0) === 0).length,
      lowStock: products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length,
      totalInventory: products.reduce((sum, p) => sum + (p.stockCount || 0), 0),
    };
  }, [store.products]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      store.deleteProduct(productId);
      showAlert('Product deleted successfully', 'success');
    } catch (error) {
      showAlert('Failed to delete product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      store.updateProduct(product.id, { isPublished: !product.isPublished });
      showAlert(
        `Product ${!product.isPublished ? 'published' : 'unpublished'} successfully`,
        'success'
      );
    } catch (error) {
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
          p.id,
          p.name,
          p.brand,
          p.category,
          p.price,
          p.stockCount,
          p.isPublished ? 'Yes' : 'No',
          p.department,
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
      showAlert('Products exported successfully', 'success');
    } catch (error) {
      showAlert('Failed to export products', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Products Catalog</h1>
          <p className="text-gray-600 dark:text-stone-400 mt-1">Manage your product inventory and listings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
          <p className="text-sm text-gray-600 dark:text-stone-400">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-stone-100 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
          <p className="text-sm text-gray-600 dark:text-stone-400">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
          <p className="text-sm text-gray-600 dark:text-stone-400">Total Stock</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-stone-100 mt-1">{stats.totalInventory}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
          <p className="text-sm text-gray-600 dark:text-stone-400">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value as 'all' | 'beauty' | 'groceries')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Departments</option>
            <option value="beauty">Beauty</option>
            <option value="groceries">Groceries</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as 'all' | 'in' | 'low' | 'out')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {stats.total} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => ((e.target as any).src = 'https://via.placeholder.com/100')}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                    {!product.isPublished && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 whitespace-nowrap">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">GHS {product.price}</p>
                      <p className="text-xs text-gray-600">
                        Stock: {' '}
                        <span
                          className={
                            (product.stockCount || 0) === 0
                              ? 'text-red-600 font-semibold'
                              : (product.stockCount || 0) <= 5
                                ? 'text-amber-600 font-semibold'
                                : 'text-green-600'
                          }
                        >
                          {product.stockCount}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewProduct?.(product)}
                      className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEditProduct?.(product)}
                      className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={loading}
                      className="flex-1 px-2 py-1 text-xs rounded border border-orange-300 hover:bg-orange-50 transition-colors text-orange-700 disabled:opacity-50"
                    >
                      {product.isPublished ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={loading}
                      className="flex-1 px-2 py-1 text-xs rounded border border-red-300 hover:bg-red-50 transition-colors text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
};
