// =========================================================================
// MEMBER FEATURE: MY SCHEDULE & CALENDAR
// =========================================================================

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
                  <img src="${c.image}" loading="lazy" decoding="async" class="w-16 h-16 rounded-xl object-cover border border-slate-200" />
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

export { renderMemberMySchedule };
