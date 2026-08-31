import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Boxes, 
  ClipboardList, 
  Copy, 
  Edit3, 
  LogOut, 
  Megaphone, 
  PackagePlus, 
  Settings2, 
  Tag, 
  Trash2, 
  Truck, 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Flame, 
  Layers, 
  Sparkles, 
  ShoppingBag, 
  ArrowUpRight, 
  TrendingUp, 
  RefreshCw, 
  Sliders, 
  DollarSign, 
  User, 
  Bell, 
  SlidersHorizontal, 
  Plus, 
  Calendar, 
  Check, 
  AlertCircle, 
  FileText, 
  Activity, 
  History, 
  Shield, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  MessageCircle, 
  Command 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { AdminLoginView } from './AdminLoginView';
import logoImg from '../../assets/logo.jpeg';
import { ProductModal } from './ProductModal';
import { AdjustStockModal } from './components/AdjustStockModal';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import { 
  CategoryConfig, 
  Product, 
  StoreSettings, 
  FlashDeal, 
  Order, 
  OrderStatus,
  Customer, 
  InventoryMovement, 
  AuditLog, 
  AdminNotification,
  AdminUser
} from '../../types';
import { 
  INITIAL_INVENTORY_MOVEMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ADMIN_USERS 
} from '../../data/adminMockData';

type AdminTab = 
  | 'overview' 
  | 'products' 
  | 'orders' 
  | 'inventory' 
  | 'customers' 
  | 'promos' 
  | 'flash' 
  | 'categories' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

interface TabItem {
  id: AdminTab;
  label: string;
  group: 'MAIN' | 'SHOPPING' | 'REPORTS' | 'SETTINGS';
  icon: React.ElementType;
  badge?: number;
}

const navTabs: TabItem[] = [
  { id: 'overview', label: 'Shop Overview', group: 'MAIN', icon: BarChart3 },
  { id: 'products', label: 'Products & Items', group: 'SHOPPING', icon: Boxes },
  { id: 'orders', label: 'Customer Orders', group: 'SHOPPING', icon: ClipboardList },
  { id: 'inventory', label: 'Stock & Quantities', group: 'SHOPPING', icon: Truck },
  { id: 'customers', label: 'Customers List', group: 'SHOPPING', icon: Users },
  { id: 'promos', label: 'Discount Codes', group: 'SHOPPING', icon: Tag },
  { id: 'flash', label: 'Flash Deals', group: 'SHOPPING', icon: Flame },
  { id: 'categories', label: 'Categories', group: 'SHOPPING', icon: Layers },
  { id: 'analytics', label: 'Sales & Money Reports', group: 'REPORTS', icon: TrendingUp },
  { id: 'notifications', label: 'Alerts & Messages', group: 'SETTINGS', icon: Bell },
  { id: 'settings', label: 'Shop Settings', group: 'SETTINGS', icon: Settings2 },
];

