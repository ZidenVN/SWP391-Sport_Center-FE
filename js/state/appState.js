
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
  memberClassSort: 'TIME_ASC', // 'TIME_ASC' | 'SEATS_DESC' | 'NAME_ASC'
  quickViewClass: null,
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
    if (toast.style) toast.style.opacity = '0';
    setTimeout(() => {
      if (typeof toast.remove === 'function') toast.remove();
      else if (toast.parentElement && typeof toast.parentElement.removeChild === 'function') toast.parentElement.removeChild(toast);
    }, 300);
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

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (typeof atob === 'function' ? atob(base64) : (typeof Buffer !== 'undefined' ? Buffer.from(base64, 'base64').toString('binary') : ''))
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function isJwtExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

function saveSession(sessionData) {
  if (!sessionData) return;
  const { token, user, role, tab, isDemo } = sessionData;
  if (typeof localStorage !== 'undefined') {
    try {
      if (token) localStorage.setItem('token', token);
      if (isDemo !== undefined) localStorage.setItem('is_demo_session', isDemo ? 'true' : 'false');
      if (user) {
        const mergedUser = { ...(appState.currentUser || {}), ...user };
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));
        appState.currentUser = mergedUser;
      }
      if (role) {
        localStorage.setItem('currentRole', role);
        appState.currentRole = role;
      }
      if (tab) {
        localStorage.setItem('currentTab', tab);
        appState.currentTab = tab;
      }
    } catch (err) {
      console.warn('[saveSession] Failed to write to localStorage:', err);
    }
  } else if (user) {
    appState.currentUser = { ...(appState.currentUser || {}), ...user };
  }

  if (role) appState.currentRole = role;
  if (tab) appState.currentTab = tab;
  appState.isAuthenticated = true;
  appState.isViewingAuthScreen = false;
}

function clearSession() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('currentTab');
      localStorage.removeItem('is_demo_session');
    } catch (e) {}
  }
  appState.isAuthenticated = false;
  appState.isViewingAuthScreen = false;
  appState.currentUser = null;
  appState.currentRole = 'MEMBER';
  appState.currentTab = 'member-home';
  appState.authTab = 'login';
}

function restoreSession() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const token = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('currentUser');
    const storedRole = localStorage.getItem('currentRole');
    const storedTab = localStorage.getItem('currentTab');
    const isDemo = localStorage.getItem('is_demo_session') === 'true';

    if (!token && !storedUserStr) {
      return false;
    }

    // Check JWT expiry if not a demo token
    if (token && !isDemo && isJwtExpired(token)) {
      console.warn('[restoreSession] JWT token has expired on client. Clearing session.');
      clearSession();
      return false;
    }

    let user = null;
    if (storedUserStr) {
      try {
        user = JSON.parse(storedUserStr);
      } catch (e) {
        console.warn('[restoreSession] Stored user parsing error:', e);
      }
    }

    if (!user && !token) {
      clearSession();
      return false;
    }

    const resolvedRole = storedRole || (user && user.role) || 'MEMBER';

    appState.isAuthenticated = true;
    appState.isViewingAuthScreen = false;
    appState.currentUser = user || {
      id: resolvedRole === 'MEMBER' ? 'MEM101' : 'USR_' + resolvedRole,
      name: 'Hội viên',
      role: resolvedRole
    };
    appState.currentRole = resolvedRole;

    if (storedTab) {
      appState.currentTab = storedTab;
    } else {
      if (resolvedRole === 'MEMBER') appState.currentTab = 'member-home';
      else if (resolvedRole === 'RECEPTIONIST') {
        appState.currentTab = 'reception-kiosk';
        appState.receptionMode = 'GATE';
      } else if (resolvedRole === 'COACH') {
        appState.currentTab = 'coach-hub';
        appState.coachActiveTab = 'TODAY';
      } else if (resolvedRole === 'MANAGER') {
        appState.currentTab = 'dashboard';
      }
    }

    // Sync member object in data.members
    if (resolvedRole === 'MEMBER' && appState.currentUser && appState.data && appState.data.members) {
      const curr = appState.currentUser;
      const matched = appState.data.members.find(m =>
        (curr.id && (m.id === curr.id || m.memberId === curr.id)) ||
        (curr.email && m.email && m.email.toLowerCase() === curr.email.toLowerCase())
      );
      if (matched) {
        if (curr.name) matched.name = curr.name;
        if (curr.firstName) matched.firstName = curr.firstName;
        if (curr.lastName) matched.lastName = curr.lastName;
        if (curr.phone) matched.phone = curr.phone;
        if (curr.gender) matched.gender = curr.gender;
        if (curr.dob) matched.dob = curr.dob;
        if (curr.address) matched.address = curr.address;
        if (curr.trainingGoal) matched.trainingGoal = curr.trainingGoal;
        if (curr.avatar) matched.avatar = curr.avatar;
      }
    }

    return true;
  } catch (err) {
    console.error('[restoreSession] Error during restoration:', err);
    return false;
  }
}

function quickLoginAs(role) {
  const acc = (appState.data && appState.data.demoAccounts) ? appState.data.demoAccounts.find(a => a.role === role) : null;
  const user = {
    id: role === 'MEMBER' ? 'MEM101' : 'USR_' + role,
    name: acc ? acc.name : (role === 'MANAGER' ? 'Nguyễn Văn Quản Lý' : (role === 'RECEPTIONIST' ? 'Lê Ngọc Lễ Tân' : (role === 'COACH' ? 'Trần Hoàng Nam' : 'Phạm Thu Trang'))),
    email: acc ? acc.email : `${role.toLowerCase()}@sportscenter.vn`,
    role: role,
    avatar: acc ? acc.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  let targetTab = 'member-home';
  if (role === 'MEMBER') targetTab = 'member-home';
  else if (role === 'RECEPTIONIST') {
    targetTab = 'reception-kiosk';
    appState.receptionMode = 'GATE';
  } else if (role === 'COACH') {
    targetTab = 'coach-hub';
    appState.coachActiveTab = 'TODAY';
  } else if (role === 'MANAGER') {
    targetTab = 'dashboard';
  }

  saveSession({
    token: 'mock-jwt-' + role.toLowerCase(),
    user: user,
    role: role,
    tab: targetTab,
    isDemo: true
  });

  appState.selectedClassForBooking = null;
  appState.selectedPackageForCheckout = null;
  appState.managerActiveModal = null;

  renderApp();
}

function switchTab(tabName) {
  if (!appState.isAuthenticated && (tabName === 'member-schedule' || tabName === 'member-fitness' || tabName === 'member-pass' || tabName === 'member-profile')) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để truy cập tính năng cá nhân!', 'info');
    openLoginScreen('login');
    return;
  }
  appState.currentTab = tabName;
  if (appState.isAuthenticated && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('currentTab', tabName);
    } catch (e) {}
  }
  renderApp();

  // Auto-sync packages with backend when visiting packages tab
  if ((tabName === 'manager-packages' || tabName === 'member-packages') && typeof window !== 'undefined' && typeof window.syncPackagesWithBackend === 'function') {
    window.syncPackagesWithBackend().then(() => {
      if (typeof renderApp === 'function') renderApp();
    }).catch(() => {});
  }
}

function handleLogout() {
  clearSession();
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

// Immediate initial session check on module load
restoreSession();

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
  if (typeof saveSession !== 'undefined') _targetGlobal.saveSession = saveSession;
  if (typeof restoreSession !== 'undefined') _targetGlobal.restoreSession = restoreSession;
  if (typeof clearSession !== 'undefined') _targetGlobal.clearSession = clearSession;
}

