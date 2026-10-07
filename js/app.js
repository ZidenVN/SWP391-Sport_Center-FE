
// =========================================================================
// ERD RELATIONAL RESOLVERS (Resolves foreign keys strictly per ERD)
// =========================================================================

function resolveMember(m) {
  if (!m) return null;
  const memberId = m.memberId || m.id || 'MEM101';
  const data = (typeof appState !== 'undefined' && appState.data) ? appState.data : (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA : {});
  const subscriptions = data.subscriptions || (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.subscriptions : []) || [];
  const packages = data.packages || (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.packages : []) || [];

  // Link Member with Subscriptions table
  const memberSubs = subscriptions.filter(s => s.memberId === memberId);
  const activeSub = memberSubs.find(s => s.status === 'ACTIVE') || memberSubs[0];

  let pkg = null;
  if (activeSub) {
    pkg = packages.find(p => (p.packageId || p.id) === activeSub.packageId);
  }
  if (!pkg && m.packageId) {
    pkg = packages.find(p => (p.packageId || p.id) === m.packageId);
  }

  const packageName = (pkg ? (pkg.packageName || pkg.name) : null) || m.activePackage || 'Standard Gym & Cardio';
  const startDate = (activeSub ? activeSub.startDate : null) || m.startDate || '2026-08-01';
  const endDate = (activeSub ? activeSub.endDate : null) || m.endDate || '2026-11-01';
  const status = m.status || (activeSub ? activeSub.status : 'ACTIVE');

  let fullName = m.name;
  if (!fullName) {
    if (m.lastName || m.firstName) {
      fullName = `${m.lastName || ''} ${m.firstName || ''}`.trim();
    } else {
      fullName = 'Hội viên';
    }
  }

  const defaultAvatars = {
    MEM101: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    MEM102: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    MEM103: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    MEM104: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  };
  const avatar = m.avatar || defaultAvatars[memberId] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const defaultPhones = {
    MEM101: '0912345678',
    MEM102: '0987654321',
    MEM103: '0905123987',
    MEM104: '0934567890'
  };
  const phone = m.phone || defaultPhones[memberId] || '0912345678';

  const defaultInbody = {
    MEM101: { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 },
    MEM102: { weight: 72, height: 175, bodyFat: 17.0, muscleMass: 35.8, bmi: 23.5 },
    MEM103: { weight: 49, height: 158, bodyFat: 23.0, muscleMass: 21.0, bmi: 19.6 },
    MEM104: { weight: 78, height: 180, bodyFat: 15.5, muscleMass: 40.2, bmi: 24.1 }
  };
  const inbody = m.inbody || defaultInbody[memberId] || { weight: 60, height: 168, bodyFat: 18.0, muscleMass: 30.0, bmi: 21.0 };

  return {
    ...m,
    id: memberId,
    memberId: memberId,
    name: fullName,
    firstName: m.firstName || fullName.split(' ').slice(-1)[0] || '',
    lastName: m.lastName || fullName.split(' ').slice(0, -1).join(' ') || '',
    email: m.email || `${memberId.toLowerCase()}@sportscenter.vn`,
    phone: phone,
    avatar: avatar,
    activePackage: packageName,
    packageId: activeSub ? activeSub.packageId : (pkg ? (pkg.packageId || pkg.id) : 'PKG01'),
    startDate: startDate,
    endDate: endDate,
    status: status,
    trainingGoal: m.trainingGoal || 'Rèn luyện sức khỏe và thể lực dẻo dai',
    inbody: inbody
  };
}

const SUBJECT_IMAGE_MAP = {
  SUB01: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80', // Yoga
  SUB02: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80', // Boxing
  SUB03: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80', // Zumba
  SUB04: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80'  // Pilates
};

