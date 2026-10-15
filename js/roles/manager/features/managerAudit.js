// =========================================================================
// MANAGER FEATURE: AUDIT LOGS (SYSTEM TRAIL)
// =========================================================================

export function setManagerAuditSearch(keyword) {
  appState.managerAuditSearch = keyword;
  renderApp();
}

export function renderManagerAuditLogs() {
  const keyword = (appState.managerAuditSearch || '').toLowerCase().trim();
  const rawLogs = (appState.data && appState.data.auditLogs) ? appState.data.auditLogs : [];

  const filteredLogs = rawLogs.filter(log => {
    if (!keyword) return true;
    return (
      (log.actionType || '').toLowerCase().includes(keyword) ||
      (log.targetTable || '').toLowerCase().includes(keyword) ||
      (log.details || '').toLowerCase().includes(keyword) ||
      (log.accountId || '').toLowerCase().includes(keyword) ||
      (log.logId || '').toLowerCase().includes(keyword)
    );
  });

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Nhật Ký Kiểm Toán & Vết Thao Tác Hệ Thống (Audit Logs)</h2>
          <p class="text-xs text-slate-500 mt-1">Truy vết toàn bộ các hành động thêm mới gói, phân công lớp, gia hạn thẻ và thao tác dữ liệu.</p>
        </div>

        <div class="w-full sm:w-72">
          <input type="text" value="${appState.managerAuditSearch || ''}" oninput="setManagerAuditSearch(this.value)" placeholder="Tìm kiếm theo hành động, bảng, chi tiết..." class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Mã Log</th>
                <th class="py-3.5 px-4">Loại Hành Động (ActionType)</th>
                <th class="py-3.5 px-4">Bảng Dữ Liệu (TargetTable)</th>
                <th class="py-3.5 px-4">Chi Tiết Thao Tác</th>
                <th class="py-3.5 px-4">Tài Khoản Thực Hiện</th>
                <th class="py-3.5 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredLogs.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-400">Không tìm thấy bản ghi kiểm toán phù hợp.</td>
                </tr>
              ` : filteredLogs.map(log => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-700">${log.logId || log.id}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      (log.actionType || '').includes('CREATE') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      (log.actionType || '').includes('RENEW') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      (log.actionType || '').includes('RESOLVE') ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }">
                      ${log.actionType}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-800">${log.targetTable}</td>
                  <td class="py-3.5 px-4 text-slate-700 max-w-md">${log.details}</td>
                  <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">${log.accountId}</td>
                  <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">${log.timestamp}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.setManagerAuditSearch = setManagerAuditSearch;
  _g.renderManagerAuditLogs = renderManagerAuditLogs;
}
