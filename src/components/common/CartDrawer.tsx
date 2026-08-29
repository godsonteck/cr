import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  MessageCircle, 
  Tag, 
  Truck, 
  ShieldCheck,
  Crown
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shippingFee,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    progressToFreeShipping,
    freeShippingThreshold,
    totalItemsCount
  } = useCart();

  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromoCode(couponInput);
    if (res.success) {
      showToast(res.message);
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(res.message);
    }
  };

  const generateWhatsAppOrderUrl = () => {
    const itemsText = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.name} (${item.product.brand}) x${item.quantity} = GHS ${(item.product.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const message = `*Hello CR Cosmetics & Essential!*
I would like to place an order from your online store:

*Selected Items:*
${itemsText}

*Subtotal:* GHS ${subtotal.toFixed(2)}
${discount > 0 ? `*Discount (${promoCode}):* -GHS ${discount.toFixed(2)}\n` : ''}*Delivery:* ${shippingFee === 0 ? 'FREE' : `GHS ${shippingFee.toFixed(2)}`}
*Total:* *GHS ${total.toFixed(2)}*

Please confirm my order details. Thank you!`;

    return `https://wa.me/233551234567?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8A3D52]" />
            <h2 className="font-serif font-bold text-base text-gray-900">Your Shopping Bag</h2>
            <span className="bg-rose-50 text-[#8A3D52] text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress bar (GHS 300+) */}
        <div className="bg-[#FAF5F4] px-4 py-2.5 border-b border-rose-100 text-xs">
          {subtotal >= freeShippingThreshold ? (
            <div className="flex items-center gap-1.5 text-[#8A3D52] font-bold">
              <Truck className="w-4 h-4 text-[#8A3D52] shrink-0" />
              <span>🎉 Congratulations! You have qualified for FREE delivery!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Add <strong>GHS {(freeShippingThreshold - subtotal).toFixed(2)}</strong> more for <strong>FREE Delivery</strong></span>
                <span className="font-bold text-[#8A3D52]">{progressToFreeShipping.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-rose-200/50 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#8A3D52] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-rose-50 text-[#8A3D52] rounded-full flex items-center justify-center mx-auto text-2xl">
                🛍️
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">Your shopping bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse our curated skincare, makeup, designer fragrances, and beauty essentials to get started.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#8A3D52] text-white text-xs font-bold rounded-lg hover:bg-[#732F42] transition-colors uppercase tracking-wider"
              >
                Explore Beauty Collection
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-[#FAF6F4] p-1 border border-gray-100 shrink-0 flex items-center justify-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    {item.product.brand}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-extrabold text-[#8A3D52]">
                      GHS {item.product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-gray-900 block">
                    GHS {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#FAF5F4] border-t border-rose-100 space-y-3">
            
            {/* Promo Code Input */}
            <div>
              {promoCode ? (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-2 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-[#8A3D52] font-bold">
                    <Tag className="w-3.5 h-3.5 text-[#8A3D52]" />
                    <span>Coupon: <strong>{promoCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs font-semibold text-rose-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Voucher code (e.g. CRGLOW10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">GHS {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#8A3D52] font-bold">
                  <span>Discount</span>
                  <span>-GHS {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee === 0 ? <span className="text-[#8A3D52] font-bold">FREE</span> : `GHS ${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-[#8A3D52] text-base font-extrabold">GHS {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Primary: Checkout */}
              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: Instant WhatsApp Order */}
              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-white hover:bg-rose-50 text-[#8A3D52] border border-[#8A3D52]/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#8A3D52]" />
                <span>Instant Order via WhatsApp (+233 55 123 4567)</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
