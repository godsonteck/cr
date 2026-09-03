import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  X,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button, Badge } from '../common/UIPrimitives';
import { PaymentMethod, DeliveryMethod, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { api } from '../../lib/api';

export const CartDrawerComponent: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--bg-main)] h-full flex flex-col p-6 shadow-2xl animate-fade-in font-sans" onClick={event => event.stopPropagation()}>

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD7] dark:border-[#36322E]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C86D51]" />
            <h3 className="text-base font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
              Your Cart ({totalItems})
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="min-h-10 min-w-10 p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3 bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6DFD7] dark:border-[#36322E]"
              >
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl" />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400">{item.product.brand}</span>
                  <h4 className="text-xs font-bold text-[#1C1817] dark:text-stone-100 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <span className="text-xs font-extrabold block">GHS {item.product.price.toFixed(2)}</span>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-[#E6DFD7] rounded-full px-2 py-0.5 text-xs bg-stone-50 dark:bg-stone-900">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label={`Decrease quantity for ${item.product.name}`} className="min-h-10 min-w-10 px-1.5 font-bold">-</button>
                      <span className="px-2 font-extrabold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.product.name}`} className="min-h-10 min-w-10 px-1.5 font-bold">+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="min-h-10 min-w-10 text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500 font-semibold">Your shopping cart is currently empty.</p>
            </div>
          )}
        </div>

        {/* Footer Subtotal */}
        {cartItems.length > 0 && (
          <div className="pt-4 border-t border-[#E6DFD7] dark:border-[#36322E] space-y-4">
            <div className="flex justify-between text-sm font-extrabold">
              <span>Subtotal:</span>
              <span>GHS {subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-stone-400">Shipping calculated at checkout.</p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="rounded-full"
              >
                View Full Cart
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) {
                    onClose();
                    showAlert('Please sign in to place your order.', 'error');
                    navigate('/signin');
                    return;
                  }
                  onClose();
                  navigate('/checkout');
                }}
                className="rounded-full"
              >
                Checkout Now
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export const FullCartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, shippingFee, total, clearCart } = useCart();
  const { storeSettings } = useStore();
  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-2xl font-extrabold text-[#1C1817] dark:text-stone-100 uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500">Discover dermatological skincare and fresh grocery provisions.</p>
        <Link to="/shop">
          <Button variant="primary" className="rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans space-y-8">
      <div className="flex flex-col items-start gap-3 border-b border-[#E6DFD7] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">Shopping Cart</h1>
          <p className="text-xs text-stone-500">Review your chosen items before fast checkout.</p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear Entire Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-white dark:bg-[#1C1917] p-4 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">{item.product.brand}</span>
                  <h3 className="text-sm font-bold text-[#1C1817] dark:text-stone-100">{item.product.name}</h3>
                  <span className="text-xs text-stone-500 block">{item.product.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center border border-[#E6DFD7] rounded-full px-3 py-1 text-xs font-bold bg-stone-50 dark:bg-stone-900">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2">-</button>
                  <span className="px-3 font-extrabold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2">+</button>
                </div>

                <div className="text-right min-w-[90px]">
                  <span className="text-sm font-extrabold block">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>

                <button onClick={() => removeFromCart(item.product.id)} className="text-stone-400 hover:text-red-500 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="sm" onClick={clearCart} className="rounded-full text-xs">
              Clear Entire Cart
            </Button>
            <Link to="/shop">
              <Button variant="ghost" size="sm" className="text-xs">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] h-fit space-y-6">
          <h3 className="text-base font-extrabold uppercase pb-3 border-b border-[#E6DFD7]">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Standard delivery:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `GHS ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E6DFD7] flex justify-between text-base font-extrabold">
              <span>Estimated Total:</span>
              <span className="text-[#C86D51]">GHS {total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (!isAuthenticated) {
                showAlert('Please sign in to place your order.', 'error');
                navigate('/signin');
                return;
              }
              navigate('/checkout');
            }}
            className="w-full rounded-full py-4 text-xs uppercase tracking-wider font-bold"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export const MultiStepCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, discount, promoCode, clearCart, hasFreeShippingCoupon } = useCart();
  const { user, addOrder, saveAddress, isAuthenticated } = useAuth();
  const { storeSettings, addOrder: addStoreOrder } = useStore();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState('Accra');
  const [area, setArea] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(phone);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard-delivery');
  const paymentMethod: PaymentMethod = 'momo-mtn';
  const [isProcessing, setIsProcessing] = useState(false);

  const locationText = `${city} ${area}`.toLowerCase();
  const matchedZone = (storeSettings.deliveryZones || []).find(zone => zone.keywords.length > 0 && zone.keywords.some(keyword => locationText.includes(keyword.toLowerCase())))
    || (storeSettings.deliveryZones || []).find(zone => zone.keywords.length === 0);
  const locationDeliveryFee = matchedZone?.fee ?? storeSettings.standardShippingFee;
  const productDeliveryFees = cartItems.map(item => item.product.deliveryPrice).filter((fee): fee is number => typeof fee === 'number');
  const standardDeliveryFee = productDeliveryFees.length > 0 ? Math.max(...productDeliveryFees) : locationDeliveryFee;
  const standardShipping = subtotal >= (storeSettings.freeDeliveryThreshold || 300) || hasFreeShippingCoupon ? 0 : standardDeliveryFee;
  const shippingFee = deliveryMethod === 'store-pickup' ? 0 : deliveryMethod === 'accra-express' ? storeSettings.expressShippingFee : deliveryMethod === 'intercity' ? storeSettings.intercityShippingFee : standardShipping;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  if (cartItems.length === 0) return <Navigate to="/cart" replace />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="space-y-4 rounded-[2rem] border border-[#E6DFD7] bg-white p-8 shadow-sm dark:bg-[#1C1917]">
          <h2 className="font-serif text-3xl text-[var(--text-primary)]">Sign in required</h2>
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            Please sign in to your account before placing an order.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/signin">
              <Button variant="primary" className="rounded-full px-6">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="rounded-full px-6">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const orderPayload: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `CR-GH-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cartItems],
        subtotal,
        shippingFee,
        discount,
        total: totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        paymentReference: paymentReference.trim(),
        paymentSenderPhone: paymentSenderPhone.trim(),
        deliveryMethod,
        shippingAddress: {
          fullName,
          phone,
          email: email || undefined,
          city,
          area,
          deliveryNotes: deliveryNotes || undefined,
        },
        status: 'Confirmed',
        estimatedDeliveryTime: '24 Hours',
        appliedPromoCode: promoCode || undefined,
        createdAt: new Date().toISOString(),
      };

      const createdOrder = await api.post<Order>('/orders', orderPayload);

      // Sync across both StoreContext and AuthContext
      await addStoreOrder(createdOrder);
      addOrder(createdOrder);
      if (createdOrder.shippingAddress) {
        await saveAddress(createdOrder.shippingAddress);
      }
      await clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (error) {
      console.error('Checkout error:', error);
      showAlert(
          'Unable to place your order. Please verify your details and try again.',
        'error',
        { persistent: true }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans space-y-8">
      {/* Checkout Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">Checkout</h1>
        <p className="text-xs text-stone-500">Pay by mobile money to our business number, then submit your order for confirmation.</p>
      </div>

      {/* Progress Bar */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold uppercase sm:flex sm:items-center sm:justify-center sm:gap-4 sm:text-xs">
        <span className={`rounded-full px-2 py-2 sm:px-3 sm:py-1 ${step >= 1 ? 'bg-[#1C1817] text-white' : 'bg-stone-200 text-stone-500'}`}>1. Shipping</span>
        <span className="hidden text-stone-300 sm:inline">•</span>
        <span className={`rounded-full px-2 py-2 sm:px-3 sm:py-1 ${step >= 2 ? 'bg-[#1C1817] text-white' : 'bg-stone-200 text-stone-500'}`}>2. Payment</span>
        <span className="hidden text-stone-300 sm:inline">•</span>
        <span className={`rounded-full px-2 py-2 sm:px-3 sm:py-1 ${step >= 3 ? 'bg-[#1C1817] text-white' : 'bg-stone-200 text-stone-500'}`}>3. Review</span>
      </div>

      <div className="bg-white dark:bg-[#1C1917] p-6 sm:p-10 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] shadow-sm">

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase pb-3 border-b border-[#E6DFD7]">Step 1: Shipping Address</h3>

            {user?.savedAddresses && user.savedAddresses.length > 0 && <div className="rounded-2xl border border-[#E6DFD7] bg-stone-50 p-4"><p className="mb-2 text-xs font-bold">Use a saved address</p><div className="flex flex-wrap gap-2">{user.savedAddresses.map((address, index) => <button type="button" key={`${address.area}-${index}`} onClick={() => { setFullName(address.fullName); setPhone(address.phone); setEmail(address.email || user.email); setCity(address.city); setArea(address.area); setDeliveryNotes(address.deliveryNotes || ''); }} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-xs hover:border-[#C86D51]"><b>{address.fullName}</b><br />{address.area}, {address.city}</button>)}</div></div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
                  placeholder="e.g. Abena Mensah"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (MoMo Enabled)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
                  placeholder="e.g. 0244123456"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email for order updates</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]" placeholder="you@example.com" />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
                  placeholder="e.g. City name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
                  placeholder="e.g. Main street, near local landmark"
                />
              </div>
            </div>

            <div><label className="text-xs font-bold text-stone-700 block mb-1">Delivery instructions (optional)</label><textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]" rows={2} placeholder="Gate, landmark, preferred delivery time..." /></div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-700">Delivery method</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {([['standard-delivery', 'Standard delivery', standardDeliveryFee], ['accra-express', 'Express delivery', storeSettings.expressShippingFee], ['intercity', 'Priority delivery', storeSettings.intercityShippingFee], ['store-pickup', 'Store pickup', 0]] as const).map(([method, label, fee]) => (
                  <label key={method} className={`cursor-pointer rounded-xl border p-3 text-xs ${deliveryMethod === method ? 'border-[#C86D51] bg-[#F5F0EB]' : 'border-[#E6DFD7]'}`}>
                    <input className="mr-2" type="radio" checked={deliveryMethod === method} onChange={() => setDeliveryMethod(method)} />
                    {label} <span className="font-bold">{fee === 0 ? 'Free' : `${storeSettings.currency} ${fee}`}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={!fullName || !phone || !area}
              onClick={() => setStep(2)}
              className="rounded-full px-8 uppercase text-xs font-bold"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase pb-3 border-b border-[#E6DFD7]">Step 2: Mobile money payment</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-[#C86D51] bg-[#F5F0EB] p-5">
                <CreditCard className="w-5 h-5 text-[#C86D51]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-700">Send payment to our business number</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a href={`tel:${storeSettings.storePhone}`} className="text-2xl font-black tracking-wide text-[#1C1817]">{storeSettings.storePhone}</a>
                  <button type="button" className="rounded-full border border-[#C86D51] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A3D52]" onClick={() => { void navigator.clipboard?.writeText(storeSettings.storePhone || ''); showAlert('Business number copied', 'success'); }}>Copy number</button>
                </div>
                <p className="mt-3 text-xs leading-5 text-stone-600">Use your full name as the payment reference. After sending GHS {totalAmount.toFixed(2)}, continue and submit the order. We will confirm payment before dispatch.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-stone-700">Transaction ID / reference<input required value={paymentReference} onChange={event => setPaymentReference(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E6DFD7] bg-[#F5F0EB] p-3 text-xs" placeholder="Enter the reference from your MoMo receipt" /></label>
                <label className="text-xs font-bold text-stone-700">Sender phone number<input required value={paymentSenderPhone} onChange={event => setPaymentSenderPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E6DFD7] bg-[#F5F0EB] p-3 text-xs" placeholder="Number used to send payment" /></label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="md" onClick={() => setStep(1)} className="rounded-full px-6 text-xs">Back</Button>
              <Button variant="primary" size="md" disabled={!paymentReference.trim() || !paymentSenderPhone.trim()} onClick={() => setStep(3)} className="rounded-full px-8 uppercase text-xs font-bold">Review Order</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleCompleteOrder} className="space-y-6">
            <h3 className="text-lg font-bold uppercase pb-3 border-b border-[#E6DFD7]">Step 3: Review &amp; Confirm</h3>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-2 text-xs">
              <div className="flex justify-between"><strong>Deliver To:</strong> <span>{fullName} ({phone})</span></div>
              <div className="flex justify-between"><strong>Address:</strong> <span>{area}, {city}</span></div>
              <div className="flex justify-between"><strong>Payment Method:</strong> <span className="font-bold">Mobile money</span></div>
              <div className="flex justify-between gap-4"><strong>Payment reference:</strong> <span className="break-all text-right">{paymentReference}</span></div>
              <div className="flex justify-between gap-4"><strong>Sender number:</strong> <span>{paymentSenderPhone}</span></div>
              <div className="flex justify-between"><strong>Items subtotal:</strong> <span>GHS {subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-700"><strong>Discount {promoCode && `(${promoCode})`}:</strong> <span>- GHS {discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><strong>Delivery:</strong> <span>GHS {shippingFee.toFixed(2)}</span></div>
            </div>

            <div className="pt-4 border-t border-[#E6DFD7] flex justify-between items-center text-lg font-extrabold">
              <span>Total Payment Amount:</span>
              <span className="text-[#C86D51]">GHS {totalAmount.toFixed(2)}</span>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isProcessing}
              className="w-full rounded-full py-4 uppercase text-xs font-bold tracking-wider"
            >
              I have paid · Submit order for confirmation
            </Button>
          </form>
        )}

      </div>
    </div>
  );
};

import { useLocation } from 'react-router-dom';

export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 font-sans">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">
          {order?.paymentStatus === 'pending' ? 'Order received' : 'Order confirmed'}
        </h1>
        {order && (
          <p className="text-xs font-bold text-[#C86D51]">
            Order Number: #{order.orderNumber}
          </p>
        )}
      </div>

      {order ? (
        <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4 text-xs">
          <div className="flex justify-between pb-3 border-b border-[#E6DFD7]">
            <span className="font-bold">Date: {order.createdAt}</span>
            <Badge variant="botanical">{order.status}</Badge>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-stone-500 uppercase block">Purchased Items:</span>
            {order.items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-bold">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E6DFD7] space-y-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>GHS {order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping:</span><span>GHS {order.shippingFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-extrabold pt-1"><span>{order.paymentStatus === 'pending' ? 'Amount to confirm:' : 'Total paid:'}</span><span className="text-[#C86D51]">GHS {order.total.toFixed(2)}</span></div>
          </div>

          <div className="pt-3 border-t border-[#E6DFD7] space-y-1 text-stone-500">
            <div><strong>Deliver To:</strong> {order.shippingAddress.fullName} ({order.shippingAddress.phone})</div>
            <div><strong>Address:</strong> {order.shippingAddress.area}, {order.shippingAddress.city}</div>
            <div><strong>Payment Method:</strong> <span className="uppercase">{order.paymentMethod}</span> ({order.paymentStatus})</div>
            {order.paymentStatus === 'pending' && <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">We will confirm your mobile-money payment before dispatch.</p>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-stone-500 text-center">
          Thank you for shopping with CR Cosmetics &amp; Essentials.
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Link to="/account/orders">
          <Button variant="primary" className="rounded-full px-6 text-xs uppercase font-bold">
            View Order History
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" className="rounded-full px-6 text-xs uppercase font-bold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
