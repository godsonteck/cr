import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
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
  CheckCheck,
  Bell,
  BellRing,
  Camera,
  ImagePlus,
  Sliders,
  Volume2,
  Info,
  MessageCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button, Badge } from '../common/UIPrimitives';
import { ShippingAddress, Order, OrderStatus, Product, AdminNotification } from '../../types';
import logoImg from '../../assets/logo.jpeg';
import { api } from '../../lib/api';
import { SettingsView } from './SettingsView';
import {
  ORDER_STAGES,
  STATUS_INDEX,
  STATUS_MESSAGE,
  OrderProgressTracker,
  DeliveryTimeline,
  OrderStatusHero,
} from './OrderTrackingComponents';

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
        width: Math.min(360, buttonRef.current.clientWidth || 360),
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
  return <div ref={buttonRef} className="flex min-h-10 w-full min-w-0 max-w-full justify-center overflow-hidden [&>div]:max-w-full [&_iframe]:max-w-full" />;
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
              alt={storeSettings.storeName}
              className="h-11 w-11 rounded-full border border-[var(--border-color)] bg-white p-1 object-contain"
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
        navigate('/');
    } catch (error: any) {
      showAlert(error?.message || 'Google sign-in failed. Please try again.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
        navigate('/');
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
                  href={`https://wa.me/${String(storePhoneOrWhatsApp).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${String(storeSettings?.storeName || 'Store')}, I need assistance accessing my account.`)}`}
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
  const { storeSettings } = useStore();
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
        navigate('/');
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
        navigate('/');
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
                  <p className="text-sm text-[var(--text-muted)]">Join {storeSettings.storeName} for faster checkouts, order tracking, and account management.</p>
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

const SettingsToggle: React.FC<{ checked: boolean; onChange: () => void; label: string; description: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] py-4 last:border-b-0">
    <div>
      <h3 className="text-sm font-bold text-[var(--text-primary)]">{label}</h3>
      <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[var(--bg-main)] px-3 py-6 pb-28 sm:px-6 lg:px-8 transition-colors">
      <SettingsView standalone={true} />
    </div>
  );
};

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
  const {
    notifications: customerNotifications,
    unreadCount: unreadCustomerNotifications,
    markAsRead: markCustomerNotificationRead,
    markAllAsRead: markAllCustomerNotificationsRead,
    deleteNotification: deleteCustomerNotification,
    clearAllRead: clearAllReadCustomerNotifications,
    clearAll: clearAllCustomerNotifications,
    preferences: notificationPreferences,
    updatePreference: updateNotificationPreference,
    playNotificationSound,
    requestBrowserPermission,
  } = useNotifications();

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'order' | 'promo'>('all');
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);

  const filteredCustomerNotifications = useMemo(() => {
    switch (notificationFilter) {
      case 'unread':
        return customerNotifications.filter(n => !n.read);
      case 'order':
        return customerNotifications.filter(n => n.type === 'order' || n.type === 'delivery');
      case 'promo':
        return customerNotifications.filter(n => n.type === 'promo');
      case 'all':
      default:
        return customerNotifications;
    }
  }, [customerNotifications, notificationFilter]);

  const orderAlertsCount = useMemo(() => customerNotifications.filter(n => n.type === 'order' || n.type === 'delivery').length, [customerNotifications]);
  const promoAlertsCount = useMemo(() => customerNotifications.filter(n => n.type === 'promo').length, [customerNotifications]);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');

  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get('tab');
    const accountTabs: AccountTab[] = ['overview', 'orders', 'notifications', 'addresses', 'wishlist', 'reviews', 'security', 'preferences'];
    if (requestedTab && accountTabs.includes(requestedTab as AccountTab)) {
      setActiveTab(requestedTab as AccountTab);
    }
  }, [location.search]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    skinType: (user?.skinProfile?.skinType || 'Normal') as 'Dry' | 'Oily' | 'Combination' | 'Sensitive' | 'Normal',
    concerns: (user?.skinProfile?.concerns || []) as string[],
  });
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [jumiaExpandedSection, setJumiaExpandedSection] = useState<'profile' | 'security' | 'skin' | 'addresses' | null>(null);

  useEffect(() => {
    if (jumiaExpandedSection === 'profile') {
      setTimeout(() => {
        const el = document.getElementById('customer-profile-editor');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [jumiaExpandedSection]);

  // Customer VIP and Standing Status (derived to match Admin system metrics)
  const customerStats = useMemo(() => {
    const allUserOrders = Array.isArray(user?.orders) ? user.orders : (Array.isArray(remoteOrders) ? remoteOrders : []);
    const totalSpent = allUserOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
    const count = allUserOrders.length;
    let segment = 'Verified Customer';
    if (totalSpent >= 500) segment = 'VIP Top Spender';
    else if (count > 1) segment = 'Returning Customer';
    return {
      totalSpent,
      ordersCount: count,
      segment,
    };
  }, [user?.orders, remoteOrders]);

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
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // Account Deletion Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Order Filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Notification tracking state
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
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        skinType: (user.skinProfile?.skinType || 'Normal') as any,
        concerns: Array.isArray(user.skinProfile?.concerns) ? user.skinProfile.concerns : [],
      });
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

  const markCustomerNotificationsReviewed = (ids: string[]) => {
    ids.forEach(id => { void markCustomerNotificationRead(id); });
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

  // Update profile in live DB & sync with admin system
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        profileImage: profileForm.profileImage,
        skinProfile: {
          skinType: profileForm.skinType as any,
          concerns: profileForm.concerns,
        },
      });
      showAlert('Profile details updated successfully', 'success');
      setIsEditingProfile(false);
    } catch (error: any) {
      showAlert(error?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
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

  // Photo upload handler for review
  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 4) {
      showAlert('You can upload a maximum of 4 photos per review.', 'error');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        showAlert('Please choose JPG, PNG, or WEBP images only.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Photos must be under 5MB each.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = String(event.target?.result || '');
        if (result) {
          setReviewImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveReviewPhoto = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit verified review to live database
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProduct) return;
    setIsSubmittingReview(true);
    const prodId = reviewModalProduct.id;
    try {
      const result: any = await api.post('/reviews', {
        productId: prodId,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        skinType: reviewSkinType,
        images: reviewImages,
      });
      showAlert('Review submitted successfully! Thank you for your feedback.', 'success');
      setReviewModalProduct(null);
      setReviewComment('');
      setReviewTitle('');
      setReviewImages([]);
      void loadUserReviews();

      // Dispatch realtime event for store and all open tabs
      const detail = {
        type: 'REVIEW_ADDED',
        productId: prodId,
        rating: result?.productRating,
        reviewCount: result?.productReviewCount,
      };
      window.dispatchEvent(new CustomEvent('cr_review_added', { detail }));
      try {
        const ch = new BroadcastChannel('cr_reviews_channel');
        ch.postMessage(detail);
        ch.close();
      } catch {}
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
    <div className="account-page min-h-[calc(100vh-4.5rem)] overflow-x-hidden bg-[var(--bg-main)] py-4 sm:py-8 font-sans">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-3 sm:px-6 lg:px-8">
        {/* Mobile-First Profile Header Card */}
        <div className="relative mb-4 border-b border-[var(--border-color)] pb-4 sm:mb-6 sm:pb-6">
          <div className="relative z-10 flex min-w-0 flex-col gap-4 sm:gap-5">
            {/* Top row: Avatar + Identity + Quick Actions */}
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                {/* Avatar Frame */}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--accent)] text-white sm:h-14 sm:w-14">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.fullName}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-xl sm:text-3xl font-bold text-white tracking-wide">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  {/* Verified Badge */}
                  <div 
                    title="Verified Customer"
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text-primary)] text-amber-400 ring-2 ring-[var(--bg-main)]"
                  >
                    <Sparkles className="h-3 w-3 fill-amber-400" />
                  </div>
                </div>

                {/* Name, Status & Contact */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="truncate font-serif text-base sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      {user?.fullName || 'My Account'}
                    </h1>
                    <span className="hidden xs:inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                    {user?.email}
                  </p>
                  {user?.phone && (
                    <p className="truncate text-[11px] text-[var(--text-subtle)]">
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('security');
                    setJumiaExpandedSection('profile');
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-subtle)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--accent)]"
                  title="Edit Profile"
                  aria-label="Edit Profile"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <Link to="/shop" className="hidden sm:inline-flex">
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-soft)] transition">
                    <ShoppingBag className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>Shop</span>
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 sm:flex-none"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            </div>

            {/* KPI Chips Grid (Touch-friendly 4-stat row) */}
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-color)]/70 pt-3 sm:grid-cols-4 sm:gap-3 sm:pt-4">
              {[
                { id: 'orders' as const, label: 'Orders', count: allOrders.length, icon: Package },
                { id: 'orders' as const, label: 'In Transit', count: activeOrders.length, icon: Truck, isPing: activeOrders.length > 0 },
                { id: 'wishlist' as const, label: 'Wishlist', count: wishlistIds.length, icon: Heart },
                { id: 'addresses' as const, label: 'Addresses', count: user?.savedAddresses?.length || 0, icon: MapPin },
              ].map(({ id, label, count, icon: Icon, isPing }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveTab(id)}
                    className={`group flex flex-col items-center justify-center border-l border-[var(--border-color)] p-2 text-center transition-all first:border-l-0 sm:p-3 ${
                    activeTab === id && (label !== 'In Transit' || activeOrders.length > 0)
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-primary)] hover:text-[var(--accent)]'
                  }`}
                >
                  <div className="relative mb-1 flex h-6 w-6 items-center justify-center text-[var(--accent)]">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {isPing && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                      </span>
                    )}
                  </div>
                  <span className="font-serif text-sm sm:text-lg font-bold leading-none">
                    {count}
                  </span>
                  <span className="mt-0.5 text-[9px] sm:text-[10px] font-semibold text-[var(--text-subtle)] truncate max-w-full">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar (Desktop Only) + Screen Content */}
        <div className="grid min-w-0 gap-4 lg:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="order-1 h-fit border-b border-[var(--border-color)] pb-3 lg:border-b-0 lg:pb-0">
            <div className="flex items-center justify-between px-1 py-2 lg:px-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-subtle)]">Account</p>
              <Settings className="h-4 w-4 text-[var(--text-subtle)]" />
            </div>
            <nav className="grid grid-cols-2 gap-x-3 gap-y-1 lg:block lg:space-y-1">
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
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex min-h-10 w-full items-center justify-between border-b border-[var(--border-color)] px-1 py-2.5 text-left text-[11px] font-bold transition lg:rounded-lg lg:border-b-0 lg:px-3 lg:py-2.5 lg:text-xs ${
                      isActive
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-subtle)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="col-span-2 border-t border-[var(--border-color)] pt-2 lg:col-span-1 lg:pt-3">
              <Link
                to="/support"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] transition"
              >
                <Headphones className="h-4 w-4" /> Customer Support
              </Link>
            </div>
          </aside>

          <main className="order-2 min-w-0 max-w-full space-y-4 overflow-hidden sm:space-y-6">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Active in-transit Order */}
                {activeOrders.length > 0 && (
                  <OrderStatusHero
                    order={activeOrders[0]}
                    onViewDetails={() => setActiveTab('orders')}
                    onReceipt={() => setViewingInvoiceOrder(activeOrders[0])}
                  />
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
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-color)]">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Recent Orders</h3>
                      <p className="text-[11px] sm:text-xs text-[var(--text-subtle)]">Your latest purchases</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[var(--accent)]"
                    >
                      View All ({allOrders.length})
                    </Button>
                  </div>

                  <div className="mt-3.5 space-y-3 sm:space-y-4">
                    {allOrders.length > 0 ? (
                      allOrders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex flex-col gap-3 rounded-2xl border border-[var(--border-color)] p-3.5 sm:p-4 bg-[var(--bg-card)] sm:flex-row sm:items-center sm:justify-between transition hover:border-[var(--accent)]/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-soft)] text-[var(--accent)]">
                              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                  #{ord.orderNumber}
                                </p>
                                <Badge variant={ord.status === 'Delivered' ? 'botanical' : 'terracotta'} size="sm">
                                  {ord.status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                                {ord.items?.length || 0} item{(ord.items?.length || 0) > 1 ? 's' : ''} • GHS {Number(ord.total).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(ord)}
                              className="flex-1 sm:flex-initial rounded-xl text-xs font-bold justify-center"
                            >
                              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Re-order
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingInvoiceOrder(ord)}
                              className="flex-1 sm:flex-initial rounded-xl text-xs font-bold text-[var(--text-subtle)] hover:text-[var(--text-primary)] justify-center border border-[var(--border-color)] sm:border-0"
                            >
                              Receipt
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <ShoppingBag className="mx-auto h-10 w-10 text-[var(--text-subtle)]/40 mb-2" />
                        <p className="text-xs font-semibold text-[var(--text-subtle)]">No orders placed yet.</p>
                        <Link to="/shop" className="mt-3 inline-block">
                          <Button variant="primary" size="sm" className="rounded-xl text-xs bg-[var(--text-primary)] text-[var(--bg-card)]">
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
                      <article
                        key={ord.id}
                        className="rounded-3xl border border-[#F0E4DC] dark:border-[#2C2426] bg-white dark:bg-[#1C1719] overflow-hidden shadow-sm"
                        aria-label={`Order ${ord.orderNumber}`}
                      >
                        {/* ── Order header ── */}
                        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[#F0E4DC] dark:border-[#2C2426]">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
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
                              {ord.paymentStatus === 'paid' && (
                                <Badge variant="botanical" size="sm">Paid</Badge>
                              )}
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                              Placed {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })
                                : 'recently'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total</p>
                            <p className="text-xl font-black text-[#1C1817] dark:text-stone-100">
                              GHS {Number(ord.total).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* ── Status message ── */}
                        <div className="px-5 pt-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-1">Status</p>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{STATUS_MESSAGE[ord.status]}</p>
                          {ord.estimatedDeliveryTime && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-soft)] px-2.5 py-1">
                              <Clock className="h-3 w-3 text-[#C86D51]" aria-hidden="true" />
                              <span className="text-[11px] font-bold text-[#C86D51]">Est. {ord.estimatedDeliveryTime}</span>
                            </div>
                          )}
                        </div>

                        {/* ── Progress tracker ── */}
                        <div className="px-5 pt-4">
                          <OrderProgressTracker status={ord.status} />
                        </div>

                        {/* ── Rider info ── */}
                        {(ord.riderInfo?.riderName || ord.riderInfo?.riderPhone || ord.riderInfo?.riderLocation) && (
                          <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[var(--bg-soft)] p-3 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white dark:bg-[#1C1719] text-[#C86D51]">
                                <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="font-bold text-[var(--text-primary)]">
                                  {ord.riderInfo?.riderName || 'Assigned Courier'}
                                </p>
                                {ord.riderInfo?.riderLocation && (
                                  <p className="text-[10px] text-[var(--text-subtle)]">
                                    Near {ord.riderInfo.riderLocation}
                                    {ord.riderInfo.estimatedArrival ? ` · ETA ${ord.riderInfo.estimatedArrival}` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            {ord.riderInfo?.riderPhone && (
                              <a
                                href={`tel:${ord.riderInfo.riderPhone}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C86D51] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#8A3D52] transition"
                                aria-label={`Call rider ${ord.riderInfo.riderPhone}`}
                              >
                                <Phone className="h-3 w-3" aria-hidden="true" /> Call Rider
                              </a>
                            )}
                          </div>
                        )}

                        {/* ── Delivery Updates timeline ── */}
                        <div className="mx-5 mt-5 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[#FCF9F7] dark:bg-[#241D20] p-4">
                          <DeliveryTimeline order={ord} />
                        </div>

                        {/* ── Items ── */}
                        <div className="px-5 pt-5">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">Your Order</p>
                          <div className="space-y-3">
                            {ord.items && ord.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <img
                                  src={item.product?.image || logoImg}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoImg; }}
                                  alt={item.product?.name || 'Product'}
                                  className="h-13 w-13 rounded-xl object-cover border border-[#F0E4DC] dark:border-[#2C2426] shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#1C1817] dark:text-stone-100 leading-snug">
                                    {item.product?.name}
                                  </p>
                                  <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                                    Qty {item.quantity}
                                    {item.selectedVariant ? ` · ${item.selectedVariant.name}` : ''}
                                    {item.selectedOption && !item.selectedVariant ? ` · ${item.selectedOption}` : ''}
                                  </p>
                                </div>
                                <p className="text-sm font-black text-[#1C1817] dark:text-stone-100 shrink-0">
                                  GHS {(Number(item.selectedVariant?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Total line */}
                          <div className="mt-4 flex justify-between items-center border-t border-[#F0E4DC] dark:border-[#2C2426] pt-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-subtle)]">Total</span>
                            <span className="text-base font-black text-[#1C1817] dark:text-stone-100">
                              GHS {Number(ord.total).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* ── Destination ── */}
                        <div className="mx-5 mt-4 rounded-2xl border border-[#F0E4DC] dark:border-[#2C2426] bg-[var(--bg-soft)] p-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-2">Delivering To</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#C86D51] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">
                                {ord.shippingAddress?.fullName}
                              </p>
                              <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                                {ord.shippingAddress?.area}{ord.shippingAddress?.city ? `, ${ord.shippingAddress.city}` : ''}
                                {ord.shippingAddress?.region ? `, ${ord.shippingAddress.region}` : ''}
                              </p>
                              {ord.shippingAddress?.landmarkOrGps && (
                                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                                  {ord.shippingAddress.landmarkOrGps}
                                </p>
                              )}
                              {ord.shippingAddress?.phone && (
                                <a
                                  href={`tel:${ord.shippingAddress.phone}`}
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C86D51] hover:underline"
                                >
                                  <Phone className="h-3 w-3" aria-hidden="true" />
                                  {ord.shippingAddress.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#F0E4DC] dark:border-[#2C2426] mt-5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingInvoiceOrder(ord)}
                            className="rounded-xl text-xs font-bold"
                            aria-label={`View receipt for order ${ord.orderNumber}`}
                          >
                            <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Receipt
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReorder(ord)}
                            className="rounded-xl text-xs font-bold bg-[#1C1817] dark:bg-[var(--accent)] text-white hover:opacity-90"
                            aria-label={`Re-order items from order ${ord.orderNumber}`}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Re-order
                          </Button>
                        </div>
                      </article>
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

            {/* NOTIFICATIONS & ALERTS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Header with Title, Unread Count & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-[var(--text-primary)]">Notifications &amp; Alerts</h2>
                      {unreadCustomerNotifications > 0 && (
                        <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-extrabold text-white">
                          {unreadCustomerNotifications} new
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Real-time updates on your order dispatches, exclusive offers, and announcements.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {unreadCustomerNotifications > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void markAllCustomerNotificationsRead()}
                        className="rounded-xl text-xs font-bold gap-1.5"
                      >
                        <CheckCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span>Mark All Read</span>
                      </Button>
                    )}

                    {customerNotifications.some(n => n.read) && (
                      <button
                        type="button"
                        onClick={() => void clearAllReadCustomerNotifications()}
                        className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--text-subtle)] hover:text-rose-600 transition"
                      >
                        Clear Read
                      </button>
                    )}

                    {customerNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => void clearAllCustomerNotifications()}
                        className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--text-subtle)] hover:text-rose-600 transition"
                      >
                        Clear All
                      </button>
                    )}

                    <Button
                      variant={showNotificationPreferences ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setShowNotificationPreferences(prev => !prev)}
                      className="rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Preferences</span>
                    </Button>
                  </div>
                </div>

                {/* Preferences Drawer */}
                {showNotificationPreferences && (
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-primary)]">
                          Notification Preferences
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)]">Customize which alerts and sounds you want to receive.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotificationPreferences(false)}
                        className="rounded-lg p-1 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
                        aria-label="Close preferences"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      {/* Order & Delivery */}
                      <label className="flex items-center justify-between cursor-pointer rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)]">
                        <div className="flex items-center gap-2.5">
                          <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="font-bold text-[var(--text-primary)]">Order &amp; Delivery Updates</p>
                            <p className="text-[10px] text-[var(--text-subtle)]">Packaging, dispatch, and delivery progress.</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.orderUpdates}
                          onChange={e => updateNotificationPreference('orderUpdates', e.target.checked)}
                          className="h-4 w-4 accent-[var(--accent)] rounded"
                        />
                      </label>

                      {/* Promos */}
                      <label className="flex items-center justify-between cursor-pointer rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)]">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-rose-500" />
                          <div>
                            <p className="font-bold text-[var(--text-primary)]">Promos &amp; Flash Deals</p>
                            <p className="text-[10px] text-[var(--text-subtle)]">Exclusive voucher codes and discount alerts.</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.promoAlerts}
                          onChange={e => updateNotificationPreference('promoAlerts', e.target.checked)}
                          className="h-4 w-4 accent-[var(--accent)] rounded"
                        />
                      </label>

                      {/* Sound */}
                      <div className="flex items-center justify-between rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)]">
                        <div className="flex items-center gap-2.5">
                          <Volume2 className="h-4 w-4 text-[var(--accent)]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[var(--text-primary)]">Sound Alerts</p>
                              <button
                                type="button"
                                onClick={() => playNotificationSound()}
                                className="inline-flex items-center gap-1 rounded bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition"
                              >
                                Test chime
                              </button>
                            </div>
                            <p className="text-[10px] text-[var(--text-subtle)]">Pleasant dual-tone chime sound.</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.soundEnabled}
                          onChange={e => updateNotificationPreference('soundEnabled', e.target.checked)}
                          className="h-4 w-4 accent-[var(--accent)] rounded"
                        />
                      </div>

                      {/* Browser Push */}
                      <div className="flex items-center justify-between rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)]">
                        <div className="flex items-center gap-2.5">
                          <BellRing className="h-4 w-4 text-sky-500" />
                          <div>
                            <p className="font-bold text-[var(--text-primary)]">Browser Notifications</p>
                            <p className="text-[10px] text-[var(--text-subtle)]">Get alerted even when this tab is in background.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void requestBrowserPermission()}
                          className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 transition"
                        >
                          {notificationPreferences.browserNotifications ? 'Enabled' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter Pills Bar */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {(
                    [
                      { id: 'all', label: 'All Alerts', count: customerNotifications.length },
                      { id: 'unread', label: 'Unread', count: unreadCustomerNotifications },
                      { id: 'order', label: 'Orders & Shipping', count: orderAlertsCount },
                      { id: 'promo', label: 'Offers & Promos', count: promoAlertsCount },
                    ] as const
                  ).map(pill => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setNotificationFilter(pill.id)}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold transition sm:flex-none sm:rounded-full sm:px-3.5 sm:py-1.5 sm:text-xs ${
                        notificationFilter === pill.id
                          ? 'bg-[var(--accent)] text-white shadow-xs'
                          : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        notificationFilter === pill.id
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--bg-soft)] text-[var(--text-subtle)]'
                      }`}>
                        {pill.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Notifications Cards Feed */}
                {filteredCustomerNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCustomerNotifications.map(notification => {
                      const isUnread = !notification.read;

                      const getCategoryConfig = () => {
                        switch (notification.type) {
                          case 'order':
                            return {
                              icon: <Package className="h-4 w-4" />,
                              badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                              label: 'Order',
                            };
                          case 'delivery':
                            return {
                              icon: <Truck className="h-4 w-4" />,
                              badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                              label: 'Delivery',
                            };
                          case 'promo':
                            return {
                              icon: <Sparkles className="h-4 w-4" />,
                              badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
                              label: 'Promo',
                            };
                          case 'system':
                          default:
                            return {
                              icon: <Info className="h-4 w-4" />,
                              badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
                              label: 'Store',
                            };
                        }
                      };

                      const category = getCategoryConfig();

                      return (
                        <div
                          key={notification.id}
                          className={`group relative flex items-start gap-3.5 sm:gap-4 rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                            isUnread
                              ? 'border-l-4 border-l-[var(--accent)] border-[var(--border-color)] bg-[var(--accent)]/[0.03] hover:bg-[var(--accent)]/[0.06]'
                              : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-soft)]/50'
                          }`}
                        >
                          {/* Category Icon Badge */}
                          <div className="relative shrink-0 mt-0.5">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.badgeClass}`}>
                              {category.icon}
                            </span>
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-card)] shadow-xs" />
                            )}
                          </div>

                          {/* Content Body */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                                  {category.label}
                                </span>
                                <h4 className={`text-sm ${isUnread ? 'font-black text-[var(--text-primary)]' : 'font-semibold text-[var(--text-muted)]'}`}>
                                  {notification.title}
                                </h4>
                              </div>
                              <span className="text-[11px] text-[var(--text-subtle)]">
                                {new Date(notification.timestamp).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                              {notification.message}
                            </p>

                            {/* Action Buttons Row */}
                            <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                              {notification.orderNumber && (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('orders')}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition"
                                >
                                  <Package className="h-3.5 w-3.5" />
                                  <span>View Order #{notification.orderNumber}</span>
                                </button>
                              )}

                              {notification.actionUrl && (
                                <Link
                                  to={notification.actionUrl}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
                                >
                                  <span>Open Link</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions (Read/Delete) */}
                          <div className="shrink-0 flex items-center gap-1 self-start opacity-70 group-hover:opacity-100 transition-opacity">
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => void markCustomerNotificationRead(notification.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition"
                                title="Mark as read"
                                aria-label="Mark as read"
                              >
                                <CheckCheck className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => void deleteCustomerNotification(notification.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-rose-500/10 hover:text-rose-600 transition"
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-soft)] text-[var(--text-subtle)] mb-3.5">
                      <Bell className="h-6 w-6 opacity-40" />
                    </div>
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {notificationFilter === 'unread' ? 'No unread notifications' : 'No notifications in this category'}
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                      {notificationFilter === 'unread'
                        ? 'All caught up! Any new order updates or store offers will appear right here.'
                        : 'Updates will appear as soon as your orders are placed or special deals go live.'}
                    </p>
                    {notificationFilter !== 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotificationFilter('all')}
                        className="mt-4 rounded-xl text-xs font-bold"
                      >
                        Show All Notifications
                      </Button>
                    )}
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
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs transition hover:border-[var(--accent)]"
                      >
                        <div className="relative aspect-square overflow-hidden bg-[var(--bg-soft)]">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-rose-500 shadow-sm hover:bg-white transition"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
                          <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[var(--accent)]">{p.brand}</p>
                          <Link to={`/product/${p.id}`} className="block font-bold text-xs hover:text-[var(--accent)] line-clamp-1 sm:line-clamp-2">
                            {p.name}
                          </Link>
                          <p className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
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
                            className="w-full rounded-xl text-[11px] sm:text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-card)] hover:bg-[var(--accent)] transition py-1.5 sm:py-2"
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

                          {rev.images && Array.isArray(rev.images) && rev.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {rev.images.map((img: string, i: number) => (
                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={img}
                                    alt={`Review photo ${i + 1}`}
                                    className="h-16 w-16 rounded-xl object-cover border border-[#F0E4DC] dark:border-[#2C2426] hover:opacity-90 transition shadow-xs"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

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

            {/* PROFILE — JUMIA-STYLE CLEAN LIST & TILE LAYOUT */}
            {activeTab === 'security' && user && (
              <div className="space-y-4 sm:space-y-6">
                {/* 1. JUMIA-STYLE PROFILE HEADER BANNER */}
                <div className="relative hidden overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-soft)] p-4 shadow-xs sm:block sm:rounded-3xl sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* Avatar with Camera Trigger */}
                      <div className="relative group shrink-0">
                        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white font-serif font-bold text-xl sm:text-2xl shadow-md ring-2 ring-[var(--accent)]/30">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover" />
                          ) : (
                            user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setJumiaExpandedSection('profile');
                            setTimeout(() => profileImageInputRef.current?.click(), 100);
                          }}
                          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white ring-2 ring-[var(--bg-card)] shadow-xs hover:scale-110 transition cursor-pointer"
                          title="Change photo"
                        >
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Welcome & Info */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-xl font-black text-[var(--text-primary)] truncate">
                            Hello, {user.fullName || 'Shopper'}
                          </h2>
                          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/20">
                            {customerStats.segment}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-subtle)] flex-wrap pt-0.5">
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            ID: CR-{String(user.id || '').slice(0, 8).toUpperCase() || 'CLIENT'}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verified Customer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit Profile CTA */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant={jumiaExpandedSection === 'profile' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => setJumiaExpandedSection(prev => prev === 'profile' ? null : 'profile')}
                        className="rounded-xl text-xs font-bold gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{jumiaExpandedSection === 'profile' ? 'Close Editor' : 'Edit Profile'}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick links are already available in the responsive account sidebar. */}
                <div className="hidden grid-cols-2 gap-2.5 sm:grid sm:grid-cols-4 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="group flex flex-col items-start rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <Package className="h-4 w-4" />
                      </span>
                      <span className="font-serif text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                        {allOrders.length}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">My Orders</span>
                    <span className="text-[10px] text-[var(--text-subtle)] truncate">
                      {activeOrders.length > 0 ? `${activeOrders.length} active delivery` : 'Track & history'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="group flex flex-col items-start rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Bell className="h-4 w-4" />
                      </span>
                      <span className="font-serif text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                        {unreadCustomerNotifications}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Alerts &amp; Inbox</span>
                    <span className="text-[10px] text-[var(--text-subtle)] truncate">
                      {unreadCustomerNotifications > 0 ? 'Unread updates' : 'All caught up'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('wishlist')}
                    className="group flex flex-col items-start rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <Heart className="h-4 w-4" />
                      </span>
                      <span className="font-serif text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                        {wishlistIds.length}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Saved Wishlist</span>
                    <span className="text-[10px] text-[var(--text-subtle)] truncate">Favorite items</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className="group flex flex-col items-start rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 text-left transition hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="font-serif text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                        {user.savedAddresses?.length || 0}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Address Book</span>
                    <span className="text-[10px] text-[var(--text-subtle)] truncate">
                      {user.savedAddresses?.find(a => a.isDefault)?.area || 'Manage addresses'}
                    </span>
                  </button>
                </div>

                {/* 3. JUMIA GROUPED LIST SECTION: MY ACCOUNT */}
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
                  <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                      My Account Details
                    </h3>
                  </div>

                  <div className="divide-y divide-[var(--border-color)]">
                    {/* Row 1: Personal Details */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setJumiaExpandedSection(prev => prev === 'profile' ? null : 'profile')}
                        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                            <User className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Personal Details</p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate">
                              {user.fullName || 'Add name'} • {user.phone || 'No phone added'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-subtle)]">
                          <span className="text-[11px] font-semibold hidden sm:inline text-[var(--accent)]">
                            {jumiaExpandedSection === 'profile' ? 'Hide' : 'Edit'}
                          </span>
                          {jumiaExpandedSection === 'profile' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </button>

                      {/* Expandable Edit Profile Panel */}
                      {jumiaExpandedSection === 'profile' && (
                        <div id="customer-profile-editor" className="bg-[var(--bg-soft)]/30 border-t border-[var(--border-color)] p-4 sm:p-6 animate-in fade-in duration-200">
                          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                            {/* Photo upload */}
                            <div>
                              <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">Profile Photo</label>
                              <div className="flex items-center gap-4">
                                <div className="relative group flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white font-serif font-bold text-xl shadow-md ring-2 ring-[var(--accent)]/30">
                                  {profileForm.profileImage ? (
                                    <img src={profileForm.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                                  ) : (
                                    profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'U'
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => profileImageInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                                  >
                                    <Camera className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => profileImageInputRef.current?.click()}
                                      className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
                                    >
                                      Upload Photo
                                    </button>
                                    {profileForm.profileImage && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProfileForm(p => ({ ...p, profileImage: '' }));
                                          if (profileImageInputRef.current) profileImageInputRef.current.value = '';
                                        }}
                                        className="text-xs font-semibold text-rose-500 hover:underline"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[var(--text-subtle)]">JPG, PNG, or WEBP up to 5MB.</p>
                                  <input
                                    ref={profileImageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={e => handleProfileImageUpload(e.target.files?.[0])}
                                    className="hidden"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                                  Full Legal Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={profileForm.fullName}
                                  onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                                  placeholder="Your full name"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                                  Phone Number (Ghana) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  required
                                  value={profileForm.phone}
                                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                                  placeholder="e.g. 0244123456"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">
                                Account Email (Verified)
                              </label>
                              <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-2.5 text-xs text-[var(--text-muted)]">
                                <span>{user.email}</span>
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" /> Verified
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                type="submit"
                                variant="primary"
                                disabled={isSavingProfile}
                                className="rounded-xl text-xs font-bold bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                              >
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isSavingProfile}
                                onClick={() => setJumiaExpandedSection(null)}
                                className="rounded-xl text-xs font-bold"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Address Book */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('addresses')}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Address Book</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {user.savedAddresses?.find(a => a.isDefault)?.area
                              ? `Default: ${user.savedAddresses.find(a => a.isDefault)?.area}, ${user.savedAddresses.find(a => a.isDefault)?.city}`
                              : `${user.savedAddresses?.length || 0} saved delivery addresses`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
                        <span className="text-[11px] font-semibold text-[var(--accent)] hidden sm:inline">Manage</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>

                    {/* Row 3: Skin Profile & Routine Preferences */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setJumiaExpandedSection(prev => prev === 'skin' ? null : 'skin')}
                        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Skin Profile &amp; Routine Needs</p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate capitalize">
                              {profileForm.skinType || 'Normal'} skin • {(Array.isArray(profileForm.concerns) ? profileForm.concerns : []).length} concern{(Array.isArray(profileForm.concerns) ? profileForm.concerns : []).length === 1 ? '' : 's'} selected
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-subtle)]">
                          <span className="text-[11px] font-semibold hidden sm:inline text-[var(--accent)]">
                            {jumiaExpandedSection === 'skin' ? 'Hide' : 'Update'}
                          </span>
                          {jumiaExpandedSection === 'skin' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </button>

                      {/* Expandable Skin Profile Selector */}
                      {jumiaExpandedSection === 'skin' && (
                        <div className="account-detail-panel border-t border-[var(--border-color)] p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                          <div>
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <label className="block text-sm font-black text-[var(--text-primary)]">Your skin profile</label>
                                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">Help us tailor routines and product recommendations to your needs.</p>
                              </div>
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                            </div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Skin type</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                              {(['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'] as const).map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setProfileForm(p => ({ ...p, skinType: type }));
                                    void updateProfile({ skinProfile: { skinType: type, concerns: profileForm.concerns } });
                                    showAlert(`Skin type set to ${type}`, 'success');
                                  }}
                                  className={`min-h-10 rounded-xl border px-2 py-2 text-xs font-bold capitalize transition ${
                                    profileForm.skinType === type
                                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs'
                                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Concerns and routine goals</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {[
                                'Deep Hydration',
                                'Dark Spots & Hyperpigmentation',
                                'Acne & Blemishes',
                                'Anti-Aging & Fine Lines',
                                'Sun Protection & SPF',
                                'Brightening & Glow',
                                'Pore Tightening',
                              ].map(concern => {
                                const currentConcerns = Array.isArray(profileForm.concerns) ? profileForm.concerns : [];
                                const isSelected = currentConcerns.includes(concern);
                                return (
                                  <button
                                    key={concern}
                                    type="button"
                                    onClick={() => {
                                      const nextConcerns = isSelected
                                        ? currentConcerns.filter(c => c !== concern)
                                        : [...currentConcerns, concern];
                                      setProfileForm(p => ({ ...p, concerns: nextConcerns }));
                                      void updateProfile({ skinProfile: { skinType: profileForm.skinType as any, concerns: nextConcerns } });
                                    }}
                                    className={`min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                                      isSelected
                                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-card)] shadow-xs'
                                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                                    }`}
                                  >
                                    {concern}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 4: Password & Security */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setJumiaExpandedSection(prev => prev === 'security' ? null : 'security')}
                        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Login &amp; Password</p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate">
                              {user.hasPassword ? 'Password protected • Tap to update' : 'OAuth account • Set a password'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-subtle)]">
                          <span className="text-[11px] font-semibold hidden sm:inline text-[var(--accent)]">
                            {jumiaExpandedSection === 'security' ? 'Hide' : 'Change'}
                          </span>
                          {jumiaExpandedSection === 'security' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </button>

                      {/* Expandable Password Form */}
                      {jumiaExpandedSection === 'security' && (
                        <div className="bg-[var(--bg-soft)]/30 border-t border-[var(--border-color)] p-4 sm:p-6 animate-in fade-in duration-200">
                          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md">
                            {user.hasPassword && (
                              <div>
                                <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Current Password</label>
                                <div className="relative">
                                  <input
                                    type={showPasswordFields ? 'text' : 'password'}
                                    required
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] pr-10"
                                    placeholder="Enter current password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
                                  >
                                    {showPasswordFields ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">New Password (8+ characters)</label>
                              <input
                                type={showPasswordFields ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                                placeholder="Choose new password"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-[var(--text-primary)] block mb-1">Confirm New Password</label>
                              <input
                                type={showPasswordFields ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                                placeholder="Confirm new password"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                type="submit"
                                variant="primary"
                                disabled={isChangingPassword}
                                className="rounded-xl text-xs font-bold bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                              >
                                {isChangingPassword ? 'Saving Password...' : user.hasPassword ? 'Update Password' : 'Set Account Password'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setJumiaExpandedSection(null)}
                                className="rounded-xl text-xs font-bold"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shopping links remain available in the sidebar on mobile. */}
                <div className="hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs sm:block sm:rounded-3xl">
                  <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                      My Shopping &amp; Orders
                    </h3>
                  </div>

                  <div className="divide-y divide-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          <Package className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Orders &amp; Tracking</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {allOrders.length} total orders • {activeOrders.length} in progress
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('reviews')}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Star className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Pending Reviews</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {itemsToReview.length} item{itemsToReview.length === 1 ? '' : 's'} awaiting your rating
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <Heart className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Saved Wishlist</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {wishlistIds.length} item{wishlistIds.length === 1 ? '' : 's'} saved for later
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </button>
                  </div>
                </div>

                <div className="hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs sm:block sm:rounded-3xl">
                  <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                      Settings &amp; Preferences
                    </h3>
                  </div>

                  <div className="divide-y divide-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preferences')}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-300">
                          <Settings className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">App &amp; Notification Settings</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            Sound alerts, push preferences &amp; theme appearance
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </button>
                  </div>
                </div>

                <div className="hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs sm:block sm:rounded-3xl">
                  <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
                      Reach Out &amp; Support
                    </h3>
                  </div>

                  <div className="divide-y divide-[var(--border-color)]">
                    {(storeSettings?.whatsappNumber || storeSettings?.storePhone || storeSettings?.supportPhone) && (() => {
                      const activeSupportPhone = String(storeSettings?.whatsappNumber || storeSettings?.storePhone || storeSettings?.supportPhone || '');
                      const rawNumber = activeSupportPhone.replace(/[^0-9]/g, '');
                      const formattedWa = rawNumber.startsWith('0') ? '233' + rawNumber.slice(1) : rawNumber;
                      const custId = String(user?.id || '').slice(0, 8).toUpperCase() || 'CLIENT';
                      return (
                        <a
                          href={`https://wa.me/${formattedWa}?text=${encodeURIComponent(`Hello ${String(storeSettings?.storeName || 'Store')}, I am ${user?.fullName || 'Customer'} (Customer ID: CR-${custId}). I need assistance.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-emerald-500/5 transition cursor-pointer"
                        >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <MessageCircle className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">WhatsApp Support Concierge</p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate">
                              Chat directly with our store support team
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                      </a>
                      );
                    })()}

                    <Link
                      to="/support"
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--bg-soft)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          <HelpCircle className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Help Center &amp; FAQs</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            Deliveries, store policies, order guidance
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </Link>
                  </div>
                </div>

                {/* 7. JUMIA GROUPED LIST SECTION: ACCOUNT ACTIONS */}
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
                  <div className="divide-y divide-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-rose-500/5 transition cursor-pointer text-rose-600 dark:text-rose-400"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <LogOut className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold">Log Out</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            Sign out of this device
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-rose-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-rose-500/10 transition cursor-pointer text-[var(--text-subtle)] hover:text-rose-600"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-500/10 text-stone-500">
                          <ShieldAlert className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold">Deactivate Account</p>
                          <p className="text-[10px] text-[var(--text-subtle)] truncate">
                            Close your account and delete saved addresses
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES / SETTINGS */}
            {activeTab === 'preferences' && (
              <SettingsView standalone={false} />
            )}
          </main>
        </div>
      </div>

      {/* DIGITAL INVOICE MODAL */}
      {viewingInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-3xl bg-[var(--bg-card)] p-5 sm:p-8 shadow-2xl border-t sm:border border-[var(--border-color)] space-y-5 sm:space-y-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="CR" className="h-10 w-10 rounded-full object-contain border border-[var(--border-color)] p-1 bg-white" />
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">{storeSettings.storeName}</h3>
                  <p className="text-[10px] text-[var(--text-subtle)]">Customer Order Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setViewingInvoiceOrder(null)}
                className="rounded-lg p-1 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="rounded-2xl bg-[var(--bg-soft)] p-3.5 sm:p-4 space-y-1">
                <p className="text-[var(--text-subtle)] font-bold uppercase text-[10px]">Order Details</p>
                <p className="font-black text-sm text-[var(--text-primary)]">#{viewingInvoiceOrder.orderNumber}</p>
                <p className="text-[var(--text-muted)]">Date: {viewingInvoiceOrder.createdAt ? new Date(viewingInvoiceOrder.createdAt).toLocaleDateString() : 'Recent'}</p>
                <p className="text-[var(--text-muted)]">Payment: <strong className="uppercase">{viewingInvoiceOrder.paymentMethod}</strong> ({viewingInvoiceOrder.paymentStatus})</p>
                {viewingInvoiceOrder.paymentReference && (
                  <p className="text-[var(--text-subtle)] font-mono text-[10px]">Ref: {viewingInvoiceOrder.paymentReference}</p>
                )}
              </div>

              <div className="rounded-2xl bg-[var(--bg-soft)] p-3.5 sm:p-4 space-y-1">
                <p className="text-[var(--text-subtle)] font-bold uppercase text-[10px]">Shipping Destination</p>
                <p className="font-bold text-sm text-[var(--text-primary)]">{viewingInvoiceOrder.shippingAddress?.fullName}</p>
                <p className="text-[var(--text-muted)]">{viewingInvoiceOrder.shippingAddress?.area}, {viewingInvoiceOrder.shippingAddress?.city}</p>
                <p className="text-[var(--text-muted)]">{viewingInvoiceOrder.shippingAddress?.phone}</p>
                <p className="text-[10px] text-[var(--accent)] font-bold uppercase">{viewingInvoiceOrder.deliveryMethod}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[var(--bg-soft)] text-[10px] font-bold uppercase text-[var(--text-subtle)]">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {viewingInvoiceOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <p className="font-bold text-[var(--text-primary)]">{item.product?.name}</p>
                        <p className="text-[10px] text-[var(--text-subtle)]">{item.product?.brand}</p>
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
                <div className="flex justify-between text-[var(--text-subtle)]">
                  <span>Subtotal:</span>
                  <span className="font-bold">GHS {Number(viewingInvoiceOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-subtle)]">
                  <span>Delivery Fee:</span>
                  <span className="font-bold">GHS {Number(viewingInvoiceOrder.shippingFee).toFixed(2)}</span>
                </div>
                {Number(viewingInvoiceOrder.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>- GHS {Number(viewingInvoiceOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[var(--border-color)] pt-2 text-sm font-black text-[var(--text-primary)]">
                  <span>Total:</span>
                  <span className="text-[var(--accent)]">GHS {Number(viewingInvoiceOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="flex-1 rounded-xl text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-card)]"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-2xl border-t sm:border border-[var(--border-color)] space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Star className="h-5 w-5" />
                <h3 className="text-base font-black text-[var(--text-primary)]">Write a Review</h3>
              </div>
              <button
                onClick={() => setReviewModalProduct(null)}
                className="rounded-lg p-1 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
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

              {/* Optional Photo Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-[#C86D51]" />
                    <span>Add Photos (Optional)</span>
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {reviewImages.length}/4 uploaded
                  </span>
                </div>

                {reviewImages.length > 0 && (
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {reviewImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group h-16 w-16 rounded-xl overflow-hidden border border-[#F0E4DC] dark:border-[#2C2426] shadow-xs"
                      >
                        <img src={img} alt={`Review photo ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveReviewPhoto(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {reviewImages.length < 4 && (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#F0E4DC] dark:border-[#2C2426] bg-[#FAF3F0]/60 dark:bg-[#241D20]/60 p-3 hover:border-[#C86D51] hover:bg-[#FAF3F0] dark:hover:bg-[#2A2024] transition group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      multiple
                      onChange={handleReviewPhotoUpload}
                      className="hidden"
                    />
                    <ImagePlus className="h-4 w-4 text-[#C86D51] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      Upload product or routine photos
                    </span>
                  </label>
                )}
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
                  onClick={() => {
                    setReviewModalProduct(null);
                    setReviewImages([]);
                  }}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg rounded-t-[28px] sm:rounded-3xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-2xl border-t sm:border border-[var(--border-color)] space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <MapPin className="h-5 w-5" />
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {editingAddressIndex !== null ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="rounded-lg p-1 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder="024 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Alt Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.altPhone || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, altPhone: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder="Backup phone"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Address Label</label>
                  <select
                    value={addressForm.tag || 'Home'}
                    onChange={(e) => setAddressForm({ ...addressForm, tag: e.target.value as any })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work / Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder="Accra, Tema, Kumasi..."
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    placeholder="East Legon, Osu, Airport..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text-primary)] block mb-1">
                  GhanaPost Digital Address or Landmark
                </label>
                <input
                  type="text"
                  value={addressForm.landmarkOrGps || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, landmarkOrGps: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  placeholder="e.g. GA-123-4567 or near landmark"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-primary)] block mb-1">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={addressForm.deliveryNotes || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryNotes: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] h-20 resize-none"
                  placeholder="Gate instructions or specific directions"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddrCheck"
                  checked={Boolean(addressForm.isDefault)}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="defaultAddrCheck" className="text-xs font-bold text-[var(--text-muted)]">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wider bg-[var(--accent)] text-white hover:opacity-90"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-2xl border-t sm:border border-red-200 dark:border-red-950 space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sm:hidden mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-base font-black text-[var(--text-primary)]">Delete Account Confirmation</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
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
