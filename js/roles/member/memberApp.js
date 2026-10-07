// =========================================================================
// MEMBER WEB APP (GUEST LANDING, CATALOG, CLASSES, SCHEDULE, STATS, PASS)
// =========================================================================

// =========================================================================
// 2. MEMBER WEB APP: FULL CONSUMER PORTAL (TOP NAVBAR, 5 OPERATIONAL PAGES)
// =========================================================================
function renderMemberWebApp() {
  const currentTab = appState.currentTab;
  const isAuth = appState.isAuthenticated;
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const rawMember = members.find(m => m.id === 'MEM101' || m.memberId === 'MEM101') || members[0];
  const member = resolveMember(rawMember) || {
    id: 'MEM101',
    name: 'Phạm Thu Trang',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    activePackage: 'VIP All-Access Pass',
    phone: '0912345678',
    endDate: '2026-11-01'
  };

  const myBookedCount = isAuth ? ((appState.data?.classes || []).filter(c => c.attendees && c.attendees.some(a => a.id === member.id)).length) : 0;
  const useTopNav = !isAuth;

  return `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 ${useTopNav ? 'flex flex-col' : 'flex'}">
      ${useTopNav ? `
      <!-- Member Top Horizontal Navigation Bar (Home Only) -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2.5 cursor-pointer" onclick="switchTab('member-home')">
              <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">SC</span>
              <div>
                <div class="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">SPORTS CENTER</div>
                <div class="text-[10px] text-slate-500 font-semibold">${isAuth ? 'Member Portal' : 'Khách Vãng Lai'}</div>
              </div>
            </div>
            <nav class="hidden md:flex items-center space-x-1.5">
              <button type="button" onclick="switchTab('member-classes')" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100">Khám Phá Lớp Học</button>
              <button type="button" onclick="switchTab('member-packages')" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100">Gói Hội Viên</button>
              ${isAuth ? `
                <button type="button" onclick="switchTab('member-schedule')" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  <span>Lịch Tập Của Tôi</span>
                  ${myBookedCount > 0 ? `<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">${myBookedCount}</span>` : ''}
                </button>
              ` : ''}
            </nav>
          </div>
          <!-- Header Search Bar: hidden when not logged in -->
          ${isAuth ? `
          <div class="flex-1 max-w-sm mx-4 hidden lg:block">
            <form onsubmit="return handleHomeSearch(event)" class="relative">
              <input type="text" id="home-search-input" placeholder="Tìm lớp học, bộ môn, HLV..." class="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </form>
          </div>
          ` : ''}
          <div class="flex items-center space-x-2 sm:space-x-3">
            ${isAuth ? `
              ${renderNotificationBell('MEMBER')}
              ${renderUserAvatarDropdown('MEMBER')}
            ` : `
              <button type="button" onclick="openLoginScreen('register')" class="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition">Đăng Ký</button>
              <button type="button" onclick="openLoginScreen('login')" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center space-x-1.5"><span>Đăng Nhập</span><span class="text-xs">&rarr;</span></button>
            `}
          </div>
        </div>
        <!-- Mobile horizontal sub-bar -->
        <div class="md:hidden flex border-t border-slate-100 overflow-x-auto px-4 py-2 space-x-2 bg-slate-50">
          <button type="button" onclick="switchTab('member-classes')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200">Lớp học</button>
          <button type="button" onclick="switchTab('member-packages')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200">Gói tập</button>
          ${isAuth ? `
            <button type="button" onclick="switchTab('member-schedule')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200">Lịch (${myBookedCount})</button>
          ` : `
            <button type="button" onclick="openLoginScreen('login')" class="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">Đăng Nhập</button>
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
          <div class="px-4 py-3 border-b border-slate-100" style="${(window.location.pathname === '/login' || window.location.href.includes('/login') || window.location.hash.includes('login') || (typeof appState !== 'undefined' && appState.isViewingAuthScreen)) ? 'display: none !important;' : ''}">
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

      <!-- Member Package Checkout Modal (If Open) -->
      ${(appState.checkoutFlow?.isOpen || appState.selectedPackageForCheckout) ? renderMemberCheckoutModal() : ''}

      <!-- Member Support Ticket Modal (If Open) -->
      ${appState.supportTicketModalOpen ? renderSupportTicketModal() : ''}

      <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Sports Center Management Portal
      </footer>
    </div>
  `;
}

// Landing / Homepage: Sports Center Discovery & App Introduction (Vietnam.travel Style)
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
  const pkgs = (appState.data && appState.data.packages) ? appState.data.packages : [];

  return `
    <div class="space-y-8 sm:space-y-10 animate-fade-in pb-8">
      <!-- 1. HERO SECTION (Immersive Vietnam.travel aesthetic) -->
      <section class="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] sm:min-h-[540px] flex flex-col justify-between p-6 sm:p-10 text-white">
        <!-- Background Image with Gradient Overlay -->
        <div class="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80" 
            alt="Sports Center Hero" 
            class="w-full h-full object-cover object-center filter brightness-90 scale-105 transition-transform duration-1000 ease-out"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/75 to-slate-950/40"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent"></div>
        </div>

        <!-- Top Badge -->
        <div class="relative z-10">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-amber-300 shadow-xs">
            <span>✨</span>
            <span>Tổ Hợp Thể Thao & Sống Khỏe Tiêu Chuẩn Quốc Tế</span>
          </div>
        </div>

        <!-- Hero Main Content -->
        <div class="relative z-10 max-w-3xl my-auto py-4 sm:py-6 space-y-4">
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Đánh Thức Thể Lực. <br />
            <span class="bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
              Định Hình Phong Cách Sống.
            </span>
          </h1>
          <p class="text-slate-200 text-xs sm:text-base leading-relaxed max-w-2xl font-normal drop-shadow-xs">
            Chào mừng bạn đến với <strong class="text-white font-bold">Sports Center</strong> – Không gian luyện tập 5.000m² tích hợp dàn máy TechnoGym AI, bể bơi bốn mùa ozone, phòng xông hơi đá muối Himalaya cùng ứng dụng số hóa quản lý 1-chạm thông minh.
          </p>

          <!-- Interactive Search / Filter Bar on Hero -->
          <div class="pt-2">
            <!-- Quick Pill Filters -->
            <div class="flex items-center gap-2 mt-3 flex-wrap">
              <span class="text-[11px] text-slate-300 font-semibold">Khám phá nhanh:</span>
              <button type="button" onclick="quickExploreCategory('Yoga')" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-[11px] text-white font-medium transition">
                🧘 Yoga Thân Tâm
              </button>
              <button type="button" onclick="quickExploreCategory('Boxing')" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-[11px] text-white font-medium transition">
                🥊 Boxing Đốt Mỡ
              </button>
              <button type="button" onclick="quickExploreCategory('Pilates')" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-[11px] text-white font-medium transition">
                🤸 Pilates Vóc Dáng
              </button>
              <button type="button" onclick="quickExploreCategory('Zumba')" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-[11px] text-white font-medium transition">
                💃 Zumba Vũ Điệu
              </button>
              <button type="button" onclick="switchTab('member-packages')" class="px-3 py-1 rounded-full bg-amber-500/30 hover:bg-amber-500/50 backdrop-blur-xs border border-amber-400/40 text-[11px] text-amber-200 font-bold transition">
                🏷️ Bảng Giá Gói Tập
              </button>
            </div>
          </div>
        </div>

        <!-- Hero Bottom Action Strip -->
        <div class="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 text-xs text-slate-300">
          <div class="flex items-center space-x-6 flex-wrap gap-y-2">
            <span class="flex items-center space-x-1.5"><strong class="text-white font-bold">📍 Địa chỉ:</strong> Khu Công Nghệ Cao Hòa Lạc, Hà Nội</span>
            <span class="flex items-center space-x-1.5"><strong class="text-white font-bold">⏰ Giờ mở cửa:</strong> 05:30 – 22:00 Hàng ngày</span>
            <span class="flex items-center space-x-1.5"><strong class="text-white font-bold">📞 Hotline:</strong> 1900 6868</span>
          </div>
          <div class="flex items-center space-x-3">
            <button type="button" onclick="switchTab('member-classes')" class="text-xs font-bold text-white hover:text-indigo-300 underline underline-offset-4 transition">
              Xem Lịch Tập Hôm Nay &rarr;
            </button>
          </div>
        </div>
      </section>

      <!-- 2. STATS BAR (SỐ LIỆU ẤN TƯỢNG) -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition text-center sm:text-left">
          <div class="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">15,000+</div>
          <div class="text-xs font-bold text-slate-800 mt-1">Hội Viên Thân Thiết</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Tập luyện & gắn bó mỗi ngày</div>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition text-center sm:text-left">
          <div class="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">50+</div>
          <div class="text-xs font-bold text-slate-800 mt-1">Master Coach Quốc Tế</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Chứng chỉ NASM, ACE, Yoga Alliance</div>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition text-center sm:text-left">
          <div class="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">120+</div>
          <div class="text-xs font-bold text-slate-800 mt-1">Lớp Học / Tuần</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Đa dạng khung giờ từ 06:00 - 21:00</div>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition text-center sm:text-left">
          <div class="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">99.8%</div>
          <div class="text-xs font-bold text-slate-800 mt-1">Hài Lòng Dịch Vụ</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Đánh giá 5 sao từ cộng đồng</div>
        </div>
      </section>

      <!-- 3. FEATURED DISCIPLINES & EXPERIENCES (BỘ SƯU TẬP BỘ MÔN ĐẲNG CẤP) -->
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-indigo-600">Trải Nghiệm Đa Dạng</div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Các Bộ Môn Thể Thao Đỉnh Cao
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Được thiết kế từ bài bản đến nâng cao, dẫn dắt trực tiếp bởi các huấn luyện viên chuyên nghiệp.
            </p>
          </div>
          <button type="button" onclick="switchTab('member-classes')" class="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition self-start sm:self-auto">
            <span>Khám phá toàn bộ 120+ lớp</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 1. Yoga -->
          <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80" 
                class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                alt="Yoga Studio"
              />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-indigo-800 backdrop-blur-xs shadow-xs">
                Studio A Tĩnh Lặng
              </span>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                ⭐ 4.9/5
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="font-black text-base text-slate-900 group-hover:text-indigo-600 transition">Yoga Thân - Tâm - Trí</h3>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Cân bằng hơi thở, tăng độ dẻo dai khớp và phục hồi năng lượng sống trong phòng tập sàn gỗ sồi tràn ngập hương tinh dầu tự nhiên.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">Tất cả trình độ</span>
                <button type="button" onclick="quickExploreCategory('Yoga')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                  Đặt Lớp Ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Boxing -->
          <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80" 
                class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                alt="Boxing Arena"
              />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-rose-800 backdrop-blur-xs shadow-xs">
                Combat Arena
              </span>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-600 text-white shadow-xs">
                🔥 Đốt 800kcal
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="font-black text-base text-slate-900 group-hover:text-rose-600 transition">Boxing & KickFit Rực Lửa</h3>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Rèn luyện phản xạ tự vệ, giải tỏa áp lực cực đỉnh và đốt mỡ toàn thân cùng dàn HLV Cựu VĐV đội tuyển quốc gia.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">Cường độ cao</span>
                <button type="button" onclick="quickExploreCategory('Boxing')" class="text-xs font-bold text-rose-600 hover:text-rose-800 transition">
                  Đặt Lớp Ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Pilates -->
          <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80" 
                class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                alt="Pilates Reformer"
              />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-amber-800 backdrop-blur-xs shadow-xs">
                Máy Reformer Nhập Khẩu
              </span>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-600 text-white shadow-xs">
                ✨ Siết Eo & Chỉnh Dáng
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="font-black text-base text-slate-900 group-hover:text-amber-600 transition">Pilates Cân Chỉnh Cột Sống</h3>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Tập trung phục hồi cơ lõi sâu, chỉnh cong vẹo cột sống do ngồi máy tính nhiều và kiến tạo vóc dáng thanh thoát, chuẩn mẫu.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">Phục hồi & Dáng vóc</span>
                <button type="button" onclick="quickExploreCategory('Pilates')" class="text-xs font-bold text-amber-600 hover:text-amber-800 transition">
                  Đặt Lớp Ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- 4. Gym & Strength -->
          <div class="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80" 
                class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                alt="Fitness Gym Area"
              />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-indigo-800 backdrop-blur-xs shadow-xs">
                Sàn Gym 1.200m²
              </span>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                TechnoGym Live
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="font-black text-base text-slate-900 group-hover:text-indigo-600 transition">Gym & Sức Mạnh Thể Lực</h3>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Dàn máy khối, khu tạ tự do chuẩn Olympic, máy cardio màn hình tương tác thông minh hỗ trợ kết nối dữ liệu buổi tập cá nhân.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-semibold">Tự do & Có HLV</span>
                <button type="button" onclick="switchTab('member-packages')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                  Xem Gói Tập &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. APP ECOSYSTEM WALKTHROUGH (HỆ SINH THÁI ỨNG DỤNG SỐ HÓA 4.0) -->
      <section class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div class="relative z-10 max-w-3xl">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
            <span>📱</span>
            <span>Ứng Dụng Hội Viên Toàn Diện</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Một Ứng Dụng Thông Minh.<br />
            Trọn Vẹn Mọi Tiện Ích Thể Thao.
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
            Quên đi thẻ nhựa hay thủ tục giấy tờ phiền hà. Toàn bộ hành trình tập luyện từ cổng soát vé, đặt lớp học đến biểu đồ chỉ số cơ thể được điều khiển ngay trong lòng bàn tay bạn.
          </p>
        </div>

        <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 sm:mt-10">
          <!-- Feature 1 -->
          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-black text-2xl">
              📲
            </div>
            <h3 class="font-bold text-base text-white">Thẻ Số & Check-in QR</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Mã QR động qua cổng Turnstile tự động trong 0.5s. Tích hợp lịch sử ra vào và xuất hóa đơn điện tử minh bạch.
            </p>
            <div class="pt-2">
              <button type="button" onclick="navigateToMemberPage('member-pass')" class="text-xs font-bold text-indigo-300 hover:text-indigo-200 transition">
                Xem Thẻ Điện Tử &rarr;
              </button>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-black text-2xl">
              📅
            </div>
            <h3 class="font-bold text-base text-white">Đặt Chỗ & Quản Lý Lịch</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Xem sơ đồ chỗ lớp học trước 7 ngày, chọn huấn luyện viên yêu thích và nhận thông báo nhắc giờ tập tự động.
            </p>
            <div class="pt-2">
              <button type="button" onclick="switchTab('member-classes')" class="text-xs font-bold text-emerald-300 hover:text-emerald-200 transition">
                Khám Phá Lớp Học &rarr;
              </button>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-2xl">
              📊
            </div>
            <h3 class="font-bold text-base text-white">Đo InBody & Giáo Án Riêng</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Theo dõi biểu đồ cân nặng, cơ, mỡ, BMI định kỳ và tiếp nhận giáo án bài tập cá nhân do HLV trực tiếp phân công.
            </p>
            <div class="pt-2">
              <button type="button" onclick="navigateToMemberPage('member-fitness')" class="text-xs font-bold text-amber-300 hover:text-amber-200 transition">
                Xem Thể Trạng Của Tôi &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>


      <!-- 6. POPULAR PACKAGES PREVIEW (CÁC GÓI TẬP BÁN CHẠY NHẤT) -->
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div class="text-[11px] font-black uppercase tracking-wider text-indigo-600">Đăng Ký Linh Hoạt</div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Các Gói Hội Viên Được Tin Chọn
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Thanh toán an toàn qua VNPay QR hoặc thẻ Visa/Mastercard/Napas, kích hoạt gói tức thì.
            </p>
          </div>
          <button type="button" onclick="switchTab('member-packages')" class="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
            <span>Xem tất cả gói &rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${pkgs.slice(0, 3).map(pkg => `
            <div class="rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
              pkg.popular 
                ? 'bg-gradient-to-b from-indigo-900 to-slate-900 text-white shadow-xl ring-2 ring-indigo-500 scale-[1.02]' 
                : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-lg'
            }">
              ${pkg.popular ? `
                <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                  ★ Phổ Biến Nhất
                </div>
              ` : ''}

              <div>
                <h3 class="text-lg font-black tracking-tight">${pkg.name}</h3>
                <p class="text-xs ${pkg.popular ? 'text-slate-300' : 'text-slate-500'} mt-1">${pkg.description}</p>
                <div class="mt-4 pb-4 border-b ${pkg.popular ? 'border-white/10' : 'border-slate-100'}">
                  <div class="text-2xl sm:text-3xl font-black">${(pkg.price || 0).toLocaleString()} <span class="text-xs font-normal ${pkg.popular ? 'text-slate-300' : 'text-slate-500'}">VND</span></div>
                  <div class="text-[11px] ${pkg.popular ? 'text-indigo-300' : 'text-slate-400'} font-semibold mt-0.5">Thời hạn: ${pkg.durationDays || 30} Ngày Sử Dụng</div>
                </div>
                <div class="py-4 space-y-2.5">
                  ${(pkg.features || []).slice(0, 4).map(f => `
                    <div class="flex items-start space-x-2 text-xs">
                      <span class="${pkg.popular ? 'text-amber-400' : 'text-indigo-600'} font-bold flex-shrink-0">✓</span>
                      <span class="${pkg.popular ? 'text-slate-200' : 'text-slate-600'}">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4">
                <button 
                  type="button" 
                  onclick="openCheckoutModal('${pkg.id}')" 
                  class="w-full py-3 rounded-2xl font-bold text-xs transition shadow-sm ${
                    pkg.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }"
                >
                  Đăng Ký Gói Này &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>



      <!-- 8. FINAL CALL TO ACTION (CHÂN TRANG KÊU GỌI HÀNH ĐỘNG) -->
      <section class="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="max-w-xl space-y-2">
          <div class="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            Bắt Đầu Ngay Hôm Nay
          </div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight">
            Sẵn Sàng Nâng Tầm Thể Chất Cùng Sports Center?
          </h2>
          <p class="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Đăng ký gói thẻ ngay hôm nay để nhận buổi đo InBody 770 miễn phí và tư vấn lộ trình 1-1 cùng Master Coach.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button 
            type="button" 
            onclick="switchTab('member-classes')" 
            class="w-full sm:w-auto px-6 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition"
          >
            Khám Phá Lớp Học &rarr;
          </button>
          <button 
            type="button" 
            onclick="switchTab('member-packages')" 
            class="w-full sm:w-auto px-6 py-3.5 bg-indigo-900/60 hover:bg-indigo-900/80 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-2xl transition"
          >
            Xem Bảng Giá Gói
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderMemberClassDiscovery() {
  const categories = ['ALL', 'Yoga', 'Boxing', 'Zumba', 'Pilates'];
  const activeCat = appState.activeFilterCategory;
  const keyword = (appState.memberSearchKeyword || '').toLowerCase().trim();
  const rawClasses = (appState.data && appState.data.classes) ? appState.data.classes : [];
  const classes = rawClasses.map(c => resolveClass(c));
  
  const filtered = classes.filter(c => {
    const matchCat = activeCat === 'ALL' || c.category === activeCat;
    const matchKey = !keyword || c.title.toLowerCase().includes(keyword) || c.coachName.toLowerCase().includes(keyword) || c.room.toLowerCase().includes(keyword);
    return matchCat && matchKey;
  });

  return `
    <div class="space-y-6">
      <!-- Discovery Hero Header -->
      <div class="bg-gradient-to-r from-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div class="max-w-2xl">
          <div class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider mb-3">
            Lịch Học & Đặt Chỗ Tuần Này
          </div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Khám Phá Các Lớp Học Thể Thao</h2>
          <p class="text-indigo-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Đặt chỗ trước để đảm bảo vị trí cùng các huấn luyện viên chuyên nghiệp. Tất cả lớp Yoga, Zumba và Boxing đã bao gồm trong gói thẻ của bạn!
          </p>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <div class="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          ${categories.map(cat => `
            <button type="button" onclick="setMemberCategoryFilter('${cat}')" class="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition ${activeCat === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}">
              ${cat === 'ALL' ? 'Tất cả bộ môn' : cat}
            </button>
          `).join('')}
        </div>

        <div class="w-full sm:w-72">
          <input type="text" placeholder="Tìm lớp, HLV, phòng tập..." value="${appState.memberSearchKeyword}" oninput="setMemberSearchKeyword(this.value)" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs" />
        </div>
      </div>

      <!-- Class Cards Grid -->
      ${filtered.length === 0 ? `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div class="text-slate-400 text-sm font-semibold">Không tìm thấy lớp học nào phù hợp với bộ lọc.</div>
          <button type="button" onclick="setMemberCategoryFilter('ALL'); setMemberSearchKeyword('');" class="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700">
            Đặt lại bộ lọc
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(c => {
            const remaining = (c.maxCapacity || 20) - (c.bookedSeats || 0);
            const isFull = remaining <= 0;
            return `
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
                <div class="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img src="${c.image}" class="w-full h-full object-cover" />
                  <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800">
                    ${c.category}
                  </div>
                  <div class="absolute top-3 right-3 ${isFull ? 'bg-rose-500' : 'bg-emerald-600'} text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs">
                    ${isFull ? 'Đã hết chỗ' : `Còn ${remaining}/${c.maxCapacity} chỗ`}
                  </div>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 class="font-extrabold text-base text-slate-900 leading-snug">${c.title}</h3>
                    <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">${c.description}</p>

                    <div class="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Thời gian:</span>
                        <span class="font-semibold text-slate-800">${c.time} (${c.days})</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Phòng tập:</span>
                        <span class="font-semibold text-slate-800">${c.room}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">HLV phụ trách:</span>
                        <span class="font-semibold text-indigo-600">${c.coachName}</span>
                      </div>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-100">
                    <button type="button" onclick="openBookingModal('${c.id}')" ${isFull ? 'disabled' : ''} class="w-full py-2.5 ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow'} rounded-xl font-bold text-xs transition text-center">
                      ${isFull ? 'Lớp Đã Đầy Slot' : 'Đặt Chỗ Tham Gia Ngay'}
                    </button>
                  </div>
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
  const packages = (appState.data && appState.data.packages) ? appState.data.packages : [];

  return `
    <div class="space-y-8">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Chọn Gói Thẻ Hội Viên Phù Hợp</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-2">
          Đăng ký hoặc gia hạn trực tuyến tức thì. Hệ thống hỗ trợ quét mã QR Chuyển khoản ngân hàng hoặc thanh toán tại quầy lễ tân.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${packages.map(pkg => `
          <div class="bg-white rounded-2xl border ${pkg.popular ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-xs'} p-6 flex flex-col justify-between relative">
            ${pkg.popular ? `
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                Gói Phổ Biến Nhất
              </div>
            ` : ''}

            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${pkg.durationDays} Ngày Sử Dụng</div>
              <h3 class="text-lg font-black text-slate-900 mt-1">${pkg.name}</h3>
              <p class="text-xs text-slate-500 mt-2 min-h-[36px]">${pkg.description}</p>

              <div class="mt-4 pt-4 border-t border-slate-100">
                <div class="text-2xl font-black text-slate-900">${(pkg.price).toLocaleString()} <span class="text-xs font-normal text-slate-500">VND</span></div>
              </div>

              <div class="mt-5 space-y-2 text-xs text-slate-600">
                <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Quyền lợi gói:</div>
                ${(pkg.features || []).map(f => `
                  <div class="flex items-start space-x-2">
                    <span class="text-indigo-600 font-bold">&check;</span>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-100">
              <button type="button" onclick="openCheckoutModal('${pkg.id}')" class="w-full py-2.5 ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} rounded-xl font-bold text-xs transition shadow-xs">
                Đăng Ký Gói Này
              </button>
            </div>
          </div>
        `).join('')}
      </div>
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
  if (typeof setMemberCategoryFilter !== 'undefined') _targetGlobal.setMemberCategoryFilter = setMemberCategoryFilter;
  if (typeof setMemberSearchKeyword !== 'undefined') _targetGlobal.setMemberSearchKeyword = setMemberSearchKeyword;
  if (typeof openBookingModal !== 'undefined') _targetGlobal.openBookingModal = openBookingModal;
  if (typeof closeBookingModal !== 'undefined') _targetGlobal.closeBookingModal = closeBookingModal;
  if (typeof confirmBooking !== 'undefined') _targetGlobal.confirmBooking = confirmBooking;
  if (typeof cancelMemberBooking !== 'undefined') _targetGlobal.cancelMemberBooking = cancelMemberBooking;
}













