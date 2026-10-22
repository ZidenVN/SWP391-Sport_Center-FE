import { html, icon } from '../../core/dom.js';
import { emptyState } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi } from '../../api/endpoints.js';
import { money, date, daysUntil, toDate } from '../../core/format.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { latestActive, bestValueId, vnpayMark } from '../../components/billing.js';

function membershipHero(current, latest) {
  if (!latest) {
    return html`
      <div class="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative overflow-hidden" data-testid="membership-status">
        <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-emerald-500/20"></div>
        <div class="relative">
          <div class="text-xs font-bold uppercase tracking-widest text-emerald-200">Hội viên</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold mt-2">Bắt đầu hành trình tập luyện</h1>
          <p class="text-slate-300 mt-2 max-w-xl text-sm">Chọn một gói phù hợp bên dưới. Gói được kích hoạt ngay sau khi thanh toán và bạn có thể đặt lớp liền.</p>
        </div>
      </div>`;
  }
  const start = toDate((current || latest).startDate);
  const end = toDate(latest.endDate);
  const pct = Math.max(2, Math.min(100, Math.round(((Date.now() - start) / (end - start)) * 100)));
  const left = daysUntil(latest.endDate);
  return html`
    <div class="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden" data-testid="membership-status">
      <div class="absolute -right-12 -bottom-16 w-56 h-56 rounded-full bg-white/10"></div>
      <div class="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-300"></span> Đang hoạt động
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold mt-3">${(current || latest).packageName}</h1>
          <p class="text-emerald-100 text-sm mt-1">Bạn được tập đến <b class="text-white">${date(latest.endDate)}</b> · còn ${left} ngày</p>
        </div>
        <div class="md:w-80">
          <div class="flex justify-between text-xs text-emerald-100 mb-1.5"><span>${date(start)}</span><span>${date(end)}</span></div>
          <div class="h-2 rounded-full bg-white/20 overflow-hidden"><div class="h-full rounded-full bg-white" style="width:${pct}%"></div></div>
          <div class="text-xs text-emerald-100 mt-2">Mua thêm gói sẽ được cộng nối tiếp sau ${date(latest.endDate)}, không mất ngày còn lại.</div>
        </div>
      </div>
    </div>`;
}

function planCard(p, { best, isRenewal }) {
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : null;
  const perks = [
    `${p.durationDays} ngày tập kể từ ngày kích hoạt`,
    'Đặt lớp không giới hạn trong thời hạn gói',
    'Nhận giáo án & nhận xét từ huấn luyện viên',
    isRenewal ? 'Cộng nối tiếp, không mất ngày còn lại' : 'Kích hoạt ngay sau khi thanh toán'
  ];
  return html`
    <div class="relative rounded-3xl bg-white border ${best ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-xl shadow-emerald-500/10' : 'border-slate-200 shadow-sm'} p-6 sm:p-7 flex flex-col hover-lift"
      data-testid="package-card" data-package-id="${p.packageId}">
      ${best ? html`<span class="absolute -top-3 left-6 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wide shadow">Tiết kiệm nhất</span>` : ''}
      <div class="flex items-center justify-between">
        <div class="text-sm font-bold text-slate-900">${p.packageName}</div>
        <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">${p.durationDays} ngày</span>
      </div>
      <div class="mt-5 flex items-end gap-1">
        <span class="text-4xl font-black tracking-tight text-slate-900">${money(p.price).replace(' ₫', '')}</span>
        <span class="text-lg font-bold text-slate-500 mb-1">₫</span>
      </div>
      ${perDay ? html`<div class="text-xs text-slate-500 mt-1">chỉ ${money(perDay)} / ngày</div>` : ''}
      ${p.description ? html`<p class="text-sm text-slate-600 mt-4">${p.description}</p>` : ''}
      <ul class="mt-5 space-y-2.5 text-sm text-slate-700 flex-1">
        ${perks.map(t => html`<li class="flex gap-2.5">${icon('check-circle-2', 'w-4 h-4 text-emerald-500 shrink-0 mt-0.5')}<span>${t}</span></li>`)}
      </ul>
      <a href="#/member/checkout/${p.packageId}" data-testid="choose-package"
        class="mt-7 btn w-full !py-3 ${best ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}">
        ${isRenewal ? 'Gia hạn với gói này' : 'Chọn gói này'} ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </div>`;
}

const TRUST = [
  ['shield-check', 'Thanh toán an toàn', 'Xử lý qua cổng VNPay, hỗ trợ thẻ ATM, thẻ quốc tế và QR.'],
  ['zap', 'Kích hoạt tức thì', 'Gói có hiệu lực ngay khi thanh toán thành công.'],
  ['file-text', 'Hóa đơn điện tử', 'Xem và in hóa đơn bất cứ lúc nào trong mục Thanh toán.']
];

function view(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays);
  const latest = latestActive(s.subscriptions);
  const best = bestValueId(plans);
  return html`
    ${expiryBanner(latest)}
    ${membershipHero(s.current, latest)}
    <div class="flex items-end justify-between mt-10 mb-5">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">${latest ? 'Gia hạn gói tập' : 'Chọn gói tập'}</h2>
        <p class="text-sm text-slate-500 mt-1">Giá đã bao gồm VAT, không phát sinh phí giao dịch.</p>
      </div>
      <a href="#/member/payments" class="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:underline">${icon('history', 'w-4 h-4')} Lịch sử thanh toán</a>
    </div>
    ${plans.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-3">
        ${plans.map(p => planCard(p, { best: p.packageId === best, isRenewal: Boolean(latest) }))}
      </div>` : emptyState('Hiện chưa có gói tập nào đang mở bán', 'package')}
    <div class="grid sm:grid-cols-3 gap-4 mt-10">
      ${TRUST.map(([ic, title, text]) => html`
        <div class="flex gap-3 p-4 rounded-2xl bg-white border border-slate-200">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">${icon(ic, 'w-5 h-5')}</div>
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
    view
  });
}
