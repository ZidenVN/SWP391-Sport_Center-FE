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
  { subjectName: 'Bơi lội', description: 'Hồ bơi trong nhà, lớp cho người mới và nâng cao.' }
];
const RIBBON = ['Yoga', 'Gym', 'Boxing', 'Bơi lội', 'Tennis', 'Bóng rổ', 'Bóng đá'];

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
          <a href="#/login" class="hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-white/90" data-testid="landing-login">
            <span class="w-5 h-5 rounded-full flex items-center justify-center" style="background:${DARK};color:${LIME}">${icon('arrow-right', 'w-3 h-3')}</span> Đăng nhập
          </a>
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

function hero(s) {
  const subjects = s.subjects.length ? s.subjects : FALLBACK_SUBJECTS;
  return html`
    <section id="top" class="relative">
      <div class="relative min-h-[560px] sm:min-h-[620px] rounded-b-[2.5rem] overflow-hidden" style="background:${DARK}">
        <img src="${IMG}/hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover opacity-55" />
        <div class="absolute inset-0" style="background:linear-gradient(90deg, ${DARK} 0%, rgba(23,63,49,.75) 45%, rgba(23,63,49,.15) 100%)"></div>
        <div class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-36 sm:pt-44 pb-28">
          <h1 class="font-display font-extrabold text-white uppercase leading-[0.9] text-6xl sm:text-8xl lg:text-9xl tracking-tight" data-testid="hero-title">
            Sống khỏe<br />mỗi ngày
          </h1>
          <p class="mt-5 text-lg sm:text-xl font-semibold" style="color:${LIME}">Trung tâm thể thao dành cho mọi lứa tuổi</p>
          <p class="mt-3 max-w-lg text-white/80">Hàng chục lớp mỗi tuần cùng huấn luyện viên chuyên môn. Đăng ký gói tập, đặt lớp và theo dõi tiến độ — tất cả trong một ứng dụng.</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#/register" class="btn !px-6 !py-3 text-slate-900 hover:brightness-95" style="background:${LIME}" data-testid="hero-register">${icon('user-plus', 'w-4 h-4')} Đăng ký hội viên</a>
            <button type="button" data-action="scroll" data-target="pricing" class="btn !px-6 !py-3 bg-white/10 text-white border border-white/30 hover:bg-white/20">Xem bảng giá</button>
          </div>
        </div>
      </div>

      <form data-action="find" class="relative z-10 -mt-14 max-w-5xl mx-4 lg:mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5" data-testid="finder">
        <div class="font-display font-bold text-xl text-slate-900 mb-3 px-1">Tìm lớp phù hợp <span class="font-sans text-sm font-medium text-slate-500">— đăng nhập để xem lịch và đặt chỗ</span></div>
        <div class="grid sm:grid-cols-[1fr_auto] gap-3">
          <label class="relative">
            <span class="sr-only">Bộ môn</span>
            <span class="absolute left-3 top-2.5 text-slate-400">${icon('dumbbell', 'w-4 h-4')}</span>
            <select name="subject" class="input pl-9 !rounded-full">
              <option value="">Tất cả bộ môn</option>
              ${subjects.map(x => html`<option>${x.subjectName}</option>`)}
            </select>
          </label>
          <button type="submit" class="btn !px-6 text-white" style="background:${DARK}" data-testid="finder-submit">${icon('search', 'w-4 h-4')} Tìm lớp</button>
        </div>
      </form>
    </section>`;
}

