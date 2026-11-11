import { html } from '../core/dom.js';
import { date, dateTime, toDate } from '../core/format.js';

// Lịch cả khóa của 1 lớp: các thứ học trong tuần + ngày bắt đầu / kết thúc (dùng ở popup lớp và popup buổi học)
const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABEL = { MON: 'Thứ 2', TUE: 'Thứ 3', WED: 'Thứ 4', THU: 'Thứ 5', FRI: 'Thứ 6', SAT: 'Thứ 7', SUN: 'Chủ nhật' };
const JS_DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// c: lớp có daysOfWeek ("TUE,THU,SAT"), startDate, endDate, totalSessions; thiếu thì tính từ sessionTimes (giờ bắt đầu các buổi)
export function courseOf(c, sessionTimes = []) {
  const times = sessionTimes.map(toDate).sort((a, b) => a - b);
  const days = c?.daysOfWeek
    ? String(c.daysOfWeek).split(',').map(d => d.trim().slice(0, 3).toUpperCase())
    : [...new Set(times.map(d => JS_DAY[d.getDay()]))];
  return {
    start: c?.startDate || times[0],
    end: c?.endDate || times[times.length - 1],
    days: DAY_ORDER.filter(d => days.includes(d)),
    total: c?.totalSessions ?? null
  };
}

// Bản gọn cho dòng trong danh sách / bảng: các thứ học + giờ + khoảng ngày
const SHORT = { MON: 'T2', TUE: 'T3', WED: 'T4', THU: 'T5', FRI: 'T6', SAT: 'T7', SUN: 'CN' };
const clock = t => (t ? String(t).slice(0, 5) : '');
// dates: false khi dòng trên đã ghi khoảng ngày
export function courseInline(c, { course = courseOf(c), dates = true } = {}) {
  const hours = c?.startClock ? `${clock(c.startClock)}–${clock(c.endClock)}` : '';
  // lớp kiểu cũ (1 buổi, không có lịch cố định): ghi giờ buổi đó
  if (!course.days.length && !course.end) return c?.startTime ? html`<span class="text-xs text-slate-500">${dateTime(c.startTime)}</span>` : '';
  return html`
    <span class="inline-flex flex-wrap items-center gap-1 text-xs text-slate-500" data-testid="course-inline">
      ${course.days.map(d => html`<span class="px-1.5 py-0.5 rounded-md bg-brand-dark text-brand-lime font-bold text-[10px]">${SHORT[d]}</span>`)}
      ${hours ? html`<span class="ml-1">${hours}</span>` : ''}
      ${dates && course.start && course.end ? html`<span class="ml-1">· ${date(course.start).slice(0, 5)} → ${date(course.end)}</span>` : ''}
    </span>`;
}

export function courseBlock(course) {
  if (!course.days.length && !course.end) return '';
  return html`
    <div class="rounded-2xl bg-brand-sand/60 p-3.5" data-testid="course-schedule">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Lịch học hằng tuần</span>
        ${course.days.length ? html`<span class="text-xs font-bold text-brand-deep">${course.days.length} buổi / tuần${course.total ? ` · ${course.total} buổi cả khóa` : ''}</span>` : ''}
      </div>
      <div class="flex flex-wrap gap-1.5 mt-2">
        ${course.days.length
          ? course.days.map(d => html`<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-dark text-brand-lime">${DAY_LABEL[d]}</span>`)
          : html`<span class="text-xs text-slate-500">Chưa có lịch cố định</span>`}
      </div>
      <div class="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div><div class="text-[11px] text-slate-500">Ngày bắt đầu</div><b>${course.start ? date(course.start) : '—'}</b></div>
        <div><div class="text-[11px] text-slate-500">Ngày kết thúc</div><b>${course.end ? date(course.end) : '—'}</b></div>
      </div>
    </div>`;
}
