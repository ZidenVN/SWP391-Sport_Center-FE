// =========================================================================
// RECEPTIONIST FEATURE: LOOKUP, SHIFT REPORTS & SUPPORT TICKETS
// =========================================================================

export function setReceptionSearchQuery(q) {
  appState.receptionSearchQuery = q;
  renderApp();
}

export function fastRenewMemberAtReception(memberId) {
  const member = appState.data.members.find(m => m.id === memberId);
  if (!member) return;

  member.status = 'ACTIVE';
  member.endDate = '2026-11-23';

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('QUICK_RENEW', 'Members', `Lễ tân gia hạn nhanh 30 ngày cho hội viên ${member.name} (${memberId})`, 'USR_RECEPTIONIST');
  }

  showToast('Gia Hạn Thành Công', `Đã cộng thêm 30 ngày tập cho hội viên ${member.name}! Hạn mới: ${member.endDate}`, 'success');
  renderApp();
}

export function renderReceptionLookupMode() {
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

export function renderReceptionShiftMode() {
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

export function setReceptionTicketFilter(filter) {
  appState.receptionTicketFilter = filter;
  renderApp();
}

export function handleResolveSupportTicket(ticketId) {
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

    if (typeof addNotification === 'function') {
      addNotification('Phản Hồi Yêu Cầu Hỗ Trợ', `Quầy lễ tân đã chấp thuận & giải quyết phiếu #${ticketId}: "${responseText}"`, 'ACCOUNT', ticket.memberId);
    }
    if (typeof recordAuditLog === 'function') {
      recordAuditLog('RESOLVE_TICKET', 'SupportTickets', `Lễ tân giải quyết phiếu ${ticketId} cho hội viên ${ticket.memberId}`, 'letan@sportscenter.vn');
    }

    showToast('Thành Công', `Đã giải quyết và gửi phản hồi phiếu #${ticketId} tới hội viên!`, 'success');
    renderApp();
  }
}

export function handleRejectSupportTicket(ticketId) {
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

    if (typeof addNotification === 'function') {
      addNotification('Từ Chối Yêu Cầu Hỗ Trợ', `Quầy lễ tân đã phản hồi từ chối phiếu #${ticketId}: "${responseText}"`, 'ACCOUNT', ticket.memberId);
    }
    if (typeof recordAuditLog === 'function') {
      recordAuditLog('REJECT_TICKET', 'SupportTickets', `Lễ tân từ chối phiếu ${ticketId} cho hội viên ${ticket.memberId} (Lý do: ${responseText})`, 'letan@sportscenter.vn');
    }

    showToast('Đã Từ Chối', `Đã từ chối phiếu #${ticketId} và gửi phản hồi cho hội viên!`, 'error');
    renderApp();
  }
}

export function renderReceptionTicketsMode() {
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
                  <textarea id="ticket-reply-${t.ticketId || t.id}" rows="2" placeholder="Nhập kết quả xử lý hoặc lý do từ chối..." class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
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

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.setReceptionSearchQuery = setReceptionSearchQuery;
  _g.fastRenewMemberAtReception = fastRenewMemberAtReception;
  _g.renderReceptionLookupMode = renderReceptionLookupMode;
  _g.renderReceptionShiftMode = renderReceptionShiftMode;
  _g.setReceptionTicketFilter = setReceptionTicketFilter;
  _g.handleResolveSupportTicket = handleResolveSupportTicket;
  _g.handleRejectSupportTicket = handleRejectSupportTicket;
  _g.renderReceptionTicketsMode = renderReceptionTicketsMode;
}
