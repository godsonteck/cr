import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Order, StoreSettings } from '../../../types';
import logoImg from '../../../assets/logo.jpeg';

interface InvoicePrintModalProps {
  order: Order | null;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-stone-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-stone-700" />
            <h3 className="font-bold text-sm text-stone-900">Print Official Customer Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1E1719] hover:bg-[#33282C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="p-8 sm:p-12 overflow-y-auto font-sans space-y-8 print:p-0 print:m-0">
          
          {/* Business Header */}
          <div className="flex items-start justify-between border-b border-stone-200 pb-6">
            <div className="flex items-center gap-3">
              <img src={storeSettings.storeLogo || logoImg} onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }} alt="" className="w-16 h-16 rounded-xl object-contain border border-stone-200" />
              <div>
                <h1 className="font-serif font-bold text-xl text-stone-900 leading-tight">
                  {storeSettings.storeName}
                </h1>
                <p className="text-xs text-stone-500">{storeSettings.storeTagline}</p>
                <p className="text-xs text-stone-500 mt-1">{storeSettings.storeAddress}</p>
                <p className="text-xs text-stone-500">Phone: {storeSettings.storePhone} | Email: {storeSettings.storeEmail}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase">
                {order.paymentStatus === 'paid' ? 'Paid & Confirmed' : 'Payment Pending'}
              </span>
              <p className="font-mono font-bold text-base text-stone-900 mt-2">
                Invoice #{order.orderNumber}
              </p>
              <p className="text-xs text-stone-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Summary */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <p className="font-bold uppercase tracking-wider text-[10px] text-stone-400">Billed & Delivered To:</p>
              <p className="font-bold text-sm text-stone-900">{order.shippingAddress.fullName}</p>
              <p className="text-stone-600">{order.shippingAddress.phone}</p>
              {order.shippingAddress.email && <p className="text-stone-500">{order.shippingAddress.email}</p>}
              <p className="text-stone-700 font-medium pt-1">
                {order.shippingAddress.area}, {order.shippingAddress.city}
              </p>
              {order.shippingAddress.landmarkOrGps && (
                <p className="text-stone-500 text-[11px]">GPS / Landmark: {order.shippingAddress.landmarkOrGps}</p>
              )}
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 text-right">
              <p className="font-bold uppercase tracking-wider text-[10px] text-stone-400">Order & Payment Info:</p>
              <p className="text-stone-800">Payment Method: <strong className="uppercase">{order.paymentMethod.replace('-', ' ')}</strong></p>
              <p className="text-stone-800">Delivery Service: <strong className="capitalize">{order.deliveryMethod.replace('-', ' ')}</strong></p>
              <p className="text-stone-800">Delivery Status: <strong>{order.status}</strong></p>
              {order.riderInfo?.riderName && (
                <p className="text-stone-600 text-[11px]">Courier: {order.riderInfo.riderName} ({order.riderInfo.riderPhone})</p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total (GHS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{item.product.name}</p>
                      <p className="text-[11px] text-stone-500">{item.product.brand} {item.selectedOption ? `• ${item.selectedOption}` : ''}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">GHS {Number(item.product?.price || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold">GHS {(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-1.5 pt-2">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal:</span>
                <span>GHS {Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount {order.appliedPromoCode ? `(${order.appliedPromoCode})` : ''}:</span>
                  <span>- GHS {Number(order.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge:</span>
                <span>GHS {Number(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total:</span>
                <span>GHS {Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="pt-6 border-t border-stone-200 text-center text-xs text-stone-500 space-y-1">
            <p className="font-bold text-stone-800">Thank you for shopping with {storeSettings.storeName}!</p>
            <p>For inquiries, exchanges, or re-orders, contact us via WhatsApp: +{storeSettings.whatsappNumber}</p>
          </div>

        </div>

      </div>
    </div>
  );
};
