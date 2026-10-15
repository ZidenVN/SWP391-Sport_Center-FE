// =========================================================================
// MEMBER WEB APP: ROOT CONTROLLER & ORCHESTRATOR
// Modulized into clean single-feature sub-modules:
// - features/memberLanding.js   (Landing data, Hero, Disciplines, Coaches spotlight)
// - features/memberClasses.js   (Class discovery, booking modal, quick view modal)
// - features/memberModals.js    (Discipline & Coach detail modals)
// - features/memberCatalog.js   (Active packages catalog)
// - features/memberSchedule.js  (My schedule & calendar)
// - features/memberFitness.js   (InBody stats & coach feedbacks)
// - features/memberPass.js      (Digital pass QR & personal invoices)
// - memberCheckout.js           (Shopee-style checkout flow)
// =========================================================================

import {
  GYM_MEMBER_LANDING_DATA,
  quickExploreCategory,
  handleHomeSearch,
  scrollToCoachSection,
  renderMemberLandingHome
} from './features/memberLanding.js';

import {
  renderMemberClassDiscovery,
  renderMemberBookingModal,
  setMemberCategoryFilter,
  setMemberSearchKeyword,
  openBookingModal,
  closeBookingModal,
  confirmBooking,
  cancelMemberBooking,
  setMemberClassSort,
  openClassQuickView,
  closeClassQuickView,
  renderMemberQuickViewModal
} from './features/memberClasses.js';

import {
  openDisciplineDetail,
  closeDisciplineDetail,
  renderDisciplineDetailModal,
  openCoachDetail,
  closeCoachDetail,
  renderCoachDetailModal
} from './features/memberModals.js';

import {
  renderMemberPackageCatalog
} from './features/memberCatalog.js';

import {
  renderMemberMySchedule
} from './features/memberSchedule.js';

import {
  renderMemberFitnessStats
} from './features/memberFitness.js';

import {
  renderMemberDigitalPass
} from './features/memberPass.js';

