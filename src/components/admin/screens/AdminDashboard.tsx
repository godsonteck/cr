import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { AdminMetricCard } from '../components/AdminPrimitives';

interface AdminDashboardProps {
  onNavigate?: (tab: 'products' | 'inventory' | 'orders') => void;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const metrics = useMemo(() => {
    const orders = store.orders || [];
    const products = store.products || [];

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
    const outOfStock = products.filter(p => (p.stockCount || 0) === 0).length;
    const lowStock = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length;
    const totalCustomers = new Set(
      orders.map(order => {
        const address = order.shippingAddress;
        return address?.email?.trim().toLowerCase() || address?.phone?.trim() || address?.fullName?.trim().toLowerCase();
      }).filter(Boolean)
    ).size;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const published = products.filter(p => p.isPublished).length;

    return {
      totalRevenue,
      pendingOrders,
      outOfStock,
      lowStock,
      totalCustomers,
      avgOrderValue,
      totalProducts: products.length,
      published,
      totalOrders: orders.length,
    };
  }, [store.orders, store.products]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [productsResult, ordersResult] = await Promise.allSettled([
        store.fetchProducts({ includeUnpublished: true }),
        store.fetchOrders(),
      ]);

      const authFailed = [productsResult, ordersResult].some(
        r => r.status === 'rejected' && (r.reason?.status === 401 || r.reason?.status === 403)
      );

      // Auth errors are handled by the api client (token removal + cr-auth-expired event)
      // so we don't show an additional error toast for those
      if (authFailed) {
        return;
      }

      const anyFailed = [productsResult, ordersResult].some(r => r.status === 'rejected');
      if (anyFailed) {
        showAlert('Some data could not be refreshed. Please try again.', 'error');
      } else {
        setLastRefresh(new Date());
        showAlert('Dashboard refreshed successfully', 'success');
      }
    } catch {
      showAlert('Failed to refresh dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = useMemo(
    () =>
      (store.orders || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [store.orders]
  );

  const criticalAlerts = useMemo(() => {
    const alerts: {
      type: 'error' | 'warning' | 'info';
      title: string;
      description: string;
      actionLabel: string;
      tab: 'products' | 'inventory' | 'orders';
    }[] = [];

    if (metrics.outOfStock > 0) {
      alerts.push({
        type: 'error',
        title: `${metrics.outOfStock} Product${metrics.outOfStock > 1 ? 's' : ''} Out of Stock`,
        description: 'Urgent: Restock these items immediately to avoid losing sales.',
        actionLabel: 'View Products',
        tab: 'products',
      });
    }

    if (metrics.lowStock > 0) {
      alerts.push({
        type: 'warning',
        title: `${metrics.lowStock} Product${metrics.lowStock > 1 ? 's' : ''} Running Low`,
        description: 'These items have 5 or fewer units remaining.',
        actionLabel: 'Adjust Stock',
        tab: 'inventory',
      });
    }

    if (metrics.pendingOrders > 0) {
      alerts.push({
        type: 'info',
        title: `${metrics.pendingOrders} Order${metrics.pendingOrders > 1 ? 's' : ''} Pending`,
        description: 'Orders awaiting processing or shipment.',
        actionLabel: 'Review Orders',
        tab: 'orders',
      });
    }

    return alerts;
  }, [metrics]);

  const statusBadgeTone = (status: string): 'success' | 'info' | 'warning' | 'neutral' => {
    if (status === 'Delivered') return 'success';
    if (status === 'Processing' || status === 'Packing Order') return 'info';
    if (status === 'Out for Delivery') return 'warning';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <section className="admin-dashboard-hero clay-card-lg relative overflow-hidden bg-gradient-to-br from-[#2c1d22] via-[#201519] to-[#160e11] p-6 sm:p-8 text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-sunken-sm bg-black/20 text-[#E8B792] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8B792] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Store Pulse</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-white">Your shop, at a glance.</h1>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-stone-300 font-normal">Review today&apos;s activity, resolve anything that needs attention, and keep the storefront moving smoothly.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onNavigate?.('orders')} className="clay-btn-primary">
              Review orders <ArrowUpRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate?.('products')} className="clay-btn-secondary">
              <Plus className="h-4 w-4" /> Add product
            </button>
            <button onClick={handleRefresh} disabled={loading} className="clay-btn-secondary">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {criticalAlerts.map((alert, idx) => {
            const alertTone = alert.type === 'error' ? 'clay-badge-danger' : alert.type === 'warning' ? 'clay-badge-warning' : 'clay-badge-info';
            const Icon = alert.type === 'warning' ? AlertTriangle : AlertCircle;
            return (
              <div key={idx} className="clay-card-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`clay-icon-pod h-9 w-9 shrink-0 ${alertTone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{alert.title}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{alert.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.(alert.tab)}
                  className="clay-btn-secondary py-1.5 px-3 text-xs shrink-0 self-end sm:self-auto"
                >
                  {alert.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-6">
        <AdminMetricCard
          label="Revenue"
          value={`GHS ${metrics.totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          detail={`From ${metrics.totalOrders} total order${metrics.totalOrders !== 1 ? 's' : ''}`}
          icon={DollarSign}
          accent="green"
        />
        <AdminMetricCard
          label="Average order"
          value={`GHS ${metrics.avgOrderValue.toFixed(2)}`}
          detail="Per transaction"
          icon={TrendingUp}
          accent="blue"
        />
        <AdminMetricCard
          label="Open orders"
          value={metrics.pendingOrders}
          detail="Awaiting processing"
          icon={Clock}
          accent={metrics.pendingOrders > 0 ? 'amber' : undefined}
        />
        <AdminMetricCard
          label="Customers with orders"
          value={metrics.totalCustomers}
          detail="Unique by email or phone"
          icon={Users}
          accent="purple"
        />
        <AdminMetricCard
          label="Published products"
          value={metrics.published}
          detail={`${metrics.totalProducts} total in catalog`}
          icon={Package}
          accent="orange"
        />
        <AdminMetricCard
          label="Out of stock"
          value={metrics.outOfStock}
          detail={`${metrics.lowStock} more running low (≤ 5 units)`}
          icon={AlertCircle}
          accent={metrics.outOfStock > 0 ? 'red' : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
      {/* Recent Orders */}
      <div className="clay-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-white/5 px-6 py-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B27A52] dark:text-[#d49970]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B27A52]" />
              Activity
            </div>
            <h2 className="mt-0.5 text-base font-bold font-serif text-stone-900 dark:text-stone-100">Latest orders</h2>
          </div>
          <button
            onClick={() => onNavigate?.('orders')}
            className="clay-btn-secondary text-xs py-1.5 px-3"
          >
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="neu-sunken border-b border-stone-200/40 dark:border-white/5">
              <tr>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/40 dark:divide-white/5">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-stone-900 dark:text-stone-100 font-mono text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3.5 text-stone-700 dark:text-stone-300 font-medium">
                      {order.shippingAddress?.fullName}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      GHS {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`clay-badge ${
                        order.status === 'Delivered' ? 'clay-badge-success' :
                        order.status === 'Processing' || order.status === 'Packing Order' ? 'clay-badge-info' :
                        order.status === 'Out for Delivery' ? 'clay-badge-warning' : 'clay-badge-neutral'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-stone-500 dark:text-stone-400 text-xs tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString('en-GH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-400 dark:text-stone-600">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="clay-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B27A52] dark:text-[#d49970]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B27A52]" />
                At a glance
              </div>
              <h2 className="mt-0.5 text-base font-bold font-serif text-stone-900 dark:text-stone-100">What needs attention</h2>
            </div>
            <div className="clay-icon-pod h-8 w-8 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <button onClick={() => onNavigate?.('orders')} className="neu-sunken-sm flex w-full items-center justify-between p-3.5 text-left transition-transform hover:scale-[1.01] cursor-pointer">
              <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Open orders</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Ready for review</span></span>
              <span className="clay-badge clay-badge-info text-sm py-1 px-2.5 font-bold">{metrics.pendingOrders}</span>
            </button>
            <button onClick={() => onNavigate?.('inventory')} className="neu-sunken-sm flex w-full items-center justify-between p-3.5 text-left transition-transform hover:scale-[1.01] cursor-pointer">
              <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Stock watch</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Low or unavailable</span></span>
              <span className="clay-badge clay-badge-warning text-sm py-1 px-2.5 font-bold">{metrics.lowStock + metrics.outOfStock}</span>
            </button>
            <button onClick={() => onNavigate?.('products')} className="neu-sunken-sm flex w-full items-center justify-between p-3.5 text-left transition-transform hover:scale-[1.01] cursor-pointer">
              <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Published catalog</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Active storefront items</span></span>
              <span className="clay-badge clay-badge-success text-sm py-1 px-2.5 font-bold">{metrics.published}</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-stone-400 dark:text-stone-600 text-right">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  );
};
