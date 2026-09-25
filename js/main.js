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
import { memberApi, receptionApi, coachApi, managerApi } from './api/index.js';

// Expose API services on window for integration and debugging
if (typeof window !== 'undefined') {
  window.api = {
    client: apiClient,
    auth: authApi,
    member: memberApi,
    reception: receptionApi,
    coach: coachApi,
    manager: managerApi
  };
}

// Bootstrap Application
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof window.renderApp === 'function') {
        window.renderApp();
      }
    });
  } else {
    if (typeof window.renderApp === 'function') {
      window.renderApp();
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
