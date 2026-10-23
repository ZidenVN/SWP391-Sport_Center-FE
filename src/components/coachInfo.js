import { html, icon } from '../core/dom.js';
import { openModal, loading, errorState, emptyState } from '../core/ui.js';
import { classApi } from '../api/endpoints.js';
import { date, weekday, timeRange, toDate, isFuture } from '../core/format.js';

// Popup thông tin HLV: dựng từ dữ liệu lớp học (coachId, coachName, coachSpeciality)
// vì Member không có quyền gọi GET /coaches/{id}.
export function openCoachInfo({ coachId, coachName, coachSpeciality }) {
  const initials = (coachName || '?').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
  const header = html`
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-2xl bg-brand-dark text-brand-lime flex items-center justify-center text-xl font-black">${initials}</div>
      <div>
        <div class="text-lg font-extrabold" data-testid="coach-name">${coachName}</div>
        <div class="text-sm text-slate-500 flex items-center gap-1">${icon('medal', 'w-4 h-4')} ${coachSpeciality || 'Huấn luyện viên'}</div>
      </div>
    </div>`;

  const modal = openModal({
    title: 'Thông tin huấn luyện viên',
    body: html`${header}<div class="mt-5">${loading('Đang tải lịch dạy...')}</div>`,
    actions: { reload: () => load() }
  });

  const load = () => classApi.list()
    .then(classes => {
      const upcoming = classes
        .filter(c => c.coachId === coachId && c.status === 'OPENING' && isFuture(c.startTime))
        .sort((a, b) => toDate(a.startTime) - toDate(b.startTime))
        .slice(0, 6);
      const subjects = [...new Set(classes.filter(c => c.coachId === coachId).map(c => c.subjectName))];
      modal.setBody(html`
        ${header}
        ${subjects.length ? html`
          <div class="mt-5">
            <div class="text-xs font-bold uppercase text-slate-400 mb-2">Bộ môn phụ trách</div>
            <div class="flex flex-wrap gap-2">${subjects.map(s => html`<span class="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold">${s}</span>`)}</div>
          </div>` : ''}
        <div class="mt-5">
          <div class="text-xs font-bold uppercase text-slate-400 mb-2">Lịch dạy sắp tới</div>
          ${upcoming.length ? html`
            <ul class="divide-y divide-slate-100 text-sm" data-testid="coach-upcoming">
              ${upcoming.map(c => html`
                <li class="py-2 flex justify-between gap-3">
                  <span class="font-semibold">${c.subjectName}</span>
                  <span class="text-slate-500 text-right">${weekday(c.startTime)} ${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)}</span>
                </li>`)}
            </ul>` : emptyState('HLV chưa có lịch dạy sắp tới', 'calendar')}
        </div>
        <div class="flex justify-end mt-6"><button type="button" data-action="cancel" class="btn-secondary">Đóng</button></div>`);
    })
    .catch(err => modal.setBody(html`${header}<div class="mt-5">${errorState(err)}</div>`));
  load();
  return modal;
}

// Nút tên HLV có thể bấm để mở popup (dùng trong thẻ lớp, lịch tập)
export function coachLink(item) {
  if (!item.coachId) return html`<span>HLV ${item.coachName}</span>`;
  return html`<button type="button" class="font-semibold text-emerald-600 hover:underline" data-action="coach-info"
    data-coach-id="${item.coachId}" data-coach-name="${item.coachName}" data-coach-speciality="${item.coachSpeciality || ''}">HLV ${item.coachName}</button>`;
}

export function coachFromButton(btn) {
  return {
    coachId: Number(btn.dataset.coachId),
    coachName: btn.dataset.coachName,
    coachSpeciality: btn.dataset.coachSpeciality
  };
}
