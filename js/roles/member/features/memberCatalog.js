// =========================================================================
// MEMBER FEATURE: PACKAGE CATALOG
// =========================================================================

function renderMemberPackageCatalog() {
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  // Member CHỈ nhìn thấy các gói đang ACTIVE
  const packages = rawPackages
    .map(pkg => (typeof normalizePackage === 'function' ? normalizePackage(pkg) : pkg))
    .filter(pkg => pkg && (pkg.status || 'ACTIVE').toUpperCase() === 'ACTIVE');

  return `
    <div class="space-y-8 animate-fade-in pb-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          Bảng Giá Minh Bạch
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Chọn Gói Thẻ Hội Viên Phù Hợp</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-2">
          Đăng ký hoặc gia hạn trực tuyến tức thì. Hệ thống hỗ trợ thanh toán chuyển khoản và bảo mật tự động.
        </p>
      </div>

      ${packages.length === 0 ? `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div class="text-4xl mb-3">&#x1f4e6;</div>
          <h3 class="font-extrabold text-slate-900 text-base">Hiện Chưa Có Gói Tập Đang Mở Bán</h3>
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Các gói tập hiện tại đang được trung tâm cập nhật. Vui lòng quay lại sau hoặc liên hệ quầy lễ tân để được hỗ trợ!
          </p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${packages.map(pkg => `
            <div class="bg-white rounded-2xl border ${pkg.popular ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-xs'} p-6 flex flex-col justify-between relative hover:shadow-lg transition">
              ${pkg.popular ? `
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                  Gói Phổ Biến Nhất
                </div>
              ` : ''}

              <div>
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${pkg.durationDays || 30} Ngày Sử Dụng</div>
                <h3 class="text-lg font-black text-slate-900 mt-1">${pkg.name}</h3>
                <p class="text-xs text-slate-500 mt-2 min-h-[36px] line-clamp-3">${pkg.description || 'Truy cập đầy đủ dịch vụ trung tâm thể thao.'}</p>

                <div class="mt-4 pt-4 border-t border-slate-100">
                  <div class="text-2xl font-black text-slate-900">${(Number(pkg.price || 0)).toLocaleString()} <span class="text-xs font-normal text-slate-500">VND</span></div>
                </div>

                <div class="mt-5 space-y-2 text-xs text-slate-600">
                  <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Quyền lợi gói:</div>
                  ${(pkg.features || [
                    'Tập luyện tự do toàn bộ máy Gym & Cardio',
                    'Tủ đồ thông minh & phòng tắm nóng lạnh',
                    'Nước uống lọc tinh khiết miễn phí'
                  ]).map(f => `
                    <div class="flex items-start space-x-2">
                      <span class="text-indigo-600 font-bold">&check;</span>
                      <span>${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="mt-8 pt-4 border-t border-slate-100">
                <button type="button" onclick="openCheckoutModal('${pkg.packageId || pkg.id}')" class="w-full py-2.5 ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} rounded-xl font-bold text-xs transition shadow-xs">
                  Đăng Ký Gói Này
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

export { renderMemberPackageCatalog };
