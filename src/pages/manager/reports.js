import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, statCard, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { reportApi } from '../../api/endpoints.js';
import { money, isoDate, date, paymentMethodLabel, badge, statusLabel } from '../../core/format.js';
import { drawChart, revenueLine, doughnut, bars, CHART_COLORS } from '../../components/charts.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

const DAY = 86400000;
const PRESETS = [
  { id: '7', label: '7 ngày' },
  { id: '30', label: '30 ngày' },
  { id: 'month', label: 'Tháng này' },
  { id: 'year', label: 'Năm nay' }
];

function presetRange(id) {
  const now = new Date();
  if (id === 'month') return [new Date(now.getFullYear(), now.getMonth(), 1), now];
  if (id === 'year') return [new Date(now.getFullYear(), 0, 1), now];
  return [new Date(now.getTime() - (Number(id) - 1) * DAY), now];
}

// điền đủ các ngày trong khoảng (ngày không có giao dịch = 0)
function series(points, from, to) {
  const map = Object.fromEntries((points || []).map(p => [p.timeLabel, Number(p.value)]));
  const out = [];
  for (let d = new Date(from); d <= new Date(to); d = new Date(d.getTime() + DAY)) {
    out.push({ label: date(isoDate(d)).slice(0, 5), value: map[isoDate(d)] || 0 });
  }
  return out;
}

function breakdownTable(rows, labelFn) {
  return table({
    columns: [{ label: 'Hạng mục' }, { label: 'Giao dịch', cls: 'text-right' }, { label: 'Doanh thu', cls: 'text-right' }, { label: 'Tỷ trọng', cls: 'w-40' }],
    rows: rows.map((r, i) => [
      html`<span class="inline-flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${labelFn(r.categoryName)}</span>`,
      r.transactionCnt,
      html`<b>${money(r.totalAmount)}</b>`,
      html`<div class="flex items-center gap-2"><div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${r.percentage}%"></div></div><span class="text-xs font-semibold w-12 text-right">${Number(r.percentage).toFixed(1)}%</span></div>`
    ])
  });
}

function revenueTab(r) {
  if (!r) return emptyState('Không tải được báo cáo doanh thu', 'wallet');
  const avg = r.totalTransactions ? r.totalRevenue / r.totalTransactions : 0;
  return html`
    <div class="grid sm:grid-cols-3 gap-4 mb-5">
      ${statCard('Tổng doanh thu', money(r.totalRevenue), 'wallet', 'emerald')}
      ${statCard('Số giao dịch', r.totalTransactions ?? 0, 'receipt', 'sky')}
      ${statCard('Trung bình / giao dịch', money(Math.round(avg)), 'calculator', 'amber')}
    </div>
    <div class="card rounded-3xl p-5 mb-5">
      <div class="font-bold mb-4">Doanh thu theo ngày</div>
      <div class="h-72"><canvas id="rev-line" data-testid="report-revenue-chart"></canvas></div>
    </div>
    <div class="grid xl:grid-cols-2 gap-5">
      <div class="card rounded-3xl min-w-0">
        <div class="px-5 pt-5 pb-2 font-bold">Theo gói tập</div>
        ${r.revenueByPackage?.length ? html`<div class="h-56 px-5"><canvas id="rev-package"></canvas></div>${breakdownTable(r.revenueByPackage, x => x)}` : emptyState('Chưa có dữ liệu', 'package')}
      </div>
      <div class="card rounded-3xl min-w-0">
        <div class="px-5 pt-5 pb-2 font-bold">Theo phương thức thanh toán</div>
        ${r.revenueByMethod?.length ? html`<div class="h-56 px-5"><canvas id="rev-method"></canvas></div>${breakdownTable(r.revenueByMethod, paymentMethodLabel)}` : emptyState('Chưa có dữ liệu', 'credit-card')}
      </div>
    </div>`;
}

function membersTab(m) {
  if (!m) return emptyState('Không tải được báo cáo hội viên', 'users');
  const rate = m.totalMembers ? (m.activeSubscriptionMembers / m.totalMembers) * 100 : 0;
  return html`
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      ${statCard('Tổng hội viên', m.totalMembers ?? 0, 'users', 'emerald')}
      ${statCard('Mới trong kỳ', m.newMembersInRange ?? 0, 'user-plus', 'sky')}
      ${statCard('Đang có gói', m.activeSubscriptionMembers ?? 0, 'badge-check', 'violet')}
      ${statCard('Hết hạn / chưa mua', m.expiredOrNoSubMembers ?? 0, 'user-x', 'rose')}
    </div>
    <div class="grid lg:grid-cols-2 gap-5">
      <div class="card rounded-3xl p-5 min-w-0">
        <div class="font-bold mb-4">Tình trạng gói của hội viên</div>
        <div class="h-64"><canvas id="mem-status"></canvas></div>
      </div>
      <div class="card rounded-3xl p-6 flex flex-col justify-center">
        <div class="text-sm text-slate-500">Tỷ lệ hội viên đang có gói</div>
        <div class="font-display text-6xl font-extrabold text-brand-deep mt-2">${rate.toFixed(1)}%</div>
        <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-4"><div class="h-full bg-[#469B7E]" style="width:${rate}%"></div></div>
        <p class="text-sm text-slate-600 mt-4">${m.expiredOrNoSubMembers ?? 0} hội viên chưa có gói hoặc đã hết hạn — có thể liên hệ mời gia hạn.</p>
      </div>
    </div>`;
}

