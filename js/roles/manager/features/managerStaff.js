// =========================================================================
// MANAGER FEATURE: STAFF & COACHES MANAGEMENT
// =========================================================================

export function renderManagerStaff() {
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Đội Ngũ Huấn Luyện Viên</h3>
        <div class="text-xs text-slate-400">Nhân sự vận hành và phụ trách chuyên môn thể thao</div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${coaches.map(co => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div class="flex items-center space-x-3">
              <img src="${co.avatar}" class="w-12 h-12 rounded-xl object-cover border border-slate-200" />
              <div>
                <div class="font-black text-sm text-slate-900">${co.name}</div>
                <div class="text-[11px] text-indigo-600 font-bold">${co.specialty}</div>
              </div>
            </div>
            <div class="text-xs text-slate-500 pt-2 border-t border-slate-200 space-y-1">
              <div>Kinh nghiệm: <strong>${co.experience}</strong></div>
              <div>Liên hệ: <strong>${co.phone}</strong></div>
              <div>Lớp phụ trách: <strong class="text-slate-900">${co.activeClassesCount || 2} Lớp</strong></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerStaff = renderManagerStaff;
}
