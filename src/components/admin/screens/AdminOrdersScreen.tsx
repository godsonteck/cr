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
  MessageCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Order, OrderStatus } from '../../../types';
import { DATE_PRESETS, DateFilterPreset, DateSortOrder, isWithinDateRange } from '../../../utils/dateFilters';
import { AdminMetricCard, AdminPageHeader } from '../components/AdminPrimitives';

interface OrdersScreenProps {
  onViewOrder?: (order: Order) => void;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  'Confirmed':        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Processing':       'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Packing Order':    'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Out for Delivery': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  'Delivered':        'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  'Refunded':         'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  'Cancelled':        'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  'Confirmed':        CheckCircle2,
  'Processing':       Package,
  'Packing Order':    Package,
  'Out for Delivery': Truck,
  'Delivered':        CheckCircle2,
  'Refunded':         RotateCcw,
  'Cancelled':        RotateCcw,
};

export const AdminOrdersScreen: React.FC<OrdersScreenProps> = ({ onViewOrder }) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [sortOrder, setSortOrder] = useState<DateSortOrder>('date-desc');

  const statuses: (OrderStatus | 'all')[] = ['all', 'Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered', 'Refunded', 'Cancelled'];

  const filteredOrders = useMemo(() => {
    let orders = store.orders || [];

    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      orders = orders.filter(o => isWithinDateRange(o.createdAt, dateFilter, customStart, customEnd));
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      orders = orders.filter(
        o =>
          (o?.orderNumber || '').toLowerCase().includes(q) ||
          (o?.shippingAddress?.fullName || '').toLowerCase().includes(q) ||
          (o?.shippingAddress?.phone || '').includes(q)
      );
    }

    return orders.slice().sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOrder === 'amount-desc') {
        return (Number(b.total) || 0) - (Number(a.total) || 0);
      }
      if (sortOrder === 'amount-asc') {
        return (Number(a.total) || 0) - (Number(b.total) || 0);
      }
      return 0;
    });
  }, [store.orders, statusFilter, dateFilter, customStart, customEnd, searchTerm, sortOrder]);

  const stats = useMemo(() => {
    const orders = store.orders || [];
    return {
      total:        orders.length,
      pending:      orders.filter(o => o.status !== 'Delivered').length,
      delivered:    orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
      whatsapp: orders.filter(o => o.orderSource === 'whatsapp').length,
    };
  }, [store.orders]);

  const filteredRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [filteredOrders]);

  const hasActiveFilters = statusFilter !== 'all' || dateFilter !== 'all' || searchTerm.trim() !== '' || sortOrder !== 'date-desc';

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setSearchTerm('');
    setSortOrder('date-desc');
  };

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
      <AdminPageHeader
        eyebrow="Store"
        title="Orders"
        description="Review orders, filter by date range, and track order fulfillment."
        action={
          <button
            onClick={handleExport}
            className="clay-btn-secondary py-2 px-3.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredOrders.length})
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-5">
        <AdminMetricCard label="Orders"         value={stats.total}                                              detail="All orders"             icon={ShoppingCart} />
        <AdminMetricCard label="Open"           value={stats.pending}                                            detail="Still in progress"      icon={Clock} accent={stats.pending > 0 ? "amber" : "neutral"} />
        <AdminMetricCard label="Delivered"      value={stats.delivered}                                          detail="Completed"              icon={CheckCircle2} accent="green" />
        <AdminMetricCard label="Sales"          value={`GHS ${stats.totalRevenue.toFixed(2)}`}                  detail="From all orders"        icon={DollarSign} accent="blue" />
        <AdminMetricCard label="WhatsApp"       value={stats.whatsapp}                                           detail="Direct messaging"       icon={MessageCircle} accent="purple" />
      </div>

      {/* Filters & Sorting Controls */}
      <div className="clay-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search orders, customers, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="neu-input pl-10 pr-4"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as DateFilterPreset)}
              className="neu-input lg:w-44 cursor-pointer"
            >
              {DATE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="neu-input lg:w-44 cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s}
              </option>
            ))}
          </select>

          {/* Sort By Date/Amount */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as DateSortOrder)}
              className="neu-input lg:w-48 cursor-pointer font-medium"
            >
              <option value="date-desc">Date: Newest first</option>
              <option value="date-asc">Date: Oldest first</option>
              <option value="amount-desc">Amount: High to low</option>
              <option value="amount-asc">Amount: Low to high</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="clay-btn-secondary py-2 px-3 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-stone-200/50 dark:border-white/5 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">Date Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-stone-500 font-medium">From:</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="neu-input py-1 px-2.5 w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-stone-500 font-medium">To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="neu-input py-1 px-2.5 w-auto"
              />
            </div>
            {(customStart || customEnd) && (
              <button
                onClick={() => { setCustomStart(''); setCustomEnd(''); }}
                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 underline text-xs ml-1 cursor-pointer"
              >
                Clear range
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
          <p>
            Showing <span className="font-bold text-stone-900 dark:text-stone-100">{filteredOrders.length}</span> of {stats.total} orders
            {dateFilter !== 'all' && <span className="ml-1 text-[#B27A52] font-semibold">({DATE_PRESETS.find(p => p.id === dateFilter)?.label})</span>}
          </p>
          <p className="font-medium text-stone-700 dark:text-stone-300">
            Selected total: <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">GHS {filteredRevenue.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="neu-sunken border-b border-stone-200/40 dark:border-white/5">
              <tr>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Customer &amp; source</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setSortOrder(s => s === 'amount-desc' ? 'amount-asc' : 'amount-desc')}
                    className="group inline-flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                  >
                    <span>Amount</span>
                    {sortOrder === 'amount-desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[#B27A52]" />
                    ) : sortOrder === 'amount-asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#B27A52]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setSortOrder(s => s === 'date-desc' ? 'date-asc' : 'date-desc')}
                    className="group inline-flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                  >
                    <span>Date</span>
                    {sortOrder === 'date-desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[#B27A52]" />
                    ) : sortOrder === 'date-asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#B27A52]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/40 dark:divide-white/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-stone-100/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                          {order.orderNumber}
                        </span>
                        {order.orderSource === 'whatsapp' && (
                          <span className="mt-1 inline-flex rounded-full bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-bold text-[#168542] dark:text-[#7eeaa1]">
                            WhatsApp
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold font-serif text-stone-900 dark:text-stone-100 text-sm">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {order.shippingAddress?.phone}
                        </p>
                        {order.orderSource === 'whatsapp' && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#168542] dark:text-[#7eeaa1]"><MessageCircle className="h-3 w-3" /> WhatsApp order</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                        GHS {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`clay-badge ${
                          order.status === 'Confirmed' ? 'clay-badge-success' :
                          order.status === 'Processing' || order.status === 'Packing Order' ? 'clay-badge-info' :
                          order.status === 'Out for Delivery' ? 'clay-badge-warning' :
                          order.status === 'Delivered' ? 'clay-badge-neutral' : 'clay-badge-danger'
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`clay-badge ${
                          order.paymentStatus === 'paid' ? 'clay-badge-success' :
                          order.paymentStatus === 'failed' ? 'clay-badge-danger' : 'clay-badge-warning'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                        {new Date(order.createdAt).toLocaleDateString('en-GH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onViewOrder?.(order)}
                          className="clay-btn-secondary py-1.5 px-3 text-xs"
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
                    <div className="neu-sunken h-14 w-14 rounded-2xl mx-auto flex items-center justify-center text-stone-400 mb-3">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-stone-700 dark:text-stone-300">No orders found</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Try adjusting your filters</p>
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