function classesTab(c, s) {
  if (!c) return emptyState('Không tải được báo cáo lớp học', 'calendar');
  const details = c.classDetails || [];
  const page = paginate(details, s.pageNo, s.pageSize);
  return html`
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      ${statCard('Lớp đang mở', c.totalOpeningClasses ?? 0, 'calendar-days', 'emerald')}
      ${statCard('Lượt đăng ký', c.totalRegistration ?? 0, 'user-check', 'sky')}
      ${statCard('Lượt hủy', c.totalCancellation ?? 0, 'user-minus', 'rose')}
      ${statCard('Lấp đầy trung bình', `${Number(c.averageOccupancyRate || 0).toFixed(1)}%`, 'gauge', 'amber')}
    </div>
    ${details.length ? html`
      <div class="card rounded-3xl p-5 mb-5">
        <div class="font-bold mb-4">Tỷ lệ lấp đầy theo lớp (%)</div>
        <div class="h-64"><canvas id="class-occ"></canvas></div>
      </div>
      <div class="card rounded-3xl" data-testid="class-report-table">
        ${table({
          columns: [{ label: 'Lớp' }, { label: 'HLV' }, { label: 'Phòng' }, { label: 'Đăng ký', cls: 'text-right' }, { label: 'Còn trống', cls: 'text-right' }, { label: 'Lấp đầy', cls: 'text-right' }, { label: 'Đánh giá' }],
          rows: page.content.map(d => [
            html`<b>${d.subjectName}</b> <span class="text-slate-400">#${d.classId}</span>`,
            d.coachName, d.roomName,
            `${d.registeredCnt}/${d.maxCapacity}`, d.availableSlots,
            `${Number(d.occupancyRate).toFixed(1)}%`,
            badge(d.status)
          ])
        })}${pagination(page, { unit: 'lớp' })}
      </div>` : emptyState('Chưa có lớp trong kỳ', 'calendar-x')}`;
}

function view(s) {
  return html`
    ${pageHeader('Báo cáo', `Từ ${date(s.from)} đến ${date(s.to)}`,
      html`<button type="button" class="btn-secondary" data-action="export" data-testid="export">${icon('download', 'w-4 h-4')} Xuất CSV</button>`)}
    <div class="card p-4 mb-5 flex flex-col lg:flex-row lg:items-end gap-3" data-testid="report-filter">
      <div class="flex flex-wrap gap-2">
        ${PRESETS.map(p => html`<button type="button" class="btn-sm ${s.preset === p.id ? 'btn bg-brand-dark text-white' : 'btn-secondary'}" data-action="preset" data-id="${p.id}">${p.label}</button>`)}
      </div>
      <form class="flex flex-wrap items-end gap-2 lg:ml-auto" data-action="apply-range">
        <label class="text-xs font-bold text-slate-600">Từ<input class="input mt-1" type="date" name="from" value="${s.from}" max="${s.to}" /></label>
        <label class="text-xs font-bold text-slate-600">Đến<input class="input mt-1" type="date" name="to" value="${s.to}" /></label>
        <button type="submit" class="btn-primary btn-sm">Áp dụng</button>
      </form>
    </div>
    ${tabs([{ id: 'revenue', label: 'Doanh thu' }, { id: 'members', label: 'Hội viên' }, { id: 'classes', label: 'Lớp học' }], s.tab)}
    ${s.tab === 'revenue' ? revenueTab(s.revenue) : s.tab === 'members' ? membersTab(s.members) : classesTab(s.classes, s)}`;
}

