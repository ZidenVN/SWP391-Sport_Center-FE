import { html, icon, raw } from '../../core/dom.js';
import { brandMark } from '../../components/brand.js';

// Khung chung cho Đăng nhập / Đăng ký: ảnh nền phủ tối + thẻ kính mờ ở giữa, có tab chuyển 2 trang.
// Kiểu ô nhập trên nền tối nằm trong .auth-glass (css/styles.css).
// active: 'login' | 'register' — tab đang chọn; wide: form nhiều ô (đăng ký) cần thẻ rộng hơn
export function authLayout(content, { active = 'login', wide = false } = {}) {
  const tab = (id, href, label) => html`
    <a href="${href}" role="tab" aria-selected="${active === id}" data-testid="auth-tab-${id}"
      class="pb-3 text-center text-base font-semibold border-b-2 transition-colors ${active === id ? 'text-white border-white/80' : 'text-white/45 border-white/10 hover:text-white/75'}">${label}</a>`;
  return html`
    <div class="auth-glass isolate relative min-h-screen flex flex-col text-white" style="background:#0c1e18" data-testid="auth-page">
      <img src="/landing/gym-floor.jpg" alt="" class="fixed inset-0 w-full h-full object-cover -z-20" />
      <div class="fixed inset-0 -z-10" style="background:linear-gradient(180deg, rgba(18,40,31,.62) 0%, rgba(8,22,17,.82) 100%)"></div>

      <header class="px-5 sm:px-8 h-16 flex items-center">
        <a href="#/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-white">${icon('arrow-left', 'w-4 h-4')} Về trang chủ</a>
      </header>

      <main class="flex-1 flex items-center justify-center px-4 pb-10">
        <section class="auth-card w-full ${wide ? 'max-w-[520px]' : 'max-w-[420px]'} rounded-[28px] px-6 py-8 sm:px-9 sm:py-10">
          <a href="#/" class="flex justify-center mb-6" data-testid="auth-home" aria-label="Sport Center">${brandMark('w-14 h-14 ring-1 ring-white/15 shadow-lg')}</a>
          <nav class="grid grid-cols-2 mb-7" role="tablist">
            ${tab('login', '#/login', 'Đăng nhập')}
            ${tab('register', '#/register', 'Đăng ký')}
          </nav>
          ${content}
        </section>
      </main>
    </div>`;
}

// Ô nhập có icon bên trái (email, mật khẩu...) cho thẻ kính
export function iconInput(name, iconName, { type = 'text', placeholder = '', autocomplete = '', label } = {}) {
  return html`
    <label class="block">
      <span class="block text-sm font-medium text-white/85 mb-2">${label}</span>
      <span class="relative block" data-field-wrap>
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none">${icon(iconName, 'w-4 h-4')}</span>
        <input class="input !pl-10 ${type === 'password' ? '!pr-11' : ''}" name="${name}" type="${type}" placeholder="${placeholder}" ${autocomplete ? raw(`autocomplete="${autocomplete}"`) : ''} required />
        ${type === 'password' ? html`
          <button type="button" data-action="toggle-pw" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/50 hover:text-white" aria-label="Hiện mật khẩu" data-testid="toggle-pw">${icon('eye', 'w-4 h-4')}</button>` : ''}
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
