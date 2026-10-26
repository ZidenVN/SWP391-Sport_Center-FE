import { html, icon } from '../core/dom.js';
import { mountPage, settle } from '../core/page.js';
import { publicApi } from '../api/endpoints.js';
import { money } from '../core/format.js';
import { bestValueId } from '../components/billing.js';
import { brandMark } from '../components/brand.js';

// Trang giới thiệu trước khi đăng nhập. Bảng giá + bộ môn lấy thật từ BE (GET công khai),
// BE lỗi thì vẫn hiện bản giới thiệu với dữ liệu mẫu bên dưới.
const IMG = '/landing';
const DARK = '#173F31';
const LIME = '#D7F25B';

const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

// ảnh minh họa theo tên bộ môn
const PHOTOS = [
  [/yoga|thien|gian co/, 'yoga.jpg'],
  [/boi|swim/, 'swim.jpg'],
  [/tennis|cau long|pickle|badminton/, 'tennis.jpg'],
  [/bong da|football|soccer|futsal/, 'football.jpg'],
  [/bong ro|basket/, 'basketball.jpg'],
  [/boxing|vo|kick|mma/, 'boxing.jpg'],
  [/gym|ta|the hinh|strength/, 'gym.jpg'],
  [/aerobic|zumba|fitness|cardio|dance|nhay/, 'fitness.jpg']
];
const photoFor = name => `${IMG}/${(PHOTOS.find(([re]) => re.test(norm(name))) || [, 'gym-floor.jpg'])[1]}`;

const FALLBACK_SUBJECTS = [
  { subjectName: 'Yoga', description: 'Dẻo dai, cân bằng và thư giãn sau ngày dài.' },
  { subjectName: 'Gym', description: 'Tăng cơ, giảm mỡ với HLV hướng dẫn kỹ thuật.' },
  { subjectName: 'Bơi lội', description: 'Hồ bơi trong nhà, lớp cho người mới và nâng cao.' },
  { subjectName: 'Boxing', description: 'Đốt mỡ cường độ cao, rèn phản xạ và sức bền.' }
];
// trang giới thiệu chỉ giới thiệu 4 môn chính: Gym, Yoga, Boxing, Bơi lội (lọc cả danh sách bộ môn BE trả về)
const HOME_SUBJECT = /gym|the hinh|yoga|boxing|boi/;
const homeSubjects = list => {
  const picked = (list || []).filter(x => HOME_SUBJECT.test(norm(x.subjectName)));
  return picked.length ? picked : FALLBACK_SUBJECTS;
};

// nhãn ngắn theo bộ môn cho thẻ bộ môn
const SUBJECT_TAGS = [
  [/yoga|thien|gian co/, ['Thư giãn', 'Dẻo dai']],
  [/boi|swim/, ['Toàn thân', 'Sức bền']],
  [/tennis|cau long|pickle|badminton/, ['Kỹ thuật', 'Phản xạ']],
  [/bong da|football|soccer|futsal|bong ro|basket/, ['Đồng đội', 'Thể lực']],
  [/boxing|vo|kick|mma/, ['Cường độ cao', 'Đốt mỡ']],
  [/gym|ta|the hinh|strength/, ['Tăng cơ', 'Sức mạnh']]
];
const tagsFor = name => (SUBJECT_TAGS.find(([re]) => re.test(norm(name))) || [, ['Mọi trình độ', 'Có HLV']])[1];
const RIBBON = ['Yoga', 'Gym', 'Boxing', 'Bơi lội'];

const FEATURES = [
  ['medal', 'HLV chuyên môn', 'Giáo án riêng cho từng mục tiêu, theo dõi tiến độ sau mỗi buổi.'],
  ['calendar-check', 'Đặt lớp online', 'Chọn lớp theo giờ rảnh, hủy trước giờ học chỉ với một chạm.'],
  ['credit-card', 'Thanh toán VNPay', 'Mua và gia hạn gói bằng thẻ ATM, thẻ quốc tế hoặc quét QR.'],
  ['bell-ring', 'Nhắc lịch tự động', 'Thông báo khi lớp đổi giờ và khi gói sắp hết hạn.']
];

const STEPS = [
  ['user-plus', 'Tạo tài khoản', 'Đăng ký bằng email hoặc Google trong chưa đầy một phút.'],
  ['package', 'Chọn gói tập', 'Mua online qua VNPay hoặc tại quầy lễ tân, kích hoạt ngay.'],
  ['dumbbell', 'Đặt lớp & tập luyện', 'Chọn lớp yêu thích, nhận giáo án và theo dõi tiến bộ.']
];

