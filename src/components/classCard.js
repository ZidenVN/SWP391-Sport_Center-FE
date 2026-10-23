import { html, icon } from '../core/dom.js';
import { badge, date, weekday, timeRange, isFuture } from '../core/format.js';
import { coachLink } from './coachInfo.js';

// Tông đất cùng bộ với trang giới thiệu; đều đủ đậm để đặt chữ trắng lên trên (hero lớp, ô ngày của HLV)
const SUBJECT_COLORS = [
  'from-[#173F31] to-[#2F6B55]',
  'from-[#2F6B55] to-[#469B7E]',
  'from-[#3F5A1E] to-[#6E8F2E]',
  'from-[#8A3F22] to-[#C0683A]',
  'from-[#1E4A57] to-[#3A7A88]'
];

export function subjectColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SUBJECT_COLORS[h % SUBJECT_COLORS.length];
}

// Lớp còn nhận đăng ký: đang mở, chưa bắt đầu, còn chỗ
export function isBookable(c) {
  return c.status === 'OPENING' && isFuture(c.startTime) && (c.availableSeats ?? 1) > 0;
}

// footer: html`` các nút hành động của thẻ
export function classCard(c, footer = '') {
  const seatsPct = c.maxCapacity ? Math.min(100, Math.round(((c.currentEnrolled || 0) / c.maxCapacity) * 100)) : 0;
  return html`
    <div class="card overflow-hidden flex flex-col" data-testid="class-card" data-class-id="${c.classId}">
      <div class="h-2 bg-gradient-to-r ${subjectColor(c.subjectName)}"></div>
      <div class="p-5 flex-1 flex flex-col">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-display text-2xl leading-none font-extrabold text-brand-dark">${c.subjectName}</div>
            <div class="text-xs text-slate-500 mt-0.5">${weekday(c.startTime)}, ${date(c.startTime)}</div>
          </div>
          ${badge(c.status)}
        </div>
        <div class="mt-4 space-y-1.5 text-sm text-slate-600">
          <div class="flex items-center gap-2">${icon('clock', 'w-4 h-4 text-slate-400')} ${timeRange(c.startTime, c.endTime)}</div>
          <div class="flex items-center gap-2">${icon('map-pin', 'w-4 h-4 text-slate-400')} ${c.roomName}</div>
          <div class="flex items-center gap-2">${icon('user-round', 'w-4 h-4 text-slate-400')} ${coachLink(c)}</div>
        </div>
        ${c.subjectDescription ? html`<p class="mt-3 text-xs text-slate-500 line-clamp-2" title="${c.subjectDescription}">${c.subjectDescription}</p>` : ''}
        ${c.maxCapacity ? html`
          <div class="mt-4">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>${c.currentEnrolled ?? 0}/${c.maxCapacity} học viên</span>
              <span class="font-semibold ${c.availableSeats > 0 ? 'text-emerald-600' : 'text-rose-600'}">${c.availableSeats > 0 ? `Còn ${c.availableSeats} chỗ` : 'Hết chỗ'}</span>
            </div>
            <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-emerald-500" style="width:${seatsPct}%"></div></div>
          </div>` : ''}
        ${footer ? html`<div class="mt-5 pt-4 border-t border-slate-100 flex gap-2 justify-end">${footer}</div>` : ''}
      </div>
    </div>`;
}
