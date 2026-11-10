import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel, isPlaceholderPhone, phoneText } from '../../core/format.js';

const PHONE_RE = /^(0|\+84)[0-9]{9}$/;

const notice = text => html`
  <div class="rounded-xl border bg-amber-50 border-amber-200 text-amber-800 p-3 text-sm flex gap-2" data-testid="profile-notice">
    ${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>${text}</span>
  </div>`;

function view(s) {
  const m = s.me;
  if (!m) {
    return html`
      ${pageHeader('Hồ sơ cá nhân', 'Thông tin tài khoản của bạn')}
      <div class="card p-6 max-w-lg" data-testid="profile-no-access">${notice('Tài khoản hội viên hiện chưa được cấp quyền xem hồ sơ cá nhân. Liên hệ lễ tân nếu cần hỗ trợ.')}</div>`;
  }
  // Quản lý có thể tắt quyền tự sửa hồ sơ của hội viên ở trang Phân quyền
  const canEdit = session.can('UPDATE_OWN_PROFILE');
  const ro = canEdit ? '' : 'disabled';
  const goal = m.trainingGoal === 'Chưa cập nhật' ? '' : m.trainingGoal || '';
  return html`
    ${pageHeader('Hồ sơ cá nhân', canEdit ? 'Cập nhật thông tin để HLV hiểu rõ hơn về bạn' : 'Thông tin tài khoản của bạn')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit">
        <div class="w-20 h-20 mx-auto rounded-full bg-brand-dark text-brand-lime flex items-center justify-center text-3xl font-black">
          ${(m.firstName || '?').charAt(0).toUpperCase()}
        </div>
        <div class="font-display text-3xl leading-none font-extrabold text-brand-dark mt-3">${m.firstName} ${m.lastName}</div>
        <div class="text-sm text-slate-500 mt-1">${m.email}</div>
        <div class="mt-4 text-sm text-left space-y-2 border-t border-brand-line/60 pt-4">
          <div class="flex justify-between"><span class="text-slate-500">Giới tính</span><b>${genderLabel(m.gender)}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Điện thoại</span><b>${phoneText(m.phone)}</b></div>
        </div>
      </div>
      <form class="card p-6 lg:col-span-2 space-y-4" data-action="save" data-testid="profile-form" novalidate>
        ${canEdit ? '' : notice('Bạn chỉ được xem hồ sơ, chưa được cấp quyền tự cập nhật. Liên hệ lễ tân nếu cần sửa thông tin.')}
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Họ', input('firstName', { value: m.firstName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${field('Tên', input('lastName', { value: m.lastName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${canEdit
            ? field('Giới tính', select('gender', GENDER_OPTIONS, (m.gender || '').toUpperCase(), { required: true, placeholder: 'Chọn' }))
            : field('Giới tính', input('genderText', { value: genderLabel(m.gender), attrs: 'disabled' }))}
          ${field('Số điện thoại', input('phone', { type: 'tel', value: isPlaceholderPhone(m.phone) ? '' : m.phone, required: true, placeholder: '0912345678', attrs: `inputmode="tel" maxlength="12" ${ro}` }))}
        </div>
        ${field('Email', input('email', { value: m.email, attrs: 'disabled' }), 'Email dùng để đăng nhập, không thể thay đổi')}
        ${field('Mục tiêu tập luyện', html`<textarea class="input" name="trainingGoal" rows="3" placeholder="VD: Giảm 5kg trong 3 tháng, tăng sức bền..." ${ro}>${goal}</textarea>`)}
        ${canEdit ? html`<div class="flex justify-end"><button type="submit" class="btn-primary" data-testid="profile-save">${icon('save', 'w-4 h-4')} Lưu thay đổi</button></div>` : ''}
      </form>
    </div>`;
}

export default function MemberProfile(el) {
  return mountPage(el, {
    load: async () => {
      if (!session.can('VIEW_OWN_PROFILE')) return { me: null };
      return { me: await memberApi.me() };
    },
    view,
    actions: {
      save: async (form, e, ctx) => {
        const data = readForm(form);
        const errors = {};
        ['firstName', 'lastName', 'gender', 'phone'].forEach(k => { if (!String(data[k] || '').trim()) errors[k] = 'Không được để trống'; });
        if (data.phone && !PHONE_RE.test(data.phone.trim())) errors.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0 (hoặc +84)';
        if (!String(data.trainingGoal || '').trim()) errors.trainingGoal = 'Vui lòng nhập mục tiêu tập luyện';
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = {
          firstName: data.firstName.trim(), lastName: data.lastName.trim(), gender: data.gender,
          phone: data.phone.trim(), trainingGoal: data.trainingGoal.trim()
        };
        const me = await withBusy(form, () => memberApi.updateMe(payload));
        if (me) {
          const fullName = `${me.firstName} ${me.lastName}`;
          session.update({ firstName: me.firstName, lastName: me.lastName, fullName });
          toast('Đã cập nhật hồ sơ');
          ctx.set({ me });
          const nameEl = document.querySelector('[data-testid="current-user"]');
          if (nameEl) nameEl.textContent = fullName;
          const avatarEl = document.querySelector('[data-testid="current-avatar"]');
          if (avatarEl) avatarEl.textContent = me.firstName.charAt(0).toUpperCase();
        }
      }
    }
  });
}