function resolveClass(c) {
  if (!c) return null;
  const classId = c.classId || c.id;
  const data = (typeof appState !== 'undefined' && appState.data) ? appState.data : (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA : {});
  const subjects = data.subjects || [];
  const rooms = data.rooms || [];
  const coaches = data.coaches || [];
  const classPlans = data.classPlans || [];
  const classEnrollments = data.classEnrollments || [];
  const classAttendances = data.classAttendances || [];
  const workoutResults = data.workoutResults || [];
  const members = data.members || [];

  const sub = subjects.find(s => s.subjectId === c.subjectId || s.id === c.subjectId || s.subjectName === c.category) || {
    subjectId: c.subjectId || 'SUB01',
    subjectName: c.category || 'Thể Thao',
    description: 'Lớp học rèn luyện thể lực và sức khỏe'
  };

  const rm = rooms.find(r => r.roomId === c.roomId || r.id === c.roomId || r.roomName === c.room || r.name === c.room) || {
    roomId: c.roomId || 'RM01',
    roomName: c.room || 'Phòng Studio A',
    capacity: c.maxCapacity || 20
  };

  const co = coaches.find(ch => ch.coachId === c.coachId || ch.id === c.coachId) || {
    coachId: c.coachId || 'COACH',
    name: c.coachName || 'Trần Hoàng Nam',
    specialty: 'Huấn luyện viên chuyên nghiệp'
  };

  const plan = classPlans.find(p => p.classId === classId) || {
    content: sub.description || 'Khởi động (10p) - Bài tập chính (45p) - Phục hồi (15p)'
  };

  const enrollments = classEnrollments.filter(e => e.classId === classId && e.status !== 'CANCELLED');
  const attendees = enrollments.map(enr => {
    const rawMem = members.find(m => (m.memberId || m.id) === enr.memberId);
    const mem = resolveMember(rawMem) || { name: 'Học viên', phone: '0912345678', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' };
    const attRecord = classAttendances.find(a => a.classEnrollmentId === enr.classEnrollmentId || (a.classId === classId && a.memberId === enr.memberId));
    const resRecord = workoutResults.find(w => w.memberId === enr.memberId && w.classId === classId);
    return {
      id: enr.memberId,
      enrollmentId: enr.classEnrollmentId,
      name: mem.name,
      phone: mem.phone,
      avatar: mem.avatar,
      attended: attRecord ? (attRecord.status === 'PRESENT' || attRecord.status === true) : false,
      note: resRecord ? resRecord.coachFeedback : (attRecord?.note || '')
    };
  });

  const scheduleTime = c.scheduleTime || 'Thứ 2, 4, 6 | 07:00 - 08:15';
  const parts = scheduleTime.split('|');
  const daysPart = parts[0] ? parts[0].trim() : 'Thứ 2, 4, 6';
  const timePart = parts[1] ? parts[1].trim() : (c.time || '07:00 - 08:15');

  const image = c.image || SUBJECT_IMAGE_MAP[sub.subjectId] || SUBJECT_IMAGE_MAP.SUB01;

  return {
    // Exact ERD attributes on Classes entity
    classId: classId,
    id: classId,
    subjectId: sub.subjectId,
    roomId: rm.roomId,
    coachId: co.coachId,
    scheduleTime: scheduleTime,
    maxCapacity: c.maxCapacity || 20,
    status: c.status || 'ACTIVE',

    // Relational attributes resolved from foreign keys
    category: sub.subjectName,
    subjectName: sub.subjectName,
    title: `${sub.subjectName} (${timePart})`,
    description: sub.description,
    syllabus: plan.content,
    room: rm.roomName || rm.name,
    roomName: rm.roomName || rm.name,
    coachName: co.name || `${co.firstName || ''} ${co.lastName || ''}`.trim(),
    coachSpecialty: co.specialty,
    days: daysPart,
    time: timePart,
    image: image,
    bookedSeats: enrollments.length,
    bookedCount: enrollments.length,
    attendees: attendees
  };
}


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

// =========================================================================
// SESSION DETAIL MODAL (TRANG CHI TIẾT BUỔI TẬP)
// =========================================================================
function renderSessionDetailModal() {
  const s = appState.selectedSessionDetail;
  if (!s) return '';

  const role = appState.currentRole;
  const member = (appState.data?.members || []).find(m => m.id === 'MEM101') || appState.data?.members?.[0];
  const myAtt = (s.attendees || []).find(a => a.id === member?.id);
  const attendees = s.attendees || [];

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <div class="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 mb-1">
              ${s.category}
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">${s.title}</h2>
            <div class="text-xs text-slate-500 mt-1">
              Thời gian: <strong class="text-slate-800">${s.time}</strong> &bull; Ngày: <strong class="text-indigo-600">${formatCalendarDateLabel(s.sessionDate)}</strong>
            </div>
          </div>
          <button type="button" onclick="closeSessionDetail()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1 leading-none">&times;</button>
        </div>

        <!-- Session Header Details (Strict ERD: ScheduleTime & Room) -->
        <div class="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Khung Giờ Đào Tạo</div>
            <div class="text-lg font-black mt-0.5">${s.scheduleTime || s.time}</div>
          </div>
          <div class="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10">
            Phòng: ${s.room}
          </div>
        </div>

        <!-- Key Session Info Grid -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="text-slate-400 font-semibold block uppercase text-[10px]">Huấn luyện viên</span>
            <span class="font-extrabold text-slate-900 mt-0.5 block">${s.coachName}</span>
            <span class="text-slate-500 text-[10px]">Chứng chỉ quốc tế</span>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="text-slate-400 font-semibold block uppercase text-[10px]">Sức chứa lớp</span>
            <span class="font-extrabold text-slate-900 mt-0.5 block">${s.bookedSeats || attendees.length} / ${s.maxCapacity} học viên</span>
            <span class="text-emerald-600 font-bold text-[10px]">${(s.maxCapacity - (s.bookedSeats || attendees.length))} chỗ trống</span>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="text-slate-400 font-semibold block uppercase text-[10px]">Trạng thái buổi tập</span>
            <span class="font-extrabold text-indigo-700 mt-0.5 block">Đang hoạt động</span>
            <span class="text-slate-500 text-[10px]">${s.days}</span>
          </div>
        </div>

        <!-- Session Syllabus / Giáo Án Buổi Tập -->
        <div class="mt-5 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Giáo Án & Mục Tiêu Buổi Tập</h4>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">${s.description}</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-100/60 text-[11px] text-slate-600">
            <div>&bull; <strong>Khởi động:</strong> Kéo giãn & nhịp thở (10p)</div>
            <div>&bull; <strong>Chính:</strong> Kỹ thuật & đốt mỡ (45p)</div>
            <div>&bull; <strong>Phục hồi:</strong> Thả lỏng cơ Savasana (15p)</div>
          </div>
        </div>

        <!-- Role-Specific Operations -->
        ${role === 'MEMBER' ? `
          <div class="mt-5 p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-900">Trạng Thái Của Bạn</h4>
              <span class="px-3 py-1 rounded-full text-xs font-bold ${myAtt?.attended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                ${myAtt?.attended ? 'Đã điểm danh có mặt' : 'Đã xác nhận giữ chỗ'}
              </span>
            </div>

            ${myAtt?.note ? `
              <div class="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span class="font-extrabold text-amber-800 uppercase text-[10px] block mb-1">Lời khuyên & Đánh giá từ HLV:</span>
                "${myAtt.note}"
              </div>
            ` : ''}

            <div class="text-xs text-slate-500">
              * Vui lòng mang thảm cá nhân, nước uống và đến phòng tập trước 10 phút để chuẩn bị.
            </div>
          </div>
        ` : ''}

        ${role === 'COACH' ? `
          <div class="mt-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-900">Bảng Điểm Danh Học Viên</h4>
                <div class="text-[11px] text-slate-500">Tích chọn Có mặt/Vắng mặt và nhập nhận xét thể lực</div>
              </div>
              <button type="button" onclick="saveClassAttendance('${s.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition">
                Lưu Điểm Danh
              </button>
            </div>

            <div class="space-y-2.5 max-h-60 overflow-y-auto">
              ${attendees.map(st => `
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div class="font-bold text-xs text-slate-900">${st.name}</div>
                    <div class="text-[10px] text-slate-500">SĐT: ${st.phone} &bull; Mã: ${st.id}</div>
                  </div>

                  <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <input type="text" placeholder="Ghi chú thể lực..." value="${st.note || ''}" onchange="updateStudentNote('${s.id}', '${st.id}', this.value)" class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600 w-44" />
                    <button type="button" onclick="toggleStudentAttendance('${s.id}', '${st.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${st.attended ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}">
                      ${st.attended ? 'CÓ MẶT' : 'VẮNG'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Modal Footer Actions -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          ${role === 'MEMBER' && myAtt ? `
            <button type="button" onclick="cancelMemberBooking('${s.id}'); closeSessionDetail();" class="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition">
              Hủy Đặt Chỗ Buổi Này
            </button>
          ` : `
            <div></div>
          `}

          <button type="button" onclick="closeSessionDetail()" class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">
            Đóng Chi Tiết
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sports Center Management System (SWP391 - FA26 Topic 4)
 * Production-Grade Web Application Architecture
 * Aligned with ERD.jpg, SDD, and Frontend Craftsman Standards
 */

const DEFAULT_DATA = {
  demoAccounts: [
    {
      role: 'MANAGER',
      roleLabel: 'Center Manager (Quản lý Admin)',
      email: 'manager@sportscenter.vn',
      password: '123',
      name: 'Nguyễn Văn Quản Lý',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      desc: 'Toàn quyền quản trị nhân sự, gói tập, phòng tập và doanh thu'
    },
    {
      role: 'RECEPTIONIST',
      roleLabel: 'Receptionist (Lễ tân Quầy POS & Cổng)',
      email: 'letan@sportscenter.vn',
      password: '123',
      name: 'Lê Ngọc Lễ Tân',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      desc: 'Quét thẻ check-in cổng, bán gói POS & tra cứu hội viên tại quầy'
    },
    {
      role: 'COACH',
      roleLabel: 'Coach (Huấn luyện viên)',
      email: 'coach.nam@sportscenter.vn',
      password: '123',
      name: 'Trần Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      desc: 'Lịch dạy trong tuần, điểm danh lớp học & theo dõi thể lực học viên'
    },
    {
      role: 'MEMBER',
      roleLabel: 'Member (Hội viên Khách hàng)',
      email: 'trang.pham@gmail.com',
      password: '123',
      name: 'Phạm Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Khám phá lớp, đặt chỗ trước, mua gói tập & theo dõi tiến trình InBody'
    }
  ],
  packages: [
    {
      id: 'PKG01',
      name: 'Standard Gym & Cardio',
      durationDays: 30,
      price: 650000,
      description: 'Truy cập không giới hạn khu vực Gym & Cardio từ 6h00 đến 22h00 hàng ngày.',
      features: ['Tập luyện tự do toàn bộ máy Gym & Cardio', 'Tủ đồ thông minh & phòng tắm nóng lạnh', 'Đo InBody kiểm tra thể trạng 1 lần/tháng', 'Nước uống lọc tinh khiết miễn phí'],
      popular: false
    },
    {
      id: 'PKG02',
      name: 'VIP All-Access Pass',
      durationDays: 90,
      price: 2450000,
      description: 'Gói toàn diện Gym + tất cả các lớp Yoga, Zumba, Boxing và xông hơi Sauna.',
      features: ['Không giới hạn Gym + Yoga + Boxing + Zumba', 'Miễn phí phòng xông hơi khô & ướt Sauna', 'Khăn tập & tủ đồ VIP riêng biệt', 'Tặng 2 buổi kèm 1-1 cùng HLV chuyên nghiệp'],
      popular: true
    },
    {
      id: 'PKG03',
      name: 'Yoga & Pilates Master',
      durationDays: 30,
      price: 1200000,
      description: 'Dành riêng cho tín đồ Yoga, Thiền định và Pilates cùng giáo viên chứng chỉ quốc tế.',
      features: ['20 lớp Yoga & Pilates chuyên sâu/tháng', 'Thảm tập cao cấp kháng khuẩn chuẩn bị sẵn', 'Trà thảo mộc thanh lọc cơ thể sau buổi tập', 'Ưu tiên giữ chỗ lớp giờ cao điểm'],
      popular: false
    },
    {
      id: 'PKG04',
      name: 'Personal Training (PT 1-1) 12 Buổi',
      durationDays: 45,
      price: 4800000,
      description: 'Kèm riêng 1-1 cùng HLV cá nhân, thiết kế giáo án dinh dưỡng và thể lực riêng biệt.',
      features: ['12 buổi kèm 1-1 (60 phút/buổi)', 'Lên thực đơn & bài tập cá nhân hóa 100%', 'Theo dõi chỉ số InBody & vòng đo hàng tuần', 'Cam kết đạt mục tiêu thể hình theo lộ trình'],
      popular: false
    }
  ],
  members: [
    {
      id: 'MEM101',
      name: 'Phạm Thu Trang',
      email: 'trang.pham@gmail.com',
      phone: '0912345678',
      gender: 'Nữ',
      activePackage: 'VIP All-Access Pass',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE',
      trainingGoal: 'Giảm mỡ, tăng độ dẻo dai cơ thể',
      inbody: { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM102',
      name: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@gmail.com',
      phone: '0987654321',
      gender: 'Nam',
      activePackage: 'Standard Gym & Cardio',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE',
      trainingGoal: 'Tăng cơ, cải thiện sức mạnh ngực & vai',
      inbody: { weight: 72, height: 175, bodyFat: 17.0, muscleMass: 35.8, bmi: 23.5 },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM103',
      name: 'Hoàng Minh Châu',
      email: 'chau.hoang@gmail.com',
      phone: '0905123987',
      gender: 'Nữ',
      activePackage: 'Yoga & Pilates Master',
      packageId: 'PKG03',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'EXPIRED',
      trainingGoal: 'Chữa đau mỏi cổ vai gáy và thiền định',
      inbody: { weight: 49, height: 158, bodyFat: 23.0, muscleMass: 21.0, bmi: 19.6 },
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM104',
      name: 'Vũ Quốc Bảo',
      email: 'bao.vu@gmail.com',
      phone: '0934567890',
      gender: 'Nam',
      activePackage: 'Personal Training (PT 1-1) 12 Buổi',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE',
      trainingGoal: 'Tập cường độ cao, rèn phản xạ Boxing',
      inbody: { weight: 78, height: 180, bodyFat: 15.5, muscleMass: 40.2, bmi: 24.1 },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  coaches: [
    {
      id: 'COACH',
      name: 'Trần Hoàng Nam',
      email: 'coach.nam@sportscenter.vn',
      phone: '0966778899',
      specialty: 'Boxing, Kickfit & Vinyasa Yoga',
      experience: '7 năm giảng dạy',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 3
    },
    {
      id: 'COACH_02',
      name: 'Nguyễn Hà My',
      email: 'hamy.nguyen@sportscenter.vn',
      phone: '0944556677',
      specialty: 'Zumba Dance & Aerobic Fitness',
      experience: '5 năm giảng dạy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 2
    },
    {
      id: 'COACH_03',
      name: 'Lý Kim Ngân',
      email: 'kimngan.ly@sportscenter.vn',
      phone: '0911223344',
      specialty: 'Pilates Reformer & Phục hồi chức năng',
      experience: '6 năm giảng dạy quốc tế',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 2
    }
  ],
  subjects: [
    { subjectId: 'SUB01', subjectName: 'Yoga', description: 'Rèn luyện sự dẻo dai, nhịp thở và cân bằng thân tâm' },
    { subjectId: 'SUB02', subjectName: 'Boxing', description: 'Đốt mỡ cường độ cao, phản xạ tự vệ và rèn luyện thể lực' },
    { subjectId: 'SUB03', subjectName: 'Zumba', description: 'Vũ đạo sôi động trên nền nhạc Latin, giải tỏa căng thẳng' },
    { subjectId: 'SUB04', subjectName: 'Pilates', description: 'Tăng cường sức mạnh cơ trọng tâm, điều chỉnh tư thế cột sống' }
  ],
  rooms: [
    { roomId: 'RM01', roomName: 'Studio A (Yoga & Pilates)', capacity: 20, status: 'AVAILABLE' },
    { roomId: 'RM02', roomName: 'Ring Room B (Boxing & Combat)', capacity: 15, status: 'AVAILABLE' },
    { roomId: 'RM03', roomName: 'Main Gym Floor (Cardio & Tạ)', capacity: 40, status: 'AVAILABLE' },
    { roomId: 'RM04', roomName: 'Studio C (Pilates Reformer)', capacity: 12, status: 'AVAILABLE' }
  ],
  // STRICT ERD (Classes table: ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status)
  classes: [
    {
      classId: 'CLS01',
      id: 'CLS01',
      subjectId: 'SUB01',
      roomId: 'RM01',
      coachId: 'COACH',
      scheduleTime: 'Thứ 2, 4, 6 | 07:00 - 08:15',
      maxCapacity: 20,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS02',
      id: 'CLS02',
      subjectId: 'SUB02',
      roomId: 'RM02',
      coachId: 'COACH',
      scheduleTime: 'Thứ 3, 5, 7 | 18:00 - 19:15',
      maxCapacity: 15,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS03',
      id: 'CLS03',
      subjectId: 'SUB03',
      roomId: 'RM01',
      coachId: 'COACH_02',
      scheduleTime: 'Thứ 2, 4, 6 | 19:30 - 20:30',
      maxCapacity: 25,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS04',
      id: 'CLS04',
      subjectId: 'SUB04',
      roomId: 'RM04',
      coachId: 'COACH_03',
      scheduleTime: 'Thứ 3, 5, Chủ Nhật | 09:00 - 10:00',
      maxCapacity: 12,
      status: 'ACTIVE'
    }
  ],
  classPlans: [
    { classPlanId: 'CP01', classId: 'CLS01', content: 'Khởi động kéo giãn (10p) - Chuỗi Vinyasa Flow (45p) - Thư giãn Savasana (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP02', classId: 'CLS02', content: 'Nhảy dây & gập bụng (10p) - Tổ hợp đấm Pad Work & né đòn (45p) - Cooldown (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP03', classId: 'CLS03', content: 'Warmup nhịp điệu Salsa (10p) - Vũ đạo Merengue & Reggaeton (45p) - Giãn cơ (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP04', classId: 'CLS04', content: 'Tư thế nằm cân chỉnh xương chậu (10p) - Bài tập lò xo máy Reformer (45p) - Thả lỏng (15p)', createDate: '2026-08-01' }
  ],
  classEnrollments: [
    { classEnrollmentId: 'ENR01', classId: 'CLS01', memberId: 'MEM101', enrollDate: '2026-08-01', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR02', classId: 'CLS01', memberId: 'MEM103', enrollDate: '2026-08-05', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR03', classId: 'CLS01', memberId: 'MEM104', enrollDate: '2026-08-10', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR04', classId: 'CLS02', memberId: 'MEM102', enrollDate: '2026-08-02', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR05', classId: 'CLS02', memberId: 'MEM104', enrollDate: '2026-08-03', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR06', classId: 'CLS03', memberId: 'MEM101', enrollDate: '2026-08-04', status: 'CONFIRMED' }
  ],
  classAttendances: [
    { attendanceId: 'ATT01', classEnrollmentId: 'ENR01', classId: 'CLS01', memberId: 'MEM101', attendedDate: '2026-09-18', status: 'PRESENT' },
    { attendanceId: 'ATT02', classEnrollmentId: 'ENR02', classId: 'CLS01', memberId: 'MEM103', attendedDate: '2026-09-18', status: 'ABSENT' },
    { attendanceId: 'ATT03', classEnrollmentId: 'ENR03', classId: 'CLS01', memberId: 'MEM104', attendedDate: '2026-09-18', status: 'PRESENT' },
    { attendanceId: 'ATT04', classEnrollmentId: 'ENR04', classId: 'CLS02', memberId: 'MEM102', attendedDate: '2026-09-19', status: 'PRESENT' },
    { attendanceId: 'ATT05', classEnrollmentId: 'ENR05', classId: 'CLS02', memberId: 'MEM104', attendedDate: '2026-09-19', status: 'PRESENT' }
  ],
  workoutResults: [
    { resultId: 'RES01', memberId: 'MEM101', classId: 'CLS01', activityDetails: 'Vinyasa Flow 60 phút', coachFeedback: 'Tập dẻo dai, giữ nhịp thở đều', loggedDate: '2026-09-18' },
    { resultId: 'RES02', memberId: 'MEM104', classId: 'CLS01', activityDetails: 'Vinyasa Flow 60 phút', coachFeedback: 'Thể lực cải thiện đáng kể', loggedDate: '2026-09-18' },
    { resultId: 'RES03', memberId: 'MEM102', classId: 'CLS02', activityDetails: 'Boxing Combat 60 phút', coachFeedback: 'Đấm lực tốt, phản xạ nhanh', loggedDate: '2026-09-19' }
  ],
  checkinLogs: [
    {
      id: 'LOG501',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      packageName: 'VIP All-Access Pass',
      time: 'Hôm nay 06:45',
      gate: 'Cổng 01 (Turnstile A)',
      status: 'VALID'
    },
    {
      id: 'LOG502',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      packageName: 'Standard Gym & Cardio',
      time: 'Hôm nay 07:10',
      gate: 'Cổng 02 (Turnstile B)',
      status: 'VALID'
    },
    {
      id: 'LOG503',
      memberId: 'MEM103',
      memberName: 'Hoàng Minh Châu',
      packageName: 'Yoga & Pilates Master',
      time: 'Hôm nay 08:30',
      gate: 'Cổng 01 (Turnstile A)',
      status: 'DENIED_EXPIRED'
    }
  ],
  invoices: [
    {
      id: 'INV1001',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      packageName: 'VIP All-Access Pass (90 Ngày)',
      amount: 2450000,
      paymentMethod: 'VNPAY_QR',
      date: '2026-08-01',
      status: 'PAID'
    },
    {
      id: 'INV1002',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      packageName: 'Standard Gym & Cardio (30 Ngày)',
      amount: 650000,
      paymentMethod: 'CASH',
      date: '2026-08-15',
      status: 'PAID'
    },
    {
      id: 'INV1003',
      memberId: 'MEM104',
      memberName: 'Vũ Quốc Bảo',
      packageName: 'Personal Training (PT 1-1) 12 Buổi',
      amount: 4800000,
      paymentMethod: 'CREDIT_CARD',
      date: '2026-08-20',
      status: 'PAID'
    }
  ],
  subscriptions: [
    {
      subscriptionId: 'SUB101',
      id: 'SUB101',
      memberId: 'MEM101',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE'
    },
    {
      subscriptionId: 'SUB102',
      id: 'SUB102',
      memberId: 'MEM102',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE'
    },
    {
      subscriptionId: 'SUB103',
      id: 'SUB103',
      memberId: 'MEM103',
      packageId: 'PKG03',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'EXPIRED'
    },
    {
      subscriptionId: 'SUB104',
      id: 'SUB104',
      memberId: 'MEM104',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE'
    }
  ],
  payments: [
    {
      paymentId: 'PMT1001',
      id: 'INV1001',
      subscriptionId: 'SUB101',
      amount: 2450000,
      paymentMethod: 'VNPAY_QR',
      paymentDate: '2026-08-01',
      status: 'PAID'
    },
    {
      paymentId: 'PMT1002',
      id: 'INV1002',
      subscriptionId: 'SUB102',
      amount: 650000,
      paymentMethod: 'CASH',
      paymentDate: '2026-08-15',
      status: 'PAID'
    },
    {
      paymentId: 'PMT1003',
      id: 'INV1003',
      subscriptionId: 'SUB104',
      amount: 4800000,
      paymentMethod: 'CREDIT_CARD',
      paymentDate: '2026-08-20',
      status: 'PAID'
    }
  ],
  // STRICT ERD: WorkoutPlans
  workoutPlans: [
    {
      planId: 'WP01',
      id: 'WP01',
      planName: 'Lộ Trình Giảm Mỡ & Săn Chắc 30 Ngày',
      duration: '4 Tuần (3 buổi/tuần)',
      exercises: 'Khởi động dynamic stretch (10p) - High Knees, Jump Squat & Burpees (20p) - Plank & Mountain Climber (15p) - Cooldown thả lỏng (15p)',
      dueDate: '2026-10-20',
      createDate: '2026-09-18',
      coachId: 'COACH'
    },
    {
      planId: 'WP02',
      id: 'WP02',
      planName: 'Tăng Cơ Trọng Tâm & Sức Bền Boxing',
      duration: '6 Tuần (4 buổi/tuần)',
      exercises: 'Nhảy dây tốc độ cao (15p) - Đấm bao cát Heavy Bag & Shadow Boxing (30p) - Hít đất tạ & gập bụng (15p)',
      dueDate: '2026-10-31',
      createDate: '2026-09-15',
      coachId: 'COACH'
    }
  ],
  // STRICT ERD: MemberPlan associative entity
  memberPlans: [
    {
      memberPlanId: 'MP01',
      id: 'MP01',
      memberId: 'MEM101',
      planId: 'WP01',
      assignedDate: '2026-09-18',
      status: 'IN_PROGRESS'
    },
    {
      memberPlanId: 'MP02',
      id: 'MP02',
      memberId: 'MEM102',
      planId: 'WP02',
      assignedDate: '2026-09-15',
      status: 'IN_PROGRESS'
    }
  ],
  // STRICT ERD: SupportTickets
  supportTickets: [
    {
      ticketId: 'TCK101',
      id: 'TCK101',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      receptionistId: 'REC01',
      content: 'Em để quên bình nước giữ nhiệt màu hồng tại Studio A ca sáng hôm nay, nhờ quầy kiểm tra giúp em ạ.',
      createdDate: '2026-09-20 08:30',
      status: 'PENDING',
      response: ''
    },
    {
      ticketId: 'TCK102',
      id: 'TCK102',
      memberId: 'MEM103',
      memberName: 'Hoàng Minh Châu',
      receptionistId: 'REC01',
      content: 'Thẻ của tôi báo hết hạn nhưng tôi nhớ còn thời hạn đến cuối tháng, nhờ lễ tân tra cứu lại giúp.',
      createdDate: '2026-09-19 14:15',
      status: 'RESOLVED',
      response: 'Đã kiểm tra lại thông tin trên hệ thống, thẻ gói cũ của chị đã hết hạn ngày 31/07. Quầy đã hỗ trợ tư vấn gia hạn gói mới thành công.'
    }
  ],
  // STRICT ERD: Notifications
  notifications: [
    {
      notificationId: 'NOTIF01',
      id: 'NOTIF01',
      title: 'Nhắc Lịch Tập Sắp Tới',
      content: 'Buổi học Vinyasa Yoga của bạn sẽ bắt đầu lúc 07:00 ngày mai tại Studio A.',
      sentDate: '2026-09-21 06:30',
      targetType: 'ACCOUNT',
      targetId: 'MEM101',
      isRead: false
    },
    {
      notificationId: 'NOTIF02',
      id: 'NOTIF02',
      title: 'Gia Hạn Thẻ Thành Công',
      content: 'Thẻ VIP All-Access Pass của bạn đã được kích hoạt thành công, thời hạn sử dụng đến 01/11/2026.',
      sentDate: '2026-09-19 09:00',
      targetType: 'ACCOUNT',
      targetId: 'MEM101',
      isRead: true
    },
    {
      notificationId: 'NOTIF03',
      id: 'NOTIF03',
      title: 'Cập Nhật Giáo Án Lớp Boxing CLS02',
      content: 'HLV Trần Hoàng Nam đã cập nhật giáo án Pad Work nâng cao cho ca tập chiều nay.',
      sentDate: '2026-09-20 16:00',
      targetType: 'CLASS',
      targetId: 'CLS02',
      isRead: false
    },
    {
      notificationId: 'NOTIF04',
      id: 'NOTIF04',
      title: 'Yêu Cầu Hỗ Trợ Mới',
      content: 'Hội viên Phạm Thu Trang (MEM101) vừa gửi yêu cầu hỗ trợ tìm đồ để quên tại Studio A.',
      sentDate: '2026-09-20 08:31',
      targetType: 'ACCOUNT',
      targetId: 'REC01',
      isRead: false
    }
  ],
  // STRICT ERD: AuditLogs
  auditLogs: [
    {
      logId: 'AUD01',
      id: 'AUD01',
      actionType: 'CREATE_PACKAGE',
      targetTable: 'Packages',
      timestamp: '2026-09-20 10:15',
      details: 'Quản lý tạo mới gói tập Super VIP Pilates & Sauna (3.500.000 VND)',
      accountId: 'manager@sportscenter.vn'
    },
    {
      logId: 'AUD02',
      id: 'AUD02',
      actionType: 'RENEW_MEMBERSHIP',
      targetTable: 'Subscriptions',
      timestamp: '2026-09-19 15:30',
      details: 'Lễ tân gia hạn thẻ +30 ngày cho hội viên Phạm Thu Trang (MEM101)',
      accountId: 'letan@sportscenter.vn'
    },
    {
      logId: 'AUD03',
      id: 'AUD03',
      actionType: 'CREATE_CLASS',
      targetTable: 'Classes',
      timestamp: '2026-09-18 11:00',
      details: 'Phân công ca dạy lớp CLS04 (Pilates Reformer) cho HLV Lý Kim Ngân tại RM04',
      accountId: 'manager@sportscenter.vn'
    },
    {
      logId: 'AUD04',
      id: 'AUD04',
      actionType: 'ASSIGN_WORKOUT_PLAN',
      targetTable: 'WorkoutPlans',
      timestamp: '2026-09-18 09:30',
      details: 'HLV Trần Hoàng Nam gán lộ trình "Giảm Mỡ & Săn Chắc 30 Ngày" cho hội viên MEM101',
      accountId: 'coach.nam@sportscenter.vn'
    }
  ]
};

// Safe Data Normalizer
function getDataSource() {
  const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
  const initial = (typeof window !== 'undefined' && window.INITIAL_DATA) ? window.INITIAL_DATA : null;
  if (!initial) return base;

  return {
    demoAccounts: base.demoAccounts,
    packages: (initial.packages && initial.packages.length) ? initial.packages : base.packages,
    members: (initial.members && initial.members.length) ? initial.members : base.members,
    coaches: (initial.coaches && initial.coaches.length) ? initial.coaches : base.coaches,
    subjects: (initial.subjects && initial.subjects.length) ? initial.subjects : base.subjects,
    rooms: (initial.rooms && initial.rooms.length) ? initial.rooms : base.rooms,
    subscriptions: (initial.subscriptions && initial.subscriptions.length) ? initial.subscriptions : (base.subscriptions || []),
    payments: (initial.payments && initial.payments.length) ? initial.payments : (base.payments || []),
    workoutPlans: (initial.workoutPlans && initial.workoutPlans.length) ? initial.workoutPlans : (base.workoutPlans || []),
    memberPlans: (initial.memberPlans && initial.memberPlans.length) ? initial.memberPlans : (base.memberPlans || []),
    supportTickets: (initial.supportTickets && initial.supportTickets.length) ? initial.supportTickets : (base.supportTickets || []),
    notifications: (initial.notifications && initial.notifications.length) ? initial.notifications : (base.notifications || []),
    auditLogs: (initial.auditLogs && initial.auditLogs.length) ? initial.auditLogs : (base.auditLogs || []),
    // Strictly ERD fields: ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status
    classes: (initial.classes && initial.classes.length) ? initial.classes.map((c, i) => {
      const baseClass = base.classes[i % base.classes.length];
      return {
        classId: c.classId || c.id || ('CLS0' + (i + 1)),
        id: c.classId || c.id || ('CLS0' + (i + 1)),
        subjectId: c.subjectId || baseClass.subjectId,
        roomId: c.roomId || baseClass.roomId,
        coachId: c.coachId || baseClass.coachId,
        scheduleTime: c.scheduleTime || baseClass.scheduleTime,
        maxCapacity: c.maxCapacity || baseClass.maxCapacity,
        status: c.status || 'ACTIVE'
      };
    }) : base.classes,
    classPlans: (initial.classPlans && initial.classPlans.length) ? initial.classPlans : base.classPlans,
    classEnrollments: (initial.classEnrollments && initial.classEnrollments.length) ? initial.classEnrollments : base.classEnrollments,
    classAttendances: (initial.classAttendances && initial.classAttendances.length) ? initial.classAttendances : base.classAttendances,
    workoutResults: (initial.workoutResults && initial.workoutResults.length) ? initial.workoutResults : base.workoutResults,
    checkinLogs: (initial.checkinLogs && initial.checkinLogs.length) ? initial.checkinLogs : base.checkinLogs,
    checkInLogs: (initial.checkinLogs && initial.checkinLogs.length) ? initial.checkinLogs : base.checkinLogs,
    invoices: (initial.invoices && initial.invoices.length) ? initial.invoices : (initial.recentInvoices || base.invoices)
  };
}

let appState = {
  isAuthenticated: false,
  isViewingAuthScreen: false,
  authTab: 'login', // 'login' | 'register' | 'forgot'
  currentRole: 'MEMBER', // 'MEMBER' | 'RECEPTIONIST' | 'COACH' | 'MANAGER'
  currentTab: 'member-home',
  currentUser: null,
  otpSent: false,
  activeFilterCategory: 'ALL',
  memberSearchKeyword: '',
  selectedClassForBooking: null,
  selectedPackageForCheckout: null,
  receptionMode: 'GATE', // 'GATE' | 'POS' | 'LOOKUP' | 'SHIFT' | 'TICKETS'
  receptionSearchQuery: '',
  receptionLastScan: null,
  receptionCartPackage: null,
  posPaymentMethod: 'CASH', // 'CASH' | 'VNPAY_QR' | 'CARD'
  posCashReceived: 0,
  posCardLast4: '9812',
  posVnpayPaid: false,
  posCustInfo: {
    name: '',
    phone: '',
    gender: 'Nam'
  },
  posReceiptModal: null,
  receptionTicketFilter: 'ALL', // 'ALL' | 'PENDING' | 'RESOLVED'
  coachActiveTab: 'TODAY', // 'TODAY' | 'WEEK' | 'STUDENTS'
  calendarYear: 2026,
  calendarMonth: 8, // September 2026 (0-indexed)
  selectedCalendarDate: '2026-09-19',
  selectedSessionDetail: null,
  managerActiveModal: null, // null | 'CREATE_PACKAGE' | 'CREATE_CLASS' | 'RENEW_MEMBER'
  managerSelectedMemberForRenew: null,
  managerMemberSearch: '',
  managerAuditSearch: '',
  showNotificationDropdown: false,
  showUserDropdown: false,
  supportTicketModalOpen: false,
  coachSelectedMemberForWorkoutPlan: null,
  coachWorkoutPlanModalOpen: false,
  userProfileModalOpen: false,
  userProfileActiveTab: 'INFO', // 'INFO' | 'SECURITY' | 'MEMBERSHIP'
  userProfileDraftAvatar: null,
  checkoutFlow: {
    isOpen: false,
    step: 'FORM', // 'FORM' | 'VNPAY' | 'CARD_PROCESSING' | 'RESULT'
    package: null,
    buyerInfo: {
      lastName: 'Phạm',
      firstName: 'Thu Trang',
      phone: '0912345678'
    },
    paymentMethod: 'VNPAY', // 'VNPAY' | 'CARD'
    cardInfo: {
      number: '9704 1988 5678 9012',
      holder: 'PHAM THU TRANG',
      expiry: '10/29',
      cvv: '888'
    },
    resultStatus: 'SUCCESS', // 'SUCCESS' | 'FAILED'
    failureReason: '',
    invoiceData: null
  },
  data: getDataSource()
};

function showToast(title, message, type) {
  type = type || 'success';
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const bgColors = {
    success: 'bg-emerald-700 text-white',
    error: 'bg-rose-700 text-white',
    info: 'bg-slate-900 text-white',
    warning: 'bg-amber-700 text-white'
  };
  const toast = document.createElement('div');
  toast.className = `flex items-center justify-between p-4 rounded-xl shadow-lg border border-slate-200/20 mb-3 ${bgColors[type] || 'bg-slate-900 text-white'} animate-fade-in transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `
    <div>
      <div class="font-bold text-sm leading-tight">${title}</div>
      <div class="text-xs opacity-95 mt-0.5">${message}</div>
    </div>
    <button type="button" onclick="this.parentElement.remove()" class="ml-4 opacity-70 hover:opacity-100 text-lg font-bold">&times;</button>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setAuthTab(tab) {
  appState.authTab = tab;
  renderApp();
}

function openLoginScreen(tab) {
  if (tab) appState.authTab = tab;
  appState.isViewingAuthScreen = true;
  renderApp();
}

function closeLoginScreen() {
  appState.isViewingAuthScreen = false;
  renderApp();
}

function quickLoginAs(role) {
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.role === role) : null;
  appState.isAuthenticated = true;
  appState.isViewingAuthScreen = false;
  appState.currentRole = role;
  appState.currentUser = {
    id: role === 'MEMBER' ? 'MEM101' : 'USR_' + role,
    name: acc ? acc.name : (role === 'MANAGER' ? 'Nguyễn Văn Quản Lý' : (role === 'RECEPTIONIST' ? 'Lê Ngọc Lễ Tân' : (role === 'COACH' ? 'Trần Hoàng Nam' : 'Phạm Thu Trang'))),
    email: acc ? acc.email : `${role.toLowerCase()}@sportscenter.vn`,
    role: role,
    avatar: acc ? acc.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  appState.selectedClassForBooking = null;
  appState.selectedPackageForCheckout = null;
  appState.managerActiveModal = null;

  if (role === 'MEMBER') appState.currentTab = 'member-home';
  else if (role === 'RECEPTIONIST') {
    appState.currentTab = 'reception-kiosk';
    appState.receptionMode = 'GATE';
  }
  else if (role === 'COACH') {
    appState.currentTab = 'coach-hub';
    appState.coachActiveTab = 'TODAY';
  }
  else if (role === 'MANAGER') appState.currentTab = 'dashboard';

  renderApp();
}

function switchTab(tabName) {
  if (!appState.isAuthenticated && (tabName === 'member-schedule' || tabName === 'member-fitness' || tabName === 'member-pass' || tabName === 'member-profile')) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để truy cập tính năng cá nhân!', 'info');
    openLoginScreen('login');
    return;
  }
  appState.currentTab = tabName;
  renderApp();
}

function handleLogout() {
  appState.isAuthenticated = false;
  appState.isViewingAuthScreen = false;
  appState.currentUser = null;
  appState.currentRole = 'MEMBER';
  appState.currentTab = 'member-home';
  appState.authTab = 'login';
  renderApp();
}

function getRoleLabel(role) {
  switch (role) {
    case 'MANAGER': return 'Quản Lý Trung Tâm (Manager)';
    case 'RECEPTIONIST': return 'Lễ Tân Quầy POS & Cổng';
    case 'COACH': return 'Huấn Luyện Viên (Coach)';
    case 'MEMBER': return 'Hội Viên (Member)';
    default: return role;
  }
}

// ===================================================
// ROOT RENDERER: DISPATCH TO ROLE-SPECIFIC WEB APPS
// ===================================================
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (!appState.isAuthenticated && appState.isViewingAuthScreen) {
    root.innerHTML = renderAuthScreen();
    return;
  }

  // Common modals
  const modalSuffix = (appState.selectedSessionDetail ? renderSessionDetailModal() : '') +
                      (appState.userProfileModalOpen ? renderUserProfileModal() : '') +
                      (appState.posReceiptModal ? renderPOSReceiptModal() : '');

  // 1. MEMBER / GUEST: Consumer Web App Portal
  if (appState.currentRole === 'MEMBER' || !appState.isAuthenticated) {
    root.innerHTML = renderMemberWebApp() + modalSuffix;
    return;
  }

  // 2. RECEPTIONIST: Front-Desk Kiosk / POS Console
  if (appState.currentRole === 'RECEPTIONIST') {
    root.innerHTML = renderReceptionistWebApp() + modalSuffix;
    return;
  }

  // 3. COACH: Trainer Daily Hub
  if (appState.currentRole === 'COACH') {
    root.innerHTML = renderCoachWebApp() + modalSuffix;
    return;
  }

  // 4. MANAGER: Back-Office Admin Dashboard
  root.innerHTML = renderManagerWebApp() + modalSuffix;
  initChartsIfNeeded();
}

// ===================================================
// 1. AUTH SCREEN
// ===================================================
function renderAuthScreen() {
  const currentTab = appState.authTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700"></div>

      <div class="text-center mb-6 max-w-lg">
        <div class="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Sports Center Management System
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Hệ Thống Quản Lý Trung Tâm Thể Thao
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-1">
          SWP391 FA26 Topic 04 &bull; GVHD: MinhTTH5
        </p>
      </div>

      <!-- Back to Landing Home button -->
      <div class="w-full max-w-md flex justify-between items-center mb-3">
        <button type="button" onclick="closeLoginScreen()" class="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs">
          <span>&larr;</span>
          <span>Quay lại Trang Chủ</span>
        </button>
        <span class="text-[11px] text-slate-400 font-semibold">Khách Vãng Lai</span>
      </div>

      <div class="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8">
        ${currentTab !== 'forgot' ? `
          <div class="flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 mb-6">
            <button type="button" onclick="setAuthTab('login')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Nhập
            </button>
            <button type="button" onclick="setAuthTab('register')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Ký Hội Viên Mới
            </button>
          </div>
        ` : ''}

        ${currentTab === 'login' ? renderLoginForm() : (currentTab === 'register' ? renderRegisterForm() : renderForgotPasswordForm())}
      </div>

      <div class="mt-6 text-center text-xs text-slate-400">
        FPT University &bull; Software Development Project (SWP391)
      </div>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <div class="space-y-5">
      <div>
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Đăng Nhập Nhanh Theo Vai Trò (1-Click Demo)
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="quickLoginAs('MEMBER')" class="p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200 text-left transition group">
            <div class="text-xs font-bold text-indigo-900">Hội Viên (Member)</div>
            <div class="text-[11px] text-slate-600 mt-0.5">Đặt lớp & Mua gói tập</div>
          </button>
          <button type="button" onclick="quickLoginAs('RECEPTIONIST')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Lễ Tân Quầy</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Check-in cổng & Bán POS</div>
          </button>
          <button type="button" onclick="quickLoginAs('COACH')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Huấn Luyện Viên</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Lịch dạy & Điểm danh</div>
          </button>
          <button type="button" onclick="quickLoginAs('MANAGER')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Center Manager</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Quản trị & Doanh thu</div>
          </button>
        </div>
      </div>

      <div class="flex items-center my-4">
        <div class="flex-1 border-t border-slate-200"></div>
        <span class="px-3 text-[11px] text-slate-400 uppercase font-semibold">Hoặc đăng nhập tài khoản</span>
        <div class="flex-1 border-t border-slate-200"></div>
      </div>

      <form onsubmit="return handleFormLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Tài Khoản</label>
          <input type="email" id="login-email" required value="trang.pham@gmail.com" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm" placeholder="name@domain.com" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-xs font-semibold text-slate-700 uppercase">Mật Khẩu</label>
            <button type="button" onclick="setAuthTab('forgot')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Quên mật khẩu?</button>
          </div>
          <input type="password" id="login-password" required value="123" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm" placeholder="Nhập mật khẩu" />
        </div>

        <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition">
          Đăng Nhập Vào Hệ Thống
        </button>
      </form>
    </div>
  `;
}

function renderRegisterForm() {
  return `
    <form onsubmit="return handleFormRegister(event)" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ và Tên</label>
        <input type="text" id="reg-name" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="Ví dụ: Hoàng Nhật Nam" />
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
          <input type="tel" id="reg-phone" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Giới Tính</label>
          <select id="reg-gender" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm">
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
        <input type="email" id="reg-email" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="email@gmail.com" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu</label>
        <input type="password" id="reg-password" required minlength="3" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="Tối thiểu 3 ký tự" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mục Tiêu Thể Hình (Training Goal)</label>
        <select id="reg-goal" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm">
          <option value="Giảm mỡ, tăng cơ săn chắc">Giảm mỡ, tăng cơ săn chắc</option>
          <option value="Tăng cân & phát triển khối cơ">Tăng cân & phát triển khối cơ</option>
          <option value="Tập Yoga dẻo dai & giải tỏa stress">Tập Yoga dẻo dai & giải tỏa stress</option>
          <option value="Rèn luyện sức bền & tim mạch">Rèn luyện sức bền & tim mạch</option>
        </select>
      </div>

      <button type="submit" class="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
        Hoàn Tất Đăng Ký Tài Khoản
      </button>
    </form>
  `;
}

function renderForgotPasswordForm() {
  return `
    <div class="space-y-4">
      <div class="text-center">
        <h3 class="font-bold text-base text-slate-900">Khôi Phục Mật Khẩu</h3>
        <p class="text-xs text-slate-500 mt-1">Nhập email tài khoản của bạn để nhận mã xác minh OTP 6 chữ số.</p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Của Bạn</label>
        <div class="flex space-x-2">
          <input type="email" id="forgot-email" value="trang.pham@gmail.com" class="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="email@gmail.com" />
          <button type="button" onclick="handleSendOtpBtn()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition">
            Gửi OTP
          </button>
        </div>
      </div>

      ${appState.otpSent ? `
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
          Mã OTP giả lập của bạn là: <strong>888999</strong> (Hạn 5 phút)
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nhập Mã OTP (6 số)</label>
          <input type="text" id="forgot-otp" maxlength="6" value="888999" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 tracking-widest text-center font-bold focus:outline-none focus:border-indigo-600 shadow-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu Mới</label>
          <input type="password" id="forgot-newpass" value="123456" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" />
        </div>
        <button type="button" onclick="handleVerifyAndResetPassword()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
          Xác Nhận Đổi Mật Khẩu
        </button>
      ` : ''}

      <div class="text-center pt-2">
        <button type="button" onclick="setAuthTab('login')" class="text-xs text-indigo-600 hover:underline font-medium">Quay lại Đăng nhập</button>
      </div>
    </div>
  `;
}

// =========================================================================
// ERD ENTITIES HELPERS: AUDIT LOGS, NOTIFICATIONS, TICKETS, WORKOUT PLANS
// =========================================================================

function recordAuditLog(actionType, targetTable, details, accountId) {
  if (!appState.data.auditLogs) appState.data.auditLogs = [];
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const logId = 'AUD' + String(appState.data.auditLogs.length + 1).padStart(2, '0');
  const newLog = {
    logId: logId,
    id: logId,
    actionType: actionType,
    targetTable: targetTable,
    timestamp: timestamp,
    details: details,
    accountId: accountId || (appState.currentUser?.email || (appState.currentRole === 'MANAGER' ? 'manager@sportscenter.vn' : (appState.currentRole === 'COACH' ? 'coach.nam@sportscenter.vn' : (appState.currentRole === 'RECEPTIONIST' ? 'letan@sportscenter.vn' : 'member@sportscenter.vn'))))
  };
  appState.data.auditLogs.unshift(newLog);
  return newLog;
}

function addNotification(title, content, targetType, targetId) {
  if (!appState.data.notifications) appState.data.notifications = [];
  const now = new Date();
  const sentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const notifId = 'NOTIF' + String(appState.data.notifications.length + 1).padStart(2, '0');
  const newNotif = {
    notificationId: notifId,
    id: notifId,
    title: title,
    content: content,
    sentDate: sentDate,
    targetType: targetType || 'ACCOUNT',
    targetId: targetId || 'MEM101',
    isRead: false
  };
  appState.data.notifications.unshift(newNotif);
  return newNotif;
}

function toggleNotificationDropdown() {
  appState.showNotificationDropdown = !appState.showNotificationDropdown;
  renderApp();
}

function markAllNotificationsAsRead(role) {
  const notifs = appState.data?.notifications || [];
  notifs.forEach(n => {
    n.isRead = true;
  });
  showToast('Thông Báo', 'Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  renderApp();
}

function markSingleNotificationAsRead(notifId) {
  const notifs = appState.data?.notifications || [];
  const target = notifs.find(n => (n.notificationId || n.id) === notifId);
  if (target) {
    target.isRead = true;
    renderApp();
  }
}

function renderNotificationBell(role) {
  const allNotifs = appState.data?.notifications || [];
  let userNotifs = [];
  if (role === 'MEMBER') {
    userNotifs = allNotifs.filter(n => n.targetId === 'MEM101' || n.targetType === 'CLASS');
  } else if (role === 'RECEPTIONIST') {
    userNotifs = allNotifs.filter(n => n.targetId === 'REC01' || n.targetType === 'ACCOUNT');
  } else if (role === 'COACH') {
    userNotifs = allNotifs.filter(n => n.targetId === 'COACH' || n.targetId === 'COA01' || n.targetType === 'CLASS');
  } else {
    userNotifs = allNotifs;
  }
  const unreadCount = userNotifs.filter(n => !n.isRead).length;
  const isOpen = appState.showNotificationDropdown;

  return `
    <div class="relative inline-block text-left">
      <button type="button" onclick="toggleNotificationDropdown()" class="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none" title="Thông Báo Hệ Thống">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        ${unreadCount > 0 ? `
          <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            ${unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ` : ''}
      </button>

      ${isOpen ? `
        <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div class="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-xs text-slate-900 uppercase tracking-wider">Thông Báo (${unreadCount} mới)</span>
            </div>
            ${unreadCount > 0 ? `
              <button type="button" onclick="markAllNotificationsAsRead('${role}')" class="text-[11px] font-semibold text-indigo-600 hover:underline">
                Đánh dấu đã đọc
              </button>
            ` : ''}
          </div>

          <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
            ${userNotifs.length === 0 ? `
              <div class="py-8 text-center text-xs text-slate-400">Không có thông báo nào.</div>
            ` : userNotifs.map(n => `
              <div onclick="markSingleNotificationAsRead('${n.notificationId || n.id}')" class="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start space-x-3 ${!n.isRead ? 'bg-indigo-50/40' : ''}">
                <div class="mt-0.5 w-2 h-2 rounded-full ${!n.isRead ? 'bg-indigo-600' : 'bg-transparent'} flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold ${!n.isRead ? 'text-indigo-950 font-extrabold' : 'text-slate-800'} truncate">${n.title}</span>
                    <span class="text-[10px] text-slate-400 ml-2 whitespace-nowrap">${n.sentDate}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">${n.content}</p>
                  <div class="mt-1 flex items-center space-x-2">
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${n.targetType === 'CLASS' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}">
                      ${n.targetType === 'CLASS' ? 'Lớp học' : 'Cá nhân'}
                    </span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// User Avatar Dropdown Menu (Opened by clicking avatar)
function toggleUserDropdown() {
  appState.showUserDropdown = !appState.showUserDropdown;
  if (appState.showUserDropdown) {
    appState.showNotificationDropdown = false;
  }
  renderApp();
}

function closeUserDropdown() {
  if (appState.showUserDropdown) {
    appState.showUserDropdown = false;
    renderApp();
  }
}

function navigateToMemberPage(tab) {
  appState.showUserDropdown = false;
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản để xem thông tin cá nhân!', 'info');
    openLoginScreen('login');
    return;
  }
  switchTab(tab);
}

function renderUserAvatarDropdown(role) {
  const isOpen = appState.showUserDropdown;
  const currentTab = appState.currentTab;

  const user = getResolvedCurrentUserProfile();
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = role === 'MEMBER' ? (resolveMember(rawMember) || user) : user;

  const isDarkHeader = role === 'RECEPTIONIST' || role === 'MANAGER';

  return `
    <div class="relative inline-block text-left">
      <!-- Avatar Trigger Button -->
      <button type="button" onclick="toggleUserDropdown()" class="flex items-center space-x-2.5 p-1.5 rounded-2xl transition group focus:outline-none ${
        isDarkHeader
          ? (isOpen ? 'bg-slate-800 ring-2 ring-indigo-500/50' : 'hover:bg-slate-800')
          : (isOpen ? 'bg-slate-100 ring-2 ring-indigo-500/30' : 'hover:bg-slate-100/90')
      }" title="Menu tài khoản cá nhân">
        <div class="relative flex-shrink-0">
          <img src="${member.avatar || user.avatar}" class="w-8 h-8 rounded-full border ${isDarkHeader ? 'border-slate-700' : 'border-slate-200'} object-cover shadow-2xs group-hover:scale-105 transition" />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${isDarkHeader ? 'border-slate-900' : 'border-white'}"></span>
        </div>
        <div class="hidden sm:block text-left min-w-0 max-w-[155px]">
          <div class="text-xs font-bold ${isDarkHeader ? 'text-white' : 'text-slate-900'} truncate flex items-center space-x-1">
            <span class="truncate">${member.name || user.name}</span>
            <svg class="w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="text-[10px] text-emerald-500 font-semibold truncate">
            ${role === 'MEMBER' ? `${member.status === 'ACTIVE' ? 'Thẻ Active' : 'Hết hạn'} &bull; ${member.activePackage}` : (user.department || user.roleLabel || role)}
          </div>
        </div>
      </button>

      <!-- Click-outside backdrop -->
      ${isOpen ? `
        <div class="fixed inset-0 z-40" onclick="closeUserDropdown()"></div>

        <!-- Dropdown Menu Box -->
        <div class="absolute right-0 mt-2.5 w-64 sm:w-72 rounded-3xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden divide-y divide-slate-100 text-slate-900">
          <!-- User Summary Card -->
          <div class="px-4 py-3 bg-gradient-to-br from-slate-50 to-indigo-50/40">
            <div class="flex items-center space-x-3">
              <img src="${member.avatar || user.avatar}" class="w-11 h-11 rounded-2xl border-2 border-white shadow-sm object-cover flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-black text-sm text-slate-900 truncate">${member.name || user.name}</div>
                <div class="text-[11px] text-slate-500 font-medium truncate">${member.email || user.email || 'member@sportscenter.vn'}</div>
                <div class="mt-1 flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ${role === 'MEMBER' ? (member.status === 'ACTIVE' ? 'HỘI VIÊN CHÍNH THỨC' : 'HẾT HẠN') : role}
                  </span>
                  <span class="text-[10px] text-indigo-700 font-bold truncate">${member.activePackage || user.roleLabel || ''}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu Items List -->
          <div class="p-2 space-y-1">
            ${role === 'MEMBER' ? `
              <!-- 1. Hồ Sơ Cá Nhân -->
              <button type="button" onclick="navigateToMemberPage('member-profile')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  👤
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Hồ Sơ Cá Nhân</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 2. Thẻ Điện Tử & Hóa Đơn -->
              <button type="button" onclick="navigateToMemberPage('member-pass')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-pass' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  💳
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-emerald-700 transition">Thẻ Điện Tử & Hóa Đơn</div>
                </div>
                <span class="text-slate-300 group-hover:text-emerald-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 3. Thể Trạng & InBody -->
              <button type="button" onclick="navigateToMemberPage('member-fitness')" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition group ${currentTab === 'member-fitness' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  📊
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-amber-700 transition">Thể Trạng & InBody</div>
                </div>
                <span class="text-slate-300 group-hover:text-amber-600 transition text-xs">&rarr;</span>
              </button>

              <!-- 4. Gửi Hỗ Trợ / Ticket -->
              <button type="button" onclick="closeUserDropdown(); openSupportTicketModal();" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                  🎫
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-blue-600 transition">Hỗ Trợ & Khiếu Nại</div>
                </div>
                <span class="text-slate-300 group-hover:text-blue-600 transition text-xs">&rarr;</span>
              </button>
            ` : `
              <!-- Staff / Coach / Manager Items -->
              <button type="button" onclick="closeUserDropdown(); openUserProfileModal('INFO');" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  👤
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Hồ Sơ Cá Nhân & Công Tác</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>
              <button type="button" onclick="closeUserDropdown(); openUserProfileModal('SECURITY');" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-slate-50 text-slate-700 group">
                <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  🔒
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold leading-tight group-hover:text-indigo-600 transition">Bảo Mật & Mật Khẩu</div>
                </div>
                <span class="text-slate-300 group-hover:text-indigo-600 transition text-xs">&rarr;</span>
              </button>
            `}
          </div>

          <!-- Logout Button -->
          <div class="p-2">
            <button type="button" onclick="closeUserDropdown(); handleLogout();" class="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition hover:bg-rose-50 text-rose-600 group">
              <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                🚪
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold leading-tight text-rose-600">Đăng Xuất Tài Khoản</div>
              </div>
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Support Tickets: Member functions
function openSupportTicketModal() {
  appState.supportTicketModalOpen = true;
  renderApp();
}

function closeSupportTicketModal() {
  appState.supportTicketModalOpen = false;
  renderApp();
}

function handleCreateSupportTicket(e) {
  if (e && e.preventDefault) e.preventDefault();
  const form = document.getElementById('support-ticket-form');
  if (!form) return false;
  const content = (form.querySelector('[name="ticket_content"]')?.value || '').trim();
  if (!content) {
    showToast('Lỗi Nhập Liệu', 'Vui lòng điền nội dung yêu cầu hỗ trợ hoặc phản ánh', 'error');
    return false;
  }

  const tickets = appState.data?.supportTickets || [];
  const newTicketId = 'TCK' + (tickets.length + 101);
  const now = new Date();
  const createdDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newTicket = {
    ticketId: newTicketId,
    id: newTicketId,
    memberId: 'MEM101',
    memberName: 'Phạm Thu Trang',
    receptionistId: 'REC01',
    content: content,
    createdDate: createdDate,
    status: 'PENDING',
    response: ''
  };

  tickets.unshift(newTicket);
  
  // Create notification for Receptionist
  addNotification('Yêu Cầu Hỗ Trợ Mới Từ Hội Viên', `Hội viên Phạm Thu Trang (MEM101) vừa gửi yêu cầu: "${content.substring(0, 40)}..."`, 'ACCOUNT', 'REC01');

  // Record audit log
  recordAuditLog('CREATE_TICKET', 'SupportTickets', `Hội viên MEM101 gửi phiếu hỗ trợ ${newTicketId}`, 'MEM101');

  closeSupportTicketModal();
  showToast('Gửi Thành Công', 'Phiếu yêu cầu hỗ trợ đã được chuyển tới quầy lễ tân xử lý!', 'success');
  return false;
}

function renderSupportTicketModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-lg text-slate-900">Gửi Yêu Cầu Hỗ Trợ & Phản Ánh</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tiếp nhận khiếu nại, tìm đồ thất lạc, hoặc thắc mắc gói tập.</p>
          </div>
          <button type="button" onclick="closeSupportTicketModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
        </div>

        <form id="support-ticket-form" onsubmit="return handleCreateSupportTicket(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Hội viên gửi</label>
            <input type="text" value="Phạm Thu Trang (Mã: MEM101)" disabled class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nội dung chi tiết yêu cầu <span class="text-rose-500">*</span></label>
            <textarea name="ticket_content" rows="4" required placeholder="Mô tả cụ thể vấn đề (quên đồ tại phòng nào, thắc mắc số buổi, yêu cầu tư vấn...)" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
          </div>

          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
            <span class="font-bold">&bull;</span>
            <span>Bộ phận Lễ tân quầy dịch vụ sẽ tiếp nhận và phản hồi phiếu của bạn trong vòng 15-30 phút làm việc.</span>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" onclick="closeSupportTicketModal()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Hủy</button>
            <button type="submit" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition">Gửi Yêu Cầu</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Receptionist Support Ticket Management
function setReceptionTicketFilter(filter) {
  appState.receptionTicketFilter = filter;
  renderApp();
}

function handleResolveSupportTicket(ticketId) {
  const textarea = document.getElementById(`ticket-reply-${ticketId}`);
  const responseText = textarea ? textarea.value.trim() : '';
  if (!responseText) {
    showToast('Thiếu Thông Tin', 'Vui lòng nhập nội dung giải quyết hoặc phản hồi cho hội viên', 'error');
    return;
  }

  const tickets = appState.data?.supportTickets || [];
  const ticket = tickets.find(t => (t.ticketId || t.id) === ticketId);
  if (ticket) {
    ticket.status = 'RESOLVED';
    ticket.response = responseText;
    ticket.receptionistId = 'REC01';

    // Send notification to the member
    addNotification('Phản Hồi Yêu Cầu Hỗ Trợ', `Quầy lễ tân đã chấp thuận & giải quyết phiếu #${ticketId}: "${responseText}"`, 'ACCOUNT', ticket.memberId);

    // Record audit log
    recordAuditLog('RESOLVE_TICKET', 'SupportTickets', `Lễ tân giải quyết phiếu ${ticketId} cho hội viên ${ticket.memberId}`, 'letan@sportscenter.vn');

    showToast('Thành Công', `Đã giải quyết và gửi phản hồi phiếu #${ticketId} tới hội viên!`, 'success');
    renderApp();
  }
}

function handleRejectSupportTicket(ticketId) {
  const textarea = document.getElementById(`ticket-reply-${ticketId}`);
  const responseText = textarea ? textarea.value.trim() : '';
  if (!responseText) {
    showToast('Thiếu Lý Do', 'Vui lòng nhập lý do từ chối yêu cầu (do chính sách, quy chế...) để thông báo cho hội viên', 'error');
    return;
  }

  const tickets = appState.data?.supportTickets || [];
  const ticket = tickets.find(t => (t.ticketId || t.id) === ticketId);
  if (ticket) {
    ticket.status = 'REJECTED';
    ticket.response = 'Từ chối: ' + responseText;
    ticket.receptionistId = 'REC01';

    // Send notification to the member
    addNotification('Từ Chối Yêu Cầu Hỗ Trợ', `Quầy lễ tân đã phản hồi từ chối phiếu #${ticketId}: "${responseText}"`, 'ACCOUNT', ticket.memberId);

    // Record audit log
    recordAuditLog('REJECT_TICKET', 'SupportTickets', `Lễ tân từ chối phiếu ${ticketId} cho hội viên ${ticket.memberId} (Lý do: ${responseText})`, 'letan@sportscenter.vn');

    showToast('Đã Từ Chối', `Đã từ chối phiếu #${ticketId} và gửi phản hồi cho hội viên!`, 'error');
    renderApp();
  }
}

function renderReceptionTicketsMode() {
  const tickets = appState.data?.supportTickets || [];
  const filter = appState.receptionTicketFilter || 'ALL';
  const filteredTickets = tickets.filter(t => {
    if (filter === 'PENDING') return t.status === 'PENDING';
    if (filter === 'RESOLVED') return t.status === 'RESOLVED';
    if (filter === 'REJECTED') return t.status === 'REJECTED';
    return true;
  });

  const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const rejectedCount = tickets.filter(t => t.status === 'REJECTED').length;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Tiếp Nhận & Xử Lý Yêu Cầu Hỗ Trợ (Support Tickets)</h2>
          <p class="text-xs text-slate-500 mt-1">Xử lý các khiếu nại, hỗ trợ đồ thất lạc, giải quyết hoặc từ chối theo chính sách.</p>
        </div>

        <!-- Filter Pill -->
        <div class="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs flex-wrap gap-y-1">
          <button type="button" onclick="setReceptionTicketFilter('ALL')" class="px-3 py-1.5 rounded-lg font-bold transition ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Tất Cả (${tickets.length})
          </button>
          <button type="button" onclick="setReceptionTicketFilter('PENDING')" class="px-3 py-1.5 rounded-lg font-bold transition ${filter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Chờ Xử Lý (${pendingCount})
          </button>
          <button type="button" onclick="setReceptionTicketFilter('RESOLVED')" class="px-3 py-1.5 rounded-lg font-bold transition ${filter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Đã Xong (${resolvedCount})
          </button>
          <button type="button" onclick="setReceptionTicketFilter('REJECTED')" class="px-3 py-1.5 rounded-lg font-bold transition ${filter === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Từ Chối (${rejectedCount})
          </button>
        </div>
      </div>

      ${filteredTickets.length === 0 ? `
        <div class="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold text-lg mb-3">✓</div>
          <h3 class="font-bold text-slate-800 text-sm">Không có phiếu hỗ trợ nào trong danh mục này</h3>
          <p class="text-xs text-slate-400 mt-1">Tất cả yêu cầu đã được giải quyết hoặc chưa có phát sinh mới.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 gap-4">
          ${filteredTickets.map(t => `
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div class="flex items-center space-x-3">
                  <span class="font-black text-sm text-slate-900">#${t.ticketId || t.id}</span>
                  <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Hội viên: ${t.memberName || t.memberId} (${t.memberId})
                  </span>
                </div>
                <div class="flex items-center space-x-3">
                  <span class="text-[11px] text-slate-400">${t.createdDate}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    t.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }">
                    ${
                      t.status === 'RESOLVED' ? 'Đã Giải Quyết' :
                      t.status === 'REJECTED' ? 'Đã Từ Chối' :
                      'Đang Chờ Xử Lý'
                    }
                  </span>
                </div>
              </div>

              <div>
                <div class="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Nội Dung Yêu Cầu:</div>
                <div class="text-xs text-slate-800 mt-1 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                  "${t.content}"
                </div>
              </div>

              ${t.status === 'RESOLVED' ? `
                <div>
                  <div class="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Phản Hồi Từ Lễ Tân (${t.receptionistId}):</div>
                  <div class="text-xs text-emerald-900 mt-1 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 leading-relaxed">
                    ${t.response}
                  </div>
                </div>
              ` : t.status === 'REJECTED' ? `
                <div>
                  <div class="text-[11px] font-bold uppercase text-rose-700 tracking-wider">Lý Do Từ Chối Từ Lễ Tân (${t.receptionistId}):</div>
                  <div class="text-xs text-rose-900 mt-1 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 leading-relaxed">
                    ${t.response}
                  </div>
                </div>
              ` : `
                <div class="space-y-2 pt-2">
                  <label class="block text-[11px] font-bold uppercase text-slate-600 tracking-wider">Nhập Câu Trả Lời Hoặc Lý Do Xử Lý:</label>
                  <textarea id="ticket-reply-${t.ticketId || t.id}" rows="2" placeholder="Nhập kết quả xử lý hoặc lý do từ chối (ví dụ: Đã tìm thấy kính... hoặc: Gói tập đã quá thời hạn bảo lưu theo quy chế...)" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                  <div class="flex justify-end items-center space-x-3 pt-1">
                    <button type="button" onclick="handleRejectSupportTicket('${t.ticketId || t.id}')" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition">
                      Từ Chối Yêu Cầu
                    </button>
                    <button type="button" onclick="handleResolveSupportTicket('${t.ticketId || t.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition">
                      Xác Nhận Giải Quyết & Gửi Thông Báo
                    </button>
                  </div>
                </div>
              `}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// Coach Workout Plan Assignment
function openAssignWorkoutPlanModal(memberId) {
  appState.coachSelectedMemberForWorkoutPlan = memberId;
  appState.coachWorkoutPlanModalOpen = true;
  renderApp();
}

function closeAssignWorkoutPlanModal() {
  appState.coachWorkoutPlanModalOpen = false;
  appState.coachSelectedMemberForWorkoutPlan = null;
  renderApp();
}

function handleAssignWorkoutPlan(e) {
  if (e && e.preventDefault) e.preventDefault();
  const form = document.getElementById('assign-workout-plan-form');
  if (!form) return false;
  const memberId = appState.coachSelectedMemberForWorkoutPlan;
  const planName = (form.querySelector('[name="plan_name"]')?.value || '').trim();
  const duration = (form.querySelector('[name="plan_duration"]')?.value || '').trim();
  const dueDate = form.querySelector('[name="due_date"]')?.value || '2026-10-31';
  const exercises = (form.querySelector('[name="exercises"]')?.value || '').trim();

  if (!planName || !exercises) {
    showToast('Lỗi Nhập Liệu', 'Vui lòng điền đầy đủ tên giáo án và nội dung bài tập', 'error');
    return false;
  }

  const workoutPlans = appState.data?.workoutPlans || [];
  const memberPlans = appState.data?.memberPlans || [];

  const newPlanId = 'WP' + String(workoutPlans.length + 1).padStart(2, '0');
  const newMemberPlanId = 'MP' + String(memberPlans.length + 1).padStart(2, '0');
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const newPlan = {
    planId: newPlanId,
    id: newPlanId,
    planName: planName,
    duration: duration || '4 Tuần (3 buổi/tuần)',
    exercises: exercises,
    dueDate: dueDate,
    createDate: todayStr,
    coachId: 'COACH'
  };
  workoutPlans.push(newPlan);

  const newMemberPlan = {
    memberPlanId: newMemberPlanId,
    id: newMemberPlanId,
    memberId: memberId,
    planId: newPlanId,
    assignedDate: todayStr,
    status: 'IN_PROGRESS'
  };
  memberPlans.push(newMemberPlan);

  // Send notification to member
  addNotification('HLV Giao Giáo Án Luyện Tập Riêng', `HLV Trần Hoàng Nam vừa thiết lập lộ trình "${planName}" cho bạn. Hãy kiểm tra mục Thể Trạng!`, 'ACCOUNT', memberId);

  // Record audit log
  recordAuditLog('ASSIGN_WORKOUT_PLAN', 'WorkoutPlans', `HLV gán giáo án ${planName} (${newPlanId}) cho học viên ${memberId}`, 'coach.nam@sportscenter.vn');

  closeAssignWorkoutPlanModal();
  showToast('Thành Công', `Đã giao giáo án "${planName}" cho học viên thành công!`, 'success');
  return false;
}

function renderAssignWorkoutPlanModal() {
  const memberId = appState.coachSelectedMemberForWorkoutPlan;
  const rawMembers = appState.data?.members || [];
  const member = resolveMember(rawMembers.find(m => m.id === memberId || m.memberId === memberId)) || { name: memberId, id: memberId };

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-lg text-slate-900">Thiết Kế & Giao Giáo Án Riêng (Workout Plan)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Xây dựng lộ trình tập luyện cá nhân hóa theo chỉ số InBody.</p>
          </div>
          <button type="button" onclick="closeAssignWorkoutPlanModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
        </div>

        <form id="assign-workout-plan-form" onsubmit="return handleAssignWorkoutPlan(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Học viên nhận giáo án</label>
            <input type="text" value="${member.name} (${member.id}) &bull; Mục tiêu: ${member.trainingGoal || 'Thể lực'}" disabled class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tên Lộ Trình / Giáo Án <span class="text-rose-500">*</span></label>
            <input type="text" name="plan_name" required placeholder="Ví dụ: Giảm Mỡ Siết Bụng & Nâng Cao Sức Bền 30 Ngày" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Thời Lượng (Duration)</label>
              <input type="text" name="plan_duration" value="4 Tuần (3 buổi/tuần)" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Hạn Hoàn Thành (DueDate)</label>
              <input type="date" name="due_date" value="2026-10-31" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nội dung các bài tập (Exercises) <span class="text-rose-500">*</span></label>
            <textarea name="exercises" rows="3" required placeholder="Mô tả chuỗi bài tập cụ thể: Cardio khởi động (10p) - Squat/Plank 4 sets x 15 reps - Giãn cơ..." class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" onclick="closeAssignWorkoutPlanModal()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Hủy</button>
            <button type="submit" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition">Lưu & Gán Cho Học Viên</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Manager Audit Logs
function setManagerAuditSearch(keyword) {
  appState.managerAuditSearch = keyword;
  renderApp();
}

function renderManagerAuditLogs() {
  const auditLogs = appState.data?.auditLogs || [];
  const keyword = (appState.managerAuditSearch || '').toLowerCase().trim();
  const filteredLogs = auditLogs.filter(log => {
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

// =========================================================================
// 2. MEMBER WEB APP: FULL CONSUMER PORTAL (TOP NAVBAR, 5 OPERATIONAL PAGES)
// =========================================================================
function renderMemberWebApp() {
  const currentTab = appState.currentTab;
  const isAuth = appState.isAuthenticated;
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember) || {
    id: 'MEM101',
    name: 'Phạm Thu Trang',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    activePackage: 'VIP All-Access Pass',
    phone: '0912345678',
    endDate: '2026-11-01'
  };

  const myBookedCount = isAuth ? ((appState.data?.classes || []).filter(c => c.attendees && c.attendees.some(a => a.id === member.id)).length) : 0;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <!-- Member Top Horizontal Navigation Bar -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2 flex items-center justify-between">
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-8">
            <div class="flex items-center space-x-3 cursor-pointer group" onclick="switchTab('member-home')">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                SC
              </div>
              <div>
                <div class="font-extrabold text-base tracking-tight text-slate-900 leading-tight">SPORT CENTER</div>
                <div class="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">${isAuth ? 'Member Portal' : 'Gym & Fitness'}</div>
              </div>
            </div>

            <!-- Horizontal Nav Menu -->
            <nav class="hidden md:flex items-center space-x-1.5">
              <button type="button" onclick="switchTab('member-classes')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${currentTab === 'member-classes' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                Khám Phá Lớp Học
              </button>
              <button type="button" onclick="switchTab('member-packages')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${currentTab === 'member-packages' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                Gói Hội Viên
              </button>
              ${isAuth ? `
                <button type="button" onclick="switchTab('member-schedule')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${currentTab === 'member-schedule' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                  <span>Lịch Tập Của Tôi</span>
                  ${myBookedCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">${myBookedCount}</span>` : ''}
                </button>
              ` : ''}
            </nav>
          </div>

          <!-- Right Controls: If Authenticated -> Bell + User Avatar Dropdown. If Guest -> Register + Login Buttons -->
          ${isAuth ? `
            <div class="flex items-center space-x-2 sm:space-x-3">
              ${renderNotificationBell('MEMBER')}
              ${renderUserAvatarDropdown('MEMBER')}
            </div>
          ` : `
            <div class="flex items-center space-x-3">
              <button type="button" onclick="openLoginScreen('register')" class="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition">
                Đăng Ký
              </button>
              <button type="button" onclick="openLoginScreen('login')" class="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition flex items-center space-x-1.5">
                <span>Đăng Nhập</span>
                <span class="text-xs">&rarr;</span>
              </button>
            </div>
          `}
        </div>

        <!-- Mobile horizontal sub-bar -->
        <div class="md:hidden flex border-t border-slate-100 overflow-x-auto px-4 py-2 space-x-2 bg-slate-50">
          <button type="button" onclick="switchTab('member-home')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold ${currentTab === 'member-home' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-white border border-slate-200'}">Trang chủ</button>
          <button type="button" onclick="switchTab('member-classes')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold ${currentTab === 'member-classes' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-white border border-slate-200'}">Lớp học</button>
          <button type="button" onclick="switchTab('member-packages')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold ${currentTab === 'member-packages' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-white border border-slate-200'}">Gói tập</button>
          ${isAuth ? `
            <button type="button" onclick="switchTab('member-schedule')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold ${currentTab === 'member-schedule' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-white border border-slate-200'}">Lịch (${myBookedCount})</button>
          ` : `
            <button type="button" onclick="openLoginScreen('login')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">Đăng Nhập</button>
          `}
        </div>
      </header>

      <!-- Main Body Container -->
      <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        ${currentTab === 'member-home' ? renderMemberLandingHome() : ''}
        ${currentTab === 'member-classes' ? renderMemberClassDiscovery() : ''}
        ${currentTab === 'member-packages' ? renderMemberPackageCatalog() : ''}
        ${currentTab === 'member-schedule' ? renderMemberMySchedule() : ''}
        ${currentTab === 'member-fitness' ? renderMemberFitnessStats() : ''}
        ${currentTab === 'member-pass' ? renderMemberDigitalPass() : ''}
        ${currentTab === 'member-profile' ? renderMemberProfilePage() : ''}
      </main>

      <!-- Member Booking Modal (If Open) -->
      ${appState.selectedClassForBooking ? renderMemberBookingModal() : ''}

      <!-- Member Package Checkout Modal (If Open) -->
      ${(appState.checkoutFlow?.isOpen || appState.selectedPackageForCheckout) ? renderMemberCheckoutModal() : ''}

      <!-- Member Support Ticket Modal (If Open) -->
      ${appState.supportTicketModalOpen ? renderSupportTicketModal() : ''}

      <!-- Redesigned Comprehensive Modern Footer -->
      <footer class="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <!-- Brand Column -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3 cursor-pointer" onclick="switchTab('member-home')">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  SC
                </div>
                <div>
                  <div class="font-extrabold text-base tracking-tight text-white">SPORT CENTER</div>
                  <div class="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Gym & Fitness System</div>
                </div>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed font-normal">
                Tổ hợp thể thao và chăm sóc thể chất tiêu chuẩn 5 sao với không gian 5.000m², thiết bị thông minh hiện đại hàng đầu cùng trải nghiệm hội viên số hóa toàn diện.
              </p>
              <div class="pt-1 flex items-center space-x-3 text-xs text-slate-400">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-amber-300 font-bold">
                  ★ 4.9 / 5.0
                </span>
                <span>Hơn 15.000 học viên tin cậy</span>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Khám Phá Nhanh</h4>
              <ul class="space-y-2.5 text-xs text-slate-400">
                <li><button type="button" onclick="switchTab('member-home')" class="hover:text-indigo-400 transition">Trang Chủ Giới Thiệu</button></li>
                <li><button type="button" onclick="switchTab('member-classes')" class="hover:text-indigo-400 transition">Lịch Khám Phá Lớp Học</button></li>
                <li><button type="button" onclick="switchTab('member-packages')" class="hover:text-indigo-400 transition">Bảng Giá Gói Hội Viên</button></li>
                <li><button type="button" onclick="quickExploreCategory('Yoga')" class="hover:text-indigo-400 transition">Yoga & Thiền Định</button></li>
                <li><button type="button" onclick="quickExploreCategory('Boxing')" class="hover:text-indigo-400 transition">Boxing & Combat Arena</button></li>
                <li><button type="button" onclick="quickExploreCategory('Pilates')" class="hover:text-indigo-400 transition">Pilates Reformer Chuyên Sâu</button></li>
              </ul>
            </div>

            <!-- Operating Hours & Amenities -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Giờ Mở Cửa & Tiện Ích</h4>
              <div class="space-y-2.5 text-xs text-slate-400">
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">⏰</span>
                  <div>
                    <strong class="text-slate-200">05:30 – 22:00</strong>
                    <div class="text-[11px] text-slate-500">Thứ 2 – Chủ Nhật (Cả ngày lễ)</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🏊</span>
                  <div>
                    <strong class="text-slate-200">Bể Bơi Bốn Mùa Ozone</strong>
                    <div class="text-[11px] text-slate-500">Khử trùng tiêu chuẩn y tế</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🧖</span>
                  <div>
                    <strong class="text-slate-200">Xông Hơi Đá Muối Himalaya</strong>
                    <div class="text-[11px] text-slate-500">Khu vực Nam/Nữ riêng biệt</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🅿️</span>
                  <div>
                    <strong class="text-slate-200">Bãi Đỗ Xe Thông Minh</strong>
                    <div class="text-[11px] text-slate-500">Miễn phí ô tô & xe máy</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact & Support -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Liên Hệ & Trợ Giúp</h4>
              <div class="space-y-2.5 text-xs text-slate-400">
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">📍</span>
                  <span>Khu Công Nghệ Cao Hòa Lạc, Thạch Thất, Hà Nội</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-indigo-400 font-bold">📞</span>
                  <a href="tel:19006868" class="text-amber-300 font-extrabold hover:underline">1900 6868</a>
                  <span class="text-[11px] text-slate-500">(24/7)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-indigo-400 font-bold">✉️</span>
                  <a href="mailto:contact@sportcenter.vn" class="hover:text-white transition">contact@sportcenter.vn</a>
                </div>
                <div class="pt-2">
                  <button type="button" onclick="openLoginScreen('login')" class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition">
                    Cổng Đăng Nhập Hội Viên &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <div>
              &copy; 2026 Sport Center Management System. All rights reserved.
            </div>
            <div class="flex items-center space-x-4">
              <span>SWP391 FA26 Topic 04</span>
              <span>&bull;</span>
              <span>FPT University</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
}

// =========================================================================
// LANDING / HOME PAGE CONSTANTS & REDESIGNED TEMPLATES
// =========================================================================

const GYM_LANDING_DATA = {
  info: {
    name: 'Sport Center',
    badge: 'Hệ Thống Thể Thao & Sống Khỏe Tiêu Chuẩn Quốc Tế',
    tagline: 'Đánh Thức Thể Lực. Định Hình Phong Cách Sống.',
    subTagline: 'Không gian tập luyện đẳng cấp 5.000m² tích hợp thiết bị TechnoGym AI thế hệ mới, hồ bơi ozone bốn mùa và hệ sinh thái hội viên thông minh 1-chạm.',
    address: 'Khu Công Nghệ Cao Hòa Lạc, Thạch Thất, Hà Nội',
    hours: '05:30 – 22:00 (Thứ 2 – Chủ Nhật)',
    hotline: '1900 6868',
    email: 'contact@sportcenter.vn'
  },
  stats: [
    { value: '15,000+', label: 'Hội Viên Thân Thiết', sub: 'Cộng đồng tập luyện gắn bó mỗi ngày', color: 'from-blue-500 to-indigo-600', icon: 'users' },
    { value: '50+', label: 'Master Coach Chuẩn Quốc Tế', sub: 'Chứng chỉ NASM, ACE, Yoga Alliance', color: 'from-emerald-500 to-teal-600', icon: 'award' },
    { value: '120+', label: 'Lớp Học Hàng Tuần', sub: 'Khung giờ đa dạng 05:30 - 21:00', color: 'from-amber-500 to-orange-600', icon: 'calendar' },
    { value: '99.8%', label: 'Hài Lòng Dịch Vụ', sub: 'Đánh giá 5 sao về cơ sở vật chất', color: 'from-rose-500 to-pink-600', icon: 'heart' }
  ],
  classes: [
    {
      id: 'yoga',
      category: 'Yoga',
      title: 'Yoga Thân - Tâm - Trí',
      tag: 'Studio Yên Tĩnh',
      badge: 'Thư Giãn & Cân Bằng',
      rating: '4.9 ★',
      level: 'Mọi trình độ',
      desc: 'Cân bằng hơi thở, tăng tính dẻo dai và thanh lọc tâm trí với sàn gỗ sồi tự nhiên cùng tinh dầu thảo mộc cao cấp.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
      color: 'indigo'
    },
    {
      id: 'boxing',
      category: 'Boxing',
      title: 'Boxing & KickFit Rực Lửa',
      tag: 'Combat Arena',
      badge: 'Đốt 800+ Kcal',
      rating: '5.0 ★',
      level: 'Cường độ cao',
      desc: 'Giải tỏa stress tột đỉnh, tăng tốc phản xạ tự vệ và đốt mỡ cùng sàn đấu chuyên nghiệp chuẩn thi đấu Olympic.',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80',
      color: 'rose'
    },
    {
      id: 'pilates',
      category: 'Pilates',
      title: 'Pilates Chỉnh Dáng & Cột Sống',
      tag: 'Máy Reformer',
      badge: 'Siết Eo & Cân Chỉnh',
      rating: '4.9 ★',
      level: 'Căn bản & Nâng cao',
      desc: 'Kích hoạt nhóm cơ lõi sâu, chỉnh cong vẹo cột sống do ngồi văn phòng và điêu khắc đường cong mềm mại săn chắc.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      color: 'amber'
    },
    {
      id: 'gym',
      category: 'Gym',
      title: 'Gym & Sức Mạnh Thể Lực',
      tag: 'Sàn Gym 1.200m²',
      badge: 'TechnoGym AI 2026',
      rating: '5.0 ★',
      level: 'Tự do & Có HLV',
      desc: 'Hệ thống máy khối, dàn rack Olympic chuyên nghiệp kết nối máy đo nhịp tim thông minh phân tích chuyển động tức thì.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      color: 'blue'
    }
  ],
  features: [
    {
      title: 'Thẻ Số & Check-in QR 0.5s',
      desc: 'Không cần thẻ nhựa. Cổng kiểm soát Turnstile thông minh mở tức thì với mã QR động bảo mật cao trên điện thoại.',
      icon: 'smartphone',
      badge: 'Công Nghệ Không Chạm',
      actionText: 'Trải Nghiệm Thẻ Số',
      actionTab: 'member-pass'
    },
    {
      title: 'Đặt Chỗ & Quản Lý Lịch Học',
      desc: 'Chủ động chọn chỗ thảm tập, đặt trước với HLV yêu thích trước 7 ngày và đồng bộ lịch tập thông minh vào điện thoại.',
      icon: 'calendar-check',
      badge: 'Tiện Lợi 24/7',
      actionText: 'Khám Phá Lớp Học',
      actionTab: 'member-classes'
    },
    {
      title: 'Đo InBody & Lộ Trình Riêng',
      desc: 'Máy InBody 770 y khoa quét chỉ số cơ xương mỡ định kỳ. HLV lên giáo án cá nhân hóa theo tiến độ thực tế.',
      icon: 'activity',
      badge: 'Khoa Học & Hiệu Quả',
      actionText: 'Theo Dõi Chỉ Số',
      actionTab: 'member-fitness'
    }
  ]
};

function quickExploreCategory(cat) {
  appState.activeFilterCategory = cat;
  appState.memberSearchKeyword = '';
  switchTab('member-classes');
}

function handleHomeSearch(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('home-search-input');
  if (input) {
    appState.memberSearchKeyword = input.value.trim();
  }
  switchTab('member-classes');
  return false;
}

function renderMemberLandingHome() {
  const pkgs = (appState.data && appState.data.packages && appState.data.packages.length) 
    ? appState.data.packages 
    : [
        {
          id: 'PKG_STANDARD',
          name: 'Classic Fitness',
          description: 'Lựa chọn lý tưởng để rèn luyện thói quen thể thao bền vững hàng ngày.',
          price: 590000,
          durationDays: 30,
          popular: false,
          features: ['Không giới hạn giờ tập sàn Gym', 'Tủ đồ locker thông minh & tắm nóng lạnh', 'Đo InBody phân tích thể trạng 1 lần/tháng', 'Nước uống điện giải ion kiềm miễn phí']
        },
        {
          id: 'PKG_VIP',
          name: 'VIP All-Access Pass',
          description: 'Trải nghiệm đỉnh cao không giới hạn bộ môn cùng các đặc quyền ưu tiên cao cấp.',
          price: 1290000,
          durationDays: 30,
          popular: true,
          features: ['Toàn quyền tham gia mọi lớp Yoga, Boxing, Zumba', 'Khu xông hơi đá muối Himalaya & bể sục Jacuzzi', '02 buổi tập định hướng 1-1 với Master Coach', 'Khăn tập cao cấp & đồ uống thể thao miễn phí', 'Ưu tiên đặt chỗ lớp học trước 7 ngày']
        },
        {
          id: 'PKG_PILATES',
          name: 'Pilates & Yoga Master',
          description: 'Gói chuyên sâu cân chỉnh vóc dáng và phục hồi năng lượng tinh thần.',
          price: 990000,
          durationDays: 30,
          popular: false,
          features: ['Không giới hạn lớp Yoga Studio & Pilates Mat', '04 buổi tập máy Pilates Reformer chuyên sâu', 'Thảm tập cá nhân kháng khuẩn cao cấp', 'Đánh giá định kỳ độ linh hoạt và cột sống']
        }
      ];

  const info = GYM_LANDING_DATA.info;

  return `
    <div class="space-y-16 sm:space-y-24 animate-fade-in pb-12 overflow-x-hidden">
      
      <!-- ================================================================= -->
      <!-- 1. HERO SECTION: PREMIUM DARK GYM AESTHETIC -->
      <!-- ================================================================= -->
      <section class="relative rounded-3xl overflow-hidden shadow-2xl min-h-[540px] sm:min-h-[620px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 text-white border border-slate-800/80">
        <!-- Background Image with Multi-layer Gradient Overlay -->
        <div class="absolute inset-0 z-0">
          <img 
            src="/assets/images/gym-bg.jpg" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80';"
            alt="Sport Center Gym Floor" 
            class="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <!-- Navy / Dark Overlay for supreme contrast & readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-indigo-950/40"></div>
          <!-- Subtle Glow Accent -->
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <!-- Top Badge -->
        <div class="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-sm transition">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>${info.badge}</span>
          </div>
          <div class="hidden sm:flex items-center space-x-4 text-xs text-slate-300 font-medium">
            <span class="flex items-center gap-1.5"><span class="text-amber-400">★</span> Đánh giá 4.9/5 từ hơn 15,000 học viên</span>
          </div>
        </div>

        <!-- Hero Main Content -->
        <div class="relative z-10 max-w-3xl my-auto py-6 sm:py-8 space-y-6">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
            Đánh Thức Thể Lực. <br />
            <span class="bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Định Hình Phong Cách Sống.
            </span>
          </h1>
          <p class="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal drop-shadow-sm">
            ${info.subTagline}
          </p>

          <!-- CTAs & Quick Filters -->
          <div class="pt-2 space-y-4">
            <!-- Direct CTA Buttons -->
            <div class="flex flex-wrap items-center gap-3">
              <button 
                type="button" 
                onclick="switchTab('member-classes')" 
                class="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Khám Phá Lớp Học</span>
                <span>&rarr;</span>
              </button>
              <button 
                type="button" 
                onclick="switchTab('member-packages')" 
                class="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center"
              >
                Xem Bảng Giá Gói Tập
              </button>
            </div>

            <!-- Quick Pill Categories -->
            <div class="flex items-center gap-2 flex-wrap pt-2">
              <span class="text-xs text-slate-300 font-semibold mr-1">Bộ môn nổi bật:</span>
              <button type="button" onclick="quickExploreCategory('Yoga')" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-xs text-white font-medium transition flex items-center gap-1.5">
                <span>🧘</span> Yoga Thân Tâm
              </button>
              <button type="button" onclick="quickExploreCategory('Boxing')" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-xs text-white font-medium transition flex items-center gap-1.5">
                <span>🥊</span> Boxing Đốt Mỡ
              </button>
              <button type="button" onclick="quickExploreCategory('Pilates')" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-xs text-white font-medium transition flex items-center gap-1.5">
                <span>🤸</span> Pilates Vóc Dáng
              </button>
              <button type="button" onclick="quickExploreCategory('Gym')" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-xs text-white font-medium transition flex items-center gap-1.5">
                <span>🏋️</span> Gym & Sức Mạnh
              </button>
            </div>
          </div>
        </div>

        <!-- Hero Bottom Information Strip -->
        <div class="relative z-10 pt-5 mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 text-xs text-slate-300">
          <div class="flex items-center space-x-6 flex-wrap gap-y-2">
            <span class="flex items-center space-x-1.5">
              <span class="text-indigo-400 font-bold">📍 Địa chỉ:</span> 
              <span class="text-white font-medium">${info.address}</span>
            </span>
            <span class="flex items-center space-x-1.5">
              <span class="text-indigo-400 font-bold">⏰ Giờ mở cửa:</span> 
              <span class="text-white font-medium">${info.hours}</span>
            </span>
            <span class="flex items-center space-x-1.5">
              <span class="text-indigo-400 font-bold">📞 Hotline:</span> 
              <a href="tel:${info.hotline.replace(/\s+/g, '')}" class="text-amber-300 font-bold hover:underline">${info.hotline}</a>
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button type="button" onclick="switchTab('member-classes')" class="text-xs font-bold text-cyan-300 hover:text-white transition flex items-center gap-1">
              <span>Xem Lịch Tập Hôm Nay</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 2. GYM QUICK INFO CARDS (TỔNG QUAN TIỆN ÍCH TRUNG TÂM) -->
      <!-- ================================================================= -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            📍
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-indigo-600">Vị Trí Đắc Địa</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">${info.address}</div>
            <div class="text-xs text-slate-500 mt-1">Bãi đỗ xe ô tô & xe máy thông minh miễn phí</div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            ⏰
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-emerald-600">Giờ Hoạt Động</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">${info.hours}</div>
            <div class="text-xs text-slate-500 mt-1">Mở cửa xuyên suốt tất cả các ngày trong năm</div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            📞
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-amber-600">Hỗ Trợ Hội Viên 24/7</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">Hotline: ${info.hotline}</div>
            <div class="text-xs text-slate-500 mt-1">Tư vấn lộ trình & giải đáp mọi thắc mắc</div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 3. STATISTICS BAR (SỐ LIỆU ĐÁNG TIN CẬY) -->
      <!-- ================================================================= -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        ${GYM_LANDING_DATA.stats.map(s => `
          <div class="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div class="text-3xl sm:text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-tight">
              ${s.value}
            </div>
            <div class="text-xs sm:text-sm font-bold text-slate-900 mt-2">${s.label}</div>
            <div class="text-[11px] sm:text-xs text-slate-500 mt-1">${s.sub}</div>
            <div class="w-8 h-1 bg-gradient-to-r ${s.color} rounded-full mt-3 group-hover:w-16 transition-all duration-300"></div>
          </div>
        `).join('')}
      </section>

      <!-- ================================================================= -->
      <!-- 4. FEATURED CLASSES & DISCIPLINES (CÁC BỘ MÔN THỂ THAO ĐỈNH CAO) -->
      <!-- ================================================================= -->
      <section class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="max-w-2xl">
            <div class="text-xs font-black uppercase tracking-wider text-indigo-600">Hệ Thống Huấn Luyện</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Các Bộ Môn Thể Thao Đỉnh Cao
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Thiết kế bài bản từ cơ bản đến nâng cao, trang thiết bị tối tân chuẩn quốc tế và được kèm cặp bởi đội ngũ huấn luyện viên tâm huyết.
            </p>
          </div>
          <button 
            type="button" 
            onclick="switchTab('member-classes')" 
            class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition self-start sm:self-auto shadow-2xs"
          >
            <span>Khám phá toàn bộ 120+ lớp</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${GYM_LANDING_DATA.classes.map(item => `
            <div class="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <!-- Image Header -->
                <div class="relative h-52 overflow-hidden bg-slate-900">
                  <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <!-- Tag -->
                  <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
                    ${item.tag}
                  </span>
                  <!-- Badge -->
                  <span class="absolute bottom-3 left-3.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                    ${item.badge}
                  </span>
                  <span class="absolute bottom-3 right-3.5 text-xs font-black text-amber-300 drop-shadow-sm">
                    ${item.rating}
                  </span>
                </div>

                <!-- Body -->
                <div class="p-6 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-black text-base text-slate-900 group-hover:text-indigo-600 transition">
                      ${item.title}
                    </h3>
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed">
                    ${item.desc}
                  </p>
                </div>
              </div>

              <!-- Footer action -->
              <div class="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">${item.level}</span>
                <button 
                  type="button" 
                  onclick="quickExploreCategory('${item.category}')" 
                  class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
                >
                  <span>Xem Lớp</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 5. APP ECOSYSTEM WALKTHROUGH (HỆ SINH THÁI ỨNG DỤNG SỐ HÓA 4.0) -->
      <!-- ================================================================= -->
      <section class="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <!-- Background accents -->
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-3">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <span>📱</span>
            <span>Ứng Dụng Hội Viên Số Hóa Toàn Diện</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Một Nền Tảng Thông Minh.<br />
            Trọn Vẹn Mọi Tiện Ích Thể Thao.
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Loại bỏ hoàn toàn thẻ nhựa và thủ tục giấy tờ. Mọi hoạt động từ check-in không chạm, xem lịch lớp, theo dõi hồ sơ sức khỏe và thanh toán trực tuyến diễn ra mượt mà ngay trên thiết bị của bạn.
          </p>
        </div>

        <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          ${GYM_LANDING_DATA.features.map(f => `
            <div class="p-7 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="inline-block px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 text-[10px] font-bold uppercase">
                  ${f.badge}
                </div>
                <h3 class="font-extrabold text-base text-white">${f.title}</h3>
                <p class="text-xs text-slate-300 leading-relaxed font-normal">${f.desc}</p>
              </div>
              <div class="pt-2">
                <button 
                  type="button" 
                  onclick="navigateToMemberPage('${f.actionTab}')" 
                  class="text-xs font-bold text-cyan-300 hover:text-white transition flex items-center space-x-1.5"
                >
                  <span>${f.actionText}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 6. POPULAR PACKAGES PREVIEW (CÁC GÓI HỘI VIÊN ĐƯỢC TIN CHỌN) -->
      <!-- ================================================================= -->
      <section class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="max-w-2xl">
            <div class="text-xs font-black uppercase tracking-wider text-indigo-600">Đăng Ký Linh Hoạt</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Các Gói Hội Viên Được Tin Chọn
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Minh bạch chi phí, không phí ẩn. Thanh toán bảo mật qua VNPay QR, Visa, Mastercard và kích hoạt thẻ tức thì.
            </p>
          </div>
          <button 
            type="button" 
            onclick="switchTab('member-packages')" 
            class="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition self-start sm:self-auto"
          >
            <span>Xem tất cả gói &rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          ${pkgs.slice(0, 3).map(pkg => `
            <div class="rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              pkg.popular 
                ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl ring-2 ring-indigo-500 scale-[1.02]' 
                : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-xl'
            }">
              ${pkg.popular ? `
                <div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  ★ Khuyên Dùng Nhiều Nhất
                </div>
              ` : ''}

              <div>
                <h3 class="text-xl font-extrabold tracking-tight">${pkg.name}</h3>
                <p class="text-xs ${pkg.popular ? 'text-slate-300' : 'text-slate-500'} mt-1.5 leading-relaxed">${pkg.description}</p>
                
                <div class="mt-6 pb-6 border-b ${pkg.popular ? 'border-white/10' : 'border-slate-100'}">
                  <div class="text-3xl sm:text-4xl font-black">
                    ${(pkg.price || 0).toLocaleString()} <span class="text-sm font-semibold ${pkg.popular ? 'text-slate-300' : 'text-slate-500'}">VND</span>
                  </div>
                  <div class="text-xs ${pkg.popular ? 'text-cyan-300' : 'text-slate-500'} font-semibold mt-1">
                    Thời hạn: ${pkg.durationDays || 30} Ngày Sử Dụng
                  </div>
                </div>

                <div class="py-6 space-y-3">
                  ${(pkg.features || []).slice(0, 5).map(f => `
                    <div class="flex items-start space-x-2.5 text-xs sm:text-sm">
                      <span class="${pkg.popular ? 'text-amber-400 font-black' : 'text-indigo-600 font-bold'} flex-shrink-0">✓</span>
                      <span class="${pkg.popular ? 'text-slate-200' : 'text-slate-700'}">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4">
                <button 
                  type="button" 
                  onclick="openCheckoutModal('${pkg.id}')" 
                  class="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition shadow-md ${
                    pkg.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }"
                >
                  Đăng Ký Gói Này &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- 7. FINAL CALL TO ACTION (KÊU GỌI HÀNH ĐỘNG CUỐI TRANG) -->
      <!-- ================================================================= -->
      <section class="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-indigo-900/50 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div class="max-w-2xl space-y-3 text-center lg:text-left">
          <div class="inline-block px-3.5 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            Bắt Đầu Ngay Hôm Nay
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Sẵn Sàng Nâng Tầm Thể Chất Cùng Sport Center?
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Đăng ký tài khoản hội viên ngay hôm nay để nhận buổi đo InBody 770 chuyên sâu miễn phí và tư vấn thiết lập mục tiêu thể hình 1-1 cùng huấn luyện viên.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full sm:w-auto">
          <button 
            type="button" 
            onclick="switchTab('member-classes')" 
            class="w-full sm:w-auto px-7 py-4 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <span>Khám Phá Lớp Học</span>
            <span>&rarr;</span>
          </button>
          <button 
            type="button" 
            onclick="switchTab('member-packages')" 
            class="w-full sm:w-auto px-7 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center justify-center"
          >
            Xem Bảng Giá Gói Tập
          </button>
        </div>
      </section>

    </div>
  `;
}

function renderMemberClassDiscovery() {
  const categories = ['ALL', 'Yoga', 'Boxing', 'Zumba', 'Pilates'];
  const activeCat = appState.activeFilterCategory;
  const keyword = (appState.memberSearchKeyword || '').toLowerCase().trim();
  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const classes = rawClasses.map(c => resolveClass(c));
  
  const filtered = classes.filter(c => {
    const matchCat = activeCat === 'ALL' || c.category === activeCat;
    const matchKey = !keyword || c.title.toLowerCase().includes(keyword) || c.coachName.toLowerCase().includes(keyword) || c.room.toLowerCase().includes(keyword);
    return matchCat && matchKey;
  });

  return `
    <div class="space-y-6">
      <!-- Discovery Hero Header -->
      <div class="bg-gradient-to-r from-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div class="max-w-2xl">
          <div class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider mb-3">
            Lịch Học & Đặt Chỗ Tuần Này
          </div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Khám Phá Các Lớp Học Thể Thao</h2>
          <p class="text-indigo-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Đặt chỗ trước để đảm bảo vị trí cùng các huấn luyện viên chuyên nghiệp. Tất cả lớp Yoga, Zumba và Boxing đã bao gồm trong gói thẻ của bạn!
          </p>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <div class="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          ${categories.map(cat => `
            <button type="button" onclick="setMemberCategoryFilter('${cat}')" class="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition ${activeCat === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}">
              ${cat === 'ALL' ? 'Tất cả bộ môn' : cat}
            </button>
          `).join('')}
        </div>

        <div class="w-full sm:w-72">
          <input type="text" placeholder="Tìm lớp, HLV, phòng tập..." value="${appState.memberSearchKeyword}" oninput="setMemberSearchKeyword(this.value)" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs" />
        </div>
      </div>

      <!-- Class Cards Grid -->
      ${filtered.length === 0 ? `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div class="text-slate-400 text-sm font-semibold">Không tìm thấy lớp học nào phù hợp với bộ lọc.</div>
          <button type="button" onclick="setMemberCategoryFilter('ALL'); setMemberSearchKeyword('');" class="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700">
            Đặt lại bộ lọc
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(c => {
            const remaining = (c.maxCapacity || 20) - (c.bookedSeats || 0);
            const isFull = remaining <= 0;
            return `
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
                <div class="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img src="${c.image}" class="w-full h-full object-cover" />
                  <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800">
                    ${c.category}
                  </div>
                  <div class="absolute top-3 right-3 ${isFull ? 'bg-rose-500' : 'bg-emerald-600'} text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs">
                    ${isFull ? 'Đã hết chỗ' : `Còn ${remaining}/${c.maxCapacity} chỗ`}
                  </div>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 class="font-extrabold text-base text-slate-900 leading-snug">${c.title}</h3>
                    <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">${c.description}</p>

                    <div class="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Thời gian:</span>
                        <span class="font-semibold text-slate-800">${c.time} (${c.days})</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Phòng tập:</span>
                        <span class="font-semibold text-slate-800">${c.room}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">HLV phụ trách:</span>
                        <span class="font-semibold text-indigo-600">${c.coachName}</span>
                      </div>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-100">
                    <button type="button" onclick="openBookingModal('${c.id}')" ${isFull ? 'disabled' : ''} class="w-full py-2.5 ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow'} rounded-xl font-bold text-xs transition text-center">
                      ${isFull ? 'Lớp Đã Đầy Slot' : 'Đặt Chỗ Tham Gia Ngay'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderMemberPackageCatalog() {
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];

  return `
    <div class="space-y-8">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Chọn Gói Thẻ Hội Viên Phù Hợp</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-2">
          Đăng ký hoặc gia hạn trực tuyến tức thì. Hệ thống hỗ trợ quét mã QR Chuyển khoản ngân hàng hoặc thanh toán tại quầy lễ tân.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${packages.map(pkg => `
          <div class="bg-white rounded-2xl border ${pkg.popular ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-xs'} p-6 flex flex-col justify-between relative">
            ${pkg.popular ? `
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                Gói Phổ Biến Nhất
              </div>
            ` : ''}

            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${pkg.durationDays} Ngày Sử Dụng</div>
              <h3 class="text-lg font-black text-slate-900 mt-1">${pkg.name}</h3>
              <p class="text-xs text-slate-500 mt-2 min-h-[36px]">${pkg.description}</p>

              <div class="mt-4 pt-4 border-t border-slate-100">
                <div class="text-2xl font-black text-slate-900">${(pkg.price).toLocaleString()} <span class="text-xs font-normal text-slate-500">VND</span></div>
              </div>

              <div class="mt-5 space-y-2 text-xs text-slate-600">
                <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Quyền lợi gói:</div>
                ${(pkg.features || []).map(f => `
                  <div class="flex items-start space-x-2">
                    <span class="text-indigo-600 font-bold">&check;</span>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-100">
              <button type="button" onclick="openCheckoutModal('${pkg.id}')" class="w-full py-2.5 ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} rounded-xl font-bold text-xs transition shadow-xs">
                Đăng Ký Gói Này
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMemberMySchedule() {
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Lịch Tập & Lớp Đã Đăng Ký</h2>
          <p class="text-xs text-slate-500 mt-0.5">Lịch tháng hiển thị các buổi tập theo ngày có chấm chỉ báo. Bấm vào ngày để xem chi tiết.</p>
        </div>
        <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">
          + Đặt Thêm Lớp Mới
        </button>
      </div>

      ${renderMonthlyCalendarComponent('MEMBER')}
    </div>
  `;
}

function _unused_old_renderMemberMySchedule() {

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Lịch Tập & Lớp Đã Đăng Ký</h2>
          <p class="text-xs text-slate-500 mt-0.5">Danh sách các lớp thể thao bạn đã đặt chỗ thành công.</p>
        </div>
        <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">
          + Đặt Thêm Lớp Mới
        </button>
      </div>

      ${myClasses.length === 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div class="text-slate-400 text-sm font-semibold">Bạn chưa đặt chỗ lớp học nào trong tuần này.</div>
          <button type="button" onclick="switchTab('member-classes')" class="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
            Khám phá lịch lớp ngay
          </button>
        </div>
      ` : `
        <div class="space-y-4">
          ${myClasses.map(c => {
            const att = c.attendees.find(a => a.id === member.id);
            return `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                  <img src="${c.image}" class="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <div class="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase mb-1">${c.category}</div>
                    <h3 class="font-extrabold text-sm text-slate-900">${c.title}</h3>
                    <div class="text-xs text-slate-500 mt-1">
                      Thời gian: <strong class="text-slate-800">${c.time} (${c.days})</strong> &bull; Phòng: <strong class="text-slate-800">${c.room}</strong>
                    </div>
                    <div class="text-xs text-slate-500">
                      HLV: <span class="text-indigo-600 font-semibold">${c.coachName}</span>
                    </div>

                    ${att?.note ? `
                      <div class="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start space-x-2">
                        <span class="font-black uppercase tracking-wider text-[9px] text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">Nhận xét HLV</span>
                        <span class="font-medium">${att.note}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div class="flex items-center space-x-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${att?.attended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    ${att?.attended ? 'Đã điểm danh có mặt' : 'Đã xác nhận chỗ'}
                  </span>
                  <button type="button" onclick="cancelMemberBooking('${c.id}')" class="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition">
                    Hủy Chỗ
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

// NEW: Member Fitness Progress & InBody Page (ERD: WorkoutResults & TrainingGoal)
function renderMemberFitnessStats() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember);
  const inbody = member?.inbody || { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 };

  // Feedbacks from classes
  const feedbacks = [];
  (appState.data?.classes || []).forEach(c => {
    const att = (c.attendees || []).find(a => a.id === member.id);
    if (att && att.note) {
      feedbacks.push({
        classTitle: c.title,
        coachName: c.coachName,
        note: att.note,
        date: c.days
      });
    }
  });

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="pb-3 border-b border-slate-200">
        <h2 class="text-xl font-extrabold text-slate-900">Hồ Sơ Thể Trạng & Chỉ Số InBody</h2>
        <p class="text-xs text-slate-500 mt-0.5">Theo dõi các chỉ số sinh học và mục tiêu thể hình của bạn.</p>
      </div>

      <!-- InBody 4 Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cân Nặng</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.weight} <span class="text-xs font-normal text-slate-500">kg</span></div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Chuẩn thể trạng</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiều Cao</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.height} <span class="text-xs font-normal text-slate-500">cm</span></div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">Đo gần nhất: 01/08</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Mỡ (Body Fat)</div>
          <div class="text-2xl font-black text-indigo-600 mt-1">${inbody.bodyFat}%</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">&darr; -1.2% so với tháng trước</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chỉ Số BMI</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.bmi}</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Mức bình thường lý tưởng</div>
        </div>
      </div>

      <!-- Training Goal Card -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div class="flex justify-between items-center">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Mục Tiêu Thể Hình Hiện Tại (Training Goal)</div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Đang bám sát lộ trình
          </span>
        </div>
        <div class="text-base font-bold text-slate-900">${member.trainingGoal || 'Giảm mỡ, tăng cơ săn chắc'}</div>
        <p class="text-xs text-slate-500">
          Khuyến nghị từ HLV: Duy trì tối thiểu 3 buổi/tuần, kết hợp 1 buổi Yoga kéo giãn cơ khớp sau các buổi tập nặng.
        </p>
      </div>

      <!-- Personal Workout Plans Card (Strict ERD: WorkoutPlans & MemberPlan) -->
      ${(() => {
        const myMemberPlans = (appState.data?.memberPlans || []).filter(mp => mp.memberId === member.id);
        const workoutPlans = appState.data?.workoutPlans || [];
        const assignedPlans = myMemberPlans.map(mp => {
          const plan = workoutPlans.find(wp => (wp.planId || wp.id) === mp.planId);
          return {
            ...mp,
            plan: plan || { planName: 'Giáo án cá nhân', duration: '4 tuần', exercises: 'Đang cập nhật', dueDate: '2026-10-31' }
          };
        });

        return `
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Lộ Trình Giáo Án Riêng Do HLV Phụ Trách (Workout Plans)
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Giáo án luyện tập chuyên biệt thiết kế riêng cho mục tiêu và thể trạng của bạn.</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${assignedPlans.length} lộ trình đã giao
              </span>
            </div>

            ${assignedPlans.length === 0 ? `
              <div class="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                Bạn chưa có giáo án riêng nào được giao. HLV sẽ thiết kế lộ trình sau khi hoàn thành buổi kiểm tra InBody đầu tiên!
              </div>
            ` : `
              <div class="space-y-3">
                ${assignedPlans.map(item => `
                  <div class="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 transition space-y-2">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span class="font-bold text-xs text-slate-900">${item.plan.planName}</span>
                        <span class="text-[10px] text-slate-400 font-mono">(${item.planId})</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-[11px] text-slate-500 font-medium">Thời lượng: <b>${item.plan.duration}</b></span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}">
                          ${item.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                        </span>
                      </div>
                    </div>

                    <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                      <span class="font-bold text-indigo-700">Chi tiết bài tập:</span> ${item.plan.exercises}
                    </div>

                    <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Ngày bắt đầu: <b>${item.assignedDate}</b></span>
                      <span>Hạn hoàn thành: <b class="text-rose-600">${item.plan.dueDate}</b></span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      })()}

      <!-- Coach Feedbacks History -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Lịch Sử Đánh Giá & Nhận Xét Chuyên Môn Của HLV (Workout Feedback)
        </h3>

        ${feedbacks.length === 0 ? `
          <div class="text-xs text-slate-400 py-4 text-center">Chưa có nhận xét nào từ HLV sau các buổi tập.</div>
        ` : `
          <div class="divide-y divide-slate-100">
            ${feedbacks.map(f => `
              <div class="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div class="text-xs font-bold text-slate-900">${f.classTitle} &bull; <span class="text-indigo-600">HLV ${f.coachName}</span></div>
                  <div class="text-xs text-slate-600 mt-1">"${f.note}"</div>
                </div>
                <span class="text-[11px] text-slate-400">${f.date}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ENHANCED: Member Digital Pass & Personal Invoices History
function renderMemberDigitalPass() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember);
  const myInvoices = (appState.data?.invoices || []).filter(inv => inv.memberId === member.id);

  return `
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Digital Pass Card -->
      <div class="max-w-md mx-auto space-y-4">
        <div class="text-center">
          <h2 class="text-xl font-extrabold text-slate-900">Thẻ Hội Viên Điện Tử</h2>
          <p class="text-xs text-slate-500 mt-0.5">Sử dụng mã QR này để quẹt qua cổng Turnstile tự động tại trung tâm.</p>
        </div>

        <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">SPORTS CENTER PASS</div>
              <div class="text-lg font-black tracking-tight mt-1">${member.activePackage}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${member.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'}">
              ${member.status}
            </span>
          </div>

          <!-- Simulated QR Code Container -->
          <div class="my-6 bg-white p-4 rounded-2xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-inner">
            <div class="w-32 h-32 border-4 border-slate-900 p-2 flex flex-col justify-between">
              <div class="flex justify-between">
                <div class="w-7 h-7 bg-slate-900"></div>
                <div class="w-7 h-7 bg-slate-900"></div>
              </div>
              <div class="text-center font-black text-xs text-slate-900 tracking-widest">${member.id}</div>
              <div class="flex justify-between">
                <div class="w-7 h-7 bg-slate-900"></div>
                <div class="w-3 h-3 bg-slate-900 self-end"></div>
              </div>
            </div>
            <div class="text-[9px] font-bold text-slate-500 mt-1.5 uppercase tracking-wider">QR Code Cổng Check-in</div>
          </div>

          <div class="pt-4 border-t border-white/10 flex justify-between items-end text-xs">
            <div>
              <div class="text-slate-400 text-[10px] uppercase font-semibold">Chủ thẻ</div>
              <div class="font-bold text-sm text-white">${member.name}</div>
              <div class="text-slate-400 text-[11px]">${member.phone}</div>
            </div>
            <div class="text-right">
              <div class="text-slate-400 text-[10px] uppercase font-semibold">Thời hạn thẻ</div>
              <div class="font-bold text-emerald-400">${member.endDate}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Invoices / Payment History Table -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Lịch Sử Hóa Đơn Thanh Toán Cá Nhân</h3>
          <div class="text-xs text-slate-400">Các giao dịch mua gói tập và gia hạn của bạn</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
              <tr>
                <th class="py-3 px-4">Mã Hóa Đơn</th>
                <th class="py-3 px-4">Gói Đăng Ký</th>
                <th class="py-3 px-4">Số Tiền</th>
                <th class="py-3 px-4">Hình Thức</th>
                <th class="py-3 px-4">Ngày Thanh Toán</th>
                <th class="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${myInvoices.map(inv => `
                <tr class="hover:bg-slate-50/70 transition">
                  <td class="py-3 px-4 font-bold text-slate-900">${inv.id}</td>
                  <td class="py-3 px-4 font-semibold text-indigo-700">${inv.packageName}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${(inv.amount).toLocaleString()} đ</td>
                  <td class="py-3 px-4 text-slate-600">${inv.paymentMethod}</td>
                  <td class="py-3 px-4 text-slate-500">${inv.date}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${inv.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Support Tickets & Inquiries (Strict ERD: SupportTickets) -->
      ${(() => {
        const myTickets = (appState.data?.supportTickets || []).filter(t => t.memberId === member.id);
        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Phiếu Yêu Cầu Hỗ Trợ & Khiếu Nại (Support Tickets)</h3>
                <div class="text-xs text-slate-400">Gửi phản hồi trực tiếp tới quầy lễ tân khi gặp sự cố, quên đồ hoặc cần trợ giúp</div>
              </div>
              <button type="button" onclick="openSupportTicketModal()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">
                + Gửi Yêu Cầu Hỗ Trợ Mới
              </button>
            </div>

            ${myTickets.length === 0 ? `
              <div class="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Bạn chưa gửi yêu cầu hỗ trợ nào. Khi cần hỗ trợ hãy bấm vào nút phía trên!
              </div>
            ` : `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                    <tr>
                      <th class="py-3 px-4">Mã Phiếu</th>
                      <th class="py-3 px-4">Nội Dung Yêu Cầu</th>
                      <th class="py-3 px-4">Thời Gian Gửi</th>
                      <th class="py-3 px-4">Trạng Thái</th>
                      <th class="py-3 px-4">Phản Hồi Lễ Tân</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${myTickets.map(t => `
                      <tr class="hover:bg-slate-50/70 transition">
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${t.ticketId || t.id}</td>
                        <td class="py-3.5 px-4 text-slate-800 font-medium max-w-xs">${t.content}</td>
                        <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">${t.createdDate}</td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }">
                            ${
                              t.status === 'RESOLVED' ? 'Đã Giải Quyết' :
                              t.status === 'REJECTED' ? 'Từ Chối' :
                              'Đang Chờ'
                            }
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 max-w-xs">
                          ${
                            t.status === 'REJECTED' ? `<span class="text-rose-700 font-medium">${t.response}</span>` :
                            t.status === 'RESOLVED' ? `<span class="text-emerald-800 font-medium">${t.response}</span>` :
                            '<span class="italic text-slate-400">Lễ tân đang kiểm tra...</span>'
                          }
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        `;
      })()}
    </div>
  `;
}

function renderMemberBookingModal() {
  const c = appState.selectedClassForBooking;
  if (!c) return '';
  const remaining = (c.maxCapacity || 20) - (c.bookedSeats || 0);

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">${c.category}</div>
            <h3 class="text-lg font-black text-slate-900 mt-0.5">${c.title}</h3>
          </div>
          <button type="button" onclick="closeBookingModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
          <div class="flex justify-between">
            <span class="text-slate-400">Thời gian:</span>
            <span class="font-bold text-slate-800">${c.time} (${c.days})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Phòng tập:</span>
            <span class="font-bold text-slate-800">${c.room}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Huấn luyện viên:</span>
            <span class="font-bold text-indigo-600">${c.coachName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Chỗ trống còn lại:</span>
            <span class="font-bold text-emerald-600">${remaining} / ${c.maxCapacity} chỗ</span>
          </div>
        </div>

        <div class="mt-4 text-xs text-slate-500">
          * Bạn có thể hủy đặt chỗ trước giờ học tối thiểu 2 tiếng mà không bị tính phí.
        </div>

        <div class="mt-6 flex space-x-3">
          <button type="button" onclick="closeBookingModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
            Đóng
          </button>
          <button type="button" onclick="confirmBooking('${c.id}')" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Xác Nhận Đặt Chỗ
          </button>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// MEMBER CHECKOUT: 2-COLUMN SHOPEE-STYLE CHECKOUT, VNPAY-QR & RESULT CARD
// =========================================================================

function renderMemberCheckoutModal() {
  const flow = appState.checkoutFlow;
  const pkg = (flow && flow.package) ? flow.package : appState.selectedPackageForCheckout;
  if (!pkg || (flow && !flow.isOpen && !appState.selectedPackageForCheckout)) return '';

  const step = flow ? flow.step : 'FORM';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-2 sm:p-5 animate-fade-in">
      ${step === 'FORM' ? renderShopeeCheckoutForm(pkg, flow) : ''}
      ${step === 'VNPAY' ? renderShopeeCheckoutVnpayGateway(pkg, flow) : ''}
      ${step === 'CARD_PROCESSING' ? renderShopeeCheckoutCardGateway(pkg, flow) : ''}
      ${step === 'RESULT' ? renderShopeeCheckoutResultCard(pkg, flow) : ''}
    </div>
  `;
}

function renderShopeeCheckoutForm(pkg, flow) {
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };
  const card = flow?.cardInfo || { number: '9704 1988 5678 9012', holder: 'PHAM THU TRANG', expiry: '10/29', cvv: '888' };
  const method = flow?.paymentMethod || 'VNPAY';

  return `
    <div class="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-3.5 my-auto animate-in fade-in zoom-in-95 duration-150">
      <!-- Checkout Header -->
      <div class="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Sports Center Checkout
            </span>
            <span class="text-xs text-slate-400 font-semibold">&bull; Bảo mật PCI-DSS</span>
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">Thanh Toán Gói Tập Hội Viên</h2>
          <p class="text-xs text-slate-500 mt-0.5">Xác nhận thông tin đăng ký và kích hoạt thẻ tự động sau khi thanh toán.</p>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-lg transition">
          &times;
        </button>
      </div>

      <!-- 2-Column Shopee Layout: Left Details, Right Payment Form -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- LEFT COLUMN: Chi Tiết Gói Tập (5 Cols) -->
        <div class="lg:col-span-5 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                ${pkg.type || 'ALL-ACCESS'}
              </span>
              <span class="text-xs font-bold text-slate-500">${pkg.durationDays} Ngày Sử Dụng</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 mt-2 leading-snug">${pkg.name || pkg.packageName}</h3>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${pkg.description || 'Gói tập chất lượng cao với quyền lợi đầy đủ tại Sports Center.'}</p>
          </div>

          <!-- Price Box -->
          <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div class="flex justify-between items-center text-xs text-slate-500">
              <span>Đơn giá niêm yết:</span>
              <span class="line-through text-slate-400">${((pkg.price || 0) * 1.2).toLocaleString()} đ</span>
            </div>
            <div class="flex justify-between items-center text-xs text-emerald-600 font-bold">
              <span>Ưu đãi thành viên mới:</span>
              <span>-20% Ưu Đãi</span>
            </div>
            <div class="pt-1.5 border-t border-slate-100 flex justify-between items-baseline">
              <span class="text-xs font-bold text-slate-900">Tổng thanh toán:</span>
              <span class="text-lg sm:text-xl font-black text-indigo-700">${(pkg.price || 0).toLocaleString()} <span class="text-xs font-bold">VND</span></span>
            </div>
          </div>

          <!-- Perks Checklist -->
          <div class="space-y-2 pt-0.5">
            <div class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Đặc quyền hội viên đi kèm:</div>
            <div class="space-y-1.5 text-xs text-slate-700">
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Check-in tự động cổng Turnstile không giới hạn</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Miễn phí tủ đồ Locker thông minh và phòng tắm nóng lạnh</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Đo InBody định kỳ & nhận giáo án tập luyện từ HLV</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Quyền đặt trước lịch học Yoga, Boxing, Zumba, Pilates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Form Thông Tin & Thanh Toán (7 Cols) -->
        <div class="lg:col-span-7 space-y-3.5">
          <!-- Step 1: Buyer Information -->
          <div class="space-y-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider">Thông Tin Khách Hàng (Họ, Tên, Số Điện Thoại)</h4>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Họ Đệm <span class="text-rose-500">*</span></label>
                <input type="text" id="checkout-buyer-lastname" value="${buyer.lastName}" oninput="updateCheckoutBuyerInfo('lastName', this.value)" placeholder="Ví dụ: Phạm" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên <span class="text-rose-500">*</span></label>
                <input type="text" id="checkout-buyer-firstname" value="${buyer.firstName}" oninput="updateCheckoutBuyerInfo('firstName', this.value)" placeholder="Ví dụ: Thu Trang" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Điện Thoại Nhận Thông Báo <span class="text-rose-500">*</span></label>
              <input type="tel" id="checkout-buyer-phone" value="${buyer.phone}" oninput="updateCheckoutBuyerInfo('phone', this.value)" placeholder="0912345678" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <!-- Step 2: Payment Method Selection -->
          <div class="space-y-2.5 pt-1">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider">Phương Thức Thanh Toán Trực Tuyến</h4>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- VNPAY-QR Card -->
              <div onclick="setCheckoutPaymentMethod('VNPAY')" class="p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${method === 'VNPAY' ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}">
                <input type="radio" name="checkout_method_radio" value="VNPAY" ${method === 'VNPAY' ? 'checked' : ''} class="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-black text-xs text-slate-900">Cổng VNPAY-QR</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Phổ biến</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">Quét mã QR từ 40+ app ngân hàng & Ví VNPAY.</p>
                </div>
              </div>

              <!-- Credit/Debit Card -->
              <div onclick="setCheckoutPaymentMethod('CARD')" class="p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${method === 'CARD' ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}">
                <input type="radio" name="checkout_method_radio" value="CARD" ${method === 'CARD' ? 'checked' : ''} class="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-black text-xs text-slate-900">Thẻ Quốc Tế / ATM</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">Thanh toán bằng thẻ Visa, Mastercard hoặc Napas.</p>
                </div>
              </div>
            </div>

            <!-- Conditional Details: If Card is selected -->
            ${method === 'CARD' ? `
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-100">
                <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Thông Tin Thẻ Thanh Toán</span>
                  <div class="flex items-center space-x-1.5">
                    <!-- Visa SVG Logo -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Visa">
                      <svg class="h-3 w-auto" viewBox="0 0 36 12" fill="none">
                        <path d="M14.5 0.5L9.6 11.5H6.4L3.9 2.5C3.8 2 3.6 1.7 3.1 1.4C2.3 1 1.1 0.7 0 0.5L0.1 0.2H5.3C6 0.2 6.6 0.7 6.8 1.4L8 8.2L11.3 0.2H14.5V0.5ZM27.3 7.8C27.3 4.8 23.1 4.6 23.2 3.3C23.3 2.9 23.7 2.4 24.5 2.3C25 2.2 26.2 2.2 27.4 2.7L27.9 0.4C27.3 0.2 26.4 0 25.3 0C22.2 0 20 1.6 20 4C19.9 5.8 21.6 6.7 22.8 7.3C24 7.9 24.5 8.3 24.5 8.8C24.4 9.6 23.4 10 22.6 10C21 10 20.1 9.5 19.3 9.1L18.8 11.5C19.6 11.9 21.1 12.2 22.5 12.2C25.7 12.2 27.9 10.6 27.9 8.2L27.3 7.8ZM35.7 11.5H38.5L36 0.2H33.4C32.8 0.2 32.3 0.6 32.1 1.1L27.4 11.5H30.6L31.2 9.8H35.2L35.7 11.5ZM32.1 7.4L33.7 3.1L34.7 7.4H32.1ZM18.8 0.2L16.3 11.5H13.2L15.7 0.2H18.8Z" fill="#1434CB"/>
                      </svg>
                    </div>
                    <!-- Mastercard SVG Logo -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Mastercard">
                      <svg class="h-3.5 w-auto" viewBox="0 0 28 18" fill="none">
                        <circle cx="10" cy="9" r="6.5" fill="#EB001B"/>
                        <circle cx="18" cy="9" r="6.5" fill="#F79E1B"/>
                        <path d="M14 4.13A6.47 6.47 0 0 0 11.6 9 6.47 6.47 0 0 0 14 13.87 6.47 6.47 0 0 0 16.4 9 6.47 6.47 0 0 0 14 4.13Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <!-- Napas SVG Logo -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Napas">
                      <svg class="h-3 w-auto" viewBox="0 0 54 16" fill="none">
                        <path d="M2 13V3h3.5l4 6.5V3H13v10H9.5L5.5 6.5V13H2z" fill="#005BAA"/>
                        <path d="M18 13l-1-2.5h-4L12 13h-2.5l4.5-10h2.5l4.5 10H18zm-3-8l-1.5 4h3L15 5z" fill="#005BAA"/>
                        <path d="M22 13V3h4c2.5 0 4 1.2 4 3.5s-1.5 3.5-4 3.5h-2v3H22zm2-5h2c1.2 0 2-.5 2-1.5s-.8-1.5-2-1.5h-2v3z" fill="#005BAA"/>
                        <path d="M33 13l-1-2.5h-4L27 13h-2.5l4.5-10h2.5l4.5 10H33zm-3-8l-1.5 4h3L30 5z" fill="#005BAA"/>
                        <path d="M38 13.2c-2.5 0-4.2-1.2-4.2-3.2h2.5c0 1 .8 1.5 1.7 1.5 1 0 1.6-.4 1.6-1 0-.7-.5-1-1.7-1.3l-1.2-.3c-2-.5-2.8-1.4-2.8-2.7 0-1.8 1.6-3.2 3.8-3.2 2.2 0 3.7 1.2 3.8 2.8H41c0-.8-.7-1.3-1.5-1.3-.9 0-1.4.4-1.4.9 0 .6.5.9 1.5 1.1l1.1.3c2.2.5 3 1.4 3 2.8 0 2-1.7 3.3-4.2 3.3z" fill="#005BAA"/>
                        <circle cx="48" cy="8" r="3" fill="#EE2E24"/>
                        <circle cx="50.5" cy="5" r="2" fill="#F7941D"/>
                        <circle cx="50.5" cy="11" r="2" fill="#00A850"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Thẻ (16 chữ số) <span class="text-rose-500">*</span></label>
                  <input type="text" id="checkout-card-number" maxlength="19" value="${card.number}" oninput="updateCheckoutCardInfo('number', this.value)" placeholder="9704 1988 5678 9012" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên In Trên Thẻ (Không dấu) <span class="text-rose-500">*</span></label>
                  <input type="text" id="checkout-card-holder" value="${card.holder}" oninput="updateCheckoutCardInfo('holder', this.value)" placeholder="PHAM THU TRANG" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Ngày Hết Hạn <span class="text-rose-500">*</span></label>
                    <input type="text" id="checkout-card-expiry" maxlength="5" value="${card.expiry}" oninput="updateCheckoutCardInfo('expiry', this.value)" placeholder="MM/YY (10/29)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Mã Bảo Mật CVV <span class="text-rose-500">*</span></label>
                    <input type="password" id="checkout-card-cvv" maxlength="4" value="${card.cvv}" oninput="updateCheckoutCardInfo('cvv', this.value)" placeholder="•••" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            ` : `
              <div class="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2.5">
                <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">QR</div>
                <div class="space-y-0.5">
                  <div class="font-bold text-xs">Mã QR Thanh Toán Tức Thì VNPAY</div>
                  <div class="text-[11px] text-slate-600 leading-relaxed">
                    Sau khi bấm tiếp tục, hệ thống sẽ mở mã QR VNPAY chính hãng. Bạn chỉ cần mở app ngân hàng quét mã và xác nhận chuyển tiền.
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
            <button type="button" onclick="closeCheckoutModal()" class="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
              Hủy Bỏ
            </button>
            <button type="button" onclick="handleProceedToPayment()" class="w-full sm:flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center space-x-2">
              <span>${method === 'VNPAY' ? 'Tiếp Tục Với Cổng VNPAY-QR' : 'Thanh Toán ' + (pkg.price || 0).toLocaleString() + ' VND Ngay'}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderShopeeCheckoutVnpayGateway(pkg, flow) {
  const orderId = flow?.orderId || ('VNP' + Math.floor(100000 + Math.random() * 900000));
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      <!-- VNPAY Brand Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
            VNP
          </div>
          <div>
            <div class="font-black text-xs sm:text-sm tracking-tight text-slate-900 leading-tight">CỔNG THANH TOÁN VNPAY-QR</div>
            <div class="text-[10px] text-slate-400 font-semibold">Giao dịch thanh toán trực tuyến an toàn</div>
          </div>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
      </div>

      <!-- Order Summary Card -->
      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Đơn vị thụ hưởng:</span>
          <span class="font-bold text-slate-900">SPORTS CENTER VIETNAM</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Gói đăng ký:</span>
          <span class="font-bold text-indigo-700">${pkg.name || pkg.packageName} (${pkg.durationDays} Ngày)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Mã giao dịch (Order ID):</span>
          <span class="font-mono font-bold text-slate-800">${orderId}</span>
        </div>
        <div class="flex justify-between pt-1.5 border-t border-slate-200 text-sm">
          <span class="font-bold text-slate-900">Số tiền cần thanh toán:</span>
          <span class="font-black text-rose-600 text-base">${(pkg.price || 0).toLocaleString()} VND</span>
        </div>
      </div>

      <!-- QR Code Display Container -->
      <div class="space-y-2.5">
        <div class="relative mx-auto w-48 h-48 p-2.5 bg-white rounded-2xl border-2 border-indigo-500 shadow-md flex flex-col items-center justify-center">
          <!-- Stylized QR Code SVG -->
          <svg class="w-full h-full text-slate-900" viewBox="0 0 200 200" fill="currentColor">
            <!-- Position Marks -->
            <rect x="10" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="27" y="27" width="16" height="16" rx="2" fill="#4338ca" />

            <rect x="140" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="157" y="27" width="16" height="16" rx="2" fill="#4338ca" />

            <rect x="10" y="140" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="27" y="157" width="16" height="16" rx="2" fill="#4338ca" />

            <!-- Random simulated QR data grid -->
            <rect x="70" y="20" width="12" height="12" rx="2" fill="#1e1b4b" />
            <rect x="90" y="15" width="12" height="12" rx="2" fill="#1e1b4b" />
            <rect x="115" y="25" width="12" height="12" rx="2" fill="#1e1b4b" />
            <rect x="75" y="45" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="105" y="45" width="16" height="16" rx="2" fill="#4338ca" />

            <rect x="25" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="45" y="85" width="14" height="14" rx="2" fill="#4338ca" />
            <rect x="75" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="100" y="80" width="12" height="12" rx="2" fill="#1e1b4b" />
            <rect x="125" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="150" y="85" width="14" height="14" rx="2" fill="#4338ca" />

            <rect x="75" y="115" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="100" y="110" width="18" height="18" rx="2" fill="#4338ca" />
            <rect x="130" y="115" width="14" height="14" rx="2" fill="#1e1b4b" />

            <rect x="70" y="150" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="95" y="160" width="16" height="16" rx="2" fill="#1e1b4b" />
            <rect x="125" y="150" width="14" height="14" rx="2" fill="#4338ca" />
            <rect x="150" y="160" width="14" height="14" rx="2" fill="#1e1b4b" />
            <rect x="170" y="145" width="14" height="14" rx="2" fill="#1e1b4b" />

            <!-- Center Logo Badge -->
            <rect x="78" y="78" width="44" height="44" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <text x="100" y="104" font-size="11" font-weight="900" fill="#4338ca" text-anchor="middle" font-family="sans-serif">VNPAY</text>
          </svg>
        </div>

        <!-- Countdown Timer -->
        <div class="flex items-center justify-center space-x-1.5 text-xs text-slate-500">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Mã QR sẽ hết hiệu lực sau: <b class="font-mono text-indigo-700">14:52</b></span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
        <div class="font-bold text-slate-800">Hướng dẫn quét mã thanh toán:</div>
        <div>1. Mở ứng dụng Ngân hàng (Vietcombank, MB, Techcombank...) hoặc Ví VNPAY.</div>
        <div>2. Chọn tính năng <b>Quét QR (QR Pay)</b> và hướng camera về mã trên.</div>
        <div>3. Kiểm tra số tiền <b>${(pkg.price || 0).toLocaleString()} VND</b> và bấm <b>Xác nhận chuyển tiền</b>.</div>
      </div>

      <!-- Simulation Action Buttons -->
      <div class="space-y-2 pt-1">
        <button type="button" onclick="handleSimulatePaymentSuccess()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2">
          <span>✔ [Mô Phỏng] Ngân Hàng Xác Nhận Đã Nhận Tiền Thành Công</span>
        </button>
        <button type="button" onclick="handleSimulatePaymentFailure('Giao dịch bị từ chối hoặc người dùng hủy thao tác quét mã VNPAY.')" class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition">
          ✕ [Mô Phỏng] Giả Lập Thanh Toán Thất Bại / Hủy Bỏ
        </button>
        <button type="button" onclick="handleBackToCheckoutForm()" class="text-xs text-slate-500 hover:text-slate-800 hover:underline font-semibold pt-0.5">
          &larr; Quay lại form chọn phương thức khác
        </button>
      </div>
    </div>
  `;
}

function renderShopeeCheckoutCardGateway(pkg, flow) {
  const card = flow?.cardInfo || { number: '9704 1988 5678 9012' };
  const last4 = (card.number || '9012').replace(/\s/g, '').slice(-4);

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
            3DS
          </div>
          <div>
            <div class="font-bold text-xs text-slate-900 uppercase">Xác Thực Thẻ 3D-Secure</div>
            <div class="text-[10px] text-slate-400">Bảo mật giao dịch trực tuyến</div>
          </div>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
      </div>

      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Thẻ thanh toán:</span>
          <span class="font-mono font-bold text-slate-900">•••• •••• •••• ${last4}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Số tiền giao dịch:</span>
          <span class="font-black text-indigo-700 text-sm">${(pkg.price || 0).toLocaleString()} VND</span>
        </div>
      </div>

      <div class="space-y-2.5">
        <p class="text-xs text-slate-600 leading-relaxed">
          Mã xác thực giao dịch một lần (OTP) đã được gửi đến số điện thoại đăng ký thẻ của bạn.
        </p>

        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nhập mã xác thực OTP (6 chữ số)</label>
          <input type="text" id="card-otp-input" value="888888" maxlength="6" class="w-44 mx-auto px-3 py-2.5 bg-white border-2 border-indigo-500 rounded-xl text-center font-mono font-black text-lg tracking-widest text-slate-900 shadow-inner focus:outline-none" />
        </div>
        <div class="text-[10px] text-slate-400">Mã có hiệu lực trong 02:00 phút. Điền sẵn mã mẫu: <b>888888</b></div>
      </div>

      <div class="space-y-2 pt-1">
        <button type="button" onclick="handleSimulatePaymentSuccess()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition">
          Xác Nhận Mã OTP & Hoàn Tất Trừ Tiền
        </button>
        <button type="button" onclick="handleSimulatePaymentFailure('Mã OTP không chính xác hoặc ngân hàng từ chối trừ tiền.')" class="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition">
          Hủy Bỏ Giao Dịch
        </button>
      </div>
    </div>
  `;
}

function renderShopeeCheckoutResultCard(pkg, flow) {
  const isSuccess = flow?.resultStatus === 'SUCCESS';
  const invoice = flow?.invoiceData || { id: 'INV1001', date: '2026-09-23 12:55', paymentMethod: 'Cổng VNPAY-QR' };
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      ${isSuccess ? `
        <!-- SUCCESS STATE: TICK XANH LÁ LỚN -->
        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Giao Dịch Thành Công
          </span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">THANH TOÁN THÀNH CÔNG!</h3>
          <p class="text-xs text-slate-500 mt-0.5">Chúc mừng bạn! Thẻ hội viên của bạn đã được kích hoạt trực tiếp trên hệ thống.</p>
        </div>

        <!-- Bảng chi tiết hóa đơn (Receipt Details) -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div class="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span class="text-slate-500">Mã hóa đơn:</span>
            <span class="font-mono font-bold text-slate-900">${invoice.id}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Gói đăng ký:</span>
            <span class="font-bold text-indigo-700">${pkg.name || pkg.packageName}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Thời hạn sử dụng:</span>
            <span class="font-bold text-slate-900">${pkg.durationDays} Ngày (Hạn đến: 23/11/2026)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Số tiền đã thanh toán:</span>
            <span class="font-black text-slate-900 text-sm">${(pkg.price || 0).toLocaleString()} VND</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Phương thức:</span>
            <span class="font-semibold text-slate-800">${invoice.paymentMethod}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Hội viên:</span>
            <span class="font-bold text-slate-900">${buyer.lastName} ${buyer.firstName} (${buyer.phone})</span>
          </div>
          <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Thời gian giao dịch:</span>
            <span>${invoice.date}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-0.5">
          <button type="button" onclick="handleFinishCheckout()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2">
            <span>Xem Thẻ Hội Viên Điện Tử Ngay</span>
            <span>&rarr;</span>
          </button>
          <button type="button" onclick="closeCheckoutModal()" class="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-bold transition">
            Quay Về Trang Chủ
          </button>
        </div>
      ` : `
        <!-- FAILED STATE: DẤU X ĐỎ LỚN -->
        <div class="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner ring-8 ring-rose-50">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            Giao Dịch Không Thành Công
          </span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">THANH TOÁN THẤT BẠI</h3>
          <p class="text-xs text-rose-600 font-medium mt-1 leading-relaxed">
            ${flow?.failureReason || 'Giao dịch chưa được hoàn tất do lỗi từ ngân hàng hoặc người dùng hủy thao tác.'}
          </p>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left">
          <div class="font-bold text-slate-800 mb-1">Gợi ý khắc phục:</div>
          <div>&bull; Kiểm tra lại hạn mức hoặc số dư khả dụng trong tài khoản/thẻ.</div>
          <div>&bull; Đảm bảo ứng dụng ngân hàng đã bật tính năng thanh toán trực tuyến.</div>
          <div>&bull; Bạn cũng có thể chọn phương thức thanh toán khác để tiếp tục.</div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-0.5">
          <button type="button" onclick="handleBackToCheckoutForm()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition">
            Thử Lại Thanh Toán
          </button>
          <button type="button" onclick="closeCheckoutModal()" class="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-bold transition">
            Đóng Hộp Thoại
          </button>
        </div>
      `}
    </div>
  `;
}

// =========================================================================
// USER PROFILE: MULTI-ROLE PROFILE MODAL & FULL-PAGE VIEW
// =========================================================================

const USER_AVATAR_PRESETS = [
  { id: 'av1', label: 'Nữ Fitness', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Nam Boxing', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Nữ Yoga', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Nam VĐV', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'HLV Trưởng', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Quản Lý / Lễ Tân', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
];

function getResolvedCurrentUserProfile() {
  const role = appState.currentRole || 'MEMBER';
  if (role === 'MEMBER') {
    const members = (appState.data && appState.data.members) ? appState.data.members : [];
    const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0] || {};
    const resolved = resolveMember(rawMember) || {};
    return {
      id: resolved.id || 'MEM101',
      name: resolved.name || 'Phạm Thu Trang',
      lastName: resolved.lastName || 'Phạm',
      firstName: resolved.firstName || 'Thu Trang',
      email: resolved.email || 'trang.pham@gmail.com',
      phone: resolved.phone || '0912345678',
      gender: rawMember.gender || 'Nữ',
      dob: rawMember.dob || '1998-05-18',
      address: rawMember.address || 'Khu Công Nghệ Cao Hòa Lạc, Hà Nội',
      trainingGoal: resolved.trainingGoal || 'Giảm mỡ, tăng cơ săn chắc & dẻo dai',
      emergencyContact: rawMember.emergencyContact || 'Nguyễn Văn A (Người thân) - 0988112233',
      avatar: appState.userProfileDraftAvatar || resolved.avatar || USER_AVATAR_PRESETS[0].url,
      role: 'MEMBER',
      roleLabel: 'Hội Viên Chính Thức',
      status: resolved.status || 'ACTIVE',
      activePackage: resolved.activePackage || 'Standard Gym & Cardio',
      startDate: resolved.startDate || '2026-08-01',
      endDate: resolved.endDate || '2026-11-01',
      inbody: resolved.inbody || { weight: 52, height: 162, bmi: 19.8, bodyFat: 21.5 }
    };
  } else if (role === 'COACH') {
    return {
      id: 'COACH01',
      name: 'Trần Hoàng Nam',
      lastName: 'Trần',
      firstName: 'Hoàng Nam',
      email: 'coach.nam@sportscenter.vn',
      phone: '0918765432',
      gender: 'Nam',
      dob: '1992-08-20',
      address: 'Quận Cầu Giấy, Hà Nội',
      trainingGoal: 'Chuyên gia huấn luyện Boxing, Thể lực & Yoga phục hồi',
      emergencyContact: 'Trần Thị B - 0977223344',
      avatar: appState.userProfileDraftAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      role: 'COACH',
      roleLabel: 'Huấn Luyện Viên Trưởng (Head Coach)',
      status: 'ACTIVE',
      activePackage: 'HLV Hợp Đồng Chính Thức',
      startDate: '2024-01-01',
      endDate: '2027-12-31'
    };
  } else if (role === 'RECEPTIONIST') {
    return {
      id: 'REC01',
      name: 'Lê Ngọc Lễ Tân',
      lastName: 'Lê',
      firstName: 'Ngọc',
      email: 'letan@sportscenter.vn',
      phone: '0901234567',
      gender: 'Nữ',
      dob: '1999-11-05',
      address: 'Quận Nam Từ Liêm, Hà Nội',
      trainingGoal: 'Điều phối vận hành quầy dịch vụ, cổng Turnstile & hỗ trợ hội viên',
      emergencyContact: 'Lê Văn C - 0966334455',
      avatar: appState.userProfileDraftAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'RECEPTIONIST',
      roleLabel: 'Chuyên Viên Lễ Tân & Điều Phối Kiosk',
      status: 'ACTIVE',
      activePackage: 'Nhân Sự Ca Sáng (06:00 - 14:00)',
      startDate: '2025-06-01',
      endDate: '2026-12-31'
    };
  } else {
    return {
      id: 'MGR01',
      name: 'Nguyễn Văn Quản Lý',
      lastName: 'Nguyễn',
      firstName: 'Văn Quản Lý',
      email: 'manager@sportscenter.vn',
      phone: '0919998888',
      gender: 'Nam',
      dob: '1988-03-12',
      address: 'Tòa nhà FPT, Phố Duy Tân, Hà Nội',
      trainingGoal: 'Giám đốc Vận hành & Quản trị Hệ thống Trung tâm Thể thao',
      emergencyContact: 'Nguyễn Thị D - 0911223344',
      avatar: appState.userProfileDraftAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'MANAGER',
      roleLabel: 'Tổng Quản Lý Trung Tâm (Center Director)',
      status: 'ACTIVE',
      activePackage: 'Toàn Quyền Quản Trị Hệ Thống (SuperAdmin)',
      startDate: '2023-01-01',
      endDate: '2030-12-31'
    };
  }
}

function renderProfileTabsContent(user, isModal) {
  const activeTab = appState.userProfileActiveTab || 'INFO';
  const role = user.role;

  return `
    <div class="space-y-4">
      <!-- User Hero Header Card -->
      <div class="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div class="relative group">
            <img src="${user.avatar}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-md" />
            <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">✓</span>
          </div>
          <div>
            <div class="flex items-center justify-center sm:justify-start space-x-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500 text-white tracking-wider">
                ${user.roleLabel}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${user.status === 'ACTIVE' ? 'Đang Hoạt Động' : user.status}
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black text-white mt-1">${user.name}</h3>
            <div class="text-xs text-indigo-200 mt-0.5 space-x-2">
              <span>Mã ID: <b class="font-mono font-bold text-white">${user.id}</b></span>
              <span>&bull;</span>
              <span>${user.email}</span>
            </div>
          </div>
        </div>

        <!-- Quick Info Pill -->
        <div class="text-center sm:text-right p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-xs w-full sm:w-auto">
          <div class="text-indigo-200 text-[11px] font-semibold">${role === 'MEMBER' ? 'Gói thẻ hiện tại:' : 'Chức vụ vận hành:'}</div>
          <div class="font-extrabold text-white mt-0.5">${user.activePackage}</div>
          <div class="text-[10px] text-slate-300 mt-1">${role === 'MEMBER' ? 'Hạn thẻ: ' + user.endDate : 'Hợp đồng: ' + user.endDate}</div>
        </div>
      </div>

      <!-- Quick Avatar Preset Selector -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span class="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Chọn nhanh ảnh đại diện mẫu:</span>
        <div class="flex items-center space-x-2 overflow-x-auto py-1">
          ${USER_AVATAR_PRESETS.map(av => `
            <button type="button" onclick="selectUserProfileAvatar('${av.url}')" class="relative group focus:outline-none" title="${av.label}">
              <img src="${av.url}" class="w-8 h-8 rounded-full object-cover border-2 transition ${user.avatar === av.url ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-110' : 'border-slate-300 hover:border-slate-500'}" />
              ${user.avatar === av.url ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full text-white text-[8px] flex items-center justify-center font-bold">✓</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Profile Sub-Tab Bar -->
      <div class="flex items-center space-x-1.5 border-b border-slate-200 pb-2">
        <button type="button" onclick="setUserProfileTab('INFO')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'INFO' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          👤 Thông Tin Cá Nhân
        </button>
        <button type="button" onclick="setUserProfileTab('SECURITY')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'SECURITY' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🔒 Bảo Mật & Mật Khẩu
        </button>
        <button type="button" onclick="setUserProfileTab('MEMBERSHIP')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'MEMBERSHIP' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ${role === 'MEMBER' ? '💳 Thẻ & Thể Trạng' : '📊 Quyền Hạn & Ca Làm'}
        </button>
      </div>

      <!-- Tab 1: Personal Info -->
      ${activeTab === 'INFO' ? `
        <form onsubmit="return handleSaveUserProfile(event)" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Họ Đệm <span class="text-rose-500">*</span></label>
              <input type="text" id="profile-form-lastname" value="${user.lastName}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên <span class="text-rose-500">*</span></label>
              <input type="text" id="profile-form-firstname" value="${user.firstName}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Điện Thoại <span class="text-rose-500">*</span></label>
              <input type="tel" id="profile-form-phone" value="${user.phone}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Email Tài Khoản</label>
              <input type="email" id="profile-form-email" value="${user.email}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Giới Tính</label>
              <select id="profile-form-gender" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                <option value="Nữ" ${user.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                <option value="Nam" ${user.gender === 'Nam' ? 'selected' : ''}>Nam</option>
                <option value="Khác" ${user.gender === 'Khác' ? 'selected' : ''}>Khác</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Ngày Sinh (DOB)</label>
              <input type="date" id="profile-form-dob" value="${user.dob}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Địa Chỉ Thường Trú</label>
            <input type="text" id="profile-form-address" value="${user.address}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">${role === 'MEMBER' ? 'Mục Tiêu Rèn Luyện (Training Goal)' : 'Mô Tả Chuyên Môn / Công Tác'}</label>
            <input type="text" id="profile-form-goal" value="${user.trainingGoal}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Người Liên Hệ Khẩn Cấp</label>
              <input type="text" id="profile-form-emergency" value="${user.emergencyContact}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Tùy Chỉnh URL Ảnh Đại Diện</label>
              <input type="url" id="profile-form-avatar" placeholder="https://..." value="${appState.userProfileDraftAvatar || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng
              </button>
            ` : ''}
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center space-x-2">
              <span>Lưu Cập Nhật Hồ Sơ</span>
              <span>✓</span>
            </button>
          </div>
        </form>
      ` : ''}

      <!-- Tab 2: Security & Password -->
      ${activeTab === 'SECURITY' ? `
        <form onsubmit="return handleChangeUserPassword(event)" class="space-y-4">
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div class="font-bold flex items-center space-x-1.5">
              <span>🛡️</span>
              <span>Tiêu Chuẩn Bảo Mật Tài Khoản Sports Center</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              Mật khẩu demo mặc định là <b class="font-mono text-amber-950 font-black">123</b>. Bạn có thể đổi sang mật khẩu mới để bảo vệ thông tin cá nhân và lượt check-in.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Mật Khẩu Hiện Tại <span class="text-rose-500">*</span></label>
              <input type="password" id="profile-sec-current-pass" value="123" placeholder="Nhập mật khẩu hiện tại..." class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Mật Khẩu Mới (Tối thiểu 6 ký tự) <span class="text-rose-500">*</span></label>
                <input type="password" id="profile-sec-new-pass" placeholder="••••••••" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Xác Nhận Mật Khẩu Mới <span class="text-rose-500">*</span></label>
                <input type="password" id="profile-sec-confirm-pass" placeholder="••••••••" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div class="font-bold text-slate-700">Yêu cầu bảo mật:</div>
            <div>&bull; Mật khẩu nên chứa cả chữ hoa, chữ thường và chữ số.</div>
            <div>&bull; Mọi thay đổi mật khẩu sẽ được ghi nhận vào nhật ký kiểm toán hệ thống.</div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng
              </button>
            ` : ''}
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition">
              Cập Nhật Mật Khẩu Mới
            </button>
          </div>
        </form>
      ` : ''}

      <!-- Tab 3: Membership & Stats -->
      ${activeTab === 'MEMBERSHIP' ? `
        <div class="space-y-4">
          ${role === 'MEMBER' ? `
            <!-- Digital Member Card View -->
            <div class="p-5 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl text-white shadow-md space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 text-white">SPORTS CENTER PASS</span>
                  <h4 class="text-base font-black mt-1 tracking-tight">${user.activePackage}</h4>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950">
                  ${user.status}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/20">
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Chủ Thẻ</div>
                  <div class="font-bold">${user.name}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Mã Hội Viên</div>
                  <div class="font-mono font-bold">${user.id}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Ngày Kích Hoạt</div>
                  <div class="font-semibold">${user.startDate}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Ngày Hết Hạn</div>
                  <div class="font-bold text-amber-300">${user.endDate}</div>
                </div>
              </div>
            </div>

            <!-- InBody Quick Glance -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Cân Nặng</div>
                <div class="text-lg font-black text-slate-900 mt-0.5">${user.inbody?.weight || 52} <span class="text-xs font-normal">kg</span></div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Chiều Cao</div>
                <div class="text-lg font-black text-slate-900 mt-0.5">${user.inbody?.height || 162} <span class="text-xs font-normal">cm</span></div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Chỉ Số BMI</div>
                <div class="text-lg font-black text-indigo-600 mt-0.5">${user.inbody?.bmi || 19.8}</div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Tỷ Lệ Mỡ</div>
                <div class="text-lg font-black text-emerald-600 mt-0.5">${user.inbody?.bodyFat || 21.5}%</div>
              </div>
            </div>

            <!-- Activity Stats -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div class="font-bold text-slate-800">Thống Kê Hoạt Động Luyện Tập:</div>
              <div class="flex justify-between items-center py-1 border-b border-slate-200">
                <span class="text-slate-500">Lượt check-in qua cổng Turnstile tự động:</span>
                <span class="font-bold text-slate-900">18 Buổi</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-slate-200">
                <span class="text-slate-500">Số lớp học thể thao (Yoga, Boxing, Zumba) đã giữ chỗ:</span>
                <span class="font-bold text-slate-900">${(appState.data?.classEnrollments || []).filter(e => e.memberId === user.id).length || 5} Lớp</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-slate-500">Số hóa đơn thanh toán gói tập trực tuyến:</span>
                <span class="font-bold text-indigo-700">${(appState.data?.invoices || []).filter(i => i.memberId === user.id).length || 3} Hóa đơn</span>
              </div>
            </div>
          ` : `
            <!-- Staff Role Permissions Glance -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div class="font-bold text-slate-800 text-sm">Thông Tin Nhiệm Vụ Vận Hành:</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="p-3 bg-white rounded-xl border border-slate-200">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">Mã Nhân Sự</div>
                  <div class="text-sm font-black text-slate-900 mt-0.5">${user.id}</div>
                </div>
                <div class="p-3 bg-white rounded-xl border border-slate-200">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">Bộ Phận / Ban</div>
                  <div class="text-sm font-black text-slate-900 mt-0.5">${role === 'COACH' ? 'HLV Thể Thao' : (role === 'RECEPTIONIST' ? 'Lễ Tân & Kiosk' : 'Ban Giám Đốc')}</div>
                </div>
              </div>
              <div class="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                <b>Phân quyền hệ thống:</b> Cho phép xem, điểm danh, check-in, xử lý ticket và theo dõi nhật ký kiểm toán theo tiêu chuẩn vai trò ${user.roleLabel}.
              </div>
            </div>
          `}

          <div class="pt-2 flex items-center justify-end">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng Hộp Thoại
              </button>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderUserProfileModal() {
  const user = getResolvedCurrentUserProfile();

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-2 sm:p-5 animate-fade-in">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                Hồ Sơ Tài Khoản
              </span>
              <span class="text-xs text-slate-400 font-semibold">&bull; Sports Center Identity</span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">Hồ Sơ & Cài Đặt Cá Nhân</h2>
          </div>
          <button type="button" onclick="closeUserProfileModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-lg transition">
            &times;
          </button>
        </div>

        ${renderProfileTabsContent(user, true)}
      </div>
    </div>
  `;
}

function renderMemberProfilePage() {
  const user = getResolvedCurrentUserProfile();

  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Hồ Sơ Cá Nhân & Cài Đặt</h2>
          <p class="text-xs text-slate-500 mt-0.5">Quản lý thông tin hội viên, đổi mật khẩu và xem các quyền lợi gói thẻ của bạn.</p>
        </div>
        <button type="button" onclick="switchTab('member-pass')" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5">
          <span>Xem Thẻ QR Check-in</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        ${renderProfileTabsContent(user, false)}
      </div>
    </div>
  `;
}

// =========================================================================
// 3. RECEPTIONIST WEB APP: 4-MODE KIOSK (GATE, POS, LOOKUP, SHIFT)
// =========================================================================
function renderReceptionistWebApp() {
  const mode = appState.receptionMode;

  return `
    <div class="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col">
      <!-- Front-Desk Top Console Bar -->
      <header class="bg-slate-900 text-white px-4 sm:px-6 h-16 flex items-center justify-between shadow-md">
        <div class="flex items-center space-x-4">
          <div class="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-sm">POS</div>
          <div>
            <div class="font-extrabold text-sm tracking-tight text-white leading-tight">FRONT-DESK WORKSTATION #01</div>
            <div class="text-[10px] text-slate-400 font-semibold">Trạm Lễ Tân & Cổng Kiểm Soát Turnstile</div>
          </div>
        </div>

        <!-- 5-Mode Switcher Tabs -->
        <div class="hidden sm:flex bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
          <button type="button" onclick="setReceptionMode('GATE')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'GATE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
            CỔNG TURNSTILE
          </button>
          <button type="button" onclick="setReceptionMode('POS')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'POS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
            BÁN GÓI POS
          </button>
          <button type="button" onclick="setReceptionMode('LOOKUP')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'LOOKUP' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
            TRA CỨU HỘI VIÊN
          </button>
          <button type="button" onclick="setReceptionMode('SHIFT')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'SHIFT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
            SỔ QUỸ CA TRỰC
          </button>
          <button type="button" onclick="setReceptionMode('TICKETS')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'TICKETS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
            XỬ LÝ TICKET
          </button>
        </div>

        <!-- Operator & Dropdown Menu -->
        <div class="flex items-center space-x-3">
          ${renderNotificationBell('RECEPTIONIST')}
          ${renderUserAvatarDropdown('RECEPTIONIST')}
        </div>
      </header>

      <!-- Mobile sub-tabs -->
      <div class="sm:hidden flex bg-slate-800 p-2 overflow-x-auto space-x-2 border-b border-slate-700">
        <button type="button" onclick="setReceptionMode('GATE')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold ${mode === 'GATE' ? 'bg-indigo-600 text-white' : 'text-slate-400'}">Cổng</button>
        <button type="button" onclick="setReceptionMode('POS')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold ${mode === 'POS' ? 'bg-indigo-600 text-white' : 'text-slate-400'}">Bán POS</button>
        <button type="button" onclick="setReceptionMode('LOOKUP')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold ${mode === 'LOOKUP' ? 'bg-indigo-600 text-white' : 'text-slate-400'}">Tra Cứu</button>
        <button type="button" onclick="setReceptionMode('SHIFT')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold ${mode === 'SHIFT' ? 'bg-indigo-600 text-white' : 'text-slate-400'}">Sổ Quỹ</button>
        <button type="button" onclick="setReceptionMode('TICKETS')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold ${mode === 'TICKETS' ? 'bg-indigo-600 text-white' : 'text-slate-400'}">Ticket</button>
      </div>

      <!-- Main Kiosk Body -->
      <main class="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        ${mode === 'GATE' ? renderReceptionGateMode() : ''}
        ${mode === 'POS' ? renderReceptionPOSMode() : ''}
        ${mode === 'LOOKUP' ? renderReceptionLookupMode() : ''}
        ${mode === 'SHIFT' ? renderReceptionShiftMode() : ''}
        ${mode === 'TICKETS' ? renderReceptionTicketsMode() : ''}
      </main>
    </div>
  `;
}

function renderReceptionGateMode() {
  const lastScan = appState.receptionLastScan;
  const logs = (appState.data && appState.data.checkinLogs) ? appState.data.checkinLogs : [];

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <!-- Barcode / QR Scanner Input Box -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Đầu đọc Scanner Cổng 01</label>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span> Cổng Sẵn Sàng
            </span>
          </div>

          <form onsubmit="return handleGateBarcodeSubmit(event)" class="flex space-x-3">
            <input type="text" id="gate-barcode-input" autofocus placeholder="Quét mã QR hoặc nhập Mã/SĐT hội viên (VD: MEM101)" class="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 focus:outline-none transition shadow-inner" />
            <button type="submit" class="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-sm transition">
              Quét Cổng
            </button>
          </form>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span class="text-slate-400 font-medium">Mô phỏng quẹt nhanh:</span>
            <div class="flex space-x-2">
              <button type="button" onclick="simulateGateScan('MEM101')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition">
                Hợp lệ: MEM101
              </button>
              <button type="button" onclick="simulateGateScan('MEM103')" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition">
                Hết hạn: MEM103
              </button>
            </div>
          </div>
        </div>

        <!-- Big Visual Gate Status Monitor Screen -->
        ${lastScan ? `
          <div class="rounded-3xl p-8 border-2 transition-all duration-300 shadow-md ${lastScan.valid ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-600 text-white border-rose-500'}">
            <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <img src="${lastScan.avatar}" class="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md" />
              <div class="flex-1">
                <div class="text-xs font-black uppercase tracking-widest opacity-80">
                  ${lastScan.valid ? 'XÁC THỰC THÀNH CÔNG - CỔNG MỞ (3S)' : 'TỪ CHỐI VÀO CỔNG - THẺ HẾT HẠN'}
                </div>
                <h3 class="text-2xl font-black mt-1 leading-tight">${lastScan.memberName}</h3>
                <div class="text-sm font-semibold opacity-95 mt-1">Mã: ${lastScan.memberId} &bull; SĐT: ${lastScan.phone}</div>
                <div class="mt-3 inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-xs text-xs font-extrabold">
                  Gói: ${lastScan.packageName} (${lastScan.valid ? `Hạn đến ${lastScan.endDate}` : `Đã hết hạn ngày ${lastScan.endDate}`})
                </div>
              </div>

              ${!lastScan.valid ? `
                <div>
                  <button type="button" onclick="setReceptionMode('POS')" class="px-4 py-2 bg-white text-rose-700 font-black text-xs rounded-xl shadow-md hover:bg-slate-100 transition">
                    Gia Hạn Tại POS
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        ` : `
          <div class="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 font-bold text-xl flex items-center justify-center mx-auto mb-3">
              SCAN
            </div>
            <div class="text-base font-bold text-slate-800">Màn hình kiểm soát cửa sẵn sàng</div>
            <div class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Vui lòng quét thẻ hoặc nhập mã hội viên ở ô bên trên để kiểm tra điều kiện mở cổng.</div>
          </div>
        `}
      </div>

      <!-- Real-time Check-in Log Stream -->
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Nhật Ký Cổng Thời Gian Thực</h3>
            <div class="text-xs text-slate-400">Các lượt khách vừa quét qua cổng</div>
          </div>
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            ${logs.length} Lượt
          </span>
        </div>

        <div class="divide-y divide-slate-100 overflow-y-auto max-h-[500px] mt-2">
          ${logs.map(log => `
            <div class="py-3 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-slate-900">${log.memberName} <span class="text-[10px] text-slate-400 font-normal">(${log.memberId})</span></div>
                <div class="text-[11px] text-slate-500">${log.packageName}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">${log.gate} &bull; ${log.time}</div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${log.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                ${log.status === 'VALID' ? 'HỢP LỆ' : 'TỪ CHỐI'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderReceptionPOSMode() {
  const cart = appState.receptionCartPackage;
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const method = appState.posPaymentMethod || 'CASH';
  const custInfo = appState.posCustInfo || { name: '', phone: '', gender: 'Nam' };
  const price = cart ? cart.price : 0;
  const cashReceived = (appState.posCashReceived !== undefined && appState.posCashReceived !== null && appState.posCashReceived > 0) ? appState.posCashReceived : price;
  const cashDiff = cashReceived - price;

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Package Catalogue -->
      <div class="lg:col-span-6 space-y-4">
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Danh Mục Gói Dịch Vụ (Chọn Để Lên Đơn)
            </h3>
            <span class="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
              ${packages.length} Gói Tập
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${packages.map(p => `
              <button type="button" onclick="selectPOSPackage('${p.id}')" class="p-4 rounded-2xl border text-left transition ${cart?.id === p.id ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-white'}">
                <div class="flex justify-between items-start">
                  <span class="text-[10px] font-bold uppercase text-slate-400">${p.durationDays} Ngày</span>
                  <span class="font-black text-indigo-700 text-sm">${(p.price).toLocaleString()} đ</span>
                </div>
                <div class="font-bold text-xs text-slate-900 mt-1">${p.name}</div>
                <div class="text-[11px] text-slate-500 mt-1 line-clamp-1">${p.description}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column: Customer Info & Cashier Checkout -->
      <div class="lg:col-span-6">
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Thông Tin Khách Hàng & Thu Ngân
              </h3>
              <div class="text-[11px] text-slate-400">Trạm POS #01 &bull; Thu ngân: Lê Ngọc Lễ Tân</div>
            </div>
            <div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
              POS
            </div>
          </div>

          <form onsubmit="return handlePOSCheckout(event)" class="space-y-4">
            <!-- Customer Inputs -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Họ Tên Khách Hàng <span class="text-rose-500">*</span>
              </label>
              <input type="text" id="pos-cust-name" required placeholder="Nguyễn Văn A" value="${custInfo.name || ''}" oninput="updatePOSCustInfo('name', this.value)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-inner" />
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Số Điện Thoại <span class="text-rose-500">*</span>
                </label>
                <input type="tel" id="pos-cust-phone" required placeholder="09xxxxxxxx" value="${custInfo.phone || ''}" oninput="updatePOSCustInfo('phone', this.value)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-inner" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Giới Tính</label>
                <select id="pos-cust-gender" onchange="updatePOSCustInfo('gender', this.value)" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
                  <option value="Nam" ${custInfo.gender === 'Nam' ? 'selected' : ''}>Nam</option>
                  <option value="Nữ" ${custInfo.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                  <option value="Khác" ${custInfo.gender === 'Khác' ? 'selected' : ''}>Khác</option>
                </select>
              </div>
            </div>

            <!-- Selected Package Badge -->
            <div class="p-3.5 rounded-2xl ${cart ? 'bg-indigo-50/70 border border-indigo-200' : 'bg-slate-100 border border-slate-200'}">
              <div class="text-[10px] font-bold uppercase text-slate-400">Gói được chọn:</div>
              ${cart ? `
                <div class="flex justify-between items-center mt-1">
                  <div>
                    <span class="text-xs font-bold text-slate-900">${cart.name}</span>
                    <span class="text-[10px] text-slate-500 ml-1">(${cart.durationDays} ngày)</span>
                  </div>
                  <span class="text-sm font-black text-indigo-700">${(cart.price).toLocaleString()} đ</span>
                </div>
              ` : `
                <div class="text-xs text-rose-500 font-semibold mt-1">Vui lòng bấm chọn một gói bên trái</div>
              `}
            </div>

            <!-- Payment Method Selection (3 Options) -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">Hình Thức Thu Tiền</label>
                <span class="text-[10px] text-slate-400">Chọn 1 trong 3 phương thức</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <!-- 1. Tiền mặt -->
                <button type="button" onclick="setPOSPaymentMethod('CASH')" class="p-2.5 rounded-xl border text-left transition flex items-center justify-between ${method === 'CASH' ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'}">
                  <div class="flex items-center space-x-1.5 min-w-0">
                    <span class="text-base">💵</span>
                    <span class="text-xs font-bold truncate">Tiền mặt</span>
                  </div>
                  <input type="radio" name="pos_method_radio" value="CASH" ${method === 'CASH' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500 pointer-events-none" />
                </button>

                <!-- 2. VNPAY QR -->
                <button type="button" onclick="setPOSPaymentMethod('VNPAY_QR')" class="p-2.5 rounded-xl border text-left transition flex items-center justify-between ${method === 'VNPAY_QR' ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-indigo-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'}">
                  <div class="flex items-center space-x-1.5 min-w-0">
                    <div class="w-5 h-5 rounded bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-[9px] shadow-2xs flex-shrink-0">VNP</div>
                    <span class="text-xs font-bold truncate">VNPAY-QR</span>
                  </div>
                  <input type="radio" name="pos_method_radio" value="VNPAY_QR" ${method === 'VNPAY_QR' ? 'checked' : ''} class="text-indigo-600 focus:ring-indigo-500 pointer-events-none" />
                </button>

                <!-- 3. Quẹt thẻ with 3 logos (Visa, MC, Napas) -->
                <button type="button" onclick="setPOSPaymentMethod('CARD')" class="p-2.5 rounded-xl border text-left transition flex items-center justify-between ${method === 'CARD' ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-indigo-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'}">
                  <div class="flex items-center space-x-1 min-w-0 overflow-hidden">
                    <span class="text-xs font-bold mr-0.5 truncate">Thẻ</span>
                    <div class="flex items-center space-x-0.5">
                      <span class="px-1 py-0.2 bg-white border border-slate-200 rounded text-[8px] font-black text-blue-700 leading-none">VISA</span>
                      <span class="px-1 py-0.2 bg-white border border-slate-200 rounded text-[8px] font-black text-orange-600 leading-none">MC</span>
                      <span class="px-1 py-0.2 bg-white border border-slate-200 rounded text-[8px] font-black text-blue-600 leading-none">NAPAS</span>
                    </div>
                  </div>
                  <input type="radio" name="pos_method_radio" value="CARD" ${method === 'CARD' ? 'checked' : ''} class="text-indigo-600 focus:ring-indigo-500 pointer-events-none ml-1" />
                </button>
              </div>
            </div>

            <!-- Dynamic Sub-Content Based on Selected Method -->
            ${method === 'VNPAY_QR' ? `
              <!-- Dynamic VNPAY QR Container -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-indigo-200 space-y-3 animate-fade-in text-center">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200 text-left">
                  <div class="flex items-center space-x-2">
                    <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
                      VNP
                    </div>
                    <div>
                      <div class="font-extrabold text-xs text-slate-900 leading-tight">MÃ QR ĐỘNG VNPAY-QR</div>
                      <div class="text-[10px] text-slate-500">Khách quét mã bằng App Ngân hàng hoặc Ví VNPAY</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-slate-400 font-bold uppercase">Cần thanh toán</div>
                    <div class="font-black text-rose-600 text-xs sm:text-sm">${price > 0 ? (price).toLocaleString() + ' đ' : '0 đ'}</div>
                  </div>
                </div>

                ${!cart ? `
                  <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold text-center">
                    ⚠️ Vui lòng bấm chọn một gói dịch vụ ở danh mục bên trái để sinh mã QR VNPAY chính xác.
                  </div>
                ` : `
                  <div class="relative mx-auto w-44 h-44 p-2 bg-white rounded-2xl border-2 border-indigo-500 shadow-sm flex flex-col items-center justify-center">
                    <!-- Stylized Official VNPAY QR SVG -->
                    <svg class="w-full h-full text-slate-900" viewBox="0 0 200 200" fill="currentColor">
                      <rect x="10" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
                      <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="27" y="27" width="16" height="16" rx="2" fill="#4338ca" />

                      <rect x="140" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
                      <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="157" y="27" width="16" height="16" rx="2" fill="#4338ca" />

                      <rect x="10" y="140" width="50" height="50" rx="6" fill="#1e1b4b" />
                      <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="27" y="157" width="16" height="16" rx="2" fill="#4338ca" />

                      <rect x="70" y="20" width="12" height="12" rx="2" fill="#1e1b4b" />
                      <rect x="90" y="15" width="12" height="12" rx="2" fill="#1e1b4b" />
                      <rect x="115" y="25" width="12" height="12" rx="2" fill="#1e1b4b" />
                      <rect x="75" y="45" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="105" y="45" width="16" height="16" rx="2" fill="#4338ca" />

                      <rect x="25" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="45" y="85" width="14" height="14" rx="2" fill="#4338ca" />
                      <rect x="75" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="100" y="80" width="12" height="12" rx="2" fill="#1e1b4b" />
                      <rect x="125" y="75" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="150" y="85" width="14" height="14" rx="2" fill="#4338ca" />

                      <rect x="75" y="115" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="100" y="110" width="18" height="18" rx="2" fill="#4338ca" />
                      <rect x="130" y="115" width="14" height="14" rx="2" fill="#1e1b4b" />

                      <rect x="70" y="150" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="95" y="160" width="16" height="16" rx="2" fill="#1e1b4b" />
                      <rect x="125" y="150" width="14" height="14" rx="2" fill="#4338ca" />
                      <rect x="150" y="160" width="14" height="14" rx="2" fill="#1e1b4b" />
                      <rect x="170" y="145" width="14" height="14" rx="2" fill="#1e1b4b" />

                      <rect x="78" y="78" width="44" height="44" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
                      <text x="100" y="104" font-size="11" font-weight="900" fill="#4338ca" text-anchor="middle" font-family="sans-serif">VNPAY</text>
                    </svg>
                  </div>

                  <div class="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                    <span class="w-2 h-2 rounded-full ${appState.posVnpayPaid ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}"></span>
                    <span>${appState.posVnpayPaid ? '<b class="text-emerald-700">ĐÃ NHẬN TIỀN VNPAY THÀNH CÔNG!</b>' : 'Mã hết hạn sau: <b class="font-mono text-indigo-700">14:52</b> &bull; Hướng dẫn khách quét QR'}</span>
                  </div>

                  <div class="pt-1 flex items-center justify-center gap-2">
                    ${!appState.posVnpayPaid ? `
                      <button type="button" onclick="handleSimulatePOSVnpayPaid(true)" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5">
                        <span>✔ [Mô phỏng] Khách Đã Quét & Báo Có</span>
                      </button>
                    ` : `
                      <div class="flex items-center space-x-2">
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">Đã khớp lệnh thanh toán</span>
                        <button type="button" onclick="handleSimulatePOSVnpayPaid(false)" class="text-xs text-slate-400 hover:text-slate-600 underline">Quét lại</button>
                      </div>
                    `}
                  </div>
                `}
              </div>
            ` : method === 'CARD' ? `
              <!-- Dynamic Card Swipe Container with 3 Logos (Visa, MC, Napas) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-indigo-200 space-y-3 animate-fade-in">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <div class="text-xs font-extrabold text-slate-900 uppercase">Quẹt Thẻ Qua Máy POS</div>
                    <div class="text-[10px] text-slate-500">Chạm Contactless / Chip EMV / Thẻ từ nội địa & quốc tế</div>
                  </div>
                  <!-- The 3 Logos -->
                  <div class="flex items-center space-x-1.5">
                    <!-- Visa SVG -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Visa">
                      <svg class="h-3 w-auto" viewBox="0 0 36 12" fill="none">
                        <path d="M14.5 0.5L9.6 11.5H6.4L3.9 2.5C3.8 2 3.6 1.7 3.1 1.4C2.3 1 1.1 0.7 0 0.5L0.1 0.2H5.3C6 0.2 6.6 0.7 6.8 1.4L8 8.2L11.3 0.2H14.5V0.5ZM27.3 7.8C27.3 4.8 23.1 4.6 23.2 3.3C23.3 2.9 23.7 2.4 24.5 2.3C25 2.2 26.2 2.2 27.4 2.7L27.9 0.4C27.3 0.2 26.4 0 25.3 0C22.2 0 20 1.6 20 4C19.9 5.8 21.6 6.7 22.8 7.3C24 7.9 24.5 8.3 24.5 8.8C24.4 9.6 23.4 10 22.6 10C21 10 20.1 9.5 19.3 9.1L18.8 11.5C19.6 11.9 21.1 12.2 22.5 12.2C25.7 12.2 27.9 10.6 27.9 8.2L27.3 7.8ZM35.7 11.5H38.5L36 0.2H33.4C32.8 0.2 32.3 0.6 32.1 1.1L27.4 11.5H30.6L31.2 9.8H35.2L35.7 11.5ZM32.1 7.4L33.7 3.1L34.7 7.4H32.1ZM18.8 0.2L16.3 11.5H13.2L15.7 0.2H18.8Z" fill="#1434CB"/>
                      </svg>
                    </div>
                    <!-- Mastercard SVG -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Mastercard">
                      <svg class="h-3.5 w-auto" viewBox="0 0 28 18" fill="none">
                        <circle cx="10" cy="9" r="6.5" fill="#EB001B"/>
                        <circle cx="18" cy="9" r="6.5" fill="#F79E1B"/>
                        <path d="M14 4.13A6.47 6.47 0 0 0 11.6 9 6.47 6.47 0 0 0 14 13.87 6.47 6.47 0 0 0 16.4 9 6.47 6.47 0 0 0 14 4.13Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <!-- Napas SVG -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Napas">
                      <svg class="h-3 w-auto" viewBox="0 0 54 16" fill="none">
                        <path d="M2 13V3h3.5l4 6.5V3H13v10H9.5L5.5 6.5V13H2z" fill="#005BAA"/>
                        <path d="M18 13l-1-2.5h-4L12 13h-2.5l4.5-10h2.5l4.5 10H18zm-3-8l-1.5 4h3L15 5z" fill="#005BAA"/>
                        <path d="M22 13V3h4c2.5 0 4 1.2 4 3.5s-1.5 3.5-4 3.5h-2v3H22zm2-5h2c1.2 0 2-.5 2-1.5s-.8-1.5-2-1.5h-2v3z" fill="#005BAA"/>
                        <path d="M33 13l-1-2.5h-4L27 13h-2.5l4.5-10h2.5l4.5 10H33zm-3-8l-1.5 4h3L30 5z" fill="#005BAA"/>
                        <path d="M38 13.2c-2.5 0-4.2-1.2-4.2-3.2h2.5c0 1 .8 1.5 1.7 1.5 1 0 1.6-.4 1.6-1 0-.7-.5-1-1.7-1.3l-1.2-.3c-2-.5-2.8-1.4-2.8-2.7 0-1.8 1.6-3.2 3.8-3.2 2.2 0 3.7 1.2 3.8 2.8H41c0-.8-.7-1.3-1.5-1.3-.9 0-1.4.4-1.4.9 0 .6.5.9 1.5 1.1l1.1.3c2.2.5 3 1.4 3 2.8 0 2-1.7 3.3-4.2 3.3z" fill="#005BAA"/>
                        <circle cx="48" cy="8" r="3" fill="#EE2E24"/>
                        <circle cx="50.5" cy="5" r="2" fill="#F7941D"/>
                        <circle cx="50.5" cy="11" r="2" fill="#00A850"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã Chuẩn Chi / 4 Số Cuối Thẻ</label>
                    <input type="text" id="pos-card-last4" placeholder="VD: 9812 hoặc TRC-0912" value="${appState.posCardLast4 || '9812'}" oninput="appState.posCardLast4 = this.value" class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-inner" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ngân Hàng Phát Hành Thẻ</label>
                    <select id="pos-card-bank" class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="MB Bank">MB Bank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="VPBank">VPBank</option>
                      <option value="ACB">ACB</option>
                      <option value="Khác">Ngân hàng khác</option>
                    </select>
                  </div>
                </div>

                <div class="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Máy POS bàn quầy #01 sẵn sàng. Đưa thiết bị POS cho khách chạm/quẹt và in bill đối soát.</span>
                </div>
              </div>
            ` : `
              <!-- Dynamic Cash Calculator Container (Tiền mặt thì tiền mặt thôi) -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-fade-in">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-base">💵</span>
                    <span class="text-xs font-bold text-slate-900 uppercase">Thu Tiền Mặt Trực Tiếp Tại Quầy</span>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Tiền mặt</span>
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500">Giá gói cần thu:</span>
                    <span class="font-bold text-slate-800 text-sm">${price > 0 ? (price).toLocaleString() + ' đ' : '0 đ'}</span>
                  </div>

                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500">Tiền khách đưa:</span>
                    <div class="w-44">
                      <input type="number" id="pos-cash-input" value="${cashReceived}" oninput="handlePOSCashInput(this.value)" placeholder="0" class="w-full px-2.5 py-1.5 text-right font-black text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 shadow-inner" />
                    </div>
                  </div>

                  <!-- Quick Cash Buttons -->
                  ${cart ? `
                    <div class="flex items-center justify-end space-x-1.5 pt-0.5">
                      <button type="button" onclick="setPOSQuickCash(${cart.price})" class="px-2 py-1 bg-slate-200 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg text-[10px] font-bold transition">Đúng số tiền</button>
                      <button type="button" onclick="setPOSQuickCash(1000000)" class="px-2 py-1 bg-slate-200 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg text-[10px] font-bold transition">1.000.000 đ</button>
                      <button type="button" onclick="setPOSQuickCash(2000000)" class="px-2 py-1 bg-slate-200 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg text-[10px] font-bold transition">2.000.000 đ</button>
                      <button type="button" onclick="setPOSQuickCash(5000000)" class="px-2 py-1 bg-slate-200 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 rounded-lg text-[10px] font-bold transition">5.000.000 đ</button>
                    </div>
                  ` : ''}

                  <div class="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                    <span class="text-slate-500">Tiền thối lại cho khách:</span>
                    <span id="pos-cash-change" class="font-black text-xs ${cashDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
                      ${cashDiff >= 0 ? cashDiff.toLocaleString() + ' đ' : 'Còn thiếu ' + Math.abs(cashDiff).toLocaleString() + ' đ'}
                    </span>
                  </div>
                </div>
              </div>
            `}

            <!-- Submit Button -->
            <button type="submit" ${!cart ? 'disabled' : ''} class="w-full py-3.5 mt-2 ${!cart ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'} rounded-2xl font-black text-xs transition uppercase tracking-wider flex items-center justify-center space-x-2">
              <span>Xác Nhận Thu Tiền & In Hóa Đơn POS</span>
              <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function renderPOSReceiptModal() {
  const r = appState.posReceiptModal;
  if (!r) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6 animate-fade-in">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-auto animate-in zoom-in-95 duration-150">
        <!-- Top Receipt Brand -->
        <div class="text-center pb-4 border-b border-dashed border-slate-200 space-y-1">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black text-xl shadow-xs ring-4 ring-emerald-50 mb-2">
            ✓
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Thanh Toán Thành Công
          </span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">HÓA ĐƠN BÁN LẺ POS</h3>
          <div class="text-xs text-slate-500">Trung Tâm Thể Thao Sports Center #01</div>
          <div class="text-[10px] text-slate-400 font-mono">Mã giao dịch: ${r.receiptId} &bull; ${r.date}</div>
        </div>

        <!-- Receipt Line Items -->
        <div class="space-y-2 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Khách hàng:</span>
            <span class="font-bold text-slate-900">${r.memberName}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Số điện thoại:</span>
            <span class="font-mono font-semibold text-slate-800">${r.phone || 'N/A'}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Mã thẻ hội viên:</span>
            <span class="font-mono font-bold text-indigo-700">${r.memberId} (ACTIVE)</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Gói dịch vụ:</span>
            <span class="font-bold text-slate-900">${r.packageName}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Thời hạn sử dụng:</span>
            <span class="font-bold text-emerald-700">${r.durationDays} Ngày</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Phương thức:</span>
            <span class="font-bold text-slate-900">${r.methodLabel}</span>
          </div>
          <div class="flex justify-between py-2 border-t-2 border-dashed border-slate-200 text-sm">
            <span class="font-bold text-slate-900">Tổng tiền đã thanh toán:</span>
            <span class="font-black text-rose-600 text-base">${(r.amount).toLocaleString()} VND</span>
          </div>
        </div>

        <!-- Footer / Cashier Signature Note -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5 text-center">
          <div>Thu ngân: <b>Lê Ngọc Lễ Tân</b> &bull; Quầy tiếp đón 01</div>
          <div class="text-[10px] text-slate-400">Hội viên có thể quét mã vạch trên thẻ điện tử để qua cổng Turnstile ngay.</div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-1">
          <button type="button" onclick="window.print()" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2">
            <span>🖨 In Hóa Đơn POS</span>
          </button>
          <button type="button" onclick="closePOSReceiptModal()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
            Đóng & Tiếp Tục Thu Ngân
          </button>
        </div>
      </div>
    </div>
  `;
}

// NEW: Receptionist Member Lookup & Rapid Renewal Mode
function renderReceptionLookupMode() {
  const query = (appState.receptionSearchQuery || '').toLowerCase().trim();
  const rawMembers = (appState.data && appState.data.members) ? appState.data.members : [];
  const members = rawMembers.map(m => resolveMember(m));
  
  const filtered = members.filter(m => {
    return !query || (m.name || '').toLowerCase().includes(query) || (m.phone || '').includes(query) || (m.id || '').toLowerCase().includes(query);
  });

  return `
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 class="font-extrabold text-base text-slate-900 uppercase tracking-wider">Tra Cứu & Gia Hạn Hội Viên Tại Quầy</h3>
          <div class="text-xs text-slate-400">Kiểm tra thông tin thẻ, hỗ trợ gia hạn và tư vấn dịch vụ</div>
        </div>

        <div class="w-full sm:w-80">
          <input type="text" placeholder="Nhập tên, SĐT hoặc mã thẻ (VD: MEM101)..." value="${appState.receptionSearchQuery}" oninput="setReceptionSearchQuery(this.value)" class="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Hội Viên</th>
              <th class="py-3 px-4">Số Điện Thoại</th>
              <th class="py-3 px-4">Gói Đang Sử Dụng</th>
              <th class="py-3 px-4">Thời Hạn</th>
              <th class="py-3 px-4">Trạng Thái</th>
              <th class="py-3 px-4 text-right">Thao Tác Tại Quầy</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.map(m => `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3.5 px-4 flex items-center space-x-3">
                  <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div class="font-bold text-slate-900">${m.name}</div>
                    <div class="text-[10px] text-slate-400">Mã: ${m.id}</div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-700 font-medium">${m.phone}</td>
                <td class="py-3.5 px-4 font-semibold text-indigo-700">${m.activePackage}</td>
                <td class="py-3.5 px-4 text-slate-600">${m.startDate} &rarr; ${m.endDate}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                    ${m.status}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-2">
                  <button type="button" onclick="fastRenewMemberAtReception('${m.id}')" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-xs transition">
                    + Gia Hạn 30 Ngày
                  </button>
                  <button type="button" onclick="simulateGateScan('${m.id}'); setReceptionMode('GATE');" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition">
                    Thử Check-in
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// NEW: Receptionist Shift Cashier & Daily Summary Mode
function renderReceptionShiftMode() {
  const invoices = (appState.data && appState.data.invoices) ? appState.data.invoices : [];
  const shiftCash = invoices.filter(i => i.paymentMethod === 'CASH').reduce((sum, i) => sum + i.amount, 0);
  const shiftQR = invoices.filter(i => i.paymentMethod.includes('QR')).reduce((sum, i) => sum + i.amount, 0);
  const shiftCard = invoices.filter(i => i.paymentMethod.includes('CARD')).reduce((sum, i) => sum + i.amount, 0);
  const shiftTotal = shiftCash + shiftQR + shiftCard;

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Thu Ca Trực</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${shiftTotal.toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Khớp 100% hóa đơn</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiền Mặt Két Quầy</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${shiftCash.toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[10px] text-slate-500 font-semibold mt-1">Cần bàn giao ca sau</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã QR PayOS / Banking</div>
          <div class="text-2xl font-black text-indigo-600 mt-1">${shiftQR.toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Tài khoản ngân hàng trung tâm</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quẹt Thẻ Máy POS</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${shiftCard.toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[10px] text-slate-500 font-semibold mt-1">Biên lai POS đính kèm</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Danh Sách Hóa Đơn Xuất Trong Ca</h3>
            <div class="text-xs text-slate-400">Thu ngân phụ trách: Lê Ngọc Lễ Tân</div>
          </div>
          <button type="button" onclick="showToast('Bàn giao ca', 'Đã xuất biên bản bàn giao sổ quỹ ca trực!', 'success')" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">
            In Biên Bản Bàn Giao Ca
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
              <tr>
                <th class="py-3 px-4">Mã Hóa Đơn</th>
                <th class="py-3 px-4">Hội Viên</th>
                <th class="py-3 px-4">Gói Tập</th>
                <th class="py-3 px-4">Số Tiền</th>
                <th class="py-3 px-4">Phương Thức</th>
                <th class="py-3 px-4">Thời Gian</th>
                <th class="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${invoices.map(inv => `
                <tr class="hover:bg-slate-50/70 transition">
                  <td class="py-3 px-4 font-bold text-slate-900">${inv.id}</td>
                  <td class="py-3 px-4 font-semibold text-slate-800">${inv.memberName}</td>
                  <td class="py-3 px-4 text-indigo-700">${inv.packageName}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${inv.amount.toLocaleString()} đ</td>
                  <td class="py-3 px-4 text-slate-600">${inv.paymentMethod}</td>
                  <td class="py-3 px-4 text-slate-500">${inv.date}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${inv.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// 4. COACH WEB APP: TRAINER HUB (TODAY ATTENDANCE, WEEK SCHEDULE, ROSTER)
// =========================================================================
function renderCoachWebApp() {
  const mode = appState.coachActiveTab;
  const rawAllClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const allClasses = rawAllClasses.map(c => resolveClass(c));
  let coachClasses = allClasses.filter(c => c.coachId === 'COACH' || c.coachId === 'COA01');
  if (coachClasses.length === 0) coachClasses = allClasses.slice(0, 2);

  const selectedClass = appState.selectedClassForBooking ? (coachClasses.find(c => c.id === appState.selectedClassForBooking.id) || coachClasses[0]) : coachClasses[0];
  const attendees = (selectedClass && selectedClass.attendees) ? selectedClass.attendees : [];

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <!-- Trainer Top Bar -->
      <header class="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div class="flex items-center space-x-4">
          <div class="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm">TR</div>
          <div>
            <div class="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">TRAINER HUB & SÀN TẬP</div>
            <div class="text-[10px] text-slate-500 font-semibold">HLV Trần Hoàng Nam &bull; Lịch Dạy & Điểm Danh</div>
          </div>
        </div>

        <!-- 3 Coach Tabs -->
        <div class="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1">
          <button type="button" onclick="setCoachTab('TODAY')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'TODAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Hôm Nay & Điểm Danh
          </button>
          <button type="button" onclick="setCoachTab('WEEK')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'WEEK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Lịch Dạy Cả Tuần
          </button>
          <button type="button" onclick="setCoachTab('STUDENTS')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'STUDENTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Học Viên & Thể Lực
          </button>
        </div>

        <div class="flex items-center space-x-3">
          ${renderNotificationBell('COACH')}
          ${renderUserAvatarDropdown('COACH')}
        </div>
      </header>

      <!-- Main Body Container -->
      <main class="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        ${mode === 'TODAY' ? renderCoachTodayMode(coachClasses, selectedClass, attendees) : ''}
        ${mode === 'WEEK' ? renderCoachWeekMode(allClasses) : ''}
        ${mode === 'STUDENTS' ? renderCoachStudentsMode(coachClasses) : ''}
      </main>

      <!-- Coach Workout Plan Assignment Modal -->
      ${appState.coachWorkoutPlanModalOpen ? renderAssignWorkoutPlanModal() : ''}
    </div>
  `;
}

function renderCoachTodayMode(rawCoachClasses, selectedClass, attendees) {
  const coachClasses = (rawCoachClasses || []).map(c => resolveClass(c));
  const resolvedSelected = selectedClass ? resolveClass(selectedClass) : coachClasses[0];
  const resolvedAttendees = resolvedSelected?.attendees || attendees || [];

  return `
    <div class="space-y-6">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Các Ca Dạy Phụ Trách Hôm Nay</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${coachClasses.map(c => `
            <div onclick="selectCoachClass('${c.id}')" class="p-5 rounded-2xl border cursor-pointer transition ${resolvedSelected?.id === c.id ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}">
              <div class="flex justify-between items-start">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800">${c.category}</span>
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
              <span class="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Bảng Điểm Danh Lớp</span>
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

// NEW: Coach Weekly Calendar View
function renderCoachWeekMode(allClasses) {
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Thời Khóa Biểu Giảng Dạy Tuần & Tháng</h2>
          <p class="text-xs text-slate-500 mt-0.5">Lịch tháng hiển thị toàn bộ ca phụ trách theo ngày có chấm chỉ báo. Bấm vào ngày để xem danh sách và điểm danh.</p>
        </div>
      </div>

      ${renderMonthlyCalendarComponent('COACH')}
    </div>
  `;
}

function _unused_old_renderCoachWeekMode(allClasses) {

  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div class="pb-3 border-b border-slate-100">
        <h2 class="text-lg font-black text-slate-900">Thời Khóa Biểu Giảng Dạy Tuần Này</h2>
        <p class="text-xs text-slate-500 mt-0.5">Lịch tổng thể các ca phụ trách từ Thứ 2 đến Chủ Nhật.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        ${daysOfWeek.map(d => {
          const classesOnDay = allClasses.filter(c => c.days.includes(d));
          return `
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[220px] flex flex-col">
              <div class="font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-200 text-center">${d}</div>
              <div class="mt-2 space-y-2 flex-1">
                ${classesOnDay.length === 0 ? `
                  <div class="text-[10px] text-slate-400 text-center pt-8">Trống lịch</div>
                ` : `
                  ${classesOnDay.map(cl => `
                    <div class="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-left">
                      <div class="text-[10px] font-bold text-orange-600 uppercase">${cl.category}</div>
                      <div class="text-xs font-bold text-slate-900 line-clamp-1">${cl.title}</div>
                      <div class="text-[10px] text-slate-500 mt-0.5">${cl.time}</div>
                      <div class="text-[10px] text-slate-400 mt-0.5">${cl.room}</div>
                    </div>
                  `).join('')}
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// NEW: Coach Students Roster & Fitness Tracking
function renderCoachStudentsMode(coachClasses) {
  const rawMembers = (appState.data && appState.data.members) ? appState.data.members : [];
  const members = rawMembers.map(m => resolveMember(m));

  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div class="pb-3 border-b border-slate-100">
        <h2 class="text-lg font-black text-slate-900">Danh Sách Học Viên Phụ Trách & Chỉ Số Thể Trạng</h2>
        <p class="text-xs text-slate-500 mt-0.5">Theo dõi mục tiêu thể hình, cân nặng và giao lộ trình giáo án cá nhân hóa.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Học Viên</th>
              <th class="py-3 px-4">Số Điện Thoại</th>
              <th class="py-3 px-4">Mục Tiêu Thể Lực (Goal)</th>
              <th class="py-3 px-4">InBody (Cân nặng / Body Fat)</th>
              <th class="py-3 px-4">Gói Tập</th>
              <th class="py-3 px-4">Lộ Trình Giáo Án (Workout Plan)</th>
              <th class="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${members.map(m => {
              const myPlans = (appState.data?.memberPlans || []).filter(mp => mp.memberId === m.id);
              const wpList = myPlans.map(mp => (appState.data?.workoutPlans || []).find(wp => (wp.planId || wp.id) === mp.planId)).filter(Boolean);

              return `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3.5 px-4 flex items-center space-x-3">
                  <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div class="font-bold text-slate-900">${m.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">Mã: ${m.id}</div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-700 font-medium">${m.phone}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-800">${m.trainingGoal || 'Tăng cường sức bền'}</td>
                <td class="py-3.5 px-4">
                  ${m.inbody ? `<span class="font-bold text-indigo-700">${m.inbody.weight} kg</span> &bull; Mỡ: <span class="font-semibold text-slate-600">${m.inbody.bodyFat}%</span>` : '---'}
                </td>
                <td class="py-3.5 px-4 text-slate-600">${m.activePackage}</td>
                <td class="py-3.5 px-4">
                  ${wpList.length > 0 ? `
                    <div class="text-xs font-bold text-indigo-700">${wpList[0].planName}</div>
                    <div class="text-[10px] text-slate-400 font-medium">${wpList[0].duration}</div>
                  ` : `
                    <span class="text-xs text-slate-400 italic">Chưa có giáo án riêng</span>
                  `}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button type="button" onclick="openAssignWorkoutPlanModal('${m.id}')" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition">
                    + Giao Lộ Trình
                  </button>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =========================================================================
// 5. MANAGER WEB APP: COMPLETE BACK-OFFICE ADMIN DASHBOARD
// =========================================================================
function renderManagerWebApp() {
  const currentTab = appState.currentTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] flex">
      <!-- Admin Left Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shadow-xs">
        <div>
          <div class="h-16 flex items-center px-6 border-b border-slate-200">
            <div class="flex items-center space-x-2.5">
              <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">SC</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">SPORTS CENTER</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">Center Admin</div>
              </div>
            </div>
          </div>

          <nav class="p-3.5 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Quản Trị Hệ Thống</div>
            <button type="button" onclick="switchTab('dashboard')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Báo Cáo Tổng Quan & KPIs</span>
            </button>
            <button type="button" onclick="switchTab('manager-members')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-members' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Quản Lý Hội Viên</span>
            </button>
            <button type="button" onclick="switchTab('manager-packages')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-packages' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Danh Mục Gói Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-classes')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-classes' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Lớp Học & Phòng Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-staff')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-staff' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Nhân Sự & HLV</span>
            </button>
            <button type="button" onclick="switchTab('manager-finances')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-finances' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Sổ Cái Hóa Đơn</span>
            </button>
            <button type="button" onclick="switchTab('manager-audit')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-audit' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Nhật Ký Kiểm Toán (Audit)</span>
            </button>
          </nav>
        </div>

        <div class="p-4 border-t border-slate-200 text-center">
          <div class="text-[11px] font-semibold text-slate-800">SWP391 FA26 Topic 04</div>
          <div class="text-[10px] text-slate-400 mt-0.5">GVHD: MinhTTH5</div>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Quản Lý Trung Tâm (Manager)
            </span>
            <span class="text-slate-300">/</span>
            <span class="text-xs font-semibold text-slate-700">${getManagerTabTitle(currentTab)}</span>
          </div>

          <div class="flex items-center space-x-3">
            ${renderNotificationBell('MANAGER')}
            ${renderUserAvatarDropdown('MANAGER')}
          </div>
        </header>

        <!-- Admin Dynamic Body -->
        <main class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          ${currentTab === 'dashboard' ? renderManagerDashboard() : ''}
          ${currentTab === 'manager-members' ? renderManagerMembers() : ''}
          ${currentTab === 'manager-packages' ? renderManagerPackages() : ''}
          ${currentTab === 'manager-classes' ? renderManagerClasses() : ''}
          ${currentTab === 'manager-staff' ? renderManagerStaff() : ''}
          ${currentTab === 'manager-finances' ? renderManagerFinances() : ''}
          ${currentTab === 'manager-audit' ? renderManagerAuditLogs() : ''}
        </main>
      </div>

      <!-- Manager CRUD Modals -->
      ${appState.managerActiveModal === 'CREATE_PACKAGE' ? renderCreatePackageModal() : ''}
      ${appState.managerActiveModal === 'CREATE_CLASS' ? renderCreateClassModal() : ''}
      ${appState.managerActiveModal === 'RENEW_MEMBER' ? renderRenewMemberModal() : ''}
    </div>
  `;
}

function getManagerTabTitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Báo Cáo Tổng Quan & Doanh Thu';
    case 'manager-members': return 'Quản Lý Danh Sách Hội Viên';
    case 'manager-packages': return 'Danh Mục Các Gói Tập';
    case 'manager-classes': return 'Quản Lý Lớp Học & Phòng Tập';
    case 'manager-staff': return 'Quản Lý Nhân Sự & Huấn Luyện Viên';
    case 'manager-finances': return 'Sổ Cái Lịch Sử Hóa Đơn';
    case 'manager-audit': return 'Nhật Ký Kiểm Toán & Vết Thao Tác Hệ Thống (Audit Logs)';
    default: return 'Bảng Quản Trị';
  }
}

function renderManagerDashboard() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const invoices = (appState.data && appState.data.invoices) ? appState.data.invoices : [];
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(totalRevenue).toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">&uarr; +14.8% so với tháng trước</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hội Viên Đang Hoạt Động</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${activeMembers} <span class="text-xs font-normal text-slate-500">/ ${members.length}</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">Tỷ lệ duy trì thẻ: 85%</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt Check-in Hôm Nay</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(appState.data?.checkinLogs || []).length * 15} <span class="text-xs font-normal text-slate-500">lượt</span></div>
          <div class="text-[11px] text-indigo-600 font-semibold mt-1">Giờ cao điểm: 18:00 - 20:00</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp Học Đang Mở</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${classes.length} <span class="text-xs font-normal text-slate-500">lớp</span></div>
          <div class="text-[11px] text-slate-500 font-semibold mt-1">Tỷ lệ lấp đầy slot: 88%</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Biểu Đồ Xu Hướng Doanh Thu (7 Ngày Qua)</h3>
            <div class="text-xs text-slate-400">Doanh thu bán gói tập & thẻ hội viên</div>
          </div>
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Đơn vị: VNĐ</span>
        </div>
        <div class="h-64 relative">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

function renderManagerMembers() {
  const query = (appState.managerMemberSearch || '').toLowerCase().trim();
  const rawMembers = (appState.data && appState.data.members) ? appState.data.members : [];
  const members = rawMembers.map(m => resolveMember(m));
  const filtered = members.filter(m => !query || (m.name || '').toLowerCase().includes(query) || (m.phone || '').includes(query) || (m.id || '').toLowerCase().includes(query));

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Danh Sách Hội Viên Trung Tâm</h3>
          <div class="text-xs text-slate-400">Quản lý tài khoản, trạng thái thẻ và thời hạn</div>
        </div>

        <div class="w-full sm:w-72">
          <input type="text" placeholder="Tìm tên, SĐT, mã thẻ..." value="${appState.managerMemberSearch}" oninput="setManagerMemberSearch(this.value)" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Hội Viên</th>
              <th class="py-3 px-4">Số Điện Thoại</th>
              <th class="py-3 px-4">Gói Tập Hiện Tại</th>
              <th class="py-3 px-4">Thời Hạn Thẻ</th>
              <th class="py-3 px-4">Trạng Thái</th>
              <th class="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.map(m => `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3 px-4 flex items-center space-x-3">
                  <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div class="font-bold text-slate-900">${m.name}</div>
                    <div class="text-[11px] text-slate-400">${m.email} &bull; ${m.id}</div>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-700 font-medium">${m.phone}</td>
                <td class="py-3 px-4 text-indigo-700 font-semibold">${m.activePackage}</td>
                <td class="py-3 px-4 text-slate-600">${m.startDate} &rarr; ${m.endDate}</td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                    ${m.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button type="button" onclick="openRenewModal('${m.id}')" class="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200">
                    Gia Hạn Thẻ
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderManagerPackages() {
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Danh Mục Các Gói Tập & Dịch Vụ</h3>
          <div class="text-xs text-slate-400">Các gói thẻ hội viên đang được mở bán trên toàn hệ thống</div>
        </div>
        <button type="button" onclick="openManagerModal('CREATE_PACKAGE')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
          + Tạo Gói Tập Mới
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${packages.map(p => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div class="flex justify-between items-start">
              <h4 class="font-black text-sm text-slate-900">${p.name}</h4>
              <span class="text-sm font-black text-indigo-600">${(p.price).toLocaleString()} VND</span>
            </div>
            <div class="text-xs text-slate-500">${p.description}</div>
            <div class="text-xs text-slate-600 pt-2 border-t border-slate-200 flex justify-between items-center">
              <span>Thời hạn: <strong>${p.durationDays} Ngày</strong></span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ĐANG MỞ BÁN</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderManagerClasses() {
  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const classes = rawClasses.map(c => resolveClass(c));

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Lịch Lớp Học & Phân Công Huấn Luyện Viên</h3>
          <div class="text-xs text-slate-400">Danh sách các lớp thể thao đang hoạt động</div>
        </div>
        <button type="button" onclick="openManagerModal('CREATE_CLASS')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
          + Thêm Lớp Mới
        </button>
      </div>

      <div class="divide-y divide-slate-100">
        ${classes.map(c => `
          <div class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div class="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase mb-1">${c.category}</div>
              <h4 class="font-extrabold text-sm text-slate-900">${c.title}</h4>
              <div class="text-xs text-slate-500 mt-0.5">${c.time} (${c.days}) &bull; Phòng: <strong>${c.room}</strong> &bull; HLV: <strong class="text-indigo-600">${c.coachName}</strong></div>
            </div>
            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Sĩ số: ${c.bookedSeats} / ${c.maxCapacity} học viên
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// NEW: Manager Staff & Coaches Roster Mode
function renderManagerStaff() {
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Đội Ngũ Huấn Luyện Viên & Lễ Tân</h3>
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

function renderManagerFinances() {
  const invoices = (appState.data && appState.data.invoices) ? appState.data.invoices : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Sổ Cái Hóa Đơn Thu Ngân</h3>
        <div class="text-xs text-slate-400">Toàn bộ hóa đơn thanh toán gói tập trên hệ thống</div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Mã Hóa Đơn</th>
              <th class="py-3 px-4">Khách Hàng</th>
              <th class="py-3 px-4">Gói Đăng Ký</th>
              <th class="py-3 px-4">Số Tiền</th>
              <th class="py-3 px-4">Phương Thức</th>
              <th class="py-3 px-4">Ngày Thu</th>
              <th class="py-3 px-4">Trạng Thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${invoices.map(inv => `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3 px-4 font-bold text-slate-900">${inv.id}</td>
                <td class="py-3 px-4 text-slate-800 font-semibold">${inv.memberName}</td>
                <td class="py-3 px-4 text-indigo-700">${inv.packageName}</td>
                <td class="py-3 px-4 font-bold text-slate-900">${(inv.amount).toLocaleString()} đ</td>
                <td class="py-3 px-4 text-slate-600">${inv.paymentMethod}</td>
                <td class="py-3 px-4 text-slate-500">${inv.date}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ${inv.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Manager CRUD Modals
function renderCreatePackageModal() {
  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Tạo Gói Tập Mới (Chuẩn ERD)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Khai báo PackageID, PackageName, Type, Price, DurationDays, Description.</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreatePackageSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Gói Tập (PackageName)</label>
            <input type="text" id="new-pkg-name" required placeholder="VD: Platinum Gym & Cardio 6 Tháng" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phân Loại Gói (Type)</label>
            <select id="new-pkg-type" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              <option value="GYM">GYM - Tập Gym & Tạ</option>
              <option value="VIP">VIP - Toàn Quyền Trung Tâm</option>
              <option value="YOGA">YOGA - Lớp Yoga & Dẻo Dai</option>
              <option value="BOXING">BOXING - Lớp Boxing & Đối Kháng</option>
              <option value="PT">PT - Huấn Luyện Viên 1-1</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Hạn (DurationDays)</label>
              <input type="number" id="new-pkg-days" required value="180" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Đơn Giá (Price VNĐ)</label>
              <input type="number" id="new-pkg-price" required value="4200000" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Quyền Lợi (Description)</label>
            <textarea id="new-pkg-desc" rows="2" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" placeholder="Mô tả quyền lợi gói tập..."></textarea>
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Lưu Gói Tập</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderCreateClassModal() {
  const subjects = appState.data.subjects || [];
  const coaches = appState.data.coaches || [];
  const rooms = appState.data.rooms || [];

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Thêm Lớp Học Mới (Chuẩn ERD)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Liên kết SubjectID, RoomID, CoachID và ScheduleTime.</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreateClassSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Bộ Môn Thể Thao (SubjectID)</label>
            <select id="new-class-sub" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${subjects.map(s => `<option value="${s.subjectId}">${s.subjectName} - ${s.description}</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phòng Tập (RoomID)</label>
              <select id="new-class-room" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
                ${rooms.map(r => `<option value="${r.roomId}">${r.roomName}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sức Chứa (MaxCapacity)</label>
              <input type="number" id="new-class-cap" required value="20" min="1" max="100" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Huấn Luyện Viên (CoachID)</label>
            <select id="new-class-coach" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              ${coaches.map(co => `<option value="${co.coachId || co.id}">${co.name} (${co.specialty})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Lịch Đào Tạo (ScheduleTime)</label>
            <input type="text" id="new-class-schedule" required value="Thứ 2, 4, 6 | 17:30 - 18:45" placeholder="VD: Thứ 2, 4, 6 | 17:30 - 18:45" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
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

function renderRenewMemberModal() {
  const m = appState.managerSelectedMemberForRenew;
  if (!m) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Gia Hạn Thẻ Hội Viên</h3>
            <p class="text-xs text-slate-500 mt-0.5">${m.name} (${m.phone})</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Gói đang dùng:</span>
            <span class="font-bold text-slate-900">${m.activePackage}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Hạn thẻ hiện tại:</span>
            <span class="font-bold text-rose-600">${m.endDate}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-slate-200">
            <span class="text-slate-500">Gia hạn thêm:</span>
            <span class="font-bold text-emerald-600">+30 Ngày Sử Dụng</span>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Đóng</button>
          <button type="button" onclick="confirmManagerRenew('${m.id}')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs">Xác Nhận Gia Hạn</button>
        </div>
      </div>
    </div>
  `;
}

function initChartsIfNeeded() {
  if (appState.currentRole !== 'MANAGER' || appState.currentTab !== 'dashboard') return;

  setTimeout(() => {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (window.activeRevenueChartInstance) {
      window.activeRevenueChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.activeRevenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: [1200000, 2450000, 1800000, 3200000, 4800000, 6500000, 5100000],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: function(v) { return (v / 1000000) + ' Tr'; }
            }
          }
        }
      }
    });
  }, 100);
}

// =========================================================================
// HANDLERS & INTERACTIONS
// =========================================================================
function handleFormLogin(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('login-email')?.value || '').trim();
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) : null;

  if (acc) {
    quickLoginAs(acc.role);
    showToast('Đăng nhập thành công', `Chào mừng ${acc.name} (${acc.roleLabel})`, 'success');
  } else {
    quickLoginAs('MEMBER');
    showToast('Đăng nhập thành công', 'Đã đăng nhập tài khoản Hội viên', 'success');
  }
  return false;
}

function handleFormRegister(e) {
  if (e) e.preventDefault();
  const lastName = document.getElementById('reg-lastname')?.value || 'Phạm';
  const firstName = document.getElementById('reg-firstname')?.value || 'Thu Trang';
  const fullName = `${lastName} ${firstName}`.trim();
  const email = document.getElementById('reg-email')?.value || 'new@customer.vn';
  const goal = document.getElementById('reg-goal')?.value || 'Giảm mỡ, tăng cơ săn chắc';

  const newId = 'MEM' + (100 + appState.data.members.length + 1);
  
  // STRICT ERD: Members entity (MemberID, FirstName, LastName, Email, TrainingGoal, Status)
  const newMember = {
    memberId: newId,
    id: newId,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    email: email,
    trainingGoal: goal,
    status: 'ACTIVE'
  };

  appState.data.members.unshift(newMember);
  quickLoginAs('MEMBER');
  appState.currentUser.name = fullName;
  appState.currentUser.email = email;
  appState.currentTab = 'member-packages';
  renderApp();
  showToast('Đăng ký thành công (ERD Compliant)', `Chào mừng hội viên ${fullName}! Vui lòng chọn gói tập để kích hoạt thẻ.`, 'success');
  return false;
}

function handleSendOtpBtn() {
  appState.otpSent = true;
  renderApp();
  showToast('Đã gửi mã OTP', 'Mã xác minh 888999 đã được gửi đến email của bạn', 'info');
}

function handleVerifyAndResetPassword() {
  const otp = document.getElementById('forgot-otp')?.value;
  if (otp === '888999') {
    appState.authTab = 'login';
    renderApp();
    showToast('Thành công', 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập!', 'success');
  } else {
    showToast('Lỗi', 'Mã OTP không chính xác!', 'error');
  }
}

// Member Booking Interactions
function setMemberCategoryFilter(cat) {
  appState.activeFilterCategory = cat;
  renderApp();
}

function setMemberSearchKeyword(kw) {
  appState.memberSearchKeyword = kw;
  renderApp();
}

function openBookingModal(classId) {
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để đặt chỗ lớp học!', 'info');
    openLoginScreen('login');
    return;
  }
  const c = appState.data.classes.find(item => item.id === classId || item.classId === classId);
  if (!c) return;
  appState.selectedClassForBooking = resolveClass(c);
  renderApp();
}

function closeBookingModal() {
  appState.selectedClassForBooking = null;
  renderApp();
}

function confirmBooking(classId) {
  const member = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (!appState.data.classEnrollments) appState.data.classEnrollments = [];

  const existing = appState.data.classEnrollments.find(e => (e.classId === classId) && (e.memberId === member.id));
  if (!existing) {
    const newEnrId = 'ENR0' + (appState.data.classEnrollments.length + 1);
    appState.data.classEnrollments.push({
      classEnrollmentId: newEnrId,
      classId: classId,
      memberId: member.id,
      enrollDate: '2026-09-19',
      status: 'CONFIRMED'
    });
    const c = resolveClass(appState.data.classes.find(item => item.id === classId || item.classId === classId));
    showToast('Đặt chỗ thành công', `Đã đăng ký ClassEnrollment cho lớp ${c ? c.title : classId}`, 'success');
  } else {
    showToast('Thông báo', 'Bạn đã đăng ký lớp học này rồi!', 'info');
  }

  appState.selectedClassForBooking = null;
  appState.currentTab = 'member-schedule';
  renderApp();
}

function cancelMemberBooking(classId) {
  const member = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (appState.data.classEnrollments) {
    const idx = appState.data.classEnrollments.findIndex(e => (e.classId === classId) && (e.memberId === member.id));
    if (idx !== -1) {
      appState.data.classEnrollments.splice(idx, 1);
      showToast('Đã hủy chỗ', 'Đã hủy đăng ký thành công.', 'info');
      renderApp();
    }
  }
}

// Member Shopee-style Checkout Interactions
function openCheckoutModal(pkgId) {
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để mua gói tập!', 'info');
    openLoginScreen('login');
    return;
  }
  const pkg = appState.data.packages.find(p => p.id === pkgId);
  if (!pkg) return;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  const member = resolveMember ? resolveMember(rawMember) : rawMember;
  const nameParts = (member.name || 'Phạm Thu Trang').split(' ');
  const lastName = nameParts.length > 1 ? nameParts[0] : 'Phạm';
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (member.name || 'Thu Trang');

  appState.checkoutFlow = {
    isOpen: true,
    step: 'FORM', // 'FORM' | 'VNPAY' | 'CARD_PROCESSING' | 'RESULT'
    package: pkg,
    orderId: 'ORD' + Math.floor(100000 + Math.random() * 900000),
    buyerInfo: {
      lastName: lastName,
      firstName: firstName,
      phone: member.phone || '0912345678'
    },
    paymentMethod: 'VNPAY', // 'VNPAY' | 'CARD'
    cardInfo: {
      number: '9704 1988 5678 9012',
      holder: (member.name || 'PHAM THU TRANG').toUpperCase(),
      expiry: '10/29',
      cvv: '888'
    },
    resultStatus: 'SUCCESS', // 'SUCCESS' | 'FAILED'
    failureReason: '',
    invoiceData: null
  };
  appState.selectedPackageForCheckout = pkg;
  renderApp();
}

function closeCheckoutModal() {
  if (appState.checkoutFlow) {
    appState.checkoutFlow.isOpen = false;
    appState.checkoutFlow.package = null;
  }
  appState.selectedPackageForCheckout = null;
  renderApp();
}

function setCheckoutPaymentMethod(method) {
  if (!appState.checkoutFlow) return;
  appState.checkoutFlow.paymentMethod = method;
  renderApp();
}

function updateCheckoutBuyerInfo(field, value) {
  if (!appState.checkoutFlow) return;
  if (!appState.checkoutFlow.buyerInfo) {
    appState.checkoutFlow.buyerInfo = { lastName: '', firstName: '', phone: '' };
  }
  appState.checkoutFlow.buyerInfo[field] = value;
}

function updateCheckoutCardInfo(field, value) {
  if (!appState.checkoutFlow) return;
  if (!appState.checkoutFlow.cardInfo) {
    appState.checkoutFlow.cardInfo = { number: '', holder: '', expiry: '', cvv: '' };
  }
  appState.checkoutFlow.cardInfo[field] = value;
}

function handleProceedToPayment() {
  const flow = appState.checkoutFlow;
  if (!flow) return;
  const buyer = flow.buyerInfo || {};
  if (!buyer.lastName?.trim() || !buyer.firstName?.trim() || !buyer.phone?.trim()) {
    showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ Họ đệm, Tên và Số điện thoại nhận thông báo.', 'error');
    return;
  }
  if (flow.paymentMethod === 'CARD') {
    const card = flow.cardInfo || {};
    if (!card.number?.trim() || card.number.replace(/\s/g, '').length < 12) {
      showToast('Thông tin thẻ không hợp lệ', 'Vui lòng nhập đúng số thẻ thanh toán (ít nhất 12 chữ số).', 'error');
      return;
    }
    if (!card.holder?.trim() || !card.expiry?.trim() || !card.cvv?.trim()) {
      showToast('Thiếu thông tin thẻ', 'Vui lòng nhập Tên chủ thẻ, Ngày hết hạn (MM/YY) và mã CVV.', 'error');
      return;
    }
    flow.step = 'CARD_PROCESSING';
  } else {
    flow.step = 'VNPAY';
  }
  renderApp();
}

function handleBackToCheckoutForm() {
  if (!appState.checkoutFlow) return;
  appState.checkoutFlow.step = 'FORM';
  renderApp();
}

function handleSimulatePaymentSuccess() {
  const flow = appState.checkoutFlow;
  const pkg = flow?.package || appState.selectedPackageForCheckout;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (!pkg || !rawMember) return;

  const todayStr = '2026-09-23';
  const duration = Number(pkg.durationDays) || 30;
  const endD = new Date(2026, 8, 23);
  endD.setDate(endD.getDate() + duration);
  const endYear = endD.getFullYear();
  const endMonth = String(endD.getMonth() + 1).padStart(2, '0');
  const endDay = String(endD.getDate()).padStart(2, '0');
  const endDateStr = `${endYear}-${endMonth}-${endDay}`;
  const endDateFormatted = `${endDay}/${endMonth}/${endYear}`;

  // 1. Update Member Entity
  rawMember.activePackage = pkg.name;
  rawMember.packageId = pkg.id;
  rawMember.status = 'ACTIVE';
  rawMember.startDate = todayStr;
  rawMember.endDate = endDateStr;

  // 2. Subscriptions Entity (ERD)
  if (!appState.data.subscriptions) appState.data.subscriptions = [];
  const activeExisting = appState.data.subscriptions.find(s => s.memberId === rawMember.id && s.status === 'ACTIVE');
  if (activeExisting) {
    activeExisting.status = 'EXPIRED';
  }
  const subId = 'SUB' + (1000 + appState.data.subscriptions.length + 1);
  appState.data.subscriptions.unshift({
    subscriptionId: subId,
    memberId: rawMember.id,
    packageId: pkg.id,
    startDate: todayStr,
    endDate: endDateStr,
    status: 'ACTIVE'
  });

  // 3. Payments Entity (ERD)
  if (!appState.data.payments) appState.data.payments = [];
  const payId = 'PAY' + (2000 + appState.data.payments.length + 1);
  const payMethod = (flow?.paymentMethod === 'CARD') ? 'CREDIT_CARD' : 'VNPAY_QR';
  const payMethodLabel = (flow?.paymentMethod === 'CARD') ? 'Thẻ Quốc Tế / ATM (3DSecure)' : 'Cổng VNPAY-QR';
  appState.data.payments.unshift({
    paymentId: payId,
    subscriptionId: subId,
    amount: pkg.price || 0,
    paymentMethod: payMethod,
    paymentDate: todayStr,
    status: 'PAID'
  });

  // 4. Invoices Entity
  if (!appState.data.invoices) appState.data.invoices = [];
  const invId = 'INV' + (1000 + appState.data.invoices.length + 1);
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };
  const invoiceRecord = {
    id: invId,
    memberId: rawMember.id,
    memberName: `${buyer.lastName} ${buyer.firstName}`.trim(),
    packageName: pkg.name,
    amount: pkg.price || 0,
    paymentMethod: payMethodLabel,
    date: `${todayStr} 13:00`,
    endDate: endDateFormatted,
    status: 'PAID'
  };
  appState.data.invoices.unshift(invoiceRecord);

  // 5. Notifications Entity (ERD)
  if (typeof addNotification === 'function') {
    addNotification(
      'Thanh Toán Gói Tập Thành Công',
      `Bạn đã thanh toán thành công ${(pkg.price || 0).toLocaleString()} VND cho gói ${pkg.name}. Hạn sử dụng đến ${endDateFormatted}.`,
      'ACCOUNT',
      rawMember.id
    );
  }

  // 6. AuditLog Entity (ERD)
  if (typeof recordAuditLog === 'function') {
    recordAuditLog(
      'ONLINE_CHECKOUT_SUCCESS',
      'Payments',
      `Hội viên ${rawMember.name} (${rawMember.id}) thanh toán thành công gói ${pkg.name} (${invId}) qua ${payMethodLabel}.`,
      rawMember.id
    );
  }

  // 7. Transition State to Result SUCCESS
  if (flow) {
    flow.step = 'RESULT';
    flow.resultStatus = 'SUCCESS';
    flow.invoiceData = invoiceRecord;
  }

  showToast('Thanh toán thành công', `Gói ${pkg.name} đã được kích hoạt thành công!`, 'success');
  renderApp();
}

function handleSimulatePaymentFailure(reason) {
  const flow = appState.checkoutFlow;
  if (!flow) return;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];

  flow.step = 'RESULT';
  flow.resultStatus = 'FAILED';
  flow.failureReason = reason || 'Giao dịch chưa hoàn tất do ngân hàng từ chối hoặc người dùng hủy thao tác.';

  if (typeof recordAuditLog === 'function') {
    recordAuditLog(
      'ONLINE_CHECKOUT_FAILED',
      'Payments',
      `Giao dịch thanh toán trực tuyến của ${rawMember.name} (${rawMember.id}) thất bại. Lý do: ${flow.failureReason}`,
      rawMember.id
    );
  }

  showToast('Thanh toán thất bại', flow.failureReason, 'error');
  renderApp();
}

function handleFinishCheckout() {
  if (appState.checkoutFlow) {
    appState.checkoutFlow.isOpen = false;
    appState.checkoutFlow.package = null;
  }
  appState.selectedPackageForCheckout = null;
  appState.currentTab = 'member-pass';
  renderApp();
}

function confirmMemberCheckout(pkgId) {
  openCheckoutModal(pkgId);
}

// User Profile Actions & Handlers
function openUserProfileModal(tab) {
  appState.userProfileModalOpen = true;
  appState.userProfileActiveTab = tab || 'INFO';
  appState.userProfileDraftAvatar = null;
  renderApp();
}

function closeUserProfileModal() {
  appState.userProfileModalOpen = false;
  appState.userProfileDraftAvatar = null;
  renderApp();
}

function setUserProfileTab(tab) {
  appState.userProfileActiveTab = tab;
  renderApp();
}

function selectUserProfileAvatar(url) {
  appState.userProfileDraftAvatar = url;
  renderApp();
}

function handleSaveUserProfile(e) {
  if (e) e.preventDefault();
  const lastName = (document.getElementById('profile-form-lastname')?.value || '').trim();
  const firstName = (document.getElementById('profile-form-firstname')?.value || '').trim();
  const phone = (document.getElementById('profile-form-phone')?.value || '').trim();
  const email = (document.getElementById('profile-form-email')?.value || '').trim();
  const gender = document.getElementById('profile-form-gender')?.value || 'Nữ';
  const dob = document.getElementById('profile-form-dob')?.value || '1998-05-18';
  const address = (document.getElementById('profile-form-address')?.value || '').trim();
  const goal = (document.getElementById('profile-form-goal')?.value || '').trim();
  const emergency = (document.getElementById('profile-form-emergency')?.value || '').trim();
  const customAvatar = (document.getElementById('profile-form-avatar')?.value || '').trim();

  if (!firstName) {
    showToast('Thiếu thông tin', 'Vui lòng nhập Tên của bạn.', 'error');
    return false;
  }

  const role = appState.currentRole || 'MEMBER';
  const fullName = `${lastName} ${firstName}`.trim();
  const finalAvatar = customAvatar || appState.userProfileDraftAvatar;

  if (role === 'MEMBER') {
    const rawMember = (appState.data && appState.data.members) ? (appState.data.members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || appState.data.members[0]) : null;
    if (rawMember) {
      rawMember.name = fullName;
      rawMember.lastName = lastName;
      rawMember.firstName = firstName;
      if (phone) rawMember.phone = phone;
      if (email) rawMember.email = email;
      rawMember.gender = gender;
      rawMember.dob = dob;
      rawMember.address = address;
      if (goal) rawMember.trainingGoal = goal;
      rawMember.emergencyContact = emergency;
      if (finalAvatar) rawMember.avatar = finalAvatar;
    }
  }

  if (appState.currentUser) {
    appState.currentUser.name = fullName;
    if (email) appState.currentUser.email = email;
    if (finalAvatar) appState.currentUser.avatar = finalAvatar;
  }

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('UPDATE_PROFILE', 'Members', `Người dùng cập nhật thông tin hồ sơ cá nhân: ${fullName}`, appState.currentUser?.id || 'MEM101');
  }

  appState.userProfileDraftAvatar = null;
  showToast('Cập nhật thành công', `Đã lưu hồ sơ cá nhân cho ${fullName}!`, 'success');
  renderApp();
  return false;
}

function handleChangeUserPassword(e) {
  if (e) e.preventDefault();
  const currPass = (document.getElementById('profile-sec-current-pass')?.value || '').trim();
  const newPass = (document.getElementById('profile-sec-new-pass')?.value || '').trim();
  const confirmPass = (document.getElementById('profile-sec-confirm-pass')?.value || '').trim();

  if (!newPass || newPass.length < 6) {
    showToast('Mật khẩu quá ngắn', 'Mật khẩu mới phải có tối thiểu 6 ký tự.', 'error');
    return false;
  }
  if (newPass !== confirmPass) {
    showToast('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.', 'error');
    return false;
  }

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('CHANGE_PASSWORD', 'Accounts', `Đổi mật khẩu tài khoản thành công cho ${appState.currentUser?.email || 'user'}`, appState.currentUser?.id || 'USER');
  }

  showToast('Đổi mật khẩu thành công', 'Mật khẩu mới của bạn đã được cập nhật an toàn!', 'success');
  appState.userProfileActiveTab = 'INFO';
  renderApp();
  return false;
}

// Receptionist Interactions
function setReceptionMode(mode) {
  appState.receptionMode = mode;
  renderApp();
}

function setReceptionSearchQuery(q) {
  appState.receptionSearchQuery = q;
  renderApp();
}

function handleGateBarcodeSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('gate-barcode-input');
  const code = (input?.value || '').trim();
  if (!code) return false;
  simulateGateScan(code);
  if (input) input.value = '';
  return false;
}

function simulateGateScan(code) {
  const rawMember = appState.data.members.find(m => (m.id || m.memberId || '').toLowerCase() === code.toLowerCase() || (m.phone || '').includes(code) || (m.name || '').toLowerCase().includes(code.toLowerCase()));

  if (rawMember) {
    const member = resolveMember(rawMember);
    const isValid = member.status === 'ACTIVE';
    appState.receptionLastScan = {
      memberId: member.id,
      memberName: member.name,
      phone: member.phone,
      packageName: member.activePackage,
      endDate: member.endDate,
      avatar: member.avatar,
      valid: isValid
    };

    const newLogId = 'LOG' + (500 + appState.data.checkinLogs.length + 1);
    appState.data.checkinLogs.unshift({
      id: newLogId,
      memberId: member.id,
      memberName: member.name,
      packageName: member.activePackage,
      time: 'Vừa xong',
      gate: 'Cổng 01 (Turnstile A)',
      status: isValid ? 'VALID' : 'DENIED_EXPIRED'
    });

    if (isValid) {
      showToast('Cổng Mở (BIP!)', `Hội viên ${member.name} check-in hợp lệ. Cổng mở trong 3s`, 'success');
    } else {
      showToast('Từ chối vào cổng', `Thẻ của ${member.name} đã hết hạn. Vui lòng gia hạn!`, 'error');
    }
  } else {
    showToast('Lỗi', `Không tìm thấy mã hoặc thẻ hội viên "${code}"`, 'error');
  }

  renderApp();
}

function selectPOSPackage(pkgId) {
  const pkg = appState.data.packages.find(p => p.id === pkgId);
  appState.receptionCartPackage = pkg;
  if (pkg) {
    appState.posCashReceived = pkg.price;
    appState.posVnpayPaid = false;
  }
  renderApp();
}

function setPOSPaymentMethod(method) {
  appState.posPaymentMethod = method;
  if (method === 'CASH' && appState.receptionCartPackage) {
    if (!appState.posCashReceived) {
      appState.posCashReceived = appState.receptionCartPackage.price;
    }
  }
  renderApp();
}

function setPOSQuickCash(amount) {
  appState.posCashReceived = amount;
  renderApp();
}

function handlePOSCashInput(val) {
  appState.posCashReceived = parseFloat(val) || 0;
  const changeEl = document.getElementById('pos-cash-change');
  if (changeEl) {
    const price = appState.receptionCartPackage ? appState.receptionCartPackage.price : 0;
    const diff = appState.posCashReceived - price;
    changeEl.innerText = diff >= 0 ? diff.toLocaleString() + ' đ' : 'Còn thiếu ' + Math.abs(diff).toLocaleString() + ' đ';
    changeEl.className = 'font-black text-xs ' + (diff >= 0 ? 'text-emerald-600' : 'text-rose-600');
  }
}

function updatePOSCustInfo(field, val) {
  if (!appState.posCustInfo) appState.posCustInfo = {};
  appState.posCustInfo[field] = val;
}

function handleSimulatePOSVnpayPaid(status) {
  appState.posVnpayPaid = status;
  if (status) {
    showToast('VNPAY Báo Có', 'Khách hàng đã quét mã & tài khoản ngân hàng đã nhận tiền!', 'success');
  }
  renderApp();
}

function closePOSReceiptModal() {
  appState.posReceiptModal = null;
  renderApp();
}

function handlePOSCheckout(e) {
  if (e) e.preventDefault();
  const rawName = (document.getElementById('pos-cust-name')?.value || appState.posCustInfo?.name || '').trim();
  const phone = (document.getElementById('pos-cust-phone')?.value || appState.posCustInfo?.phone || '').trim();
  const gender = document.getElementById('pos-cust-gender')?.value || appState.posCustInfo?.gender || 'Nam';
  const method = appState.posPaymentMethod || 'CASH';
  const pkg = appState.receptionCartPackage;

  if (!pkg) {
    showToast('Lỗi', 'Vui lòng bấm chọn một gói dịch vụ ở danh mục bên trái!', 'warning');
    return false;
  }

  if (!rawName) {
    showToast('Thiếu thông tin', 'Vui lòng nhập họ tên khách hàng!', 'error');
    return false;
  }

  const nameParts = rawName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : 'Khách';
  const firstName = nameParts.slice(-1).join(' ');
  const fullName = rawName;

  const newMemId = 'MEM' + (100 + appState.data.members.length + 1);
  const newSubId = 'SUB' + (100 + (appState.data.subscriptions ? appState.data.subscriptions.length : 0) + 1);
  const newPmtId = 'PMT' + (1000 + (appState.data.payments ? appState.data.payments.length : 0) + 1);

  // 1. Members entity (ERD: MemberID, FirstName, LastName, Email, TrainingGoal, Status)
  const newMember = {
    memberId: newMemId,
    id: newMemId,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    phone: phone || '0988000111',
    gender: gender,
    email: `${firstName.toLowerCase()}.${newMemId.toLowerCase()}@customer.vn`,
    trainingGoal: 'Rèn luyện thể lực & sức khỏe',
    status: 'ACTIVE'
  };
  appState.data.members.unshift(newMember);

  // 2. Subscriptions entity (ERD: SubscriptionID, MemberID, PackageID, StartDate, EndDate, Status)
  if (!appState.data.subscriptions) appState.data.subscriptions = [];
  appState.data.subscriptions.unshift({
    subscriptionId: newSubId,
    id: newSubId,
    memberId: newMemId,
    packageId: pkg.packageId || pkg.id,
    startDate: '2026-09-23',
    endDate: '2026-10-23',
    status: 'ACTIVE'
  });

  // 3. Payments entity (ERD: PaymentID, SubscriptionID, Amount, PaymentMethod, PaymentDate, Status)
  let methodLabel = 'Tiền mặt';
  if (method === 'VNPAY_QR') methodLabel = 'Cổng VNPAY-QR';
  else if (method === 'CARD') methodLabel = 'Quẹt thẻ (Visa/Mastercard/Napas)';

  if (!appState.data.payments) appState.data.payments = [];
  appState.data.payments.unshift({
    paymentId: newPmtId,
    id: newPmtId,
    subscriptionId: newSubId,
    amount: pkg.price,
    paymentMethod: method,
    paymentDate: '2026-09-23',
    date: '2026-09-23',
    status: 'PAID'
  });

  // Maintain backward-compatible invoices alias
  if (appState.data.invoices) {
    appState.data.invoices.unshift({
      id: newPmtId,
      memberId: newMemId,
      memberName: fullName,
      packageName: pkg.packageName || pkg.name,
      amount: pkg.price,
      paymentMethod: methodLabel,
      date: '2026-09-23 13:30',
      status: 'PAID'
    });
  }

  // Record audit log
  if (typeof recordAuditLog === 'function') {
    recordAuditLog('POS_SALE', 'Payments', `Lễ tân thu tiền gói ${pkg.packageName || pkg.name} (${pkg.price.toLocaleString()}đ) bằng ${methodLabel} cho khách ${fullName}`, 'USR_RECEPTIONIST');
  }

  // Open POS receipt modal
  appState.posReceiptModal = {
    receiptId: newPmtId,
    memberName: fullName,
    memberId: newMemId,
    phone: phone,
    gender: gender,
    packageName: pkg.packageName || pkg.name,
    durationDays: pkg.durationDays,
    amount: pkg.price,
    method: method,
    methodLabel: methodLabel,
    date: '2026-09-23 13:30',
    cashReceived: appState.posCashReceived,
    cardLast4: appState.posCardLast4 || '9812'
  };

  appState.receptionCartPackage = null;
  appState.posVnpayPaid = false;
  appState.posCustInfo = { name: '', phone: '', gender: 'Nam' };

  showToast('Đã thu tiền & Lập hóa đơn POS', `Kích hoạt gói ${pkg.packageName || pkg.name} thành công cho hội viên ${fullName}!`, 'success');
  renderApp();
  return false;
}

function fastRenewMemberAtReception(memberId) {
  const m = appState.data.members.find(item => item.id === memberId || item.memberId === memberId);
  if (m) {
    m.status = 'ACTIVE';
    m.endDate = '2026-11-19';
    if (appState.data.subscriptions) {
      const sub = appState.data.subscriptions.find(s => s.memberId === (m.memberId || m.id));
      if (sub) {
        sub.status = 'ACTIVE';
        sub.endDate = '2026-11-19';
      }
    }
    const resolved = resolveMember(m);

    // Add renewal invoice
    const invId = 'INV' + (1000 + appState.data.invoices.length + 1);
    appState.data.invoices.unshift({
      id: invId,
      memberId: resolved.id,
      memberName: resolved.name,
      packageName: resolved.activePackage + ' (Gia hạn 30 ngày)',
      amount: 650000,
      paymentMethod: 'CASH',
      date: '2026-09-19',
      status: 'PAID'
    });

    recordAuditLog('RENEW_MEMBERSHIP', 'Subscriptions', `Lễ tân gia hạn thẻ +30 ngày cho hội viên ${resolved.name} (${resolved.id})`, 'letan@sportscenter.vn');
    addNotification('Gia Hạn Thẻ Thành Công', `Thẻ tập ${resolved.activePackage} của bạn đã được gia hạn thêm 30 ngày (hạn đến 19/11/2026).`, 'ACCOUNT', resolved.id);

    showToast('Gia hạn thành công', `Đã gia hạn 30 ngày cho hội viên ${resolved.name}. Thu 650.000đ tiền mặt!`, 'success');
    renderApp();
  }
}

// Coach Interactions
function setCoachTab(tab) {
  appState.coachActiveTab = tab;
  renderApp();
}

function selectCoachClass(classId) {
  const c = (appState.data.classes || []).find(item => item.id === classId);
  if (c) {
    appState.selectedClassForBooking = c;
    renderApp();
  }
}

function toggleStudentAttendance(classId, studentId) {
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

function updateStudentNote(classId, studentId, note) {
  if (!appState.data.workoutResults) appState.data.workoutResults = [];
  let res = appState.data.workoutResults.find(w => w.classId === classId && w.memberId === studentId);
  if (res) {
    res.coachFeedback = note;
  } else {
    appState.data.workoutResults.push({
      resultId: 'RES0' + (appState.data.workoutResults.length + 1),
      memberId: studentId,
      classId: classId,
      activityDetails: 'Buổi tập thể thao',
      coachFeedback: note,
      loggedDate: '2026-09-19'
    });
  }
}

function saveClassAttendance(classId) {
  const c = appState.data.classes.find(item => item.id === classId);
  if (c && c.attendees) {
    const presentCount = c.attendees.filter(a => a.attended).length;
    recordAuditLog('ATTENDANCE_LOG', 'ClassAttendances', `HLV lưu điểm danh lớp ${c.title || classId}: ${presentCount}/${c.attendees.length} có mặt`, 'coach.nam@sportscenter.vn');
    showToast('Đã lưu điểm danh', `Lớp ${c.title}: ${presentCount}/${c.attendees.length} học viên có mặt`, 'success');
  }
}

// Manager Interactions
function setManagerMemberSearch(q) {
  appState.managerMemberSearch = q;
  renderApp();
}

function openManagerModal(modalName) {
  appState.managerActiveModal = modalName;
  renderApp();
}

function closeManagerModal() {
  appState.managerActiveModal = null;
  appState.managerSelectedMemberForRenew = null;
  renderApp();
}

function openRenewModal(memberId) {
  const m = appState.data.members.find(item => item.id === memberId || item.memberId === memberId);
  if (m) {
    appState.managerSelectedMemberForRenew = resolveMember(m);
    appState.managerActiveModal = 'RENEW_MEMBER';
    renderApp();
  }
}

function confirmManagerRenew(memberId) {
  fastRenewMemberAtReception(memberId);
  closeManagerModal();
}

function handleCreatePackageSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('new-pkg-name')?.value || 'Gói Mới';
  const type = document.getElementById('new-pkg-type')?.value || 'GYM';
  const days = parseInt(document.getElementById('new-pkg-days')?.value || '30', 10);
  const price = parseInt(document.getElementById('new-pkg-price')?.value || '1000000', 10);
  const desc = document.getElementById('new-pkg-desc')?.value || 'Quyền lợi đầy đủ';

  const newPkgId = 'PKG0' + (appState.data.packages.length + 1);
  
  // STRICT ERD: PackageID, PackageName, Type, Price, DurationDays, Description
  appState.data.packages.push({
    packageId: newPkgId,
    id: newPkgId,
    packageName: name,
    name: name,
    type: type,
    durationDays: days,
    price: price,
    description: desc
  });

  // Record Audit Log & Notification per ERD
  recordAuditLog('CREATE_PACKAGE', 'Packages', `Quản lý tạo mới gói ${name} (${price.toLocaleString()} VND, ${days} ngày)`, 'manager@sportscenter.vn');
  addNotification('Gói Tập Mới Ra Mắt', `Trung tâm vừa ra mắt gói tập "${name}" (${type}) với nhiều ưu đãi hấp dẫn!`, 'ACCOUNT', 'MEM101');

  closeManagerModal();
  showToast('Tạo gói tập thành công (ERD Compliant)', `Đã thêm gói ${name} (Loại: ${type}) vào danh mục!`, 'success');
  return false;
}

function handleCreateClassSubmit(e) {
  if (e) e.preventDefault();
  const subId = document.getElementById('new-class-sub')?.value || 'SUB01';
  const roomId = document.getElementById('new-class-room')?.value || 'RM01';
  const coachId = document.getElementById('new-class-coach')?.value || 'COACH';
  const scheduleTime = document.getElementById('new-class-schedule')?.value || 'Thứ 2, 4, 6 | 17:30 - 18:45';
  const cap = parseInt(document.getElementById('new-class-cap')?.value || '20', 10);

  const newClassId = 'CLS0' + (appState.data.classes.length + 1);
  
  // STRICT ERD: Only ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status
  const newClass = {
    classId: newClassId,
    id: newClassId,
    subjectId: subId,
    roomId: roomId,
    coachId: coachId,
    scheduleTime: scheduleTime,
    maxCapacity: cap,
    status: 'ACTIVE'
  };

  appState.data.classes.push(newClass);

  // Link ClassPlans entity per ERD
  if (!appState.data.classPlans) appState.data.classPlans = [];
  appState.data.classPlans.push({
    classPlanId: 'CP0' + (appState.data.classPlans.length + 1),
    classId: newClassId,
    content: 'Khởi động kéo giãn (10p) - Kỹ thuật chuyên sâu (45p) - Phục hồi (15p)',
    createDate: '2026-09-19'
  });

  const resolved = resolveClass(newClass);

  // Record Audit Log & Notification per ERD
  recordAuditLog('CREATE_CLASS', 'Classes', `Quản lý xếp lớp ${resolved.title} (${newClassId}) tại ${resolved.room}`, 'manager@sportscenter.vn');
  addNotification('Lớp Học Mới Được Mở', `Lớp học "${resolved.title}" đã được xếp lịch tại phòng ${resolved.room}.`, 'CLASS', newClassId);

  closeManagerModal();
  showToast('Tạo lớp học thành công (ERD Compliant)', `Đã tạo lớp ${resolved.title} xếp phòng ${resolved.room}!`, 'success');
  return false;
}

// Attach globally
if (typeof window !== 'undefined') {
  window.appState = appState;
  window.renderApp = renderApp;
  window.resolveClass = resolveClass;
  window.resolveMember = resolveMember;
  window.switchTab = switchTab;
  window.handleLogout = handleLogout;
  window.setAuthTab = setAuthTab;
  window.quickLoginAs = quickLoginAs;
  window.handleFormLogin = handleFormLogin;
  window.handleFormRegister = handleFormRegister;
  window.handleSendOtpBtn = handleSendOtpBtn;
  window.handleVerifyAndResetPassword = handleVerifyAndResetPassword;
  window.setMemberCategoryFilter = setMemberCategoryFilter;
  window.setMemberSearchKeyword = setMemberSearchKeyword;
  window.openBookingModal = openBookingModal;
  window.closeBookingModal = closeBookingModal;
  window.confirmBooking = confirmBooking;
  window.cancelMemberBooking = cancelMemberBooking;
  window.openCheckoutModal = openCheckoutModal;
  window.closeCheckoutModal = closeCheckoutModal;
  window.confirmMemberCheckout = confirmMemberCheckout;
  window.setCheckoutPaymentMethod = setCheckoutPaymentMethod;
  window.updateCheckoutBuyerInfo = updateCheckoutBuyerInfo;
  window.updateCheckoutCardInfo = updateCheckoutCardInfo;
  window.handleProceedToPayment = handleProceedToPayment;
  window.handleBackToCheckoutForm = handleBackToCheckoutForm;
  window.handleSimulatePaymentSuccess = handleSimulatePaymentSuccess;
  window.handleSimulatePaymentFailure = handleSimulatePaymentFailure;
  window.handleFinishCheckout = handleFinishCheckout;
  window.setReceptionMode = setReceptionMode;
  window.setReceptionSearchQuery = setReceptionSearchQuery;
  window.handleGateBarcodeSubmit = handleGateBarcodeSubmit;
  window.simulateGateScan = simulateGateScan;
  window.selectPOSPackage = selectPOSPackage;
  window.handlePOSCheckout = handlePOSCheckout;
  window.fastRenewMemberAtReception = fastRenewMemberAtReception;
  window.setCoachTab = setCoachTab;
  window.selectCoachClass = selectCoachClass;
  window.toggleStudentAttendance = toggleStudentAttendance;
  window.updateStudentNote = updateStudentNote;
  window.saveClassAttendance = saveClassAttendance;
  window.setManagerMemberSearch = setManagerMemberSearch;
  window.openManagerModal = openManagerModal;
  window.closeManagerModal = closeManagerModal;
  window.openRenewModal = openRenewModal;
  window.confirmManagerRenew = confirmManagerRenew;
  window.handleCreatePackageSubmit = handleCreatePackageSubmit;
  window.handleCreateClassSubmit = handleCreateClassSubmit;
  window.showToast = showToast;
  window.changeCalendarMonth = changeCalendarMonth;
  window.resetCalendarToToday = resetCalendarToToday;
  window.selectCalendarDate = selectCalendarDate;
  window.openSessionDetail = openSessionDetail;
  window.closeSessionDetail = closeSessionDetail;
  // ERD New Entities Handlers
  window.recordAuditLog = recordAuditLog;
  window.addNotification = addNotification;
  window.toggleNotificationDropdown = toggleNotificationDropdown;
  window.markAllNotificationsAsRead = markAllNotificationsAsRead;
  window.markSingleNotificationAsRead = markSingleNotificationAsRead;
  window.openSupportTicketModal = openSupportTicketModal;
  window.closeSupportTicketModal = closeSupportTicketModal;
  window.handleCreateSupportTicket = handleCreateSupportTicket;
  window.setReceptionTicketFilter = setReceptionTicketFilter;
  window.handleResolveSupportTicket = handleResolveSupportTicket;
  window.handleRejectSupportTicket = handleRejectSupportTicket;
  window.openAssignWorkoutPlanModal = openAssignWorkoutPlanModal;
  window.closeAssignWorkoutPlanModal = closeAssignWorkoutPlanModal;
  window.handleAssignWorkoutPlan = handleAssignWorkoutPlan;
  window.setManagerAuditSearch = setManagerAuditSearch;
  // User Profile Handlers
  window.openUserProfileModal = openUserProfileModal;
  window.closeUserProfileModal = closeUserProfileModal;
  window.setUserProfileTab = setUserProfileTab;
  window.selectUserProfileAvatar = selectUserProfileAvatar;
  window.handleSaveUserProfile = handleSaveUserProfile;
  window.handleChangeUserPassword = handleChangeUserPassword;
  // POS Cashier Handlers
  window.setPOSPaymentMethod = setPOSPaymentMethod;
  window.setPOSQuickCash = setPOSQuickCash;
  window.handlePOSCashInput = handlePOSCashInput;
  window.updatePOSCustInfo = updatePOSCustInfo;
  window.handleSimulatePOSVnpayPaid = handleSimulatePOSVnpayPaid;
  window.closePOSReceiptModal = closePOSReceiptModal;
  // User Avatar Dropdown Handlers
  window.renderUserAvatarDropdown = renderUserAvatarDropdown;
  window.renderMemberWebApp = renderMemberWebApp;
  window.toggleUserDropdown = toggleUserDropdown;
  window.closeUserDropdown = closeUserDropdown;
  window.navigateToMemberPage = navigateToMemberPage;
  // Landing / Home Handlers
  window.renderMemberLandingHome = renderMemberLandingHome;
  window.quickExploreCategory = quickExploreCategory;
  window.handleHomeSearch = handleHomeSearch;
  window.openLoginScreen = openLoginScreen;
  window.closeLoginScreen = closeLoginScreen;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderApp);
  } else {
    renderApp();
  }
}
