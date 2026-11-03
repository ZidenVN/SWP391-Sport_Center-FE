import { html, raw } from '../core/dom.js';
import { openModal, loading, errorState, toast } from '../core/ui.js';
import { money, dateTime, date, paymentMethodLabel, badge } from '../core/format.js';
import { LOGO_SRC } from './brand.js';

function invoiceBody(inv) {
  return html`
    <div id="invoice-print" class="text-sm">
      <div class="flex items-start justify-between mb-5">
        <div class="flex items-center gap-3">
          <!-- hóa đơn được in ở cửa sổ riêng -> đường dẫn ảnh phải tuyệt đối -->
          <img src="${new URL(LOGO_SRC, window.location.origin).href}" alt="Sport Center" class="w-12 h-12 rounded-[22%]" />
          <div>
          <div class="font-black text-lg">SPORT CENTER</div>
          <div class="text-xs text-slate-500">Hóa đơn thanh toán gói tập</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold" data-testid="invoice-number">${inv.invoiceNumber}</div>
          <div class="text-xs text-slate-500">${dateTime(inv.issuedAt)}</div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div class="text-[11px] uppercase font-bold text-slate-400">Khách hàng</div>
          <div class="font-semibold">${inv.memberName}</div>
          <div class="text-slate-500">${inv.memberEmail}</div>
          <div class="text-slate-500">${inv.memberPhone}</div>
        </div>
        <div>
          <div class="text-[11px] uppercase font-bold text-slate-400">Thanh toán</div>
          <div>${paymentMethodLabel(inv.paymentMethod)}</div>
          <div class="mt-1">${badge(inv.paymentStatus)}</div>
        </div>
      </div>
      <table class="w-full border-t border-b border-slate-200 my-3">
        <tr class="text-left text-xs text-slate-500"><th class="py-2">Gói tập</th><th>Thời hạn</th><th class="text-right">Thành tiền</th></tr>
        <tr class="border-t border-slate-100">
          <td class="py-2 font-semibold">${inv.packageName}</td>
          <td>${inv.durationDays} ngày<div class="text-xs text-slate-500">${inv.startDate ? `${date(inv.startDate)} → ${date(inv.endDate)}` : 'Chờ kích hoạt'}</div></td>
          <td class="text-right font-semibold">${money(inv.amount)}</td>
        </tr>
      </table>
      <div class="flex justify-between font-extrabold text-base mt-3"><span>Tổng cộng</span><span>${money(inv.amount)}</span></div>
    </div>
    <div class="flex justify-end gap-2 mt-6">
      <button type="button" data-action="cancel" class="btn-secondary">Đóng</button>
      <button type="button" data-action="print" class="btn-primary">${raw('<i data-lucide="printer" class="w-4 h-4"></i>')} In hóa đơn</button>
    </div>`;
}

function printInvoice(node) {
  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) {
    toast('Trình duyệt chặn cửa sổ in, hãy cho phép pop-up.', 'warning');
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Hóa đơn</title>
    <script src="https://cdn.tailwindcss.com/3.4.16"><\/script></head>
    <body class="p-10 font-sans">${node.outerHTML}<script>setTimeout(()=>{window.print();},600)<\/script></body></html>`);
  w.document.close();
}

// fetcher: () => Promise<InvoiceResponseDTO>
export function openInvoice(fetcher) {
  const modal = openModal({
    title: 'Hóa đơn',
    size: 'max-w-xl',
    body: loading('Đang tải hóa đơn...'),
    actions: {
      print: () => printInvoice(modal.el.querySelector('#invoice-print')),
      reload: () => load()
    }
  });
  const load = () => fetcher()
    .then(inv => modal.setBody(invoiceBody(inv)))
    .catch(err => modal.setBody(errorState(err)));
  load();
  return modal;
}
