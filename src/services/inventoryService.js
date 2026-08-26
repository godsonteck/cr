// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Inventory Flow & Position Ledger Engine (PostgreSQL Authoritative)
// ═══════════════════════════════════════════════════════════

import { sql } from '@/lib/db';
import { updateProduct } from './productService';
import { BUSINESS_CONFIG } from '@/data/businessConfig';

export async function getInventoryPosition(productId) {
  const rows = await sql`
    SELECT id, name, stock_count, low_stock_threshold
    FROM products
    WHERE id = ${productId}
    LIMIT 1;
  `;

  if (rows.length === 0) return null;

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

export async function checkStockAvailability(productId, requestedQty) {
  const rows = await sql`
    SELECT stock_count FROM products WHERE id = ${productId} LIMIT 1;
  `;

  if (rows.length === 0) return { available: false, remaining: 0 };

  return {
    available: rows[0].stock_count >= requestedQty,
    remaining: rows[0].stock_count,
  };
}

export async function reserveStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const rows = await sql`
    SELECT stock_count, name FROM products WHERE id = ${productId} LIMIT 1;
  `;

  if (rows.length === 0 || rows[0].stock_count < quantity) {
    throw new Error(`Insufficient stock for product ${productId}. Available: ${rows[0]?.stock_count || 0}`);
  }

  const newStock = rows[0].stock_count - quantity;
  await sql`
    UPDATE products
    SET stock_count = ${newStock}, in_stock = ${newStock > 0}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${productId};
  `;

  await sql`
    INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
    VALUES (${productId}, ${rows[0].name}, ${-quantity}, ${newStock}, 'RESERVED', ${referenceId});
  `;

  return {
    productId,
    productName: rows[0].name,
    type: 'STOCK_RESERVED',
    quantity,
    reason: `Reserved for checkout / order ${referenceId}`,
    operator,
    timestamp: new Date().toISOString(),
  };
}

export async function releaseStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const rows = await sql`
    SELECT stock_count, name FROM products WHERE id = ${productId} LIMIT 1;
  `;

  if (rows.length === 0) return;

  const newStock = rows[0].stock_count + quantity;
  await sql`
    UPDATE products
    SET stock_count = ${newStock}, in_stock = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${productId};
  `;

  await sql`
    INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
    VALUES (${productId}, ${rows[0].name}, ${quantity}, ${newStock}, 'RELEASED', ${referenceId});
  `;
}

export async function commitStock(productId, quantity, orderId, operator = 'Order Fulfillment') {
  // Stock already deducted during reserve, just log the sale
  const rows = await sql`
    SELECT stock_count, name FROM products WHERE id = ${productId} LIMIT 1;
  `;

  if (rows.length === 0) return;

  await sql`
    INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
    VALUES (${productId}, ${rows[0].name}, 0, ${rows[0].stock_count}, 'SOLD', ${orderId});
  `;
}

export async function adjustStock(productId, deltaQuantity, reason, operator = 'Store Manager') {
  const rows = await sql`
    SELECT stock_count, name FROM products WHERE id = ${productId} LIMIT 1;
  `;

  if (rows.length === 0) throw new Error(`Product ${productId} not found`);

  const previousStock = rows[0].stock_count;
  const newStock = Math.max(0, previousStock + deltaQuantity);

  await sql`
    UPDATE products
    SET stock_count = ${newStock}, in_stock = ${newStock > 0}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${productId};
  `;

  await sql`
    INSERT INTO inventory_ledger (product_id, product_name, change_qty, balance_after, reason, reference_id)
    VALUES (${productId}, ${rows[0].name}, ${deltaQuantity}, ${newStock}, ${deltaQuantity > 0 ? 'RECEIVED' : 'ADJUSTED'}, ${reason});
  `;

  return {
    position: {
      productId,
      productName: rows[0].name,
      available: newStock,
      totalPhysical: newStock,
    },
    movement: {
      productId,
      productName: rows[0].name,
      type: deltaQuantity > 0 ? 'STOCK_RECEIVED' : 'STOCK_ADJUSTED',
      quantity: Math.abs(deltaQuantity),
      reason: reason || 'Manual inventory adjustment',
      operator,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function getLowStockAlerts() {
  const rows = await sql`
    SELECT id, name, stock_count, low_stock_threshold
    FROM products
    WHERE stock_count <= low_stock_threshold AND status = 'PUBLISHED'
    ORDER BY stock_count ASC;
  `;

  return rows.map(row => ({
    productId: row.id,
    productName: row.name,
    available: row.stock_count,
    lowStockThreshold: row.low_stock_threshold || BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
  }));
}

export async function getAllInventoryPositions() {
  const rows = await sql`
    SELECT id, name, stock_count, low_stock_threshold
    FROM products
    WHERE status = 'PUBLISHED'
    ORDER BY name;
  `;

  return rows.map(row => ({
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

export async function getInventoryLedger(limit = 50) {
  const rows = await sql`
    SELECT * FROM inventory_ledger
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;

  return rows.map(row => ({
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