import { html, render, icon, bindActions } from '../../core/dom.js';
import { loading } from '../../core/ui.js';
import { vnpayApi, memberApi } from '../../api/endpoints.js';
import { money, date, dateTime, paymentMethodLabel } from '../../core/format.js';
import { checkoutSteps, vnpayReason, vnpayMark } from '../../components/billing.js';
import { openInvoice } from '../../components/invoice.js';
import { brandMark } from '../../components/brand.js';

function detailRow(label, value, testid) {
  if (value === null || value === undefined || value === '') return '';
  return html`<div class="flex justify-between gap-4 py-2.5"><dt class="text-slate-500">${label}</dt><dd class="font-semibold text-right" ${testid ? html`data-testid="${testid}"` : ''}>${value}</dd></div>`;
}

// r: { success, title, message, amount, rows: [[label, value]], paymentId, canInvoice }
function receipt(r, { loggedIn }) {
  const ok = r.success;
  return html`
    <div class="max-w-xl mx-auto ${loggedIn ? '' : 'py-10 px-4'}">
      ${loggedIn ? checkoutSteps(2, { failed: !ok }) : html`
        <div class="flex items-center justify-center gap-2 mb-8">
          ${brandMark('w-10 h-10')}
          <span class="font-extrabold tracking-tight">SPORT CENTER</span>
        </div>`}
      <div class="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden" data-testid="payment-result" data-success="${ok}">
        <div class="px-8 pt-10 pb-8 text-center relative overflow-hidden ${ok ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-gradient-to-b from-rose-50 to-white'}">
          <div class="relative mx-auto w-20 h-20">
            <span class="absolute inset-0 rounded-full ${ok ? 'bg-emerald-400/30' : 'bg-rose-400/30'} animate-ping [animation-iteration-count:2]"></span>
            <span class="relative w-20 h-20 rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'} text-white flex items-center justify-center shadow-lg">
              ${icon(ok ? 'check' : 'x', 'w-10 h-10')}
            </span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 mt-6">${r.title}</h1>
          <p class="text-sm text-slate-600 mt-2">${r.message}</p>
          ${r.amount ? html`<div class="text-4xl font-black text-slate-900 mt-5" data-testid="paid-amount">${money(r.amount)}</div>` : ''}
        </div>

        ${r.rows.length ? html`
          <div class="px-8 relative">
            <div class="border-t-2 border-dashed border-slate-200"></div>
            <span class="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></span>
            <span class="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></span>
          </div>
          <dl class="px-8 py-4 text-sm divide-y divide-slate-100">
            ${r.rows.map(([label, value, testid]) => detailRow(label, value, testid))}
          </dl>` : ''}

        <div class="px-8 pb-8 pt-2">
          ${loggedIn ? html`
            <div class="grid sm:grid-cols-2 gap-3">
              ${ok ? html`
                ${r.canInvoice ? html`<button type="button" class="btn-secondary !py-3" data-action="invoice" data-id="${r.paymentId}">${icon('file-text', 'w-4 h-4')} Xem hóa đơn</button>` : html`<a href="#/member/payments" class="btn-secondary !py-3">${icon('history', 'w-4 h-4')} Lịch sử thanh toán</a>`}
                <a href="#/member/classes" class="btn-primary !py-3">${icon('calendar-plus', 'w-4 h-4')} Đặt lớp ngay</a>` : html`
                <a href="#/member/payments" class="btn-secondary !py-3">${icon('history', 'w-4 h-4')} Lịch sử thanh toán</a>
                <a href="#/member/packages" class="btn-primary !py-3">${icon('refresh-cw', 'w-4 h-4')} Thử lại</a>`}
            </div>` : html`
            <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex gap-3">
              ${icon('monitor-smartphone', 'w-5 h-5 shrink-0 text-emerald-600')}
              <span>${ok ? 'Bạn có thể quay lại màn hình máy tính, trang thanh toán sẽ tự cập nhật.' : 'Quay lại màn hình máy tính để tạo mã mới và thử lại.'}</span>
            </div>
            <a href="#/login" class="btn-secondary w-full mt-3">Đăng nhập trên thiết bị này</a>`}
        </div>
      </div>
      <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">${icon('shield-check', 'w-3.5 h-3.5')} Giao dịch được xử lý bởi ${vnpayMark('text-xs')}</div>
    </div>`;
}

