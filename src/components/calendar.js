// =========================================================================
// MONTHLY CALENDAR ENGINE & SESSION DETAIL MODAL (SWP391 TOPIC 04)
// =========================================================================

function changeCalendarMonth(delta) {
  let m = appState.calendarMonth + delta;
  let y = appState.calendarYear;
  if (m < 0) { m = 11; y--; }
  else if (m > 11) { m = 0; y++; }
  appState.calendarMonth = m;
  appState.calendarYear = y;
  // Update selected date to 1st of month or maintain
  const daysInM = new Date(y, m + 1, 0).getDate();
  const currentDayNum = parseInt((appState.selectedCalendarDate || '2026-09-19').split('-')[2] || '1', 10);
  const safeDay = Math.min(daysInM, currentDayNum);
  appState.selectedCalendarDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
  renderApp();
}

function resetCalendarToToday() {
  appState.calendarYear = 2026;
  appState.calendarMonth = 8; // September
  appState.selectedCalendarDate = '2026-09-19';
  renderApp();
}

function selectCalendarDate(dateStr) {
  appState.selectedCalendarDate = dateStr;
  renderApp();
}

function openSessionDetail(classId, dateStr) {
  const raw = appState.data.classes.find(item => item.id === classId || item.classId === classId);
  if (raw) {
    const c = resolveClass(raw);
    appState.selectedSessionDetail = {
      ...c,
      sessionDate: dateStr || appState.selectedCalendarDate
    };
    renderApp();
  }
}

function closeSessionDetail() {
  appState.selectedSessionDetail = null;
  renderApp();
}

// Get sessions on a given date for a specific role
function getSessionsForDate(dateStr, role) {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dow = dateObj.getDay();
  const dowNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dowName = dowNames[dow];

  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const allClasses = rawClasses.map(c => resolveClass(c));
  
  if (role === 'MEMBER') {
    const member = (appState.data?.members || []).find(m => m.id === 'MEM101') || appState.data?.members?.[0];
    if (!member) return [];
    return allClasses.filter(c => {
      const isEnrolled = c.attendees && c.attendees.some(a => a.id === member.id);
      const isDayMatch = c.days && (c.days.includes(dowName) || (dowName === 'Thứ 4' && c.days.includes('4')) || (dowName === 'Thứ 6' && c.days.includes('6')));
      return isEnrolled && isDayMatch;
    });
  }

  if (role === 'COACH') {
    const coach = (appState.data?.coaches || []).find(c => c.id === 'COACH') || appState.data?.coaches?.[0];
    return allClasses.filter(c => {
      const isMyClass = c.coachId === 'COACH' || c.coachId === 'COA01' || (coach && c.coachId === coach.id);
      const isDayMatch = c.days && (c.days.includes(dowName) || (dowName === 'Thứ 4' && c.days.includes('4')) || (dowName === 'Thứ 6' && c.days.includes('6')));
      return isMyClass && isDayMatch;
    });
  }

  return allClasses.filter(c => c.days && c.days.includes(dowName));
}

