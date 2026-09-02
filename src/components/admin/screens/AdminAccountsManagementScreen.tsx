import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Trash2,
  Check,
  X,
  Plus,
  Search,
  Key,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { AdminAccount } from '../../../types';

// ─── Design tokens ─────────────────────────────────────────────────────────────
function ScreenHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 dark:border-[#2e2428] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-stone-200 dark:border-[#2e2428] bg-stone-50 dark:bg-[#2a2024] px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#1E1719] dark:focus:ring-stone-600 transition';

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  admin:       'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  manager:     'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  manager:     'Manager',
};

export const AdminAccountsManagementScreen: React.FC = () => {
  const { adminAccounts = [], adminSession, updateAdminAccount, addAdminAccount, deleteAdminAccount } = useStore();
  const { showAlert } = useAlert();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'admin' as AdminAccount['role'],
  });

  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const currentAdminAccountId = useMemo(() => {
    const match = (adminAccounts || []).find(
      a => a.email.toLowerCase() === adminSession.email.toLowerCase()
    );
    return match?.id ?? 'self';
  }, [adminAccounts, adminSession.email]);

  const currentAdminProfile = useMemo(
    () => ({
      id: currentAdminAccountId,
      fullName: adminSession.adminName,
      email: adminSession.email,
      phone: adminAccounts.find(a => a.id === currentAdminAccountId)?.phone || '',
      role: (adminSession.adminRole === 'Super Admin'
        ? 'super_admin'
        : adminSession.adminRole === 'Store Manager'
        ? 'manager'
        : 'admin') as AdminAccount['role'],
    }),
    [adminAccounts, adminSession, currentAdminAccountId]
  );

  React.useEffect(() => {
    setProfileForm({
      fullName: currentAdminProfile.fullName,
      email: currentAdminProfile.email,
      phone: currentAdminProfile.phone,
    });
  }, [currentAdminProfile.fullName, currentAdminProfile.email, currentAdminProfile.phone]);

  const filteredAccounts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (adminAccounts || []).filter(
      a =>
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(searchTerm)
    );
  }, [adminAccounts, searchTerm]);

  const startEdit = (account: AdminAccount) => {
    setEditingId(account.id);
    setEditForm({
      fullName: account.fullName || '',
      email: account.email || '',
      phone: account.phone || '',
      role: account.role || 'admin',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateAdminAccount(editingId, editForm);
      showAlert('Admin account updated', 'success');
      setEditingId(null);
    } catch {
      showAlert('Failed to update admin account', 'error');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentAdminAccountId) {
      showAlert('You cannot delete your own account', 'error');
      return;
    }
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
      return;
    }
    try {
      await deleteAdminAccount(id);
      showAlert('Admin account deleted', 'success');
    } catch {
      showAlert('Failed to delete admin account', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      showAlert('Name and email are required', 'error');
      return;
    }
    try {
      await updateAdminAccount(currentAdminAccountId, profileForm);
      showAlert('Profile updated successfully', 'success');
    } catch {
      showAlert('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next.length < 6) {
      showAlert('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      showAlert('New passwords do not match', 'error');
      return;
    }
    localStorage.setItem(
      `cr_admin_password_${currentAdminProfile.email.toLowerCase()}`,
      passwordForm.next
    );
    setPasswordForm({ current: '', next: '', confirm: '' });
    setIsChangingPassword(false);
    showAlert('Password changed successfully', 'success');
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get('fullName') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const phone = String(form.get('phone') || '').trim();
    const role = String(form.get('role') || 'admin') as AdminAccount['role'];
    if (!fullName || !email || !phone) {
      showAlert('Name, email, and phone are required', 'error');
      return;
    }
    if (adminAccounts.some(a => a.email.toLowerCase() === email)) {
      showAlert('An admin account with this email already exists', 'error');
      return;
    }
    await addAdminAccount({ fullName, email, phone, role });
    setIsCreatingNew(false);
    showAlert('Admin account created successfully', 'success');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <ScreenHeader
        eyebrow="Manage"
        title="Team"
        description="Add team members, choose their access, and update your profile."
        action={
          <button
            onClick={() => setIsCreatingNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#33282C] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add team member
          </button>
        }
      />

      {/* Create Form */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateAccount}
          className="space-y-4 rounded-2xl border border-[#B27A52]/30 bg-[#FDF7F2] dark:bg-[#2a1f1a] dark:border-[#3d2a22] p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900 dark:text-stone-100">Add a team member</h2>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#2a2024] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <input name="fullName" placeholder="Full name" required className={inputCls} />
            <input name="email" type="email" placeholder="Email address" required className={inputCls} />
            <input name="phone" placeholder="Phone number" required className={inputCls} />
            <select name="role" defaultValue="admin" className={inputCls}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2 text-sm font-semibold text-white hover:bg-[#33282C] transition-colors"
            >
              <Check className="h-4 w-4" />
              Create account
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={`${inputCls} pl-10`}
        />
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-[#1a1316] border-b border-stone-200 dark:border-[#2e2428]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide hidden md:table-cell">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#2e2428]">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-stone-50 dark:hover:bg-[#1a1316] transition-colors">
                    {editingId === account.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            value={editForm.fullName}
                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value as AdminAccount['role'] })}
                            className={inputCls}
                          >
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 rounded-xl bg-stone-100 dark:bg-[#2a2024] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-[#333] transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F2E3D7] dark:bg-[#3d2a22] flex items-center justify-center text-[#8A5738] dark:text-[#E8B792] font-bold text-xs flex-shrink-0">
                              {account.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100">
                                {account.fullName}
                              </p>
                              {account.id === currentAdminAccountId && (
                                <span className="text-[10px] font-bold text-[#B27A52] uppercase tracking-wide">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{account.email}</td>
                        <td className="px-6 py-4 text-stone-600 dark:text-stone-400 hidden md:table-cell">{account.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[account.role] ?? 'bg-stone-100 text-stone-700'}`}>
                            {ROLE_LABEL[account.role] ?? account.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(account)}
                              className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-950/50 transition-colors"
                              title="Edit account"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {/* Inline delete confirm */}
                            {confirmDeleteId === account.id ? (
                              <>
                                <button
                                  onClick={() => handleDeleteAdmin(account.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="p-2 rounded-xl bg-stone-100 dark:bg-[#2a2024] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-[#333] transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteAdmin(account.id)}
                                disabled={account.id === currentAdminAccountId}
                                className="p-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={account.id === currentAdminAccountId ? 'Cannot delete your own account' : 'Delete account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <UserCheck className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                    <p className="text-sm text-stone-500 dark:text-stone-400">No admin accounts found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Profile Section */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-stone-100 dark:border-[#2e2428]">
          <div className="w-14 h-14 rounded-2xl bg-[#F2E3D7] dark:bg-[#3d2a22] flex items-center justify-center text-[#8A5738] dark:text-[#E8B792] text-2xl font-bold flex-shrink-0">
            {currentAdminProfile.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">My Profile</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {ROLE_LABEL[currentAdminProfile.role] ?? currentAdminProfile.role} · {currentAdminProfile.email}
            </p>
          </div>
        </div>

        {/* Change Password — above profile save for discoverability */}
        <div>
          <button
            type="button"
            onClick={() => setIsChangingPassword(v => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2a2024] transition-colors"
          >
            <Key className="w-4 h-4" />
            {isChangingPassword ? 'Cancel password change' : 'Change Password'}
          </button>

          {isChangingPassword && (
            <form
              onSubmit={handleChangePassword}
              className="mt-4 grid gap-3 sm:grid-cols-3 rounded-2xl border border-stone-200 dark:border-[#2e2428] p-4"
            >
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.current}
                onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className={inputCls}
              />
              <input
                required
                type="password"
                placeholder="New password"
                value={passwordForm.next}
                onChange={e => setPasswordForm({ ...passwordForm, next: e.target.value })}
                className={inputCls}
              />
              <input
                required
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className={inputCls}
              />
              <button
                type="submit"
                className="sm:col-span-3 sm:justify-self-end inline-flex items-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2 text-sm font-semibold text-white hover:bg-[#33282C] transition-colors"
              >
                <Key className="w-4 h-4" />
                Save password
              </button>
            </form>
          )}
        </div>

        {/* Profile form */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={ROLE_LABEL[currentAdminProfile.role] ?? currentAdminProfile.role}
              className={`${inputCls} opacity-60 cursor-not-allowed`}
              readOnly
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E1719] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#33282C] transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
