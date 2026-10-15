// =========================================================================
// MEMBER FEATURE: DIGITAL PASS & PERSONAL INVOICES
// =========================================================================

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

export { renderMemberDigitalPass };
