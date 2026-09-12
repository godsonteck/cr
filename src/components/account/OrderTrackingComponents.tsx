import React from 'react';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  Printer,
  ArrowRight,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { Button } from '../common/UIPrimitives';

// ============================================================================
// Order Tracking Stages & Constants
// ============================================================================

export interface OrderStageItem {
  id: string;
  statusKey?: OrderStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

export const ORDER_STAGES: OrderStageItem[] = [
  {
    id: 'placed',
    label: 'Order Placed',
    shortLabel: 'Placed',
    icon: CheckCircle2,
    description: 'Order successfully placed and recorded.',
  },
  {
    id: 'confirmed',
    statusKey: 'Confirmed',
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    icon: ShieldCheck,
    description: "We've received your order and it's confirmed.",
  },
  {
    id: 'processing',
    statusKey: 'Processing',
    label: 'Processing',
    shortLabel: 'Processing',
    icon: Package,
    description: "We're getting your items ready.",
  },
  {
    id: 'packing',
    statusKey: 'Packing Order',
    label: 'Packed',
    shortLabel: 'Packed',
    icon: ShoppingBag,
    description: 'Your order is packed and ready to dispatch.',
  },
  {
    id: 'delivering',
    statusKey: 'Out for Delivery',
    label: 'On the Way',
    shortLabel: 'On Way',
    icon: Truck,
    description: 'Your order is on its way to you.',
  },
  {
    id: 'delivered',
    statusKey: 'Delivered',
    label: 'Delivered',
    shortLabel: 'Done',
    icon: Sparkles,
    description: 'Delivered. We hope you love your purchase.',
  },
];

export const STATUS_INDEX: Record<OrderStatus, number> = {
  'Confirmed': 1,
  'Processing': 2,
  'Packing Order': 3,
  'Out for Delivery': 4,
  'Delivered': 5,
};

export const STATUS_MESSAGE: Record<OrderStatus, string> = {
  'Confirmed': "We've received your order and it's confirmed.",
  'Processing': "We're getting your items ready.",
  'Packing Order': 'Your order is packed and ready to dispatch.',
  'Out for Delivery': 'Your order is on its way to you.',
  'Delivered': 'Delivered. We hope you love your purchase.',
};

// ============================================================================
// Order Progress Tracker (Desktop Horizontal + Mobile Vertical)
// ============================================================================

export const OrderProgressTracker: React.FC<{
  status: OrderStatus;
  compact?: boolean;
}> = ({ status, compact = false }) => {
  const currentIdx = STATUS_INDEX[status] ?? 1;

  return (
    <div aria-label="Order progress" role="list">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start" aria-hidden="true">
        {ORDER_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentIdx || (idx === currentIdx && status === 'Delivered');
          const isCurrent = idx === currentIdx && status !== 'Delivered';
          const isFuture = idx > currentIdx;

          return (
            <div key={stage.id} className="flex flex-1 flex-col items-center" role="listitem">
              {/* Node + connecting lines */}
              <div className="flex w-full items-center">
                {/* Left line */}
                {idx > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-500 ${
                      idx <= currentIdx ? 'bg-[#C86D51]' : 'bg-[var(--border-color)]'
                    }`}
                  />
                )}
                {/* Circle */}
                <div
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-[#C86D51] bg-[#C86D51] shadow-[0_0_0_4px_rgba(200,109,81,0.18)]'
                      : isDone
                      ? 'border-[#C86D51] bg-[#C86D51]'
                      : 'border-[var(--border-color)] bg-[var(--bg-soft)]'
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isDone || isCurrent ? 'text-white' : 'text-[var(--text-subtle)]'
                    }`}
                    aria-hidden="true"
                  />
                  {isCurrent && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#C86D51] opacity-20" />
                  )}
                </div>
                {/* Right line */}
                {idx < ORDER_STAGES.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-500 ${
                      idx < currentIdx ? 'bg-[#C86D51]' : 'bg-[var(--border-color)]'
                    }`}
                  />
                )}
              </div>
              {/* Label */}
              {!compact && (
                <p
                  className={`mt-2 text-center text-[10px] font-bold leading-tight transition-colors ${
                    isCurrent
                      ? 'text-[#C86D51]'
                      : isDone
                      ? 'text-[var(--text-primary)]'
                      : isFuture
                      ? 'text-[var(--text-subtle)] opacity-50'
                      : ''
                  }`}
                >
                  {stage.label}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 sm:hidden">
        {ORDER_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentIdx || (idx === currentIdx && status === 'Delivered');
          const isCurrent = idx === currentIdx && status !== 'Delivered';
          const isFuture = idx > currentIdx;
          const isLast = idx === ORDER_STAGES.length - 1;

          return (
            <div key={stage.id} className="flex items-start gap-3" role="listitem">
              {/* Node + vertical line */}
              <div className="flex flex-col items-center">
                <div
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isCurrent
                      ? 'border-[#C86D51] bg-[#C86D51] shadow-[0_0_0_3px_rgba(200,109,81,0.18)]'
                      : isDone
                      ? 'border-[#C86D51] bg-[#C86D51]'
                      : 'border-[var(--border-color)] bg-[var(--bg-soft)]'
                  }`}
                >
                  <Icon
                    className={`h-3 w-3 ${
                      isDone || isCurrent ? 'text-white' : 'text-[var(--text-subtle)]'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                {!isLast && (
                  <div
                    className={`mt-0.5 w-0.5 flex-1 min-h-[1.5rem] ${
                      idx < currentIdx ? 'bg-[#C86D51]' : 'bg-[var(--border-color)]'
                    }`}
                  />
                )}
              </div>
              {/* Text */}
              <div className={`pb-3 pt-0.5 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`text-[11px] font-bold ${
                    isCurrent
                      ? 'text-[#C86D51]'
                      : isDone
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-subtle)] opacity-50'
                  }`}
                >
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-[10px] text-[var(--text-subtle)]">{STATUS_MESSAGE[status]}</p>
                )}
                {isDone && (
                  <p className="mt-0.5 text-[10px] text-[var(--text-subtle)] opacity-60">Completed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen-reader status */}
      <p className="sr-only">
        Current status: {status}. {STATUS_MESSAGE[status]}
      </p>
    </div>
  );
};

// ============================================================================
// Delivery Timeline (Audit Log with Real Timestamps)
// ============================================================================

export const DeliveryTimeline: React.FC<{ order: Order }> = ({ order }) => {
  const hasNotes = Array.isArray(order.adminNotes) && order.adminNotes.length > 0;

  const formatTs = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      if (isToday) {
        return `Today at ${d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formattedPlacedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">
        Delivery Updates & Timeline
      </p>
      <div className="space-y-3">
        {hasNotes ? (
          <>
            {[...order.adminNotes!].reverse().map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C86D51]" />
                  <div className="mt-1 w-px flex-1 min-h-[1.25rem] bg-[var(--border-color)]" />
                </div>
                <div className="pb-3">
                  <p className="text-[10px] font-bold text-[var(--text-subtle)]">
                    {formatTs(entry.createdAt)}
                  </p>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{entry.status}</p>
                  {entry.note && (
                    <p className="text-[11px] text-[var(--text-subtle)] mt-0.5 leading-relaxed">
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {/* Always finish with initial Placed milestone */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-subtle)]">
                  {formattedPlacedDate}
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Order Placed</p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                  Your order has been recorded into our system.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C86D51]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-subtle)]">
                {formattedPlacedDate || 'Just now'}
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Order Placed & Confirmed</p>
              <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                Your order has been received and confirmed. We will update you at every step.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Active Order Hero Card
// ============================================================================

export interface OrderStatusHeroProps {
  order: Order;
  onViewDetails?: () => void;
  onReceipt?: () => void;
}

export const OrderStatusHero: React.FC<OrderStatusHeroProps> = ({
  order,
  onViewDetails,
  onReceipt,
}) => {
  const currentIdx = STATUS_INDEX[order.status] ?? 1;
  const isDelivered = order.status === 'Delivered';
  const isOutForDelivery = order.status === 'Out for Delivery';
  const accentColor = isDelivered ? '#4A5D4E' : '#C86D51';

  return (
    <div
      className="overflow-hidden rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] shadow-sm"
      role="region"
      aria-label={`Active order ${order.orderNumber}`}
    >
      {/* Status header bar */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: isDelivered ? 'rgba(74,93,78,0.08)' : 'rgba(200,109,81,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative" aria-hidden="true">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            {isDelivered ? 'Order Delivered' : 'Live Order in Progress'}
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
          style={{ backgroundColor: accentColor }}
        >
          {order.status}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Order identity + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Order</p>
            <h3 className="text-xl font-black text-[#1C1817] dark:text-stone-100 mt-0.5">
              #{order.orderNumber}
            </h3>
            <p className="text-xs text-[var(--text-subtle)] mt-0.5">{STATUS_MESSAGE[order.status]}</p>
            {order.estimatedDeliveryTime && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-soft)] px-2.5 py-1">
                <Clock className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />
                <span className="text-[11px] font-bold text-[var(--accent)]">
                  Est. {order.estimatedDeliveryTime}
                </span>
              </div>
            )}
          </div>
          {(onReceipt || onViewDetails) && (
            <div className="flex gap-2 sm:flex-col sm:items-end">
              {onReceipt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReceipt}
                  className="flex-1 sm:flex-none rounded-xl text-xs font-bold"
                  aria-label="View digital receipt"
                >
                  <Printer className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Receipt
                </Button>
              )}
              {onViewDetails && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onViewDetails}
                  className="flex-1 sm:flex-none rounded-xl text-xs font-bold bg-[var(--text-primary)] text-white hover:opacity-90"
                  aria-label="View full order details"
                >
                  Full Details <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress tracker */}
        <div className="border-t border-[var(--border-color)] pt-4">
          <OrderProgressTracker status={order.status} />
          {/* Desktop status message */}
          <p className="hidden sm:block mt-3 text-xs text-[var(--text-subtle)]">
            {STATUS_MESSAGE[order.status]}
          </p>
        </div>

        {/* Rider info (only when real data exists) */}
        {isOutForDelivery && order.riderInfo?.riderName && (
          <div className="flex items-center justify-between rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[var(--bg-soft)] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-[#241D20] text-[#C86D51]">
                <Truck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1817] dark:text-stone-100">
                  {order.riderInfo.riderName}
                </p>
                {order.riderInfo.estimatedArrival && (
                  <p className="text-[10px] text-[var(--text-subtle)]">
                    ETA: {order.riderInfo.estimatedArrival}
                  </p>
                )}
              </div>
            </div>
            {order.riderInfo.riderPhone && (
              <a
                href={`tel:${order.riderInfo.riderPhone}`}
                className="flex items-center gap-1.5 rounded-xl bg-[#C86D51] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#8A3D52] transition"
                aria-label={`Call rider ${order.riderInfo.riderName}`}
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call Rider
              </a>
            )}
          </div>
        )}

        {/* Progress count */}
        <p className="text-[10px] text-[var(--text-subtle)] text-right">
          Step {Math.min(currentIdx + 1, ORDER_STAGES.length)} of {ORDER_STAGES.length}
        </p>
      </div>
    </div>
  );
};