async function fromInvoice(paymentId, base) {
  try {
    const inv = await memberApi.invoice(paymentId);
    return {
      ...base,
      amount: inv.amount,
      canInvoice: true,
      rows: [
        ['Gói tập', inv.packageName, 'paid-package'],
        ['Thời hạn', `${date(inv.startDate)} → ${date(inv.endDate)}`, 'paid-until'],
        ['Phương thức', paymentMethodLabel(inv.paymentMethod)],
        ...base.rows,
        ['Số hóa đơn', inv.invoiceNumber],
        ['Thời gian', dateTime(inv.issuedAt)]
      ]
    };
  } catch {
    return base;
  }
}

export default async function PaymentResult(el, { search, query, loggedIn }) {
  const show = r => render(el, receipt(r, { loggedIn }));
  const unbind = bindActions(el, { invoice: btn => openInvoice(() => memberApi.invoice(btn.dataset.id)) });

  // Trường hợp 1: đã thanh toán qua QR trên điện thoại, trang checkout trên máy tính chuyển sang đây
  if (query.paymentId && loggedIn) {
    render(el, loading('Đang tải giao dịch...'));
    const paymentId = Number(query.paymentId);
    const p = await vnpayApi.paymentStatus(paymentId).catch(() => null);
    const ok = p?.status === 'COMPLETED';
    const base = {
      success: ok,
      title: ok ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất',
      message: ok ? 'Gói tập đã được ghi nhận, sẽ kích hoạt khi bạn check-in lần đầu hoặc đăng ký lớp.' : 'Không tìm thấy giao dịch thành công.',
      paymentId,
      rows: [['Mã thanh toán', `#${paymentId}`]]
    };
    show(ok ? await fromInvoice(paymentId, base) : base);
    return unbind;
  }

  // Trường hợp 2: VNPay chuyển về kèm vnp_* -> gửi nguyên query cho BE xác thực chữ ký
  if (!search || !search.includes('vnp_')) {
    show({ success: false, title: 'Không có thông tin giao dịch', message: 'Trang này dùng để nhận kết quả trả về từ VNPay.', rows: [] });
    return unbind;
  }

  render(el, loading('Đang xác nhận giao dịch với hệ thống...'));
  const amountFromVnp = query.vnp_Amount ? Number(query.vnp_Amount) / 100 : null;
  let paidId = null;
  try {
    const res = await vnpayApi.callback(search);
    paidId = res.paymentId;
    const ok = Boolean(res.success);
    const code = res.responseCode || query.vnp_ResponseCode;
    const base = {
      success: ok,
      title: ok ? 'Thanh toán thành công' : 'Thanh toán không thành công',
      message: ok ? 'Gói tập đã được ghi nhận, sẽ kích hoạt khi bạn check-in lần đầu hoặc đăng ký lớp.' : (vnpayReason(code) || res.message),
      amount: amountFromVnp,
      paymentId: res.paymentId,
      rows: [
        ['Mã giao dịch VNPay', res.transactionNo || query.vnp_TransactionNo, 'vnp-transaction'],
        ['Ngân hàng', query.vnp_BankCode],
        ['Mã thanh toán', res.paymentId ? `#${res.paymentId}` : null]
      ].filter(([, v]) => v)
    };
    show(ok && loggedIn && res.paymentId ? await fromInvoice(res.paymentId, base) : base);
  } catch (err) {
    show({ success: false, title: 'Không xác nhận được giao dịch', message: err.message, amount: amountFromVnp, rows: [] });
  } finally {
    // bỏ query vnp_* khỏi URL để reload không gửi lại; giữ paymentId để F5 vẫn xem được kết quả thật
    window.history.replaceState(null, '', paidId ? `#/member/payment-result?paymentId=${paidId}` : '#/member/payment-result?done=1');
  }
  return unbind;
}
