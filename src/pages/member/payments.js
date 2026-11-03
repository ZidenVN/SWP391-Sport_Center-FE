import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs, table } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { money, dateTime, date, badge, paymentMethodLabel } from '../../core/format.js';
import { openInvoice } from '../../components/invoice.js';

function view(s) {
  const payments = [...s.payments].sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate)));
  return html`
    ${pageHeader('Thanh toán', 'Lịch sử giao dịch và các gói đã đăng ký')}
    ${tabs([{ id: 'payments', label: 'Giao dịch', count: payments.length }, { id: 'subs', label: 'Gói đã đăng ký', count: s.subscriptions.length }], s.tab)}
    <div class="card">
      ${s.tab === 'payments' ? table({
        columns: [{ label: 'Mã' }, { label: 'Gói tập' }, { label: 'Số tiền', cls: 'text-right' }, { label: 'Phương thức' }, { label: 'Thời gian' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: payments.map(p => [
          html`<span class="font-mono text-xs">#${p.paymentId}</span>`,
          html`<span class="font-semibold">${p.packageName}</span>`,
          money(p.amount),
          paymentMethodLabel(p.paymentMethod),
          dateTime(p.paymentDate),
          badge(p.status),
          p.status === 'COMPLETED'
            ? html`<button type="button" class="btn-ghost btn-sm" data-action="invoice" data-id="${p.paymentId}">${icon('file-text', 'w-3.5 h-3.5')} Hóa đơn</button>`
            : ''
        ]),
        empty: 'Bạn chưa có giao dịch nào'
      }) : table({
        columns: [{ label: 'Gói tập' }, { label: 'Bắt đầu' }, { label: 'Hết hạn' }, { label: 'Số tiền', cls: 'text-right' }, { label: 'Trạng thái' }],
        rows: s.subscriptions.map(sub => [
          html`<span class="font-semibold">${sub.packageName}</span>${sub.currentClassName ? html`<div class="text-xs text-slate-500">Lớp ${sub.currentClassName}</div>` : ''}`,
          sub.startDate ? date(sub.startDate) : sub.status === 'WAITING_ACTIVATION' ? 'Chờ kích hoạt' : '—',
          date(sub.endDate),
          money(sub.amount),
          badge(sub.status)
        ]),
        empty: 'Bạn chưa đăng ký gói nào'
      })}
    </div>`;
}

export default function MemberPayments(el) {
  return mountPage(el, {
    state: { tab: 'payments' },
    load: () => settle({ payments: [memberApi.payments, []], subscriptions: [memberApi.subscriptions, []] }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      invoice: btn => openInvoice(() => memberApi.invoice(btn.dataset.id))
    }
  });
}
