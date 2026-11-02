import { html, icon } from '../../core/dom.js';
import { emptyState, tabs } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi } from '../../api/endpoints.js';
import { money, date, daysUntil, toDate } from '../../core/format.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { latestActive, bestValueId, vnpayMark, packageKind, subjectNameOf } from '../../components/billing.js';
import { session } from '../../core/session.js';
import { quizStore, recommendPackage } from '../../core/quiz.js';

function membershipHero(current, latest) {
  if (!latest) {
    return html`
      <div class="rounded-3xl p-6 sm:p-8 bg-brand-dark text-white relative overflow-hidden" data-testid="membership-status">
        <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-brand/30"></div>
        <div class="relative">
          <div class="text-xs font-bold uppercase tracking-widest text-brand-lime">Hội viên</div>
          <h1 class="font-display text-4xl sm:text-5xl font-extrabold leading-none mt-2">Bắt đầu hành trình tập luyện</h1>
          <p class="text-white/70 mt-2 max-w-xl text-sm">Chọn một gói phù hợp bên dưới. Gói được kích hoạt ngay sau khi thanh toán và bạn có thể đặt lớp liền.</p>
        </div>
      </div>`;
  }
  const start = toDate((current || latest).startDate);
  const end = toDate(latest.endDate);
  const pct = Math.max(2, Math.min(100, Math.round(((Date.now() - start) / (end - start)) * 100)));
  const left = daysUntil(latest.endDate);
  return html`
    <div class="rounded-3xl p-6 sm:p-8 bg-brand-dark text-white relative overflow-hidden" data-testid="membership-status">
      <div class="absolute -right-12 -bottom-16 w-56 h-56 rounded-full bg-brand/30"></div>
      <div class="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold">
            <span class="w-2 h-2 rounded-full bg-brand-dark"></span> Đang hoạt động
          </div>
          <h1 class="font-display text-4xl sm:text-5xl font-extrabold leading-none text-brand-lime mt-3">${(current || latest).packageName}</h1>
          <p class="text-white/70 text-sm mt-2">Bạn được tập đến <b class="text-white">${date(latest.endDate)}</b> · còn ${left} ngày</p>
        </div>
        <div class="md:w-80">
          <div class="flex justify-between text-xs text-white/60 mb-1.5"><span>${date(start)}</span><span>${date(end)}</span></div>
          <div class="h-2 rounded-full bg-white/20 overflow-hidden"><div class="h-full rounded-full bg-brand-lime" style="width:${pct}%"></div></div>
          <div class="text-xs text-white/60 mt-2">Mua thêm gói sẽ được cộng nối tiếp sau ${date(latest.endDate)}, không mất ngày còn lại.</div>
        </div>
      </div>
    </div>`;
}

const isClass = p => p.packageType === 'CLASS';

function perksOf(p) {
  return isClass(p)
    ? [
      `Học 1 lớp môn ${subjectNameOf(p)}, khoá ${p.durationDays} ngày`,
      'Chọn lớp cùng môn, cùng thời hạn sau khi mua',
      'Bắt đầu tính ngày khi lớp bắt đầu',
      'Nhận giáo án & nhận xét từ huấn luyện viên',
      'Cần có Membership để mua gói lớp'
    ]
    : [
      `${p.durationDays} ngày vào trung tâm, dùng cơ sở vật chất`,
      'Kích hoạt ở lần check-in đầu tiên',
      'Bắt buộc có để mua và học các gói lớp',
      'Mua thêm được cộng nối tiếp, không mất ngày còn lại'
    ];
}

