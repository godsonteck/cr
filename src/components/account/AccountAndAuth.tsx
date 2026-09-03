import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Settings,
  Headphones,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { ProductCard } from '../product/ProductCard';
import { Button, Badge } from '../common/UIPrimitives';
import { ShippingAddress } from '../../types';
import logoImg from '../../assets/logo.jpeg';

export const AccountPage: React.FC = () => {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { products, storeSettings } = useStore();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', email: user?.email || '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const [orderNotifications, setOrderNotifications] = useState(() => localStorage.getItem('cr_order_notifications') !== 'false');
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    area: '',
    landmarkOrGps: '',
  });

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

  const handleAddAddress = async () => {
    if (!user) return;
    try {
      const updatedAddresses = [...(user.savedAddresses || []), addressForm];
      await updateProfile({ savedAddresses: updatedAddresses });
      showAlert('Address added successfully', 'success');
      setIsAddingAddress(false);
      setAddressForm({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        area: '',
        landmarkOrGps: '',
        deliveryNotes: '',
      });
    } catch {
      showAlert('Failed to add address', 'error');
    }
  };

  const handleUpdateAddress = async (index: number) => {
    if (!user) return;
    try {
      const updatedAddresses = [...user.savedAddresses];
      updatedAddresses[index] = addressForm;
      await updateProfile({ savedAddresses: updatedAddresses });
      showAlert('Address updated successfully', 'success');
      setEditingAddressIndex(null);
      setAddressForm({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        area: '',
        landmarkOrGps: '',
        deliveryNotes: '',
      });
    } catch {
      showAlert('Failed to update address', 'error');
    }
  };

  const handleRemoveAddress = async (index: number) => {
    if (!user || !window.confirm('Remove this address?')) return;
    try {
      const updatedAddresses = user.savedAddresses.filter((_, i) => i !== index);
      await updateProfile({ savedAddresses: updatedAddresses });
      showAlert('Address removed successfully', 'success');
    } catch {
      showAlert('Failed to remove address', 'error');
    }
  };

  const navigationItems = [
    { id: 'profile' as const, label: 'My account', icon: User, count: undefined },
    { id: 'orders' as const, label: 'My orders', icon: Package, count: user?.orders?.length || 0 },
    { id: 'wishlist' as const, label: 'Wish list', icon: Heart, count: wishlistIds.length },
    { id: 'addresses' as const, label: 'Shipping addresses', icon: MapPin, count: user?.savedAddresses?.length || 0 },
  ];

  const setTab = (tab: typeof activeTab) => setActiveTab(tab);

  const updateOrderNotifications = (enabled: boolean) => {
    setOrderNotifications(enabled);
    localStorage.setItem('cr_order_notifications', String(enabled));
  };
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#fff7f8] py-6 font-sans sm:py-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#cf6c8a]">Account center</p>
            <h1 className="text-2xl font-black tracking-tight text-[#2a1d20] sm:text-3xl">Hi, {user?.fullName.split(' ')[0]}</h1>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="hidden items-center gap-2 text-xs font-bold text-[#6f5b60] transition hover:text-[#a94c63] sm:flex"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit overflow-hidden rounded-2xl border border-[#f2dfe7] bg-white shadow-[0_12px_30px_rgba(128,72,93,0.06)]">
            <div className="bg-[#a94c63] px-4 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-lg font-black">
                  {user?.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{user?.fullName}</p>
                  <p className="truncate text-[10px] text-white/75">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setTab('profile')} className="mt-4 flex items-center gap-1 text-[10px] font-bold text-white/80 hover:text-white">
                Edit profile <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <nav className="p-2">
              {navigationItems.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-bold transition ${activeTab === id ? 'bg-[#fdeef4] text-[#a94c63]' : 'text-[#6f5b60] hover:bg-[#fff1f5] hover:text-[#a94c63]'}`}
                >
                  <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>
                  {count !== undefined && <span className="text-[10px] font-extrabold text-[#8e7077]">{count}</span>}
                </button>
              ))}
              <div className="my-2 border-t border-[#f2dfe7]" />
              <Link to="/support" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-[#6f5b60] hover:bg-[#fff1f5] hover:text-[#a94c63]"><Headphones className="h-4 w-4" />Help center</Link>
              <button onClick={() => setTab('settings')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition ${activeTab === 'settings' ? 'bg-[#fdeef4] text-[#a94c63]' : 'text-[#6f5b60] hover:bg-[#fff1f5] hover:text-[#a94c63]'}`}><Settings className="h-4 w-4" />Settings</button>
            </nav>
          </aside>

          <main className="min-w-0">
            <section className="overflow-hidden rounded-2xl border border-[#f2dfe7] bg-white shadow-[0_12px_30px_rgba(128,72,93,0.06)]">
              <div className="flex flex-col justify-between gap-5 bg-gradient-to-r from-[#fff0f4] via-[#fff8f9] to-[#f8edf3] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a94c63]">Shopping overview</p>
                  <h2 className="mt-1 text-lg font-black text-[#2a1d20]">Your account at a glance</h2>
                  <p className="mt-1 text-xs text-[#6f5b60]">Track purchases, save favourites, and keep delivery details ready.</p>
                </div>
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#cf6c8a] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#a94c63]">Continue shopping <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-[#f2dfe7] border-t border-[#f2dfe7] sm:grid-cols-4 sm:divide-y-0">
                {[
                  { label: 'To pay', value: '0', icon: CreditCard, tab: 'orders' as const },
                  { label: 'To ship', value: '0', icon: ShoppingBag, tab: 'orders' as const },
                  { label: 'Shipped', value: '0', icon: Truck, tab: 'orders' as const },
                  { label: 'Returns', value: '0', icon: RotateCcw, tab: 'orders' as const },
                ].map(({ label, value, icon: Icon, tab }) => (
                  <button key={label} onClick={() => setTab(tab)} className="group flex items-center gap-3 px-4 py-4 text-left transition hover:bg-[#fff7f8] sm:px-5">
                    <Icon className="h-5 w-5 text-[#cf6c8a] transition group-hover:scale-110" />
                    <span><strong className="block text-base font-black text-[#2a1d20]">{value}</strong><span className="text-[10px] font-semibold text-[#8e7077]">{label}</span></span>
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-[#f2dfe7] bg-white p-1.5 shadow-[0_8px_20px_rgba(128,72,93,0.04)]">
              {navigationItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-extrabold transition sm:px-4 ${activeTab === id ? 'bg-[#cf6c8a] text-white' : 'text-[#6f5b60] hover:bg-[#fff1f5]'}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>

      {/* Tab Content */}
      <div className="mt-5">
        {/* Settings Tab */}
        {activeTab === 'settings' && user && (
          <div className="max-w-3xl space-y-5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#cf6c8a]">Preferences</p>
              <h2 className="mt-1 text-xl font-black text-[#2a1d20]">Settings</h2>
              <p className="mt-1 text-xs text-[#6f5b60]">Manage how your account and shopping experience work.</p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-[#f2dfe7] bg-white shadow-[0_12px_30px_rgba(128,72,93,0.06)]">
              <div className="border-b border-[#f2dfe7] px-5 py-4">
                <h3 className="text-sm font-extrabold text-[#2a1d20]">Display</h3>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Settings className="mt-0.5 h-5 w-5 text-[#cf6c8a]" />
                  <div><p className="text-xs font-bold text-[#2a1d20]">Theme</p><p className="mt-1 text-[11px] text-[#8e7077]">Choose a light or dark storefront.</p></div>
                </div>
                <div className="flex rounded-lg border border-[#f2dfe7] bg-[#fff7f8] p-1">
                  {(['light', 'dark'] as const).map(option => (
                    <button key={option} onClick={() => setTheme(option)} className={`rounded-md px-3 py-2 text-[10px] font-extrabold capitalize transition ${theme === option ? 'bg-[#cf6c8a] text-white' : 'text-[#6f5b60] hover:text-[#a94c63]'}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#f2dfe7] bg-white shadow-[0_12px_30px_rgba(128,72,93,0.06)]">
              <div className="border-b border-[#f2dfe7] px-5 py-4"><h3 className="text-sm font-extrabold text-[#2a1d20]">Notifications</h3></div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 text-[#cf6c8a]" /><div><p className="text-xs font-bold text-[#2a1d20]">Order updates</p><p className="mt-1 text-[11px] text-[#8e7077]">Receive delivery and order status updates.</p></div></div>
                <button role="switch" aria-checked={orderNotifications} onClick={() => updateOrderNotifications(!orderNotifications)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${orderNotifications ? 'bg-[#cf6c8a]' : 'bg-[#d9cbd0]'}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${orderNotifications ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#f2dfe7] bg-white shadow-[0_12px_30px_rgba(128,72,93,0.06)]">
              <div className="border-b border-[#f2dfe7] px-5 py-4"><h3 className="text-sm font-extrabold text-[#2a1d20]">Account security</h3></div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#cf6c8a]" /><div><p className="text-xs font-bold text-[#2a1d20]">Signed in as</p><p className="mt-1 text-[11px] text-[#8e7077]">{user.email}</p></div></div>
                <button onClick={() => { logout(); navigate('/'); }} className="rounded-lg border border-[#f2dfe7] px-3 py-2 text-[10px] font-extrabold text-[#a94c63] transition hover:bg-[#fff1f5]">Sign out</button>
              </div>
            </section>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && user && (
          <div className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] max-w-xl space-y-5">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6DFD7]">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#C86D51]" />
                <h3 className="text-base font-extrabold uppercase">Profile Information</h3>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setEditForm({ fullName: user.fullName, phone: user.phone, email: user.email });
                  }}
                  className="text-xs font-bold text-[#C86D51] hover:text-[#8A3D52] transition flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-stone-700 dark:text-stone-200 font-semibold mb-1">Full Name</p>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-stone-700 dark:text-stone-200 font-semibold mb-1">Phone</p>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{user.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-stone-700 dark:text-stone-200 font-semibold mb-1">Email Address</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{user.email}</p>
                  <p className="text-[9px] text-stone-500 dark:text-stone-300 mt-1">Email address cannot be changed</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await updateProfile(editForm);
                    showAlert('Profile updated successfully', 'success');
                    setIsEditingProfile(false);
                  } catch {
                    showAlert('Failed to update profile', 'error');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-200 block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-[#F5F0EB] text-stone-900 dark:bg-[#2B2620] dark:text-stone-100 text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-200 block mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="w-full bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300 text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                  />
                  <p className="text-[9px] text-stone-500 dark:text-stone-300 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-200 block mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#F5F0EB] text-stone-900 dark:bg-[#2B2620] dark:text-stone-100 text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#C86D51] hover:bg-[#8A3D52] text-white text-xs font-bold py-2 rounded-xl transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-stone-100 dark:bg-[#2B2620] hover:bg-stone-200 dark:hover:bg-[#36322E] text-stone-700 dark:text-stone-300 text-xs font-bold py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && user && (
          <div className="space-y-4 max-w-3xl">
            <div className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E]">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6DFD7]">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#C86D51]" />
                  <h3 className="text-base font-extrabold uppercase">Saved Addresses</h3>
                </div>
                {!isAddingAddress && editingAddressIndex === null && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-xs font-bold bg-[#C86D51] hover:bg-[#8A3D52] text-white px-4 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add New Address
                  </button>
                )}
              </div>

              {isAddingAddress || editingAddressIndex !== null ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editingAddressIndex !== null) {
                      await handleUpdateAddress(editingAddressIndex);
                    } else {
                      await handleAddAddress();
                    }
                  }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-600 block mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-600 block mb-2">Phone</label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                      />
                    </div>
                  </div>

                  <div>
                      <label className="text-xs font-bold text-stone-600 block mb-2">Area/District</label>
                      <input
                        type="text"
                        required
                        value={addressForm.area}
                        onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                        placeholder="District or area name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-2">Landmark or GPS Coordinates</label>
                    <input
                      type="text"
                      value={addressForm.landmarkOrGps}
                      onChange={(e) => setAddressForm({ ...addressForm, landmarkOrGps: e.target.value })}
                      placeholder="e.g., Next to ABC Market or GPS: 5.6037, -0.1870"
                      className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-2">Delivery Notes (Optional)</label>
                    <textarea
                      value={addressForm.deliveryNotes}
                      onChange={(e) => setAddressForm({ ...addressForm, deliveryNotes: e.target.value })}
                      placeholder="e.g., Gate code, intercom number, best time to deliver"
                      className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E] resize-none h-20"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#C86D51] hover:bg-[#8A3D52] text-white text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      {editingAddressIndex !== null ? 'Update Address' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddressIndex(null);
                        setAddressForm({
                          fullName: '',
                          phone: '',
                          email: '',
                          city: '',
                          area: '',
                          landmarkOrGps: '',
                          deliveryNotes: '',
                        });
                      }}
                      className="flex-1 bg-stone-100 dark:bg-[#2B2620] hover:bg-stone-200 dark:hover:bg-[#36322E] text-stone-700 dark:text-stone-300 text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4">
                  {user.savedAddresses && user.savedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.savedAddresses.map((addr, idx) => (
                        <div key={idx} className="p-4 border border-[#E6DFD7] rounded-xl text-xs space-y-2 hover:border-[#C86D51] transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-bold text-stone-900 dark:text-stone-100">{addr.fullName}</p>
                              <p className="text-stone-500 text-[10px]">{addr.city}</p>
                              <p className="text-stone-500 text-[10px]">{addr.area}</p>
                              <p className="text-stone-500 text-[10px]">{addr.phone}</p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => {
                                  setEditingAddressIndex(idx);
                                  setAddressForm(addr);
                                }}
                                className="text-[#C86D51] hover:text-[#8A3D52] font-bold transition"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveAddress(idx)}
                                className="text-red-500 hover:text-red-700 font-bold transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-xs text-stone-500 font-semibold">No saved addresses yet.</p>
                      <p className="text-xs text-stone-400 mt-1">Add your first address to speed up checkout.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {user?.orders && user.orders.length > 0 ? (
              user.orders.map(ord => (
                <div key={ord.id} className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] space-y-4">
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
                        return (
                          <div key={stage} className={index <= current ? 'text-[#C86D51]' : 'text-stone-300'}>
                            <span className={`mx-auto mb-1 block h-2 w-2 rounded-full ${index <= current ? 'bg-[#C86D51]' : 'bg-stone-200'}`} />
                            {stage}
                          </div>
                        );
                      })}
                    </div>
                    {ord.riderInfo && (
                      <p className="mt-3 text-xs text-stone-500">Courier: {ord.riderInfo.riderName} · {ord.riderInfo.riderPhone} · {ord.riderInfo.estimatedArrival}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#1C1917] p-12 rounded-2xl border border-[#E6DFD7] text-center space-y-3">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">You have no past orders yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1C1917] p-12 rounded-2xl border border-[#E6DFD7] text-center space-y-3">
                <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-semibold">Your saved wishlist is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const GoogleSignInButton: React.FC<{ onCredential: (credential: string) => Promise<void> }> = ({ onCredential }) => {
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const onCredentialRef = React.useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const renderButton = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !buttonRef.current) return;
      google.accounts.id.initialize({ client_id: clientId, callback: (response: { credential: string }) => void onCredentialRef.current(response.credential) });
      buttonRef.current.innerHTML = '';
      google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'pill' });
    };
    if ((window as any).google?.accounts?.id) {
      renderButton();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={buttonRef} className="flex min-h-10 justify-center" />;
};

const AuthShell: React.FC<{ mode: 'signin' | 'signup'; children: React.ReactNode }> = ({ mode, children }) => {
  const { storeSettings } = useStore();
  return (
  <div className="relative mx-auto max-w-5xl px-4 py-10 font-sans sm:px-6 sm:py-16">
    <div className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_24px_70px_rgba(11,31,56,0.12)]">
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <img src={storeSettings.storeLogo || logoImg} onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }} alt="CR Cosmetics & Essentials" className="h-11 w-11 rounded-xl border border-[var(--border-color)] bg-white p-1 object-contain" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">{mode === 'signin' ? 'Welcome back' : 'Join the store'}</span>
        </div>
        {children}
      </div>
    </div>
  </div>
  );
};

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleCredential = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      navigate('/account');
    } catch {
      showAlert('Google sign-in failed. Please try again.', 'error');
    }
  };

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
    <AuthShell mode="signin">
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Customer account</p>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)]">Sign in to manage orders, saved items, and delivery details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-[0.12em]">
            Sign In
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
        </div>
        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <div className="border-t border-[var(--border-color)] pt-5 text-center text-sm text-[var(--text-muted)]">
          Don&apos;t have an account? <Link to="/signup" className="font-bold text-[var(--accent)]">Create one</Link>
        </div>
      </div>
    </AuthShell>
  );
};

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleCredential = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      navigate('/account');
    } catch {
      showAlert('Google sign-up failed. Please try again.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showAlert('Password must be at least 8 characters.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(email, fullName, password);
      navigate('/account');
    } catch {
      showAlert('Account creation failed. Please check your details and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell mode="signup">
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Customer account</p>
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[var(--text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)]">A faster way to shop beauty and everyday essentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] p-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-[0.12em]">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
        </div>
        <GoogleSignInButton onCredential={handleGoogleCredential} />
        <div className="border-t border-[var(--border-color)] pt-5 text-center text-sm text-[var(--text-muted)]">
          Already have an account? <Link to="/signin" className="font-bold text-[var(--accent)]">Sign in</Link>
        </div>
      </div>
    </AuthShell>
  );
};
