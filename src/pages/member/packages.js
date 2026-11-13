import { html, icon } from '../../core/dom.js';
import { emptyState, tabs } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi } from '../../api/endpoints.js';
import { money, date, daysUntil, toDate, badge } from '../../core/format.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { latestActive, bestValueId, vnpayMark, packageKind, subjectNameOf } from '../../components/billing.js';
import { defaultClassImage } from '../../components/classCard.js';
import { hasMembership as hasMembershipOf, withDurations } from '../../components/classPackages.js';
import { memberSmartCard, renderMembershipProposalShowcase, openCheckinCodeModal } from '../../components/membershipCard.js';
import { session } from '../../core/session.js';
import { quizStore, recommendPackage } from '../../core/quiz.js';

// Ảnh nền hero + lớp phủ xanh rừng đậm bên trái để chữ trắng luôn đọc được
const heroShell = (inner, side = '') => html`
  <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white min-h-[290px]" data-testid="membership-status">
    <img src="/landing/hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_60%]" />
    <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand-dark/15"></span>
    <div class="relative p-6 sm:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 min-h-[290px]">
      <div class="max-w-xl flex flex-col justify-between gap-6">${inner}</div>
      ${side}
    </div>
  </div>`;

function membershipHero(current, latest, waiting = []) {
  if (!latest) {
    return heroShell(html`
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold uppercase tracking-wide">
          <span class="w-2 h-2 rounded-full bg-brand-dark"></span> ${waiting.length ? 'Chờ kích hoạt' : 'Hội viên mới'}
        </span>
        <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-[.9] mt-4">${waiting.length
          ? html`<span class="text-brand-lime">${waiting.map(x => x.packageName).join(', ')}</span>`
          : html`SẴN SÀNG<br /><span class="text-brand-lime">BỨT TỐC.</span>`}</h1>
        <p class="text-white/80 mt-4 text-sm">${waiting.length
          ? 'Gói đã thanh toán, sẽ tự kích hoạt khi bạn check-in tại quầy hoặc đăng ký lớp lần đầu (chậm nhất 14 ngày sau khi thanh toán).'
          : 'Chọn một gói phù hợp bên dưới. Gói tự kích hoạt khi bạn check-in hoặc đăng ký lớp lần đầu (chậm nhất 14 ngày sau khi thanh toán).'}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-lime !py-3" data-action="tab" data-tab="MEMBERSHIP">Chọn gói ngay ${icon('arrow-right', 'w-4 h-4')}</button>
        <button type="button" class="btn !py-3 border border-white/40 text-white hover:bg-white/10" data-action="tab" data-tab="MINE">Xem gói của tôi</button>
      </div>`);
  }
  const start = toDate((current?.startDate ? current : latest).startDate);
  const end = toDate(latest.endDate);
  const total = Math.max(1, Math.round((end - start) / 86400000));
  const left = Math.max(0, daysUntil(latest.endDate) ?? 0);
  const pct = Math.max(2, Math.min(100, Math.round((left / total) * 100)));
  return heroShell(html`
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold uppercase tracking-wide">
          <span class="w-2 h-2 rounded-full bg-brand-dark"></span> Đang hoạt động
        </span>
        <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-[.9] mt-4">SẴN SÀNG<br /><span class="text-brand-lime">BỨT TỐC.</span></h1>
        <p class="text-white/80 mt-4 text-sm">${(current || latest).packageName} của bạn còn <b class="text-white">${left} ngày</b>. Gia hạn sớm, ngày mới nối tiếp sau ${date(latest.endDate)}, không mất ngày nào.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-lime !py-3" data-action="tab" data-tab="MEMBERSHIP">Gia hạn ngay ${icon('arrow-right', 'w-4 h-4')}</button>
        <button type="button" class="btn !py-3 border border-white/40 text-white hover:bg-white/10" data-action="tab" data-tab="MINE">Xem gói của tôi</button>
      </div>`,
    html`
      <div class="lg:w-64 shrink-0 rounded-2xl bg-white text-brand-dark p-5 shadow-lg" data-testid="membership-progress">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Membership</div>
        <div class="font-display text-2xl font-extrabold leading-tight uppercase mt-0.5">${(current || latest).packageName}</div>
        <div class="h-2 rounded-full bg-brand-sand overflow-hidden mt-3"><div class="h-full rounded-full bg-brand" style="width:${pct}%"></div></div>
        <div class="flex justify-between text-xs text-slate-500 mt-2"><span>${left}/${total} ngày</span><b class="text-brand-dark">${date(end)}</b></div>
      </div>`);
}