const nav = [['top', 'Trang chủ'], ['subjects', 'Bộ môn'], ['pricing', 'Bảng giá'], ['about', 'Về chúng tôi']];

function header(s) {
  return html`
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <a href="#/" class="flex items-center gap-2.5 text-white">
          ${brandMark('w-11 h-11 ring-1 ring-white/20')}
          <span class="font-display font-extrabold text-2xl tracking-wide">SPORT CENTER</span>
        </a>
        <nav class="hidden md:flex items-center gap-1 rounded-full bg-white/10 backdrop-blur px-1.5 py-1.5">
          ${nav.map(([id, label], i) => html`
            <button type="button" data-action="scroll" data-target="${id}"
              class="px-4 py-1.5 rounded-full text-sm font-semibold ${i === 0 ? 'bg-white/90 text-slate-900' : 'text-white/85 hover:text-white'}">${label}</button>`)}
        </nav>
        <div class="flex items-center gap-2">
          <!-- cùng kiểu 2 nút trong banner: viền kính trong suốt + nền trắng -->
          <a href="#/login" class="hb-nav-ghost hidden sm:inline-flex" data-testid="landing-login">${icon('log-in', 'w-4 h-4')} Đăng nhập</a>
          <a href="#/register" class="hb-nav-solid hidden sm:inline-flex" data-testid="landing-register">Đăng ký ${icon('arrow-up-right', 'w-4 h-4')}</a>
          <button type="button" class="md:hidden p-2 rounded-xl text-white bg-white/10" data-action="menu" aria-label="Mở menu">${icon(s.menuOpen ? 'x' : 'menu', 'w-5 h-5')}</button>
        </div>
      </div>
      ${s.menuOpen ? html`
        <div class="md:hidden mx-4 rounded-2xl bg-white shadow-xl p-2" data-testid="mobile-menu">
          ${nav.map(([id, label]) => html`<button type="button" data-action="scroll" data-target="${id}" class="block w-full text-left px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50">${label}</button>`)}
          <div class="grid grid-cols-2 gap-2 p-2">
            <a href="#/login" class="btn-secondary">Đăng nhập</a>
            <a href="#/register" class="btn text-slate-900" style="background:${LIME}">Đăng ký</a>
          </div>
        </div>` : ''}
    </header>`;
}

// ---------- Phần đầu trang: banner ảnh lớn dạng slideshow (kiểu "Into the Wild") ----------
// Mỗi cảnh: ảnh nền + slogan 2 tầng + mô tả. Tự chuyển 6 giây/cảnh, nút phát/tạm dừng, chấm và ảnh nhỏ xem trước để chọn cảnh.
const SLIDE_MS = 6000;
const SLIDES = [
  { img: 'fitness.jpg', thumb: 'fitness.jpg', label: 'Sport Center', pre: 'Một nơi', title: 'Mọi môn', text: 'Gym, Yoga, Boxing và Bơi lội — hàng chục lớp mỗi tuần cùng huấn luyện viên chuyên môn, một gói tập cho cả 4 bộ môn.' },
  { img: 'gym-floor.jpg', thumb: 'gym.jpg', label: 'Gym & Thể hình', pre: 'Bứt phá', title: 'Giới hạn', text: 'Khu tạ tự do, máy tập hiện đại và huấn luyện viên kèm từng động tác — tăng cơ, giảm mỡ đúng kỹ thuật ngay từ buổi đầu.' },
  { img: 'swim.jpg', thumb: 'swim.jpg', label: 'Bơi lội', pre: 'Hòa mình', title: 'Làn nước', text: 'Hồ bơi trong nhà quanh năm, lớp cho người mới bắt đầu đến luyện thi đấu. Rèn sức bền toàn thân, nhẹ nhàng cho khớp.' },
  { img: 'yoga.jpg', thumb: 'yoga.jpg', label: 'Yoga', pre: 'Tìm lại', title: 'Cân bằng', text: 'Những buổi Yoga lúc bình minh và chiều tối giúp cơ thể dẻo dai, tâm trí thư thái sau một ngày dài.' },
  { img: 'boxing.jpg', thumb: 'boxing.jpg', label: 'Boxing', pre: 'Đánh thức', title: 'Bản lĩnh', text: 'Cường độ cao, đốt mỡ nhanh và rèn phản xạ — xả hết căng thẳng cùng HLV võ thuật giàu kinh nghiệm.' },
];

// chữ tách từng ký tự để hiện dần (CSS .hero-char), khoảng trắng giữ nguyên
const splitChars = (text, start = 0) => [...text].map((ch, i) =>
  ch === ' ' ? ' ' : html`<span class="hero-char" style="animation-delay:${(start + i) * 0.035}s">${ch}</span>`);

