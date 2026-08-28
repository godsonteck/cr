import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Search, 
  MessageCircle, 
  LogOut, 
  ArrowLeft,
  Crown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Play,
  Check,
  ExternalLink,
  AlertCircle,
  Navigation,
  Radio,
  FileText,
  Plus,
  Zap
} from 'lucide-react';
import { Order, OrderStatus, ShippingAddress, CartItem } from '../../types';

interface AccountViewProps {
  onBackToShop: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onBackToShop }) => {
  const { user, login, logout, updateProfile, saveAddress, addOrder: authAddOrder } = useAuth();
  const { 
    orders: storeOrders, 
    storeSettings, 
    updateOrderStatus, 
    updatePaymentStatus,
    addOrder: storeAddOrder,
    products
  } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'profile'>('orders');
  
  // Tracking search state
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Expanded order details accordion state
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Auto-simulation timer toggle
  const [isLiveRadarActive, setIsLiveRadarActive] = useState<boolean>(true);

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [area, setArea] = useState(user?.savedAddresses?.[0]?.area || '');
  const [city, setCity] = useState(user?.savedAddresses?.[0]?.city || 'Accra');
  const [landmark, setLandmark] = useState(user?.savedAddresses?.[0]?.landmarkOrGps || '');

  // Quick Sign In state for guest
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Synchronized customer orders from StoreContext (Single source of truth)
  const customerOrders: Order[] = useMemo(() => {
    if (user?.orders && user.orders.length > 0) {
      // Map user orders against store orders for latest live state
      return user.orders.map(userOrder => {
        const liveStoreOrder = storeOrders.find(
          so => so.id === userOrder.id || so.orderNumber === userOrder.orderNumber
        );
        return liveStoreOrder || userOrder;
      });
    } else if (user?.email) {
      const emailMatches = storeOrders.filter(
        o => o.shippingAddress?.email?.toLowerCase() === user.email.toLowerCase()
      );
      return emailMatches.length > 0 ? emailMatches : storeOrders;
    } else {
      // For guest visitors, show available store orders
      return storeOrders;
    }
  }, [user, storeOrders]);

  // Toggle order expanded details
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper to get numeric stage (0 to 3)
  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Delivered':
        return 3;
      case 'Out for Delivery':
        return 2;
      case 'Processing':
      case 'Packing Order':
        return 1;
      case 'Confirmed':
      default:
        return 0;
    }
  };

  // Helper to get status UI config
  const getStatusBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return {
          label: 'Delivered',
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          dotClass: 'bg-emerald-500',
          barWidth: '100%',
          description: 'Package delivered safely to destination',
          etaText: 'Delivered at Doorstep',
          pulse: false
        };
      case 'Out for Delivery':
        return {
          label: 'Out for Delivery',
          badgeClass: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
          dotClass: 'bg-purple-500 animate-ping',
          barWidth: '75%',
          description: 'Courier Kwame Boateng is en route to your location',
          etaText: 'Arriving in ~20-35 mins',
          pulse: true
        };
      case 'Processing':
      case 'Packing Order':
        return {
          label: 'Processing / Packing',
          badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          dotClass: 'bg-amber-500 animate-pulse',
          barWidth: '45%',
          description: 'Botwe Hub is sealing authentic products & packing parcel',
          etaText: 'Preparing for Dispatch (~15 mins)',
          pulse: true
        };
      case 'Confirmed':
      default:
        return {
          label: 'Order Confirmed',
          badgeClass: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          dotClass: 'bg-blue-500',
          barWidth: '18%',
          description: 'Payment & genuine product batch verified',
          etaText: 'Queued for Botwe Fulfillment',
          pulse: false
        };
    }
  };

  // Helper to advance order to next stage in real-time
  const advanceOrderStatus = (order: Order) => {
    const currentStage = getStageIndex(order.status);
    let nextStatus: OrderStatus = 'Processing';
    let riderUpdates = {};

    if (currentStage === 0) {
      nextStatus = 'Processing';
      showToast(`Order #${order.orderNumber} is now Processing at Botwe Hub!`);
    } else if (currentStage === 1) {
      nextStatus = 'Out for Delivery';
      riderUpdates = {
        riderName: 'Kwame Boateng (CR Dispatch Team #04)',
        riderPhone: '+233 24 987 6543',
        riderLocation: `Dispatched from Botwe Hub • En route to ${order.shippingAddress.area}`,
        estimatedArrival: 'In ~25 minutes via Motor Courier'
      };
      showToast(`🚀 Order #${order.orderNumber} is Out for Delivery with Rider Kwame!`);
    } else if (currentStage === 2) {
      nextStatus = 'Delivered';
      updatePaymentStatus(order.id, 'paid');
      riderUpdates = {
        riderLocation: `Delivered safely at ${order.shippingAddress.area}`,
        estimatedArrival: 'Completed'
      };
      showToast(`🎉 Order #${order.orderNumber} marked as Delivered!`);
    } else {
      nextStatus = 'Confirmed';
      showToast(`Reset Order #${order.orderNumber} back to Confirmed stage.`);
    }

    updateOrderStatus(order.id, nextStatus, riderUpdates);

    // If currently viewing tracking tab for this order, update activeTrackedOrder too
    if (activeTrackedOrder && (activeTrackedOrder.orderNumber === order.orderNumber || activeTrackedOrder.id === order.id)) {
      handleTrackDirectOrder({
        ...order,
        status: nextStatus,
        riderInfo: {
          ...order.riderInfo,
          riderName: 'Kwame Boateng (CR Dispatch Team #04)',
          riderPhone: '+233 24 987 6543',
          riderLocation: `En route to ${order.shippingAddress.area}`,
          estimatedArrival: 'Live Update',
          stageIndex: getStageIndex(nextStatus),
          ...riderUpdates
        }
      });
    }
  };

  // Create a realistic sample order for immediate testing if list is empty
  const handleCreateSampleOrder = () => {
    const sampleItems: CartItem[] = products.slice(0, 2).map(p => ({
      product: p,
      quantity: 1
    }));

    const sampleOrderNumber = `CR-GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: sampleOrderNumber,
      createdAt: new Date().toISOString(),
      items: sampleItems,
      subtotal: 420.00,
      shippingFee: 30.00,
      discount: 0,
      total: 450.00,
      paymentMethod: 'momo-mtn',
      paymentStatus: 'paid',
      deliveryMethod: 'accra-express',
      shippingAddress: {
        fullName: user?.fullName || 'Akosua Mensah',
        phone: user?.phone || '+233 55 987 1234',
        email: user?.email || 'customer@gmail.com',
        city: 'Accra',
        area: 'East Legon / Botwe',
        landmarkOrGps: 'Near Botwe School Junction / GA-492-1204',
        deliveryNotes: 'Please call on arrival'
      },
      status: 'Processing',
      estimatedDeliveryTime: 'Today within 45 mins via Accra Express Dispatch',
      riderInfo: {
        riderName: 'Kwame Boateng (CR Dispatch #04)',
        riderPhone: '+233 24 987 6543',
        riderLocation: 'Departed Botwe School Junction Store Hub',
        estimatedArrival: 'In ~30 mins',
        stageIndex: 1
      }
    };

    storeAddOrder(newOrder);
    authAddOrder(newOrder);
    setExpandedOrderIds(prev => ({ ...prev, [newOrder.id]: true }));
    showToast(`Created sample order #${sampleOrderNumber} with Real-Time Tracking!`);
  };

  // Generate dynamic live activity log for an order
  const getOrderActivityLogs = (order: Order) => {
    const stage = getStageIndex(order.status);
    const orderDate = new Date(order.createdAt);
    const formatTime = (minutesToAdd: number) => {
      const d = new Date(orderDate.getTime() + minutesToAdd * 60000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const logs = [
      {
        title: 'Order Placed & Payment Verified',
        description: `Verified ${order.paymentMethod.replace('-', ' ').toUpperCase()} payment & authentic stock allocated`,
        time: formatTime(0),
        active: true,
        done: true
      },
      {
        title: 'Botwe Hub Inspection & Hologram Sealing',
        description: 'Originality batch check verified. Tamper-evident packaging applied.',
        time: formatTime(12),
        active: stage >= 1,
        done: stage >= 1,
        current: stage === 1
      },
      {
        title: 'Dispatched with Accra Express Courier',
        description: `Rider Kwame Boateng assigned with motorcycle dispatch to ${order.shippingAddress.area}`,
        time: formatTime(28),
        active: stage >= 2,
        done: stage >= 2,
        current: stage === 2
      },
      {
        title: 'Doorstep Delivery & Handoff',
        description: `Delivered safely at ${order.shippingAddress.landmarkOrGps || order.shippingAddress.area}`,
        time: stage === 3 ? formatTime(48) : 'Estimated soon',
        active: stage === 3,
        done: stage === 3,
        current: stage === 3
      }
    ];

    return logs;
  };

  const handleTrackSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTrackError(null);
    const cleanId = searchOrderId.trim().toUpperCase();

    if (!cleanId) {
      setTrackError('Please enter an Order ID (e.g. CR-GH-1234)');
      return;
    }

    // Search in actual store orders
    const matchedOrder = storeOrders.find(o => 
      o.orderNumber.toUpperCase() === cleanId || 
      o.id.toUpperCase() === cleanId || 
      o.orderNumber.toUpperCase().includes(cleanId)
    );

    if (matchedOrder) {
      handleTrackDirectOrder(matchedOrder);
      showToast(`Tracking status loaded for #${matchedOrder.orderNumber}`);
      return;
    }

    setTrackError(`No order found matching "${searchOrderId}". Please verify the order number.`);
    setActiveTrackedOrder(null);
  };

  const handleTrackDirectOrder = (order: Order) => {
    setSearchOrderId(order.orderNumber);
    const stage = getStageIndex(order.status);

    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      recipient: order.shippingAddress.fullName,
      area: order.shippingAddress.area,
      city: order.shippingAddress.city,
      landmark: order.shippingAddress.landmarkOrGps || 'Accra delivery point',
      phone: order.shippingAddress.phone,
      items: order.items.map(i => ({
        name: i.product.name,
        brand: i.product.brand,
        qty: i.quantity,
        price: i.product.price,
        image: i.product.image
      })),
      total: order.total,
      placedAt: new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: order.status || 'Confirmed',
      stageIndex: stage,
      estimatedArrival: order.estimatedDeliveryTime || 'Today via Accra Courier',
      riderName: order.riderInfo?.riderName || 'Kwame Boateng (CR Dispatch Team)',
      riderPhone: order.riderInfo?.riderPhone || '+233 24 987 6543',
      riderLocation: order.riderInfo?.riderLocation || `En route to ${order.shippingAddress.area}`,
      trackingSteps: [
        { title: 'Order Verified & Logged', subtitle: 'Store logged genuine batch credentials', time: 'Completed', done: true },
        { title: 'Authenticity Check & Packaging', subtitle: 'Botwe School Junction Store — Quality Sealed', time: stage >= 1 ? 'Packed' : 'Pending', done: stage >= 1, current: stage === 1 },
        { title: 'Dispatched with Accra Courier', subtitle: `Dedicated rider navigating to ${order.shippingAddress.area}`, time: stage >= 2 ? 'Active' : 'Pending', done: stage >= 2, current: stage === 2 },
        { title: 'Doorstep Delivery', subtitle: `Direct drop-off at ${order.shippingAddress.area}`, time: stage === 3 ? 'Delivered' : 'Pending', done: stage === 3, current: stage === 3 }
      ]
    };

    setActiveTrackedOrder(orderData);
    setActiveTab('tracking');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, phone, email });
    const address: ShippingAddress = {
      fullName,
      phone,
      email,
      city,
      area,
      landmarkOrGps: landmark
    };
    saveAddress(address);
    showToast('Profile and delivery address saved');
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) {
      showToast('Please enter your email');
      return;
    }
    login(guestEmail.trim(), guestName.trim() || 'Valued Customer', guestPhone.trim() || '+233 55 123 4567');
    showToast(`Welcome, ${guestName.trim() || 'Customer'}!`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      
      {/* Top Breadcrumb & Live Radar Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8A3D52] dark:text-rose-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>

        {/* Real-time sync status indicator */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold">Real-Time Dispatch Radar Connected</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden md:inline">
            (Botwe Central Hub)
          </span>
        </div>
      </div>

      {/* User Header or Guest Sign-In */}
      {user ? (
        <div className="bg-white dark:bg-[#15161E] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8A3D52] to-[#5B2333] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {user.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900 dark:text-white">
                  {user.fullName}
                </h1>
                <Crown className="w-4 h-4 text-[#D4AF37] fill-current" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                <span>📞 {user.phone}</span>
                <span>•</span>
                <span>✉️ {user.email}</span>
                {user.savedAddresses?.[0]?.area && (
                  <>
                    <span>•</span>
                    <span className="text-[#8A3D52] dark:text-rose-400 font-medium">
                      📍 {user.savedAddresses[0].area}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                showToast('Signed out of account');
              }}
              className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#15161E] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#8A3D52] dark:text-rose-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-gray-900 dark:text-white">Customer Account & Order Hub</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to view real-time delivery status updates and track purchases</p>
            </div>
          </div>

          <form onSubmit={handleGuestLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              placeholder="Your Full Name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs"
            />
            <input
              type="email"
              required
              placeholder="Email Address *"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-[#8A3D52] hover:bg-[#732F42] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Sign In / Continue
            </button>
          </form>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' 
              ? 'bg-[#8A3D52] text-white shadow-xs' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracking' 
              ? 'bg-[#8A3D52] text-white shadow-xs' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Accra Tracking</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-[#8A3D52] text-white shadow-xs' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Address</span>
          </button>
        )}
      </div>

      {/* TAB 1: ORDERS LIST WITH REAL-TIME STATUS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#15161E] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A3D52] dark:text-rose-400" />
              <span className="text-xs font-serif font-bold text-gray-900 dark:text-white">
                Live Status Tracker & Accra Courier Dispatch
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateSampleOrder}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[#8A3D52] dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Demo Order</span>
              </button>
            </div>
          </div>

          {customerOrders.length === 0 ? (
            <div className="bg-white dark:bg-[#15161E] rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 space-y-4 transition-colors">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-[#8A3D52] dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">No Orders Found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  You don't have any placed orders yet. Generate a test order or explore our authentic beauty catalog!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCreateSampleOrder}
                  className="px-5 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Test Order</span>
                </button>
                <button
                  onClick={onBackToShop}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
          ) : (
            customerOrders.map(order => {
              const statusCfg = getStatusBadgeConfig(order.status);
              const stage = getStageIndex(order.status);
              const isExpanded = !!expandedOrderIds[order.id];
              const activityLogs = getOrderActivityLogs(order);

              return (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-[#15161E] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 transition-all"
                >
                  {/* Top Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-[#8A3D52] dark:text-rose-400">
                          #{order.orderNumber}
                        </span>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Deliver to: <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.area || 'Accra'})</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Real-time status pill */}
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${statusCfg.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                        <span>{statusCfg.label}</span>
                      </span>

                      {/* Advance Stage button for simulation */}
                      <button
                        onClick={() => advanceOrderStatus(order)}
                        title="Simulate advancing to the next live dispatch status stage"
                        className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-[#8A3D52] hover:text-white dark:hover:bg-[#8A3D52] text-[#8A3D52] dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Advance Status</span>
                      </button>

                      {/* Track in Live Map View */}
                      <button
                        onClick={() => handleTrackDirectOrder(order)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-[#8A3D52] hover:text-white text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Track Live</span>
                      </button>
                    </div>
                  </div>

                  {/* REAL-TIME 4-STAGE STEPPER */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 animate-pulse" />
                        <span>Order Dispatch Lifecycle</span>
                      </span>
                      <span className="text-[11px] text-[#8A3D52] dark:text-rose-400 font-bold">
                        {statusCfg.etaText}
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8A3D52] via-[#A25F6F] to-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: statusCfg.barWidth }}
                      />
                    </div>

                    {/* 4 Interactive Milestones */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      
                      {/* Step 1: Confirmed */}
                      <div className={`p-3 rounded-2xl border transition-all ${
                        stage >= 0 
                          ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60' 
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 1</span>
                          {stage >= 1 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">Confirmed</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          Genuine batch verified & logged
                        </p>
                      </div>

                      {/* Step 2: Processing */}
                      <div className={`p-3 rounded-2xl border transition-all ${
                        stage >= 1 
                          ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60' 
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Step 2</span>
                          {stage > 1 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : stage === 1 ? (
                            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">Processing</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          Hologram sealed at Botwe Hub
                        </p>
                      </div>

                      {/* Step 3: Out for Delivery */}
                      <div className={`p-3 rounded-2xl border transition-all ${
                        stage >= 2 
                          ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60' 
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Step 3</span>
                          {stage > 2 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : stage === 2 ? (
                            <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-bounce" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">Out for Delivery</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          Dedicated motorbike dispatch
                        </p>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className={`p-3 rounded-2xl border transition-all ${
                        stage === 3 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60' 
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Step 4</span>
                          {stage === 3 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">Delivered</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          Doorstep handoff verified
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* ACTIVE COURIER BANNER (Visible during Processing or Out for Delivery) */}
                  {(stage === 1 || stage === 2) && (
                    <div className="bg-gradient-to-r from-purple-50 via-rose-50/40 to-white dark:from-[#1E1C2B] dark:via-[#191A26] dark:to-[#15161E] border border-purple-200/80 dark:border-purple-900/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {order.riderInfo?.riderName || 'Kwame Boateng (CR Courier #04)'}
                            </span>
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.2 rounded font-bold uppercase">
                              Active Rider
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            <span>{order.riderInfo?.riderLocation || `En route to ${order.shippingAddress.area}`}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <a
                          href={`tel:${order.riderInfo?.riderPhone || '+233249876543'}`}
                          className="flex-1 md:flex-initial px-3 py-1.5 bg-white dark:bg-[#252836] hover:bg-gray-100 dark:hover:bg-[#2C3042] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call Rider</span>
                        </a>

                        <a
                          href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}?text=${encodeURIComponent(`Hello CR Concierge, I am inquiring about my live order #${order.orderNumber} dispatched to ${order.shippingAddress.area}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-initial px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ORDER ITEMS PREVIEW */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Items in this Order ({order.items.length})</span>
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="text-[#8A3D52] dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Full Details & Live Log'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-10 h-10 rounded-xl object-cover bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shrink-0" 
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {item.product.name}
                              </h4>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {item.product.brand} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 shrink-0 font-mono">
                            GHS {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EXPANDABLE LIVE ACTIVITY AUDIT TRAIL */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-4 animate-fadeIn">
                      
                      <div className="space-y-2">
                        <h5 className="text-xs font-serif font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400" />
                          <span>Real-Time Dispatch Activity Log</span>
                        </h5>

                        <div className="bg-gray-50/70 dark:bg-[#191A26] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3 text-xs">
                          {activityLogs.map((log, lIdx) => (
                            <div key={lIdx} className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0">
                                {log.done ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : log.current ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 dark:border-purple-400 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                                  </div>
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`font-bold ${log.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {log.title}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {log.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Financial Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 bg-gray-50 dark:bg-[#191A26] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="font-bold text-gray-900 dark:text-white block">Delivery Destination</span>
                          <p className="text-gray-600 dark:text-gray-300">{order.shippingAddress.fullName}</p>
                          <p className="text-gray-500 dark:text-gray-400">{order.shippingAddress.area}, {order.shippingAddress.city}</p>
                          {order.shippingAddress.landmarkOrGps && (
                            <p className="text-[#8A3D52] dark:text-rose-400 font-mono text-[11px]">
                              GPS: {order.shippingAddress.landmarkOrGps}
                            </p>
                          )}
                          <p className="text-gray-500 dark:text-gray-400 text-[11px]">Phone: {order.shippingAddress.phone}</p>
                        </div>

                        <div className="p-3.5 bg-gray-50 dark:bg-[#191A26] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5">
                          <span className="font-bold text-gray-900 dark:text-white block">Payment & Summary</span>
                          <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Subtotal:</span>
                            <span>GHS {order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Accra Delivery Fee:</span>
                            <span>GHS {order.shippingFee.toFixed(2)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>Discount Applied:</span>
                              <span>- GHS {order.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1">
                            <span>Total Paid:</span>
                            <span className="text-[#8A3D52] dark:text-rose-400 font-mono">GHS {order.total.toFixed(2)}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase font-mono">
                            Method: {order.paymentMethod.replace('-', ' ')} ({order.paymentStatus})
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Bottom Summary Bar */}
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span>Total Amount:</span>
                      <span className="text-[#8A3D52] dark:text-rose-400 font-mono text-sm">
                        GHS {order.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTrackDirectOrder(order)}
                        className="px-3.5 py-1.5 bg-[#8A3D52] hover:bg-[#732F42] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Live Courier View</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: LIVE ACCRA TRACKING */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          
          {/* Tracking Search Input & Quick Selector */}
          <div className="bg-white dark:bg-[#15161E] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                  Accra Dispatch Radar
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track live motor courier movement from Botwe School Junction to your doorstep
                </p>
              </div>

              {/* Quick Select from existing orders */}
              {customerOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Your Orders:</span>
                  <select
                    onChange={e => {
                      const selected = storeOrders.find(o => o.orderNumber === e.target.value);
                      if (selected) handleTrackDirectOrder(selected);
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-mono focus:outline-none"
                    value={activeTrackedOrder?.orderNumber || ''}
                  >
                    <option value="">Select Order...</option>
                    {customerOrders.map(o => (
                      <option key={o.id} value={o.orderNumber}>
                        #{o.orderNumber} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. CR-GH-1234)"
                value={searchOrderId}
                onChange={e => setSearchOrderId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Track
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{trackError}</span>
              </p>
            )}
          </div>

          {/* Active Tracked Order Details */}
          {activeTrackedOrder ? (
            <div className="bg-white dark:bg-[#15161E] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 animate-fadeIn transition-colors">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Tracking Dispatch
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                    #{activeTrackedOrder.orderNumber}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    activeTrackedOrder.status === 'Delivered' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : activeTrackedOrder.status === 'Out for Delivery' 
                      ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 animate-pulse' 
                      : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {activeTrackedOrder.status}
                  </span>

                  {/* Fast advance button on tracking tab */}
                  <button
                    onClick={() => {
                      const matched = storeOrders.find(o => o.orderNumber === activeTrackedOrder.orderNumber || o.id === activeTrackedOrder.id);
                      if (matched) advanceOrderStatus(matched);
                    }}
                    className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-[#8A3D52] hover:text-white text-[#8A3D52] dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Advance Stage</span>
                  </button>
                </div>
              </div>

              {/* Accra Route Visualizer Map Card */}
              <div className="relative rounded-2xl overflow-hidden border border-rose-100 dark:border-gray-800 bg-gradient-to-br from-[#FAF5F4] via-white to-rose-50/40 dark:from-[#181924] dark:via-[#1B1D28] dark:to-[#181924] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#8A3D52] dark:text-rose-400" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Live Delivery Route • Greater Accra Corridor
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#8A3D52] text-white px-2 py-0.5 rounded-full font-bold">
                    ETA: {activeTrackedOrder.estimatedArrival}
                  </span>
                </div>

                {/* Stylized Visual Corridor */}
                <div className="relative py-4 px-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8A3D52] to-emerald-500 rounded-full transition-all duration-700"
                      style={{ 
                        width: activeTrackedOrder.stageIndex === 3 ? '100%' : activeTrackedOrder.stageIndex === 2 ? '70%' : activeTrackedOrder.stageIndex === 1 ? '35%' : '10%' 
                      }}
                    />
                  </div>

                  {/* Route Hubs */}
                  <div className="flex items-center justify-between pt-3 text-xs">
                    <div className="text-left">
                      <div className="w-3 h-3 rounded-full bg-[#8A3D52] mx-auto sm:mx-0 mb-1" />
                      <span className="font-bold text-gray-900 dark:text-white block">Botwe Hub</span>
                      <span className="text-[10px] text-gray-400">School Junction</span>
                    </div>

                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${activeTrackedOrder.stageIndex >= 2 ? 'bg-purple-600 animate-ping' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="font-bold text-gray-900 dark:text-white block">En Route</span>
                      <span className="text-[10px] text-gray-400">Accra Dispatch</span>
                    </div>

                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ml-auto mb-1 ${activeTrackedOrder.stageIndex === 3 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="font-bold text-gray-900 dark:text-white block">{activeTrackedOrder.area}</span>
                      <span className="text-[10px] text-gray-400">{activeTrackedOrder.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {activeTrackedOrder.trackingSteps.map((step: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all ${
                    step.done 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                      : step.current 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-[#8A3D52] dark:border-rose-500 ring-1 ring-[#8A3D52]' 
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Step {idx + 1}
                      </span>
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">{step.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">{step.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Courier and Dispatch details */}
              <div className="p-4 bg-gray-50 dark:bg-[#191A26] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#8A3D52] dark:text-rose-400" />
                    <span>Courier Assigned</span>
                  </span>
                  <span>{activeTrackedOrder.riderName}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeTrackedOrder.riderLocation}</span>
                </p>
              </div>

              {/* WhatsApp Concierge Assistance */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200">Need live concierge assistance?</h4>
                  <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">Chat directly with CR Concierge on WhatsApp</p>
                </div>
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}?text=${encodeURIComponent(`Hello CR Cosmetics, I am checking on my live order #${activeTrackedOrder.orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#15161E] rounded-3xl p-10 text-center border border-gray-200 dark:border-gray-800 space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#8A3D52] dark:text-rose-400 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                Enter an Order ID Above to Track Dispatch
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Track your shipment in real time as our dedicated motor courier navigates to your doorstep in Greater Accra.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & ADDRESS */}
      {activeTab === 'profile' && user && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#15161E] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4 text-xs transition-colors">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">Delivery Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Area / Neighborhood in Accra</label>
              <input
                type="text"
                placeholder="e.g. East Legon, Botwe, Spintex, Osu"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Landmark / Digital Address (GhanaPost GPS)</label>
              <input
                type="text"
                placeholder="e.g. Near Botwe School Junction or GA-123-4567"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#8A3D52] hover:bg-[#732F42] text-white font-bold rounded-xl cursor-pointer transition-all shadow-xs uppercase tracking-wider"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
