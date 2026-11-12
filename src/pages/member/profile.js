import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, field, input, select, GENDER_OPTIONS, withBusy, toast, showFormErrors, openModal } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { genderLabel, isPlaceholderPhone, phoneText, daysUntil } from '../../core/format.js';
import { quizStore, bmiInfo, GOALS } from '../../core/quiz.js';

const PHONE_RE = /^(0|\+84)[0-9]{9}$/;

const notice = text => html`
  <div class="rounded-xl border bg-amber-50 border-amber-200 text-amber-800 p-3 text-sm flex gap-2" data-testid="profile-notice">
    ${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>${text}</span>
  </div>`;

// giới hạn giống BE (MemberProfileUpdateDTO)
const BODY = { height: [50, 250], weight: [20, 300] };

// Ảnh bìa: hội viên chọn 1 ảnh có sẵn ở /landing, BE chỉ lưu tên (danh sách phải khớp @Pattern của MemberCoverImageDTO)
const COVERS = ['fitness', 'hero', 'gym', 'gym-floor', 'boxing', 'yoga', 'swim', 'tennis', 'football', 'basketball'];
const DEFAULT_COVER = 'fitness';
const coverUrl = key => `/landing/${COVERS.includes(key) ? key : DEFAULT_COVER}.jpg`;

