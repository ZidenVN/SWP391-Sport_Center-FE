import { html, icon } from '../../core/dom.js';
import { tabs, emptyState } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { coachApi } from '../../api/endpoints.js';
import { fullName, genderLabel, phoneText } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { planList, resultList, progressSummary } from '../../components/training.js';
import { openPlanForm, openResultForm, openNotifyForm } from '../../components/coachForms.js';
import { openAiSuggest } from '../../components/aiSuggest.js';

function view(s) {
  const m = s.member;
  if (!m) return emptyState(s.memberError?.message || 'Không xem được hồ sơ học viên này', 'user-x');
  const body = {
    progress: () => progressSummary(s.progress),
    plans: () => planList(s.plans, { emptyText: 'Chưa giao giáo án cho học viên này' }),
    results: () => resultList(s.results, { editable: true, emptyText: 'Chưa ghi kết quả buổi tập nào' })
  }[s.tab]();
  return html`
    <a href="#/coach/students" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-3">${icon('arrow-left', 'w-4 h-4')} Học viên</a>
    <div class="card p-6 mb-6 flex flex-col md:flex-row md:items-center gap-5" data-testid="member-profile">
      ${memberAvatar(m, 'w-16 h-16 text-2xl')}
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-extrabold">${fullName(m)}</h1>
        <div class="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>#${m.memberId}</span><span>${genderLabel(m.gender)}</span>
          <span class="flex items-center gap-1">${icon('phone', 'w-3.5 h-3.5')} ${phoneText(m.phone)}</span>
          <span class="flex items-center gap-1">${icon('mail', 'w-3.5 h-3.5')} ${m.email}</span>
        </div>
        <div class="mt-3 text-sm rounded-xl bg-[#469B7E]/10 text-[#2F6B55] px-3 py-2 inline-flex items-center gap-2">
          ${icon('target', 'w-4 h-4')} <span><b>Mục tiêu:</b> ${m.trainingGoal || 'Chưa cập nhật'}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 md:flex-col md:items-stretch">
        <button type="button" class="btn-lime btn-sm" data-action="ai" data-testid="ai-suggest">${icon('sparkles', 'w-3.5 h-3.5')} Gợi ý bài tập AI</button>
        <button type="button" class="btn-primary btn-sm" data-action="new-result" data-testid="new-result">${icon('activity', 'w-3.5 h-3.5')} Ghi kết quả</button>
        <button type="button" class="btn-secondary btn-sm" data-action="new-plan" data-testid="new-plan">${icon('clipboard-plus', 'w-3.5 h-3.5')} Giao giáo án</button>
        <button type="button" class="btn-secondary btn-sm" data-action="notify" data-testid="notify-member">${icon('send', 'w-3.5 h-3.5')} Gửi thông báo</button>
      </div>
    </div>
    ${tabs([
      { id: 'progress', label: 'Tiến độ' },
      { id: 'plans', label: 'Giáo án', count: s.plans.length },
      { id: 'results', label: 'Kết quả tập', count: s.results.length }
    ], s.tab)}
    ${body}`;
}

export default function CoachMemberDetail(el, { params, query }) {
  const memberId = Number(params.id);
  return mountPage(el, {
    state: { tab: query?.tab || 'progress' },
    load: () => settle({
      member: [() => coachApi.member(memberId), null],
      progress: [() => coachApi.memberProgress(memberId), null],
      plans: [() => coachApi.memberPlans(memberId), []],
      results: [() => coachApi.memberResults(memberId), []]
    }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'new-result': (t, e, ctx) => openResultForm({
        member: ctx.state.member,
        onDone: () => { ctx.state.tab = 'results'; ctx.reload(); }
      }),
      'edit-result': (t, e, ctx) => openResultForm({
        member: ctx.state.member,
        result: ctx.state.results.find(r => String(r.resultId) === t.dataset.id),
        onDone: () => ctx.reload()
      }),
      'new-plan': (t, e, ctx) => openPlanForm({
        preset: { targetType: 'INDIVIDUAL', targetId: memberId, label: fullName(ctx.state.member) },
        onDone: () => { ctx.state.tab = 'plans'; ctx.reload(); }
      }),
      ai: (t, e, ctx) => openAiSuggest({
        member: ctx.state.member,
        onAssigned: () => { ctx.state.tab = 'plans'; ctx.reload(); }
      }),
      notify: (t, e, ctx) => openNotifyForm({
        title: `Gửi thông báo cho ${fullName(ctx.state.member)}`,
        send: payload => coachApi.notifyMember(memberId, payload)
      })
    }
  });
}
