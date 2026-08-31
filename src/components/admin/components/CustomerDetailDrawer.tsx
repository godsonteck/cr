import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, ShoppingBag, MessageCircle, Star, Save, ShieldCheck } from 'lucide-react';
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
  const customerOrders = orders.filter(o => o.shippingAddress.fullName.toLowerCase() === customer.fullName.toLowerCase() || o.shippingAddress.phone === customer.phone);

  const customerPhoneClean = customer.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${customerPhoneClean.startsWith('0') ? '233' + customerPhoneClean.slice(1) : customerPhoneClean}?text=${encodeURIComponent(`Hello ${customer.fullName}, this is CR Cosmetics & Essentials.`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end font-sans animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-stone-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold font-serif text-lg border border-stone-200">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 leading-tight">{customer.fullName}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                {customer.segment === 'High Value' ? 'Top Spender' : customer.segment}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] text-stone-500 font-bold">Total Money Spent in Shop</span>
              <p className="text-xl font-bold font-serif text-stone-900">
                GHS {customer.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[11px] text-stone-500 font-bold">Total Completed Orders</span>
              <p className="text-xl font-bold font-serif text-stone-900">
                {customer.ordersCount} orders
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900">Contact Details</h4>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-200"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${customer.phone}`} className="font-bold text-stone-900 hover:underline">
                  {customer.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400" />
                <span className="text-stone-700">{customer.email}</span>
              </p>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C89B3C]" />
              <span>Delivery Address in Ghana</span>
            </h4>
            {customer.addresses.map((addr, idx) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-xl space-y-1">
                <p className="font-bold text-stone-800">{addr.area}, {addr.city}</p>
                {addr.landmarkOrGps && (
                  <p className="text-[11px] text-stone-500">Landmark / Nearby: {addr.landmarkOrGps}</p>
                )}
              </div>
            ))}
          </div>

          {/* Operational Notes */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
            <h4 className="font-bold text-stone-900">Notes About This Customer</h4>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Regular customer, prefers delivery in the morning, allergic to scented soaps..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-stone-900 outline-none"
            />
            {onSaveCustomerNotes && (
              <button
                type="button"
                onClick={() => onSaveCustomerNotes(customer.id, notes)}
                className="px-3 py-1.5 bg-[#1E1719] text-[#FAF6F0] rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#33282C]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            )}
          </div>

          {/* Past Orders */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#C89B3C]" />
              <span>Order History ({customerOrders.length})</span>
            </h4>

            {customerOrders.length === 0 ? (
              <p className="text-stone-400 text-xs italic">No orders found for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customerOrders.map(o => (
                  <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-stone-900">{o.orderNumber}</p>
                      <p className="text-[11px] text-stone-500">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900">GHS {o.total.toFixed(2)}</p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
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
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-700 hover:bg-stone-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
