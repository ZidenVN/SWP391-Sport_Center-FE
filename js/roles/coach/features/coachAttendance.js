// =========================================================================
// COACH FEATURE: DAILY SCHEDULE & CLASS ATTENDANCE
// =========================================================================

export function selectCoachClass(classId) {
  const c = (appState.data.classes || []).find(item => item.id === classId);
  if (c) {
    appState.selectedClassForBooking = c;
    renderApp();
  }
}

export function toggleStudentAttendance(classId, studentId) {
  const c = (appState.data.classes || []).find(item => item.id === classId);
  if (c && c.attendees) {
    const student = c.attendees.find(s => s.id === studentId);
    if (student) {
      student.attended = !student.attended;
      if (!appState.data.classAttendances) appState.data.classAttendances = [];
      const attId = 'ATT_' + classId + '_' + studentId;
      const existing = appState.data.classAttendances.find(a => a.id === attId || (a.classId === classId && a.memberId === studentId));
      if (existing) {
        existing.status = student.attended ? 'PRESENT' : 'ABSENT';
      } else {
        appState.data.classAttendances.push({
          attendanceId: attId,
          id: attId,
          classId: classId,
          memberId: studentId,
          date: '2026-09-19',
          status: student.attended ? 'PRESENT' : 'ABSENT'
        });
      }
      renderApp();
    }
  }
}

export function updateStudentNote(classId, studentId, note) {
  const c = (appState.data.classes || []).find(item => item.id === classId);
  if (c && c.attendees) {
    const student = c.attendees.find(s => s.id === studentId);
    if (student) {
      student.note = note;
    }
  }
}

export function saveClassAttendance(classId) {
  const c = (appState.data.classes || []).find(item => item.id === classId);
  if (!c) return;

  const resolved = resolveClass(c);
  const presentCount = (c.attendees || []).filter(s => s.attended).length;
  const total = (c.attendees || []).length;

  recordAuditLog('CLASS_ATTENDANCE', 'ClassAttendances', `HLV lưu điểm danh lớp ${resolved.title} (${classId}): ${presentCount}/${total} học viên có mặt`, 'coach@sportscenter.vn');
  showToast('Điểm Danh Hoàn Tất', `Đã lưu kết quả điểm danh lớp ${resolved.title}: ${presentCount}/${total} học viên!`, 'success');
}

export function renderCoachTodayMode(rawCoachClasses, selectedClass, attendees) {
  const coachClasses = (rawCoachClasses || []).map(c => resolveClass(c));
  const resolvedSelected = selectedClass ? resolveClass(selectedClass) : coachClasses[0];
  const resolvedAttendees = resolvedSelected?.attendees || attendees || [];

  return `
    <div class="space-y-6">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Các Ca Dạy Phụ Trách Hôm Nay</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${coachClasses.map(c => `
            <div onclick="selectCoachClass('${c.id}')" class="p-5 rounded-2xl border cursor-pointer transition ${resolvedSelected?.id === c.id ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}">
              <div class="flex justify-between items-start">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">${c.category}</span>
                <span class="text-xs font-extrabold text-slate-800">${c.scheduleTime || c.time}</span>
              </div>
              <h3 class="font-black text-sm text-slate-900 mt-2">${c.title}</h3>
              <div class="text-xs text-slate-500 mt-1">${c.room} &bull; Sĩ số: <strong class="text-slate-900">${c.bookedSeats}/${c.maxCapacity} học viên</strong></div>
            </div>
          `).join('')}
        </div>
      </div>

      ${resolvedSelected ? `
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Bảng Điểm Danh Lớp</span>
              <h2 class="text-xl font-black text-slate-900 mt-0.5">${resolvedSelected.title}</h2>
              <p class="text-xs text-slate-500 mt-0.5">${resolvedSelected.time} &bull; ${resolvedSelected.room} &bull; Danh sách ${resolvedAttendees.length} học viên đăng ký</p>
            </div>

            <button type="button" onclick="saveClassAttendance('${resolvedSelected.id}')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition">
              Lưu Bảng Điểm Danh
            </button>
          </div>

          <div class="space-y-3">
            ${resolvedAttendees.map(st => `
              <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div class="font-bold text-sm text-slate-900">${st.name}</div>
                  <div class="text-xs text-slate-500 mt-0.5">SĐT: ${st.phone} &bull; Mã: ${st.id}</div>
                </div>

                <div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <input type="text" placeholder="Ghi chú thể lực / mức tạ..." value="${st.note || ''}" onchange="updateStudentNote('${resolvedSelected.id}', '${st.id}', this.value)" class="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600" />
                  
                  <button type="button" onclick="toggleStudentAttendance('${resolvedSelected.id}', '${st.id}')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${st.attended ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}">
                    ${st.attended ? 'CÓ MẶT' : 'VẮNG MẶT'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderCoachWeekMode(allClasses) {
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Thời Khóa Biểu Giảng Dạy Tuần & Tháng</h2>
          <p class="text-xs text-slate-500 mt-0.5">Lịch tháng hiển thị toàn bộ ca phụ trách theo ngày có chấm chỉ báo. Bấm vào ngày để xem danh sách và điểm danh.</p>
        </div>
      </div>

      ${typeof renderMonthlyCalendarComponent === 'function' ? renderMonthlyCalendarComponent('COACH') : ''}
    </div>
  `;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.selectCoachClass = selectCoachClass;
  _g.toggleStudentAttendance = toggleStudentAttendance;
  _g.updateStudentNote = updateStudentNote;
  _g.saveClassAttendance = saveClassAttendance;
  _g.renderCoachTodayMode = renderCoachTodayMode;
  _g.renderCoachWeekMode = renderCoachWeekMode;
}
