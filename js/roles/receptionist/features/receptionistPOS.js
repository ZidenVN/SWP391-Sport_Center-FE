// =========================================================================
// RECEPTIONIST FEATURE: POS CASHIER & BILLING
// =========================================================================

export function selectPOSPackage(pkgId) {
  const pkg = appState.data.packages.find(p => p.id === pkgId);
  appState.receptionCartPackage = pkg;
  if (pkg) {
    appState.posCashReceived = pkg.price;
    appState.posVnpayPaid = false;
  }
  renderApp();
}

export function setPOSPaymentMethod(method) {
  appState.posPaymentMethod = method;
  if (method === 'CASH' && appState.receptionCartPackage) {
    if (!appState.posCashReceived) {
      appState.posCashReceived = appState.receptionCartPackage.price;
    }
  }
  renderApp();
}

export function setPOSQuickCash(amount) {
  appState.posCashReceived = amount;
  renderApp();
}

export function handlePOSCashInput(val) {
  appState.posCashReceived = parseFloat(val) || 0;
  const changeEl = document.getElementById('pos-cash-change');
  if (changeEl) {
    const price = appState.receptionCartPackage ? appState.receptionCartPackage.price : 0;
    const diff = appState.posCashReceived - price;
    changeEl.innerText = diff >= 0 ? diff.toLocaleString() + ' đ' : 'Còn thiếu ' + Math.abs(diff).toLocaleString() + ' đ';
    changeEl.className = 'font-black text-xs ' + (diff >= 0 ? 'text-emerald-600' : 'text-rose-600');
  }
}

export function updatePOSCustInfo(field, val) {
  if (!appState.posCustInfo) appState.posCustInfo = {};
  appState.posCustInfo[field] = val;
}

export function handleSimulatePOSVnpayPaid(status) {
  appState.posVnpayPaid = status;
  if (status) {
    showToast('VNPAY Báo Có', 'Khách hàng đã quét mã & tài khoản ngân hàng đã nhận tiền!', 'success');
  }
  renderApp();
}

export function closePOSReceiptModal() {
  appState.posReceiptModal = null;
  renderApp();
}

export function handlePOSCheckout(e) {
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

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('POS_SALE', 'Payments', `Lễ tân thu tiền gói ${pkg.packageName || pkg.name} (${pkg.price.toLocaleString()}đ) bằng ${methodLabel} cho khách ${fullName}`, 'USR_RECEPTIONIST');
  }

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

export function renderReceptionPOSMode() {
  const cart = appState.receptionCartPackage;
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const packages = rawPackages.filter(p => (p.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  const method = appState.posPaymentMethod || 'CASH';
  const custInfo = appState.posCustInfo || { name: '', phone: '', gender: 'Nam' };
  const price = cart ? cart.price : 0;
  const cashReceived = (appState.posCashReceived !== undefined && appState.posCashReceived !== null && appState.posCashReceived > 0) ? appState.posCashReceived : price;
  const cashDiff = cashReceived - price;

  return `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
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
                <div class="text-xs text-slate-400 mt-1 italic">Chưa chọn gói dịch vụ nào</div>
              `}
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-2">Phương thức thu tiền</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" onclick="setPOSPaymentMethod('CASH')" class="p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${method === 'CASH' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}">
                  <span class="text-base mb-1">💵</span>
                  <span>Tiền Mặt</span>
                </button>
                <button type="button" onclick="setPOSPaymentMethod('VNPAY_QR')" class="p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${method === 'VNPAY_QR' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}">
                  <span class="text-base mb-1">📱</span>
                  <span>VNPAY QR</span>
                </button>
                <button type="button" onclick="setPOSPaymentMethod('CARD')" class="p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${method === 'CARD' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}">
                  <span class="text-base mb-1">💳</span>
                  <span>Quẹt Thẻ</span>
                </button>
              </div>
            </div>

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

export function renderPOSReceiptModal() {
  const r = appState.posReceiptModal;
  if (!r) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-3 sm:p-6 animate-fade-in">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-auto animate-in zoom-in-95 duration-150">
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

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5 text-center">
          <div>Thu ngân: <b>Lê Ngọc Lễ Tân</b> &bull; Quầy tiếp đón 01</div>
          <div class="text-[10px] text-slate-400">Hội viên có thể quét mã vạch trên thẻ điện tử để qua cổng Turnstile ngay.</div>
        </div>

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

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.selectPOSPackage = selectPOSPackage;
  _g.setPOSPaymentMethod = setPOSPaymentMethod;
  _g.setPOSQuickCash = setPOSQuickCash;
  _g.handlePOSCashInput = handlePOSCashInput;
  _g.updatePOSCustInfo = updatePOSCustInfo;
  _g.handleSimulatePOSVnpayPaid = handleSimulatePOSVnpayPaid;
  _g.closePOSReceiptModal = closePOSReceiptModal;
  _g.handlePOSCheckout = handlePOSCheckout;
  _g.renderReceptionPOSMode = renderReceptionPOSMode;
  _g.renderPOSReceiptModal = renderPOSReceiptModal;
}
