import { html, raw, icon } from '../core/dom.js';
import { openModal } from '../core/ui.js';
import { date, daysUntil, toDate, fullName } from '../core/format.js';
import { session } from '../core/session.js';

const byEnd = (p, q) => String(p.endDate || '9').localeCompare(String(q.endDate || '9'));

// dd/MM/yy cho mặt thẻ vật lý
function shortDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

// Cộng thêm số ngày vào 1 mốc ngày
function addDays(value, days) {
  const d = toDate(value);
  if (!d) return null;
  const next = new Date(d.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function formatMemberCode(id) {
  const num = Number(id);
  return `SC-${String(Number.isFinite(num) && num > 0 ? num : 98).padStart(6, '0')}`;
}

// Mã vạch SVG sắc nét theo mã hội viên
function barcodeSvg(code = 'SC-000098', cls = 'h-7 w-20') {
  const bars = [2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2];
  let x = 2;
  const rects = bars.map((w, i) => {
    const r = i % 2 === 0 ? `<rect x="${x}" y="2" width="${w}" height="24" rx="0.5" fill="#0E2A20" />` : '';
    x += w + 1;
    return r;
  }).join('');
  return html`
    <svg viewBox="0 0 ${x + 1} 28" class="${cls}" aria-hidden="true" focusable="false">
      ${raw(rects)}
    </svg>`;
}

// Popup hiện mã check-in lớn để quét tại quầy lễ tân
export function openCheckinCodeModal({ memberCode, memberName, packageName, validity }) {
  openModal({
    title: 'Mã check-in hội viên',
    size: 'max-w-md',
    body: html`
      <div class="text-center">
        <p class="text-sm text-slate-600">Đưa mã này cho lễ tân tại quầy để check-in vào trung tâm.</p>
        <div class="mt-4 rounded-2xl border border-brand-line bg-brand-cream p-5 flex flex-col items-center">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-brand-line/60">
            ${barcodeSvg(memberCode, 'h-20 w-64')}
          </div>
          <div class="font-mono text-2xl font-extrabold tracking-widest text-brand-dark mt-3">${memberCode}</div>
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">${memberName}</div>
          ${packageName ? html`<div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-brand-lime text-xs font-extrabold">${packageName}${validity ? ` · ${validity}` : ''}</div>` : ''}
        </div>
      </div>`
  });
}

// Mặt thẻ vật lý bên trái (tỉ lệ thẻ thành viên thật)
function physicalCardFace({
  state, // 'ACTIVE' | 'EXPIRING' | 'WAITING' | 'EXPIRED'
  packageName,
  memberName,
  memberCode,
  validity,
  statusText
}) {
  const themes = {
    ACTIVE: {
      img: '/membership/card-active.jpg',
      imgCls: '',
      shade: 'bg-gradient-to-br from-[#0B261C]/95 via-[#133A2B]/85 to-[#1E9E64]/45',
      logoBg: 'bg-brand-lime text-brand-dark',
      subLogo: 'text-brand-lime/85',
      pill: 'bg-brand-lime text-brand-dark',
      dot: 'bg-brand-dark',
      pkgColor: 'text-brand-lime',
      showBarcode: true
    },
    EXPIRING: {
      img: '/membership/card-expiring.jpg',
      imgCls: '',
      shade: 'bg-gradient-to-br from-[#3A1607]/95 via-[#7C2D12]/85 to-[#EA580C]/50',
      logoBg: 'bg-orange-500 text-white',
      subLogo: 'text-amber-200/85',
      pill: 'bg-orange-500 text-white',
      dot: 'bg-white',
      pkgColor: 'text-amber-200',
      showBarcode: true
    },
    WAITING: {
      img: '/membership/card-waiting.jpg',
      imgCls: '',
      shade: 'bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-slate-800/65',
      logoBg: 'bg-white/20 text-white',
      subLogo: 'text-white/65',
      pill: 'bg-white/20 text-white backdrop-blur-sm',
      dot: 'bg-brand-lime',
      pkgColor: 'text-white',
      showBarcode: false
    },
    EXPIRED: {
      img: '/membership/card-expired.jpg',
      imgCls: 'grayscale opacity-70',
      shade: 'bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-700/80',
      logoBg: 'bg-white/20 text-white/75',
      subLogo: 'text-white/55',
      pill: 'bg-white/20 text-white/80',
      dot: 'bg-white/60',
      pkgColor: 'text-white/80',
      showBarcode: false
    }
  };
  const t = themes[state] || themes.ACTIVE;
  return html`
    <div class="relative w-full sm:w-[300px] xl:w-[310px] shrink-0 rounded-2xl overflow-hidden text-white p-4 flex flex-col justify-between min-h-[188px] shadow-md select-none">
      <img src="${t.img}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover ${t.imgCls}" />
      <span class="absolute inset-0 ${t.shade}"></span>

      <div class="relative flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg font-display font-extrabold text-xs flex items-center justify-center shrink-0 ${t.logoBg}">SC</span>
          <div class="leading-tight">
            <div class="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/95">SPORT CENTER</div>
            <div class="text-[8px] font-bold uppercase tracking-[0.18em] ${t.subLogo}">MEMBERSHIP CARD</div>
          </div>
        </div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap ${t.pill}">
          <span class="w-1.5 h-1.5 rounded-full ${t.dot}"></span>${statusText}
        </span>
      </div>

      <div class="relative my-3">
        <div class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">HẠNG GÓI</div>
        <div class="font-display text-2xl sm:text-[28px] font-extrabold uppercase leading-none mt-0.5 ${t.pkgColor}">${packageName}</div>
        <div class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mt-2.5">HỘI VIÊN</div>
        <div class="font-display text-base font-extrabold uppercase tracking-wide text-white leading-tight mt-0.5 truncate">${memberName}</div>
      </div>

      <div class="relative flex items-end justify-between gap-2 pt-2 border-t border-white/15">
        <div class="flex items-center gap-4 min-w-0">
          <div>
            <div class="text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">MÃ HỘI VIÊN</div>
            <div class="font-mono text-[11px] font-bold text-white mt-0.5">${memberCode}</div>
          </div>
          <div>
            <div class="text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">HIỆU LỰC</div>
            <div class="text-[11px] font-bold text-white mt-0.5 whitespace-nowrap">${validity}</div>
          </div>
        </div>
        ${t.showBarcode
          ? html`<div class="bg-white rounded-md px-1.5 py-1 shrink-0 shadow-sm">${barcodeSvg(memberCode, 'h-6 w-16')}</div>`
          : html`<div class="w-14 h-7 rounded-md border border-dashed border-white/30 shrink-0" aria-hidden="true"></div>`}
      </div>
    </div>`;
}

// Khung thẻ Membership hoàn chỉnh (Mặt thẻ vật lý bên trái + Thông tin/Thao tác bên phải)
export function renderMembershipCardWidget({
  state, // 'ACTIVE' | 'EXPIRING' | 'WAITING' | 'EXPIRED'
  packageName,
  memberName,
  memberCode,
  startDate,
  endDate,
  paidAt,
  autoActivateDate,
  durationDays = 90,
  daysLeft = 0,
  totalDays = 90,
  checkInsCount = 0,
  sessionsCount = 0,
  extraCount = 0,
  lastEndDate = null,
  expiringNote = '',
  inPackagesPage = false,
  testId = 'membership-card'
}) {
  const validity = state === 'WAITING'
    ? 'Chưa kích hoạt'
    : startDate && endDate
      ? `${shortDate(startDate)} – ${shortDate(endDate)}`
      : endDate ? `Đến ${shortDate(endDate)}` : '—';

  const statusText = state === 'ACTIVE'
    ? 'Đang hoạt động'
    : state === 'EXPIRING'
      ? `Còn ${Math.max(0, daysLeft)} ngày`
      : state === 'WAITING'
        ? 'Chờ kích hoạt'
        : 'Hết hạn';

  const pct = totalDays > 0 ? Math.max(4, Math.min(100, Math.round((daysLeft / totalDays) * 100))) : 0;
  const renewAction = inPackagesPage
    ? html`data-action="tab" data-tab="MEMBERSHIP"`
    : html`href="#/member/packages"`;
  const renewTag = inPackagesPage ? 'button' : 'a';

  let rightPanel = '';
  if (state === 'ACTIVE') {
    rightPanel = html`
      <div class="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="font-display text-5xl font-extrabold leading-none text-brand-dark">${daysLeft}</span>
            <span class="text-sm text-slate-600">ngày còn lại · hết hạn <b class="text-brand-dark">${date(endDate)}</b></span>
          </div>
          <div class="h-2 rounded-full bg-brand-sand overflow-hidden mt-3">
            <div class="h-full rounded-full bg-brand" style="width:${pct}%"></div>
          </div>
          <div class="grid grid-cols-2 gap-2.5 mt-3.5">
            <div class="rounded-xl bg-brand-cream px-3.5 py-2.5 border border-brand-line/50">
              <div class="text-[11px] font-semibold text-slate-500">Check-in tháng này</div>
              <div class="font-display text-2xl font-extrabold text-brand-dark leading-none mt-1">${checkInsCount}</div>
            </div>
            <div class="rounded-xl bg-brand-cream px-3.5 py-2.5 border border-brand-line/50">
              <div class="text-[11px] font-semibold text-slate-500">Buổi lớp đã học</div>
              <div class="font-display text-2xl font-extrabold text-brand-dark leading-none mt-1">${sessionsCount}</div>
            </div>
          </div>
          ${extraCount > 0 ? html`<div class="text-xs text-slate-500 mt-2">+${extraCount} gói nối tiếp · hiệu lực đến <b class="text-brand-dark">${date(lastEndDate || endDate)}</b></div>` : ''}
        </div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <button type="button" class="btn-lime !px-4 !py-2 text-xs"
            data-action="checkin-code"
            data-member-code="${memberCode}"
            data-member-name="${memberName}"
            data-package-name="${packageName}"
            data-validity="${validity}">Mã check-in</button>
          <${renewTag} ${renewAction} class="btn-secondary !px-4 !py-2 text-xs">Gia hạn sớm</${renewTag}>
        </div>
      </div>`;
  } else if (state === 'EXPIRING') {
    rightPanel = html`
      <div class="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="font-display text-5xl font-extrabold leading-none text-orange-600">${Math.max(0, daysLeft)}</span>
            <span class="text-sm text-slate-600">ngày còn lại · hết hạn <b class="text-slate-900">${date(endDate)}</b></span>
          </div>
          <div class="h-2 rounded-full bg-orange-100 overflow-hidden mt-3">
            <div class="h-full rounded-full bg-orange-500" style="width:${Math.max(8, pct)}%"></div>
          </div>
          <div class="rounded-xl bg-orange-50 border border-orange-200/80 px-3.5 py-2.5 text-xs text-orange-900 mt-3.5">
            ${expiringNote || `Gia hạn trước ${date(endDate).slice(0, 5)} để không bị gián đoạn lịch tập và các lớp đang theo học.`}
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <${renewTag} ${renewAction} class="btn bg-orange-600 text-white hover:bg-orange-700 !px-4 !py-2 text-xs">Gia hạn ngay</${renewTag}>
          <button type="button" class="btn-secondary !px-4 !py-2 text-xs"
            data-action="checkin-code"
            data-member-code="${memberCode}"
            data-member-name="${memberName}"
            data-package-name="${packageName}"
            data-validity="${validity}">Mã check-in</button>
        </div>
      </div>`;
  } else if (state === 'WAITING') {
    const autoDate = autoActivateDate || (paidAt ? addDays(paidAt, 14) : null);
    rightPanel = html`
      <div class="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <div class="font-bold text-sm text-brand-dark">Check-in lần đầu tại quầy để bắt đầu tính ${durationDays || 180} ngày.</div>
          <div class="grid grid-cols-2 gap-2.5 mt-3.5">
            <div class="rounded-xl bg-brand-cream px-3.5 py-2.5 border border-brand-line/50">
              <div class="text-[11px] font-semibold text-slate-500">Đã thanh toán</div>
              <div class="font-display text-2xl font-extrabold text-brand-dark leading-none mt-1">${paidAt ? date(paidAt) : 'Đã xác nhận'}</div>
            </div>
            <div class="rounded-xl bg-brand-cream px-3.5 py-2.5 border border-brand-line/50">
              <div class="text-[11px] font-semibold text-slate-500">Tự kích hoạt</div>
              <div class="font-display text-2xl font-extrabold text-orange-600 leading-none mt-1">${autoDate ? date(autoDate) : 'Sau 14 ngày'}</div>
            </div>
          </div>
          ${extraCount > 0 ? html`<div class="text-xs text-slate-500 mt-2">+${extraCount} gói Membership khác đang chờ</div>` : ''}
        </div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <button type="button" class="btn-lime !px-4 !py-2 text-xs"
            data-action="checkin-code"
            data-member-code="${memberCode}"
            data-member-name="${memberName}"
            data-package-name="${packageName}"
            data-validity="Chờ kích hoạt">Mã check-in</button>
          <${renewTag} ${renewAction} class="btn-secondary !px-4 !py-2 text-xs">Xem gói</${renewTag}>
        </div>
      </div>`;
  } else {
    rightPanel = html`
      <div class="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div>
          <div class="font-display text-3xl font-extrabold text-brand-dark leading-tight">${endDate ? 'Membership đã hết hạn' : 'Bạn chưa có Membership'}</div>
          <p class="text-sm text-slate-600 mt-1.5">Cần membership còn hạn để vào trung tâm và mua gói lớp.</p>
        </div>
        <div class="flex flex-wrap gap-2.5 mt-4">
          <${renewTag} ${renewAction} class="btn-lime !px-4 !py-2 text-xs">${icon('package', 'w-4 h-4')} Mua membership</${renewTag}>
          <${renewTag} ${renewAction} class="btn-secondary !px-4 !py-2 text-xs">Xem bảng giá</${renewTag}>
        </div>
      </div>`;
  }

  return html`
    <div class="card p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-stretch h-full" data-testid="${testId}">
      ${physicalCardFace({ state, packageName, memberName, memberCode, validity, statusText })}
      ${rightPanel}
    </div>`;
}

// Tự động suy ra trạng thái thẻ từ danh sách subscriptions của hội viên
export function memberSmartCard(subscriptions = [], { me, progress, checkIns = [], inPackagesPage = false } = {}) {
  const user = me || session.get() || {};
  const memberName = (fullName(user) || user.fullName || user.email || 'HỘI VIÊN').toUpperCase();
  const memberCode = formatMemberCode(user.memberId || user.userId || 98);

  const memberships = (subscriptions || []).filter(x => x.packageType !== 'CLASS');
  const active = memberships.filter(x => x.status === 'ACTIVE' && (!x.endDate || toDate(x.endDate) >= new Date())).sort(byEnd);
  const waiting = memberships.filter(x => x.status === 'WAITING_ACTIVATION');
  const expired = memberships.filter(x => x.status === 'EXPIRED' || (x.endDate && toDate(x.endDate) < new Date())).sort(byEnd).reverse();

  // Đếm số lượt check-in trong tháng hiện tại
  const now = new Date();
  const checkInsThisMonth = Array.isArray(checkIns)
    ? checkIns.filter(c => {
        const d = toDate(c.checkInTime || c.createdAt || c.date);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length
    : 0;
  const sessionsCount = progress?.totalSessionAttended ?? 0;

  const head = active[0] || waiting[0];
  if (!head) {
    const lastExpired = expired[0] || null;
    return renderMembershipCardWidget({
      state: 'EXPIRED',
      packageName: 'ĐÃ HẾT HẠN',
      memberName,
      memberCode,
      startDate: lastExpired?.startDate,
      endDate: lastExpired?.endDate,
      inPackagesPage,
      testId: 'no-membership'
    });
  }

  const extra = active.length + waiting.length - 1;
  const last = active[active.length - 1];

  if (head.status === 'WAITING_ACTIVATION') {
    return renderMembershipCardWidget({
      state: 'WAITING',
      packageName: head.packageName || 'GÓI MEMBERSHIP',
      memberName,
      memberCode,
      paidAt: head.paidAt || head.startDate,
      durationDays: head.durationDays || 180,
      extraCount: extra,
      inPackagesPage,
      testId: 'membership-card'
    });
  }

  const start = toDate(head.startDate || head.activatedAt);
  const end = toDate(head.endDate);
  const totalDays = start && end && end > start ? Math.max(1, Math.round((end - start) / 86400000)) : (head.durationDays || 90);
  const left = Math.max(0, daysUntil(head.endDate) ?? 0);
  const isExpiring = left <= 7;

  return renderMembershipCardWidget({
    state: isExpiring ? 'EXPIRING' : 'ACTIVE',
    packageName: head.packageName || 'GÓI MEMBERSHIP',
    memberName,
    memberCode,
    startDate: start,
    endDate: end,
    daysLeft: left,
    totalDays,
    checkInsCount: checkInsThisMonth,
    sessionsCount,
    extraCount: extra,
    lastEndDate: (last || head).endDate,
    inPackagesPage,
    testId: 'membership-card'
  });
}

// Bộ 4 trạng thái mẫu theo đúng thiết kế "Thẻ Membership – đề xuất"
export function renderMembershipProposalShowcase(inPackagesPage = true) {
  const samples = [
    {
      no: '1 · ĐANG HOẠT ĐỘNG',
      desc: 'Thẻ như thẻ thành viên thật: mã vạch quét check-in tại quầy, hạn dùng rõ ràng.',
      card: renderMembershipCardWidget({
        state: 'ACTIVE',
        packageName: 'GÓI 3 THÁNG',
        memberName: 'PHẠM MINH QUÂN',
        memberCode: 'SC-000098',
        startDate: '2026-11-02',
        endDate: '2027-01-31',
        daysLeft: 81,
        totalDays: 90,
        checkInsCount: 6,
        sessionsCount: 5,
        inPackagesPage,
        testId: 'sample-card-active'
      })
    },
    {
      no: '2 · SẮP HẾT HẠN (≤ 7 NGÀY)',
      desc: 'Đổi sang cam để báo động; nút chính chuyển thành Gia hạn.',
      card: renderMembershipCardWidget({
        state: 'EXPIRING',
        packageName: 'GÓI 1 THÁNG',
        memberName: 'NGUYỄN HỒNG NHUNG',
        memberCode: 'SC-000112',
        startDate: '2026-10-17',
        endDate: '2026-11-16',
        daysLeft: 5,
        totalDays: 30,
        expiringNote: 'Gia hạn trước 16/11 để không bị gián đoạn lịch học Yoga.',
        inPackagesPage,
        testId: 'sample-card-expiring'
      })
    },
    {
      no: '3 · CHỜ KÍCH HOẠT',
      desc: 'Đã thanh toán, ngày bắt đầu tính từ lần check-in đầu (tự kích hoạt sau 14 ngày).',
      card: renderMembershipCardWidget({
        state: 'WAITING',
        packageName: 'GÓI 6 THÁNG',
        memberName: 'TRƯƠNG MINH KHOA',
        memberCode: 'SC-000022',
        paidAt: '2026-11-09',
        autoActivateDate: '2026-11-23',
        durationDays: 180,
        inPackagesPage,
        testId: 'sample-card-waiting'
      })
    },
    {
      no: '4 · CHƯA CÓ / ĐÃ HẾT HẠN',
      desc: 'Thẻ mờ giữ hình dạng thẻ để hội viên hiểu cần mua gói.',
      card: renderMembershipCardWidget({
        state: 'EXPIRED',
        packageName: 'ĐÃ HẾT HẠN',
        memberName: 'LÊ HẢI YẾN',
        memberCode: 'SC-000045',
        startDate: '2026-09-07',
        endDate: '2026-10-06',
        inPackagesPage,
        testId: 'sample-card-expired'
      })
    }
  ];

  return html`
    <div class="grid xl:grid-cols-2 gap-5 mt-4" data-testid="membership-states-showcase">
      ${samples.map(s => html`
        <div class="rounded-3xl bg-white/80 border border-brand-line p-4 sm:p-5">
          <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#1E9E64]">${s.no}</div>
          <p class="text-xs text-slate-500 mt-0.5 mb-3">${s.desc}</p>
          ${s.card}
        </div>`)}
    </div>`;
}
