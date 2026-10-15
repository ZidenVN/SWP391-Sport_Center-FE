// =========================================================================
// MEMBER FEATURE: LANDING HOME & DISCOVERY
// =========================================================================

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
      tag: 'Gym',
      badge: 'Rèn Luyện Sức Bền',
      level: 'Cơ bản & Nâng cao',
      desc: 'Trang bị máy tập đa dạng hỗ trợ tập luyện sức mạnh, tăng cường thể lực và cải thiện vóc dáng săn chắc.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'yoga',
      category: 'Yoga',
      title: 'Yoga Phục Hồi & Dẻo Dai',
      tag: 'Yoga',
      badge: 'Thư Giãn Thân Tâm',
      level: 'Mọi trình độ',
      desc: 'Tập trung điều hòa nhịp thở, tăng tính linh hoạt cơ khớp và giải tỏa căng thẳng sau giờ học tập, làm việc.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'boxing',
      category: 'Boxing',
      title: 'Boxing Cơ Bản',
      tag: 'Boxing',
      badge: 'Phản Xạ & Tim Mạch',
      level: 'Cơ bản & Nâng cao',
      desc: 'Rèn luyện phản xạ nhanh nhạy, kỹ thuật đấm cơ bản và giải phóng năng lượng hiệu quả cùng huấn luyện viên.',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'pilates',
      category: 'Pilates',
      title: 'Pilates Cải Thiện Tư Thế',
      tag: 'Pilates',
      badge: 'Cơ Trọng Tâm',
      level: 'Cơ bản',
      desc: 'Bài tập tác động nhóm cơ lõi sâu, hỗ trợ cân chỉnh tư thế cột sống và duy trì độ linh hoạt của cơ thể.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
    }
  ],
  coaches: [
    {
      id: 'coach-nam',
      name: 'Trần Hoàng Nam',
      roleTitle: 'HLV Boxing & Thể Lực',
      specialtyBadge: 'Boxing & Kickfit',
      exp: '7+ Năm KN',
      cert: 'Chứng chỉ NASM CPT',
      category: 'Boxing',
      desc: 'Nhiều năm kinh nghiệm giảng dạy Boxing & Kickfit, tối ưu hóa phản xạ tự vệ và thể lực đối kháng.',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'coach-my',
      name: 'Nguyễn Hà My',
      roleTitle: 'HLV Yoga & Phục Hồi',
      specialtyBadge: 'Yoga & Dẻo Dai',
      exp: '5+ Năm KN',
      cert: 'Yoga Alliance RYT-500',
      category: 'Yoga',
      desc: 'Chuyên về phục hồi dẻo dai, điều hòa nhịp thở và giải tỏa căng thẳng toàn diện với các bài tập chuyên sâu.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'coach-huy',
      name: 'Lê Quốc Huy',
      roleTitle: 'HLV Gym & Thể Hình',
      specialtyBadge: 'Gym & Sức Mạnh',
      exp: '6+ Năm KN',
      cert: 'Chứng chỉ ACE Fitness',
      category: 'Gym',
      desc: 'Tư vấn phương pháp tập luyện cơ bắp an toàn, hiệu quả, cá nhân hóa lộ trình tăng cơ giảm mỡ chuẩn khoa học.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'coach-ngan',
      name: 'Đặng Kim Ngân',
      roleTitle: 'HLV Pilates & Dáng Vóc',
      specialtyBadge: 'Pilates Reformer',
      exp: '5+ Năm KN',
      cert: 'Stott Pilates Certified',
      category: 'Pilates',
      desc: 'Chuyên sâu cân chỉnh cột sống, phục hồi chức năng cơ khớp và điêu khắc đường cong vóc dáng thon gọn săn chắc.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80'
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

function scrollToCoachSection() {
  if (appState.currentTab !== 'member-home') {
    switchTab('member-home');
    setTimeout(() => {
      const el = document.getElementById('coach-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  } else {
    const el = document.getElementById('coach-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderMemberLandingHome() {
  const info = (typeof GYM_MEMBER_LANDING_DATA !== 'undefined' && GYM_MEMBER_LANDING_DATA.info) ? GYM_MEMBER_LANDING_DATA.info : {};
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
            fetchpriority="high"
            decoding="async"
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
            <span>Xem Lớp Học</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          ${GYM_MEMBER_LANDING_DATA.classes.map(item => `
            <div 
              onclick="openDisciplineDetail('${item.id}')"
              class="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex flex-col justify-between p-5 cursor-pointer border border-slate-200/80 bg-slate-950"
            >
              <!-- Hình ảnh tràn toàn bộ thẻ card -->
              <img 
                src="${item.image}" 
                alt="${item.title}"
                loading="lazy"
                decoding="async"
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <!-- Gradient Overlay bảo đảm tương phản sắc nét -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20"></div>

              <!-- Top Tags -->
              <div class="relative z-10 flex items-center justify-between gap-2">
                <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm flex-shrink-0">
                  ${item.tag}
                </span>
                <span class="px-3 py-1 rounded-full text-[11px] font-black bg-blue-600/90 backdrop-blur-md text-white shadow-sm truncate">
                  ${item.badge}
                </span>
              </div>

              <!-- Bottom Content -->
              <div class="relative z-10 space-y-3">
                <h3 class="font-black text-xl text-white tracking-tight drop-shadow-sm group-hover:text-blue-300 transition-colors duration-200">
                  ${item.title}
                </h3>
                <div class="pt-2 flex items-center justify-between gap-2 border-t border-white/20">
                  <span class="text-xs font-semibold text-slate-300 truncate" title="${item.level}">${item.level}</span>
                  <button 
                    type="button" 
                    onclick="event.stopPropagation(); openDisciplineDetail('${item.id}')" 
                    class="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 text-xs font-bold whitespace-nowrap flex-shrink-0 backdrop-blur-md border border-white/30 transition-all duration-200 shadow-xs hover-lift-sm"
                  >
                    <span>Xem chi tiết</span>
                    <span class="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 5. SYSTEM FEATURES (Giới thiệu các chức năng cốt lõi của hệ thống Sport Center) -->
      <section class="features-system-section rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8">
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
            <div class="text-xs font-black uppercase tracking-wider text-blue-600">Đội Ngũ Chuyên Gia</div>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Đội Ngũ Huấn Luyện Viên
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Các huấn luyện viên giàu kinh nghiệm, đạt chứng chỉ quốc tế và luôn tận tâm đồng hành trên từng chặng đường rèn luyện của học viên.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          ${(GYM_MEMBER_LANDING_DATA.coaches || []).map(c => `
            <div 
              onclick="openCoachDetail('${c.id}')"
              class="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex flex-col justify-between p-5 cursor-pointer border border-slate-200/80 bg-slate-950"
            >
              <!-- Hình ảnh tràn toàn bộ thẻ card -->
              <img 
                src="${c.image}" 
                alt="${c.name}" 
                loading="lazy" 
                decoding="async" 
                class="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <!-- Gradient Overlay bảo đảm tương phản sắc nét -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20"></div>

              <!-- Top Tags -->
              <div class="relative z-10 flex items-center justify-between gap-2">
                <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm flex-shrink-0">
                  ${c.specialtyBadge}
                </span>
                <span class="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-600/90 backdrop-blur-md text-white shadow-sm flex-shrink-0">
                  ${c.exp}
                </span>
              </div>

              <!-- Bottom Content -->
              <div class="relative z-10 space-y-3">
                <div>
                  <div class="text-[11px] font-black uppercase tracking-wider text-cyan-300 drop-shadow-sm">
                    ${c.roleTitle}
                  </div>
                  <h3 class="font-black text-xl text-white tracking-tight drop-shadow-sm group-hover:text-blue-300 transition-colors duration-200 mt-0.5">
                    ${c.name}
                  </h3>
                </div>
                <div class="pt-2 flex items-center justify-between gap-2 border-t border-white/20">
                  <span class="text-xs font-semibold text-slate-300 truncate" title="${c.cert}">${c.cert}</span>
                  <button 
                    type="button" 
                    onclick="event.stopPropagation(); openCoachDetail('${c.id}')" 
                    class="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 text-xs font-bold whitespace-nowrap flex-shrink-0 backdrop-blur-md border border-white/30 transition-all duration-200 shadow-xs hover-lift-sm"
                  >
                    <span>Xem chi tiết</span>
                    <span class="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          ${pkgs.slice(0, 3).map(pkg => {
            const isVip = (pkg.id === 'PKG02' || (pkg.name && pkg.name.toLowerCase().includes('vip')));
            return `
            <div class="rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              isVip 
                ? 'bg-blue-50/30 text-slate-900 border-2 border-blue-600 shadow-xl shadow-blue-500/10 lg:-translate-y-2 hover-lift' 
                : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs hover-lift'
            }">
              ${isVip ? `
                <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white font-black text-[11px] uppercase tracking-wider shadow-md flex items-center space-x-1 whitespace-nowrap z-10">
                  <span>⭐ PHỔ BIẾN</span>
                </div>
              ` : ''}

              <div>
                <div class="text-[11px] font-bold ${isVip ? 'text-blue-600' : 'text-slate-400'} uppercase tracking-wider">
                  Thời hạn: ${pkg.durationDays || 30} Ngày
                </div>
                <h3 class="text-xl font-extrabold tracking-tight mt-1 text-slate-900">${pkg.name}</h3>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">${pkg.description}</p>
                
                <div class="mt-6 pb-6 border-b border-slate-100">
                  <div class="text-3xl sm:text-4xl font-black text-slate-900">
                    ${(pkg.price || 0).toLocaleString()} <span class="text-sm font-semibold text-slate-500">VND</span>
                  </div>
                </div>

                <div class="py-6 space-y-3">
                  ${(pkg.features || []).map(f => `
                    <div class="flex items-start space-x-2.5 text-xs sm:text-sm">
                      <span class="${isVip ? 'text-blue-600 font-black' : 'text-blue-600 font-bold'} flex-shrink-0">✓</span>
                      <span class="text-slate-700">${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4">
                <button 
                  type="button" 
                  onclick="openCheckoutModal('${pkg.packageId || pkg.id}')" 
                  class="w-full py-3 rounded-2xl font-bold text-xs transition shadow-sm ${
                    isVip 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover-lift-sm shadow-blue-500/25' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover-lift-sm'
                  }"
                >
                  Đăng Ký Gói Này &rarr;
                </button>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </section>

      <!-- 8. FINAL CALL TO ACTION (CTA & Dòng ghi chú demo) -->
      <section class="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
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
 

    </div>
  `;
}

export { GYM_MEMBER_LANDING_DATA, quickExploreCategory, handleHomeSearch, scrollToCoachSection, renderMemberLandingHome };
