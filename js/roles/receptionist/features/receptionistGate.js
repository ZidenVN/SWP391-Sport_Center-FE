// =========================================================================
// RECEPTIONIST FEATURE: GATE SCANNER & REAL-TIME LOGS
// =========================================================================

export function handleGateBarcodeSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('gate-barcode-input');
  if (!input) return false;
  const val = input.value.trim();
  if (!val) return false;
  simulateGateScan(val);
  input.value = '';
  return false;
}

export function simulateGateScan(code) {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const found = members.find(m => m.id.toLowerCase() === code.toLowerCase() || m.phone === code);

  if (!found) {
    showToast('Từ Chối Cổng', `Không tìm thấy mã thẻ hoặc SĐT "${code}" trên hệ thống!`, 'error');
    return;
  }

  const resolved = resolveMember(found);
  const isValid = resolved.status === 'ACTIVE';

  appState.receptionLastScan = {
    memberId: resolved.id,
    memberName: resolved.name,
    avatar: resolved.avatar,
    phone: resolved.phone,
    packageName: resolved.activePackage,
    endDate: resolved.endDate,
    valid: isValid,
    timestamp: new Date().toLocaleTimeString('vi-VN')
  };

  if (!appState.data.checkinLogs) appState.data.checkinLogs = [];
  appState.data.checkinLogs.unshift({
    logId: 'CHK' + (appState.data.checkinLogs.length + 1),
    memberId: resolved.id,
    memberName: resolved.name,
    packageName: resolved.activePackage,
    gate: 'Cổng Lối Vào 01 (Gate A)',
    time: 'Vừa xong',
    status: isValid ? 'VALID' : 'INVALID'
  });

  recordAuditLog('GATE_CHECKIN', 'Members', `Check-in cổng ${isValid ? 'hợp lệ' : 'từ chối'}: ${resolved.name} (${resolved.id})`, 'reception@sportscenter.vn');

  if (isValid) {
    showToast('Cổng Mở (3s)', `Chào mừng hội viên ${resolved.name}!`, 'success');
  } else {
    showToast('Thẻ Hết Hạn', `Thẻ của ${resolved.name} đã hết hạn ngày ${resolved.endDate}. Cần gia hạn!`, 'warning');
  }

  renderApp();
}

export function renderReceptionGateMode() {
  const lastScan = appState.receptionLastScan;
  const logs = (appState.data && appState.data.checkinLogs) ? appState.data.checkinLogs : [];

  return `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div class="xl:col-span-7 space-y-6">
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
      <div class="xl:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
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

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.handleGateBarcodeSubmit = handleGateBarcodeSubmit;
  _g.simulateGateScan = simulateGateScan;
  _g.renderReceptionGateMode = renderReceptionGateMode;
}
