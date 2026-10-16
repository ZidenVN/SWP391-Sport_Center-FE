import { apiClient } from './apiClient.js';

export const auditApi = {
  // Lấy danh sách Audit Logs phân trang từ Backend
  getLogs: (page = 0, size = 20) => apiClient.get('/admin/audit-logs', { page, size })
};

export function normalizeAuditLog(log) {
  if (!log) return null;
  const id = log.logId || log.id;
  
  // Format thời gian hiển thị
  let timeDisplay = log.createdAt || '';
  if (typeof timeDisplay === 'string' && timeDisplay.includes('T')) {
    try {
      const dt = new Date(timeDisplay);
      if (!isNaN(dt.getTime())) {
        timeDisplay = dt.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (e) {
      // fallback
    }
  }

  return {
    ...log,
    id: id,
    logId: id,
    actionType: log.actionType || 'UNKNOWN_ACTION',
    targetTable: log.targetEntity || log.targetTable || 'System',
    targetEntity: log.targetEntity || log.targetTable || 'System',
    targetEntityId: log.targetEntityId || null,
    details: log.details || '',
    accountId: log.email || (log.userId ? `User #${log.userId}` : 'Hệ Thống'),
    email: log.email || '',
    time: timeDisplay,
    createdAt: timeDisplay
  };
}

export async function syncAuditLogsWithBackend(page = 0, size = 20) {
  try {
    const res = await auditApi.getLogs(page, size);
    if (res && res.content && Array.isArray(res.content)) {
      const normalized = res.content.map(l => normalizeAuditLog(l));
      if (typeof appState !== 'undefined' && appState.data) {
        appState.data.auditLogs = normalized;
        appState.auditPagination = {
          totalElements: res.totalElements || normalized.length,
          totalPages: res.totalPages || 1,
          currentPage: res.number || page,
          pageSize: res.size || size
        };
        appState.auditLogsLoadedFromApi = true;
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[syncAuditLogsWithBackend] Cannot fetch audit logs from BE:', err.message);
  }
  return (typeof appState !== 'undefined' && appState.data?.auditLogs) ? appState.data.auditLogs : [];
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.auditApi = auditApi;
  _g.normalizeAuditLog = normalizeAuditLog;
  _g.syncAuditLogsWithBackend = syncAuditLogsWithBackend;
}
