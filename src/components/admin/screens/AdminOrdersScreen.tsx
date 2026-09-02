import React, { useMemo, useState } from 'react';
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Order, OrderStatus } from '../../../types';

interface OrdersScreenProps {
  onViewOrder?: (order: Order) => void;
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

const STATUS_STYLES: Record<OrderStatus, string> = {
  'Confirmed':        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Processing':       'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Packing Order':    'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Out for Delivery': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  'Delivered':        'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  'Confirmed':        CheckCircle2,
  'Processing':       Package,
  'Packing Order':    Package,
  'Out for Delivery': Truck,
  'Delivered':        CheckCircle2,
};

export const AdminOrdersScreen: React.FC<OrdersScreenProps> = ({ onViewOrder }) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const statuses: (OrderStatus | 'all')[] = ['all', 'Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered'];

  const filteredOrders = useMemo(() => {
    let orders = store.orders || [];

    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      orders = orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
          o.shippingAddress?.phone?.includes(q)
      );
    }

    return orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store.orders, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const orders = store.orders || [];
    return {
      total:        orders.length,
      pending:      orders.filter(o => o.status !== 'Delivered').length,
      delivered:    orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    };
  }, [store.orders]);

  const handleExport = () => {
    try {
      const csv = [
        ['Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Payment', 'Date'],
        ...filteredOrders.map(o => [
          o.orderNumber,
          o.shippingAddress?.fullName,
          o.shippingAddress?.phone,
          Number(o.total).toFixed(2),
          o.status,
          o.paymentStatus,
          new Date(o.createdAt).toLocaleDateString(),
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      showAlert('Orders exported successfully', 'success');
    } catch {
      showAlert('Failed to export orders', 'error');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <ScreenHeader
        eyebrow="Store"
        title="Orders"
        description="Review orders and move them through delivery."
        action={
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-3 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Orders"         value={stats.total}                                              detail="All orders"             icon={ShoppingCart} />
        <StatCard label="Open"           value={stats.pending}                                            detail="Still in progress"      icon={Clock} />
        <StatCard label="Delivered"      value={stats.delivered}                                          detail="Completed"              icon={CheckCircle2} />
        <StatCard label="Sales"          value={`GHS ${stats.totalRevenue.toFixed(2)}`}                  detail="From all orders"        icon={DollarSign} />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search orders or customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-3 py-2.5 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 text-sm"
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Showing <span className="font-semibold text-stone-900 dark:text-stone-100">{filteredOrders.length}</span> of {stats.total} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#2e2428]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-[#1a1316] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {order.shippingAddress?.phone}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-900 dark:text-stone-100">
                        GHS {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Read-only status badge — changes happen in the drawer */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] ?? ''}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 dark:text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-GH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onViewOrder?.(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E1719] text-white hover:bg-[#33282C] transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <ShoppingCart className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No orders found</p>
                    <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
