import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowLeft,
  ArrowRight, 
  Sparkles,
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
  const [adminName, setAdminName] = useState('Executive Store Administrator');
  const [role, setRole] = useState<AdminSession['adminRole']>('Super Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter your security passcode.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await loginAdmin(pin.trim(), adminName.trim(), role);
      if (success) {
        showToast(`Authenticated: Welcome to CR Cosmetics Management (${role})`);
        onSuccess();
      } else {
        setError('Authentication failed. Invalid security passcode or unauthorized role.');
      }
    } catch {
      setError('Unable to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A0C] text-stone-100 flex flex-col justify-between selection:bg-[#8A3D52] selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8A3D52]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      
      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Customer Storefront</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-[11px] tracking-wide">SECURE 256-BIT ENCRYPTION</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#1A1215]/90 border border-stone-800/80 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-8">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A3D52] to-[#551E2E] border border-rose-400/20 shadow-lg shadow-rose-950/50 mb-1">
              <Shield className="w-7 h-7 text-[#E8B792]" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#E8B792]">
                CR Cosmetics & Essential
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
                Executive Portal
              </h1>
            </div>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              Authenticated management control for catalog inventory, orders dispatch, marketing, and store operations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Staff / Admin Name */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Administrator Profile</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="e.g. Store Manager"
                  className="w-full pl-10 pr-4 py-3 bg-[#24191D]/80 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#8A3D52] focus:ring-1 focus:ring-[#8A3D52] transition-all"
                />
              </div>
            </div>

            {/* Access Role */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Privilege Level
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as AdminSession['adminRole'])}
                className="w-full px-3.5 py-3 bg-[#24191D]/80 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-[#8A3D52] focus:ring-1 focus:ring-[#8A3D52] transition-all cursor-pointer"
              >
                <option value="Super Admin">Super Administrator (Full Management & Settings)</option>
                <option value="Store Manager">Store Operations Manager (Catalog & Sales)</option>
                <option value="Inventory Dispatcher">Logistics Dispatcher (Courier & Fulfillment)</option>
              </select>
            </div>

            {/* Security Passcode */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Security Passcode / Master PIN</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter administrator passcode"
                  className="w-full pl-10 pr-11 py-3 bg-[#24191D]/80 border border-stone-800 rounded-xl text-sm font-mono tracking-wider text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#8A3D52] focus:ring-1 focus:ring-[#8A3D52] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#8A3D52] to-[#A24B62] hover:from-[#762F42] hover:to-[#8E3B50] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Hub</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="pt-4 border-t border-stone-800/60 text-center">
            <p className="text-[11px] text-stone-500">
              Protected by CR Enterprise Security Protocol • Accra, Ghana
            </p>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-stone-600">
        © {new Date().getFullYear()} CR Cosmetics & Essential Ltd. All rights reserved.
      </footer>
    </div>
  );
};
