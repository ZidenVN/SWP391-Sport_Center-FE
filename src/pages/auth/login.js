import { html, render, bindActions, readForm } from '../../core/dom.js';
import { field, input, withBusy } from '../../core/ui.js';
import { authApi, memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { HOME_BY_ROLE } from '../../routes.js';
import { authLayout } from './authLayout.js';

// Chỉ điền sẵn email (không lưu mật khẩu trong code vì repo công khai)
const DEV_ACCOUNTS = [
  { label: 'Quản lý', email: 'admin@sportcenter.com' },
  { label: 'Lễ tân', email: 'receptionist@sportcenter.com' },
  { label: 'HLV', email: 'coach@sportcenter.com' }
];

// Đăng nhập + chuẩn bị session (member cần memberId cho các màn sau)
export async function loginAndStart(email, password) {
  const auth = await authApi.login(email, password);
  if (!auth || !auth.token) throw new Error('Phản hồi đăng nhập không hợp lệ');
  if (!HOME_BY_ROLE[auth.role]) throw new Error(`Tài khoản có vai trò "${auth.role}" chưa được hỗ trợ trên giao diện`);
  session.start(auth, email);
  if (auth.role === 'MEMBER') {
    try {
      const me = await memberApi.me();
      session.update({ memberId: me.memberId, firstName: me.firstName, lastName: me.lastName });
    } catch {
      // không chặn đăng nhập nếu lỗi tải hồ sơ
    }
  }
  return auth;
}

export function goAfterLogin(navigate) {
  const saved = sessionStorage.getItem('sc_after_login');
  sessionStorage.removeItem('sc_after_login');
  const home = HOME_BY_ROLE[session.role()];
  const allowedPrefix = home.split('/').slice(0, 2).join('/');
  navigate(saved && saved.startsWith(allowedPrefix) ? saved : home, { replace: true });
}

export default function LoginPage(el, { navigate }) {
  const isDev = Boolean(import.meta.env?.DEV);
  render(el, authLayout('Đăng nhập', 'Chào mừng bạn quay lại!', html`
    <form data-action="login" class="space-y-4" novalidate>
      ${field('Email', input('email', { type: 'email', required: true, placeholder: 'ban@example.com', attrs: 'autocomplete="username"' }))}
      ${field('Mật khẩu', input('password', { type: 'password', required: true, placeholder: '••••••', attrs: 'autocomplete="current-password"' }))}
      <p id="login-error" class="hidden text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2" role="alert"></p>
      <button type="submit" class="btn-primary w-full !py-2.5">Đăng nhập</button>
    </form>
    <p class="text-sm text-slate-600 text-center mt-6">
      Chưa có tài khoản? <a href="#/register" class="font-bold text-indigo-600 hover:underline">Đăng ký hội viên</a>
    </p>
    ${isDev ? html`
      <div class="mt-8 rounded-xl border border-dashed border-slate-300 p-4">
        <div class="text-xs font-bold text-slate-500 mb-2">Tài khoản test (chỉ hiện khi chạy dev)</div>
        <div class="flex flex-wrap gap-2">
          ${DEV_ACCOUNTS.map(a => html`<button type="button" class="btn-secondary btn-sm" data-action="fill" data-email="${a.email}">${a.label}</button>`)}
        </div>
      </div>` : ''}
  `));

  const form = el.querySelector('form');
  const errorBox = el.querySelector('#login-error');

  return bindActions(el, {
    fill: btn => {
      form.email.value = btn.dataset.email;
      form.password.value = '';
      form.password.focus();
    },
    login: async () => {
      const { email, password } = readForm(form);
      errorBox.classList.add('hidden');
      if (!email || !password) {
        errorBox.textContent = 'Vui lòng nhập email và mật khẩu';
        errorBox.classList.remove('hidden');
        return;
      }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Đang đăng nhập...';
      try {
        await loginAndStart(email, password);
        goAfterLogin(navigate);
      } catch (err) {
        errorBox.textContent = err.status === 401 ? 'Sai email hoặc mật khẩu' : err.message;
        errorBox.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Đăng nhập';
      }
    }
  });
}
