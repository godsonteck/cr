import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Package, ShoppingCart, Users, AlertCircle, RefreshCw, DollarSign, Clock } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';

export const AdminDashboard: React.FC = () => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const orders = store.orders || [];
    const products = store.products || [];
    
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
    const outOfStock = products.filter(p => (p.stockCount || 0) === 0).length;
    const lowStock = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length;
    const totalCustomers = new Set(orders.map(o => o.shippingAddress?.email)).size;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalRevenue,
      pendingOrders,
      outOfStock,
      lowStock,
      totalCustomers,
      avgOrderValue,
      totalProducts: products.length,
      totalOrders: orders.length,
    };
  }, [store.orders, store.products]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate refresh - in real app, would refetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      showAlert('Dashboard refreshed successfully', 'success');
    } catch (error) {
      showAlert('Failed to refresh dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = useMemo(() => {
    return (store.orders || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [store.orders]);

  const criticalAlerts = useMemo(() => {
    const alerts = [];
    
    if (metrics.outOfStock > 0) {
      alerts.push({
        type: 'error' as const,
        title: `${metrics.outOfStock} Products Out of Stock`,
        description: 'Urgent: Restock these items immediately',
        actionLabel: 'View Products',
      });
    }

    if (metrics.lowStock > 0) {
      alerts.push({
        type: 'warning' as const,
        title: `${metrics.lowStock} Products Low in Stock`,
        description: 'Consider restocking soon to avoid stockouts',
        actionLabel: 'Adjust Stock',
      });
    }

    if (metrics.pendingOrders > 0) {
      alerts.push({
        type: 'info' as const,
        title: `${metrics.pendingOrders} Pending Orders`,
        description: 'Orders awaiting processing or shipment',
        actionLabel: 'Review Orders',
      });
    }

    return alerts;
  }, [metrics]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-stone-400 mt-1">Welcome back to your CR Cosmetics store</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {criticalAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : alert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                </div>
                <button className="text-sm font-medium underline whitespace-nowrap ml-4">
                  {alert.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-stone-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-stone-100 mt-2">
                GHS {metrics.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-stone-500 mt-2">From {metrics.totalOrders} orders</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                GHS {metrics.avgOrderValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per transaction</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.pendingOrders}</p>
              <p className="text-xs text-gray-500 mt-2">Awaiting processing</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalCustomers}</p>
              <p className="text-xs text-gray-500 mt-2">Active customers</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-2">Published items</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{metrics.outOfStock}</p>
              <p className="text-xs text-gray-500 mt-2">Urgent restock needed</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{metrics.lowStock}</p>
              <p className="text-xs text-gray-500 mt-2">≤ 5 units</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#201b1a] rounded-lg border border-gray-200 dark:border-[#483d39] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#483d39]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-stone-100">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2a2420] text-sm text-gray-600 dark:text-stone-400 font-medium">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#483d39]">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2420] transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-stone-100">{order.orderNumber}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-stone-400">{order.shippingAddress?.fullName}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-stone-100">
                      GHS {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Refresh */}
      <p className="text-xs text-gray-500 text-right">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  );
};
