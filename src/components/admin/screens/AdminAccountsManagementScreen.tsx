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
  Key
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { AdminAccount } from '../../../types';

export const AdminAccountsManagementScreen: React.FC = () => {
  const { adminAccounts = [], adminSession, updateAdminAccount, deleteAdminAccount } = useStore();
  const { showAlert } = useAlert();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'admin' as 'super_admin' | 'admin' | 'manager',
  });

  const currentAdminAccountId = useMemo(() => {
    const match = (adminAccounts || []).find(account => account.email.toLowerCase() === adminSession.email.toLowerCase());
    return match?.id ?? 'self';
  }, [adminAccounts, adminSession.email]);

  const currentAdminProfile = useMemo(() => ({
    id: currentAdminAccountId,
    fullName: adminSession.adminName,
    email: adminSession.email,
    phone: '+233 20 000 0000',
    role: (adminSession.adminRole === 'Super Admin' ? 'super_admin' : adminSession.adminRole === 'Store Manager' ? 'manager' : 'admin') as 'super_admin' | 'admin' | 'manager',
  }), [adminSession, currentAdminAccountId]);

  const filteredAccounts = useMemo(() => {
    return (adminAccounts || []).filter(acc =>
      acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone?.includes(searchTerm)
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
      await updateAdminAccount(editingId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
      });
      showAlert('Admin account updated successfully', 'success');
      setEditingId(null);
    } catch (error) {
      showAlert('Failed to update admin account', 'error');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentAdminAccountId) {
      showAlert('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this admin account?')) {
      try {
        await deleteAdminAccount(id);
        showAlert('Admin account deleted successfully', 'success');
      } catch (error) {
        showAlert('Failed to delete admin account', 'error');
      }
    }
  };

  const getRoleBadge = (role?: string) => {
    const styles = {
      'super_admin': 'bg-red-100 text-red-700',
      'admin': 'bg-blue-100 text-blue-700',
      'manager': 'bg-amber-100 text-amber-700',
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role?: string) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'manager': 'Manager',
    };
    return labels[role as keyof typeof labels] || role || 'Admin';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">Admin Accounts</h1>
          <p className="text-gray-600 dark:text-stone-400 mt-1">Manage administrator and manager accounts</p>
        </div>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Admin Account
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#3d5574] rounded-lg bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100 placeholder:text-gray-500 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2a3f5f] border-b border-gray-200 dark:border-[#3d5574]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-stone-100 text-sm">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-stone-100 text-sm">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-stone-100 text-sm">Phone</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-stone-100 text-sm">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-stone-100 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#3d5574]">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-[#2a3f5f] transition-colors">
                    {editingId === account.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.fullName}
                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3d5574] rounded bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3d5574] rounded bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3d5574] rounded bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3d5574] rounded bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100 text-sm"
                          >
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded bg-gray-100 dark:bg-[#2a3f5f] text-gray-700 dark:text-stone-400 hover:bg-gray-200 dark:hover:bg-[#354568] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-stone-100">{account.fullName}</div>
                          {account.id === currentAdminAccountId && (
                            <span className="text-xs text-gray-500 dark:text-stone-400">(You)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-stone-400">{account.email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-stone-400">{account.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(account.role)}`}>
                            {getRoleLabel(account.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(account)}
                              className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              title="Edit account"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(account.id)}
                              disabled={account.id === currentAdminAccountId}
                              className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={account.id === currentAdminAccountId ? "Cannot delete your own account" : "Delete account"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-stone-400">
                    No admin accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Profile Section */}
      <div className="bg-white dark:bg-[#1a2a47] rounded-lg border border-gray-200 dark:border-[#3d5574] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-[#2a3f5f] flex items-center justify-center">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">My Profile</h2>
            <p className="text-sm text-gray-500 dark:text-stone-400">Your admin account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-stone-400 mb-1">Name</label>
            <input
              type="text"
              value={currentAdminProfile.fullName || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d5574] rounded-lg bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-stone-400 mb-1">Email</label>
            <input
              type="email"
              value={currentAdminProfile.email || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d5574] rounded-lg bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-stone-400 mb-1">Phone</label>
            <input
              type="tel"
              value={currentAdminProfile.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d5574] rounded-lg bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-stone-400 mb-1">Role</label>
            <input
              type="text"
              value={getRoleLabel(currentAdminProfile.role)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d5574] rounded-lg bg-white dark:bg-[#2a3f5f] text-gray-900 dark:text-stone-100"
              disabled
            />
          </div>
        </div>

        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium">
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>
    </div>
  );
};
