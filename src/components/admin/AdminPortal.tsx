import React, { useMemo, useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { AdminLoginView } from './AdminLoginView';
import { ProductModal } from './ProductModal';
import { CategoryConfig, Product, StoreSettings, FlashDeal } from '../../types';

type Tab = 'overview' | 'products' | 'orders' | 'promos' | 'flash' | 'categories' | 'site';

const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
  { id: 'products', label: 'Product Inventory', icon: Boxes },
  { id: 'orders', label: 'Orders & Logistics', icon: ClipboardList },
  { id: 'promos', label: 'Promotions & Coupons', icon: Tag },
  { id: 'flash', label: 'Flash Deals', icon: Flame },
  { id: 'categories', label: 'Departments & Tags', icon: Layers },
  { id: 'site', label: 'Storefront Settings', icon: Settings2 },
];

const Field: React.FC<{ 
  label: string; 
  value: string | number; 
  onChange: (v: string) => void; 
  type?: string;
  helper?: string;
}> = ({ label, value, onChange, type = 'text', helper }) => (
  <label className="block text-xs font-semibold text-stone-700 space-y-1.5">
    <div className="flex justify-between items-center">
      <span>{label}</span>
      {helper && <span className="text-[10px] font-normal text-stone-400">{helper}</span>}
    </div>
    <input 
      type={type} 
      value={value ?? ''} 
      onChange={e => onChange(e.target.value)} 
      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#8A3D52] focus:ring-1 focus:ring-[#8A3D52] transition-all" 
    />
  </label>
);

