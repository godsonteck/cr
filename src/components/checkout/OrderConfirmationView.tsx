import React from 'react';
import { Order } from '../../types';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ArrowRight, 
  Truck, 
  Sparkles,
  Crown
} from 'lucide-react';

interface OrderConfirmationViewProps {
  order: Order;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onContinueShopping
}) => {
  const generateSupportWhatsAppUrl = () => {
    const message = `Hello CR Cosmetics & Essential! I just placed Order #${order.orderNumber}.
Could you please confirm dispatch time for delivery to ${order.shippingAddress.area}, ${order.shippingAddress.city}? Thank you!`;
    return `https://wa.me/233551234567?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      
      {/* Top Celebration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-[#8A3D52] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-[#8A3D52]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-[#8A3D52] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">
            Payment & Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 pt-2">
            Medaase! Your Order is on Its Way
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            We've received your order and our team in Accra is carefully packing your authentic cosmetics and essentials.
          </p>
        </div>

        {/* Order Meta Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs">
          <div>
            <span className="text-gray-500 block">Order Number:</span>
            <strong className="text-gray-900 font-extrabold">{order.orderNumber}</strong>
          </div>
          <div className="h-4 w-px bg-gray-300 hidden sm:block" />
          <div>
            <span className="text-gray-500 block">Estimated Arrival:</span>
            <strong className="text-[#8A3D52] font-extrabold">{order.estimatedDeliveryTime}</strong>
          </div>
        </div>

        {/* WhatsApp Dispatch Chat Link */}
        <div className="pt-2">
          <a
            href={generateSupportWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp for Live Courier Tracking</span>
          </a>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
        
        {/* Recipient & Delivery Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8A3D52]" />
              <span>Delivery Address</span>
            </h4>
            <p className="text-gray-900 font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.area}, {order.shippingAddress.city}</p>
            {order.shippingAddress.landmarkOrGps && (
              <p className="text-gray-500">📍 {order.shippingAddress.landmarkOrGps}</p>
            )}
            <p className="text-gray-600">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#8A3D52]" />
              <span>Dispatch Method & Status</span>
            </h4>
            <p className="text-gray-900 font-semibold uppercase">{order.deliveryMethod.replace('-', ' ')}</p>
            <p className="text-[#8A3D52] font-semibold">Status: Verified & Preparing for Dispatch</p>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
            Items in this Order ({order.items.length})
          </h4>

          <div className="divide-y divide-gray-100">
            {order.items.map(item => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#FAF5F4] p-1 border border-gray-100 shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.image}
                      alt=""
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.product.brand}</span>
                    <h5 className="text-xs font-bold text-gray-900">{item.product.name}</h5>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900">
                  GHS {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">GHS {order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#8A3D52] font-bold">
              <span>Discount</span>
              <span>-GHS {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-900">
              {order.shippingFee === 0 ? <span className="text-[#8A3D52] font-bold">FREE</span> : `GHS ${order.shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-serif font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Paid</span>
            <span className="text-[#8A3D52]">GHS {order.total.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <button
          onClick={onContinueShopping}
          className="px-8 py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
        >
          <span>Continue Shopping at CR Cosmetics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
