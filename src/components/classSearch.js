import { html, icon } from '../core/dom.js';
import { date, isoDate } from '../core/format.js';

// Phần dùng chung cho các trang tìm lớp theo tuần qua GET /classes/search (FE-TODO #7):
// thanh chọn tuần + bộ môn + "hiện cả lớp đã qua / hết chỗ", phân trang, và dựng tham số truy vấn.

const mondayOf = d => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

export function weekRange(offset) {
  const start = addDays(mondayOf(new Date()), offset * 7);
  return { start, end: addDays(start, 6) };
}

// state cần có: week, subjectId, showAll, pageNo. Mặc định chỉ lớp còn nhận đăng ký (đang mở, còn chỗ, chưa diễn ra).
export function classSearchQuery(s, size) {
  const { start, end } = weekRange(s.week);
  const today = new Date();
  const from = s.showAll || start > today ? start : today;
  return {
    fromDate: isoDate(from),
    toDate: isoDate(end),
    subjectId: s.subjectId || undefined,
    status: s.showAll ? undefined : 'OPENING',
    available: s.showAll ? undefined : true,
    page: s.pageNo,
    size
  };
}

export function classFilterBar(s, { keywordPlaceholder = 'Lọc theo môn, HLV, phòng...' } = {}) {
  const { start, end } = weekRange(s.week);
  return html`
    <div class="card p-4 mb-5 space-y-3" data-testid="class-filter">
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="btn-secondary btn-sm" data-action="week" data-delta="-1" ${s.week <= 0 && !s.showAll ? 'disabled' : ''} aria-label="Tuần trước">${icon('chevron-left', 'w-4 h-4')}</button>
        <div class="font-bold text-sm min-w-[11rem] text-center" data-testid="week-label">${s.week === 0 ? 'Tuần này' : s.week === 1 ? 'Tuần sau' : 'Tuần'} · ${date(start).slice(0, 5)} – ${date(end).slice(0, 5)}</div>
        <button type="button" class="btn-secondary btn-sm" data-action="week" data-delta="1" aria-label="Tuần sau">${icon('chevron-right', 'w-4 h-4')}</button>
        ${s.week !== 0 ? html`<button type="button" class="btn-ghost btn-sm" data-action="week" data-delta="0">Về tuần này</button>` : ''}
      </div>
      <div class="flex flex-col md:flex-row gap-3 md:items-center">
        <div class="relative flex-1">
          <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
          <input class="input pl-9" name="keyword" data-action="search" data-live placeholder="${keywordPlaceholder}" value="${s.keyword || ''}" />
        </div>
        <select class="input md:w-56" name="subject" data-action="subject">
          <option value="">Tất cả bộ môn</option>
          ${s.subjects.map(x => html`<option value="${x.subjectId}" ${String(x.subjectId) === String(s.subjectId) ? 'selected' : ''}>${x.subjectName}</option>`)}
        </select>
        <label class="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
          <input type="checkbox" name="showAll" data-action="toggle-all" ${s.showAll ? 'checked' : ''} class="rounded" /> Hiện cả lớp đã qua / hết chỗ
        </label>
      </div>
    </div>`;
}

export function classPager(page) {
  if (!page || page.totalPages <= 1) return '';
  const n = page.number;
  return html`
    <div class="flex items-center justify-between mt-6 text-sm" data-testid="pager">
      <span class="text-slate-500">Trang ${n + 1}/${page.totalPages} · ${page.totalElements} lớp</span>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n - 1}" ${n <= 0 ? 'disabled' : ''}>${icon('chevron-left', 'w-3.5 h-3.5')} Trước</button>
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n + 1}" ${n + 1 >= page.totalPages ? 'disabled' : ''}>Sau ${icon('chevron-right', 'w-3.5 h-3.5')}</button>
      </div>
    </div>`;
}

// từ khóa chỉ lọc trong trang đang xem (API tìm lớp chưa có tham số từ khóa)
export const filterByKeyword = (list, keyword) => {
  const kw = (keyword || '').trim().toLowerCase();
  return list.filter(c => !kw || [c.subjectName, c.coachName, c.roomName].some(v => (v || '').toLowerCase().includes(kw)));
};

// các action dùng chung: tuần, bộ môn, ẩn/hiện lớp đã qua, trang
export const classSearchActions = {
  search: (t, e, ctx) => ctx.set({ keyword: t.value }),
  subject: (t, e, ctx) => { ctx.state.subjectId = t.value; ctx.state.pageNo = 0; ctx.reload(); },
  'toggle-all': (t, e, ctx) => { ctx.state.showAll = t.checked; ctx.state.pageNo = 0; ctx.reload(); },
  week: (t, e, ctx) => {
    const d = Number(t.dataset.delta);
    ctx.state.week = d === 0 ? 0 : ctx.state.week + d;
    ctx.state.pageNo = 0;
    ctx.reload();
  },
  page: (t, e, ctx) => { ctx.state.pageNo = Math.max(0, Number(t.dataset.page)); ctx.reload(); }
};
