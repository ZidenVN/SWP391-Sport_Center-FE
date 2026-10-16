// =========================================================================
// MANAGER FEATURE: MEMBERSHIP PACKAGES (CRUD, MODALS, BE SYNC)
// =========================================================================

export function setManagerPackageFilter(filter) {
  appState.managerPackageFilter = filter;
  renderApp();
}

export function setManagerPackageSearch(query) {
  appState.managerPackageSearch = query;
  renderApp();
}

export async function refreshManagerPackagesFromApi() {
  try {
    if (typeof syncPackagesWithBackend === 'function') {
      const pkgs = await syncPackagesWithBackend(true);
      showToast('Đồng Bộ Dữ Liệu', `Đã đồng bộ ${pkgs.length} gói tập từ Backend!`, 'success');
      renderApp();
    }
  } catch (err) {
    showToast('Lỗi Kết Nối', 'Không thể kết nối đến máy chủ: ' + err.message, 'error');
  }
}

export function renderManagerPackages() {
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const packages = rawPackages.map(p => (typeof normalizePackage === 'function' ? normalizePackage(p) : p));

  const filter = appState.managerPackageFilter || 'ALL';
  const search = (appState.managerPackageSearch || '').toLowerCase().trim();

  const totalCount = packages.length;
  const activeCount = packages.filter(p => p.status === 'ACTIVE').length;
  const draftCount = packages.filter(p => p.status === 'INACTIVE').length;

  const filtered = packages.filter(p => {
    const matchFilter = filter === 'ALL' || p.status === filter;
    const matchSearch = !search || 
      (p.name || '').toLowerCase().includes(search) || 
      (p.type || '').toLowerCase().includes(search) ||
      (p.description || '').toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center space-x-3">
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Danh Mục Gói Tập & Dịch Vụ</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1">Quản lý các gói thẻ tập, đơn giá niêm yết, thời hạn sử dụng và quyền lợi đi kèm.</p>
        </div>

        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <button type="button" onclick="refreshManagerPackagesFromApi()" class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5" title="Đồng bộ danh sách từ máy chủ">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Đồng Bộ</span>
          </button>
          <button type="button" onclick="openManagerModal('CREATE_PACKAGE')" class="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Tạo Gói Tập Mới</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button type="button" onclick="setManagerPackageFilter('ALL')" class="px-3 py-1.5 rounded-lg text-xs font-black transition ${filter === 'ALL' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            Tất Cả (${totalCount})
          </button>
          <button type="button" onclick="setManagerPackageFilter('ACTIVE')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            Đang Bán (${activeCount})
          </button>
          <button type="button" onclick="setManagerPackageFilter('INACTIVE')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === 'INACTIVE' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            Tạm Ẩn (${draftCount})
          </button>
        </div>

        <div class="w-full sm:w-72">
          <input type="text" value="${appState.managerPackageSearch || ''}" oninput="setManagerPackageSearch(this.value)" placeholder="Tìm kiếm gói theo tên, phân loại..." class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${filtered.length === 0 ? `
          <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            Không tìm thấy gói tập nào phù hợp với bộ lọc hiện tại.
          </div>
        ` : filtered.map(pkg => {
          const isActive = (pkg.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
          const typeBadge = pkg.type === 'VIP' ? 'bg-amber-100 text-amber-800' :
                            pkg.type === 'GYM' ? 'bg-blue-100 text-blue-800' :
                            pkg.type === 'YOGA' ? 'bg-emerald-100 text-emerald-800' :
                            pkg.type === 'BOXING' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800';

          return `
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <div class="flex justify-between items-start">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${typeBadge}">
                    ${pkg.type || 'GÓI TIÊU CHUẨN'}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                    ${isActive ? 'ĐANG KINH DOANH' : 'TẠM DỪNG'}
                  </span>
                </div>

                <div class="mt-3">
                  <h3 class="text-base font-extrabold text-slate-900 leading-tight">${pkg.name}</h3>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">${pkg.description || 'Gói dịch vụ thể thao & chăm sóc sức khỏe toàn diện.'}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span class="text-xs text-slate-400">Giá niêm yết:</span>
                    <div class="text-lg font-black text-indigo-600">${(Number(pkg.price) || 0).toLocaleString()} <span class="text-xs font-semibold text-slate-500">đ</span></div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-slate-400">Thời hạn:</span>
                    <div class="text-xs font-bold text-slate-700">${pkg.durationDays || 30} ngày</div>
                  </div>
                </div>

                <div class="mt-3 space-y-1.5 text-[11px] text-slate-600">
                  ${(pkg.features || [
                    'Tập luyện tự do toàn bộ hệ thống phòng tập',
                    'Tủ đồ cá nhân thông minh & phòng tắm nóng lạnh'
                  ]).slice(0, 3).map(f => `
                    <div class="flex items-center space-x-2">
                      <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                      <span class="truncate">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button type="button" onclick="openEditPackageModal('${pkg.id}')" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  <span>Chỉnh Sửa</span>
                </button>
                <button type="button" onclick="openDeletePackageModal('${pkg.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Xóa gói tập">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function openEditPackageModal(packageId) {
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const pkg = rawPackages.find(p => String(p.packageId || p.id) === String(packageId));
  if (!pkg) {
    showToast('Lỗi', 'Không tìm thấy gói tập!', 'error');
    return;
  }
  appState.managerSelectedPackageForEdit = (typeof normalizePackage === 'function' ? normalizePackage(pkg) : pkg);
  appState.managerActiveModal = 'EDIT_PACKAGE';
  renderApp();
}

export function openDeletePackageModal(packageId) {
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const pkg = rawPackages.find(p => String(p.packageId || p.id) === String(packageId));
  if (!pkg) {
    showToast('Lỗi', 'Không tìm thấy gói tập!', 'error');
    return;
  }
  appState.managerSelectedPackageForDelete = (typeof normalizePackage === 'function' ? normalizePackage(pkg) : pkg);
  appState.managerActiveModal = 'DELETE_PACKAGE';
  renderApp();
}

export function renderCreatePackageModal() {
  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Thêm Gói Tập Mới</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tạo gói tập mới cho hội viên đăng ký</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreatePackageSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Gói Tập</label>
            <input type="text" id="new-pkg-name" required placeholder="Ví dụ: Gói Gym Siêu Cấp 3 Tháng" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phân Loại Gói</label>
            <select id="new-pkg-type" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              <option value="GYM">GYM - Tập Gym & Tạ</option>
              <option value="VIP">VIP - Toàn Quyền Trung Tâm</option>
              <option value="YOGA">YOGA - Lớp Yoga & Dẻo Dai</option>
              <option value="BOXING">BOXING - Lớp Boxing & Đối Kháng</option>
              <option value="PT">PT - Huấn Luyện Viên 1-1</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Hạn (Ngày)</label>
              <input type="number" id="new-pkg-days" required value="30" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Đơn Giá (VNĐ)</label>
              <input type="number" id="new-pkg-price" required value="550000" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Ban Đầu</label>
            <select id="new-pkg-status" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              <option value="ACTIVE" selected>ACTIVE - Mở Bán Ngay Cho Hội Viên</option>
              <option value="INACTIVE">INACTIVE - Lưu Nháp (Tạm Ẩn)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Quyền Lợi</label>
            <textarea id="new-pkg-desc" rows="2" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" placeholder="Mô tả quyền lợi gói tập..."></textarea>
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Tạo Gói Tập</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderEditPackageModal() {
  const p = appState.managerSelectedPackageForEdit;
  if (!p) return '';

  const isActive = (p.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Chỉnh Sửa Gói Tập</h3>
            <p class="text-xs text-slate-500 mt-0.5">${p.name}</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleEditPackageSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Gói Tập</label>
            <input type="text" id="edit-pkg-name" required value="${p.name || ''}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Hạn (Ngày)</label>
              <input type="number" id="edit-pkg-days" required value="${p.durationDays || 30}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Đơn Giá (VNĐ)</label>
              <input type="number" id="edit-pkg-price" required value="${p.price || 0}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Kinh Doanh</label>
            <select id="edit-pkg-status" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              <option value="ACTIVE" ${isActive ? 'selected' : ''}>ACTIVE - Đang Bán Cho Hội Viên</option>
              <option value="INACTIVE" ${!isActive ? 'selected' : ''}>INACTIVE - Tạm Dừng Bán</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Quyền Lợi</label>
            <textarea id="edit-pkg-desc" rows="2" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">${p.description || ''}</textarea>
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderDeletePackageModal() {
  const p = appState.managerSelectedPackageForDelete;
  if (!p) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex items-center space-x-3 text-rose-600 mb-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center font-black text-lg">!</div>
          <h3 class="font-black text-base text-slate-900">Xác Nhận Xóa Gói Tập</h3>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          Bạn có chắc chắn muốn xóa gói tập <strong class="text-slate-900">"${p.name}"</strong>? 
          Hệ thống sẽ chuyển trạng thái sang <span class="font-bold text-rose-600">INACTIVE</span> để bảo toàn lịch sử các hội viên đã từng mua.
        </p>

        <div class="mt-6 flex space-x-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy Bỏ</button>
          <button type="button" onclick="confirmDeletePackage('${p.id}')" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs">Xác Nhận Xóa</button>
        </div>
      </div>
    </div>
  `;
}

export async function handleCreatePackageSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = (document.getElementById('new-pkg-name')?.value || '').trim();
  const type = document.getElementById('new-pkg-type')?.value || 'GYM';
  const durationDays = parseInt(document.getElementById('new-pkg-days')?.value, 10) || 30;
  const price = parseFloat(document.getElementById('new-pkg-price')?.value) || 0;
  const status = document.getElementById('new-pkg-status')?.value || 'ACTIVE';
  const desc = (document.getElementById('new-pkg-desc')?.value || '').trim();

  if (!name || price <= 0 || durationDays <= 0) {
    showToast('Thiếu Thông Tin', 'Vui lòng nhập tên gói hợp lệ, thời hạn và đơn giá lớn hơn 0!', 'warning');
    return false;
  }

  const payload = {
    packageName: name,
    price: price,
    durationDays: durationDays,
    description: desc,
    status: status
  };

  try {
    let createdPkg = null;
    if (typeof packageApi !== 'undefined' && typeof packageApi.create === 'function') {
      createdPkg = await packageApi.create(payload);
    }

    if (!appState.data) appState.data = {};
    if (!appState.data.packages) appState.data.packages = [];

    const normalized = (typeof normalizePackage === 'function') ? 
      normalizePackage(createdPkg || { id: 'PKG' + (appState.data.packages.length + 1), ...payload, name, type }) :
      { id: createdPkg?.packageId || ('PKG' + (appState.data.packages.length + 1)), ...payload, name, type };

    appState.data.packages.unshift(normalized);

    recordAuditLog('CREATE_PACKAGE', 'MembershipPackages', `Tạo gói tập "${name}" - ${price.toLocaleString()}đ / ${durationDays} ngày`, 'manager@sportscenter.vn');
    addNotification('Gói Tập Mới Ra Mắt', `Gói tập "${name}" đã được niêm yết với giá ${price.toLocaleString()}đ.`, 'PACKAGE', normalized.id);

    closeManagerModal();
    showToast('Tạo Gói Tập Thành Công', `Đã thêm gói "${name}" vào danh mục dịch vụ!`, 'success');
    renderApp();
  } catch (err) {
    showToast('Lỗi Tạo Gói', 'Không thể tạo gói tập: ' + (err.message || err), 'error');
  }

  return false;
}

export async function handleEditPackageSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const p = appState.managerSelectedPackageForEdit;
  if (!p) return false;

  const pkgId = p.packageId || p.id;
  const name = (document.getElementById('edit-pkg-name')?.value || '').trim();
  const durationDays = parseInt(document.getElementById('edit-pkg-days')?.value, 10) || 30;
  const price = parseFloat(document.getElementById('edit-pkg-price')?.value) || 0;
  const status = document.getElementById('edit-pkg-status')?.value || 'ACTIVE';
  const desc = (document.getElementById('edit-pkg-desc')?.value || '').trim();

  if (!name || price <= 0 || durationDays <= 0) {
    showToast('Thiếu Thông Tin', 'Vui lòng nhập tên gói hợp lệ, thời hạn và đơn giá lớn hơn 0!', 'warning');
    return false;
  }

  const payload = {
    packageName: name,
    price: price,
    durationDays: durationDays,
    description: desc,
    status: status
  };

  try {
    let updatedRes = null;
    if (typeof packageApi !== 'undefined' && typeof packageApi.update === 'function') {
      updatedRes = await packageApi.update(pkgId, payload);
    }

    const target = appState.data.packages.find(item => String(item.packageId || item.id) === String(pkgId));
    if (target) {
      target.name = name;
      target.packageName = name;
      target.price = price;
      target.durationDays = durationDays;
      target.status = status;
      target.description = desc;
    }

    recordAuditLog('UPDATE_PACKAGE', 'MembershipPackages', `Cập nhật gói "${name}" (ID: ${pkgId})`, 'manager@sportscenter.vn');

    closeManagerModal();
    showToast('Cập Nhật Thành Công', `Đã cập nhật thông tin gói "${name}"!`, 'success');
    renderApp();
  } catch (err) {
    showToast('Lỗi Cập Nhật', 'Không thể cập nhật gói tập: ' + (err.message || err), 'error');
  }

  return false;
}

export async function confirmDeletePackage(pkgId) {
  try {
    if (typeof packageApi !== 'undefined' && typeof packageApi.delete === 'function') {
      await packageApi.delete(pkgId);
    }

    const target = appState.data.packages.find(item => String(item.packageId || item.id) === String(pkgId));
    if (target) {
      target.status = 'INACTIVE';
    }

    recordAuditLog('DELETE_PACKAGE', 'MembershipPackages', `Xóa mềm / tạm ngừng gói ID: ${pkgId}`, 'manager@sportscenter.vn');

    closeManagerModal();
    showToast('Đã Xóa Gói Tập', 'Gói tập đã được chuyển sang trạng thái Tạm Ngừng (INACTIVE)!', 'info');
    renderApp();
  } catch (err) {
    showToast('Lỗi Xóa Gói', 'Không thể xóa gói tập: ' + (err.message || err), 'error');
  }
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.setManagerPackageFilter = setManagerPackageFilter;
  _g.setManagerPackageSearch = setManagerPackageSearch;
  _g.refreshManagerPackagesFromApi = refreshManagerPackagesFromApi;
  _g.renderManagerPackages = renderManagerPackages;
  _g.openEditPackageModal = openEditPackageModal;
  _g.openDeletePackageModal = openDeletePackageModal;
  _g.renderCreatePackageModal = renderCreatePackageModal;
  _g.renderEditPackageModal = renderEditPackageModal;
  _g.renderDeletePackageModal = renderDeletePackageModal;
  _g.handleCreatePackageSubmit = handleCreatePackageSubmit;
  _g.handleEditPackageSubmit = handleEditPackageSubmit;
  _g.confirmDeletePackage = confirmDeletePackage;
}
