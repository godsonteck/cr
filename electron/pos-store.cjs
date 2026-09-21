const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

function createPosStore(userDataPath) {
  const db = new Database(path.join(userDataPath, 'cr-pos.sqlite'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS pos_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pos_catalog (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pos_sale_queue (idempotency_key TEXT PRIMARY KEY, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING_SYNC', attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  `);
  let deviceId = db.prepare('SELECT value FROM pos_meta WHERE key = ?').get('device_id')?.value;
  if (!deviceId) { deviceId = crypto.randomUUID(); db.prepare('INSERT INTO pos_meta (key,value) VALUES (?,?)').run('device_id', deviceId); }
  return {
    deviceId,
    cacheCatalog(products) {
      const now = new Date().toISOString(); const upsert = db.prepare('INSERT INTO pos_catalog (id,payload,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at');
      const transaction = db.transaction(rows => rows.forEach(product => upsert.run(product.id, JSON.stringify(product), now))); transaction(products);
    },
    getCatalog() { return db.prepare('SELECT payload FROM pos_catalog ORDER BY updated_at DESC').all().map(row => JSON.parse(row.payload)); },
    queueSale(idempotencyKey, payload) { const now = new Date().toISOString(); db.prepare('INSERT OR IGNORE INTO pos_sale_queue (idempotency_key,payload,created_at,updated_at) VALUES (?,?,?,?)').run(idempotencyKey, JSON.stringify(payload), now, now); },
    pendingSales() { return db.prepare("SELECT idempotency_key, payload, status, attempts, last_error FROM pos_sale_queue WHERE status IN ('PENDING_SYNC','SYNC_FAILED') ORDER BY created_at").all().map(row => ({ ...row, payload: JSON.parse(row.payload) })); },
    markSync(idempotencyKey, status, error = null) { db.prepare('UPDATE pos_sale_queue SET status=?, attempts=attempts+1, last_error=?, updated_at=? WHERE idempotency_key=?').run(status, error, new Date().toISOString(), idempotencyKey); },
  };
}
module.exports = { createPosStore };
