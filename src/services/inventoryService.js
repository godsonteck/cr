// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Inventory Flow & Position Ledger Engine
// ═══════════════════════════════════════════════════════════

import { sql } from '@/lib/db';
import { updateProduct, getAllProductsAdmin, getProductById } from './productService';
import { BUSINESS_CONFIG } from '@/data/businessConfig';
import { storeStorage } from '@/utils/storeStorage';

export async function getInventoryPosition(productId) {
  try {
    const rows = await sql`
      SELECT id, name, stock_count, low_stock_threshold
      FROM products
      WHERE id = ${productId}
      LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        productId: row.id,
        productName: row.name,
        sku: row.id.toUpperCase(),
        available: row.stock_count,
        reserved: 0,
        sold: 0,
        totalPhysical: row.stock_count,
        lowStockThreshold: row.low_stock_threshold || BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (e) {}

  const p = await getProductById(productId);
  if (!p) return null;
  return {
    productId: p.id,
    productName: p.name,
    sku: p.id.toUpperCase(),
    available: p.stockCount !== undefined ? p.stockCount : 20,
    reserved: 0,
    sold: 0,
    totalPhysical: p.stockCount !== undefined ? p.stockCount : 20,
    lowStockThreshold: p.lowStockThreshold || BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
    lastUpdated: new Date().toISOString(),
  };
}

export async function checkStockAvailability(productId, requestedQty) {
  try {
    const rows = await sql`
      SELECT stock_count FROM products WHERE id = ${productId} LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      return {
        available: rows[0].stock_count >= requestedQty,
        remaining: rows[0].stock_count,
      };
    }
  } catch (e) {}

  const p = await getProductById(productId);
  if (!p) return { available: false, remaining: 0 };
  const count = p.stockCount !== undefined ? p.stockCount : 20;
  return {
    available: count >= requestedQty,
    remaining: count,
  };
}

export async function reserveStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const p = await getProductById(productId);
  const currentStock = p ? (p.stockCount !== undefined ? p.stockCount : 20) : 0;
  if (!p || currentStock < quantity) {
    throw new Error(`Insufficient stock for product ${productId}. Available: ${currentStock}`);
  }

  const newStock = Math.max(0, currentStock - quantity);
  await updateProduct(productId, { stockCount: newStock }, operator);

  try {
    await sql`
      INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
      VALUES (${productId}, ${p.name}, ${-quantity}, ${newStock}, 'RESERVED', ${referenceId});
    `;
  } catch (e) {}

  return {
    productId,
    productName: p.name,
    type: 'STOCK_RESERVED',
    quantity,
    reason: `Reserved for checkout / order ${referenceId}`,
    operator,
    timestamp: new Date().toISOString(),
  };
}

export async function releaseStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const p = await getProductById(productId);
  if (!p) return;
  const currentStock = p.stockCount !== undefined ? p.stockCount : 20;
  const newStock = currentStock + quantity;
  await updateProduct(productId, { stockCount: newStock }, operator);

  try {
    await sql`
      INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
      VALUES (${productId}, ${p.name}, ${quantity}, ${newStock}, 'RELEASED', ${referenceId});
    `;
  } catch (e) {}
}

export async function commitStock(productId, quantity, orderId, operator = 'Order Fulfillment') {
  const p = await getProductById(productId);
  if (!p) return;
  try {
    await sql`
      INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
      VALUES (${productId}, ${p.name}, 0, ${p.stockCount || 0}, 'SOLD', ${orderId});
    `;
  } catch (e) {}
}

export async function adjustStock(productId, deltaQuantity, reason, operator = 'Store Manager') {
  const p = await getProductById(productId);
  if (!p) throw new Error(`Product ${productId} not found`);

  const currentStock = p.stockCount !== undefined ? p.stockCount : 20;
  const newStock = Math.max(0, currentStock + deltaQuantity);

  await updateProduct(productId, { stockCount: newStock }, operator);

  try {
    await sql`
      INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
      VALUES (${productId}, ${p.name}, ${deltaQuantity}, ${newStock}, ${deltaQuantity > 0 ? 'RECEIVED' : 'ADJUSTED'}, ${reason});
    `;
  } catch (e) {}

  return {
    position: {
      productId,
      productName: p.name,
      available: newStock,
      totalPhysical: newStock,
    },
    movement: {
      productId,
      productName: p.name,
      type: deltaQuantity > 0 ? 'STOCK_RECEIVED' : 'STOCK_ADJUSTED',
      quantity: Math.abs(deltaQuantity),
      reason: reason || 'Manual inventory adjustment',
      operator,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function getLowStockAlerts() {
  try {
    const rows = await sql`
      SELECT id, name, stock_count, low_stock_threshold
      FROM products
      WHERE stock_count <= low_stock_threshold AND status = 'PUBLISHED'
      ORDER BY stock_count ASC;
    `;
    if (rows && rows.length > 0) {
      return rows.map((row) => ({
        productId: row.id,
        productName: row.name,
        available: row.stock_count,
        lowStockThreshold: row.low_stock_threshold || BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
      }));
    }
  } catch (e) {}

  const products = await getAllProductsAdmin();
  return products
    .filter((p) => (p.stockCount || 0) <= (p.lowStockThreshold || 10) && p.status === 'PUBLISHED')
    .map((p) => ({
      productId: p.id,
      productName: p.name,
      available: p.stockCount || 0,
      lowStockThreshold: p.lowStockThreshold || 10,
    }));
}

export async function getAllInventoryPositions() {
  try {
    const rows = await sql`
      SELECT id, name, stock_count, low_stock_threshold
      FROM products
      WHERE status = 'PUBLISHED'
      ORDER BY name;
    `;
    if (rows && rows.length > 0) {
      return rows.map((row) => ({
        productId: row.id,
        productName: row.name,
        sku: row.id.toUpperCase(),
        available: row.stock_count,
        reserved: 0,
        sold: 0,
        totalPhysical: row.stock_count,
        lowStockThreshold: row.low_stock_threshold || BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
        lastUpdated: new Date().toISOString(),
      }));
    }
  } catch (e) {}

  const products = await getAllProductsAdmin();
  return products.map((p) => ({
    productId: p.id,
    productName: p.name,
    sku: p.id.toUpperCase(),
    available: p.stockCount !== undefined ? p.stockCount : 20,
    reserved: 0,
    sold: 0,
    totalPhysical: p.stockCount !== undefined ? p.stockCount : 20,
    lowStockThreshold: p.lowStockThreshold || 10,
    lastUpdated: new Date().toISOString(),
  }));
}

export async function getInventoryLedger(limit = 50) {
  try {
    const rows = await sql`
      SELECT * FROM inventory_ledger
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    if (rows && rows.length > 0) {
      return rows.map((row) => ({
        movementId: row.id,
        productId: row.product_id,
        productName: row.product_name,
        type: row.reason,
        quantity: Math.abs(row.change_qty),
        reason: row.reason,
        operator: 'System',
        timestamp: row.created_at,
        balanceAfter: row.balance_after,
      }));
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    return storeStorage.getLedger([]);
  }
  return [];
}