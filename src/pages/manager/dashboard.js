import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, statCard, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { reportApi, classApi } from '../../api/endpoints.js';
import { money, isoDate, date, timeRange, toDate, isToday, badge, statusLabel } from '../../core/format.js';
import { drawChart, revenueLine, doughnut, bars, CHART_COLORS } from '../../components/charts.js';
import { subjectColor } from '../../components/classCard.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';
import { session } from '../../core/session.js';

// Tổng quan = KPI hiện tại + báo cáo (doanh thu / hội viên / lớp học) theo khoảng tháng
const PRESETS = [
  { id: '3', label: '3 tháng' },
  { id: '6', label: '6 tháng' },
  { id: '12', label: '12 tháng' },
  { id: 'year', label: 'Năm nay' }
];

const pad = n => String(n).padStart(2, '0');
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const monthText = key => `${key.slice(5, 7)}/${key.slice(0, 4)}`;

function presetMonths(id) {
  const now = new Date();
  const start = id === 'year' ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), now.getMonth() - (Number(id) - 1), 1);
  return [monthKey(start), monthKey(now)];
}

// yyyy-MM -> [ngày đầu tháng, ngày cuối tháng (không quá hôm nay)]
function monthRange(fromMonth, toMonth) {
  const [fy, fm] = fromMonth.split('-').map(Number);
  const [ty, tm] = toMonth.split('-').map(Number);
  const end = new Date(ty, tm, 0);
  const today = new Date();
  return [isoDate(new Date(fy, fm - 1, 1)), isoDate(end > today ? today : end)];
}

// BE trả doanh thu theo ngày (yyyy-MM-dd) -> cộng dồn theo tháng, tháng không có giao dịch = 0
function monthlySeries(points, fromMonth, toMonth) {
  const map = {};
  (points || []).forEach(p => {
    const key = String(p.timeLabel).slice(0, 7);
    map[key] = (map[key] || 0) + Number(p.value);
  });
  const out = [];
  const [ty, tm] = toMonth.split('-').map(Number);
  for (let d = new Date(`${fromMonth}-01T00:00:00`); d <= new Date(ty, tm - 1, 1); d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    out.push({ label: monthText(monthKey(d)), value: map[monthKey(d)] || 0 });
  }
  return out;
}

function kpi(label, value, iconName, tint, sub = '') {
  return html`
    <div class="card rounded-3xl p-5 min-w-0" data-testid="kpi">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-500">${label}</span>
        <span class="w-9 h-9 rounded-xl ${tint} flex items-center justify-center">${icon(iconName, 'w-4 h-4')}</span>
      </div>
      <div class="text-2xl font-extrabold text-slate-900 mt-3 truncate">${value}</div>
      ${sub ? html`<div class="text-xs mt-1">${sub}</div>` : ''}
    </div>`;
}

function growthTag(rate) {
  const r = Number(rate || 0);
  const up = r >= 0;
  return html`<span class="inline-flex items-center gap-1 font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}">${icon(up ? 'trending-up' : 'trending-down', 'w-3.5 h-3.5')} ${up ? '+' : ''}${r.toFixed(1)}%</span> <span class="text-slate-400">so với tháng trước</span>`;
}

function breakdownTable(rows) {
  return table({
    columns: [{ label: 'Gói tập' }, { label: 'Giao dịch', cls: 'text-right' }, { label: 'Doanh thu', cls: 'text-right' }, { label: 'Tỷ trọng', cls: 'w-40' }],
    rows: rows.map((r, i) => [
      html`<span class="inline-flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${r.categoryName}</span>`,
      r.transactionCnt,
      html`<b>${money(r.totalAmount)}</b>`,
      html`<div class="flex items-center gap-2"><div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${r.percentage}%"></div></div><span class="text-xs font-semibold w-12 text-right">${Number(r.percentage).toFixed(1)}%</span></div>`
    ])
  });
}