// Render the Monthly Calendar Component
function renderMonthlyCalendarComponent(role) {
  const year = appState.calendarYear;
  const month = appState.calendarMonth;
  const selectedDate = appState.selectedCalendarDate || '2026-09-19';

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Number of days in month
  const numDays = new Date(year, month + 1, 0).getDate();
  // First day of week index (Monday = 0 ... Sunday = 6)
  let startCol = new Date(year, month, 1).getDay();
  startCol = (startCol === 0) ? 6 : startCol - 1;

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Category Dot Colors
  const dotColors = {
    'Yoga': 'bg-indigo-600',
    'Boxing': 'bg-orange-500',
    'Zumba': 'bg-pink-500',
    'Pilates': 'bg-teal-500',
    'default': 'bg-blue-600'
  };

  const daysHeader = ['T2 (Thứ 2)', 'T3 (Thứ 3)', 'T4 (Thứ 4)', 'T5 (Thứ 5)', 'T6 (Thứ 6)', 'T7 (Thứ 7)', 'CN (Chủ Nhật)'];

  // Count total sessions in this month
  let totalMonthSessions = 0;
  for (let d = 1; d <= numDays; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    totalMonthSessions += getSessionsForDate(dStr, role).length;
  }

  const sessionsToday = getSessionsForDate(selectedDate, role);

  return `
    <div class="space-y-6">
      <!-- Calendar Card Container -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <!-- Month Navigation Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-3">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ${monthNames[month]}, Năm ${year}
              </h2>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${totalMonthSessions} buổi ${role === 'COACH' ? 'dạy' : 'tập'}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              ${role === 'COACH' ? 'Lịch giảng dạy & phụ trách các lớp thể thao trong tháng' : 'Lịch tập các lớp học bạn đã đăng ký giữ chỗ'}
            </p>
          </div>

          <!-- Controls: Prev, Today, Next -->
          <div class="flex items-center space-x-2">
            <button type="button" onclick="changeCalendarMonth(-1)" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center w-8 h-8">
              &larr;
            </button>
            <button type="button" onclick="resetCalendarToToday()" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
              Hôm nay
            </button>
            <button type="button" onclick="changeCalendarMonth(1)" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center w-8 h-8">
              &rarr;
            </button>
          </div>
        </div>

        <!-- Legend: Dot Indicators -->
        <div class="flex items-center space-x-4 py-3 text-[11px] text-slate-600 border-b border-slate-100 flex-wrap gap-y-2">
          <span class="font-bold text-slate-400 uppercase text-[10px]">Chấm lịch theo bộ môn:</span>
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
            <span>Yoga</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>Boxing</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
            <span>Zumba</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
            <span>Pilates</span>
          </div>
          <span class="text-slate-400 italic text-[10px] ml-auto">* Bấm vào ngày có chấm để xem chi tiết ca tập</span>
        </div>

        <!-- Calendar Grid (7 Columns) -->
        <div class="mt-4">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            ${daysHeader.map(dh => `
              <div class="text-center py-2 font-black text-[11px] uppercase tracking-wider text-slate-400">
                ${dh}
              </div>
            `).join('')}
          </div>

          <!-- Days Cells -->
          <div class="grid grid-cols-7 gap-1 sm:gap-2">
            <!-- Padding previous month -->
            ${Array.from({ length: startCol }).map((_, i) => {
              const dayNum = prevMonthDays - startCol + i + 1;
              return `
                <div class="min-h-[72px] sm:min-h-[88px] p-2 bg-slate-50/50 rounded-2xl border border-transparent text-slate-300 flex flex-col justify-between select-none">
                  <span class="text-xs font-semibold">${dayNum}</span>
                </div>
              `;
            }).join('')}

            <!-- Current Month Days -->
            ${Array.from({ length: numDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = (selectedDate === dateStr);
              const isToday = (dateStr === '2026-09-19');
              const sessionsOnDay = getSessionsForDate(dateStr, role);
              const hasSessions = sessionsOnDay.length > 0;

              return `
                <div onclick="selectCalendarDate('${dateStr}')" class="min-h-[72px] sm:min-h-[88px] p-2 sm:p-2.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/30 shadow-xs' : (hasSessions ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50')}">
                  <!-- Date number & Today tag -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold ${isSelected ? 'text-indigo-700 font-black text-sm' : (isToday ? 'text-indigo-600 font-black' : (hasSessions ? 'text-slate-900' : 'text-slate-500'))}">
                      ${dayNum}
                    </span>
                    ${isToday ? `
                      <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white">Nay</span>
                    ` : ''}
                  </div>

                  <!-- Dot Indicators (Chấm lịch) -->
                  <div class="mt-1 flex flex-wrap items-center gap-1 min-h-[14px]">
                    ${hasSessions ? `
                      ${sessionsOnDay.map(s => {
                        const color = dotColors[s.category] || dotColors['default'];
                        return `<span class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${color} inline-block shadow-xs" title="${s.title} (${s.time})"></span>`;
                      }).join('')}
                      <span class="text-[9px] font-bold text-slate-500 ml-0.5">${sessionsOnDay.length > 1 ? sessionsOnDay.length : ''}</span>
                    ` : `
                      <span class="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Selected Day Session List & Quick Action -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Danh Sách Buổi Tập</div>
            <h3 class="text-lg font-black text-slate-900 mt-0.5">
              ${formatCalendarDateLabel(selectedDate)}
            </h3>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${sessionsToday.length > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'}">
            ${sessionsToday.length} Ca Tập
          </span>
        </div>

        ${sessionsToday.length === 0 ? `
          <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div class="text-xs font-bold text-slate-400">Không có lịch tập nào trong ngày này.</div>
            <p class="text-[11px] text-slate-400 mt-1">Hãy nhấp vào các ngày có chấm tròn trên lịch để xem ca tập!</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${sessionsToday.map(s => {
              const member = (appState.data?.members || []).find(m => m.id === 'MEM101') || appState.data?.members?.[0];
              const att = (s.attendees || []).find(a => a.id === member?.id);
              return `
                <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-400 transition shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div class="flex justify-between items-start">
                      <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                        ${s.category}
                      </span>
                      <span class="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        ${s.time}
                      </span>
                    </div>

                    <h4 class="font-black text-base text-slate-900 mt-3">${s.title}</h4>

                    <div class="text-xs text-slate-500 mt-1.5 space-y-1">
                      <div>Phòng: <strong class="text-slate-800">${s.room}</strong></div>
                      <div>HLV: <strong class="text-indigo-600">${s.coachName}</strong> &bull; Sĩ số: <strong class="text-slate-800">${(s.attendees || []).length}/${s.maxCapacity}</strong></div>
                    </div>

                    ${role === 'MEMBER' && att?.note ? `
                      <div class="mt-2.5 p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                        <span class="font-bold text-amber-700">Lời khuyên HLV:</span> ${att.note}
                      </div>
                    ` : ''}
                  </div>

                  <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                    ${role === 'MEMBER' ? `
                      <span class="text-[11px] font-bold ${att?.attended ? 'text-emerald-700' : 'text-amber-700'}">
                        ${att?.attended ? '&check; Đã có mặt' : '&bull; Đã giữ chỗ'}
                      </span>
                    ` : `
                      <span class="text-[11px] font-bold text-indigo-700">
                        ${(s.attendees || []).filter(a => a.attended).length}/${(s.attendees || []).length} Có mặt
                      </span>
                    `}

                    <button type="button" onclick="openSessionDetail('${s.id}', '${selectedDate}')" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
                      Chi Tiết Buổi Tập &rarr;
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function formatCalendarDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const dowNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${dowNames[d.getDay()]}, Ngày ${day}/${month}/${year}`;
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof changeCalendarMonth !== 'undefined') _targetGlobal.changeCalendarMonth = changeCalendarMonth;
  if (typeof resetCalendarToToday !== 'undefined') _targetGlobal.resetCalendarToToday = resetCalendarToToday;
  if (typeof selectCalendarDate !== 'undefined') _targetGlobal.selectCalendarDate = selectCalendarDate;
  if (typeof openSessionDetail !== 'undefined') _targetGlobal.openSessionDetail = openSessionDetail;
  if (typeof closeSessionDetail !== 'undefined') _targetGlobal.closeSessionDetail = closeSessionDetail;
  if (typeof getSessionsForDate !== 'undefined') _targetGlobal.getSessionsForDate = getSessionsForDate;
  if (typeof renderMonthlyCalendarComponent !== 'undefined') _targetGlobal.renderMonthlyCalendarComponent = renderMonthlyCalendarComponent;
  if (typeof formatCalendarDateLabel !== 'undefined') _targetGlobal.formatCalendarDateLabel = formatCalendarDateLabel;
}
