// =========================================================================
// MEMBER WEB APP (GUEST LANDING, CATALOG, CLASSES, SCHEDULE, STATS, PASS)
// =========================================================================

// =========================================================================
// 2. MEMBER WEB APP: FULL CONSUMER PORTAL (TOP NAVBAR, 5 OPERATIONAL PAGES)
// =========================================================================
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

            <!-- Desktop Nav Menu: Lớp Học / Gói Hội Viên -->
            <nav class="hidden md:flex items-center space-x-1">
              <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${currentTab === 'member-classes' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                Lớp Học
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
              <div class="pt-1 flex items-center space-x-3 text-xs text-slate-400">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-amber-300 font-bold">
                  ★ 4.8 / 5.0
                </span>
                <span>Hơn 500 học viên tham gia</span>
              </div>
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
            <div class="flex items-center space-x-4">
              <span>SWP391 FA26 Topic 04</span>
              <span>&bull;</span>
              <span>FPT University</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
}

// Landing / Homepage: Sports Center Discovery & App Introduction (Student Demo Data)
const GYM_MEMBER_LANDING_DATA = {
  info: {
    name: 'Sport Center',
    badge: 'Hệ Thống Quản Lý Thể Thao • Dự Án Demo',
    tagline: 'Rèn Luyện Thể Chất. Nâng Cao Sức Khỏe.',
    subTagline: 'Nền tảng hỗ trợ hội viên dễ dàng tra cứu lịch tập, đặt chỗ lớp học, quản lý gói tập và theo dõi tiến trình rèn luyện sức khỏe hiệu quả.',
    address: 'FPT University, District 9, Ho Chi Minh City',
    hours: '06:00 – 21:30 (Thứ 2 – Chủ Nhật)',
    hotline: '1900 0000',
    email: 'support@sportcenter.demo'
  },
  stats: [
    { value: '500+', label: 'Hội Viên', sub: 'Học viên tham gia tập luyện thường xuyên', color: 'from-blue-500 to-indigo-600' },
    { value: '20+', label: 'Huấn Luyện Viên', sub: 'Đội ngũ HLV giàu kinh nghiệm & tận tâm', color: 'from-emerald-500 to-teal-600' },
    { value: '30+', label: 'Lớp Học', sub: 'Lịch học phân bổ linh hoạt trong tuần', color: 'from-amber-500 to-orange-600' },
    { value: '4.8/5', label: 'Đánh Giá Trung Bình', sub: 'Phản hồi tích cực từ học viên hệ thống', color: 'from-rose-500 to-pink-600' }
  ],
  classes: [
    {
      id: 'gym',
      category: 'Gym',
      title: 'Gym & Thể Lực',
      tag: 'Khu Vực Gym',
      badge: 'Rèn Luyện Sức Bền',
      rating: '4.8 ★',
      level: 'Cơ bản & Nâng cao',
      desc: 'Trang bị máy tập đa dạng hỗ trợ tập luyện sức mạnh, tăng cường thể lực và cải thiện vóc dáng săn chắc.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'yoga',
      category: 'Yoga',
      title: 'Yoga Phục Hồi & Dẻo Dai',
      tag: 'Studio Yoga',
      badge: 'Thư Giãn Thân Tâm',
      rating: '4.9 ★',
      level: 'Mọi trình độ',
      desc: 'Tập trung điều hòa nhịp thở, tăng tính linh hoạt cơ khớp và giải tỏa căng thẳng sau giờ học tập, làm việc.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'boxing',
      category: 'Boxing',
      title: 'Boxing Cơ Bản',
      tag: 'Phòng Boxing',
      badge: 'Phản Xạ & Tim Mạch',
      rating: '4.8 ★',
      level: 'Cường độ vừa & cao',
      desc: 'Rèn luyện phản xạ nhanh nhạy, kỹ thuật đấm cơ bản và giải phóng năng lượng hiệu quả cùng huấn luyện viên.',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'pilates',
      category: 'Pilates',
      title: 'Pilates Cải Thiện Tư Thế',
      tag: 'Studio Pilates',
      badge: 'Cơ Trọng Tâm',
      rating: '4.8 ★',
      level: 'Cơ bản',
      desc: 'Bài tập tác động nhóm cơ lõi sâu, hỗ trợ cân chỉnh tư thế cột sống và duy trì độ linh hoạt của cơ thể.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
    }
  ],
  features: [
    {
      title: 'Đăng Ký & Đặt Lớp Trực Tuyến',
      desc: 'Hội viên chủ động tra cứu lịch học theo bộ môn và đặt chỗ lớp trước dễ dàng ngay trên hệ thống.',
      badge: 'Đặt Chỗ Nhanh Chóng',
      actionText: 'Xem Lớp Học',
      actionTab: 'member-classes'
    },
    {
      title: 'Quản Lý Lịch Tập Cá Nhân',
      desc: 'Theo dõi chi tiết các ca tập đã đăng ký trong tuần, nhận nhắc nhở và quản lý thời gian tập khoa học.',
      badge: 'Lịch Tập Khoa Học',
      actionText: 'Lịch Của Tôi',
      actionTab: 'member-schedule'
    },
    {
      title: 'Check-in Điểm Danh Tiện Lợi',
      desc: 'Hỗ trợ điểm danh nhanh qua mã thẻ thành viên điện tử khi đến trung tâm, lưu vết lịch sử check-in chuẩn xác.',
      badge: 'Điểm Danh Nhanh',
      actionText: 'Thẻ Hội Viên',
      actionTab: 'member-pass'
    },
    {
      title: 'Theo Dõi Gói Hội Viên',
      desc: 'Tra cứu thông tin gói tập hiện tại, ngày bắt đầu, ngày hết hạn và quyền lợi sử dụng một cách minh bạch.',
      badge: 'Minh Bạch Quyền Lợi',
      actionText: 'Xem Gói Tập',
      actionTab: 'member-packages'
    },
    {
      title: 'Theo Dõi Lịch Sử & Thể Lực',
      desc: 'Ghi nhận lịch sử buổi tập đã tham gia, theo dõi các chỉ số cơ bản giúp học viên đánh giá tiến trình tập.',
      badge: 'Theo Dõi Tiến Trình',
      actionText: 'Thông Số Thể Lực',
      actionTab: 'member-fitness'
    },
    {
      title: 'Quản Lý Thông Tin Cá Nhân',
      desc: 'Cập nhật hồ sơ thành viên, thông tin liên hệ và cài đặt bảo mật tài khoản an toàn, nhanh chóng.',
      badge: 'Bảo Mật & Tiện Ích',
      actionText: 'Trang Hồ Sơ',
      actionTab: 'member-profile'
    }
  ]
};

