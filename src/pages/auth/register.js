import { html, render, bindActions, readForm } from '../../core/dom.js';
import { field, input, GENDER_OPTIONS, showFormErrors, toast } from '../../core/ui.js';
import { authApi } from '../../api/endpoints.js';
import { authLayout, iconInput, togglePassword } from './authLayout.js';
import { darkSelect, mountDarkSelects } from '../../components/darkSelect.js';
import { loginAndStart, goAfterLogin } from './login.js';
import { googleSection, mountGoogleButton } from '../../components/googleLogin.js';
import { quizStore } from '../../core/quiz.js';

// Cùng luật với RegisterRequestDTO phía BE để báo lỗi sớm
export function validateRegister(data) {
  const errors = {};
  if (!data.firstName) errors.firstName = 'Vui lòng nhập họ';
  if (!data.lastName) errors.lastName = 'Vui lòng nhập tên';
  if (!data.gender) errors.gender = 'Vui lòng chọn giới tính';
  if (!data.email) errors.email = 'Vui lòng nhập email';
  else if (!/^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(data.email)) errors.email = 'Email không đúng định dạng';
  if (!data.phone) errors.phone = 'Vui lòng nhập số điện thoại';
  else if (!/^(0|\+84)[0-9]{9}$/.test(data.phone)) errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
  if (!data.password || data.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  return errors;
}

export default function RegisterPage(el, { navigate }) {
  render(el, authLayout(html`
    <form data-action="register" class="space-y-4" novalidate>
      <div class="grid grid-cols-2 gap-3">
        ${field('Họ', input('firstName', { required: true, placeholder: 'Nguyễn' }))}
        ${field('Tên', input('lastName', { required: true, placeholder: 'An' }))}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${darkSelect('gender', GENDER_OPTIONS, { label: 'Giới tính', placeholder: 'Chọn giới tính' })}
        ${iconInput('phone', 'phone', { label: 'Số điện thoại', type: 'tel', placeholder: '0912345678', autocomplete: 'tel' })}
      </div>
      ${iconInput('email', 'mail', { label: 'Email', type: 'email', placeholder: 'ban@example.com', autocomplete: 'email' })}
      ${iconInput('password', 'lock', { label: 'Mật khẩu', type: 'password', placeholder: 'Tối thiểu 6 ký tự', autocomplete: 'new-password' })}
      ${iconInput('confirmPassword', 'lock', { label: 'Nhập lại mật khẩu', type: 'password', placeholder: 'Nhập lại mật khẩu', autocomplete: 'new-password' })}
      <button type="submit" class="auth-primary-btn !mt-7">Tạo tài khoản</button>
    </form>
    ${googleSection('hoặc tiếp tục với', 'Đăng ký bằng Google')}
    <p class="text-sm text-white/65 text-center mt-7">
      Đã có tài khoản? <a href="#/login" class="font-bold text-white hover:underline ml-1">Đăng nhập</a>
    </p>
  `, { active: 'register', wide: true }));

  const form = el.querySelector('form');
  mountGoogleButton(el, { onSuccess: () => goAfterLogin(navigate), onError: message => toast(message, 'error') });
  const unmountSelects = mountDarkSelects(el);
  const unbind = bindActions(el, {
    'toggle-pw': togglePassword,
    register: async () => {
      const data = readForm(form);
      const errors = validateRegister(data);
      showFormErrors(form, { fields: errors });
      if (Object.keys(errors).length) return;

      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Đang tạo tài khoản...';
      try {
        const { confirmPassword, ...payload } = data;
        await authApi.register(payload);
        quizStore.markPending(payload.email);
        toast('Đăng ký thành công! Đang đăng nhập...');
        await loginAndStart(payload.email, payload.password);
        goAfterLogin(navigate);
      } catch (err) {
        showFormErrors(form, err);
        toast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Tạo tài khoản';
      }
    }
  });
  return () => { unbind(); unmountSelects(); };
}
