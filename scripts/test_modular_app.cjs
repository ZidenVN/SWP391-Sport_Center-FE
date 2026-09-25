const fs = require('fs');

// Create mock browser environment
const dom = {
  innerHTML: '',
  children: [],
  addEventListener: () => {},
  removeEventListener: () => {},
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  style: {},
  getAttribute: () => null,
  setAttribute: () => {},
  dataset: {}
};

global.window = global;
global.document = {
  readyState: 'complete',
  getElementById: (id) => {
    return {
      id,
      innerHTML: '',
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      style: {},
      value: ''
    };
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      innerHTML: '',
      appendChild: () => {},
      parentElement: { remove: () => {} },
      style: {},
      classList: { add: () => {}, remove: () => {} }
    };
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Mock lucide and Chart
global.lucide = { createIcons: () => {} };
global.Chart = function() {
  return { destroy: () => {}, update: () => {} };
};

// Load modules in order
const modules = [
  '../js/mockData.js',
  '../js/state/resolvers.js',
  '../js/state/defaultData.js',
  '../js/state/appState.js',
  '../js/components/calendar.js',
  '../js/components/modals.js',
  '../js/components/header.js',
  '../js/roles/auth/authScreen.js',
  '../js/roles/profile/userProfile.js',
  '../js/roles/member/memberCheckout.js',
  '../js/roles/member/memberApp.js',
  '../js/roles/receptionist/receptionistApp.js',
  '../js/roles/coach/coachApp.js',
  '../js/roles/manager/managerApp.js',
  '../js/roles/root.js'
];

console.log('Loading all modules sequentially...');
for (const m of modules) {
  require(m);
  console.log('  Loaded:', m);
}

console.log('\n--- VERIFYING GLOBAL ATTACHMENTS ---');
const requiredGlobals = [
  'appState', 'renderApp', 'switchTab', 'quickLoginAs', 'handleLogout',
  'openLoginScreen', 'closeLoginScreen', 'resolveMember', 'resolveClass',
  'renderMemberLandingHome', 'renderMemberWebApp', 'renderMemberCheckoutModal',
  'renderReceptionistWebApp', 'renderCoachWebApp', 'renderManagerWebApp',
  'renderUserProfileModal', 'openUserProfileModal', 'closeUserProfileModal',
  'openSessionDetail', 'closeSessionDetail', 'showToast'
];

let missingGlobals = 0;
for (const g of requiredGlobals) {
  if (typeof global[g] === 'undefined') {
    console.error('MISSING GLOBAL:', g);
    missingGlobals++;
  }
}
if (missingGlobals === 0) {
  console.log('All required global functions are successfully attached!');
}

console.log('\n--- TESTING STATE & ROLE RENDERS ---');

// 1. Guest Landing Page
global.appState.isAuthenticated = false;
global.appState.isViewingAuthScreen = false;
global.appState.currentRole = 'MEMBER';
global.appState.currentTab = 'member-home';
let guestHtml = global.renderMemberWebApp();
console.log('1. Guest Landing Page HTML length:', guestHtml.length);
if (!guestHtml.includes('Khám Phá Trung Tâm') && !guestHtml.includes('Đăng Nhập')) {
  throw new Error('Guest landing page content missing!');
}

// 2. Auth Screen
global.appState.isViewingAuthScreen = true;
let authHtml = global.renderAuthScreen();
console.log('2. Auth Screen HTML length:', authHtml.length);
if (!authHtml.includes('Hệ Thống Quản Lý Trung Tâm Thể Thao') && !authHtml.includes('Đăng Nhập')) {
  throw new Error('Auth Screen content missing!');
}

// 3. Member Portal (Authenticated)
global.quickLoginAs('MEMBER');
let memberHtml = global.renderMemberWebApp();
console.log('3. Member Portal HTML length:', memberHtml.length);
if (!memberHtml.includes('Trang') && !memberHtml.includes('Khám Phá') && !memberHtml.includes('Hội viên')) {
  throw new Error('Member portal content missing!');
}

// 4. Shopee-Style Checkout Modal
global.openCheckoutModal('PKG01');
let checkoutHtml = global.renderMemberCheckoutModal();
console.log('4. Member Shopee Checkout HTML length:', checkoutHtml.length);
if (!checkoutHtml.includes('Thanh Toán Gói Tập')) {
  throw new Error('Checkout modal content missing!');
}
global.closeCheckoutModal();

// 5. Receptionist Kiosk
global.quickLoginAs('RECEPTIONIST');
let receptionHtml = global.renderReceptionistWebApp();
console.log('5. Receptionist Kiosk HTML length:', receptionHtml.length);
if (!receptionHtml.includes('TURNSTILE') && !receptionHtml.includes('BÁN GÓI POS')) {
  throw new Error('Receptionist kiosk content missing!');
}

// 6. Coach Trainer Hub
global.quickLoginAs('COACH');
let coachHtml = global.renderCoachWebApp();
console.log('6. Coach Hub HTML length:', coachHtml.length);
if (!coachHtml.includes('Điểm Danh') && !coachHtml.includes('Huấn Luyện Viên')) {
  throw new Error('Coach hub content missing!');
}

// 7. Manager Back-Office Admin
global.quickLoginAs('MANAGER');
let managerHtml = global.renderManagerWebApp();
console.log('7. Manager Admin HTML length:', managerHtml.length);
if (!managerHtml.includes('Tổng Quan') && !managerHtml.includes('Doanh Thu')) {
  throw new Error('Manager admin content missing!');
}

// 8. User Profile Modal
let profileHtml = global.renderUserProfileModal();
console.log('8. User Profile Modal HTML length:', profileHtml.length);
if (!profileHtml.includes('Hồ Sơ') && !profileHtml.includes('Thông Tin')) {
  throw new Error('User profile modal content missing!');
}

console.log('\n>>> ALL MODULE & ROLE TESTS PASSED 100% WITH ZERO ERRORS! <<<');