function hero(s) {
  const subjects = homeSubjects(s.subjects);
  return html`
    <section id="top" class="relative px-2 sm:px-4 pt-2 sm:pt-4">
      <div class="hb hb-enter relative h-[680px] sm:h-[760px] rounded-[1.75rem] sm:rounded-[2.25rem] overflow-hidden" data-hero data-testid="hero">
        <!-- ảnh nền các cảnh: đổi bằng class .is-active, ảnh đang hiện phóng to chậm (Ken Burns) -->
        <div class="hb-bg absolute inset-0">
          ${SLIDES.map((sl, i) => html`<div class="hb-slide ${i === 0 ? 'is-active' : ''}" data-slide="${i}"><img src="${IMG}/${sl.img}" alt="" class="hb-img" ${i ? '' : 'fetchpriority="high"'} /></div>`)}
        </div>
        <div class="absolute inset-0 hb-shade pointer-events-none"></div>

        <div class="hb-copy-wrap relative z-10 h-full max-w-6xl mx-auto px-5 sm:px-10 flex flex-col justify-center pt-10 pb-16">
          ${SLIDES.map((sl, i) => html`
            <div class="hb-copy ${i === 0 ? 'is-active' : ''}" data-copy="${i}" ${i ? 'aria-hidden="true"' : ''}>
              <div class="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/80 hb-fade" style="animation-delay:.15s">
                <span class="w-8 h-px bg-white/60"></span> ${String(i + 1).padStart(2, '0')} · ${sl.label}
              </div>
              <h1 class="font-display font-extrabold uppercase text-white leading-[0.85] mt-4" ${i === 0 ? 'data-testid="hero-title"' : ''} aria-label="${sl.pre} ${sl.title}">
                <span aria-hidden="true" class="block text-4xl sm:text-6xl tracking-wide">${splitChars(sl.pre)}</span>
                <span aria-hidden="true" class="block text-7xl sm:text-[9.5rem] tracking-tight">${splitChars(sl.title, sl.pre.length)}</span>
              </h1>
              <p class="hb-fade mt-6 max-w-md text-sm sm:text-base text-white/85 leading-relaxed border-l-2 pl-4" style="border-color:${LIME};animation-delay:.6s">${sl.text}</p>
            </div>`)}
          <div class="hb-fade mt-8 flex flex-wrap gap-3" style="animation-delay:.75s">
            <a href="#/register" class="hb-btn-solid" data-testid="hero-register">Đăng ký hội viên ${icon('arrow-right', 'w-4 h-4')}</a>
            <button type="button" data-action="scroll" data-target="pricing" class="hb-btn-ghost">Xem bảng giá</button>
          </div>
          <div class="hb-fade mt-8 hidden sm:flex flex-wrap gap-2" style="animation-delay:.9s">
            ${subjects.slice(0, 5).map(x => html`<span class="px-3 py-1 rounded-full text-xs font-semibold text-white/85 bg-white/10 border border-white/15 backdrop-blur">${x.subjectName}</span>`)}
          </div>
        </div>

        <!-- góc trái dưới: phát / tạm dừng + thanh tiến độ cảnh + số cảnh -->
        <div class="absolute left-5 sm:left-10 bottom-6 sm:bottom-8 z-10 flex items-center gap-4 hb-fade" style="animation-delay:1s">
          <button type="button" class="w-10 h-10 rounded-full bg-white/15 border border-white/30 backdrop-blur text-white flex items-center justify-center hover:bg-white/25" data-hb-play aria-label="Tạm dừng" data-testid="hero-play">${icon('pause', 'w-4 h-4')}</button>
          <div class="w-28 sm:w-44 h-0.5 bg-white/25 rounded-full overflow-hidden"><div class="hb-progress h-full" style="background:${LIME};--ms:${SLIDE_MS}ms" data-hb-progress></div></div>
          <span class="text-white/80 text-xs font-bold tracking-widest" data-hb-count>01 / ${String(SLIDES.length).padStart(2, '0')}</span>
        </div>

        <!-- góc phải dưới: ảnh nhỏ xem trước + chấm chọn cảnh -->
        <div class="absolute right-5 sm:right-8 bottom-6 sm:bottom-8 z-10 flex flex-col items-end gap-4">
          <div class="hidden md:flex gap-3" data-testid="hero-thumbs">
            ${SLIDES.map((sl, i) => html`
              <button type="button" class="hb-thumb ${i === 0 ? 'is-active' : ''} hb-thumb-in" style="animation-delay:${1 + i * 0.08}s" data-hb-go="${i}" aria-label="Xem ${sl.label}">
                <img src="${IMG}/${sl.thumb}" alt="" />
                <span>${sl.label}</span>
              </button>`)}
          </div>
          <div class="flex gap-2" data-testid="hero-dots">
            ${SLIDES.map((sl, i) => html`<button type="button" class="hb-dot ${i === 0 ? 'is-active' : ''}" data-hb-go="${i}" aria-label="Cảnh ${i + 1}"></button>`)}
          </div>
        </div>
      </div>

    </section>`;
}

