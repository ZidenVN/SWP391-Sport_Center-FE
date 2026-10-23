import { html } from '../../core/dom.js';
import { pageHeader, tabs } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { planList, resultList, progressSummary } from '../../components/training.js';

function view(s) {
  return html`
    ${pageHeader('Tập luyện', 'Giáo án, kết quả và nhận xét từ huấn luyện viên')}
    ${tabs([
      { id: 'progress', label: 'Tiến độ' },
      { id: 'plans', label: 'Giáo án', count: s.plans.length },
      { id: 'results', label: 'Kết quả tập', count: s.results.length }
    ], s.tab)}
    ${s.tab === 'progress' ? progressSummary(s.progress) : ''}
    ${s.tab === 'plans' ? planList(s.plans, { emptyText: 'HLV chưa giao giáo án nào cho bạn' }) : ''}
    ${s.tab === 'results' ? resultList(s.results) : ''}`;
}

export default function MemberTraining(el, { query }) {
  return mountPage(el, {
    state: { tab: query.tab || 'progress' },
    load: () => settle({
      progress: [memberApi.progress, null],
      plans: [memberApi.workoutPlans, []],
      results: [memberApi.workoutResults, []]
    }),
    view,
    actions: { tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }) }
  });
}
