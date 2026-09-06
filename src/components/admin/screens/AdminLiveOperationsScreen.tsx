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
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { Order, OrderStatus } from '../../../types';

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
  const [refreshing, setRefreshing] = useState(false);
  const [lastManualRefresh, setLastManualRefresh] = useState<Date | null>(null);
  const orders = store.orders || [];

  const metrics = useMemo(() => {
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
    const pendingPayments = orders.filter(order => order.paymentStatus !== 'paid');
    const openOrders = orders.filter(order => order.status !== 'Delivered');
    const deliveryOrders = orders.filter(order => order.status === 'Out for Delivery');
    const grossSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidSales = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingSales = pendingPayments.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const discounts = orders.reduce((sum, order) => sum + Number(order.discount || 0), 0);
    const byPayment = new Map<string, { count: number; value: number }>();
    orders.forEach(order => {
      const current = byPayment.get(order.paymentMethod) || { count: 0, value: 0 };
      byPayment.set(order.paymentMethod, { count: current.count + 1, value: current.value + Number(order.total || 0) });
    });
    return { paidOrders, pendingPayments, openOrders, deliveryOrders, grossSales, paidSales, pendingSales, discounts, byPayment };
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([store.fetchOrders(), store.fetchAdminNotifications()]);
      setLastManualRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  const recentOpenOrders = orders
    .filter(order => order.status !== 'Delivered')
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 dark:border-[#2e2428] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Operations command</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">Live tracking &amp; finance</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">Monitor open deliveries, payment reconciliation, and store revenue from one working view.</p>
        </div>
        <button onClick={() => void handleRefresh()} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#33282C] disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh data
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
        Auto-refreshing every 30 seconds
        {lastManualRefresh && <span>• Last manual refresh {lastManualRefresh.toLocaleTimeString()}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="Gross sales" value={money(metrics.grossSales)} detail={`${orders.length} total orders`} icon={DollarSign} />
        <Metric label="Paid revenue" value={money(metrics.paidSales)} detail={`${metrics.paidOrders.length} paid orders`} icon={WalletCards} />
        <Metric label="Pending payments" value={money(metrics.pendingSales)} detail={`${metrics.pendingPayments.length} need reconciliation`} icon={CreditCard} />
        <Metric label="Open deliveries" value={metrics.openOrders.length} detail={`${metrics.deliveryOrders.length} out for delivery`} icon={Truck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-[#2e2428]">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B27A52]">Order pipeline</p><h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">Live delivery status</h2></div>
            <Activity className="h-5 w-5 text-[#B27A52]" />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-5">
            {statusOrder.map(status => {
              const count = orders.filter(order => order.status === status).length;
              return <div key={status} className="rounded-xl border border-stone-200 p-3 dark:border-[#2e2428]"><p className="text-[10px] font-bold uppercase leading-4 text-stone-500 dark:text-stone-400">{status}</p><p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">{count}</p><div className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[status]}`}>{status === 'Delivered' ? 'Complete' : 'Active'}</div></div>;
            })}
          </div>
          <div className="divide-y divide-stone-100 dark:divide-[#2e2428]">
            {recentOpenOrders.length === 0 ? <p className="px-5 py-10 text-center text-sm text-stone-500">No open orders right now.</p> : recentOpenOrders.map(order => (
              <button key={order.id} onClick={() => onViewOrder?.(order)} className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-stone-50 dark:hover:bg-[#1a1316] sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0"><p className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">{order.orderNumber}</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{order.shippingAddress?.fullName} • {order.shippingAddress?.city}</p></div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[order.status]}`}>{order.status}</span>
                <div className="text-left sm:text-right"><p className="text-sm font-bold text-stone-900 dark:text-stone-100">{money(Number(order.total || 0))}</p><p className="mt-1 text-[10px] text-stone-500">{order.estimatedDeliveryTime || 'No ETA set'}</p></div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B27A52]">Finance</p><h2 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">Reconciliation</h2></div><DollarSign className="h-5 w-5 text-[#B27A52]" /></div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]"><span className="text-stone-500 dark:text-stone-400">Gross sales</span><strong className="text-stone-900 dark:text-stone-100">{money(metrics.grossSales)}</strong></div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]"><span className="text-stone-500 dark:text-stone-400">Paid</span><strong className="text-emerald-600 dark:text-emerald-400">{money(metrics.paidSales)}</strong></div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]"><span className="text-stone-500 dark:text-stone-400">Awaiting payment</span><strong className="text-amber-600 dark:text-amber-400">{money(metrics.pendingSales)}</strong></div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm dark:border-[#2e2428]"><span className="text-stone-500 dark:text-stone-400">Discounts granted</span><strong className="text-stone-900 dark:text-stone-100">{money(metrics.discounts)}</strong></div>
            <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">Payment methods</p>{Array.from(metrics.byPayment.entries()).map(([method, data]) => <div key={method} className="flex items-center justify-between py-1.5 text-xs"><span className="capitalize text-stone-500 dark:text-stone-400">{method.replaceAll('-', ' ')}</span><span className="font-semibold text-stone-900 dark:text-stone-100">{data.count} • {money(data.value)}</span></div>)}</div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-[#2e2428] dark:bg-[#201b1a]">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#B27A52]" /><h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Delivery attention</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20"><p className="text-xs font-bold text-amber-800 dark:text-amber-300">Out for delivery</p><p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-200">{metrics.deliveryOrders.length}</p><p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Orders currently with riders</p></div>
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20"><p className="text-xs font-bold text-blue-800 dark:text-blue-300">Needs packing</p><p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">{orders.filter(order => order.status === 'Processing' || order.status === 'Packing Order').length}</p><p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Orders in fulfilment</p></div>
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20"><p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Delivered</p><p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-200">{orders.filter(order => order.status === 'Delivered').length}</p><p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Completed deliveries</p></div>
        </div>
      </section>
    </div>
  );
};
