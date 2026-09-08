import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Sliders, 
  X, 
  Trash2, 
  Package, 
  Truck, 
  Tag, 
  Sparkles, 
  Info, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { useNotifications, AppNotification, NotificationFilter } from '../../context/NotificationContext';

// Helper for formatting friendly relative timestamps
function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const HeaderNotifications: React.FC = () => {
  const navigate = useNavigate();
  const {
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
    preferences,
    updatePreference,
    playNotificationSound,
    requestBrowserPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setShowSettings(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      void markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      setIsOpen(false);
      navigate(notification.actionUrl);
    } else if (notification.orderNumber) {
      setIsOpen(false);
      navigate('/account?tab=orders');
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4 text-[var(--accent)]" />;
      case 'delivery':
        return <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'promo':
        return <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const orderCount = notifications.filter(n => n.type === 'order' || n.type === 'delivery').length;
  const promoCount = notifications.filter(n => n.type === 'promo').length;
  const readCount = notifications.filter(n => n.read).length;

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          if (!isOpen) setShowSettings(false);
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition duration-200 ${
          isOpen
            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
            : 'border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
        }`}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Notifications"
      >
        <Bell className={`h-4 w-4 transition-transform duration-200 ${unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`} />

        {/* Unread badge indicator */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-[var(--bg-card)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-4 w-4 animate-ping rounded-full bg-[var(--accent)] opacity-40 pointer-events-none" />
          </>
        )}
      </button>

      {/* Popover Dropdown Window */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
            onClick={() => {
              setIsOpen(false);
              setShowSettings(false);
            }}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-label="Notification center"
            className="fixed inset-x-3.5 top-[60px] z-50 max-h-[84vh] sm:max-h-none sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2.5 w-auto sm:w-[420px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 sm:origin-top-right overflow-hidden flex flex-col"
          >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-soft)]/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <BellRing className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Notifications
                </h3>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">Read all</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSettings(prev => !prev)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  showSettings
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-subtle)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
                title="Notification preferences"
                aria-label="Notification settings"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-subtle)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                title="Close"
                aria-label="Close notifications"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Settings Drawer (When Sliders clicked) */}
          {showSettings && (
            <div className="border-b border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 space-y-3 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-subtle)]">
                  Notification Preferences
                </span>
                <span className="text-[10px] text-[var(--text-subtle)]">Saved automatically</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer rounded-lg bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-primary)]">Order &amp; Delivery updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => updatePreference('orderUpdates', e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer rounded-lg bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-primary)]">Promos &amp; Flash deals</span>
                  <input
                    type="checkbox"
                    checked={preferences.promoAlerts}
                    onChange={(e) => updatePreference('promoAlerts', e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)] rounded"
                  />
                </label>

                <div className="flex items-center justify-between rounded-lg bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">Sound alerts</span>
                    <button
                      type="button"
                      onClick={() => playNotificationSound()}
                      className="inline-flex items-center gap-1 rounded bg-[var(--bg-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/15"
                      title="Test chime sound"
                    >
                      <Volume2 className="h-3 w-3" /> Test
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)] rounded"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-primary)]">Browser push alerts</span>
                  <button
                    type="button"
                    onClick={() => void requestBrowserPermission()}
                    className="rounded bg-[var(--accent)] px-2 py-1 text-[10px] font-bold text-white transition hover:opacity-90"
                  >
                    {preferences.browserNotifications ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Chips Bar */}
          <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] px-3 py-2 text-[11px] overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'order', label: 'Orders', count: orderCount },
                { id: 'promo', label: 'Offers', count: promoCount },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as NotificationFilter)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-bold transition ${
                  activeFilter === tab.id
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--bg-soft)] text-[var(--text-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1 rounded-full ${activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--bg-card)] text-[var(--text-subtle)]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Notification List Container */}
          <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto divide-y divide-[var(--border-color)]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(item => (
                <div
                  key={item.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    !item.read
                      ? 'bg-[var(--accent)]/[0.04] hover:bg-[var(--accent)]/[0.08] border-l-[3px] border-l-[var(--accent)] pl-3'
                      : 'hover:bg-[var(--bg-soft)]/60'
                  }`}
                  onClick={() => handleNotificationClick(item)}
                >
                  {/* Icon Column */}
                  <div className="relative mt-0.5 shrink-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-soft)] border border-[var(--border-color)]">
                      {getNotificationIcon(item.type)}
                    </span>
                    {!item.read && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-card)]" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs ${!item.read ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-muted)]'}`}>
                        {item.title}
                      </h4>
                      <span className="shrink-0 text-[10px] text-[var(--text-subtle)]">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)] line-clamp-2">
                      {item.message}
                    </p>

                    {/* Quick action tags & pills */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {item.orderNumber && (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--bg-soft)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--accent)] border border-[var(--border-color)]">
                          <Package className="h-2.5 w-2.5" />
                          #{item.orderNumber}
                        </span>
                      )}

                      {item.actionUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] hover:underline">
                          View details <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Per-item action buttons (hover or mobile tap) */}
                  <div className="shrink-0 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void markAsRead(item.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteNotification(item.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-rose-500/10 hover:text-rose-500 transition"
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="py-12 px-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-soft)] text-[var(--text-subtle)] mb-3">
                  <Bell className="h-5 w-5 opacity-40" />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications in this tab'}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-subtle)]">
                  {activeFilter === 'unread'
                    ? "You're all caught up on your alerts and orders."
                    : 'Updates and promotions will appear here.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-soft)]/50 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-3">
              {readCount > 0 && (
                <button
                  type="button"
                  onClick={() => void clearAllRead()}
                  className="text-[11px] font-semibold text-[var(--text-subtle)] hover:text-rose-600 transition"
                  title="Remove all read notifications"
                >
                  Clear read ({readCount})
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => void clearAll()}
                  className="text-[11px] font-semibold text-[var(--text-subtle)] hover:text-rose-600 transition"
                  title="Clear all notifications"
                >
                  Clear all
                </button>
              )}
              {notifications.length === 0 && (
                <span className="text-[11px] text-[var(--text-subtle)]">
                  All caught up
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/account?tab=notifications');
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline"
            >
              <span>Account Notifications</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);
};
