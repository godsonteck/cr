import React, { useState } from 'react';
import { User, Edit3, Save, X } from 'lucide-react';
import { UserProfile } from '../../types';
import { useAlert } from '../../context/AlertContext';

interface AccountProfileTabProps {
  user: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

export const AccountProfileTab: React.FC<AccountProfileTabProps> = ({ user, onUpdate }) => {
  const { showAlert } = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate({
        fullName: form.fullName,
        phone: form.phone,
      });
      showAlert('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showAlert(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] max-w-xl space-y-5">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6DFD7]">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-[#C86D51]" />
          <h3 className="text-base font-extrabold uppercase">Profile Information</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => { setIsEditing(true); setForm({ fullName: user.fullName, phone: user.phone, email: user.email }); }}
            className="text-xs font-bold text-[#C86D51] hover:text-[#8A3D52] transition flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-stone-500 font-semibold mb-1">Full Name</p>
              <p className="font-bold text-stone-900 dark:text-stone-100">{user.fullName}</p>
            </div>
            <div>
              <p className="text-stone-500 font-semibold mb-1">Phone</p>
              <p className="font-bold text-stone-900 dark:text-stone-100">{user.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-stone-500 font-semibold mb-1">Email Address</p>
            <p className="font-bold text-stone-900 dark:text-stone-100">{user.email}</p>
            <p className="text-[9px] text-stone-400 mt-1">Email address cannot be changed</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-2">Full Name</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-2">Phone Number</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[#F5F0EB] dark:bg-[#2B2620] text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-2">Email Address</label>
            <input
              type="email"
              disabled
              value={form.email}
              className="w-full bg-stone-50 dark:bg-stone-900 text-xs p-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E] text-stone-400"
            />
            <p className="text-[9px] text-stone-400 mt-1">Email address cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#C86D51] hover:bg-[#8A3D52] disabled:bg-stone-300 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Save className="w-3 h-3" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-stone-100 dark:bg-[#2B2620] hover:bg-stone-200 dark:hover:bg-[#36322E] text-stone-700 dark:text-stone-300 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
