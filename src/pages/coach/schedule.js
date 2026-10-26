import { html, icon } from '../../core/dom.js';
import { pageHeader, statCard, tabs, emptyState, openModal } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { coachApi } from '../../api/endpoints.js';
import { badge, date, weekday, timeRange, toDate, isToday, isoDate } from '../../core/format.js';
import { subjectColor, classImage } from '../../components/classCard.js';
import { calendarGrid, calendarToolbar, viewModeTabs, scrollTimeGrid } from '../../components/classCalendar.js';

// Lịch dạy của HLV: xem dạng lịch Tuần (khung giờ) / Tháng như Hội viên & Quản lý, hoặc Danh sách theo tab.
// GET /coaches/me/schedules trả toàn bộ lớp của HLV -> lịch chỉ lọc theo ngày ở FE, không gọi thêm API.
const MODE_KEY = 'sc_coach_schedule_mode';
const savedMode = () => { try { return localStorage.getItem(MODE_KEY); } catch { return null; } };
const COACH_LEGEND = [['open', 'Sắp dạy'], ['done', 'Đã dạy']];
// màu thẻ trên lịch: chưa kết thúc = sắp dạy, đã kết thúc = đã dạy
const stateOf = c => (toDate(c.endTime) < new Date() ? 'done' : 'open');

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

function classRow(c) {
  const cancelled = c.status === 'CANCELLED';
  const ended = !cancelled && toDate(c.endTime) < new Date();
  const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
  return html`
    <a href="#/coach/classes/${c.classId}" data-testid="coach-class" class="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${ended || cancelled ? 'opacity-70' : ''}">
      <div class="w-16 shrink-0 text-center rounded-2xl bg-gradient-to-br ${subjectColor(c.subjectName)} text-white py-2">
        <div class="text-[10px] font-bold uppercase opacity-90">${weekday(c.startTime)}</div>
        <div class="text-lg font-black leading-tight">${date(c.startTime).slice(0, 5)}</div>
      </div>
      <div class="w-20 h-16 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100">${classImage(c)}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-slate-900">${c.subjectName}</span>
          ${isToday(c.startTime) ? html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Hôm nay</span>` : ''}
          ${cancelled ? badge('CLASS_CANCELLED') : ended ? html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Đã kết thúc</span>` : badge(c.status)}
        </div>
        <div class="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span class="flex items-center gap-1">${icon('clock', 'w-3.5 h-3.5')} ${timeRange(c.startTime, c.endTime)}</span>
          <span class="flex items-center gap-1">${icon('map-pin', 'w-3.5 h-3.5')} ${c.roomName}</span>
        </div>
      </div>
      <div class="hidden sm:block w-40">
        <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Học viên</span><b class="text-slate-700">${c.currentEnrolled}/${c.maxCapacity}</b></div>
        <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${pct}%"></div></div>
      </div>
      ${icon('chevron-right', 'w-5 h-5 text-slate-300 shrink-0')}
    </a>`;
}

function listView(s, { upcoming, past, sorted }) {
  const list = s.tab === 'UPCOMING' ? upcoming : s.tab === 'PAST' ? past : sorted;
  return html`
    ${tabs([
      { id: 'UPCOMING', label: 'Sắp tới', count: upcoming.length },
      { id: 'PAST', label: 'Đã dạy', count: past.length },
      { id: 'ALL', label: 'Tất cả', count: sorted.length }
    ], s.tab)}
    ${list.length
      ? html`<div class="space-y-3" data-testid="coach-schedule">${list.map(classRow)}</div>`
      : emptyState(s.tab === 'PAST' ? 'Chưa có lớp nào đã dạy' : 'Chưa có lớp sắp tới', 'calendar-x')}`;
}

function calendarView(s, active) {
  return html`
    ${calendarToolbar(s)}
    ${calendarGrid(s, active, { stateOf, legend: COACH_LEGEND })}`;
}

function view(s) {
  const now = new Date();
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const sorted = [...s.classes].sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
  // lớp bị Quản lý hủy không tính là lớp sắp dạy / đã dạy, chỉ còn ở tab Tất cả
  const active = sorted.filter(c => c.status !== 'CANCELLED');
  const upcoming = active.filter(c => toDate(c.endTime) >= now);
  const past = active.filter(c => toDate(c.endTime) < now).reverse();
  const today = active.filter(c => isToday(c.startTime));
  const thisWeek = active.filter(c => toDate(c.startTime) >= weekStart && toDate(c.startTime) < weekEnd);
  const students = active.reduce((n, c) => n + (c.currentEnrolled || 0), 0);

  return html`
    ${pageHeader('Lịch dạy', 'Các lớp bạn phụ trách, bấm vào lớp để điểm danh và giao giáo án', viewModeTabs(s.mode))}
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${statCard('Lớp hôm nay', today.length, 'sun', 'amber')}
      ${statCard('Lớp tuần này', thisWeek.length, 'calendar-range', 'emerald')}
      ${statCard('Lớp sắp tới', upcoming.length, 'calendar-clock', 'sky')}
      ${statCard('Lượt học viên', students, 'users', 'violet')}
    </div>
    ${s.mode === 'list' ? listView(s, { upcoming, past, sorted }) : calendarView(s, active)}`;
}

// danh sách các buổi trong 1 ngày (bấm "+N lớp" hoặc bấm ô ngày trên điện thoại); bấm buổi -> trang chi tiết lớp
function openDay(list) {
  const modal = openModal({
    title: `Lớp ngày ${date(list[0].startTime)}`,
    size: 'max-w-2xl',
    body: html`<div class="space-y-3 max-h-[70vh] overflow-y-auto" data-testid="coach-day">${list.map(classRow)}</div>`
  });
  modal.el.addEventListener('click', e => { if (e.target.closest('a[href^="#/coach/classes/"]')) modal.close(); });
}

export default function CoachSchedule(el) {
  return mountPage(el, {
    state: { tab: 'UPCOMING', mode: ['week', 'month', 'list'].includes(savedMode()) ? savedMode() : 'week', calOffset: 0, classes: [] },
    load: async () => ({ classes: await coachApi.schedules() }),
    view,
    afterRender: (st, ctx) => scrollTimeGrid(ctx.el),
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'view-mode': (t, e, ctx) => {
        const mode = t.dataset.mode;
        if (mode === ctx.state.mode) return;
        try { localStorage.setItem(MODE_KEY, mode); } catch { /* bỏ qua */ }
        ctx.set({ mode, calOffset: 0 });
      },
      'cal-nav': (t, e, ctx) => {
        const d = Number(t.dataset.delta);
        ctx.set({ calOffset: d === 0 ? 0 : ctx.state.calOffset + d });
      },
      // bấm thẻ lớp trên lịch: vào thẳng trang điểm danh / giáo án của lớp
      'cal-class': t => { location.hash = `#/coach/classes/${t.dataset.id}`; },
      'cal-day': (t, e, ctx) => {
        const list = ctx.state.classes
          .filter(c => c.status !== 'CANCELLED' && isoDate(toDate(c.startTime)) === t.dataset.date)
          .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
        if (list.length) openDay(list);
      }
    }
  });
}
