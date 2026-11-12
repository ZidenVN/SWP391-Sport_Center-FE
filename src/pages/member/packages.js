import { html, icon } from '../../core/dom.js';
import { emptyState, tabs } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi } from '../../api/endpoints.js';
import { money, date, daysUntil, toDate } from '../../core/format.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { latestActive, bestValueId, vnpayMark, packageKind, subjectNameOf } from '../../components/billing.js';
import { defaultClassImage } from '../../components/classCard.js';
import { hasMembership as hasMembershipOf } from '../../components/classPackages.js';
import { session } from '../../core/session.js';
import { quizStore, recommendPackage } from '../../core/quiz.js';

// Ảnh nền hero + lớp phủ xanh rừng đậm bên trái để chữ trắng luôn đọc được
const heroShell = (inner, side = '') => html`
  <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white min-h-[300px]" data-testid="membership-status">
    <img src="/landing/hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_60%]" />
    <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand-dark/10"></span>
    <div class="relative p-6 sm:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 min-h-[300px]">
      <div class="max-w-xl flex flex-col justify-between gap-6">${inner}</div>
      ${side}
    </div>
  </div>`;

function membershipHero(current, latest, waiting = []) {
  if (!latest) {
    return heroShell(html`
      <div>
        <span class="inline-flex px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold uppercase tracking-wide">${waiting.length ? 'Chờ kích hoạt' : 'Hội viên mới'}</span>
        <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-[.9] mt-4">${waiting.length
          ? html`<span class="text-brand-lime">${waiting.map(x => x.packageName).join(', ')}</span>`
          : html`SẴN SÀNG<br /><span class="text-brand-lime">XUẤT PHÁT.</span>`}</h1>
        <p class="text-white/80 mt-4 text-sm">${waiting.length
          ? 'Gói đã thanh toán, sẽ tự kích hoạt khi bạn check-in tại quầy hoặc đăng ký lớp lần đầu (chậm nhất 14 ngày sau khi thanh toán).'
          : 'Chọn một gói phù hợp bên dưới. Gói tự kích hoạt khi bạn check-in hoặc đăng ký lớp lần đầu (chậm nhất 14 ngày sau khi thanh toán).'}</p>
      </div>`);
  }
  const start = toDate((current?.startDate ? current : latest).startDate);
  const end = toDate(latest.endDate);
  const total = Math.max(1, Math.round((end - start) / 86400000));
  const left = daysUntil(latest.endDate);
  const pct = Math.max(2, Math.min(100, Math.round((left / total) * 100)));
  return heroShell(html`
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold uppercase tracking-wide">
          <span class="w-2 h-2 rounded-full bg-brand-dark"></span> Đang hoạt động</span>
        <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-[.9] mt-4">SẴN SÀNG<br /><span class="text-brand-lime">BỨT TỐC.</span></h1>
        <p class="text-white/80 mt-4 text-sm">${(current || latest).packageName} của bạn còn <b class="text-white">${left} ngày</b>. Mua thêm gói sẽ được cộng nối tiếp sau ${date(latest.endDate)}, không mất ngày còn lại.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-lime !py-3" data-action="tab" data-tab="MEMBERSHIP">Gia hạn ngay ${icon('arrow-right', 'w-4 h-4')}</button>
        <a href="#/member/payments" class="btn !py-3 border border-white/40 text-white hover:bg-white/10">Lịch sử thanh toán</a>
      </div>`,
    html`
      <div class="lg:w-64 shrink-0 rounded-2xl bg-white text-brand-dark p-5" data-testid="membership-progress">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Membership</div>
        <div class="font-display text-2xl font-extrabold leading-tight mt-0.5">${(current || latest).packageName}</div>
        <div class="h-2 rounded-full bg-brand-sand overflow-hidden mt-3"><div class="h-full rounded-full bg-brand" style="width:${pct}%"></div></div>
        <div class="flex justify-between text-xs text-slate-500 mt-1.5"><span>Còn ${left}/${total} ngày</span><b class="text-brand-dark">${date(end)}</b></div>
      </div>`);
}

