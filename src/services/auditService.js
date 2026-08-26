// ═══════════════════════════════════════════════════════════
// CR COSMETICS & ESSENTIALS
// Audit Trail & Event Ledger Service (Persistent)
// Master Directive Section 45, 58
// ═══════════════════════════════════════════════════════════

import { storeStorage } from '@/utils/storeStorage';

function loadAuditLogs() {
  return storeStorage.getAuditLogs([]);
}

function saveAuditLogs(logs) {
  storeStorage.saveAuditLogs(logs);
}

/**
 * Record a traceable business action
 */
export function recordAuditEvent({
  action,
  operator = 'System',
  entityType = 'GENERAL',
  entityId = '',
  details = {},
}) {
  const logEntry = {
    eventId: `EVT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    action,
    operator,
    entityType,
    entityId,
    details,
  };

  const logs = loadAuditLogs();
  logs.unshift(logEntry);
  saveAuditLogs(logs);
  return logEntry;
}

/**
 * Query audit logs
 */
export function getAuditLogs(limit = 50, filterType = null) {
  let results = loadAuditLogs();
  if (filterType) {
    results = results.filter((log) => log.entityType === filterType || log.action.includes(filterType));
  }
  return results.slice(0, limit);
}
