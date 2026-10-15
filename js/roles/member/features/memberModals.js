// =========================================================================
// MEMBER FEATURE: DISCIPLINE & COACH DETAIL MODALS
// =========================================================================

import { GYM_MEMBER_LANDING_DATA } from './memberLanding.js';

function openDisciplineDetail(id) {
  const list = (typeof GYM_MEMBER_LANDING_DATA !== 'undefined' && GYM_MEMBER_LANDING_DATA.classes) ? GYM_MEMBER_LANDING_DATA.classes : [];
  const item = list.find(c => c.id === id);
  if (!item) return;
  appState.selectedDiscipline = item;
  renderApp();
}

function closeDisciplineDetail() {
  appState.selectedDiscipline = null;
  renderApp();
}

function renderDisciplineDetailModal() {
  const item = appState.selectedDiscipline;
  if (!item) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeDisciplineDetail()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <!-- Modal Image Banner -->
        <div class="relative h-52 sm:h-56 w-full bg-slate-900 overflow-hidden flex-shrink-0">
          <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
          
          <span class="absolute top-4 left-4 px-3.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
            ${item.tag}
          </span>
          <span class="absolute top-4 right-14 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
            ${item.badge}
          </span>

          <button 
            type="button" 
            onclick="closeDisciplineDetail()" 
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold transition backdrop-blur-xs"
            aria-label="Đóng"
          >
            ✕
          </button>

          <div class="absolute bottom-4 left-4 right-4 text-white">
            <h3 class="text-2xl font-black drop-shadow-md">${item.title}</h3>
          </div>
        </div>

        <!-- Modal Body: Table of Specifications / Information -->
        <div class="p-6 overflow-y-auto space-y-4">
          <!-- Description Block -->
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-1.5">Giới Thiệu Bộ Môn</div>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              ${item.desc}
            </p>
          </div>

          <!-- Structured Information Table -->
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Bảng Thông Tin Chi Tiết</div>
            <div class="overflow-hidden rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50 w-2/5">Tên bộ môn</td>
                    <td class="py-3 px-4 font-extrabold text-slate-900">${item.title}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Phân loại / Studio</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${item.category}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Mục tiêu rèn luyện</td>
                    <td class="py-3 px-4 font-bold text-blue-600">${item.badge}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Trình độ phù hợp</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${item.level}</td>
                  </tr>
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50 align-top">Mô tả tóm tắt</td>
                    <td class="py-3 px-4 text-slate-700 leading-relaxed font-normal">${item.desc}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pt-2 flex items-center gap-3">
            <button 
              type="button" 
              onclick="closeDisciplineDetail()" 
              class="flex-1 py-3 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 transition text-center"
            >
              Đóng
            </button>
            <button 
              type="button" 
              onclick="closeDisciplineDetail(); quickExploreCategory('${item.category}')" 
              class="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition text-center shadow-md hover-lift-sm flex items-center justify-center space-x-1.5"
            >
              <span>Xem Lớp Học ${item.category}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openCoachDetail(id) {
  const list = (typeof GYM_MEMBER_LANDING_DATA !== 'undefined' && GYM_MEMBER_LANDING_DATA.coaches) ? GYM_MEMBER_LANDING_DATA.coaches : [];
  const item = list.find(c => c.id === id);
  if (!item) return;
  appState.selectedCoach = item;
  renderApp();
}

function closeCoachDetail() {
  appState.selectedCoach = null;
  renderApp();
}

function renderCoachDetailModal() {
  const c = appState.selectedCoach;
  if (!c) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeCoachDetail()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <!-- Modal Image Banner -->
        <div class="relative h-60 sm:h-64 w-full bg-slate-950 overflow-hidden flex-shrink-0">
          <img src="${c.image}" alt="${c.name}" loading="lazy" decoding="async" class="w-full h-full object-cover object-top" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent"></div>
          
          <span class="absolute top-4 left-4 px-3.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
            ${c.specialtyBadge}
          </span>
          <span class="absolute top-4 right-14 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
            ${c.exp}
          </span>

          <button 
            type="button" 
            onclick="closeCoachDetail()" 
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold transition backdrop-blur-xs"
            aria-label="Đóng"
          >
            ✕
          </button>

          <div class="absolute bottom-4 left-4 right-4 text-white">
            <div class="text-[11px] font-black uppercase tracking-wider text-cyan-300 drop-shadow-sm">
              ${c.roleTitle}
            </div>
            <h3 class="text-2xl font-black drop-shadow-md mt-0.5">${c.name}</h3>
          </div>
        </div>

        <!-- Modal Body: Table of Specifications / Information -->
        <div class="p-6 overflow-y-auto space-y-4">
          <!-- Bio / Description Block -->
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-1.5">Giới Thiệu Huấn Luyện Viên</div>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              ${c.desc}
            </p>
          </div>

          <!-- Structured Information Table -->
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Hồ Sơ Huấn Luyện Viên</div>
            <div class="overflow-hidden rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50 w-2/5">Họ và tên HLV</td>
                    <td class="py-3 px-4 font-extrabold text-slate-900">${c.name}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Chức danh chuyên môn</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${c.roleTitle}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Bộ môn phụ trách</td>
                    <td class="py-3 px-4 font-bold text-blue-600">${c.specialtyBadge} (${c.category})</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Kinh nghiệm huấn luyện</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${c.exp}</td>
                  </tr>
                  <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Chứng chỉ chuyên môn</td>
                    <td class="py-3 px-4 font-bold text-emerald-600">${c.cert}</td>
                  </tr>
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-bold text-slate-500 bg-slate-50/50 align-top">Thế mạnh & Phong cách</td>
                    <td class="py-3 px-4 text-slate-700 leading-relaxed font-normal">${c.desc}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pt-2 flex items-center gap-3">
            <button 
              type="button" 
              onclick="closeCoachDetail()" 
              class="flex-1 py-3 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 transition text-center"
            >
              Đóng
            </button>
            <button 
              type="button" 
              onclick="closeCoachDetail(); quickExploreCategory('${c.category}')" 
              class="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition text-center shadow-md hover-lift-sm flex items-center justify-center space-x-1.5"
            >
              <span>Xem Lớp Của HLV ${c.name}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export {
  openDisciplineDetail,
  closeDisciplineDetail,
  renderDisciplineDetailModal,
  openCoachDetail,
  closeCoachDetail,
  renderCoachDetailModal
};
