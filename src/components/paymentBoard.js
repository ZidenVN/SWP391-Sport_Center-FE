import { html, icon, readForm } from '../core/dom.js';
import { pageHeader, table, emptyState, field, input, textarea, toast } from '../core/ui.js';
import { mountPage } from '../core/page.js';
import { money, dateTime, badge, paymentMethodLabel, isoDate } from '../core/format.js';
import { openFormModal } from './crud.js';
import { pagination, pagerActions, DEFAULT_PAGE_SIZE } from './pagination.js';

// Danh sách giao dịch có lọc + phân trang phía BE, dùng chung cho Quản lý (/manager/payments) và Lễ tân (/receptionist/payments).
// rowActions(payment) -> html các nút; actions: handler bổ sung (refund, confirm, invoice...)
const STATUSES = [['', 'Mọi trạng thái'], ['COMPLETED', 'Hoàn tất'], ['PENDING', 'Chờ thanh toán'], ['CANCELLED', 'Đã hủy'], ['REFUNDED', 'Đã hoàn tiền'], ['FAILED', 'Thất bại']];
const METHODS = [['', 'Mọi phương thức'], ['CASH', 'Tiền mặt'], ['BANK_TRANSFER', 'Chuyển khoản'], ['CARD', 'Thẻ'], ['E_WALLET', 'Ví điện tử'], ['VNPAY', 'VNPay']];

const options = (list, selected) => list.map(([v, l]) => html`<option value="${v}" ${v === selected ? 'selected' : ''}>${l}</option>`);

function filterBar(f, extra) {
  return html`
    <form class="card p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.4fr)_auto] gap-3 items-end" data-action="filter" data-testid="payment-filter" novalidate>
      ${field('Từ ngày', input('fromDate', { type: 'date', value: f.fromDate }))}
      ${field('Đến ngày', input('toDate', { type: 'date', value: f.toDate }))}
      ${field('Trạng thái', html`<select class="input" name="status">${options(STATUSES, f.status)}</select>`)}
      ${field('Phương thức', html`<select class="input" name="method">${options(METHODS, f.method)}</select>`)}
      ${field('Hội viên', input('keyword', { value: f.keyword, placeholder: 'Tên, email hoặc SĐT' }))}
      <div class="flex gap-2">
        <button type="submit" class="btn-primary" data-testid="payment-apply">${icon('filter', 'w-4 h-4')} Lọc</button>
        ${extra || ''}
      </div>
    </form>`;
}

export function defaultFilters() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 86400000);
  return { fromDate: isoDate(from), toDate: isoDate(to), status: '', method: '', keyword: '' };
}

export function mountPaymentBoard(el, { title, subtitle, list, headerActions = '', filterExtra = '', rowActions, actions = {}, initial = {} }) {
  const view = s => {
    const page = s.page;
    const rows = page?.content || [];
    return html`
      ${pageHeader(title, subtitle, headerActions)}
      ${filterBar(s.filters, filterExtra)}
      <div class="card" data-testid="payment-table">
        ${rows.length ? html`${table({
          // không xuống dòng: trên điện thoại bảng cuộn ngang gọn gàng thay vì bóp chữ thành nhiều dòng
          columns: [{ label: 'Mã' }, { label: 'Hội viên', cls: 'whitespace-nowrap' }, { label: 'Gói', cls: 'whitespace-nowrap' }, { label: 'Số tiền', cls: 'text-right whitespace-nowrap' }, { label: 'Phương thức', cls: 'whitespace-nowrap' }, { label: 'Thời gian', cls: 'whitespace-nowrap' }, { label: 'Trạng thái', cls: 'whitespace-nowrap' }, { label: '', cls: 'text-right whitespace-nowrap' }],
          rows: rows.map(p => [
            html`<span class="font-mono text-xs text-slate-500">#${p.paymentId}</span>`,
            html`<div class="font-semibold">${p.memberName || '—'}</div><div class="text-xs text-slate-500">#${p.memberId ?? '—'}</div>`,
            p.packageName || '—',
            html`<b>${money(p.amount)}</b>`,
            html`<div>${paymentMethodLabel(p.paymentMethod)}</div>${p.transactionRef ? html`<div class="text-[11px] font-mono text-slate-400">${p.transactionRef}</div>` : ''}`,
            html`<div class="text-sm">${dateTime(p.paidAt || p.paymentDate)}</div>${p.confirmedBy ? html`<div class="text-[11px] text-slate-400">Thu bởi ${p.confirmedBy}</div>` : ''}`,
            html`${badge(p.status)}${p.note && p.status !== 'COMPLETED' ? html`<div class="text-[11px] text-slate-400 mt-0.5 max-w-[12rem] truncate" title="${p.note}">${p.note}</div>` : ''}`,
            html`<div class="flex justify-end gap-1">${rowActions ? rowActions(p) : ''}</div>`
          ])
        })}${pagination(page, { unit: 'giao dịch' })}` : emptyState('Không có giao dịch phù hợp bộ lọc', 'receipt')}
      </div>`;
  };

  return mountPage(el, {
    state: { filters: { ...defaultFilters(), ...initial }, pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async ctx => {
      const f = ctx.state.filters;
      if (f.fromDate && f.toDate && f.fromDate > f.toDate) throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
      return { page: await list({ ...f, keyword: f.keyword.trim(), page: ctx.state.pageNo, size: ctx.state.pageSize }) };
    },
    view,
    actions: {
      filter: (form, e, ctx) => {
        const f = readForm(form);
        if (f.fromDate && f.toDate && f.fromDate > f.toDate) {
          toast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
          return;
        }
        ctx.state.filters = { fromDate: f.fromDate, toDate: f.toDate, status: f.status, method: f.method, keyword: f.keyword || '' };
        ctx.state.pageNo = 0;
        ctx.reload();
      },
      ...pagerActions({ server: true }),
      ...actions
    }
  });
}

// Hộp nhập lý do dùng cho hoàn tiền / hủy giao dịch
export function reasonModal({ title, intro, submitText, success, submit, onDone }) {
  return openFormModal({
    title, submitText, success,
    fields: html`
      ${intro}
      ${field('Lý do', textarea('reason', '', { rows: 3, required: true, placeholder: 'Bắt buộc, lưu vào giao dịch để đối soát' }))}`,
    validate: d => {
      const r = String(d.reason || '').trim();
      if (!r) return { reason: 'Vui lòng nhập lý do' };
      return r.length > 500 ? { reason: 'Tối đa 500 ký tự' } : {};
    },
    submit: d => submit(String(d.reason).trim()),
    onDone
  });
}
