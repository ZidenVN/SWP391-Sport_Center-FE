import { html, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, textarea, GENDER_OPTIONS, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel } from '../../core/format.js';

function view(s) {
  const m = s.me;
  return html`
    ${pageHeader('Hồ sơ cá nhân', 'Cập nhật thông tin để HLV hiểu rõ hơn về bạn')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit">
        <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black">
          ${(m.firstName || '?').charAt(0).toUpperCase()}
        </div>
        <div class="font-extrabold text-lg mt-3">${m.firstName} ${m.lastName}</div>
        <div class="text-sm text-slate-500">${m.email}</div>
        <div class="mt-4 text-sm text-left space-y-2 border-t border-slate-100 pt-4">
          <div class="flex justify-between"><span class="text-slate-500">Mã hội viên</span><b>#${m.memberId}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Giới tính</span><b>${genderLabel(m.gender)}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Điện thoại</span><b>${m.phone}</b></div>
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
        ${field('Mục tiêu tập luyện', textarea('trainingGoal', m.trainingGoal === 'Chưa cập nhật' ? '' : m.trainingGoal, { placeholder: 'VD: Giảm 5kg trong 3 tháng, tăng sức bền...' }))}
        <div class="flex justify-end"><button type="submit" class="btn-primary">Lưu thay đổi</button></div>
      </form>
    </div>`;
}

export default function MemberProfile(el) {
  return mountPage(el, {
    load: async () => ({ me: await memberApi.me() }),
    view,
    actions: {
      save: async (form, e, ctx) => {
        const data = readForm(form);
        const errors = {};
        ['firstName', 'lastName', 'gender', 'phone'].forEach(k => { if (!data[k]) errors[k] = 'Không được để trống'; });
        if (data.phone && !/^(0|\+84)[0-9]{9}$/.test(data.phone)) errors.phone = 'Số điện thoại không hợp lệ';
        if (!data.trainingGoal) errors.trainingGoal = 'Vui lòng nhập mục tiêu tập luyện';
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = { firstName: data.firstName, lastName: data.lastName, gender: data.gender, phone: data.phone, trainingGoal: data.trainingGoal };
        const me = await withBusy(form, () => memberApi.updateMe(payload));
        if (me) {
          session.update({ firstName: me.firstName, lastName: me.lastName, fullName: `${me.firstName} ${me.lastName}` });
          toast('Đã cập nhật hồ sơ');
          ctx.set({ me });
          const nameEl = document.querySelector('[data-testid="current-user"]');
          if (nameEl) nameEl.textContent = `${me.firstName} ${me.lastName}`;
        }
      }
    }
  });
}
