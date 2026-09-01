import React, { useMemo, useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle2, Clock, Truck, Package } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { Order, OrderStatus } from '../../../types';

interface OrdersScreenProps {
  onViewOrder?: (order: Order) => void;
}

export const AdminOrdersScreen: React.FC<OrdersScreenProps> = ({ onViewOrder }) => {
  const store = useStore();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const statuses: (OrderStatus | 'all')[] = ['all', 'Confirmed', 'Processing', 'Packing Order', 'Out for Delivery', 'Delivered'];

  const filteredOrders = useMemo(() => {
    let orders = store.orders || [];

    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    if (searchTerm) {
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.phone.includes(searchTerm)
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store.orders, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const orders = store.orders || [];
    return {
      total: orders.length,
      pending: orders.filter(o => o.status !== 'Delivered').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    };
  }, [store.orders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setLoading(true);
    try {
      // In real app, would make API call
      await new Promise(resolve => setTimeout(resolve, 500));
      store.updateOrderStatus(orderId, newStatus);
      showAlert(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      showAlert('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ['Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Date'],
        ...filteredOrders.map(o => [
          o.orderNumber,
          o.shippingAddress?.fullName,
          o.shippingAddress?.phone,
          Number(o.total).toFixed(2),
          o.status,
          new Date(o.createdAt).toLocaleDateString(),
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showAlert('Orders exported successfully', 'success');
    } catch (error) {
      showAlert('Failed to export orders', 'error');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const iconClass = 'w-4 h-4';
    switch (status) {
      case 'Confirmed':
        return <CheckCircle2 className={`${iconClass} text-green-600`} />;
      case 'Processing':
      case 'Packing Order':
        return <Package className={`${iconClass} text-blue-600`} />;
      case 'Out for Delivery':
        return <Truck className={`${iconClass} text-amber-600`} />;
      case 'Delivered':
        return <CheckCircle2 className={`${iconClass} text-green-600`} />;
      default:
        return <Clock className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">GHS {stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {stats.total} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      GHS {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={loading}
                          className="text-xs px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                          {statuses
                            .filter(s => s !== 'all')
                            .map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewOrder?.(order)}
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
