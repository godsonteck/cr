import React, { useState } from 'react';
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
  ShieldCheck,
  User,
  ShoppingBag
} from 'lucide-react';
import { Order, ShippingAddress } from '../../types';

interface AccountViewProps {
  onBackToShop: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onBackToShop }) => {
  const { user, login, logout, updateProfile, saveAddress } = useAuth();
  const { orders: storeOrders, storeSettings } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'profile'>('orders');
  
  // Tracking search state
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

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

  // Collect all customer-related orders
  const customerOrders = (user?.orders && user.orders.length > 0) 
    ? user.orders 
    : (user?.email ? storeOrders.filter(o => o.shippingAddress?.email?.toLowerCase() === user.email.toLowerCase()) : []);

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
      const stage = matchedOrder.status === 'Delivered' ? 3 
        : matchedOrder.status === 'Out for Delivery' ? 2 
        : matchedOrder.status === 'Packing Order' ? 1 : 0;

      const orderData = {
        orderNumber: matchedOrder.orderNumber,
        recipient: matchedOrder.shippingAddress?.fullName || 'Recipient',
        area: matchedOrder.shippingAddress?.area || 'Accra Location',
        city: matchedOrder.shippingAddress?.city || 'Accra',
        landmark: matchedOrder.shippingAddress?.landmarkOrGps || 'Delivery point',
        phone: matchedOrder.shippingAddress?.phone || '',
        items: matchedOrder.items.map(i => ({
          name: i.product.name,
          brand: i.product.brand,
          qty: i.quantity,
          price: i.product.price,
          image: i.product.image
        })),
        total: matchedOrder.total,
        placedAt: new Date(matchedOrder.createdAt).toLocaleDateString() + ' ' + new Date(matchedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: matchedOrder.status || 'Confirmed',
        stageIndex: stage,
        estimatedArrival: matchedOrder.estimatedDeliveryTime || 'Dispatched via Accra Express',
        riderName: matchedOrder.riderInfo?.riderName || 'Kwame Boateng (CR Dispatch Team)',
        riderPhone: matchedOrder.riderInfo?.riderPhone || '+233 24 987 6543',
        riderLocation: matchedOrder.riderInfo?.riderLocation || `En route to ${matchedOrder.shippingAddress?.area || 'destination'}`,
        trackingSteps: [
          { title: 'Order Verified & Logged', subtitle: 'Store logged genuine batch credentials', time: 'Logged', done: true },
          { title: 'Authenticity Check & Packaging', subtitle: 'Botwe School Junction Store — Quality Sealed', time: 'In Progress', done: stage >= 1, current: stage === 1 },
          { title: 'Dispatched with Accra Courier', subtitle: 'Motor courier assigned for direct delivery', time: 'Active', done: stage >= 2, current: stage === 2 },
          { title: 'Doorstep Delivery', subtitle: `Direct drop-off at ${matchedOrder.shippingAddress?.area || 'Accra'}`, time: 'Final Step', done: stage === 3, current: stage === 3 }
        ]
      };
      setActiveTrackedOrder(orderData);
      setActiveTab('tracking');
      showToast(`Tracking status loaded for #${matchedOrder.orderNumber}`);
      return;
    }

    setTrackError(`No order found matching "${searchOrderId}". Please verify the order number.`);
    setActiveTrackedOrder(null);
  };

  const handleTrackDirectOrder = (order: Order) => {
    setSearchOrderId(order.orderNumber);
    const stage = order.status === 'Delivered' ? 3 
      : order.status === 'Out for Delivery' ? 2 
      : order.status === 'Packing Order' ? 1 : 0;

    const orderData = {
      orderNumber: order.orderNumber,
      recipient: order.shippingAddress.fullName,
      area: order.shippingAddress.area,
      city: order.shippingAddress.city,
      landmark: order.shippingAddress.landmarkOrGps || 'Accra location',
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
      riderName: order.riderInfo?.riderName || 'Kwame Boateng (CR Courier)',
      riderPhone: order.riderInfo?.riderPhone || '+233 24 987 6543',
      riderLocation: order.riderInfo?.riderLocation || `En route to ${order.shippingAddress.area}`,
      trackingSteps: [
        { title: 'Order Verified & Logged', subtitle: 'CR Concierge confirmed order details', time: 'Confirmed', done: true },
        { title: 'Authenticity Check & Packaging', subtitle: 'Botwe Hub — Quality Packed & Sealed', time: 'Packed', done: stage >= 1, current: stage === 1 },
        { title: 'Dispatched with Accra Courier', subtitle: `Dedicated rider navigating to ${order.shippingAddress.area}`, time: 'Active', done: stage >= 2, current: stage === 2 },
        { title: 'Doorstep Delivery', subtitle: 'Handoff at destination', time: 'Pending', done: stage === 3, current: stage === 3 }
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
      
      {/* Back Button */}
      <button
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#8A3D52] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Store</span>
      </button>

      {/* User Header */}
      {user ? (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8A3D52] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {user.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                  {user.fullName}
                </h1>
                <Crown className="w-4 h-4 text-[#D4AF37] fill-current" />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <span>📞 {user.phone}</span>
                <span>•</span>
                <span>✉️ {user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                showToast('Signed out of account');
              }}
              className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#8A3D52] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-gray-900">Customer Account</h2>
              <p className="text-xs text-gray-500">Sign in to view your orders and track recent purchases</p>
            </div>
          </div>

          <form onSubmit={handleGuestLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              placeholder="Your Full Name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
            <input
              type="email"
              required
              placeholder="Email Address *"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
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
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#8A3D52] text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracking' ? 'bg-[#8A3D52] text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Tracking</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#8A3D52] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Address</span>
          </button>
        )}
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-[#8A3D52] rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-gray-900">No Orders Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You haven't placed any orders yet. Explore our genuine cosmetics, skincare, and fragrances!
                </p>
              </div>
              <button
                onClick={onBackToShop}
                className="px-6 py-2.5 bg-[#8A3D52] text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            customerOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#8A3D52]">#{order.orderNumber}</span>
                    <p className="text-[11px] text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      order.status === 'Out for Delivery' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      order.status === 'Packing Order' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => handleTrackDirectOrder(order)}
                      className="px-3 py-1 bg-gray-100 hover:bg-[#8A3D52] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Track
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity} × GHS {item.product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="text-[#8A3D52] font-mono text-sm">GHS {order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: LIVE TRACKING */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Tracking Search Input */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-gray-900">Track Any CR Order</h3>
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. CR-GH-1234)"
                value={searchOrderId}
                onChange={e => setSearchOrderId(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono uppercase"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#8A3D52] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Track
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-600 font-medium">{trackError}</p>
            )}
          </div>

          {/* Active Tracked Order Details */}
          {activeTrackedOrder && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tracking Order</span>
                  <h2 className="text-lg font-serif font-bold text-gray-900 font-mono">#{activeTrackedOrder.orderNumber}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeTrackedOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    activeTrackedOrder.status === 'Out for Delivery' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {activeTrackedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {activeTrackedOrder.trackingSteps.map((step: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all ${
                    step.done ? 'bg-emerald-50/50 border-emerald-200' :
                    step.current ? 'bg-rose-50 border-[#8A3D52] ring-1 ring-[#8A3D52]' :
                    'bg-gray-50 border-gray-100 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Step {idx + 1}</span>
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-gray-900">{step.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">{step.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Courier and Dispatch details */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#8A3D52]" />
                    <span>Courier Assigned</span>
                  </span>
                  <span>{activeTrackedOrder.riderName}</span>
                </div>
                <p className="text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeTrackedOrder.riderLocation}</span>
                </p>
              </div>

              {/* WhatsApp Concierge Assistance */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <h4 className="font-bold text-emerald-950">Need live assistance on this delivery?</h4>
                  <p className="text-emerald-800 text-[11px]">Chat directly with CR Concierge on WhatsApp</p>
                </div>
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber || '233551234567'}?text=${encodeURIComponent(`Hello CR Cosmetics, I am checking on my order #${activeTrackedOrder.orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & ADDRESS */}
      {activeTab === 'profile' && user && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-gray-900">Delivery Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Area / Neighborhood in Accra</label>
              <input
                type="text"
                placeholder="e.g. East Legon, Botwe, Spintex, Osu"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Landmark / Digital Address (GhanaPost GPS)</label>
              <input
                type="text"
                placeholder="e.g. Near Botwe School Junction or GA-123-4567"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl"
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
