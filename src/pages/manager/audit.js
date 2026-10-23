import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { auditApi } from '../../api/endpoints.js';
import { dateTime } from '../../core/format.js';
import { matches, searchBox } from '../../components/crud.js';

const PAGE_SIZE = 20;

const ACTION_STYLE = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-sky-50 text-sky-700',
  DELETE: 'bg-rose-50 text-rose-700',
  LOGIN: 'bg-slate-100 text-slate-600'
};
const actionStyle = a => ACTION_STYLE[a] || (/DELETE|CANCEL/.test(a) ? ACTION_STYLE.DELETE : /CREATE|REGISTER|SUBSCRIBE|ASSIGN|RECORD|MARK|SEND/.test(a) ? ACTION_STYLE.CREATE : 'bg-amber-50 text-amber-700');

function view(s) {
  const p = s.page;
  const rows = (p.content || []).filter(l => matches(s.keyword, [l.email, l.actionType, l.targetEntity, l.details]));
  const from = p.totalElements ? p.number * p.size + 1 : 0;
  const to = p.number * p.size + (p.numberOfElements || 0);
  return html`
    ${pageHeader('Nhật ký thao tác', 'Ai đã làm gì, lúc nào — ghi tự động cho các thao tác quan trọng')}
    <div class="card" data-testid="audit-table">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
        ${searchBox(s.keyword, 'Lọc trong trang này...')}
        <div class="text-sm text-slate-500">Tổng <b class="text-slate-800">${p.totalElements ?? 0}</b> bản ghi</div>
      </div>
      ${rows.length ? table({
        columns: [{ label: 'Thời gian' }, { label: 'Người thực hiện' }, { label: 'Hành động' }, { label: 'Đối tượng' }, { label: 'Chi tiết' }],
        rows: rows.map(l => [
          html`<span class="text-sm whitespace-nowrap">${dateTime(l.createdAt)}</span>`,
          html`<div class="text-sm font-semibold">${l.email || 'Hệ thống'}</div><div class="text-xs text-slate-400">${l.userId ? `#${l.userId}` : ''}</div>`,
          html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${actionStyle(l.actionType)}">${l.actionType}</span>`,
          html`<span class="text-sm">${l.targetEntity || '—'}${l.targetEntityId ? html` <span class="text-slate-400">#${l.targetEntityId}</span>` : ''}</span>`,
          html`<span class="text-sm text-slate-600">${l.details || '—'}</span>`
        ])
      }) : emptyState('Không có bản ghi', 'history')}
      <div class="flex items-center justify-between gap-3 p-4 border-t border-slate-100 text-sm">
        <span class="text-slate-500">${from}–${to} / ${p.totalElements ?? 0}</span>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${p.number - 1}" ${p.first ? 'disabled' : ''} data-testid="audit-prev">${icon('chevron-left', 'w-3.5 h-3.5')} Trước</button>
          <span class="font-semibold">Trang ${(p.number ?? 0) + 1}/${Math.max(p.totalPages || 1, 1)}</span>
          <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${p.number + 1}" ${p.last ? 'disabled' : ''} data-testid="audit-next">Sau ${icon('chevron-right', 'w-3.5 h-3.5')}</button>
        </div>
      </div>
    </div>`;
}

export default function ManagerAudit(el) {
  return mountPage(el, {
    state: { pageNo: 0, keyword: '' },
    load: async ctx => ({ page: await auditApi.list(ctx.state.pageNo, PAGE_SIZE) }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      page: (t, e, ctx) => { ctx.state.pageNo = Number(t.dataset.page); ctx.reload(); }
    }
  });
}