const isClass = p => p.packageType === 'CLASS';

// Quyền lợi Membership ngắn gọn, rõ ràng theo thiết kế
function perksOf(p) {
  return [
    `${p.durationDays} ngày vào trung tâm, dùng cơ sở vật chất`,
    'Kích hoạt khi check-in hoặc đăng ký lớp lần đầu',
    'Mua thêm được cộng nối tiếp, không mất ngày'
  ];
}

// Gói lớp dùng ảnh bộ môn (chưa có thì ảnh mặc định theo tên môn)
const classPhoto = p => p.subject?.imageUrl || defaultClassImage(subjectNameOf(p));

// 3 tông màu thẻ Membership theo thiết kế: xanh rừng đậm, cam đất đậm, và vàng chanh (tiết kiệm nhất)
const TIER_STYLES = [
  { box: 'bg-brand-dark text-white', sub: 'text-white/70', mark: 'text-brand-lime/15', line: 'bg-white/15', tick: 'text-brand-lime', btn: 'btn border border-white/40 text-white hover:bg-white/10' },
  { box: 'bg-[#B84A24] text-white', sub: 'text-white/80', mark: 'text-white/15', line: 'bg-white/20', tick: 'text-amber-200', btn: 'btn border border-white/50 text-white hover:bg-white/10' }
];
const BEST_STYLE = { box: 'bg-brand-lime text-brand-dark', sub: 'text-brand-dark/70', mark: 'text-brand-dark/10', line: 'bg-brand-dark/15', tick: 'text-brand-dark', btn: 'btn bg-brand-dark text-brand-lime hover:brightness-110' };

const bigMark = days => (days % 30 === 0 ? days / 30 : days);

function membershipCard(p, { best, isRenewal, suggested, index }) {
  const st = best ? BEST_STYLE : TIER_STYLES[index % TIER_STYLES.length];
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : null;
  return html`
    <div class="relative rounded-3xl overflow-hidden p-7 flex flex-col hover-lift ${st.box}" data-testid="package-card" data-package-id="${p.packageId}">
      <span class="absolute -right-1 -top-8 font-display text-[220px] font-extrabold leading-none select-none pointer-events-none ${st.mark}" aria-hidden="true">${bigMark(p.durationDays)}</span>
      <div class="relative flex flex-wrap items-center justify-between gap-2 min-h-[26px]">
        <span class="text-[11px] font-extrabold uppercase tracking-widest ${st.sub}" data-testid="package-kind">${packageKind(p)} · ${p.durationDays} ngày</span>
        <span class="flex flex-wrap gap-2">
          ${best ? html`<span class="px-3 py-1 rounded-full bg-brand-dark text-brand-lime text-[11px] font-extrabold uppercase tracking-wide">★ Tiết kiệm nhất</span>` : ''}
          ${suggested ? html`<span class="px-3 py-1 rounded-full bg-white text-brand-dark text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1" data-testid="suggested-badge">${icon('sparkles', 'w-3 h-3')} Phù hợp với bạn</span>` : ''}
        </span>
      </div>
      <div class="relative font-display text-4xl font-extrabold leading-none uppercase mt-3">${p.packageName}</div>
      ${p.description ? html`<p class="relative text-sm mt-2 line-clamp-2 ${st.sub}" title="${p.description}">${p.description}</p>` : ''}
      <div class="relative mt-6 flex items-end gap-1">
        <span class="font-display text-6xl font-extrabold leading-none">${money(p.price).replace(' ₫', '')}</span>
        <span class="text-xl font-bold mb-1 ${st.sub}">₫</span>
      </div>
      ${perDay ? html`<div class="relative text-xs mt-1 ${st.sub}">≈ ${money(perDay)} / ngày</div>` : ''}
      <div class="relative h-px my-5 ${st.line}"></div>
      <ul class="relative space-y-2.5 text-sm flex-1">
        ${perksOf(p).map(t => html`<li class="flex gap-2.5">${icon('check', `w-4 h-4 shrink-0 mt-0.5 ${st.tick}`)}<span>${t}</span></li>`)}
      </ul>
      <a href="#/member/checkout/${p.packageId}" data-testid="choose-package" class="relative mt-6 w-full !py-3 ${st.btn}">
        ${isRenewal ? 'Gia hạn với gói này' : 'Chọn gói này'} ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </div>`;
}