// Điều khiển slideshow ngay trên DOM (không vẽ lại cả trang): đổi cảnh, tự chạy, phát/tạm dừng, parallax khi cuộn.
// Trả về { index, stop } để khi trang vẽ lại (mở menu) thì gắn lại đúng cảnh đang xem.
function mountHero(root, startIndex = 0) {
  const hero = root.querySelector('[data-hero]');
  if (!hero) return null;
  const q = sel => [...hero.querySelectorAll(sel)];
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let playing = !reduced;
  let timer = 0;
  const progress = hero.querySelector('[data-hb-progress]');
  const playBtn = hero.querySelector('[data-hb-play]');

  const restartProgress = () => {
    progress.classList.remove('is-running');
    void progress.offsetWidth; // chạy lại animation từ đầu
    if (playing) progress.classList.add('is-running');
  };
  const show = i => {
    index = (i + SLIDES.length) % SLIDES.length;
    q('[data-slide]').forEach(n => n.classList.toggle('is-active', Number(n.dataset.slide) === index));
    q('[data-copy]').forEach(n => {
      const on = Number(n.dataset.copy) === index;
      // gỡ rồi gắn lại class để chữ chạy lại hiệu ứng xuất hiện
      n.classList.remove('is-active');
      n.setAttribute('aria-hidden', String(!on));
      if (on) { void n.offsetWidth; n.classList.add('is-active'); }
    });
    q('.hb-thumb').forEach(n => n.classList.toggle('is-active', Number(n.dataset.hbGo) === index));
    q('.hb-dot').forEach(n => n.classList.toggle('is-active', Number(n.dataset.hbGo) === index));
    const two = n => String(n).padStart(2, '0');
    hero.querySelector('[data-hb-count]').textContent = `${two(index + 1)} / ${two(SLIDES.length)}`;
    restartProgress();
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (playing && !document.hidden) timer = setTimeout(() => show(index + 1), SLIDE_MS);
  };
  const setPlaying = on => {
    playing = on;
    playBtn.setAttribute('aria-label', on ? 'Tạm dừng' : 'Phát');
    playBtn.innerHTML = String(icon(on ? 'pause' : 'play', 'w-4 h-4'));
    window.lucide?.createIcons();
    restartProgress();
    schedule();
  };
  const onClick = e => {
    const go = e.target.closest('[data-hb-go]');
    if (go) { show(Number(go.dataset.hbGo)); return; }
    if (e.target.closest('[data-hb-play]')) setPlaying(!playing);
  };
  const onVisibility = () => schedule();
  // cuộn: ảnh trôi chậm hơn trang, chữ mờ dần và đi lên (--hp: 0..1)
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
      hero.style.setProperty('--hp', p.toFixed(4));
    });
  };
  hero.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (startIndex) { hero.classList.remove('hb-enter'); show(startIndex); } else { restartProgress(); schedule(); }
  if (!playing) setPlaying(false);

  return {
    get index() { return index; },
    stop() {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      hero.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
    }
  };
}

// Từng từ trồi lên từ dưới mặt nạ khi khu cha [data-reveal] có .is-visible
const maskWords = (text, start = 0) => text.split(' ').map((w, i) =>
  html`<span class="mw"><span style="--w:${start + i}">${w}</span></span>${' '}`);

