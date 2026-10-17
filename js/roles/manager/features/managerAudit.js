// =========================================================================
// MANAGER FEATURE: AUDIT LOGS (SYSTEM TRAIL - CONNECT BE API & 5-STATES)
// =========================================================================

import { auditApi, syncAuditLogsWithBackend, normalizeAuditLog } from '../../../api/auditApi.js';

export function setManagerAuditSearch(keyword) {
  appState.managerAuditSearch = keyword;
  renderApp();
}

export async function refreshManagerAuditLogsFromApi(page = 0) {
  try {
    appState.auditLoading = true;
    renderApp();
    const logs = await syncAuditLogsWithBackend(page, 20);
    appState.auditLoading = false;
    showToast('Nhật Ký Kiểm Toán', `Đã đồng bộ ${logs.length} bản ghi vết hệ thống từ Backend!`, 'success');
    renderApp();
  } catch (err) {
    appState.auditLoading = false;
    showToast('Lỗi Kết Nối', 'Không thể kết nối đến máy chủ: ' + err.message, 'error');
    renderApp();
  }
}

export function goToAuditPage(page) {
  if (page < 0) return;
  refreshManagerAuditLogsFromApi(page);
}

export function renderManagerAuditLogs() {
  // Tự động tải từ Backend nếu chưa load
  if (!appState.auditLogsLoadedFromApi && !appState.auditLoading && typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    setTimeout(() => refreshManagerAuditLogsFromApi(0), 50);
  }

  const keyword = (appState.managerAuditSearch || '').toLowerCase().trim();
  const rawLogs = (appState.data && appState.data.auditLogs) ? appState.data.auditLogs : [];
  const logs = rawLogs.map(l => (typeof normalizeAuditLog === 'function' ? normalizeAuditLog(l) : l));

  const filteredLogs = logs.filter(log => {
    if (!keyword) return true;
    return (
      (log.actionType || '').toLowerCase().includes(keyword) ||
      (log.targetTable || log.targetEntity || '').toLowerCase().includes(keyword) ||
      (log.details || '').toLowerCase().includes(keyword) ||
      (log.accountId || log.email || '').toLowerCase().includes(keyword) ||
      String(log.logId || log.id || '').toLowerCase().includes(keyword)
    );
  });

  const pagination = appState.auditPagination || {
    totalElements: filteredLogs.length,
    totalPages: 1,
    currentPage: 0,
    pageSize: 20
  };

  return `
    <div class="space-y-6">
      <!-- HEADER & CONTROLS -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center space-x-3">
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Nhật Ký Kiểm Toán Hệ Thống</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1">Truy vết toàn bộ các hành động tạo gói, đổi vai trò, mở lớp và các thao tác bảo mật.</p>
        </div>

        <div class="flex items-center space-x-2.5 w-full sm:w-auto">
          <div class="w-full sm:w-72">
            <input type="text" value="${appState.managerAuditSearch || ''}" oninput="setManagerAuditSearch(this.value)" placeholder="Tìm hành động, thực thể, email..." class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <button type="button" onclick="refreshManagerAuditLogsFromApi(0)" title="Làm mới từ Backend" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center ${appState.auditLoading ? 'animate-spin' : ''}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>

      <!-- TABLE & 5-STATES -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Mã Log</th>
                <th class="py-3.5 px-4">Hành Động (Action)</th>
                <th class="py-3.5 px-4">Thực Thể (Entity)</th>
                <th class="py-3.5 px-4">Chi Tiết Vết Thao Tác</th>
                <th class="py-3.5 px-4">Tài Khoản Thực Hiện</th>
                <th class="py-3.5 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredLogs.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-12 text-center">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p class="text-xs font-bold text-slate-700">Chưa có nhật ký kiểm toán nào phù hợp</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Các thao tác trên hệ thống sẽ tự động được ghi nhận vào đây.</p>
                  </td>
                </tr>
              ` : filteredLogs.map(log => {
                const action = (log.actionType || 'INFO').toUpperCase();
                let badgeClass = 'bg-slate-100 text-slate-900 font-bold';
                if (action.includes('CREATE') || action.includes('ADD') || action.includes('REGISTER')) {
                  badgeClass = 'bg-emerald-50 text-emerald-950 border border-emerald-300 font-black';
                } else if (action.includes('UPDATE') || action.includes('ASSIGN') || action.includes('MODIFY')) {
                  badgeClass = 'bg-blue-50 text-blue-950 border border-blue-300 font-black';
                } else if (action.includes('DELETE') || action.includes('DEACTIVATE') || action.includes('CANCEL')) {
                  badgeClass = 'bg-rose-50 text-rose-950 border border-rose-300 font-black';
                }

                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-700">#${log.logId || log.id}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}">
                        ${action}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-800">${log.targetEntity || log.targetTable || 'System'}</td>
                    <td class="py-3.5 px-4 text-slate-600 max-w-xs truncate" title="${log.details || ''}">
                      ${log.details || '<span class="text-slate-400 italic">Thao tác hệ thống</span>'}
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      <span>${log.accountId || log.email || 'Admin'}</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                      ${log.time || log.createdAt || 'Vừa xong'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- PAGINATION BAR -->
        ${pagination.totalPages > 1 ? `
          <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Hiển thị trang <strong>${pagination.currentPage + 1}</strong> / <strong>${pagination.totalPages}</strong> (${pagination.totalElements} bản ghi)</span>
            <div class="flex items-center space-x-2">
              <button type="button" onclick="goToAuditPage(${pagination.currentPage - 1})" ${pagination.currentPage === 0 ? 'disabled class="opacity-50 cursor-not-allowed px-3 py-1 bg-white border border-slate-200 rounded-lg"' : 'class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"'}>
                &larr; Trang Trước
              </button>
              <button type="button" onclick="goToAuditPage(${pagination.currentPage + 1})" ${pagination.currentPage + 1 >= pagination.totalPages ? 'disabled class="opacity-50 cursor-not-allowed px-3 py-1 bg-white border border-slate-200 rounded-lg"' : 'class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"'}>
                Trang Sau &rarr;
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerAuditLogs = renderManagerAuditLogs;
  _g.setManagerAuditSearch = setManagerAuditSearch;
  _g.refreshManagerAuditLogsFromApi = refreshManagerAuditLogsFromApi;
  _g.goToAuditPage = goToAuditPage;
}
