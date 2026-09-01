import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  KeyRound,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { ProductCard } from '../product/ProductCard';
import { Button, Badge } from '../common/UIPrimitives';
import logoImg from '../../assets/logo.jpeg';

export const AccountPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { products } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');

  const { wishlistIds } = useWishlist();
  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <User className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-2xl font-extrabold uppercase text-[#1C1817] dark:text-stone-100">Customer Account</h2>
        <p className="text-xs text-stone-500">Please sign in to view your orders, saved addresses, and persistent wishlist.</p>
        <div className="flex justify-center gap-4">
          <Link to="/signin">
            <Button variant="primary" className="rounded-full px-6 text-xs uppercase font-bold">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="rounded-full px-6 text-xs uppercase font-bold">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">

      {/* Header Profile Banner */}
      <div className="bg-white dark:bg-[#1C1917] p-6 sm:p-8 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1C1817] text-white flex items-center justify-center font-extrabold text-xl">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-[-0.05em] text-[var(--text-primary)]">{user?.fullName}</h1>
            <span className="text-xs text-stone-400 font-semibold">{user?.email} • {user?.phone}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="rounded-full text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#E6DFD7] dark:border-[#36322E] gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'profile' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Info</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({user?.orders.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'wishlist' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-400'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] max-w-xl space-y-4">
            <h3 className="text-base font-extrabold uppercase pb-2 border-b border-[#E6DFD7]">Customer Profile Details</h3>
            <div className="space-y-3 text-xs">
              <div><strong className="block text-stone-500">Full Name:</strong> <span className="font-bold text-stone-900 dark:text-stone-100">{user?.fullName}</span></div>
              <div><strong className="block text-stone-500">Email Address:</strong> <span className="font-bold text-stone-900 dark:text-stone-100">{user?.email}</span></div>
              <div><strong className="block text-stone-500">Mobile Money / Phone:</strong> <span className="font-bold text-stone-900 dark:text-stone-100">{user?.phone}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {user?.orders && user.orders.length > 0 ? (
              user.orders.map(ord => (
                <div key={ord.id} className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-[#1C1817] dark:text-stone-100">Order #{ord.orderNumber}</span>
                      <span className="text-stone-400 block">{ord.createdAt}</span>
                    </div>
                    <Badge variant="botanical">{ord.status}</Badge>
                  </div>

                  <div className="border-t border-[#E6DFD7] pt-3 flex justify-between items-center text-xs">
                    <span>Total Amount: <strong className="text-base font-extrabold">GHS {ord.total.toFixed(2)}</strong></span>
                  </div>
                  <div className="border-t border-[#E6DFD7] pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">Order tracking</p>
                    <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold">
                      {['Confirmed', 'Packing Order', 'Out for Delivery', 'Delivered'].map((stage, index) => {
                        const current = ord.status === 'Delivered' ? 3 : ord.status === 'Out for Delivery' ? 2 : ord.status === 'Packing Order' ? 1 : 0;
                        return <div key={stage} className={index <= current ? 'text-[#8A3D52]' : 'text-stone-300'}><span className={`mx-auto mb-1 block h-2 w-2 rounded-full ${index <= current ? 'bg-[#8A3D52]' : 'bg-stone-200'}`} />{stage}</div>;
                      })}
                    </div>
                    {ord.riderInfo && <p className="mt-3 text-xs text-stone-500">Courier: {ord.riderInfo.riderName} · {ord.riderInfo.riderPhone} · {ord.riderInfo.estimatedArrival}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#1C1917] p-12 rounded-3xl border border-[#E6DFD7] text-center space-y-3">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">You have no past orders yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1C1917] p-12 rounded-3xl border border-[#E6DFD7] text-center space-y-3">
                <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">Your saved wishlist is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/account');
    } catch {
      showAlert('Sign in failed. Check your email and password and try again.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-[#1C1917] p-8 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-[#E6DFD7] shadow-sm">
            <img src={logoImg} alt="CR Cosmetics & Essentials" className="w-14 h-14 rounded-xl object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase">Sign In to Store</h1>
          <p className="text-xs text-stone-400">Manage orders, saved items, and local addresses.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full rounded-full py-3.5 uppercase text-xs font-bold">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-stone-500">
          Don&apos;t have an account? <Link to="/signup" className="text-[#C86D51] font-bold">Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, fullName, phone, password);
      navigate('/account');
    } catch {
      showAlert('Account creation failed. Please check your details and try again.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-[#1C1917] p-8 rounded-3xl border border-[#E6DFD7] dark:border-[#36322E] space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-[#E6DFD7] shadow-sm">
            <img src={logoImg} alt="CR Cosmetics & Essentials" className="w-14 h-14 rounded-xl object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase">Create Account</h1>
          <p className="text-xs text-[#6E6763]">Join CR Cosmetics &amp; Essentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (MoMo)</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#F5F0EB] text-xs p-3 rounded-xl border border-[#E6DFD7]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full rounded-full py-3.5 uppercase text-xs font-bold">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};