const isClass = p => p.packageType === 'CLASS';

function perksOf(p) {
  return isClass(p)
    ? [
      `Học 1 lớp môn ${subjectNameOf(p)}, khoá ${p.durationDays} ngày`,
      'Chọn lớp cùng môn, cùng thời hạn sau khi mua',
      'Kích hoạt khi đăng ký lớp, hết hạn theo ngày kết thúc của lớp',
      'Nhận giáo án & nhận xét từ huấn luyện viên',
      'Cần có Membership để mua gói lớp'
    ]
    : [
      `${p.durationDays} ngày vào trung tâm, dùng cơ sở vật chất`,
      'Kích hoạt khi check-in hoặc đăng ký lớp lần đầu, chậm nhất 14 ngày sau khi thanh toán',
      'Bắt buộc có để mua các gói lớp',
      'Mua thêm được cộng nối tiếp sau ngày hết hạn, không mất ngày còn lại'
    ];
}

// ảnh membership xoay vòng theo thứ tự gói; gói lớp dùng ảnh bộ môn (chưa có thì ảnh mặc định theo tên môn)
const MEMBERSHIP_PHOTOS = ['gym', 'gym-floor', 'swim', 'fitness', 'tennis'].map(x => `/landing/${x}.jpg`);
const photoOf = (p, i) => isClass(p) ? p.subject?.imageUrl || defaultClassImage(subjectNameOf(p)) : MEMBERSHIP_PHOTOS[i % MEMBERSHIP_PHOTOS.length];

