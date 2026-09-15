/**
 * Sports Center Management System (SWP391 - FA26 Topic 4)
 * Theme: Modern Clean Light UI (Stripe/Linear minimalist style, white background, no clutter/icons)
 */

const DEFAULT_DATA = {
  demoAccounts: [
    {
      role: 'MANAGER',
      roleLabel: 'Center Manager (Quản lý / Admin)',
      email: 'manager@sportscenter.vn',
      password: '123',
      name: 'Nguyễn Văn Quản Lý',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      desc: 'Quản trị nhân sự, gói tập & doanh thu'
    },
    {
      role: 'RECEPTIONIST',
      roleLabel: 'Receptionist (Nhân viên Lễ tân)',
      email: 'letan@sportscenter.vn',
      password: '123',
      name: 'Lê Ngọc Lễ Tân',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      desc: 'Check-in cổng & bán gói tập POS'
    },
    {
      role: 'COACH',
      roleLabel: 'Coach (Huấn luyện viên)',
      email: 'coach.nam@sportscenter.vn',
      password: '123',
      name: 'Trần Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      desc: 'Quản lý lịch dạy & điểm danh'
    },
    {
      role: 'MEMBER',
      roleLabel: 'Member (Học viên / Khách hàng)',
      email: 'trang.pham@gmail.com',
      password: '123',
      name: 'Phạm Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Đặt lớp & mua gói tập cá nhân'
    }
  ],
  packages: [
    {
      id: 'PKG01',
      name: 'Standard Gym & Cardio',
      durationDays: 30,
      price: 650000,
      description: 'Truy cập không giới hạn khu vực Gym & Cardio từ 6h00 đến 22h00 hàng ngày.',
      features: ['Tập luyện tự do toàn bộ máy Gym', 'Miễn phí tủ đồ & phòng tắm', 'Đo InBody miễn phí 1 lần/tháng', 'Nước uống lọc miễn phí'],
      popular: false
    },
    {
      id: 'PKG02',
      name: 'VIP All-Access Pass',
      durationDays: 90,
      price: 2450000,
      description: 'Gói toàn diện Gym + tất cả lớp Yoga, Zumba, Boxing và xông hơi Sauna.',
      features: ['Không giới hạn Gym + Yoga + Boxing + Zumba', 'Miễn phí phòng xông hơi Sauna', 'Khăn tập & tủ đồ VIP riêng', 'Tặng 2 buổi kèm 1-1 cùng HLV'],
      popular: true
    },
    {
      id: 'PKG03',
      name: 'Yoga & Pilates Master',
      durationDays: 30,
      price: 1200000,
      description: 'Dành riêng cho tín đồ Yoga, Thiền định và Pilates cùng giảng viên quốc tế.',
      features: ['20 lớp Yoga & Pilates/tháng', 'Thảm tập cao cấp kháng khuẩn', 'Trà thảo mộc thanh lọc cơ thể', 'Ưu tiên đặt chỗ lớp sớm'],
      popular: false
    },
    {
      id: 'PKG04',
      name: 'Personal Training (PT 1-1) 12 Buổi',
      durationDays: 45,
      price: 4800000,
      description: 'Kèm riêng 1-1 cùng HLV chuyên nghiệp, giáo án dinh dưỡng riêng biệt.',
      features: ['12 buổi kèm 1-1 (60 phút/buổi)', 'Lên thực đơn & bài tập cá nhân hóa', 'Đo InBody hàng tuần', 'Cam kết đạt mục tiêu thể hình'],
      popular: false
    }
  ],
  members: [
    {
      id: 'MEM101',
      name: 'Phạm Thu Trang',
      email: 'trang.pham@gmail.com',
      phone: '0912345678',
      gender: 'Nữ',
      activePackage: 'VIP All-Access Pass',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM102',
      name: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@gmail.com',
      phone: '0987654321',
      gender: 'Nam',
      activePackage: 'Standard Gym & Cardio',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM103',
      name: 'Hoàng Minh Châu',
      email: 'chau.hoang@gmail.com',
      phone: '0905123987',
      gender: 'Nữ',
      activePackage: 'Yoga & Pilates Master',
      packageId: 'PKG03',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'EXPIRED',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM104',
      name: 'Vũ Quốc Bảo',
      email: 'bao.vu@gmail.com',
      phone: '0934567890',
      gender: 'Nam',
      activePackage: 'Personal Training (PT 1-1) 12 Buổi',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  classes: [
    {
      id: 'CLS01',
      name: 'Yoga Vinyasa Flow Buổi Sáng',
      sport: 'Yoga & Meditation',
      room: 'Studio 1 (Tầng 2)',
      coachName: 'Trần Hoàng Nam',
      dayOfWeek: 'Thứ 2, 4, 6',
      time: '06:30 - 07:30',
      maxCapacity: 15,
      bookedSeats: 12
    },
    {
      id: 'CLS02',
      name: 'Boxing Fundamentals & Cardio',
      sport: 'Boxing & Muay Thai',
      room: 'Ring Zone A (Tầng 2)',
      coachName: 'Võ Minh Chiến',
      dayOfWeek: 'Thứ 3, 5, 7',
      time: '18:00 - 19:15',
      maxCapacity: 12,
      bookedSeats: 12
    },
    {
      id: 'CLS03',
      name: 'Zumba Dance Fitness Năng Động',
      sport: 'Zumba & Dance Fit',
      room: 'Studio 2 (Tầng 3)',
      coachName: 'Nguyễn Thảo Ly',
      dayOfWeek: 'Thứ 2, 4, 6',
      time: '19:30 - 20:30',
      maxCapacity: 20,
      bookedSeats: 16
    }
  ],
  checkins: [
    {
      id: 'CHK101',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      time: '06:45',
      gate: 'Cổng Turnstile A (Gym)',
      packageName: 'VIP All-Access Pass',
      status: 'VALID'
    },
    {
      id: 'CHK102',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      time: '07:15',
      gate: 'Cổng Turnstile A (Gym)',
      packageName: 'Standard Gym & Cardio',
      status: 'VALID'
    }
  ],
  invoices: [
    {
      id: 'INV1001',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      packageName: 'VIP All-Access Pass (90 Ngày)',
      amount: 2450000,
      paymentMethod: 'VNPAY_QR',
      date: '2026-08-01',
      status: 'PAID'
    },
    {
      id: 'INV1002',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      packageName: 'Standard Gym & Cardio (30 Ngày)',
      amount: 650000,
      paymentMethod: 'CASH',
      date: '2026-08-15',
      status: 'PAID'
    },
    {
      id: 'INV1003',
      memberId: 'MEM104',
      memberName: 'Vũ Quốc Bảo',
      packageName: 'Personal Training (PT 1-1) 12 Buổi',
      amount: 4800000,
      paymentMethod: 'CREDIT_CARD',
      date: '2026-08-20',
      status: 'PAID'
    }
  ]
};

function getDataSource() {
  if (typeof window !== 'undefined' && window.INITIAL_DATA) {
    return JSON.parse(JSON.stringify(window.INITIAL_DATA));
  }
  if (typeof INITIAL_DATA !== 'undefined') {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

let appState = {
  isAuthenticated: false,
  authTab: 'login', // 'login' | 'register' | 'forgot'
  currentRole: 'MANAGER',
  currentTab: 'dashboard',
  currentUser: null,
  otpSent: false,
  data: getDataSource()
};

function showToast(title, message, type) {
  type = type || 'success';
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-900 text-white',
    warning: 'bg-amber-600 text-white'
  };
  const toast = document.createElement('div');
  toast.className = `flex items-center justify-between p-4 rounded-xl shadow-lg border border-slate-200/20 mb-3 ${bgColors[type] || 'bg-slate-900 text-white'} animate-fade-in transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `
    <div>
      <div class="font-semibold text-sm leading-tight">${title}</div>
      <div class="text-xs opacity-90 mt-0.5">${message}</div>
    </div>
    <button type="button" onclick="this.parentElement.remove()" class="ml-4 opacity-70 hover:opacity-100 text-lg font-bold">&times;</button>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setAuthTab(tab) {
  appState.authTab = tab;
  renderApp();
}

function quickLoginAs(role) {
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.role === role) : null;
  appState.isAuthenticated = true;
  appState.currentRole = role;
  appState.currentUser = {
    id: role === 'MEMBER' ? 'MEM101' : 'USR_' + role,
    name: acc ? acc.name : (role === 'MANAGER' ? 'Nguyễn Văn Quản Lý' : (role === 'RECEPTIONIST' ? 'Lê Ngọc Lễ Tân' : (role === 'COACH' ? 'Trần Hoàng Nam' : 'Phạm Thu Trang'))),
    email: acc ? acc.email : `${role.toLowerCase()}@sportscenter.vn`,
    role: role,
    avatar: acc ? acc.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  if (role === 'MANAGER') appState.currentTab = 'dashboard';
  else if (role === 'RECEPTIONIST') appState.currentTab = 'reception-checkin';
  else if (role === 'COACH') appState.currentTab = 'coach-schedule';
  else if (role === 'MEMBER') appState.currentTab = 'member-overview';

  renderApp();
}

function switchRole(newRole) {
  showToast('Thông báo', 'Vui lòng đăng xuất trước khi đổi sang tài khoản hoặc vai trò khác!', 'warning');
}

function switchTab(tabName) {
  appState.currentTab = tabName;
  renderApp();
}

function handleLogout() {
  appState.isAuthenticated = false;
  appState.currentUser = null;
  appState.authTab = 'login';
  renderApp();
}

function getRoleLabel(role) {
  switch (role) {
    case 'MANAGER': return 'Quản Lý Trung Tâm (Manager)';
    case 'RECEPTIONIST': return 'Nhân Viên Lễ Tân (Receptionist)';
    case 'COACH': return 'Huấn Luyện Viên (Coach)';
    case 'MEMBER': return 'Hội Viên (Member)';
    default: return role;
  }
}

// ==========================================
// AUTH SCREEN - MODERN CLEAN WHITE UI
// ==========================================
function renderAuthScreen() {
  const currentTab = appState.authTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <!-- Subtle top light accent -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600"></div>

      <!-- Clean Centered Header -->
      <div class="text-center mb-6 max-w-lg">
        <div class="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Sports Center Management System
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Hệ Thống Quản Lý Trung Tâm Thể Thao
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-1">
          SWP391 FA26 Topic 04 &bull; GVHD: MinhTTH5
        </p>
      </div>

      <!-- Clean White Card -->
      <div class="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8">
        
        <!-- Segmented Tab Bar -->
        ${currentTab !== 'forgot' ? `
          <div class="flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 mb-6">
            <button type="button" onclick="setAuthTab('login')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Nhập
            </button>
            <button type="button" onclick="setAuthTab('register')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Ký Tài Khoản
            </button>
          </div>
        ` : ''}

        ${currentTab === 'login' ? renderLoginForm() : (currentTab === 'register' ? renderRegisterForm() : renderForgotPasswordForm())}
      </div>

      <div class="mt-6 text-center text-xs text-slate-400">
        FPT University &bull; Software Development Project (SWP391)
      </div>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <div class="space-y-5">
      <!-- 1-Click Role Quick Logins (Clean Cards, No Emojis, No Icons) -->
      <div>
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Đăng Nhập Nhanh Theo Vai Trò
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="quickLoginAs('MANAGER')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Center Manager</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Quản trị & Doanh thu</div>
          </button>
          <button type="button" onclick="quickLoginAs('RECEPTIONIST')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Lễ Tân Quầy</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Check-in, Bán gói POS</div>
          </button>
          <button type="button" onclick="quickLoginAs('COACH')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Huấn Luyện Viên</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Lịch dạy & Điểm danh</div>
          </button>
          <button type="button" onclick="quickLoginAs('MEMBER')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Hội Viên</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Đặt lớp & Mua gói tập</div>
          </button>
        </div>
      </div>

      <div class="flex items-center my-4">
        <div class="flex-1 border-t border-slate-200"></div>
        <span class="px-3 text-[11px] text-slate-600 uppercase font-semibold">Hoặc đăng nhập bằng tài khoản</span>
        <div class="flex-1 border-t border-slate-200"></div>
      </div>

      <!-- Clean Form Inputs (Without internal icons) -->
      <form onsubmit="return handleFormLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Tài Khoản</label>
          <input type="email" id="login-email" required value="manager@sportscenter.vn" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm" placeholder="name@sportscenter.vn" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-xs font-semibold text-slate-700 uppercase">Mật Khẩu</label>
            <button type="button" onclick="setAuthTab('forgot')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Quên mật khẩu?</button>
          </div>
          <input type="password" id="login-password" required value="123" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm" placeholder="Nhập mật khẩu" />
        </div>

        <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition">
          Đăng Nhập Vào Hệ Thống
        </button>
      </form>
    </div>
  `;
}

function renderRegisterForm() {
  return `
    <div class="space-y-4">
      <form onsubmit="return handleFormRegister(event)" class="space-y-3.5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ & Tên *</label>
            <input type="text" id="reg-name" required placeholder="Nguyễn Văn A" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Số Điện Thoại *</label>
            <input type="tel" id="reg-phone" required placeholder="09xxxxxxxx" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email *</label>
          <input type="email" id="reg-email" required placeholder="example@gmail.com" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu *</label>
            <input type="password" id="reg-pwd" required placeholder="Tối thiểu 6 ký tự" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Xác Nhận MK *</label>
            <input type="password" id="reg-cpwd" required placeholder="Nhập lại mật khẩu" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Giới Tính</label>
            <select id="reg-gender" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mục Tiêu</label>
            <select id="reg-goal" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
              <option>Giảm cân & Săn chắc</option>
              <option>Tăng cơ & Thể lực</option>
              <option>Tập Yoga & Dẻo dai</option>
            </select>
          </div>
        </div>

        <button type="submit" class="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition">
          Tạo Tài Khoản & Bắt Đầu
        </button>
      </form>
    </div>
  `;
}

function renderForgotPasswordForm() {
  return `
    <div class="space-y-5">
      <div>
        <h3 class="text-xl font-bold text-slate-900">Quên Mật Khẩu</h3>
        <p class="text-xs text-slate-500 mt-1">Nhập email đăng ký để nhận mã OTP xác thực và đặt lại mật khẩu</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Tài Khoản</label>
          <div class="flex gap-2">
            <input type="email" id="forgot-email" required placeholder="nhap-email@sportscenter.vn" class="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" value="trang.pham@gmail.com" />
            <button type="button" onclick="handleSendOtpBtn()" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition flex-shrink-0">
              Gửi mã OTP
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã OTP Xác Thực (6 số)</label>
          <input type="text" id="forgot-otp" placeholder="Nhập mã OTP (VD: 889966)" maxlength="6" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 tracking-widest font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          <div class="text-[11px] text-slate-500 mt-1">Mã OTP mẫu thử nghiệm: <span class="font-mono text-indigo-600 font-bold">889966</span></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu Mới</label>
            <input type="password" id="forgot-new-pwd" placeholder="Mật khẩu mới" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Xác Nhận MK</label>
            <input type="password" id="forgot-confirm-pwd" placeholder="Nhập lại MK" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
          </div>
        </div>

        <button type="button" onclick="handleVerifyAndResetPassword()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
          Xác Thực & Đặt Lại Mật Khẩu
        </button>

        <div class="text-center pt-2">
          <button type="button" onclick="setAuthTab('login')" class="text-xs text-slate-600 hover:text-slate-900 font-medium">
            &larr; Quay lại màn hình Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleSendOtpBtn() {
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) {
    showToast('Lỗi', 'Vui lòng nhập email tài khoản!', 'error');
    return;
  }
  showToast('Đã gửi mã OTP', `Mã xác thực đã được gửi tới ${email} (Mã demo: 889966)`, 'info');
  const otpInput = document.getElementById('forgot-otp');
  if (otpInput) otpInput.value = '889966';
}

function handleVerifyAndResetPassword() {
  const otp = document.getElementById('forgot-otp')?.value.trim();
  if (!otp) {
    showToast('Chưa nhập OTP', 'Vui lòng nhập mã OTP để xác thực!', 'warning');
    return;
  }
  showToast('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
  setAuthTab('login');
}

function handleFormLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const email = emailInput ? emailInput.value.trim() : '';
  
  let role = 'MEMBER';
  if (email.includes('manager') || email.includes('admin')) role = 'MANAGER';
  else if (email.includes('letan') || email.includes('reception')) role = 'RECEPTIONIST';
  else if (email.includes('coach') || email.includes('nam')) role = 'COACH';

  quickLoginAs(role);
  return false;
}

function handleFormRegister(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('reg-name')?.value || 'Học Viên Mới';
  const email = document.getElementById('reg-email')?.value || 'newmember@gmail.com';
  const phone = document.getElementById('reg-phone')?.value || '0901234567';
  const pwd = document.getElementById('reg-pwd')?.value || '';
  const cpwd = document.getElementById('reg-cpwd')?.value || '';

  if (pwd && cpwd && pwd !== cpwd) {
    showToast('Lỗi mật khẩu', 'Mật khẩu xác nhận không khớp!', 'error');
    return false;
  }

  const newMember = {
    id: 'MEM' + (100 + (appState.data.members ? appState.data.members.length : 0) + 1),
    name: name,
    email: email,
    phone: phone,
    activePackage: 'Chưa kích hoạt gói',
    packageId: null,
    startDate: '-',
    endDate: '-',
    status: 'PENDING_PAYMENT',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gender: document.getElementById('reg-gender')?.value || 'Nam',
    dob: '2000-01-01',
    address: 'Hà Nội'
  };

  if (!appState.data.members) appState.data.members = [];
  appState.data.members.unshift(newMember);

  appState.isAuthenticated = true;
  appState.currentRole = 'MEMBER';
  appState.currentUser = {
    id: newMember.id,
    name: newMember.name,
    email: newMember.email,
    role: 'MEMBER',
    avatar: newMember.avatar
  };
  appState.currentTab = 'member-packages';

  renderApp();
  return false;
}

// ==========================================
// MAIN DASHBOARD LAYOUT - CLEAN WHITE THEME
// ==========================================
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (!appState.isAuthenticated) {
    root.innerHTML = renderAuthScreen();
    return;
  }

  root.innerHTML = `
    <div class="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <!-- Clean Sidebar Navigation -->
      ${renderSidebar()}

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        <!-- Top Navigation Bar -->
        ${renderHeader()}

        <!-- Dynamic Body Page Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          ${renderCurrentContent()}
        </main>
      </div>
    </div>
  `;

  initChartsIfNeeded();
}

function getCurrentTabTitle(tab) {
  const titles = {
    'dashboard': 'Báo Cáo Tổng Quan & Thống Kê',
    'manager-members': 'Quản Lý Danh Sách Hội Viên',
    'manager-packages': 'Quản Lý Danh Mục Gói Tập',
    'manager-classes': 'Quản Lý Lớp Học & Lịch Dạy',
    'manager-finances': 'Báo Cáo Doanh Thu & Hóa Đơn',
    'reception-checkin': 'Quầy Check-in Cổng Tự Động',
    'reception-register': 'Đăng Ký & Bán Gói Tập POS',
    'reception-members': 'Tra Cứu Thông Tin Hội Viên',
    'reception-invoices': 'Lịch Sử Hóa Đơn Thu Ngân',
    'coach-schedule': 'Lịch Dạy Hàng Tuần',
    'coach-attendance': 'Điểm Danh Học Viên Lớp Học',
    'coach-classes': 'Danh Sách Lớp Học Phụ Trách',
    'member-overview': 'Tổng Quan Thông Tin Cá Nhân',
    'member-packages': 'Mua & Gia Hạn Gói Tập',
    'member-booking': 'Đặt Chỗ Lớp Học Thể Thao',
    'member-schedule': 'Lịch Tập & Lớp Đã Đăng Ký'
  };
  return titles[tab] || 'Hệ Thống Quản Lý';
}

function renderHeader() {
  const roleLabel = getRoleLabel(appState.currentRole);
  const tabTitle = getCurrentTabTitle(appState.currentTab);

  return `
    <header class="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs">
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          ${roleLabel}
        </span>
        <span class="hidden sm:inline text-slate-300">/</span>
        <span class="hidden sm:inline text-xs font-semibold text-slate-700">${tabTitle}</span>
      </div>

      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-3">
          <img src="${appState.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" class="w-8 h-8 rounded-full border border-slate-200 object-cover" />
          <div class="hidden sm:block text-left">
            <div class="text-xs font-bold text-slate-900">${appState.currentUser?.name || 'Người dùng'}</div>
            <div class="text-[11px] text-slate-500">${appState.currentUser?.email || ''}</div>
          </div>
        </div>

        <button type="button" onclick="handleLogout()" title="Đăng Xuất" class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition">
          Đăng Xuất
        </button>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const role = appState.currentRole;
  const currentTab = appState.currentTab;

  let menuItems = [];

  if (role === 'MANAGER') {
    menuItems = [
      { id: 'dashboard', label: 'Báo Cáo Tổng Quan' },
      { id: 'manager-members', label: 'Quản Lý Hội Viên' },
      { id: 'manager-packages', label: 'Danh Mục Gói Tập' },
      { id: 'manager-classes', label: 'Lớp Học & Lịch Dạy' },
      { id: 'manager-finances', label: 'Doanh Thu & Hóa Đơn' }
    ];
  } else if (role === 'RECEPTIONIST') {
    menuItems = [
      { id: 'reception-checkin', label: 'Quầy Check-in Cổng' },
      { id: 'reception-register', label: 'Đăng Ký & Bán Gói POS' },
      { id: 'reception-members', label: 'Tra Cứu Hội Viên' },
      { id: 'reception-invoices', label: 'Hóa Đơn Thu Ngân' }
    ];
  } else if (role === 'COACH') {
    menuItems = [
      { id: 'coach-schedule', label: 'Lịch Dạy Hàng Tuần' },
      { id: 'coach-attendance', label: 'Điểm Danh Lớp Học' },
      { id: 'coach-classes', label: 'Danh Sách Lớp Phụ Trách' }
    ];
  } else if (role === 'MEMBER') {
    menuItems = [
      { id: 'member-overview', label: 'Tổng Quan Cá Nhân' },
      { id: 'member-packages', label: 'Mua / Đổi Gói Tập' },
      { id: 'member-booking', label: 'Đặt Chỗ Lớp Học' },
      { id: 'member-schedule', label: 'Lịch Tập Của Tôi' }
    ];
  }

  return `
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shadow-xs">
      <div>
        <div class="h-16 flex items-center px-6 border-b border-slate-200/80">
          <div>
            <div class="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">SPORTS CENTER</div>
            <div class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">SWP391 FA26 Topic 04</div>
          </div>
        </div>

        <nav class="p-3.5 space-y-1">
          <div class="text-[10px] font-bold text-slate-600 uppercase px-3 mb-2 tracking-wider">Menu Tính Năng</div>
          ${menuItems.map(item => `
            <button type="button" onclick="switchTab('${item.id}')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${currentTab === item.id ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'}">
              <span>${item.label}</span>
              ${currentTab === item.id ? '<span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>' : ''}
            </button>
          `).join('')}
        </nav>
      </div>

      <div class="p-4 border-t border-slate-200/80">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <div class="text-xs font-semibold text-slate-800">Sports Center System</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Topic 04 &bull; FA26</div>
        </div>
      </div>
    </aside>
  `;
}

function renderCurrentContent() {
  const tab = appState.currentTab;

  if (tab === 'dashboard') return renderManagerDashboard();
  if (tab === 'manager-members') return renderManagerMembers();
  if (tab === 'manager-packages') return renderPackagesManagement();
  if (tab === 'manager-classes') return renderClassesManagement();
  if (tab === 'manager-finances') return renderFinancialReports();

  if (tab === 'reception-checkin') return renderReceptionCheckin();
  if (tab === 'reception-register') return renderReceptionRegisterPOS();
  if (tab === 'reception-members') return renderManagerMembers();
  if (tab === 'reception-invoices') return renderFinancialReports();

  if (tab === 'coach-schedule') return renderCoachSchedule();
  if (tab === 'coach-attendance') return renderCoachAttendance();
  if (tab === 'coach-classes') return renderClassesManagement();

  if (tab === 'member-overview') return renderMemberOverview();
  if (tab === 'member-packages') return renderPackagesManagement();
  if (tab === 'member-booking') return renderMemberBooking();
  if (tab === 'member-schedule') return renderMemberSchedule();

  return renderManagerDashboard();
}

// ==========================================
// FLOW 1: USER & MEMBERSHIP MANAGEMENT
// ==========================================
function renderManagerDashboard() {
  const totalRevenue = (appState.data.invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const activeMembers = (appState.data.members || []).filter(m => m.status === 'ACTIVE').length;
  const todayClasses = (appState.data.classes || []).length;
  const checkinsCount = (appState.data.checkins || []).length;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Báo Cáo Tổng Quan Trung Tâm</h2>
          <p class="text-xs text-slate-500 mt-0.5">Theo dõi số lượng hội viên, lịch học và doanh thu trong ngày</p>
        </div>
        <div class="flex space-x-2">
          <button type="button" onclick="switchTab('reception-checkin')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm">
            Cổng Check-in
          </button>
          <button type="button" onclick="switchTab('reception-register')" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm">
            Đăng Ký Hội Viên Mới
          </button>
        </div>
      </div>

      <!-- Clean KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <span class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Tổng Doanh Thu</span>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">${totalRevenue.toLocaleString('vi-VN')} đ</div>
          <div class="text-[11px] text-emerald-600 font-medium mt-1">+18.5% so với tháng trước</div>
        </div>

        <div class="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <span class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Hội Viên Đang Hoạt Động</span>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">${activeMembers} / ${(appState.data.members || []).length}</div>
          <div class="text-[11px] text-slate-500 mt-1">${(appState.data.members || []).filter(m => m.status === 'EXPIRED').length} hội viên đã/sắp hết hạn</div>
        </div>

        <div class="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <span class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Lớp Học Trong Tuần</span>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">${todayClasses} Lớp</div>
          <div class="text-[11px] text-slate-500 mt-1">4 Huấn luyện viên chính thức</div>
        </div>

        <div class="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
          <span class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Lượt Check-in Hôm Nay</span>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">${checkinsCount} Lượt</div>
          <div class="text-[11px] text-emerald-600 font-medium mt-1">Cổng hoạt động bình thường</div>
        </div>
      </div>

      <!-- Chart & Recent Activities -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
          <div class="h-64 relative">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Lịch Sử Check-in Mới Nhất</h3>
          <div class="space-y-2.5 max-h-64 overflow-y-auto">
            ${(appState.data.checkins || []).slice(0, 5).map(c => `
              <div class="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <div class="font-semibold text-slate-900">${c.memberName}</div>
                  <div class="text-[11px] text-slate-500">${c.packageName}</div>
                </div>
                <div class="text-right">
                  <div class="text-indigo-600 font-mono font-bold">${c.time}</div>
                  <div class="text-[10px] text-slate-400">${c.gate}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderManagerMembers() {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Danh Sách Hội Viên</h2>
          <p class="text-xs text-slate-500 mt-0.5">Theo dõi thông tin gói tập, ngày gia hạn và trạng thái kích hoạt</p>
        </div>
        <button type="button" onclick="switchTab('reception-register')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm">
          Thêm Hội Viên & Bán Gói
        </button>
      </div>

      <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th class="p-4">Mã HV & Họ Tên</th>
                <th class="p-4">Liên Hệ</th>
                <th class="p-4">Gói Tập Hiện Tại</th>
                <th class="p-4">Thời Hạn Gói</th>
                <th class="p-4">Trạng Thái</th>
                <th class="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${(appState.data.members || []).map(m => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="p-4">
                    <div class="flex items-center space-x-3">
                      <img src="${m.avatar}" class="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      <div>
                        <div class="font-bold text-slate-900 text-sm">${m.name}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${m.id} &bull; ${m.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="font-medium text-slate-800">${m.email}</div>
                    <div class="text-[11px] text-slate-500">${m.phone}</div>
                  </td>
                  <td class="p-4">
                    <span class="font-semibold text-slate-900">${m.activePackage}</span>
                  </td>
                  <td class="p-4">
                    <div class="font-mono text-slate-600">${m.startDate} &rarr; ${m.endDate}</div>
                  </td>
                  <td class="p-4">
                    ${m.status === 'ACTIVE' ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang tập</span>' : (m.status === 'EXPIRED' ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Hết hạn</span>' : '<span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chờ TT</span>')}
                  </td>
                  <td class="p-4 text-center">
                    <button type="button" onclick="handleRenewMember('${m.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition">
                      Gia Hạn
                    </button>
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

function handleRenewMember(memberId) {
  const m = (appState.data.members || []).find(x => x.id === memberId);
  if (!m) return;
  m.status = 'ACTIVE';
  m.endDate = '2026-12-31';
  showToast('Gia hạn thành công', `Đã gia hạn gói tập cho hội viên ${m.name} đến 31/12/2026!`, 'success');
  renderApp();
}

function renderPackagesManagement() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Danh Mục Gói Tập Thể Thao</h2>
        <p class="text-xs text-slate-500 mt-0.5">Các gói tập tiêu chuẩn Gym, Yoga, VIP All-Access và PT Huấn luyện viên kèm riêng</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${(appState.data.packages || []).map(pkg => `
          <div class="bg-white border ${pkg.popular ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' : 'border-slate-200/90'} rounded-2xl p-6 flex flex-col justify-between relative shadow-xs">
            ${pkg.popular ? '<span class="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Phổ Biến Nhất</span>' : ''}
            <div>
              <div class="text-xs font-semibold text-indigo-600 font-mono mb-1">${pkg.id} &bull; ${pkg.durationDays} Ngày</div>
              <h3 class="text-lg font-bold text-slate-900">${pkg.name}</h3>
              <div class="text-2xl font-extrabold text-slate-900 mt-2">${pkg.price.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-500">VNĐ</span></div>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">${pkg.description}</p>
              
              <div class="border-t border-slate-100 my-4"></div>
              <div class="space-y-2">
                ${(pkg.features || []).map(f => `
                  <div class="flex items-center text-xs text-slate-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0"></span>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <button type="button" onclick="handleBuyPackage('${pkg.id}')" class="mt-6 w-full py-2.5 rounded-xl ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium'} text-xs transition">
              ${appState.currentRole === 'MEMBER' ? 'Đăng Ký Mua Gói' : 'Bán Gói Này'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleBuyPackage(pkgId) {
  const pkg = (appState.data.packages || []).find(p => p.id === pkgId);
  if (!pkg) return;

  const invoiceId = 'INV' + (1000 + (appState.data.invoices ? appState.data.invoices.length : 0) + 1);
  const newInvoice = {
    id: invoiceId,
    memberId: appState.currentUser?.id || 'MEM101',
    memberName: appState.currentUser?.name || 'Phạm Thu Trang',
    packageName: pkg.name,
    amount: pkg.price,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'VNPAY_QR',
    status: 'PAID'
  };

  if (!appState.data.invoices) appState.data.invoices = [];
  appState.data.invoices.unshift(newInvoice);

  const m = (appState.data.members || []).find(x => x.id === (appState.currentUser?.id || 'MEM101'));
  if (m) {
    m.activePackage = pkg.name;
    m.packageId = pkg.id;
    m.status = 'ACTIVE';
    m.startDate = new Date().toISOString().split('T')[0];
    const exp = new Date();
    exp.setDate(exp.getDate() + pkg.durationDays);
    m.endDate = exp.toISOString().split('T')[0];
  }

  showToast('Đăng ký gói thành công', `Đã thanh toán gói ${pkg.name} (${pkg.price.toLocaleString('vi-VN')} đ) & kích hoạt tài khoản!`, 'success');
  renderApp();
}

// ==========================================
// FLOW 2: CLASS BOOKING & SCHEDULE MANAGEMENT
// ==========================================
function renderClassesManagement() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Lịch Lớp Học Thể Thao</h2>
        <p class="text-xs text-slate-500 mt-0.5">Danh sách các lớp Yoga, Zumba, Boxing và Huấn luyện viên phụ trách</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${(appState.data.classes || []).map(cls => `
          <div class="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div class="flex justify-between items-start">
                <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">${cls.sport}</span>
                <span class="text-xs font-mono text-slate-500">${cls.room}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 mt-3">${cls.name}</h3>
              
              <div class="mt-4 space-y-2 text-xs text-slate-600">
                <div>Thời gian: <span class="font-medium text-slate-900">${cls.dayOfWeek} (${cls.time})</span></div>
                <div>HLV phụ trách: <span class="font-semibold text-slate-900">${cls.coachName}</span></div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Chỗ trống:</span>
                  <span class="font-bold ${cls.bookedSeats >= cls.maxCapacity ? 'text-rose-600' : 'text-emerald-600'}">${cls.bookedSeats} / ${cls.maxCapacity} chỗ</span>
                </div>
              </div>
            </div>

            <div class="mt-5">
              ${appState.currentRole === 'MEMBER' ? `
                <button type="button" onclick="handleBookClass('${cls.id}')" ${cls.bookedSeats >= cls.maxCapacity ? 'disabled' : ''} class="w-full py-2.5 rounded-xl ${cls.bookedSeats >= cls.maxCapacity ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'} text-xs transition shadow-sm">
                  ${cls.bookedSeats >= cls.maxCapacity ? 'Lớp Đã Đầy' : 'Đặt Chỗ Ngay'}
                </button>
              ` : `
                <button type="button" onclick="handleCheckClassAttendance('${cls.id}')" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition">
                  Xem Danh Sách Điểm Danh
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleBookClass(classId) {
  const cls = (appState.data.classes || []).find(c => c.id === classId);
  if (!cls) return;
  if (cls.bookedSeats >= cls.maxCapacity) {
    showToast('Hết chỗ', 'Lớp học đã đủ số lượng học viên đăng ký!', 'error');
    return;
  }
  cls.bookedSeats += 1;
  showToast('Đặt chỗ thành công', `Bạn đã đặt chỗ thành công lớp ${cls.name} (${cls.time})!`, 'success');
  renderApp();
}

function handleCheckClassAttendance(classId) {
  appState.currentTab = 'coach-attendance';
  renderApp();
}

function renderCoachSchedule() {
  return renderClassesManagement();
}

function renderCoachAttendance() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Điểm Danh Lớp Học</h2>
        <p class="text-xs text-slate-500 mt-0.5">Danh sách học viên đăng ký lớp và ghi nhận điểm danh vào lớp</p>
      </div>

      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Yoga Vinyasa Flow Buổi Sáng</h3>
            <div class="text-xs text-slate-500 mt-0.5">HLV: Trần Hoàng Nam &bull; Phòng Studio 1 &bull; 06:30 - 07:30</div>
          </div>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">12 Học Viên Đã Đặt Chỗ</span>
        </div>

        <div class="space-y-2">
          ${(appState.data.members || []).slice(0, 4).map(m => `
            <div class="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div class="flex items-center space-x-3">
                <img src="${m.avatar}" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
                <div>
                  <div class="font-bold text-slate-900 text-xs">${m.name}</div>
                  <div class="text-[11px] text-slate-500 font-mono">${m.id} &bull; ${m.phone}</div>
                </div>
              </div>

              <div class="flex space-x-2">
                <button type="button" onclick="showToast('Điểm danh', 'Ghi nhận có mặt cho ${m.name}', 'success')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition">
                  Có Mặt
                </button>
                <button type="button" onclick="showToast('Vắng', 'Ghi nhận vắng mặt cho ${m.name}', 'warning')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition">
                  Vắng
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// FLOW 3: PAYMENT & FINANCIAL REPORTS
// ==========================================
function renderFinancialReports() {
  const total = (appState.data.invoices || []).reduce((s, i) => s + (i.amount || 0), 0);

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Báo Cáo Doanh Thu & Hóa Đơn Thu Ngân</h2>
          <p class="text-xs text-slate-500 mt-0.5">Lịch sử thu tiền bán gói tập, thanh toán QR/POS và báo cáo tài chính</p>
        </div>
        <div class="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium text-xs">
          Tổng Doanh Thu: <span class="font-bold text-emerald-900 text-sm ml-1">${total.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th class="p-4">Mã Hóa Đơn</th>
                <th class="p-4">Hội Viên</th>
                <th class="p-4">Gói Dịch Vụ</th>
                <th class="p-4">Số Tiền</th>
                <th class="p-4">Hình Thức</th>
                <th class="p-4">Ngày Xuất</th>
                <th class="p-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${(appState.data.invoices || []).map(inv => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="p-4 font-mono font-bold text-indigo-600">${inv.id}</td>
                  <td class="p-4">
                    <div class="font-bold text-slate-900">${inv.memberName}</div>
                    <div class="text-[11px] text-slate-500 font-mono">${inv.memberId}</div>
                  </td>
                  <td class="p-4 text-slate-800 font-medium">${inv.packageName}</td>
                  <td class="p-4 font-bold text-emerald-700 font-mono">${(inv.amount || 0).toLocaleString('vi-VN')} đ</td>
                  <td class="p-4 font-mono text-[11px] text-slate-600">${inv.paymentMethod || inv.method || 'VNPAY_QR'}</td>
                  <td class="p-4 text-slate-600">${inv.date}</td>
                  <td class="p-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">${inv.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// RECEPTIONIST SPECIFIC VIEWS
// ==========================================
function renderReceptionCheckin() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Quầy Lễ Tân - Check-in Vào Cổng</h2>
        <p class="text-xs text-slate-500 mt-0.5">Quét mã QR hoặc nhập Mã Hội Viên để kiểm tra thẻ hợp lệ và mở cửa quay tự động</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gate input -->
        <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Quét Mã Thẻ Hội Viên</h3>
          <form onsubmit="return handleGateCheckinSubmit(event)" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã Hội Viên / SĐT</label>
              <input type="text" id="checkin-input" required placeholder="Nhập MEM101 hoặc SĐT" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 font-mono shadow-sm" value="MEM101" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Cổng Quét</label>
              <select id="checkin-gate" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
                <option>Cổng Turnstile A (Tầng 1 - Gym)</option>
                <option>Cổng Turnstile B (Tầng 2 - Yoga/Boxing)</option>
              </select>
            </div>

            <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition">
              Xác Thực & Mở Cổng
            </button>
          </form>

          <div class="border-t border-slate-100 pt-3">
            <div class="text-[11px] text-slate-500">Hội viên mẫu hợp lệ: <span class="font-mono text-indigo-600 font-bold">MEM101</span> (Phạm Thu Trang)</div>
          </div>
        </div>

        <!-- Recent Logs -->
        <div class="lg:col-span-2 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Lịch Sử Check-in Hôm Nay</h3>
          <div class="space-y-2.5">
            ${(appState.data.checkins || []).map(c => `
              <div class="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <div class="font-bold text-slate-900">${c.memberName} <span class="text-slate-500 font-mono text-[11px]">(${c.memberId})</span></div>
                  <div class="text-[11px] text-indigo-600 font-medium">${c.packageName}</div>
                </div>
                <div class="text-right">
                  <div class="text-slate-900 font-mono font-bold">${c.time}</div>
                  <div class="text-[10px] text-slate-500">${c.gate}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleGateCheckinSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputVal = document.getElementById('checkin-input')?.value.trim();
  const gateVal = document.getElementById('checkin-gate')?.value || 'Cổng Turnstile A';

  const member = (appState.data.members || []).find(m => m.id.toLowerCase() === (inputVal || '').toLowerCase() || m.phone === inputVal);

  if (!member) {
    showToast('Từ chối vào cổng', `Không tìm thấy thông tin hội viên ${inputVal}!`, 'error');
    return false;
  }

  if (member.status === 'EXPIRED') {
    showToast('Thẻ hết hạn', `Gói tập của hội viên ${member.name} đã hết hạn! Vui lòng gia hạn tại quầy.`, 'error');
    return false;
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  if (!appState.data.checkins) appState.data.checkins = [];
  appState.data.checkins.unshift({
    id: 'CHK' + (100 + appState.data.checkins.length + 1),
    memberId: member.id,
    memberName: member.name,
    time: timeStr,
    gate: gateVal,
    packageName: member.activePackage,
    status: 'VALID'
  });

  showToast('Cửa đã mở', `Check-in thành công cho ${member.name} (${member.activePackage})!`, 'success');
  renderApp();
  return false;
}

function renderReceptionRegisterPOS() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Đăng Ký Hội Viên & Bán Gói Tại Quầy (POS)</h2>
        <p class="text-xs text-slate-500 mt-0.5">Tạo tài khoản hội viên mới, thanh toán gói tập và in hóa đơn tại quầy</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs">
          <form onsubmit="return handlePOSRegister(event)" class="space-y-4">
            <h3 class="text-sm font-bold text-slate-900">1. Thông Tin Khách Hàng</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ & Tên *</label>
                <input type="text" id="pos-name" required placeholder="Nguyễn Văn B" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Số Điện Thoại *</label>
                <input type="tel" id="pos-phone" required placeholder="0912345678" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input type="email" id="pos-email" placeholder="khachhang@gmail.com" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Giới Tính</label>
                <select id="pos-gender" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <h3 class="text-sm font-bold text-slate-900 pt-3">2. Chọn Gói Dịch Vụ & Thanh Toán</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Gói Tập</label>
                <select id="pos-package" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
                  ${(appState.data.packages || []).map(p => `<option value="${p.id}">${p.name} - ${p.price.toLocaleString('vi-VN')} đ</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Phương Thức Thanh Toán</label>
                <select id="pos-method" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm">
                  <option value="CASH">Tiền Mặt (Cash POS)</option>
                  <option value="VNPAY_QR">Quét QR VNPAY / Chuyển Khoản</option>
                  <option value="CREDIT_CARD">Thẻ POS / Visa Master</option>
                </select>
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition">
              Tạo Hội Viên & Xuất Hóa Đơn Thu Tiền
            </button>
          </form>
        </div>

        <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-3">Quy Trình Quầy Lễ Tân</h3>
            <ol class="space-y-3 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
              <li>Thu thập thông tin cá nhân khách hàng.</li>
              <li>Tư vấn và chọn gói tập phù hợp mục tiêu.</li>
              <li>Thu tiền mặt hoặc tạo mã QR thanh toán nhanh.</li>
              <li>Hệ thống kích hoạt thẻ & cấp quyền mở cửa tự động.</li>
            </ol>
          </div>
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-indigo-700 font-medium">
            &bull; Dữ liệu tự động đồng bộ sang Báo Cáo Doanh Thu Manager.
          </div>
        </div>
      </div>
    </div>
  `;
}

function handlePOSRegister(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('pos-name')?.value || 'Hội Viên Mới';
  const phone = document.getElementById('pos-phone')?.value || '0988776655';
  const email = document.getElementById('pos-email')?.value || `${phone}@sportscenter.vn`;
  const gender = document.getElementById('pos-gender')?.value || 'Nam';
  const pkgId = document.getElementById('pos-package')?.value || 'PKG01';
  const method = document.getElementById('pos-method')?.value || 'CASH';

  const pkg = (appState.data.packages || []).find(p => p.id === pkgId);
  const newId = 'MEM' + (100 + (appState.data.members ? appState.data.members.length : 0) + 1);

  const startDate = new Date().toISOString().split('T')[0];
  const exp = new Date();
  exp.setDate(exp.getDate() + (pkg ? pkg.durationDays : 30));
  const endDate = exp.toISOString().split('T')[0];

  const newMember = {
    id: newId,
    name: name,
    email: email,
    phone: phone,
    gender: gender,
    activePackage: pkg ? pkg.name : 'Standard Gym',
    packageId: pkgId,
    startDate: startDate,
    endDate: endDate,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    dob: '1998-05-15',
    address: 'Hà Nội'
  };

  if (!appState.data.members) appState.data.members = [];
  appState.data.members.unshift(newMember);

  if (pkg) {
    if (!appState.data.invoices) appState.data.invoices = [];
    appState.data.invoices.unshift({
      id: 'INV' + (1000 + appState.data.invoices.length + 1),
      memberId: newId,
      memberName: name,
      packageName: pkg.name,
      amount: pkg.price,
      date: startDate,
      paymentMethod: method,
      status: 'PAID'
    });
  }

  showToast('Đăng ký & thu tiền thành công', `Đã tạo hội viên ${name} (${newId}) và kích hoạt gói ${pkg?.name}!`, 'success');
  switchTab('reception-checkin');
  return false;
}

// ==========================================
// MEMBER VIEWS
// ==========================================
function renderMemberOverview() {
  const m = (appState.data.members || []).find(x => x.id === (appState.currentUser?.id || 'MEM101')) || (appState.data.members ? appState.data.members[0] : null) || {
    id: 'MEM101',
    name: 'Phạm Thu Trang',
    phone: '0912345678',
    activePackage: 'VIP All-Access Pass',
    endDate: '2026-11-01',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  };

  return `
    <div class="space-y-6">
      <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${m.avatar}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
          <div>
            <div class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Thẻ Hội Viên Điện Tử</div>
            <h2 class="text-2xl font-extrabold text-slate-900">${m.name}</h2>
            <div class="text-xs text-slate-500 font-mono mt-0.5">Mã Thẻ: <span class="font-bold text-slate-800">${m.id}</span> &bull; ${m.phone}</div>
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right">
          <div class="text-[10px] text-slate-500 uppercase font-bold">Gói Tập Hiện Tại</div>
          <div class="text-base font-extrabold text-slate-900 mt-0.5">${m.activePackage}</div>
          <div class="text-xs text-slate-500 mt-1">Hạn sử dụng: <span class="text-slate-800 font-mono font-bold">${m.endDate}</span></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Mã QR Vào Cổng Tập Luyện</h3>
          <div class="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div class="w-36 h-36 bg-white p-3 rounded-xl flex items-center justify-center border border-slate-300 shadow-xs">
              <div class="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs font-bold">
                [QR_${m.id}]
              </div>
            </div>
            <div class="text-xs text-slate-500 mt-3 font-mono">Đưa mã này trước camera cổng check-in</div>
          </div>
        </div>

        <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Thao Tác Nhanh</h3>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" onclick="switchTab('member-booking')" class="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition">
              <div class="text-xs font-bold text-slate-900">Đặt Chỗ Lớp Học</div>
              <div class="text-[11px] text-slate-500 mt-1">Yoga, Zumba, Boxing</div>
            </button>
            <button type="button" onclick="switchTab('member-packages')" class="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition">
              <div class="text-xs font-bold text-slate-900">Gia Hạn / Đổi Gói</div>
              <div class="text-[11px] text-slate-500 mt-1">Nâng cấp VIP All-Access</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMemberBooking() {
  return renderClassesManagement();
}

function renderMemberSchedule() {
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Lịch Tập Đã Đặt Chỗ</h2>
        <p class="text-xs text-slate-500 mt-0.5">Các buổi học bạn đã giữ chỗ trong tuần</p>
      </div>

      <div class="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-3">
        <div class="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <div>
            <div class="font-bold text-slate-900 text-sm">Yoga Vinyasa Flow Buổi Sáng</div>
            <div class="text-xs text-slate-500 mt-0.5">HLV: Trần Hoàng Nam &bull; Studio 1 &bull; Thứ 2, 4, 6 (06:30 - 07:30)</div>
          </div>
          <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Đã Đặt Chỗ</span>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// CHART INITIALIZATION - CLEAN LIGHT THEME
// ==========================================
function initChartsIfNeeded() {
  try {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas || !window.Chart) return;

    if (window._revenueChartInstance) {
      try { window._revenueChartInstance.destroy(); } catch (e) {}
    }

    window._revenueChartInstance = new window.Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [{
          label: 'Doanh thu (Triệu VNĐ)',
          data: [2.5, 4.8, 3.2, 5.1, 7.8, 12.4, 9.5],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.04)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.04)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        }
      }
    });
  } catch (err) {
    console.warn('Chart init error:', err);
  }
}

// ==========================================
// EXPOSE ALL TO GLOBAL WINDOW OBJECT
// ==========================================
if (typeof window !== 'undefined') {
  window.appState = appState;
  window.renderApp = renderApp;
  window.switchRole = switchRole;
  window.switchTab = switchTab;
  window.handleLogout = handleLogout;
  window.setAuthTab = setAuthTab;
  window.quickLoginAs = quickLoginAs;
  window.handleFormLogin = handleFormLogin;
  window.handleFormRegister = handleFormRegister;
  window.handleSendOtpBtn = handleSendOtpBtn;
  window.handleVerifyAndResetPassword = handleVerifyAndResetPassword;
  window.handleRenewMember = handleRenewMember;
  window.handleBuyPackage = handleBuyPackage;
  window.handleBookClass = handleBookClass;
  window.handleCheckClassAttendance = handleCheckClassAttendance;
  window.handleGateCheckinSubmit = handleGateCheckinSubmit;
  window.handlePOSRegister = handlePOSRegister;
  window.showToast = showToast;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderApp);
  } else {
    renderApp();
  }
}
