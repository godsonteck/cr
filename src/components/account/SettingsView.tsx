import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Volume2,
  Bell,
  Sparkles,
  MapPin,
  Package,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { Button } from '../common/UIPrimitives';

interface SettingsViewProps {
  standalone?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const { theme, setTheme, isDarkMode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { storeSettings } = useStore();
  const { showAlert } = useAlert();
  const {
    preferences,
    updatePreference,
    playNotificationSound,
  } = useNotifications();

  // Safe phone number for WhatsApp concierge
  const activePhone = String(storeSettings?.whatsappNumber || storeSettings?.storePhone || storeSettings?.supportPhone || '233592153306');
  const cleanPhone = activePhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '233' + cleanPhone.slice(1) : cleanPhone;
  const conciergeMessage = encodeURIComponent(
    `Hello ${String(storeSettings?.storeName || 'Store')} Team, I have a quick question regarding my account.`
  );
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${conciergeMessage}`;

  const handleLogout = () => {
    logout();
    showAlert('Signed out successfully.', 'info');
    navigate('/');
  };

  return (
    <div className={standalone ? 'mx-auto max-w-2xl px-4 py-6 sm:py-10' : 'space-y-6'}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] font-serif">
          Settings
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Manage your app theme, notification alerts, and account preferences.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* 1. APPEARANCE / THEME */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
              Appearance
            </h2>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Theme Mode</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isDarkMode ? 'Dark theme active' : 'Light theme active'}
                </p>
              </div>
            </div>

            <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showAlert('Switched to light mode', 'info');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  !isDarkMode
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showAlert('Switched to dark mode', 'info');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  isDarkMode
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. NOTIFICATIONS */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
              Notifications &amp; Alerts
            </h2>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {/* Order Updates */}
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Package className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Order &amp; Delivery Updates</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Dispatch status and delivery rider alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) => {
                    updatePreference('orderUpdates', e.target.checked);
                    showAlert(e.target.checked ? 'Order alerts enabled' : 'Order alerts muted', 'info');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
              </label>
            </div>

            {/* Promo Alerts */}
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Promotions &amp; Flash Deals</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Discount vouchers and special sales announcements</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.promoAlerts}
                  onChange={(e) => {
                    updatePreference('promoAlerts', e.target.checked);
                    showAlert(e.target.checked ? 'Promotions enabled' : 'Promotions muted', 'info');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
              </label>
            </div>

            {/* Sound Chime */}
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Volume2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Sound Effects</p>
                    <button
                      type="button"
                      onClick={() => playNotificationSound()}
                      className="rounded-md bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition cursor-pointer"
                      title="Play sample sound"
                    >
                      Test
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Play chime on new store notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => {
                    updatePreference('soundEnabled', e.target.checked);
                    if (e.target.checked) playNotificationSound();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]" />
              </label>
            </div>
          </div>
        </div>

        {/* 3. MY ACCOUNT SHORTCUTS */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
              Account
            </h2>
          </div>

          {isAuthenticated && user ? (
            <div className="divide-y divide-[var(--border-color)]">
              {/* Profile summary row */}
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white font-serif font-bold text-base shadow-xs">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{user.fullName || 'User'}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/account?tab=security"
                  className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  Manage <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Saved Addresses */}
              <Link
                to="/account?tab=addresses"
                className="flex items-center justify-between p-4 sm:px-5 py-3.5 hover:bg-[var(--bg-soft)]/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">Delivery Addresses</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
              </Link>

              {/* Orders */}
              <Link
                to="/account?tab=orders"
                className="flex items-center justify-between p-4 sm:px-5 py-3.5 hover:bg-[var(--bg-soft)]/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Package className="h-4 w-4" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">My Orders &amp; Receipts</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
              </Link>
            </div>
          ) : (
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Sign in to your account</p>
                <p className="text-[11px] text-[var(--text-muted)]">Save addresses, track dispatches, and collect points</p>
              </div>
              <Link to="/signin">
                <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold gap-1.5 bg-[var(--accent)] text-white">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 4. SUPPORT & HELP */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="border-b border-[var(--border-color)] px-4 sm:px-5 py-3 bg-[var(--bg-soft)]/50">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-subtle)]">
              Support
            </h2>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:px-5 py-3.5 hover:bg-emerald-500/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">WhatsApp Support</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Chat with our store concierge</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
            </a>

            <Link
              to="/support"
              className="flex items-center justify-between p-4 sm:px-5 py-3.5 hover:bg-[var(--bg-soft)]/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">Help Center &amp; FAQs</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Deliveries, returns, and store policies</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
            </Link>
          </div>
        </div>

        {/* 5. LOG OUT (If authenticated) */}
        {isAuthenticated && (
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 sm:px-5 py-3.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <LogOut className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold">Log Out</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Sign out of your account on this device</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
