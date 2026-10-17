// =========================================================================
// MANAGER FEATURE: COACHES & TRAINERS MANAGEMENT (LIST VIEW & DETAIL MODAL)
// Directly integrated with Spring Boot CoachController:
// - GET    /api/v1/coaches
// - POST   /api/v1/coaches (CoachRequestDTO)
// - PUT    /api/v1/coaches/{id} (CoachRequestDTO)
// - DELETE /api/v1/coaches/{id} (Soft delete -> status INACTIVE)
// =========================================================================

import { coachApi, syncCoachesWithBackend, normalizeCoach } from '../../../api/coachApi.js';
import { userApi } from '../../../api/userApi.js';

export async function refreshManagerCoachesFromApi() {
  try {
    const coaches = await syncCoachesWithBackend(true);
    showToast('Đồng Bộ Huấn Luyện Viên', `Đã đồng bộ ${coaches.length} HLV từ máy chủ Backend!`, 'success');
    renderApp();
  } catch (err) {
    showToast('Lỗi Kết Nối', 'Không thể kết nối đến máy chủ: ' + err.message, 'error');
  }
}

export function setManagerCoachSearch(q) {
  appState.managerCoachSearch = q;
  renderApp();
}

export function setManagerCoachFilterSpecialty(sp) {
  appState.managerCoachFilterSpecialty = sp;
  renderApp();
}

export function openCreateCoachModal() {
  appState.managerActiveModal = 'CREATE_COACH';
  renderApp();
}

export function openCoachDetailModal(coachId) {
  const coaches = appState.backendCoaches?.length ? appState.backendCoaches : (appState.data?.coaches || []);
  const rawCoach = coaches.find(c => String(c.coachId || c.id || c.userId) === String(coachId));
  if (!rawCoach) {
    showToast('Lỗi', 'Không tìm thấy thông tin Huấn luyện viên!', 'error');
    return;
  }
  appState.managerSelectedCoachForDetail = normalizeCoach(rawCoach);
  appState.managerActiveModal = 'DETAIL_COACH';
  renderApp();
}

export function openEditCoachModal(coachId) {
  const coaches = appState.backendCoaches?.length ? appState.backendCoaches : (appState.data?.coaches || []);
  const rawCoach = coaches.find(c => String(c.coachId || c.id || c.userId) === String(coachId));
  if (!rawCoach) {
    showToast('Lỗi', 'Không tìm thấy thông tin HLV cần chỉnh sửa!', 'error');
    return;
  }
  appState.managerSelectedCoachForEdit = normalizeCoach(rawCoach);
  appState.managerActiveModal = 'EDIT_COACH';
  renderApp();
}

export function openDeleteCoachModal(coachId) {
  const coaches = appState.backendCoaches?.length ? appState.backendCoaches : (appState.data?.coaches || []);
  const rawCoach = coaches.find(c => String(c.coachId || c.id || c.userId) === String(coachId));
  if (!rawCoach) {
    showToast('Lỗi', 'Không tìm thấy thông tin HLV cần khóa!', 'error');
    return;
  }
  appState.managerSelectedCoachForDelete = normalizeCoach(rawCoach);
  appState.managerActiveModal = 'DELETE_COACH';
  renderApp();
}

