import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  ArrowRight, 
  Eye, 
  EyeOff,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.jpeg';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin, storeSettings } = useStore();
  const { showToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[#C89B3C] selection:text-white relative font-sans transition-colors duration-200">
      
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Online Shop</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors shadow-xs cursor-pointer"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-[#E0B554]" /> : <Moon className="w-3.5 h-3.5 text-stone-600" />}
            <span className="hidden sm:inline capitalize">{theme} Mode</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-medium shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Secure Store Login</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 sm:p-10 shadow-[var(--shadow-card)] space-y-7 transition-colors duration-200">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm mb-1">
              <img 
                src={storeSettings.storeLogo || logoImg} 
                onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }} 
                alt={storeSettings.storeName} 
                className="w-16 h-16 rounded-full object-contain" 
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B88728] dark:text-[#E0B554]">
                {storeSettings.storeName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight mt-1">
                Admin login
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
              Sign in to manage your store.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:bg-[var(--bg-card)] focus:outline-none focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-mono tracking-wider text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:bg-[var(--bg-card)] focus:outline-none focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1E1719] hover:bg-[#33282C] dark:bg-[#C89B3C] dark:hover:bg-[#D4A745] text-[#FAF6F0] dark:text-[#1E1719] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-2"
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
          <div className="pt-4 border-t border-[var(--border-color)] text-center">
            <p className="text-[11px] text-[var(--text-subtle)]">
              {storeSettings.storeName} • Accra, Ghana
            </p>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[var(--text-subtle)]">
        © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
      </footer>
    </div>
  );
};
