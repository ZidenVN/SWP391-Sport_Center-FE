import { html, icon } from '../core/dom.js';
import { openModal } from '../core/ui.js';
import { classApi } from '../api/endpoints.js';
import { date, weekday, timeRange, toDate, isFuture } from '../core/format.js';
import { classImage, isBookable } from './classCard.js';

// Thẻ lớp dạng ảnh tràn thẻ: chữ chi tiết đè ở đáy ảnh; bấm cả thẻ để mở popup thông tin lớp + HLV + nút đặt lớp.
// registered: hội viên đã đăng ký lớp này
export function classPhotoCard(c, { registered = false } = {}) {
  const seats = c.availableSeats ?? 0;
  const open = isBookable(c);
  const tag = registered
    ? html`<span class="pc-tag bg-brand-lime text-brand-dark">${icon('check', 'w-3.5 h-3.5')} Đã đăng ký</span>`
    : open
      ? html`<span class="pc-tag ${seats <= 3 ? 'bg-amber-400 text-brand-dark' : 'bg-white/90 text-brand-dark'}">${seats <= 3 ? `Chỉ còn ${seats} chỗ` : `Còn ${seats} chỗ`}</span>`
      : html`<span class="pc-tag bg-black/50 text-white/80">${seats <= 0 ? 'Hết chỗ' : 'Không nhận đăng ký'}</span>`;
  return html`
    <button type="button" class="pc group" data-action="detail" data-id="${c.classId}" data-testid="class-card" data-class-id="${c.classId}" aria-label="Xem lớp ${c.subjectName}">
      ${classImage(c, 'pc-img')}
      <span class="pc-shade"></span>
      <span class="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
        ${tag}
        <span class="pc-date"><span class="text-[10px] font-bold uppercase opacity-80">${weekday(c.startTime)}</span><span class="font-display text-2xl font-extrabold leading-none">${date(c.startTime).slice(0, 5)}</span></span>
      </span>
      <span class="absolute left-0 right-0 bottom-0 p-5 text-left text-white">
        <span class="block font-display text-3xl font-extrabold leading-none">${c.subjectName}</span>
        <span class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/85">
          <span class="flex items-center gap-1.5">${icon('clock', 'w-4 h-4')} ${timeRange(c.startTime, c.endTime)}</span>
          <span class="flex items-center gap-1.5">${icon('map-pin', 'w-4 h-4')} ${c.roomName}</span>
        </span>
        <span class="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-3 text-sm">
          <span class="flex items-center gap-2 min-w-0"><span class="pc-avatar">${initials(c.coachName)}</span><span class="truncate">HLV ${c.coachName}</span></span>
          <span class="pc-more">Chi tiết ${icon('arrow-up-right', 'w-4 h-4')}</span>
        </span>
      </span>
    </button>`;
}

const initials = name => (name || '?').split(' ').filter(Boolean).map(w => w.charAt(0)).slice(-2).join('').toUpperCase();

// Popup chi tiết lớp. footer: html`` các nút (đặt / hủy / cần mua gói) do trang quyết định theo gói của hội viên.
// actions: { book, 'cancel-booking', ... } của trang, nhận (btn, modal)
export function openClassDetail(c, { footer, actions = {} }) {
  const pct = c.maxCapacity ? Math.min(100, Math.round(((c.currentEnrolled || 0) / c.maxCapacity) * 100)) : 0;
  const coachBlock = upcoming => html`
    <div class="rounded-2xl bg-brand-sand/60 p-4" data-testid="detail-coach">
      <div class="flex items-center gap-3">
        <span class="w-12 h-12 rounded-2xl bg-brand-dark text-brand-lime flex items-center justify-center font-black">${initials(c.coachName)}</span>
        <div class="min-w-0">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Huấn luyện viên</div>
          <div class="font-bold text-slate-900 truncate">${c.coachName}</div>
          <div class="text-xs text-slate-500 flex items-center gap-1">${icon('medal', 'w-3.5 h-3.5')} ${c.coachSpeciality || `Phụ trách lớp ${c.subjectName}`}</div>
        </div>
      </div>
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-1.5">Lịch dạy sắp tới khác</div>
      ${upcoming === null
        ? html`<div class="text-xs text-slate-400">Đang tải...</div>`
        : upcoming.length
          ? html`<ul class="space-y-1 text-sm">${upcoming.map(x => html`<li class="flex justify-between gap-3"><span class="font-semibold">${x.subjectName}</span><span class="text-slate-500">${weekday(x.startTime)} ${date(x.startTime).slice(0, 5)} · ${timeRange(x.startTime, x.endTime)}</span></li>`)}</ul>`
          : html`<div class="text-xs text-slate-400">HLV chưa có lớp nào khác sắp tới</div>`}
    </div>`;
  const body = upcoming => html`
    <div data-testid="class-detail" data-class-id="${c.classId}">
      <div class="relative -mx-6 -mt-5 h-52 sm:h-60 overflow-hidden">
        ${classImage(c)}
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
        <div class="absolute left-6 bottom-4 text-white">
          <div class="text-xs font-bold uppercase tracking-widest text-brand-lime">${weekday(c.startTime)}, ${date(c.startTime)}</div>
          <div class="font-display text-4xl font-extrabold leading-none mt-1">${c.subjectName}</div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-5 text-sm">
        <div class="rounded-xl border border-brand-line p-3"><div class="text-xs text-slate-500 flex items-center gap-1">${icon('clock', 'w-3.5 h-3.5')} Thời gian</div><div class="font-bold mt-0.5">${timeRange(c.startTime, c.endTime)}</div></div>
        <div class="rounded-xl border border-brand-line p-3"><div class="text-xs text-slate-500 flex items-center gap-1">${icon('map-pin', 'w-3.5 h-3.5')} Phòng</div><div class="font-bold mt-0.5 truncate">${c.roomName}</div></div>
      </div>
      <div class="mt-3 rounded-xl border border-brand-line p-3">
        <div class="flex justify-between text-sm"><span class="text-slate-500">${c.currentEnrolled ?? 0}/${c.maxCapacity} học viên</span><span class="font-bold ${c.availableSeats > 0 ? 'text-emerald-600' : 'text-rose-600'}">${c.availableSeats > 0 ? `Còn ${c.availableSeats} chỗ` : 'Hết chỗ'}</span></div>
        <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2"><div class="h-full bg-emerald-500" style="width:${pct}%"></div></div>
      </div>
      <div class="mt-4">${coachBlock(upcoming)}</div>
      <div class="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-slate-100" data-testid="detail-footer">${footer}</div>
    </div>`;

  const modal = openModal({
    title: 'Thông tin lớp học',
    size: 'max-w-lg',
    body: body(null),
    actions: Object.fromEntries(Object.entries(actions).map(([k, fn]) => [k, btn => fn(btn, modal)]))
  });
  // các lớp sắp tới khác của HLV (trừ lớp đang xem)
  classApi.list()
    .then(list => list.filter(x => x.coachId === c.coachId && x.classId !== c.classId && x.status === 'OPENING' && isFuture(x.startTime))
      .sort((a, b) => toDate(a.startTime) - toDate(b.startTime)).slice(0, 4))
    .catch(() => [])
    .then(upcoming => modal.setBody(body(upcoming)));
  return modal;
}
