// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Inventory Flow & Position Ledger Engine (Persistent)
// Master Directive Section 07, 08, 09, 12, 31, 32
// ═══════════════════════════════════════════════════════════

import { getAllProductsAdmin, updateProduct } from './productService';
import { BUSINESS_CONFIG } from '@/data/businessConfig';
import { storeStorage } from '@/utils/storeStorage';

function loadPositions() {
  const stored = storeStorage.getInventory(null);
  if (stored) return stored;

  const initial = {};
  const products = getAllProductsAdmin();
  products.forEach((product) => {
    const initialQty = product.stockCount !== undefined ? product.stockCount : 20;
    initial[product.id] = {
      productId: product.id,
      productName: product.name,
      sku: product.id.toUpperCase(),
      available: initialQty,
      reserved: 0,
      sold: 0,
      totalPhysical: initialQty,
      lowStockThreshold: BUSINESS_CONFIG.inventory.defaultLowStockThreshold,
      lastUpdated: new Date().toISOString(),
    };
  });

  storeStorage.saveInventory(initial);
  return initial;
}

function savePositions(pos) {
  storeStorage.saveInventory(pos);
}

function loadLedger() {
  return storeStorage.getLedger([]);
}

function saveLedger(ledger) {
  storeStorage.saveLedger(ledger);
}

/**
 * Get current inventory position for a product
 */
export function getInventoryPosition(productId) {
  const positions = loadPositions();
  return positions[productId] || null;
}

/**
 * Check if requested quantity can be fulfilled
 */
export function checkStockAvailability(productId, requestedQty) {
  const positions = loadPositions();
  const position = positions[productId];
  if (!position) return { available: false, remaining: 0 };
  return {
    available: position.available >= requestedQty,
    remaining: position.available,
  };
}

/**
 * Reserve stock when customer enters checkout
 */
export function reserveStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const positions = loadPositions();
  const pos = positions[productId];
  if (!pos || pos.available < quantity) {
    throw new Error(`Insufficient stock for product ${productId}. Available: ${pos ? pos.available : 0}`);
  }

  pos.available -= quantity;
  pos.reserved += quantity;
  pos.lastUpdated = new Date().toISOString();
  savePositions(positions);

  const ledger = loadLedger();
  const movement = {
    movementId: `MOV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    productName: pos.productName,
    type: 'STOCK_RESERVED',
    quantity,
    reason: `Reserved for checkout / order ${referenceId}`,
    operator,
    timestamp: new Date().toISOString(),
    positionAfter: { ...pos },
  };

  ledger.unshift(movement);
  saveLedger(ledger);
  return movement;
}

/**
 * Release reserved stock if checkout expires or payment fails
 */
export function releaseStock(productId, quantity, referenceId, operator = 'Checkout Engine') {
  const positions = loadPositions();
  const pos = positions[productId];
  if (!pos) return;

  const actualRelease = Math.min(pos.reserved, quantity);
  pos.reserved -= actualRelease;
  pos.available += actualRelease;
  pos.lastUpdated = new Date().toISOString();
  savePositions(positions);

  const ledger = loadLedger();
  const movement = {
    movementId: `MOV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    productName: pos.productName,
    type: 'STOCK_RELEASED',
    quantity: actualRelease,
    reason: `Released hold from expired/cancelled order ${referenceId}`,
    operator,
    timestamp: new Date().toISOString(),
    positionAfter: { ...pos },
  };

  ledger.unshift(movement);
  saveLedger(ledger);
  return movement;
}

/**
 * Commit reserved stock on order confirmation (sales finalized)
 */
export function commitStock(productId, quantity, orderId, operator = 'Order Fulfillment') {
  const positions = loadPositions();
  const pos = positions[productId];
  if (!pos) return;

  if (pos.reserved >= quantity) {
    pos.reserved -= quantity;
  } else {
    pos.available = Math.max(0, pos.available - quantity);
  }

  pos.totalPhysical = Math.max(0, pos.totalPhysical - quantity);
  pos.sold += quantity;
  pos.lastUpdated = new Date().toISOString();
  savePositions(positions);

  // Sync to product catalog
  try {
    updateProduct(productId, { stockCount: pos.available }, operator);
  } catch (err) {
    // Ignore if not found
  }

  const ledger = loadLedger();
  const movement = {
    movementId: `MOV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    productName: pos.productName,
    type: 'STOCK_SOLD',
    quantity,
    reason: `Sale finalized under order ${orderId}`,
    operator,
    timestamp: new Date().toISOString(),
    positionAfter: { ...pos },
  };

  ledger.unshift(movement);
  saveLedger(ledger);
  return movement;
}

/**
 * Manual stock intake or adjustment with explicit reason & operator audit
 */
export function adjustStock(productId, deltaQuantity, reason, operator = 'Store Manager') {
  const positions = loadPositions();
  const pos = positions[productId];
  if (!pos) throw new Error(`Product ${productId} not found`);

  const previous = { ...pos };
  pos.available += deltaQuantity;
  pos.totalPhysical += deltaQuantity;
  pos.lastUpdated = new Date().toISOString();
  savePositions(positions);

  // Sync with product catalog
  try {
    updateProduct(productId, { stockCount: pos.available }, operator);
  } catch (err) {
    // Ignore if not found
  }

  const ledger = loadLedger();
  const movement = {
    movementId: `MOV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    productName: pos.productName,
    type: deltaQuantity > 0 ? 'STOCK_RECEIVED' : 'STOCK_ADJUSTED',
    quantity: Math.abs(deltaQuantity),
    reason: reason || 'Manual inventory adjustment',
    operator,
    timestamp: new Date().toISOString(),
    previousPosition: previous,
    positionAfter: { ...pos },
  };

  ledger.unshift(movement);
  saveLedger(ledger);
  return { position: pos, movement };
}

/**
 * Retrieve low stock alerts based on configurable thresholds
 */
export function getLowStockAlerts() {
  const positions = loadPositions();
  return Object.values(positions).filter(
    (pos) => pos.available <= pos.lowStockThreshold
  );
}

/**
 * Retrieve all inventory positions
 */
export function getAllInventoryPositions() {
  const positions = loadPositions();
  return Object.values(positions);
}

/**
 * Retrieve the full movement ledger
 */
export function getInventoryLedger(limit = 50) {
  const ledger = loadLedger();
  return ledger.slice(0, limit);
}