function planCard(p, { best, isRenewal, suggested }) {
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : null;
  const perks = perksOf(p);
  // cùng kiểu bảng giá trang giới thiệu: gói tiết kiệm nhất nền xanh rừng + điểm nhấn vàng chanh
  return html`
    <div class="relative rounded-3xl ${best ? 'bg-brand-dark text-white shadow-2xl shadow-brand-dark/20' : 'bg-white border border-brand-line shadow-sm'} p-6 sm:p-7 flex flex-col hover-lift"
      data-testid="package-card" data-package-id="${p.packageId}">
      <div class="absolute -top-3 left-6 flex gap-2">
        ${suggested ? html`<span class="px-3 py-1 rounded-full bg-amber-400 text-brand-dark text-[11px] font-extrabold uppercase tracking-wide shadow flex items-center gap-1" data-testid="suggested-badge">${icon('sparkles', 'w-3 h-3')} Phù hợp với bạn</span>` : ''}
        ${best ? html`<span class="px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase tracking-wide shadow">Tiết kiệm nhất</span>` : ''}
      </div>
      <div class="flex items-center justify-between">
        <div class="text-sm font-bold ${best ? 'text-white' : 'text-slate-900'}">${p.packageName}</div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${best ? 'bg-white/15' : 'bg-brand-sand text-slate-700'}" data-testid="package-kind">${packageKind(p)}</span>
      </div>
      <div class="mt-5 flex items-end gap-1">
        <span class="font-display text-5xl font-extrabold tracking-tight ${best ? 'text-brand-lime' : 'text-brand-dark'}">${money(p.price).replace(' ₫', '')}</span>
        <span class="text-lg font-bold mb-1 ${best ? 'text-white/60' : 'text-slate-500'}">₫</span>
      </div>
      ${perDay ? html`<div class="text-xs mt-1 ${best ? 'text-white/60' : 'text-slate-500'}">chỉ ${money(perDay)} / ngày</div>` : ''}
      ${p.description ? html`<p class="text-sm mt-4 ${best ? 'text-white/75' : 'text-slate-600'}">${p.description}</p>` : ''}
      <ul class="mt-5 space-y-2.5 text-sm flex-1 ${best ? 'text-white/85' : 'text-slate-700'}">
        ${perks.map(t => html`<li class="flex gap-2.5">${icon('check-circle-2', `w-4 h-4 shrink-0 mt-0.5 ${best ? 'text-brand-lime' : 'text-brand'}`)}<span>${t}</span></li>`)}
      </ul>
      <a href="#/member/checkout/${p.packageId}" data-testid="choose-package"
        class="mt-7 w-full !py-3 ${best ? 'btn-lime' : 'btn-primary'}">
        ${isClass(p) ? 'Mua gói lớp này' : isRenewal ? 'Gia hạn với gói này' : 'Chọn gói này'} ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </div>`;
}

const TRUST = [
  ['shield-check', 'Thanh toán an toàn', 'Xử lý qua cổng VNPay, hỗ trợ thẻ ATM, thẻ quốc tế và QR.'],
  ['zap', 'Kích hoạt tức thì', 'Gói có hiệu lực ngay khi thanh toán thành công.'],
  ['file-text', 'Hóa đơn điện tử', 'Xem và in hóa đơn bất cứ lúc nào trong mục Thanh toán.']
];

const grid = (list, opts) => html`
  <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-3">
    ${list.map(p => planCard(p, { best: p.packageId === opts.best, isRenewal: opts.isRenewal, suggested: p.packageId === opts.suggestedId }))}
  </div>`;

const sectionNote = (ic, text) => html`
  <div class="flex items-start gap-3 rounded-2xl bg-brand-sand/70 p-4 text-sm text-slate-700 mb-4">
    <span class="w-9 h-9 rounded-xl bg-brand-dark text-brand-lime flex items-center justify-center shrink-0">${icon(ic, 'w-4 h-4')}</span>
    <span class="pt-1.5">${text}</span>
  </div>`;

function membershipSection(list, hasMembership, suggestedId) {
  if (!list.length) return emptyState('Hiện chưa có gói Membership nào mở bán', 'package');
  return html`
    ${sectionNote('door-open', html`<b>Membership</b> là gói vào trung tâm, dùng cơ sở vật chất. Gói kích hoạt ở lần check-in đầu tiên và là điều kiện để mua gói lớp.`)}
    ${grid(list, { best: bestValueId(list), isRenewal: hasMembership, suggestedId })}`;
}

// gói lớp chia theo môn, mỗi môn so "tiết kiệm nhất" riêng
function classSection(list, hasMembership, suggestedId) {
  if (!list.length) return emptyState('Hiện chưa có gói lớp nào mở bán', 'calendar-x');
  const bySubject = new Map();
  list.forEach(p => {
    const key = subjectNameOf(p);
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key).push(p);
  });
  return html`
    ${hasMembership
      ? sectionNote('calendar-check', html`Mỗi <b>gói lớp</b> dùng cho 1 lớp cùng môn, cùng thời hạn. Mua xong vào mục <a href="#/member/classes" class="font-bold text-brand-deep hover:underline">Lớp học</a> để chọn lớp.`)
      : html`
        <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-4" data-testid="need-membership">
          ${icon('alert-circle', 'w-5 h-5 shrink-0')}
          <span class="flex-1">Bạn cần có <b>Membership</b> trước khi mua gói lớp.</span>
          <button type="button" class="btn-primary btn-sm" data-action="tab" data-tab="MEMBERSHIP">Xem gói Membership</button>
        </div>`}
    <div class="space-y-10">
      ${[...bySubject.entries()].map(([name, items]) => html`
        <section data-testid="class-subject-group">
          <h3 class="font-display text-2xl font-extrabold text-brand-dark mb-1 flex items-center gap-2">${icon('dumbbell', 'w-5 h-5 text-brand')} ${name}
            <span class="text-sm font-sans font-semibold text-slate-400">${items.length} gói</span></h3>
          ${grid(items, { best: bestValueId(items), isRenewal: false, suggestedId })}
        </section>`)}
    </div>`;
}

