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
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { isDarkMode, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-stone-50 dark:bg-[#0d0a0a] flex">
      {/* Sidebar */}
      <div
        className={`fixed md:sticky md:top-0 z-40 h-screen flex-shrink-0 bg-white dark:bg-[#131010] border-r border-stone-200 dark:border-[#1f1a1a] transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        {/* Sidebar inner */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Store Logo & Branding */}
          <div className="px-4 py-6 border-b border-stone-200 dark:border-[#1f1a1a] flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 rounded-lg border border-stone-200 dark:border-[#1f1a1a] bg-white dark:bg-[#1a1515] p-2">
              <img
                src={store.storeSettings.storeLogo || logoImg}
                alt={store.storeSettings.storeName}
                className="w-8 h-8 rounded object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = logoImg; }}
              />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stone-900 dark:text-stone-50 text-sm truncate">
                  {store.storeSettings.storeName}
                </p>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-500 uppercase tracking-wider truncate">Admin panel</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1">
            {navGroups.map(group => {
              const groupItems = navItems.filter(item => item.group === group.key);
              return (
                <div key={group.key} className="mb-3">
                  {sidebarOpen && (
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600">
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
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left font-medium text-sm ${
                          isActive
                            ? 'bg-[#1E1719] text-white shadow-md'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1f1a1a]'
                        } ${!sidebarOpen ? 'justify-center px-2' : ''}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-stone-200 dark:border-[#1f1a1a] p-3 space-y-2">
            {confirmLogout ? (
              <div className={`flex gap-1.5 ${!sidebarOpen ? 'flex-col' : ''}`}>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold transition-colors hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  {sidebarOpen && <span>Logout</span>}
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border border-stone-200 dark:border-[#1f1a1a] text-stone-600 dark:text-stone-400 text-xs font-bold transition-colors hover:bg-stone-100 dark:hover:bg-[#1f1a1a]"
                >
                  <X className="w-4 h-4" />
                  {sidebarOpen && <span>Cancel</span>}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                title={!sidebarOpen ? 'Logout' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all text-sm font-medium ${
                  !sidebarOpen ? 'justify-center px-2' : ''
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
        <div className="bg-white dark:bg-[#131010] border-b border-stone-200 dark:border-[#1f1a1a] px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 dark:hover:bg-[#1f1a1a] rounded-lg transition-colors flex-shrink-0 md:hidden"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page Title */}
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 truncate">
              {tabLabels[currentTab] || 'Dashboard'}
            </h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {currentTab === 'products' && (
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1719] text-white rounded-lg font-medium text-sm hover:bg-[#33282C] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add product</span>
              </button>
            )}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#1f1a1a] rounded-lg p-1">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white dark:hover:bg-[#2a2024] rounded transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
