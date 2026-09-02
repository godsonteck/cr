import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Settings,
  Users,
  Truck,
  Flame,
  Tag,
  Bell,
  Search,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { AdminLoginView } from './AdminLoginView';
import { AdminDashboard } from './screens/AdminDashboard';
import { AdminProductsScreen } from './screens/AdminProductsScreen';
import { AdminOrdersScreen } from './screens/AdminOrdersScreen';
import { AdminAccountsManagementScreen } from './screens/AdminAccountsManagementScreen';
import { ProductModal } from './ProductModal';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import {
  AdminCustomersScreen,
  AdminFlashDealsScreen,
  AdminInventoryScreen,
  AdminNotificationsScreen,
  AdminPromotionsScreen,
  AdminSettingsScreen,
} from './screens/AdminOperationsScreens';
import logoImg from '../../assets/logo.jpeg';
import { Product, Order, Customer } from '../../types';

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'accounts'
  | 'promos'
  | 'flash'
  | 'notifications'
  | 'settings';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  group: 'main' | 'shop' | 'system';
}

const navItems: NavItem[] = [
  { id: 'overview',       label: 'Dashboard',  icon: BarChart3,      group: 'main'   },
  { id: 'products',       label: 'Products',   icon: Boxes,          group: 'shop'   },
  { id: 'orders',         label: 'Orders',     icon: ClipboardList,  group: 'shop'   },
  { id: 'inventory',      label: 'Stock',      icon: Truck,          group: 'shop'   },
  { id: 'customers',      label: 'Customers',  icon: Users,          group: 'shop'   },
  { id: 'promos',         label: 'Discounts',  icon: Tag,            group: 'shop'   },
  { id: 'flash',          label: 'Deals',      icon: Flame,          group: 'shop'   },
  { id: 'accounts',       label: 'Team',       icon: UserCheck,      group: 'system' },
  { id: 'notifications',  label: 'Alerts',     icon: Bell,           group: 'system' },
  { id: 'settings',       label: 'Settings',   icon: Settings,       group: 'system' },
];

const navGroups: { key: NavItem['group']; label: string }[] = [
  { key: 'main',   label: 'Start here' },
  { key: 'shop',   label: 'Store'     },
  { key: 'system', label: 'Manage'    },
];

const tabLabels: Record<AdminTab, string> = {
  overview:      'Dashboard',
  products:      'Products',
  orders:        'Orders',
  inventory:     'Inventory',
  customers:     'Customers',
  promos:        'Promotions',
  flash:         'Flash Deals',
  accounts:      'Admin Accounts',
  notifications: 'Alerts & Messages',
  settings:      'Settings',
};

