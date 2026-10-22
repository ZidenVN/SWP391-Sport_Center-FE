import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, confirmDialog, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { date, weekday, timeRange, dateTime, badge, isFuture, toDate } from '../../core/format.js';
import { coachLink, openCoachInfo, coachFromButton } from '../../components/coachInfo.js';

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
                <div class="w-20 shrink-0 text-center rounded-xl bg-indigo-50 text-indigo-700 py-2">
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

function historyView(list) {
  return table({
    columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'Phòng' }, { label: 'Trạng thái' }, { label: 'Đăng ký lúc' }, { label: '', cls: 'text-right' }],
    rows: list.map(r => [
      html`<div class="font-semibold">${r.subjectName}</div><div class="text-xs text-slate-500">${coachLink(r)}</div>`,
      html`${date(r.startTime)}<div class="text-xs text-slate-500">${timeRange(r.startTime, r.endTime)}</div>`,
      r.roomName,
      badge(r.status),
      html`<span class="text-xs">${dateTime(r.registeredAt)}</span>${r.cancelledAt ? html`<div class="text-xs text-slate-400">Hủy: ${dateTime(r.cancelledAt)}</div>` : ''}`,
      cancelButton(r)
    ]),
    empty: 'Bạn chưa đăng ký lớp nào'
  });
}

function view(s) {
  const upcoming = s.schedule.filter(r => r.status === 'REGISTERED').sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
  const history = [...s.registrations].sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)));
  return html`
    ${pageHeader('Lịch tập của tôi', 'Các lớp bạn đã đăng ký', html`<a href="#/member/classes" class="btn-primary">${icon('plus', 'w-4 h-4')} Đặt thêm lớp</a>`)}
    ${tabs([{ id: 'upcoming', label: 'Sắp tới', count: upcoming.length }, { id: 'history', label: 'Lịch sử đăng ký', count: history.length }], s.tab)}
    ${s.tab === 'upcoming' ? upcomingView(upcoming) : html`<div class="card">${historyView(history)}</div>`}`;
}

export default function MemberSchedule(el) {
  return mountPage(el, {
    state: { tab: 'upcoming' },
    load: () => settle({ schedule: [memberApi.schedule, []], registrations: [memberApi.registrations, []] }),
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
