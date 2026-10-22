import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { reportApi, classApi } from '../../api/endpoints.js';
import { money, isoDate, date, timeRange, toDate, isToday, paymentMethodLabel, badge } from '../../core/format.js';
import { drawChart, revenueLine, doughnut, CHART_COLORS } from '../../components/charts.js';
import { subjectColor } from '../../components/classCard.js';
import { session } from '../../core/session.js';

// chuỗi ngày liên tục (ngày không có giao dịch = 0) để biểu đồ không bị gãy
function dailySeries(points, days) {
  const map = Object.fromEntries((points || []).map(p => [p.timeLabel, Number(p.value)]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push({ label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`, value: map[isoDate(d)] || 0 });
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

function view(s) {
  const o = s.overview || {};
  const rev = s.revenue || {};
  const cls = s.classReport || {};
  const now = new Date();
  const upcoming = (s.classes || []).filter(c => toDate(c.endTime) >= now).sort((a, b) => toDate(a.startTime) - toDate(b.startTime)).slice(0, 5);
  const methods = rev.revenueByMethod || [];
  return html`
    ${pageHeader(`Xin chào, ${session.get()?.firstName || 'Quản lý'}!`, 'Tình hình trung tâm hôm nay',
      html`<a href="#/manager/reports" class="btn-primary">${icon('bar-chart-3', 'w-4 h-4')} Xem báo cáo</a>`)}

    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      ${kpi('Doanh thu tháng này', money(o.revenueThisMonth), 'wallet', 'bg-[#469B7E]/10 text-[#2F6B55]', growthTag(o.revenueGrowthRate))}
      ${kpi('Hội viên đang có gói', o.totalActiveMembers ?? 0, 'users', 'bg-sky-50 text-sky-600', html`<span class="text-slate-400">trên tổng ${s.memberReport?.totalMembers ?? '—'} hội viên</span>`)}
      ${kpi('Hội viên mới tháng này', o.newMembersThisMonth ?? 0, 'user-plus', 'bg-amber-50 text-amber-600', html`<span class="text-slate-400">tài khoản đăng ký mới</span>`)}
      ${kpi('Lớp hôm nay', o.classesToday ?? 0, 'calendar-days', 'bg-violet-50 text-violet-600', html`<span class="text-slate-400">${cls.totalOpeningClasses ?? 0} lớp đang mở đăng ký</span>`)}
    </div>

    <div class="grid xl:grid-cols-3 gap-5 mb-6">
      <div class="card rounded-3xl p-5 xl:col-span-2 min-w-0">
        <div class="flex items-center justify-between mb-4">
          <div><div class="font-bold">Doanh thu 30 ngày</div><div class="text-xs text-slate-500">Tổng ${money(rev.totalRevenue)} · ${rev.totalTransactions ?? 0} giao dịch</div></div>
        </div>
        <div class="h-64"><canvas id="revenue-chart" data-testid="revenue-chart"></canvas></div>
      </div>
      <div class="card rounded-3xl p-5 min-w-0">
        <div class="font-bold mb-4">Theo phương thức</div>
        ${methods.length ? html`
          <div class="space-y-3">
            ${methods.map((m, i) => html`
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style="background:${CHART_COLORS[i % CHART_COLORS.length]}">${Math.round(m.percentage)}%</span>
                <div class="flex-1 min-w-0"><div class="text-sm font-semibold">${paymentMethodLabel(m.categoryName)}</div><div class="text-xs text-slate-500">${m.transactionCnt} giao dịch</div></div>
                <div class="text-sm font-extrabold">${money(m.totalAmount)}</div>
              </div>`)}
          </div>
          <div class="font-bold mt-6 mb-2">Theo gói tập</div>
          <div class="h-44"><canvas id="package-chart"></canvas></div>` : emptyState('Chưa có giao dịch', 'wallet')}
      </div>
    </div>

    <div class="grid xl:grid-cols-2 gap-5">
      <div class="card rounded-3xl min-w-0">
        <div class="flex items-center justify-between px-5 pt-5 pb-3">
          <div class="font-bold">Lớp sắp diễn ra</div>
          <a href="#/manager/classes" class="text-xs font-bold text-[#2F6B55] hover:underline">Quản lý lớp</a>
        </div>
        ${upcoming.length ? html`
          <div class="divide-y divide-slate-100">
            ${upcoming.map(c => html`
              <div class="flex items-center gap-3 px-5 py-3">
                <span class="w-1.5 h-10 rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm">${c.subjectName} ${isToday(c.startTime) ? html`<span class="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Hôm nay</span>` : ''}</div>
                  <div class="text-xs text-slate-500">${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.coachName}</div>
                </div>
                <div class="text-sm font-bold">${c.currentEnrolled}/${c.maxCapacity}</div>
              </div>`)}
          </div>` : html`<div class="px-5 pb-5">${emptyState('Không có lớp sắp tới', 'calendar-x')}</div>`}
      </div>
      <div class="card rounded-3xl min-w-0">
        <div class="flex items-center justify-between px-5 pt-5 pb-3">
          <div class="font-bold">Lớp cần chú ý</div>
          <span class="text-xs text-slate-500">Lấp đầy TB ${Number(cls.averageOccupancyRate || 0).toFixed(1)}%</span>
        </div>
        ${(cls.classDetails || []).length ? html`
          <div class="divide-y divide-slate-100">
            ${[...cls.classDetails].sort((a, b) => a.occupancyRate - b.occupancyRate).slice(0, 5).map(c => html`
              <div class="flex items-center gap-3 px-5 py-3">
                <div class="flex-1 min-w-0"><div class="font-semibold text-sm">${c.subjectName} <span class="text-slate-400 font-normal">#${c.classId}</span></div><div class="text-xs text-slate-500">${c.coachName} · ${c.roomName}</div></div>
                <div class="w-28"><div class="text-xs font-semibold text-right mb-1">${c.registeredCnt}/${c.maxCapacity}</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full ${c.status === 'LOW_ATTENDANCE' ? 'bg-amber-500' : c.status === 'FULL' ? 'bg-rose-500' : 'bg-[#469B7E]'}" style="width:${Math.min(c.occupancyRate, 100)}%"></div></div></div>
                ${badge(c.status)}
              </div>`)}
          </div>` : html`<div class="px-5 pb-5">${emptyState('Chưa có lớp', 'calendar')}</div>`}
      </div>
    </div>`;
}

export default function ManagerDashboard(el) {
  const from = isoDate(new Date(Date.now() - 29 * 86400000));
  const to = isoDate(new Date());
  return mountPage(el, {
    load: () => settle({
      overview: [() => reportApi.overview(), {}],
      revenue: [() => reportApi.revenue(from, to), {}],
      classReport: [() => reportApi.classes(), {}],
      memberReport: [() => reportApi.members(), {}],
      classes: [() => classApi.list(), []]
    }),
    view,
    afterRender: (s, ctx) => {
      if (!s.revenue) return;
      drawChart(ctx.el, 'revenue-chart', revenueLine(dailySeries(s.revenue.revenueOvertime, 30)));
      const pk = s.revenue.revenueByPackage || [];
      if (pk.length) drawChart(ctx.el, 'package-chart', doughnut(pk.map(p => p.categoryName), pk.map(p => Number(p.totalAmount))));
    }
  });
}
