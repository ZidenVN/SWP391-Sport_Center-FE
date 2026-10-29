import { html, icon } from '../../core/dom.js';
import { toast } from '../../core/ui.js';
import { managerPaymentApi } from '../../api/endpoints.js';
import { money, paymentMethodLabel, dateTime } from '../../core/format.js';
import { mountPaymentBoard, reasonModal } from '../../components/paymentBoard.js';

// Quản lý: tra cứu mọi giao dịch, xuất CSV theo bộ lọc, hoàn tiền giao dịch đã thanh toán (gói của giao dịch bị hủy theo)
export default function ManagerPayments(el) {
  return mountPaymentBoard(el, {
    title: 'Giao dịch',
    subtitle: 'Tra cứu thanh toán, xuất báo cáo CSV và hoàn tiền',
    list: q => managerPaymentApi.list(q),
    filterExtra: html`<button type="button" class="btn-secondary" data-action="export" data-testid="payment-export">${icon('download', 'w-4 h-4')} CSV</button>`,
    rowActions: p => (p.status === 'COMPLETED'
      ? html`<button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" data-action="refund" data-id="${p.paymentId}" data-testid="row-refund">${icon('undo-2', 'w-3.5 h-3.5')} Hoàn tiền</button>`
      : ''),
    actions: {
      export: async (btn, e, ctx) => {
        const f = ctx.state.filters;
        btn.disabled = true;
        try {
          await managerPaymentApi.exportCsv({ ...f, keyword: f.keyword.trim() }, `giao-dich_${f.fromDate || 'all'}_${f.toDate || 'all'}.csv`);
        } catch (err) {
          toast(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      },
      refund: (t, e, ctx) => {
        const p = ctx.state.page.content.find(x => String(x.paymentId) === t.dataset.id);
        reasonModal({
          title: `Hoàn tiền giao dịch #${p.paymentId}`,
          intro: html`
            <div class="rounded-xl bg-brand-sand/70 p-3 text-sm space-y-1">
              <div class="flex justify-between"><span class="text-slate-500">Hội viên</span><b>${p.memberName}</b></div>
              <div class="flex justify-between"><span class="text-slate-500">Gói</span><b>${p.packageName}</b></div>
              <div class="flex justify-between"><span class="text-slate-500">Số tiền</span><b>${money(p.amount)} · ${paymentMethodLabel(p.paymentMethod)}</b></div>
              <div class="flex justify-between"><span class="text-slate-500">Thanh toán lúc</span><b>${dateTime(p.paidAt || p.paymentDate)}</b></div>
            </div>
            <div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Gói tập của giao dịch này sẽ bị hủy và khoản tiền không còn tính vào doanh thu. Các lớp hội viên đã đặt bằng gói này mà chưa diễn ra cũng bị hủy để trả chỗ; hội viên nhận thông báo.</div>`,
          submitText: 'Xác nhận hoàn tiền', success: 'Đã hoàn tiền giao dịch',
          submit: reason => managerPaymentApi.refund(p.paymentId, reason),
          onDone: () => ctx.reload()
        });
      }
    }
  });
}
