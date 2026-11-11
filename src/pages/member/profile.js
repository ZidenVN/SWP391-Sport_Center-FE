import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, withBusy, toast, showFormErrors } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel, isPlaceholderPhone, phoneText } from '../../core/format.js';
import { quizStore, bmiInfo, GOALS } from '../../core/quiz.js';

const PHONE_RE = /^(0|\+84)[0-9]{9}$/;

const notice = text => html`
  <div class="rounded-xl border bg-amber-50 border-amber-200 text-amber-800 p-3 text-sm flex gap-2" data-testid="profile-notice">
    ${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>${text}</span>
  </div>`;

const TONE = { sky: 'bg-sky-100 text-sky-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700' };

// giới hạn giống BE (MemberProfileUpdateDTO)
const BODY = { height: [50, 250], weight: [20, 300] };

// mục tiêu = đáp án câu TRAINING_GOAL của quiz; mục tiêu cũ nhập tay không khớp thì vẫn giữ trong danh sách
const goalOptions = goal => [
  ...GOALS.map(g => ({ value: g.label, label: g.label })),
  ...(goal && !GOALS.some(g => g.label === goal) ? [{ value: goal, label: goal }] : [])
];

// Chiều cao / cân nặng: BE lưu trong hồ sơ (quiz hoặc tự sửa ở đây); BE cũ chưa trả thì lấy bản sao quiz trên máy này
function bodyOf(m) {
  const quiz = quizStore.answers(m.email) || {};
  const num = v => (v === null || v === undefined || v === '' ? null : Number(v));
  return { height: num(m.heightCm ?? quiz.height), weight: num(m.weightKg ?? quiz.weight) };
}

function bodyCard(m, goal) {
  const { height, weight } = bodyOf(m);
  const bmi = bmiInfo(height, weight);
  const done = session.get()?.quizCompleted ?? Boolean(quizStore.answers(m.email));
  const stat = (label, value, unit) => html`
    <div class="rounded-2xl bg-brand-sand/70 p-3 text-center">
      <div class="text-[11px] text-slate-500">${label}</div>
      <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${value ?? '—'}${value != null ? html`<span class="text-xs font-sans font-semibold text-slate-500 ml-0.5">${unit}</span>` : ''}</div>
    </div>`;
  return html`
    <div class="mt-4 border-t border-brand-line/60 pt-4 text-left" data-testid="profile-body">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="text-xs font-bold uppercase tracking-wide text-slate-500">Chỉ số cơ thể</span>
        <a href="#/member/onboarding${done ? '?redo=1' : ''}" class="text-xs font-bold text-brand-deep hover:underline">${done ? 'Làm lại' : 'Làm khảo sát'}</a>
      </div>
      <div class="grid grid-cols-2 gap-2">
        ${stat('Chiều cao', height, 'cm')}
        ${stat('Cân nặng', weight, 'kg')}
      </div>
      ${bmi ? html`
        <div class="flex items-center justify-between mt-3 text-sm">
          <span class="text-slate-500">Chỉ số BMI</span>
          <span class="flex items-center gap-2"><b>${bmi.value}</b><span class="px-2 py-0.5 rounded-full text-xs font-bold ${TONE[bmi.tone]}">${bmi.label}</span></span>
        </div>` : ''}
      <div class="flex items-start justify-between gap-3 mt-2 text-sm">
        <span class="text-slate-500 shrink-0">Mục tiêu</span><b class="text-right">${goal || '—'}</b>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">Sửa trực tiếp ở form bên cạnh, không cần làm lại khảo sát.</p>
    </div>`;
}

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
  const body = bodyOf(m);
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
        ${bodyCard(m, goal)}
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
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Chiều cao (cm)', input('heightCm', { type: 'number', value: body.height ?? '', placeholder: '165', attrs: `inputmode="decimal" step="0.1" min="${BODY.height[0]}" max="${BODY.height[1]}" ${ro}` }))}
          ${field('Cân nặng (kg)', input('weightKg', { type: 'number', value: body.weight ?? '', placeholder: '60', attrs: `inputmode="decimal" step="0.1" min="${BODY.weight[0]}" max="${BODY.weight[1]}" ${ro}` }))}
        </div>
        ${canEdit
          ? field('Mục tiêu tập luyện', select('trainingGoal', goalOptions(goal), goal, { required: true, placeholder: 'Chọn mục tiêu' }), 'Cùng các lựa chọn với bài khảo sát — dùng để gợi ý gói tập và lớp học')
          : field('Mục tiêu tập luyện', input('goalText', { value: goal, attrs: 'disabled' }))}
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
        if (!String(data.trainingGoal || '').trim()) errors.trainingGoal = 'Vui lòng chọn mục tiêu tập luyện';
        // để trống = giữ nguyên số đang có
        const measure = (key, [min, max], label, unit) => {
          const raw = String(data[key] ?? '').trim();
          if (!raw) return null;
          const v = Number(raw);
          if (!Number.isFinite(v) || v < min || v > max) errors[key] = `${label} từ ${min} đến ${max} ${unit}`;
          return v;
        };
        const heightCm = measure('heightCm', BODY.height, 'Chiều cao', 'cm');
        const weightKg = measure('weightKg', BODY.weight, 'Cân nặng', 'kg');
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const payload = {
          firstName: data.firstName.trim(), lastName: data.lastName.trim(), gender: data.gender,
          phone: data.phone.trim(), trainingGoal: data.trainingGoal.trim(),
          heightCm: heightCm ?? undefined, weightKg: weightKg ?? undefined
        };
        const me = await withBusy(form, () => memberApi.updateMe(payload));
        if (me) {
          // cập nhật bản sao quiz trên máy để phần gợi ý gói / lớp dùng số mới
          const quiz = quizStore.answers(me.email);
          if (quiz) {
            const goalId = GOALS.find(g => g.label === me.trainingGoal)?.id;
            quizStore.save(me.email, { ...quiz, height: me.heightCm ?? heightCm ?? quiz.height, weight: me.weightKg ?? weightKg ?? quiz.weight, ...(goalId ? { goal: goalId } : {}) });
          }
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