export const AdminPortal: React.FC = () => {
  const store = useStore();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Default sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  // Inline logout confirm state
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Derive customers from orders for search and quick navigation
  const derivedCustomers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    (store.orders || []).forEach(order => {
      const email = order.shippingAddress?.email?.trim().toLowerCase() || '';
      const phone = order.shippingAddress?.phone?.trim() || '';
      const name = order.shippingAddress?.fullName?.trim() || 'Valued Customer';
      const key = email || phone || name;
      if (!key) return;

      const existing = map.get(key);
      const total = Number(order.total) || 0;
      if (!existing) {
        map.set(key, {
          id: 'cust-' + (email ? email.replace(/[^a-z0-9]/g, '-') : phone.replace(/[^0-9]/g, '')),
          fullName: name,
          email: email || `${phone.replace(/[^0-9]/g, '')}@customer.cr`,
          phone: phone || '',
          ordersCount: 1,
          totalSpent: total,
          segment: total >= 500 ? 'High Value' : 'New',
          status: 'Active',
          addresses: [order.shippingAddress],
          createdAt: order.createdAt,
        });
      } else {
        existing.ordersCount += 1;
        existing.totalSpent += total;
        existing.segment = existing.totalSpent >= 500 ? 'High Value' : 'Returning';
      }
    });
    return Array.from(map.values());
  }, [store.orders]);

  const unreadNotifications = useMemo(() => {
    const lowStock = (store.products || []).filter(p => p.stockCount <= 5).length;
    const pendingOrders = (store.orders || []).filter(o => o.status !== 'Delivered').length;
    return lowStock + pendingOrders;
  }, [store.products, store.orders]);

  // Auth gate
  if (!store.adminSession.isLoggedIn) {
    return <AdminLoginView onSuccess={() => {}} />;
  }

  const handleLogout = () => {
    if (confirmLogout) {
      store.logoutAdmin();
      showAlert('Logged out successfully', 'success');
      navigate('/');
    } else {
      setConfirmLogout(true);
      // Auto-cancel after 4 seconds if no second click
      setTimeout(() => setConfirmLogout(false), 4000);
    }
  };

  const handleAddProduct = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleTabChange = (tab: AdminTab) => {
    setCurrentTab(tab);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#130f10] flex">
      {/* Sidebar */}
      <div
        className={`fixed md:sticky md:top-0 z-40 h-screen flex-shrink-0 bg-white dark:bg-[#1a1316] border-r border-stone-200 dark:border-[#2e2428] transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-[72px] md:translate-x-0'
        }`}
      >
        {/* Sidebar inner — hidden when collapsed on mobile */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="px-4 py-5 border-b border-stone-200 dark:border-[#2e2428] flex items-center gap-3 min-w-0">
            <img
              src={logoImg}
              alt="CR Cosmetics"
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate leading-tight">CR Admin</p>
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider truncate">Store tools</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {navGroups.map(group => {
              const groupItems = navItems.filter(item => item.group === group.key);
              return (
                <div key={group.key} className="mb-2">
                  {/* Group label — only visible when sidebar is expanded */}
                  {sidebarOpen && (
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-600">
                      {group.label}
                    </p>
                  )}
                  {groupItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          isActive
                            ? 'bg-[#1E1719] text-white shadow-sm'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#2a2024]'
                        } ${!sidebarOpen ? 'justify-center' : ''}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {sidebarOpen && (
                          <span className="truncate text-sm font-medium">{item.label}</span>
                        )}
                        {sidebarOpen && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-stone-200 dark:border-[#2e2428] p-2">
            {confirmLogout ? (
              <div className={`flex items-center gap-1 ${!sidebarOpen ? 'flex-col' : ''}`}>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition-colors hover:bg-red-700"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  {sidebarOpen && <span>Confirm</span>}
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-stone-200 dark:border-[#2e2428] text-stone-600 dark:text-stone-400 text-xs font-bold transition-colors hover:bg-stone-100 dark:hover:bg-[#2a2024]"
                >
                  <X className="w-3.5 h-3.5 flex-shrink-0" />
                  {sidebarOpen && <span>Cancel</span>}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                title={!sidebarOpen ? 'Logout' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 transition-all text-sm font-medium ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>Logout</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428] px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 dark:hover:bg-[#2a2024] rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-4 h-4 text-stone-600 dark:text-stone-400" /> : <Menu className="w-4 h-4 text-stone-600 dark:text-stone-400" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-stone-400 dark:text-stone-600 hidden sm:inline">Store</span>
              <ChevronRight className="w-3 h-3 text-stone-300 dark:text-stone-700 hidden sm:inline flex-shrink-0" />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                {tabLabels[currentTab]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 text-xs transition-colors"
            >
              <Search className="w-4 h-4 text-stone-400" />
              <span>Search...</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleTabChange('notifications')}
              aria-label="Open alerts and messages"
              className="p-2 hover:bg-stone-100 dark:hover:bg-[#2a2024] rounded-xl transition-colors relative"
            >
              <Bell className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200 dark:border-[#2e2428]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                  {store.adminSession.adminName}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-stone-600 leading-tight">
                  {store.adminSession.adminRole}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('accounts')}
                aria-label="Open account settings"
                className="w-8 h-8 rounded-full bg-[#F2E3D7] dark:bg-[#3d2a22] flex items-center justify-center text-[#8A5738] dark:text-[#E8B792] font-bold text-sm flex-shrink-0 hover:ring-2 hover:ring-[#B27A52] transition-all"
              >
                {store.adminSession.adminName.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && <AdminDashboard onNavigate={setCurrentTab} />}
            {currentTab === 'products' && (
              <AdminProductsScreen
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onViewProduct={handleViewProduct}
              />
            )}
            {currentTab === 'orders'        && <AdminOrdersScreen onViewOrder={handleViewOrder} />}
            {currentTab === 'inventory'     && <AdminInventoryScreen onAddProduct={handleAddProduct} />}
            {currentTab === 'customers'     && <AdminCustomersScreen />}
            {currentTab === 'accounts'      && <AdminAccountsManagementScreen />}
            {currentTab === 'promos'        && <AdminPromotionsScreen />}
            {currentTab === 'flash'         && <AdminFlashDealsScreen />}
            {currentTab === 'notifications' && <AdminNotificationsScreen />}
            {currentTab === 'settings'      && <AdminSettingsScreen />}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={productToEdit}
      />
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(orderId, status, riderInfo) => store.updateOrderStatus(orderId, status, riderInfo)}
        onUpdatePayment={(orderId, paymentStatus) => store.updatePaymentStatus(orderId, paymentStatus)}
        onDeleteOrder={(orderId) => store.deleteOrder(orderId)}
        onPrintReceipt={(order) => setOrderToPrint(order)}
      />
      <InvoicePrintModal
        order={orderToPrint}
        storeSettings={store.storeSettings}
        isOpen={!!orderToPrint}
        onClose={() => setOrderToPrint(null)}
      />
      <GlobalCommandPalette
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(''); }}
        products={store.products}
        orders={store.orders}
        customers={derivedCustomers}
        onSelectProduct={handleEditProduct}
        onSelectOrder={handleViewOrder}
        onSelectCustomer={() => handleTabChange('customers')}
        onNavigateTab={(tabId) => {
          if (tabId === 'products-new') handleAddProduct();
          else handleTabChange(tabId as AdminTab);
        }}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
