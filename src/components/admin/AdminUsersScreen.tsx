import React, { useState, useMemo } from 'react';
import { Search, Eye, Shield, MoreVertical, Download, Filter } from 'lucide-react';
import { Customer } from '../../types';

interface AdminUsersScreenProps {
  users: Customer[];
  onViewUser: (user: Customer) => void;
  onBlockUser: (userId: string) => void;
  onExportUsers: () => void;
}

type SortField = 'name' | 'created' | 'orders' | 'spent';
type FilterStatus = 'all' | 'active' | 'blocked';

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({
  users,
  onViewUser,
  onBlockUser,
  onExportUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && u.status === 'Active') ||
        (filterStatus === 'blocked' && u.status === 'Blocked');

      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'orders':
          return (b.ordersCount || 0) - (a.ordersCount || 0);
        case 'spent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchTerm, sortField, filterStatus]);

  const getSegmentBadge = (segment?: string) => {
    const styles = {
      'High Value': 'bg-amber-100 text-amber-700',
      'Returning': 'bg-blue-100 text-blue-700',
      'New': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
    };
    return styles[segment as keyof typeof styles] || 'bg-stone-100 text-stone-700';
  };

  const getStatusBadge = (status?: string) => {
    return status === 'blocked'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#1C1917] p-6 rounded-2xl border border-[#E6DFD7] dark:border-[#36322E]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-extrabold uppercase text-stone-900 dark:text-stone-100">Customer Management</h2>
          <button
            onClick={onExportUsers}
            className="text-xs font-bold bg-[#C86D51] hover:bg-[#8A3D52] text-white px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <Download className="w-3 h-3" />
            Export Users
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 dark:text-stone-300" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F0EB] text-stone-900 dark:bg-[#2B2620] dark:text-stone-100 text-xs pl-9 pr-4 py-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="bg-[#F5F0EB] text-stone-900 dark:bg-[#2B2620] dark:text-stone-100 text-xs px-4 py-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-[#F5F0EB] text-stone-900 dark:bg-[#2B2620] dark:text-stone-100 text-xs px-4 py-3 rounded-xl border border-[#E6DFD7] dark:border-[#36322E]"
          >
            <option value="created">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="orders">Most Orders</option>
            <option value="spent">Highest Spend</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-stone-50 dark:bg-[#2B2620] rounded-lg">
            <p className="text-stone-500 font-semibold">Total Users</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{users.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-blue-600 font-semibold">Active Now</p>
            <p className="text-lg font-bold text-blue-700">{users.filter(u => u.status === 'Active').length}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-green-600 font-semibold">Total Orders</p>
            <p className="text-lg font-bold text-green-700">{users.reduce((sum, u) => sum + (u.ordersCount || 0), 0)}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <p className="text-amber-600 font-semibold">Total Revenue</p>
            <p className="text-lg font-bold text-amber-700">₵{(users.reduce((sum, u) => sum + (u.totalSpent || 0), 0) / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6DFD7] dark:border-[#36322E] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E6DFD7] dark:border-[#36322E] bg-stone-50 dark:bg-[#2B2620]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-bold uppercase text-stone-700 dark:text-stone-200">Customer</th>
                <th className="px-4 py-3 text-left font-bold uppercase text-stone-700 dark:text-stone-200">Contact</th>
                <th className="px-4 py-3 text-center font-bold uppercase text-stone-700 dark:text-stone-200">Orders</th>
                <th className="px-4 py-3 text-center font-bold uppercase text-stone-700 dark:text-stone-200">Spent</th>
                <th className="px-4 py-3 text-center font-bold uppercase text-stone-700 dark:text-stone-200">Segment</th>
                <th className="px-4 py-3 text-center font-bold uppercase text-stone-700 dark:text-stone-200">Status</th>
                <th className="px-4 py-3 text-center font-bold uppercase text-stone-700 dark:text-stone-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#E6DFD7] dark:border-[#36322E] hover:bg-stone-50 dark:hover:bg-[#2B2620] transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedUsers);
                        if (e.target.checked) {
                          newSelected.add(user.id);
                        } else {
                          newSelected.delete(user.id);
                        }
                        setSelectedUsers(newSelected);
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{user.fullName}</p>
                      <p className="text-stone-600 dark:text-stone-300 text-[10px]">Joined {new Date(user.createdAt || 0).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-stone-700 dark:text-stone-200">
                      <p className="text-[10px]">{user.email}</p>
                      <p className="text-[10px]">{user.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-stone-900 dark:text-stone-100">{user.ordersCount || 0}</td>
                  <td className="px-4 py-3 text-center font-bold text-stone-900 dark:text-stone-100">₵{((user.totalSpent || 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getSegmentBadge(user.segment)}`}>
                      {user.segment || 'New'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status === 'Blocked' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewUser(user)}
                        title="View Details"
                        className="text-[#C86D51] hover:text-[#8A3D52] transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onBlockUser(user.id)}
                        title={user.status === 'Blocked' ? 'Unblock' : 'Block'}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="text-stone-400 hover:text-stone-600 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-xs text-stone-500 font-semibold">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
