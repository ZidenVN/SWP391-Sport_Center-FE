const fs = require('fs');

const filesMeta = [
  {
    file: 'js/state/resolvers.js',
    symbols: ['resolveMember', 'resolveClass', 'SUBJECT_IMAGE_MAP']
  },
  {
    file: 'js/state/defaultData.js',
    symbols: ['getDataSource', 'DEFAULT_DATA']
  },
  {
    file: 'js/state/appState.js',
    symbols: ['appState', 'showToast', 'setAuthTab', 'openLoginScreen', 'closeLoginScreen', 'quickLoginAs', 'switchTab', 'handleLogout', 'getRoleLabel']
  },
  {
    file: 'js/components/calendar.js',
    symbols: ['changeCalendarMonth', 'resetCalendarToToday', 'selectCalendarDate', 'openSessionDetail', 'closeSessionDetail', 'getSessionsForDate', 'renderMonthlyCalendarComponent', 'formatCalendarDateLabel']
  },
  {
    file: 'js/components/modals.js',
    symbols: ['renderSessionDetailModal', 'openSupportTicketModal', 'closeSupportTicketModal', 'handleCreateSupportTicket', 'renderSupportTicketModal']
  },
  {
    file: 'js/components/header.js',
    symbols: ['recordAuditLog', 'addNotification', 'toggleNotificationDropdown', 'markAllNotificationsAsRead', 'markSingleNotificationAsRead', 'renderNotificationBell', 'toggleUserDropdown', 'closeUserDropdown', 'navigateToMemberPage', 'renderUserAvatarDropdown']
  },
  {
    file: 'js/roles/auth/authScreen.js',
    symbols: ['renderAuthScreen', 'renderLoginForm', 'renderRegisterForm', 'renderForgotPasswordForm', 'handleFormLogin', 'handleFormRegister', 'handleSendOtpBtn', 'handleVerifyAndResetPassword']
  },
  {
    file: 'js/roles/profile/userProfile.js',
    symbols: ['getResolvedCurrentUserProfile', 'renderProfileTabsContent', 'renderUserProfileModal', 'renderMemberProfilePage', 'openUserProfileModal', 'closeUserProfileModal', 'setUserProfileTab', 'selectUserProfileAvatar', 'handleSaveUserProfile', 'handleChangeUserPassword', 'USER_AVATAR_PRESETS']
  },
  {
    file: 'js/roles/member/memberApp.js',
    symbols: ['renderMemberWebApp', 'quickExploreCategory', 'handleHomeSearch', 'renderMemberLandingHome', 'renderMemberClassDiscovery', 'renderMemberPackageCatalog', 'renderMemberMySchedule', 'renderMemberFitnessStats', 'renderMemberDigitalPass', 'renderMemberBookingModal', 'setMemberCategoryFilter', 'setMemberSearchKeyword', 'openBookingModal', 'closeBookingModal', 'confirmBooking', 'cancelMemberBooking']
  },
  {
    file: 'js/roles/member/memberCheckout.js',
    symbols: ['renderMemberCheckoutModal', 'renderShopeeCheckoutForm', 'renderShopeeCheckoutVnpayGateway', 'renderShopeeCheckoutCardGateway', 'renderShopeeCheckoutResultCard', 'openCheckoutModal', 'closeCheckoutModal', 'setCheckoutPaymentMethod', 'updateCheckoutBuyerInfo', 'updateCheckoutCardInfo', 'handleProceedToPayment', 'handleBackToCheckoutForm', 'handleSimulatePaymentSuccess', 'handleSimulatePaymentFailure', 'handleFinishCheckout', 'confirmMemberCheckout']
  },
  {
    file: 'js/roles/receptionist/receptionistApp.js',
    symbols: ['renderReceptionistWebApp', 'renderReceptionGateMode', 'renderReceptionPOSMode', 'renderPOSReceiptModal', 'renderReceptionLookupMode', 'renderReceptionShiftMode', 'setReceptionTicketFilter', 'handleResolveSupportTicket', 'handleRejectSupportTicket', 'renderReceptionTicketsMode', 'setReceptionMode', 'setReceptionSearchQuery', 'handleGateBarcodeSubmit', 'simulateGateScan', 'selectPOSPackage', 'setPOSPaymentMethod', 'setPOSQuickCash', 'handlePOSCashInput', 'updatePOSCustInfo', 'handleSimulatePOSVnpayPaid', 'closePOSReceiptModal', 'handlePOSCheckout', 'fastRenewMemberAtReception']
  },
  {
    file: 'js/roles/coach/coachApp.js',
    symbols: ['renderCoachWebApp', 'renderCoachTodayMode', 'renderCoachWeekMode', 'renderCoachStudentsMode', 'openAssignWorkoutPlanModal', 'closeAssignWorkoutPlanModal', 'handleAssignWorkoutPlan', 'renderAssignWorkoutPlanModal', 'setCoachTab', 'selectCoachClass', 'toggleStudentAttendance', 'updateStudentNote', 'saveClassAttendance']
  },
  {
    file: 'js/roles/manager/managerApp.js',
    symbols: ['renderManagerWebApp', 'getManagerTabTitle', 'renderManagerDashboard', 'renderManagerMembers', 'renderManagerPackages', 'renderManagerClasses', 'renderManagerStaff', 'renderManagerFinances', 'renderCreatePackageModal', 'renderCreateClassModal', 'renderRenewMemberModal', 'initChartsIfNeeded', 'setManagerAuditSearch', 'renderManagerAuditLogs', 'setManagerMemberSearch', 'openManagerModal', 'closeManagerModal', 'openRenewModal', 'confirmManagerRenew', 'handleCreatePackageSubmit', 'handleCreateClassSubmit']
  },
  {
    file: 'js/roles/root.js',
    symbols: ['renderApp']
  }
];

for (const item of filesMeta) {
  let content = fs.readFileSync(item.file, 'utf8');
  // Strip previous binding block if present
  const marker = '// Attach to window';
  const markerGlobal = '// Attach to global';
  if (content.includes(marker)) content = content.substring(0, content.indexOf(marker)).trimEnd();
  if (content.includes(markerGlobal)) content = content.substring(0, content.indexOf(markerGlobal)).trimEnd();

  let bindingCode = '\n\n// Attach to global for browser onclick compatibility and test runners\n' +
    'const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);\n' +
    'if (_targetGlobal) {\n';
  for (const s of item.symbols) {
    bindingCode += `  if (typeof ${s} !== 'undefined') _targetGlobal.${s} = ${s};\n`;
  }
  bindingCode += '}\n';
  fs.writeFileSync(item.file, content + bindingCode, 'utf8');
  console.log('Appended global bindings to ' + item.file);
}
