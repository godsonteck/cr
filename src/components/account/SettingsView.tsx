import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Smartphone,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Sliders,
  Sparkles,
  Check,
  Globe,
  HelpCircle,
  Info,
  MessageCircle,
  ExternalLink,
  Database,
  Palette,
  Layers,
  Lock,
  User,
  ArrowRight,
  ChevronRight,
  Truck,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { Button, Badge } from '../common/UIPrimitives';

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
    preferences: notificationPreferences,
    updatePreference: updateNotificationPreference,
    playNotificationSound,
    requestBrowserPermission,
  } = useNotifications();

  // Local preferences state
  const [followSystemTheme, setFollowSystemTheme] = useState<boolean>(() => {
    return localStorage.getItem('cr_theme_follow_system') === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('cr_reduced_motion') === 'true';
  });

  const [defaultDepartment, setDefaultDepartment] = useState<string>(() => {
    return localStorage.getItem('cr_default_department') || 'all';
  });

  const [smartRecommendations, setSmartRecommendations] = useState<boolean>(() => {
    return localStorage.getItem('cr_smart_recommendations') !== 'false';
  });

  const [actionHaptics, setActionHaptics] = useState<boolean>(() => {
    return localStorage.getItem('cr_action_haptics') !== 'false';
  });

  const [browserPermissionStatus, setBrowserPermissionStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [cacheClearSuccess, setCacheClearSuccess] = useState<boolean>(false);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState<boolean>(false);

  // Sync follow system theme
  useEffect(() => {
    if (!followSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    setTheme(mediaQuery.matches ? 'dark' : 'light');

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [followSystemTheme, setTheme]);

  // Reduced motion effect
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  const handleToggleFollowSystem = () => {
    const next = !followSystemTheme;
    setFollowSystemTheme(next);
    localStorage.setItem('cr_theme_follow_system', String(next));
    if (next) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isSystemDark ? 'dark' : 'light');
      showAlert('Theme is now synchronized with your device appearance.', 'success');
    }
  };

  const handleSelectTheme = (mode: 'light' | 'dark') => {
    setFollowSystemTheme(false);
    localStorage.setItem('cr_theme_follow_system', 'false');
    setTheme(mode);
  };

  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('cr_reduced_motion', String(next));
    showAlert(next ? 'Reduced motion animations enabled.' : 'Standard animations enabled.', 'info');
  };

  const handleSelectDepartment = (dept: string) => {
    setDefaultDepartment(dept);
    localStorage.setItem('cr_default_department', dept);
    showAlert(`Default shopping department set to ${dept === 'all' ? 'All Storefront' : dept === 'beauty' ? 'Beauty & Cosmetics' : 'Groceries & Fresh'}.`, 'success');
  };

  const handleToggleSmartRecommendations = () => {
    const next = !smartRecommendations;
    setSmartRecommendations(next);
    localStorage.setItem('cr_smart_recommendations', String(next));
  };

  const handleToggleActionHaptics = () => {
    const next = !actionHaptics;
    setActionHaptics(next);
    localStorage.setItem('cr_action_haptics', String(next));
    if (next && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // Ignore haptics errors
      }
    }
  };

  const handlePlayTestSound = () => {
    setIsPlayingTestSound(true);
    playNotificationSound();
    setTimeout(() => {
      setIsPlayingTestSound(false);
    }, 600);
  };

  const handleRequestPushPermission = async () => {
    const granted = await requestBrowserPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermissionStatus(Notification.permission);
    }
    if (granted) {
      showAlert('Push notifications enabled for this device.', 'success');
    } else {
      showAlert('Push notifications permission was not granted.', 'info');
    }
  };

  const handleClearCache = () => {
    try {
      // Clear non-essential cache keys while preserving authentication and theme
      const keysToPreserve = [
        'cr_token',
        'cr_user',
        'cr_theme_mode',
        'cr_theme_follow_system',
        'cr_notification_prefs',
        'cr_default_department',
      ];

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key) && (key.startsWith('cr_') || key.startsWith('cached_') || key.includes('recent'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();

      setCacheClearSuccess(true);
      showAlert(`Cleaned ${keysToRemove.length} temporary storage items. Authentication and preferences preserved.`, 'success');
      setTimeout(() => setCacheClearSuccess(false), 3000);
    } catch {
      showAlert('Failed to clear cache.', 'error');
    }
  };

  const handleResetPreferences = () => {
    if (window.confirm('Reset all personal preferences (theme, sounds, notifications, shopping defaults) back to system defaults?')) {
      localStorage.removeItem('cr_theme_follow_system');
      localStorage.removeItem('cr_reduced_motion');
      localStorage.removeItem('cr_default_department');
      localStorage.removeItem('cr_smart_recommendations');
      localStorage.removeItem('cr_action_haptics');
      setFollowSystemTheme(false);
      setReducedMotion(false);
      setDefaultDepartment('all');
      setSmartRecommendations(true);
      setActionHaptics(true);
      setTheme('light');
      updateNotificationPreference('soundEnabled', true);
      updateNotificationPreference('orderUpdates', true);
      updateNotificationPreference('promoAlerts', true);
      showAlert('Preferences reset to default.', 'success');
    }
  };

  // WhatsApp concierge URL
  const cleanPhone = storeSettings.supportPhone.replace(/[^0-9+]/g, '');
  const conciergeMessage = encodeURIComponent(
    `Hello ${storeSettings.storeName} Support, I have a quick inquiry about my account preferences and store services.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${conciergeMessage}`;

  return (
    <div className={`space-y-6 ${standalone ? 'mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10' : ''}`}>
      {/* HEADER BANNER */}
      {standalone && (
        <div className="flex flex-col gap-2 border-b border-[var(--border-color)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                <Sliders className="h-3 w-3" />
                Store Preferences
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Active
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Settings & Customization
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-subtle)]">
              Personalize your display aesthetics, audio alerts, device notifications, and shopping defaults.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Link to="/shop">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                Storefront
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/account">
                <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-card)]">
                  My Account
                </Button>
              </Link>
            ) : (
              <Link to="/signin">
                <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold bg-[var(--accent)] text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER ACCOUNT QUICK STATUS CARD */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-xs transition hover:border-[var(--accent)]/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-sm ring-2 ring-[var(--accent)]/30">
              {isAuthenticated && user?.profileImage ? (
                <img src={user.profileImage} alt={user.fullName || 'User'} className="h-full w-full object-cover" />
              ) : (
                <User className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                  {isAuthenticated && user ? user.fullName || 'Valued Customer' : 'Guest Shopper'}
                </h3>
                {isAuthenticated ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-2.5 w-2.5" />
                    Member
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-subtle)]">
                    Local Device
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-subtle)] truncate mt-0.5">
                {isAuthenticated && user ? user.email : 'Sign in to sync your preferences and order updates across all your devices.'}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-subtle)]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isAuthenticated ? 'Cloud Account Synced' : 'Device Storage Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isAuthenticated ? (
              <Link to="/account?tab=security">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Account Security
                </Button>
              </Link>
            ) : (
              <Link to="/signin">
                <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold gap-1.5 bg-[var(--accent)] text-white">
                  Sign In / Register
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 1. DISPLAY & APPEARANCE CARD */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Display & Appearance</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Select color palette, dark mode, and interface pacing.</p>
            </div>
          </div>
        </div>

        {/* Theme Mode Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">Theme Style</span>
            <button
              type="button"
              onClick={handleToggleFollowSystem}
              className={`flex items-center gap-1.5 text-xs font-bold transition ${
                followSystemTheme ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>{followSystemTheme ? 'Matching System (Active)' : 'Match Device OS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectTheme('light')}
              className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                theme === 'light' && !followSystemTheme
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-xs'
                  : 'border-[var(--border-color)] bg-[var(--bg-soft)] hover:border-[var(--accent)]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Sun className="h-5 w-5" />
                </div>
                {theme === 'light' && !followSystemTheme && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-[10px] font-black">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Light Warmth</p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Ivory canvas with refined contrast for daylight reading.</p>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectTheme('dark')}
              className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                theme === 'dark' && !followSystemTheme
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-xs'
                  : 'border-[var(--border-color)] bg-[var(--bg-soft)] hover:border-[var(--accent)]/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Moon className="h-5 w-5" />
                </div>
                {theme === 'dark' && !followSystemTheme && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-[10px] font-black">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-[var(--text-primary)]">Dark Obsidian</p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Deep velvety blacks for late-night viewing and OLED batteries.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Reduced Motion Setting */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Reduced Motion Animations</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Disables intensive transitions for maximum responsiveness on all phones.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={handleToggleReducedMotion}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              reducedMotion ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                reducedMotion ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. AUDIO & HAPTIC FEEDBACK CARD */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Audio & Haptic Feedback</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Custom tones for notifications and tactile feedback.</p>
            </div>
          </div>
        </div>

        {/* Sound Enabled & Live Test */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Notification Chime Sounds</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Plays an acoustic, zero-latency harmonic chime when new order alerts arrive.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayTestSound}
              className={`flex items-center gap-1.5 rounded-full border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                isPlayingTestSound ? 'scale-95 border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10' : 'bg-[var(--bg-soft)]'
              }`}
              title="Test sound chime"
            >
              <Volume2 className={`h-3.5 w-3.5 ${isPlayingTestSound ? 'animate-bounce' : ''}`} />
              <span>Test Chime</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={notificationPreferences.soundEnabled}
              onClick={() => updateNotificationPreference('soundEnabled', !notificationPreferences.soundEnabled)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notificationPreferences.soundEnabled ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                  notificationPreferences.soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Haptics Toggle */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Tactile Touch Vibration (Haptics)</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Subtle vibration pulse when adding items to your cart on supported mobile devices.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={actionHaptics}
            onClick={handleToggleActionHaptics}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              actionHaptics ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                actionHaptics ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATIONS & ALERTS CARD */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Notifications & Alerts</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Manage real-time order tracking, promo updates, and browser pushes.</p>
            </div>
          </div>
          <Link to="/account?tab=notifications" className="text-xs font-bold text-[var(--accent)] hover:underline">
            View Inbox
          </Link>
        </div>

        {/* Order Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Order Dispatch & Delivery Tracking</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Instant alerts when your package is confirmed, dispatched, and out for delivery.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationPreferences.orderUpdates}
            onClick={() => updateNotificationPreference('orderUpdates', !notificationPreferences.orderUpdates)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              notificationPreferences.orderUpdates ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                notificationPreferences.orderUpdates ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Store Promotions & Drops */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <div className="space-y-0.5 pr-2">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">VIP Deals & Restock Announcements</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Receive early-access notifications for discount codes and high-demand beauty restocks.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationPreferences.promoAlerts}
            onClick={() => updateNotificationPreference('promoAlerts', !notificationPreferences.promoAlerts)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              notificationPreferences.promoAlerts ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                notificationPreferences.promoAlerts ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Browser Push Notifications */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--border-color)] pt-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Browser Push Notifications</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                  browserPermissionStatus === 'granted'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : browserPermissionStatus === 'denied'
                    ? 'bg-rose-500/15 text-rose-500'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {browserPermissionStatus === 'granted' ? 'Allowed' : browserPermissionStatus === 'denied' ? 'Blocked' : 'Requires Permission'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-subtle)]">
              Receive live popup alerts on your phone or desktop even when this browser tab is minimized.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {browserPermissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPushPermission}
                className="rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-xs font-bold text-[var(--bg-card)] hover:bg-[var(--accent)] transition"
              >
                Allow Push
              </button>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={notificationPreferences.browserNotifications}
              onClick={() => updateNotificationPreference('browserNotifications', !notificationPreferences.browserNotifications)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notificationPreferences.browserNotifications ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                  notificationPreferences.browserNotifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. SHOPPING DEFAULTS & REGIONAL SETTINGS CARD */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Shopping Defaults & Region</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Preferred landing catalog, currency, and AI product tailoring.</p>
            </div>
          </div>
        </div>

        {/* Default Department */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
            Primary Storefront Catalog
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'beauty', label: 'Cosmetics & Skin' },
              { id: 'groceries', label: 'Fresh Groceries' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectDepartment(item.id)}
                className={`rounded-2xl border-2 py-2.5 px-2 text-center text-xs font-bold transition ${
                  defaultDepartment === item.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency & Dispatch Hub Information */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl bg-[var(--bg-soft)] p-3.5 border border-[var(--border-color)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Billing Currency</p>
            <p className="text-sm font-black text-[var(--text-primary)] mt-1">Ghana Cedi (GHS ₵)</p>
            <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Mobile Money (MTN / Telecel / AT) & Visa/Mastercard accepted.</p>
          </div>

          <div className="rounded-2xl bg-[var(--bg-soft)] p-3.5 border border-[var(--border-color)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Fulfillment Hub</p>
            <p className="text-sm font-black text-[var(--text-primary)] mt-1">Accra & Nationwide Ghana</p>
            <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Express same-day dispatch in Accra, 24-48h for regional shipments.</p>
          </div>
        </div>

        {/* Smart Personalized Recommendations */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <div className="space-y-0.5 pr-2">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Personalized Skincare Recommendations</p>
            <p className="text-[11px] text-[var(--text-subtle)]">Tailor recommended products to your skin type and past cosmetic selections.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={smartRecommendations}
            onClick={handleToggleSmartRecommendations}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              smartRecommendations ? 'bg-[var(--accent)]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-all ${
                smartRecommendations ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. PRIVACY, STORAGE & LOCAL CACHE CARD */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Storage, Cache & Privacy</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Maintain offline speed and clean temporary browsing data.</p>
            </div>
          </div>
        </div>

        {/* Cache Cleaner */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Clear Local Browsing Cache</p>
            <p className="text-[11px] text-[var(--text-subtle)]">
              Clears cached search queries and temporary product views without logging you out.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className={`rounded-xl text-xs font-bold gap-1.5 transition ${
              cacheClearSuccess ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : ''
            }`}
          >
            {cacheClearSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Cache Cleared
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Clear Cache
              </>
            )}
          </Button>
        </div>

        {/* Quick Legal Links */}
        <div className="border-t border-[var(--border-color)] pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)] mb-2.5">
            Policies & Guidelines
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms of Service', path: '/terms' },
              { label: 'Shipping & Delivery', path: '/shipping' },
              { label: 'Help & FAQ', path: '/faq' },
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center justify-between rounded-xl bg-[var(--bg-soft)] p-2.5 text-xs font-bold text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] border border-transparent transition"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6. CONCIERGE SUPPORT & APP DIAGNOSTICS */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">Store Concierge & Assistance</h2>
              <p className="text-[11px] text-[var(--text-subtle)]">Connect directly with store management and view system health.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Direct WhatsApp Concierge</p>
            <p className="text-[11px] text-[var(--text-subtle)]">
              Support Line: <strong className="text-[var(--text-primary)]">{storeSettings.supportPhone}</strong> ({storeSettings.supportEmail})
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* System Diagnostics Info */}
        <div className="rounded-2xl bg-[var(--bg-soft)] p-3.5 border border-[var(--border-color)] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
            <span>Platform Application</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">CR Cosmetics & Groceries v2.4.0</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
            <span>Cloud Database Engine</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              PostgreSQL Neon Online
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
            <span>Device Storage Mode</span>
            <span className="font-semibold text-[var(--text-primary)]">Web LocalStorage + Cookie Auth</span>
          </div>
        </div>

        {/* Reset All Preferences */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleResetPreferences}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-subtle)] hover:text-rose-500 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Settings to Factory Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