function planCard(p, { best, isRenewal, suggested, index }) {
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : null;
  const perks = perksOf(p);
  // thẻ phủ ảnh; gói tiết kiệm nhất viền vàng chanh + giá vàng chanh
  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white min-h-[540px] flex flex-col justify-end group hover-lift ${best ? 'ring-4 ring-inset ring-brand-lime' : ''}"
      data-testid="package-card" data-package-id="${p.packageId}">
      <img src="${photoOf(p, index)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span class="absolute inset-0 bg-gradient-to-b from-transparent via-brand-dark/75 to-brand-dark from-10% via-45% to-70%"></span>
      <div class="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
        ${best ? html`<span class="px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase tracking-wide">Tiết kiệm nhất</span>` : ''}
        ${suggested ? html`<span class="px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1" data-testid="suggested-badge">${icon('sparkles', 'w-3 h-3')} Phù hợp với bạn</span>` : ''}
      </div>
      <div class="relative p-6">
        <div class="text-[11px] font-extrabold uppercase tracking-widest text-brand-lime" data-testid="package-kind">${packageKind(p)}</div>
        <div class="font-display text-3xl font-extrabold leading-none mt-1">${p.packageName}</div>
        <div class="mt-4 flex items-end gap-1">
          <span class="font-display text-5xl font-extrabold leading-none ${best ? 'text-brand-lime' : ''}">${money(p.price).replace(' ₫', '')}</span>
          <span class="text-lg font-bold text-white/60">₫</span>
        </div>
        ${perDay ? html`<div class="text-xs mt-1 text-white/70">≈ ${money(perDay)} / ngày · ${p.durationDays} ngày</div>` : ''}
        ${p.description ? html`<p class="text-sm mt-3 text-white/80 line-clamp-2" title="${p.description}">${p.description}</p>` : ''}
        <ul class="mt-3 space-y-1.5 text-xs text-white/80">
          ${perks.map(t => html`<li class="flex gap-2">${icon('check-circle-2', 'w-3.5 h-3.5 shrink-0 mt-px text-brand-lime')}<span>${t}</span></li>`)}
        </ul>
        <a href="#/member/checkout/${p.packageId}" data-testid="choose-package"
          class="mt-5 w-full !py-3 ${best ? 'btn-lime' : 'btn border border-white/45 text-white hover:bg-white/10'}">
          ${isClass(p) ? 'Mua gói lớp này' : isRenewal ? 'Gia hạn với gói này' : 'Chọn gói này'} ${icon('arrow-right', 'w-4 h-4')}
        </a>
      </div>
    </div>`;
}

const TRUST = [
  ['shield-check', 'Thanh toán an toàn', 'Xử lý qua cổng VNPay, hỗ trợ thẻ ATM, thẻ quốc tế và QR.'],
  ['zap', 'Không mất ngày khi chưa dùng', 'Gói chỉ bắt đầu tính ngày khi bạn check-in hoặc đăng ký lớp (Membership tự kích hoạt sau 14 ngày).'],
  ['file-text', 'Hóa đơn điện tử', 'Xem và in hóa đơn bất cứ lúc nào trong mục Thanh toán.']
];

const grid = (list, opts) => html`
  <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-3">
    ${list.map((p, index) => planCard(p, { best: [].concat(opts.best).includes(p.packageId), isRenewal: opts.isRenewal, suggested: p.packageId === opts.suggestedId, index }))}
  </div>`;

const sectionNote = (ic, text) => html`
  <div class="flex items-start gap-3 rounded-2xl bg-brand-sand/70 p-4 text-sm text-slate-700 mb-4">
    <span class="w-9 h-9 rounded-xl bg-brand-dark text-brand-lime flex items-center justify-center shrink-0">${icon(ic, 'w-4 h-4')}</span>
    <span class="pt-1.5">${text}</span>
  </div>`;

function membershipSection(list, hasMembership, suggestedId) {
  if (!list.length) return emptyState('Hiện chưa có gói Membership nào mở bán', 'package');
  return html`
    ${sectionNote('door-open', html`<b>Membership</b> là gói vào trung tâm, dùng cơ sở vật chất. Gói kích hoạt khi check-in hoặc đăng ký lớp lần đầu, chậm nhất 14 ngày sau khi thanh toán, và là điều kiện để mua gói lớp.`)}
    ${grid(list, { best: bestValueId(list), isRenewal: hasMembership, suggestedId })}`;
}

// gói lớp chung 1 lưới (thẻ đã ghi môn), mỗi môn so "tiết kiệm nhất" riêng
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
    ${grid(list, { best: [...bySubject.values()].map(bestValueId), isRenewal: false, suggestedId })}`;
}

function view(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays || a.price - b.price);
  const memberships = plans.filter(p => !isClass(p));
  // gói lớp chưa gắn môn thì không dùng được (không lớp nào khớp) -> không bán cho hội viên
  const classPlans = plans.filter(p => isClass(p) && subjectNameOf(p)).sort((a, b) => subjectNameOf(a).localeCompare(subjectNameOf(b), 'vi') || a.durationDays - b.durationDays);
  const latest = latestActive(s.subscriptions);
  // đã có Membership (đang dùng hoặc chờ kích hoạt) thì mới mua được gói lớp
  const hasMembership = hasMembershipOf(s.subscriptions);
  const answers = quizStore.answers(session.get()?.email);
  const suggestedId = recommendPackage(answers, plans)?.best.packageId;
  const tab = s.tab || (hasMembership && classPlans.length ? 'CLASS' : 'MEMBERSHIP');
  return html`
    ${expiryBanner(latest)}
    ${membershipHero(s.current, latest, (s.subscriptions || []).filter(x => x.status === 'WAITING_ACTIVATION'))}
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
      tab: (t, e, ctx) => {
        ctx.set({ tab: t.dataset.tab });
        // nút "Gia hạn ngay" ở hero: kéo xuống bảng gói
        if (t.getAttribute('role') !== 'tab') setTimeout(() => document.querySelector('[data-testid=package-tabs]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    }
  });
}
