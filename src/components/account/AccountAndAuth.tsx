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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useAlert } from '../../context/AlertContext';
import { ProductCard } from '../product/ProductCard';
import { Button, Badge } from '../common/UIPrimitives';
import { ShippingAddress } from '../../types';
import logoImg from '../../assets/logo.jpeg';

export const AccountPage: React.FC = () => {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { products } = useStore();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', email: user?.email || '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-white dark:bg-[#1C1917] p-6 sm:p-8 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C86D51] text-white flex items-center justify-center font-extrabold text-xl">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1817] dark:text-stone-100">{user?.fullName}</h1>
            <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold">{user?.email} • {user?.phone}</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="rounded-full text-xs"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#E6DFD7] dark:border-[#36322E] gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'profile' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-500 dark:text-stone-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Info</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'addresses' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-500 dark:text-stone-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses ({user?.savedAddresses?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-500 dark:text-stone-300'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({user?.orders.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'wishlist' ? 'border-[#C86D51] text-[#C86D51]' : 'border-transparent text-stone-500 dark:text-stone-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
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
    </div>
  );
};

const GoogleSignInButton: React.FC<{ onCredential: (credential: string) => Promise<void> }> = ({ onCredential }) => {
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const renderButton = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !buttonRef.current) return;
      google.accounts.id.initialize({ client_id: clientId, callback: (response: { credential: string }) => void onCredential(response.credential) });
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
  }, [clientId, onCredential]);

  if (!clientId) return null;
  return <div ref={buttonRef} className="flex min-h-10 justify-center" />;
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
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-[#1C1917] p-8 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] space-y-6 shadow-sm">
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
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
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
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full rounded-full py-3.5 uppercase text-xs font-bold">
            Sign In
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-[#E6DFD7] dark:bg-[#36322E]" />
        </div>
        <GoogleSignInButton onCredential={handleGoogleCredential} />

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
      <div className="bg-white dark:bg-[#1C1917] p-8 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] space-y-6 shadow-sm">
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
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (MoMo)</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
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
