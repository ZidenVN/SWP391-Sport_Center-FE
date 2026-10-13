/**
 * Sports Center Management System - Modular Entry Point
 * SWP391 FA26 Topic 4
 *
 * Clean Architecture Modular Domain Structure:
 * - /state: State container, resolvers, mock database fallbacks
 * - /components: Reusable UI widgets (Calendar engine, Modals, Header & Notification Bell)
 * - /roles/auth: Authentication & password reset workflows
 * - /roles/profile: User Profile modal & full-page views
 * - /roles/member: Member portal (Landing home, Discovery, Catalog, Schedule, Stats, Pass) & Shopee Checkout
 * - /roles/receptionist: Front-Desk Kiosk (Gate barcode, POS Cashier, Lookup, Shift reports, Tickets)
 * - /roles/coach: Coach Hub (Attendance check-in, weekly timetable, member roster, workout plans)
 * - /roles/manager: Back-Office Admin (Dashboard, Member CRM, Packages, Class Scheduler, Audit Trail)
 * - /api: Unified HTTP client & role-based services ready for Backend integration
 */

// 0. ERD Initial Mock Data
import './mockData.js';

// 1. Core State & ERD Resolvers
import './state/resolvers.js';
import './state/defaultData.js';
import './state/appState.js';

// 2. Shared Components & Common Modals
import './components/calendar.js';
import './components/modals.js';
import './components/header.js';

// 3. User Profile
import './roles/profile/userProfile.js';

// 4. Role Modules
import './roles/auth/authScreen.js';
import './roles/member/memberCheckout.js';
import './roles/member/memberApp.js';
import './roles/receptionist/receptionistApp.js';
import './roles/coach/coachApp.js';
import './roles/manager/managerApp.js';

// 5. Root Dispatcher
import './roles/root.js';

// 6. Backend API Client & Services
import { apiClient } from './api/apiClient.js';
import { authApi } from './api/authApi.js';
import { memberApi, receptionApi, coachApi, managerApi, packageApi } from './api/index.js';

// Expose API services on window for integration and debugging
if (typeof window !== 'undefined') {
  window.api = {
    client: apiClient,
    auth: authApi,
    package: packageApi,
    member: memberApi,
    reception: receptionApi,
    coach: coachApi,
    manager: managerApi
  };

  window.handleSessionExpired = () => {
    if (typeof window.showToast === 'function') {
      window.showToast('Hết phiên đăng nhập', 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!', 'warning');
    }
    if (typeof window.handleLogout === 'function') {
      window.handleLogout();
    }
  };
}

// Background token validation and profile sync with Backend
function syncAuthSessionWithBackend() {
  if (typeof window === 'undefined' || !window.appState || !window.appState.isAuthenticated) return;
  const isDemo = typeof localStorage !== 'undefined' && localStorage.getItem('is_demo_session') === 'true';
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (isDemo || !token || window.appState.currentRole !== 'MEMBER') return;

  if (window.api && window.api.member && typeof window.api.member.getProfile === 'function') {
    window.api.member.getProfile().then(profile => {
      if (profile && window.appState && window.appState.currentUser) {
        const curr = window.appState.currentUser;
        const updated = {
          ...curr,
          firstName: profile.firstName || curr.firstName,
          lastName: profile.lastName || curr.lastName,
          name: `${profile.lastName || curr.lastName || ''} ${profile.firstName || curr.firstName || ''}`.trim() || curr.name,
          phone: profile.phone || curr.phone,
          gender: profile.gender || curr.gender,
          trainingGoal: profile.trainingGoal || curr.trainingGoal
        };
        window.appState.currentUser = updated;
        if (typeof window.saveSession === 'function') {
          window.saveSession({ user: updated });
        }
        if (typeof window.renderApp === 'function') {
          window.renderApp();
        }
      }
    }).catch(err => {
      if (err && err.status === 401) {
        console.warn('[Bootstrap] Token expired on backend:', err.message);
        if (typeof window.handleSessionExpired === 'function') {
          window.handleSessionExpired();
        }
      } else {
        console.log('[Bootstrap] Backend sync skipped or unavailable:', err?.message);
      }
    });
  }
}

// Bootstrap Application: Restore session first, then render immediately
if (typeof document !== 'undefined') {
  if (typeof window !== 'undefined' && typeof window.restoreSession === 'function') {
    window.restoreSession();
  }

  const root = document.getElementById('app-root');
  if (root && typeof window.renderApp === 'function') {
    window.renderApp();
    syncAuthSessionWithBackend();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof window.restoreSession === 'function') {
        window.restoreSession();
      }
      if (typeof window.renderApp === 'function') {
        window.renderApp();
        syncAuthSessionWithBackend();
      }
    });
  } else {
    if (typeof window.renderApp === 'function') {
      window.renderApp();
      syncAuthSessionWithBackend();
    }
  }
}

export {
  apiClient,
  authApi,
  memberApi,
  receptionApi,
  coachApi,
  managerApi
};
