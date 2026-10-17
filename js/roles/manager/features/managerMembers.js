// =========================================================================
// MANAGER FEATURE: USER & MEMBER MANAGEMENT (CRUD, ROLES, STATUS)
// =========================================================================

export async function refreshManagerUsersFromApi() {
  try {
    if (typeof syncUsersWithBackend === 'function') {
      const users = await syncUsersWithBackend(true);
      showToast('Đồng Bộ Người Dùng', `Đã đồng bộ ${users.length} tài khoản từ máy chủ!`, 'success');
      renderApp();
    }
  } catch (err) {
    showToast('Lỗi Kết Nối', 'Không thể kết nối đến máy chủ: ' + err.message, 'error');
  }
}

export function setManagerMemberFilterRole(role) {
  appState.managerMemberFilterRole = role;
  renderApp();
}

export function setManagerMemberFilterStatus(status) {
  appState.managerMemberFilterStatus = status;
  renderApp();
}

export function setManagerMemberSearch(q) {
  appState.managerMemberSearch = q;
  renderApp();
}

export function renderManagerMembers() {
  if (!appState.usersLoadedFromApi && typeof syncUsersWithBackend === 'function') {
    syncUsersWithBackend().then(() => {
      if (appState.currentTab === 'manager-members') {
        renderApp();
      }
    });
  }

  const query = (appState.managerMemberSearch || '').toLowerCase().trim();
  const filterRole = appState.managerMemberFilterRole || 'ALL';
  const filterStatus = appState.managerMemberFilterStatus || 'ALL';

  let usersList = [];
  if (appState.backendUsers && appState.backendUsers.length > 0) {
    usersList = appState.backendUsers;
  } else if (appState.data && appState.data.members) {
    usersList = appState.data.members.map(m => {
      const resolved = resolveMember(m);
      return {
        id: resolved.id,
        userId: resolved.id,
        name: resolved.name,
        firstName: resolved.firstName || resolved.name,
        lastName: resolved.lastName || '',
        email: resolved.email,
        phone: resolved.phone,
        gender: resolved.gender || 'Nam',
        roleName: 'MEMBER',
        roleId: 4,
        status: resolved.status,
        avatar: resolved.avatar,
        activePackage: resolved.activePackage,
        startDate: resolved.startDate,
        endDate: resolved.endDate
      };
    });
  }

  const filtered = usersList.filter(u => {
    const matchQuery = !query || 
      (u.name || '').toLowerCase().includes(query) || 
      (u.phone || '').includes(query) || 
      (u.email || '').toLowerCase().includes(query) ||
      String(u.id || u.userId || '').toLowerCase().includes(query);

    const matchRole = filterRole === 'ALL' || (u.roleName || 'MEMBER').toUpperCase() === filterRole.toUpperCase();
    const matchStatus = filterStatus === 'ALL' || (u.status || 'ACTIVE').toUpperCase() === filterStatus.toUpperCase();

    return matchQuery && matchRole && matchStatus;
  });

  const isRealBackend = appState.backendUsers && appState.backendUsers.length > 0;

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <!-- Header & Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Quản Lý Danh Sách Người Dùng & Hội Viên</h3>
          </div>
          <div class="text-xs text-slate-400 mt-0.5">Xem danh sách, cập nhật thông tin, cấp quyền và khóa/mở tài khoản</div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button type="button" onclick="refreshManagerUsersFromApi()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5" title="Tải lại danh sách từ máy chủ">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span class="hidden sm:inline">Làm mới</span>
          </button>
          <div class="w-full sm:w-72">
            <input type="text" placeholder="Tìm tên, SĐT, email..." value="${appState.managerMemberSearch || ''}" oninput="setManagerMemberSearch(this.value)" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>
        </div>
      </div>

      <!-- Quick Role & Status Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div class="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span class="text-[11px] font-bold text-slate-400 uppercase mr-1">Vai Trò:</span>
          ${['ALL', 'MEMBER', 'COACH', 'RECEPTIONIST', 'CENTER_MANAGER'].map(role => `
            <button type="button" onclick="setManagerMemberFilterRole('${role}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${filterRole === role ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              ${role === 'ALL' ? 'Tất Cả' : role === 'CENTER_MANAGER' ? 'Quản Lý' : role === 'COACH' ? 'HLV' : role === 'RECEPTIONIST' ? 'Lễ Tân' : 'Hội Viên'}
            </button>
          `).join('')}
        </div>

        <div class="flex items-center space-x-1.5">
          <span class="text-[11px] font-bold text-slate-400 uppercase mr-1">Trạng Thái:</span>
          ${['ALL', 'ACTIVE', 'INACTIVE'].map(st => `
            <button type="button" onclick="setManagerMemberFilterStatus('${st}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${filterStatus === st ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              ${st === 'ALL' ? 'Tất Cả' : st === 'ACTIVE' ? 'Hoạt Động' : 'Đã Khóa'}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Tài Khoản / Họ Tên</th>
              <th class="py-3 px-4">Số Điện Thoại</th>
              <th class="py-3 px-4">Giới Tính</th>
              <th class="py-3 px-4">Vai Trò (Role)</th>
              <th class="py-3 px-4">Trạng Thái</th>
              <th class="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="6" class="py-8 text-center text-slate-400">Không tìm thấy tài khoản nào phù hợp.</td>
              </tr>
            ` : filtered.map(u => {
              const isActive = (u.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
              const roleDisplay = u.roleName === 'CENTER_MANAGER' || u.roleName === 'ADMIN' ? 'Quản Lý' :
                                  u.roleName === 'COACH' ? 'Huấn Luyện Viên' :
                                  u.roleName === 'RECEPTIONIST' ? 'Lễ Tân' : 'Hội Viên';
              const roleBadgeColor = u.roleName === 'CENTER_MANAGER' || u.roleName === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                     u.roleName === 'COACH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                     u.roleName === 'RECEPTIONIST' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                     'bg-slate-100 text-slate-700 border-slate-200';
              const avatarUrl = u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff&bold=true`;
              const userIdVal = u.userId || u.id;

              return `
                <tr class="hover:bg-slate-50/70 transition">
                  <td class="py-3 px-4 flex items-center space-x-3">
                    <img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div class="font-bold text-slate-900">${u.name}</div>
                      <div class="text-[11px] text-slate-400">${u.email}</div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-slate-700 font-medium">${u.phone || 'Chưa cập nhật'}</td>
                  <td class="py-3 px-4 text-slate-600 font-medium">${u.gender || 'Nam'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold border ${roleBadgeColor}">
                      ${roleDisplay}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button type="button" onclick="handleToggleUserStatus('${userIdVal}')" title="Nhấp để Khóa / Mở khóa tài khoản" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'}">
                      <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                      <span>${isActive ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</span>
                    </button>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button type="button" onclick="openEditUserModal('${userIdVal}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-lg text-xs font-black border border-blue-200 transition shadow-2xs" title="Chỉnh sửa thông tin">
                      Chỉnh Sửa
                    </button>
                    <button type="button" onclick="openAssignRoleModal('${userIdVal}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition" title="Đổi quyền hạn người dùng">
                      Đổi Quyền
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function openEditUserModal(userId) {
  const user = (appState.backendUsers || []).find(u => String(u.userId || u.id) === String(userId)) ||
               (appState.data?.members || []).find(m => String(m.id) === String(userId));
  if (!user) {
    showToast('Không Tìm Thấy', 'Không tìm thấy thông tin tài khoản!', 'error');
    return;
  }
  appState.managerSelectedUserForEdit = user;
  appState.managerActiveModal = 'EDIT_USER';
  renderApp();
}

export function renderEditUserModal() {
  const u = appState.managerSelectedUserForEdit;
  if (!u) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Chỉnh Sửa Thông Tin Tài Khoản</h3>
            <p class="text-xs text-slate-500 mt-0.5">${u.name} &bull; ${u.email}</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleEditUserSubmit(event)" class="space-y-3.5 mt-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Họ & Đệm</label>
              <input type="text" id="edit-user-lastname" required value="${u.lastName || ''}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên</label>
              <input type="text" id="edit-user-firstname" required value="${u.firstName || ''}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
            <input type="email" id="edit-user-email" required value="${u.email || ''}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
              <input type="tel" id="edit-user-phone" required value="${u.phone || ''}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Giới Tính</label>
              <select id="edit-user-gender" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
                <option value="Nam" ${(u.gender === 'Nam' || !u.gender) ? 'selected' : ''}>Nam</option>
                <option value="Nữ" ${u.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                <option value="Khác" ${u.gender === 'Khác' ? 'selected' : ''}>Khác</option>
              </select>
            </div>
          </div>

          <div class="pt-3 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function handleEditUserSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const u = appState.managerSelectedUserForEdit;
  if (!u) return false;

  const userId = u.userId || u.id;
  const firstName = (document.getElementById('edit-user-firstname')?.value || '').trim();
  const lastName = (document.getElementById('edit-user-lastname')?.value || '').trim();
  const email = (document.getElementById('edit-user-email')?.value || '').trim();
  const phone = (document.getElementById('edit-user-phone')?.value || '').trim();
  const gender = document.getElementById('edit-user-gender')?.value || 'Nam';

  if (!firstName || !email || !phone) {
    showToast('Thiếu Thông Tin', 'Vui lòng điền đầy đủ các trường bắt buộc!', 'warning');
    return false;
  }

  const payload = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    gender: gender
  };

  try {
    if (typeof userApi !== 'undefined' && typeof userApi.update === 'function') {
      await userApi.update(userId, payload);
      showToast('Cập Nhật Thành Công', `Đã cập nhật thông tin cho ${lastName} ${firstName}!`, 'success');
      
      if (typeof syncUsersWithBackend === 'function') {
        await syncUsersWithBackend(true);
      }
    } else {
      u.firstName = firstName;
      u.lastName = lastName;
      u.name = `${lastName} ${firstName}`.trim();
      u.email = email;
      u.phone = phone;
      u.gender = gender;
      showToast('Đã Lưu (Tạm thời)', 'Đã lưu thay đổi vào bộ nhớ!', 'success');
    }
  } catch (err) {
    showToast('Lỗi Cập Nhật', 'Không thể cập nhật người dùng: ' + (err.message || err), 'error');
  }

  closeManagerModal();
  renderApp();
  return false;
}

export function openAssignRoleModal(userId) {
  const user = (appState.backendUsers || []).find(u => String(u.userId || u.id) === String(userId)) ||
               (appState.data?.members || []).find(m => String(m.id) === String(userId));
  if (!user) {
    showToast('Không Tìm Thấy', 'Không tìm thấy thông tin tài khoản!', 'error');
    return;
  }
  appState.managerSelectedUserForRole = user;
  appState.managerActiveModal = 'ASSIGN_ROLE';
  renderApp();
}

export function renderAssignRoleModal() {
  const u = appState.managerSelectedUserForRole;
  if (!u) return '';

  const currentRole = (u.roleName || 'MEMBER').toUpperCase();

  let rolesList = [
    { roleId: 4, roleName: 'MEMBER', title: 'MEMBER (Hội Viên)' },
    { roleId: 3, roleName: 'COACH', title: 'COACH (Huấn Luyện Viên)' },
    { roleId: 2, roleName: 'RECEPTIONIST', title: 'RECEPTIONIST (Lễ Tân)' },
    { roleId: 1, roleName: 'CENTER_MANAGER', title: 'CENTER_MANAGER (Quản Lý Trung Tâm)' }
  ];

  if (appState.availableRoles && appState.availableRoles.length > 0) {
    rolesList = appState.availableRoles.map(r => {
      const name = (r.roleName || r.name || '').toUpperCase();
      let title = name;
      if (name === 'MEMBER') title = 'MEMBER (Hội Viên)';
      else if (name === 'COACH') title = 'COACH (Huấn Luyện Viên)';
      else if (name === 'RECEPTIONIST') title = 'RECEPTIONIST (Lễ Tân)';
      else if (name === 'CENTER_MANAGER' || name === 'ADMIN') title = 'CENTER_MANAGER (Quản Lý Trung Tâm)';
      return {
        roleId: r.roleId || r.id,
        roleName: name,
        title: title
      };
    });
  }

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Phân Quyền / Đổi Vai Trò</h3>
            <p class="text-xs text-slate-500 mt-0.5">${u.name} &bull; Hiện tại: <span class="font-bold text-indigo-600">${currentRole}</span></p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleAssignRoleSubmit(event)" class="space-y-4 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Chọn Vai Trò Mới</label>
            <div class="space-y-2">
              ${rolesList.map(r => `
                <label class="flex items-center p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <input type="radio" name="assign-role-id" value="${r.roleId}" ${(currentRole === r.roleName || (r.roleName === 'CENTER_MANAGER' && currentRole === 'ADMIN')) ? 'checked' : ''} class="w-4 h-4 text-indigo-600" />
                  <span class="ml-3 text-xs font-bold text-slate-900">${r.title}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Xác Nhận Đổi Quyền</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function handleAssignRoleSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const u = appState.managerSelectedUserForRole;
  if (!u) return false;

  const userId = u.userId || u.id;
  const selectedRoleRadio = document.querySelector('input[name="assign-role-id"]:checked');
  if (!selectedRoleRadio) {
    showToast('Chọn Vai Trò', 'Vui lòng chọn vai trò cần gán!', 'warning');
    return false;
  }
  const roleId = Number(selectedRoleRadio.value);

  try {
    if (typeof userApi !== 'undefined' && typeof userApi.assignRole === 'function') {
      await userApi.assignRole(userId, roleId);
      showToast('Đổi Quyền Thành Công', `Đã cập nhật vai trò mới cho ${u.name}!`, 'success');
      
      if (typeof syncUsersWithBackend === 'function') {
        await syncUsersWithBackend(true);
      }
    } else {
      const roleMap = { 1: 'CENTER_MANAGER', 2: 'RECEPTIONIST', 3: 'COACH', 4: 'MEMBER' };
      u.roleName = roleMap[roleId] || 'MEMBER';
      u.roleId = roleId;
      showToast('Đã Lưu (Tạm thời)', `Đã chuyển vai trò sang ${u.roleName}!`, 'success');
    }
  } catch (err) {
    showToast('Lỗi Đổi Quyền', 'Không thể gán vai trò: ' + (err.message || err), 'error');
  }

  closeManagerModal();
  renderApp();
  return false;
}

export async function handleToggleUserStatus(userId) {
  const user = (appState.backendUsers || []).find(u => String(u.userId || u.id) === String(userId)) ||
               (appState.data?.members || []).find(m => String(m.id) === String(userId));
  if (!user) return;

  const currentStatus = (user.status || 'ACTIVE').toUpperCase();
  const actionText = currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA';

  if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của ${user.name || user.email}?`)) {
    return;
  }

  try {
    if (typeof userApi !== 'undefined' && typeof userApi.toggleStatus === 'function') {
      await userApi.toggleStatus(userId);
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      user.status = newStatus;
      showToast('Thành Công', `Đã ${actionText.toLowerCase()} tài khoản thành công!`, 'success');
      
      if (typeof syncUsersWithBackend === 'function') {
        await syncUsersWithBackend(true);
      }
    } else {
      user.status = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      showToast('Thành Công (Tạm thời)', `Đã ${actionText.toLowerCase()} tài khoản!`, 'success');
    }
  } catch (err) {
    showToast('Lỗi Thao Tác', 'Không thể đổi trạng thái tài khoản: ' + (err.message || err), 'error');
  }

  renderApp();
}

export function openRenewModal(memberId) {
  const member = (appState.data && appState.data.members) ? appState.data.members.find(m => m.id === memberId) : null;
  if (!member) return;
  appState.managerSelectedMemberForRenew = resolveMember(member);
  appState.managerActiveModal = 'RENEW_MEMBER';
  renderApp();
}

export function confirmManagerRenew(memberId) {
  const member = (appState.data && appState.data.members) ? appState.data.members.find(m => m.id === memberId) : null;
  if (member) {
    member.status = 'ACTIVE';
    member.endDate = '2026-11-30';
    recordAuditLog('RENEW_MEMBERSHIP', 'Members', `Gia hạn thủ công gói cho hội viên ${member.name} (${memberId})`, 'manager@sportscenter.vn');
    addNotification('Thẻ Hội Viên Đã Gia Hạn', `Thẻ hội viên của ${member.name} đã được gia hạn thành công đến ${member.endDate}.`, 'MEMBERSHIP', memberId);
    showToast('Gia Hạn Thành Công', `Đã gia hạn thẻ cho ${member.name} thêm 30 ngày!`, 'success');
  }
  closeManagerModal();
  renderApp();
}

export function renderRenewMemberModal() {
  const m = appState.managerSelectedMemberForRenew;
  if (!m) return '';

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Gia Hạn Thẻ Hội Viên</h3>
            <p class="text-xs text-slate-500 mt-0.5">${m.name} (${m.phone})</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Gói đang dùng:</span>
            <span class="font-bold text-slate-900">${m.activePackage}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Hạn thẻ hiện tại:</span>
            <span class="font-bold text-rose-600">${m.endDate}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-slate-200">
            <span class="text-slate-500">Gia hạn thêm:</span>
            <span class="font-bold text-emerald-600">+30 Ngày Sử Dụng</span>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Đóng</button>
          <button type="button" onclick="confirmManagerRenew('${m.id}')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs">Xác Nhận Gia Hạn</button>
        </div>
      </div>
    </div>
  `;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.refreshManagerUsersFromApi = refreshManagerUsersFromApi;
  _g.setManagerMemberFilterRole = setManagerMemberFilterRole;
  _g.setManagerMemberFilterStatus = setManagerMemberFilterStatus;
  _g.setManagerMemberSearch = setManagerMemberSearch;
  _g.renderManagerMembers = renderManagerMembers;
  _g.openEditUserModal = openEditUserModal;
  _g.renderEditUserModal = renderEditUserModal;
  _g.handleEditUserSubmit = handleEditUserSubmit;
  _g.openAssignRoleModal = openAssignRoleModal;
  _g.renderAssignRoleModal = renderAssignRoleModal;
  _g.handleAssignRoleSubmit = handleAssignRoleSubmit;
  _g.handleToggleUserStatus = handleToggleUserStatus;
  _g.openRenewModal = openRenewModal;
  _g.confirmManagerRenew = confirmManagerRenew;
  _g.renderRenewMemberModal = renderRenewMemberModal;
}