function draw(s, ctx) {
  const el = ctx.el;
  if (s.tab === 'revenue' && s.revenue) {
    drawChart(el, 'rev-line', revenueLine(series(s.revenue.revenueOvertime, s.from, s.to)));
    const pk = s.revenue.revenueByPackage || [];
    if (pk.length) drawChart(el, 'rev-package', doughnut(pk.map(p => p.categoryName), pk.map(p => Number(p.totalAmount))));
    const me = s.revenue.revenueByMethod || [];
    if (me.length) drawChart(el, 'rev-method', doughnut(me.map(p => paymentMethodLabel(p.categoryName)), me.map(p => Number(p.totalAmount))));
  }
  if (s.tab === 'members' && s.members) {
    drawChart(el, 'mem-status', doughnut(['Đang có gói', 'Hết hạn / chưa mua'],
      [s.members.activeSubscriptionMembers || 0, s.members.expiredOrNoSubMembers || 0], { formatter: v => `${v} hội viên` }));
  }
  if (s.tab === 'classes' && s.classes?.classDetails?.length) {
    const d = s.classes.classDetails;
    drawChart(el, 'class-occ', bars(d.map(x => `${x.subjectName} #${x.classId}`), d.map(x => Number(x.occupancyRate)), 'Lấp đầy', { max: 100 }));
  }
}

// CSV có BOM để Excel đọc đúng tiếng Việt
function downloadCsv(name, rows) {
  const text = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportRows(s) {
  if (s.tab === 'revenue' && s.revenue) {
    const r = s.revenue;
    return [
      ['Báo cáo doanh thu', `${s.from} → ${s.to}`], [],
      ['Tổng doanh thu', r.totalRevenue], ['Số giao dịch', r.totalTransactions], [],
      ['Ngày', 'Doanh thu'], ...(r.revenueOvertime || []).map(p => [p.timeLabel, p.value]), [],
      ['Gói tập', 'Giao dịch', 'Doanh thu', 'Tỷ trọng %'], ...(r.revenueByPackage || []).map(p => [p.categoryName, p.transactionCnt, p.totalAmount, p.percentage]), [],
      ['Phương thức', 'Giao dịch', 'Doanh thu', 'Tỷ trọng %'], ...(r.revenueByMethod || []).map(p => [paymentMethodLabel(p.categoryName), p.transactionCnt, p.totalAmount, p.percentage])
    ];
  }
  if (s.tab === 'members' && s.members) {
    const m = s.members;
    return [['Báo cáo hội viên', `${s.from} → ${s.to}`], [], ['Tổng hội viên', m.totalMembers], ['Mới trong kỳ', m.newMembersInRange],
      ['Đang có gói', m.activeSubscriptionMembers], ['Hết hạn / chưa mua', m.expiredOrNoSubMembers]];
  }
  if (s.tab === 'classes' && s.classes) {
    const c = s.classes;
    return [['Báo cáo lớp học', `${s.from} → ${s.to}`], [], ['Lớp đang mở', c.totalOpeningClasses], ['Lượt đăng ký', c.totalRegistration],
      ['Lượt hủy', c.totalCancellation], ['Lấp đầy TB %', c.averageOccupancyRate], [],
      ['Mã lớp', 'Bộ môn', 'HLV', 'Phòng', 'Sĩ số tối đa', 'Đã đăng ký', 'Còn trống', 'Lấp đầy %', 'Đánh giá'],
      ...(c.classDetails || []).map(d => [d.classId, d.subjectName, d.coachName, d.roomName, d.maxCapacity, d.registeredCnt, d.availableSlots, d.occupancyRate, statusLabel(d.status)])];
  }
  return null;
}

export default function ManagerReports(el) {
  const [f, t] = presetRange('30');
  return mountPage(el, {
    state: { tab: 'revenue', preset: '30', from: isoDate(f), to: isoDate(t), pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: ctx => {
      const { from, to } = ctx.state;
      return settle({
        revenue: [() => reportApi.revenue(from, to), null],
        members: [() => reportApi.members(from, to), null],
        classes: [() => reportApi.classes(from, to), null]
      });
    },
    view,
    afterRender: draw,
    actions: {
      tab: (btn, e, ctx) => ctx.set({ tab: btn.dataset.tab, pageNo: 0 }),
      ...pagerActions(),
      preset: (btn, e, ctx) => {
        const [a, b] = presetRange(btn.dataset.id);
        Object.assign(ctx.state, { preset: btn.dataset.id, from: isoDate(a), to: isoDate(b), pageNo: 0 });
        ctx.reload();
      },
      'apply-range': (form, e, ctx) => {
        const from = form.from.value;
        const to = form.to.value;
        if (!from || !to || from > to) { toast('Khoảng ngày không hợp lệ', 'warning'); return; }
        Object.assign(ctx.state, { preset: '', from, to, pageNo: 0 });
        ctx.reload();
      },
      export: (btn, e, ctx) => {
        const rows = exportRows(ctx.state);
        if (!rows) { toast('Chưa có dữ liệu để xuất', 'warning'); return; }
        downloadCsv(`bao-cao-${ctx.state.tab}-${ctx.state.from}_${ctx.state.to}.csv`, rows);
      }
    }
  });
}
