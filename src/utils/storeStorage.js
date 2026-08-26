// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Unified Store Data Persistence Engine
// ═══════════════════════════════════════════════════════════

const KEYS = {
  PRODUCTS: 'cr_store_products',
  ORDERS: 'cr_store_orders',
  INVENTORY: 'cr_store_inventory',
  CONFIG: 'cr_store_config',
  AUDIT_LOGS: 'cr_store_audit_logs',
  LEDGER: 'cr_store_ledger',
};

function safeGet(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[StoreStorage] Failed reading ${key}:`, err);
    return defaultVal;
  }
}

function safeSet(key, val) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
    // Trigger custom window event for real-time reactivity across components
    window.dispatchEvent(new CustomEvent('cr-store-updated', { detail: { key } }));
  } catch (err) {
    console.warn(`[StoreStorage] Failed saving ${key}:`, err);
  }
}

export const storeStorage = {
  getProducts: (fallback) => safeGet(KEYS.PRODUCTS, fallback),
  saveProducts: (products) => safeSet(KEYS.PRODUCTS, products),

  getOrders: (fallback = []) => safeGet(KEYS.ORDERS, fallback),
  saveOrders: (orders) => safeSet(KEYS.ORDERS, orders),

  getInventory: (fallback = null) => safeGet(KEYS.INVENTORY, fallback),
  saveInventory: (inv) => safeSet(KEYS.INVENTORY, inv),

  getConfig: (fallback = null) => safeGet(KEYS.CONFIG, fallback),
  saveConfig: (cfg) => safeSet(KEYS.CONFIG, cfg),

  getAuditLogs: (fallback = []) => safeGet(KEYS.AUDIT_LOGS, fallback),
  saveAuditLogs: (logs) => safeSet(KEYS.AUDIT_LOGS, logs),

  getLedger: (fallback = []) => safeGet(KEYS.LEDGER, fallback),
  saveLedger: (ledger) => safeSet(KEYS.LEDGER, ledger),
};
