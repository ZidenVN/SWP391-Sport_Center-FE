// =========================================================================
// RECEPTIONIST WEB APP (GATE, POS, LOOKUP, SHIFT, TICKETS)
// =========================================================================

// =========================================================================
// 3. RECEPTIONIST WEB APP: 4-MODE KIOSK (GATE, POS, LOOKUP, SHIFT)
// =========================================================================
function renderReceptionistWebApp() {
  const mode = appState.receptionMode;

  return `
    <div class="min-h-screen bg-[#f1f5f9] text-slate-900 flex">
      <!-- Receptionist Left Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 text-slate-900 hidden md:flex flex-col justify-between shadow-xl flex-shrink-0 sticky top-0 h-screen">
        <div class="flex flex-col h-full overflow-y-auto">
          <!-- Logo -->
          <div class="h-16 flex items-center px-5 border-b border-slate-200 flex-shrink-0">
            <div class="flex items-center space-x-2.5">
              <span class="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs">POS</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">FRONT-DESK</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">Workstation #01</div>
              </div>
            </div>
          </div>

          <!-- Nav Menu -->
          <nav class="p-3 space-y-0.5 flex-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Nghiệp Vụ Lễ Tân</div>
            <button type="button" onclick="setReceptionMode('GATE')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'GATE' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Cổng Turnstile</span>
            </button>
            <button type="button" onclick="setReceptionMode('POS')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'POS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              <span>Bán Gói POS</span>
            </button>
            <button type="button" onclick="setReceptionMode('LOOKUP')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'LOOKUP' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span>Tra Cứu Hội Viên</span>
            </button>
            <button type="button" onclick="setReceptionMode('SHIFT')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'SHIFT' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Sổ Quỹ Ca Trực</span>
            </button>
            <button type="button" onclick="setReceptionMode('TICKETS')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${mode === 'TICKETS' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
              <span>Xử Lý Ticket</span>
            </button>
          </nav>

          <!-- User Info at bottom removed to top -->

        </div>
        
      </aside>

      <!-- Mobile Top Bar -->
      <div class="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xs text-slate-900">
        <div class="h-14 flex items-center justify-between px-4">
          <div class="flex items-center space-x-2">
            <span class="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs">POS</span>
            <span class="font-extrabold text-sm text-slate-900">FRONT-DESK</span>
          </div>
          <div class="flex items-center space-x-2">
            ${renderNotificationBell('RECEPTIONIST')}
            ${renderUserAvatarDropdown('RECEPTIONIST')}
          </div>
        </div>
        <div class="flex overflow-x-auto px-3 pb-2 space-x-1.5 ">
          <button type="button" onclick="setReceptionMode('GATE')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'GATE' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Cổng</button>
          <button type="button" onclick="setReceptionMode('POS')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'POS' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Bán POS</button>
          <button type="button" onclick="setReceptionMode('LOOKUP')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'LOOKUP' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Tra Cứu</button>
          <button type="button" onclick="setReceptionMode('SHIFT')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'SHIFT' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Sổ Quỹ</button>
          <button type="button" onclick="setReceptionMode('TICKETS')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'TICKETS' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Ticket</button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 md:mt-0 mt-24">
        <!-- Desktop Top Header for User Profile -->
        <header class="h-16 bg-white border-b border-slate-200 hidden md:flex items-center justify-between px-6 z-10 sticky top-0">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Lễ Tân (Receptionist)
            </span>
            <span class="text-slate-300">/</span>
            <span class="text-xs font-semibold text-slate-700">${mode === 'GATE' ? 'Cổng Turnstile' : mode === 'POS' ? 'Bán POS' : mode === 'LOOKUP' ? 'Tra Cứu' : mode === 'SHIFT' ? 'Sổ Quỹ' : 'Ticket'}</span>
          </div>
          <div class="flex items-center space-x-3">
            ${renderNotificationBell('RECEPTIONIST')}
            ${renderUserAvatarDropdown('RECEPTIONIST')}
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          ${mode === 'GATE' ? renderReceptionGateMode() : ''}
          ${mode === 'POS' ? renderReceptionPOSMode() : ''}
          ${mode === 'LOOKUP' ? renderReceptionLookupMode() : ''}
          ${mode === 'SHIFT' ? renderReceptionShiftMode() : ''}
          ${mode === 'TICKETS' ? renderReceptionTicketsMode() : ''}
        </main>
      </div>
    </div>
  `;
}

