
let appState = {
  isAuthenticated: false,
  isViewingAuthScreen: false,
  authTab: 'login', // 'login' | 'register' | 'forgot'
  currentRole: 'MEMBER', // 'MEMBER' | 'RECEPTIONIST' | 'COACH' | 'MANAGER'
  currentTab: 'member-home',
  currentUser: null,
  otpSent: false,
  activeFilterCategory: 'ALL',
  memberSearchKeyword: '',
  selectedClassForBooking: null,
  selectedPackageForCheckout: null,
  receptionMode: 'GATE', // 'GATE' | 'POS' | 'LOOKUP' | 'SHIFT' | 'TICKETS'
  receptionSearchQuery: '',
  receptionLastScan: null,
  receptionCartPackage: null,
  posPaymentMethod: 'CASH', // 'CASH' | 'VNPAY_QR' | 'CARD'
  posCashReceived: 0,
  posCardLast4: '9812',
  posVnpayPaid: false,
  posCustInfo: {
    name: '',
    phone: '',
    gender: 'Nam'
  },
  posReceiptModal: null,
  receptionTicketFilter: 'ALL', // 'ALL' | 'PENDING' | 'RESOLVED'
  coachActiveTab: 'TODAY', // 'TODAY' | 'WEEK' | 'STUDENTS'
  calendarYear: 2026,
  calendarMonth: 8, // September 2026 (0-indexed)
  selectedCalendarDate: '2026-09-19',
  selectedSessionDetail: null,
  managerActiveModal: null, // null | 'CREATE_PACKAGE' | 'CREATE_CLASS' | 'RENEW_MEMBER'
  managerSelectedMemberForRenew: null,
  managerMemberSearch: '',
  managerAuditSearch: '',
  showNotificationDropdown: false,
  showUserDropdown: false,
  supportTicketModalOpen: false,
  coachSelectedMemberForWorkoutPlan: null,
  coachWorkoutPlanModalOpen: false,
  userProfileModalOpen: false,
  userProfileActiveTab: 'INFO', // 'INFO' | 'SECURITY' | 'MEMBERSHIP'
  userProfileDraftAvatar: null,
  checkoutFlow: {
    isOpen: false,
    step: 'FORM', // 'FORM' | 'VNPAY' | 'CARD_PROCESSING' | 'RESULT'
    package: null,
    buyerInfo: {
      lastName: 'Phạm',
      firstName: 'Thu Trang',
      phone: '0912345678'
    },
    paymentMethod: 'VNPAY', // 'VNPAY' | 'CARD'
    cardInfo: {
      number: '9704 1988 5678 9012',
      holder: 'PHAM THU TRANG',
      expiry: '10/29',
      cvv: '888'
    },
    resultStatus: 'SUCCESS', // 'SUCCESS' | 'FAILED'
    failureReason: '',
    invoiceData: null
  },
  data: (typeof getDataSource === 'function' ? getDataSource() : (typeof window !== 'undefined' && typeof window.getDataSource === 'function' ? window.getDataSource() : (typeof globalThis !== 'undefined' && typeof globalThis.getDataSource === 'function' ? globalThis.getDataSource() : {})))
};

function showToast(title, message, type) {
  type = type || 'success';
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const bgColors = {
    success: 'bg-emerald-700 text-white',
    error: 'bg-rose-700 text-white',
    info: 'bg-slate-900 text-white',
    warning: 'bg-amber-700 text-white'
  };
  const toast = document.createElement('div');
  toast.className = `flex items-center justify-between p-4 rounded-xl shadow-lg border border-slate-200/20 mb-3 ${bgColors[type] || 'bg-slate-900 text-white'} animate-fade-in transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `
    <div>
      <div class="font-bold text-sm leading-tight">${title}</div>
      <div class="text-xs opacity-95 mt-0.5">${message}</div>
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

function openLoginScreen(tab) {
  if (tab) appState.authTab = tab;
  appState.isViewingAuthScreen = true;
  renderApp();
}

function closeLoginScreen() {
  appState.isViewingAuthScreen = false;
  renderApp();
}

function quickLoginAs(role) {
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.role === role) : null;
  appState.isAuthenticated = true;
  appState.isViewingAuthScreen = false;
  appState.currentRole = role;
  appState.currentUser = {
    id: role === 'MEMBER' ? 'MEM101' : 'USR_' + role,
    name: acc ? acc.name : (role === 'MANAGER' ? 'Nguyễn Văn Quản Lý' : (role === 'RECEPTIONIST' ? 'Lê Ngọc Lễ Tân' : (role === 'COACH' ? 'Trần Hoàng Nam' : 'Phạm Thu Trang'))),
    email: acc ? acc.email : `${role.toLowerCase()}@sportscenter.vn`,
    role: role,
    avatar: acc ? acc.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  appState.selectedClassForBooking = null;
  appState.selectedPackageForCheckout = null;
  appState.managerActiveModal = null;

  if (role === 'MEMBER') appState.currentTab = 'member-home';
  else if (role === 'RECEPTIONIST') {
    appState.currentTab = 'reception-kiosk';
    appState.receptionMode = 'GATE';
  }
  else if (role === 'COACH') {
    appState.currentTab = 'coach-hub';
    appState.coachActiveTab = 'TODAY';
  }
  else if (role === 'MANAGER') appState.currentTab = 'dashboard';

  renderApp();
}

function switchTab(tabName) {
  if (!appState.isAuthenticated && (tabName === 'member-schedule' || tabName === 'member-fitness' || tabName === 'member-pass' || tabName === 'member-profile')) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để truy cập tính năng cá nhân!', 'info');
    openLoginScreen('login');
    return;
  }
  appState.currentTab = tabName;
  renderApp();
}

function handleLogout() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
  }
  appState.isAuthenticated = false;
  appState.isViewingAuthScreen = false;
  appState.currentUser = null;
  appState.currentRole = 'MEMBER';
  appState.currentTab = 'member-home';
  appState.authTab = 'login';
  renderApp();
}

function getRoleLabel(role) {
  switch (role) {
    case 'MANAGER': return 'Quản Lý Trung Tâm (Manager)';
    case 'RECEPTIONIST': return 'Lễ Tân Quầy POS & Cổng';
    case 'COACH': return 'Huấn Luyện Viên (Coach)';
    case 'MEMBER': return 'Hội Viên (Member)';
    default: return role;
  }
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof appState !== 'undefined') _targetGlobal.appState = appState;
  if (typeof showToast !== 'undefined') _targetGlobal.showToast = showToast;
  if (typeof setAuthTab !== 'undefined') _targetGlobal.setAuthTab = setAuthTab;
  if (typeof openLoginScreen !== 'undefined') _targetGlobal.openLoginScreen = openLoginScreen;
  if (typeof closeLoginScreen !== 'undefined') _targetGlobal.closeLoginScreen = closeLoginScreen;
  if (typeof quickLoginAs !== 'undefined') _targetGlobal.quickLoginAs = quickLoginAs;
  if (typeof switchTab !== 'undefined') _targetGlobal.switchTab = switchTab;
  if (typeof handleLogout !== 'undefined') _targetGlobal.handleLogout = handleLogout;
  if (typeof getRoleLabel !== 'undefined') _targetGlobal.getRoleLabel = getRoleLabel;
}
