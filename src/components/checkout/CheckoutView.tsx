import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DeliveryMethod, ShippingAddress, Order } from '../../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  HeartHandshake
} from 'lucide-react';

interface CheckoutViewProps {
  onBackToShop: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToShop, onOrderComplete }) => {
  const { cart, subtotal, discount, promoCode, totalItemsCount, clearCart } = useCart();
  const { user, addOrder: authAddOrder, saveAddress } = useAuth();
  const { addOrder: storeAddOrder, storeSettings } = useStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.fullName || 'Akosua Mensah',
    phone: user?.phone || '+233 55 123 4567',
    email: user?.email || 'akosua.mensah@gmail.com',
    city: user?.savedAddresses[0]?.city || 'Accra',
    area: user?.savedAddresses[0]?.area || 'East Legon / Botwe',
    landmarkOrGps: user?.savedAddresses[0]?.landmarkOrGps || 'Near Botwe School Junction (GA-123-4567)',
    deliveryNotes: user?.savedAddresses[0]?.deliveryNotes || 'Please call me upon dispatch'
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('accra-express');
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery fee calculation using storeSettings
  const getDeliveryFee = () => {
    if (deliveryMethod === 'store-pickup') return 0;
    if (subtotal >= (storeSettings.freeShippingThreshold || 300)) return 0; // Free delivery threshold
    if (deliveryMethod === 'accra-express') return storeSettings.expressDeliveryFee || 30;
    if (deliveryMethod === 'standard-delivery') return storeSettings.standardDeliveryFee || 20;
    if (deliveryMethod === 'intercity') return 45;
    return 25;
  };

  const deliveryFee = getDeliveryFee();
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.area.trim()) {
      showToast('Please provide your recipient name, phone number, and delivery area.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newOrder: Order = {
        id: `ord-${Date.now().toString().slice(-6)}`,
        orderNumber: `CR-GH-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        items: [...cart],
        subtotal,
        discount,
        shippingFee: deliveryFee,
        total: finalTotal,
        paymentMethod: 'cash-on-delivery',
        paymentStatus: 'pending',
        deliveryMethod,
        shippingAddress: { ...formData },
        status: 'Confirmed',
        estimatedDeliveryTime: 
          deliveryMethod === 'accra-express' 
            ? 'Today within 2–4 hours by Courier' 
            : deliveryMethod === 'standard-delivery'
            ? 'Tomorrow morning by 11:00 AM'
            : `Ready for pickup at ${storeSettings.storeAddress} in 1 hour`
      };

      // Add to store context (admin portal view) and auth context (user account view)
      storeAddOrder(newOrder);
      authAddOrder(newOrder);
      saveAddress(formData);
      clearCart();
      setIsProcessing(false);
      onOrderComplete(newOrder);
    }, 1000);
  };

  const generateWhatsAppOrderText = () => {
    const itemsList = cart
      .map(item => `• ${item.product.name} (${item.product.brand}) x${item.quantity} = GHS ${(item.product.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const msg = `*CR Cosmetics & Essential - Order Checkout*
*Recipient:* ${formData.fullName}
*Phone:* ${formData.phone}
*Location:* ${formData.area}, ${formData.city} (${formData.landmarkOrGps})

*Selected Items:*
${itemsList}

*Subtotal:* GHS ${subtotal.toFixed(2)}
${discount > 0 ? `*Discount (${promoCode}):* -GHS ${discount.toFixed(2)}\n` : ''}*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`}
*Total Due:* *GHS ${finalTotal.toFixed(2)}*

Please confirm dispatch to my location in Accra!`;

    return `https://wa.me/${storeSettings.whatsappNumber || '233551234567'}?text=${encodeURIComponent(msg)}`;
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#8A3D52] flex items-center justify-center mx-auto text-2xl">
          🛍️
        </div>
        <h2 className="text-xl font-serif font-bold text-gray-900">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500">Discover our authentic beauty and skincare collection to place an order.</p>
        <button
          onClick={onBackToShop}
          className="px-6 py-2.5 bg-[#8A3D52] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#732F42] transition-colors cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      
      {/* Back Button */}
      <button
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#8A3D52] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-[#8A3D52] font-serif font-bold text-base border-b border-gray-100 pb-3.5">
                <span className="w-6 h-6 rounded-full bg-rose-50 text-[#8A3D52] flex items-center justify-center text-xs font-sans font-bold">1</span>
                <span>Delivery & Contact Details (Ghana)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name / Recipient *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Akosua Mensah"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number (Active for Dispatch) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 055 123 4567"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City / Region *</label>
                  <select
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  >
                    <option value="Accra">Greater Accra</option>
                    <option value="Tema">Tema</option>
                    <option value="Kumasi">Kumasi (Ashanti Region)</option>
                    <option value="Takoradi">Takoradi (Western Region)</option>
                    <option value="Cape Coast">Cape Coast (Central Region)</option>
                    <option value="Other Region">Other Region (Intercity VIP/STC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Area / Suburb *</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={e => handleInputChange('area', e.target.value)}
                    placeholder="e.g. East Legon, Botwe, Spintex, Airport, Osu"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Street Address, Landmark or GhanaPost GPS</label>
                  <input
                    type="text"
                    value={formData.landmarkOrGps || ''}
                    onChange={e => handleInputChange('landmarkOrGps', e.target.value)}
                    placeholder="e.g. Near Botwe School Junction or GA-123-4567"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Special Dispatch / Courier Instructions (Optional)</label>
                  <input
                    type="text"
                    value={formData.deliveryNotes || ''}
                    onChange={e => handleInputChange('deliveryNotes', e.target.value)}
                    placeholder="e.g. Please call when arriving at the junction"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Speed */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-[#8A3D52] font-serif font-bold text-base border-b border-gray-100 pb-3.5">
                <span className="w-6 h-6 rounded-full bg-rose-50 text-[#8A3D52] flex items-center justify-center text-xs font-sans font-bold">2</span>
                <span>Choose Delivery Speed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Express */}
                <label 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryMethod === 'accra-express' 
                      ? 'border-[#8A3D52] bg-rose-50/40 shadow-xs' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'accra-express'}
                      onChange={() => setDeliveryMethod('accra-express')}
                      className="text-[#8A3D52] focus:ring-[#8A3D52] mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-[#8A3D52]">
                      {subtotal >= storeSettings.freeShippingThreshold ? 'FREE' : `GHS ${storeSettings.expressDeliveryFee}.00`}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-900">⚡ Same-Day Express</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Accra dispatch in 2–4 hours</p>
                  </div>
                </label>

                {/* Standard */}
                <label 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryMethod === 'standard-delivery' 
                      ? 'border-[#8A3D52] bg-rose-50/40 shadow-xs' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'standard-delivery'}
                      onChange={() => setDeliveryMethod('standard-delivery')}
                      className="text-[#8A3D52] focus:ring-[#8A3D52] mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-[#8A3D52]">
                      {subtotal >= storeSettings.freeShippingThreshold ? 'FREE' : `GHS ${storeSettings.standardDeliveryFee}.00`}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-900">🚚 Next-Day Delivery</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Standard doorstep drop</p>
                  </div>
                </label>

                {/* Pickup */}
                <label 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryMethod === 'store-pickup' 
                      ? 'border-[#8A3D52] bg-rose-50/40 shadow-xs' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'store-pickup'}
                      onChange={() => setDeliveryMethod('store-pickup')}
                      className="text-[#8A3D52] focus:ring-[#8A3D52] mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-[#8A3D52]">FREE</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-900">🏬 Store Pickup</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{storeSettings.storeAddress}</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Order Guarantee & Dispatch Confirmation */}
            <div className="bg-[#FAF5F4] rounded-2xl p-5 border border-rose-100/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white text-[#8A3D52] flex items-center justify-center shrink-0 shadow-2xs border border-rose-100">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-gray-900">Concierge Verification & Dispatch</h4>
                <p className="text-gray-600 leading-relaxed">
                  Upon clicking confirm, our store team at {storeSettings.storeAddress} will immediately prepare your authentic package and dispatch a dedicated courier to your location.
                </p>
              </div>
            </div>

            {/* Confirm Order Button */}
            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#8A3D52] hover:bg-[#732F42] disabled:bg-gray-400 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Confirming Dispatch with Store...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-rose-200" />
                    <span>Confirm Order for Dispatch • GHS {finalTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              {/* WhatsApp Direct Option */}
              <a
                href={generateWhatsAppOrderText()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-white hover:bg-rose-50 text-[#8A3D52] border border-[#8A3D52]/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#8A3D52]" />
                <span>Confirm & Order Directly via WhatsApp ({storeSettings.storePhone})</span>
              </a>
            </div>

          </form>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5 sticky top-24">
            <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-sans font-normal text-gray-500">({totalItemsCount} items)</span>
            </h3>

            {/* Item list */}
            <div className="max-h-72 overflow-y-auto space-y-3.5 divide-y divide-gray-100 pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="w-13 h-13 rounded-xl bg-[#FAF5F4] p-1.5 border border-rose-100/60 shrink-0 flex items-center justify-center">
                    <img src={item.product.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">{item.product.brand}</span>
                    <h5 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h5>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">
                    GHS {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs text-gray-600 pt-3.5 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">GHS {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#8A3D52] font-bold">
                  <span>Voucher ({promoCode})</span>
                  <span>-GHS {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery ({deliveryMethod === 'store-pickup' ? 'Pickup' : 'Accra'})</span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? <span className="text-[#8A3D52] font-bold">FREE</span> : `GHS ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-gray-900 pt-2.5 border-t border-gray-200">
                <span>Total Due</span>
                <span className="text-[#8A3D52] text-lg font-bold">GHS {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Authenticity Guarantee Card */}
            <div className="bg-[#FAF5F4] p-3.5 rounded-xl border border-rose-100 text-[11px] text-gray-600 space-y-2">
              <div className="flex items-center gap-2 text-[#8A3D52] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#8A3D52] shrink-0" />
                <span>100% Genuine Cosmetics & Perfumes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Fast Dispatch from {storeSettings.storeAddress}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
