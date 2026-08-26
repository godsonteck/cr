// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Customer Management & Analytics Service
// Master Directive Section 34, 35, 36, 45
// ═══════════════════════════════════════════════════════════

import { getAllOrders } from './orderEngine';

export function getAllCustomers() {
  const orders = getAllOrders();
  const customerMap = {};

  orders.forEach((order) => {
    const phone = order.customer.phone || 'Unknown';
    const email = order.customer.email || '';
    const key = phone;

    if (!customerMap[key]) {
      customerMap[key] = {
        customerId: `CUST-${phone.replace(/\D/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}`,
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        email,
        area: order.customer.area || 'Botwe',
        address: order.customer.address || '',
        orderCount: 0,
        totalSpend: 0,
        lastOrderDate: order.createdAt,
        firstOrderDate: order.createdAt,
        orders: [],
        status: 'ACTIVE',
      };
    }

    const c = customerMap[key];
    c.orderCount += 1;
    if (order.paymentStatus === 'PAID' || order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED') {
      c.totalSpend += order.pricing?.total || 0;
    }
    c.orders.push(order);

    if (new Date(order.createdAt) > new Date(c.lastOrderDate)) {
      c.lastOrderDate = order.createdAt;
    }
    if (new Date(order.createdAt) < new Date(c.firstOrderDate)) {
      c.firstOrderDate = order.createdAt;
    }
  });

  return Object.values(customerMap);
}

export function getCustomerByPhone(phone) {
  const customers = getAllCustomers();
  return customers.find((c) => c.phone === phone) || null;
}

export function getCustomerMetrics() {
  const customers = getAllCustomers();
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;
  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgSpend = totalCustomers > 0 ? totalSpendAll / totalCustomers : 0;

  return {
    totalCustomers,
    repeatCustomers,
    repeatRate: totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0,
    averageLifetimeValue: avgSpend,
  };
}
