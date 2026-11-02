import { html, render, icon } from '../core/dom.js';
import { openModal, loading, errorState, emptyState, toast, withBusy } from '../core/ui.js';
import { receptionApi, packageApi } from '../api/endpoints.js';
import { fullName } from '../core/format.js';
import { subjectColor } from './classCard.js';
import { withDurations, waitingClassPackages } from './classPackages.js';
import { scheduleText } from './switchClass.js';

// Lễ tân đặt lớp hộ 1 hội viên theo mô hình gói lớp của BE:
// chọn 1 gói lớp đang chờ -> BE trả các lớp cùng môn, cùng thời hạn, còn chỗ, không trùng lịch (eligible-classes) -> Đặt.
export function openBookClass({ member, onDone }) {
  let packages = [];
  let selected = null;
  let classes = null;
  let keyword = '';

  const packageChips = () => html`
    <div class="flex flex-wrap gap-2 mb-4" data-testid="book-packages">
      ${packages.map(p => html`
        <button type="button" data-action="pick-package" data-id="${p.subscriptionId}"
          class="rounded-2xl border px-3 py-2 text-left text-sm transition ${selected?.subscriptionId === p.subscriptionId ? 'border-[#469B7E] bg-[#469B7E]/10 ring-2 ring-[#469B7E]/20' : 'border-brand-line bg-white/60 hover:border-[#469B7E]/60'}">
          <span class="block font-bold text-brand-dark">${p.subjectName || p.packageName}${p.durationDays ? ` · ${p.durationDays} ngày` : ''}</span>
          <span class="block text-xs text-slate-500">${p.packageName} · #${p.subscriptionId}</span>
        </button>`)}
    </div>`;

  const classList = () => {
    if (classes === null) return loading();
    const kw = keyword.toLowerCase();
    const list = classes.filter(c => !kw || [c.subjectName, c.coachName, c.roomName].some(v => (v || '').toLowerCase().includes(kw)));
    if (!list.length) return emptyState('Không có lớp nào cùng môn, cùng thời hạn còn nhận đăng ký', 'calendar-x');
    return html`
      <ul class="space-y-2 max-h-[420px] overflow-y-auto pr-1" data-testid="book-class-list">
        ${list.map(c => html`
          <li class="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
            <span class="w-1.5 self-stretch rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm">${c.subjectName} <span class="text-slate-400 font-semibold">#${c.classId}</span></div>
              <div class="text-xs text-slate-500">${scheduleText(c)}</div>
              <div class="text-xs text-slate-500">${c.roomName} · HLV ${c.coachName}</div>
              <div class="text-[11px] mt-0.5 font-semibold ${c.maxCapacity - (c.registeredCount || 0) > 3 ? 'text-emerald-600' : 'text-amber-600'}">Còn ${c.maxCapacity - (c.registeredCount || 0)}/${c.maxCapacity} chỗ</div>
            </div>
            <button type="button" class="btn bg-brand-dark text-white hover:bg-emerald-800 btn-sm" data-action="book" data-id="${c.classId}" data-testid="book-${c.classId}">Đặt</button>
          </li>`)}
      </ul>`;
  };

  const renderBody = () => {
    const body = modal.el.querySelector('#book-body');
    if (!packages.length) {
      render(body, html`
        ${emptyState('Hội viên chưa có gói lớp nào đang chờ dùng', 'ticket')}
        <p class="text-center text-sm text-slate-500 -mt-6">Mỗi lớp cần 1 gói lớp cùng môn và cùng thời hạn. Hãy bán gói lớp trước.</p>`);
      return;
    }
    render(body, html`
      <div class="text-xs font-bold text-slate-500 mb-2">Gói lớp đang chờ</div>
      ${packageChips()}
      <div class="relative mb-3">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">${icon('search', 'w-4 h-4')}</span>
        <input class="input !pl-10" name="classKeyword" data-action="filter" data-live value="${keyword}" placeholder="Lọc theo HLV, phòng..." />
      </div>
      <div id="book-classes">${classList()}</div>`);
  };

  const loadClasses = async () => {
    classes = null;
    renderBody();
    try {
      classes = await receptionApi.eligibleClasses(member.memberId, selected.subscriptionId);
    } catch (err) {
      classes = [];
      toast(err.message, 'error');
    }
    renderBody();
  };

  const modal = openModal({
    title: `Đặt lớp cho ${fullName(member)}`,
    size: 'max-w-2xl',
    body: html`<div id="book-body">${loading()}</div>`,
    actions: {
      'pick-package': btn => {
        selected = packages.find(p => String(p.subscriptionId) === btn.dataset.id) || null;
        if (selected) loadClasses();
      },
      filter: input => {
        keyword = input.value;
        render(modal.el.querySelector('#book-classes'), classList());
      },
      book: async btn => {
        const c = classes.find(x => String(x.classId) === btn.dataset.id);
        const res = await withBusy(btn, () => receptionApi.register(member.memberId, c.classId, selected.subscriptionId));
        if (res) {
          toast(`Đã đặt lớp ${c.subjectName} cho ${fullName(member)}`);
          if (onDone) onDone(res);
          await load();
        }
      }
    }
  });

  // gói vừa dùng chuyển sang ACTIVE -> tải lại để chỉ còn các gói đang chờ
  const load = async () => {
    try {
      const [subs, pkgs] = await Promise.all([receptionApi.subscriptions(member.memberId), packageApi.list().catch(() => [])]);
      packages = waitingClassPackages(withDurations(subs, pkgs));
      selected = packages.find(p => p.subscriptionId === selected?.subscriptionId) || packages[0] || null;
      if (selected) await loadClasses();
      else renderBody();
    } catch (err) {
      render(modal.el.querySelector('#book-body'), errorState(err));
    }
  };
  load();
  return modal;
}