// Bộ môn nổi bật: dải ảnh co giãn — dải đang chọn mở rộng (tên, mô tả, nút), các dải khác thu hẹp hiện tên dọc.
// Rê chuột / chạm để chọn dải; khi cuộn tới các dải mở màn lần lượt; ảnh trôi lệch nhịp và chữ nền chạy theo cuộn.
function subjectsSection(s) {
  const list = homeSubjects(s.subjects);
  const marquee = [...list, ...list, ...list].map(x => x.subjectName);
  return html`
    <section id="subjects" class="sx-section relative pt-20 sm:pt-28 pb-4 overflow-hidden" data-sx>
      <div class="sx-marquee" aria-hidden="true">
        ${marquee.map(t => html`<span>${t}</span><span class="sx-dot"></span>`)}
      </div>
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8" data-reveal>
          <div>
            <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style="color:#2F6B55">
              <span class="anim-line h-px" style="background:#2F6B55;--lw:1.5rem"></span> Bộ môn
            </div>
            <h2 class="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 mt-2 leading-none" aria-label="Bộ môn nổi bật"><span aria-hidden="true">${maskWords('Bộ môn nổi bật')}</span></h2>
            <p class="anim-fade text-slate-600 mt-3 max-w-xl" style="--d:.45s">Từ thư giãn nhẹ nhàng đến cường độ cao — chọn môn hợp với bạn, lớp mở mỗi ngày trong tuần.</p>
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-500">
            <span class="font-display font-extrabold text-5xl text-slate-900 leading-none" data-count="${list.length}">${String(list.length).padStart(2, '0')}</span>
            <span>bộ môn<br />đang mở lớp</span>
          </div>
        </div>

        <div class="sx-track" data-reveal data-testid="subject-cards">
          ${list.map((x, i) => html`
            <article class="sx-panel ${i === 0 ? 'is-active' : ''}" style="--i:${i}" data-sx-panel tabindex="0" data-testid="subject-card" aria-label="${x.subjectName}">
              <div class="sx-media"><img src="${photoFor(x.subjectName)}" alt="${x.subjectName}" loading="lazy" class="sx-img" /></div>
              <div class="sx-shade"></div>
              <span class="sx-index">${String(i + 1).padStart(2, '0')}</span>
              <span class="sx-vtitle">${x.subjectName}</span>
              <div class="sx-body">
                <div class="flex flex-wrap gap-2">
                  ${tagsFor(x.subjectName).map(t => html`<span class="sx-chip">${t}</span>`)}
                </div>
                <h3 class="font-display font-extrabold text-4xl sm:text-5xl text-white leading-none mt-4">${x.subjectName}</h3>
                <p class="text-white/80 text-sm mt-3 max-w-sm line-clamp-2">${x.description || 'Lớp mở hằng tuần cùng huấn luyện viên chuyên môn.'}</p>
                <div class="flex items-center gap-4 mt-6">
                  <a href="#/register" class="sx-cta" data-testid="subject-try">Tập thử ${icon('arrow-up-right', 'w-4 h-4')}</a>
                  <span class="hidden sm:flex items-center gap-1.5 text-xs text-white/70">${icon('users', 'w-3.5 h-3.5')} Có HLV hướng dẫn</span>
                </div>
              </div>
            </article>`)}
        </div>
      </div>
    </section>`;
}

// Khu "Trở thành hội viên" kiểu poster: tiêu đề khổng lồ có ảnh lồng giữa chữ, 2 dòng trượt ngược chiều khi cuộn (--sx),
// chữ trồi lên + viên ảnh giãn ra khi khu hiện ra, 3 lợi ích đánh số, dải ảnh bộ môn chạy ngang liên tục ở đáy.
const CTA_PERKS = [
  ['Miễn phí', 'Tạo tài khoản trong một phút, không ràng buộc'],
  ['Linh hoạt', 'Mua gói qua VNPay hoặc tại quầy lễ tân'],
  ['Mọi bộ môn', 'Đặt lớp Gym, Yoga, Bơi, Boxing…']
];
const CTA_STRIP = [['gym.jpg', 'Gym'], ['yoga.jpg', 'Yoga'], ['boxing.jpg', 'Boxing'], ['swim.jpg', 'Bơi lội']];

// 1 từ trong tiêu đề: chữ trồi lên từ dưới mặt nạ (thứ tự --w để so le)
const ctaWord = (text, w, cls = '') => html`<span class="cta-word ${cls}" aria-hidden="true"><span style="--w:${w}">${text}</span></span>`;
// viên ảnh lồng giữa chữ, giãn từ 0 ra khi khu hiện ra
const ctaPill = (img, w) => html`<span class="cta-pill" aria-hidden="true" style="--w:${w}"><img src="${IMG}/${img}" alt="" loading="lazy" /></span>`;

