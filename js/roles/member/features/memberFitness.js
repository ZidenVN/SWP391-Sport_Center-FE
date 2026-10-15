// =========================================================================
// MEMBER FEATURE: FITNESS STATS & INBODY
// =========================================================================

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

export { renderMemberFitnessStats };
