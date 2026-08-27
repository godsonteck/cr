import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  Crown, 
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { AdminSession } from '../../types';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onReturnToStore: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onReturnToStore
}) => {
  const { loginAdmin } = useStore();
  const { showToast } = useToast();

  const [pin, setPin] = useState('1234');
  const [adminName, setAdminName] = useState('CR Store Manager');
  const [role, setRole] = useState<AdminSession['adminRole']>('Super Admin');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = loginAdmin(pin, adminName, role);
    if (success) {
      showToast(`Welcome back, ${adminName} (${role})`);
      onLoginSuccess();
    } else {
      setError('Invalid Admin Security PIN. (Default test PIN is: 1234 or admin)');
    }
  };

  return (
    <div className="min-h-screen bg-[#181415] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative luxury glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8A3D52]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Website */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onReturnToStore}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Brand Monogram */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#8A3D52] text-white flex items-center justify-center mx-auto shadow-xl border border-[#D4AF37]/30">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            CR Cosmetics & Essential
          </h1>
          <p className="text-xs text-[#D4AF37] font-semibold tracking-widest uppercase">
            Store Administration Portal (/admin)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#241F21] py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-white/10 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Admin Name */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Staff Name</span>
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52] placeholder-gray-500"
                placeholder="e.g. Akosua Mensah"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Administrative Access Level</span>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as AdminSession['adminRole'])}
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              >
                <option value="Super Admin" className="bg-[#241F21] text-white">👑 Super Admin (Full Control)</option>
                <option value="Store Manager" className="bg-[#241F21] text-white">💼 Store Manager (Orders & Inventory)</option>
                <option value="Inventory Dispatcher" className="bg-[#241F21] text-white">📦 Dispatcher (Fulfillment & Tracking)</option>
              </select>
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Security PIN Code *</span>
              </label>
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52] tracking-widest placeholder-gray-500"
                placeholder="Enter PIN (Default: 1234)"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Default authorization PIN is <strong className="text-white">1234</strong>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <span>Authenticate & Enter Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-[11px] text-gray-400">
              Access restricted to authorized CR Cosmetics & Essential personnel.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
