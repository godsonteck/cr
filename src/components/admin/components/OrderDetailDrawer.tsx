import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  MessageCircle, 
  User, 
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  PackageCheck,
  FileText,
  Trash2,
  Printer
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { useStore } from '../../../context/StoreContext';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, riderInfo?: any, estimatedDeliveryTime?: string, adminNote?: string) => Promise<void>;
  onUpdatePayment: (orderId: string, paymentStatus: 'paid' | 'pending') => void;
  onDeleteOrder?: (orderId: string) => void;
  onPrintReceipt?: (order: Order) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  onDeleteOrder,
  onPrintReceipt,
}) => {
  const { storeSettings } = useStore();
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderLocation, setRiderLocation] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [isSavingRider, setIsSavingRider] = useState(false);
  const [riderSavedNotice, setRiderSavedNotice] = useState(false);
  const [isMovingStep, setIsMovingStep] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  React.useEffect(() => {
    setRiderName(order?.riderInfo?.riderName || '');
    setRiderPhone(order?.riderInfo?.riderPhone || '');
    setRiderLocation(order?.riderInfo?.riderLocation || '');
    setEstimatedDeliveryTime(order?.estimatedDeliveryTime || '');
    setStatusNote('');
  }, [order]);

  if (!isOpen || !order) return null;

  const customerPhoneClean = String(order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean}?text=${encodeURIComponent(`Hello ${order.shippingAddress.fullName}, thank you for shopping with ${storeSettings.storeName}. We are currently preparing your delivery for order #${order.orderNumber}.`)}`;

  const stages: { label: OrderStatus; desc: string }[] = [
    { label: 'Confirmed', desc: 'Order received & confirmed' },
    { label: 'Processing', desc: 'Items being picked in shop' },
    { label: 'Packing Order', desc: 'Items securely packed' },
    { label: 'Out for Delivery', desc: 'With delivery rider' },
    { label: 'Delivered', desc: 'Delivered to customer' },
  ];

  const currentStageIdx = stages.findIndex(s => s.label === order.status);

  const updateStatus = async (status: OrderStatus) => {
    setIsMovingStep(true);
    try {
      await onUpdateStatus(order.id, status, { riderName, riderPhone, riderLocation }, estimatedDeliveryTime, statusNote);
      setStatusNote('');
    } finally {
      setIsMovingStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end font-sans animate-fadeIn">
      <div 
        className="w-full max-w-2xl clay-drawer h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between bg-stone-100/50 dark:bg-stone-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-stone-900 dark:text-stone-100">{order.orderNumber}</span>
              <span className={
                order.status === 'Delivered' ? 'clay-badge clay-badge-success' :
                order.status === 'Out for Delivery' ? 'clay-badge clay-badge-info' :
                'clay-badge clay-badge-warning'
              }>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Ordered on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onPrintReceipt && (
              <button
                onClick={() => onPrintReceipt(order)}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
                title="Print Official Customer Receipt / Invoice"
              >
                <Printer className="w-5 h-5" />
              </button>
            )}
            {onDeleteOrder && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete order ${order.orderNumber}?`)) {
                    onDeleteOrder(order.id);
                    onClose();
                  }
                }}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                title="Delete this order"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800 dark:text-stone-200">
          
          {/* Status Progression Bar */}
          <div className="clay-card-sm p-4 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              Order progress
            </h4>
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
              {stages.map((stage, i) => {
                const isPassed = i <= (currentStageIdx === -1 ? 0 : currentStageIdx);
                const isCurrent = i === currentStageIdx;
                return (
                  <button
                    key={stage.label}
                    type="button"
                    disabled={isMovingStep}
                    onClick={() => void updateStatus(stage.label)}
                    className={`flex-1 min-w-[90px] p-2 rounded-xl text-center transition-all cursor-pointer ${
                      isCurrent 
                        ? 'clay-btn-primary font-bold shadow-sm' 
                        : isPassed 
                        ? 'clay-badge clay-badge-success font-semibold justify-center' 
                        : 'neu-sunken-sm text-stone-500 dark:text-stone-400 hover:text-stone-800'
                    }`}
                  >
                    <p className="text-[11px] leading-tight">{stage.label}</p>
                  </button>
                );
              })}
            </div>
            <div>
              <label htmlFor="order-status-note" className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                <FileText className="h-3.5 w-3.5" /> Internal note for this status update (optional)
              </label>
              <textarea
                id="order-status-note"
                value={statusNote}
                onChange={event => setStatusNote(event.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="e.g. Packaging checked; customer requested a call before delivery."
                className="neu-input mt-1.5 w-full resize-y px-3 py-2 text-xs"
              />
              <p className="mt-1 text-[10px] text-stone-500">Visible to admins only; it is saved when you move the order to a status.</p>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="clay-card-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-[#C89B3C]" />
                  <span>Customer</span>
                </h4>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-badge clay-badge-success hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-stone-100">{order.shippingAddress.fullName}</strong></p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${order.shippingAddress.phone}`} className="hover:underline text-stone-800 dark:text-stone-200 font-bold">
                    {order.shippingAddress.phone}
                  </a>
                </p>
                {order.shippingAddress.email && (
                  <p className="text-stone-500 dark:text-stone-400">{order.shippingAddress.email}</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="clay-card-sm p-4 space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-[#C89B3C]" />
                <span>Delivery address</span>
              </h4>

              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {order.shippingAddress.area || 'Accra Suburb'}, {order.shippingAddress.city}
                </p>
                {order.shippingAddress.landmarkOrGps && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Landmark / Nearby place: <span className="font-mono text-stone-700 dark:text-stone-300">{order.shippingAddress.landmarkOrGps}</span>
                  </p>
                )}
                <p className="text-[11px] text-stone-400 capitalize mt-2 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                  Delivery Type: {order.deliveryMethod.replace('-', ' ')}
                </p>
              </div>
            </div>

          </div>

          {order.paymentStatus === 'pending' && order.paymentMethod.startsWith('momo') && (
            <div className="clay-card-sm p-4 text-xs text-amber-950 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
              <h4 className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Manual payment verification
              </h4>
              <p className="mt-1">Check the business account before marking this order as paid. Never rely on a screenshot alone.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><p><strong>Transaction reference:</strong><br />{order.paymentReference || 'Not provided'}</p><p><strong>Sender number:</strong><br />{order.paymentSenderPhone || 'Not provided'}</p></div>
            </div>
          )}

          {/* Courier Assignment */}
          <div className="clay-card-sm p-4 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
              <Truck className="w-4 h-4 text-[#C89B3C]" />
              <span>Delivery details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={riderName}
                  onChange={e => setRiderName(e.target.value)}
                  placeholder="Enter name"
                  className="neu-input w-full px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={riderPhone}
                  onChange={e => setRiderPhone(e.target.value)}
                  placeholder="Enter phone"
                  className="neu-input w-full px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">Current location (optional)</label>
                <input
                  type="text"
                  value={riderLocation}
                  onChange={e => setRiderLocation(e.target.value)}
                  placeholder="Enter location"
                  className="neu-input w-full px-3 py-1.5 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">Delivery ETA</label>
              {riderSavedNotice && (
                <span className="text-[11px] font-bold text-emerald-600 animate-fadeIn">✓ Delivery details saved</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={estimatedDeliveryTime}
                onChange={e => setEstimatedDeliveryTime(e.target.value)}
                placeholder="e.g. Today, 2-4 PM"
                className="neu-input flex-1 px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={async () => {
                  setIsSavingRider(true);
                  try {
                    await onUpdateStatus(order.id, order.status, { riderName, riderPhone, riderLocation }, estimatedDeliveryTime);
                    setRiderSavedNotice(true);
                    setTimeout(() => setRiderSavedNotice(false), 3000);
                  } finally {
                    setIsSavingRider(false);
                  }
                }}
                disabled={isSavingRider}
                className="clay-btn-primary px-3.5 py-1.5 text-xs shrink-0 cursor-pointer"
              >
                {isSavingRider ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="clay-card-sm overflow-hidden">
            <div className="p-3.5 bg-stone-100/60 dark:bg-stone-900/40 border-b border-stone-200/60 dark:border-stone-800/60 font-bold text-stone-900 dark:text-stone-100 text-xs">
              Items ({order.items.length})
            </div>
            <div className="divide-y divide-stone-200/50 dark:divide-stone-800/50">
              {order.items.map((item, idx) => (
                <div key={item.product?.id || idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.image} alt="" className="w-11 h-11 rounded-xl object-cover neu-sunken-sm shrink-0" />
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{item.product?.name || 'Shop Item'}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.product?.brand} {item.selectedOption ? `• Option: ${item.selectedOption}` : ''}
                      </p>
                      <p className="text-[11px] text-stone-400">Qty: {item.quantity} × GHS {Number(item.product?.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-right">
                    GHS {(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-stone-100/50 dark:bg-stone-900/30 border-t border-stone-200/60 dark:border-stone-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Items:</span>
                <span>GHS {Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Discount {order.appliedPromoCode ? `(${order.appliedPromoCode})` : ''}:</span>
                  <span>- GHS {Number(order.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Delivery:</span>
                <span>GHS {Number(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
                <span>Total:</span>
                <span className="text-stone-900 dark:text-stone-100">GHS {Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.adminNotes && order.adminNotes.length > 0 && (
            <section className="clay-card-sm p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100"><FileText className="h-4 w-4 text-[#C89B3C]" /> Delivery activity</h4>
              <div className="mt-3 space-y-3">
                {[...order.adminNotes].reverse().map((entry, index) => (
                  <div key={`${entry.createdAt}-${index}`} className="border-l-2 border-stone-300 dark:border-stone-700 pl-3">
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Moved to {entry.status}</p>
                    {entry.note && <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">{entry.note}</p>}
                    <p className="mt-1 text-[10px] text-stone-500">{new Date(entry.createdAt).toLocaleString()}{entry.adminName ? ` · ${entry.adminName}` : ''}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment Status & Method */}
          <div className="clay-card-sm p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-900 dark:text-stone-100">Payment</span>
              <p className="text-stone-500 text-[11px] capitalize">Paid by: {(order.paymentMethod || 'N/A').replace('-', ' ')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdatePayment(order.id, order.paymentStatus === 'paid' ? 'pending' : 'paid')}
                disabled={order.paymentMethod === 'paystack' || order.paymentStatus === 'failed'}
                className={`cursor-pointer transition-transform ${
                  order.paymentStatus === 'paid' 
                    ? 'clay-badge clay-badge-success' 
                    : 'clay-badge clay-badge-warning'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {order.paymentStatus === 'paid' ? '✓ Paid & Received' : order.paymentStatus === 'failed' ? 'Payment Failed' : '⚠ Payment Pending'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200/60 dark:border-stone-800/60 bg-stone-100/50 dark:bg-stone-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="clay-btn-secondary px-4 py-2 text-xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!['Delivered', 'Refunded', 'Cancelled'].includes(order.status) && (
              <button
                disabled={isMovingStep}
                onClick={async () => {
                  const nextStageMap: Record<OrderStatus, OrderStatus> = {
                    'Confirmed': 'Processing',
                    'Processing': 'Packing Order',
                    'Packing Order': 'Out for Delivery',
                    'Out for Delivery': 'Delivered',
                    'Delivered': 'Delivered',
                    'Refunded': 'Refunded',
                    'Cancelled': 'Cancelled'
                  };
                  const next = nextStageMap[order.status];
                  if (!next) return;
                  try {
                    await updateStatus(next);
                  } catch {
                    // The store context exposes the failed update to the admin portal.
                  }
                }}
                className="clay-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>{isMovingStep ? 'Updating...' : 'Move to Next Delivery Step'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
