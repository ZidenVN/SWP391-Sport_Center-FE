import { html, render, icon } from '../core/dom.js';
import { openModal, loading, errorState, emptyState, toast, withBusy } from '../core/ui.js';
import { classApi, receptionApi } from '../api/endpoints.js';
import { date, weekday, timeRange, toDate, fullName } from '../core/format.js';
import { isBookable, subjectColor } from './classCard.js';

// Lễ tân đặt lớp hộ 1 hội viên: liệt kê lớp còn nhận đăng ký, đánh dấu lớp đã đăng ký
export function openBookClass({ member, onDone }) {
  let classes = [];
  let registered = new Set();
  let keyword = '';

  const listView = () => {
    const kw = keyword.toLowerCase();
    const list = classes
      .filter(isBookable)
      .filter(c => !kw || [c.subjectName, c.coachName, c.roomName].some(v => (v || '').toLowerCase().includes(kw)))
      .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
    if (!list.length) return emptyState('Không có lớp nào đang nhận đăng ký', 'calendar-x');
    return html`
      <ul class="space-y-2 max-h-[420px] overflow-y-auto pr-1" data-testid="book-class-list">
        ${list.map(c => html`
          <li class="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
            <span class="w-1.5 self-stretch rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm">${c.subjectName}</div>
              <div class="text-xs text-slate-500">${weekday(c.startTime)} ${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName} · HLV ${c.coachName}</div>
              <div class="text-[11px] mt-0.5 ${c.availableSeats > 3 ? 'text-emerald-600' : 'text-amber-600'} font-semibold">Còn ${c.availableSeats}/${c.maxCapacity} chỗ</div>
            </div>
            ${registered.has(c.classId)
              ? html`<span class="text-xs font-bold text-emerald-600 flex items-center gap-1">${icon('check-circle-2', 'w-4 h-4')} Đã đăng ký</span>`
              : html`<button type="button" class="btn bg-brand-dark text-white hover:bg-emerald-800 btn-sm" data-action="book" data-id="${c.classId}" data-testid="book-${c.classId}">Đặt</button>`}
          </li>`)}
      </ul>`;
  };

  const renderList = () => render(modal.el.querySelector('#book-body'), listView());

  const modal = openModal({
    title: `Đặt lớp cho ${fullName(member)}`,
    size: 'max-w-2xl',
    body: html`
      <div class="relative mb-4">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="classKeyword" data-action="filter" data-live placeholder="Lọc theo môn, HLV, phòng..." />
      </div>
      <div id="book-body">${loading()}</div>`,
    actions: {
      filter: input => { keyword = input.value; renderList(); },
      book: async btn => {
        const c = classes.find(x => String(x.classId) === btn.dataset.id);
        const res = await withBusy(btn, () => receptionApi.register(member.memberId, c.classId));
        if (res) {
          toast(`Đã đặt lớp ${c.subjectName} cho ${fullName(member)}`);
          registered.add(c.classId);
          c.currentEnrolled = (c.currentEnrolled || 0) + 1;
          c.availableSeats = Math.max(0, (c.availableSeats || 1) - 1);
          renderList();
          if (onDone) onDone(res);
        }
      },
      reload: () => load()
    }
  });

  const load = async () => {
    try {
      const [all, regs] = await Promise.all([classApi.list(), receptionApi.registrations(member.memberId).catch(() => [])]);
      classes = all;
      registered = new Set(regs.filter(r => r.status === 'REGISTERED').map(r => r.classId));
      renderList();
    } catch (err) {
      render(modal.el.querySelector('#book-body'), errorState(err));
    }
  };
  load();
  return modal;
}
