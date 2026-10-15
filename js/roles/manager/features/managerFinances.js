// =========================================================================
// MANAGER FEATURE: FINANCES & INVOICE LEDGER
// =========================================================================

export function renderManagerFinances() {
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

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerFinances = renderManagerFinances;
}
