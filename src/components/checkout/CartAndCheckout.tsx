import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  X,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Package,
  Tag,
  Star,
  MessageCircle,
  Lock,
  Share2,
  Copy,
  Loader2,
  Clock,
  Phone,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button, Badge } from '../common/UIPrimitives';
import { DeliveryMethod, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { GHANA_LOCATIONS, GHANA_REGIONS, GhanaRegion } from '../../data/ghanaLocations';
import { api, ApiError } from '../../lib/api';
import {
  OrderProgressTracker,
  DeliveryTimeline,
  STATUS_MESSAGE,
} from '../account/OrderTrackingComponents';

/* ─── Cart Drawer ─────────────────────────────────────────────────────────── */
export const CartDrawerComponent: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--bg-main)] h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[#FF6B00]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Cart ({totalItems})</h3>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
          {cartItems.length > 0 ? cartItems.map((item) => (
            <div key={item.product.id} className="flex gap-3 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[10px] font-bold uppercase text-[var(--text-subtle)]">{item.product.brand}</p>
                <p className="break-words text-xs font-bold text-[var(--text-primary)]">{item.product.name}</p>
                <p className="text-sm font-black text-[#FF6B00]">GHS {item.product.price.toFixed(2)}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-soft)]">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition text-sm flex items-center justify-center">−</button>
                    <span className="w-8 text-center text-xs font-black text-[var(--text-primary)]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition text-sm flex items-center justify-center">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-[var(--text-subtle)] hover:text-red-500 p-1 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 space-y-3">
              <ShoppingCart className="w-14 h-14 text-[var(--text-subtle)] mx-auto opacity-40" />
              <p className="text-sm font-bold text-[var(--text-muted)]">Your cart is empty</p>
              <p className="text-xs text-[var(--text-subtle)]">Add items to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-4 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
            <div className="flex justify-between text-sm font-black text-[var(--text-primary)]">
              <span>Subtotal ({totalItems} items)</span>
              <span className="text-[#FF6B00]">GHS {subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-[var(--text-subtle)]">Shipping calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onClose(); navigate('/cart'); }}
                className="h-10 rounded-lg border-2 border-[#FF6B00] text-[#FF6B00] text-xs font-black hover:bg-[#FF6B00]/5 transition"
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.assign('/checkout');
                }}
                className="h-10 rounded-lg bg-[#FF6B00] text-white text-xs font-black hover:bg-[#E55A00] transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Full Cart Page ──────────────────────────────────────────────────────── */
export const FullCartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, shippingFee, total, clearCart } = useCart();
  const { storeSettings } = useStore();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5 font-sans">
        <ShoppingCart className="w-20 h-20 text-[var(--text-subtle)] mx-auto opacity-30" />
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Your Cart is Empty</h2>
        <p className="text-sm text-[var(--text-muted)]">Looks like you haven't added anything yet.</p>
        <Link to="/shop">
          <button className="mt-2 px-8 py-3 rounded-xl bg-[#FF6B00] text-white font-black text-sm hover:bg-[#E55A00] transition shadow-lg shadow-[#FF6B00]/20">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Page Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Shopping Cart</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button onClick={clearCart} className="text-xs text-red-500 hover:underline font-semibold">Clear Cart</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 py-5 sm:px-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">

          {/* Items */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-3 flex gap-3 sm:p-4 sm:gap-4">
                <Link to={`/product/${item.product.id}`}>
                  <img src={item.product.image} alt={item.product.name} className="h-20 w-20 object-cover rounded-xl shrink-0 hover:opacity-90 transition sm:h-24 sm:w-24" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[var(--text-subtle)]">{item.product.brand}</p>
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="break-words text-sm font-bold text-[var(--text-primary)] hover:text-[#FF6B00] transition">{item.product.name}</h3>
                    </Link>
                    {item.selectedOption && <p className="text-xs text-[var(--text-muted)]">Variant: {item.selectedOption}</p>}
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3 mt-auto">
                    <div>
                      <span className="text-lg font-black text-[#FF6B00]">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
                      {item.quantity > 1 && <span className="ml-2 text-xs text-[var(--text-subtle)]">GHS {item.product.price.toFixed(2)} each</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border-2 border-[var(--border-color)] rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 font-bold text-[var(--text-primary)] hover:bg-[var(--bg-soft)] transition flex items-center justify-center">−</button>
                        <span className="w-9 text-center text-xs font-black border-x-2 border-[var(--border-color)] h-8 flex items-center justify-center text-[var(--text-primary)]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 font-bold text-[var(--text-primary)] hover:bg-[var(--bg-soft)] transition flex items-center justify-center">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-[var(--text-subtle)] hover:text-red-500 p-1.5 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1">
              <Link to="/shop">
                <button className="text-xs font-bold text-[#FF6B00] hover:text-[#E55A00] transition flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Continue Shopping
                </button>
              </Link>
              <button onClick={clearCart} className="text-xs text-[var(--text-subtle)] hover:text-red-500 transition">Clear all items</button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden lg:sticky lg:top-24">
              <div className="bg-[var(--bg-soft)] border-b border-[var(--border-color)] px-5 py-3.5">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">Order Summary</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-[var(--text-primary)]">GHS {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingFee === 0
                        ? <span className="text-emerald-500 font-bold">FREE</span>
                        : <span className="text-[var(--text-primary)]">GHS {shippingFee.toFixed(2)}</span>
                      }
                    </span>
                  </div>
                </div>
                <div className="border-t border-[var(--border-color)] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-[var(--text-primary)]">Total</span>
                    <span className="text-xl font-black text-[#FF6B00]">GHS {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.location.assign('/checkout');
                  }}
                  className="w-full h-12 bg-[#FF6B00] text-white font-black text-sm rounded-xl hover:bg-[#E55A00] transition shadow-lg shadow-[#FF6B00]/20 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-4 pt-1">
                  {['Secure', 'Fast', 'Authentic'].map(badge => (
                    <div key={badge} className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] text-[var(--text-subtle)] font-semibold">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Free shipping nudge */}
            {shippingFee > 0 && (
              <div className="rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/5 p-4">
                <p className="text-xs text-[#FF6B00] font-bold">
                  Add GHS {(storeSettings.freeDeliveryThreshold - subtotal).toFixed(2)} more for FREE delivery!
                </p>
                <div className="mt-2 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B00] rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / storeSettings.freeDeliveryThreshold) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Checkout Page ───────────────────────────────────────────────────────── */
export const MultiStepCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, discount, promoCode, clearCart } = useCart();
  const { user, addOrder, saveAddress, isAuthenticated } = useAuth();
  const { storeSettings, addOrder: addStoreOrder, fetchProducts } = useStore();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [region, setRegion] = useState<GhanaRegion>('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [area, setArea] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard-delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const hasHandledReturn = useRef(false);

  useEffect(() => {
    if (user && !fullName && !phone) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
    if (user?.savedAddresses && user.savedAddresses.length > 0 && !area) {
      const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
      if (defaultAddr) {
        setFullName(defaultAddr.fullName);
        setPhone(defaultAddr.phone);
        setEmail(defaultAddr.email || user.email);
        const savedRegion = Object.entries(GHANA_LOCATIONS).find(([, towns]) => towns.includes(defaultAddr.city as never))?.[0] as GhanaRegion | undefined;
        if (savedRegion) setRegion(savedRegion);
        setCity(defaultAddr.city || 'Accra');
        setArea(defaultAddr.area);
        setDeliveryNotes(defaultAddr.deliveryNotes || '');
      }
    }
  }, [user]);

  const searchParams = new URLSearchParams(window.location.search);
  const returnedReference = searchParams.get('reference') || searchParams.get('trxref');
  const returnedStatus = (searchParams.get('status') || '').toLowerCase();
  const isPaystackCallback = Boolean(returnedReference);

  const [returnError, setReturnError] = useState<string | null>(null);
  const [isVerifyingReturn, setIsVerifyingReturn] = useState(
    isPaystackCallback && (!returnedStatus || ['success', 'successful', 'completed'].includes(returnedStatus))
  );

  const completeReturnedOrder = useCallback(async () => {
    if (!returnedReference || !isAuthenticated) return;
    setIsVerifyingReturn(true);
    setReturnError(null);

    try {
      const customerToken = localStorage.getItem('auth_token');
      if (!customerToken) throw new ApiError(401, 'Authentication required');

      // 1. Check if the order was already created in the database (idempotent recovery)
      try {
        const existing = await api.get<Order>(`/orders?paymentReference=${encodeURIComponent(returnedReference)}`, customerToken);
        if (existing?.id) {
          sessionStorage.removeItem('paystack_pending_order');
          await addStoreOrder(existing);
          addOrder(existing);
          await fetchProducts();
          if (existing.shippingAddress) await saveAddress(existing.shippingAddress);
          await clearCart();
          window.history.replaceState({}, '', '/checkout');
          navigate(`/order-confirmation/${existing.id}`, { state: { order: existing }, replace: true });
          return;
        }
      } catch {
        // Not yet created, continue with verification
      }

      const pendingOrder = sessionStorage.getItem('paystack_pending_order');
      if (!pendingOrder) {
        throw new Error(`Payment return received for reference ${returnedReference}, but pending order details were not found in this session. If your account was charged, your order may already be saved under your account.`);
      }

      const orderPayload = JSON.parse(pendingOrder) as Order;

      // 2. Verify payment with server-side Paystack verification
      const verification = await api.post<{ verified: boolean; reference: string }>('/auth?action=paystack-verify', {
        reference: returnedReference,
        amount: Math.round(orderPayload.total * 100),
      }, customerToken);
      if (!verification.verified) throw new Error('Paystack payment could not be verified');

      // 3. Create or receive the confirmed order
      const createdOrder = await api.post<Order>('/orders', {
        ...orderPayload,
        paymentMethod: 'paystack',
        paymentStatus: 'paid',
        paymentReference: verification.reference,
      }, customerToken);

      sessionStorage.removeItem('paystack_pending_order');
      await addStoreOrder(createdOrder);
      addOrder(createdOrder);
      await fetchProducts();
      if (createdOrder.shippingAddress) await saveAddress(createdOrder.shippingAddress);
      await clearCart();
      window.history.replaceState({}, '', '/checkout');
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder }, replace: true });
    } catch (error: any) {
      console.error('Paystack return error:', error);
      hasHandledReturn.current = false;
      if (error instanceof ApiError && error.status === 401) {
        showAlert('Your session expired after payment. Please sign in again and we will finish your order.', 'error', { persistent: true });
        return;
      }
      const message = error instanceof ApiError ? error.message : (error?.message || 'Payment was returned, but it could not be verified. Please contact support.');
      setReturnError(message);
      showAlert(message, 'error', { persistent: true });
    } finally {
      setIsVerifyingReturn(false);
      setIsProcessing(false);
    }
  }, [returnedReference, isAuthenticated, addStoreOrder, addOrder, fetchProducts, saveAddress, clearCart, navigate, showAlert]);

  useEffect(() => {
    if (!returnedReference || (returnedStatus && !['success', 'successful', 'completed'].includes(returnedStatus)) || !isAuthenticated) return;
    if (hasHandledReturn.current) return;
    hasHandledReturn.current = true;
    void completeReturnedOrder();
  }, [returnedReference, returnedStatus, isAuthenticated, completeReturnedOrder]);

  if (cartItems.length === 0 && !isPaystackCallback) return <Navigate to="/cart" replace />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-sm">
          <Lock className="mx-auto h-10 w-10 text-[#FF6B00]" />
          <h2 className="text-xl font-black text-[var(--text-primary)]">Sign in required</h2>
          <p className="text-sm text-[var(--text-muted)]">Please sign in before paying securely with Paystack.</p>
          <Link to="/signin" className="inline-flex rounded-xl bg-[#FF6B00] px-6 py-2.5 text-sm font-black text-white hover:bg-[#E55A00]">Sign in</Link>
        </div>
      </div>
    );
  }

  if (isVerifyingReturn) {
    return (
      <div className="checkout-page min-h-screen bg-[#f5f1ee] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#ebdfe5] bg-[#fffdfb] p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B00]/10 text-[#FF6B00]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Confirming Your Order</h2>
          <p className="text-sm text-[var(--text-muted)]">
            We are confirming your Paystack payment and securing your order details. Please do not close or refresh this page…
          </p>
        </div>
      </div>
    );
  }

  const configuredDeliveryFee = storeSettings.deliveryPrices?.find(price => price.region === region && price.town === city)?.fee;
  const baseDeliveryFee = deliveryMethod === 'store-pickup' ? 0 : configuredDeliveryFee ?? storeSettings.standardShippingFee ?? 0;
  const isFreeDelivery = subtotal >= (storeSettings.freeDeliveryThreshold || 300);
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const orderTotal = Math.max(0, subtotal - discount + deliveryFee);

  const startPaystackCheckout = async () => {
    if (!fullName || !phone || (deliveryMethod !== 'store-pickup' && !area)) {
      showAlert('Please complete your delivery details first.', 'error');
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      const customerToken = localStorage.getItem('auth_token');
      if (!customerToken) throw new ApiError(401, 'Authentication required');
      const orderPayload: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `CR-GH-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cartItems], subtotal, shippingFee: deliveryFee, discount,
        total: orderTotal,
        paymentMethod: 'paystack', paymentStatus: 'pending', paymentReference: '',
        deliveryMethod,
        shippingAddress: { fullName, phone, email: email || undefined, city: deliveryMethod === 'store-pickup' ? 'Accra' : city, region, area: deliveryMethod === 'store-pickup' ? 'Store pickup' : area, deliveryNotes: deliveryNotes || undefined },
        status: 'Confirmed', estimatedDeliveryTime: '24 Hours', appliedPromoCode: promoCode || undefined,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('paystack_pending_order', JSON.stringify(orderPayload));
      const reference = `CR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const result = await api.post<{ checkoutUrl: string }>('/auth?action=paystack-initialize', {
        amount: Math.round(orderPayload.total * 100),
        email,
        name: fullName,
        reference,
        callbackUrl: `${window.location.origin}/checkout`,
        items: orderPayload.items.map(item => ({
          productId: item.product.id,
          price: item.product.price,
        })),
      }, customerToken);
      window.location.assign(result.checkoutUrl);
    } catch (error: any) {
      sessionStorage.removeItem('paystack_pending_order');
      showAlert(error?.message || 'Paystack checkout could not be started. Please try again.', 'error', { persistent: true });
      setIsProcessing(false);
    }
  };

  const inputCls = "w-full rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15";

  return (
    <div className="checkout-page min-h-screen bg-[#f5f1ee]">
      <div className="max-w-6xl mx-auto px-3 py-5 pb-24 sm:px-4 sm:py-6 sm:pb-8">
        <div className="checkout-header mb-5 rounded-[24px] border border-[#ebdfe5] bg-[#fffdfb] px-4 py-4 shadow-[0_16px_32px_rgba(24,20,22,0.04)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)] mb-3">
            <Link to="/cart" className="hover:text-[#ff7a00] transition flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={step >= 1 ? 'text-[#ff7a00] font-bold' : ''}>Delivery</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step >= 2 ? 'text-[#ff7a00] font-bold' : ''}>Confirm</span>
          </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
            {[
              { num: 1, label: 'Delivery Details', icon: MapPin },
              { num: 2, label: 'Confirm Details', icon: CheckCircle2 },
              ].map(({ num, label, icon: Icon }) => (
              <button key={num} onClick={() => num < step ? setStep(num as 1 | 2) : undefined} className={`flex min-w-0 items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-xs font-bold transition sm:gap-2.5 sm:px-4 sm:text-sm ${step === num ? 'bg-[#111111] text-white shadow-lg shadow-black/10' : num < step ? 'bg-[#dff7ea] text-[#1e7a49] cursor-pointer' : 'bg-[#f5eef1] text-[var(--text-muted)] cursor-not-allowed dark:bg-[var(--bg-soft)] dark:text-[var(--text-subtle)]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${step === num ? 'bg-white/20' : num < step ? 'bg-white/25' : 'bg-[#ebdfe5]'}`}>{num}</span>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {returnError && isPaystackCallback && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold">Payment Confirmation Notice</p>
                <p className="mt-1 text-xs opacity-90">{returnError}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void completeReturnedOrder()}
                  className="cursor-pointer rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-black text-white hover:bg-[#E55A00] transition"
                >
                  Retry Confirmation
                </button>
                <Link
                  to="/account/orders"
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                >
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="checkout-panel rounded-[28px] border border-[#ebdfe5] bg-[#fffdfb] overflow-hidden shadow-[0_16px_32px_rgba(24,20,22,0.04)]">

            {/* Step 1: Delivery */}
            {step === 1 && (
              <div>
                <div className="bg-[var(--bg-soft)] border-b border-[var(--border-color)] px-5 py-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#FF6B00]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--text-primary)]">Delivery Address</h2>
                    <p className="text-xs text-[var(--text-muted)]">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-[var(--text-primary)]">How would you like to receive your order?</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: 'standard-delivery' as const, title: 'Delivery', description: 'We bring it to your address.', icon: Truck },
                        { value: 'store-pickup' as const, title: 'Store pickup', description: 'Collect from our Accra location.', icon: ShoppingCart },
                      ].map(({ value, title, description, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDeliveryMethod(value)}
                          className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${deliveryMethod === value ? 'border-[#FF6B00] bg-[#FF6B00]/5' : 'border-[var(--border-color)] hover:border-[#FF6B00]/50'}`}
                        >
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B00]" />
                          <span><strong className="block text-xs text-[var(--text-primary)]">{title}</strong><span className="mt-1 block text-[11px] text-[var(--text-muted)]">{description}</span></span>
                        </button>
                      ))}
                    </div>
                    {deliveryMethod === 'store-pickup' && (
                      <div className="mt-3 rounded-xl bg-[var(--bg-soft)] p-3 text-xs leading-5 text-[var(--text-muted)]">
                        <p>
                          Pickup location: <strong className="text-[var(--text-primary)]">{storeSettings.storeAddress}</strong>. We will confirm when your order is ready.
                        </p>
                        {storeSettings.googleMapsUrl && (
                          <a
                            href={storeSettings.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 font-bold text-[#FF6B00] hover:underline"
                          >
                            <MapPin className="h-3 w-3 inline" />
                            <span>View store location on Google Maps</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {deliveryMethod === 'store-pickup' && (
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4">
                      <p className="text-xs font-bold text-[var(--text-primary)]">Pickup details</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Pickup is free. Enter the name and phone number the collector will use to identify this order.</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Pickup name <span className="text-red-500">*</span></label>
                          <input type="text" required value={fullName} onChange={event => setFullName(event.target.value)} className={inputCls} placeholder="Name for pickup" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Pickup phone <span className="text-red-500">*</span></label>
                          <input type="tel" required value={phone} onChange={event => setPhone(event.target.value)} className={inputCls} placeholder="Phone used at pickup" />
                        </div>
                      </div>
                    </div>
                  )}

                  {deliveryMethod !== 'store-pickup' && (<>
                  {/* Saved Addresses */}
                  {user?.savedAddresses && user.savedAddresses.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-[var(--text-primary)] mb-3 uppercase tracking-wide">Saved Addresses</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {user.savedAddresses.map((address, index) => {
                          const isSelected = area === address.area && fullName === address.fullName;
                          return (
                            <button
                              key={`${address.area}-${index}`}
                              type="button"
                              onClick={() => {
                                setFullName(address.fullName);
                                setPhone(address.phone);
                                setEmail(address.email || user.email);
                                const savedRegion = Object.entries(GHANA_LOCATIONS).find(([, towns]) => towns.includes(address.city as never))?.[0] as GhanaRegion | undefined;
                                if (savedRegion) setRegion(savedRegion);
                                setCity(address.city);
                                setArea(address.area);
                                setDeliveryNotes(address.deliveryNotes || '');
                              }}
                              className={`text-left rounded-xl border-2 p-3 transition ${
                                isSelected
                                  ? 'border-[#FF6B00] bg-[#FF6B00]/5'
                                  : 'border-[var(--border-color)] hover:border-[#FF6B00]/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="font-bold text-xs text-[var(--text-primary)]">{address.fullName}</span>
                                {address.isDefault && <span className="text-[9px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded font-bold">Default</span>}
                                {address.tag && <span className="text-[9px] bg-[var(--bg-soft)] text-[var(--text-subtle)] px-1.5 py-0.5 rounded font-bold uppercase">{address.tag}</span>}
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)]">{address.area}, {address.city}</p>
                              <p className="text-[11px] text-[var(--text-subtle)]">{address.phone}</p>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                        <span className="text-[10px] text-[var(--text-subtle)] font-bold uppercase">Or enter manually</span>
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="e.g. Abena Mensah" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="e.g. 0244123456" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Email Address <span className="text-[var(--text-subtle)] font-normal">(optional)</span></label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Region <span className="text-red-500">*</span></label>
                      <select
                        value={region}
                        onChange={e => {
                          const nextRegion = e.target.value as GhanaRegion;
                          setRegion(nextRegion);
                          setCity(GHANA_LOCATIONS[nextRegion][0]);
                        }}
                        className={inputCls}
                      >
                        {GHANA_REGIONS.map(option => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Town / City <span className="text-red-500">*</span></label>
                      <select value={city} onChange={e => setCity(e.target.value)} className={inputCls}>
                        {GHANA_LOCATIONS[region].map(option => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Area, suburb or GhanaPost GPS <span className="text-red-500">*</span></label>
                      <input type="text" required value={area} onChange={e => setArea(e.target.value)} className={inputCls} placeholder="e.g. East Legon, GA-183-9024 or near Accra Mall" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                        Delivery Instructions <span className="text-[var(--text-subtle)] font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={e => setDeliveryNotes(e.target.value)}
                        className={`${inputCls} resize-none`}
                        rows={3}
                        placeholder="Gate number, landmark, preferred delivery time..."
                      />
                    </div>
                  </div>
                  </>)}

                  <button
                    disabled={!fullName || !phone || (deliveryMethod !== 'store-pickup' && (!area || !region || !city))}
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-8 h-12 bg-[#FF6B00] text-white font-black text-sm rounded-xl hover:bg-[#E55A00] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20"
                  >
                    Review details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: confirmation */}
            {step === 2 && (
              <div>
                <div className="bg-[var(--bg-soft)] border-b border-[var(--border-color)] px-5 py-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#FF6B00]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--text-primary)]">Confirm your details</h2>
                    <p className="text-xs text-[var(--text-muted)]">Please check your delivery information and order once before payment.</p>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-primary)]">Delivery details</p>
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#FF6B00] hover:text-[#E55A00]">Edit</button>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-[var(--text-muted)]">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{fullName}</p>
                      <p>{phone}{email ? ` · ${email}` : ''}</p>
                      <p>{deliveryMethod === 'store-pickup' ? `Store pickup · ${storeSettings.storeAddress}` : `${area}, ${city}, ${region}`}</p>
                      {deliveryNotes && <p>Instructions: {deliveryNotes}</p>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                    <div className="flex items-center justify-between text-sm font-black text-[var(--text-primary)]"><span>Order total</span><span className="text-[#FF6B00]">GHS {orderTotal.toFixed(2)}</span></div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{cartItems.length} item{cartItems.length === 1 ? '' : 's'} · Delivery: {deliveryFee === 0 ? 'Free' : `GHS ${deliveryFee.toFixed(2)}`}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="px-5 h-12 rounded-xl border-2 border-[var(--border-color)] text-xs font-black text-[var(--text-primary)] hover:border-[#FF6B00] transition">Back</button>
                    <button type="button" disabled={isProcessing} onClick={() => void startPaystackCheckout()} className="flex-1 h-12 rounded-xl bg-[#FF6B00] text-sm font-black text-white transition hover:bg-[#E55A00] disabled:opacity-70">{isProcessing ? 'Opening payment…' : 'Confirm and pay securely'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="checkout-summary rounded-[28px] border border-[#ebdfe5] bg-[#fffdfb] overflow-hidden shadow-[0_16px_32px_rgba(24,20,22,0.04)]">
              <div className="checkout-summary-head bg-[#f8f0f3] border-b border-[#ebdfe5] px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wide">Your Order</h3>
                <span className="text-xs text-[var(--text-muted)]">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={`${item.product.id}-${item.selectedOption || ''}`} className="checkout-summary-item flex gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-2">
                    <div className="relative shrink-0">
                      <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff7a00] text-white text-[10px] font-black rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-bold text-[var(--text-primary)]">{item.product.name}</p>
                      {item.selectedOption && <p className="text-[10px] text-[var(--text-muted)]">{item.selectedOption}</p>}
                    </div>
                    <span className="text-xs font-black text-[var(--text-primary)] shrink-0">GHS {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-[#ebdfe5] space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span>GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Delivery</span>
                  <span className="text-[#FF6B00] font-bold">{deliveryFee === 0 ? 'Free' : `GHS ${deliveryFee.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount{promoCode ? ` (${promoCode})` : ''}</span>
                    <span>-GHS {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-[#ebdfe5] pt-3">
                  <span className="text-sm font-black text-[var(--text-primary)]">Total</span>
                  <span className="text-xl font-black text-[#ff7a00]">GHS {orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 space-y-2">
              {[
                { icon: ShieldCheck, text: 'Buyer Protection Guaranteed' },
                { icon: Truck, text: 'Fast Accra & Beyond Delivery' },
                { icon: Star, text: '100% Authentic Products' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-[#FF6B00]" />
                  <span className="text-xs text-[var(--text-muted)]">{text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ─── Order Confirmation ──────────────────────────────────────────────────── */
export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const { storeSettings } = useStore();
  const [order, setOrder] = useState<Order | null>((location.state as { order?: Order })?.order || null);
  const [loading, setLoading] = useState(!order && Boolean(orderId));
  const [pickupDetailsCopied, setPickupDetailsCopied] = useState(false);
  const [orderNumCopied, setOrderNumCopied] = useState(false);

  const fetchOrder = useCallback(() => {
    if (!orderId) return;
    api.get<Order>(`/orders?id=${encodeURIComponent(orderId)}`)
      .then(fetched => {
        if (fetched && fetched.id) setOrder(fetched);
      })
      .catch(() => {
        api.get<Order>(`/orders?orderNumber=${encodeURIComponent(orderId)}`)
          .then(fetched => { if (fetched && fetched.id) setOrder(fetched); })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!order && orderId) {
      setLoading(true);
      fetchOrder();
    }
  }, [order, orderId, fetchOrder]);

  // Live auto-polling every 15 seconds while page is active (until delivered)
  useEffect(() => {
    if (!orderId) return;
    if (order && order.status === 'Delivered') return;

    const interval = window.setInterval(() => {
      fetchOrder();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [orderId, order?.status, fetchOrder]);

  const copyOrderNumber = async () => {
    if (!order?.orderNumber) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setOrderNumCopied(true);
      window.setTimeout(() => setOrderNumCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const sharePickupDetails = async () => {
    if (!order || order.deliveryMethod !== 'store-pickup') return;
    const pickupDetails = [
      `Pickup order: ${order.orderNumber}`,
      `Name: ${order.shippingAddress.fullName}`,
      `Phone: ${order.shippingAddress.phone}`,
      `Location: ${storeSettings.storeAddress}${storeSettings.googleMapsUrl ? ` (${storeSettings.googleMapsUrl})` : ''}`,
      'Please show this order number and the phone number at pickup.',
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: `Pickup ${order.orderNumber}`, text: pickupDetails });
      } else {
        await navigator.clipboard.writeText(pickupDetails);
        setPickupDetailsCopied(true);
        window.setTimeout(() => setPickupDetailsCopied(false), 2500);
      }
    } catch {
      // Sharing can be cancelled by the user; no error message is needed.
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/15 dark:bg-emerald-500/25 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {order?.paymentStatus === 'pending' ? 'Order Received!' : 'Order Confirmed!'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {order?.paymentStatus === 'paid'
                ? 'Thank you for your purchase! We are preparing your order right now.'
                : 'Thank you! We have received your order and our team is preparing it.'}
            </p>
          </div>

          {order && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C86D51]/30 bg-[#C86D51]/10 px-4 py-1.5">
              <Package className="h-4 w-4 text-[#C86D51]" />
              <span className="text-xs font-black text-[#C86D51]">Order #{order.orderNumber}</span>
              <button
                type="button"
                onClick={() => void copyOrderNumber()}
                className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] hover:text-[#C86D51] transition"
                title="Copy order number"
              >
                {orderNumCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C86D51] border-t-transparent mb-3" />
            <p className="text-xs font-bold text-[var(--text-muted)]">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Live Progress Card */}
            <div className="overflow-hidden rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] shadow-sm">
              <div className="bg-[#FCF9F7] dark:bg-[#241D20] border-b border-[#F0E4DC] dark:border-[#2C2426] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C86D51] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C86D51]" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C86D51]">
                    Live Order Journey
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-subtle)]">
                    Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                  </span>
                  <Badge variant={order.status === 'Delivered' ? 'botanical' : 'warm'} size="sm">
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Status Message & ETA banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs text-[var(--text-subtle)] font-medium">
                      Current Status
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                      {STATUS_MESSAGE[order.status]}
                    </p>
                  </div>
                  {order.estimatedDeliveryTime && (
                    <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[var(--bg-soft)] px-3 py-1.5 border border-[#F0E4DC] dark:border-[#2C2426]">
                      <Clock className="h-3.5 w-3.5 text-[#C86D51]" aria-hidden="true" />
                      <span className="text-xs font-bold text-[#C86D51]">
                        Est. Arrival: {order.estimatedDeliveryTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* 6-step Journey Tracker */}
                <div className="pt-2 pb-1">
                  <OrderProgressTracker status={order.status} />
                </div>

                {/* Courier / Rider banner if available */}
                {(order.riderInfo?.riderName || order.riderInfo?.riderPhone || order.riderInfo?.riderLocation) && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[var(--bg-soft)] p-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51] shadow-sm">
                        <Truck className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {order.riderInfo?.riderName || 'Courier Assigned'}
                        </p>
                        {order.riderInfo?.riderLocation && (
                          <p className="text-[10px] text-[var(--text-subtle)]">
                            Near {order.riderInfo.riderLocation}
                            {order.riderInfo.estimatedArrival ? ` · ETA ${order.riderInfo.estimatedArrival}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    {order.riderInfo?.riderPhone && (
                      <a
                        href={`tel:${order.riderInfo.riderPhone}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#C86D51] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#8A3D52] transition shadow-sm"
                        aria-label={`Call courier ${order.riderInfo.riderPhone}`}
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call Courier
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Store Pickup Card (if store pickup) */}
            {order.deliveryMethod === 'store-pickup' && (
              <div className="rounded-3xl border border-[#C86D51]/30 bg-[#C86D51]/5 p-5 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C86D51]">
                    Store Pickup Details
                  </p>
                  <span className="text-xs font-bold text-[#C86D51]">Collect In Store</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Show this code when collecting your parcel:</p>
                  <p className="mt-1 font-mono text-2xl font-black tracking-wide text-[var(--text-primary)]">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-xs space-y-1 text-[var(--text-muted)] pt-1 border-t border-[#C86D51]/15">
                  <p className="flex flex-wrap items-center gap-x-2">
                    <span><strong className="text-[var(--text-primary)]">Location:</strong> {storeSettings.storeAddress}</span>
                    {storeSettings.googleMapsUrl && (
                      <a
                        href={storeSettings.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#C86D51] hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Google Maps</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                      </a>
                    )}
                  </p>
                  <p><strong className="text-[var(--text-primary)]">Recipient:</strong> {order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
                </div>
                <button
                  type="button"
                  onClick={() => void sharePickupDetails()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--text-primary)] px-4 py-2 text-xs font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)]"
                >
                  {pickupDetailsCopied ? <Copy className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  {pickupDetailsCopied ? 'Pickup details copied!' : 'Share pickup details'}
                </button>
              </div>
            )}

            {/* Order Items & Cost Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Order Items (3 cols) */}
              <div className="md:col-span-3 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                  Items In Your Order ({order.items.length})
                </p>
                <div className="space-y-3 divide-y divide-[var(--border-color)]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 ${idx > 0 ? 'pt-3' : ''}`}>
                      <img
                        src={item.product?.image}
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-color)]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="break-words text-xs font-bold text-[var(--text-primary)] leading-snug">
                          {item.product?.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          Qty: {item.quantity} {item.selectedOption ? `• ${item.selectedOption}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)] whitespace-nowrap">
                        GHS {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost & Payment Summary (2 cols) */}
              <div className="md:col-span-2 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">
                    Payment Summary
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[var(--text-primary)]">GHS {Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-[var(--text-primary)]">GHS {Number(order.shippingFee).toFixed(2)}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount</span>
                        <span>-GHS {Number(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border-color)]">
                      <span className="text-[var(--text-primary)]">
                        {order.paymentStatus === 'pending' ? 'Amount Due' : 'Total Paid'}
                      </span>
                      <span className="text-[#C86D51]">GHS {Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Method:</span>
                    <span className="font-bold uppercase text-[var(--text-primary)]">{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Payment:</span>
                    <Badge variant={order.paymentStatus === 'paid' ? 'botanical' : 'warm'} size="sm">
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Updates Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Details */}
              {order.deliveryMethod !== 'store-pickup' ? (
                <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-3 shadow-sm">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                    Delivery Destination
                  </p>
                  <div className="space-y-2 text-xs text-[var(--text-muted)]">
                    <p><strong className="text-[var(--text-primary)]">Recipient:</strong> {order.shippingAddress.fullName}</p>
                    <p><strong className="text-[var(--text-primary)]">Contact Phone:</strong> {order.shippingAddress.phone}</p>
                    <p><strong className="text-[var(--text-primary)]">Address:</strong> {order.shippingAddress.addressLine1 || order.shippingAddress.area}</p>
                    <p><strong className="text-[var(--text-primary)]">Area & City:</strong> {order.shippingAddress.area}, {order.shippingAddress.city}</p>
                    {order.shippingAddress.region && (
                      <p><strong className="text-[var(--text-primary)]">Region:</strong> {order.shippingAddress.region}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-3 shadow-sm">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                    Pickup Location
                  </p>
                  <div className="space-y-2 text-xs text-[var(--text-muted)]">
                    <p><strong className="text-[var(--text-primary)]">Store:</strong> {storeSettings.storeName}</p>
                    <p><strong className="text-[var(--text-primary)]">Address:</strong> {storeSettings.storeAddress}</p>
                    <p><strong className="text-[var(--text-primary)]">Collector:</strong> {order.shippingAddress.fullName}</p>
                    <p><strong className="text-[var(--text-primary)]">Phone:</strong> {order.shippingAddress.phone}</p>
                  </div>
                </div>
              )}

              {/* Delivery Updates Timeline */}
              <div className="rounded-3xl border border-[var(--border-color)] bg-[#FCF9F7] dark:bg-[#241D20] p-5 shadow-sm">
                <DeliveryTimeline order={order} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center">Thank you for shopping with {storeSettings.storeName}.</p>
        )}

        {/* Action Hub */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/account/orders" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C86D51] text-white font-bold text-sm hover:bg-[#B05D41] transition shadow-lg shadow-[#C86D51]/25 flex items-center justify-center gap-2">
              <Package className="h-4 w-4" />
              Track in My Orders
            </button>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] text-[var(--text-primary)] font-bold text-sm hover:border-[#C86D51] transition flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
          <Link to="/shop" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] text-[var(--text-primary)] font-bold text-sm hover:border-[#C86D51] transition">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