function subjectsSection(s) {
  const list = (s.subjects.length ? s.subjects : FALLBACK_SUBJECTS).slice(0, 6);
  return html`
    <section id="subjects" class="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <h2 class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900">Bộ môn nổi bật</h2>
          <p class="text-slate-600 mt-2 max-w-xl">Từ thư giãn nhẹ nhàng đến cường độ cao — chọn môn hợp với bạn, lớp mở mỗi ngày trong tuần.</p>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-5" data-testid="subject-cards">
        ${list.map(x => html`
          <article class="group w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.84rem)] rounded-3xl border border-slate-200 bg-white p-3 hover:shadow-xl transition-shadow" data-testid="subject-card">
            <div class="h-48 rounded-2xl overflow-hidden"><img src="${photoFor(x.subjectName)}" alt="${x.subjectName}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <div class="px-2 pt-4 pb-2">
              <h3 class="font-display font-bold text-2xl text-slate-900">${x.subjectName}</h3>
              <p class="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">${x.description || 'Lớp mở hằng tuần cùng huấn luyện viên chuyên môn.'}</p>
              <div class="flex items-center justify-between mt-4">
                <div class="flex gap-2 text-slate-500">
                  ${['users', 'calendar-days', 'medal'].map(i => html`<span class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">${icon(i, 'w-3.5 h-3.5')}</span>`)}
                </div>
                <a href="#/register" class="text-sm font-bold flex items-center gap-1" style="color:${DARK}">Tập thử ${icon('arrow-right', 'w-4 h-4')}</a>
              </div>
            </div>
          </article>`)}
      </div>
    </section>`;
}

function ctaBanner() {
  return html`
    <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
      <div class="relative rounded-[2rem] overflow-hidden px-6 sm:px-12 py-12 grid lg:grid-cols-[1fr_1.2fr_1fr] gap-8 items-center" style="background:${DARK}">
        <div class="hidden lg:block h-56 rounded-3xl overflow-hidden -rotate-3"><img src="${IMG}/football.jpg" alt="" class="w-full h-full object-cover" /></div>
        <div class="text-center">
          <h2 class="font-display font-extrabold text-4xl sm:text-5xl" style="color:${LIME}">Trở thành hội viên</h2>
          <p class="text-white/75 mt-3">Tạo tài khoản miễn phí, mua gói online qua VNPay và đặt lớp ngay trên điện thoại.</p>
          <div class="flex flex-wrap justify-center gap-3 mt-6">
            <a href="#/register" class="btn !px-5 text-slate-900" style="background:${LIME}">${icon('user-plus', 'w-4 h-4')} Đăng ký miễn phí</a>
            <a href="#/login" class="btn !px-5 bg-white/10 text-white border border-white/30 hover:bg-white/20">${icon('log-in', 'w-4 h-4')} Đã có tài khoản</a>
          </div>
        </div>
        <div class="hidden lg:block h-56 rounded-3xl overflow-hidden rotate-3"><img src="${IMG}/tennis.jpg" alt="" class="w-full h-full object-cover" /></div>
      </div>
    </section>`;
}

function pricing(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays);
  const best = bestValueId(plans);
  return html`
    <section id="pricing" class="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
      <div class="text-center mb-10">
        <h2 class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900">Bảng giá gói tập</h2>
        <p class="text-slate-600 mt-2">Tập không giới hạn số buổi trong thời hạn gói. Gia hạn được cộng nối tiếp, không mất ngày.</p>
      </div>
      ${plans.length ? html`
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pt-3" data-testid="pricing-cards">
          ${plans.map(p => {
            const hot = p.packageId === best;
            return html`
              <div class="relative rounded-3xl p-7 flex flex-col ${hot ? 'text-white shadow-2xl' : 'bg-white border border-slate-200'}" style="${hot ? `background:${DARK}` : ''}" data-testid="price-card">
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
              <div class="rounded-2xl bg-white/70 p-4">
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
          <div class="rounded-3xl border border-slate-200 bg-white p-6">
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

export default function LandingPage(el, { navigate }) {
  return mountPage(el, {
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
      },
      // chưa đăng nhập -> đưa tới đăng nhập, xong thì vào thẳng trang chọn lớp đã lọc sẵn bộ môn
      find: form => {
        const subject = form.subject.value;
        sessionStorage.setItem('sc_after_login', subject ? `/member/classes?subject=${encodeURIComponent(subject)}` : '/member/classes');
        navigate('/login');
      }
    }
  });
}
