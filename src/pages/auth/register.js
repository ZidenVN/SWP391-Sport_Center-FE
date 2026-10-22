import { html, render, bindActions, readForm } from '../../core/dom.js';
import { field, input, select, GENDER_OPTIONS, showFormErrors, toast } from '../../core/ui.js';
import { authApi } from '../../api/endpoints.js';
import { authLayout } from './authLayout.js';
import { loginAndStart, goAfterLogin } from './login.js';

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
  render(el, authLayout('Đăng ký hội viên', 'Tạo tài khoản để đặt lớp và mua gói tập.', html`
    <form data-action="register" class="space-y-4" novalidate>
      <div class="grid grid-cols-2 gap-3">
        ${field('Họ', input('firstName', { required: true, placeholder: 'Nguyễn' }))}
        ${field('Tên', input('lastName', { required: true, placeholder: 'An' }))}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${field('Giới tính', select('gender', GENDER_OPTIONS, '', { required: true, placeholder: 'Chọn' }))}
        ${field('Số điện thoại', input('phone', { type: 'tel', required: true, placeholder: '0912345678' }))}
      </div>
      ${field('Email', input('email', { type: 'email', required: true, placeholder: 'ban@example.com', attrs: 'autocomplete="email"' }))}
      ${field('Mật khẩu', input('password', { type: 'password', required: true, placeholder: 'Tối thiểu 6 ký tự', attrs: 'autocomplete="new-password"' }))}
      ${field('Nhập lại mật khẩu', input('confirmPassword', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }))}
      <button type="submit" class="btn-primary w-full !py-2.5">Tạo tài khoản</button>
    </form>
    <p class="text-sm text-slate-600 text-center mt-6">
      Đã có tài khoản? <a href="#/login" class="font-bold text-indigo-600 hover:underline">Đăng nhập</a>
    </p>
  `));

  const form = el.querySelector('form');
  return bindActions(el, {
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
}
