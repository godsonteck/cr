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
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C86D51]" />
            <h3 className="text-base font-extrabold uppercase text-[var(--text-primary)]">
              Your Cart ({totalItems})
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="min-h-10 min-w-10 p-1 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-soft)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]"
              >
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl" />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-subtle)]">{item.product.brand}</span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                    {item.product.name}
                  </h4>
                  <span className="text-xs font-extrabold block text-[var(--text-primary)]">GHS {item.product.price.toFixed(2)}</span>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-[var(--border-color)] rounded-full px-2 py-0.5 text-xs bg-[var(--bg-soft)] text-[var(--text-primary)]">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label={`Decrease quantity for ${item.product.name}`} className="min-h-10 min-w-10 px-1.5 font-bold">-</button>
                      <span className="px-2 font-extrabold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.product.name}`} className="min-h-10 min-w-10 px-1.5 font-bold">+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="min-h-10 min-w-10 text-[var(--text-subtle)] hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-[var(--text-subtle)] mx-auto" />
              <p className="text-xs text-[var(--text-muted)] font-semibold">Your shopping cart is currently empty.</p>
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
            <p className="text-[10px] text-[var(--text-subtle)]">Shipping calculated at checkout.</p>

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
        <ShoppingBag className="w-16 h-16 text-[var(--text-subtle)] mx-auto" />
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-[var(--text-muted)]">Discover dermatological skincare and fresh grocery provisions.</p>
        <Link to="/shop">
          <Button variant="primary" className="rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6 font-sans sm:space-y-8 sm:px-4 sm:py-10">
      <div className="flex flex-col items-start gap-3 border-b border-[var(--border-color)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">Shopping Cart</h1>
          <p className="text-xs text-[var(--text-muted)]">Review your chosen items before fast checkout.</p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear Entire Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-subtle)]">{item.product.brand}</span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.product.name}</h3>
                  <span className="text-xs text-[var(--text-muted)] block">{item.product.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center border border-[var(--border-color)] rounded-full px-3 py-1 text-xs font-bold bg-[var(--bg-soft)] text-[var(--text-primary)]">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2">-</button>
                  <span className="px-3 font-extrabold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2">+</button>
                </div>

                <div className="text-right min-w-[90px]">
                  <span className="text-sm font-extrabold block">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>

                <button onClick={() => removeFromCart(item.product.id)} className="text-[var(--text-subtle)] hover:text-red-500 p-1">
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
          <h3 className="text-base font-extrabold uppercase pb-3 border-b border-[var(--border-color)] text-[var(--text-primary)]">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal:</span>
              <span className="font-bold text-[var(--text-primary)]">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Delivery:</span>
              <span className="font-bold text-[var(--text-primary)]">
                {shippingFee === 0 ? <span className="text-emerald-500 dark:text-emerald-400 font-bold">FREE</span> : `GHS ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-[var(--border-color)] flex justify-between text-base font-extrabold text-[var(--text-primary)]">
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

  const deliveryFee = hasFreeShippingCoupon ? 0 : storeSettings.standardShippingFee;
  const shippingFee = deliveryFee;
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

  if (cartItems.length === 0) return <Navigate to="/cart" replace />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="space-y-4 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-sm">
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
    <div className="mx-auto max-w-6xl px-3 py-6 font-sans sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-5 border-b border-[var(--border-color)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--accent-strong)]">CR Cosmetics and Essential checkout</p>
          <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Almost yours.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">Add your delivery details, then complete payment securely with Paystack.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]"><ShieldCheck className="h-4 w-4 text-[var(--olive)]" /> Secure checkout</div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:max-w-md sm:gap-3">
        <button type="button" onClick={() => setStep(1)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${step === 1 ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'}`}>1</span>
          <span><strong className="block text-xs text-[var(--text-primary)]">Delivery details</strong><small className="text-[10px] text-[var(--text-muted)]">Where should we bring it?</small></span>
        </button>
        <div className={`flex items-center gap-3 rounded-xl border p-3 text-left ${step === 2 ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'}`}>2</span>
          <span><strong className="block text-xs text-[var(--text-primary)]">Payment</strong><small className="text-[10px] text-[var(--text-muted)]">Pay securely online</small></span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-7">

        {step === 1 && (
          <div className="space-y-6">
            <div><h3 className="text-xl font-bold text-[var(--text-primary)]">Delivery details</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Where should we bring your order?</p></div>

            {user?.savedAddresses && user.savedAddresses.length > 0 && (
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4">
                <p className="mb-2 text-xs font-bold text-[var(--text-primary)]">Quick Select from Saved Addresses</p>
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
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-sm ring-1 ring-[var(--accent)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <b className="text-[var(--text-primary)]">{address.fullName}</b>
                          {address.tag && (
                            <span className="rounded bg-[var(--bg-soft)] px-1.5 py-0.2 text-[9px] font-bold uppercase text-[var(--text-muted)]">
                              {address.tag}
                            </span>
                          )}
                          {address.isDefault && (
                            <span className="rounded bg-[#C86D51] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)]">
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
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="e.g. Abena Mensah"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Phone Number (MoMo Enabled)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="e.g. 0244123456"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Email for order updates</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" placeholder="you@example.com" />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="e.g. City name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="e.g. Main street, near local landmark"
                />
              </div>
            </div>

            <div><label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Delivery instructions <span className="font-normal text-[var(--text-subtle)]">(optional)</span></label><textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" rows={3} placeholder="Gate, landmark, preferred delivery time..." /></div>

            <Button
              variant="primary"
              size="md"
              disabled={!fullName || !phone || !area}
              onClick={() => setStep(2)}
              className="w-full rounded-xl px-8 uppercase text-xs font-bold sm:w-auto"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div><h3 className="text-xl font-bold text-[var(--text-primary)]">Complete payment</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Your order is created after Paystack confirms payment.</p></div>

            <div className="rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-5"><CreditCard className="h-6 w-6 text-[var(--accent-strong)]" /><p className="mt-3 text-base font-bold text-[var(--text-primary)]">Amount to pay: GHS {totalAmount.toFixed(2)}</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">You'll be taken to Paystack to choose mobile money or card. Your order is created only after payment is verified.</p></div>

            <div className="flex gap-4">
              <Button variant="outline" size="md" onClick={() => setStep(1)} className="rounded-xl px-6 text-xs">Back</Button>
              <Button variant="primary" size="md" isLoading={isProcessing} onClick={() => void startPaystackCheckout()} className="flex-1 rounded-xl px-8 uppercase text-xs font-bold">Pay securely with Paystack</Button>
            </div>
          </div>
        )}

      </section>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-[var(--text-primary)]">Your order</h2><span className="text-xs text-[var(--text-muted)]">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span></div>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {cartItems.map(item => <div key={`${item.product.id}-${item.selectedOption || ''}`} className="flex gap-3"><img src={item.product.image} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-bold text-[var(--text-primary)]">{item.product.name}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Qty {item.quantity}</p></div><span className="text-xs font-bold text-[var(--text-primary)]">GHS {(item.product.price * item.quantity).toFixed(2)}</span></div>)}
          </div>
          <div className="mt-5 space-y-2 border-t border-[var(--border-color)] pt-4 text-xs"><div className="flex justify-between text-[var(--text-muted)]"><span>Subtotal</span><span>GHS {subtotal.toFixed(2)}</span></div><div className="flex justify-between text-[var(--text-muted)]"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`}</span></div>{discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount{promoCode ? ` (${promoCode})` : ''}</span><span>- GHS {discount.toFixed(2)}</span></div>}<div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-extrabold text-[var(--text-primary)]"><span>Total</span><span>GHS {totalAmount.toFixed(2)}</span></div></div>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4 text-xs text-[var(--text-muted)]"><div className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[var(--olive)]" /><p><strong className="text-[var(--text-primary)]">Secure payment.</strong> Paystack protects your payment details. We never store your card information.</p></div></div>
      </aside>
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
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-[var(--text-primary)]">
          {order?.paymentStatus === 'pending' ? 'Order received' : 'Order confirmed'}
        </h1>
        {order && (
          <p className="text-xs font-bold text-[#C86D51]">
            Order Number: #{order.orderNumber}
          </p>
        )}
      </div>

      {order ? (
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4 text-xs text-[var(--text-primary)]">
          <div className="flex justify-between pb-3 border-b border-[var(--border-color)]">
            <span className="font-bold">Date: {order.createdAt}</span>
            <Badge variant="botanical">{order.status}</Badge>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[var(--text-muted)] uppercase block">Purchased Items:</span>
            {order.items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-bold">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>GHS {order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery:</span><span>GHS {order.shippingFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-extrabold pt-1"><span>{order.paymentStatus === 'pending' ? 'Amount to confirm:' : 'Total paid:'}</span><span className="text-[#C86D51]">GHS {order.total.toFixed(2)}</span></div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-1 text-[var(--text-muted)]">
            <div><strong>Deliver To:</strong> {order.shippingAddress.fullName} ({order.shippingAddress.phone})</div>
            <div><strong>Address:</strong> {order.shippingAddress.area}, {order.shippingAddress.city}</div>
            <div><strong>Payment Method:</strong> <span className="uppercase">{order.paymentMethod}</span> ({order.paymentStatus})</div>
            {order.paymentStatus === 'pending' && <p className="rounded-xl bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-amber-800 dark:text-amber-300">We will confirm your mobile-money payment before dispatch.</p>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Thank you for shopping with CR Cosmetics and Essential.
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
