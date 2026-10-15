// =========================================================================
// MANAGER FEATURE: CLASSES & ROOMS SCHEDULER
// =========================================================================

export function renderManagerClasses() {
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Quản Lý Lớp Học & Phòng Tập</h2>
          <p class="text-xs text-slate-500 mt-1">Sắp xếp thời khóa biểu, phân công phòng tập và huấn luyện viên đứng lớp.</p>
        </div>

        <button type="button" onclick="openManagerModal('CREATE_CLASS')" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Mở Lớp Học Mới</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${classes.map(c => {
          const res = resolveClass(c);
          return `
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div class="flex justify-between items-start">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                    ${res.category}
                  </span>
                  <span class="text-xs font-bold text-indigo-600">${res.scheduleTime || '18:00 - 19:30'}</span>
                </div>

                <div class="mt-3">
                  <h3 class="text-base font-black text-slate-900">${res.title}</h3>
                  <div class="text-xs text-slate-500 mt-1">Phòng: <strong>${res.room}</strong> &bull; HLV: <strong class="text-indigo-600">${res.coach}</strong></div>
                </div>

                <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span class="text-slate-500">Sĩ số học viên:</span>
                  <span class="font-bold text-slate-900">${res.enrolled}/${res.capacity} Học Viên</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex space-x-2">
                <button type="button" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Chi Tiết Lịch</button>
                <button type="button" class="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition">Đổi HLV</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function renderCreateClassModal() {
  const rooms = (appState.data && appState.data.rooms) ? appState.data.rooms : [];
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];

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
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Lớp Học</label>
            <input type="text" id="new-class-name" required placeholder="Ví dụ: Lớp Yoga Cơ Bản Ca Sáng" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Bộ Môn</label>
              <select id="new-class-cat" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
                <option value="YOGA">YOGA</option>
                <option value="BOXING">BOXING</option>
                <option value="GYM">GYM</option>
                <option value="CARDIO">CARDIO</option>
                <option value="PILATES">PILATES</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sức Chứa Tối Đa</label>
              <input type="number" id="new-class-cap" required value="20" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phòng Tập</label>
            <select id="new-class-room" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              ${rooms.map(r => `<option value="${r.roomId}">${r.roomName} (${r.status || 'READY'})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Huấn Luyện Viên Phụ Trách</label>
            <select id="new-class-coach" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              ${coaches.map(co => `<option value="${co.coachId}">${co.name} - ${co.specialty}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Gian Học</label>
            <input type="text" id="new-class-time" required value="18:00 - 19:30" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Tạo Lớp Học</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function handleCreateClassSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = (document.getElementById('new-class-name')?.value || '').trim();
  const cat = document.getElementById('new-class-cat')?.value || 'YOGA';
  const cap = parseInt(document.getElementById('new-class-cap')?.value, 10) || 20;
  const roomId = document.getElementById('new-class-room')?.value;
  const coachId = document.getElementById('new-class-coach')?.value;
  const scheduleTime = document.getElementById('new-class-time')?.value || '18:00 - 19:30';

  if (!name || cap <= 0) {
    showToast('Thiếu Thông Tin', 'Vui lòng nhập tên lớp và sức chứa hợp lệ!', 'warning');
    return false;
  }

  if (!appState.data) appState.data = {};
  if (!appState.data.classes) appState.data.classes = [];

  const newClassId = 'CLS0' + (appState.data.classes.length + 1);
  const newClass = {
    classId: newClassId,
    className: name,
    subjectId: 'SUB_' + cat,
    category: cat,
    roomId: roomId,
    coachId: coachId,
    scheduleTime: scheduleTime,
    maxCapacity: cap,
    status: 'ACTIVE'
  };

  appState.data.classes.push(newClass);

  if (!appState.data.classPlans) appState.data.classPlans = [];
  appState.data.classPlans.push({
    classPlanId: 'CP0' + (appState.data.classPlans.length + 1),
    classId: newClassId,
    content: 'Khởi động kéo giãn (10p) - Kỹ thuật chuyên sâu (45p) - Phục hồi (15p)',
    createDate: '2026-09-19'
  });

  const resolved = resolveClass(newClass);

  recordAuditLog('CREATE_CLASS', 'Classes', `Quản lý xếp lớp ${resolved.title} (${newClassId}) tại ${resolved.room}`, 'manager@sportscenter.vn');
  addNotification('Lớp Học Mới Được Mở', `Lớp học "${resolved.title}" đã được xếp lịch tại phòng ${resolved.room}.`, 'CLASS', newClassId);

  closeManagerModal();
  showToast('Tạo Lớp Học Thành Công', `Đã tạo lớp ${resolved.title} tại phòng ${resolved.room}!`, 'success');
  renderApp();
  return false;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerClasses = renderManagerClasses;
  _g.renderCreateClassModal = renderCreateClassModal;
  _g.handleCreateClassSubmit = handleCreateClassSubmit;
}