function renderReceptionGateMode() {
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

function renderReceptionPOSMode() {
  const cart = appState.receptionCartPackage;
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const method = appState.posPaymentMethod || 'CASH';
  const custInfo = appState.posCustInfo || { name: '', phone: '', gender: 'Nam' };
  const price = cart ? cart.price : 0;
  const cashReceived = (appState.posCashReceived !== undefined && appState.posCashReceived !== null && appState.posCashReceived > 0) ? appState.posCashReceived : price;
  const cashDiff = cashReceived - price;

  return `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Left Column: Package Catalogue -->
      <div class="xl:col-span-6 space-y-4">
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
      <div class="xl:col-span-6">
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

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderReceptionistWebApp !== 'undefined') _targetGlobal.renderReceptionistWebApp = renderReceptionistWebApp;
  if (typeof renderReceptionGateMode !== 'undefined') _targetGlobal.renderReceptionGateMode = renderReceptionGateMode;
  if (typeof renderReceptionPOSMode !== 'undefined') _targetGlobal.renderReceptionPOSMode = renderReceptionPOSMode;
  if (typeof renderPOSReceiptModal !== 'undefined') _targetGlobal.renderPOSReceiptModal = renderPOSReceiptModal;
  if (typeof renderReceptionLookupMode !== 'undefined') _targetGlobal.renderReceptionLookupMode = renderReceptionLookupMode;
  if (typeof renderReceptionShiftMode !== 'undefined') _targetGlobal.renderReceptionShiftMode = renderReceptionShiftMode;
  if (typeof setReceptionTicketFilter !== 'undefined') _targetGlobal.setReceptionTicketFilter = setReceptionTicketFilter;
  if (typeof handleResolveSupportTicket !== 'undefined') _targetGlobal.handleResolveSupportTicket = handleResolveSupportTicket;
  if (typeof handleRejectSupportTicket !== 'undefined') _targetGlobal.handleRejectSupportTicket = handleRejectSupportTicket;
  if (typeof renderReceptionTicketsMode !== 'undefined') _targetGlobal.renderReceptionTicketsMode = renderReceptionTicketsMode;
  if (typeof setReceptionMode !== 'undefined') _targetGlobal.setReceptionMode = setReceptionMode;
  if (typeof setReceptionSearchQuery !== 'undefined') _targetGlobal.setReceptionSearchQuery = setReceptionSearchQuery;
  if (typeof handleGateBarcodeSubmit !== 'undefined') _targetGlobal.handleGateBarcodeSubmit = handleGateBarcodeSubmit;
  if (typeof simulateGateScan !== 'undefined') _targetGlobal.simulateGateScan = simulateGateScan;
  if (typeof selectPOSPackage !== 'undefined') _targetGlobal.selectPOSPackage = selectPOSPackage;
  if (typeof setPOSPaymentMethod !== 'undefined') _targetGlobal.setPOSPaymentMethod = setPOSPaymentMethod;
  if (typeof setPOSQuickCash !== 'undefined') _targetGlobal.setPOSQuickCash = setPOSQuickCash;
  if (typeof handlePOSCashInput !== 'undefined') _targetGlobal.handlePOSCashInput = handlePOSCashInput;
  if (typeof updatePOSCustInfo !== 'undefined') _targetGlobal.updatePOSCustInfo = updatePOSCustInfo;
  if (typeof handleSimulatePOSVnpayPaid !== 'undefined') _targetGlobal.handleSimulatePOSVnpayPaid = handleSimulatePOSVnpayPaid;
  if (typeof closePOSReceiptModal !== 'undefined') _targetGlobal.closePOSReceiptModal = closePOSReceiptModal;
  if (typeof handlePOSCheckout !== 'undefined') _targetGlobal.handlePOSCheckout = handlePOSCheckout;
  if (typeof fastRenewMemberAtReception !== 'undefined') _targetGlobal.fastRenewMemberAtReception = fastRenewMemberAtReception;
}



