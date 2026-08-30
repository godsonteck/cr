import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  X, 
  ArrowRight, 
  Crown, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { AdminSession } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginAdmin } = useStore();
  const { showToast } = useToast();

  const [pin, setPin] = useState('1234');
  const [adminName, setAdminName] = useState('CR Store Concierge');
  const [role, setRole] = useState<AdminSession['adminRole']>('Super Admin');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = await loginAdmin(pin, adminName, role);
    if (success) {
      showToast(`Welcome to CR Admin Portal (${role})`);
      onSuccess();
      onClose();
    } else {
      setError('Invalid Admin PIN. (Default test PIN is: 1234 or admin)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#8A3D52] text-white flex items-center justify-center mx-auto shadow-md">
            <Crown className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-900">
            CR Cosmetics Admin Portal
          </h2>
          <p className="text-xs text-gray-500">
            Full management control for store inventory, orders, courier dispatch, and live site settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-gray-700 mb-1">Admin / Staff Name</label>
            <input
              type="text"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Access Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
            >
              <option value="Super Admin">Super Admin (Full Site & Store Control)</option>
              <option value="Store Manager">Store Manager (Products, Orders & Promos)</option>
              <option value="Inventory Dispatcher">Inventory Dispatcher (Live Courier Hub)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Security PIN / Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3D52]"
              />
            </div>
          </div>

          {/* Quick Demo PIN Helper */}
          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 flex items-center justify-between text-[11px] text-gray-600">
            <span className="flex items-center gap-1 text-[#8A3D52] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Default Test PIN: <strong>1234</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setPin('1234')}
              className="font-bold text-[#8A3D52] hover:underline cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#8A3D52] hover:bg-[#732F42] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Enter Admin Portal</span>
          </button>

        </form>
      </div>
    </div>
  );
};