function ctaBanner() {
  const strip = Array(4).fill(CTA_STRIP).flat();
  return html`
    <!-- nền tràn toàn màn, nội dung canh trong khung 6xl như các khu khác -->
    <section class="cta relative overflow-hidden mt-20 sm:mt-28" data-sx data-reveal data-testid="cta-banner">
      <div class="cta-glow" aria-hidden="true"></div>
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/60">
          <span class="flex items-center gap-3"><span class="anim-line h-px bg-white/50" style="--lw:2rem"></span> Hội viên</span>
          <span class="anim-fade-left hidden sm:inline" style="--d:.35s" data-testid="cta-slogan">Bắt đầu hôm nay · Bứt phá mỗi ngày</span>
        </div>

        <h2 class="cta-head font-display font-extrabold uppercase text-white mt-6" aria-label="Trở thành hội viên">
          <span class="cta-line cta-line-a" aria-hidden="true">
            ${ctaWord('Trở', 0)}${ctaPill('gym.jpg', 1)}${ctaWord('thành', 2)}
          </span>
          <span class="cta-line cta-line-b">
            ${ctaPill('yoga.jpg', 3)}${ctaWord('Hội', 4, 'cta-lime')}${ctaWord('viên', 5, 'cta-lime')}
          </span>
          <!-- dòng 3: viên nút cùng dáng viên ảnh (chữ + nút tròn mũi tên) -->
          <span class="cta-line cta-line-c">
            <a href="#/register" class="cta-join" style="--w:6" data-testid="cta-join">
              <span class="cta-join-text">Tham gia ngay</span>
              <span class="cta-join-arrow">${icon('arrow-up-right', 'w-1/2 h-1/2')}</span>
            </a>
          </span>
        </h2>

        <div class="mt-12 sm:mt-16 pb-14 sm:pb-16 border-b border-white/10">
          <ol class="grid sm:grid-cols-3 gap-6 sm:gap-0">
            ${CTA_PERKS.map(([title, text], i) => html`
              <li class="cta-perk sm:px-6 sm:first:pl-0 sm:border-l sm:first:border-l-0 border-white/15" style="--k:${i}">
                <div class="font-display font-extrabold text-3xl" style="color:${LIME}" data-count="${i + 1}">0${i + 1}</div>
                <div class="font-bold text-white mt-1">${title}</div>
                <div class="text-sm text-white/65 mt-1">${text}</div>
              </li>`)}
          </ol>
        </div>
      </div>

      <!-- dải ảnh bộ môn chạy ngang liên tục, nghiêng nhẹ; rê chuột thì dừng -->
      <div class="cta-strip-wrap" aria-hidden="true">
        <div class="cta-strip">
          ${strip.map(([img, label]) => html`
            <figure class="cta-strip-item"><img src="${IMG}/${img}" alt="" loading="lazy" /><figcaption>${label}</figcaption></figure>`)}
        </div>
      </div>
    </section>`;
}

function pricing(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays);
  const best = bestValueId(plans);
  return html`
    <section id="pricing" class="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
      <div class="text-center mb-10" data-reveal>
        <h2 class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900">Bảng giá gói tập</h2>
        <p class="text-slate-600 mt-2">Tập không giới hạn số buổi trong thời hạn gói. Gia hạn được cộng nối tiếp, không mất ngày.</p>
      </div>
      ${plans.length ? html`
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pt-3" data-testid="pricing-cards">
          ${plans.map(p => {
            const hot = p.packageId === best;
            return html`
              <div class="tilt-card relative rounded-3xl p-7 flex flex-col ${hot ? 'text-white shadow-2xl' : 'bg-white border border-slate-200'}" style="${hot ? `background:${DARK}` : ''}" data-testid="price-card" data-reveal data-tilt>
                ${hot ? html`<span class="absolute -top-3 left-7 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase text-slate-900" style="background:${LIME}">Tiết kiệm nhất</span>` : ''}
                <div class="flex items-center justify-between">
                  <span class="font-bold">${p.packageName}</span>
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full ${hot ? 'bg-white/15' : 'bg-slate-100'}">${p.durationDays} ngày</span>
                </div>
                <div class="font-display font-extrabold text-5xl mt-5">${money(p.price)}</div>
                <div class="text-sm mt-1 ${hot ? 'text-white/70' : 'text-slate-500'}">≈ ${money(Math.round(p.price / p.durationDays))} / ngày</div>
                <p class="text-sm mt-4 flex-1 ${hot ? 'text-white/80' : 'text-slate-600'}">${p.description || ''}</p>
                <ul class="mt-5 space-y-2 text-sm ${hot ? 'text-white/90' : 'text-slate-700'}">
                  ${['Đặt lớp không giới hạn', 'Giáo án & nhận xét từ HLV', 'Gia hạn nối tiếp'].map(t => html`<li class="flex items-center gap-2">${icon('check-circle-2', 'w-4 h-4 shrink-0')} ${t}</li>`)}
                </ul>
                <a href="#/register" class="btn mt-7 w-full !py-3 ${hot ? 'text-slate-900' : 'text-white'}" style="background:${hot ? LIME : DARK}">Bắt đầu ngay</a>
              </div>`;
          })}
        </div>` : html`
        <div class="text-center text-slate-500 rounded-3xl border border-dashed border-slate-300 py-10" data-testid="pricing-empty">
          Bảng giá đang được cập nhật — <a href="#/login" class="font-bold underline">đăng nhập</a> để xem gói tập hiện có.
        </div>`}
    </section>`;
}

