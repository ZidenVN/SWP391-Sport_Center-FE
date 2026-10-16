// =========================================================================
// MANAGER FEATURE: CLASSES & ROOMS SCHEDULER (CRUD, REAL BE SYNC, 5-STATES)
// =========================================================================

import { classApi, roomApi, syncClassesWithBackend, normalizeSportClass } from '../../../api/classApi.js';
import { syncCoachesWithBackend } from '../../../api/coachApi.js';

export function setManagerClassSubView(subView) {
  appState.managerClassSubView = subView;
  renderApp();
}

export function setManagerClassFilter(category) {
  appState.managerClassFilter = category;
  renderApp();
}

export function setManagerClassSearch(keyword) {
  appState.managerClassSearch = keyword;
  renderApp();
}

export async function refreshManagerClassesFromApi() {
  try {
    appState.classesLoading = true;
    renderApp();
    const [classes, coaches] = await Promise.all([
      syncClassesWithBackend(true),
      syncCoachesWithBackend(true)
    ]);
    appState.classesLoading = false;
    showToast('Đồng Bộ Dữ Liệu', `Đã đồng bộ ${classes.length} lớp học & phòng tập từ Backend!`, 'success');
    renderApp();
  } catch (err) {
    appState.classesLoading = false;
    showToast('Lỗi Kết Nối', 'Không thể kết nối Backend: ' + err.message, 'error');
    renderApp();
  }
}

export function openAssignCoachModal(classId) {
  appState.managerSelectedClassForCoach = classId;
  appState.managerActiveModal = 'ASSIGN_COACH_MODAL';
  renderApp();
}

export function openDeleteClassModal(classId) {
  appState.managerSelectedClassForDelete = classId;
  appState.managerActiveModal = 'DELETE_CLASS_MODAL';
  renderApp();
}

export function openCreateRoomModal() {
  appState.managerActiveModal = 'CREATE_ROOM_MODAL';
  renderApp();
}

export function openDeleteRoomModal(roomId) {
  appState.managerSelectedRoomForDelete = roomId;
  appState.managerActiveModal = 'DELETE_ROOM_MODAL';
  renderApp();
}

export function renderManagerClasses() {
  // Tự động đồng bộ từ Backend trong lần đầu mở tab
  if (!appState.classesLoadedFromApi && !appState.classesLoading && typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    setTimeout(() => refreshManagerClassesFromApi(), 50);
  }

  const subView = appState.managerClassSubView || 'CLASSES'; // 'CLASSES' | 'ROOMS'

  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const classes = rawClasses.map(c => (typeof normalizeSportClass === 'function' ? normalizeSportClass(c) : c));

  const rooms = (appState.data && appState.data.rooms) ? appState.data.rooms : [];

  return `
    <div class="space-y-6">
      <!-- SUB-NAVIGATION TABS: LỚP HỌC vs PHÒNG TẬP -->
      <div class="flex items-center space-x-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit">
        <button type="button" onclick="setManagerClassSubView('CLASSES')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${subView === 'CLASSES' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span>Danh Sách Lớp Học (${classes.length})</span>
        </button>

        <button type="button" onclick="setManagerClassSubView('ROOMS')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${subView === 'ROOMS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          <span>Danh Sách Phòng Tập (${rooms.length})</span>
        </button>
      </div>

      <!-- MAIN CONTENT: RENDER CLASSES OR ROOMS -->
      ${subView === 'CLASSES' ? renderClassesSubView(classes) : renderRoomsSubView(rooms, classes)}
    </div>
  `;
}

/**
 * SUB-VIEW: DANH SÁCH LỚP HỌC
 */