export function toggleMobileMenu(forceState) {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (!drawer) return;
  if (typeof forceState === 'boolean') {
    if (forceState) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
  } else {
    drawer.classList.toggle('hidden');
  }
}
function renderMemberWebApp() {
  const currentTab = appState.currentTab;
  const isAuth = appState.isAuthenticated;
  const curr = appState.currentUser;
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  let rawMember = null;
  if (curr && (curr.email || curr.id)) {
    rawMember = members.find(m => 
      (curr.email && m.email && m.email.toLowerCase() === curr.email.toLowerCase()) ||
      (curr.id && (m.id === curr.id || m.memberId === curr.id))
    );
  }
  if (!rawMember) {
    rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  }
  const resolved = resolveMember(rawMember) || {};
  const member = {
    id: curr?.id || resolved.id || 'MEM101',
    name: curr?.name || resolved.name || 'Hội viên',
    email: curr?.email || resolved.email || '',
    phone: curr?.phone || resolved.phone || '',
    gender: curr?.gender || rawMember?.gender || 'Nam',
    avatar: curr?.avatar || resolved.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: rawMember?.status || resolved.status || 'ACTIVE',
    activePackage: resolved.activePackage || 'Gói Hội Viên',
    endDate: resolved.endDate || '2026-11-01'
  };

  const myBookedCount = isAuth ? ((appState.data?.classes || []).filter(c => c.attendees && c.attendees.some(a => a.id === member.id)).length) : 0;
  const useTopNav = !isAuth;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 ${useTopNav ? 'flex flex-col' : 'flex'}">
      ${useTopNav ? `
      <!-- Member Top Horizontal Navigation Bar -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2 flex items-center justify-between">
          <div class="flex items-center space-x-6 lg:space-x-8">
            <div class="flex items-center space-x-3 cursor-pointer group" onclick="switchTab('member-home')">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
                SC
              </div>
              <div>
                <div class="font-extrabold text-base tracking-tight text-slate-900 leading-tight">SPORT CENTER</div>
                <div class="text-[11px] text-blue-600 font-bold uppercase tracking-wider">${isAuth ? 'Member Portal' : 'Gym & Fitness'}</div>
              </div>
            </div>

            <!-- Desktop Nav Menu: Lớp Học / Huấn Luyện Viên / Gói Hội Viên -->
            <nav class="hidden md:flex items-center space-x-1">
              <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${currentTab === 'member-classes' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                Lớp Học
              </button>
              <button type="button" onclick="scrollToCoachSection()" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                Huấn Luyện Viên
              </button>
              <button type="button" onclick="switchTab('member-packages')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${currentTab === 'member-packages' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                Gói Hội Viên
              </button>
              ${isAuth ? `
                <button type="button" onclick="switchTab('member-schedule')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${currentTab === 'member-schedule' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                  <span>Lịch Tập Của Tôi</span>
                  ${myBookedCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">${myBookedCount}</span>` : ''}
                </button>
              ` : ''}
            </nav>
          </div>

          <!-- Header Right Actions & Mobile Hamburger -->
          <div class="flex items-center space-x-2 sm:space-x-3">
            ${isAuth ? `
              ${renderNotificationBell('MEMBER')}
              ${renderUserAvatarDropdown('MEMBER')}
            ` : `
              <button type="button" onclick="openLoginScreen('register')" class="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all duration-200">
                Đăng Ký
              </button>
              <button type="button" onclick="openLoginScreen('login')" class="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 hover-lift-sm transition-all duration-200 shadow-sm flex items-center space-x-1.5">
                <span>Đăng Nhập</span>
                <span class="text-xs">&rarr;</span>
              </button>
            `}

            <!-- Mobile Hamburger Button -->
            <button 
              type="button" 
              onclick="toggleMobileMenu()" 
              class="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Menu (Collapsible) -->
        <div id="mobile-menu-drawer" class="hidden md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          <button type="button" onclick="switchTab('member-classes'); toggleMobileMenu(false);" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${currentTab === 'member-classes' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}">
            Lớp Học
          </button>
          <button type="button" onclick="scrollToCoachSection(); toggleMobileMenu(false);" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
            Huấn Luyện Viên
          </button>
          <button type="button" onclick="switchTab('member-packages'); toggleMobileMenu(false);" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${currentTab === 'member-packages' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}">
            Gói Hội Viên
          </button>
          ${isAuth ? `
            <button type="button" onclick="switchTab('member-schedule'); toggleMobileMenu(false);" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between">
              <span>Lịch Tập Của Tôi</span>
              ${myBookedCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">${myBookedCount}</span>` : ''}
            </button>
          ` : `
            <div class="pt-2 border-t border-slate-100 flex gap-2">
              <button type="button" onclick="openLoginScreen('register'); toggleMobileMenu(false);" class="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 text-center">
                Đăng Ký
              </button>
              <button type="button" onclick="openLoginScreen('login'); toggleMobileMenu(false);" class="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 text-center">
                Đăng Nhập
              </button>
            </div>
          `}
        </div>
      </header>
      ` : `
      <!-- Member Left Sidebar (Dashboard Only) -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shadow-xs flex-shrink-0 sticky top-0 h-screen">
        <div class="flex flex-col h-full overflow-y-auto">
          <!-- Logo -->
          <div class="h-16 flex items-center px-5 border-b border-slate-200 flex-shrink-0">
            <div class="flex items-center space-x-2.5 cursor-pointer" onclick="switchTab('member-home')">
              <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">SC</span>
              <div>
                <div class="font-extrabold text-xs tracking-tight text-slate-900 uppercase">SPORTS CENTER</div>
                <div class="text-[9px] text-indigo-600 font-bold uppercase">${isAuth ? 'Member Portal' : 'Khách Vãng Lai'}</div>
              </div>
            </div>
          </div>
          <!-- Search Bar in Sidebar -->
          <div class="px-4 py-3 border-b border-slate-100" style="${(typeof window !== 'undefined' && window.location && (window.location.pathname === '/login' || window.location.href?.includes('/login') || window.location.hash?.includes('login')) || (typeof appState !== 'undefined' && appState.isViewingAuthScreen)) ? 'display: none !important;' : ''}">
            <form onsubmit="return handleHomeSearch(event)" class="relative">
              <input type="text" id="home-search-input" placeholder="Tìm lớp, HLV..." class="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"/>
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </form>
          </div>
          <!-- Nav Menu -->
          <nav class="p-3 space-y-0.5 flex-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Khám Phá</div>
            <button type="button" onclick="switchTab('member-home')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-home' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <span>Trang Chủ</span>
            </button>
            <button type="button" onclick="switchTab('member-classes')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-classes' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>Khám Phá Lớp Học</span>
            </button>
            <button type="button" onclick="switchTab('member-packages')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-packages' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              <span>Gói Hội Viên</span>
            </button>
            ${isAuth ? `
            <div class="text-[10px] font-bold text-slate-400 uppercase px-3 mt-4 mb-2 tracking-wider">Cá Nhân</div>
            <button type="button" onclick="switchTab('member-schedule')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-schedule' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <div class="flex items-center space-x-2.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>Lịch Tập Của Tôi</span>
              </div>
              ${myBookedCount > 0 ? `<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">${myBookedCount}</span>` : ''}
            </button>
            <button type="button" onclick="switchTab('member-fitness')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-fitness' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>Thống Kê Thể Lực</span>
            </button>
            <button type="button" onclick="switchTab('member-pass')" class="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs transition ${currentTab === 'member-pass' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
              <span>Thẻ Thành Viên</span>
            </button>
            ` : `
            <div class="mx-3 mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p class="text-[11px] text-indigo-700 font-semibold mb-2">Đăng nhập để xem lịch tập & thẻ thành viên</p>
              <button type="button" onclick="openLoginScreen('login')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition">Đăng Nhập</button>
            </div>
            `}
          </nav>
        </div>
        
      </aside>

      <!-- Mobile Top Bar -->
      <div class="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div class="h-14 flex items-center justify-between px-4">
          <div class="flex items-center space-x-2 cursor-pointer" onclick="switchTab('member-home')">
            <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">SC</span>
            <span class="font-extrabold text-sm text-slate-900">SPORTS CENTER</span>
          </div>
          <div class="flex items-center space-x-2">
            ${isAuth ? `${renderNotificationBell('MEMBER')}${renderUserAvatarDropdown('MEMBER')}` : `
              <button type="button" onclick="openLoginScreen('login')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600">Đăng Nhập</button>
            `}
          </div>
        </div>
        <div class="flex overflow-x-auto px-3 pb-2 space-x-1.5">
          <button type="button" onclick="switchTab('member-home')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${currentTab === 'member-home' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Trang Chủ</button>
          <button type="button" onclick="switchTab('member-classes')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${currentTab === 'member-classes' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Lớp Học</button>
          <button type="button" onclick="switchTab('member-packages')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${currentTab === 'member-packages' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Gói Tập</button>
          ${isAuth ? `
          <button type="button" onclick="switchTab('member-schedule')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${currentTab === 'member-schedule' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Lịch Tập</button>
          <button type="button" onclick="switchTab('member-pass')" class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${currentTab === 'member-pass' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'}">Thẻ TV</button>
          ` : ''}
        </div>
      </div>
      `}

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 ${!useTopNav ? 'md:mt-0 mt-24' : ''}">
        ${!useTopNav ? `
        <!-- Desktop Top Header for User Profile -->
        <header class="h-16 bg-white border-b border-slate-200 hidden md:flex items-center justify-between px-6 z-10 sticky top-0">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Hội Viên (Member)
            </span>
            <span class="text-slate-300">/</span>
            <span class="text-xs font-semibold text-slate-700">${currentTab === 'member-home' ? 'Trang Chủ' : currentTab === 'member-classes' ? 'Lớp Học' : currentTab === 'member-packages' ? 'Gói Tập' : currentTab === 'member-schedule' ? 'Lịch Tập' : currentTab === 'member-fitness' ? 'Thể Lực' : currentTab === 'member-pass' ? 'Thẻ TV' : 'Hồ Sơ'}</span>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-3">
            ${isAuth ? `
              ${renderNotificationBell('MEMBER')}
              ${renderUserAvatarDropdown('MEMBER')}
            ` : `
              <button type="button" onclick="openLoginScreen('register')" class="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition">Đăng Ký</button>
              <button type="button" onclick="openLoginScreen('login')" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center space-x-1.5"><span>Đăng Nhập</span><span class="text-xs">&rarr;</span></button>
            `}
          </div>
        </header>
        ` : ''}

        <main class="${useTopNav ? 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6' : 'p-4 sm:p-6'} flex-1 overflow-y-auto">
          ${currentTab === 'member-home' ? renderMemberLandingHome() : ''}
          ${currentTab === 'member-classes' ? renderMemberClassDiscovery() : ''}
          ${currentTab === 'member-packages' ? renderMemberPackageCatalog() : ''}
          ${currentTab === 'member-schedule' ? renderMemberMySchedule() : ''}
          ${currentTab === 'member-fitness' ? renderMemberFitnessStats() : ''}
          ${currentTab === 'member-pass' ? renderMemberDigitalPass() : ''}
          ${currentTab === 'member-profile' ? renderMemberProfilePage() : ''}
        </main>

      <!-- Member Booking Modal (If Open) -->
      ${appState.selectedClassForBooking ? renderMemberBookingModal() : ''}

      <!-- Member Quick View Modal (If Open) -->
      ${appState.quickViewClass ? renderMemberQuickViewModal() : ''}

      <!-- Member Discipline Detail Modal (If Open) -->
      ${appState.selectedDiscipline ? renderDisciplineDetailModal() : ''}

      <!-- Member Coach Detail Modal (If Open) -->
      ${appState.selectedCoach ? renderCoachDetailModal() : ''}

      <!-- Member Package Checkout Modal (If Open) -->
      ${(appState.checkoutFlow?.isOpen || appState.selectedPackageForCheckout) ? renderMemberCheckoutModal() : ''}

      <!-- Member Support Ticket Modal (If Open) -->
      ${appState.supportTicketModalOpen ? renderSupportTicketModal() : ''}

      <!-- Redesigned Comprehensive Modern Footer -->
      <footer class="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <!-- Brand Column -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3 cursor-pointer" onclick="switchTab('member-home')">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  SC
                </div>
                <div>
                  <div class="font-extrabold text-base tracking-tight text-white">SPORT CENTER</div>
                  <div class="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Gym & Fitness System</div>
                </div>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed font-normal">
                Hệ thống quản lý trung tâm thể thao hỗ trợ hội viên tra cứu lịch tập, đặt chỗ lớp học, quản lý gói thẻ và theo dõi tiến trình rèn luyện trực tuyến.
              </p>
              
            </div>

            <!-- Quick Links -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Khám Phá Nhanh</h4>
              <ul class="space-y-2.5 text-xs text-slate-400">
                <li><button type="button" onclick="switchTab('member-home')" class="hover:text-indigo-400 transition">Trang Chủ Giới Thiệu</button></li>
                <li><button type="button" onclick="switchTab('member-classes')" class="hover:text-indigo-400 transition">Lịch Khám Phá Lớp Học</button></li>
                <li><button type="button" onclick="switchTab('member-packages')" class="hover:text-indigo-400 transition">Bảng Giá Gói Hội Viên</button></li>
                <li><button type="button" onclick="quickExploreCategory('Gym')" class="hover:text-indigo-400 transition">Khu Vực Gym Thể Lực</button></li>
                <li><button type="button" onclick="quickExploreCategory('Yoga')" class="hover:text-indigo-400 transition">Lớp Yoga & Thư Giãn</button></li>
                <li><button type="button" onclick="quickExploreCategory('Boxing')" class="hover:text-indigo-400 transition">Lớp Boxing Cơ Bản</button></li>
              </ul>
            </div>

            <!-- Operating Hours & Amenities -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Giờ Mở Cửa & Khu Vực</h4>
              <div class="space-y-2.5 text-xs text-slate-400">
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">⏰</span>
                  <div>
                    <strong class="text-slate-200">06:00 – 21:30</strong>
                    <div class="text-[11px] text-slate-500">Thứ 2 – Chủ Nhật hàng tuần</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🏋️</span>
                  <div>
                    <strong class="text-slate-200">Khu Vực Máy Tập Gym</strong>
                    <div class="text-[11px] text-slate-500">Trang thiết bị cardio & tạ đa dạng</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🧘</span>
                  <div>
                    <strong class="text-slate-200">Studio Lớp Học Nhóm</strong>
                    <div class="text-[11px] text-slate-500">Yoga, Boxing, Pilates & Zumba</div>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">🅿️</span>
                  <div>
                    <strong class="text-slate-200">Bãi Đỗ Xe Khuôn Viên</strong>
                    <div class="text-[11px] text-slate-500">Miễn phí cho học viên</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact & Support -->
            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Liên Hệ & Trợ Giúp</h4>
              <div class="space-y-2.5 text-xs text-slate-400">
                <div class="flex items-start space-x-2">
                  <span class="text-indigo-400 font-bold">📍</span>
                  <span>FPT University, District 9, Ho Chi Minh City</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-indigo-400 font-bold">📞</span>
                  <a href="tel:19000000" class="text-amber-300 font-extrabold hover:underline">1900 0000</a>
                  <span class="text-[11px] text-slate-500">(Hotline Demo)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-indigo-400 font-bold">✉️</span>
                  <a href="mailto:support@sportcenter.demo" class="hover:text-white transition">support@sportcenter.demo</a>
                </div>
                <div class="pt-2">
                  <button type="button" onclick="openLoginScreen('login')" class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition">
                    Cổng Đăng Nhập Hệ Thống &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <div>
              &copy; 2026 Sport Center Management System. All rights reserved.
            </div>
          
          </div>
        </div>
      </footer>
    </div>
  `;
}
export {
  renderMemberWebApp,
  GYM_MEMBER_LANDING_DATA,
  quickExploreCategory,
  handleHomeSearch,
  scrollToCoachSection,
  renderMemberLandingHome,
  renderMemberClassDiscovery,
  renderMemberPackageCatalog,
  renderMemberMySchedule,
  renderMemberFitnessStats,
  renderMemberDigitalPass,
  renderMemberBookingModal,
  renderMemberQuickViewModal,
  setMemberCategoryFilter,
  setMemberSearchKeyword,
  setMemberClassSort,
  openClassQuickView,
  closeClassQuickView,
  openBookingModal,
  closeBookingModal,
  confirmBooking,
  cancelMemberBooking,
  openDisciplineDetail,
  closeDisciplineDetail,
  renderDisciplineDetailModal,
  openCoachDetail,
  closeCoachDetail,
  renderCoachDetailModal
};

// Global attachments for browser inline onclick compatibility & test runner
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderMemberWebApp !== "undefined") _targetGlobal.renderMemberWebApp = renderMemberWebApp;
  if (typeof toggleMobileMenu !== "undefined") _targetGlobal.toggleMobileMenu = toggleMobileMenu;
  if (typeof quickExploreCategory !== "undefined") _targetGlobal.quickExploreCategory = quickExploreCategory;
  if (typeof handleHomeSearch !== "undefined") _targetGlobal.handleHomeSearch = handleHomeSearch;
  if (typeof renderMemberLandingHome !== "undefined") _targetGlobal.renderMemberLandingHome = renderMemberLandingHome;
  if (typeof renderMemberClassDiscovery !== "undefined") _targetGlobal.renderMemberClassDiscovery = renderMemberClassDiscovery;
  if (typeof renderMemberPackageCatalog !== "undefined") _targetGlobal.renderMemberPackageCatalog = renderMemberPackageCatalog;
  if (typeof renderMemberMySchedule !== "undefined") _targetGlobal.renderMemberMySchedule = renderMemberMySchedule;
  if (typeof renderMemberFitnessStats !== "undefined") _targetGlobal.renderMemberFitnessStats = renderMemberFitnessStats;
  if (typeof renderMemberDigitalPass !== "undefined") _targetGlobal.renderMemberDigitalPass = renderMemberDigitalPass;
  if (typeof renderMemberBookingModal !== "undefined") _targetGlobal.renderMemberBookingModal = renderMemberBookingModal;
  if (typeof renderMemberQuickViewModal !== "undefined") _targetGlobal.renderMemberQuickViewModal = renderMemberQuickViewModal;
  if (typeof setMemberCategoryFilter !== "undefined") _targetGlobal.setMemberCategoryFilter = setMemberCategoryFilter;
  if (typeof setMemberSearchKeyword !== "undefined") _targetGlobal.setMemberSearchKeyword = setMemberSearchKeyword;
  if (typeof setMemberClassSort !== "undefined") _targetGlobal.setMemberClassSort = setMemberClassSort;
  if (typeof openClassQuickView !== "undefined") _targetGlobal.openClassQuickView = openClassQuickView;
  if (typeof closeClassQuickView !== "undefined") _targetGlobal.closeClassQuickView = closeClassQuickView;
  if (typeof openBookingModal !== "undefined") _targetGlobal.openBookingModal = openBookingModal;
  if (typeof closeBookingModal !== "undefined") _targetGlobal.closeBookingModal = closeBookingModal;
  if (typeof confirmBooking !== "undefined") _targetGlobal.confirmBooking = confirmBooking;
  if (typeof cancelMemberBooking !== "undefined") _targetGlobal.cancelMemberBooking = cancelMemberBooking;
  if (typeof openDisciplineDetail !== "undefined") _targetGlobal.openDisciplineDetail = openDisciplineDetail;
  if (typeof closeDisciplineDetail !== "undefined") _targetGlobal.closeDisciplineDetail = closeDisciplineDetail;
  if (typeof renderDisciplineDetailModal !== "undefined") _targetGlobal.renderDisciplineDetailModal = renderDisciplineDetailModal;
  if (typeof openCoachDetail !== "undefined") _targetGlobal.openCoachDetail = openCoachDetail;
  if (typeof closeCoachDetail !== "undefined") _targetGlobal.closeCoachDetail = closeCoachDetail;
  if (typeof renderCoachDetailModal !== "undefined") _targetGlobal.renderCoachDetailModal = renderCoachDetailModal;
  if (typeof scrollToCoachSection !== "undefined") _targetGlobal.scrollToCoachSection = scrollToCoachSection;
}
