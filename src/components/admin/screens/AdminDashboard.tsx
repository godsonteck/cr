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
    const totalCustomers = new Set(orders.map(o => o.shippingAddress?.email)).size;
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
      await store.fetchProducts();
      await store.fetchOrders();
      setLastRefresh(new Date());
      showAlert('Dashboard refreshed successfully', 'success');
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
    <div className="space-y-8">

      {/* Header */}
      <ScreenHeader
        eyebrow="Store overview"
        title="Dashboard"
        description="See what needs attention and manage the store from one place."
        action={
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          label="Low or out"
          value={metrics.outOfStock}
          detail={`${metrics.lowStock} more are low (≤ 5 units)`}
          icon={AlertCircle}
          accent={metrics.outOfStock > 0 ? 'red' : undefined}
        />
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] shadow-sm">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-[#2e2428] flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Latest orders</h2>
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

      {/* Footer */}
      <p className="text-xs text-stone-400 dark:text-stone-600 text-right">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  );
};
