// =========================================================================
// MEMBER FEATURE: CLASS DISCOVERY & BOOKING
// =========================================================================

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
                      loading="lazy"
                      decoding="async"
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
          <img src="${c.image}" alt="${c.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
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

export {
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
};
