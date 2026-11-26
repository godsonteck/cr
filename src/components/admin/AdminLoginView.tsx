import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
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
import logoImg from '../../assets/logo-optimized.jpeg';

interface AdminLoginProps {
  onSuccess: () => void;
  mode?: 'admin' | 'pos';
}



export const AdminLoginView: React.FC<AdminLoginProps> = ({ onSuccess, mode = 'admin' }) => {
  const { loginAdmin, storeSettings } = useStore();
  const { showToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter your admin PIN.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const success = await loginAdmin(pin.trim(), '', 'Super Admin', cleanEmail);
      if (success) {
        showToast('Signed in successfully. Welcome back!');
        onSuccess();
      } else {
        setError('Incorrect email or PIN. Please try again.');
      }
    } catch {
      setError('Unable to sign in. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-portal-canvas min-h-screen text-[var(--text-primary)] flex flex-col justify-between selection:bg-[#B27A52] selection:text-white relative font-sans transition-colors duration-200">
      
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="clay-card-sm px-3.5 py-2 inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:scale-105 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Online Shop</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="clay-card-sm px-3.5 py-2 flex items-center gap-1.5 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:scale-105 transition-all cursor-pointer"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-600" />}
            <span className="hidden sm:inline capitalize">{theme} Mode</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md clay-card-lg p-8 sm:p-10 space-y-7">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="clay-icon-pod h-20 w-20 p-2 mx-auto mb-2">
              <img 
                src={storeSettings.storeLogo || logoImg} 
                onError={(event) => { (event.currentTarget as HTMLImageElement).src = logoImg; }} 
                alt={storeSettings.storeName} 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-sunken-sm mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B27A52] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B27A52] dark:text-[#d49970]">
                  {storeSettings.storeName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight mt-1">
                {mode === 'pos' ? 'POS terminal login' : 'Admin Portal Login'}
              </h1>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
              {mode === 'pos' ? 'Sign in to open the point-of-sale terminal.' : 'Enter your credentials to securely access your store command center.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your admin email"
                  className="neu-input pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                Admin PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your admin PIN"
                  className="neu-input pl-10 pr-11 py-3 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="clay-card-sm p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="clay-btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider mt-2"
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
          <div className="pt-4 border-t border-stone-200/50 dark:border-white/5 text-center">
            <p className="text-[11px] text-stone-400">
              {storeSettings.storeName} • Accra, Ghana
            </p>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
      </footer>
    </div>
  );
};
