import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowLeft,
  ArrowRight, 
  User, 
  Shield, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminSession } from '../../types';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pin, setPin] = useState('');
  const [adminName, setAdminName] = useState('Store Manager');
  const [role, setRole] = useState<AdminSession['adminRole']>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please type your PIN code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await loginAdmin(pin.trim(), adminName.trim(), role);
      if (success) {
        showToast(`Welcome back, ${adminName}!`);
        onSuccess();
      } else {
        setError('Incorrect PIN. Please check your PIN and try again.');
      }
    } catch {
      setError('Could not sign in. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col justify-between selection:bg-[#1E1719] selection:text-[#FAF6F0] relative font-sans">
      
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Shopping Website</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-[#2E4A38]" />
          <span className="text-[11px] font-medium">Safe & Secure Sign In</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white border border-[#E8E2D8] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(40,30,20,0.08)] space-y-7">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E1719] text-[#FAF6F0] border border-stone-800 shadow-md mb-1">
              <Shield className="w-7 h-7 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C89B3C]">
                CR Cosmetics & Essentials
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-1">
                Store Manager Sign In
              </h1>
            </div>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Sign in to manage your products, check orders, change prices, and update your shop.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Staff / Admin Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="e.g. Shop Manager"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#1E1719] focus:ring-1 focus:ring-[#1E1719] transition-all"
                />
              </div>
            </div>

            {/* Access Role */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Your Staff Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as AdminSession['adminRole'])}
                className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:border-[#1E1719] focus:ring-1 focus:ring-[#1E1719] transition-all cursor-pointer"
              >
                <option value="Super Admin">Store Owner / Main Admin (Can change everything)</option>
                <option value="Store Manager">Shop Manager (Products, Orders & Discounts)</option>
                <option value="Inventory Dispatcher">Delivery & Rider Team (Handles packing and delivery)</option>
              </select>
            </div>

            {/* Security Passcode */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Admin Passcode / PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your PIN code"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl text-sm font-mono tracking-wider text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#1E1719] focus:ring-1 focus:ring-[#1E1719] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1E1719] hover:bg-[#33282C] text-[#FAF6F0] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Checking PIN...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Store</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              CR Cosmetics & Essentials • Accra, Ghana
            </p>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} CR Cosmetics & Essentials. All rights reserved.
      </footer>
    </div>
  );
};
