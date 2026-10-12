// =========================================================================
// USER PROFILE MODAL & FULL VIEW & HANDLERS
// =========================================================================

// =========================================================================
// USER PROFILE: MULTI-ROLE PROFILE MODAL & FULL-PAGE VIEW
// =========================================================================

const USER_AVATAR_PRESETS = [
  { id: 'av1', label: 'Nữ Fitness', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Nam Boxing', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Nữ Yoga', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Nam VĐV', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'HLV Trưởng', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Quản Lý / Lễ Tân', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
];

function getResolvedCurrentUserProfile() {
  const role = appState.currentRole || 'MEMBER';
  const curr = appState.currentUser || {};

  if (role === 'MEMBER') {
    const members = (appState.data && appState.data.members) ? appState.data.members : [];
    let rawMember = null;
    if (curr.email || curr.id) {
      rawMember = members.find(m => 
        (curr.email && m.email && m.email.toLowerCase() === curr.email.toLowerCase()) ||
        (curr.id && (m.id === curr.id || m.memberId === curr.id))
      );
    }
    if (!rawMember) {
      rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0] || {};
    }
    const resolved = resolveMember(rawMember) || {};

    const displayName = curr.name || resolved.name || 'Hội viên';
    let fName = curr.firstName;
    let lName = curr.lastName;
    if (!fName && !lName) {
      const parts = displayName.split(' ');
      if (parts.length > 1) {
        lName = parts[0];
        fName = parts.slice(1).join(' ');
      } else {
        fName = displayName;
        lName = '';
      }
    }

    return {
      id: curr.id || resolved.id || 'MEM101',
      name: displayName,
      lastName: lName || resolved.lastName || '',
      firstName: fName || resolved.firstName || '',
      email: curr.email || resolved.email || 'member@sportscenter.vn',
      phone: curr.phone || resolved.phone || '0912345678',
      gender: curr.gender || rawMember.gender || 'Nam',
      dob: rawMember.dob || '1998-05-18',
      address: rawMember.address || 'Khu Công Nghệ Cao Hòa Lạc, Hà Nội',
      trainingGoal: rawMember.trainingGoal || resolved.trainingGoal || 'Rèn luyện sức khỏe & Thể lực',
      emergencyContact: rawMember.emergencyContact || 'Người thân - 0988112233',
      avatar: appState.userProfileDraftAvatar || curr.avatar || resolved.avatar || USER_AVATAR_PRESETS[0].url,
      role: 'MEMBER',
      roleLabel: 'Hội Viên Chính Thức',
      status: rawMember.status || resolved.status || 'ACTIVE',
      activePackage: resolved.activePackage || 'Gói Hội Viên',
      startDate: resolved.startDate || '2026-08-01',
      endDate: resolved.endDate || '2026-11-01',
      inbody: resolved.inbody || { weight: 52, height: 162, bmi: 19.8, bodyFat: 21.5 }
    };
  } else if (role === 'COACH') {
    return {
      id: curr.id || 'COACH01',
      name: curr.name || 'Trần Hoàng Nam',
      lastName: curr.lastName || 'Trần',
      firstName: curr.firstName || 'Hoàng Nam',
      email: curr.email || 'coach.nam@sportscenter.vn',
      phone: curr.phone || '0918765432',
      gender: curr.gender || 'Nam',
      dob: '1992-08-20',
      address: 'Quận Cầu Giấy, Hà Nội',
      trainingGoal: 'Chuyên gia huấn luyện Boxing, Thể lực & Yoga phục hồi',
      emergencyContact: 'Trần Thị B - 0977223344',
      avatar: appState.userProfileDraftAvatar || curr.avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      role: 'COACH',
      roleLabel: 'Huấn Luyện Viên Trưởng (Head Coach)',
      status: 'ACTIVE',
      activePackage: 'HLV Hợp Đồng Chính Thức',
      startDate: '2024-01-01',
      endDate: '2027-12-31'
    };
  } else if (role === 'RECEPTIONIST') {
    return {
      id: curr.id || 'REC01',
      name: curr.name || 'Lê Ngọc Lễ Tân',
      lastName: curr.lastName || 'Lê',
      firstName: curr.firstName || 'Ngọc',
      email: curr.email || 'letan@sportscenter.vn',
      phone: curr.phone || '0901234567',
      gender: curr.gender || 'Nữ',
      dob: '1999-11-05',
      address: 'Quận Nam Từ Liêm, Hà Nội',
      trainingGoal: 'Điều phối vận hành quầy dịch vụ, cổng Turnstile & hỗ trợ hội viên',
      emergencyContact: 'Lê Văn C - 0966334455',
      avatar: appState.userProfileDraftAvatar || curr.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'RECEPTIONIST',
      roleLabel: 'Chuyên Viên Lễ Tân & Điều Phối Kiosk',
      status: 'ACTIVE',
      activePackage: 'Nhân Sự Ca Sáng (06:00 - 14:00)',
      startDate: '2025-06-01',
      endDate: '2026-12-31'
    };
  } else {
    return {
      id: curr.id || 'MGR01',
      name: curr.name || 'Nguyễn Văn Quản Lý',
      lastName: curr.lastName || 'Nguyễn',
      firstName: curr.firstName || 'Văn Quản Lý',
      email: curr.email || 'manager@sportscenter.vn',
      phone: curr.phone || '0919998888',
      gender: curr.gender || 'Nam',
      dob: '1988-03-12',
      address: 'Tòa nhà FPT, Phố Duy Tân, Hà Nội',
      trainingGoal: 'Giám đốc Vận hành & Quản trị Hệ thống Trung tâm Thể thao',
      emergencyContact: 'Nguyễn Thị D - 0911223344',
      avatar: appState.userProfileDraftAvatar || curr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'MANAGER',
      roleLabel: 'Tổng Quản Lý Trung Tâm (Center Director)',
      status: 'ACTIVE',
      activePackage: 'Toàn Quyền Quản Trị Hệ Thống (SuperAdmin)',
      startDate: '2023-01-01',
      endDate: '2030-12-31'
    };
  }
}

