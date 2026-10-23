import { html, icon, readForm } from '../../core/dom.js';
import { field, input, withBusy, toast, showFormErrors, openModal } from '../../core/ui.js';
import { receptionApi } from '../../api/endpoints.js';
import { money, paymentMethodLabel } from '../../core/format.js';
import { mountPaymentBoard, reasonModal } from '../../components/paymentBoard.js';
import { openInvoice } from '../../components/invoice.js';

// Lễ tân: giao dịch tại quầy. Khoản PENDING thu tiền mặt / chuyển khoản / thẻ thì xác nhận hoặc hủy;
// VNPay chỉ được cổng thanh toán xác nhận nên không có nút.
const ONLINE = ['VNPAY'];

function rowActions(p) {
  const btn = (action, ic, label, cls = '') => html`<button type="button" class="btn-ghost btn-sm ${cls}" data-action="${action}" data-id="${p.paymentId}" data-testid="row-${action}">${icon(ic, 'w-3.5 h-3.5')} ${label}</button>`;
  if (p.status === 'PENDING' && !ONLINE.includes(p.paymentMethod)) {
    return html`${btn('confirm', 'check', 'Đã thu', 'text-emerald-700 hover:bg-emerald-50')}${btn('void', 'x', 'Hủy', 'text-rose-600 hover:bg-rose-50')}`;
  }
  if (p.status === 'COMPLETED') return btn('invoice', 'printer', 'Hóa đơn');
  return '';
}

function confirmModal(p, onDone) {
  const needRef = p.paymentMethod === 'BANK_TRANSFER';
  const modal = openModal({
    title: `Xác nhận đã thu #${p.paymentId}`,
    body: html`
      <form data-action="save" class="space-y-4" novalidate data-testid="confirm-form">
        <div class="rounded-xl bg-brand-sand/70 p-3 text-sm space-y-1">
          <div class="flex justify-between"><span class="text-slate-500">Hội viên</span><b>${p.memberName}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Gói</span><b>${p.packageName}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Cần thu</span><b>${money(p.amount)} · ${paymentMethodLabel(p.paymentMethod)}</b></div>
        </div>
        ${needRef ? field('Mã giao dịch ngân hàng', input('transactionRef', { required: true, placeholder: 'VD: FT2610231234', attrs: 'maxlength="100"' })) : ''}
        ${field('Ghi chú', input('note', { placeholder: 'Không bắt buộc', attrs: 'maxlength="500"' }))}
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" data-action="cancel" class="btn-secondary">Đóng</button>
          <button type="submit" class="btn-primary" data-testid="confirm-submit">${icon('check', 'w-4 h-4')} Xác nhận đã thu</button>
        </div>
      </form>`,
    actions: {
      save: async form => {
        const d = readForm(form);
        const ref = String(d.transactionRef || '').trim();
        showFormErrors(form, { fields: needRef && !ref ? { transactionRef: 'Chuyển khoản phải nhập mã giao dịch' } : {} });
        if (needRef && !ref) return;
        const res = await withBusy(form, () => receptionApi.confirmPayment(p.paymentId, { transactionRef: ref || undefined, note: String(d.note || '').trim() || undefined }));
        if (res) {
          toast('Đã xác nhận thu tiền, gói tập đã kích hoạt');
          modal.close();
          onDone();
        }
      }
    }
  });
}

export default function ReceptionPayments(el) {
  const find = (ctx, id) => ctx.state.page.content.find(x => String(x.paymentId) === id);
  return mountPaymentBoard(el, {
    title: 'Giao dịch',
    subtitle: 'Các khoản thu tại quầy: xác nhận khoản chờ thu, hủy giao dịch và in hóa đơn',
    list: q => receptionApi.allPayments(q),
    rowActions,
    actions: {
      confirm: (t, e, ctx) => confirmModal(find(ctx, t.dataset.id), () => ctx.reload()),
      void: (t, e, ctx) => {
        const p = find(ctx, t.dataset.id);
        reasonModal({
          title: `Hủy giao dịch #${p.paymentId}`,
          intro: html`<div class="text-sm text-slate-600">${p.memberName} · ${p.packageName} · <b>${money(p.amount)}</b>. Gói đang chờ của giao dịch này cũng bị hủy.</div>`,
          submitText: 'Hủy giao dịch', success: 'Đã hủy giao dịch',
          submit: reason => receptionApi.cancelPayment(p.paymentId, reason),
          onDone: () => ctx.reload()
        });
      },
      invoice: (t, e, ctx) => openInvoice(() => receptionApi.invoice(Number(t.dataset.id)))
    }
  });
}
