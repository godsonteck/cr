import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, ShoppingBag, MessageCircle, Save } from 'lucide-react';
import { Customer, Order } from '../../../types';
import { useStore } from '../../../context/StoreContext';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSaveCustomerNotes?: (customerId: string, notes: string) => void;
  onToggleWholesale?: (customerId: string, isWholesale: boolean) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  orders,
  onSaveCustomerNotes,
  onToggleWholesale,
}) => {
  const { storeSettings } = useStore();
  const [notes, setNotes] = useState(customer?.notes || '');
  const [isWholesale, setIsWholesale] = useState(customer?.isWholesale || false);
  const [savingWholesale, setSavingWholesale] = useState(false);

  React.useEffect(() => {
    setNotes(customer?.notes || '');
    setIsWholesale(customer?.isWholesale || false);
  }, [customer]);

  if (!isOpen || !customer) return null;

  const customerOrders = orders.filter(
    o =>
      o.shippingAddress.fullName.toLowerCase() === customer.fullName.toLowerCase() ||
      o.shippingAddress.phone === customer.phone ||
      (o.shippingAddress.email && o.shippingAddress.email.toLowerCase() === customer.email.toLowerCase())
  );

  const customerPhoneClean = String(customer?.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${
    customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean
  }?text=${encodeURIComponent(`Hello ${customer.fullName}, this is ${storeSettings.storeName}.`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-fadeIn">
      <div
        className="w-full max-w-lg clay-drawer h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between bg-stone-100/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="clay-icon-pod w-12 h-12 text-[#8A5738] dark:text-[#E8B792] flex items-center justify-center font-bold font-serif text-lg overflow-hidden">
              {customer.profileImage ? <img src={customer.profileImage} alt="" className="h-full w-full object-cover" /> : customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                {customer.fullName}
              </h3>
              <span className="clay-badge clay-badge-warning inline-flex mt-1">
                {customer.segment === 'High Value' ? 'Top Spender' : customer.segment}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800 dark:text-stone-200">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="clay-card-sm p-4 space-y-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">Total Spent</span>
              <p className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                GHS {Number(customer.totalSpent || 0).toFixed(2)}
              </p>
            </div>
            <div className="clay-card-sm p-4 space-y-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">Completed Orders</span>
              <p className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="clay-card-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 dark:text-stone-100">Contact Details</h4>
              {customerPhoneClean.length >= 7 && customer.phone !== 'No phone recorded' && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-badge clay-badge-success hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                {customer.phone === 'No phone recorded' ? <span className="text-stone-400">No phone recorded</span> : <a href={`tel:${customer.phone}`} className="font-bold text-stone-900 dark:text-stone-100 hover:underline">{customer.phone}</a>}
              </p>
              {customer.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <a href={`mailto:${customer.email}`} className="text-stone-700 dark:text-stone-300 hover:underline">
                    {customer.email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Saved Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="clay-card-sm p-4 space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#B27A52]" />
                <span>Delivery Address</span>
              </h4>
              {customer.addresses.map((addr, idx) => (
                <div key={idx} className="neu-sunken-sm p-3 rounded-xl space-y-1">
                  <p className="font-bold text-stone-800 dark:text-stone-200">
                    {addr.area ? `${addr.area}, ` : ''}{addr.city}
                  </p>
                  {addr.landmarkOrGps && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Landmark / GPS: <span className="font-mono">{addr.landmarkOrGps}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Wholesale Status */}
          <div className="clay-card-sm p-4 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Pricing Tier</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Wholesale Buyer</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  {isWholesale ? 'This customer sees wholesale prices' : 'This customer sees retail prices'}
                </p>
              </div>
              <button
                type="button"
                disabled={savingWholesale || !onToggleWholesale}
                onClick={async () => {
                  if (!customer || !onToggleWholesale) return;
                  setSavingWholesale(true);
                  try {
                    const newVal = !isWholesale;
                    await onToggleWholesale(customer.id, newVal);
                    setIsWholesale(newVal);
                  } finally {
                    setSavingWholesale(false);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isWholesale ? 'bg-[#B27A52]' : 'bg-stone-300 dark:bg-stone-600'
                } ${savingWholesale || !onToggleWholesale ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-checked={isWholesale}
                role="switch"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isWholesale ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Operational Notes */}
          <div className="clay-card-sm p-4 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Customer Notes</h4>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Regular customer, prefers morning deliveries, allergic to citrus extracts..."
              className="neu-input w-full px-3 py-2 text-xs"
            />
            {onSaveCustomerNotes && (
              <button
                type="button"
                onClick={() => onSaveCustomerNotes(customer.id, notes)}
                className="clay-btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            )}
          </div>

          {/* Past Orders */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#B27A52]" />
              <span>Order History ({customerOrders.length})</span>
            </h4>

            {customerOrders.length === 0 ? (
              <p className="text-stone-400 dark:text-stone-500 text-xs italic">No orders found for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customerOrders.map(o => (
                  <div
                    key={o.id}
                    className="clay-card-sm p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono font-bold text-stone-900 dark:text-stone-100">{o.orderNumber}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900 dark:text-stone-100">GHS {Number(o.total).toFixed(2)}</p>
                      <span className="clay-badge clay-badge-success text-[10px] inline-block mt-0.5">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/60 dark:border-stone-800/60 bg-stone-100/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="clay-btn-secondary px-4 py-2 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
