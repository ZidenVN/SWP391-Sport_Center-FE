import { html, icon, raw } from '../../core/dom.js';
import { brandMark } from '../../components/brand.js';

// Khung chung cho Đăng nhập / Đăng ký kiểu "glassy": thẻ kính 2 nửa trên nền tối.
// Một nửa là form, nửa kia là panel lời chào + nút chuyển trang; trang đăng ký đảo 2 nửa
// và panel trượt sang phía bên kia khi chuyển (CSS trong css/styles.css, mục .auth-glass).
// active: 'login' | 'register'; wide: form nhiều ô (đăng ký) cần cột form rộng hơn
const SWITCH_KEY = 'sc_auth_switch';

const PANEL = {
  login: {
    title: html`XIN CHÀO,<br />BẠN MỚI!`,
    text: 'Tạo tài khoản để đặt lớp, theo dõi lịch tập và nhận giáo án từ huấn luyện viên.',
    href: '#/register',
    cta: 'Tạo tài khoản'
  },
  register: {
    title: html`CHÀO MỪNG<br />TRỞ LẠI!`,
    text: 'Đã là hội viên? Đăng nhập để tiếp tục hành trình tập luyện của bạn.',
    href: '#/login',
    cta: 'Đăng nhập'
  }
};

export function authLayout(content, { active = 'login', wide = false } = {}) {
  const panel = PANEL[active];
  const isRegister = active === 'register';
  // vừa bấm chuyển từ trang kia sang -> chạy hiệu ứng trượt panel
  let switched = false;
  try {
    switched = sessionStorage.getItem(SWITCH_KEY) === active;
    sessionStorage.removeItem(SWITCH_KEY);
  } catch { /* bỏ qua */ }
  return html`
    <div class="auth-glass isolate relative min-h-screen flex flex-col text-white overflow-hidden" data-testid="auth-page">
      <img src="/landing/gym-floor.jpg" alt="" class="fixed inset-0 w-full h-full object-cover -z-30 auth-bg-img" />
      <div class="fixed inset-0 -z-20 auth-bg-shade"></div>
      <!-- mảng sáng trôi nhẹ phía sau thẻ kính -->
      <div class="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <span class="auth-shard auth-shard-1"></span>
        <span class="auth-shard auth-shard-2"></span>
        <span class="auth-shard auth-shard-3"></span>
      </div>

      <header class="px-5 sm:px-8 h-16 flex items-center">
        <a href="#/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white">${icon('arrow-left', 'w-4 h-4')} Về trang chủ</a>
      </header>

      <main class="flex-1 flex items-center justify-center px-4 pb-10">
        <section class="auth-card auth-enter w-full ${wide ? 'max-w-[1000px]' : 'max-w-[880px]'} rounded-[28px] overflow-hidden grid ${wide ? (isRegister ? 'md:grid-cols-[1fr_1.35fr]' : 'md:grid-cols-[1.35fr_1fr]') : 'md:grid-cols-2'} ${isRegister ? 'auth-flip' : ''}"
          data-active="${active}">
          <div class="auth-form-side px-6 py-8 sm:px-10 sm:py-10 ${switched ? 'auth-form-in' : ''} ${isRegister ? 'md:order-2' : ''}">
            <a href="#/" class="inline-flex mb-6" data-testid="auth-home" aria-label="Sport Center">${brandMark('w-11 h-11 ring-1 ring-white/15 shadow-lg')}</a>
            <h1 class="font-display text-4xl font-extrabold tracking-tight mb-7">${isRegister ? 'Đăng ký' : 'Đăng nhập'}</h1>
            ${content}
          </div>

          <aside class="auth-panel relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col justify-center ${switched ? 'auth-panel-in' : ''} ${isRegister ? 'md:order-1' : ''}" data-testid="auth-panel">
            <span class="auth-sheen" aria-hidden="true"></span>
            <div class="relative">
              <h2 class="font-display text-4xl sm:text-5xl font-extrabold leading-[0.95] tracking-tight">${panel.title}</h2>
              <p class="text-sm text-white/70 mt-4 max-w-[17rem] leading-relaxed">${panel.text}</p>
              <a href="${panel.href}" class="auth-ghost-btn mt-7" data-action="auth-switch" data-to="${isRegister ? 'login' : 'register'}"
                data-testid="auth-tab-${isRegister ? 'login' : 'register'}">${panel.cta} ${icon('arrow-right', 'w-4 h-4')}</a>
            </div>
          </aside>
        </section>
      </main>
    </div>`;
}

// gọi trong trang: ghi lại hướng chuyển để trang kia chạy hiệu ứng trượt
export function markAuthSwitch(target) {
  try { sessionStorage.setItem(SWITCH_KEY, target); } catch { /* bỏ qua */ }
}

// Ô nhập kiểu gạch chân có icon bên trái (email, mật khẩu...) cho thẻ kính
export function iconInput(name, iconName, { type = 'text', placeholder = '', autocomplete = '', label } = {}) {
  return html`
    <label class="block">
      <span class="block text-sm font-medium text-white/85 mb-2">${label}</span>
      <span class="relative block" data-field-wrap>
        <span class="absolute left-1 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">${icon(iconName, 'w-4 h-4')}</span>
        <input class="input auth-line !pl-8 ${type === 'password' ? '!pr-10' : ''}" name="${name}" type="${type}" placeholder="${placeholder}" ${autocomplete ? raw(`autocomplete="${autocomplete}"`) : ''} required />
        ${type === 'password' ? html`
          <button type="button" data-action="toggle-pw" class="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/50 hover:text-white" aria-label="Hiện mật khẩu" data-testid="toggle-pw">${icon('eye', 'w-4 h-4')}</button>` : ''}
      </span>
    </label>`;
}

// Bật / tắt hiện mật khẩu cho nút con mắt (dùng chung 2 trang)
export function togglePassword(btn) {
  const box = btn.parentElement.querySelector('input');
  const show = box.type === 'password';
  box.type = show ? 'text' : 'password';
  btn.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  btn.innerHTML = String(icon(show ? 'eye-off' : 'eye', 'w-4 h-4'));
  window.lucide?.createIcons();
}
