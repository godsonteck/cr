import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';

export type NotificationType = 'order' | 'promo' | 'system' | 'delivery';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  actionUrl?: string;
  orderNumber?: string;
  priority?: 'normal' | 'high';
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promoAlerts: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
}

export type NotificationFilter = 'all' | 'unread' | 'order' | 'promo';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  activeFilter: NotificationFilter;
  setActiveFilter: (filter: NotificationFilter) => void;
  filteredNotifications: AppNotification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  clearAllRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & Partial<Pick<AppNotification, 'id' | 'timestamp' | 'read'>>) => void;
  preferences: NotificationPreferences;
  updatePreference: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
  playNotificationSound: () => void;
  requestBrowserPermission: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API chime generator for pleasant, zero-latency notification sounds
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Smooth dual-tone bell chime: D5 (587.3Hz) to A5 (880Hz)
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    playTone(587.33, now, 0.35);
    playTone(880.00, now + 0.08, 0.55);
  } catch {
    // Gracefully ignore audio constraints / browser autoplay policy
  }
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promoAlerts: true,
  soundEnabled: true,
  browserNotifications: false,
};

const getSeedNotifications = (): AppNotification[] => [
  {
    id: 'seed-welcome-promo',
    type: 'promo',
    title: 'Welcome to CR Cosmetics & Groceries!',
    message: 'Enjoy 10% off your first order today. Use code WELCOME10 at checkout.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    read: false,
    actionUrl: '/shop',
    priority: 'high',
  },
  {
    id: 'seed-accra-dispatch',
    type: 'delivery',
    title: 'Accra Express Delivery Active',
    message: 'Same-day delivery is active across Greater Accra for all orders placed before 3 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    read: false,
    actionUrl: '/shop',
  },
  {
    id: 'seed-skincare-routine',
    type: 'system',
    title: 'Personalized Routine Builder',
    message: 'Try our 4-step Routine Builder to match cleansers, serums, and hydration for your exact skin goals.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/routine-builder',
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { orders } = useStore();
  const storageKey = `cr_notifications_${user?.id || 'guest'}`;
  const prefsKey = `cr_notification_prefs_${user?.id || 'guest'}`;

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(prefsKey);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreference = useCallback(<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(prefsKey, JSON.stringify(updated));
      } catch {
        // Storage error ignored
      }
      return updated;
    });
  }, [prefsKey]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return getSeedNotifications();
  });

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  // Save to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {
      // Ignored
    }
  }, [notifications, storageKey]);

  // Sync with store orders: automatically create/update notifications for customer orders
  useEffect(() => {
    if (!preferences.orderUpdates || !orders || orders.length === 0) return;

    setNotifications(prev => {
      let changed = false;
      const updated = [...prev];

      orders.forEach(order => {
        const orderNotificationId = `order-status-${order.id}-${order.status}`;
        const exists = updated.some(n => n.id === orderNotificationId || (n.orderNumber === order.orderNumber && n.message.includes(order.status)));

        if (!exists) {
          changed = true;
          let message = `Order #${order.orderNumber} is currently ${order.status.toLowerCase()}.`;
          if (order.status === 'Delivered') {
            message = `Order #${order.orderNumber} has been delivered. Thank you for shopping with us!`;
          } else if (order.status === 'Out for Delivery') {
            message = `Rider is on the way with order #${order.orderNumber}.`;
          } else if (order.status === 'Processing') {
            message = `Order #${order.orderNumber} is being processed and packed.`;
          }

          updated.unshift({
            id: orderNotificationId,
            type: 'order',
            title: `Order #${order.orderNumber} Update`,
            message,
            timestamp: order.createdAt || new Date().toISOString(),
            read: false,
            actionUrl: `/account?tab=orders`,
            orderNumber: order.orderNumber,
            priority: order.status === 'Out for Delivery' ? 'high' : 'normal',
          });
        }
      });

      return changed ? updated : prev;
    });
  }, [orders, preferences.orderUpdates]);

  // Fetch server notifications if authenticated
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get<{ notifications: Array<{ id: string; type: string; title: string; message: string; actionUrl?: string; timestamp: string; read: boolean }> }>('/notifications');
      if (response && Array.isArray(response.notifications)) {
        setNotifications(prev => {
          const map = new Map<string, AppNotification>();
          // Preserve local notifications
          prev.forEach(n => map.set(n.id, n));
          // Merge server notifications
          response.notifications.forEach(s => {
            map.set(s.id, {
              id: s.id,
              type: (['order', 'promo', 'system', 'delivery'].includes(s.type) ? s.type : 'system') as NotificationType,
              title: s.title || 'Notification',
              message: s.message,
              timestamp: s.timestamp || new Date().toISOString(),
              read: s.read,
              actionUrl: s.actionUrl,
            });
          });
          return Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
      }
    } catch {
      // Fallback silently if offline or API unavailable
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void refreshNotifications();
    }
  }, [user, refreshNotifications]);

  // Notification sound handler
  const playNotificationSound = useCallback(() => {
    if (preferences.soundEnabled) {
      playNotificationChime();
    }
  }, [preferences.soundEnabled]);

  // Native Browser Notification Permission
  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      updatePreference('browserNotifications', granted);
      return granted;
    } catch {
      return false;
    }
  }, [updatePreference]);

  // Add new notification programmatically
  const addNotification = useCallback((item: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & Partial<Pick<AppNotification, 'id' | 'timestamp' | 'read'>>) => {
    // Respect user preferences
    if (item.type === 'order' && !preferences.orderUpdates) return;
    if (item.type === 'promo' && !preferences.promoAlerts) return;

    const newNotification: AppNotification = {
      id: item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: item.type,
      title: item.title,
      message: item.message,
      timestamp: item.timestamp || new Date().toISOString(),
      read: item.read ?? false,
      actionUrl: item.actionUrl,
      orderNumber: item.orderNumber,
      priority: item.priority || 'normal',
    };

    setNotifications(prev => [newNotification, ...prev]);

    if (preferences.soundEnabled) {
      playNotificationChime();
    }

    if (preferences.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignored
      }
    }
  }, [preferences]);

  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    // If not a local synthetic ID, notify server
    if (user && !id.startsWith('seed-') && !id.startsWith('order-status-') && !id.startsWith('notif-')) {
      try {
        await api.patch(`/notifications?id=${encodeURIComponent(id)}`, {});
      } catch {
        // Handled silently
      }
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (user) {
      try {
        await api.patch('/notifications', {});
      } catch {
        // Handled silently
      }
    }
  }, [user]);

  // Delete / Dismiss a single notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all read notifications
  const clearAllRead = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculated unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter(n => !n.read);
    if (activeFilter === 'order') return notifications.filter(n => n.type === 'order' || n.type === 'delivery');
    if (activeFilter === 'promo') return notifications.filter(n => n.type === 'promo');
    return notifications;
  }, [notifications, activeFilter]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeFilter,
        setActiveFilter,
        filteredNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
        clearAll,
        addNotification,
        preferences,
        updatePreference,
        playNotificationSound,
        requestBrowserPermission,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