// Thang BMI 15 -> 32, chia theo đúng các ngưỡng của bmiInfo(); short = nhãn ngắn dưới thang (đoạn 23–25 rất hẹp)
const BMI_MIN = 15;
const BMI_MAX = 32;
const BMI_BANDS = [
  { to: 18.5, label: 'Thiếu cân', short: 'Thiếu cân', range: 'dưới 18.5', color: 'bg-sky-300' },
  { to: 23, label: 'Cân đối', short: 'Cân đối', range: '18.5 – 22.9', color: 'bg-emerald-500' },
  { to: 25, label: 'Thừa cân nhẹ', short: 'Hơi thừa', range: '23 – 24.9', color: 'bg-amber-400' },
  { to: BMI_MAX, label: 'Thừa cân', short: 'Thừa cân', range: 'từ 25', color: 'bg-rose-500' }
];
const bmiPct = v => Math.max(0, Math.min(100, ((v - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100));

// mục tiêu = đáp án câu TRAINING_GOAL của quiz; mục tiêu cũ nhập tay không khớp thì vẫn giữ trong danh sách
const goalOptions = goal => [
  ...GOALS.map(g => ({ value: g.label, hint: g.hint })),
  ...(goal && !GOALS.some(g => g.label === goal) ? [{ value: goal, hint: 'Mục tiêu đã lưu trước đây' }] : [])
];

// Chiều cao / cân nặng: BE lưu trong hồ sơ (quiz hoặc tự sửa ở đây); BE cũ chưa trả thì lấy bản sao quiz trên máy này
function bodyOf(m) {
  const quiz = quizStore.answers(m.email) || {};
  const num = v => (v === null || v === undefined || v === '' ? null : Number(v));
  return { height: num(m.heightCm ?? quiz.height), weight: num(m.weightKg ?? quiz.weight) };
}

const initials = m => `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();

function hero(m, sub, canEdit) {
  const left = sub?.endDate ? daysUntil(sub.endDate) : null;
  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white mb-6 min-h-[230px]" data-testid="profile-hero">
      <img src="${coverUrl(m.coverImage)}" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_35%]" data-testid="profile-cover" />
      <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/20"></span>
      ${canEdit ? html`
        <button type="button" class="absolute top-4 right-4 z-10 btn btn-sm bg-black/40 text-white border border-white/30 hover:bg-black/60" data-action="cover" data-testid="change-cover">
          ${icon('image', 'w-4 h-4')} Đổi ảnh bìa</button>` : ''}
      <div class="relative p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6 min-h-[230px]">
        <div class="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-[2rem] bg-[#D7F25B] text-[#0E2A20] border-4 border-white/15 flex items-center justify-center font-display text-5xl font-extrabold">${initials(m)}</div>
        <div class="min-w-0">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${sub ? 'bg-[#D7F25B] text-[#0E2A20]' : 'bg-white/15 text-white'}">
            ${sub ? html`<span class="w-2 h-2 rounded-full bg-[#0E2A20]"></span> Hội viên · ${sub.packageName}${left != null ? ` · còn ${left} ngày` : ''}` : 'Chưa có gói đang dùng'}
          </span>
          <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-[.95] uppercase mt-3 break-words">${m.firstName} ${m.lastName}</h1>
          <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/75 mt-2">
            <span>${m.email}</span><span>${phoneText(m.phone)}</span><span>${genderLabel(m.gender)}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function bodyCard(m, body) {
  const bmi = bmiInfo(body.height, body.weight);
  const band = bmi && BMI_BANDS.find(b => bmi.value < b.to) || BMI_BANDS[BMI_BANDS.length - 1];
  const done = session.get()?.quizCompleted ?? Boolean(quizStore.answers(m.email));
  const stat = (label, value, unit, dark) => html`
    <div class="rounded-2xl p-3.5 ${dark ? 'bg-brand-dark text-white' : 'bg-brand-sand/70'}">
      <div class="text-[11px] font-extrabold tracking-wider uppercase ${dark ? 'text-white/60' : 'text-slate-500'}">${label}</div>
      <div class="font-display text-4xl font-extrabold leading-none mt-1 ${dark ? 'text-brand-lime' : 'text-brand-dark'}">${value ?? '—'}${value != null && unit ? html`<span class="text-sm font-sans font-semibold text-slate-500 ml-1">${unit}</span>` : ''}</div>
    </div>`;
  return html`
    <div class="card p-6" data-testid="profile-body">
      <div class="flex items-center justify-between gap-2">
        <h2 class="font-display text-2xl font-extrabold text-brand-dark uppercase">Chỉ số cơ thể</h2>
        <a href="#/member/onboarding${done ? '?redo=1' : ''}" class="text-xs font-bold text-brand-deep hover:underline">${done ? 'Làm lại khảo sát' : 'Làm khảo sát'} →</a>
      </div>
      <div class="grid grid-cols-3 gap-2.5 mt-4">
        ${stat('Chiều cao', body.height, 'cm')}
        ${stat('Cân nặng', body.weight, 'kg')}
        ${stat('BMI', bmi ? bmi.value.toFixed(1) : null, '', true)}
      </div>
      ${bmi ? html`
        <div class="mt-5" data-testid="bmi-scale">
          <div class="relative">
            <div class="flex h-2.5 rounded-full overflow-hidden">
              ${BMI_BANDS.map((b, i) => html`<span class="${b.color}" style="width:${bmiPct(b.to) - bmiPct(i ? BMI_BANDS[i - 1].to : BMI_MIN)}%"></span>`)}
            </div>
            <span class="absolute -top-1.5 w-1.5 h-[22px] rounded-full bg-brand-dark ring-[3px] ring-white" style="left:calc(${bmiPct(bmi.value)}% - 3px)" aria-hidden="true"></span>
          </div>
          <div class="flex text-[10px] font-bold text-slate-500 mt-2">
            ${BMI_BANDS.map((b, i) => html`<span class="whitespace-nowrap ${b === band ? 'text-brand-deep' : ''}" style="width:${bmiPct(b.to) - bmiPct(i ? BMI_BANDS[i - 1].to : BMI_MIN)}%">${b.short}</span>`)}
          </div>
        </div>
        <div class="mt-4 rounded-xl bg-brand-sand/70 px-4 py-3 text-sm font-bold text-brand-dark" data-testid="bmi-note">
          BMI ${bmi.value.toFixed(1)} – ${band.label} (${band.range})
        </div>` : html`<p class="text-sm text-slate-500 mt-4">Nhập chiều cao và cân nặng ở form bên cạnh để xem chỉ số BMI.</p>`}
    </div>`;
}

const goalCard = goal => html`
  <div class="card p-5 flex items-center gap-4" data-testid="profile-goal">
    <span class="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0">${icon('target', 'w-6 h-6')}</span>
    <div class="min-w-0">
      <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Mục tiêu hiện tại</div>
      <div class="font-display text-2xl font-extrabold text-brand-dark uppercase leading-tight">${goal || 'Chưa chọn'}</div>
    </div>
  </div>`;

// ô nhập có đơn vị nằm bên phải
const unitInput = (name, value, unit, [min, max], ro) => html`
  <div class="relative">
    ${input(name, { type: 'number', value: value ?? '', attrs: `inputmode="decimal" step="0.1" min="${min}" max="${max}" style="padding-right:3rem" ${ro}` })}
    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">${unit}</span>
  </div>`;

function goalPicker(goal, canEdit) {
  return html`
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5" role="radiogroup" data-field-wrap data-testid="goal-options">
      ${goalOptions(goal).map(g => html`
        <label class="${canEdit ? 'cursor-pointer' : 'cursor-default'}">
          <input type="radio" name="trainingGoal" value="${g.value}" class="peer sr-only" ${goal === g.value ? 'checked' : ''} ${canEdit ? '' : 'disabled'} />
          <span class="block h-full rounded-2xl border border-brand-line bg-white px-4 py-3 transition-colors peer-checked:bg-brand-dark peer-checked:border-brand-dark peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
            <span class="block text-sm font-extrabold">${g.value}</span>
            <span class="block text-[11px] opacity-70 mt-0.5">${g.hint}</span>
          </span>
        </label>`)}
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
    ${hero(m, s.sub, canEdit)}
    <div class="grid lg:grid-cols-[1fr_1.45fr] gap-6 items-start">
      <div class="space-y-5">
        ${bodyCard(m, body)}
        ${goalCard(goal)}
      </div>
      <form class="card p-6 sm:p-7 space-y-5" data-action="save" data-testid="profile-form" novalidate>
        ${canEdit ? '' : notice('Bạn chỉ được xem hồ sơ, chưa được cấp quyền tự cập nhật. Liên hệ lễ tân nếu cần sửa thông tin.')}
        <div>
          <h2 class="font-display text-2xl font-extrabold text-brand-dark uppercase">Thông tin cá nhân</h2>
          <p class="text-sm text-slate-500">HLV dùng các thông tin này để hiểu rõ hơn về bạn</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Họ', input('firstName', { value: m.firstName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${field('Tên', input('lastName', { value: m.lastName, required: true, attrs: `maxlength="50" ${ro}` }))}
          ${canEdit
            ? field('Giới tính', select('gender', GENDER_OPTIONS, (m.gender || '').toUpperCase(), { required: true, placeholder: 'Chọn' }))
            : field('Giới tính', input('genderText', { value: genderLabel(m.gender), attrs: 'disabled' }))}
          ${field('Số điện thoại', input('phone', { type: 'tel', value: isPlaceholderPhone(m.phone) ? '' : m.phone, required: true, placeholder: '0912345678', attrs: `inputmode="tel" maxlength="12" ${ro}` }))}
        </div>
        ${field('Email', input('email', { value: m.email, attrs: 'disabled' }), 'Email dùng để đăng nhập, không thể thay đổi')}
        <div class="h-px bg-brand-line"></div>
        <h2 class="font-display text-2xl font-extrabold text-brand-dark uppercase">Chỉ số & mục tiêu</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          ${field('Chiều cao', unitInput('heightCm', body.height, 'cm', BODY.height, ro))}
          ${field('Cân nặng', unitInput('weightKg', body.weight, 'kg', BODY.weight, ro))}
        </div>
        ${field('Mục tiêu tập luyện', goalPicker(goal, canEdit), 'Cùng các lựa chọn với bài khảo sát — dùng để gợi ý gói tập và lớp học')}
        ${canEdit ? html`<div class="flex justify-end"><button type="submit" class="btn-primary" data-testid="profile-save">${icon('save', 'w-4 h-4')} Lưu thay đổi</button></div>` : ''}
      </form>
    </div>`;
}

function openCoverPicker(ctx) {
  const current = ctx.state.me.coverImage || DEFAULT_COVER;
  const modal = openModal({
    title: 'Chọn ảnh bìa',
    size: 'max-w-3xl',
    body: html`
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="cover-options">
        ${COVERS.map(key => html`
          <button type="button" data-action="pick" data-cover="${key}" aria-pressed="${key === current}"
            class="relative aspect-[16/9] rounded-2xl overflow-hidden ring-offset-2 ${key === current ? 'ring-4 ring-brand' : 'hover:ring-2 hover:ring-brand/50'}">
            <img src="${coverUrl(key)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            ${key === current ? html`<span class="absolute top-2 right-2 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center">${icon('check', 'w-4 h-4')}</span>` : ''}
          </button>`)}
      </div>`,
    actions: {
      pick: async t => {
        if (t.dataset.cover === current) return modal.close();
        const me = await withBusy(t, () => memberApi.updateCover(t.dataset.cover));
        if (!me) return;
        modal.close();
        toast('Đã đổi ảnh bìa');
        ctx.set({ me });
      }
    }
  });
}

export default function MemberProfile(el) {
  return mountPage(el, {
    load: async () => {
      if (!session.can('VIEW_OWN_PROFILE')) return { me: null };
      // gói đang dùng chỉ để hiện nhãn trên ảnh bìa, lỗi thì bỏ qua
      const res = await settle({ me: [memberApi.me, null], sub: [memberApi.currentSubscription, null] });
      if (res.meError) throw res.meError;
      return res;
    },
    view,
    actions: {
      cover: (t, e, ctx) => openCoverPicker(ctx),
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
