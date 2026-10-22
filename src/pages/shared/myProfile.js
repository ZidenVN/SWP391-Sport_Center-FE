import { html, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { userApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel, roleLabel, phoneText } from '../../core/format.js';

// Hồ sơ cá nhân dùng chung cho Lễ tân / HLV / Quản lý.
// Lễ tân và Quản lý có quyền xem/sửa danh sách user (VIEW_USER, UPDATE_USER) nên tìm được chính mình trong /users
// và sửa qua PUT /users/{id}. HLV chưa có quyền này trên BE -> chỉ xem thông tin đã đăng nhập, không sửa được.
function view(s) {
  const m = s.me;
  if (!m) {
    const u = session.get();
    return html`
      ${pageHeader('Thông tin cá nhân', 'Thông tin tài khoản đang đăng nhập')}
      <div class="card p-6 max-w-lg">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-black shrink-0">
            ${(u.firstName || u.email || '?').charAt(0).toUpperCase()}
          </div>
          <div class="min-w-0">
            <div class="font-extrabold text-lg truncate">${u.fullName || u.email}</div>
            <div class="text-sm text-slate-500 truncate">${u.email}</div>
            <div class="text-xs font-bold uppercase tracking-wide text-emerald-600 mt-1">${roleLabel(u.role)}</div>
          </div>
        </div>
        <p class="text-sm text-slate-500 mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3">
          Tài khoản của bạn chưa được cấp quyền tự sửa thông tin. Liên hệ Quản lý trung tâm để cập nhật.
        </p>
      </div>`;
  }
  return html`
    ${pageHeader('Thông tin cá nhân', 'Cập nhật thông tin tài khoản của bạn')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit">
        <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl font-black">
          ${(m.firstName || '?').charAt(0).toUpperCase()}
        </div>
        <div class="font-extrabold text-lg mt-3">${m.firstName} ${m.lastName}</div>
        <div class="text-sm text-slate-500">${m.email}</div>
        <div class="text-xs font-bold uppercase tracking-wide text-emerald-600 mt-1">${roleLabel(m.roleName)}</div>
        <div class="mt-4 text-sm text-left space-y-2 border-t border-slate-100 pt-4">
          <div class="flex justify-between"><span class="text-slate-500">Mã tài khoản</span><b>#${m.id}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Giới tính</span><b>${genderLabel(m.gender)}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Điện thoại</span><b>${phoneText(m.phone)}</b></div>
        </div>
      </div>
      <form class="card p-6 lg:col-span-2 space-y-4" data-action="save" novalidate>
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Họ', input('firstName', { value: m.firstName, required: true }))}
          ${field('Tên', input('lastName', { value: m.lastName, required: true }))}
          ${field('Giới tính', select('gender', GENDER_OPTIONS, (m.gender || '').toUpperCase(), { required: true, placeholder: 'Chọn' }))}
          ${field('Số điện thoại', input('phone', { type: 'tel', value: m.phone, required: true }))}
        </div>
        ${field('Email', input('email', { value: m.email, attrs: 'disabled' }), 'Email dùng để đăng nhập, không thể thay đổi')}
        <div class="flex justify-end"><button type="submit" class="btn-primary">Lưu thay đổi</button></div>
      </form>
    </div>`;
}

export default function MyProfile(el) {
  return mountPage(el, {
    load: async () => {
      // email trong session là email người dùng gõ lúc đăng nhập, có thể khác hoa/thường so với BE lưu
      const email = (session.get()?.email || '').toLowerCase();
      // không có quyền xem danh sách tài khoản (HLV) -> khỏi gọi API chắc chắn bị 403
      if (!session.can('VIEW_USER')) return { me: null };
      try {
        const users = await userApi.list();
        return { me: users.find(u => (u.email || '').toLowerCase() === email) || null };
      } catch {
        // không có quyền VIEW_USER (HLV) -> hiện thông tin đã đăng nhập, không chặn trang
        return { me: null };
      }
    },
    view,
    actions: {
      save: async (form, e, ctx) => {
        const m = ctx.state.me;
        const data = readForm(form);
        const errors = {};
        ['firstName', 'lastName', 'gender', 'phone'].forEach(k => { if (!data[k]) errors[k] = 'Không được để trống'; });
        if (data.phone && !/^(0|\+84)[0-9]{9}$/.test(data.phone)) errors.phone = 'Số điện thoại không hợp lệ';
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = { ...m, firstName: data.firstName, lastName: data.lastName, gender: data.gender, phone: data.phone };
        const me = await withBusy(form, () => userApi.update(m.id, payload));
        if (me) {
          session.update({ firstName: me.firstName, lastName: me.lastName, fullName: `${me.firstName} ${me.lastName}` });
          toast('Đã cập nhật thông tin');
          ctx.set({ me });
          const nameEl = document.querySelector('[data-testid="current-user"]');
          if (nameEl) nameEl.textContent = `${me.firstName} ${me.lastName}`;
        }
      }
    }
  });
}
