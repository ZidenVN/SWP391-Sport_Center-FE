import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { authApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { HOME_BY_ROLE } from '../../routes.js';

// Đổi mật khẩu cho mọi vai trò: PUT /auth/change-password.
// BE trả token mới và vô hiệu token cũ -> phải thay token đang lưu, nếu không lần gọi API kế tiếp sẽ bị 401.
const ERRORS = {
  ERR_AUTH_001: { currentPassword: 'Mật khẩu hiện tại không đúng' },
  ERR_AUTH_002: { newPassword: 'Mật khẩu mới phải khác mật khẩu hiện tại' }
};

function passwordInput(name, label, hint = '') {
  return field(label, html`
    <div class="relative" data-field-wrap>
      ${input(name, { type: 'password', required: true, attrs: `autocomplete="${name === 'currentPassword' ? 'current-password' : 'new-password'}" maxlength="64"` })}
      <button type="button" class="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-slate-700" data-action="toggle" data-target="${name}" aria-label="Hiện mật khẩu">${icon('eye', 'w-4 h-4')}</button>
    </div>`, hint);
}

function view() {
  return html`
    ${pageHeader('Đổi mật khẩu', 'Sau khi đổi, các thiết bị khác đang đăng nhập sẽ phải đăng nhập lại')}
    <form class="card p-6 max-w-lg space-y-4" data-action="save" data-testid="password-form" novalidate>
      ${passwordInput('currentPassword', 'Mật khẩu hiện tại')}
      ${passwordInput('newPassword', 'Mật khẩu mới', 'Từ 6 đến 64 ký tự, khác mật khẩu hiện tại')}
      ${passwordInput('confirmPassword', 'Nhập lại mật khẩu mới')}
      <p class="text-xs text-slate-500">Tài khoản tạo bằng đăng nhập Google không có mật khẩu nên không đổi được ở đây.</p>
      <div class="flex justify-end gap-2">
        <a href="#${HOME_BY_ROLE[session.role()] || '/'}" class="btn-secondary">Hủy</a>
        <button type="submit" class="btn-primary" data-testid="password-save">${icon('key-round', 'w-4 h-4')} Đổi mật khẩu</button>
      </div>
    </form>`;
}

function validate(d) {
  const e = {};
  if (!d.currentPassword) e.currentPassword = 'Nhập mật khẩu hiện tại';
  if (!d.newPassword) e.newPassword = 'Nhập mật khẩu mới';
  else if (d.newPassword.length < 6 || d.newPassword.length > 64) e.newPassword = 'Mật khẩu mới từ 6 đến 64 ký tự';
  else if (d.newPassword === d.currentPassword) e.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  if (d.newPassword && d.confirmPassword !== d.newPassword) e.confirmPassword = 'Mật khẩu nhập lại không khớp';
  return e;
}

export default function ChangePassword(el) {
  return mountPage(el, {
    view,
    actions: {
      toggle: btn => {
        const field = el.querySelector(`input[name="${btn.dataset.target}"]`);
        field.type = field.type === 'password' ? 'text' : 'password';
      },
      save: async form => {
        const d = readForm(form);
        const errors = validate(d);
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        try {
          const res = await withBusyRethrow(form, () => authApi.changePassword(d.currentPassword, d.newPassword));
          if (res?.token) session.update({ token: res.token });
          toast(res?.message || 'Đổi mật khẩu thành công!');
          form.reset();
        } catch (err) {
          // lỗi nghiệp vụ -> hiện ngay dưới ô tương ứng; lỗi validate của BE đã có field sẵn
          showFormErrors(form, ERRORS[err.code] ? { fields: ERRORS[err.code] } : err);
          if (!ERRORS[err.code] && !err.fields) toast(err.message, 'error');
        }
      }
    }
  });
}

// withBusy nuốt lỗi; ở đây cần lỗi để gắn vào đúng ô nên tự khóa nút
async function withBusyRethrow(form, fn) {
  let failure = null;
  const res = await withBusy(form, async () => {
    try {
      return await fn();
    } catch (err) {
      failure = err;
      return undefined;
    }
  });
  if (failure) throw failure;
  return res;
}