function revenueTab(s) {
  const r = s.revenue;
  if (!r) return emptyState('Không tải được báo cáo doanh thu', 'wallet');
  const avg = r.totalTransactions ? r.totalRevenue / r.totalTransactions : 0;
  const lastMonth = s.revenueLastMonth || {};
  const packages = lastMonth.revenueByPackage || [];
  return html`
    <div class="grid sm:grid-cols-3 gap-4 mb-5">
      ${statCard('Tổng doanh thu', money(r.totalRevenue), 'wallet', 'emerald')}
      ${statCard('Số giao dịch', r.totalTransactions ?? 0, 'receipt', 'sky')}
      ${statCard('Trung bình / giao dịch', money(Math.round(avg)), 'calculator', 'amber')}
    </div>
    <div class="grid xl:grid-cols-3 gap-5 mb-5">
      <div class="card rounded-3xl p-5 xl:col-span-2 min-w-0">
        <div class="font-bold">Doanh thu theo tháng</div>
        <div class="text-xs text-slate-500 mb-4">${monthText(s.fromMonth)} – ${monthText(s.toMonth)}</div>
        <div class="h-64"><canvas id="revenue-chart" data-testid="revenue-chart"></canvas></div>
      </div>
      <div class="card rounded-3xl p-5 min-w-0">
        <div class="font-bold">Theo gói tập</div>
        <div class="text-xs text-slate-500 mb-4">Tháng ${monthText(s.toMonth)} · ${money(lastMonth.totalRevenue)}</div>
        ${packages.length ? html`<div class="h-56"><canvas id="package-chart"></canvas></div>` : emptyState('Chưa có giao dịch trong tháng', 'wallet')}
      </div>
    </div>
    <div class="card rounded-3xl min-w-0">
      <div class="px-5 pt-5 pb-2 font-bold">Doanh thu theo gói tập (${monthText(s.fromMonth)} – ${monthText(s.toMonth)})</div>
      ${r.revenueByPackage?.length ? breakdownTable(r.revenueByPackage) : emptyState('Chưa có dữ liệu', 'package')}
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

function upcomingCard(list) {
  return html`
    <div class="card rounded-3xl min-w-0">
      <div class="flex items-center justify-between px-5 pt-5 pb-3">
        <div class="font-bold">Lớp sắp diễn ra</div>
        <a href="#/manager/classes" class="text-xs font-bold text-[#2F6B55] hover:underline">Quản lý lớp</a>
      </div>
      ${list.length ? html`
        <div class="divide-y divide-slate-100">
          ${list.map(c => html`
            <div class="flex items-center gap-3 px-5 py-3">
              <span class="w-1.5 h-10 rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm">${c.subjectName} ${isToday(c.startTime) ? html`<span class="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Hôm nay</span>` : ''}</div>
                <div class="text-xs text-slate-500">${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.coachName}</div>
              </div>
              <div class="text-sm font-bold">${c.currentEnrolled}/${c.maxCapacity}</div>
            </div>`)}
        </div>` : html`<div class="px-5 pb-5">${emptyState('Không có lớp sắp tới', 'calendar-x')}</div>`}
    </div>`;
}

function classesTab(s) {
  const c = s.classReport;
  if (!c) return emptyState('Không tải được báo cáo lớp học', 'calendar');
  const now = new Date();
  const upcoming = (s.classes || []).filter(x => x.status === 'OPENING' && toDate(x.endTime) >= now).sort((a, b) => toDate(a.startTime) - toDate(b.startTime)).slice(0, 5);
  // lớp lấp đầy thấp lên đầu để dễ chú ý
  const details = [...(c.classDetails || [])].sort((a, b) => a.occupancyRate - b.occupancyRate);
  const page = paginate(details, s.pageNo, s.pageSize);
  return html`
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      ${statCard('Lớp đang mở', c.totalOpeningClasses ?? 0, 'calendar-days', 'emerald')}
      ${statCard('Lượt đăng ký', c.totalRegistration ?? 0, 'user-check', 'sky')}
      ${statCard('Lượt hủy', c.totalCancellation ?? 0, 'user-minus', 'rose')}
      ${statCard('Lấp đầy trung bình', `${Number(c.averageOccupancyRate || 0).toFixed(1)}%`, 'gauge', 'amber')}
    </div>
    <div class="grid xl:grid-cols-3 gap-5 mb-5">
      <div class="card rounded-3xl p-5 xl:col-span-2 min-w-0">
        <div class="font-bold mb-4">Tỷ lệ lấp đầy theo lớp (%)</div>
        ${details.length ? html`<div class="h-64"><canvas id="class-occ"></canvas></div>` : emptyState('Chưa có lớp trong kỳ', 'calendar-x')}
      </div>
      ${upcomingCard(upcoming)}
    </div>
    ${details.length ? html`
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
      </div>` : ''}`;
}

function view(s) {
  const o = s.overview || {};
  const current = monthKey(new Date());
  return html`
    ${pageHeader(`Xin chào, ${session.get()?.firstName || 'Quản lý'}!`, 'Tình hình trung tâm',
      html`<button type="button" class="btn-secondary" data-action="export" data-testid="export">${icon('download', 'w-4 h-4')} Xuất CSV</button>`)}

    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      ${kpi('Doanh thu tháng này', money(o.revenueThisMonth), 'wallet', 'bg-brand-dark text-brand-lime', growthTag(o.revenueGrowthRate))}
      ${kpi('Hội viên đang có gói', o.totalActiveMembers ?? 0, 'users', 'bg-brand-sand text-brand-deep', html`<span class="text-slate-400">trên tổng ${s.members?.totalMembers ?? '—'} hội viên</span>`)}
      ${kpi('Hội viên mới tháng này', o.newMembersThisMonth ?? 0, 'user-plus', 'bg-amber-50 text-amber-600', html`<span class="text-slate-400">tài khoản đăng ký mới</span>`)}
      ${kpi('Lớp hôm nay', o.classesToday ?? 0, 'calendar-days', 'bg-brand-sand text-brand-deep', html`<span class="text-slate-400">${s.classReport?.totalOpeningClasses ?? 0} lớp đang mở đăng ký</span>`)}
    </div>

    <div class="card p-4 mb-5 flex flex-col lg:flex-row lg:items-end gap-3" data-testid="report-filter">
      <div class="flex flex-wrap gap-2">
        ${PRESETS.map(p => html`<button type="button" class="btn-sm ${s.preset === p.id ? 'btn bg-brand-dark text-white' : 'btn-secondary'}" data-action="preset" data-id="${p.id}">${p.label}</button>`)}
      </div>
      <form class="flex flex-wrap items-end gap-2 lg:ml-auto" data-action="apply-range">
        <label class="text-xs font-bold text-slate-600">Từ tháng<input class="input mt-1" type="month" name="from" value="${s.fromMonth}" max="${s.toMonth}" /></label>
        <label class="text-xs font-bold text-slate-600">Đến tháng<input class="input mt-1" type="month" name="to" value="${s.toMonth}" max="${current}" /></label>
        <button type="submit" class="btn-primary btn-sm">Áp dụng</button>
      </form>
    </div>
    ${tabs([{ id: 'revenue', label: 'Doanh thu' }, { id: 'members', label: 'Hội viên' }, { id: 'classes', label: 'Lớp học' }], s.tab)}
    ${s.tab === 'revenue' ? revenueTab(s) : s.tab === 'members' ? membersTab(s.members) : classesTab(s)}`;
}

function draw(s, ctx) {
  const el = ctx.el;
  if (s.tab === 'revenue' && s.revenue) {
    drawChart(el, 'revenue-chart', revenueLine(monthlySeries(s.revenue.revenueOvertime, s.fromMonth, s.toMonth)));
    const pk = s.revenueLastMonth?.revenueByPackage || [];
    if (pk.length) drawChart(el, 'package-chart', doughnut(pk.map(p => p.categoryName), pk.map(p => Number(p.totalAmount))));
  }
  if (s.tab === 'members' && s.members) {
    drawChart(el, 'mem-status', doughnut(['Đang có gói', 'Hết hạn / chưa mua'],
      [s.members.activeSubscriptionMembers || 0, s.members.expiredOrNoSubMembers || 0], { formatter: v => `${v} hội viên` }));
  }
  if (s.tab === 'classes' && s.classReport?.classDetails?.length) {
    const d = s.classReport.classDetails;
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
  const period = `${monthText(s.fromMonth)} → ${monthText(s.toMonth)}`;
  if (s.tab === 'revenue' && s.revenue) {
    const r = s.revenue;
    return [
      ['Báo cáo doanh thu', period], [],
      ['Tổng doanh thu', r.totalRevenue], ['Số giao dịch', r.totalTransactions], [],
      ['Tháng', 'Doanh thu'], ...monthlySeries(r.revenueOvertime, s.fromMonth, s.toMonth).map(p => [p.label, p.value]), [],
      ['Gói tập', 'Giao dịch', 'Doanh thu', 'Tỷ trọng %'], ...(r.revenueByPackage || []).map(p => [p.categoryName, p.transactionCnt, p.totalAmount, p.percentage])
    ];
  }
  if (s.tab === 'members' && s.members) {
    const m = s.members;
    return [['Báo cáo hội viên', period], [], ['Tổng hội viên', m.totalMembers], ['Mới trong kỳ', m.newMembersInRange],
      ['Đang có gói', m.activeSubscriptionMembers], ['Hết hạn / chưa mua', m.expiredOrNoSubMembers]];
  }
  if (s.tab === 'classes' && s.classReport) {
    const c = s.classReport;
    return [['Báo cáo lớp học', period], [], ['Lớp đang mở', c.totalOpeningClasses], ['Lượt đăng ký', c.totalRegistration],
      ['Lượt hủy', c.totalCancellation], ['Lấp đầy TB %', c.averageOccupancyRate], [],
      ['Mã lớp', 'Bộ môn', 'HLV', 'Phòng', 'Sĩ số tối đa', 'Đã đăng ký', 'Còn trống', 'Lấp đầy %', 'Đánh giá'],
      ...(c.classDetails || []).map(d => [d.classId, d.subjectName, d.coachName, d.roomName, d.maxCapacity, d.registeredCnt, d.availableSlots, d.occupancyRate, statusLabel(d.status)])];
  }
  return null;
}

export default function ManagerDashboard(el) {
  const [fromMonth, toMonth] = presetMonths('12');
  return mountPage(el, {
    state: { tab: 'revenue', preset: '12', fromMonth, toMonth, pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: ctx => {
      const [from, to] = monthRange(ctx.state.fromMonth, ctx.state.toMonth);
      const [lastFrom, lastTo] = monthRange(ctx.state.toMonth, ctx.state.toMonth);
      return settle({
        overview: [() => reportApi.overview(), {}],
        revenue: [() => reportApi.revenue(from, to), null],
        revenueLastMonth: [() => reportApi.revenue(lastFrom, lastTo), null],
        members: [() => reportApi.members(from, to), null],
        classReport: [() => reportApi.classes(from, to), null],
        classes: [() => classApi.list(), []]
      });
    },
    view,
    afterRender: draw,
    actions: {
      tab: (btn, e, ctx) => ctx.set({ tab: btn.dataset.tab, pageNo: 0 }),
      ...pagerActions(),
      preset: (btn, e, ctx) => {
        const [a, b] = presetMonths(btn.dataset.id);
        Object.assign(ctx.state, { preset: btn.dataset.id, fromMonth: a, toMonth: b, pageNo: 0 });
        ctx.reload();
      },
      'apply-range': (form, e, ctx) => {
        const from = form.from.value;
        const to = form.to.value;
        if (!from || !to || from > to) { toast('Khoảng tháng không hợp lệ', 'warning'); return; }
        Object.assign(ctx.state, { preset: '', fromMonth: from, toMonth: to, pageNo: 0 });
        ctx.reload();
      },
      export: (btn, e, ctx) => {
        const rows = exportRows(ctx.state);
        if (!rows) { toast('Chưa có dữ liệu để xuất', 'warning'); return; }
        downloadCsv(`tong-quan-${ctx.state.tab}-${ctx.state.fromMonth}_${ctx.state.toMonth}.csv`, rows);
      }
    }
  });
}
