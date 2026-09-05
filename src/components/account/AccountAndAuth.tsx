import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Truck,
  RotateCcw,
  Settings,
  Headphones,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  Phone,
  Mail,
  Sparkles,
  X,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  Star,
  Printer,
  CreditCard,
  Check,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { Button, Badge } from '../common/UIPrimitives';
import { ShippingAddress, Order, Product, AdminNotification } from '../../types';
import logoImg from '../../assets/logo.jpeg';
import { api } from '../../lib/api';

// ============================================================================
// Google Sign-In Button Component
// ============================================================================
const GoogleSignInButton: React.FC<{ onCredential: (credential: string) => Promise<void> }> = ({ onCredential }) => {
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const onCredentialRef = React.useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const renderButton = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !buttonRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => void onCredentialRef.current(response.credential),
      });
      buttonRef.current.innerHTML = '';
      google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
        shape: 'pill',
      });
    };

    if ((window as any).google?.accounts?.id) {
      renderButton();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={buttonRef} className="flex min-h-10 justify-center" />;
};

// ============================================================================
// Auth Shell
// ============================================================================
const AuthShell: React.FC<{ mode: 'signin' | 'signup'; children: React.ReactNode }> = ({ mode, children }) => {
  const { storeSettings } = useStore();
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10 font-sans sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_24px_70px_rgba(11,31,56,0.12)]">
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <img
              src={storeSettings.storeLogo || logoImg}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoImg; }}
              alt="CR COSMETICS AND ESSENTIALS"
              className="h-11 w-11 rounded-xl border border-[var(--border-color)] bg-white p-1 object-contain"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
              {mode === 'signin' ? 'Welcome back' : 'Join the store'}
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Sign In Page (Live Database Auth)
// ============================================================================
export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { showAlert } = useAlert();
  const { storeSettings } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleGoogleCredential = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      navigate('/account');
    } catch (error: any) {
      showAlert(error?.message || 'Google sign-in failed. Please try again.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/account');
    } catch (error: any) {
      showAlert(error?.message || 'Sign in failed. Please check your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storePhoneOrWhatsApp = storeSettings.whatsappNumber || storeSettings.storePhone;

  return (
    <AuthShell mode="signin">
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C86D51]">Customer account</p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)]">Sign in to manage your orders, saved addresses, and wishlist.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="customer@example.com"
              />
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)]">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-[#C86D51] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="Enter your password"
              />
              <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-[0.12em] bg-[#1C1817] text-white hover:bg-[#2A1D20]"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span className="h-px flex-1 bg-[var(--border-color)]" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <div className="border-t border-[var(--border-color)] pt-5 text-center text-sm text-[var(--text-muted)]">
          Don&apos;t have an account yet?{' '}
          <Link to="/signup" className="font-bold text-[#C86D51] hover:underline">
            Create account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1C1719] p-6 shadow-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C86D51]">
                <HelpCircle className="h-5 w-5" />
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Account Assistance</h3>
              </div>
              <button onClick={() => setShowForgotModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              If you need your password reset or access restored, our customer service team is available to assist you directly.
            </p>
            <div className="rounded-xl border border-[var(--border-color)] bg-stone-50 dark:bg-[#2A2024] p-4 text-xs space-y-2">
              <p className="font-bold text-[var(--text-primary)]">Store Contact:</p>
              {storePhoneOrWhatsApp && (
                <p className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  <Phone className="h-3.5 w-3.5 text-[#C86D51]" />
                  <span>Call/WhatsApp: {storePhoneOrWhatsApp}</span>
                </p>
              )}
              {storeSettings.storeEmail && (
                <p className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  <Mail className="h-3.5 w-3.5 text-[#C86D51]" />
                  <span>Email: {storeSettings.storeEmail}</span>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
              {storePhoneOrWhatsApp && (
                <a
                  href={`https://wa.me/${storePhoneOrWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello CR COSMETICS AND ESSENTIALS, I need assistance accessing my account.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#1EBE5D] transition"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
};

// ============================================================================
// Sign Up Page (Live Database Auth)
// ============================================================================
export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleCredential = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      navigate('/account');
    } catch {
      showAlert('Google sign-up failed. Please try again.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showAlert('Please enter a valid email address.', 'error');
      return;
    }
    if (password.length < 8) {
      showAlert('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please verify.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(cleanEmail, fullName, password, phone);
      showAlert('Your account has been created successfully.', 'success');
      navigate('/account');
    } catch (error: any) {
      showAlert(error?.message || 'Account creation failed. Please verify your details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell mode="signup">
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C86D51]">Customer account</p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Create your account</h1>
                  <p className="text-sm text-[var(--text-muted)]">Join CR COSMETICS AND ESSENTIALS for faster checkouts, order tracking, and account management.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="e.g. Ama Mensah"
              />
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="ama@example.com"
              />
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">
              Phone Number <span className="text-[10px] font-normal text-stone-400">(for courier delivery)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="e.g. 024 123 4567"
              />
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Password (8+ characters)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="Create password"
              />
              <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#C86D51]"
                placeholder="Confirm password"
              />
              <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-[0.12em] bg-[#1C1817] text-white hover:bg-[#2A1D20]"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span className="h-px flex-1 bg-[var(--border-color)]" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <div className="border-t border-[var(--border-color)] pt-5 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link to="/signin" className="font-bold text-[#C86D51] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

// ============================================================================
// Customer Account Portal (100% Live Database Backed)
// ============================================================================
type AccountTab = 'overview' | 'orders' | 'notifications' | 'addresses' | 'wishlist' | 'reviews' | 'security' | 'preferences';

export const AccountPage: React.FC = () => {
  const {
    user,
    logout,
    isAuthenticated,
    updateProfile,
    changePassword,
    deleteAccount,
    saveAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  } = useAuth();
  const { products, storeSettings, promoCodes } = useStore();
  const { addToCart, setIsCartOpen } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { theme, setTheme } = useTheme();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [serverNotifications, setServerNotifications] = useState<AdminNotification[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Address Modal/Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    altPhone: '',
    email: user?.email || '',
    city: 'Accra',
    area: '',
    landmarkOrGps: '',
    deliveryNotes: '',
    isDefault: false,
    tag: 'Home',
  });

  // Digital Invoice Modal State
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  // Review Submission Modal State
  const [reviewModalProduct, setReviewModalProduct] = useState<{ id: string; name: string; image: string; brand: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSkinType, setReviewSkinType] = useState('Combination');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // Account Deletion Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Order Filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Preferences State
  const [orderNotifications, setOrderNotifications] = useState(() => localStorage.getItem('cr_order_notifications') !== 'false');
  const [promoAlerts, setPromoAlerts] = useState(() => localStorage.getItem('cr_promo_alerts') !== 'false');
  const [reviewedNotifications, setReviewedNotifications] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`cr_customer_reviewed_notifications_${user?.id || 'guest'}`) || '[]');
    } catch {
      return [];
    }
  });

  // Sync profile form when user updates
  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName, phone: user.phone, profileImage: user.profileImage || '' });
    }
  }, [user]);

  // Fetch orders live from Neon PostgreSQL
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get<{ orders: Order[] }>('/orders');
      if (res?.orders && Array.isArray(res.orders)) {
        setRemoteOrders(res.orders);
      }
    } catch {
      if (user?.orders) {
        setRemoteOrders(user.orders);
      }
    } finally {
      setLoadingOrders(false);
    }
    try {
      const notificationResponse = await api.get<{ notifications: AdminNotification[] }>('/notifications');
      if (Array.isArray(notificationResponse.notifications)) setServerNotifications(notificationResponse.notifications);
    } catch {
      // Notifications remain available from the order fallback when the API is unavailable.
    }
  };

  // Fetch reviews written by the user live from PostgreSQL
  const loadUserReviews = async () => {
    try {
      const res = await api.get<{ reviews: any[] }>('/reviews?me=true');
      if (res?.reviews) {
        setUserReviews(res.reviews);
      }
    } catch {
      // Offline / unauthenticated
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadOrders();
      void loadUserReviews();
      const interval = window.setInterval(() => void loadOrders(), 30000);
      return () => window.clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Orders prioritizing live API results from DB
  const allOrders = useMemo(() => {
    if (remoteOrders.length > 0) return remoteOrders;
    return user?.orders || [];
  }, [remoteOrders, user?.orders]);

  // Active in-transit orders
  const activeOrders = useMemo(() => {
    return allOrders.filter(
      (o) => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Packing Order' || o.status === 'Out for Delivery'
    );
  }, [allOrders]);

  const customerNotifications = useMemo(() => serverNotifications.length > 0
    ? serverNotifications.map(notification => ({
      id: notification.id,
      orderNumber: '',
      status: '',
      timestamp: notification.timestamp,
      message: notification.message,
      serverRead: notification.read,
    }))
    : allOrders.map(order => ({
      id: `order-${order.id}-${order.status}`,
      orderNumber: order.orderNumber,
      status: order.status,
      timestamp: order.createdAt,
      message: order.status === 'Delivered'
        ? `Order #${order.orderNumber} has been delivered.`
        : `Order #${order.orderNumber} is ${order.status.toLowerCase()}.`,
      serverRead: false,
    })), [allOrders, serverNotifications]);

  const unreadCustomerNotifications = customerNotifications.filter(notification => !notification.serverRead && !reviewedNotifications.includes(notification.id)).length;

  const markCustomerNotificationsReviewed = (ids: string[]) => {
    setReviewedNotifications(ids);
    localStorage.setItem(`cr_customer_reviewed_notifications_${user?.id || 'guest'}`, JSON.stringify(ids));
    const newlyRead = customerNotifications.filter(notification => ids.includes(notification.id) && !notification.id.startsWith('order-'));
    newlyRead.forEach(notification => { void api.patch(`/notifications?id=${encodeURIComponent(notification.id)}`, {}); });
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = allOrders;
    if (orderFilter === 'active') {
      list = list.filter((o) => o.status !== 'Delivered');
    } else if (orderFilter === 'delivered') {
      list = list.filter((o) => o.status === 'Delivered');
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.items?.some((item) => item.product?.name?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allOrders, orderFilter, orderSearch]);

  // Wishlisted products from live database
  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // Actual lifetime spent calculated from live database orders
  const lifetimeSpent = useMemo(() => {
    return allOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [allOrders]);

  // Unique products purchased by this user from actual orders
  const purchasedProducts = useMemo(() => {
    const map = new Map<string, Product>();
    allOrders.forEach((o) => {
      o.items?.forEach((item) => {
        if (item.product?.id && !map.has(item.product.id)) {
          const fullProduct = products.find((p) => p.id === item.product.id) || (item.product as Product);
          map.set(item.product.id, fullProduct);
        }
      });
    });
    return Array.from(map.values());
  }, [allOrders, products]);

  // Products from orders that haven't been reviewed yet
  const itemsToReview = useMemo(() => {
    const reviewedIds = new Set(userReviews.map((r) => r.productId));
    return purchasedProducts.filter((product) => !reviewedIds.has(product.id));
  }, [purchasedProducts, userReviews]);

  // Live active promotional codes from store settings
  const liveActivePromos = useMemo(() => {
    return (promoCodes || []).filter((p) => p.isActive);
  }, [promoCodes]);

  // Re-order past order
  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    try {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.product.id) || (item.product as any);
        await addToCart(prod, item.quantity, item.selectedOption, item.selectedVariant);
      }
      showAlert(`Added items from order #${order.orderNumber} to cart`, 'success');
      setIsCartOpen(true);
    } catch {
      showAlert('Failed to re-order some items. Please verify availability.', 'error');
    }
  };

  // Update profile in live DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      showAlert('Profile details updated', 'success');
      setIsEditingProfile(false);
    } catch (error: any) {
      showAlert(error?.message || 'Failed to update profile', 'error');
    }
  };

  const handleProfileImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showAlert('Please choose a JPG, PNG, WEBP, or GIF image under 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => setProfileForm(previous => ({ ...previous, profileImage: String(event.target?.result || '') }));
    reader.onerror = () => showAlert('The picture could not be read. Please try again.', 'error');
    reader.readAsDataURL(file);
  };

  // Change password in live DB
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.hasPassword && !currentPassword) {
      showAlert('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      showAlert('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      showAlert(error?.message || 'Failed to update password. Verify your current password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Address Save
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressIndex !== null) {
        await updateAddress(editingAddressIndex, addressForm);
        showAlert('Address updated', 'success');
      } else {
        await saveAddress(addressForm);
        showAlert('New address saved to address book', 'success');
      }
      setIsAddressModalOpen(false);
      setEditingAddressIndex(null);
    } catch (error: any) {
      showAlert(error?.message || 'Failed to save address', 'error');
    }
  };

  const openEditAddress = (addr: ShippingAddress, index: number) => {
    setAddressForm(addr);
    setEditingAddressIndex(index);
    setIsAddressModalOpen(true);
  };

  const openCreateAddress = () => {
    setAddressForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      altPhone: '',
      email: user?.email || '',
      city: 'Accra',
      area: '',
      landmarkOrGps: '',
      deliveryNotes: '',
      isDefault: (user?.savedAddresses || []).length === 0,
      tag: 'Home',
    });
    setEditingAddressIndex(null);
    setIsAddressModalOpen(true);
  };

  // Submit verified review to live database
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProduct) return;
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: reviewModalProduct.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        skinType: reviewSkinType,
      });
      showAlert('Review submitted successfully', 'success');
      setReviewModalProduct(null);
      setReviewComment('');
      setReviewTitle('');
      void loadUserReviews();
    } catch (error: any) {
      showAlert(error?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'delete') {
      showAlert('Please type "DELETE" to confirm account deactivation.', 'error');
      return;
    }
    try {
      await deleteAccount();
      showAlert('Account deleted.', 'info');
      navigate('/');
    } catch {
      showAlert('Failed to delete account. Please contact support.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#C86D51]">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-[#1C1817] dark:text-stone-100">Customer Account</h2>
        <p className="mt-2 text-xs text-stone-500 leading-relaxed">
          Sign in or create an account to view your past orders, manage delivery addresses, and track dispatches.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/signin">
            <Button variant="primary" className="rounded-xl px-6 text-xs uppercase font-bold bg-[#1C1817] text-white">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="rounded-xl px-6 text-xs uppercase font-bold">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#FCF9F7] dark:bg-[#121011] py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#C86D51] to-[#A94C63] text-2xl font-black text-white shadow-md">
                {user?.profileImage ? <img src={user.profileImage} alt={`${user.fullName}'s profile`} className="h-full w-full object-cover" /> : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-[#1C1817] dark:text-stone-100">
                    {user?.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F4] dark:bg-[#2F1F24] px-2.5 py-0.5 text-[10px] font-extrabold text-[#C86D51]">
                    <CheckCircle2 className="h-3 w-3" /> Registered Customer
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <Mail className="h-3.5 w-3.5 text-stone-400" /> {user?.email}
                  {user?.phone && (
                    <>
                      <span>•</span>
                      <Phone className="h-3.5 w-3.5 text-stone-400" /> {user.phone}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/shop">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-[#E8D8CF] text-xs font-bold hover:border-[#C86D51]"
                >
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5 text-[#C86D51]" /> Browse Catalog
                </Button>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-[#2A2024] hover:text-red-600 transition"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#F0E4DC] dark:border-[#2C2426] pt-6 sm:grid-cols-4">
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-3 rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-3.5 text-left transition hover:border-[#C86D51]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51] shadow-sm">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-black text-[#1C1817] dark:text-stone-100">{allOrders.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Orders placed</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-3 rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-3.5 text-left transition hover:border-[#C86D51]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51] shadow-sm">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-black text-[#1C1817] dark:text-stone-100">{activeOrders.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">In Transit</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className="flex items-center gap-3 rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-3.5 text-left transition hover:border-[#C86D51]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51] shadow-sm">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-black text-[#1C1817] dark:text-stone-100">{user?.savedAddresses?.length || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Saved Addresses</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className="flex items-center gap-3 rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-3.5 text-left transition hover:border-[#C86D51]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51] shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-black text-[#1C1817] dark:text-stone-100">{wishlistIds.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Saved Wishlist</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar + Screen */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-2 rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-3 shadow-sm">
            <nav className="space-y-1">
              {[
                { id: 'overview' as const, label: 'Overview', icon: Sparkles },
                { id: 'orders' as const, label: 'Orders & Tracking', icon: Package, count: allOrders.length },
                { id: 'notifications' as const, label: 'Notifications', icon: Bell, count: unreadCustomerNotifications },
                { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin, count: user?.savedAddresses?.length || 0 },
                { id: 'wishlist' as const, label: 'Saved Wishlist', icon: Heart, count: wishlistIds.length },
                { id: 'reviews' as const, label: 'Product Reviews', icon: Star, count: itemsToReview.length },
                { id: 'security' as const, label: 'Profile & Password', icon: ShieldCheck },
                { id: 'preferences' as const, label: 'Preferences', icon: Settings },
              ].map(({ id, label, icon: Icon, count }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#1C1817] text-white shadow-sm dark:bg-[#C86D51]'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-[#FAF3F0] dark:hover:bg-[#2A2024] hover:text-[#C86D51]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F0E4DC] dark:bg-[#2C2426] text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-[#F0E4DC] dark:border-[#2C2426] pt-3">
              <Link
                to="/support"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-[#FAF3F0] dark:hover:bg-[#2A2024] hover:text-[#C86D51] transition"
              >
                <Headphones className="h-4 w-4" /> Customer Support
              </Link>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Active in-transit Order */}
                {activeOrders.length > 0 && (
                  <div className="overflow-hidden rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C86D51] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C86D51]"></span>
                        </span>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C86D51]">
                          Live Order in Progress
                        </p>
                      </div>
                      <Badge variant="terracotta">{activeOrders[0].status}</Badge>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-[#1C1817] dark:text-stone-100">
                          Order #{activeOrders[0].orderNumber}
                        </h3>
                        <p className="text-xs text-stone-500">
                          Delivery ETA: <strong className="text-stone-800 dark:text-stone-200">{activeOrders[0].estimatedDeliveryTime || 'Scheduled'}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingInvoiceOrder(activeOrders[0])}
                          className="rounded-xl text-xs font-bold"
                        >
                          <Printer className="mr-1 h-3.5 w-3.5" /> Digital Receipt
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveTab('orders')}
                          className="rounded-xl text-xs font-bold bg-[#1C1817] text-white hover:bg-[#2A1D20]"
                        >
                          View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress timeline */}
                    <div className="mt-6 border-t border-[#F0E4DC] dark:border-[#2C2426] pt-4">
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                        {['Confirmed', 'Packing Order', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                          const currentStage = activeOrders[0].status === 'Delivered' ? 3 : activeOrders[0].status === 'Out for Delivery' ? 2 : activeOrders[0].status === 'Packing Order' ? 1 : 0;
                          const isDone = idx <= currentStage;
                          return (
                            <div key={step} className={isDone ? 'text-[#C86D51]' : 'text-stone-300 dark:text-stone-600'}>
                              <span className={`mx-auto mb-1.5 block h-2.5 w-2.5 rounded-full ${isDone ? 'bg-[#C86D51]' : 'bg-stone-200 dark:bg-stone-700'}`} />
                              {step}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Courier Contact Card (Only when assigned in database) */}
                    {activeOrders[0].riderInfo?.riderName && (
                      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#F0E4DC] bg-stone-50 dark:bg-[#241D20] p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#C86D51]">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1C1817] dark:text-stone-100">
                              Courier: {activeOrders[0].riderInfo.riderName}
                            </p>
                            {activeOrders[0].riderInfo.estimatedArrival && (
                              <p className="text-[10px] text-stone-500">
                                ETA: {activeOrders[0].riderInfo.estimatedArrival}
                              </p>
                            )}
                          </div>
                        </div>
                        {activeOrders[0].riderInfo.riderPhone && (
                          <a
                            href={`tel:${activeOrders[0].riderInfo.riderPhone}`}
                            className="flex items-center gap-1 rounded-xl bg-[#C86D51] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#8A3D52] transition"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call Rider
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Live Promo Codes Strip (Direct from database) */}
                {liveActivePromos.length > 0 && (
                  <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#1C1817] dark:text-stone-100 mb-3">
                      Active Store Promotions
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {liveActivePromos.map((promo) => (
                        <div
                          key={promo.id}
                          className="flex items-center justify-between rounded-2xl border border-[#F0E4DC] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs"
                        >
                          <div>
                            <p className="font-black text-[#1C1817] dark:text-stone-100">{promo.code}</p>
                            <p className="text-[11px] text-stone-500">
                              {promo.freeShipping
                                ? 'Free shipping'
                                : promo.discountType === 'percentage'
                                ? `${promo.discountValue}% off orders`
                                : `GHS ${promo.discountValue} off`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              showAlert(`Promo code "${promo.code}" copied!`, 'success');
                            }}
                            className="rounded-lg bg-white dark:bg-[#1C1719] px-3 py-1.5 text-xs font-bold text-[#C86D51] border border-[#F0E4DC] hover:border-[#C86D51]"
                          >
                            Copy Code
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Purchases */}
                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F0E4DC] dark:border-[#2C2426]">
                    <div>
                      <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">Recent Orders</h3>
                      <p className="text-xs text-stone-500">Your latest purchases</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#C86D51]"
                    >
                      View All ({allOrders.length})
                    </Button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {allOrders.length > 0 ? (
                      allOrders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex flex-col gap-4 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FAF3F0] dark:bg-[#2A2024] text-[#C86D51]">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-[#1C1817] dark:text-stone-100">
                                  #{ord.orderNumber}
                                </p>
                                <Badge variant={ord.status === 'Delivered' ? 'botanical' : 'terracotta'} size="sm">
                                  {ord.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-stone-500">
                                {ord.items?.length || 0} item{(ord.items?.length || 0) > 1 ? 's' : ''} • GHS {Number(ord.total).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(ord)}
                              className="rounded-xl text-xs font-bold"
                            >
                              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Re-order
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingInvoiceOrder(ord)}
                              className="text-xs text-stone-600 dark:text-stone-300"
                            >
                              Receipt
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <ShoppingBag className="mx-auto h-10 w-10 text-stone-300 mb-2" />
                        <p className="text-xs font-semibold text-stone-500">No orders placed yet.</p>
                        <Link to="/shop" className="mt-3 inline-block">
                          <Button variant="primary" size="sm" className="rounded-xl text-xs bg-[#1C1817] text-white">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS & TRACKING */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">My Orders</h2>
                    <p className="text-xs text-stone-500">Track and view your purchases directly from store records.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadOrders}
                    disabled={loadingOrders}
                    className="rounded-xl text-xs font-bold"
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                </div>

                {/* Filters and search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-1 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-1">
                    {(['all', 'active', 'delivered'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                          orderFilter === filter
                            ? 'bg-[#C86D51] text-white'
                            : 'text-stone-600 dark:text-stone-300 hover:text-[#C86D51]'
                        }`}
                      >
                        {filter === 'all' ? 'All Orders' : filter === 'active' ? 'In Transit' : 'Delivered'}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search by order # or product..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-64 rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] px-3.5 py-2 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                  />
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E4DC] dark:border-[#2C2426] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-[#1C1817] dark:text-stone-100">
                                Order #{ord.orderNumber}
                              </span>
                              <Badge
                                variant={
                                  ord.status === 'Delivered'
                                    ? 'botanical'
                                    : ord.status === 'Confirmed'
                                    ? 'terracotta'
                                    : 'espresso'
                                }
                              >
                                {ord.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                              Placed on {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-stone-500 font-medium">Total</p>
                            <p className="text-lg font-black text-[#1C1817] dark:text-stone-100">
                              GHS {Number(ord.total).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Order Stepper */}
                        <div className="rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-4">
                          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                            Status
                          </p>
                          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                            {['Confirmed', 'Packing Order', 'Out for Delivery', 'Delivered'].map((stage, idx) => {
                              const currentStage = ord.status === 'Delivered' ? 3 : ord.status === 'Out for Delivery' ? 2 : ord.status === 'Packing Order' ? 1 : 0;
                              const isDone = idx <= currentStage;
                              return (
                                <div key={stage} className={isDone ? 'text-[#C86D51]' : 'text-stone-300 dark:text-stone-600'}>
                                  <span className={`mx-auto mb-1 block h-2 w-2 rounded-full ${isDone ? 'bg-[#C86D51]' : 'bg-stone-300 dark:bg-stone-700'}`} />
                                  {stage}
                                </div>
                              );
                            })}
                          </div>
                          {ord.riderInfo?.riderName && (
                            <p className="mt-3 text-xs text-stone-600 dark:text-stone-300">
                              <strong>Courier Assigned:</strong> {ord.riderInfo.riderName} {ord.riderInfo.riderPhone ? `(${ord.riderInfo.riderPhone})` : ''} {ord.riderInfo.estimatedArrival ? `• ${ord.riderInfo.estimatedArrival}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="space-y-3 pt-2">
                          {ord.items && ord.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <img
                                src={item.product?.image || logoImg}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoImg; }}
                                alt={item.product?.name || 'Product'}
                                className="h-12 w-12 rounded-xl object-cover border border-[#F0E4DC] dark:border-[#2C2426]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-bold text-[#1C1817] dark:text-stone-100">
                                  {item.product?.name}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                  Qty: {item.quantity} {item.selectedOption ? `• ${item.selectedOption}` : ''} {item.selectedVariant ? `• ${item.selectedVariant.name}` : ''}
                                </p>
                              </div>
                              <p className="text-xs font-bold text-[#1C1817] dark:text-stone-100">
                                GHS {(Number(item.selectedVariant?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#F0E4DC] dark:border-[#2C2426] pt-3 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500">
                          <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-300">
                              Destination: {ord.shippingAddress?.fullName} • {ord.shippingAddress?.area}, {ord.shippingAddress?.city}
                            </p>
                            {ord.shippingAddress?.phone && (
                              <p className="text-[11px] text-stone-400">Phone: {ord.shippingAddress.phone}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingInvoiceOrder(ord)}
                              className="rounded-xl text-xs font-bold"
                            >
                              <Printer className="mr-1.5 h-3.5 w-3.5" /> Receipt
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReorder(ord)}
                              className="rounded-xl text-xs font-bold bg-[#1C1817] text-white hover:bg-[#2A1D20]"
                            >
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Re-order
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                      <p className="text-sm font-bold text-[#1C1817] dark:text-stone-100">No matching orders found</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {orderFilter !== 'all' ? 'Try selecting "All Orders".' : 'You have not placed any orders yet.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="flex items-end justify-between gap-4 border-b border-[#F0E4DC] pb-4 dark:border-[#2C2426]">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">Notifications</h2>
                    <p className="mt-1 text-xs text-stone-500">Updates about your orders and deliveries.</p>
                  </div>
                  {unreadCustomerNotifications > 0 && (
                    <button
                      type="button"
                      onClick={() => markCustomerNotificationsReviewed(customerNotifications.map(notification => notification.id))}
                      className="text-xs font-bold text-[#C86D51] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {customerNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {customerNotifications.map(notification => {
                      const isUnread = !notification.serverRead && !reviewedNotifications.includes(notification.id);
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => markCustomerNotificationsReviewed(Array.from(new Set([...reviewedNotifications, notification.id])))}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${isUnread ? 'border-[#C86D51]/40 bg-[#FCF4F0] dark:bg-[#2A2024]' : 'border-[#F0E4DC] bg-white dark:border-[#2C2426] dark:bg-[#1C1719]'}`}
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C86D51]/10 text-[#C86D51]">
                            <Bell className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-bold text-[#1C1817] dark:text-stone-100">
                              Order update
                              {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#C86D51]" />}
                            </span>
                            <span className="mt-1 block text-xs text-stone-600 dark:text-stone-400">{notification.message}</span>
                            <span className="mt-2 block text-[10px] text-stone-400">Updated {new Date(notification.timestamp).toLocaleString()}</span>
                          </span>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-stone-400" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#F0E4DC] bg-white p-10 text-center dark:border-[#2C2426] dark:bg-[#1C1719]">
                    <Bell className="mx-auto h-7 w-7 text-stone-400" />
                    <p className="mt-3 text-sm font-bold text-[#1C1817] dark:text-stone-100">No notifications yet</p>
                    <p className="mt-1 text-xs text-stone-500">Order updates will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">Saved Addresses</h2>
                    <p className="text-xs text-stone-500">Saved delivery locations for checkout.</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={openCreateAddress}
                    className="rounded-xl text-xs font-bold bg-[#C86D51] text-white hover:bg-[#8A3D52]"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Address
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {user?.savedAddresses && user.savedAddresses.length > 0 ? (
                    user.savedAddresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`relative flex flex-col justify-between rounded-3xl border p-5 transition shadow-sm ${
                          addr.isDefault
                            ? 'border-[#C86D51] bg-[#FFFBF9] dark:bg-[#251D20]'
                            : 'border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase">
                                {addr.tag || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-md bg-[#C86D51] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditAddress(addr, idx)}
                                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700"
                                title="Edit Address"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to remove this address?')) {
                                    void removeAddress(idx);
                                  }
                                }}
                                className="rounded-lg p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete Address"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-black text-[#1C1817] dark:text-stone-100">{addr.fullName}</h4>
                          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                            {addr.area}, {addr.city}
                          </p>
                          {addr.landmarkOrGps && (
                            <p className="text-[11px] text-stone-500">
                              <strong>Landmark / GPS:</strong> {addr.landmarkOrGps}
                            </p>
                          )}
                          <p className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-[#C86D51]" /> {addr.phone}
                            {addr.altPhone && <span className="text-stone-400">• {addr.altPhone}</span>}
                          </p>
                          {addr.deliveryNotes && (
                            <p className="text-[11px] text-stone-500 italic bg-white/70 dark:bg-black/20 p-2 rounded-xl">
                              &ldquo;{addr.deliveryNotes}&rdquo;
                            </p>
                          )}
                        </div>

                        {!addr.isDefault && (
                          <div className="mt-4 border-t border-[#F0E4DC] dark:border-[#2C2426] pt-3">
                            <button
                              onClick={() => void setDefaultAddress(idx)}
                              className="text-xs font-bold text-[#C86D51] hover:underline"
                            >
                              Make Default Address
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-12 text-center">
                      <MapPin className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                      <p className="text-sm font-bold text-[#1C1817] dark:text-stone-100">No addresses saved yet</p>
                      <p className="mt-1 text-xs text-stone-500">
                        Add a delivery address to pre-fill your checkout details.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={openCreateAddress}
                        className="mt-4 rounded-xl text-xs font-bold bg-[#C86D51] text-white"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Address
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">Saved Wishlist</h2>
                  <p className="text-xs text-stone-500">Items you have saved for later.</p>
                </div>

                {wishlistedProducts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] shadow-sm transition hover:border-[#C86D51]"
                      >
                        <div className="relative aspect-square overflow-hidden bg-stone-100">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-500 shadow hover:bg-white"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-[10px] font-extrabold uppercase text-[#C86D51]">{p.brand}</p>
                          <Link to={`/product/${p.id}`} className="block font-bold text-xs hover:text-[#C86D51] line-clamp-2">
                            {p.name}
                          </Link>
                          <p className="text-sm font-black text-[#1C1817] dark:text-stone-100">
                            GHS {Number(p.price).toFixed(2)}
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              await addToCart(p);
                              showAlert(`Added ${p.name} to cart!`, 'success');
                              setIsCartOpen(true);
                            }}
                            className="w-full rounded-xl text-xs font-bold bg-[#1C1817] text-white hover:bg-[#2A1D20]"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-12 text-center">
                    <Heart className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                    <p className="text-sm font-bold text-[#1C1817] dark:text-stone-100">Your wishlist is empty</p>
                    <p className="mt-1 text-xs text-stone-500">Tap the heart icon on any product in the store to save it here.</p>
                    <Link to="/shop" className="mt-4 inline-block">
                      <Button variant="primary" size="sm" className="rounded-xl text-xs bg-[#1C1817] text-white">
                        Browse Store
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">Product Reviews</h2>
                  <p className="text-xs text-stone-500">Rate and review products you have purchased.</p>
                </div>

                {/* Items from completed orders awaiting review */}
                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-3">
                    <h3 className="text-sm font-black text-[#1C1817] dark:text-stone-100">
                      Purchased Items to Review ({itemsToReview.length})
                    </h3>
                  </div>

                  {itemsToReview.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {itemsToReview.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] p-3.5 bg-[#FCF9F7] dark:bg-[#241D20]"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || logoImg}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover border"
                            />
                            <div>
                              <p className="text-[10px] font-bold text-[#C86D51] uppercase">{product.brand}</p>
                              <p className="text-xs font-bold text-[#1C1817] dark:text-stone-100 line-clamp-1">
                                {product.name}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setReviewModalProduct(product)}
                            className="rounded-xl text-xs font-bold bg-[#C86D51] text-white"
                          >
                            <Star className="mr-1 h-3.5 w-3.5" /> Rate
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">
                      {purchasedProducts.length === 0
                        ? 'Products you order will appear here so you can review them.'
                        : 'You have submitted reviews for all your purchased products.'}
                    </p>
                  )}
                </div>

                {/* Submitted Reviews */}
                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#1C1817] dark:text-stone-100 border-b border-[#F0E4DC] dark:border-[#2C2426] pb-3">
                    My Submitted Reviews ({userReviews.length})
                  </h3>

                  {userReviews.length > 0 ? (
                    <div className="space-y-3">
                      {userReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] p-4 bg-[#FCF9F7] dark:bg-[#241D20] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                                />
                              ))}
                              {rev.skinType && (
                                <span className="ml-2 rounded bg-stone-200 dark:bg-stone-700 px-1.5 py-0.2 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                                  Skin: {rev.skinType}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>

                          {rev.title && (
                            <h4 className="text-xs font-bold text-[#1C1817] dark:text-stone-100">{rev.title}</h4>
                          )}
                          <p className="text-xs text-stone-600 dark:text-stone-300">{rev.comment}</p>

                          {rev.adminReply && (
                            <div className="rounded-xl bg-white dark:bg-[#1C1719] p-3 border border-[#F0E4DC] text-xs">
                              <p className="font-bold text-[#C86D51]">Reply from store:</p>
                              <p className="text-stone-600 dark:text-stone-300 mt-0.5">{rev.adminReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">No submitted reviews yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE & SECURITY */}
            {activeTab === 'security' && user && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-4">
                    <div>
                      <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">Personal Details</h3>
                      <p className="text-xs text-stone-500">Your customer name, phone, and email.</p>
                    </div>
                    {!isEditingProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                        className="rounded-xl text-xs font-bold"
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5 text-[#C86D51]" /> Edit Details
                      </Button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
                      <div className="rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-4">
                        <p className="text-stone-500 font-semibold mb-1">Full Name</p>
                        <p className="text-sm font-black text-[#1C1817] dark:text-stone-100">{user.fullName}</p>
                      </div>

                      <div className="rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-4">
                        <p className="text-stone-500 font-semibold mb-1">Phone Number</p>
                        <p className="text-sm font-black text-[#1C1817] dark:text-stone-100">
                          {user.phone || 'Not provided'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-4 sm:col-span-2">
                        <p className="text-stone-500 font-semibold mb-1">Email Address</p>
                        <p className="text-sm font-black text-[#1C1817] dark:text-stone-100">{user.email}</p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Account email linked to your orders.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                      <div>
                        <p className="mb-1.5 text-xs font-bold text-[#1C1817] dark:text-stone-100">Profile picture</p>
                        <div className="flex items-center gap-4">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#C86D51] to-[#A94C63] text-2xl font-black text-white">
                            {profileForm.profileImage ? <img src={profileForm.profileImage} alt="Profile preview" className="h-full w-full object-cover" /> : (profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div className="space-y-2">
                            <input ref={profileImageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => handleProfileImageUpload(event.target.files?.[0])} className="block w-full max-w-xs text-xs text-stone-500 file:mr-2 file:rounded-lg file:border-0 file:bg-[#1C1817] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
                            <p className="text-[10px] text-stone-400">JPG, PNG, WEBP, or GIF up to 5MB.</p>
                            {profileForm.profileImage && <button type="button" onClick={() => { setProfileForm(previous => ({ ...previous, profileImage: '' })); if (profileImageInputRef.current) profileImageInputRef.current.value = ''; }} className="text-xs font-semibold text-rose-600 hover:underline">Remove picture</button>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#1C1817] dark:text-stone-100 block mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#1C1817] dark:text-stone-100 block mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="rounded-xl text-xs font-bold bg-[#C86D51] text-white hover:bg-[#8A3D52]"
                        >
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingProfile(false)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Password Section */}
                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                  <div className="border-b border-[#F0E4DC] dark:border-[#2C2426] pb-4">
                    <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">
                      {user.hasPassword ? 'Change Password' : 'Set Account Password'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {user.hasPassword
                        ? 'Update your password.'
                        : 'Set a password to sign in directly with email.'}
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="mt-4 max-w-md space-y-4">
                    {user.hasPassword && (
                      <div>
                        <label className="text-xs font-bold text-[#1C1817] dark:text-stone-100 block mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswordFields ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                          >
                            {showPasswordFields ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-[#1C1817] dark:text-stone-100 block mb-1.5">
                        New Password (min 8 characters)
                      </label>
                      <input
                        type={showPasswordFields ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1C1817] dark:text-stone-100 block mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type={showPasswordFields ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isChangingPassword}
                      className="rounded-xl text-xs font-bold bg-[#1C1817] text-white hover:bg-[#2A1D20]"
                    >
                      {isChangingPassword ? 'Saving...' : user.hasPassword ? 'Update Password' : 'Set Password'}
                    </Button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="rounded-3xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20 p-6">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <h3 className="text-base font-black text-red-900 dark:text-red-300">Delete Account</h3>
                  </div>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                    Deactivating your account will remove your saved addresses and profile.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {/* PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#1C1817] dark:text-stone-100">Preferences</h2>
                  <p className="text-xs text-stone-500">Configure theme and notifications.</p>
                </div>

                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[#1C1817] dark:text-stone-100">Store Theme</h4>
                      <p className="text-xs text-stone-500">Select light or dark mode.</p>
                    </div>
                    <div className="flex rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FCF9F7] dark:bg-[#241D20] p-1">
                      {(['light', 'dark'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setTheme(opt)}
                          className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition ${
                            theme === opt
                              ? 'bg-[#C86D51] text-white shadow-sm'
                              : 'text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-4">
                    <div>
                      <h4 className="text-sm font-black text-[#1C1817] dark:text-stone-100">Order Delivery Updates</h4>
                      <p className="text-xs text-stone-500">SMS / WhatsApp dispatch alerts for your orders.</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={orderNotifications}
                      onClick={() => {
                        const val = !orderNotifications;
                        setOrderNotifications(val);
                        localStorage.setItem('cr_order_notifications', String(val));
                      }}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${orderNotifications ? 'bg-[#C86D51]' : 'bg-stone-300'}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${orderNotifications ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="text-sm font-black text-[#1C1817] dark:text-stone-100">Store Promotions</h4>
                      <p className="text-xs text-stone-500">Notifications regarding discounts and new arrivals.</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={promoAlerts}
                      onClick={() => {
                        const val = !promoAlerts;
                        setPromoAlerts(val);
                        localStorage.setItem('cr_promo_alerts', String(val));
                      }}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${promoAlerts ? 'bg-[#C86D51]' : 'bg-stone-300'}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${promoAlerts ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* DIGITAL INVOICE MODAL */}
      {viewingInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1C1719] p-6 sm:p-8 shadow-2xl border border-[#F0E4DC] dark:border-[#2C2426] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-4">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="CR" className="h-10 w-10 rounded-xl object-contain border p-1" />
                <div>
                  <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">CR COSMETICS AND ESSENTIALS</h3>
                  <p className="text-[10px] text-stone-500">Customer Order Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setViewingInvoiceOrder(null)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-stone-50 dark:bg-[#241D20] p-4 space-y-1">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Order Details</p>
                <p className="font-black text-sm text-[#1C1817] dark:text-stone-100">#{viewingInvoiceOrder.orderNumber}</p>
                <p className="text-stone-500">Date: {viewingInvoiceOrder.createdAt ? new Date(viewingInvoiceOrder.createdAt).toLocaleDateString() : 'Recent'}</p>
                <p className="text-stone-500">Payment: <strong className="uppercase">{viewingInvoiceOrder.paymentMethod}</strong> ({viewingInvoiceOrder.paymentStatus})</p>
                {viewingInvoiceOrder.paymentReference && (
                  <p className="text-stone-500 font-mono text-[10px]">Ref: {viewingInvoiceOrder.paymentReference}</p>
                )}
              </div>

              <div className="rounded-2xl bg-stone-50 dark:bg-[#241D20] p-4 space-y-1">
                <p className="text-stone-400 font-bold uppercase text-[10px]">Shipping Destination</p>
                <p className="font-bold text-sm text-[#1C1817] dark:text-stone-100">{viewingInvoiceOrder.shippingAddress?.fullName}</p>
                <p className="text-stone-500">{viewingInvoiceOrder.shippingAddress?.area}, {viewingInvoiceOrder.shippingAddress?.city}</p>
                <p className="text-stone-500">{viewingInvoiceOrder.shippingAddress?.phone}</p>
                <p className="text-[10px] text-[#C86D51] font-bold uppercase">{viewingInvoiceOrder.deliveryMethod}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF3F0] dark:bg-[#241D20] text-[10px] font-bold uppercase text-stone-500">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4DC] dark:divide-[#2C2426]">
                  {viewingInvoiceOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <p className="font-bold text-[#1C1817] dark:text-stone-100">{item.product?.name}</p>
                        <p className="text-[10px] text-stone-400">{item.product?.brand}</p>
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">GHS {Number(item.selectedVariant?.price || item.product?.price || 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-black">GHS {(Number(item.selectedVariant?.price || item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span className="font-bold">GHS {Number(viewingInvoiceOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery Fee:</span>
                  <span className="font-bold">GHS {Number(viewingInvoiceOrder.shippingFee).toFixed(2)}</span>
                </div>
                {Number(viewingInvoiceOrder.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>- GHS {Number(viewingInvoiceOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#F0E4DC] dark:border-[#2C2426] pt-2 text-sm font-black text-[#1C1817] dark:text-stone-100">
                  <span>Total:</span>
                  <span className="text-[#C86D51]">GHS {Number(viewingInvoiceOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#F0E4DC] dark:border-[#2C2426]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="flex-1 rounded-xl text-xs font-bold bg-[#1C1817] text-white"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingInvoiceOrder(null)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION MODAL */}
      {reviewModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1C1719] p-6 shadow-2xl border border-[#F0E4DC] dark:border-[#2C2426] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-3">
              <div className="flex items-center gap-2 text-[#C86D51]">
                <Star className="h-5 w-5" />
                <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">Write a Review</h3>
              </div>
              <button
                onClick={() => setReviewModalProduct(null)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#FCF9F7] dark:bg-[#241D20] p-3">
              <img src={reviewModalProduct.image} alt="" className="h-12 w-12 rounded-xl object-cover border" />
              <div>
                <p className="text-[10px] font-bold uppercase text-[#C86D51]">{reviewModalProduct.brand}</p>
                <p className="text-xs font-bold text-[#1C1817] dark:text-stone-100 line-clamp-1">{reviewModalProduct.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-2">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review title"
                  className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs outline-none focus:border-[#C86D51]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Your Skin Type</label>
                <select
                  value={reviewSkinType}
                  onChange={(e) => setReviewSkinType(e.target.value)}
                  className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs outline-none focus:border-[#C86D51]"
                >
                  <option value="Dry">Dry Skin</option>
                  <option value="Oily">Oily Skin</option>
                  <option value="Combination">Combination Skin</option>
                  <option value="Sensitive">Sensitive Skin</option>
                  <option value="Normal">Normal Skin</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs outline-none focus:border-[#C86D51] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingReview}
                  className="flex-1 rounded-xl text-xs font-bold bg-[#C86D51] text-white hover:bg-[#8A3D52]"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewModalProduct(null)}
                  className="rounded-xl px-4 text-xs font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1C1719] p-6 shadow-2xl border border-[#F0E4DC] dark:border-[#2C2426] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0E4DC] dark:border-[#2C2426] pb-3">
              <div className="flex items-center gap-2 text-[#C86D51]">
                <MapPin className="h-5 w-5" />
                <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">
                  {editingAddressIndex !== null ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                    placeholder="024 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">Alt Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.altPhone || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, altPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                    placeholder="Backup phone"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">Address Label</label>
                  <select
                    value={addressForm.tag || 'Home'}
                    onChange={(e) => setAddressForm({ ...addressForm, tag: e.target.value as any })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work / Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                    placeholder="Accra, Tema, Kumasi..."
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                    placeholder="East Legon, Osu, Airport..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">
                  GhanaPost Digital Address or Landmark
                </label>
                <input
                  type="text"
                  value={addressForm.landmarkOrGps || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, landmarkOrGps: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51]"
                  placeholder="e.g. GA-123-4567 or near landmark"
                />
              </div>

              <div>
                <label className="font-bold text-[#1C1817] dark:text-stone-100 block mb-1">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={addressForm.deliveryNotes || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryNotes: e.target.value })}
                  className="w-full rounded-xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0] dark:bg-[#241D20] p-3 text-xs text-[#1C1817] dark:text-stone-100 outline-none focus:border-[#C86D51] h-20 resize-none"
                  placeholder="Gate instructions or specific directions"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddrCheck"
                  checked={Boolean(addressForm.isDefault)}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-[#C86D51] focus:ring-[#C86D51]"
                />
                <label htmlFor="defaultAddrCheck" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wider bg-[#C86D51] text-white hover:bg-[#8A3D52]"
                >
                  {editingAddressIndex !== null ? 'Update Address' : 'Save Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-xl px-4 text-xs font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1C1719] p-6 shadow-2xl border border-red-200 dark:border-red-950 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-base font-black text-[#1C1817] dark:text-stone-100">Delete Account Confirmation</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              This action is permanent. Your saved addresses and profile will be deleted.
              Type <strong className="text-red-600">DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full rounded-xl border border-red-300 bg-red-50/50 dark:bg-red-950/30 p-3 text-xs text-red-900 dark:text-red-200 outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Permanently Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
