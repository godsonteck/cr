import React, { useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { AdminLoginView } from './AdminLoginView';
import { AdminDashboard } from './screens/AdminDashboard';
import { AdminProductsScreen } from './screens/AdminProductsScreen';
import { AdminOrdersScreen } from './screens/AdminOrdersScreen';
import { AdminAccountsManagementScreen } from './screens/AdminAccountsManagementScreen';
import {
  AdminCustomersScreen,
  AdminFlashDealsScreen,
  AdminInventoryScreen,
  AdminNotificationsScreen,
  AdminPromotionsScreen,
  AdminSettingsScreen,
} from './screens/AdminOperationsScreens';
import logoImg from '../../assets/logo.jpeg';
import { Product, Order } from '../../types';

type AdminTab = 'overview' | 'products' | 'orders' | 'inventory' | 'customers' | 'accounts' | 'promos' | 'flash' | 'notifications' | 'settings';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  group: 'main' | 'shop' | 'reports' | 'system';
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3, group: 'main' },
  { id: 'products', label: 'Products', icon: Boxes, group: 'shop' },
  { id: 'orders', label: 'Orders', icon: ClipboardList, group: 'shop' },
  { id: 'inventory', label: 'Inventory', icon: Truck, group: 'shop' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'shop' },
  { id: 'accounts', label: 'Accounts', icon: UserCheck, group: 'system' },
  { id: 'promos', label: 'Promotions', icon: Tag, group: 'shop' },
  { id: 'flash', label: 'Flash Deals', icon: Flame, group: 'shop' },
  { id: 'notifications', label: 'Alerts & Messages', icon: Bell, group: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'system' },
];

export const AdminPortal: React.FC = () => {
  const store = useStore();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth gate
  if (!store.adminSession.isLoggedIn) {
    return <AdminLoginView onSuccess={() => {}} />;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      store.logoutAdmin();
      showAlert('Logged out successfully', 'success');
      navigate('/');
    }
  };

  const handleAddProduct = () => {
    showAlert('Product creation coming soon', 'info');
  };

  const handleEditProduct = (product: Product) => {
    showAlert(`Edit mode for ${product.name}`, 'info');
  };

  const handleViewProduct = (product: Product) => {
    showAlert(`Viewing ${product.name}`, 'info');
  };

  const handleViewOrder = (order: Order) => {
    showAlert(`Viewing order ${order.orderNumber}`, 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 h-screen bg-white dark:bg-[#201b1a] border-r border-gray-200 dark:border-[#483d39] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-6 border-b border-gray-200 dark:border-[#483d39]">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="CR Cosmetics" className="w-10 h-10 rounded-lg object-cover" />
              {sidebarOpen && <span className="font-bold text-gray-900 truncate">CR Admin</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-[#201b1a] border-b border-gray-200 dark:border-[#483d39] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block text-sm text-gray-600">
              Welcome back, <span className="font-semibold text-gray-900">{store.adminSession.adminName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>

            {/* Notifications */}
            <button onClick={() => setCurrentTab('notifications')} aria-label="Open alerts and messages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{store.adminSession.adminName}</p>
                <p className="text-xs text-gray-500">{store.adminSession.adminRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                {store.adminSession.adminName.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && <AdminDashboard />}
            {currentTab === 'products' && (
              <AdminProductsScreen
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onViewProduct={handleViewProduct}
              />
            )}
            {currentTab === 'orders' && <AdminOrdersScreen onViewOrder={handleViewOrder} />}
            {currentTab === 'inventory' && <AdminInventoryScreen />}
            {currentTab === 'customers' && <AdminCustomersScreen />}
            {currentTab === 'accounts' && <AdminAccountsManagementScreen />}
            {currentTab === 'promos' && <AdminPromotionsScreen />}
            {currentTab === 'flash' && <AdminFlashDealsScreen />}
            {currentTab === 'notifications' && <AdminNotificationsScreen />}
            {currentTab === 'settings' && <AdminSettingsScreen />}
          </div>
        </div>
      </div>

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
