import { html, icon } from '../core/dom.js';
import { openModal, confirmDialog, withBusy, toast, emptyState } from '../core/ui.js';
import { date, dateTime, toDate } from '../core/format.js';

const DAY_SHORT = { MON: 'T2', TUE: 'T3', WED: 'T4', THU: 'T5', FRI: 'T6', SAT: 'T7', SUN: 'CN' };
const clock = t => (t ? String(t).slice(0, 5) : '');

// Lịch cố định của lớp: "T2, T4, T6 · 18:00–19:30 · 01/11 → 30/11/2026"; lớp kiểu cũ (1 buổi) thì ghi giờ buổi đó
export function scheduleText(c) {
  if (c.daysOfWeek) {
    const days = String(c.daysOfWeek).split(',').map(d => DAY_SHORT[d.trim().slice(0, 3).toUpperCase()] || d).join(', ');
    const range = c.startDate ? ` · ${date(c.startDate).slice(0, 5)} → ${date(c.endDate)}` : '';
    return `${days} · ${clock(c.startClock)}–${clock(c.endClock)}${range}`;
  }
  return c.startTime ? `${dateTime(c.startTime)}` : '—';
}

// buổi đầu của lớp (đăng ký / lớp đủ điều kiện): firstSessionAt, lớp kiểu cũ thì startTime
export const firstSessionOf = r => toDate(r.firstSessionAt || r.startTime);

export const SELF_SWITCH_HOURS = 12;
export const canCancelRegistration = r => r.status === 'REGISTERED' && firstSessionOf(r) > new Date();
// hội viên tự đổi lớp: còn hơn 12 tiếng trước buổi đầu
export const canSelfSwitch = r => r.status === 'REGISTERED' && Boolean(r.subscriptionId)
  && firstSessionOf(r) - Date.now() > SELF_SWITCH_HOURS * 3600 * 1000;

// Popup đổi lớp: liệt kê lớp cùng môn, cùng thời hạn, còn chỗ, không trùng lịch (BE lọc sẵn) -> chọn -> xác nhận
// loadEligible(): Promise<EligibleClassResponseDTO[]>; doSwitch(newClassId): Promise; note: ghi chú luật (vd lượt đổi của lễ tân)
export function openSwitchClass({ reg, loadEligible, doSwitch, note = '', onDone }) {
  const listBody = classes => (classes.length ? html`
    <div class="space-y-2 max-h-[60vh] overflow-y-auto" data-testid="eligible-classes">
      ${classes.map(c => html`
        <div class="rounded-2xl border border-brand-line bg-white/70 p-3 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-brand-sand text-brand-deep flex items-center justify-center shrink-0">${icon('calendar-range', 'w-5 h-5')}</span>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm">${c.subjectName} <span class="text-slate-400 font-semibold">#${c.classId}</span></div>
            <div class="text-xs text-slate-500">${scheduleText(c)}</div>
            <div class="text-xs text-slate-500">HLV ${c.coachName} · ${c.roomName} · ${c.registeredCount ?? 0}/${c.maxCapacity} chỗ</div>
          </div>
          <button type="button" class="btn-primary btn-sm whitespace-nowrap" data-action="pick" data-id="${c.classId}" data-testid="switch-to">${icon('arrow-right-left', 'w-3.5 h-3.5')} Chuyển</button>
        </div>`)}
    </div>` : emptyState('Chưa có lớp nào khác cùng môn, cùng thời hạn còn chỗ', 'calendar-x'));

  let classes = [];
  const modal = openModal({
    title: `Đổi lớp ${reg.subjectName}`,
    size: 'max-w-xl',
    body: html`<div class="py-8 text-center text-sm text-slate-400">Đang tải lớp có thể đổi...</div>`,
    actions: {
      pick: async btn => {
        const c = classes.find(x => String(x.classId) === btn.dataset.id);
        if (!c) return;
        const ok = await confirmDialog(`Chuyển từ lớp #${reg.classId} sang lớp #${c.classId}?\n${c.subjectName} · ${scheduleText(c)}`, { title: 'Xác nhận đổi lớp', confirmText: 'Đổi lớp' });
        if (!ok) return;
        const res = await withBusy(btn, () => doSwitch(c.classId));
        if (res === undefined) return;
        modal.close();
        toast(`Đã chuyển sang lớp ${c.subjectName} #${c.classId}`);
        onDone?.();
      }
    }
  });
  loadEligible()
    .then(list => {
      classes = list || [];
      modal.setBody(html`
        <div class="rounded-xl bg-brand-sand/60 p-3 text-sm mb-3">
          Lớp hiện tại: <b>${reg.subjectName} #${reg.classId}</b> · ${scheduleText(reg)}${reg.packageName ? html`<div class="text-xs text-slate-500 mt-0.5">Gói: ${reg.packageName}</div>` : ''}
        </div>
        ${note ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 mb-3">${note}</div>` : ''}
        ${listBody(classes)}`);
    })
    .catch(err => modal.setBody(html`<div class="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3">${err.message}</div>`));
}