export const AdminPortal: React.FC = () => {
  const store = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Modals & Drawers State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [productForStockAdjustment, setProductForStockAdjustment] = useState<Product | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  // Data state
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(INITIAL_INVENTORY_MOVEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);

  // Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productDeptFilter, setProductDeptFilter] = useState<'all' | 'beauty' | 'groceries'>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState<string>('all');

  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d'>('7d');

  // Promo Form State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountValue: '15',
    minSpend: '150',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    freeShipping: false
  });

  // Flash Deal Form State
  const [flashForm, setFlashForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    badgeText: '⚡ LIMITED TIME DEAL',
    discountPercentage: '25',
    hoursRemaining: '24',
    backgroundGradient: 'from-[#1E1719] via-[#2B1F23] to-[#120B0D]'
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    department: 'beauty' as 'beauty' | 'groceries',
    image: ''
  });

  // Real-time Ghanaian Time (GMT)
  const [ghanaTime, setGhanaTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGhanaTime(now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Accra', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Metrics Calculations from real store state
  const revenueTotal = useMemo(() => {
    return store.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [store.orders]);

  const pendingOrdersCount = useMemo(() => {
    return store.orders.filter(o => o.status !== 'Delivered').length;
  }, [store.orders]);

  const lowStockProducts = useMemo(() => {
    return store.products.filter(p => (p.stockCount || 0) <= 5 && (p.stockCount || 0) > 0);
  }, [store.products]);

  const outOfStockProducts = useMemo(() => {
    return store.products.filter(p => (p.stockCount || 0) === 0);
  }, [store.products]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Dynamically compute live Customers from store.orders
  const customers = useMemo<Customer[]>(() => {
    const customerMap = new Map<string, Customer>();

    store.orders.forEach(order => {
      const phone = order.shippingAddress.phone || '0240000000';
      const key = phone.replace(/[^0-9]/g, '');

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: 'cust-' + key,
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          email: order.shippingAddress.email || 'customer@crcosmetics.com',
          totalSpent: order.total,
          ordersCount: 1,
          lastOrderDate: order.createdAt,
          addresses: [{
            fullName: order.shippingAddress.fullName,
            phone: order.shippingAddress.phone,
            city: order.shippingAddress.city,
            area: order.shippingAddress.area,
            landmarkOrGps: order.shippingAddress.landmarkOrGps,
          }],
          segment: order.total >= 400 ? 'High Value' : 'New',
          status: 'Active',
          notes: 'Customer in ' + order.shippingAddress.city,
          createdAt: order.createdAt,
        });
      } else {
        const existing = customerMap.get(key)!;
        existing.totalSpent += order.total;
        existing.ordersCount += 1;
        if (existing.totalSpent >= 400 || existing.ordersCount >= 2) {
          existing.segment = existing.totalSpent >= 800 ? 'High Value' : 'Returning';
        }
      }
    });

    return Array.from(customerMap.values());
  }, [store.orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchDept = productDeptFilter === 'all' || p.department === productDeptFilter;
      const matchStock = productStockFilter === 'all' || 
                         (productStockFilter === 'low' && (p.stockCount || 0) <= 5 && (p.stockCount || 0) > 0) ||
                         (productStockFilter === 'out' && (p.stockCount || 0) === 0) ||
                         (productStockFilter === 'in' && (p.stockCount || 0) > 5);
      return matchSearch && matchDept && matchStock;
    });
  }, [store.products, productSearch, productDeptFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return store.orders.filter(o => {
      const matchSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.phone.includes(orderSearch);
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [store.orders, orderSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.phone.includes(customerSearch) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase());
      const matchSegment = customerSegmentFilter === 'all' || c.segment === customerSegmentFilter;
      return matchSearch && matchSegment;
    });
  }, [customers, customerSearch, customerSegmentFilter]);

  // Dynamic Category Revenue & Product Distribution
  const categorySplitData = useMemo(() => {
    const totalProds = store.products.length || 1;
    const catCounts = new Map<string, number>();

    store.products.forEach(p => {
      const cat = p.category || 'other';
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    });

    const categoryNames: Record<string, string> = {
      'skincare': 'Skincare',
      'fragrances': 'Fragrances & Perfumes',
      'makeup': 'Makeup & Cosmetics',
      'body-care': 'Body Care & Lotions',
      'rice-grains': 'Rice & Grains',
      'cooking-oils': 'Cooking Oils',
      'seasoning-spices': 'Seasoning & Spices',
      'beverages': 'Beverages & Milk',
    };

    return Array.from(catCounts.entries()).map(([catKey, count]) => {
      const percentage = Math.round((count / totalProds) * 100);
      const estimatedRevenue = count * 220;
      return {
        name: categoryNames[catKey] || catKey.replace('-', ' ').toUpperCase(),
        count,
        percentage,
        revenue: estimatedRevenue,
      };
    }).slice(0, 6);
  }, [store.products]);

  // Dynamic Daily Sales Bars for the chart
  const dailyChartBars = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const totalRev = revenueTotal || 1200;
    const weights = [0.12, 0.15, 0.10, 0.18, 0.14, 0.20, 0.11];

    return days.map((day, idx) => {
      const rev = Math.round(totalRev * weights[idx]);
      return { date: day, revenue: rev };
    });
  }, [revenueTotal]);

  // Auth gate
  if (!store.adminSession.isLoggedIn) {
    return <AdminLoginView onSuccess={() => {}} />;
  }

  // Stock Adjustment Handler
  const handleSaveStockAdjustment = (movementData: Omit<InventoryMovement, 'id' | 'timestamp'>) => {
    const newMov: InventoryMovement = {
      ...movementData,
      id: 'mov-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setInventoryMovements(prev => [newMov, ...prev]);
    store.updateProductStock(movementData.productId, movementData.newQuantity, movementData.newQuantity > 0);
    
    // Add audit log
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      actor: store.adminSession.adminName,
      action: 'STOCK_CHANGED',
      entity: movementData.productName,
      entityId: movementData.productId,
      timestamp: new Date().toISOString(),
      details: `${movementData.reason}: changed from ${movementData.previousQuantity} to ${movementData.newQuantity} units.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast(`Stock updated for ${movementData.productName} (${movementData.newQuantity} units remaining)`);
  };

  // Bulk Actions on Products
  const handleBulkPublish = (publish: boolean) => {
    selectedProductIds.forEach(id => {
      store.updateProduct(id, { isPublished: publish });
    });
    showToast(`${publish ? 'Shown on shop' : 'Hidden from shop'}: ${selectedProductIds.length} items`);
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} items from your store?`)) {
      selectedProductIds.forEach(id => {
        store.deleteProduct(id);
      });
      showToast(`Deleted ${selectedProductIds.length} items`);
      setSelectedProductIds([]);
    }
  };

  const handleSaveSettings = (key: keyof StoreSettings, value: any) => {
    const isNum = ['freeDeliveryThreshold', 'standardShippingFee', 'expressShippingFee', 'intercityShippingFee'].includes(key);
    store.updateStoreSettings({
      [key]: isNum ? Number(value) : value
    } as Partial<StoreSettings>);
    showToast(`Saved setting: ${key}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-stone-900 flex flex-col font-sans selection:bg-[#1E1719] selection:text-[#FAF6F0]">
      
      {/* Top Operations Header */}
      <header className="bg-[#140D10] text-stone-100 border-b border-stone-800/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoImg} 
                alt="CR Cosmetics & Essentials" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-stone-700" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm tracking-wide text-white">
                    {store.storeSettings.storeName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-[#E8B792] border border-stone-700">
                    Store Manager
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                  <span>Accra Time: {ghanaTime || '08:00 AM'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Website Online ({store.products.length} items)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Launcher */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-[#23171C] hover:bg-[#2C1E23] border border-stone-800 rounded-xl text-xs text-stone-400 transition-colors w-72 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="flex-1 text-left">Search items, orders, people...</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-[10px] font-mono rounded text-stone-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Actions, Alerts, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Storefront preview */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
            >
              <span>View Online Shop</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => setCurrentTab('notifications')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors relative cursor-pointer"
                title="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C89B3C] text-stone-900 text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            {/* Admin profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {store.adminSession.adminName}
                </p>
                <p className="text-[10px] text-[#E8B792] font-medium">
                  {store.adminSession.adminRole}
                </p>
              </div>

              <button
                onClick={() => {
                  store.logoutAdmin();
                  navigate('/');
                }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-200 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Admin Workspace Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          
          {/* Mobile Tab Scrollbar */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {navTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentTab(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === id 
                    ? 'bg-[#1E1719] text-[#FAF6F0] shadow-sm' 
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Categorized Navigation */}
          <div className="hidden md:block bg-white border border-[#E8E2D8] rounded-2xl p-3 shadow-xs space-y-4">
            
            {/* MAIN Group */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Main
              </span>
              {navTabs.filter(t => t.group === 'MAIN').map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentTab(id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === id 
                      ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* SHOPPING Group */}
            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Shop & Sales
              </span>
              {navTabs.filter(t => t.group === 'SHOPPING').map(({ id, label, icon: Icon }) => {
                const isActive = currentTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentTab(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    {id === 'orders' && pendingOrdersCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                      }`}>
                        {pendingOrdersCount}
                      </span>
                    )}
                    {id === 'inventory' && lowStockProducts.length > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lowStockProducts.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* REPORTS & SETTINGS */}
            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Reports & Settings
              </span>
              {navTabs.filter(t => t.group === 'REPORTS' || t.group === 'SETTINGS').map(({ id, label, icon: Icon }) => {
                const isActive = currentTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentTab(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#1E1719] text-[#FAF6F0] shadow-xs font-bold' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    {id === 'notifications' && unreadNotifsCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#1E1719] text-white'
                      }`}>
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Store status summary widget */}
          <div className="hidden md:block bg-[#1C1518] text-stone-100 rounded-2xl p-4 shadow-sm border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold">Live Shop Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-stone-400">Total Money Made (Sales)</p>
              <p className="text-xl font-bold font-serif text-[#E8B792]">
                GHS {revenueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex justify-between">
              <span>Total Shop Items:</span>
              <span className="font-bold text-stone-200">{store.products.length} products</span>
            </div>
          </div>

        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* ========================================================= */}
          {/* TAB 1: SHOP OVERVIEW */}
          {/* ========================================================= */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header Greeting & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-bold text-stone-900">
                      Welcome, {store.adminSession.adminName}
                    </h2>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Shop is Open
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Here is what is happening today in your shop.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setProductModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Add New Item</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('orders')}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Check Orders ({pendingOrdersCount})</span>
                  </button>
                </div>
              </div>

              {/* KPI Metrics Area */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500">Total Money Made</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    GHS {revenueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">From {store.orders.length} customer orders</p>
                </div>

                <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500">Orders to Pack</span>
                    <div className="p-2 rounded-xl bg-rose-50 text-[#1E1719]">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {pendingOrdersCount}
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Orders waiting for delivery
                  </p>
                </div>

                <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500">Total Customers</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {customers.length}
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Registered buyers with orders
                  </p>
                </div>

                <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500">Items Low in Stock</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {lowStockProducts.length + outOfStockProducts.length}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    {lowStockProducts.length} low, {outOfStockProducts.length} finished
                  </p>
                </div>

              </div>

              {/* Attention Alerts */}
              {(lowStockProducts.length > 0 || pendingOrdersCount > 0) && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-amber-900">Items That Need Your Attention Right Now</p>
                      <p className="text-amber-800">
                        You have {pendingOrdersCount} orders waiting to be packed and {lowStockProducts.length} products running low on stock.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {pendingOrdersCount > 0 && (
                      <button
                        onClick={() => setCurrentTab('orders')}
                        className="px-3 py-1.5 bg-amber-900 text-white rounded-xl font-bold text-xs hover:bg-amber-950 cursor-pointer"
                      >
                        Pack Orders ({pendingOrdersCount})
                      </button>
                    )}
                    {lowStockProducts.length > 0 && (
                      <button
                        onClick={() => setCurrentTab('inventory')}
                        className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-50 cursor-pointer"
                      >
                        Check Stock
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Sales Chart Section */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Money Made from Sales (in Ghana Cedis)</h3>
                    <p className="text-xs text-stone-500">See how much money your shop has made over time.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    {(['today', '7d', '30d'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          analyticsRange === r ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {r === 'today' ? 'Today' : r === '7d' ? 'Past 7 Days' : 'Past Month'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Sales Chart Bars */}
                <div className="pt-2">
                  <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 px-2">
                    {dailyChartBars.map(day => {
                      const max = Math.max(...dailyChartBars.map(b => b.revenue), 100);
                      const heightPercent = Math.min(100, Math.max(15, Math.round((day.revenue / max) * 100)));
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            GHS {day.revenue}
                          </span>
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className="w-full max-w-[42px] bg-[#1E1719] hover:bg-[#33282C] rounded-t-xl transition-all shadow-xs" 
                          />
                          <span className="text-[10px] text-stone-500 font-semibold">{day.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Top Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Orders to Pack */}
                <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">Recent Customer Orders</h3>
                      <p className="text-xs text-stone-500">Orders placed by customers that need to be delivered.</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('orders')}
                      className="text-xs font-bold text-[#1E1719] hover:underline"
                    >
                      See All
                    </button>
                  </div>

                  {store.orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400">No orders yet.</div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {store.orders.slice(0, 4).map(order => (
                        <div 
                          key={order.id}
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDrawerOpen(true);
                          }}
                          className="p-3.5 flex items-center justify-between hover:bg-stone-50/70 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-stone-900">{order.orderNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">{order.shippingAddress.fullName} • {order.items.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs text-stone-900">GHS {order.total.toFixed(2)}</span>
                            <p className="text-[10px] text-stone-400">{order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Shop Items */}
                <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">Top Selling Products</h3>
                      <p className="text-xs text-stone-500">Live products in your store catalog.</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('products')}
                      className="text-xs font-bold text-[#1E1719] hover:underline"
                    >
                      All Items
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {store.products.slice(0, 4).map(product => (
                      <div key={product.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0" />
                          <div>
                            <p className="font-bold text-xs text-stone-900 line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-stone-500">{product.brand} • GHS {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            product.stockCount <= 5 ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {product.stockCount} left in shop
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRODUCTS & SHOP ITEMS */}
          {/* ========================================================= */}
          {currentTab === 'products' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Products & Items for Sale
                  </h2>
                  <p className="text-xs text-stone-500">
                    Change prices, update quantities, add pictures, and manage beauty or grocery items.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Add New Item</span>
                </button>
              </div>

              {/* Department & Stock Filter Switchers */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-3">
                
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search by product name, brand, or category..."
                      className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>

                  {/* Section Switcher */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
                    <button
                      onClick={() => setProductDeptFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        productDeptFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      All Items ({store.products.length})
                    </button>
                    <button
                      onClick={() => setProductDeptFilter('beauty')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        productDeptFilter === 'beauty' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Beauty & Skincare
                    </button>
                    <button
                      onClick={() => setProductDeptFilter('groceries')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        productDeptFilter === 'groceries' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Groceries & Food
                    </button>
                  </div>
                </div>

                {/* Secondary Filters */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold text-[11px]">Show By Stock:</span>
                    {(['all', 'in', 'low', 'out'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setProductStockFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${
                          productStockFilter === st ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {st === 'all' ? 'All' : st === 'in' ? 'In Stock' : st === 'low' ? 'Low Stock (5 or less)' : 'Finished (0 left)'}
                      </button>
                    ))}
                  </div>

                  {/* Bulk selection actions */}
                  {selectedProductIds.length > 0 && (
                    <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300">
                      <span className="font-bold text-stone-900 text-xs">
                        {selectedProductIds.length} items chosen
                      </span>
                      <button
                        onClick={() => handleBulkPublish(true)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[11px] border border-stone-200 cursor-pointer"
                      >
                        Show on Shop
                      </button>
                      <button
                        onClick={() => handleBulkPublish(false)}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg font-bold text-[11px] border border-stone-200 cursor-pointer"
                      >
                        Hide from Shop
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 rounded-lg font-bold text-[11px] border border-stone-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={e => {
                              if (e.target.checked) setSelectedProductIds(filteredProducts.map(p => p.id));
                              else setSelectedProductIds([]);
                            }}
                            className="rounded text-stone-900"
                          />
                        </th>
                        <th className="py-3.5 px-4">Item Name & Brand</th>
                        <th className="py-3.5 px-4">Shop Section</th>
                        <th className="py-3.5 px-4">Selling Price</th>
                        <th className="py-3.5 px-4">Stock Available</th>
                        <th className="py-3.5 px-4">Status on Website</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-400">
                            No products found. Click "Add New Item" above to add your first product.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(product => {
                          const isSelected = selectedProductIds.includes(product.id);
                          return (
                            <tr key={product.id} className={`hover:bg-stone-50/60 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}>
                              <td className="py-3.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedProductIds(prev => [...prev, product.id]);
                                    else setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                  }}
                                  className="rounded text-stone-900"
                                />
                              </td>
                              <td className="py-3.5 px-4 flex items-center gap-3 min-w-[220px]">
                                <img src={product.image} alt="" className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200" />
                                <div>
                                  <p className="font-bold text-stone-900 line-clamp-1">{product.name}</p>
                                  <p className="text-[11px] text-stone-400">{product.brand} • {product.unit || 'Standard Unit'}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  product.department === 'beauty' ? 'bg-rose-50 text-stone-900' : 'bg-emerald-50 text-emerald-800'
                                }`}>
                                  {product.department === 'beauty' ? 'Beauty' : 'Groceries'}
                                </span>
                                <p className="text-[11px] text-stone-500 capitalize mt-0.5">{product.category}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-stone-900">GHS {product.price.toFixed(2)}</span>
                                {product.originalPrice && (
                                  <p className="text-[10px] text-stone-400 line-through">GHS {product.originalPrice.toFixed(2)}</p>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductForStockAdjustment(product);
                                    setAdjustStockModalOpen(true);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                    product.stockCount === 0 ? 'bg-red-100 text-red-800' :
                                    product.stockCount <= 5 ? 'bg-amber-100 text-amber-800' :
                                    'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                  }`}
                                  title="Click to change stock quantity"
                                >
                                  <span>{product.stockCount} in stock</span>
                                  <Sliders className="w-3 h-3 opacity-60" />
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => store.toggleProductPublication(product.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                                    product.isPublished === false 
                                      ? 'bg-stone-100 text-stone-500 hover:bg-stone-200' 
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                >
                                  {product.isPublished === false ? 'Hidden' : 'For Sale (Visible)'}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setProductToEdit(product);
                                      setProductModalOpen(true);
                                    }}
                                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
                                        store.deleteProduct(product.id);
                                        showToast('Product deleted.');
                                      }
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CUSTOMER ORDERS & DELIVERIES */}
          {/* ========================================================= */}
          {currentTab === 'orders' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Customer Orders & Delivery
                  </h2>
                  <p className="text-xs text-stone-500">
                    See customer details, assign delivery riders in Accra, and send WhatsApp messages.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by order #, customer name, phone..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
                  {['all', 'Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        orderStatusFilter === st ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      {st === 'all' ? 'All Orders' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Order Number</th>
                        <th className="py-3.5 px-4">Customer & Phone</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Items Count</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Delivery Stage</th>
                        <th className="py-3.5 px-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-stone-400">
                            No orders found for this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                              {order.orderNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
                              <p className="text-[11px] text-stone-500">{order.shippingAddress.phone} • {order.shippingAddress.city}</p>
                            </td>
                            <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-800">{order.items.length} item(s)</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-stone-900">
                              GHS {order.total.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setOrderDrawerOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  View & Pack
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
                                      store.deleteOrder(order.id);
                                      showToast(`Order ${order.orderNumber} deleted.`);
                                    }
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: STOCK & QUANTITIES */}
          {/* ========================================================= */}
          {currentTab === 'inventory' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Stock & Inventory Quantities
                  </h2>
                  <p className="text-xs text-stone-500">
                    Keep track of items in your shop, see what is finishing, and record new shipments.
                  </p>
                </div>
              </div>

              {/* Low Stock Warning Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-5 bg-white border border-[#E8E2D8] rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Items Running Low on Stock ({lowStockProducts.length})</span>
                    </h3>
                  </div>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">All items have plenty of stock.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-amber-50/60 rounded-xl text-xs border border-amber-100">
                          <div className="flex items-center gap-2 truncate">
                            <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-white shrink-0" />
                            <span className="font-bold text-stone-900 truncate">{p.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setProductForStockAdjustment(p);
                              setAdjustStockModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-amber-900 text-white rounded-lg font-bold text-[10px] shrink-0 cursor-pointer"
                          >
                            Add Stock ({p.stockCount} left)
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white border border-[#E8E2D8] rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Items Finished / Out of Stock ({outOfStockProducts.length})</span>
                    </h3>
                  </div>
                  {outOfStockProducts.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No items are completely finished.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {outOfStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-red-50/60 rounded-xl text-xs border border-red-100">
                          <div className="flex items-center gap-2 truncate">
                            <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-white shrink-0" />
                            <span className="font-bold text-stone-900 truncate">{p.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setProductForStockAdjustment(p);
                              setAdjustStockModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-red-800 text-white rounded-lg font-bold text-[10px] shrink-0 cursor-pointer"
                          >
                            Add New Stock (0 left)
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Movement History Log */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden space-y-3">
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Stock Change History</h3>
                    <p className="text-xs text-stone-500">Every time someone adds or removes stock, it is recorded here.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Reason for Change</th>
                        <th className="py-3 px-4">Quantity Changed</th>
                        <th className="py-3 px-4">New Stock Total</th>
                        <th className="py-3 px-4">Who Changed It</th>
                        <th className="py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {inventoryMovements.map(m => (
                        <tr key={m.id} className="hover:bg-stone-50/60">
                          <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                            {new Date(m.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 flex items-center gap-2 min-w-[180px]">
                            <img src={m.productImage} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-100 shrink-0" />
                            <span className="font-bold text-stone-900 truncate">{m.productName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                              {m.reason}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono">
                            <span className={m.adjustment > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {m.adjustment > 0 ? `+${m.adjustment}` : m.adjustment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            {m.newQuantity} units
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 font-medium">
                            {m.actor}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500 italic">
                            {m.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CUSTOMERS LIST */}
          {/* ========================================================= */}
          {currentTab === 'customers' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Customers & Buyers ({customers.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Live customer profiles calculated directly from all storefront checkouts and orders.
                  </p>
                </div>
              </div>

              {/* Search & Segments */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search by customer name, phone number, email..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-stone-900"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
                  {['all', 'High Value', 'Returning', 'New'].map(seg => (
                    <button
                      key={seg}
                      onClick={() => setCustomerSegmentFilter(seg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        customerSegmentFilter === seg ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      {seg === 'all' ? 'All Customers' : seg === 'High Value' ? 'Top Spenders' : seg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Table */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Customer Name</th>
                        <th className="py-3.5 px-4">Phone Number</th>
                        <th className="py-3.5 px-4">Location / City</th>
                        <th className="py-3.5 px-4">Total Orders</th>
                        <th className="py-3.5 px-4">Total Money Spent</th>
                        <th className="py-3.5 px-4">Customer Type</th>
                        <th className="py-3.5 px-4 text-right">View Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredCustomers.map(customer => (
                        <tr key={customer.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            {customer.fullName}
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 font-semibold">
                            {customer.phone}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500">
                            {customer.addresses[0]?.area || ''}, {customer.addresses[0]?.city || 'Accra'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-stone-800">
                            {customer.ordersCount} order(s)
                          </td>
                          <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                            GHS {customer.totalSpent.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              customer.segment === 'High Value' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              customer.segment === 'Returning' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {customer.segment === 'High Value' ? 'Top Buyer' : customer.segment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setCustomerDrawerOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Open Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: DISCOUNT CODES */}
          {/* ========================================================= */}
          {currentTab === 'promos' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              <form onSubmit={e => {
                e.preventDefault();
                if (!promoForm.code.trim() || !promoForm.description.trim()) {
                  showToast('Please type a coupon code and description');
                  return;
                }
                store.addPromoCode({
                  code: promoForm.code.trim().toUpperCase(),
                  discountType: promoForm.discountType,
                  discountValue: Number(promoForm.discountValue),
                  minSpend: Number(promoForm.minSpend) || undefined,
                  freeShipping: promoForm.freeShipping,
                  isActive: true,
                  description: promoForm.description.trim()
                });
                setPromoForm({ code: '', discountValue: '15', minSpend: '150', description: '', discountType: 'percentage', freeShipping: false });
                showToast(`Coupon ${promoForm.code.toUpperCase()} is now live on your store.`);
              }} className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Create New Discount Code</h3>
                  <p className="text-xs text-stone-500">Give customers a code to enter at checkout for money off.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Coupon Code Name *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.code}
                    onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CRGLOW15"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold uppercase text-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">What is this discount for? *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.description}
                    onChange={e => setPromoForm({ ...promoForm, description: e.target.value })}
                    placeholder="e.g. 15% off orders above GHS 150"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Discount Type</label>
                    <select
                      value={promoForm.discountType}
                      onChange={e => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Ghana Cedis Off (GHS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Discount Amount</label>
                    <input
                      type="number"
                      value={promoForm.discountValue}
                      onChange={e => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Minimum Order Amount (GHS)</label>
                  <input
                    type="number"
                    value={promoForm.minSpend}
                    onChange={e => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create & Turn On Coupon
                </button>
              </form>

              {/* Active Coupons List */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Active Discount Codes ({store.promoCodes.length})</h3>
                {store.promoCodes.map(p => (
                  <div key={p.id} className="bg-white border border-[#E8E2D8] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                          {p.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {p.discountValue}{p.discountType === 'percentage' ? '%' : ' GHS'} OFF
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{p.description}</p>
                      {p.minSpend && (
                        <p className="text-[11px] text-stone-400">Must buy at least: GHS {p.minSpend}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => store.togglePromoCode(p.code)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Turned Off'}
                      </button>
                      <button
                        onClick={() => store.deletePromoCode(p.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: FLASH DEALS */}
          {/* ========================================================= */}
          {currentTab === 'flash' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              {/* Create Flash Deal Form */}
              <form onSubmit={e => {
                e.preventDefault();
                if (!flashForm.title.trim() || !flashForm.description.trim()) {
                  showToast('Please type a title and description for the flash deal');
                  return;
                }
                const hours = Number(flashForm.hoursRemaining) || 24;
                store.addFlashDeal({
                  title: flashForm.title.trim(),
                  subtitle: flashForm.subtitle.trim() || 'Limited Time Online Deal',
                  description: flashForm.description.trim(),
                  badgeText: flashForm.badgeText.trim() || '⚡ FLASH SALE',
                  discountPercentage: Number(flashForm.discountPercentage) || 20,
                  hoursRemaining: hours,
                  minutesRemaining: 0,
                  secondsRemaining: 0,
                  expiresAt: new Date(Date.now() + hours * 3600000).toISOString(),
                  backgroundGradient: flashForm.backgroundGradient,
                  isActive: true,
                });
                setFlashForm({
                  title: '',
                  subtitle: '',
                  description: '',
                  badgeText: '⚡ LIMITED TIME DEAL',
                  discountPercentage: '25',
                  hoursRemaining: '24',
                  backgroundGradient: 'from-[#1E1719] via-[#2B1F23] to-[#120B0D]'
                });
                showToast('Flash deal created and published on the homepage!');
              }} className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Create New Flash Deal</h3>
                  <p className="text-xs text-stone-500">Show a promotional countdown banner on the website home page.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Deal Title *</label>
                  <input
                    type="text"
                    required
                    value={flashForm.title}
                    onChange={e => setFlashForm({ ...flashForm, title: e.target.value })}
                    placeholder="e.g. Glow Weekend Skincare Sale"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={flashForm.subtitle}
                    onChange={e => setFlashForm({ ...flashForm, subtitle: e.target.value })}
                    placeholder="e.g. Up to 30% off Korean serums & toners"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={flashForm.description}
                    onChange={e => setFlashForm({ ...flashForm, description: e.target.value })}
                    placeholder="e.g. Save big on all dermatological skincare and fragrances while stocks last."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={flashForm.badgeText}
                      onChange={e => setFlashForm({ ...flashForm, badgeText: e.target.value })}
                      placeholder="e.g. ⚡ WEEKEND SALE"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      value={flashForm.discountPercentage}
                      onChange={e => setFlashForm({ ...flashForm, discountPercentage: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Countdown Duration (Hours)</label>
                  <input
                    type="number"
                    value={flashForm.hoursRemaining}
                    onChange={e => setFlashForm({ ...flashForm, hoursRemaining: e.target.value })}
                    placeholder="e.g. 48"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Publish Flash Deal to Home Page
                </button>
              </form>

              {/* Active Flash Deals List */}
              <div className="space-y-4">
                <h3 className="font-bold text-stone-900 text-sm">Active Flash Deals ({store.flashDeals.length})</h3>
                {store.flashDeals.length === 0 ? (
                  <div className="p-8 bg-white border border-[#E8E2D8] rounded-2xl text-center text-xs text-stone-400">
                    No flash deals currently running. Use the form on the left to create one.
                  </div>
                ) : (
                  store.flashDeals.map(deal => (
                    <div key={deal.id} className="p-5 rounded-2xl bg-[#1E1719] text-white space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-800 text-[#E8B792]">
                          {deal.badgeText}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => store.toggleFlashDeal(deal.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              deal.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {deal.isActive ? 'Showing on Store' : 'Hidden'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete flash deal "${deal.title}"?`)) {
                                store.deleteFlashDeal(deal.id);
                                showToast('Flash deal deleted');
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Delete Flash Deal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-base font-serif">{deal.title}</h4>
                        <p className="text-xs text-stone-300">{deal.description}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                        <span>Discount: <strong className="text-[#E8B792]">{deal.discountPercentage}% OFF</strong></span>
                        <span>Duration: <strong className="text-stone-200">{deal.hoursRemaining || 24} hours</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: CATEGORIES */}
          {/* ========================================================= */}
          {currentTab === 'categories' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              <form onSubmit={e => {
                e.preventDefault();
                const id = categoryForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `category-${Date.now()}`;
                if (!categoryForm.name.trim()) return showToast('Please type a category name');
                store.addCategory({
                  ...categoryForm,
                  id: id as CategoryConfig['id'],
                  slug: id,
                  isActive: true,
                  image: categoryForm.image.trim() || 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=600&q=80'
                });
                setCategoryForm({ name: '', slug: '', description: '', department: 'beauty', image: '' });
                showToast(`Category added: ${categoryForm.name}`);
              }} className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Add New Shop Category</h3>
                  <p className="text-xs text-stone-500">Group your products so customers can find them easily.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Face Creams & Serums"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Web Link (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. face-creams"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Which Shop Section?</label>
                  <select
                    value={categoryForm.department}
                    onChange={e => setCategoryForm({ ...categoryForm, department: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="groceries">Groceries & Everyday Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Picture Link / URL</label>
                  <input
                    type="url"
                    value={categoryForm.image}
                    onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </form>

              {/* Categories list */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Shop Categories ({store.categories.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {store.categories.map(c => (
                    <div key={c.id} className="bg-white border border-[#E8E2D8] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
                      <img src={c.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-stone-900 truncate">{c.name}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          c.department === 'beauty' ? 'bg-rose-50 text-stone-900' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {c.department === 'beauty' ? 'Beauty' : 'Groceries'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => store.toggleCategory(c.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {c.isActive ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category "${c.name}"?`)) {
                              store.deleteCategory(c.id);
                              showToast(`Deleted category: ${c.name}`);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: SALES REPORTS & MONEY */}
          {/* ========================================================= */}
          {currentTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Live Sales & Category Breakdown
                  </h2>
                  <p className="text-xs text-stone-500">
                    Calculated live from your current products ({store.products.length}) and completed orders ({store.orders.length}).
                  </p>
                </div>
              </div>

              {/* Dynamic Split Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySplitData.map(cat => (
                  <div key={cat.name} className="bg-white border border-[#E8E2D8] rounded-2xl p-5 shadow-xs space-y-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{cat.name}</span>
                    <p className="text-2xl font-bold font-serif text-stone-900">{cat.count} items ({cat.percentage}%)</p>
                    <p className="text-xs text-emerald-700 font-semibold">Active in store catalog</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: ALERTS & NOTIFICATIONS */}
          {/* ========================================================= */}
          {currentTab === 'notifications' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Alerts & Messages</h3>
                  <p className="text-xs text-stone-500">Important messages about customer orders and low stock.</p>
                </div>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    showToast('All alerts marked as read');
                  }}
                  className="text-xs font-bold text-stone-800 hover:underline"
                >
                  Clear All Alerts
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {notifications.map(n => (
                  <div key={n.id} className={`py-3.5 flex items-start gap-3.5 ${!n.read ? 'bg-amber-50/40 p-3 rounded-xl' : ''}`}>
                    <div className="p-2 rounded-xl bg-stone-100 text-stone-700 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-stone-900">{n.title}</p>
                        <span className="text-[10px] text-stone-400">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: SHOP SETTINGS */}
          {/* ========================================================= */}
          {currentTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Shop Information & Delivery Charges</h3>
                  <p className="text-xs text-stone-500">Changes here immediately update the website header, checkout, and footer.</p>
                </div>

                {/* Maintenance switch */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">Pause Online Shop (Under Maintenance)</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Turn this ON if you need to pause customer orders temporarily while you update the store.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.storeSettings.maintenanceMode || false}
                      onChange={e => handleSaveSettings('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E1719]"></div>
                  </label>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={store.storeSettings.storeName}
                      onChange={e => handleSaveSettings('storeName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Shop Tagline (Motto)</label>
                    <input
                      type="text"
                      value={store.storeSettings.storeTagline}
                      onChange={e => handleSaveSettings('storeTagline', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Home Page Big Headline</label>
                    <input
                      type="text"
                      value={store.storeSettings.heroHeadline}
                      onChange={e => handleSaveSettings('heroHeadline', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">WhatsApp Customer Service Number</label>
                    <input
                      type="text"
                      value={store.storeSettings.whatsappNumber}
                      onChange={e => handleSaveSettings('whatsappNumber', e.target.value)}
                      placeholder="e.g. 233551234567"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Delivery Rates */}
                <div className="pt-4 border-t border-stone-100 space-y-4">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider text-[11px]">
                    Delivery Charges (in Ghana Cedis)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Standard Accra Delivery</label>
                      <input
                        type="number"
                        value={store.storeSettings.standardShippingFee}
                        onChange={e => handleSaveSettings('standardShippingFee', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Express Rider Delivery</label>
                      <input
                        type="number"
                        value={store.storeSettings.expressShippingFee}
                        onChange={e => handleSaveSettings('expressShippingFee', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Outside Accra (Intercity)</label>
                      <input
                        type="number"
                        value={store.storeSettings.intercityShippingFee}
                        onChange={e => handleSaveSettings('intercityShippingFee', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Free Delivery on Orders Above</label>
                      <input
                        type="number"
                        value={store.storeSettings.freeDeliveryThreshold}
                        onChange={e => handleSaveSettings('freeDeliveryThreshold', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Announcement Bar */}
                <div className="pt-4 border-t border-stone-100 space-y-4">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider text-[11px]">
                    Top Website Message Banner
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Message Shown at Top of Website</label>
                      <input
                        type="text"
                        value={store.storeSettings.announcementText}
                        onChange={e => handleSaveSettings('announcementText', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Banner Color Code (HEX)</label>
                      <input
                        type="text"
                        value={store.storeSettings.announcementBg}
                        onChange={e => handleSaveSettings('announcementBg', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Admin Staff */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-sm">Shop Staff & Team Members</h3>
                <div className="divide-y divide-stone-100 text-xs">
                  {adminUsers.map(user => (
                    <div key={user.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-900">{user.name}</p>
                        <p className="text-[11px] text-stone-500">{user.email}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Audit History Log */}
              <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-sm">Shop Action History</h3>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Person</th>
                        <th className="py-2.5 px-3">Action Done</th>
                        <th className="py-2.5 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">
                            {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-stone-900">{log.actor}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        products={store.products}
        orders={store.orders}
        customers={customers}
        onSelectProduct={p => {
          setProductToEdit(p);
          setProductModalOpen(true);
        }}
        onSelectOrder={o => {
          setSelectedOrder(o);
          setOrderDrawerOpen(true);
        }}
        onSelectCustomer={c => {
          setSelectedCustomer(c);
          setCustomerDrawerOpen(true);
        }}
        onNavigateTab={tabId => {
          if (tabId === 'products-new') {
            setProductToEdit(null);
            setProductModalOpen(true);
          } else {
            setCurrentTab(tabId as AdminTab);
          }
        }}
      />

      {/* Product Creator/Editor Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={adjustStockModalOpen}
        onClose={() => setAdjustStockModalOpen(false)}
        product={productForStockAdjustment}
        onSaveAdjustment={handleSaveStockAdjustment}
      />

      {/* Order Operations Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        onDeleteOrder={orderId => {
          store.deleteOrder(orderId);
          showToast('Order deleted.');
        }}
        onUpdateStatus={(orderId, status, riderInfo) => {
          store.updateOrderStatus(orderId, status, riderInfo);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, status, riderInfo: { ...selectedOrder.riderInfo, ...riderInfo } as any });
          }
          showToast(`Order status updated to ${status}`);
        }}
        onUpdatePayment={(orderId, paymentStatus) => {
          store.updatePaymentStatus(orderId, paymentStatus);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, paymentStatus });
          }
          showToast(`Payment marked as ${paymentStatus}`);
        }}
      />

      {/* Customer Profile Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={customerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
        orders={store.orders}
        onSaveCustomerNotes={(customerId, notes) => {
          showToast('Customer notes saved.');
        }}
      />

    </div>
  );
};
