// =========================================================================
// MODALS (SESSION DETAIL & SUPPORT TICKETS)
// =========================================================================

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

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderSessionDetailModal !== 'undefined') _targetGlobal.renderSessionDetailModal = renderSessionDetailModal;
  if (typeof openSupportTicketModal !== 'undefined') _targetGlobal.openSupportTicketModal = openSupportTicketModal;
  if (typeof closeSupportTicketModal !== 'undefined') _targetGlobal.closeSupportTicketModal = closeSupportTicketModal;
  if (typeof handleCreateSupportTicket !== 'undefined') _targetGlobal.handleCreateSupportTicket = handleCreateSupportTicket;
  if (typeof renderSupportTicketModal !== 'undefined') _targetGlobal.renderSupportTicketModal = renderSupportTicketModal;
}
