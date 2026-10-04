// =========================================================================
// COACH WEB APP (ATTENDANCE, TIMETABLE, ROSTER, WORKOUT PLAN)
// =========================================================================

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
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      <!-- Coach Left Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shadow-xs flex-shrink-0 sticky top-0 h-screen">
        <div class="flex flex-col h-full overflow-y-auto">
          <!-- Logo -->
          <div class="h-16 flex items-center px-5 border-b border-slate-200 flex-shrink-0">
            <div class="flex items-center space-x-2.5">
              <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">TR</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">TRAINER HUB</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">Huấn Luyện Viên</div>
              </div>
            </div>
          </div>

          <!-- Nav Menu -->
          <nav class="p-3 space-y-0.5 flex-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Quản Lý Lớp Dạy</div>
            <button type="button" onclick="setCoachTab('TODAY')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'TODAY' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              <span>Hôm Nay & Điểm Danh</span>
            </button>
            <button type="button" onclick="setCoachTab('WEEK')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'WEEK' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>Lịch Dạy Cả Tuần</span>
            </button>
            <button type="button" onclick="setCoachTab('STUDENTS')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'STUDENTS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>Học Viên & Thể Lực</span>
            </button>
          </nav>

          <!-- User Info at bottom removed to put in top bar -->
        </div>
        
      </aside>

      <!-- Mobile Top Bar -->
      <div class="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div class="h-14 flex items-center justify-between px-4">
          <div class="flex items-center space-x-2">
            <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">TR</span>
            <span class="font-extrabold text-sm text-slate-900">TRAINER HUB</span>
          </div>
          <div class="flex items-center space-x-2">
            ${renderNotificationBell('COACH')}
            ${renderUserAvatarDropdown('COACH')}
          </div>
        </div>
        <div class="flex overflow-x-auto px-3 pb-2 space-x-1.5">
          <button type="button" onclick="setCoachTab('TODAY')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'TODAY' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Hôm Nay</button>
          <button type="button" onclick="setCoachTab('WEEK')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'WEEK' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Lịch Tuần</button>
          <button type="button" onclick="setCoachTab('STUDENTS')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'STUDENTS' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Học Viên</button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 md:mt-0 mt-24">
        <!-- Desktop Top Header for User Profile -->
        <header class="h-16 bg-white border-b border-slate-200 hidden md:flex items-center justify-between px-6 z-10 sticky top-0">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Huấn Luyện Viên (Coach)
            </span>
            <span class="text-slate-300">/</span>
            <span class="text-xs font-semibold text-slate-700">${mode === 'TODAY' ? 'Hôm Nay & Điểm Danh' : mode === 'WEEK' ? 'Lịch Dạy Cả Tuần' : 'Học Viên & Thể Lực'}</span>
          </div>
          <div class="flex items-center space-x-3">
            ${renderNotificationBell('COACH')}
            ${renderUserAvatarDropdown('COACH')}
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          ${mode === 'TODAY' ? renderCoachTodayMode(coachClasses, selectedClass, attendees) : ''}
          ${mode === 'WEEK' ? renderCoachWeekMode(allClasses) : ''}
          ${mode === 'STUDENTS' ? renderCoachStudentsMode(coachClasses) : ''}
        </main>
      </div>

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
                      <div class="text-[10px] font-bold text-indigo-600 uppercase">${cl.category}</div>
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

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderCoachWebApp !== 'undefined') _targetGlobal.renderCoachWebApp = renderCoachWebApp;
  if (typeof renderCoachTodayMode !== 'undefined') _targetGlobal.renderCoachTodayMode = renderCoachTodayMode;
  if (typeof renderCoachWeekMode !== 'undefined') _targetGlobal.renderCoachWeekMode = renderCoachWeekMode;
  if (typeof renderCoachStudentsMode !== 'undefined') _targetGlobal.renderCoachStudentsMode = renderCoachStudentsMode;
  if (typeof openAssignWorkoutPlanModal !== 'undefined') _targetGlobal.openAssignWorkoutPlanModal = openAssignWorkoutPlanModal;
  if (typeof closeAssignWorkoutPlanModal !== 'undefined') _targetGlobal.closeAssignWorkoutPlanModal = closeAssignWorkoutPlanModal;
  if (typeof handleAssignWorkoutPlan !== 'undefined') _targetGlobal.handleAssignWorkoutPlan = handleAssignWorkoutPlan;
  if (typeof renderAssignWorkoutPlanModal !== 'undefined') _targetGlobal.renderAssignWorkoutPlanModal = renderAssignWorkoutPlanModal;
  if (typeof setCoachTab !== 'undefined') _targetGlobal.setCoachTab = setCoachTab;
  if (typeof selectCoachClass !== 'undefined') _targetGlobal.selectCoachClass = selectCoachClass;
  if (typeof toggleStudentAttendance !== 'undefined') _targetGlobal.toggleStudentAttendance = toggleStudentAttendance;
  if (typeof updateStudentNote !== 'undefined') _targetGlobal.updateStudentNote = updateStudentNote;
  if (typeof saveClassAttendance !== 'undefined') _targetGlobal.saveClassAttendance = saveClassAttendance;
}



