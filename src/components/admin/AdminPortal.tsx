import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useReviews } from '../../context/ReviewsContext';
import { useToast } from '../../context/ToastContext';
import { Product, Order, PromoCode, CategoryType } from '../../types';
import { ProductModal } from './ProductModal';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Palette, 
  Tag, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Sparkles, 
  Crown, 
  Save, 
  RotateCcw, 
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Phone,
  MapPin,
  Filter,
  Check,
  X,
  Layers,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface AdminPortalProps {
  onReturnToStore: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customizer' | 'promos' | 'reviews' | 'brands';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onReturnToStore }) => {
  const { 
    products, 
    orders, 
    storeSettings, 
    updateStoreSettings, 
    deleteProduct, 
    duplicateProduct, 
    updateProductStock, 
    updateOrderStatus, 
    updatePaymentStatus, 
    deleteOrder,
    promoCodes, 
    addPromoCode, 
    togglePromoCode, 
    deletePromoCode,
    brands, 
    addBrand, 
    deleteBrand,
    categories, 
    adminSession, 
    logoutAdmin,
    resetStoreToDefaults
  } = useStore();

  const { reviews, deleteReview, replyToReview } = useReviews();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Product Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');

  // Orders Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Dispatch Edit State
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [riderNameInput, setRiderNameInput] = useState('');
  const [riderPhoneInput, setRiderPhoneInput] = useState('');
  const [riderLocationInput, setRiderLocationInput] = useState('');

  // New Promo Code Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState<number>(10);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState<number>(150);
  const [newPromoFreeShipping, setNewPromoFreeShipping] = useState<boolean>(false);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [isAddingPromo, setIsAddingPromo] = useState(false);

  // New Brand Input
  const [newBrandName, setNewBrandName] = useState('');

  // Live Settings Local Form State
  const [tempSettings, setTempSettings] = useState(storeSettings);

  // Reviews Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Calculations for Dashboard
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  }, [orders]);

  const activeDeliveriesCount = useMemo(() => {
    return orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Packing Order').length;
  }, [orders]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => !p.inStock || p.stockCount === 0).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const matchStock = selectedStockFilter === 'all' || 
                         (selectedStockFilter === 'instock' && p.inStock && p.stockCount > 0) ||
                         (selectedStockFilter === 'outofstock' && (!p.inStock || p.stockCount === 0));
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, selectedCategoryFilter, selectedStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.area.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Handlers
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(tempSettings);
    showToast('Storefront & branding changes saved! Live site updated.');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      showToast('Promo code is required');
      return;
    }
    addPromoCode({
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoType,
      discountValue: Number(newPromoValue),
      minSpend: Number(newPromoMinSpend) || 0,
      freeShipping: newPromoFreeShipping,
      isActive: true,
      description: newPromoDesc.trim() || `${newPromoValue}${newPromoType === 'percentage' ? '%' : ' GHS'} discount`,
      expiryDate: '2026-12-31'
    });
    showToast(`Created promo code #${newPromoCode.toUpperCase()}`);
    setNewPromoCode('');
    setNewPromoDesc('');
    setIsAddingPromo(false);
  };

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBrandName.trim()) {
      addBrand(newBrandName.trim());
      showToast(`Added brand: ${newBrandName.trim()}`);
      setNewBrandName('');
    }
  };

  const handleSaveRiderInfo = (orderId: string) => {
    updateOrderStatus(orderId, 'Out for Delivery', {
      riderName: riderNameInput || 'Kwame Boateng (Accra Courier)',
      riderPhone: riderPhoneInput || '+233 24 987 6543',
      riderLocation: riderLocationInput || 'Dispatched from Botwe Fulfillment Hub',
      estimatedArrival: 'Today within 30–45 mins'
    });
    showToast(`Courier details updated for order #${orderId}`);
    setEditingOrderId(null);
  };

  const handleSendReply = (reviewId: string) => {
    if (!adminReplyText.trim()) return;
    replyToReview(reviewId, adminReplyText.trim());
    showToast('Store concierge response posted!');
    setReplyingReviewId(null);
    setAdminReplyText('');
  };

  const generateWhatsAppDispatchLink = (order: Order) => {
    const text = `Hello ${order.shippingAddress.fullName}! This is CR Cosmetics & Essential Concierge. 
Your Order #${order.orderNumber} is currently ${order.status.toUpperCase()} for delivery to ${order.shippingAddress.area}.
Rider: ${order.riderInfo?.riderName || 'Kwame Boateng'} (${order.riderInfo?.riderPhone || '+233 24 987 6543'}).`;
    return `https://wa.me/${order.shippingAddress.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-gray-900 flex flex-col font-sans">
      
      {/* 1. TOP ADMIN CONTROL BAR */}
      <header className="sticky top-0 z-40 bg-[#5B2333] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8A3D52] border border-rose-300/30 flex items-center justify-center font-serif font-black text-sm text-[#D4AF37] shadow-inner">
              CR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base tracking-wide">
                  CR Master Admin Portal
                </span>
                <span className="bg-[#8A3D52] text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#D4AF37]/30">
                  {adminSession.adminRole}
                </span>
              </div>
              <p className="text-[10px] text-rose-200 hidden sm:block">
                Controlling Store Products, Orders, Logistics, & Live Design
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Live Storefront Button */}
            <button
              onClick={onReturnToStore}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Eye className="w-3.5 h-3.5 text-rose-200" />
              <span>View Storefront</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                logoutAdmin();
                showToast('Admin session logged out');
                onReturnToStore();
              }}
              className="p-2 text-rose-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 2. ADMIN NAVIGATION TABS */}
        <div className="bg-[#461925] border-t border-[#6C2B3E] overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 py-1.5">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'products' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Orders & Courier ({orders.length})</span>
              {activeDeliveriesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'customizer' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Website Customizer</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'promos' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Coupons & Promos ({promoCodes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'brands' ? 'bg-[#8A3D52] text-white shadow-xs' : 'text-rose-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Brands & Cats</span>
            </button>

          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick Metrics Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Total Revenue</span>
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  GHS {totalRevenue.toFixed(2)}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Real-time store transactions</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Total Orders</span>
                  <div className="p-2 bg-rose-50 text-[#8A3D52] rounded-xl">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  {orders.length} Orders
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  {activeDeliveriesCount} in active dispatch
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Active Catalog</span>
                  <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  {products.length} Products
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Across {brands.length - 1} luxury brands
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Inventory Alerts</span>
                  <div className={`p-2 rounded-xl ${outOfStockCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  {outOfStockCount} Low/Out
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  {outOfStockCount > 0 ? 'Action required in Products' : 'All stocks healthy'}
                </p>
              </div>

            </div>

            {/* Quick Actions & Recent Orders Triage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Live Orders Dispatch Feed */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-gray-900">
                      Live Delivery Dispatch Hub
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Directly change order stages to update customer tracking timelines.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#8A3D52] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map(order => (
                    <div key={order.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-gray-900">#{order.orderNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              • {order.shippingAddress.fullName} ({order.shippingAddress.area})
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-gray-900 font-serif">
                          GHS {order.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Quick Status Stage Changer Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                        <span className="text-[10px] font-bold text-gray-400 mr-1">Move Stage:</span>
                        
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Confirmed');
                            showToast(`Order #${order.orderNumber} marked Confirmed`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            order.status === 'Confirmed' ? 'bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          1. Confirmed
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Packing Order');
                            showToast(`Order #${order.orderNumber} packing at Botwe Hub`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            order.status === 'Packing Order' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-amber-50 text-amber-800 border border-gray-200'
                          }`}
                        >
                          2. Packing
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Out for Delivery', {
                              riderName: 'Kwame Boateng (CR Dispatch)',
                              riderLocation: `Dispatched from Botwe • En route to ${order.shippingAddress.area}`
                            });
                            showToast(`Order #${order.orderNumber} dispatched with Accra Courier!`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            order.status === 'Out for Delivery' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-800 border border-gray-200'
                          }`}
                        >
                          3. Out for Delivery
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Delivered');
                            updatePaymentStatus(order.id, 'paid');
                            showToast(`Order #${order.orderNumber} delivered to customer!`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            order.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-gray-200'
                          }`}
                        >
                          4. Delivered ✔
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Quick Master Controls */}
              <div className="space-y-6">
                
                {/* Add Product Card */}
                <div className="bg-gradient-to-br from-[#FAF5F4] to-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#8A3D52] text-white rounded-2xl shadow-sm">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-gray-900">
                        Add New Beauty Product
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Add serums, perfumes, creams or makeup
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="w-full py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Product Item</span>
                  </button>
                </div>

                {/* Live Announcement Bar Editor */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-3">
                  <h4 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8A3D52]" />
                    <span>Live Notification Bar</span>
                  </h4>
                  <p className="text-xs text-gray-500">
                    Instantly changes the top banner on the customer storefront.
                  </p>

                  <input
                    type="text"
                    value={tempSettings.announcementText}
                    onChange={e => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />

                  <button
                    onClick={() => {
                      updateStoreSettings({ announcementText: tempSettings.announcementText });
                      showToast('Live announcement bar updated!');
                    }}
                    className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Push to Storefront
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Product Controls & Search */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
                    Store Catalog & Inventory Controller
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage prices, stock counts, images, and authenticity badges in real time.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search by product name or brand..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
                  />
                </div>

                <div>
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="skincare">Skincare</option>
                    <option value="makeup">Makeup</option>
                    <option value="fragrances">Fragrances</option>
                    <option value="body-care">Body Care</option>
                    <option value="beauty-essentials">Beauty Essentials</option>
                    <option value="everyday-essentials">Everyday Essentials</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedStockFilter}
                    onChange={e => setSelectedStockFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="instock">In Stock Only</option>
                    <option value="outofstock">Out of Stock Only</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F4] text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-4">Item & Brand</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price (GHS)</th>
                      <th className="py-3.5 px-4">Stock Units</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Badge</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-400">
                          No products found matching your search or filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                          
                          {/* Image & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-contain mix-blend-multiply bg-[#FAF6F4] p-1 border border-gray-100 shrink-0"
                              />
                              <div className="overflow-hidden">
                                <span className="text-[10px] font-black text-gray-400 uppercase">{product.brand}</span>
                                <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                <p className="text-gray-400 text-[10px]">{product.unit}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="capitalize text-gray-600 font-medium">
                              {product.category.replace('-', ' ')}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">
                              GHS {product.price.toFixed(2)}
                            </div>
                            {product.originalPrice && (
                              <div className="text-[10px] text-gray-400 line-through">
                                GHS {product.originalPrice.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Stock Quick Stepper */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateProductStock(product.id, Math.max(0, product.stockCount - 1))}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold">{product.stockCount}</span>
                              <button
                                onClick={() => updateProductStock(product.id, product.stockCount + 1)}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* In-Stock Toggle */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                updateProductStock(product.id, product.stockCount, !product.inStock);
                                showToast(`${product.name} marked ${!product.inStock ? 'In Stock' : 'Out of Stock'}`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                product.inStock && product.stockCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {product.inStock && product.stockCount > 0 ? '● In Stock' : '○ Out of Stock'}
                            </button>
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-4">
                            {product.badge ? (
                              <span className="bg-rose-50 text-[#8A3D52] border border-rose-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {product.badge}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              <button
                                onClick={() => handleOpenEditProduct(product)}
                                className="p-1.5 text-gray-600 hover:text-[#8A3D52] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  duplicateProduct(product.id);
                                  showToast(`Duplicated product ${product.name}`);
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${product.name}" from store catalog?`)) {
                                    deleteProduct(product.id);
                                    showToast(`Deleted ${product.name}`);
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* TAB 3: ORDERS & LOGISTICS HUB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
                    Customer Orders & Accra Courier Logistics
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Assign delivery riders, update live delivery stages, and notify customers on WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Search orders, phone, area..."
                      className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Orders</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packing Order">Packing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 text-gray-400">
                  No orders match your filter criteria.
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-extrabold text-gray-900 font-mono">
                            #{order.orderNumber}
                          </span>
                          
                          {/* Status Pill */}
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'Packing Order' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {order.status}
                          </span>

                          {/* Payment status */}
                          <button
                            onClick={() => {
                              const newPay = order.paymentStatus === 'paid' ? 'pending' : 'paid';
                              updatePaymentStatus(order.id, newPay);
                              showToast(`Order #${order.orderNumber} payment marked ${newPay.toUpperCase()}`);
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            Payment: {order.paymentStatus.toUpperCase()} ⟳
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Placed: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Method: {order.deliveryMethod}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-serif font-bold text-gray-900 mr-2">
                          GHS {order.total.toFixed(2)}
                        </span>

                        <a
                          href={generateWhatsAppDispatchLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>

                        <button
                          onClick={() => {
                            if (confirm(`Delete order record #${order.orderNumber}?`)) {
                              deleteOrder(order.id);
                              showToast(`Deleted order #${order.orderNumber}`);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Recipient</span>
                        <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-600">📞 {order.shippingAddress.phone}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Accra Destination</span>
                        <p className="font-bold text-gray-900">{order.shippingAddress.area}, {order.shippingAddress.city}</p>
                        <p className="text-gray-500 text-[11px]">{order.shippingAddress.landmarkOrGps || 'Standard delivery point'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Courier Assignment</span>
                        <p className="font-bold text-gray-900">
                          {order.riderInfo?.riderName || 'Kwame Boateng'} ({order.riderInfo?.riderPhone || '+233 24 987 6543'})
                        </p>
                        <p className="text-gray-500 text-[11px] truncate">
                          {order.riderInfo?.riderLocation || 'Botwe School Junction Store Dispatch'}
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                          <img src={item.product.image} alt="" className="w-6 h-6 object-contain mix-blend-multiply" />
                          <span className="font-bold text-gray-800">{item.product.name}</span>
                          <span className="text-gray-400 font-semibold">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Stage Stepper */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold text-gray-400">Update Live Progression:</span>
                        
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Confirmed');
                            showToast(`Order #${order.orderNumber} confirmed`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${order.status === 'Confirmed' ? 'bg-[#8A3D52] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          1. Confirmed
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Packing Order');
                            showToast(`Order #${order.orderNumber} in packaging`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${order.status === 'Packing Order' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          2. Packing at Store
                        </button>

                        <button
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setRiderNameInput(order.riderInfo?.riderName || 'Kwame Boateng');
                            setRiderPhoneInput(order.riderInfo?.riderPhone || '+233 24 987 6543');
                            setRiderLocationInput(order.riderInfo?.riderLocation || `En route to ${order.shippingAddress.area}`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${order.status === 'Out for Delivery' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          3. Out with Courier 🛵
                        </button>

                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'Delivered');
                            updatePaymentStatus(order.id, 'paid');
                            showToast(`Order #${order.orderNumber} marked Delivered!`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${order.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          4. Delivered ✔
                        </button>
                      </div>

                      {editingOrderId === order.id && (
                        <div className="w-full bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 space-y-2.5 text-xs animate-fadeIn mt-2">
                          <h5 className="font-bold text-blue-900">Assign Courier Rider & Update Live Location</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Rider Name"
                              value={riderNameInput}
                              onChange={e => setRiderNameInput(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Rider Phone"
                              value={riderPhoneInput}
                              onChange={e => setRiderPhoneInput(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Live Location Note"
                              value={riderLocationInput}
                              onChange={e => setRiderLocationInput(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="px-3 py-1 border border-gray-300 rounded-lg font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveRiderInfo(order.id)}
                              className="px-4 py-1 bg-blue-600 text-white rounded-lg font-bold"
                            >
                              Update Dispatch
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 4: STOREFRONT & WEBSITE CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6 animate-fadeIn">
            
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                Live Storefront & Branding Customizer
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Admin controls the exact headlines, top announcements, delivery fees, and store address shown on the website.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              
              {/* 1. TOP ANNOUNCEMENT BAR */}
              <div className="bg-[#FAF6F4] p-5 rounded-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8A3D52]" />
                  <span>Top Announcement Notification Bar</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Announcement Bar Text</label>
                    <input
                      type="text"
                      value={tempSettings.announcementText}
                      onChange={e => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Background Color (Hex)</label>
                    <input
                      type="text"
                      value={tempSettings.announcementBg}
                      onChange={e => setTempSettings({ ...tempSettings, announcementBg: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Visibility Status</label>
                    <button
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, announcementVisible: !tempSettings.announcementVisible })}
                      className={`w-full py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                        tempSettings.announcementVisible ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {tempSettings.announcementVisible ? '● Announcement Visible' : '○ Announcement Hidden'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. HERO SECTION HEADLINES */}
              <div className="bg-[#FAF6F4] p-5 rounded-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#8A3D52]" />
                  <span>Hero Section Typography & Copy</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Hero Badge Tag</label>
                    <input
                      type="text"
                      value={tempSettings.heroBadge}
                      onChange={e => setTempSettings({ ...tempSettings, heroBadge: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={tempSettings.heroButtonText}
                      onChange={e => setTempSettings({ ...tempSettings, heroButtonText: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      value={tempSettings.heroSubtitle}
                      onChange={e => setTempSettings({ ...tempSettings, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DELIVERY FEES & THRESHOLDS */}
              <div className="bg-[#FAF6F4] p-5 rounded-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8A3D52]" />
                  <span>Delivery Pricing & Free Delivery Minimum Threshold</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Free Delivery Spend (GHS)</label>
                    <input
                      type="number"
                      value={tempSettings.freeDeliveryThreshold}
                      onChange={e => setTempSettings({ ...tempSettings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Standard Accra Delivery (GHS)</label>
                    <input
                      type="number"
                      value={tempSettings.standardShippingFee}
                      onChange={e => setTempSettings({ ...tempSettings, standardShippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Accra Express Dispatch (GHS)</label>
                    <input
                      type="number"
                      value={tempSettings.expressShippingFee}
                      onChange={e => setTempSettings({ ...tempSettings, expressShippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Intercity Regional (GHS)</label>
                    <input
                      type="number"
                      value={tempSettings.intercityShippingFee}
                      onChange={e => setTempSettings({ ...tempSettings, intercityShippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 4. STORE CONTACT & ADDRESS */}
              <div className="bg-[#FAF6F4] p-5 rounded-2xl border border-rose-100 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8A3D52]" />
                  <span>Physical Store Location & Contact Numbers</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Support Phone (Customer Hotline)</label>
                    <input
                      type="text"
                      value={tempSettings.storePhone}
                      onChange={e => setTempSettings({ ...tempSettings, storePhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Direct WhatsApp Number</label>
                    <input
                      type="text"
                      value={tempSettings.whatsappNumber}
                      onChange={e => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Physical Store Hub Address</label>
                    <input
                      type="text"
                      value={tempSettings.storeAddress}
                      onChange={e => setTempSettings({ ...tempSettings, storeAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={tempSettings.storeHours}
                      onChange={e => setTempSettings({ ...tempSettings, storeHours: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset store data to original defaults?')) {
                      resetStoreToDefaults();
                      setTempSettings(storeSettings);
                      showToast('Store reset to defaults successfully');
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Defaults</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Live Storefront Settings</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* TAB 5: PROMO CODES & COUPONS */}
        {activeTab === 'promos' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
                  Promo Codes & Discount Coupons
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create discount coupons for campaigns, influencer deals, or customer retention.
                </p>
              </div>

              <button
                onClick={() => setIsAddingPromo(!isAddingPromo)}
                className="px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingPromo ? 'Close Form' : 'Create New Coupon'}</span>
              </button>
            </div>

            {/* Create Coupon Form */}
            {isAddingPromo && (
              <form onSubmit={handleCreatePromo} className="bg-white rounded-3xl p-6 border-2 border-[#8A3D52]/30 shadow-sm space-y-4 text-xs animate-fadeIn">
                <h3 className="font-bold text-sm text-gray-900">Create New Store Coupon</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GLOW30"
                      value={newPromoCode}
                      onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-sm focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                    <select
                      value={newPromoType}
                      onChange={e => setNewPromoType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Amount Off (GHS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={newPromoValue}
                      onChange={e => setNewPromoValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Min Order Spend (GHS)</label>
                    <input
                      type="number"
                      value={newPromoMinSpend}
                      onChange={e => setNewPromoMinSpend(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Free Delivery</label>
                    <button
                      type="button"
                      onClick={() => setNewPromoFreeShipping(!newPromoFreeShipping)}
                      className={`w-full py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                        newPromoFreeShipping ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {newPromoFreeShipping ? '✔ Free Delivery Included' : 'Standard Shipping Applies'}
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. 15% discount for first-time buyers"
                      value={newPromoDesc}
                      onChange={e => setNewPromoDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPromo(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Publish Coupon Code
                  </button>
                </div>
              </form>
            )}

            {/* Coupons List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.map(promo => (
                <div key={promo.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm bg-rose-50 text-[#8A3D52] px-3 py-1 rounded-xl border border-rose-100">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => {
                        togglePromoCode(promo.code);
                        showToast(`Coupon ${promo.code} marked ${!promo.isActive ? 'Active' : 'Disabled'}`);
                      }}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                        promo.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {promo.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `GHS ${promo.discountValue} OFF`}
                      {promo.freeShipping && ' + Free Delivery'}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
                    <span>Min spend: GHS {promo.minSpend || 0}</span>
                    <div className="flex items-center gap-1.5">
                      <span>Used {promo.usageCount} times</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon ${promo.code}?`)) {
                            deletePromoCode(promo.id);
                            showToast(`Deleted ${promo.code}`);
                          }
                        }}
                        className="text-gray-300 hover:text-rose-600 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 6: CUSTOMER REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs">
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
                Customer Reviews Moderation
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Read, moderate, reply to customer feedback, and verify genuine buyer status.
              </p>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-400">
                  No customer reviews yet.
                </div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-3">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">{rev.authorName}</span>
                          <span className="text-[#D4AF37] font-bold text-xs">{'★'.repeat(rev.rating)}</span>
                          {rev.verifiedPurchase && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Product ID: {rev.productId} • {rev.date}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Delete this review?')) {
                            deleteReview(rev.id);
                            showToast('Review deleted');
                          }
                        }}
                        className="text-gray-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="text-xs space-y-1">
                      {rev.title && <h5 className="font-bold text-gray-900">{rev.title}</h5>}
                      <p className="text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>

                    {/* Admin Reply Section */}
                    {rev.adminReply ? (
                      <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 text-xs space-y-1">
                        <span className="font-bold text-[#8A3D52] text-[11px] block">Store Concierge Official Response:</span>
                        <p className="text-gray-700">{rev.adminReply}</p>
                      </div>
                    ) : (
                      <div>
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2 pt-2">
                            <textarea
                              rows={2}
                              value={adminReplyText}
                              onChange={e => setAdminReplyText(e.target.value)}
                              placeholder="Write store official reply..."
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendReply(rev.id)}
                                className="px-4 py-1 bg-[#8A3D52] text-white rounded-lg text-xs font-bold"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setAdminReplyText('');
                            }}
                            className="text-xs font-bold text-[#8A3D52] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply as Store Concierge</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 7: BRANDS & CATEGORIES */}
        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            
            {/* Brands Management */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900">
                Brands Management
              </h3>
              <p className="text-xs text-gray-500">
                Add new authentic beauty and fragrance brands to the store filter list.
              </p>

              <form onSubmit={handleAddBrandSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New brand name (e.g. Dior, Glossier)"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8A3D52] hover:bg-[#732F42] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Add Brand
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {brands.map(brand => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800"
                  >
                    <span>{brand}</span>
                    {brand !== 'All Brands' && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteBrand(brand);
                          showToast(`Removed brand ${brand}`);
                        }}
                        className="text-gray-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Categories Overview */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900">
                Store Categories
              </h3>
              <p className="text-xs text-gray-500">
                Current active department categories in CR Cosmetics & Essential.
              </p>

              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <img src={cat.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{cat.name}</h4>
                      <p className="text-gray-500 text-[11px]">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

    </div>
  );
};
