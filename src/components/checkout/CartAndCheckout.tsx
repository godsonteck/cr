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
import { PaymentMethod, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { api, ApiError } from '../../lib/api';

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
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 font-sans sm:space-y-8 sm:px-4 sm:py-10">
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
        <div className="h-fit space-y-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] sm:p-6 lg:sticky lg:top-24">
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

  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState('Accra');
  const [area, setArea] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(phone);
  const paymentMethod: PaymentMethod = 'paystack';
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto pre-fill default saved address if area is empty
  useEffect(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0 && !area) {
      const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
      if (defaultAddr) {
        setFullName(defaultAddr.fullName);
        setPhone(defaultAddr.phone);
        setEmail(defaultAddr.email || user.email);
        setCity(defaultAddr.city);
        setArea(defaultAddr.area);
        setDeliveryNotes(defaultAddr.deliveryNotes || '');
      }
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedReference = params.get('reference') || params.get('trxref');
    const returnedStatus = (params.get('status') || '').toLowerCase();
    const pendingOrder = sessionStorage.getItem('paystack_pending_order');
    if (!returnedReference || (returnedStatus && !['success', 'successful', 'completed'].includes(returnedStatus)) || !pendingOrder || !isAuthenticated) return;

    const completeReturnedOrder = async () => {
      setIsProcessing(true);
      try {
        const orderPayload = JSON.parse(pendingOrder) as Order;
        const customerToken = localStorage.getItem('auth_token');
        if (!customerToken) throw new ApiError(401, 'Authentication required');
        const verification = await api.post<{ verified: boolean; reference: string }>('/auth?action=paystack-verify', {
          reference: returnedReference,
          amount: Math.round(orderPayload.total * 100),
        }, customerToken);
        if (!verification.verified) throw new Error('Paystack payment could not be verified');
        const createdOrder = await api.post<Order>('/orders', {
          ...orderPayload,
          paymentMethod: 'paystack',
          paymentStatus: 'paid',
          paymentReference: verification.reference,
        }, customerToken);
        sessionStorage.removeItem('paystack_pending_order');
        await addStoreOrder(createdOrder);
        addOrder(createdOrder);
        if (createdOrder.shippingAddress) await saveAddress(createdOrder.shippingAddress);
        await clearCart();
        window.history.replaceState({}, '', '/checkout');
        navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder }, replace: true });
      } catch (error) {
        console.error('Paystack return error:', error);
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('cr_user_profile');
          showAlert('Your session has expired. Please sign in again to confirm this payment.', 'error', { persistent: true });
          navigate('/signin', { replace: true });
          return;
        }
        showAlert('Payment was returned, but it could not be verified. Please contact support.', 'error', { persistent: true });
      } finally {
        setIsProcessing(false);
      }
    };
    void completeReturnedOrder();
  }, [isAuthenticated]);

  const standardShipping = subtotal >= (storeSettings.freeDeliveryThreshold || 300) || hasFreeShippingCoupon
    ? 0
    : storeSettings.standardShippingFee;
  const shippingFee = standardShipping;
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

  const startPaystackCheckout = async () => {
    if (!fullName || !phone || !area || !email) {
      showAlert('Please complete your delivery details and email first.', 'error');
      setStep(1);
      return;
    }
    setIsProcessing(true);
    try {
      const orderPayload: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `CR-GH-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cartItems], subtotal, shippingFee, discount, total: totalAmount,
        paymentMethod: 'paystack', paymentStatus: 'pending', paymentReference: '', deliveryMethod: 'standard-delivery',
        shippingAddress: { fullName, phone, email, city, area, deliveryNotes: deliveryNotes || undefined },
        status: 'Confirmed', estimatedDeliveryTime: '24 Hours', appliedPromoCode: promoCode || undefined,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('paystack_pending_order', JSON.stringify(orderPayload));
      const reference = `CR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const customerToken = localStorage.getItem('auth_token');
      if (!customerToken) throw new ApiError(401, 'Authentication required');
      const result = await api.post<{ checkoutUrl: string }>('/auth?action=paystack-initialize', {
        amount: Math.round(totalAmount * 100), email, name: fullName, reference, callbackUrl: `${window.location.origin}/checkout`,
      }, customerToken);
      window.location.assign(result.checkoutUrl);
    } catch (error: any) {
      sessionStorage.removeItem('paystack_pending_order');
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('cr_user_profile');
        showAlert('Your session has expired. Please sign in again before paying.', 'error', { persistent: true });
        navigate('/signin', { replace: true });
        return;
      }
      showAlert(error?.message || 'Paystack checkout could not be started. Please try again.', 'error', { persistent: true });
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-3 py-6 font-sans sm:space-y-8 sm:px-4 sm:py-10">
      {/* Checkout Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">Checkout</h1>
        <p className="text-xs text-stone-500">Pay securely with Paystack using mobile money or a bank card.</p>
      </div>

      {/* Progress Bar */}
      <div className="grid grid-cols-2 gap-1.5 text-center text-[9px] font-bold uppercase sm:flex sm:items-center sm:justify-center sm:gap-4 sm:text-xs">
        <span className={`rounded-full px-2 py-2 sm:px-3 sm:py-1 ${step >= 1 ? 'bg-[#1C1817] text-white' : 'bg-stone-200 text-stone-500'}`}>1. Shipping</span>
        <span className="hidden text-stone-300 sm:inline">•</span>
        <span className={`rounded-full px-2 py-2 sm:px-3 sm:py-1 ${step >= 2 ? 'bg-[#1C1817] text-white' : 'bg-stone-200 text-stone-500'}`}>2. Payment</span>
      </div>

      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-8">

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase pb-3 border-b border-[#E6DFD7]">Step 1: Shipping Address</h3>

            {user?.savedAddresses && user.savedAddresses.length > 0 && (
              <div className="rounded-2xl border border-[#E6DFD7] bg-stone-50 p-4">
                <p className="mb-2 text-xs font-bold text-stone-700">Quick Select from Saved Addresses</p>
                <div className="flex flex-wrap gap-2">
                  {user.savedAddresses.map((address, index) => {
                    const isSelected = area === address.area && fullName === address.fullName;
                    return (
                      <button
                        type="button"
                        key={`${address.area}-${index}`}
                        onClick={() => {
                          setFullName(address.fullName);
                          setPhone(address.phone);
                          setEmail(address.email || user.email);
                          setCity(address.city);
                          setArea(address.area);
                          setDeliveryNotes(address.deliveryNotes || '');
                        }}
                        className={`rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                          isSelected
                            ? 'border-[#C86D51] bg-[#FFF8F5] text-[#C86D51] shadow-sm ring-1 ring-[#C86D51]'
                            : 'border-stone-200 bg-white hover:border-[#C86D51]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <b className="text-stone-900">{address.fullName}</b>
                          {address.tag && (
                            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-stone-600">
                              {address.tag}
                            </span>
                          )}
                          {address.isDefault && (
                            <span className="rounded bg-[#C86D51] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500">
                          {address.area}, {address.city} • {address.phone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
            <h3 className="text-lg font-bold uppercase pb-3 border-b border-[#E6DFD7]">Step 2: Pay with Paystack</h3>

            <div className="rounded-2xl border border-[#C86D51] bg-[#F5F0EB] p-5"><CreditCard className="h-6 w-6 text-[#C86D51]" /><p className="mt-3 text-base font-bold text-stone-800">Your total is GHS {totalAmount.toFixed(2)}</p><p className="mt-2 text-xs leading-5 text-stone-600">You will be taken to Paystack to complete payment securely. Choose mobile money or card there. Your order is created only after payment is verified.</p></div>

            <div className="flex gap-4">
              <Button variant="outline" size="md" onClick={() => setStep(1)} className="rounded-full px-6 text-xs">Back</Button>
              <Button variant="primary" size="md" isLoading={isProcessing} onClick={() => void startPaystackCheckout()} className="rounded-full px-8 uppercase text-xs font-bold">Continue to Paystack</Button>
            </div>
          </div>
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
          Thank you for shopping with CR Mart.
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
