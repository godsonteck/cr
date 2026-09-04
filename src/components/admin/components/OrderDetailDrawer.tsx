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
  Trash2,
  Printer
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, riderInfo?: any) => void;
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
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderLocation, setRiderLocation] = useState('');

  React.useEffect(() => {
    setRiderName(order?.riderInfo?.riderName || '');
    setRiderPhone(order?.riderInfo?.riderPhone || '');
    setRiderLocation(order?.riderInfo?.riderLocation || '');
  }, [order]);

  if (!isOpen || !order) return null;

  const customerPhoneClean = order.shippingAddress.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean}?text=${encodeURIComponent(`Hello ${order.shippingAddress.fullName}, thank you for shopping with CR Cosmetics and Essential. We are currently preparing your delivery for order #${order.orderNumber}.`)}`;

  const stages: { label: OrderStatus; desc: string }[] = [
    { label: 'Confirmed', desc: 'Order received & confirmed' },
    { label: 'Processing', desc: 'Items being picked in shop' },
    { label: 'Packing Order', desc: 'Items securely packed' },
    { label: 'Out for Delivery', desc: 'With delivery rider' },
    { label: 'Delivered', desc: 'Delivered to customer' },
  ];

  const currentStageIdx = stages.findIndex(s => s.label === order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end font-sans animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-stone-900">{order.orderNumber}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Ordered on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onPrintReceipt && (
              <button
                onClick={() => onPrintReceipt(order)}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
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
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete this order"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800">
          
          {/* Status Progression Bar */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Order progress
            </h4>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {stages.map((stage, i) => {
                const isPassed = i <= (currentStageIdx === -1 ? 0 : currentStageIdx);
                const isCurrent = i === currentStageIdx;
                return (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => onUpdateStatus(order.id, stage.label, { riderName, riderPhone, riderLocation })}
                    className={`flex-1 min-w-[90px] p-2 rounded-xl text-center border transition-all cursor-pointer ${
                      isCurrent 
                        ? 'border-stone-900 bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' 
                        : isPassed 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold' 
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <p className="text-[11px] leading-tight">{stage.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-[#C89B3C]" />
                  <span>Customer</span>
                </h4>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <p><strong className="text-stone-900">{order.shippingAddress.fullName}</strong></p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${order.shippingAddress.phone}`} className="hover:underline text-stone-800 font-bold">
                    {order.shippingAddress.phone}
                  </a>
                </p>
                {order.shippingAddress.email && (
                  <p className="text-stone-500">{order.shippingAddress.email}</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-[#C89B3C]" />
                <span>Delivery address</span>
              </h4>

              <div className="space-y-1 text-xs text-stone-600">
                <p className="font-semibold text-stone-800">
                  {order.shippingAddress.area || 'Accra Suburb'}, {order.shippingAddress.city}
                </p>
                {order.shippingAddress.landmarkOrGps && (
                  <p className="text-[11px] text-stone-500">
                    Landmark / Nearby place: <span className="font-mono text-stone-700">{order.shippingAddress.landmarkOrGps}</span>
                  </p>
                )}
                <p className="text-[11px] text-stone-400 capitalize mt-2 pt-1 border-t border-stone-100">
                  Delivery Type: {order.deliveryMethod.replace('-', ' ')}
                </p>
              </div>
            </div>

          </div>

          {order.paymentStatus === 'pending' && order.paymentMethod.startsWith('momo') && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
              <h4 className="font-bold">Manual payment verification</h4>
              <p className="mt-1">Check the business account before marking this order as paid. Never rely on a screenshot alone.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><p><strong>Transaction reference:</strong><br />{order.paymentReference || 'Not provided'}</p><p><strong>Sender number:</strong><br />{order.paymentSenderPhone || 'Not provided'}</p></div>
            </div>
          )}

          {/* Courier Assignment */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Truck className="w-4 h-4 text-[#C89B3C]" />
              <span>Delivery details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={riderName}
                  onChange={e => setRiderName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>
              <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={riderPhone}
                  onChange={e => setRiderPhone(e.target.value)}
                  placeholder="Enter phone"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>
              <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Current location (optional)</label>
                <input
                  type="text"
                  value={riderLocation}
                  onChange={e => setRiderLocation(e.target.value)}
                  placeholder="Enter location"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 bg-stone-50 border-b border-stone-200 font-bold text-stone-900 text-xs">
              Items ({order.items.length})
            </div>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={item.product?.id || idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.image} alt="" className="w-11 h-11 rounded-lg object-cover bg-stone-100 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-900">{item.product?.name || 'Shop Item'}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.product?.brand} {item.selectedOption ? `• Option: ${item.selectedOption}` : ''}
                      </p>
                      <p className="text-[11px] text-stone-400">Qty: {item.quantity} × GHS {item.product?.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900 text-right">
                    GHS {((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-stone-50/80 border-t border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items:</span>
                <span>GHS {order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount {order.appliedPromoCode ? `(${order.appliedPromoCode})` : ''}:</span>
                  <span>- GHS {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery:</span>
                <span>GHS {order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total:</span>
                <span className="text-stone-900">GHS {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status & Method */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-900">Payment</span>
              <p className="text-stone-500 text-[11px] capitalize">Paid by: {order.paymentMethod.replace('-', ' ')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdatePayment(order.id, order.paymentStatus === 'paid' ? 'pending' : 'paid')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {order.paymentStatus === 'paid' ? '✓ Paid & Received' : '⚠ Payment Pending'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-700 hover:bg-stone-100"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {order.status !== 'Delivered' && (
              <button
                onClick={() => {
                  const nextStageMap: Record<OrderStatus, OrderStatus> = {
                    'Confirmed': 'Processing',
                    'Processing': 'Packing Order',
                    'Packing Order': 'Out for Delivery',
                    'Out for Delivery': 'Delivered',
                    'Delivered': 'Delivered'
                  };
                  const next = nextStageMap[order.status];
                  onUpdateStatus(order.id, next, { riderName, riderPhone, riderLocation });
                }}
                className="px-4 py-2 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Move to Next Delivery Step</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
