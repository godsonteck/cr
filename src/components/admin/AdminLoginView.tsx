import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  ArrowRight, 
  User, 
  Shield, 
  Eye, 
  EyeOff,
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.jpeg';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin, storeSettings } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Determine identity automatically from credentials
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    let autoRole: 'Super Admin' | 'Store Manager' | 'Inventory Dispatcher' = 'Super Admin';
    let autoName = 'Store Administrator';

    if (cleanUser.includes('rider') || cleanUser.includes('dispatch') || cleanUser.includes('delivery')) {
      autoRole = 'Inventory Dispatcher';
      autoName = 'Kwame Boateng (Delivery & Dispatch)';
    } else if (cleanUser.includes('manager') || cleanUser.includes('shop') || cleanUser.includes('retail')) {
      autoRole = 'Store Manager';
      autoName = 'Ama Mensah (Shop Manager)';
    } else if (cleanUser.length > 0) {
      autoName = usernameOrEmail.trim().split('@')[0];
      autoName = autoName.charAt(0).toUpperCase() + autoName.slice(1);
    }

    try {
      const success = await loginAdmin(password.trim(), autoName, autoRole, cleanUser || 'admin@crcosmetics.com');
      if (success) {
        showToast(`Signed in successfully. Welcome, ${autoName}!`);
        onSuccess();
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } catch {
      setError('Unable to sign in. Please check your details and try again.');
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
          <span>Back to Online Shop</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-[#2E4A38]" />
          <span className="text-[11px] font-medium">Secure Store Login</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white border border-[#E8E2D8] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(40,30,20,0.08)] space-y-7">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm mb-1">
              <img src={storeSettings.storeLogo || logoImg} onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }} alt={storeSettings.storeName} className="w-16 h-16 rounded-xl object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C89B3C]">
                {storeSettings.storeName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-1">
                Admin login
              </h1>
            </div>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Sign in to manage your store.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameOrEmail}
                  onChange={e => {
                    setUsernameOrEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="admin@crcosmetics.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#1E1719] focus:ring-1 focus:ring-[#1E1719] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
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
                <span>Signing In...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              {storeSettings.storeName} • Accra, Ghana
            </p>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
      </footer>
    </div>
  );
};
