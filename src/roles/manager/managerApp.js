// =========================================================================
// MANAGER WEB APP (ADMIN DASHBOARD, MEMBERS, PACKAGES, CLASSES, AUDIT)
// =========================================================================

// =========================================================================
// 5. MANAGER WEB APP: COMPLETE BACK-OFFICE ADMIN DASHBOARD
// =========================================================================
function renderManagerWebApp() {
  const currentTab = appState.currentTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] flex">
      <!-- Admin Left Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shadow-xs">
        <div>
          <div class="h-16 flex items-center px-6 border-b border-slate-200">
            <div class="flex items-center space-x-2.5">
              <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">SC</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">SPORTS CENTER</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">Center Admin</div>
              </div>
            </div>
          </div>

          <nav class="p-3.5 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Quản Trị Hệ Thống</div>
            <button type="button" onclick="switchTab('dashboard')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Báo Cáo Tổng Quan & KPIs</span>
            </button>
            <button type="button" onclick="switchTab('manager-members')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-members' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Quản Lý Hội Viên</span>
            </button>
            <button type="button" onclick="switchTab('manager-packages')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-packages' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Danh Mục Gói Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-classes')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-classes' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Lớp Học & Phòng Tập</span>
            </button>
            <button type="button" onclick="switchTab('manager-staff')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-staff' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Nhân Sự & HLV</span>
            </button>
            <button type="button" onclick="switchTab('manager-finances')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-finances' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Sổ Cái Hóa Đơn</span>
            </button>
            <button type="button" onclick="switchTab('manager-audit')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === 'manager-audit' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <span>Nhật Ký Kiểm Toán (Audit)</span>
            </button>
          </nav>
        </div>

        <div class="p-4 border-t border-slate-200 text-center">
          <div class="text-[11px] font-semibold text-slate-800">SWP391 FA26 Topic 04</div>
          <div class="text-[10px] text-slate-400 mt-0.5">GVHD: MinhTTH5</div>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Quản Lý Trung Tâm (Manager)
            </span>
            <span class="text-slate-300">/</span>
            <span class="text-xs font-semibold text-slate-700">${getManagerTabTitle(currentTab)}</span>
          </div>

          <div class="flex items-center space-x-3">
            ${renderNotificationBell('MANAGER')}
            ${renderUserAvatarDropdown('MANAGER')}
          </div>
        </header>

        <!-- Admin Dynamic Body -->
        <main class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          ${currentTab === 'dashboard' ? renderManagerDashboard() : ''}
          ${currentTab === 'manager-members' ? renderManagerMembers() : ''}
          ${currentTab === 'manager-packages' ? renderManagerPackages() : ''}
          ${currentTab === 'manager-classes' ? renderManagerClasses() : ''}
          ${currentTab === 'manager-staff' ? renderManagerStaff() : ''}
          ${currentTab === 'manager-finances' ? renderManagerFinances() : ''}
          ${currentTab === 'manager-audit' ? renderManagerAuditLogs() : ''}
        </main>
      </div>

      <!-- Manager CRUD Modals -->
      ${appState.managerActiveModal === 'CREATE_PACKAGE' ? renderCreatePackageModal() : ''}
      ${appState.managerActiveModal === 'CREATE_CLASS' ? renderCreateClassModal() : ''}
      ${appState.managerActiveModal === 'RENEW_MEMBER' ? renderRenewMemberModal() : ''}
    </div>
  `;
}

function getManagerTabTitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Báo Cáo Tổng Quan & Doanh Thu';
    case 'manager-members': return 'Quản Lý Danh Sách Hội Viên';
    case 'manager-packages': return 'Danh Mục Các Gói Tập';
    case 'manager-classes': return 'Quản Lý Lớp Học & Phòng Tập';
    case 'manager-staff': return 'Quản Lý Nhân Sự & Huấn Luyện Viên';
    case 'manager-finances': return 'Sổ Cái Lịch Sử Hóa Đơn';
    case 'manager-audit': return 'Nhật Ký Kiểm Toán & Vết Thao Tác Hệ Thống (Audit Logs)';
    default: return 'Bảng Quản Trị';
  }
}

function renderManagerDashboard() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const invoices = (appState.data && appState.data.invoices) ? appState.data.invoices : [];
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(totalRevenue).toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">&uarr; +14.8% so với tháng trước</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hội Viên Đang Hoạt Động</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${activeMembers} <span class="text-xs font-normal text-slate-500">/ ${members.length}</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">Tỷ lệ duy trì thẻ: 85%</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt Check-in Hôm Nay</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(appState.data?.checkinLogs || []).length * 15} <span class="text-xs font-normal text-slate-500">lượt</span></div>
          <div class="text-[11px] text-indigo-600 font-semibold mt-1">Giờ cao điểm: 18:00 - 20:00</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp Học Đang Mở</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${classes.length} <span class="text-xs font-normal text-slate-500">lớp</span></div>
          <div class="text-[11px] text-slate-500 font-semibold mt-1">Tỷ lệ lấp đầy slot: 88%</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Biểu Đồ Xu Hướng Doanh Thu (7 Ngày Qua)</h3>
            <div class="text-xs text-slate-400">Doanh thu bán gói tập & thẻ hội viên</div>
          </div>
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Đơn vị: VNĐ</span>
        </div>
        <div class="h-64 relative">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

function renderManagerMembers() {
  const query = (appState.managerMemberSearch || '').toLowerCase().trim();
  const rawMembers = (appState.data && appState.data.members) ? appState.data.members : [];
  const members = rawMembers.map(m => resolveMember(m));
  const filtered = members.filter(m => !query || (m.name || '').toLowerCase().includes(query) || (m.phone || '').includes(query) || (m.id || '').toLowerCase().includes(query));

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Danh Sách Hội Viên Trung Tâm</h3>
          <div class="text-xs text-slate-400">Quản lý tài khoản, trạng thái thẻ và thời hạn</div>
        </div>

        <div class="w-full sm:w-72">
          <input type="text" placeholder="Tìm tên, SĐT, mã thẻ..." value="${appState.managerMemberSearch}" oninput="setManagerMemberSearch(this.value)" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
            <tr>
              <th class="py-3 px-4">Hội Viên</th>
              <th class="py-3 px-4">Số Điện Thoại</th>
              <th class="py-3 px-4">Gói Tập Hiện Tại</th>
              <th class="py-3 px-4">Thời Hạn Thẻ</th>
              <th class="py-3 px-4">Trạng Thái</th>
              <th class="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.map(m => `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="py-3 px-4 flex items-center space-x-3">
                  <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div class="font-bold text-slate-900">${m.name}</div>
                    <div class="text-[11px] text-slate-400">${m.email} &bull; ${m.id}</div>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-700 font-medium">${m.phone}</td>
                <td class="py-3 px-4 text-indigo-700 font-semibold">${m.activePackage}</td>
                <td class="py-3 px-4 text-slate-600">${m.startDate} &rarr; ${m.endDate}</td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                    ${m.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button type="button" onclick="openRenewModal('${m.id}')" class="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200">
                    Gia Hạn Thẻ
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

function renderManagerPackages() {
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Danh Mục Các Gói Tập & Dịch Vụ</h3>
          <div class="text-xs text-slate-400">Các gói thẻ hội viên đang được mở bán trên toàn hệ thống</div>
        </div>
        <button type="button" onclick="openManagerModal('CREATE_PACKAGE')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
          + Tạo Gói Tập Mới
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${packages.map(p => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div class="flex justify-between items-start">
              <h4 class="font-black text-sm text-slate-900">${p.name}</h4>
              <span class="text-sm font-black text-indigo-600">${(p.price).toLocaleString()} VND</span>
            </div>
            <div class="text-xs text-slate-500">${p.description}</div>
            <div class="text-xs text-slate-600 pt-2 border-t border-slate-200 flex justify-between items-center">
              <span>Thời hạn: <strong>${p.durationDays} Ngày</strong></span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ĐANG MỞ BÁN</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderManagerClasses() {
  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const classes = rawClasses.map(c => resolveClass(c));

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Lịch Lớp Học & Phân Công Huấn Luyện Viên</h3>
          <div class="text-xs text-slate-400">Danh sách các lớp thể thao đang hoạt động</div>
        </div>
        <button type="button" onclick="openManagerModal('CREATE_CLASS')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">
          + Thêm Lớp Mới
        </button>
      </div>

      <div class="divide-y divide-slate-100">
        ${classes.map(c => `
          <div class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div class="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase mb-1">${c.category}</div>
              <h4 class="font-extrabold text-sm text-slate-900">${c.title}</h4>
              <div class="text-xs text-slate-500 mt-0.5">${c.time} (${c.days}) &bull; Phòng: <strong>${c.room}</strong> &bull; HLV: <strong class="text-indigo-600">${c.coachName}</strong></div>
            </div>
            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Sĩ số: ${c.bookedSeats} / ${c.maxCapacity} học viên
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// NEW: Manager Staff & Coaches Roster Mode
function renderManagerStaff() {
  const coaches = (appState.data && appState.data.coaches) ? appState.data.coaches : [];

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Đội Ngũ Huấn Luyện Viên & Lễ Tân</h3>
        <div class="text-xs text-slate-400">Nhân sự vận hành và phụ trách chuyên môn thể thao</div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${coaches.map(co => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div class="flex items-center space-x-3">
              <img src="${co.avatar}" class="w-12 h-12 rounded-xl object-cover border border-slate-200" />
              <div>
                <div class="font-black text-sm text-slate-900">${co.name}</div>
                <div class="text-[11px] text-indigo-600 font-bold">${co.specialty}</div>
              </div>
            </div>
            <div class="text-xs text-slate-500 pt-2 border-t border-slate-200 space-y-1">
              <div>Kinh nghiệm: <strong>${co.experience}</strong></div>
              <div>Liên hệ: <strong>${co.phone}</strong></div>
              <div>Lớp phụ trách: <strong class="text-slate-900">${co.activeClassesCount || 2} Lớp</strong></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderManagerFinances() {
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

// Manager CRUD Modals
function renderCreatePackageModal() {
  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Tạo Gói Tập Mới (Chuẩn ERD)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Khai báo PackageID, PackageName, Type, Price, DurationDays, Description.</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreatePackageSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Gói Tập (PackageName)</label>
            <input type="text" id="new-pkg-name" required placeholder="VD: Platinum Gym & Cardio 6 Tháng" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phân Loại Gói (Type)</label>
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
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Thời Hạn (DurationDays)</label>
              <input type="number" id="new-pkg-days" required value="180" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Đơn Giá (Price VNĐ)</label>
              <input type="number" id="new-pkg-price" required value="4200000" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Quyền Lợi (Description)</label>
            <textarea id="new-pkg-desc" rows="2" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" placeholder="Mô tả quyền lợi gói tập..."></textarea>
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Lưu Gói Tập</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderCreateClassModal() {
  const subjects = appState.data.subjects || [];
  const coaches = appState.data.coaches || [];
  const rooms = appState.data.rooms || [];

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-black text-base text-slate-900">Thêm Lớp Học Mới (Chuẩn ERD)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Liên kết SubjectID, RoomID, CoachID và ScheduleTime.</p>
          </div>
          <button type="button" onclick="closeManagerModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="return handleCreateClassSubmit(event)" class="space-y-3.5 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Bộ Môn Thể Thao (SubjectID)</label>
            <select id="new-class-sub" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600">
              ${subjects.map(s => `<option value="${s.subjectId}">${s.subjectName} - ${s.description}</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phòng Tập (RoomID)</label>
              <select id="new-class-room" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
                ${rooms.map(r => `<option value="${r.roomId}">${r.roomName}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sức Chứa (MaxCapacity)</label>
              <input type="number" id="new-class-cap" required value="20" min="1" max="100" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Huấn Luyện Viên (CoachID)</label>
            <select id="new-class-coach" required class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900">
              ${coaches.map(co => `<option value="${co.coachId || co.id}">${co.name} (${co.specialty})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Lịch Đào Tạo (ScheduleTime)</label>
            <input type="text" id="new-class-schedule" required value="Thứ 2, 4, 6 | 17:30 - 18:45" placeholder="VD: Thứ 2, 4, 6 | 17:30 - 18:45" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600" />
          </div>

          <div class="pt-2 flex space-x-3">
            <button type="button" onclick="closeManagerModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">Tạo Lớp Học</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderRenewMemberModal() {
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

function initChartsIfNeeded() {
  if (appState.currentRole !== 'MANAGER' || appState.currentTab !== 'dashboard') return;

  setTimeout(() => {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || typeof canvas.getContext !== 'function' || typeof Chart === 'undefined') return;

    if (window.activeRevenueChartInstance) {
      window.activeRevenueChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.activeRevenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: [1200000, 2450000, 1800000, 3200000, 4800000, 6500000, 5100000],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: function(v) { return (v / 1000000) + ' Tr'; }
            }
          }
        }
      }
    });
  }, 100);
}


function setManagerAuditSearch(keyword) {
  appState.managerAuditSearch = keyword;
  renderApp();
}

function renderManagerAuditLogs() {
  const auditLogs = appState.data?.auditLogs || [];
  const keyword = (appState.managerAuditSearch || '').toLowerCase().trim();
  const filteredLogs = auditLogs.filter(log => {
    if (!keyword) return true;
    return (
      (log.actionType || '').toLowerCase().includes(keyword) ||
      (log.targetTable || '').toLowerCase().includes(keyword) ||
      (log.details || '').toLowerCase().includes(keyword) ||
      (log.accountId || '').toLowerCase().includes(keyword) ||
      (log.logId || '').toLowerCase().includes(keyword)
    );
  });

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Nhật Ký Kiểm Toán & Vết Thao Tác Hệ Thống (Audit Logs)</h2>
          <p class="text-xs text-slate-500 mt-1">Truy vết toàn bộ các hành động thêm mới gói, phân công lớp, gia hạn thẻ và thao tác dữ liệu.</p>
        </div>

        <div class="w-full sm:w-72">
          <input type="text" value="${appState.managerAuditSearch || ''}" oninput="setManagerAuditSearch(this.value)" placeholder="Tìm kiếm theo hành động, bảng, chi tiết..." class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Mã Log</th>
                <th class="py-3.5 px-4">Loại Hành Động (ActionType)</th>
                <th class="py-3.5 px-4">Bảng Dữ Liệu (TargetTable)</th>
                <th class="py-3.5 px-4">Chi Tiết Thao Tác</th>
                <th class="py-3.5 px-4">Tài Khoản Thực Hiện</th>
                <th class="py-3.5 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredLogs.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-400">Không tìm thấy bản ghi kiểm toán phù hợp.</td>
                </tr>
              ` : filteredLogs.map(log => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-700">${log.logId || log.id}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      (log.actionType || '').includes('CREATE') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      (log.actionType || '').includes('RENEW') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      (log.actionType || '').includes('RESOLVE') ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }">
                      ${log.actionType}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-800">${log.targetTable}</td>
                  <td class="py-3.5 px-4 text-slate-700 max-w-md">${log.details}</td>
                  <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">${log.accountId}</td>
                  <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">${log.timestamp}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}


function setManagerMemberSearch(q) {
  appState.managerMemberSearch = q;
  renderApp();
}

function openManagerModal(modalName) {
  appState.managerActiveModal = modalName;
  renderApp();
}

function closeManagerModal() {
  appState.managerActiveModal = null;
  appState.managerSelectedMemberForRenew = null;
  renderApp();
}

function openRenewModal(memberId) {
  const m = appState.data.members.find(item => item.id === memberId || item.memberId === memberId);
  if (m) {
    appState.managerSelectedMemberForRenew = resolveMember(m);
    appState.managerActiveModal = 'RENEW_MEMBER';
    renderApp();
  }
}

function confirmManagerRenew(memberId) {
  fastRenewMemberAtReception(memberId);
  closeManagerModal();
}

function handleCreatePackageSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('new-pkg-name')?.value || 'Gói Mới';
  const type = document.getElementById('new-pkg-type')?.value || 'GYM';
  const days = parseInt(document.getElementById('new-pkg-days')?.value || '30', 10);
  const price = parseInt(document.getElementById('new-pkg-price')?.value || '1000000', 10);
  const desc = document.getElementById('new-pkg-desc')?.value || 'Quyền lợi đầy đủ';

  const newPkgId = 'PKG0' + (appState.data.packages.length + 1);
  
  // STRICT ERD: PackageID, PackageName, Type, Price, DurationDays, Description
  appState.data.packages.push({
    packageId: newPkgId,
    id: newPkgId,
    packageName: name,
    name: name,
    type: type,
    durationDays: days,
    price: price,
    description: desc
  });

  // Record Audit Log & Notification per ERD
  recordAuditLog('CREATE_PACKAGE', 'Packages', `Quản lý tạo mới gói ${name} (${price.toLocaleString()} VND, ${days} ngày)`, 'manager@sportscenter.vn');
  addNotification('Gói Tập Mới Ra Mắt', `Trung tâm vừa ra mắt gói tập "${name}" (${type}) với nhiều ưu đãi hấp dẫn!`, 'ACCOUNT', 'MEM101');

  closeManagerModal();
  showToast('Tạo gói tập thành công (ERD Compliant)', `Đã thêm gói ${name} (Loại: ${type}) vào danh mục!`, 'success');
  return false;
}

function handleCreateClassSubmit(e) {
  if (e) e.preventDefault();
  const subId = document.getElementById('new-class-sub')?.value || 'SUB01';
  const roomId = document.getElementById('new-class-room')?.value || 'RM01';
  const coachId = document.getElementById('new-class-coach')?.value || 'COACH';
  const scheduleTime = document.getElementById('new-class-schedule')?.value || 'Thứ 2, 4, 6 | 17:30 - 18:45';
  const cap = parseInt(document.getElementById('new-class-cap')?.value || '20', 10);

  const newClassId = 'CLS0' + (appState.data.classes.length + 1);
  
  // STRICT ERD: Only ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status
  const newClass = {
    classId: newClassId,
    id: newClassId,
    subjectId: subId,
    roomId: roomId,
    coachId: coachId,
    scheduleTime: scheduleTime,
    maxCapacity: cap,
    status: 'ACTIVE'
  };

  appState.data.classes.push(newClass);

  // Link ClassPlans entity per ERD
  if (!appState.data.classPlans) appState.data.classPlans = [];
  appState.data.classPlans.push({
    classPlanId: 'CP0' + (appState.data.classPlans.length + 1),
    classId: newClassId,
    content: 'Khởi động kéo giãn (10p) - Kỹ thuật chuyên sâu (45p) - Phục hồi (15p)',
    createDate: '2026-09-19'
  });

  const resolved = resolveClass(newClass);

  // Record Audit Log & Notification per ERD
  recordAuditLog('CREATE_CLASS', 'Classes', `Quản lý xếp lớp ${resolved.title} (${newClassId}) tại ${resolved.room}`, 'manager@sportscenter.vn');
  addNotification('Lớp Học Mới Được Mở', `Lớp học "${resolved.title}" đã được xếp lịch tại phòng ${resolved.room}.`, 'CLASS', newClassId);

  closeManagerModal();
  showToast('Tạo lớp học thành công (ERD Compliant)', `Đã tạo lớp ${resolved.title} xếp phòng ${resolved.room}!`, 'success');
  return false;
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderManagerWebApp !== 'undefined') _targetGlobal.renderManagerWebApp = renderManagerWebApp;
  if (typeof getManagerTabTitle !== 'undefined') _targetGlobal.getManagerTabTitle = getManagerTabTitle;
  if (typeof renderManagerDashboard !== 'undefined') _targetGlobal.renderManagerDashboard = renderManagerDashboard;
  if (typeof renderManagerMembers !== 'undefined') _targetGlobal.renderManagerMembers = renderManagerMembers;
  if (typeof renderManagerPackages !== 'undefined') _targetGlobal.renderManagerPackages = renderManagerPackages;
  if (typeof renderManagerClasses !== 'undefined') _targetGlobal.renderManagerClasses = renderManagerClasses;
  if (typeof renderManagerStaff !== 'undefined') _targetGlobal.renderManagerStaff = renderManagerStaff;
  if (typeof renderManagerFinances !== 'undefined') _targetGlobal.renderManagerFinances = renderManagerFinances;
  if (typeof renderCreatePackageModal !== 'undefined') _targetGlobal.renderCreatePackageModal = renderCreatePackageModal;
  if (typeof renderCreateClassModal !== 'undefined') _targetGlobal.renderCreateClassModal = renderCreateClassModal;
  if (typeof renderRenewMemberModal !== 'undefined') _targetGlobal.renderRenewMemberModal = renderRenewMemberModal;
  if (typeof initChartsIfNeeded !== 'undefined') _targetGlobal.initChartsIfNeeded = initChartsIfNeeded;
  if (typeof setManagerAuditSearch !== 'undefined') _targetGlobal.setManagerAuditSearch = setManagerAuditSearch;
  if (typeof renderManagerAuditLogs !== 'undefined') _targetGlobal.renderManagerAuditLogs = renderManagerAuditLogs;
  if (typeof setManagerMemberSearch !== 'undefined') _targetGlobal.setManagerMemberSearch = setManagerMemberSearch;
  if (typeof openManagerModal !== 'undefined') _targetGlobal.openManagerModal = openManagerModal;
  if (typeof closeManagerModal !== 'undefined') _targetGlobal.closeManagerModal = closeManagerModal;
  if (typeof openRenewModal !== 'undefined') _targetGlobal.openRenewModal = openRenewModal;
  if (typeof confirmManagerRenew !== 'undefined') _targetGlobal.confirmManagerRenew = confirmManagerRenew;
  if (typeof handleCreatePackageSubmit !== 'undefined') _targetGlobal.handleCreatePackageSubmit = handleCreatePackageSubmit;
  if (typeof handleCreateClassSubmit !== 'undefined') _targetGlobal.handleCreateClassSubmit = handleCreateClassSubmit;
}
