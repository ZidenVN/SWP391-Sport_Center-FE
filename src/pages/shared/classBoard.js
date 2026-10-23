import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, receptionApi } from '../../api/endpoints.js';
import { classCard, isBookable } from '../../components/classCard.js';
import { openMemberPicker } from '../../components/memberPicker.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { toDate, fullName, isToday } from '../../core/format.js';

function view(s) {
  const kw = s.keyword.toLowerCase();
  const subjects = [...new Set(s.classes.map(c => c.subjectName))].sort();
  const list = s.classes
    .filter(c => !s.subject || c.subjectName === s.subject)
    .filter(c => !kw || [c.subjectName, c.coachName, c.roomName].some(v => (v || '').toLowerCase().includes(kw)))
    .filter(c => s.showAll || isBookable(c))
    .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
  const today = s.classes.filter(c => isToday(c.startTime)).length;
  return html`
    ${pageHeader('Lịch lớp học', `${today} lớp diễn ra hôm nay · đặt chỗ hộ hội viên ngay trên thẻ lớp`)}
    <div class="card p-4 mb-5 flex flex-col md:flex-row gap-3 md:items-center">
      <div class="relative flex-1">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="keyword" data-action="search" data-live placeholder="Tìm theo môn, HLV, phòng..." value="${s.keyword}" />
      </div>
      <select class="input md:w-56" name="subject" data-action="subject">
        <option value="">Tất cả bộ môn</option>
        ${subjects.map(n => html`<option ${n === s.subject ? 'selected' : ''}>${n}</option>`)}
      </select>
      <label class="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
        <input type="checkbox" name="showAll" data-action="toggle-all" ${s.showAll ? 'checked' : ''} class="rounded" /> Hiện cả lớp đã qua / hết chỗ
      </label>
    </div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => classCard(c, isBookable(c)
          ? html`<button type="button" class="btn bg-brand-dark text-white hover:bg-emerald-800 btn-sm" data-action="book" data-id="${c.classId}" data-testid="board-book-${c.classId}">${icon('user-plus', 'w-3.5 h-3.5')} Đặt cho hội viên</button>`
          : html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`))}
      </div>` : emptyState('Không có lớp phù hợp', 'calendar-x')}`;
}

export default function ClassBoard(el) {
  return mountPage(el, {
    state: { keyword: '', subject: '', showAll: false },
    load: async () => ({ classes: await classApi.list() }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      subject: (t, e, ctx) => ctx.set({ subject: t.value }),
      'toggle-all': (t, e, ctx) => ctx.set({ showAll: t.checked }),
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      book: (btn, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === btn.dataset.id);
        openMemberPicker({
          title: `Đặt lớp ${c.subjectName} cho hội viên`,
          onPick: async member => {
            try {
              await receptionApi.register(member.memberId, c.classId);
              toast(`Đã đặt lớp ${c.subjectName} cho ${fullName(member)}`);
              ctx.reload();
            } catch (err) {
              toast(err.message, 'error', `Không đặt được cho ${fullName(member)}`);
            }
          }
        });
      }
    }
  });
}