// Thẻ gói lớp phủ ảnh bộ môn theo bố cục Bento Grid
function classCard(p, { best, suggested, featured }) {
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : null;
  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white group hover-lift ${featured ? 'min-h-[430px] lg:row-span-2' : 'min-h-[205px]'} ${best ? 'ring-2 ring-inset ring-brand-lime/80' : ''}"
      data-testid="package-card" data-package-id="${p.packageId}" title="${p.description || ''}">
      <img src="${classPhoto(p)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span class="absolute inset-0 bg-gradient-to-b from-black/10 via-brand-dark/40 to-brand-dark/95"></span>
      <div class="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
        ${best ? html`<span class="px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase tracking-wide">Tiết kiệm nhất</span>` : ''}
        ${suggested ? html`<span class="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1" data-testid="suggested-badge">${icon('sparkles', 'w-3 h-3')} Phù hợp với bạn</span>` : ''}
      </div>
      <div class="absolute left-0 right-0 bottom-0 ${featured ? 'p-6 sm:p-7' : 'p-5'}">
        <div class="text-[11px] font-extrabold uppercase tracking-widest text-brand-lime" data-testid="package-kind">${subjectNameOf(p)} · ${p.durationDays} ngày</div>
        <div class="font-display font-extrabold leading-none uppercase mt-1 ${featured ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl line-clamp-1'}">${p.packageName}</div>
        ${p.description ? html`<p class="text-xs text-white/75 mt-1.5 line-clamp-1">${p.description}</p>` : ''}
        <div class="flex items-end justify-between gap-3 ${featured ? 'mt-5 pt-4 border-t border-white/15' : 'mt-3'}">
          <div>
            <div class="font-display font-extrabold leading-none ${featured ? 'text-4xl text-brand-lime' : 'text-2xl text-white'}">${money(p.price)}</div>
            ${perDay ? html`<div class="text-[11px] text-white/65 mt-0.5">≈ ${money(perDay)} / ngày</div>` : ''}
          </div>
          <a href="#/member/checkout/${p.packageId}" data-testid="choose-package"
            class="shrink-0 ${featured ? 'btn-lime !px-5 !py-2.5 text-xs' : 'btn btn-sm bg-white text-brand-dark hover:bg-brand-lime !px-3.5 !py-1.5 text-xs'}">Đăng ký</a>
        </div>
      </div>
    </div>`;
}

function membershipSection(list, hasMembership, suggestedId) {
  if (!list.length) return emptyState('Hiện chưa có gói Membership nào mở bán', 'package');
  const best = bestValueId(list);
  return html`
    <section data-testid="membership-section">
      <div class="mb-4">
        <h2 class="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark leading-none">CHỌN MEMBERSHIP</h2>
        <p class="text-sm text-slate-500 mt-1">Vào cửa không giới hạn · bắt buộc có trước khi mua gói lớp</p>
      </div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        ${list.map((p, index) => membershipCard(p, { best: p.packageId === best, isRenewal: hasMembership, suggested: p.packageId === suggestedId, index }))}
      </div>
    </section>`;
}

// Khu vực Gói lớp học cùng HLV: tiêu đề bên trái, chip lọc môn bên phải, lưới Bento bên dưới
function classSection(all, hasMembership, suggestedId, subject) {
  if (!all.length) return emptyState('Hiện chưa có gói lớp nào mở bán', 'calendar-x');
  const bySubject = new Map();
  all.forEach(p => {
    const key = subjectNameOf(p);
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key).push(p);
  });
  const best = [...bySubject.values()].map(bestValueId);
  const list = subject && bySubject.has(subject) ? bySubject.get(subject) : all;
  const lead = list.find(p => p.packageId === suggestedId) || list[0];
  const ordered = [lead, ...list.filter(p => p !== lead)];
  const chip = (id, label) => html`
    <button type="button" data-action="subject" data-subject="${id}" aria-pressed="${(subject || '') === id}"
      class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${(subject || '') === id ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-slate-600 border-brand-line hover:border-brand-dark'}">${label}</button>`;
  return html`
    <section data-testid="class-section">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
        <div>
          <h2 class="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark leading-none">GÓI LỚP · HỌC CÙNG HLV</h2>
          <p class="text-sm text-slate-500 mt-1">Lịch cố định trong tuần, giữ chỗ suốt khoá</p>
        </div>
        ${bySubject.size > 1 ? html`<div class="flex flex-wrap gap-1.5" data-testid="subject-filter">${chip('', 'Tất cả')}${[...bySubject.keys()].map(k => chip(k, k))}</div>` : ''}
      </div>
      ${!hasMembership ? html`
        <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-4" data-testid="need-membership">
          ${icon('alert-circle', 'w-5 h-5 shrink-0')}
          <span class="flex-1">Bạn cần có <b>Membership</b> trước khi mua gói lớp.</span>
          <button type="button" class="btn-primary btn-sm" data-action="tab" data-tab="MEMBERSHIP">Xem gói Membership</button>
        </div>` : ''}
      <div class="grid sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr] gap-5">
        ${ordered.map((p, i) => classCard(p, { best: best.includes(p.packageId), suggested: p.packageId === suggestedId, featured: i === 0 && ordered.length > 2 }))}
      </div>
    </section>`;
}

// Tab "Gói của tôi": hiển thị Thẻ Membership vật lý + danh sách gói lớp đã mua + nút xem 4 trạng thái mẫu
function myPackagesSection(s) {
  const subs = withDurations(s.subscriptions || [], s.packages || []);
  const classSubs = subs.filter(x => x.packageType === 'CLASS');
  return html`
    <section class="space-y-6" data-testid="my-packages-section">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 class="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark leading-none">THẺ MEMBERSHIP CỦA BẠN</h2>
            <p class="text-sm text-slate-500 mt-1">Sử dụng mã vạch trên thẻ để check-in tại quầy lễ tân</p>
          </div>
          <button type="button" class="btn-secondary btn-sm" data-action="toggle-showcase" data-testid="toggle-showcase">
            ${icon('layers', 'w-3.5 h-3.5')} ${s.showAllStates ? 'Ẩn 4 trạng thái thẻ mẫu' : 'Xem 4 trạng thái thẻ đề xuất'}
          </button>
        </div>
        ${memberSmartCard(subs, { me: s.me, progress: s.progress, checkIns: s.checkIns, inPackagesPage: true })}
        ${s.showAllStates ? renderMembershipProposalShowcase(true) : ''}
      </div>

      <div class="card p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 class="font-display text-2xl font-extrabold uppercase text-brand-dark leading-none">GÓI LỚP ĐÃ MUA</h3>
            <p class="text-xs text-slate-500 mt-1">Mỗi gói lớp gắn với 1 lớp cùng bộ môn và thời hạn</p>
          </div>
          <div class="flex gap-2">
            <a href="#/member/classes" class="btn-secondary btn-sm">${icon('calendar-plus', 'w-3.5 h-3.5')} Đặt lớp</a>
            <a href="#/member/payments" class="btn-secondary btn-sm">${icon('receipt', 'w-3.5 h-3.5')} Lịch sử thanh toán</a>
          </div>
        </div>
        ${classSubs.length ? html`
          <div class="divide-y divide-brand-line/60">
            ${classSubs.map(x => html`
              <div class="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="w-10 h-10 rounded-xl bg-brand-sand text-brand-dark flex items-center justify-center shrink-0">${icon('dumbbell', 'w-5 h-5')}</span>
                  <div class="min-w-0">
                    <div class="font-bold text-sm text-brand-dark truncate">${x.packageName}</div>
                    <div class="text-xs text-slate-500">${x.subjectName ? `${x.subjectName} · ` : ''}${x.startDate ? `${date(x.startDate)} → ${date(x.endDate)}` : 'Chưa kích hoạt (chờ chọn lớp)'}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  ${badge(x.status)}
                  ${x.status === 'WAITING_ACTIVATION' ? html`<a href="#/member/classes" class="btn-primary btn-sm">Chọn lớp ngay</a>` : ''}
                </div>
              </div>`)}
          </div>` : emptyState('Bạn chưa mua gói lớp nào', 'calendar-x')}
      </div>
    </section>`;
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
  const tab = s.tab || 'MEMBERSHIP';
  const myCount = (s.subscriptions || []).filter(x => ['ACTIVE', 'WAITING_ACTIVATION'].includes(x.status)).length;

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

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3" data-testid="package-tabs">
      ${tabs([
        { id: 'MEMBERSHIP', label: 'Membership', count: memberships.length },
        { id: 'CLASS', label: 'Gói lớp', count: classPlans.length },
        { id: 'MINE', label: 'Gói của tôi', count: myCount }
      ], tab)}
      <a href="#/member/payments" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-deep hover:underline mb-5">${icon('history', 'w-4 h-4')} Lịch sử thanh toán</a>
    </div>

    ${tab === 'MINE'
      ? myPackagesSection(s)
      : !plans.length
        ? emptyState('Hiện chưa có gói tập nào đang mở bán', 'package')
        : tab === 'CLASS'
          ? classSection(classPlans, hasMembership, suggestedId, s.subject)
          : html`
              <div class="space-y-10">
                ${membershipSection(memberships, hasMembership, suggestedId)}
                ${classPlans.length ? classSection(classPlans, hasMembership, suggestedId, s.subject) : ''}
              </div>`}

    <div class="mt-8 pt-4 border-t border-brand-line/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
      <span>Thanh toán qua VNPay hoặc tại quầy lễ tân · Giao dịch VNPay chưa hoàn tất sẽ tự hết hạn sau 15 phút.</span>
      <span class="inline-flex items-center gap-1.5">Đối tác thanh toán ${vnpayMark('text-sm')}</span>
    </div>`;
}

export default function MemberPackages(el) {
  return mountPage(el, {
    load: async () => {
      const res = await settle({
        packages: [packageApi.list, null],
        current: [memberApi.currentSubscription, null],
        subscriptions: [memberApi.subscriptions, []],
        me: [memberApi.me, null],
        progress: [memberApi.progress, null],
        checkIns: [memberApi.checkIns, []]
      });
      if (res.packagesError) throw res.packagesError;
      return res;
    },
    view,
    actions: {
      subject: (t, e, ctx) => ctx.set({ subject: t.dataset.subject }),
      'toggle-showcase': (t, e, ctx) => ctx.set({ showAllStates: !ctx.state.showAllStates }),
      'checkin-code': btn => openCheckinCodeModal({
        memberCode: btn.dataset.memberCode,
        memberName: btn.dataset.memberName,
        packageName: btn.dataset.packageName,
        validity: btn.dataset.validity
      }),
      tab: (t, e, ctx) => {
        ctx.set({ tab: t.dataset.tab });
        if (t.getAttribute('role') !== 'tab') {
          setTimeout(() => document.querySelector('[data-testid=package-tabs]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }
      }
    }
  });
}
