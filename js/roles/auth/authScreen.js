// =========================================================================
// AUTH SCREEN & HANDLERS
// =========================================================================

// ===================================================
// 1. AUTH SCREEN
// ===================================================
function renderAuthScreen() {
  const currentTab = appState.authTab;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700"></div>

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

      <!-- Back to Landing Home button -->
      <div class="w-full max-w-md flex justify-between items-center mb-3">
        <button type="button" onclick="closeLoginScreen()" class="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs">
          <span>&larr;</span>
          <span>Quay lại Trang Chủ</span>
        </button>
        <span class="text-[11px] text-slate-400 font-semibold">Khách Vãng Lai</span>
      </div>

      <div class="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8">
        ${currentTab !== 'forgot' ? `
          <div class="flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 mb-6">
            <button type="button" onclick="setAuthTab('login')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Nhập
            </button>
            <button type="button" onclick="setAuthTab('register')" class="flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
              Đăng Ký Hội Viên Mới
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
      <div>
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Đăng Nhập Nhanh Theo Vai Trò (1-Click Demo)
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="quickLoginAs('MEMBER')" class="p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200 text-left transition group">
            <div class="text-xs font-bold text-indigo-900">Hội Viên (Member)</div>
            <div class="text-[11px] text-slate-600 mt-0.5">Đặt lớp & Mua gói tập</div>
          </button>
          <button type="button" onclick="quickLoginAs('RECEPTIONIST')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Lễ Tân Quầy</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Check-in cổng & Bán POS</div>
          </button>
          <button type="button" onclick="quickLoginAs('COACH')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Huấn Luyện Viên</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Lịch dạy & Điểm danh</div>
          </button>
          <button type="button" onclick="quickLoginAs('MANAGER')" class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition group">
            <div class="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Center Manager</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Quản trị & Doanh thu</div>
          </button>
        </div>
      </div>

      <div class="flex items-center my-4">
        <div class="flex-1 border-t border-slate-200"></div>
        <span class="px-3 text-[11px] text-slate-400 uppercase font-semibold">Hoặc đăng nhập tài khoản</span>
        <div class="flex-1 border-t border-slate-200"></div>
      </div>

      <form onsubmit="return handleFormLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Tài Khoản</label>
          <input type="email" id="login-email" required value="trang.pham@gmail.com" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm" placeholder="name@domain.com" />
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
    <form onsubmit="return handleFormRegister(event)" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ và Tên</label>
        <input type="text" id="reg-name" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="Ví dụ: Hoàng Nhật Nam" />
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Số Điện Thoại</label>
          <input type="tel" id="reg-phone" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Giới Tính</label>
          <select id="reg-gender" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm">
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
        <input type="email" id="reg-email" required class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="email@gmail.com" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu</label>
        <input type="password" id="reg-password" required minlength="3" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="Tối thiểu 3 ký tự" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mục Tiêu Thể Hình (Training Goal)</label>
        <select id="reg-goal" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm">
          <option value="Giảm mỡ, tăng cơ săn chắc">Giảm mỡ, tăng cơ săn chắc</option>
          <option value="Tăng cân & phát triển khối cơ">Tăng cân & phát triển khối cơ</option>
          <option value="Tập Yoga dẻo dai & giải tỏa stress">Tập Yoga dẻo dai & giải tỏa stress</option>
          <option value="Rèn luyện sức bền & tim mạch">Rèn luyện sức bền & tim mạch</option>
        </select>
      </div>

      <button type="submit" class="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
        Hoàn Tất Đăng Ký Tài Khoản
      </button>
    </form>
  `;
}

function renderForgotPasswordForm() {
  return `
    <div class="space-y-4">
      <div class="text-center">
        <h3 class="font-bold text-base text-slate-900">Khôi Phục Mật Khẩu</h3>
        <p class="text-xs text-slate-500 mt-1">Nhập email tài khoản của bạn để nhận mã xác minh OTP 6 chữ số.</p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Của Bạn</label>
        <div class="flex space-x-2">
          <input type="email" id="forgot-email" value="trang.pham@gmail.com" class="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" placeholder="email@gmail.com" />
          <button type="button" onclick="handleSendOtpBtn()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition">
            Gửi OTP
          </button>
        </div>
      </div>

      ${appState.otpSent ? `
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
          Mã OTP giả lập của bạn là: <strong>888999</strong> (Hạn 5 phút)
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nhập Mã OTP (6 số)</label>
          <input type="text" id="forgot-otp" maxlength="6" value="888999" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 tracking-widest text-center font-bold focus:outline-none focus:border-indigo-600 shadow-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật Khẩu Mới</label>
          <input type="password" id="forgot-newpass" value="123456" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm" />
        </div>
        <button type="button" onclick="handleVerifyAndResetPassword()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
          Xác Nhận Đổi Mật Khẩu
        </button>
      ` : ''}

      <div class="text-center pt-2">
        <button type="button" onclick="setAuthTab('login')" class="text-xs text-indigo-600 hover:underline font-medium">Quay lại Đăng nhập</button>
      </div>
    </div>
  `;
}


function handleFormLogin(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('login-email')?.value || '').trim();
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) : null;

  if (acc) {
    quickLoginAs(acc.role);
    showToast('Đăng nhập thành công', `Chào mừng ${acc.name} (${acc.roleLabel})`, 'success');
  } else {
    quickLoginAs('MEMBER');
    showToast('Đăng nhập thành công', 'Đã đăng nhập tài khoản Hội viên', 'success');
  }
  return false;
}