function renderProfileTabsContent(user, isModal) {
  const activeTab = appState.userProfileActiveTab || 'INFO';
  const role = user.role;

  return `
    <div class="space-y-4">
      <!-- User Hero Header Card -->
      <div class="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div class="relative group">
            <img src="${user.avatar}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-md" />
            <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">✓</span>
          </div>
          <div>
            <div class="flex items-center justify-center sm:justify-start space-x-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500 text-white tracking-wider">
                ${user.roleLabel}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${user.status === 'ACTIVE' ? 'Đang Hoạt Động' : user.status}
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black text-white mt-1">${user.name}</h3>
            <div class="text-xs text-indigo-200 mt-0.5 space-x-2">
              <span>Mã ID: <b class="font-mono font-bold text-white">${user.id}</b></span>
              <span>&bull;</span>
              <span>${user.email}</span>
            </div>
          </div>
        </div>

        <!-- Quick Info Pill -->
        <div class="text-center sm:text-right p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-xs w-full sm:w-auto">
          <div class="text-indigo-200 text-[11px] font-semibold">${role === 'MEMBER' ? 'Gói thẻ hiện tại:' : 'Chức vụ vận hành:'}</div>
          <div class="font-extrabold text-white mt-0.5">${user.activePackage}</div>
          <div class="text-[10px] text-slate-300 mt-1">${role === 'MEMBER' ? 'Hạn thẻ: ' + user.endDate : 'Hợp đồng: ' + user.endDate}</div>
        </div>
      </div>

      <!-- Quick Avatar Preset Selector -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span class="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Chọn nhanh ảnh đại diện mẫu:</span>
        <div class="flex items-center space-x-2 overflow-x-auto py-1">
          ${USER_AVATAR_PRESETS.map(av => `
            <button type="button" onclick="selectUserProfileAvatar('${av.url}')" class="relative group focus:outline-none" title="${av.label}">
              <img src="${av.url}" class="w-8 h-8 rounded-full object-cover border-2 transition ${user.avatar === av.url ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-110' : 'border-slate-300 hover:border-slate-500'}" />
              ${user.avatar === av.url ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full text-white text-[8px] flex items-center justify-center font-bold">✓</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Profile Sub-Tab Bar -->
      <div class="flex items-center space-x-1.5 border-b border-slate-200 pb-2">
        <button type="button" onclick="setUserProfileTab('INFO')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'INFO' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          👤 Thông Tin Cá Nhân
        </button>
        <button type="button" onclick="setUserProfileTab('SECURITY')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'SECURITY' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          🔒 Bảo Mật & Mật Khẩu
        </button>
        <button type="button" onclick="setUserProfileTab('MEMBERSHIP')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'MEMBERSHIP' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
          ${role === 'MEMBER' ? '💳 Thẻ & Thể Trạng' : '📊 Quyền Hạn & Ca Làm'}
        </button>
      </div>

      <!-- Tab 1: Personal Info -->
      ${activeTab === 'INFO' ? `
        <form onsubmit="return handleSaveUserProfile(event)" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Họ Đệm <span class="text-rose-500">*</span></label>
              <input type="text" id="profile-form-lastname" value="${user.lastName}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Tên <span class="text-rose-500">*</span></label>
              <input type="text" id="profile-form-firstname" value="${user.firstName}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Số Điện Thoại <span class="text-rose-500">*</span></label>
              <input type="tel" id="profile-form-phone" value="${user.phone}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Email Tài Khoản</label>
              <input type="email" id="profile-form-email" value="${user.email}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Giới Tính</label>
              <select id="profile-form-gender" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                <option value="Nữ" ${user.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                <option value="Nam" ${user.gender === 'Nam' ? 'selected' : ''}>Nam</option>
                <option value="Khác" ${user.gender === 'Khác' ? 'selected' : ''}>Khác</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Ngày Sinh (DOB)</label>
              <input type="date" id="profile-form-dob" value="${user.dob}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Địa Chỉ Thường Trú</label>
            <input type="text" id="profile-form-address" value="${user.address}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">${role === 'MEMBER' ? 'Mục Tiêu Rèn Luyện (Training Goal)' : 'Mô Tả Chuyên Môn / Công Tác'}</label>
            <input type="text" id="profile-form-goal" value="${user.trainingGoal}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Người Liên Hệ Khẩn Cấp</label>
              <input type="text" id="profile-form-emergency" value="${user.emergencyContact}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Tùy Chỉnh URL Ảnh Đại Diện</label>
              <input type="url" id="profile-form-avatar" placeholder="https://..." value="${appState.userProfileDraftAvatar || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng
              </button>
            ` : ''}
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center space-x-2">
              <span>Lưu Cập Nhật Hồ Sơ</span>
              <span>✓</span>
            </button>
          </div>
        </form>
      ` : ''}

      <!-- Tab 2: Security & Password -->
      ${activeTab === 'SECURITY' ? `
        <form onsubmit="return handleChangeUserPassword(event)" class="space-y-4">
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div class="font-bold flex items-center space-x-1.5">
              <span>🛡️</span>
              <span>Tiêu Chuẩn Bảo Mật Tài Khoản Sports Center</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              Mật khẩu demo mặc định là <b class="font-mono text-amber-950 font-black">123</b>. Bạn có thể đổi sang mật khẩu mới để bảo vệ thông tin cá nhân và lượt check-in.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Mật Khẩu Hiện Tại <span class="text-rose-500">*</span></label>
              <input type="password" id="profile-sec-current-pass" value="123" placeholder="Nhập mật khẩu hiện tại..." class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Mật Khẩu Mới (Tối thiểu 6 ký tự) <span class="text-rose-500">*</span></label>
                <input type="password" id="profile-sec-new-pass" placeholder="••••••••" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Xác Nhận Mật Khẩu Mới <span class="text-rose-500">*</span></label>
                <input type="password" id="profile-sec-confirm-pass" placeholder="••••••••" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
              </div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div class="font-bold text-slate-700">Yêu cầu bảo mật:</div>
            <div>&bull; Mật khẩu nên chứa cả chữ hoa, chữ thường và chữ số.</div>
            <div>&bull; Mọi thay đổi mật khẩu sẽ được ghi nhận vào nhật ký kiểm toán hệ thống.</div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng
              </button>
            ` : ''}
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition">
              Cập Nhật Mật Khẩu Mới
            </button>
          </div>
        </form>
      ` : ''}

      <!-- Tab 3: Membership & Stats -->
      ${activeTab === 'MEMBERSHIP' ? `
        <div class="space-y-4">
          ${role === 'MEMBER' ? `
            <!-- Digital Member Card View -->
            <div class="p-5 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl text-white shadow-md space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 text-white">SPORTS CENTER PASS</span>
                  <h4 class="text-base font-black mt-1 tracking-tight">${user.activePackage}</h4>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950">
                  ${user.status}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/20">
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Chủ Thẻ</div>
                  <div class="font-bold">${user.name}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Mã Hội Viên</div>
                  <div class="font-mono font-bold">${user.id}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Ngày Kích Hoạt</div>
                  <div class="font-semibold">${user.startDate}</div>
                </div>
                <div>
                  <div class="text-[10px] text-indigo-200 uppercase">Ngày Hết Hạn</div>
                  <div class="font-bold text-amber-300">${user.endDate}</div>
                </div>
              </div>
            </div>

            <!-- InBody Quick Glance -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Cân Nặng</div>
                <div class="text-lg font-black text-slate-900 mt-0.5">${user.inbody?.weight || 52} <span class="text-xs font-normal">kg</span></div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Chiều Cao</div>
                <div class="text-lg font-black text-slate-900 mt-0.5">${user.inbody?.height || 162} <span class="text-xs font-normal">cm</span></div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Chỉ Số BMI</div>
                <div class="text-lg font-black text-indigo-600 mt-0.5">${user.inbody?.bmi || 19.8}</div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Tỷ Lệ Mỡ</div>
                <div class="text-lg font-black text-emerald-600 mt-0.5">${user.inbody?.bodyFat || 21.5}%</div>
              </div>
            </div>

            <!-- Activity Stats -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div class="font-bold text-slate-800">Thống Kê Hoạt Động Luyện Tập:</div>
              <div class="flex justify-between items-center py-1 border-b border-slate-200">
                <span class="text-slate-500">Lượt check-in qua cổng Turnstile tự động:</span>
                <span class="font-bold text-slate-900">18 Buổi</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-slate-200">
                <span class="text-slate-500">Số lớp học thể thao (Yoga, Boxing, Zumba) đã giữ chỗ:</span>
                <span class="font-bold text-slate-900">${(appState.data?.classEnrollments || []).filter(e => e.memberId === user.id).length || 5} Lớp</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-slate-500">Số hóa đơn thanh toán gói tập trực tuyến:</span>
                <span class="font-bold text-indigo-700">${(appState.data?.invoices || []).filter(i => i.memberId === user.id).length || 3} Hóa đơn</span>
              </div>
            </div>
          ` : `
            <!-- Staff Role Permissions Glance -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div class="font-bold text-slate-800 text-sm">Thông Tin Nhiệm Vụ Vận Hành:</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="p-3 bg-white rounded-xl border border-slate-200">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">Mã Nhân Sự</div>
                  <div class="text-sm font-black text-slate-900 mt-0.5">${user.id}</div>
                </div>
                <div class="p-3 bg-white rounded-xl border border-slate-200">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">Bộ Phận / Ban</div>
                  <div class="text-sm font-black text-slate-900 mt-0.5">${role === 'COACH' ? 'HLV Thể Thao' : (role === 'RECEPTIONIST' ? 'Lễ Tân & Kiosk' : 'Ban Giám Đốc')}</div>
                </div>
              </div>
              <div class="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                <b>Phân quyền hệ thống:</b> Cho phép xem, điểm danh, check-in, xử lý ticket và theo dõi nhật ký kiểm toán theo tiêu chuẩn vai trò ${user.roleLabel}.
              </div>
            </div>
          `}

          <div class="pt-2 flex items-center justify-end">
            ${isModal ? `
              <button type="button" onclick="closeUserProfileModal()" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition">
                Đóng Hộp Thoại
              </button>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderUserProfileModal() {
  const user = getResolvedCurrentUserProfile();

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-2 sm:p-5 animate-fade-in">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                Hồ Sơ Tài Khoản
              </span>
              <span class="text-xs text-slate-400 font-semibold">&bull; Sports Center Identity</span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">Hồ Sơ & Cài Đặt Cá Nhân</h2>
          </div>
          <button type="button" onclick="closeUserProfileModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-lg transition">
            &times;
          </button>
        </div>

        ${renderProfileTabsContent(user, true)}
      </div>
    </div>
  `;
}

function renderMemberProfilePage() {
  const user = getResolvedCurrentUserProfile();

  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Hồ Sơ Cá Nhân & Cài Đặt</h2>
          <p class="text-xs text-slate-500 mt-0.5">Quản lý thông tin hội viên, đổi mật khẩu và xem các quyền lợi gói thẻ của bạn.</p>
        </div>
        <button type="button" onclick="switchTab('member-pass')" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5">
          <span>Xem Thẻ QR Check-in</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        ${renderProfileTabsContent(user, false)}
      </div>
    </div>
  `;
}


function openUserProfileModal(tab) {
  appState.userProfileModalOpen = true;
  appState.userProfileActiveTab = tab || 'INFO';
  appState.userProfileDraftAvatar = null;
  renderApp();
}

function closeUserProfileModal() {
  appState.userProfileModalOpen = false;
  appState.userProfileDraftAvatar = null;
  renderApp();
}

function setUserProfileTab(tab) {
  appState.userProfileActiveTab = tab;
  renderApp();
}

function selectUserProfileAvatar(url) {
  appState.userProfileDraftAvatar = url;
  renderApp();
}

function handleSaveUserProfile(e) {
  if (e) e.preventDefault();
  const lastName = (document.getElementById('profile-form-lastname')?.value || '').trim();
  const firstName = (document.getElementById('profile-form-firstname')?.value || '').trim();
  const phone = (document.getElementById('profile-form-phone')?.value || '').trim();
  const email = (document.getElementById('profile-form-email')?.value || '').trim();
  const gender = document.getElementById('profile-form-gender')?.value || 'Nữ';
  const dob = document.getElementById('profile-form-dob')?.value || '1998-05-18';
  const address = (document.getElementById('profile-form-address')?.value || '').trim();
  const goal = (document.getElementById('profile-form-goal')?.value || '').trim();
  const emergency = (document.getElementById('profile-form-emergency')?.value || '').trim();
  const customAvatar = (document.getElementById('profile-form-avatar')?.value || '').trim();

  if (!firstName) {
    showToast('Thiếu thông tin', 'Vui lòng nhập Tên của bạn.', 'error');
    return false;
  }

  const role = appState.currentRole || 'MEMBER';
  const fullName = `${lastName} ${firstName}`.trim();
  const finalAvatar = customAvatar || appState.userProfileDraftAvatar;

  if (role === 'MEMBER') {
    const rawMember = (appState.data && appState.data.members) ? (appState.data.members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || appState.data.members[0]) : null;
    if (rawMember) {
      rawMember.name = fullName;
      rawMember.lastName = lastName;
      rawMember.firstName = firstName;
      if (phone) rawMember.phone = phone;
      if (email) rawMember.email = email;
      rawMember.gender = gender;
      rawMember.dob = dob;
      rawMember.address = address;
      if (goal) rawMember.trainingGoal = goal;
      rawMember.emergencyContact = emergency;
      if (finalAvatar) rawMember.avatar = finalAvatar;
    }
  }

  if (appState.currentUser) {
    appState.currentUser.name = fullName;
    if (email) appState.currentUser.email = email;
    if (finalAvatar) appState.currentUser.avatar = finalAvatar;
  }

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('UPDATE_PROFILE', 'Members', `Người dùng cập nhật thông tin hồ sơ cá nhân: ${fullName}`, appState.currentUser?.id || 'MEM101');
  }

  appState.userProfileDraftAvatar = null;
  showToast('Cập nhật thành công', `Đã lưu hồ sơ cá nhân cho ${fullName}!`, 'success');
  renderApp();
  return false;
}

function handleChangeUserPassword(e) {
  if (e) e.preventDefault();
  const currPass = (document.getElementById('profile-sec-current-pass')?.value || '').trim();
  const newPass = (document.getElementById('profile-sec-new-pass')?.value || '').trim();
  const confirmPass = (document.getElementById('profile-sec-confirm-pass')?.value || '').trim();

  if (!newPass || newPass.length < 6) {
    showToast('Mật khẩu quá ngắn', 'Mật khẩu mới phải có tối thiểu 6 ký tự.', 'error');
    return false;
  }
  if (newPass !== confirmPass) {
    showToast('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.', 'error');
    return false;
  }

  if (typeof recordAuditLog === 'function') {
    recordAuditLog('CHANGE_PASSWORD', 'Accounts', `Đổi mật khẩu tài khoản thành công cho ${appState.currentUser?.email || 'user'}`, appState.currentUser?.id || 'USER');
  }

  showToast('Đổi mật khẩu thành công', 'Mật khẩu mới của bạn đã được cập nhật an toàn!', 'success');
  appState.userProfileActiveTab = 'INFO';
  renderApp();
  return false;
}

// Receptionist Interactions

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof getResolvedCurrentUserProfile !== 'undefined') _targetGlobal.getResolvedCurrentUserProfile = getResolvedCurrentUserProfile;
  if (typeof renderProfileTabsContent !== 'undefined') _targetGlobal.renderProfileTabsContent = renderProfileTabsContent;
  if (typeof renderUserProfileModal !== 'undefined') _targetGlobal.renderUserProfileModal = renderUserProfileModal;
  if (typeof renderMemberProfilePage !== 'undefined') _targetGlobal.renderMemberProfilePage = renderMemberProfilePage;
  if (typeof openUserProfileModal !== 'undefined') _targetGlobal.openUserProfileModal = openUserProfileModal;
  if (typeof closeUserProfileModal !== 'undefined') _targetGlobal.closeUserProfileModal = closeUserProfileModal;
  if (typeof setUserProfileTab !== 'undefined') _targetGlobal.setUserProfileTab = setUserProfileTab;
  if (typeof selectUserProfileAvatar !== 'undefined') _targetGlobal.selectUserProfileAvatar = selectUserProfileAvatar;
  if (typeof handleSaveUserProfile !== 'undefined') _targetGlobal.handleSaveUserProfile = handleSaveUserProfile;
  if (typeof handleChangeUserPassword !== 'undefined') _targetGlobal.handleChangeUserPassword = handleChangeUserPassword;
  if (typeof USER_AVATAR_PRESETS !== 'undefined') _targetGlobal.USER_AVATAR_PRESETS = USER_AVATAR_PRESETS;
}
