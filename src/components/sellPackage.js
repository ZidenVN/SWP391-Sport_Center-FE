import { html, raw, icon } from '../core/dom.js';
import { openModal, loading, errorState, toast } from '../core/ui.js';
import { packageApi, receptionApi } from '../api/endpoints.js';
import { money, date, fullName, phoneText } from '../core/format.js';
import { renewalWindow } from './billing.js';
import { openInvoice } from './invoice.js';

const METHODS = [
  { id: 'CASH', icon: 'banknote', label: 'Tiền mặt' },
  { id: 'BANK_TRANSFER', icon: 'landmark', label: 'Chuyển khoản' },
  { id: 'CARD', icon: 'credit-card', label: 'Quẹt thẻ' },
  { id: 'E_WALLET', icon: 'wallet', label: 'Ví điện tử' }
];

const QUICK_CASH = [100000, 200000, 500000, 1000000];

// Hộp bán / gia hạn gói tại quầy. onDone(subscription) gọi sau khi bán thành công.
export function openSellPackage({ member, onDone, packageId: preselect }) {
  const st = { packages: [], subscriptions: [], packageId: null, method: 'CASH', cash: '', ref: '', busy: false, error: null, sold: null };

  const pkg = () => st.packages.find(p => p.packageId === st.packageId);

  function cashBlock(p) {
    if (st.method !== 'CASH' || !p) return '';
    const received = Number(st.cash || 0);
    const change = received - p.price;
    return html`
      <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-4" data-testid="cash-block">
        <label class="block text-xs font-bold text-slate-600 mb-1">Khách đưa</label>
        <div class="flex gap-2">
          <input class="input text-right font-mono" name="cash" data-action="cash" data-live inputmode="numeric" placeholder="0" value="${st.cash}" />
          <span class="self-center text-sm font-bold text-slate-500">₫</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <button type="button" class="btn-ghost btn-sm border border-slate-200 bg-white" data-action="cash-quick" data-value="${p.price}">Đủ tiền</button>
          ${QUICK_CASH.filter(v => v >= p.price).slice(0, 3).map(v => html`<button type="button" class="btn-ghost btn-sm border border-slate-200 bg-white" data-action="cash-quick" data-value="${v}">${money(v)}</button>`)}
        </div>
        <div class="flex justify-between mt-3 text-sm">
          <span class="text-slate-500">Tiền thối lại</span>
          <span class="font-extrabold ${received && change < 0 ? 'text-rose-600' : 'text-emerald-700'}" data-testid="change">
            ${!received ? '—' : change < 0 ? `Thiếu ${money(-change)}` : money(change)}
          </span>
        </div>
      </div>`;
  }

  // BE bắt buộc mã giao dịch khi xác nhận chuyển khoản (để đối soát)
  function refBlock() {
    if (st.method !== 'BANK_TRANSFER') return '';
    return html`
      <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-4" data-testid="ref-block">
        <label class="block text-xs font-bold text-slate-600 mb-1">Mã giao dịch ngân hàng</label>
        <input class="input font-mono" name="ref" data-action="ref" data-live maxlength="100" placeholder="VD: FT2610231234" value="${st.ref}" data-testid="sell-ref" />
      </div>`;
  }

  const refMissing = () => st.method === 'BANK_TRANSFER' && !st.ref.trim();

  function formView() {
    const p = pkg();
    const win = p ? renewalWindow(st.subscriptions, p.durationDays) : null;
    const active = st.packages.filter(x => x.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays);
    const cashShort = st.method === 'CASH' && p && Number(st.cash || 0) < p.price;
    const blocked = cashShort || refMissing();
    return html`
      <div class="flex items-center gap-3 rounded-2xl bg-teal-50 border border-teal-100 p-3 mb-5">
        <span class="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center">${(member.firstName || '?').charAt(0)}</span>
        <div class="min-w-0"><div class="font-bold">${fullName(member)}</div><div class="text-xs text-slate-600">#${member.memberId} · ${phoneText(member.phone)}</div></div>
      </div>

      <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">1. Chọn gói</div>
      <div class="grid sm:grid-cols-2 gap-3" data-testid="sell-packages">
        ${active.map(x => {
          const on = x.packageId === st.packageId;
          return html`
            <button type="button" data-action="pick-package" data-id="${x.packageId}" data-testid="sell-package-${x.packageId}"
              class="text-left rounded-2xl border-2 p-4 transition-colors ${on ? 'border-teal-600 bg-teal-50/60' : 'border-slate-200 hover:border-slate-300'}">
              <div class="flex justify-between items-start gap-2">
                <span class="font-bold text-sm">${x.packageName}</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100">${x.durationDays} ngày</span>
              </div>
              <div class="text-xl font-black mt-2">${money(x.price)}</div>
            </button>`;
        })}
      </div>

      <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">2. Phương thức thanh toán</div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
        ${METHODS.map(m => {
          const on = m.id === st.method;
          return html`
            <button type="button" role="radio" aria-checked="${on}" data-action="pick-method" data-method="${m.id}" data-testid="sell-method-${m.id}"
              class="rounded-xl border-2 py-3 px-2 flex flex-col items-center gap-1.5 text-xs font-bold ${on ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}">
              ${icon(m.icon, 'w-5 h-5')} ${m.label}
            </button>`;
        })}
      </div>
      ${cashBlock(p)}
      ${refBlock()}

      ${p ? html`
        <div class="rounded-2xl border border-slate-200 p-4 mt-5 text-sm space-y-1.5" data-testid="sell-summary">
          <div class="flex justify-between"><span class="text-slate-500">Loại giao dịch</span><b>${win.isRenewal ? 'Gia hạn nối tiếp' : 'Đăng ký mới'}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Hiệu lực</span><b>${date(win.start)} → ${date(win.end)}</b></div>
          <div class="flex justify-between items-end pt-2 mt-2 border-t border-dashed border-slate-200">
            <span class="font-bold">Tổng thu</span><span class="text-2xl font-black">${money(p.price)}</span>
          </div>
        </div>` : ''}
      ${st.error ? html`<div class="mt-4 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3" role="alert">${st.error}</div>` : ''}

      <div class="flex justify-end gap-2 mt-6">
        <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
        <button type="button" data-action="submit" data-testid="sell-submit" class="btn bg-teal-600 text-white hover:bg-teal-700"
          ${!p || st.busy || blocked ? raw('disabled') : ''}>
          ${st.busy ? 'Đang xử lý...' : html`${icon('check', 'w-4 h-4')} Xác nhận thu ${p ? money(p.price) : ''}`}
        </button>
      </div>`;
  }

  function successView() {
    const s = st.sold;
    const p = pkg();
    const change = st.method === 'CASH' ? Number(st.cash || 0) - p.price : 0;
    return html`
      <div class="text-center py-2" data-testid="sell-success">
        <span class="mx-auto w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">${icon('check', 'w-8 h-8')}</span>
        <div class="text-xl font-extrabold mt-4">Đã thu ${money(s.amount ?? p.price)}</div>
        <div class="text-sm text-slate-600 mt-1">${s.packageName} · ${date(s.startDate)} → ${date(s.endDate)}</div>
        ${change > 0 ? html`<div class="mt-4 inline-block rounded-xl bg-amber-50 text-amber-800 px-4 py-2 text-sm font-bold">Thối lại khách: ${money(change)}</div>` : ''}
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button type="button" data-action="cancel" class="btn-secondary">Đóng</button>
        <button type="button" data-action="print" data-testid="sell-print" class="btn bg-teal-600 text-white hover:bg-teal-700">${icon('printer', 'w-4 h-4')} In hóa đơn</button>
      </div>`;
  }

  const rerender = () => modal.setBody(st.sold ? successView() : formView());

  const modal = openModal({
    title: 'Bán / gia hạn gói tập',
    size: 'max-w-2xl',
    body: loading(),
    actions: {
      'pick-package': btn => { st.packageId = Number(btn.dataset.id); st.error = null; rerender(); },
      'pick-method': btn => { st.method = btn.dataset.method; st.error = null; rerender(); },
      'cash-quick': btn => { st.cash = btn.dataset.value; rerender(); },
      cash: input => {
        // chỉ cập nhật phần tiền thối, không render lại để giữ con trỏ trong ô nhập
        st.cash = input.value.replace(/\D/g, '');
        const p = pkg();
        const changeEl = modal.el.querySelector('[data-testid=change]');
        const submit = modal.el.querySelector('[data-testid=sell-submit]');
        const received = Number(st.cash || 0);
        if (changeEl && p) {
          const diff = received - p.price;
          changeEl.textContent = !received ? '—' : diff < 0 ? `Thiếu ${money(-diff)}` : money(diff);
          changeEl.className = `font-extrabold ${received && diff < 0 ? 'text-rose-600' : 'text-emerald-700'}`;
        }
        if (submit && p) submit.disabled = received < p.price;
      },
      ref: input => {
        st.ref = input.value;
        const submit = modal.el.querySelector('[data-testid=sell-submit]');
        if (submit && pkg()) submit.disabled = refMissing();
      },
      submit: async () => {
        const p = pkg();
        if (!p || st.busy) return;
        st.busy = true;
        st.error = null;
        rerender();
        try {
          // BE tạo gói + giao dịch PENDING; tiền đã thu tại quầy nên xác nhận luôn để kích hoạt gói
          const created = await receptionApi.subscribe(member.memberId, p.packageId, st.method);
          if (created.paymentId && created.paymentStatus === 'PENDING') {
            try {
              await receptionApi.confirmPayment(created.paymentId, { transactionRef: st.ref.trim() || undefined });
            } catch (err) {
              // không để giao dịch treo PENDING (BE chặn bán tiếp khi còn giao dịch chờ)
              await receptionApi.cancelPayment(created.paymentId, 'Xác nhận thu tiền thất bại').catch(() => {});
              throw err;
            }
          }
          // ngày hiệu lực được tính lại lúc xác nhận -> lấy bản mới nhất
          const subs = await receptionApi.subscriptions(member.memberId).catch(() => []);
          const fresh = subs.find(x => x.subscriptionId === created.subscriptionId);
          st.sold = { ...created, ...(fresh || {}), paymentId: created.paymentId, amount: created.amount };
          toast(`Đã bán ${p.packageName} cho ${fullName(member)}`);
          if (onDone) onDone(st.sold);
        } catch (err) {
          st.error = err.message;
        } finally {
          st.busy = false;
          rerender();
        }
      },
      print: async () => {
        let paymentId = st.sold.paymentId;
        if (!paymentId) {
          const payments = await receptionApi.payments(member.memberId).catch(() => []);
          paymentId = payments.find(x => x.subscriptionId === st.sold.subscriptionId)?.paymentId;
        }
        if (!paymentId) {
          toast('Chưa tìm thấy giao dịch để in, thử lại sau giây lát.', 'warning');
          return;
        }
        openInvoice(() => receptionApi.invoice(paymentId));
      },
      reload: () => load()
    }
  });

  const load = async () => {
    try {
      const [packages, subscriptions] = await Promise.all([
        packageApi.list(),
        receptionApi.subscriptions(member.memberId).catch(() => [])
      ]);
      st.packages = packages;
      st.subscriptions = subscriptions;
      const first = packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays)[0];
      const chosen = packages.find(p => p.packageId === Number(preselect) && p.status === 'ACTIVE');
      st.packageId = chosen ? chosen.packageId : first ? first.packageId : null;
      rerender();
    } catch (err) {
      modal.setBody(errorState(err));
    }
  };
  load();
  return modal;
}