function handleFormRegister(e) {
  if (e) e.preventDefault();
  const lastName = document.getElementById('reg-lastname')?.value || 'Phạm';
  const firstName = document.getElementById('reg-firstname')?.value || 'Thu Trang';
  const fullName = `${lastName} ${firstName}`.trim();
  const email = document.getElementById('reg-email')?.value || 'new@customer.vn';
  const goal = document.getElementById('reg-goal')?.value || 'Giảm mỡ, tăng cơ săn chắc';

  const newId = 'MEM' + (100 + appState.data.members.length + 1);
  
  // STRICT ERD: Members entity (MemberID, FirstName, LastName, Email, TrainingGoal, Status)
  const newMember = {
    memberId: newId,
    id: newId,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    email: email,
    trainingGoal: goal,
    status: 'ACTIVE'
  };

  appState.data.members.unshift(newMember);
  quickLoginAs('MEMBER');
  appState.currentUser.name = fullName;
  appState.currentUser.email = email;
  appState.currentTab = 'member-packages';
  renderApp();
  showToast('Đăng ký thành công (ERD Compliant)', `Chào mừng hội viên ${fullName}! Vui lòng chọn gói tập để kích hoạt thẻ.`, 'success');
  return false;
}

function handleSendOtpBtn() {
  appState.otpSent = true;
  renderApp();
  showToast('Đã gửi mã OTP', 'Mã xác minh 888999 đã được gửi đến email của bạn', 'info');
}

function handleVerifyAndResetPassword() {
  const otp = document.getElementById('forgot-otp')?.value;
  if (otp === '888999') {
    appState.authTab = 'login';
    renderApp();
    showToast('Thành công', 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập!', 'success');
  } else {
    showToast('Lỗi', 'Mã OTP không chính xác!', 'error');
  }
}

// Member Booking Interactions

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderAuthScreen !== 'undefined') _targetGlobal.renderAuthScreen = renderAuthScreen;
  if (typeof renderLoginForm !== 'undefined') _targetGlobal.renderLoginForm = renderLoginForm;
  if (typeof renderRegisterForm !== 'undefined') _targetGlobal.renderRegisterForm = renderRegisterForm;
  if (typeof renderForgotPasswordForm !== 'undefined') _targetGlobal.renderForgotPasswordForm = renderForgotPasswordForm;
  if (typeof handleFormLogin !== 'undefined') _targetGlobal.handleFormLogin = handleFormLogin;
  if (typeof handleFormRegister !== 'undefined') _targetGlobal.handleFormRegister = handleFormRegister;
  if (typeof handleSendOtpBtn !== 'undefined') _targetGlobal.handleSendOtpBtn = handleSendOtpBtn;
  if (typeof handleVerifyAndResetPassword !== 'undefined') _targetGlobal.handleVerifyAndResetPassword = handleVerifyAndResetPassword;
}
