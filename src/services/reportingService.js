// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Operational Business Reporting & Analytics Engine
// Master Directive Section 34, 35, 36, 55, 56
// ═══════════════════════════════════════════════════════════

import { getAllOrders } from './orderEngine';
import { getAllInventoryPositions, getLowStockAlerts } from './inventoryService';
import { getAllProductsAdmin } from './productService';

/**
 * Get core dashboard operational overview
 */
export function getOperationalDashboardSummary() {
  const orders = getAllOrders();
  const inventory = getAllInventoryPositions();
  const lowStock = getLowStockAlerts();
  const allProducts = getAllProductsAdmin();

  // Completed or paid sales
  const validPaidOrders = orders.filter(
    (o) => o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED'
  );

  const totalGrossRevenue = validPaidOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const totalItemsSold = validPaidOrders.reduce(
    (sum, o) => sum + (o.items || []).reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );

  // Today's orders
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  // Pipeline counts
  const pipeline = {
    pendingPayment: orders.filter((o) => o.paymentStatus === 'PENDING').length,
    confirmed: orders.filter((o) => o.orderStatus === 'CONFIRMED').length,
    processing: orders.filter((o) => o.orderStatus === 'PROCESSING').length,
    ready: orders.filter((o) => o.orderStatus === 'READY').length,
    dispatched: orders.filter((o) => o.orderStatus === 'DISPATCHED').length,
    delivered: orders.filter((o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length,
    cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
  };

  return {
    metrics: {
      totalGrossRevenue,
      todayRevenue,
      totalOrdersCount: orders.length,
      todayOrdersCount: todayOrders.length,
      totalItemsSold,
      totalCatalogProducts: allProducts.length,
      lowStockCount: lowStock.length,
    },
    pipeline,
    lowStockAlerts: lowStock,
    recentOrders: orders.slice(0, 5),
  };
}

/**
 * Breakdown of sales by payment method (Reconciliation support)
 */
export function getSalesByPaymentMethod() {
  const orders = getAllOrders();
  const breakdown = {};

  orders.forEach((o) => {
    const method = o.paymentDetails?.method || 'unknown';
    if (!breakdown[method]) {
      breakdown[method] = { count: 0, totalAmount: 0, paidAmount: 0 };
    }
    breakdown[method].count += 1;
    breakdown[method].totalAmount += o.pricing.total;
    if (o.paymentStatus === 'PAID') {
      breakdown[method].paidAmount += o.pricing.total;
    }
  });

  return breakdown;
}

/**
 * Breakdown of sales by product performance
 */
export function getTopSellingProducts(limit = 5) {
  const orders = getAllOrders();
  const productTally = {};

  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productTally[item.productId]) {
        productTally[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
          image: item.image,
        };
      }
      productTally[item.productId].unitsSold += item.quantity;
      productTally[item.productId].revenue += item.lineTotal;
    });
  });

  return Object.values(productTally)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}
