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

interface AdminDashboardProps {
  onNavigate?: (tab: 'products' | 'inventory' | 'orders') => void;
}

// ─── Shared mini-components (mirrors AdminOperationsScreens design tokens) ───

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

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  accent?: 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'orange';
}) {
  const accentMap: Record<string, string> = {
    red:    'text-red-600',
    amber:  'text-amber-600',
    green:  'text-green-600',
    blue:   'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };
  const valueClass = accent ? accentMap[accent] : 'text-stone-900 dark:text-stone-100';

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#B27A52]" />
      </div>
      <p className={`mt-3 text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>
    </div>
  );
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

  const statusBadge = (status: string) => {
    if (status === 'Delivered')
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    if (status === 'Processing' || status === 'Packing Order')
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
    if (status === 'Out for Delivery')
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400';
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[#201719] px-6 py-7 text-white shadow-[0_18px_40px_rgba(32,23,25,0.16)] sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B792]">Store pulse</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Your shop, at a glance.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300">Review today&apos;s activity, resolve anything that needs attention, and keep the storefront moving.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button onClick={() => onNavigate?.('orders')} className="inline-flex items-center gap-2 rounded-xl bg-[#E8B792] px-4 py-2.5 text-sm font-bold text-[#201719] transition hover:bg-[#f1c8a8]">
              Review orders <ArrowUpRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate?.('products')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              <Plus className="h-4 w-4" /> Add product
            </button>
            <button onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-white/10 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {criticalAlerts.map((alert, idx) => {
            const alertStyles = {
              error:   'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-300',
              warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300',
              info:    'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-300',
            };
            const Icon = alert.type === 'warning' ? AlertTriangle : AlertCircle;
            return (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alertStyles[alert.type]}`}>
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">{alert.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.(alert.tab)}
                  className="text-xs font-bold underline whitespace-nowrap ml-2 opacity-90 hover:opacity-100"
                >
                  {alert.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard
          label="Revenue"
          value={`GHS ${metrics.totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          detail={`From ${metrics.totalOrders} total order${metrics.totalOrders !== 1 ? 's' : ''}`}
          icon={DollarSign}
          accent="green"
        />
        <StatCard
          label="Average order"
          value={`GHS ${metrics.avgOrderValue.toFixed(2)}`}
          detail="Per transaction"
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Open orders"
          value={metrics.pendingOrders}
          detail="Awaiting processing"
          icon={Clock}
          accent={metrics.pendingOrders > 0 ? 'amber' : undefined}
        />
        <StatCard
          label="Customers"
          value={metrics.totalCustomers}
          detail="Unique by email"
          icon={Users}
          accent="purple"
        />
        <StatCard
          label="Live products"
          value={metrics.published}
          detail={`${metrics.totalProducts} total in catalog`}
          icon={Package}
          accent="orange"
        />
        <StatCard
          label="Out of stock"
          value={metrics.outOfStock}
          detail={`${metrics.lowStock} more running low (≤ 5 units)`}
          icon={AlertCircle}
          accent={metrics.outOfStock > 0 ? 'red' : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      {/* Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-[#2e2428]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Activity</p>
            <h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">Latest orders</h2>
          </div>
          <button
            onClick={() => onNavigate?.('orders')}
            className="text-xs font-semibold text-[#B27A52] hover:underline"
          >
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-stone-50 dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#2e2428]">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-[#1a1316] transition-colors">
                    <td className="px-6 py-3 font-semibold text-stone-900 dark:text-stone-100 font-mono text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3 text-stone-700 dark:text-stone-300">
                      {order.shippingAddress?.fullName}
                    </td>
                    <td className="px-6 py-3 font-semibold text-stone-900 dark:text-stone-100">
                      GHS {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-stone-500 dark:text-stone-500 text-xs">
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

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">At a glance</p>
            <h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">What needs attention</h2>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="mt-6 space-y-4">
          <button onClick={() => onNavigate?.('orders')} className="flex w-full items-center justify-between rounded-xl bg-stone-50 p-3 text-left transition hover:bg-stone-100 dark:bg-[#1a1316] dark:hover:bg-[#251b1e]">
            <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Open orders</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Ready for review</span></span>
            <span className="text-lg font-bold text-[#B27A52]">{metrics.pendingOrders}</span>
          </button>
          <button onClick={() => onNavigate?.('inventory')} className="flex w-full items-center justify-between rounded-xl bg-stone-50 p-3 text-left transition hover:bg-stone-100 dark:bg-[#1a1316] dark:hover:bg-[#251b1e]">
            <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Stock watch</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Low or unavailable</span></span>
            <span className="text-lg font-bold text-orange-600">{metrics.lowStock + metrics.outOfStock}</span>
          </button>
          <button onClick={() => onNavigate?.('products')} className="flex w-full items-center justify-between rounded-xl bg-stone-50 p-3 text-left transition hover:bg-stone-100 dark:bg-[#1a1316] dark:hover:bg-[#251b1e]">
            <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Catalog live</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">Published products</span></span>
            <span className="text-lg font-bold text-emerald-600">{metrics.published}</span>
          </button>
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
