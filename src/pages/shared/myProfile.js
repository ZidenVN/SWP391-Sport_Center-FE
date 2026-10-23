import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { userApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel, roleLabel, phoneText, isPlaceholderPhone } from '../../core/format.js';
import { syncPermissions } from '../../components/permissionSync.js';

// Hồ sơ cá nhân dùng chung cho Lễ tân / HLV / Quản lý: GET/PUT /users/me.
// Xem được khi vai trò có VIEW_OWN_PROFILE, sửa được khi có UPDATE_OWN_PROFILE (bật/tắt ở trang Phân quyền).
const PHONE_RE = /^(0|\+84)[0-9]{9}$/;

function avatar(name, size = 'w-20 h-20 text-3xl') {
  return html`<div class="${size} rounded-full bg-brand-dark text-brand-lime flex items-center justify-center font-black shrink-0">${(name || '?').charAt(0).toUpperCase()}</div>`;
}

function notice(text, tone = 'sand') {
  const cls = tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-brand-sand/70 border-brand-line text-slate-600';
  return html`<div class="rounded-xl border ${cls} p-3 text-sm flex gap-2" data-testid="profile-notice">${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>${text}</span></div>`;
}

// Vai trò chưa được cấp quyền xem hồ sơ: chỉ hiện thông tin có sẵn trong phiên đăng nhập
function noAccessView() {
  const u = session.get();
  return html`
    ${pageHeader('Thông tin cá nhân', 'Thông tin tài khoản đang đăng nhập')}
    <div class="card p-6 max-w-lg" data-testid="profile-no-access">
      <div class="flex items-center gap-4">
        ${avatar(u.firstName || u.email, 'w-16 h-16 text-2xl')}
        <div class="min-w-0">
          <div class="font-extrabold text-lg truncate">${u.fullName || u.email}</div>
          <div class="text-sm text-slate-500 truncate">${u.email}</div>
          <div class="text-xs font-bold uppercase tracking-wide text-brand-deep mt-1">${roleLabel(u.role)}</div>
        </div>
      </div>
      <div class="mt-5">${notice('Vai trò của bạn chưa được cấp quyền xem hồ sơ cá nhân. Liên hệ Quản lý trung tâm nếu cần.')}</div>
    </div>`;
}

function view(s) {
  const m = s.me;
  if (!m) return noAccessView();
  const canEdit = (m.permissions || []).includes('UPDATE_OWN_PROFILE');
  const ro = canEdit ? '' : 'disabled';
  const phone = isPlaceholderPhone(m.phone) ? '' : m.phone;
  return html`
    ${pageHeader('Thông tin cá nhân', canEdit ? 'Cập nhật thông tin tài khoản của bạn' : 'Thông tin tài khoản của bạn')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit" data-testid="profile-card">
        <div class="flex justify-center">${avatar(m.firstName)}</div>
        <div class="font-display text-3xl leading-none font-extrabold text-brand-dark mt-3" data-testid="profile-name">${m.firstName} ${m.lastName}</div>
        <div class="text-sm text-slate-500 mt-1">${m.email}</div>
        <div class="text-xs font-bold uppercase tracking-wide text-brand-deep mt-1">${roleLabel(m.roleName)}</div>
        <div class="mt-4 text-sm text-left space-y-2 border-t border-brand-line/60 pt-4">
          <div class="flex justify-between gap-3"><span class="text-slate-500">Mã tài khoản</span><b>#${m.id}</b></div>
          <div class="flex justify-between gap-3"><span class="text-slate-500">Giới tính</span><b>${genderLabel(m.gender)}</b></div>
          <div class="flex justify-between gap-3"><span class="text-slate-500">Điện thoại</span><b>${phoneText(m.phone)}</b></div>
          ${m.roleName === 'COACH' ? html`<div class="flex justify-between gap-3"><span class="text-slate-500">Chuyên môn</span><b class="text-right">${m.speciality || 'Chưa cập nhật'}</b></div>` : ''}
        </div>
      </div>
      <form class="card p-6 lg:col-span-2 space-y-4" data-action="save" data-testid="profile-form" novalidate>
        ${canEdit ? '' : notice('Vai trò của bạn chỉ được xem hồ sơ, chưa được cấp quyền cập nhật. Liên hệ Quản lý trung tâm nếu cần sửa thông tin.', 'amber')}
        ${canEdit && isPlaceholderPhone(m.phone) ? notice('Tài khoản đăng nhập bằng Google chưa có số điện thoại, hãy bổ sung để trung tâm liên hệ.', 'amber') : ''}
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Họ', input('firstName', { value: m.firstName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${field('Tên', input('lastName', { value: m.lastName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${canEdit
            ? field('Giới tính', select('gender', GENDER_OPTIONS, (m.gender || '').toUpperCase(), { required: true, placeholder: 'Chọn' }))
            : field('Giới tính', input('genderText', { value: genderLabel(m.gender), attrs: 'disabled' }))}
          ${field('Số điện thoại', input('phone', { type: 'tel', value: phone, required: true, placeholder: '0912345678', attrs: `inputmode="tel" maxlength="12" ${ro}` }))}
        </div>
        ${field('Email', input('email', { value: m.email, attrs: 'disabled' }), 'Email dùng để đăng nhập, không thể thay đổi')}
        ${m.roleName === 'COACH' ? field('Chuyên môn', input('speciality', { value: m.speciality || '', attrs: 'disabled' }), 'Do Quản lý trung tâm cập nhật') : ''}
        ${canEdit ? html`
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" data-action="reset">Hoàn tác</button>
            <button type="submit" class="btn-primary" data-testid="profile-save">${icon('save', 'w-4 h-4')} Lưu thay đổi</button>
          </div>` : ''}
      </form>
    </div>`;
}

function validate(data) {
  const errors = {};
  ['firstName', 'lastName', 'gender', 'phone'].forEach(k => { if (!String(data[k] || '').trim()) errors[k] = 'Không được để trống'; });
  if (data.phone && !PHONE_RE.test(data.phone.trim())) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0 (hoặc +84)';
  return errors;
}

export default function MyProfile(el) {
  return mountPage(el, {
    load: async () => {
      // lấy quyền mới nhất trước: Quản lý có thể vừa bật/tắt quyền hồ sơ cho vai trò này
      await syncPermissions({ force: true });
      if (!session.can('VIEW_OWN_PROFILE')) return { me: null };
      return { me: await userApi.me() };
    },
    view,
    actions: {
      reset: (t, e, ctx) => ctx.set({ me: { ...ctx.state.me } }),
      save: async (form, e, ctx) => {
        const data = readForm(form);
        const errors = validate(data);
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = { firstName: data.firstName.trim(), lastName: data.lastName.trim(), gender: data.gender, phone: data.phone.trim() };
        const me = await withBusy(form, () => userApi.updateMe(payload));
        if (!me) return;
        const fullName = `${me.firstName} ${me.lastName}`;
        session.update({ firstName: me.firstName, lastName: me.lastName, fullName, permissions: me.permissions || session.get().permissions });
        toast('Đã cập nhật thông tin');
        ctx.set({ me });
        const nameEl = document.querySelector('[data-testid="current-user"]');
        if (nameEl) nameEl.textContent = fullName;
        const avatarEl = document.querySelector('[data-testid="current-avatar"]');
        if (avatarEl) avatarEl.textContent = me.firstName.charAt(0).toUpperCase();
      }
    }
  });
}
