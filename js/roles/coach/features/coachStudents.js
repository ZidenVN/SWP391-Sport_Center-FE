// =========================================================================
// COACH FEATURE: STUDENTS ROSTER & WORKOUT PLAN ASSIGNMENT
// =========================================================================

export function openAssignWorkoutPlanModal(memberId) {
  appState.coachSelectedMemberForWorkoutPlan = memberId;
  appState.coachWorkoutPlanModalOpen = true;
  renderApp();
}

export function closeAssignWorkoutPlanModal() {
  appState.coachWorkoutPlanModalOpen = false;
  appState.coachSelectedMemberForWorkoutPlan = null;
  renderApp();
}

export function handleAssignWorkoutPlan(e) {
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

  if (typeof addNotification === 'function') {
    addNotification('HLV Giao Giáo Án Luyện Tập Riêng', `HLV Trần Hoàng Nam vừa thiết lập lộ trình "${planName}" cho bạn. Hãy kiểm tra mục Thể Trạng!`, 'ACCOUNT', memberId);
  }
  if (typeof recordAuditLog === 'function') {
    recordAuditLog('ASSIGN_WORKOUT_PLAN', 'WorkoutPlans', `HLV gán giáo án ${planName} (${newPlanId}) cho học viên ${memberId}`, 'coach.nam@sportscenter.vn');
  }

  closeAssignWorkoutPlanModal();
  showToast('Thành Công', `Đã giao giáo án "${planName}" cho học viên thành công!`, 'success');
  return false;
}

export function renderAssignWorkoutPlanModal() {
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

export function renderCoachStudentsMode(coachClasses) {
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

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.openAssignWorkoutPlanModal = openAssignWorkoutPlanModal;
  _g.closeAssignWorkoutPlanModal = closeAssignWorkoutPlanModal;
  _g.handleAssignWorkoutPlan = handleAssignWorkoutPlan;
  _g.renderAssignWorkoutPlanModal = renderAssignWorkoutPlanModal;
  _g.renderCoachStudentsMode = renderCoachStudentsMode;
}
