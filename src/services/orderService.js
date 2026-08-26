// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Unified Order Service Facade
// ═══════════════════════════════════════════════════════════

import {
  getAllOrders,
  getOrderById,
  getOrdersByStatus,
  getRecentOrders,
  createOrder,
  transitionOrderStatus,
  markOrderPaymentPaid,
} from './orderEngine';

export {
  getAllOrders,
  getOrderById,
  getOrdersByStatus,
  getRecentOrders,
  createOrder,
  transitionOrderStatus,
  markOrderPaymentPaid,
};

export function getOrderCount() {
  return getAllOrders().length;
}
