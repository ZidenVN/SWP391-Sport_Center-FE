import { html } from '../../core/dom.js';
import { pageHeader, table, emptyState } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { auditApi } from '../../api/endpoints.js';
import { dateTime } from '../../core/format.js';
import { matches, searchBox } from '../../components/crud.js';
import { pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

const ACTION_STYLE = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-sky-50 text-sky-700',
  DELETE: 'bg-rose-50 text-rose-700',
  LOGIN: 'bg-slate-100 text-slate-600'
};
// BE ghép sẵn "HH:mm ngày dd/MM/yyyy · <Vai trò> <Họ tên> đã ..."; cột thời gian đã có nên bỏ phần giờ ở đầu
const sentence = l => (l.description || '').replace(/^\d{2}:\d{2} ngày \d{2}\/\d{2}\/\d{4} · /, '');
// log cũ (trước khi có mô tả) chỉ có câu kỹ thuật "Thực hiện thành công hàm: ..."
const isTechnical = text => /^Thực hiện thành công hàm/.test(text);

const actionStyle =a => ACTION_STYLE[a] || (/DELETE|CANCEL/.test(a) ? ACTION_STYLE.DELETE : /CREATE|REGISTER|SUBSCRIBE|ASSIGN|RECORD|MARK|SEND/.test(a) ? ACTION_STYLE.CREATE : 'bg-amber-50 text-amber-700');

function view(s) {
  const p = s.page;
  const rows = (p.content || []).filter(l => matches(s.keyword, [l.email, l.actionType, l.targetEntity, l.details, l.description]));
  return html`
    ${pageHeader('Nhật ký thao tác', 'Ai đã làm gì, lúc nào — ghi tự động cho các thao tác quan trọng')}
    <div class="card" data-testid="audit-table">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
        ${searchBox(s.keyword, 'Lọc trong trang này: nội dung, email...')}
        <div class="text-sm text-slate-500">Tổng <b class="text-slate-800">${p.totalElements ?? 0}</b> bản ghi</div>
      </div>
      ${rows.length ? table({
        columns: [{ label: 'Thời gian' }, { label: 'Nội dung' }, { label: 'Hành động' }, { label: 'Đối tượng' }],
        rows: rows.map(l => {
          const text = sentence(l) || l.details || '—';
          return [
            html`<span class="text-sm whitespace-nowrap">${dateTime(l.createdAt)}</span>`,
            html`<div class="text-sm ${isTechnical(text) ? 'text-slate-500' : 'font-semibold text-slate-800'}" title="${l.details || ''}">${text}</div>
              <div class="text-xs text-slate-400 mt-0.5">${l.email || 'Hệ thống'}${l.userId ? ` · #${l.userId}` : ''}</div>`,
            html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${actionStyle(l.actionType)}">${l.actionType}</span>`,
            html`<span class="text-sm">${l.targetEntity || '—'}${l.targetEntityId ? html` <span class="text-slate-400">#${l.targetEntityId}</span>` : ''}</span>`
          ];
        })
      }) : emptyState('Không có bản ghi', 'history')}
      ${pagination(p, { unit: 'bản ghi' })}
    </div>`;
}

export default function ManagerAudit(el) {
  return mountPage(el, {
    state: { pageNo: 0, pageSize: DEFAULT_PAGE_SIZE, keyword: '' },
    load: async ctx => ({ page: await auditApi.list(ctx.state.pageNo, ctx.state.pageSize) }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      ...pagerActions({ server: true })
    }
  });
}
