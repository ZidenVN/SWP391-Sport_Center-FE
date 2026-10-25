import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, confirmDialog, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { date, weekday, timeRange, dateTime, badge, isFuture, toDate, time } from '../../core/format.js';
import { coachLink, openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { FEATURES } from '../../core/features.js';

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
              <div class="card p-4 flex items-center gap-4">
                <div class="w-20 shrink-0 text-center rounded-xl bg-emerald-50 text-emerald-700 py-2">
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
          html`<div class="font-semibold">${r.subjectName}</div><div class="text-xs text-slate-500">${coachLink(r)}</div>`,
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

function view(s) {
  const upcoming = s.schedule
    .filter(r => r.status === 'REGISTERED')
    .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
  const history = [...s.registrations].sort((a, b) => toDate(b.startTime) - toDate(a.startTime));
  const attByClass = new Map(s.attendances.map(a => [a.classId, a]));
  const body = {
    upcoming: () => upcomingView(upcoming),
    history: () => historyView(history, attByClass),
    attendance: () => attendanceView(s.attendances),
    visits: () => visitsView(s.checkIns)
  }[s.tab]();
  return html`
    ${pageHeader('Lịch tập của tôi', 'Các lớp bạn đã đăng ký và lịch sử điểm danh', html`<a href="#/member/classes" class="btn-primary">${icon('plus', 'w-4 h-4')} Đặt thêm lớp</a>`)}
    ${tabs([
      { id: 'upcoming', label: 'Sắp tới', count: upcoming.length },
      { id: 'history', label: 'Lịch sử đăng ký', count: history.length },
      { id: 'attendance', label: 'Điểm danh', count: s.attendances.length },
      // BE main chưa có lịch sử check-in của hội viên (FE-TODO #11)
      ...(FEATURES.checkInHistory ? [{ id: 'visits', label: 'Lượt đến', count: s.checkIns.length }] : [])
    ], s.tab)}
    ${body}`;
}

export default function MemberSchedule(el) {
  return mountPage(el, {
    state: { tab: 'upcoming' },
    load: () => settle({
      schedule: [memberApi.schedule, []],
      registrations: [memberApi.registrations, []],
      attendances: [memberApi.attendances, []],
      checkIns: [() => (FEATURES.checkInHistory ? memberApi.checkIns() : []), []]
    }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      'cancel-booking': async (btn, e, ctx) => {
        const ok = await confirmDialog('Bạn chắc chắn muốn hủy đăng ký lớp này?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true });
        if (!ok) return;
        const res = await withBusy(btn, () => memberApi.cancel(btn.dataset.id));
        if (res) {
          toast('Đã hủy đăng ký lớp');
          ctx.reload();
        }
      }
    }
  });
}