export async function handleCreateCoachSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Lưu Huấn Luyện Viên';

  const firstName = (form.firstName?.value || '').trim();
  const lastName = (form.lastName?.value || '').trim();
  const gender = form.gender?.value || 'MALE';
  const phone = (form.phone?.value || '').trim();
  const email = (form.email?.value || '').trim();
  const password = form.password?.value || '';
  const specialty = (form.specialty?.value || '').trim();

  // Validate form inputs (theo đúng annotation CoachRequestDTO của BE)
  if (!firstName || !lastName) {
    showToast('Cảnh báo', 'Vui lòng nhập đầy đủ Họ và Tên của Huấn luyện viên!', 'warning');
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Cảnh báo', 'Vui lòng nhập định dạng email hợp lệ!', 'warning');
    return;
  }
  // Regex: 10 chữ số bắt đầu bằng 0 hoặc +84
  if (!phone || !/^(0|\+84)[0-9]{9}$/.test(phone)) {
    showToast('Số điện thoại không hợp lệ', 'Số điện thoại phải gồm đúng 10 chữ số (Ví dụ: 0912345678)!', 'warning');
    return;
  }
  if (!password || password.length < 6) {
    showToast('Cảnh báo', 'Mật khẩu khởi tạo phải từ 6 ký tự trở lên!', 'warning');
    return;
  }

  const payload = {
    firstName,
    lastName,
    gender,
    phone,
    email,
    password,
    specialty: specialty || 'Boxing & Fitness'
  };

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin mr-1.5">⏳</span> Đang tạo trên Backend...';
    }

    const created = await coachApi.create(payload);
    const normalized = normalizeCoach(created);

    // Cập nhật local state
    if (!appState.backendCoaches) appState.backendCoaches = [];
    appState.backendCoaches.unshift(normalized);
    if (appState.data && appState.data.coaches) {
      appState.data.coaches.unshift(normalized);
    }

    showToast('Tạo HLV Thành Công', `Đã thêm mới Huấn luyện viên ${normalized.name} vào hệ thống!`, 'success');
    closeManagerModal();
  } catch (err) {
    console.error('[handleCreateCoachSubmit] Error:', err);
    showToast('Lỗi Tạo HLV', err.message || 'Không thể tạo tài khoản HLV trên Backend!', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

export async function handleEditCoachSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const form = e.target;
  const coach = appState.managerSelectedCoachForEdit;
  if (!coach) return;

  const id = coach.coachId || coach.id;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Lưu Thay Đổi';

  const firstName = (form.firstName?.value || '').trim();
  const lastName = (form.lastName?.value || '').trim();
  const gender = form.gender?.value || coach.gender || 'MALE';
  const phone = (form.phone?.value || '').trim();
  const email = (form.email?.value || '').trim();
  const password = (form.password?.value || '').trim();
  const specialty = (form.specialty?.value || '').trim();

  if (!firstName || !lastName) {
    showToast('Cảnh báo', 'Vui lòng nhập đầy đủ Họ và Tên!', 'warning');
    return;
  }
  // Validate 10 chữ số chuẩn VN
  if (!phone || !/^(0|\+84)[0-9]{9}$/.test(phone)) {
    showToast('Số điện thoại không hợp lệ', 'Số điện thoại phải gồm đúng 10 chữ số (Ví dụ: 0987896541)!', 'warning');
    return;
  }

  const payload = {
    coachId: Number(id),
    firstName,
    lastName,
    gender,
    phone,
    email,
    password: password || undefined, // BE cho phép null/blank nếu không đổi mật khẩu
    specialty: specialty || coach.specialty || 'Boxing & Fitness'
  };

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin mr-1.5">⏳</span> Đang lưu trên máy chủ...';
    }

    const updated = await coachApi.update(id, payload);
    const normalized = normalizeCoach(updated);

    // Cập nhật list trong state
    if (appState.backendCoaches) {
      const idx = appState.backendCoaches.findIndex(c => String(c.coachId || c.id) === String(id));
      if (idx !== -1) appState.backendCoaches[idx] = { ...appState.backendCoaches[idx], ...normalized };
    }
    if (appState.data && appState.data.coaches) {
      const idx = appState.data.coaches.findIndex(c => String(c.coachId || c.id) === String(id));
      if (idx !== -1) appState.data.coaches[idx] = { ...appState.data.coaches[idx], ...normalized };
    }

    showToast('Cập Nhật Thành Công', `Đã cập nhật thông tin HLV ${normalized.name}!`, 'success');
    closeManagerModal();
  } catch (err) {
    console.error('[handleEditCoachSubmit] Error:', err);
    showToast('Lỗi Cập Nhật', err.message || 'Không thể cập nhật HLV trên máy chủ!', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

export async function confirmDeleteCoach() {
  const coach = appState.managerSelectedCoachForDelete;
  if (!coach) return;
  const id = coach.coachId || coach.id;
  const isCurrentlyActive = (coach.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

  try {
    if (isCurrentlyActive) {
      // Gọi API DELETE /api/v1/coaches/{id}
      await coachApi.delete(id);
      
      const newStatus = 'INACTIVE';
      if (appState.backendCoaches) {
        const target = appState.backendCoaches.find(c => String(c.coachId || c.id) === String(id));
        if (target) target.status = newStatus;
      }
      if (appState.data && appState.data.coaches) {
        const target = appState.data.coaches.find(c => String(c.coachId || c.id) === String(id));
        if (target) target.status = newStatus;
      }

      showToast('Đã Khóa HLV', `Đã chuyển trạng thái HLV ${coach.name} sang Ngừng hoạt động (INACTIVE)!`, 'success');
    } else {
      // Gọi API PATCH /api/v1/users/{id}/status để mở khóa lại
      if (typeof userApi !== 'undefined' && typeof userApi.toggleStatus === 'function') {
        await userApi.toggleStatus(id);
      }
      
      const newStatus = 'ACTIVE';
      if (appState.backendCoaches) {
        const target = appState.backendCoaches.find(c => String(c.coachId || c.id) === String(id));
        if (target) target.status = newStatus;
      }
      if (appState.data && appState.data.coaches) {
        const target = appState.data.coaches.find(c => String(c.coachId || c.id) === String(id));
        if (target) target.status = newStatus;
      }

      showToast('Đã Mở Khóa HLV', `Đã kích hoạt lại tài khoản HLV ${coach.name} thành công!`, 'success');
    }

    closeManagerModal();
  } catch (err) {
    console.error('[confirmDeleteCoach] Error:', err);
    showToast('Lỗi Thao Tác', err.message || 'Không thể cập nhật trạng thái HLV trên máy chủ!', 'error');
  }
}

export function renderManagerStaff() {
  // Tự động đồng bộ từ Backend khi mở tab lần đầu
  if (!appState.coachesLoadedFromApi && typeof syncCoachesWithBackend === 'function') {
    syncCoachesWithBackend().then(() => {
      if (appState.currentTab === 'manager-staff') {
        renderApp();
      }
    });
  }

  const query = (appState.managerCoachSearch || '').toLowerCase().trim();
  const filterSpecialty = appState.managerCoachFilterSpecialty || 'ALL';

  let rawList = [];
  if (appState.backendCoaches && appState.backendCoaches.length > 0) {
    rawList = appState.backendCoaches.map(c => normalizeCoach(c));
  } else if (appState.data && appState.data.coaches) {
    rawList = appState.data.coaches.map(c => normalizeCoach(c));
  }

  const isRealBackend = appState.backendCoaches && appState.backendCoaches.length > 0;

  const filtered = rawList.filter(co => {
    const matchQuery = !query ||
      (co.name || '').toLowerCase().includes(query) ||
      (co.email || '').toLowerCase().includes(query) ||
      (co.phone || '').includes(query) ||
      (co.specialty || '').toLowerCase().includes(query) ||
      String(co.coachId || co.id || '').includes(query);

    const matchSpecialty = filterSpecialty === 'ALL' || (co.specialty || '').toLowerCase().includes(filterSpecialty.toLowerCase());
    return matchQuery && matchSpecialty;
  });

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <!-- Header Toolbar -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-extrabold text-base text-slate-900 tracking-tight">Quản Lý Đội Ngũ Huấn Luyện Viên</h3>
          </div>
          <div class="text-xs text-slate-500 mt-1">
            Xem danh sách HLV theo bảng, bấm <strong>Chi Tiết</strong> để xem đầy đủ hồ sơ, cập nhật thông tin hoặc khóa tài khoản.
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
          <button 
            type="button" 
            onclick="refreshManagerCoachesFromApi()" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center space-x-1.5"
            title="Tải lại danh sách mới nhất từ server"
          >
            <span>🔄</span>
            <span>Đồng Bộ Lại</span>
          </button>
          <button 
            type="button" 
            onclick="openCreateCoachModal()" 
            class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs flex items-center space-x-1.5"
          >
            <span>➕</span>
            <span>Thêm HLV Mới</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <!-- Search Input -->
        <div class="sm:col-span-8 relative">
          <input 
            type="text" 
            placeholder="Tìm theo mã ID, tên HLV, email, số điện thoại, bộ môn chuyên trách..." 
            value="${appState.managerCoachSearch || ''}" 
            oninput="setManagerCoachSearch(this.value)" 
            class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50 transition"
          />
          <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          ${(appState.managerCoachSearch) ? `
            <button type="button" onclick="setManagerCoachSearch('')" class="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
          ` : ''}
        </div>

        <!-- Specialty Filter Dropdown -->
        <div class="sm:col-span-4">
          <select 
            onchange="setManagerCoachFilterSpecialty(this.value)" 
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL" ${filterSpecialty === 'ALL' ? 'selected' : ''}>Tất Cả Chuyên Môn</option>
            <option value="Boxing" ${filterSpecialty === 'Boxing' ? 'selected' : ''}>Boxing & Kickfit</option>
            <option value="Yoga" ${filterSpecialty === 'Yoga' ? 'selected' : ''}>Yoga & Phục Hồi</option>
            <option value="Gym" ${filterSpecialty === 'Gym' ? 'selected' : ''}>Gym & Thể Hình</option>
            <option value="Pilates" ${filterSpecialty === 'Pilates' ? 'selected' : ''}>Pilates Reformer</option>
            <option value="Zumba" ${filterSpecialty === 'Zumba' ? 'selected' : ''}>Zumba Dance</option>
            <option value="Fitness" ${filterSpecialty === 'Fitness' ? 'selected' : ''}>General Fitness</option>
          </select>
        </div>
      </div>

      <!-- Coaches List View (Table Format) -->
      ${filtered.length === 0 ? `
        <div class="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div class="text-4xl">🏋️‍♂️</div>
          <div class="font-bold text-sm text-slate-700">Không tìm thấy Huấn luyện viên nào phù hợp</div>
          <div class="text-xs text-slate-500">Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút "Thêm HLV Mới" để tạo mới tài khoản.</div>
          <button type="button" onclick="openCreateCoachModal()" class="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
            + Thêm Huấn Luyện Viên Ngay
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto border border-slate-200 rounded-2xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Mã HLV</th>
                <th class="py-3 px-4">Huấn Luyện Viên</th>
                <th class="py-3 px-4">Chuyên Môn</th>
                <th class="py-3 px-4">Số Điện Thoại</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4 text-center">Trạng Thái</th>
                <th class="py-3 px-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
              ${filtered.map(co => {
                const isActive = (co.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                return `
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <!-- ID -->
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #${co.coachId || co.id}
                    </td>

                    <!-- Coach Info -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center space-x-3">
                        <img 
                          src="${co.avatar}" 
                          alt="${co.name}"
                          class="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                        />
                        <div>
                          <div class="font-black text-slate-900">${co.name}</div>
                          <div class="text-[10px] text-slate-400">Giới tính: ${co.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Specialty -->
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-blue-50 text-blue-950 border border-blue-200">
                        ${co.specialty}
                      </span>
                    </td>

                    <!-- Phone -->
                    <td class="py-3.5 px-4 font-semibold text-slate-800">
                      ${co.phone || 'Chưa cập nhật'}
                    </td>

                    <!-- Email -->
                    <td class="py-3.5 px-4 text-slate-600">
                      ${co.email || 'Chưa cập nhật'}
                    </td>

                    <!-- Status Badge -->
                    <td class="py-3.5 px-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isActive ? 'bg-emerald-50 text-emerald-950 border border-emerald-300' : 'bg-rose-50 text-rose-950 border border-rose-300'
                      }">
                        ${isActive ? 'Hoạt Động' : 'Đã Khóa'}
                      </span>
                    </td>

                    <!-- Action: Detail Button -->
                    <td class="py-3.5 px-4 text-center">
                      <button 
                        type="button" 
                        onclick="openCoachDetailModal('${co.coachId || co.id}')" 
                        class="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 text-xs font-black transition mx-auto shadow-2xs hover:scale-105"
                        title="Xem chi tiết, chỉnh sửa hoặc khóa tài khoản"
                      >
                        Chi Tiết
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------------------
// MODAL 0: COACH DETAIL MODAL (Xem chi tiết + Nút Sửa + Nút Khóa)
// -------------------------------------------------------------------------
export function renderCoachDetailModal() {
  const coach = appState.managerSelectedCoachForDetail;
  if (!coach) return '';

  const isActive = (coach.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeManagerModal()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <!-- Modal Header with Avatar Banner -->
        <div class="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white">
          <button 
            type="button" 
            onclick="closeManagerModal()" 
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>

          <div class="flex items-center space-x-4">
            <img 
              src="${coach.avatar}" 
              alt="${coach.name}"
              class="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md flex-shrink-0"
            />
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-black text-lg text-white">${coach.name}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'}">
                  ${isActive ? 'Hoạt Động' : 'Đã Khóa'}
                </span>
              </div>
              <div class="text-xs text-indigo-200 mt-0.5 font-medium">Mã Huấn Luyện Viên: #${coach.coachId || coach.id}</div>
              <div class="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-white/10 border border-white/20 text-white">
                ${coach.specialty}
              </div>
            </div>
          </div>
        </div>

        <!-- Body Details -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hồ Sơ Cá Nhân & Chuyên Môn</div>
            
            <div class="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span class="text-slate-400 block mb-0.5">Họ & Tên:</span>
                <strong class="text-slate-900 text-sm">${coach.name}</strong>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Giới tính:</span>
                <strong class="text-slate-900">${coach.gender === 'FEMALE' ? 'Nữ (FEMALE)' : 'Nam (MALE)'}</strong>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Số điện thoại:</span>
                <strong class="text-slate-900 font-mono text-sm">${coach.phone || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Email liên hệ:</span>
                <strong class="text-slate-900 truncate block" title="${coach.email}">${coach.email || 'Chưa cập nhật'}</strong>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200/80">
              <span class="text-slate-400 block mb-0.5">Chuyên môn phụ trách:</span>
              <div class="font-bold text-indigo-600">${coach.specialty}</div>
            </div>

            <div>
              <span class="text-slate-400 block mb-0.5">Lớp đang phụ trách:</span>
              <div class="font-semibold text-slate-800">${coach.activeClassesCount || 0} lớp học trong hệ thống</div>
            </div>
          </div>
        </div>

        <!-- Modal Footer: Action Buttons -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button 
            type="button" 
            onclick="closeManagerModal()" 
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
          >
            Đóng
          </button>

          <div class="flex items-center space-x-2">
            <!-- Nút Sửa -->
            <button 
              type="button" 
              onclick="openEditCoachModal('${coach.coachId || coach.id}')" 
              class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
            >
              <span>✏️</span>
              <span>Sửa Thông Tin</span>
            </button>

            <!-- Nút Khóa / Xóa HLV -->
            <button 
              type="button" 
              onclick="openDeleteCoachModal('${coach.coachId || coach.id}')" 
              class="px-4 py-2.5 rounded-xl ${isActive ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'} text-xs font-bold transition shadow-2xs flex items-center space-x-1.5"
            >
              <span>${isActive ? '🗑️' : '🔓'}</span>
              <span>${isActive ? 'Khóa HLV' : 'Kích Hoạt Lại'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// MODAL 1: CREATE COACH MODAL (POST /api/v1/coaches)
// -------------------------------------------------------------------------
export function renderCreateCoachModal() {
  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeManagerModal()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              HLV
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Thêm Huấn Luyện Viên Mới</h3>
              <p class="text-[11px] text-slate-500">Tạo tài khoản và gán chuyên môn giảng dạy trên máy chủ</p>
            </div>
          </div>
          <button type="button" onclick="closeManagerModal()" class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form onsubmit="handleCreateCoachSubmit(event)" class="p-6 space-y-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Họ & Tên Đệm <span class="text-rose-500">*</span></label>
              <input type="text" name="lastName" required placeholder="Trần Hoàng" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tên <span class="text-rose-500">*</span></label>
              <input type="text" name="firstName" required placeholder="Nam" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giới tính <span class="text-rose-500">*</span></label>
              <select name="gender" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="MALE">Nam (MALE)</option>
                <option value="FEMALE">Nữ (FEMALE)</option>
                <option value="OTHER">Khác (OTHER)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Số điện thoại <span class="text-rose-500">*</span></label>
              <input type="tel" name="phone" required placeholder="0912345678" pattern="^(0|\\+84)[0-9]{9}$" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
              <p class="text-[10px] text-slate-400 mt-0.5">Yêu cầu: Số điện thoại gồm 10 số (Bắt đầu bằng 0 hoặc +84)</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Đăng Nhập <span class="text-rose-500">*</span></label>
            <input type="email" name="email" required placeholder="coach.nam@sportscenter.vn" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mật khẩu khởi tạo <span class="text-rose-500">*</span></label>
            <input type="password" name="password" required minlength="6" placeholder="Tối thiểu 6 ký tự" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            <p class="text-[10px] text-slate-400 mt-1">Mật khẩu dùng để HLV đăng nhập vào Coach Hub portal.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Chuyên Môn Phụ Trách</label>
            <input type="text" name="specialty" placeholder="Boxing & Kickfit, Gym Sức Mạnh, Yoga Flow..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeManagerModal()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
              Hủy
            </button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5">
              <span>Lưu Huấn Luyện Viên</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// MODAL 2: EDIT COACH MODAL (PUT /api/v1/coaches/{id})
// -------------------------------------------------------------------------
export function renderEditCoachModal() {
  const coach = appState.managerSelectedCoachForEdit;
  if (!coach) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeManagerModal()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ✏️
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Chỉnh Sửa Huấn Luyện Viên</h3>
              <p class="text-[11px] text-slate-500">Mã HLV: #${coach.coachId || coach.id} &bull; ${coach.name}</p>
            </div>
          </div>
          <button type="button" onclick="closeManagerModal()" class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form onsubmit="handleEditCoachSubmit(event)" class="p-6 space-y-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Họ & Tên Đệm <span class="text-rose-500">*</span></label>
              <input type="text" name="lastName" required value="${coach.lastName || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tên <span class="text-rose-500">*</span></label>
              <input type="text" name="firstName" required value="${coach.firstName || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giới tính <span class="text-rose-500">*</span></label>
              <select name="gender" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="MALE" ${coach.gender === 'MALE' ? 'selected' : ''}>Nam (MALE)</option>
                <option value="FEMALE" ${coach.gender === 'FEMALE' ? 'selected' : ''}>Nữ (FEMALE)</option>
                <option value="OTHER" ${coach.gender === 'OTHER' ? 'selected' : ''}>Khác (OTHER)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Số điện thoại <span class="text-rose-500">*</span></label>
              <input type="tel" name="phone" required value="${coach.phone || ''}" pattern="^(0|\\+84)[0-9]{9}$" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
              <p class="text-[10px] text-slate-400 mt-0.5">Yêu cầu: Số điện thoại gồm 10 số (Bắt đầu bằng 0 hoặc +84)</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email <span class="text-rose-500">*</span></label>
            <input type="email" name="email" required value="${coach.email || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
            <input type="password" name="password" minlength="6" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Chuyên Môn Phụ Trách</label>
            <input type="text" name="specialty" value="${coach.specialty || ''}" placeholder="Boxing & Kickfit, Gym Sức Mạnh, Yoga Flow..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeManagerModal()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
              Hủy
            </button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5">
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// MODAL 3: DELETE COACH CONFIRMATION MODAL (DELETE /api/v1/coaches/{id})
// -------------------------------------------------------------------------
export function renderDeleteCoachModal() {
  const coach = appState.managerSelectedCoachForDelete;
  if (!coach) return '';
  const isActive = (coach.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeManagerModal()">
      <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
        <div class="w-12 h-12 rounded-2xl ${isActive ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center text-xl mx-auto font-black">
          ${isActive ? '⚠️' : '🔓'}
        </div>
        
        <div class="text-center space-y-1.5">
          <h3 class="font-black text-base text-slate-900">${isActive ? 'Xác Nhận Khóa Huấn Luyện Viên' : 'Xác Nhận Mở Khóa Huấn Luyện Viên'}</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            ${isActive ? `
              Bạn có chắc chắn muốn ngưng hợp tác với <strong class="text-slate-800">${coach.name}</strong> (ID: #${coach.coachId || coach.id})?
              <br />
              Trạng thái tài khoản sẽ chuyển thành <span class="font-bold text-rose-600">INACTIVE</span>. Dữ liệu lịch sử lớp dạy vẫn được bảo lưu trên hệ thống.
            ` : `
              Bạn có muốn kích hoạt lại tài khoản cho <strong class="text-slate-800">${coach.name}</strong> (ID: #${coach.coachId || coach.id})?
              <br />
              Trạng thái tài khoản sẽ chuyển lại thành <span class="font-bold text-emerald-600">ACTIVE</span>.
            `}
          </p>
        </div>

        <div class="pt-2 flex items-center gap-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            Hủy Bỏ
          </button>
          <button type="button" onclick="confirmDeleteCoach()" class="flex-1 py-2.5 rounded-xl ${isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-xs font-bold transition shadow-xs">
            ${isActive ? 'Xác Nhận Khóa' : 'Xác Nhận Mở Khóa'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Global attachment for inline HTML onclick handlers
const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerStaff = renderManagerStaff;
  _g.refreshManagerCoachesFromApi = refreshManagerCoachesFromApi;
  _g.setManagerCoachSearch = setManagerCoachSearch;
  _g.setManagerCoachFilterSpecialty = setManagerCoachFilterSpecialty;
  _g.openCreateCoachModal = openCreateCoachModal;
  _g.openCoachDetailModal = openCoachDetailModal;
  _g.openEditCoachModal = openEditCoachModal;
  _g.openDeleteCoachModal = openDeleteCoachModal;
  _g.renderCoachDetailModal = renderCoachDetailModal;
  _g.renderCreateCoachModal = renderCreateCoachModal;
  _g.renderEditCoachModal = renderEditCoachModal;
  _g.renderDeleteCoachModal = renderDeleteCoachModal;
  _g.handleCreateCoachSubmit = handleCreateCoachSubmit;
  _g.handleEditCoachSubmit = handleEditCoachSubmit;
  _g.confirmDeleteCoach = confirmDeleteCoach;
}
