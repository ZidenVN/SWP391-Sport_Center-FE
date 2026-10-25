import { html, icon } from '../../core/dom.js';
import { toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, subjectApi, classApi, memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { money, isoDate, timeRange } from '../../core/format.js';
import { classCard } from '../../components/classCard.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import {
  quizStore, GOALS, SLOTS, FREQUENCIES, COMMITMENTS, find, bmiInfo, bmiAdvice, validateAnswers,
  recommendPackage, matchSubjects, recommendClasses, buildCombos, subjectCategory, COMBO_PRICING
} from '../../core/quiz.js';

// Quiz làm quen sau khi đăng ký (4 bước) -> gợi ý gói tập + lớp hợp khung giờ. Chỉ chạy ở FE (xem core/quiz.js).
const STEPS = ['Chỉ số cơ thể', 'Mục tiêu', 'Khung giờ', 'Thời gian gắn bó'];
const TONE = { sky: 'bg-sky-100 text-sky-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700' };

const err = (s, key) => (s.errors?.[key] ? html`<p class="text-xs text-rose-600 mt-1.5" data-error="${key}">${s.errors[key]}</p>` : '');

function optionCard({ action, key, value, active, title, hint, iconName, testid }) {
  return html`
    <button type="button" data-action="${action}" data-key="${key}" data-value="${value}" data-testid="${testid}" aria-pressed="${active}"
      class="text-left rounded-2xl border-2 p-4 flex items-start gap-3 transition-colors ${active ? 'border-brand-dark bg-brand-dark text-white' : 'border-brand-line bg-white hover:border-brand/60'}">
      ${iconName ? html`<span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-brand-lime text-brand-dark' : 'bg-brand-sand text-brand-dark'}">${icon(iconName, 'w-5 h-5')}</span>` : ''}
      <span class="min-w-0">
        <span class="block font-bold text-sm">${title}</span>
        ${hint ? html`<span class="block text-xs mt-0.5 ${active ? 'text-white/70' : 'text-slate-500'}">${hint}</span>` : ''}
      </span>
      ${active ? html`<span class="ml-auto text-brand-lime">${icon('check-circle-2', 'w-5 h-5')}</span>` : ''}
    </button>`;
}

function stepBody(s) {
  const a = s.answers;
  if (s.step === 1) {
    const bmi = bmiInfo(a.height, a.weight);
    return html`
      <h2 class="font-display text-3xl font-extrabold text-brand-dark">Chiều cao và cân nặng của bạn?</h2>
      <p class="text-sm text-slate-500 mt-1">Dùng để tính BMI và gợi ý cường độ tập phù hợp. Chỉ bạn thấy thông tin này.</p>
      <div class="grid sm:grid-cols-2 gap-4 mt-6">
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">Chiều cao</span>
          <div class="relative mt-1.5">
            <input class="input pr-12 text-lg font-bold" type="number" inputmode="numeric" min="120" max="230" name="height" data-action="field" data-live placeholder="165" value="${a.height || ''}" data-testid="quiz-height" />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">cm</span>
          </div>
          ${err(s, 'height')}
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-700">Cân nặng</span>
          <div class="relative mt-1.5">
            <input class="input pr-12 text-lg font-bold" type="number" inputmode="decimal" min="30" max="250" step="0.1" name="weight" data-action="field" data-live placeholder="60" value="${a.weight || ''}" data-testid="quiz-weight" />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">kg</span>
          </div>
          ${err(s, 'weight')}
        </label>
      </div>
      <div class="mt-5 rounded-2xl bg-brand-sand/70 p-4 flex items-center gap-4 min-h-[76px]" data-testid="quiz-bmi">
        ${bmi && !validateAnswers(a, 1).height && !validateAnswers(a, 1).weight ? html`
          <div class="font-display text-4xl font-extrabold text-brand-dark">${bmi.value}</div>
          <div><div class="text-xs text-slate-500">Chỉ số BMI</div><span class="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${TONE[bmi.tone]}">${bmi.label}</span></div>` : html`
          <span class="text-sm text-slate-500 flex items-center gap-2">${icon('calculator', 'w-4 h-4')} Nhập đủ chiều cao và cân nặng để xem BMI</span>`}
      </div>`;
  }
  if (s.step === 2) {
    return html`
      <h2 class="font-display text-3xl font-extrabold text-brand-dark">Mục tiêu tập luyện chính?</h2>
      <p class="text-sm text-slate-500 mt-1">Chọn một mục tiêu quan trọng nhất với bạn lúc này.</p>
      <div class="grid sm:grid-cols-2 gap-3 mt-6">
        ${GOALS.map(g => optionCard({ action: 'pick', key: 'goal', value: g.id, active: a.goal === g.id, title: g.label, hint: g.hint, iconName: g.icon, testid: `quiz-goal-${g.id}` }))}
      </div>
      ${err(s, 'goal')}`;
  }
  if (s.step === 3) {
    return html`
      <h2 class="font-display text-3xl font-extrabold text-brand-dark">Bạn thường rảnh khung giờ nào?</h2>
      <p class="text-sm text-slate-500 mt-1">Có thể chọn nhiều khung giờ. Hệ thống sẽ ưu tiên lớp học trong các khung này.</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        ${SLOTS.map(x => optionCard({ action: 'toggle-slot', key: 'slots', value: x.id, active: (a.slots || []).includes(x.id), title: x.label, hint: x.range, iconName: x.icon, testid: `quiz-slot-${x.id}` }))}
      </div>
      ${err(s, 'slots')}
      <div class="mt-7 text-sm font-semibold text-slate-700">Bạn muốn tập bao nhiêu buổi mỗi tuần?</div>
      <div class="flex flex-wrap gap-2 mt-2">
        ${FREQUENCIES.map(f => html`
          <button type="button" data-action="pick" data-key="frequency" data-value="${f.id}" data-testid="quiz-freq-${f.id}" aria-pressed="${a.frequency === f.id}"
            class="px-4 py-2 rounded-full border-2 text-sm font-bold ${a.frequency === f.id ? 'border-brand-dark bg-brand-dark text-brand-lime' : 'border-brand-line bg-white text-slate-700 hover:border-brand/60'}">${f.label}</button>`)}
      </div>
      ${err(s, 'frequency')}`;
  }
  return html`
    <h2 class="font-display text-3xl font-extrabold text-brand-dark">Bạn muốn gắn bó bao lâu?</h2>
    <p class="text-sm text-slate-500 mt-1">Giúp chọn thời hạn gói có lợi nhất cho bạn.</p>
    <div class="grid gap-3 mt-6">
      ${COMMITMENTS.map(c => optionCard({ action: 'pick', key: 'commitment', value: c.id, active: a.commitment === c.id, title: c.label, hint: c.hint, iconName: c.icon, testid: `quiz-commit-${c.id}` }))}
    </div>
    ${err(s, 'commitment')}`;
}

function quizView(s) {
  const pct = Math.round(((s.step - 1) / STEPS.length) * 100);
  return html`
    <div class="max-w-3xl mx-auto" data-testid="quiz">
      <div class="flex items-center justify-between gap-4 mb-5">
        <div>
          <div class="text-xs font-bold uppercase tracking-widest text-brand">Bước ${s.step}/${STEPS.length} · ${STEPS[s.step - 1]}</div>
          <div class="text-sm text-slate-500 mt-0.5">Trả lời nhanh 4 câu để nhận gói tập hợp với bạn</div>
        </div>
        <button type="button" class="text-sm font-semibold text-slate-500 hover:text-slate-800" data-action="skip" data-testid="quiz-skip">Bỏ qua</button>
      </div>
      <div class="h-2 rounded-full bg-brand-sand overflow-hidden mb-6"><div class="h-full rounded-full bg-brand-dark transition-all" style="width:${Math.max(6, pct)}%"></div></div>
      <form class="card p-6 sm:p-8" data-action="next" novalidate>
        ${stepBody(s)}
        <div class="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-brand-line/60">
          ${s.step > 1 ? html`<button type="button" class="btn-secondary" data-action="back" data-testid="quiz-back">${icon('arrow-left', 'w-4 h-4')} Quay lại</button>` : html`<span></span>`}
          <button type="submit" class="btn-primary" data-testid="quiz-next">${s.step < STEPS.length ? html`Tiếp tục ${icon('arrow-right', 'w-4 h-4')}` : html`${icon('sparkles', 'w-4 h-4')} Xem gợi ý`}</button>
        </div>
      </form>
    </div>`;
}

const kPrice = v => `${Math.round(v / 1000)}k`;

// Thẻ combo đang chọn: giá combo vs mua lẻ, lịch xen kẽ trong tuần, lý do
function comboDetail(c, chosen) {
  return html`
    <div class="rounded-3xl bg-brand-dark text-white p-6 sm:p-7 relative overflow-hidden" data-testid="combo-detail" data-combo-id="${c.id}">
      <div class="absolute -right-10 -bottom-12 w-44 h-44 rounded-full bg-brand/30"></div>
      <div class="relative">
        <div class="flex flex-wrap items-center gap-2">
          ${c.best ? html`<span class="px-2.5 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase flex items-center gap-1">${icon('sparkles', 'w-3.5 h-3.5')} Phù hợp nhất</span>` : ''}
          <span class="px-2.5 py-1 rounded-full bg-amber-400 text-brand-dark text-[11px] font-extrabold uppercase">Tiết kiệm ${c.savingPct}%</span>
        </div>
        <div class="font-display text-3xl sm:text-4xl font-extrabold leading-tight mt-3" data-testid="combo-name">${c.name}</div>
        <div class="flex items-end gap-3 mt-3">
          <span class="font-display text-5xl font-extrabold text-brand-lime" data-testid="combo-price">${kPrice(c.price)}</span>
          <span class="mb-1.5 text-white/60 text-sm">/ tháng</span>
          <span class="mb-1.5 text-white/50 text-sm line-through">${kPrice(c.retail)}</span>
        </div>
        <div class="text-sm text-white/75 mt-1">Mua lẻ từng môn ${money(c.retail)} — bạn tiết kiệm <b class="text-brand-lime">${money(c.saving)}</b> mỗi tháng · ${c.sessionsPerWeek} buổi/tuần</div>

        <div class="mt-6 text-xs font-bold uppercase tracking-widest text-white/50">Lịch tập xen kẽ gợi ý</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" data-testid="combo-plan">
          ${c.plan.map(d => html`
            <div class="rounded-xl bg-white/10 p-3">
              <div class="text-[11px] text-white/60">${d.day}${d.slot ? ` · ${d.slot.label}` : ''}</div>
              <div class="text-sm font-bold leading-snug">${d.subject.subjectName}</div>
              ${d.cls ? html`<div class="text-[11px] text-brand-lime mt-0.5">Có lớp ${timeRange(d.cls.startTime, d.cls.endTime)}</div>` : ''}
            </div>`)}
        </div>

        <ul class="mt-5 space-y-1.5 text-sm text-white/85">
          ${c.reasons.map(t => html`<li class="flex gap-2">${icon('check', 'w-4 h-4 shrink-0 mt-0.5 text-brand-lime')}<span>${t}</span></li>`)}
        </ul>

        <div class="flex flex-wrap items-center gap-3 mt-6">
          ${chosen
            ? html`<span class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-sm font-bold" data-testid="combo-chosen">${icon('check-circle-2', 'w-4 h-4 text-brand-lime')} Đã chọn combo này</span>`
            : html`<button type="button" class="btn-lime" data-action="choose-combo" data-testid="combo-choose">${icon('heart-handshake', 'w-4 h-4')} Chọn combo này</button>`}
          <span class="text-xs text-white/50">Combo đang mở đăng ký trước — thanh toán combo sẽ có khi hệ thống hỗ trợ.</span>
        </div>
      </div>
    </div>`;
}

function comboOption(c, i, active) {
  return html`
    <button type="button" data-action="combo" data-index="${i}" data-testid="combo-option-${i}" aria-pressed="${active}"
      class="w-full text-left rounded-2xl border-2 p-4 transition-colors ${active ? 'border-brand-dark bg-brand-sand/70' : 'border-brand-line bg-white hover:border-brand/60'}">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-bold text-sm">${c.name}</div>
          <div class="text-xs text-slate-500 mt-0.5">${c.subjects.map(x => subjectCategoryLabel(x)).join(' · ')} · ${c.sessionsPerWeek} buổi/tuần</div>
        </div>
        <div class="text-right shrink-0">
          <div class="font-extrabold text-brand-dark">${kPrice(c.price)}</div>
          <div class="text-[11px] text-slate-400 line-through">${kPrice(c.retail)}</div>
        </div>
      </div>
      <div class="mt-2 text-xs font-bold text-emerald-700">Tiết kiệm ${money(c.saving)} (${c.savingPct}%)${c.best ? ' · Phù hợp nhất' : ''}</div>
    </button>`;
}

const subjectCategoryLabel = s => COMBO_PRICING.category[subjectCategory(s)].label;

function resultView(s) {
  const a = s.answers;
  const bmi = bmiInfo(a.height, a.weight);
  const goal = find(GOALS, a.goal);
  const rec = recommendPackage(a, s.packages);
  const subjects = matchSubjects(a, s.subjects);
  const classes = recommendClasses(a, s.classes, s.subjects);
  const combos = buildCombos(a, s.subjects, s.classes);
  const combo = combos[s.comboIdx] || combos[0];
  const slotText = (a.slots || []).map(id => find(SLOTS, id)?.label).filter(Boolean).join(', ');
  return html`
    <div class="max-w-5xl mx-auto" data-testid="quiz-result">
      <div class="rounded-3xl p-6 sm:p-8 bg-brand-dark text-white relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-brand/30"></div>
        <div class="relative">
          <div class="text-xs font-bold uppercase tracking-widest text-brand-lime">Gợi ý dành riêng cho bạn</div>
          <h1 class="font-display text-4xl sm:text-5xl font-extrabold leading-none mt-2">${goal?.label}</h1>
          <div class="flex flex-wrap gap-2 mt-4 text-xs font-semibold">
            <span class="px-3 py-1 rounded-full bg-white/10">${a.height} cm · ${a.weight} kg</span>
            ${bmi ? html`<span class="px-3 py-1 rounded-full bg-brand-lime text-brand-dark">BMI ${bmi.value} · ${bmi.label}</span>` : ''}
            <span class="px-3 py-1 rounded-full bg-white/10">${slotText}</span>
            <span class="px-3 py-1 rounded-full bg-white/10">${find(FREQUENCIES, a.frequency)?.label}</span>
          </div>
          <p class="text-white/75 text-sm mt-4 max-w-2xl">${bmiAdvice(bmi, a.goal)}</p>
        </div>
      </div>

      ${combos.length ? html`
        <section class="mt-6" data-testid="quiz-combos">
          <h2 class="font-display text-2xl font-extrabold text-brand-dark">Combo bộ môn dành riêng cho bạn</h2>
          <p class="text-sm text-slate-500 mb-3">Ghép các môn bổ trợ nhau, tập xen kẽ trong tuần — rẻ hơn mua lẻ từng môn.</p>
          <div class="grid lg:grid-cols-5 gap-6">
            <div class="lg:col-span-3">${comboDetail(combo, s.chosenCombo?.id === combo.id)}</div>
            <div class="lg:col-span-2 space-y-3">
              ${combos.map((c, i) => comboOption(c, i, i === s.comboIdx))}
            </div>
          </div>
        </section>` : ''}

      <div class="grid lg:grid-cols-5 gap-6 mt-8">
        <section class="lg:col-span-3">
          <h2 class="font-display text-2xl font-extrabold text-brand-dark mb-1">Hoặc mua ngay gói đang mở bán</h2>
          <p class="text-sm text-slate-500 mb-3">Gói hiện có cho phép tập mọi bộ môn trong thời hạn gói.</p>
          ${rec ? html`
            <div class="card p-6 border-2 border-brand-dark" data-testid="quiz-best-package" data-package-id="${rec.best.packageId}">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase">${icon('sparkles', 'w-3.5 h-3.5')} Gợi ý cho bạn</span>
                  <div class="font-display text-3xl font-extrabold text-brand-dark mt-2">${rec.best.packageName}</div>
                  <div class="text-sm text-slate-500">${rec.best.durationDays} ngày${rec.best.description ? ` · ${rec.best.description}` : ''}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="font-display text-3xl font-extrabold text-brand-dark">${money(rec.best.price)}</div>
                  <div class="text-xs text-slate-500">${money(Math.round(rec.best.price / rec.best.durationDays))} / ngày</div>
                </div>
              </div>
              <ul class="mt-5 space-y-2 text-sm text-slate-700">
                ${rec.reasons.map(t => html`<li class="flex gap-2.5">${icon('check-circle-2', 'w-4 h-4 shrink-0 mt-0.5 text-brand')}<span>${t}</span></li>`)}
              </ul>
              <div class="flex flex-wrap gap-3 mt-6">
                ${s.hasPackage
                  ? html`<a href="#/member/packages" class="btn-primary">${icon('refresh-cw', 'w-4 h-4')} Gia hạn với gói này</a>`
                  : html`<a href="#/member/checkout/${rec.best.packageId}" class="btn-primary" data-testid="quiz-buy">${icon('shopping-cart', 'w-4 h-4')} Mua gói này</a>`}
                <a href="#/member/packages" class="btn-secondary">Xem tất cả gói</a>
              </div>
            </div>
            ${rec.others.length ? html`
              <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mt-5 mb-2">Lựa chọn khác</div>
              <div class="grid sm:grid-cols-2 gap-3">
                ${rec.others.slice(0, 2).map(p => html`
                  <a href="#/member/checkout/${p.packageId}" class="card p-4 hover:border-brand/60 flex items-center justify-between gap-3">
                    <span><span class="block font-bold text-sm">${p.packageName}</span><span class="text-xs text-slate-500">${p.durationDays} ngày</span></span>
                    <span class="font-bold text-brand-dark">${money(p.price)}</span>
                  </a>`)}
              </div>` : ''}` : html`<div class="card p-6 text-sm text-slate-500">Hiện chưa có gói tập nào đang mở bán.</div>`}
        </section>

        <section class="lg:col-span-2">
          <h2 class="font-display text-2xl font-extrabold text-brand-dark mb-3">Bộ môn nên thử</h2>
          <div class="card p-5 space-y-2" data-testid="quiz-subjects">
            ${subjects.length ? subjects.slice(0, 4).map(x => html`
              <a href="#/member/classes?subject=${encodeURIComponent(x.subjectName)}" class="flex items-center gap-3 rounded-xl p-3 bg-brand-sand/60 hover:bg-brand-sand">
                <span class="w-9 h-9 rounded-lg bg-brand-dark text-brand-lime flex items-center justify-center">${icon(goal?.icon || 'activity', 'w-4 h-4')}</span>
                <span class="flex-1 font-semibold text-sm">${x.subjectName}</span>
                ${icon('chevron-right', 'w-4 h-4 text-slate-400')}
              </a>`) : html`<div class="text-sm text-slate-500">Chưa có bộ môn nào.</div>`}
          </div>
        </section>
      </div>

      <section class="mt-8">
        <div class="flex items-end justify-between mb-3 gap-3">
          <div>
            <h2 class="font-display text-2xl font-extrabold text-brand-dark">Lớp hợp khung giờ của bạn</h2>
            <p class="text-sm text-slate-500">${classes.exact ? `Trong 2 tuần tới, ${slotText.toLowerCase()}` : 'Chưa có lớp đúng khung giờ bạn chọn, đây là các lớp gần nhất'}</p>
          </div>
          <a href="#/member/classes" class="text-sm font-bold text-brand-deep hover:underline whitespace-nowrap">Xem tất cả lớp</a>
        </div>
        ${classes.list.length ? html`
          <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="quiz-classes">
            ${classes.list.map(c => classCard(c, html`<a href="#/member/classes" class="btn-secondary btn-sm">${s.hasPackage ? 'Đặt lớp' : 'Mua gói để đặt'}</a>`))}
          </div>` : html`<div class="card p-6 text-sm text-slate-500">Chưa có lớp nào mở đăng ký trong 2 tuần tới.</div>`}
      </section>

      <div class="flex flex-wrap items-center justify-center gap-3 mt-10">
        <button type="button" class="btn-secondary" data-action="redo" data-testid="quiz-redo">${icon('rotate-ccw', 'w-4 h-4')} Làm lại quiz</button>
        <a href="#/member/home" class="btn-ghost">Về trang tổng quan</a>
      </div>
    </div>`;
}

const view = s => (s.done ? resultView(s) : quizView(s));

export default function MemberOnboarding(el, { query } = {}) {
  const email = session.get()?.email;
  const saved = quizStore.answers(email);
  return mountPage(el, {
    // ?redo=1 để làm lại; đã làm rồi thì mở thẳng phần kết quả
    state: { step: 1, answers: saved ? { ...saved } : { slots: [] }, errors: {}, done: Boolean(saved) && !query?.redo, comboIdx: 0, chosenCombo: quizStore.combo(email) },
    load: async () => {
      const today = new Date();
      const res = await settle({
        packages: [packageApi.list, []],
        subjects: [subjectApi.list, []],
        current: [memberApi.currentSubscription, null],
        page: [() => classApi.search({ fromDate: isoDate(today), toDate: isoDate(new Date(today.getTime() + 13 * 86400000)), status: 'OPENING', available: true, size: 100 }), null]
      });
      return { packages: res.packages, subjects: res.subjects, classes: res.page?.content || [], hasPackage: Boolean(res.current) };
    },
    view,
    actions: {
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      field: (t, e, ctx) => {
        ctx.state.answers[t.name] = t.value;
        ctx.set({ errors: { ...ctx.state.errors, [t.name]: undefined } });
      },
      pick: (t, e, ctx) => {
        ctx.state.answers[t.dataset.key] = t.dataset.value;
        ctx.set({ errors: { ...ctx.state.errors, [t.dataset.key]: undefined } });
      },
      'toggle-slot': (t, e, ctx) => {
        const slots = new Set(ctx.state.answers.slots || []);
        slots.has(t.dataset.value) ? slots.delete(t.dataset.value) : slots.add(t.dataset.value);
        ctx.state.answers.slots = SLOTS.map(x => x.id).filter(id => slots.has(id));
        ctx.set({ errors: { ...ctx.state.errors, slots: undefined } });
      },
      back: (t, e, ctx) => ctx.set({ step: Math.max(1, ctx.state.step - 1), errors: {} }),
      next: (t, e, ctx) => {
        const s = ctx.state;
        const errors = validateAnswers(s.answers, s.step);
        if (Object.keys(errors).length) { ctx.set({ errors }); return; }
        if (s.step < STEPS.length) { ctx.set({ step: s.step + 1, errors: {} }); el.scrollIntoView?.({ block: 'start' }); return; }
        const answers = { ...s.answers, height: Number(s.answers.height), weight: Number(s.answers.weight) };
        quizStore.save(email, answers);
        toast('Đã lưu câu trả lời, đây là gợi ý dành cho bạn');
        ctx.set({ answers, done: true, errors: {} });
        window.scrollTo?.({ top: 0 });
      },
      redo: (t, e, ctx) => ctx.set({ done: false, step: 1, errors: {} }),
      combo: (t, e, ctx) => ctx.set({ comboIdx: Number(t.dataset.index) }),
      'choose-combo': (t, e, ctx) => {
        const s = ctx.state;
        const combo = buildCombos(s.answers, s.subjects, s.classes)[s.comboIdx];
        if (!combo) return;
        quizStore.chooseCombo(email, combo);
        toast(`Đã chọn combo ${combo.name} · ${money(combo.price)}/tháng. Lễ tân sẽ hỗ trợ bạn khi combo mở thanh toán.`);
        ctx.set({ chosenCombo: quizStore.combo(email) });
      },
      skip: () => {
        quizStore.skip(email);
        location.hash = '#/member/home';
      }
    }
  });
}
