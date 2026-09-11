import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  MapPin,
  RefreshCw,
  Truck,
  WalletCards,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Download,
  Search,
  RotateCcw,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Order, OrderStatus } from '../../../types';
import { DATE_PRESETS, DateFilterPreset, DateSortOrder, isWithinDateRange } from '../../../utils/dateFilters';

interface AdminLiveOperationsScreenProps {
  onViewOrder?: (order: Order) => void;
}

const statusOrder: OrderStatus[] = ['Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered'];

const statusStyles: Record<OrderStatus, string> = {
  Confirmed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Processing: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  'Packing Order': 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
  'Out for Delivery': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  Delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
};

const money = (value: number) => `GHS ${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">{label}</span>
        <Icon className="h-4 w-4 text-[#B27A52]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>
    </div>
  );
}

export const AdminLiveOperationsScreen: React.FC<AdminLiveOperationsScreenProps> = ({ onViewOrder }) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [lastManualRefresh, setLastManualRefresh] = useState<Date | null>(null);

  // Date Filtering & Sorting States
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [financeSortOrder, setFinanceSortOrder] = useState<DateSortOrder>('date-desc');
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeStatusFilter, setFinanceStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [financeViewTab, setFinanceViewTab] = useState<'transactions' | 'daily'>('transactions');

  const orders = store.orders || [];

  // Filter orders by date range
  const dateFilteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    return orders.filter(order => isWithinDateRange(order.createdAt, dateFilter, customStart, customEnd));
  }, [orders, dateFilter, customStart, customEnd]);

  // Compute metrics based on date range
  const metrics = useMemo(() => {
    const targetOrders = dateFilteredOrders;
    const paidOrders = targetOrders.filter(order => order.paymentStatus === 'paid');
    const pendingPayments = targetOrders.filter(order => order.paymentStatus !== 'paid');
    const openOrders = targetOrders.filter(order => order.status !== 'Delivered');
    const deliveryOrders = targetOrders.filter(order => order.status === 'Out for Delivery');
    const grossSales = targetOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidSales = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingSales = pendingPayments.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const discounts = targetOrders.reduce((sum, order) => sum + Number(order.discount || 0), 0);
    const byPayment = new Map<string, { count: number; value: number }>();
    targetOrders.forEach(order => {
      const current = byPayment.get(order.paymentMethod) || { count: 0, value: 0 };
      byPayment.set(order.paymentMethod, { count: current.count + 1, value: current.value + Number(order.total || 0) });
    });
    return { paidOrders, pendingPayments, openOrders, deliveryOrders, grossSales, paidSales, pendingSales, discounts, byPayment };
  }, [dateFilteredOrders]);

  // Sorted and searched financial transactions
  const sortedFinancialTransactions = useMemo(() => {
    let list = dateFilteredOrders;

    if (financeStatusFilter !== 'all') {
      list = list.filter(o => o.paymentStatus === financeStatusFilter);
    }

    if (financeSearch.trim()) {
      const q = financeSearch.toLowerCase();
      list = list.filter(
        o =>
          (o?.orderNumber || '').toLowerCase().includes(q) ||
          (o?.shippingAddress?.fullName || '').toLowerCase().includes(q) ||
          (o?.paymentMethod || '').toLowerCase().includes(q) ||
          (o?.paymentReference || '').toLowerCase().includes(q)
      );
    }

    return list.slice().sort((a, b) => {
      if (financeSortOrder === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (financeSortOrder === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (financeSortOrder === 'amount-desc') {
        return (Number(b.total) || 0) - (Number(a.total) || 0);
      }
      if (financeSortOrder === 'amount-asc') {
        return (Number(a.total) || 0) - (Number(b.total) || 0);
      }
      return 0;
    });
  }, [dateFilteredOrders, financeStatusFilter, financeSearch, financeSortOrder]);

  // Daily financial summary breakdown
  const dailyFinancialSummary = useMemo(() => {
    const dayMap = new Map<string, { date: string; timestamp: number; count: number; gross: number; paid: number; pending: number }>();

    dateFilteredOrders.forEach(order => {
      const d = new Date(order.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amount = Number(order.total || 0);
      const isPaid = order.paymentStatus === 'paid';

      const existing = dayMap.get(dateKey) || {
        date: dateKey,
        timestamp: new Date(dateKey).getTime(),
        count: 0,
        gross: 0,
        paid: 0,
        pending: 0,
      };

      existing.count += 1;
      existing.gross += amount;
      if (isPaid) existing.paid += amount;
      else existing.pending += amount;

      dayMap.set(dateKey, existing);
    });

    const days = Array.from(dayMap.values());
    if (financeSortOrder === 'date-asc') {
      days.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      days.sort((a, b) => b.timestamp - a.timestamp);
    }
    return days;
  }, [dateFilteredOrders, financeSortOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([store.fetchOrders(), store.fetchAdminNotifications()]);
      setLastManualRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportFinances = () => {
    try {
      const csv = [
        ['Date', 'Order ID', 'Customer', 'Payment Method', 'Payment Status', 'Gross Amount (GHS)', 'Payment Reference'],
        ...sortedFinancialTransactions.map(o => [
          new Date(o.createdAt).toLocaleString(),
          o.orderNumber,
          o.shippingAddress?.fullName || 'Customer',
          o.paymentMethod,
          o.paymentStatus,
          Number(o.total || 0).toFixed(2),
          o.paymentReference || '',
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finances-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      showAlert('Finances report exported successfully', 'success');
    } catch {
      showAlert('Failed to export finances report', 'error');
    }
  };

  const hasActiveDateFilter = dateFilter !== 'all';

  const recentOpenOrders = dateFilteredOrders
    .filter(order => order.status !== 'Delivered')
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 dark:border-[#2e2428] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Operations &amp; Finance Command</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">Live Tracking &amp; Finance</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Monitor open deliveries, filter revenue by date range, and sort all finances and transactions chronologically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportFinances}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-3.5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#B27A52]" />
            Export Finances CSV
          </button>
          <button
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#33282C] disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Date Range Controls & Auto-Refresh Indicator */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 dark:text-stone-400 mr-1">
            <Calendar className="h-4 w-4 text-[#B27A52]" />
            <span>Finance Period:</span>
          </div>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as DateFilterPreset)}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:border-[#2e2428] dark:bg-[#2a2024] dark:text-stone-100 cursor-pointer"
          >
            {DATE_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-900 dark:border-[#2e2428] dark:bg-[#2a2024] dark:text-stone-100"
              />
              <span className="text-stone-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-900 dark:border-[#2e2428] dark:bg-[#2a2024] dark:text-stone-100"
              />
            </div>
          )}

          {hasActiveDateFilter && (
            <button
              onClick={() => { setDateFilter('all'); setCustomStart(''); setCustomEnd(''); }}
              className="flex items-center gap-1 rounded-xl border border-stone-200 px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 hover:bg-stone-50 dark:border-[#2e2428] dark:text-stone-400 dark:hover:bg-[#2a2024] cursor-pointer transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          Auto-refresh active
          {lastManualRefresh && <span>• Refreshed {lastManualRefresh.toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* Finance Metrics for Selected Date Range */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label={hasActiveDateFilter ? `Gross sales (${DATE_PRESETS.find(p => p.id === dateFilter)?.label})` : 'Gross sales'}
          value={money(metrics.grossSales)}
          detail={`${dateFilteredOrders.length} orders in period`}
          icon={DollarSign}
        />
        <Metric
          label="Paid revenue"
          value={money(metrics.paidSales)}
          detail={`${metrics.paidOrders.length} paid orders`}
          icon={WalletCards}
        />
        <Metric
          label="Pending payments"
          value={money(metrics.pendingSales)}
          detail={`${metrics.pendingPayments.length} awaiting settlement`}
          icon={CreditCard}
        />
        <Metric
          label="Open deliveries"
          value={metrics.openOrders.length}
          detail={`${metrics.deliveryOrders.length} out for delivery`}
          icon={Truck}
        />
      </div>

      {/* Main Operations & Finance Grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        {/* Order pipeline */}
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-[#2e2428]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B27A52]">Order pipeline</p>
              <h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">Live delivery status</h2>
            </div>
            <Activity className="h-5 w-5 text-[#B27A52]" />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-5">
            {statusOrder.map(status => {
              const count = dateFilteredOrders.filter(order => order.status === status).length;
              return (
                <div key={status} className="rounded-xl border border-stone-200 p-3 dark:border-[#2e2428]">
                  <p className="text-[10px] font-bold uppercase leading-4 text-stone-500 dark:text-stone-400">{status}</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">{count}</p>
                  <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[status]}`}>
                    {status === 'Delivered' ? 'Complete' : 'Active'}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="divide-y divide-stone-100 dark:divide-[#2e2428]">
            {recentOpenOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-500">No open orders in this period.</p>
            ) : (
              recentOpenOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => onViewOrder?.(order)}
                  className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-stone-50 dark:hover:bg-[#1a1316] sm:grid-cols-[1fr_auto_auto] sm:items-center cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {order.shippingAddress?.fullName} • {order.shippingAddress?.city} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{money(Number(order.total || 0))}</p>
                    <p className="mt-1 text-[10px] text-stone-500">{order.estimatedDeliveryTime || 'No ETA set'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Finance Reconciliation Box */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B27A52]">Finance</p>
              <h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">Period Reconciliation</h2>
            </div>
            <DollarSign className="h-5 w-5 text-[#B27A52]" />
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]">
              <span className="text-stone-500 dark:text-stone-400">Gross sales</span>
              <strong className="text-stone-900 dark:text-stone-100">{money(metrics.grossSales)}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]">
              <span className="text-stone-500 dark:text-stone-400">Paid</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{money(metrics.paidSales)}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]">
              <span className="text-stone-500 dark:text-stone-400">Awaiting payment</span>
              <strong className="text-amber-600 dark:text-amber-400">{money(metrics.pendingSales)}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]">
              <span className="text-stone-500 dark:text-stone-400">Discounts granted</span>
              <strong className="text-stone-900 dark:text-stone-100">{money(metrics.discounts)}</strong>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">Payment methods in period</p>
              {Array.from(metrics.byPayment.entries()).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="capitalize text-stone-500 dark:text-stone-400">{method.replaceAll('-', ' ')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{data.count} • {money(data.value)}</span>
                </div>
              ))}
              {metrics.byPayment.size === 0 && (
                <p className="text-xs text-stone-400 italic">No payments recorded in this period.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Detailed Financial Ledger & Date Sorting Section */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 dark:border-[#2e2428] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#B27A52]" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Financial Ledger &amp; Transactions</h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Review and sort financial transactions by date or amount with instant payment status breakdown.
            </p>
          </div>

          {/* Tab buttons: Transactions vs Daily summary */}
          <div className="flex items-center rounded-xl bg-stone-100 p-1 dark:bg-[#2a2024] text-xs font-bold">
            <button
              onClick={() => setFinanceViewTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                financeViewTab === 'transactions'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-[#201b1a] dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Transactions ({sortedFinancialTransactions.length})
            </button>
            <button
              onClick={() => setFinanceViewTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                financeViewTab === 'daily'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-[#201b1a] dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Daily Roll-up ({dailyFinancialSummary.length} days)
            </button>
          </div>
        </div>

        {/* Filter & Sort Bar for Financial Ledger */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, payment method, or ref..."
              value={financeSearch}
              onChange={e => setFinanceSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1719]"
            />
          </div>

          {financeViewTab === 'transactions' && (
            <select
              value={financeStatusFilter}
              onChange={e => setFinanceStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={financeSortOrder}
              onChange={e => setFinanceSortOrder(e.target.value as DateSortOrder)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-900 dark:text-stone-100 text-xs font-bold cursor-pointer"
            >
              <option value="date-desc">Date: Newest first</option>
              <option value="date-asc">Date: Oldest first</option>
              <option value="amount-desc">Amount: High to low</option>
              <option value="amount-asc">Amount: Low to high</option>
            </select>
          </div>
        </div>

        {/* Transactions Table View */}
        {financeViewTab === 'transactions' && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-[#2e2428]">
            <table className="w-full text-xs min-w-[720px]">
              <thead className="bg-stone-50 dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">
                    <button
                      type="button"
                      onClick={() => setFinanceSortOrder(s => s === 'date-desc' ? 'date-asc' : 'date-desc')}
                      className="group inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                    >
                      <span>Date &amp; Time</span>
                      {financeSortOrder === 'date-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-[#B27A52]" />
                      ) : financeSortOrder === 'date-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#B27A52]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Customer</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Method</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Status</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">
                    <button
                      type="button"
                      onClick={() => setFinanceSortOrder(s => s === 'amount-desc' ? 'amount-asc' : 'amount-desc')}
                      className="group inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                    >
                      <span>Amount</span>
                      {financeSortOrder === 'amount-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-[#B27A52]" />
                      ) : financeSortOrder === 'amount-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#B27A52]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#2e2428]">
                {sortedFinancialTransactions.length > 0 ? (
                  sortedFinancialTransactions.map(o => (
                    <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-[#1a1316] transition">
                      <td className="px-4 py-3 text-stone-500 dark:text-stone-400 font-mono">
                        {new Date(o.createdAt).toLocaleString('en-GH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-200">
                        <p>{o.shippingAddress?.fullName || 'Customer'}</p>
                        <p className="text-[10px] text-stone-400">{o.shippingAddress?.phone}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-stone-600 dark:text-stone-300">
                        <span className="inline-flex rounded-md bg-stone-100 dark:bg-[#2a2024] px-2 py-0.5 text-[11px] font-semibold">
                          {o.paymentMethod.replaceAll('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}
                        >
                          {o.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">
                        GHS {Number(o.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onViewOrder?.(o)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#1E1719] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#33282C] transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                      No financial transactions found for the selected date and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Daily Summary View */}
        {financeViewTab === 'daily' && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-[#2e2428]">
            <table className="w-full text-xs min-w-[640px]">
              <thead className="bg-stone-50 dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">
                    <button
                      type="button"
                      onClick={() => setFinanceSortOrder(s => s === 'date-desc' ? 'date-asc' : 'date-desc')}
                      className="group inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                    >
                      <span>Date</span>
                      {financeSortOrder === 'date-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-[#B27A52]" />
                      ) : (
                        <ArrowUp className="w-3.5 h-3.5 text-[#B27A52]" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Orders</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Paid Revenue</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Pending Amount</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-stone-500">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#2e2428]">
                {dailyFinancialSummary.length > 0 ? (
                  dailyFinancialSummary.map(row => (
                    <tr key={row.date} className="hover:bg-stone-50 dark:hover:bg-[#1a1316] transition">
                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                        {new Date(row.date).toLocaleDateString('en-GH', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">
                        {row.count} order{row.count !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        GHS {row.paid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                        GHS {row.pending.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">
                        GHS {row.gross.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400 italic">
                      No financial data recorded for this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delivery Attention */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#B27A52]" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Delivery Attention</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Out for delivery</p>
            <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-200">{metrics.deliveryOrders.length}</p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Orders currently with riders</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Needs packing</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
              {dateFilteredOrders.filter(order => order.status === 'Processing' || order.status === 'Packing Order').length}
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Orders in fulfilment</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Delivered</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {dateFilteredOrders.filter(order => order.status === 'Delivered').length}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Completed deliveries</p>
          </div>
        </div>
      </section>
    </div>
  );
};