export const AdminPortal: React.FC = () => {
  const store = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<'all' | 'beauty' | 'groceries'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Promo Form State
  const [promo, setPromo] = useState({
    code: '',
    discountValue: '10',
    minSpend: '100',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    freeShipping: false
  });

  // Category Form State
  const [category, setCategory] = useState({
    name: '',
    slug: '',
    description: '',
    department: 'beauty' as 'beauty' | 'groceries',
    image: ''
  });

  // Flash Deal Form State
  const [newDeal, setNewDeal] = useState({
    title: 'Flash Sale Exclusive',
    discountPercentage: 20,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
  });

  // Metrics
  const revenue = useMemo(() => {
    return store.orders
      .filter(o => o.paymentStatus === 'paid' || o.status === 'Delivered')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [store.orders]);

  const lowStockCount = useMemo(() => {
    return store.products.filter(p => (p.stockCount || 0) <= 5).length;
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
      const matchDept = selectedDept === 'all' || p.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [store.products, productSearch, selectedDept]);

  const filteredOrders = useMemo(() => {
    return store.orders.filter(o => {
      if (orderStatusFilter === 'all') return true;
      return o.status === orderStatusFilter;
    });
  }, [store.orders, orderStatusFilter]);

  // Auth gate
  if (!store.adminSession.isLoggedIn) {
    return <AdminLoginView onSuccess={() => {}} />;
  }

  const saveSettings = (key: keyof StoreSettings, value: string | boolean | number) => {
    const isNum = ['freeDeliveryThreshold', 'standardShippingFee', 'expressShippingFee', 'intercityShippingFee'].includes(key);
    store.updateStoreSettings({ 
      [key]: isNum ? Number(value) : value 
    } as Partial<StoreSettings>);
    showToast(`Updated ${key.replace(/([A-Z])/g, ' $1')}`);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo.code.trim() || !promo.description.trim()) {
      showToast('Please specify a promo code and customer description.');
      return;
    }
    store.addPromoCode({
      code: promo.code.trim().toUpperCase(),
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      minSpend: Number(promo.minSpend) || undefined,
      freeShipping: promo.freeShipping,
      isActive: true,
      description: promo.description.trim()
    });
    setPromo({
      code: '',
      discountValue: '10',
      minSpend: '100',
      description: '',
      discountType: 'percentage',
      freeShipping: false
    });
    showToast(`Promotion ${promo.code.toUpperCase()} is now live.`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const id = category.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `category-${Date.now()}`;
    if (!category.name.trim()) {
      showToast('Category name is required.');
      return;
    }
    store.addCategory({
      ...category,
      id: id as CategoryConfig['id'],
      slug: id,
      isActive: true,
      image: category.image.trim() || 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=600&q=80'
    });
    setCategory({ name: '', slug: '', description: '', department: 'beauty', image: '' });
    showToast(`Category added: ${category.name}`);
  };

  const handleCreateFlashDeal = (e: React.FormEvent) => {
    e.preventDefault();
    store.addFlashDeal({
      title: newDeal.title,
      subtitle: 'Limited Time Online Exclusive',
      description: 'Massive savings across authentic skincare, beauty, and daily items.',
      badgeText: '⚡ LIMITED FLASH DEAL',
      discountPercentage: Number(newDeal.discountPercentage),
      hoursRemaining: 48,
      minutesRemaining: 0,
      secondsRemaining: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      backgroundGradient: 'from-[#8A3D52] via-[#5B2333] to-[#25191D]'
    });
    showToast('Flash deal created.');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-stone-900 flex flex-col font-sans selection:bg-[#8A3D52] selection:text-white">
      
      {/* Top Luxury Executive Bar */}
      <header className="bg-[#181114] text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#8A3D52] flex items-center justify-center text-[#E8B792] font-serif font-bold text-base shadow-sm">
                CR
              </div>
              <div>
                <span className="font-serif font-bold text-sm tracking-wide block leading-none">
                  CR Cosmetics
                </span>
                <span className="text-[10px] text-stone-400 font-mono tracking-wider">
                  EXECUTIVE BACKOFFICE
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block w-px h-5 bg-stone-700" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Storefront Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Customer Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-stone-700 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-200 leading-tight">
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
                title="Sign Out"
                className="p-2 rounded-lg bg-stone-800/90 text-stone-400 hover:text-white hover:bg-rose-950 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          
          {/* Mobile Nav Tabs */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  tab === id 
                    ? 'bg-[#8A3D52] text-white shadow-sm' 
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Nav Sidebar */}
          <div className="hidden md:block bg-white border border-stone-200/80 rounded-2xl p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Navigation
            </div>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#8A3D52] text-white shadow-xs font-bold' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    <span>{label}</span>
                  </div>
                  {id === 'orders' && store.orders.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-[#8A3D52]'
                    }`}>
                      {store.orders.length}
                    </span>
                  )}
                  {id === 'products' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'text-stone-400'
                    }`}>
                      {store.products.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Widget */}
          <div className="hidden md:block bg-gradient-to-br from-[#24191D] to-[#150E10] text-white rounded-2xl p-4 shadow-sm border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold">Accra Fulfillment</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-stone-400">Total Recorded Sales</p>
              <p className="text-xl font-bold font-serif text-[#E8B792]">
                GHS {revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex justify-between">
              <span>Low Stock Alerts:</span>
              <span className={`font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                {lowStockCount} items
              </span>
            </div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Store Performance Overview
                  </h2>
                  <p className="text-xs text-stone-500">
                    Real-time operational metrics across product catalog, orders, and fulfillment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditing(null);
                      setProductModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* KPI Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-500">Gross Sales</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    GHS {revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">Paid customer checkouts</p>
                </div>

                <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-500">Active Orders</span>
                    <div className="p-2 rounded-xl bg-rose-50 text-[#8A3D52]">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {store.orders.length}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {store.orders.filter(o => o.status !== 'Delivered').length} pending dispatch
                  </p>
                </div>

                <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-500">Catalog Size</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {store.products.length}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">Beauty & grocery items</p>
                </div>

                <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-500">Stock Alerts</span>
                    <div className="p-2 rounded-xl bg-red-50 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-serif text-stone-900">
                    {lowStockCount}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">Requires replenishment</p>
                </div>

              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Recent Store Dispatches</h3>
                    <p className="text-xs text-stone-500">Latest customer orders requiring dispatch or delivery update.</p>
                  </div>
                  <button 
                    onClick={() => setTab('orders')}
                    className="text-xs font-bold text-[#8A3D52] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {store.orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
                    <p>No customer orders recorded yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {store.orders.slice(0, 5).map(o => (
                      <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-stone-900">{o.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              o.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {o.shippingAddress.fullName} • {o.shippingAddress.city} • {o.items.length} item(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-stone-900">
                            GHS {o.total.toFixed(2)}
                          </span>
                          <button 
                            onClick={() => setTab('orders')}
                            className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCT INVENTORY */}
          {tab === 'products' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Product Inventory Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Manage prices, stock counts, images, and live publication status.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setEditing(null);
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search by title or brand..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#8A3D52]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedDept('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDept === 'all' ? 'bg-[#8A3D52] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    All ({store.products.length})
                  </button>
                  <button
                    onClick={() => setSelectedDept('beauty')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDept === 'beauty' ? 'bg-[#8A3D52] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Beauty
                  </button>
                  <button
                    onClick={() => setSelectedDept('groceries')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDept === 'groceries' ? 'bg-[#8A3D52] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Groceries
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3 min-w-[200px]">
                            <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0" />
                            <div>
                              <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-stone-400">{p.brand}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 capitalize">
                            {p.category}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            GHS {p.price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stockCount <= 5 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-stone-100 text-stone-700'
                            }`}>
                              {p.stockCount} units
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => store.toggleProductPublication(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                                p.isPublished === false 
                                  ? 'bg-stone-100 text-stone-500 hover:bg-stone-200' 
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {p.isPublished === false ? 'Unpublished' : 'Live on Store'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditing(p);
                                  setProductModalOpen(true);
                                }}
                                className="p-1.5 text-stone-600 hover:text-[#8A3D52] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete "${p.name}"?`)) {
                                    store.deleteProduct(p.id);
                                    showToast('Product removed from catalog.');
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS & LOGISTICS */}
          {tab === 'orders' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Orders & Logistics Hub
                  </h2>
                  <p className="text-xs text-stone-500">
                    Track Accra and Intercity fulfillment, update courier delivery stages, and contact clients.
                  </p>
                </div>

                <div className="flex gap-2">
                  {['all', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        orderStatusFilter === st ? 'bg-[#8A3D52] text-white' : 'bg-white border border-stone-200 text-stone-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center text-xs text-stone-500 space-y-2">
                  <ClipboardList className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="font-bold">No orders found for this status.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</span>
                            <span className="text-xs text-stone-400">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">
                            Customer: <strong className="text-stone-900">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                          </p>
                          <p className="text-xs text-stone-500">
                            Location: {order.shippingAddress.area || ''}{order.shippingAddress.landmarkOrGps ? ` (${order.shippingAddress.landmarkOrGps})` : ''}, {order.shippingAddress.city}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-stone-400">Total Order</p>
                            <p className="text-base font-bold text-stone-900">GHS {order.total.toFixed(2)}</p>
                          </div>

                          <select
                            value={order.status}
                            onChange={e => {
                              store.updateOrderStatus(order.id, e.target.value as any);
                              showToast(`Order ${order.orderNumber} updated to ${e.target.value}`);
                            }}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 outline-none focus:border-[#8A3D52]"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packing Order">Packing Order</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs bg-stone-50/60 p-3 rounded-xl">
                        {order.items.map((item, idx) => (
                          <div key={item.product?.id || idx} className="flex items-center gap-2">
                            <img src={item.product?.image} alt="" className="w-8 h-8 rounded-md object-cover shrink-0 bg-stone-200" />
                            <div className="truncate">
                              <p className="font-semibold text-stone-800 truncate">{item.product?.name || 'Store Item'}</p>
                              <p className="text-[11px] text-stone-400">Qty: {item.quantity} × GHS {item.product?.price?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: PROMOTIONS */}
          {tab === 'promos' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              <form onSubmit={handleAddPromo} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Create Discount Voucher</h3>
                  <p className="text-xs text-stone-500">Publish discount codes for store promotions.</p>
                </div>

                <Field 
                  label="Voucher Promo Code" 
                  value={promo.code} 
                  onChange={v => setPromo({ ...promo, code: v.toUpperCase() })} 
                  helper="e.g. GLOW20"
                />

                <Field 
                  label="Description / Customer Notice" 
                  value={promo.description} 
                  onChange={v => setPromo({ ...promo, description: v })} 
                  helper="e.g. 20% off all skincare products"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Discount Type</label>
                    <select
                      value={promo.discountType}
                      onChange={e => setPromo({ ...promo, discountType: e.target.value as any })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (GHS)</option>
                    </select>
                  </div>

                  <Field 
                    label="Discount Value" 
                    type="number"
                    value={promo.discountValue} 
                    onChange={v => setPromo({ ...promo, discountValue: v })} 
                  />
                </div>

                <Field 
                  label="Minimum Spend (GHS)" 
                  type="number"
                  value={promo.minSpend} 
                  onChange={v => setPromo({ ...promo, minSpend: v })} 
                  helper="0 for no minimum"
                />

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Publish Promo Code
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Active Promotion Vouchers</h3>
                {store.promoCodes.map(p => (
                  <div key={p.id} className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#8A3D52] bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100">
                          {p.code}
                        </span>
                        <span className="text-xs font-bold text-stone-800">
                          {p.discountValue}{p.discountType === 'percentage' ? '%' : ' GHS'} OFF
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => store.togglePromoCode(p.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => store.deletePromoCode(p.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: FLASH DEALS */}
          {tab === 'flash' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              <form onSubmit={handleCreateFlashDeal} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Launch Flash Sale</h3>
                  <p className="text-xs text-stone-500">Create timed countdown deals for the homepage.</p>
                </div>

                <Field 
                  label="Deal Title" 
                  value={newDeal.title} 
                  onChange={v => setNewDeal({ ...newDeal, title: v })} 
                />

                <Field 
                  label="Discount Percentage (%)" 
                  type="number"
                  value={newDeal.discountPercentage} 
                  onChange={v => setNewDeal({ ...newDeal, discountPercentage: Number(v) })} 
                />

                <Field 
                  label="End Date & Time" 
                  type="datetime-local"
                  value={newDeal.endTime} 
                  onChange={v => setNewDeal({ ...newDeal, endTime: v })} 
                />

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Activate Flash Deal
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Active Flash Sales</h3>
                {store.flashDeals.map(deal => (
                  <div key={deal.id} className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-stone-900">{deal.title}</span>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {deal.discountPercentage}% Discount • Expires {deal.expiresAt ? new Date(deal.expiresAt).toLocaleDateString() : 'Active'}
                      </p>
                    </div>
                    <button
                      onClick={() => store.deleteFlashDeal(deal.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: CATEGORIES */}
          {tab === 'categories' && (
            <div className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
              
              <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Create New Category</h3>
                  <p className="text-xs text-stone-500">Organize beauty and grocery department aisles.</p>
                </div>

                <Field 
                  label="Category Name" 
                  value={category.name} 
                  onChange={v => setCategory({ ...category, name: v })} 
                  helper="e.g. Korean Skincare"
                />

                <Field 
                  label="URL Slug" 
                  value={category.slug} 
                  onChange={v => setCategory({ ...category, slug: v })} 
                  helper="e.g. korean-skincare"
                />

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Department</label>
                  <select
                    value={category.department}
                    onChange={e => setCategory({ ...category, department: e.target.value as any })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="groceries">Groceries & Essentials</option>
                  </select>
                </div>

                <Field 
                  label="Cover Image URL" 
                  value={category.image} 
                  onChange={v => setCategory({ ...category, image: v })} 
                />

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Category
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Configured Categories ({store.categories.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {store.categories.map(c => (
                    <div key={c.id} className="bg-white border border-stone-200/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
                      <img src={c.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-stone-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-stone-400 capitalize">{c.department}</p>
                      </div>
                      <button
                        onClick={() => store.toggleCategory(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: STOREFRONT SETTINGS */}
          {tab === 'site' && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              
              <div>
                <h3 className="font-bold text-stone-900 text-base">Live Storefront & Delivery Settings</h3>
                <p className="text-xs text-stone-500">
                  Customizations take effect immediately across all customer sessions.
                </p>
              </div>

              {/* Maintenance toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Maintenance Mode</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Temporarily hides customer storefront with an upgrade notice while allowing admin access.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store.storeSettings.maintenanceMode || false}
                    onChange={e => saveSettings('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8A3D52]"></div>
                </label>
              </div>

              {/* Brand Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field 
                  label="Store Name" 
                  value={store.storeSettings.storeName} 
                  onChange={v => saveSettings('storeName', v)} 
                />
                <Field 
                  label="Store Tagline" 
                  value={store.storeSettings.storeTagline} 
                  onChange={v => saveSettings('storeTagline', v)} 
                />
                <Field 
                  label="Hero Headline" 
                  value={store.storeSettings.heroHeadline} 
                  onChange={v => saveSettings('heroHeadline', v)} 
                />
                <Field 
                  label="Hero Subtitle" 
                  value={store.storeSettings.heroSubtitle} 
                  onChange={v => saveSettings('heroSubtitle', v)} 
                />
                <Field 
                  label="WhatsApp Concierge Number (with Country Code)" 
                  value={store.storeSettings.whatsappNumber} 
                  onChange={v => saveSettings('whatsappNumber', v)} 
                  helper="e.g. 233551234567"
                />
                <Field 
                  label="Contact Phone" 
                  value={store.storeSettings.storePhone} 
                  onChange={v => saveSettings('storePhone', v)} 
                />
              </div>

              {/* Announcement Bar */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider text-[11px]">
                  Top Announcement Strip
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field 
                    label="Announcement Text" 
                    value={store.storeSettings.announcementText} 
                    onChange={v => saveSettings('announcementText', v)} 
                  />
                  <Field 
                    label="Announcement Background Color (HEX)" 
                    value={store.storeSettings.announcementBg} 
                    onChange={v => saveSettings('announcementBg', v)} 
                    helper="e.g. #5B2333"
                  />
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider text-[11px]">
                  Delivery Rates & Thresholds (GHS)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field 
                    label="Standard Delivery" 
                    type="number"
                    value={store.storeSettings.standardShippingFee} 
                    onChange={v => saveSettings('standardShippingFee', v)} 
                  />
                  <Field 
                    label="Express Delivery" 
                    type="number"
                    value={store.storeSettings.expressShippingFee} 
                    onChange={v => saveSettings('expressShippingFee', v)} 
                  />
                  <Field 
                    label="Intercity Delivery" 
                    type="number"
                    value={store.storeSettings.intercityShippingFee} 
                    onChange={v => saveSettings('intercityShippingFee', v)} 
                  />
                  <Field 
                    label="Free Delivery Over" 
                    type="number"
                    value={store.storeSettings.freeDeliveryThreshold} 
                    onChange={v => saveSettings('freeDeliveryThreshold', v)} 
                  />
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductModal 
        isOpen={productModalOpen} 
        onClose={() => setProductModalOpen(false)} 
        productToEdit={editing} 
      />

    </div>
  );
};
