import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, ShoppingBag, MessageCircle, Save } from 'lucide-react';
import { Customer, Order } from '../../../types';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSaveCustomerNotes?: (customerId: string, notes: string) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  orders,
  onSaveCustomerNotes,
}) => {
  if (!isOpen || !customer) return null;

  const [notes, setNotes] = useState(customer.notes || '');
  const customerOrders = orders.filter(
    o =>
      o.shippingAddress.fullName.toLowerCase() === customer.fullName.toLowerCase() ||
      o.shippingAddress.phone === customer.phone ||
      (o.shippingAddress.email && o.shippingAddress.email.toLowerCase() === customer.email.toLowerCase())
  );

  const customerPhoneClean = customer.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${
    customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean
  }?text=${encodeURIComponent(`Hello ${customer.fullName}, this is CR Cosmetics and Essential.`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1316] h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-[#2e2428]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-[#2e2428] flex items-center justify-between bg-stone-50/80 dark:bg-[#201b1a]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F2E3D7] dark:bg-[#3d2a22] text-[#8A5738] dark:text-[#E8B792] flex items-center justify-center font-bold font-serif text-lg border border-stone-200 dark:border-[#3d2a22]">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                {customer.fullName}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5738] dark:text-[#E8B792] bg-[#F2E3D7]/60 dark:bg-[#3d2a22] px-2 py-0.5 rounded-full inline-block mt-0.5">
                {customer.segment === 'High Value' ? 'Top Spender' : customer.segment}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#2a2024] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800 dark:text-stone-200">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 dark:bg-[#201b1a] rounded-2xl border border-stone-200 dark:border-[#2e2428] space-y-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">Total Spent</span>
              <p className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                GHS {customer.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-[#201b1a] rounded-2xl border border-stone-200 dark:border-[#2e2428] space-y-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">Completed Orders</span>
              <p className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 dark:text-stone-100">Contact Details</h4>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${customer.phone}`} className="font-bold text-stone-900 dark:text-stone-100 hover:underline">
                  {customer.phone}
                </a>
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
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#B27A52]" />
                <span>Delivery Address</span>
              </h4>
              {customer.addresses.map((addr, idx) => (
                <div key={idx} className="p-3 bg-stone-50 dark:bg-[#2a2024] rounded-xl space-y-1">
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

          {/* Operational Notes */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Customer Notes</h4>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Regular customer, prefers morning deliveries, allergic to citrus extracts..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-[#2a2024] border border-stone-200 dark:border-[#2e2428] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 outline-none"
            />
            {onSaveCustomerNotes && (
              <button
                type="button"
                onClick={() => onSaveCustomerNotes(customer.id, notes)}
                className="px-3.5 py-2 bg-[#1E1719] text-white hover:bg-[#33282C] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    className="p-3 bg-stone-50 dark:bg-[#201b1a] rounded-xl border border-stone-200 dark:border-[#2e2428] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono font-bold text-stone-900 dark:text-stone-100">{o.orderNumber}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900 dark:text-stone-100">GHS {Number(o.total).toFixed(2)}</p>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
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
        <div className="p-4 border-t border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#201b1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 dark:border-[#2e2428] rounded-xl font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#2a2024] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