function about() {
  const ribbon = [...RIBBON, ...RIBBON];
  return html`
    <section id="about" class="mt-20 sm:mt-24 overflow-hidden" style="background:#EFE9DC">
      <div class="grid lg:grid-cols-2 items-stretch">
        <!-- chữ thẳng hàng với khung 6xl của trang, ảnh thì tràn ra sát mép phải màn hình -->
        <div class="px-4 sm:px-6 py-14 lg:py-20 lg:pr-12 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <h2 class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 leading-tight">Nâng tầm<br />buổi tập của bạn</h2>
          <p class="text-slate-700 mt-4">Sport Center kết nối hội viên, huấn luyện viên và lễ tân trên cùng một hệ thống: lịch lớp luôn cập nhật, giáo án theo từng người, thanh toán minh bạch.</p>
          <div class="grid sm:grid-cols-2 gap-4 mt-8">
            ${FEATURES.map(([ic, title, text]) => html`
              <div class="rounded-2xl bg-white/70 p-4" data-reveal>
                <span class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:${DARK};color:${LIME}">${icon(ic, 'w-4 h-4')}</span>
                <div class="font-bold mt-3">${title}</div>
                <div class="text-sm text-slate-600 mt-1">${text}</div>
              </div>`)}
          </div>
        </div>
        <div class="relative min-h-[320px] lg:min-h-full overflow-hidden">
          <img src="${IMG}/boxing.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-y-0 left-0 w-24 hidden lg:block" style="background:linear-gradient(90deg,#EFE9DC,transparent)"></div>
          <div class="absolute hidden lg:flex justify-center gap-6 whitespace-nowrap font-display font-extrabold text-2xl py-2.5" style="left:56px;top:50%;width:1100px;transform:translate(-50%,-50%) rotate(-68deg);background:${DARK};color:#fff" aria-hidden="true">
            ${ribbon.map(t => html`<span class="flex items-center gap-6">${t}<span class="w-2.5 h-2.5 rounded-full" style="background:${LIME}"></span></span>`)}
          </div>
        </div>
      </div>
      <div class="lg:hidden flex gap-5 whitespace-nowrap overflow-hidden font-display font-extrabold text-xl py-2 px-4" style="background:${DARK};color:#fff" aria-hidden="true">
        ${ribbon.map(t => html`<span class="flex items-center gap-5">${t}<span class="w-2 h-2 rounded-full" style="background:${LIME}"></span></span>`)}
      </div>
    </section>`;
}

function steps() {
  return html`
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <h2 class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900">Bắt đầu chỉ với 3 bước</h2>
      <div class="grid md:grid-cols-3 gap-5 mt-8">
        ${STEPS.map(([ic, title, text], i) => html`
          <div class="tilt-card rounded-3xl border border-slate-200 bg-white p-6" data-reveal data-tilt>
            <div class="flex items-center justify-between">
              <span class="w-11 h-11 rounded-2xl flex items-center justify-center" style="background:#469B7E1A;color:#2F6B55">${icon(ic, 'w-5 h-5')}</span>
              <span class="font-display font-extrabold text-5xl text-slate-200">0${i + 1}</span>
            </div>
            <div class="font-bold text-lg mt-4">${title}</div>
            <p class="text-sm text-slate-600 mt-1">${text}</p>
          </div>`)}
      </div>
    </section>`;
}

function footer() {
  return html`
    <footer class="px-4 sm:px-6 pb-6">
      <div class="max-w-6xl mx-auto rounded-[2rem] px-6 sm:px-12 pt-12 pb-8 text-white" style="background:${DARK}">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 class="font-display font-extrabold text-4xl sm:text-5xl leading-tight">Chọn môn yêu thích,<br /><span style="color:${LIME}">bắt đầu ngay hôm nay!</span></h2>
          <a href="#/register" class="btn self-start !px-5 text-slate-900" style="background:${LIME}">${icon('arrow-right', 'w-4 h-4')} Đăng ký hội viên</a>
        </div>
        <div class="h-px bg-white/15 my-8"></div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-white/70">
          <div class="flex items-center gap-2.5 text-white">
            ${brandMark('w-9 h-9 ring-1 ring-white/20')}
            <span class="font-display font-extrabold text-xl tracking-wide">SPORT CENTER</span>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            ${nav.slice(1).map(([id, label]) => html`<button type="button" data-action="scroll" data-target="${id}" class="hover:text-white">${label}</button>`)}
            <a href="#/login" class="hover:text-white">Đăng nhập</a>
          </div>
          <div>© ${new Date().getFullYear()} Sport Center · SWP391</div>
        </div>
      </div>
    </footer>`;
}

