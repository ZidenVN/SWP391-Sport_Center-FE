// =========================================================================
// MEMBER CHECKOUT: 2-COLUMN SHOPEE-STYLE CHECKOUT & VNPAY QR
// =========================================================================

// =========================================================================
// MEMBER CHECKOUT: 2-COLUMN SHOPEE-STYLE CHECKOUT, VNPAY-QR & RESULT CARD
// =========================================================================

function renderMemberCheckoutModal() {
  const flow = appState.checkoutFlow;
  const pkg = (flow && flow.package) ? flow.package : appState.selectedPackageForCheckout;
  if (!pkg || (flow && !flow.isOpen && !appState.selectedPackageForCheckout)) return '';

  const step = flow ? flow.step : 'FORM';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-2 sm:p-5 animate-fade-in">
      ${step === 'FORM' ? renderShopeeCheckoutForm(pkg, flow) : ''}
      ${step === 'VNPAY' ? renderShopeeCheckoutVnpayGateway(pkg, flow) : ''}
      ${step === 'CARD_PROCESSING' ? renderShopeeCheckoutCardGateway(pkg, flow) : ''}
      ${step === 'RESULT' ? renderShopeeCheckoutResultCard(pkg, flow) : ''}
    </div>
  `;
}

function renderShopeeCheckoutForm(pkg, flow) {
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };
  const card = flow?.cardInfo || { number: '9704 1988 5678 9012', holder: 'PHAM THU TRANG', expiry: '10/29', cvv: '888' };
  const method = flow?.paymentMethod || 'VNPAY';

  return `
    <div class="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-3.5 my-auto animate-in fade-in zoom-in-95 duration-150">
      <!-- Checkout Header -->
      <div class="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Sports Center Checkout
            </span>
            <span class="text-xs text-slate-400 font-semibold">&bull; Bảo mật PCI-DSS</span>
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">Thanh Toán Gói Tập Hội Viên</h2>
          <p class="text-xs text-slate-500 mt-0.5">Xác nhận thông tin đăng ký và kích hoạt thẻ tự động sau khi thanh toán.</p>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-lg transition">
          &times;
        </button>
      </div>

      <!-- 2-Column Shopee Layout: Left Details, Right Payment Form -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- LEFT COLUMN: Chi Tiết Gói Tập (5 Cols) -->
        <div class="lg:col-span-5 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                ${pkg.type || 'ALL-ACCESS'}
              </span>
              <span class="text-xs font-bold text-slate-500">${pkg.durationDays} Ngày Sử Dụng</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 mt-2 leading-snug">${pkg.name || pkg.packageName}</h3>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${pkg.description || 'Gói tập chất lượng cao với quyền lợi đầy đủ tại Sports Center.'}</p>
          </div>

          <!-- Price Box -->
          <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div class="flex justify-between items-center text-xs text-slate-500">
              <span>Đơn giá niêm yết:</span>
              <span class="line-through text-slate-400">${((pkg.price || 0) * 1.2).toLocaleString()} đ</span>
            </div>
            <div class="flex justify-between items-center text-xs text-emerald-600 font-bold">
              <span>Ưu đãi thành viên mới:</span>
              <span>-20% Ưu Đãi</span>
            </div>
            <div class="pt-1.5 border-t border-slate-100 flex justify-between items-baseline">
              <span class="text-xs font-bold text-slate-900">Tổng thanh toán:</span>
              <span class="text-lg sm:text-xl font-black text-indigo-700">${(pkg.price || 0).toLocaleString()} <span class="text-xs font-bold">VND</span></span>
            </div>
          </div>

          <!-- Perks Checklist -->
          <div class="space-y-2 pt-0.5">
            <div class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Đặc quyền hội viên đi kèm:</div>
            <div class="space-y-1.5 text-xs text-slate-700">
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Check-in tự động cổng Turnstile không giới hạn</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Miễn phí tủ đồ Locker thông minh và phòng tắm nóng lạnh</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Đo InBody định kỳ & nhận giáo án tập luyện từ HLV</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Quyền đặt trước lịch học Yoga, Boxing, Zumba, Pilates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Form Thông Tin & Thanh Toán (7 Cols) -->
        <div class="lg:col-span-7 space-y-3.5">
          <!-- Step 1: Buyer Information -->
          <div class="space-y-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider">Thông Tin Khách Hàng (Họ, Tên, Số Điện Thoại)</h4>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Họ Đệm <span class="text-rose-500">*</span></label>
                <input type="text" id="checkout-buyer-lastname" value="${buyer.lastName}" oninput="updateCheckoutBuyerInfo('lastName', this.value)" placeholder="Ví dụ: Phạm" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên <span class="text-rose-500">*</span></label>
                <input type="text" id="checkout-buyer-firstname" value="${buyer.firstName}" oninput="updateCheckoutBuyerInfo('firstName', this.value)" placeholder="Ví dụ: Thu Trang" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Điện Thoại Nhận Thông Báo <span class="text-rose-500">*</span></label>
              <input type="tel" id="checkout-buyer-phone" value="${buyer.phone}" oninput="updateCheckoutBuyerInfo('phone', this.value)" placeholder="0912345678" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <!-- Step 2: Payment Method Selection -->
          <div class="space-y-2.5 pt-1">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider">Phương Thức Thanh Toán Trực Tuyến</h4>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- VNPAY-QR Card -->
              <div onclick="setCheckoutPaymentMethod('VNPAY')" class="p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${method === 'VNPAY' ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}">
                <input type="radio" name="checkout_method_radio" value="VNPAY" ${method === 'VNPAY' ? 'checked' : ''} class="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-black text-xs text-slate-900">Cổng VNPAY-QR</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Phổ biến</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">Quét mã QR từ 40+ app ngân hàng & Ví VNPAY.</p>
                </div>
              </div>

              <!-- Credit/Debit Card -->
              <div onclick="setCheckoutPaymentMethod('CARD')" class="p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${method === 'CARD' ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}">
                <input type="radio" name="checkout_method_radio" value="CARD" ${method === 'CARD' ? 'checked' : ''} class="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-black text-xs text-slate-900">Thẻ Quốc Tế / ATM</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">Thanh toán bằng thẻ Visa, Mastercard hoặc Napas.</p>
                </div>
              </div>
            </div>

            <!-- Conditional Details: If Card is selected -->
            ${method === 'CARD' ? `
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-100">
                <div class="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Thông Tin Thẻ Thanh Toán</span>
                  <div class="flex items-center space-x-1.5">
                    <!-- Visa SVG Logo -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Visa">
                      <svg class="h-3 w-auto" viewBox="0 0 36 12" fill="none">
                        <path d="M14.5 0.5L9.6 11.5H6.4L3.9 2.5C3.8 2 3.6 1.7 3.1 1.4C2.3 1 1.1 0.7 0 0.5L0.1 0.2H5.3C6 0.2 6.6 0.7 6.8 1.4L8 8.2L11.3 0.2H14.5V0.5ZM27.3 7.8C27.3 4.8 23.1 4.6 23.2 3.3C23.3 2.9 23.7 2.4 24.5 2.3C25 2.2 26.2 2.2 27.4 2.7L27.9 0.4C27.3 0.2 26.4 0 25.3 0C22.2 0 20 1.6 20 4C19.9 5.8 21.6 6.7 22.8 7.3C24 7.9 24.5 8.3 24.5 8.8C24.4 9.6 23.4 10 22.6 10C21 10 20.1 9.5 19.3 9.1L18.8 11.5C19.6 11.9 21.1 12.2 22.5 12.2C25.7 12.2 27.9 10.6 27.9 8.2L27.3 7.8ZM35.7 11.5H38.5L36 0.2H33.4C32.8 0.2 32.3 0.6 32.1 1.1L27.4 11.5H30.6L31.2 9.8H35.2L35.7 11.5ZM32.1 7.4L33.7 3.1L34.7 7.4H32.1ZM18.8 0.2L16.3 11.5H13.2L15.7 0.2H18.8Z" fill="#1434CB"/>
                      </svg>
                    </div>
                    <!-- Mastercard SVG Logo -->
                    <div class="h-6 px-1.5 py-0.5 bg-white border border-slate-200 rounded flex items-center justify-center shadow-2xs" title="Mastercard">
                      <svg class="h-3.5 w-auto" viewBox="0 0 28 18" fill="none">
                        <circle cx="10" cy="9" r="6.5" fill="#EB001B"/>
                        <circle cx="18" cy="9" r="6.5" fill="#F79E1B"/>
                        <path d="M14 4.13A6.47 6.47 0 0 0 11.6 9 6.47 6.47 0 0 0 14 13.87 6.47 6.47 0 0 0 16.4 9 6.47 6.47 0 0 0 14 4.13Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <!-- Napas SVG Logo -->
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

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Thẻ (16 chữ số) <span class="text-rose-500">*</span></label>
                  <input type="text" id="checkout-card-number" maxlength="19" value="${card.number}" oninput="updateCheckoutCardInfo('number', this.value)" placeholder="9704 1988 5678 9012" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên In Trên Thẻ (Không dấu) <span class="text-rose-500">*</span></label>
                  <input type="text" id="checkout-card-holder" value="${card.holder}" oninput="updateCheckoutCardInfo('holder', this.value)" placeholder="PHAM THU TRANG" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Ngày Hết Hạn <span class="text-rose-500">*</span></label>
                    <input type="text" id="checkout-card-expiry" maxlength="5" value="${card.expiry}" oninput="updateCheckoutCardInfo('expiry', this.value)" placeholder="MM/YY (10/29)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Mã Bảo Mật CVV <span class="text-rose-500">*</span></label>
                    <input type="password" id="checkout-card-cvv" maxlength="4" value="${card.cvv}" oninput="updateCheckoutCardInfo('cvv', this.value)" placeholder="•••" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            ` : `
              <div class="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2.5">
                <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">QR</div>
                <div class="space-y-0.5">
                  <div class="font-bold text-xs">Mã QR Thanh Toán Tức Thì VNPAY</div>
                  <div class="text-[11px] text-slate-600 leading-relaxed">
                    Sau khi bấm tiếp tục, hệ thống sẽ mở mã QR VNPAY chính hãng. Bạn chỉ cần mở app ngân hàng quét mã và xác nhận chuyển tiền.
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
            <button type="button" onclick="closeCheckoutModal()" class="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
              Hủy Bỏ
            </button>
            <button type="button" onclick="handleProceedToPayment()" class="w-full sm:flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center space-x-2">
              <span>${method === 'VNPAY' ? 'Tiếp Tục Với Cổng VNPAY-QR' : 'Thanh Toán ' + (pkg.price || 0).toLocaleString() + ' VND Ngay'}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderShopeeCheckoutVnpayGateway(pkg, flow) {
  const orderId = flow?.orderId || ('VNP' + Math.floor(100000 + Math.random() * 900000));
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      <!-- VNPAY Brand Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
            VNP
          </div>
          <div>
            <div class="font-black text-xs sm:text-sm tracking-tight text-slate-900 leading-tight">CỔNG THANH TOÁN VNPAY-QR</div>
            <div class="text-[10px] text-slate-400 font-semibold">Giao dịch thanh toán trực tuyến an toàn</div>
          </div>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
      </div>

      <!-- Order Summary Card -->
      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Đơn vị thụ hưởng:</span>
          <span class="font-bold text-slate-900">SPORTS CENTER VIETNAM</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Gói đăng ký:</span>
          <span class="font-bold text-indigo-700">${pkg.name || pkg.packageName} (${pkg.durationDays} Ngày)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Mã giao dịch (Order ID):</span>
          <span class="font-mono font-bold text-slate-800">${orderId}</span>
        </div>
        <div class="flex justify-between pt-1.5 border-t border-slate-200 text-sm">
          <span class="font-bold text-slate-900">Số tiền cần thanh toán:</span>
          <span class="font-black text-rose-600 text-base">${(pkg.price || 0).toLocaleString()} VND</span>
        </div>
      </div>

      <!-- QR Code Display Container -->
      <div class="space-y-2.5">
        <div class="relative mx-auto w-48 h-48 p-2.5 bg-white rounded-2xl border-2 border-indigo-500 shadow-md flex flex-col items-center justify-center">
          <!-- Stylized QR Code SVG -->
          <svg class="w-full h-full text-slate-900" viewBox="0 0 200 200" fill="currentColor">
            <!-- Position Marks -->
            <rect x="10" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="27" y="27" width="16" height="16" rx="2" fill="#4338ca" />

            <rect x="140" y="10" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="157" y="27" width="16" height="16" rx="2" fill="#4338ca" />

            <rect x="10" y="140" width="50" height="50" rx="6" fill="#1e1b4b" />
            <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
            <rect x="27" y="157" width="16" height="16" rx="2" fill="#4338ca" />

            <!-- Random simulated QR data grid -->
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

            <!-- Center Logo Badge -->
            <rect x="78" y="78" width="44" height="44" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <text x="100" y="104" font-size="11" font-weight="900" fill="#4338ca" text-anchor="middle" font-family="sans-serif">VNPAY</text>
          </svg>
        </div>

        <!-- Countdown Timer -->
        <div class="flex items-center justify-center space-x-1.5 text-xs text-slate-500">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Mã QR sẽ hết hiệu lực sau: <b class="font-mono text-indigo-700">14:52</b></span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
        <div class="font-bold text-slate-800">Hướng dẫn quét mã thanh toán:</div>
        <div>1. Mở ứng dụng Ngân hàng (Vietcombank, MB, Techcombank...) hoặc Ví VNPAY.</div>
        <div>2. Chọn tính năng <b>Quét QR (QR Pay)</b> và hướng camera về mã trên.</div>
        <div>3. Kiểm tra số tiền <b>${(pkg.price || 0).toLocaleString()} VND</b> và bấm <b>Xác nhận chuyển tiền</b>.</div>
      </div>

      <!-- Simulation Action Buttons -->
      <div class="space-y-2 pt-1">
        <button type="button" onclick="handleSimulatePaymentSuccess()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2">
          <span>✔ [Mô Phỏng] Ngân Hàng Xác Nhận Đã Nhận Tiền Thành Công</span>
        </button>
        <button type="button" onclick="handleSimulatePaymentFailure('Giao dịch bị từ chối hoặc người dùng hủy thao tác quét mã VNPAY.')" class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition">
          ✕ [Mô Phỏng] Giả Lập Thanh Toán Thất Bại / Hủy Bỏ
        </button>
        <button type="button" onclick="handleBackToCheckoutForm()" class="text-xs text-slate-500 hover:text-slate-800 hover:underline font-semibold pt-0.5">
          &larr; Quay lại form chọn phương thức khác
        </button>
      </div>
    </div>
  `;
}

function renderShopeeCheckoutCardGateway(pkg, flow) {
  const card = flow?.cardInfo || { number: '9704 1988 5678 9012' };
  const last4 = (card.number || '9012').replace(/\s/g, '').slice(-4);

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2 text-left">
          <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
            3DS
          </div>
          <div>
            <div class="font-bold text-xs text-slate-900 uppercase">Xác Thực Thẻ 3D-Secure</div>
            <div class="text-[10px] text-slate-400">Bảo mật giao dịch trực tuyến</div>
          </div>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold">&times;</button>
      </div>

      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Thẻ thanh toán:</span>
          <span class="font-mono font-bold text-slate-900">•••• •••• •••• ${last4}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Số tiền giao dịch:</span>
          <span class="font-black text-indigo-700 text-sm">${(pkg.price || 0).toLocaleString()} VND</span>
        </div>
      </div>

      <div class="space-y-2.5">
        <p class="text-xs text-slate-600 leading-relaxed">
          Mã xác thực giao dịch một lần (OTP) đã được gửi đến số điện thoại đăng ký thẻ của bạn.
        </p>

        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nhập mã xác thực OTP (6 chữ số)</label>
          <input type="text" id="card-otp-input" value="888888" maxlength="6" class="w-44 mx-auto px-3 py-2.5 bg-white border-2 border-indigo-500 rounded-xl text-center font-mono font-black text-lg tracking-widest text-slate-900 shadow-inner focus:outline-none" />
        </div>
        <div class="text-[10px] text-slate-400">Mã có hiệu lực trong 02:00 phút. Điền sẵn mã mẫu: <b>888888</b></div>
      </div>

      <div class="space-y-2 pt-1">
        <button type="button" onclick="handleSimulatePaymentSuccess()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition">
          Xác Nhận Mã OTP & Hoàn Tất Trừ Tiền
        </button>
        <button type="button" onclick="handleSimulatePaymentFailure('Mã OTP không chính xác hoặc ngân hàng từ chối trừ tiền.')" class="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition">
          Hủy Bỏ Giao Dịch
        </button>
      </div>
    </div>
  `;
}

function renderShopeeCheckoutResultCard(pkg, flow) {
  const isSuccess = flow?.resultStatus === 'SUCCESS';
  const invoice = flow?.invoiceData || { id: 'INV1001', date: '2026-09-23 12:55', paymentMethod: 'Cổng VNPAY-QR' };
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };

  return `
    <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-center">
      ${isSuccess ? `
        <!-- SUCCESS STATE: TICK XANH LÁ LỚN -->
        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Giao Dịch Thành Công
          </span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">THANH TOÁN THÀNH CÔNG!</h3>
          <p class="text-xs text-slate-500 mt-0.5">Chúc mừng bạn! Thẻ hội viên của bạn đã được kích hoạt trực tiếp trên hệ thống.</p>
        </div>

        <!-- Bảng chi tiết hóa đơn (Receipt Details) -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div class="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span class="text-slate-500">Mã hóa đơn:</span>
            <span class="font-mono font-bold text-slate-900">${invoice.id}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Gói đăng ký:</span>
            <span class="font-bold text-indigo-700">${pkg.name || pkg.packageName}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Thời hạn sử dụng:</span>
            <span class="font-bold text-slate-900">${pkg.durationDays} Ngày (Hạn đến: 23/11/2026)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Số tiền đã thanh toán:</span>
            <span class="font-black text-slate-900 text-sm">${(pkg.price || 0).toLocaleString()} VND</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Phương thức:</span>
            <span class="font-semibold text-slate-800">${invoice.paymentMethod}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Hội viên:</span>
            <span class="font-bold text-slate-900">${buyer.lastName} ${buyer.firstName} (${buyer.phone})</span>
          </div>
          <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Thời gian giao dịch:</span>
            <span>${invoice.date}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-0.5">
          <button type="button" onclick="handleFinishCheckout()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2">
            <span>Xem Thẻ Hội Viên Điện Tử Ngay</span>
            <span>&rarr;</span>
          </button>
          <button type="button" onclick="closeCheckoutModal()" class="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-bold transition">
            Quay Về Trang Chủ
          </button>
        </div>
      ` : `
        <!-- FAILED STATE: DẤU X ĐỎ LỚN -->
        <div class="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner ring-8 ring-rose-50">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            Giao Dịch Không Thành Công
          </span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">THANH TOÁN THẤT BẠI</h3>
          <p class="text-xs text-rose-600 font-medium mt-1 leading-relaxed">
            ${flow?.failureReason || 'Giao dịch chưa được hoàn tất do lỗi từ ngân hàng hoặc người dùng hủy thao tác.'}
          </p>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left">
          <div class="font-bold text-slate-800 mb-1">Gợi ý khắc phục:</div>
          <div>&bull; Kiểm tra lại hạn mức hoặc số dư khả dụng trong tài khoản/thẻ.</div>
          <div>&bull; Đảm bảo ứng dụng ngân hàng đã bật tính năng thanh toán trực tuyến.</div>
          <div>&bull; Bạn cũng có thể chọn phương thức thanh toán khác để tiếp tục.</div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-0.5">
          <button type="button" onclick="handleBackToCheckoutForm()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition">
            Thử Lại Thanh Toán
          </button>
          <button type="button" onclick="closeCheckoutModal()" class="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-bold transition">
            Đóng Hộp Thoại
          </button>
        </div>
      `}
    </div>
  `;
}


function openCheckoutModal(pkgId) {
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để mua gói tập!', 'info');
    openLoginScreen('login');
    return;
  }
  const pkg = appState.data.packages.find(p => p.id === pkgId);
  if (!pkg) return;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  const member = resolveMember ? resolveMember(rawMember) : rawMember;
  const nameParts = (member.name || 'Phạm Thu Trang').split(' ');
  const lastName = nameParts.length > 1 ? nameParts[0] : 'Phạm';
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (member.name || 'Thu Trang');

  appState.checkoutFlow = {
    isOpen: true,
    step: 'FORM', // 'FORM' | 'VNPAY' | 'CARD_PROCESSING' | 'RESULT'
    package: pkg,
    orderId: 'ORD' + Math.floor(100000 + Math.random() * 900000),
    buyerInfo: {
      lastName: lastName,
      firstName: firstName,
      phone: member.phone || '0912345678'
    },
    paymentMethod: 'VNPAY', // 'VNPAY' | 'CARD'
    cardInfo: {
      number: '9704 1988 5678 9012',
      holder: (member.name || 'PHAM THU TRANG').toUpperCase(),
      expiry: '10/29',
      cvv: '888'
    },
    resultStatus: 'SUCCESS', // 'SUCCESS' | 'FAILED'
    failureReason: '',
    invoiceData: null
  };
  appState.selectedPackageForCheckout = pkg;
  renderApp();
}

function closeCheckoutModal() {
  if (appState.checkoutFlow) {
    appState.checkoutFlow.isOpen = false;
    appState.checkoutFlow.package = null;
  }
  appState.selectedPackageForCheckout = null;
  renderApp();
}

function setCheckoutPaymentMethod(method) {
  if (!appState.checkoutFlow) return;
  appState.checkoutFlow.paymentMethod = method;
  renderApp();
}

function updateCheckoutBuyerInfo(field, value) {
  if (!appState.checkoutFlow) return;
  if (!appState.checkoutFlow.buyerInfo) {
    appState.checkoutFlow.buyerInfo = { lastName: '', firstName: '', phone: '' };
  }
  appState.checkoutFlow.buyerInfo[field] = value;
}

function updateCheckoutCardInfo(field, value) {
  if (!appState.checkoutFlow) return;
  if (!appState.checkoutFlow.cardInfo) {
    appState.checkoutFlow.cardInfo = { number: '', holder: '', expiry: '', cvv: '' };
  }
  appState.checkoutFlow.cardInfo[field] = value;
}

function handleProceedToPayment() {
  const flow = appState.checkoutFlow;
  if (!flow) return;
  const buyer = flow.buyerInfo || {};
  if (!buyer.lastName?.trim() || !buyer.firstName?.trim() || !buyer.phone?.trim()) {
    showToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ Họ đệm, Tên và Số điện thoại nhận thông báo.', 'error');
    return;
  }
  if (flow.paymentMethod === 'CARD') {
    const card = flow.cardInfo || {};
    if (!card.number?.trim() || card.number.replace(/\s/g, '').length < 12) {
      showToast('Thông tin thẻ không hợp lệ', 'Vui lòng nhập đúng số thẻ thanh toán (ít nhất 12 chữ số).', 'error');
      return;
    }
    if (!card.holder?.trim() || !card.expiry?.trim() || !card.cvv?.trim()) {
      showToast('Thiếu thông tin thẻ', 'Vui lòng nhập Tên chủ thẻ, Ngày hết hạn (MM/YY) và mã CVV.', 'error');
      return;
    }
    flow.step = 'CARD_PROCESSING';
  } else {
    flow.step = 'VNPAY';
  }
  renderApp();
}

function handleBackToCheckoutForm() {
  if (!appState.checkoutFlow) return;
  appState.checkoutFlow.step = 'FORM';
  renderApp();
}

function handleSimulatePaymentSuccess() {
  const flow = appState.checkoutFlow;
  const pkg = flow?.package || appState.selectedPackageForCheckout;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (!pkg || !rawMember) return;

  const todayStr = '2026-09-23';
  const duration = Number(pkg.durationDays) || 30;
  const endD = new Date(2026, 8, 23);
  endD.setDate(endD.getDate() + duration);
  const endYear = endD.getFullYear();
  const endMonth = String(endD.getMonth() + 1).padStart(2, '0');
  const endDay = String(endD.getDate()).padStart(2, '0');
  const endDateStr = `${endYear}-${endMonth}-${endDay}`;
  const endDateFormatted = `${endDay}/${endMonth}/${endYear}`;

  // 1. Update Member Entity
  rawMember.activePackage = pkg.name;
  rawMember.packageId = pkg.id;
  rawMember.status = 'ACTIVE';
  rawMember.startDate = todayStr;
  rawMember.endDate = endDateStr;

  // 2. Subscriptions Entity (ERD)
  if (!appState.data.subscriptions) appState.data.subscriptions = [];
  const activeExisting = appState.data.subscriptions.find(s => s.memberId === rawMember.id && s.status === 'ACTIVE');
  if (activeExisting) {
    activeExisting.status = 'EXPIRED';
  }
  const subId = 'SUB' + (1000 + appState.data.subscriptions.length + 1);
  appState.data.subscriptions.unshift({
    subscriptionId: subId,
    memberId: rawMember.id,
    packageId: pkg.id,
    startDate: todayStr,
    endDate: endDateStr,
    status: 'ACTIVE'
  });

  // 3. Payments Entity (ERD)
  if (!appState.data.payments) appState.data.payments = [];
  const payId = 'PAY' + (2000 + appState.data.payments.length + 1);
  const payMethod = (flow?.paymentMethod === 'CARD') ? 'CREDIT_CARD' : 'VNPAY_QR';
  const payMethodLabel = (flow?.paymentMethod === 'CARD') ? 'Thẻ Quốc Tế / ATM (3DSecure)' : 'Cổng VNPAY-QR';
  appState.data.payments.unshift({
    paymentId: payId,
    subscriptionId: subId,
    amount: pkg.price || 0,
    paymentMethod: payMethod,
    paymentDate: todayStr,
    status: 'PAID'
  });

  // 4. Invoices Entity
  if (!appState.data.invoices) appState.data.invoices = [];
  const invId = 'INV' + (1000 + appState.data.invoices.length + 1);
  const buyer = flow?.buyerInfo || { lastName: 'Phạm', firstName: 'Thu Trang', phone: '0912345678' };
  const invoiceRecord = {
    id: invId,
    memberId: rawMember.id,
    memberName: `${buyer.lastName} ${buyer.firstName}`.trim(),
    packageName: pkg.name,
    amount: pkg.price || 0,
    paymentMethod: payMethodLabel,
    date: `${todayStr} 13:00`,
    endDate: endDateFormatted,
    status: 'PAID'
  };
  appState.data.invoices.unshift(invoiceRecord);

  // 5. Notifications Entity (ERD)
  if (typeof addNotification === 'function') {
    addNotification(
      'Thanh Toán Gói Tập Thành Công',
      `Bạn đã thanh toán thành công ${(pkg.price || 0).toLocaleString()} VND cho gói ${pkg.name}. Hạn sử dụng đến ${endDateFormatted}.`,
      'ACCOUNT',
      rawMember.id
    );
  }

  // 6. AuditLog Entity (ERD)
  if (typeof recordAuditLog === 'function') {
    recordAuditLog(
      'ONLINE_CHECKOUT_SUCCESS',
      'Payments',
      `Hội viên ${rawMember.name} (${rawMember.id}) thanh toán thành công gói ${pkg.name} (${invId}) qua ${payMethodLabel}.`,
      rawMember.id
    );
  }

  // 7. Transition State to Result SUCCESS
  if (flow) {
    flow.step = 'RESULT';
    flow.resultStatus = 'SUCCESS';
    flow.invoiceData = invoiceRecord;
  }

  showToast('Thanh toán thành công', `Gói ${pkg.name} đã được kích hoạt thành công!`, 'success');
  renderApp();
}

function handleSimulatePaymentFailure(reason) {
  const flow = appState.checkoutFlow;
  if (!flow) return;
  const rawMember = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];

  flow.step = 'RESULT';
  flow.resultStatus = 'FAILED';
  flow.failureReason = reason || 'Giao dịch chưa hoàn tất do ngân hàng từ chối hoặc người dùng hủy thao tác.';

  if (typeof recordAuditLog === 'function') {
    recordAuditLog(
      'ONLINE_CHECKOUT_FAILED',
      'Payments',
      `Giao dịch thanh toán trực tuyến của ${rawMember.name} (${rawMember.id}) thất bại. Lý do: ${flow.failureReason}`,
      rawMember.id
    );
  }

  showToast('Thanh toán thất bại', flow.failureReason, 'error');
  renderApp();
}

function handleFinishCheckout() {
  if (appState.checkoutFlow) {
    appState.checkoutFlow.isOpen = false;
    appState.checkoutFlow.package = null;
  }
  appState.selectedPackageForCheckout = null;
  appState.currentTab = 'member-pass';
  renderApp();
}

function confirmMemberCheckout(pkgId) {
  openCheckoutModal(pkgId);
}

// User Profile Actions & Handlers

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderMemberCheckoutModal !== 'undefined') _targetGlobal.renderMemberCheckoutModal = renderMemberCheckoutModal;
  if (typeof renderShopeeCheckoutForm !== 'undefined') _targetGlobal.renderShopeeCheckoutForm = renderShopeeCheckoutForm;
  if (typeof renderShopeeCheckoutVnpayGateway !== 'undefined') _targetGlobal.renderShopeeCheckoutVnpayGateway = renderShopeeCheckoutVnpayGateway;
  if (typeof renderShopeeCheckoutCardGateway !== 'undefined') _targetGlobal.renderShopeeCheckoutCardGateway = renderShopeeCheckoutCardGateway;
  if (typeof renderShopeeCheckoutResultCard !== 'undefined') _targetGlobal.renderShopeeCheckoutResultCard = renderShopeeCheckoutResultCard;
  if (typeof openCheckoutModal !== 'undefined') _targetGlobal.openCheckoutModal = openCheckoutModal;
  if (typeof closeCheckoutModal !== 'undefined') _targetGlobal.closeCheckoutModal = closeCheckoutModal;
  if (typeof setCheckoutPaymentMethod !== 'undefined') _targetGlobal.setCheckoutPaymentMethod = setCheckoutPaymentMethod;
  if (typeof updateCheckoutBuyerInfo !== 'undefined') _targetGlobal.updateCheckoutBuyerInfo = updateCheckoutBuyerInfo;
  if (typeof updateCheckoutCardInfo !== 'undefined') _targetGlobal.updateCheckoutCardInfo = updateCheckoutCardInfo;
  if (typeof handleProceedToPayment !== 'undefined') _targetGlobal.handleProceedToPayment = handleProceedToPayment;
  if (typeof handleBackToCheckoutForm !== 'undefined') _targetGlobal.handleBackToCheckoutForm = handleBackToCheckoutForm;
  if (typeof handleSimulatePaymentSuccess !== 'undefined') _targetGlobal.handleSimulatePaymentSuccess = handleSimulatePaymentSuccess;
  if (typeof handleSimulatePaymentFailure !== 'undefined') _targetGlobal.handleSimulatePaymentFailure = handleSimulatePaymentFailure;
  if (typeof handleFinishCheckout !== 'undefined') _targetGlobal.handleFinishCheckout = handleFinishCheckout;
  if (typeof confirmMemberCheckout !== 'undefined') _targetGlobal.confirmMemberCheckout = confirmMemberCheckout;
}
