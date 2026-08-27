// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Operational Business Reporting & Analytics Engine
// ═══════════════════════════════════════════════════════════

import { getAllOrders } from './orderEngine';
import { getAllInventoryPositions, getLowStockAlerts } from './inventoryService';
import { getAllProductsAdmin } from './productService';

/**
 * Get core dashboard operational overview
 */
export async function getOperationalDashboardSummary() {
  let orders = [];
  let inventory = [];
  let lowStock = [];
  let allProducts = [];

  try {
    const rawOrders = await getAllOrders();
    orders = Array.isArray(rawOrders) ? rawOrders : [];
  } catch (e) {
    orders = [];
  }

  try {
    const rawInv = await getAllInventoryPositions();
    inventory = Array.isArray(rawInv) ? rawInv : [];
  } catch (e) {
    inventory = [];
  }

  try {
    const rawLow = await getLowStockAlerts();
    lowStock = Array.isArray(rawLow) ? rawLow : [];
  } catch (e) {
    lowStock = [];
  }

  try {
    const rawProds = await getAllProductsAdmin();
    allProducts = Array.isArray(rawProds) ? rawProds : [];
  } catch (e) {
    allProducts = [];
  }

  // Completed or paid sales
  const validPaidOrders = orders.filter(
    (o) => o && (o.paymentStatus === 'PAID' || o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED')
  );

  const totalGrossRevenue = validPaidOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const totalItemsSold = validPaidOrders.reduce(
    (sum, o) => sum + (o.items || []).reduce((iSum, i) => iSum + (i.quantity || 0), 0),
    0
  );

  // Today's orders
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o && o.createdAt && String(o.createdAt).startsWith(todayStr));
  const todayRevenue = todayOrders
    .filter((o) => o && (o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED'))
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  // Pipeline counts
  const pipeline = {
    pendingPayment: orders.filter((o) => o && o.paymentStatus === 'PENDING').length,
    confirmed: orders.filter((o) => o && o.orderStatus === 'CONFIRMED').length,
    processing: orders.filter((o) => o && o.orderStatus === 'PROCESSING').length,
    ready: orders.filter((o) => o && o.orderStatus === 'READY').length,
    dispatched: orders.filter((o) => o && o.orderStatus === 'DISPATCHED').length,
    delivered: orders.filter((o) => o && (o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED')).length,
    cancelled: orders.filter((o) => o && o.orderStatus === 'CANCELLED').length,
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
 * Breakdown of sales by payment method
 */
export async function getSalesByPaymentMethod() {
  let orders = [];
  try {
    const raw = await getAllOrders();
    orders = Array.isArray(raw) ? raw : [];
  } catch (e) {
    orders = [];
  }
  const breakdown = {};

  orders.forEach((o) => {
    if (!o) return;
    const method = o.paymentDetails?.method || 'momo';
    if (!breakdown[method]) {
      breakdown[method] = { count: 0, totalAmount: 0, paidAmount: 0 };
    }
    const orderTotal = o.pricing?.total || 0;
    breakdown[method].count += 1;
    breakdown[method].totalAmount += orderTotal;
    if (o.paymentStatus === 'PAID') {
      breakdown[method].paidAmount += orderTotal;
    }
  });

  return breakdown;
}

/**
 * Breakdown of sales by product performance
 */
export async function getTopSellingProducts(limit = 5) {
  let orders = [];
  try {
    const raw = await getAllOrders();
    orders = Array.isArray(raw) ? raw : [];
  } catch (e) {
    orders = [];
  }
  const productTally = {};

  orders.forEach((o) => {
    if (!o || !Array.isArray(o.items)) return;
    o.items.forEach((item) => {
      if (!item) return;
      if (!productTally[item.productId]) {
        productTally[item.productId] = {
          productId: item.productId,
          productName: item.productName || item.name || 'Product',
          unitsSold: 0,
          revenue: 0,
          image: item.image,
        };
      }
      productTally[item.productId].unitsSold += item.quantity || 1;
      productTally[item.productId].revenue += item.lineTotal || (item.price || 0) * (item.quantity || 1);
    });
  });

  return Object.values(productTally)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}
