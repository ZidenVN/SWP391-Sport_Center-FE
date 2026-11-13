import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, emptyState, statCard } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { coachApi } from '../../api/endpoints.js';
import { badge, date, dateTime, toDate } from '../../core/format.js';
import { openPlanForm, loadMyStudents } from '../../components/coachForms.js';

// cá nhân: HLV đánh dấu hoàn tất; lớp: BE tự trả COMPLETED khi lớp đã kết thúc
const done = p => p.status === 'COMPLETED';
const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function targetLink(p) {
  if (p.targetType === 'CLASS') return html`<a class="font-semibold text-[#156B45] hover:underline" href="#/coach/classes/${p.targetId}?tab=plans">${p.targetName}</a>`;
  if (p.targetType === 'INDIVIDUAL') return html`<a class="font-semibold text-[#156B45] hover:underline" href="#/coach/members/${p.targetId}?tab=plans">${p.targetName}</a>`;
  return html`<span class="text-slate-400">Chưa giao</span>`;
}

function planCard(p) {
  return html`
    <div class="card p-5 flex flex-col" data-testid="plan-card">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-bold text-slate-900">${p.planName}</div>
          <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">${p.targetType ? badge(p.targetType) : ''} ${targetLink(p)}</div>
        </div>
        ${p.status && (p.targetType === 'INDIVIDUAL' || done(p)) ? badge(p.status) : ''}
      </div>
      <p class="text-sm text-slate-700 mt-3 whitespace-pre-line flex-1">${p.exerciseDetails}</p>
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
        ${p.duration ? html`<span class="flex items-center gap-1">${icon('timer', 'w-3.5 h-3.5')} ${p.duration}</span>` : ''}
        <span class="flex items-center gap-1">${icon('calendar', 'w-3.5 h-3.5')} ${p.assignedDate ? `Giao ${date(p.assignedDate)}` : `Tạo ${dateTime(p.createdAt)}`}</span>
        ${p.dueDate ? html`<span class="flex items-center gap-1 ${!done(p) && toDate(p.dueDate) < new Date() ? 'text-rose-600 font-semibold' : ''}">${icon('flag', 'w-3.5 h-3.5')} ${p.targetType === 'CLASS' ? 'Lớp kết thúc' : 'Hạn'} ${date(p.dueDate)}</span>` : ''}
      </div>
    </div>`;
}

function view(s) {
  const kw = norm(s.keyword.trim());
  // tab Hoàn thành gom giáo án đã xong; các tab còn lại chỉ hiện giáo án đang dùng cho gọn
  const active = s.plans.filter(p => !done(p));
  const list = (s.tab === 'DONE' ? s.plans.filter(done) : active.filter(p => s.tab === 'ALL' || p.targetType === s.tab))
    .filter(p => !kw || [p.planName, p.exerciseDetails, p.targetName].some(v => norm(v).includes(kw)));
  const count = t => s.plans.filter(p => p.targetType === t).length;
  const activeCount = t => active.filter(p => p.targetType === t).length;
  return html`
    ${pageHeader('Giáo án', 'Các giáo án bạn đã soạn và giao cho lớp / học viên',
      html`<button type="button" class="btn-primary" data-action="new-plan" data-testid="new-plan">${icon('plus', 'w-4 h-4')} Giao giáo án mới</button>`)}
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      ${statCard('Tổng giáo án', s.plans.length, 'clipboard-list', 'emerald')}
      ${statCard('Giao cho lớp', count('CLASS'), 'users', 'sky')}
      ${statCard('Giao cá nhân', count('INDIVIDUAL'), 'user', 'violet')}
    </div>
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
      ${tabs([
        { id: 'ALL', label: 'Đang dùng', count: active.length },
        { id: 'CLASS', label: 'Theo lớp', count: activeCount('CLASS') },
        { id: 'INDIVIDUAL', label: 'Cá nhân', count: activeCount('INDIVIDUAL') },
        { id: 'DONE', label: 'Hoàn thành', count: s.plans.length - active.length }
      ], s.tab)}
      <div class="relative md:w-72 mb-5">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="keyword" data-action="search" data-live placeholder="Tìm giáo án..." value="${s.keyword}" />
      </div>
    </div>
    ${list.length
      ? html`<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="plan-list">${list.map(planCard)}</div>`
      : emptyState(s.plans.length ? 'Không có giáo án phù hợp' : 'Bạn chưa soạn giáo án nào', 'clipboard-list')}`;
}

export default function CoachPlans(el) {
  return mountPage(el, {
    state: { tab: 'ALL', keyword: '' },
    load: async () => {
      const [plans, mine] = await Promise.all([coachApi.myPlans(), loadMyStudents()]);
      return { plans, classes: mine.classes, students: mine.students };
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      'new-plan': (t, e, ctx) => openPlanForm({
        classes: ctx.state.classes.filter(c => toDate(c.endTime) >= new Date()),
        members: ctx.state.students,
        onDone: () => ctx.reload()
      })
    }
  });
}
