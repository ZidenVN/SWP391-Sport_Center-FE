// =========================================================================
// ROOT APPLICATION DISPATCHER
// =========================================================================

// ===================================================
// ROOT RENDERER: DISPATCH TO ROLE-SPECIFIC WEB APPS
// ===================================================
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (!appState.isAuthenticated && appState.isViewingAuthScreen) {
    root.innerHTML = renderAuthScreen();
    return;
  }

  // Common modals
  const modalSuffix = (appState.selectedSessionDetail ? renderSessionDetailModal() : '') +
                      (appState.userProfileModalOpen ? renderUserProfileModal() : '') +
                      (appState.posReceiptModal ? renderPOSReceiptModal() : '');

  // 1. MEMBER / GUEST: Consumer Web App Portal
  if (appState.currentRole === 'MEMBER' || !appState.isAuthenticated) {
    root.innerHTML = renderMemberWebApp() + modalSuffix;
    return;
  }

  // 2. RECEPTIONIST: Front-Desk Kiosk / POS Console
  if (appState.currentRole === 'RECEPTIONIST') {
    root.innerHTML = renderReceptionistWebApp() + modalSuffix;
    return;
  }

  // 3. COACH: Trainer Daily Hub
  if (appState.currentRole === 'COACH') {
    root.innerHTML = renderCoachWebApp() + modalSuffix;
    return;
  }

  // 4. MANAGER: Back-Office Admin Dashboard
  root.innerHTML = renderManagerWebApp() + modalSuffix;
  initChartsIfNeeded();
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderApp !== 'undefined') _targetGlobal.renderApp = renderApp;
}