function quickExploreCategory(cat) {
  appState.activeFilterCategory = cat;
  appState.memberSearchKeyword = '';
  switchTab('member-classes');
}

function handleHomeSearch(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('home-search-input');
  if (input) {
    appState.memberSearchKeyword = input.value.trim();
  }
  switchTab('member-classes');
  return false;
}

function renderMemberLandingHome() {
  const rawPkgs = (appState.data && appState.data.packages) ? appState.data.packages : [];
  const pkgs = rawPkgs
    .map(p => (typeof normalizePackage === 'function' ? normalizePackage(p) : p))
    .filter(p => p && (p.status || 'ACTIVE').toUpperCase() === 'ACTIVE');

  return `
    <div class="space-y-16 sm:space-y-20 animate-fade-in pb-8 overflow-x-hidden">
      
      <!-- 1. HERO SECTION -->
      <section class="relative rounded-3xl overflow-hidden shadow-2xl min-h-[500px] sm:min-h-[580px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 text-white border border-slate-800/80">
        <!-- Background Image with Multi-layer Gradient Overlay -->
        <div class="absolute inset-0 z-0">
          <img 
            src="/assets/images/gym-bg.jpg" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80';"
            alt="Sport Center Gym Floor" 
            class="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-indigo-950/40"></div>
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <!-- Top Badge -->
        <div class="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-sm transition">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>${info.badge}</span>
          </div>
          <div class="hidden sm:flex items-center space-x-4 text-xs text-slate-300 font-medium">
            <span class="flex items-center gap-1.5"><span class="text-amber-400">★</span> Đánh giá 4.8/5 từ hơn 500 học viên</span>
          </div>
        </div>

        <!-- Hero Main Content -->
        <div class="relative z-10 max-w-3xl my-auto py-8 sm:py-10 space-y-5">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Đánh Thức Thể Lực. <br />
            <span class="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Định Hình Phong Cách Sống.
            </span>
          </h1>
          <p class="text-slate-200 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl font-normal drop-shadow-sm">
            ${info.subTagline}
          </p>

          <!-- 2 CTA Chính Thống Nhất -->
          <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-md sm:max-w-none">
            <button 
              type="button" 
              onclick="switchTab('member-classes')" 
              class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover-lift-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Khám Phá Lớp Học</span>
              <span class="text-base">&rarr;</span>
            </button>
            <button 
              type="button" 
              onclick="switchTab('member-packages')" 
              class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-sm rounded-2xl transition-all duration-200 flex items-center justify-center hover-lift-sm"
            >
              Xem Bảng Giá Gói Tập
            </button>
          </div>
        </div>
      </section>

      <!-- 2. QUICK INFO SECTION -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover-lift transition-all duration-200 flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            📍
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-blue-600">Địa Điểm Trung Tâm</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">${info.address}</div>
            <div class="text-xs text-slate-500 mt-1">Khuôn viên trường Đại học FPT TP.HCM</div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover-lift transition-all duration-200 flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            ⏰
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-emerald-600">Giờ Mở Cửa</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">${info.hours}</div>
            <div class="text-xs text-slate-500 mt-1">Phục vụ học viên tất cả các ngày trong tuần</div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover-lift transition-all duration-200 flex items-start space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            📞
          </div>
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-amber-600">Hotline Hỗ Trợ</div>
            <div class="font-extrabold text-slate-900 text-sm mt-0.5">Hotline: ${info.hotline}</div>
            <div class="text-xs text-slate-500 mt-1">Hỗ trợ thông tin tài khoản và đăng ký gói</div>
          </div>
        </div>
      </section>

      <!-- 3. STATISTICS BAR (Số liệu demo hợp lý cho đồ án) -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        ${GYM_MEMBER_LANDING_DATA.stats.map(s => `
          <div class="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover-lift transition-all duration-300 relative overflow-hidden group">
            <div class="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent tracking-tight">
              ${s.value}
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-slate-900 mt-2">${s.label}</div>
            <div class="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">${s.sub}</div>
            <div class="w-8 h-1 bg-gradient-to-r ${s.color} rounded-full mt-3 group-hover:w-16 transition-all duration-300"></div>
          </div>
        `).join('')}
      </section>

      <!-- 4. FEATURED CLASSES & DISCIPLINES (Gym, Yoga, Boxing, Pilates) -->
      <section class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="max-w-2xl">
            <div class="text-xs font-black uppercase tracking-wider text-blue-600">Bộ Môn Tập Luyện</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Các Bộ Môn Thể Thao
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Các bộ môn được tổ chức đa dạng với lịch học phù hợp cho học viên và được hướng dẫn bởi huấn luyện viên tận tình.
            </p>
          </div>
          <button 
            type="button" 
            onclick="switchTab('member-classes')" 
            class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all duration-200 self-start sm:self-auto shadow-2xs hover-lift-sm"
          >
            <span>Xem Lịch Lớp Học</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          ${GYM_MEMBER_LANDING_DATA.classes.map(item => `
            <div class="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover-lift transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div class="relative h-52 overflow-hidden bg-slate-900">
                  <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" 
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <span class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
                    ${item.tag}
                  </span>
                  <span class="absolute bottom-3 left-3.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-blue-600 text-white shadow-xs">
                    ${item.badge}
                  </span>
                  <span class="absolute bottom-3 right-3.5 text-xs font-black text-amber-300 drop-shadow-sm">
                    ${item.rating}
                  </span>
                </div>

                <div class="p-6 space-y-3">
                  <h3 class="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    ${item.title}
                  </h3>
                  <p class="text-xs text-slate-500 leading-relaxed font-normal">
                    ${item.desc}
                  </p>
                </div>
              </div>

              <div class="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">${item.level}</span>
                <button 
                  type="button" 
                  onclick="quickExploreCategory('${item.category}')" 
                  class="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>Xem chi tiết</span>
                  <span class="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 5. SYSTEM FEATURES (Giới thiệu các chức năng cốt lõi của hệ thống Sport Center) -->
      <section class="space-y-8">
        <div class="max-w-2xl">
          <div class="text-xs font-black uppercase tracking-wider text-blue-600">Tính Năng Phần Mềm</div>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
            Tính Năng Của Hệ Thống Sport Center
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Hệ thống cung cấp đầy đủ các tiện ích số hóa giúp học viên và quản trị viên dễ dàng quản lý quá trình luyện tập và dịch vụ.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${GYM_MEMBER_LANDING_DATA.features.map(feat => `
            <div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover-lift transition-all duration-200 flex flex-col justify-between">
              <div>
                <div class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 mb-3">
                  ${feat.badge}
                </div>
                <h3 class="text-base font-extrabold text-slate-900">${feat.title}</h3>
                <p class="text-xs text-slate-500 mt-2 leading-relaxed font-normal">${feat.desc}</p>
              </div>
              <div class="pt-5 mt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onclick="switchTab('${feat.actionTab}')" 
                  class="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center space-x-1"
                >
                  <span>${feat.actionText}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 6. COACHES SPOTLIGHT SECTION (Đội ngũ Huấn Luyện Viên) -->
      <section id="coach-section" class="space-y-8 scroll-mt-24">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="max-w-2xl">
            <div class="text-xs font-black uppercase tracking-wider text-blue-600">Đội Ngũ HLV</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Đội Ngũ Huấn Luyện Viên
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Đội ngũ huấn luyện viên giàu kinh nghiệm, tận tình hướng dẫn kỹ thuật và đồng hành cùng học viên trong suốt quá trình tập luyện.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-3xl border border-slate-200/90 p-6 flex items-center space-x-4 shadow-xs hover-lift transition-all duration-200">
            <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80" alt="Coach Trần Hoàng Nam" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0" />
            <div>
              <div class="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">HLV Boxing & Thể Lực</div>
              <h3 class="font-extrabold text-slate-900 text-base mt-1">Trần Hoàng Nam</h3>
              <p class="text-xs text-slate-500 mt-0.5">Nhiều năm kinh nghiệm giảng dạy Boxing & Kickfit</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/90 p-6 flex items-center space-x-4 shadow-xs hover-lift transition-all duration-200">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" alt="Coach Nguyễn Hà My" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0" />
            <div>
              <div class="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">HLV Yoga & Pilates</div>
              <h3 class="font-extrabold text-slate-900 text-base mt-1">Nguyễn Hà My</h3>
              <p class="text-xs text-slate-500 mt-0.5">Chuyên về phục hồi dẻo dai và điều chỉnh tư thế</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/90 p-6 flex items-center space-x-4 shadow-xs hover-lift transition-all duration-200">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" alt="Coach Lê Quốc Huy" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0" />
            <div>
              <div class="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md inline-block">HLV Gym & Thể Hình</div>
              <h3 class="font-extrabold text-slate-900 text-base mt-1">Lê Quốc Huy</h3>
              <p class="text-xs text-slate-500 mt-0.5">Tư vấn phương pháp tập luyện cơ bắp an toàn, hiệu quả</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. POPULAR PACKAGES PREVIEW (Gói Basic, Standard, Premium Demo) -->
      <section class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="max-w-2xl">
            <div class="text-xs font-black uppercase tracking-wider text-blue-600">Đăng Ký Linh Hoạt</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Các Gói Hội Viên
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Các gói thẻ hội viên mẫu với thời hạn và quyền lợi phù hợp nhu cầu tập luyện của học viên.
            </p>
          </div>
          <button 
            type="button" 
            onclick="switchTab('member-packages')" 
            class="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả gói &rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          ${pkgs.map(pkg => `
            <div class="rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              pkg.popular 
                ? 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white shadow-2xl ring-2 ring-indigo-500/80 hover-lift' 
                : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs hover-lift'
            }">
              ${pkg.popular ? `
                <div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  ★ PHỔ BIẾN NHẤT
                </div>
              ` : ''}

              <div>
                <div class="text-[11px] font-bold ${pkg.popular ? 'text-indigo-300' : 'text-slate-400'} uppercase tracking-wider">
                  Thời hạn: ${pkg.durationDays || 30} Ngày
                </div>
                <h3 class="text-xl font-extrabold tracking-tight mt-1">${pkg.name}</h3>
                <p class="text-xs ${pkg.popular ? 'text-slate-300' : 'text-slate-500'} mt-1.5 leading-relaxed">${pkg.description}</p>
                
                <div class="mt-6 pb-6 border-b ${pkg.popular ? 'border-white/10' : 'border-slate-100'}">
                  <div class="text-3xl sm:text-4xl font-black">
                    ${(pkg.price || 0).toLocaleString()} <span class="text-sm font-semibold ${pkg.popular ? 'text-slate-300' : 'text-slate-500'}">VND</span>
                  </div>
                </div>

                <div class="py-6 space-y-3">
                  ${(pkg.features || []).map(f => `
                    <div class="flex items-start space-x-2.5 text-xs sm:text-sm">
                      <span class="${pkg.popular ? 'text-amber-400 font-black' : 'text-blue-600 font-bold'} flex-shrink-0">✓</span>
                      <span class="${pkg.popular ? 'text-slate-200' : 'text-slate-700'}">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4">
                <button 
                  type="button" 
                  onclick="openCheckoutModal('${pkg.packageId || pkg.id}')" 
                  class="w-full py-3 rounded-2xl font-bold text-xs transition shadow-sm ${
                    pkg.popular 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white hover-lift-sm' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover-lift-sm'
                  }"
                >
                  Đăng Ký Gói Này &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 8. FINAL CALL TO ACTION (CTA & Dòng ghi chú demo) -->
      <section class="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
        <!-- Subtle Glow Accent -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-2xl space-y-4 text-center lg:text-left relative z-10">
          <div class="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-white/15">
            Trải Nghiệm Hệ Thống
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Sẵn Sàng Bắt Đầu Luyện Tập Cùng Sport Center?
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
            Đăng ký tài khoản để trải nghiệm các tính năng đặt chỗ lớp học, theo dõi gói thẻ và quản lý lịch tập cá nhân:
          </p>

          <!-- 3 Lợi ích / Tính năng -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-slate-200 font-semibold">
            <span class="flex items-center space-x-1.5">
              <span class="text-emerald-400 font-black text-base">✓</span>
              <span>Đặt lịch lớp nhanh chóng</span>
            </span>
            <span class="flex items-center space-x-1.5">
              <span class="text-emerald-400 font-black text-base">✓</span>
              <span>Quản lý lịch tập tiện lợi</span>
            </span>
            <span class="flex items-center space-x-1.5">
              <span class="text-emerald-400 font-black text-base">✓</span>
              <span>Theo dõi tiến trình rèn luyện</span>
            </span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full sm:w-auto relative z-10">
          <button 
            type="button" 
            onclick="openLoginScreen('register')" 
            class="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover-lift transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Đăng Ký Ngay</span>
            <span class="text-base">&rarr;</span>
          </button>
          <button 
            type="button" 
            onclick="switchTab('member-classes')" 
            class="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex items-center justify-center"
          >
            Khám Phá Lớp Học
          </button>
        </div>
      </section>

      <!-- Dòng ghi chú nhỏ mang tính minh họa đồ án -->
      <div class="text-center text-[11px] text-slate-400 pt-1">
        * Thông tin trên trang mang tính minh họa cho mục đích demo đồ án Sport Center Management System.
      </div>

    </div>
  `;
}

function renderMemberClassDiscovery() {
  const categories = ['ALL', 'Yoga', 'Boxing', 'Zumba', 'Pilates'];
  const activeCat = appState.activeFilterCategory;
  const keyword = (appState.memberSearchKeyword || '').toLowerCase().trim();
  const sortOption = appState.memberClassSort || 'TIME_ASC';

  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  let classes = rawClasses.map(c => resolveClass(c));

  // Filter
  let filtered = classes.filter(c => {
    const matchCat = activeCat === 'ALL' || c.category === activeCat;
    const matchKey = !keyword || c.title.toLowerCase().includes(keyword) || c.coachName.toLowerCase().includes(keyword) || c.room.toLowerCase().includes(keyword);
    return matchCat && matchKey;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortOption === 'SEATS_DESC') {
      const remainingA = (a.maxCapacity || 20) - (a.bookedSeats || 0);
      const remainingB = (b.maxCapacity || 20) - (b.bookedSeats || 0);
      return remainingB - remainingA;
    }
    if (sortOption === 'NAME_ASC') {
      return a.title.localeCompare(b.title, 'vi');
    }
    // Default: TIME_ASC (by schedule time string)
    return (a.time || '').localeCompare(b.time || '');
  });

  return `
    <div class="space-y-6 animate-fade-in pb-4">
      <!-- 1. PREMIUM HERO (Subtle Pattern, Ambient Glow, Minimalist Typography) -->
      <div class="relative rounded-3xl p-7 sm:p-11 text-white overflow-hidden shadow-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0b1329] to-[#0f172a]">
        <!-- Subtle Grid Pattern Background -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        
        <!-- Ambient Glow Accents -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute left-1/3 -bottom-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div class="max-w-2xl space-y-3">
            <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-xs">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Lịch Học & Đặt Chỗ Trực Tuyến</span>
            </div>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Khám Phá Các Lớp Học Thể Thao
            </h2>
            <p class="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-xl">
              Chủ động đặt trước vị trí tại các studio đẳng cấp cùng Master Coach hàng đầu. Toàn quyền tham gia các bộ môn Yoga, Boxing, Zumba và Pilates trong gói thẻ hội viên.
            </p>
          </div>

          <!-- Premium Stat Badge -->
          <div class="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl flex-shrink-0 self-start lg:self-auto">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg">
              ⚡
            </div>
            <div>
              <div class="text-sm font-black text-white">120+ Lớp Học/Tuần</div>
              <div class="text-[11px] text-slate-400">Master Coach Chuẩn Quốc Tế</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. UNIFIED FILTER & CONTROL BAR (Tabs + Sorting + Search) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 transition-all duration-200">
        <!-- Category Tabs -->
        <div class="flex items-center space-x-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          ${categories.map(cat => `
            <button 
              type="button" 
              onclick="setMemberCategoryFilter('${cat}')" 
              class="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeCat === cat 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }"
            >
              ${cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          `).join('')}
        </div>

        <!-- Controls Right: Sort Dropdown & Search Bar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <!-- Sort Dropdown -->
          <div class="relative flex-shrink-0">
            <select 
              onchange="setMemberClassSort(this.value)" 
              class="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition"
            >
              <option value="TIME_ASC" ${sortOption === 'TIME_ASC' ? 'selected' : ''}>Thời gian sớm nhất</option>
              <option value="SEATS_DESC" ${sortOption === 'SEATS_DESC' ? 'selected' : ''}>Còn nhiều chỗ nhất</option>
              <option value="NAME_ASC" ${sortOption === 'NAME_ASC' ? 'selected' : ''}>Tên lớp (A &rarr; Z)</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
              ▼
            </div>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Tìm lớp, HLV, phòng..." 
              value="${appState.memberSearchKeyword}" 
              oninput="setMemberSearchKeyword(this.value)" 
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition" 
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 3. CLASS CARDS GRID & EMPTY STATE -->
      ${filtered.length === 0 ? `
        <!-- 8. REFINED EMPTY STATE -->
        <div class="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center shadow-xs space-y-4 animate-fade-in">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            🔍
          </div>
          <div class="max-w-md mx-auto space-y-1.5">
            <h3 class="text-base sm:text-lg font-black text-slate-900">Không tìm thấy lớp học phù hợp</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Thử chọn bộ môn khác hoặc thay đổi từ khóa tìm kiếm để khám phá thêm lịch học trong tuần.
            </p>
          </div>
          <div>
            <button 
              type="button" 
              onclick="setMemberCategoryFilter('ALL'); setMemberSearchKeyword('');" 
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs hover-lift-sm"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      ` : `
        <!-- 4 columns on desktop, 2 columns on tablet, 1 column on mobile -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          ${filtered.map(c => {
            const maxCap = c.maxCapacity || 20;
            const remaining = Math.max(0, maxCap - (c.bookedSeats || 0));
            const isFull = remaining <= 0;
            const isAlmostFull = remaining > 0 && remaining <= 5;

            // 6. BOOKING STATUS (3 Trạng thái chuẩn)
            let badgeBg = 'bg-emerald-600 text-white';
            let badgeText = `Còn ${remaining}/${maxCap} chỗ`;
            if (isFull) {
              badgeBg = 'bg-rose-500 text-white font-black';
              badgeText = 'Hết chỗ';
            } else if (isAlmostFull) {
              badgeBg = 'bg-amber-500 text-slate-950 font-black';
              badgeText = `Sắp đầy (${remaining} chỗ)`;
            }

            return `
              <div class="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover-lift transition-all duration-300 flex flex-col justify-between group h-full">
                <!-- Card Header Image & Badges with Quick View Trigger -->
                <div>
                  <div class="h-44 w-full relative overflow-hidden bg-slate-900 aspect-video">
                    <img 
                      src="${c.image}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" 
                      alt="${c.title}" 
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>
                    
                    <!-- Subject Category Tag -->
                    <div class="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-900 shadow-xs">
                      ${c.category}
                    </div>

                    <!-- Booking Status Badge -->
                    <div class="absolute top-3 right-3 ${badgeBg} px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                      ${badgeText}
                    </div>

                    <!-- 5. QUICK VIEW BUTTON (Hiển thị mượt mà khi hover) -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <button 
                        type="button" 
                        onclick="openClassQuickView('${c.id}')" 
                        class="pointer-events-auto px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-all duration-200 flex items-center space-x-1.5"
                      >
                        <span>👁</span>
                        <span>Xem Nhanh</span>
                      </button>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="p-5 space-y-3.5">
                    <div>
                      <h3 class="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-1" title="${c.title}">
                        ${c.title}
                      </h3>
                      <p class="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed" title="${c.description}">
                        ${c.description}
                      </p>
                    </div>

                    <!-- Card Essential Specs (Thời gian, Ngày, Phòng, HLV) -->
                    <div class="space-y-2 pt-2.5 border-t border-slate-100 text-xs">
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">Thời gian:</span>
                        <span class="font-bold text-slate-800 text-right">${c.time}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">Lịch tập:</span>
                        <span class="font-semibold text-slate-700 text-right">${c.days}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">Phòng tập:</span>
                        <span class="font-semibold text-slate-700 text-right truncate max-w-[130px]">${c.room}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">HLV:</span>
                        <span class="font-bold text-blue-600 text-right truncate max-w-[130px]">${c.coachName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Action Button -->
                <div class="p-5 pt-0">
                  <button 
                    type="button" 
                    onclick="openBookingModal('${c.id}')" 
                    ${isFull ? 'disabled' : ''} 
                    class="w-full py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 text-center flex items-center justify-center space-x-1.5 group/btn ${
                      isFull 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md hover-lift-sm'
                    }"
                  >
                    <span>${isFull ? 'Đã Hết Chỗ' : 'Đặt Chỗ Ngay'}</span>
                    ${!isFull ? '<span class="group-hover/btn:translate-x-1 transition-transform duration-200">&rarr;</span>' : ''}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderMemberPackageCatalog() {
  const rawPackages = (appState.data && appState.data.packages) ? appState.data.packages : [];
  // Member CHỈ nhìn thấy các gói đang ACTIVE
  const packages = rawPackages
    .map(pkg => (typeof normalizePackage === 'function' ? normalizePackage(pkg) : pkg))
    .filter(pkg => pkg && (pkg.status || 'ACTIVE').toUpperCase() === 'ACTIVE');

  return `
    <div class="space-y-8 animate-fade-in pb-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          Bảng Giá Minh Bạch
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Chọn Gói Thẻ Hội Viên Phù Hợp</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-2">
          Đăng ký hoặc gia hạn trực tuyến tức thì. Hệ thống hỗ trợ thanh toán chuyển khoản và bảo mật tự động.
        </p>
      </div>

      ${packages.length === 0 ? `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div class="text-4xl mb-3">&#x1f4e6;</div>
          <h3 class="font-extrabold text-slate-900 text-base">Hiện Chưa Có Gói Tập Đang Mở Bán</h3>
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Các gói tập hiện tại đang được trung tâm cập nhật. Vui lòng quay lại sau hoặc liên hệ quầy lễ tân để được hỗ trợ!
          </p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${packages.map(pkg => `
            <div class="bg-white rounded-2xl border ${pkg.popular ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-xs'} p-6 flex flex-col justify-between relative hover:shadow-lg transition">
              ${pkg.popular ? `
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                  Gói Phổ Biến Nhất
                </div>
              ` : ''}

              <div>
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${pkg.durationDays || 30} Ngày Sử Dụng</div>
                <h3 class="text-lg font-black text-slate-900 mt-1">${pkg.name}</h3>
                <p class="text-xs text-slate-500 mt-2 min-h-[36px] line-clamp-3">${pkg.description || 'Truy cập đầy đủ dịch vụ trung tâm thể thao.'}</p>

                <div class="mt-4 pt-4 border-t border-slate-100">
                  <div class="text-2xl font-black text-slate-900">${(Number(pkg.price || 0)).toLocaleString()} <span class="text-xs font-normal text-slate-500">VND</span></div>
                </div>

                <div class="mt-5 space-y-2 text-xs text-slate-600">
                  <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Quyền lợi gói:</div>
                  ${(pkg.features || [
                    'Tập luyện tự do toàn bộ máy Gym & Cardio',
                    'Tủ đồ thông minh & phòng tắm nóng lạnh',
                    'Nước uống lọc tinh khiết miễn phí'
                  ]).map(f => `
                    <div class="flex items-start space-x-2">
                      <span class="text-indigo-600 font-bold">&check;</span>
                      <span>${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="mt-8 pt-4 border-t border-slate-100">
                <button type="button" onclick="openCheckoutModal('${pkg.packageId || pkg.id}')" class="w-full py-2.5 ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} rounded-xl font-bold text-xs transition shadow-xs">
                  Đăng Ký Gói Này
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderMemberMySchedule() {
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Lịch Tập & Lớp Đã Đăng Ký</h2>
          <p class="text-xs text-slate-500 mt-0.5">Lịch tháng hiển thị các buổi tập theo ngày có chấm chỉ báo. Bấm vào ngày để xem chi tiết.</p>
        </div>
        <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">
          + Đặt Thêm Lớp Mới
        </button>
      </div>

      ${renderMonthlyCalendarComponent('MEMBER')}
    </div>
  `;
}

function _unused_old_renderMemberMySchedule() {

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Lịch Tập & Lớp Đã Đăng Ký</h2>
          <p class="text-xs text-slate-500 mt-0.5">Danh sách các lớp thể thao bạn đã đặt chỗ thành công.</p>
        </div>
        <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">
          + Đặt Thêm Lớp Mới
        </button>
      </div>

      ${myClasses.length === 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div class="text-slate-400 text-sm font-semibold">Bạn chưa đặt chỗ lớp học nào trong tuần này.</div>
          <button type="button" onclick="switchTab('member-classes')" class="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
            Khám phá lịch lớp ngay
          </button>
        </div>
      ` : `
        <div class="space-y-4">
          ${myClasses.map(c => {
            const att = c.attendees.find(a => a.id === member.id);
            return `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                  <img src="${c.image}" class="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <div class="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase mb-1">${c.category}</div>
                    <h3 class="font-extrabold text-sm text-slate-900">${c.title}</h3>
                    <div class="text-xs text-slate-500 mt-1">
                      Thời gian: <strong class="text-slate-800">${c.time} (${c.days})</strong> &bull; Phòng: <strong class="text-slate-800">${c.room}</strong>
                    </div>
                    <div class="text-xs text-slate-500">
                      HLV: <span class="text-indigo-600 font-semibold">${c.coachName}</span>
                    </div>

                    ${att?.note ? `
                      <div class="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start space-x-2">
                        <span class="font-black uppercase tracking-wider text-[9px] text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">Nhận xét HLV</span>
                        <span class="font-medium">${att.note}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div class="flex items-center space-x-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${att?.attended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    ${att?.attended ? 'Đã điểm danh có mặt' : 'Đã xác nhận chỗ'}
                  </span>
                  <button type="button" onclick="cancelMemberBooking('${c.id}')" class="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition">
                    Hủy Chỗ
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

// NEW: Member Fitness Progress & InBody Page (ERD: WorkoutResults & TrainingGoal)
function renderMemberFitnessStats() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember);
  const inbody = member?.inbody || { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 };

  // Feedbacks from classes
  const feedbacks = [];
  (appState.data?.classes || []).forEach(c => {
    const att = (c.attendees || []).find(a => a.id === member.id);
    if (att && att.note) {
      feedbacks.push({
        classTitle: c.title,
        coachName: c.coachName,
        note: att.note,
        date: c.days
      });
    }
  });

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="pb-3 border-b border-slate-200">
        <h2 class="text-xl font-extrabold text-slate-900">Hồ Sơ Thể Trạng & Chỉ Số InBody</h2>
        <p class="text-xs text-slate-500 mt-0.5">Theo dõi các chỉ số sinh học và mục tiêu thể hình của bạn.</p>
      </div>

      <!-- InBody 4 Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cân Nặng</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.weight} <span class="text-xs font-normal text-slate-500">kg</span></div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Chuẩn thể trạng</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiều Cao</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.height} <span class="text-xs font-normal text-slate-500">cm</span></div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">Đo gần nhất: 01/08</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Mỡ (Body Fat)</div>
          <div class="text-2xl font-black text-indigo-600 mt-1">${inbody.bodyFat}%</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">&darr; -1.2% so với tháng trước</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chỉ Số BMI</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${inbody.bmi}</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1">Mức bình thường lý tưởng</div>
        </div>
      </div>

      <!-- Training Goal Card -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div class="flex justify-between items-center">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Mục Tiêu Thể Hình Hiện Tại (Training Goal)</div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Đang bám sát lộ trình
          </span>
        </div>
        <div class="text-base font-bold text-slate-900">${member.trainingGoal || 'Giảm mỡ, tăng cơ săn chắc'}</div>
        <p class="text-xs text-slate-500">
          Khuyến nghị từ HLV: Duy trì tối thiểu 3 buổi/tuần, kết hợp 1 buổi Yoga kéo giãn cơ khớp sau các buổi tập nặng.
        </p>
      </div>

      <!-- Personal Workout Plans Card (Strict ERD: WorkoutPlans & MemberPlan) -->
      ${(() => {
        const myMemberPlans = (appState.data?.memberPlans || []).filter(mp => mp.memberId === member.id);
        const workoutPlans = appState.data?.workoutPlans || [];
        const assignedPlans = myMemberPlans.map(mp => {
          const plan = workoutPlans.find(wp => (wp.planId || wp.id) === mp.planId);
          return {
            ...mp,
            plan: plan || { planName: 'Giáo án cá nhân', duration: '4 tuần', exercises: 'Đang cập nhật', dueDate: '2026-10-31' }
          };
        });

        return `
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Lộ Trình Giáo Án Riêng Do HLV Phụ Trách (Workout Plans)
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Giáo án luyện tập chuyên biệt thiết kế riêng cho mục tiêu và thể trạng của bạn.</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${assignedPlans.length} lộ trình đã giao
              </span>
            </div>

            ${assignedPlans.length === 0 ? `
              <div class="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                Bạn chưa có giáo án riêng nào được giao. HLV sẽ thiết kế lộ trình sau khi hoàn thành buổi kiểm tra InBody đầu tiên!
              </div>
            ` : `
              <div class="space-y-3">
                ${assignedPlans.map(item => `
                  <div class="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 transition space-y-2">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span class="font-bold text-xs text-slate-900">${item.plan.planName}</span>
                        <span class="text-[10px] text-slate-400 font-mono">(${item.planId})</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-[11px] text-slate-500 font-medium">Thời lượng: <b>${item.plan.duration}</b></span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}">
                          ${item.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                        </span>
                      </div>
                    </div>

                    <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                      <span class="font-bold text-indigo-700">Chi tiết bài tập:</span> ${item.plan.exercises}
                    </div>

                    <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Ngày bắt đầu: <b>${item.assignedDate}</b></span>
                      <span>Hạn hoàn thành: <b class="text-rose-600">${item.plan.dueDate}</b></span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      })()}

      <!-- Coach Feedbacks History -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Lịch Sử Đánh Giá & Nhận Xét Chuyên Môn Của HLV (Workout Feedback)
        </h3>

        ${feedbacks.length === 0 ? `
          <div class="text-xs text-slate-400 py-4 text-center">Chưa có nhận xét nào từ HLV sau các buổi tập.</div>
        ` : `
          <div class="divide-y divide-slate-100">
            ${feedbacks.map(f => `
              <div class="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div class="text-xs font-bold text-slate-900">${f.classTitle} &bull; <span class="text-indigo-600">HLV ${f.coachName}</span></div>
                  <div class="text-xs text-slate-600 mt-1">"${f.note}"</div>
                </div>
                <span class="text-[11px] text-slate-400">${f.date}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ENHANCED: Member Digital Pass & Personal Invoices History
function renderMemberDigitalPass() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember);
  const myInvoices = (appState.data?.invoices || []).filter(inv => inv.memberId === member.id);

  return `
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Digital Pass Card -->
      <div class="max-w-md mx-auto space-y-4">
        <div class="text-center">
          <h2 class="text-xl font-extrabold text-slate-900">Thẻ Hội Viên Điện Tử</h2>
          <p class="text-xs text-slate-500 mt-0.5">Sử dụng mã QR này để quẹt qua cổng Turnstile tự động tại trung tâm.</p>
        </div>

        <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">SPORTS CENTER PASS</div>
              <div class="text-lg font-black tracking-tight mt-1">${member.activePackage}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${member.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'}">
              ${member.status}
            </span>
          </div>

          <!-- Simulated QR Code Container -->
          <div class="my-6 bg-white p-4 rounded-2xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-inner">
            <div class="w-32 h-32 border-4 border-slate-900 p-2 flex flex-col justify-between">
              <div class="flex justify-between">
                <div class="w-7 h-7 bg-slate-900"></div>
                <div class="w-7 h-7 bg-slate-900"></div>
              </div>
              <div class="text-center font-black text-xs text-slate-900 tracking-widest">${member.id}</div>
              <div class="flex justify-between">
                <div class="w-7 h-7 bg-slate-900"></div>
                <div class="w-3 h-3 bg-slate-900 self-end"></div>
              </div>
            </div>
            <div class="text-[9px] font-bold text-slate-500 mt-1.5 uppercase tracking-wider">QR Code Cổng Check-in</div>
          </div>

          <div class="pt-4 border-t border-white/10 flex justify-between items-end text-xs">
            <div>
              <div class="text-slate-400 text-[10px] uppercase font-semibold">Chủ thẻ</div>
              <div class="font-bold text-sm text-white">${member.name}</div>
              <div class="text-slate-400 text-[11px]">${member.phone}</div>
            </div>
            <div class="text-right">
              <div class="text-slate-400 text-[10px] uppercase font-semibold">Thời hạn thẻ</div>
              <div class="font-bold text-emerald-400">${member.endDate}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Invoices / Payment History Table -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Lịch Sử Hóa Đơn Thanh Toán Cá Nhân</h3>
          <div class="text-xs text-slate-400">Các giao dịch mua gói tập và gia hạn của bạn</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
              <tr>
                <th class="py-3 px-4">Mã Hóa Đơn</th>
                <th class="py-3 px-4">Gói Đăng Ký</th>
                <th class="py-3 px-4">Số Tiền</th>
                <th class="py-3 px-4">Hình Thức</th>
                <th class="py-3 px-4">Ngày Thanh Toán</th>
                <th class="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${myInvoices.map(inv => `
                <tr class="hover:bg-slate-50/70 transition">
                  <td class="py-3 px-4 font-bold text-slate-900">${inv.id}</td>
                  <td class="py-3 px-4 font-semibold text-indigo-700">${inv.packageName}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${(inv.amount).toLocaleString()} đ</td>
                  <td class="py-3 px-4 text-slate-600">${inv.paymentMethod}</td>
                  <td class="py-3 px-4 text-slate-500">${inv.date}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${inv.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Support Tickets & Inquiries (Strict ERD: SupportTickets) -->
      ${(() => {
        const myTickets = (appState.data?.supportTickets || []).filter(t => t.memberId === member.id);
        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Phiếu Yêu Cầu Hỗ Trợ & Khiếu Nại (Support Tickets)</h3>
                <div class="text-xs text-slate-400">Gửi phản hồi trực tiếp tới quầy lễ tân khi gặp sự cố, quên đồ hoặc cần trợ giúp</div>
              </div>
              <button type="button" onclick="openSupportTicketModal()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">
                + Gửi Yêu Cầu Hỗ Trợ Mới
              </button>
            </div>

            ${myTickets.length === 0 ? `
              <div class="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Bạn chưa gửi yêu cầu hỗ trợ nào. Khi cần hỗ trợ hãy bấm vào nút phía trên!
              </div>
            ` : `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                    <tr>
                      <th class="py-3 px-4">Mã Phiếu</th>
                      <th class="py-3 px-4">Nội Dung Yêu Cầu</th>
                      <th class="py-3 px-4">Thời Gian Gửi</th>
                      <th class="py-3 px-4">Trạng Thái</th>
                      <th class="py-3 px-4">Phản Hồi Lễ Tân</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${myTickets.map(t => `
                      <tr class="hover:bg-slate-50/70 transition">
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${t.ticketId || t.id}</td>
                        <td class="py-3.5 px-4 text-slate-800 font-medium max-w-xs">${t.content}</td>
                        <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">${t.createdDate}</td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }">
                            ${
                              t.status === 'RESOLVED' ? 'Đã Giải Quyết' :
                              t.status === 'REJECTED' ? 'Từ Chối' :
                              'Đang Chờ'
                            }
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 max-w-xs">
                          ${
                            t.status === 'REJECTED' ? `<span class="text-rose-700 font-medium">${t.response}</span>` :
                            t.status === 'RESOLVED' ? `<span class="text-emerald-800 font-medium">${t.response}</span>` :
                            '<span class="italic text-slate-400">Lễ tân đang kiểm tra...</span>'
                          }
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        `;
      })()}
    </div>
  `;
}

function renderMemberBookingModal() {
  const c = appState.selectedClassForBooking;
  if (!c) return '';
  const remaining = (c.maxCapacity || 20) - (c.bookedSeats || 0);

  return `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">${c.category}</div>
            <h3 class="text-lg font-black text-slate-900 mt-0.5">${c.title}</h3>
          </div>
          <button type="button" onclick="closeBookingModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
          <div class="flex justify-between">
            <span class="text-slate-400">Thời gian:</span>
            <span class="font-bold text-slate-800">${c.time} (${c.days})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Phòng tập:</span>
            <span class="font-bold text-slate-800">${c.room}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Huấn luyện viên:</span>
            <span class="font-bold text-indigo-600">${c.coachName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Chỗ trống còn lại:</span>
            <span class="font-bold text-emerald-600">${remaining} / ${c.maxCapacity} chỗ</span>
          </div>
        </div>

        <div class="mt-4 text-xs text-slate-500">
          * Bạn có thể hủy đặt chỗ trước giờ học tối thiểu 2 tiếng mà không bị tính phí.
        </div>

        <div class="mt-6 flex space-x-3">
          <button type="button" onclick="closeBookingModal()" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
            Đóng
          </button>
          <button type="button" onclick="confirmBooking('${c.id}')" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Xác Nhận Đặt Chỗ
          </button>
        </div>
      </div>
    </div>
  `;
}


function setMemberCategoryFilter(cat) {
  appState.activeFilterCategory = cat;
  renderApp();
}

function setMemberSearchKeyword(kw) {
  appState.memberSearchKeyword = kw;
  renderApp();
}

function openBookingModal(classId) {
  if (!appState.isAuthenticated) {
    showToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập tài khoản hội viên để đặt chỗ lớp học!', 'info');
    openLoginScreen('login');
    return;
  }
  const c = appState.data.classes.find(item => item.id === classId || item.classId === classId);
  if (!c) return;
  appState.selectedClassForBooking = resolveClass(c);
  renderApp();
}

function closeBookingModal() {
  appState.selectedClassForBooking = null;
  renderApp();
}

function confirmBooking(classId) {
  const member = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (!appState.data.classEnrollments) appState.data.classEnrollments = [];

  const existing = appState.data.classEnrollments.find(e => (e.classId === classId) && (e.memberId === member.id));
  if (!existing) {
    const newEnrId = 'ENR0' + (appState.data.classEnrollments.length + 1);
    appState.data.classEnrollments.push({
      classEnrollmentId: newEnrId,
      classId: classId,
      memberId: member.id,
      enrollDate: '2026-09-19',
      status: 'CONFIRMED'
    });
    const c = resolveClass(appState.data.classes.find(item => item.id === classId || item.classId === classId));
    showToast('Đặt chỗ thành công', `Đã đăng ký ClassEnrollment cho lớp ${c ? c.title : classId}`, 'success');
  } else {
    showToast('Thông báo', 'Bạn đã đăng ký lớp học này rồi!', 'info');
  }

  appState.selectedClassForBooking = null;
  appState.currentTab = 'member-schedule';
  renderApp();
}

function cancelMemberBooking(classId) {
  const member = appState.data.members.find(m => m.id === 'MEM101') || appState.data.members[0];
  if (appState.data.classEnrollments) {
    const idx = appState.data.classEnrollments.findIndex(e => (e.classId === classId) && (e.memberId === member.id));
    if (idx !== -1) {
      appState.data.classEnrollments.splice(idx, 1);
      showToast('Đã hủy chỗ', 'Đã hủy đăng ký thành công.', 'info');
      renderApp();
    }
  }
}

// Member Shopee-style Checkout Interactions

function setMemberClassSort(sort) {
  appState.memberClassSort = sort;
  renderApp();
}

function openClassQuickView(classId) {
  const c = appState.data.classes.find(item => item.id === classId || item.classId === classId);
  if (!c) return;
  appState.quickViewClass = resolveClass(c);
  renderApp();
}

function closeClassQuickView() {
  appState.quickViewClass = null;
  renderApp();
}

function renderMemberQuickViewModal() {
  const c = appState.quickViewClass;
  if (!c) return '';
  const maxCap = c.maxCapacity || 20;
  const remaining = Math.max(0, maxCap - (c.bookedSeats || 0));
  const isFull = remaining <= 0;
  const isAlmostFull = remaining > 0 && remaining <= 5;

  let badgeBg = 'bg-emerald-600 text-white';
  let badgeText = `Còn ${remaining}/${maxCap} chỗ`;
  if (isFull) {
    badgeBg = 'bg-rose-500 text-white font-black';
    badgeText = 'Hết chỗ';
  } else if (isAlmostFull) {
    badgeBg = 'bg-amber-500 text-slate-950 font-black';
    badgeText = `Sắp đầy (${remaining} chỗ)`;
  }

  return `
    <div class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onclick="if(event.target === this) closeClassQuickView()">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all duration-200 scale-100 flex flex-col">
        <!-- Modal Image Banner -->
        <div class="relative h-56 w-full bg-slate-900 overflow-hidden">
          <img src="${c.image}" alt="${c.title}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          
          <!-- Category & Status Badge -->
          <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs">
            ${c.category}
          </div>
          <div class="absolute top-4 right-14 ${badgeBg} px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            ${badgeText}
          </div>

          <!-- Close Button -->
          <button 
            type="button" 
            onclick="closeClassQuickView()" 
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold transition backdrop-blur-xs"
          >
            ✕
          </button>

          <div class="absolute bottom-4 left-4 right-4 text-white">
            <h3 class="text-xl font-black drop-shadow-md">${c.title}</h3>
          </div>
        </div>

        <!-- Modal Content Body -->
        <div class="p-6 space-y-4">
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ${c.description}
          </p>

          <!-- Specs Table -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Khung giờ:</span>
              <span class="font-extrabold text-slate-900">${c.time}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Ngày học trong tuần:</span>
              <span class="font-bold text-slate-800">${c.days}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Phòng tập:</span>
              <span class="font-bold text-slate-800">${c.room}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-semibold">Huấn luyện viên phụ trách:</span>
              <span class="font-extrabold text-blue-600">${c.coachName}</span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-slate-200">
              <span class="text-slate-400 font-semibold">Tình trạng chỗ:</span>
              <span class="font-black ${isFull ? 'text-rose-600' : isAlmostFull ? 'text-amber-600' : 'text-emerald-600'}">
                ${remaining} / ${maxCap} chỗ trống
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pt-2 flex items-center gap-3">
            <button 
              type="button" 
              onclick="closeClassQuickView()" 
              class="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
            >
              Đóng
            </button>
            <button 
              type="button" 
              onclick="closeClassQuickView(); openBookingModal('${c.id}')" 
              ${isFull ? 'disabled' : ''} 
              class="flex-1 py-3 rounded-2xl text-xs font-bold transition text-center shadow-md flex items-center justify-center space-x-1.5 ${
                isFull 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover-lift-sm'
              }"
            >
              <span>${isFull ? 'Đã Hết Chỗ' : 'Đặt Chỗ Ngay'}</span>
              ${!isFull ? '<span>&rarr;</span>' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof renderMemberWebApp !== 'undefined') _targetGlobal.renderMemberWebApp = renderMemberWebApp;
  if (typeof quickExploreCategory !== 'undefined') _targetGlobal.quickExploreCategory = quickExploreCategory;
  if (typeof handleHomeSearch !== 'undefined') _targetGlobal.handleHomeSearch = handleHomeSearch;
  if (typeof renderMemberLandingHome !== 'undefined') _targetGlobal.renderMemberLandingHome = renderMemberLandingHome;
  if (typeof renderMemberClassDiscovery !== 'undefined') _targetGlobal.renderMemberClassDiscovery = renderMemberClassDiscovery;
  if (typeof renderMemberPackageCatalog !== 'undefined') _targetGlobal.renderMemberPackageCatalog = renderMemberPackageCatalog;
  if (typeof renderMemberMySchedule !== 'undefined') _targetGlobal.renderMemberMySchedule = renderMemberMySchedule;
  if (typeof renderMemberFitnessStats !== 'undefined') _targetGlobal.renderMemberFitnessStats = renderMemberFitnessStats;
  if (typeof renderMemberDigitalPass !== 'undefined') _targetGlobal.renderMemberDigitalPass = renderMemberDigitalPass;
  if (typeof renderMemberBookingModal !== 'undefined') _targetGlobal.renderMemberBookingModal = renderMemberBookingModal;
  if (typeof renderMemberQuickViewModal !== 'undefined') _targetGlobal.renderMemberQuickViewModal = renderMemberQuickViewModal;
  if (typeof setMemberCategoryFilter !== 'undefined') _targetGlobal.setMemberCategoryFilter = setMemberCategoryFilter;
  if (typeof setMemberSearchKeyword !== 'undefined') _targetGlobal.setMemberSearchKeyword = setMemberSearchKeyword;
  if (typeof setMemberClassSort !== 'undefined') _targetGlobal.setMemberClassSort = setMemberClassSort;
  if (typeof openClassQuickView !== 'undefined') _targetGlobal.openClassQuickView = openClassQuickView;
  if (typeof closeClassQuickView !== 'undefined') _targetGlobal.closeClassQuickView = closeClassQuickView;
  if (typeof openBookingModal !== 'undefined') _targetGlobal.openBookingModal = openBookingModal;
  if (typeof closeBookingModal !== 'undefined') _targetGlobal.closeBookingModal = closeBookingModal;
  if (typeof confirmBooking !== 'undefined') _targetGlobal.confirmBooking = confirmBooking;
  if (typeof cancelMemberBooking !== 'undefined') _targetGlobal.cancelMemberBooking = cancelMemberBooking;
}