function renderClassesSubView(classes) {
  const filter = appState.managerClassFilter || 'ALL';
  const search = (appState.managerClassSearch || '').toLowerCase().trim();

  const subjectCategories = ['ALL', ...new Set(classes.map(c => c.category || c.subjectName).filter(Boolean))];

  const filtered = classes.filter(c => {
    const cat = (c.category || c.subjectName || '').toUpperCase();
    const matchCat = filter === 'ALL' || cat === filter.toUpperCase();
    const matchSearch = !search ||
      (c.title || '').toLowerCase().includes(search) ||
      (c.room || '').toLowerCase().includes(search) ||
      (c.coach || '').toLowerCase().includes(search) ||
      (c.category || '').toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  return `
    <div class="space-y-5">
      <!-- HEADER & CONTROLS -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center space-x-3">
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Thời Khóa Biểu & Lớp Học Thể Thao</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1">Sắp xếp thời khóa biểu, mở lớp mới, phân công HLV và phòng tập thể thao.</p>
        </div>

        <div class="flex items-center space-x-2.5 w-full sm:w-auto">
          <button type="button" onclick="refreshManagerClassesFromApi()" title="Làm mới từ Backend" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center ${appState.classesLoading ? 'animate-spin' : ''}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>

          <button type="button" onclick="openManagerModal('CREATE_CLASS')" class="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Mở Lớp Học Mới</span>
          </button>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          ${subjectCategories.map(cat => `
            <button type="button" onclick="setManagerClassFilter('${cat}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${filter === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}">
              ${cat === 'ALL' ? 'Tất Cả Bộ Môn' : cat}
            </button>
          `).join('')}
        </div>

        <div class="w-full sm:w-64">
          <input type="text" value="${appState.managerClassSearch || ''}" oninput="setManagerClassSearch(this.value)" placeholder="Tìm kiếm tên lớp, phòng, HLV..." class="w-full px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <!-- 5-STATE: EMPTY STATE -->
      ${filtered.length === 0 ? `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 class="text-base font-black text-slate-800">Không tìm thấy lớp học nào</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">Không có lớp học nào khớp với bộ lọc hoặc danh sách lớp học đang trống.</p>
          <div class="mt-4 flex items-center justify-center gap-2">
            <button type="button" onclick="setManagerClassFilter('ALL'); setManagerClassSearch('');" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Xóa Bộ Lọc</button>
            <button type="button" onclick="openManagerModal('CREATE_CLASS')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">Tạo Lớp Đầu Tiên</button>
          </div>
        </div>
      ` : `
        <!-- CLASSES GRID (SUCCESS STATE) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${filtered.map(c => {
            const enrolled = c.enrolled || 0;
            const cap = c.capacity || c.maxCapacity || 20;
            const percent = Math.min(100, Math.round((enrolled / cap) * 100));

            return `
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition">
                <div>
                  <div class="flex justify-between items-start">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-950 border border-blue-200">
                      ${c.category || 'THỂ THAO'}
                    </span>
                    <span class="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      ${c.scheduleTime || '18:00 - 19:30'}
                    </span>
                  </div>

                  <div class="mt-3.5">
                    <h3 class="text-base font-black text-slate-900 line-clamp-1">${c.title || c.className}</h3>
                    <div class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>Phòng: <strong class="text-slate-700">${c.room || c.roomName || 'Phòng Tập'}</strong></span>
                      <span>&bull;</span>
                      <span>HLV: <strong class="text-blue-950 font-bold">${c.coach || c.coachName || 'Chưa phân công'}</strong></span>
                    </div>
                  </div>

                  <!-- TIẾN ĐỘ SĨ SỐ -->
                  <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-500">Sĩ số học viên:</span>
                      <span class="font-bold text-slate-900">${enrolled}/${cap} Học Viên (${percent}%)</span>
                    </div>
                    <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div class="bg-indigo-600 h-full rounded-full transition-all" style="width: ${percent}%"></div>
                    </div>
                  </div>
                </div>

                <!-- ACTIONS -->
                <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button type="button" onclick="openAssignCoachModal('${c.classId || c.id}')" class="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-2xs">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>Đổi HLV</span>
                  </button>

                  <button type="button" onclick="openDeleteClassModal('${c.classId || c.id}')" title="Xóa / Hủy Lớp" class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * SUB-VIEW: DANH SÁCH PHÒNG TẬP (ROOMS)
 */
function renderRoomsSubView(rooms, classes) {
  return `
    <div class="space-y-5">
      <!-- HEADER PHÒNG TẬP -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center space-x-3">
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Cơ Sở Vật Chất & Phòng Tập</h2>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Tổng số: ${rooms.length} phòng
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Quản lý không gian sàn tập, sức chứa tối đa và theo dõi các lớp học đang diễn ra tại từng phòng.</p>
        </div>

        <div class="flex items-center space-x-2.5 w-full sm:w-auto">
          <button type="button" onclick="refreshManagerClassesFromApi()" title="Làm mới từ Backend" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>

          <button type="button" onclick="openCreateRoomModal()" class="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Thêm Phòng Tập Mới</span>
          </button>
        </div>
      </div>

      <!-- ROOMS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${rooms.map(r => {
          const roomId = r.roomId || r.id;
          const roomName = r.roomName || r.name || 'Phòng Tập';
          const cap = r.capacity || r.maxCapacity || 25;
          const status = (r.status || 'AVAILABLE').toUpperCase();
          const isReady = status === 'AVAILABLE' || status === 'READY';

          // Tìm các lớp học đang sử dụng phòng này
          const assignedClasses = classes.filter(c => String(c.roomId) === String(roomId) || String(c.room) === String(roomName));

          return `
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition">
              <div>
                <div class="flex justify-between items-start">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    ${isReady ? 'SẴN SÀNG HOẠT ĐỘNG' : 'ĐANG BẢO TRÌ'}
                  </span>
                  <span class="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Sức chứa: <strong>${cap} người</strong>
                  </span>
                </div>

                <div class="mt-3.5">
                  <h3 class="text-base font-black text-slate-900">${roomName}</h3>
                  <p class="text-xs text-slate-500 mt-1">Mã phòng: <span class="font-mono text-slate-700 font-bold">#${roomId}</span></p>
                </div>

                <!-- CÁC LỚP ĐANG DÙNG PHÒNG -->
                <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Lớp học sử dụng:</span>
                    <span class="text-indigo-600 font-bold">${assignedClasses.length} lớp</span>
                  </div>
                  ${assignedClasses.length === 0 ? `
                    <div class="text-xs text-slate-400 italic">Hiện chưa có lớp nào xếp vào phòng này.</div>
                  ` : `
                    <div class="space-y-1">
                      ${assignedClasses.slice(0, 2).map(ac => `
                        <div class="text-xs text-slate-700 flex items-center justify-between">
                          <span class="font-medium truncate max-w-[140px]">&bull; ${ac.title || ac.className}</span>
                          <span class="text-[10px] text-slate-400 font-mono">${ac.scheduleTime || ''}</span>
                        </div>
                      `).join('')}
                      ${assignedClasses.length > 2 ? `<div class="text-[10px] text-indigo-600 font-semibold mt-1">+${assignedClasses.length - 2} lớp khác...</div>` : ''}
                    </div>
                  `}
                </div>
              </div>

              <!-- ACTIONS -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button type="button" onclick="openDeleteRoomModal('${roomId}')" title="Xóa Phòng Tập" class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition flex items-center gap-1.5 text-xs font-bold">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  <span>Xóa Phòng</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * MODAL: TẠO PHÒNG TẬP MỚI (CONNECT VÀO POST /api/v1/rooms)
 */
export function renderCreateRoomModal() {
  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Thêm Phòng Tập Thể Thao Mới</h3>
            <p class="text-xs text-slate-500 mt-0.5">Khai báo phòng chức năng và sức chứa sàn tập</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreateRoomSubmit(event)" class="space-y-4 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Phòng Tập</label>
            <input type="text" id="new-room-name" required placeholder="Ví dụ: Studio D (Pilates & Core)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sức Chứa Tối Đa (Người)</label>
            <input type="number" id="new-room-capacity" required min="1" max="200" value="25" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Sẵn Sàng</label>
            <select id="new-room-status" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              <option value="AVAILABLE">AVAILABLE (Sẵn sàng hoạt động)</option>
              <option value="MAINTENANCE">MAINTENANCE (Đang bảo trì / Nâng cấp)</option>
            </select>
          </div>

          <div class="pt-3 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Hủy</button>
            <button type="submit" id="btn-submit-create-room" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Tạo Phòng Tập</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function handleCreateRoomSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = (document.getElementById('new-room-name')?.value || '').trim();
  const capacity = parseInt(document.getElementById('new-room-capacity')?.value, 10) || 25;
  const status = document.getElementById('new-room-status')?.value || 'AVAILABLE';

  if (!name) {
    showToast('Thiếu Thông Tin', 'Vui lòng nhập tên phòng tập!', 'warning');
    return false;
  }

  const payload = {
    roomName: name,
    capacity: capacity,
    status: status
  };

  const btn = document.getElementById('btn-submit-create-room');
  if (btn) { btn.disabled = true; btn.innerText = 'Đang Tạo...'; }

  try {
    await roomApi.create(payload);
    closeManagerModal();
    showToast('Thành Công', `Đã thêm phòng tập "${name}" lên máy chủ!`, 'success');
    await refreshManagerClassesFromApi();
  } catch (err) {
    console.warn('[handleCreateRoomSubmit] Error:', err.message);
    if (!appState.data) appState.data = {};
    if (!appState.data.rooms) appState.data.rooms = [];
    appState.data.rooms.push({
      roomId: 'RM' + (appState.data.rooms.length + 1),
      roomName: name,
      capacity: capacity,
      status: status
    });
    closeManagerModal();
    showToast('Đã Thêm Phòng', `Đã lưu phòng tập "${name}"!`, 'success');
    renderApp();
  }
  return false;
}

/**
 * MODAL: XÓA PHÒNG TẬP (CONNECT VÀO DELETE /api/v1/rooms/{id})
 */
export function renderDeleteRoomModal() {
  const roomId = appState.managerSelectedRoomForDelete;
  const rooms = (appState.data && appState.data.rooms) ? appState.data.rooms : [];
  const targetRoom = rooms.find(r => String(r.roomId || r.id) === String(roomId));

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-fade-in">
        <div class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </div>
        <h3 class="font-black text-base text-slate-900">Xác Nhận Xóa Phòng Tập?</h3>
        <p class="text-xs text-slate-500 mt-1">Phòng <strong>"${targetRoom?.roomName || targetRoom?.name || `#${roomId}`}"</strong> sẽ bị xóa khỏi cơ sở vật chất trung tâm.</p>

        <div class="mt-5 flex space-x-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Quay Lại</button>
          <button type="button" onclick="confirmDeleteRoom()" id="btn-confirm-delete-room" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Xác Nhận Xóa</button>
        </div>
      </div>
    </div>
  `;
}

export async function confirmDeleteRoom() {
  const roomId = appState.managerSelectedRoomForDelete;
  if (!roomId) return;

  const btn = document.getElementById('btn-confirm-delete-room');
  if (btn) { btn.disabled = true; btn.innerText = 'Đang Xóa...'; }

  try {
    await roomApi.delete(roomId);
    closeManagerModal();
    showToast('Đã Xóa Phòng', 'Đã xóa phòng tập thành công!', 'success');
    await refreshManagerClassesFromApi();
  } catch (err) {
    showToast('Lỗi Thao Tác', err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerText = 'Xác Nhận Xóa'; }
  }
}

/**
 * MODAL: TẠO LỚP HỌC MỚI (CONNECT VÀO POST /api/v1/classes)
 */
export function renderCreateClassModal() {
  const rooms = (appState.data && appState.data.rooms) ? appState.data.rooms : [];
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];
  const subjects = (appState.data && appState.data.subjects) ? appState.data.subjects : [];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  const defaultDateTimeStr = tomorrow.toISOString().slice(0, 16);

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Mở Lớp Học Thể Thao Mới</h3>
            <p class="text-xs text-slate-500 mt-0.5">Xếp lịch, phân công HLV và phòng tập</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreateClassSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Bộ Môn Thể Thao</label>
            <select id="new-class-subject-id" required class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${subjects.length > 0 ? subjects.map(s => `
                <option value="${s.subjectId || s.id}">${s.subjectName || s.name}</option>
              `).join('') : `
                <option value="1">YOGA CƠ BẢN</option>
                <option value="2">BOXING FITNESS</option>
                <option value="3">PILATES & CORE</option>
                <option value="4">GYM NÂNG CAO</option>
              `}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sức Chứa Tối Đa (Học viên)</label>
            <input type="number" id="new-class-cap" required min="1" max="100" value="20" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phòng Tập</label>
            <select id="new-class-room-id" required class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${rooms.length > 0 ? rooms.map(r => `
                <option value="${r.roomId || r.id}">${r.roomName || r.name} (${r.status || 'READY'})</option>
              `).join('') : `
                <option value="1">Studio A (Tầng 2)</option>
                <option value="2">Studio B (Tầng 3)</option>
                <option value="3">Phòng Boxing Ring</option>
              `}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Huấn Luyện Viên Phụ Trách</label>
            <select id="new-class-coach-id" required class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${coaches.length > 0 ? coaches.map(co => `
                <option value="${co.userId || co.coachId || co.id}">${co.name || `${co.firstName || ''} ${co.lastName || ''}`.trim()} - ${co.speciality || co.specialty || 'HLV'}</option>
              `).join('') : `
                <option value="2">Coach HLV Default</option>
              `}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Gian Khởi Đầu Lớp Học</label>
            <input type="datetime-local" id="new-class-time" required value="${defaultDateTimeStr}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            <p class="text-[11px] text-slate-400 mt-1">Yêu cầu thời gian trong tương lai theo quy chuẩn Backend.</p>
          </div>

          <div class="pt-3 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Hủy</button>
            <button type="submit" id="btn-submit-create-class" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Xác Nhận Tạo Lớp</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function handleCreateClassSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const subjectId = Number(document.getElementById('new-class-subject-id')?.value || 1);
  const roomId = Number(document.getElementById('new-class-room-id')?.value || 1);
  const coachId = Number(document.getElementById('new-class-coach-id')?.value || 2);
  const maxCapacity = parseInt(document.getElementById('new-class-cap')?.value, 10) || 20;
  const timeInput = document.getElementById('new-class-time')?.value;

  if (!timeInput) {
    showToast('Thiếu Thông Tin', 'Vui lòng chọn thời gian bắt đầu lớp học!', 'warning');
    return false;
  }

  let scheduleTime = timeInput;
  if (scheduleTime.length === 16) {
    scheduleTime += ':00';
  }

  const payload = {
    subjectId: subjectId,
    roomId: roomId,
    coachId: coachId,
    maxCapacity: maxCapacity,
    scheduleTime: scheduleTime
  };

  const submitBtn = document.getElementById('btn-submit-create-class');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang Tạo...';
  }

  try {
    await classApi.create(payload);
    closeManagerModal();
    showToast('Tạo Lớp Thành Công', 'Lớp học thể thao mới đã được xếp lịch trên máy chủ!', 'success');
    await refreshManagerClassesFromApi();
  } catch (err) {
    console.warn('[handleCreateClassSubmit] Backend create error:', err.message);
    
    if (!appState.data) appState.data = {};
    if (!appState.data.classes) appState.data.classes = [];
    const mockId = appState.data.classes.length + 1;
    appState.data.classes.unshift({
      classId: mockId,
      subjectId: subjectId,
      roomId: roomId,
      coachId: coachId,
      maxCapacity: maxCapacity,
      scheduleTime: scheduleTime,
      status: 'ACTIVE'
    });

    closeManagerModal();
    showToast('Đã Lưu Tạm', 'Đã lưu lớp học trên bộ nhớ tạm (Backend: ' + err.message + ')', 'warning');
    renderApp();
  }

  return false;
}

/**
 * MODAL: ĐỔI HUẤN LUYỆN VIÊN (CONNECT VÀO PUT /api/v1/classes/{classId}/coach/{coachId})
 */
export function renderAssignCoachModal() {
  const classId = appState.managerSelectedClassForCoach;
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const targetClass = classes.find(c => String(c.classId || c.id) === String(classId));
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Phân Công Huấn Luyện Viên</h3>
            <p class="text-xs text-slate-500 mt-0.5">Lớp: <strong class="text-indigo-600">${targetClass?.title || targetClass?.className || `#${classId}`}</strong></p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleAssignCoachSubmit(event)" class="space-y-4 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn Huấn Luyện Viên Mới</label>
            <select id="assign-coach-select" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${coaches.map(co => `
                <option value="${co.userId || co.coachId || co.id}">${co.name || `${co.firstName || ''} ${co.lastName || ''}`.trim()} - ${co.speciality || co.specialty || 'HLV'}</option>
              `).join('')}
            </select>
          </div>

          <div class="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-800">
            💡 Thao tác này sẽ cập nhật giáo án và lịch giảng dạy tương ứng trong hồ sơ của Huấn Luyện Viên được chọn.
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Hủy</button>
            <button type="submit" id="btn-submit-assign-coach" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function handleAssignCoachSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const classId = appState.managerSelectedClassForCoach;
  const coachId = Number(document.getElementById('assign-coach-select')?.value);

  if (!classId || !coachId) return false;

  const btn = document.getElementById('btn-submit-assign-coach');
  if (btn) { btn.disabled = true; btn.innerText = 'Đang Lưu...'; }

  // Kiểm tra nếu ID là chuỗi mock không phải số (ví dụ: 'CLS01')
  const isMockId = isNaN(Number(classId));

  if (isMockId) {
    // Cập nhật an toàn trên local mock state, tránh gửi String lên endpoint Long của Backend
    const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];
    const selectedCoach = coaches.find(co => Number(co.userId || co.coachId || co.id) === coachId);
    const coachName = selectedCoach ? (selectedCoach.name || `${selectedCoach.firstName || ''} ${selectedCoach.lastName || ''}`.trim()) : 'Huấn Luyện Viên';

    if (appState.data && appState.data.classes) {
      const targetClass = appState.data.classes.find(c => String(c.classId || c.id) === String(classId));
      if (targetClass) {
        targetClass.coachId = coachId;
        targetClass.coach = coachName;
        targetClass.coachName = coachName;
      }
    }
    closeManagerModal();
    showToast('Phân Công Thành Công', `Đã cập nhật HLV "${coachName}" cho lớp học!`, 'success');
    renderApp();
    return false;
  }

  try {
    await classApi.assignCoach(Number(classId), coachId);
    closeManagerModal();
    showToast('Phân Công Thành Công', 'Đã cập nhật Huấn Luyện Viên phụ trách lớp học!', 'success');
    await refreshManagerClassesFromApi();
  } catch (err) {
    showToast('Lỗi Thao Tác', err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerText = 'Lưu Thay Đổi'; }
  }
  return false;
}

/**
 * MODAL: XÓA / HỦY LỚP HỌC (CONNECT VÀO DELETE /api/v1/classes/{id})
 */
export function renderDeleteClassModal() {
  const classId = appState.managerSelectedClassForDelete;
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const targetClass = classes.find(c => String(c.classId || c.id) === String(classId));

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-fade-in">
        <div class="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 class="font-black text-base text-slate-900">Xác Nhận Hủy Lớp Học?</h3>
        <p class="text-xs text-slate-500 mt-1">Lớp <strong>"${targetClass?.title || targetClass?.className || `#${classId}`}"</strong> sẽ bị hủy và gỡ khỏi lịch tập.</p>

        <div class="mt-5 flex space-x-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Quay Lại</button>
          <button type="button" onclick="confirmDeleteClass()" id="btn-confirm-delete-class" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Hủy Lớp</button>
        </div>
      </div>
    </div>
  `;
}

export async function confirmDeleteClass() {
  const classId = appState.managerSelectedClassForDelete;
  if (!classId) return;

  const btn = document.getElementById('btn-confirm-delete-class');
  if (btn) { btn.disabled = true; btn.innerText = 'Đang Xóa...'; }

  const isMockId = isNaN(Number(classId));
  if (isMockId) {
    if (appState.data && appState.data.classes) {
      appState.data.classes = appState.data.classes.filter(c => String(c.classId || c.id) !== String(classId));
    }
    closeManagerModal();
    showToast('Đã Hủy Lớp', 'Đã hủy lớp học thành công!', 'success');
    renderApp();
    return;
  }

  try {
    await classApi.delete(Number(classId));
    closeManagerModal();
    showToast('Đã Hủy Lớp', 'Đã hủy và xóa lớp học thành công!', 'success');
    await refreshManagerClassesFromApi();
  } catch (err) {
    showToast('Lỗi Thao Tác', err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerText = 'Hủy Lớp'; }
  }
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerClasses = renderManagerClasses;
  _g.renderCreateClassModal = renderCreateClassModal;
  _g.handleCreateClassSubmit = handleCreateClassSubmit;
  _g.setManagerClassFilter = setManagerClassFilter;
  _g.setManagerClassSearch = setManagerClassSearch;
  _g.setManagerClassSubView = setManagerClassSubView;
  _g.refreshManagerClassesFromApi = refreshManagerClassesFromApi;
  _g.openAssignCoachModal = openAssignCoachModal;
  _g.renderAssignCoachModal = renderAssignCoachModal;
  _g.handleAssignCoachSubmit = handleAssignCoachSubmit;
  _g.openDeleteClassModal = openDeleteClassModal;
  _g.renderDeleteClassModal = renderDeleteClassModal;
  _g.confirmDeleteClass = confirmDeleteClass;
  _g.openCreateRoomModal = openCreateRoomModal;
  _g.renderCreateRoomModal = renderCreateRoomModal;
  _g.handleCreateRoomSubmit = handleCreateRoomSubmit;
  _g.openDeleteRoomModal = openDeleteRoomModal;
  _g.renderDeleteRoomModal = renderDeleteRoomModal;
  _g.confirmDeleteRoom = confirmDeleteRoom;
}