function view(s) {
  return html`
    <div class="min-h-screen" style="background:#FBF9F4" data-testid="landing">
      ${header(s)}
      ${hero(s)}
      ${subjectsSection(s)}
      ${ctaBanner()}
      ${pricing(s)}
      ${about()}
      ${steps()}
      ${footer()}
    </div>`;
}

// hiện dần khi cuộn tới: thêm .is-visible cho phần tử [data-reveal]
function observeReveal(root, io) {
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((n, i) => {
    n.style.setProperty('--reveal-delay', `${(i % 4) * 0.08}s`);
    io.observe(n);
  });
}

// số đếm từ 00 lên giá trị trong data-count (dạng 2 chữ số)
function countUp(node) {
  const to = Number(node.dataset.count) || 0;
  if (!to || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  const dur = 900 + to * 60;
  const step = now => {
    const t = Math.min(1, (now - start) / dur);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3)))).padStart(2, '0');
    if (t < 1) requestAnimationFrame(step);
  };
  node.textContent = '00';
  requestAnimationFrame(step);
}

// nghiêng 3D + vệt sáng theo con trỏ cho [data-tilt]
function onTilt(e) {
  const card = e.target.closest?.('[data-tilt]');
  document.querySelectorAll('[data-tilt].is-tilting').forEach(n => { if (n !== card) { n.classList.remove('is-tilting'); n.style.transform = ''; } });
  if (!card || e.pointerType === 'touch') return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  card.classList.add('is-tilting');
  card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
  card.style.setProperty('--gx', `${x * 100}%`);
  card.style.setProperty('--gy', `${y * 100}%`);
}

// chọn dải bộ môn (rê chuột, chạm hoặc tab tới)
function onPanelEnter(e) {
  const panel = e.target.closest?.('[data-sx-panel]');
  if (!panel || panel.classList.contains('is-active')) return;
  panel.parentElement.querySelectorAll('[data-sx-panel].is-active').forEach(n => n.classList.remove('is-active'));
  panel.classList.add('is-active');
}

// tiến độ cuộn qua từng khu [data-sx] -> --sx (0..1) cho chữ nền, ảnh trôi lệch nhịp, cụm ảnh hội viên
function makeScrollFx(el) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight || 1;
    el.querySelectorAll('[data-sx]').forEach(sec => {
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      sec.style.setProperty('--sx', p.toFixed(4));
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  return { update, stop() { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); } };
}

export default function LandingPage(el, { navigate }) {
  const scrollFx = makeScrollFx(el);
  el.addEventListener('pointerover', onPanelEnter);
  el.addEventListener('focusin', onPanelEnter);
  let heroCtl = null;
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      en.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(en.target);
    }), { threshold: 0.15 })
    : null;
  document.addEventListener('pointermove', onTilt, { passive: true });
  const unmount = mountPage(el, {
    afterRender: () => {
      scrollFx.update();
      if (io) observeReveal(el, io); else el.querySelectorAll('[data-reveal]').forEach(n => n.classList.add('is-visible'));
      // trang vẽ lại (mở menu...) -> gắn lại slideshow, giữ đúng cảnh đang xem
      const at = heroCtl ? heroCtl.index : 0;
      heroCtl?.stop();
      heroCtl = mountHero(el, at);
    },
    state: { menuOpen: false },
    load: async () => {
      const data = await settle({
        packages: [() => publicApi.packages(), []],
        subjects: [() => publicApi.subjects(), []]
      });
      return { ...data, subjects: data.subjects.filter(x => x.status !== 'INACTIVE') };
    },
    view,
    actions: {
      menu: (t, e, ctx) => ctx.set({ menuOpen: !ctx.state.menuOpen }),
      scroll: (t, e, ctx) => {
        const id = t.dataset.target;
        // đóng menu mobile trước (vẽ lại trang) rồi mới tìm phần tử đích trong DOM mới
        if (ctx.state.menuOpen) ctx.set({ menuOpen: false });
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
  return () => {
    heroCtl?.stop();
    scrollFx.stop();
    el.removeEventListener('pointerover', onPanelEnter);
    el.removeEventListener('focusin', onPanelEnter);
    unmount?.();
    io?.disconnect();
    document.removeEventListener('pointermove', onTilt);
  };
}
