import { html, render, bindActions, readForm } from '../../core/dom.js';
import { authApi, memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { HOME_BY_ROLE } from '../../routes.js';
import { authLayout, iconInput, togglePassword } from './authLayout.js';
import { googleSection, mountGoogleButton } from '../../components/googleLogin.js';

// Đăng nhập + chuẩn bị session (member cần memberId cho các màn sau)
export async function loginAndStart(email, password) {
  return startSession(await authApi.login(email, password), email);
}

// Dùng chung cho đăng nhập mật khẩu và Google: kiểm tra phản hồi, lưu session, member lấy thêm memberId
export async function startSession(auth, email) {
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
  render(el, authLayout(html`
    <form data-action="login" class="space-y-5" novalidate>
      ${iconInput('email', 'mail', { label: 'Email', type: 'email', placeholder: 'ban@example.com', autocomplete: 'username' })}
      ${iconInput('password', 'lock', { label: 'Mật khẩu', type: 'password', placeholder: '••••••••', autocomplete: 'current-password' })}
      <p id="login-error" class="hidden text-sm text-rose-100 bg-rose-500/20 border border-rose-300/30 rounded-xl px-3 py-2" role="alert"></p>
      <button type="submit" class="auth-primary-btn !mt-7">Đăng nhập</button>
    </form>
    ${googleSection('hoặc tiếp tục với')}
    <p class="text-sm text-white/65 text-center mt-7">
      Chưa có tài khoản? <a href="#/register" class="font-bold text-white hover:underline ml-1">Đăng ký</a>
    </p>
  `, { active: 'login' }));

  const form = el.querySelector('form');
  const errorBox = el.querySelector('#login-error');
  const showError = message => {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  };
  mountGoogleButton(el, { onSuccess: () => goAfterLogin(navigate), onError: showError });

  return bindActions(el, {
    'toggle-pw': togglePassword,
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
