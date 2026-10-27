import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, showFormErrors, withBusy, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { session } from '../../core/session.js';
import { userApi } from '../../api/endpoints.js';
import { roleLabel, genderLabel } from '../../core/format.js';

// Hồ sơ cá nhân dùng chung cho Lễ tân / HLV / Quản lý: GET/PUT /users/me (email đăng nhập không đổi được).
function validate(d) {
  const e = {};
  if (!d.firstName) e.firstName = 'Vui lòng nhập họ';
  else if (d.firstName.length > 50) e.firstName = 'Tối đa 50 ký tự';
  if (!d.lastName) e.lastName = 'Vui lòng nhập tên';
  else if (d.lastName.length > 50) e.lastName = 'Tối đa 50 ký tự';
  if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone)) e.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
  return e;
}

function view(s) {
  const u = s.me || {};
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  return html`
    ${pageHeader('Thông tin cá nhân', 'Xem và cập nhật thông tin tài khoản của bạn')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit" data-testid="profile-card">
        <div class="w-20 h-20 mx-auto rounded-full bg-brand-dark text-brand-lime flex items-center justify-center text-3xl font-black">
          ${(u.firstName || u.email || '?').charAt(0).toUpperCase()}
        </div>
        <div class="font-display text-3xl leading-none font-extrabold text-brand-dark mt-3" data-testid="profile-name">${name}</div>
        <div class="text-sm text-slate-500 mt-1">${u.email || ''}</div>
        <div class="text-xs font-bold uppercase tracking-wide text-brand-deep mt-1">${roleLabel(session.role())}</div>
        <dl class="mt-5 text-left text-sm space-y-2 border-t border-slate-100 pt-4">
          <div class="flex justify-between gap-3"><dt class="text-slate-500">Giới tính</dt><dd class="font-semibold">${genderLabel(u.gender)}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-slate-500">Số điện thoại</dt><dd class="font-semibold">${u.phone || '—'}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-slate-500">Số quyền</dt><dd class="font-semibold">${(session.get()?.permissions || []).length}</dd></div>
        </dl>
        <a href="#/account/password" class="btn-secondary w-full justify-center mt-5" data-testid="profile-password">${icon('key-round', 'w-4 h-4')} Đổi mật khẩu</a>
      </div>
      <form class="card p-6 lg:col-span-2 space-y-4" data-action="save" novalidate data-testid="profile-form">
        <h2 class="font-bold text-lg">Cập nhật thông tin</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          ${field('Họ', input('firstName', { value: u.firstName, required: true }))}
          ${field('Tên', input('lastName', { value: u.lastName, required: true }))}
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          ${field('Giới tính', select('gender', GENDER_OPTIONS, (u.gender || '').toUpperCase(), { placeholder: 'Chọn giới tính' }))}
          ${field('Số điện thoại', input('phone', { type: 'tel', value: u.phone, placeholder: '0912345678' }))}
        </div>
        ${field('Email đăng nhập', input('email', { type: 'email', value: u.email, attrs: 'disabled' }), 'Email đăng nhập không đổi được, liên hệ Quản lý nếu cần')}
        <div class="flex justify-end pt-2">
          <button type="submit" class="btn-primary" data-testid="profile-save">${icon('save', 'w-4 h-4')} Lưu thay đổi</button>
        </div>
      </form>
    </div>`;
}

export default function MyProfile(el) {
  return mountPage(el, {
    load: async () => ({ me: await userApi.me() }),
    view,
    actions: {
      save: async (form, e, ctx) => {
        const d = readForm(form);
        const errors = validate(d);
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = { firstName: d.firstName, lastName: d.lastName, gender: d.gender || undefined, phone: d.phone || undefined };
        const me = await withBusy(form, () => userApi.updateMe(payload));
        if (!me) return;
        // tên mới hiện ngay ở góc trên (session)
        session.update({ firstName: me.firstName, lastName: me.lastName, fullName: [me.firstName, me.lastName].filter(Boolean).join(' ') });
        toast('Đã cập nhật thông tin cá nhân');
        ctx.set({ me });
      }
    }
  });
}
