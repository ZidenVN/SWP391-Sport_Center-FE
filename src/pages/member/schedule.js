import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, confirmDialog, withBusy, toast, openModal } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { date, weekday, timeRange, dateTime, badge, isFuture, toDate, time, isoDate } from '../../core/format.js';
import { coachLink, openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { FEATURES } from '../../core/features.js';
import { classImage } from '../../components/classCard.js';
import { calendarGrid, calendarToolbar, viewModeTabs, scrollTimeGrid, whenLine } from '../../components/classCalendar.js';

// Lịch tập của hội viên: lịch Tuần (khung giờ) / Tháng các buổi đã đăng ký, hoặc Danh sách theo tab như cũ.
const MODE_KEY = 'sc_member_schedule_mode';
const savedMode = () => { try { return localStorage.getItem(MODE_KEY); } catch { return null; } };
const SCHEDULE_LEGEND = [['registered', 'Sắp học'], ['done', 'Đã học']];
// các buổi lên lịch: mọi đăng ký trừ buổi đã hủy
const calendarItems = s => s.registrations.filter(r => r.status !== 'CANCELLED');
const stateOf = r => (toDate(r.endTime) < new Date() ? 'done' : 'registered');

function cancelButton(r) {
  if (r.status !== 'REGISTERED' || !isFuture(r.startTime)) return '';
  return html`<button type="button" class="btn-secondary btn-sm" data-action="cancel-booking" data-id="${r.registrationId}">Hủy</button>`;
}

function upcomingView(list) {
  if (!list.length) {
    return html`${emptyState('Bạn chưa có lịch tập sắp tới', 'calendar')}
      <div class="text-center"><a href="#/member/classes" class="btn-primary btn-sm">Tìm lớp học</a></div>`;
  }
  // nhóm theo ngày
  const groups = new Map();
  list.forEach(r => {
    const key = date(r.startTime);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });
  return html`
    <div class="space-y-6" data-testid="upcoming-list">
      ${[...groups.entries()].map(([day, items]) => html`
        <div>
          <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">${weekday(items[0].startTime)}, ${day}</div>
          <div class="space-y-3">
            ${items.map(r => html`
              <div class="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div class="w-20 h-16 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100">${classImage(r)}</div>
                <div class="w-20 shrink-0 text-center rounded-xl bg-emerald-50 text-emerald-700 py-2 hidden sm:block">
                  <div class="text-sm font-extrabold">${timeRange(r.startTime, r.endTime).split(' – ')[0]}</div>
                  <div class="text-[11px]">${timeRange(r.startTime, r.endTime).split(' – ')[1]}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold">${r.subjectName}</div>
                  <div class="text-xs text-slate-500 flex flex-wrap gap-x-3">
                    <span class="flex items-center gap-1">${icon('map-pin', 'w-3.5 h-3.5')} ${r.roomName}</span>
                    <span class="flex items-center gap-1">${icon('user-round', 'w-3.5 h-3.5')} ${coachLink(r)}</span>
                  </div>
                </div>
                ${cancelButton(r)}
              </div>`)}
          </div>
        </div>`)}
    </div>`;
}

// Kết quả HLV điểm danh (GET /members/me/attendances, ghép theo classId); buổi đã qua mà chưa có thì ghi "Chưa điểm danh"
function attendanceCell(r, att) {
  if (att) {
    return html`${badge(att.status, att.statusDescription)}${att.note ? html`<div class="text-[11px] text-slate-400 mt-0.5 max-w-[12rem] truncate" title="${att.note}">${att.note}</div>` : ''}`;
  }
  if (r.status === 'REGISTERED' && !isFuture(r.startTime)) return html`<span class="text-xs text-slate-400">Chưa điểm danh</span>`;
  return html`<span class="text-xs text-slate-300">—</span>`;
}

function attendanceSummary(list) {
  const n = st => list.filter(a => a.status === st).length;
  const marked = list.length;
  if (!marked) return '';
  const rate = Math.round(((n('PRESENT') + n('LATE')) / marked) * 100);
  return html`
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5" data-testid="attendance-summary">
      ${[['Có mặt', n('PRESENT'), 'text-emerald-700'], ['Đến muộn', n('LATE'), 'text-amber-600'], ['Vắng', n('ABSENT'), 'text-rose-600'], ['Nghỉ phép', n('ON_LEAVE'), 'text-sky-600'], ['Chuyên cần', `${rate}%`, 'text-brand-dark']]
        .map(([label, value, cls]) => html`<div class="card p-4 text-center"><div class="font-display text-3xl font-extrabold ${cls}">${value}</div><div class="text-xs text-slate-500 mt-0.5">${label}</div></div>`)}
    </div>`;
}

// Tab Điểm danh: từng buổi HLV đã điểm danh, mới nhất trước
function attendanceView(list) {
  const rows = [...list].sort((a, b) => toDate(b.startTime) - toDate(a.startTime));
  return html`
    ${attendanceSummary(list)}
    <div class="card" data-testid="attendance-table">
      ${table({
        columns: [{ label: 'Buổi học' }, { label: 'Thời gian' }, { label: 'Phòng' }, { label: 'Điểm danh' }, { label: 'Ghi chú' }],
        rows: rows.map(a => [
          html`<div class="font-semibold">${a.subjectName}</div><div class="text-xs text-slate-500">HLV ${a.coachName}</div>`,
          html`${weekday(a.startTime)}, ${date(a.startTime)}<div class="text-xs text-slate-500">${timeRange(a.startTime, a.endTime)}</div>`,
          a.roomName,
          badge(a.status, a.statusDescription),
          html`<span class="text-sm text-slate-600">${a.note || '—'}</span>`
        ]),
        empty: 'Chưa có buổi nào được điểm danh'
      })}
    </div>`;
}

function historyView(list, attByClass) {
  return html`
    <div class="card" data-testid="history-table">
      ${table({
        columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'Phòng' }, { label: 'Đăng ký' }, { label: 'Điểm danh' }, { label: 'Đăng ký lúc' }, { label: '', cls: 'text-right' }],
        rows: list.map(r => [
          html`<div class="flex items-center gap-3"><div class="w-14 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-100">${classImage(r)}</div><div><div class="font-semibold">${r.subjectName}</div><div class="text-xs text-slate-500">${coachLink(r)}</div></div></div>`,
          html`${date(r.startTime)}<div class="text-xs text-slate-500">${timeRange(r.startTime, r.endTime)}</div>`,
          r.roomName,
          badge(r.status),
          attendanceCell(r, attByClass.get(r.classId)),
          html`<span class="text-xs">${dateTime(r.registeredAt)}</span>${r.cancelledAt ? html`<div class="text-xs text-slate-400">Hủy: ${dateTime(r.cancelledAt)}</div>` : ''}`,
          cancelButton(r)
        ]),
        empty: 'Bạn chưa đăng ký lớp nào'
      })}
    </div>`;
}

// lượt đến trung tâm do lễ tân check-in
function visitsView(list) {
  return html`
    <div class="card" data-testid="visit-table">
      ${table({
        columns: [{ label: 'Ngày' }, { label: 'Giờ vào' }, { label: 'Lễ tân ghi nhận' }],
        rows: list.map(c => [html`<b>${weekday(c.checkInTime)}, ${date(c.checkInTime)}</b>`, time(c.checkInTime), c.receptionistName || '—']),
        empty: 'Bạn chưa check-in tại trung tâm lần nào'
      })}
    </div>`;
}

function listView(s, upcoming, history, attByClass) {
  const body = {
    upcoming: () => upcomingView(upcoming),
    history: () => historyView(history, attByClass),
    attendance: () => attendanceView(s.attendances),
    visits: () => visitsView(s.checkIns)
  }[s.tab]();
  return html`
    ${tabs([
      { id: 'upcoming', label: 'Sắp tới', count: upcoming.length },
      { id: 'history', label: 'Lịch sử đăng ký', count: history.length },
      { id: 'attendance', label: 'Điểm danh', count: s.attendances.length },
      // BE main chưa có lịch sử check-in của hội viên (FE-TODO #11)
      ...(FEATURES.checkInHistory ? [{ id: 'visits', label: 'Lượt đến', count: s.checkIns.length }] : [])
    ], s.tab)}
    ${body}`;
}

function calendarView(s, upcoming) {
  const items = calendarItems(s);
  return html`
    ${calendarToolbar(s)}
    <div class="text-sm text-slate-500 mb-4" data-testid="cal-summary">${upcoming.length} buổi sắp học · ${items.length - upcoming.length} buổi đã học</div>
    ${calendarGrid(s, items, { stateOf, legend: SCHEDULE_LEGEND })}`;
}

function view(s) {
  const upcoming = s.schedule
    .filter(r => r.status === 'REGISTERED')
    .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
  const history = [...s.registrations].sort((a, b) => toDate(b.startTime) - toDate(a.startTime));
  const attByClass = new Map(s.attendances.map(a => [a.classId, a]));
  return html`
    ${pageHeader('Lịch tập của tôi', 'Các lớp bạn đã đăng ký và lịch sử điểm danh', html`
      <div class="flex flex-wrap items-center gap-2">
        ${viewModeTabs(s.mode)}
        <a href="#/member/classes" class="btn-primary">${icon('plus', 'w-4 h-4')} Đặt thêm lớp</a>
      </div>`)}
    ${s.mode === 'list' ? listView(s, upcoming, history, attByClass) : calendarView(s, upcoming)}`;
}

// Chi tiết buổi học khi bấm trên lịch: ảnh, giờ, HLV, phòng, kết quả điểm danh, hủy nếu chưa diễn ra
function sessionDetail(r, att) {
  const st = stateOf(r);
  return html`
    <div class="rounded-2xl border border-brand-line overflow-hidden" data-testid="cal-detail" data-class-id="${r.classId}">
      <div class="h-36 sm:h-44 bg-slate-100">${classImage(r)}</div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${r.subjectName}</div>
            <div class="text-sm text-slate-500">${whenLine(r)}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${st === 'registered' ? 'bg-brand-dark text-brand-lime' : 'bg-emerald-100 text-emerald-700'}">${st === 'registered' ? 'Sắp học' : 'Đã học'}</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-slate-600">
          <div class="flex items-center gap-2">${icon('user-round', 'w-4 h-4 text-slate-400')} ${coachLink(r)}</div>
          <div class="flex items-center gap-2">${icon('map-pin', 'w-4 h-4 text-slate-400')} ${r.roomName}</div>
          <div class="flex items-center gap-2">${icon('clipboard-check', 'w-4 h-4 text-slate-400')} Điểm danh: ${attendanceCell(r, att)}</div>
          <div class="flex items-center gap-2 text-xs text-slate-500">${icon('clock', 'w-4 h-4 text-slate-400')} Đăng ký lúc ${dateTime(r.registeredAt)}</div>
        </div>
        ${cancelButton(r) ? html`<div class="flex justify-end mt-4 pt-4 border-t border-slate-100">${cancelButton(r)}</div>` : ''}
      </div>
    </div>`;
}

function openSessions(ctx, list, title) {
  const attByClass = new Map(ctx.state.attendances.map(a => [a.classId, a]));
  const modal = openModal({
    title,
    size: 'max-w-xl',
    body: html`<div class="space-y-3 max-h-[70vh] overflow-y-auto">${list.map(r => sessionDetail(r, attByClass.get(r.classId)))}</div>`,
    actions: {
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      'cancel-booking': async btn => { if (await cancelBooking(btn, ctx)) modal.close(); }
    }
  });
}

async function cancelBooking(btn, ctx) {
  const ok = await confirmDialog('Bạn chắc chắn muốn hủy đăng ký lớp này?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true });
  if (!ok) return false;
  const res = await withBusy(btn, () => memberApi.cancel(btn.dataset.id));
  if (!res) return false;
  toast('Đã hủy đăng ký lớp');
  ctx.reload();
  return true;
}

export default function MemberSchedule(el) {
  return mountPage(el, {
    state: { tab: 'upcoming', mode: ['week', 'month', 'list'].includes(savedMode()) ? savedMode() : 'week', calOffset: 0 },
    load: () => settle({
      schedule: [memberApi.schedule, []],
      registrations: [memberApi.registrations, []],
      attendances: [memberApi.attendances, []],
      checkIns: [() => (FEATURES.checkInHistory ? memberApi.checkIns() : []), []]
    }),
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
      'cal-class': (t, e, ctx) => {
        const r = calendarItems(ctx.state).find(x => String(x.classId) === t.dataset.id);
        if (r) openSessions(ctx, [r], 'Chi tiết buổi học');
      },
      'cal-day': (t, e, ctx) => {
        const list = calendarItems(ctx.state)
          .filter(r => isoDate(toDate(r.startTime)) === t.dataset.date)
          .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
        if (list.length) openSessions(ctx, list, `Buổi học ngày ${date(list[0].startTime)}`);
      },
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      'cancel-booking': (btn, e, ctx) => cancelBooking(btn, ctx)
    }
  });
}