function view(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays || a.price - b.price);
  const memberships = plans.filter(p => !isClass(p));
  // gói lớp chưa gắn môn thì không dùng được (không lớp nào khớp) -> không bán cho hội viên
  const classPlans = plans.filter(p => isClass(p) && subjectNameOf(p)).sort((a, b) => subjectNameOf(a).localeCompare(subjectNameOf(b), 'vi') || a.durationDays - b.durationDays);
  const latest = latestActive(s.subscriptions);
  // đã có Membership (đang dùng hoặc chờ kích hoạt) thì mới mua được gói lớp
  const hasMembership = (s.subscriptions || []).some(x => !isClass(x) && ['ACTIVE', 'WAITING_ACTIVATION'].includes(x.status));
  const answers = quizStore.answers(session.get()?.email);
  const suggestedId = recommendPackage(answers, plans)?.best.packageId;
  const tab = s.tab || (hasMembership && classPlans.length ? 'CLASS' : 'MEMBERSHIP');
  return html`
    ${expiryBanner(latest)}
    ${membershipHero(s.current, latest)}
    <a href="#/member/onboarding${answers ? '?redo=1' : ''}" class="mt-5 flex items-center gap-3 rounded-2xl border border-brand-line bg-white p-4 hover:border-brand/60" data-testid="quiz-link">
      <span class="w-10 h-10 rounded-xl bg-brand-sand text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-5 h-5')}</span>
      <span class="flex-1 text-sm">${answers
        ? html`<b>Gói có nhãn "Phù hợp với bạn"</b> được gợi ý từ quiz của bạn. <span class="text-brand-deep font-semibold">Làm lại quiz</span>`
        : html`<b>Chưa biết chọn gói nào?</b> Trả lời 4 câu hỏi nhanh để nhận gợi ý.`}</span>
      ${icon('chevron-right', 'w-5 h-5 text-slate-400')}
    </a>
    <div class="flex items-end justify-between mt-10 mb-5">
      <div>
        <h2 class="font-display text-3xl font-extrabold text-brand-dark">${latest ? 'Mua thêm / gia hạn gói' : 'Chọn gói tập'}</h2>
        <p class="text-sm text-slate-500 mt-1">Giá đã bao gồm VAT, không phát sinh phí giao dịch.</p>
      </div>
      <a href="#/member/payments" class="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-brand-deep hover:underline">${icon('history', 'w-4 h-4')} Lịch sử thanh toán</a>
    </div>
    ${plans.length ? html`
      <div data-testid="package-tabs">${tabs([
        { id: 'MEMBERSHIP', label: 'Membership', count: memberships.length },
        { id: 'CLASS', label: 'Gói lớp', count: classPlans.length }
      ], tab)}</div>
      ${tab === 'CLASS' ? classSection(classPlans, hasMembership, suggestedId) : membershipSection(memberships, hasMembership, suggestedId)}` : emptyState('Hiện chưa có gói tập nào đang mở bán', 'package')}
    <div class="grid sm:grid-cols-3 gap-4 mt-10">
      ${TRUST.map(([ic, title, text]) => html`
        <div class="flex gap-3 p-4 rounded-2xl bg-brand-sand/70">
          <div class="w-10 h-10 rounded-xl bg-brand-dark text-brand-lime flex items-center justify-center shrink-0">${icon(ic, 'w-5 h-5')}</div>
          <div><div class="text-sm font-bold">${title}</div><div class="text-xs text-slate-500 mt-0.5">${text}</div></div>
        </div>`)}
    </div>
    <div class="flex items-center justify-center gap-2 text-xs text-slate-400 mt-8">Đối tác thanh toán ${vnpayMark('text-sm')}</div>`;
}

export default function MemberPackages(el) {
  return mountPage(el, {
    load: async () => {
      const res = await settle({
        packages: [packageApi.list, null],
        current: [memberApi.currentSubscription, null],
        subscriptions: [memberApi.subscriptions, []]
      });
      if (res.packagesError) throw res.packagesError;
      return res;
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab })
    }
  });
}
