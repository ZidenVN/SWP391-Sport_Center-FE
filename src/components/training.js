import { html, icon } from '../core/dom.js';
import { emptyState, statCard } from '../core/ui.js';
import { date, dateTime, badge } from '../core/format.js';

export function planList(plans, { emptyText = 'Chưa có giáo án nào' } = {}) {
  if (!plans?.length) return emptyState(emptyText, 'clipboard-list');
  return html`
    <div class="grid md:grid-cols-2 gap-4">
      ${plans.map(p => html`
        <div class="card p-5" data-testid="plan-card">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold text-slate-900">${p.planName}</div>
              <div class="text-xs text-slate-500 mt-0.5">HLV ${p.coachName} · ${badge(p.targetType)} ${p.targetName}</div>
            </div>
            ${badge(p.status)}
          </div>
          <p class="text-sm text-slate-700 mt-3 whitespace-pre-line">${p.exerciseDetails}</p>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-3">
            ${p.duration ? html`<span class="flex items-center gap-1">${icon('timer', 'w-3.5 h-3.5')} ${p.duration}</span>` : ''}
            <span class="flex items-center gap-1">${icon('calendar', 'w-3.5 h-3.5')} Giao ngày ${date(p.assignedDate)}</span>
            ${p.dueDate ? html`<span class="flex items-center gap-1">${icon('flag', 'w-3.5 h-3.5')} Hạn ${date(p.dueDate)}</span>` : ''}
          </div>
        </div>`)}
    </div>`;
}

// editable: hiện nút sửa (dành cho coach)
export function resultList(results, { editable = false, emptyText = 'Chưa có kết quả tập luyện' } = {}) {
  if (!results?.length) return emptyState(emptyText, 'activity');
  const sorted = [...results].sort((a, b) => String(b.loggedDate).localeCompare(String(a.loggedDate)));
  return html`
    <ol class="relative border-l-2 border-indigo-100 ml-2 space-y-5">
      ${sorted.map(r => html`
        <li class="ml-5" data-testid="result-item">
          <span class="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white"></span>
          <div class="card p-4">
            <div class="flex items-center justify-between gap-2">
              <div class="text-xs font-bold text-indigo-600">${dateTime(r.loggedDate)}</div>
              ${editable ? html`<button type="button" class="btn-ghost btn-sm" data-action="edit-result" data-id="${r.resultId}">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>` : ''}
            </div>
            <div class="text-sm text-slate-800 mt-1 whitespace-pre-line">${r.activityDetails}</div>
            ${r.coachFeedback ? html`
              <div class="mt-3 text-sm bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-900 flex gap-2">
                ${icon('message-square-quote', 'w-4 h-4 shrink-0 mt-0.5')}<span class="whitespace-pre-line">${r.coachFeedback}</span>
              </div>` : ''}
          </div>
        </li>`)}
    </ol>`;
}

export function progressSummary(p) {
  if (!p) return emptyState('Chưa có dữ liệu tiến độ', 'trending-up');
  return html`
    <div class="space-y-5">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${statCard('Buổi đã tham gia', p.totalSessionAttended ?? 0, 'calendar-check', 'emerald')}
        ${statCard('Giáo án được giao', p.totalPlansAssigned ?? 0, 'clipboard-list', 'indigo')}
        ${statCard('Đang thực hiện', p.inProgressPlans ?? 0, 'loader', 'amber')}
        ${statCard('Đã hoàn thành', p.completedPlans ?? 0, 'check-circle-2', 'sky')}
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="card p-5">
          <div class="text-xs font-bold uppercase text-slate-400">Mục tiêu tập luyện</div>
          <div class="text-slate-800 mt-1 font-semibold">${p.trainingGoal || 'Chưa cập nhật'}</div>
        </div>
        <div class="card p-5">
          <div class="text-xs font-bold uppercase text-slate-400">Nhận xét gần nhất của HLV</div>
          <div class="text-slate-800 mt-1">${p.lastestCoachFeedback || 'Chưa có nhận xét'}</div>
        </div>
      </div>
    </div>`;
}
