import { html, raw, icon, refreshIcons } from '../../core/dom.js';
import { toast, toastError } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi, vnpayApi } from '../../api/endpoints.js';
import { money, date, genderLabel, phoneText } from '../../core/format.js';
import { checkoutSteps, vnpayMark, packageScope, packageKind } from '../../components/billing.js';

// Thanh toán theo BE main:
// - GET /members/me/subscriptions/preview?packageId= : ngày bắt đầu / hết hạn dự kiến + cảnh báo gói trùng khu tập (BR-SUB-08)
// - POST /payments/vnpay/create-url?packageId= : BE tự gắn vnp_ReturnUrl, người dùng chọn ATM / thẻ quốc tế / QR ngay trên trang VNPay
const PAY_OPTIONS = [
  ['landmark', 'Thẻ ATM / Tài khoản ngân hàng'],
  ['credit-card', 'Thẻ quốc tế Visa, Mastercard, JCB'],
  ['scan-qr-code', 'Quét QR bằng app ngân hàng']
];

// Thẻ test của VNPay sandbox (chỉ hiện khi chạy dev)
const TEST_CARD = { number: '9704198526191432198', holder: 'NGUYEN VAN A', issued: '07/15', bank: 'NCB', otp: '123456' };

function row(label, value) {
  return html`<div class="flex justify-between gap-4 py-2 text-sm"><span class="text-slate-500">${label}</span><span class="font-semibold text-right">${value}</span></div>`;
}

function copyChip(label, value, testid) {
  return html`
    <button type="button" data-action="copy" data-value="${value}" data-testid="${testid}"
      class="group flex items-center justify-between gap-2 w-full rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-left transition-colors">
      <span><span class="block text-[10px] uppercase tracking-wider text-white/60">${label}</span><span class="font-mono text-sm">${value}</span></span>
      ${icon('copy', 'w-4 h-4 text-white/60 group-hover:text-white')}
    </button>`;
}

function testCard(s) {
  if (!import.meta.env?.DEV) return '';
  const grouped = TEST_CARD.number.replace(/(\d{4})(?=\d)/g, '$1 ');
  return html`
    <section class="rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-5" data-testid="test-card">
      <div class="flex items-center gap-2 text-xs font-bold text-amber-800 mb-4">${icon('flask-conical', 'w-4 h-4')} Thẻ test VNPay sandbox · chỉ hiện khi chạy dev</div>
      <div class="grid md:grid-cols-2 gap-5 items-center">
        <div class="relative aspect-[1.586] max-w-sm w-full rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-br from-[#0a2a66] via-[#123f91] to-[#1b5fd1]">
          <div class="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10"></div>
          <div class="absolute -left-16 -bottom-20 w-52 h-52 rounded-full bg-white/5"></div>
          <div class="relative h-full flex flex-col justify-between">
            <div class="flex items-start justify-between">
              <span class="font-black tracking-wider text-lg">${TEST_CARD.bank}</span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-white/70">Napas</span>
            </div>
            <div>
              <div class="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 mb-2"></div>
              <div class="font-mono text-[15px] sm:text-base tracking-wide whitespace-nowrap">${grouped}</div>
            </div>
            <div class="flex items-end justify-between text-xs">
              <div><div class="text-[9px] uppercase text-white/60">Chủ thẻ</div><div class="font-semibold tracking-wide">${TEST_CARD.holder}</div></div>
              <div class="text-right"><div class="text-[9px] uppercase text-white/60">Phát hành</div><div class="font-semibold">${TEST_CARD.issued}</div></div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl bg-brand-dark text-white p-3 space-y-2">
          ${copyChip('Số thẻ', TEST_CARD.number, 'copy-card-number')}
          ${copyChip('Tên chủ thẻ', TEST_CARD.holder, 'copy-holder')}
          <div class="grid grid-cols-2 gap-2">
            ${copyChip('Ngày phát hành', TEST_CARD.issued, 'copy-issued')}
            ${copyChip('OTP', TEST_CARD.otp, 'copy-otp')}
          </div>
          <p class="text-[11px] text-white/50 px-1">Trên VNPay chọn ngân hàng <b class="text-white/80">NCB</b> rồi dán các thông tin này.</p>
        </div>
      </div>
    </section>`;
}

// Cảnh báo của BE khi gói mới trùng thời gian + trùng khu tập với gói đang có (vẫn mua được)
function warningsBox(pv) {
  if (!pv?.warnings?.length) return '';
  return html`
    <section class="rounded-3xl border border-amber-200 bg-amber-50 p-5" data-testid="purchase-warnings">
      <div class="flex items-center gap-2 font-bold text-amber-800">${icon('alert-triangle', 'w-5 h-5')} Bạn đang có gói dùng được cùng khu tập</div>
      <ul class="mt-3 space-y-2 text-sm text-amber-900">
        ${pv.warnings.map(w => html`
          <li class="rounded-xl bg-white/70 p-3">
            <div class="font-semibold">${w.packageName} · còn ${w.daysLeft} ngày${w.remainingSessions != null ? ` · ${w.remainingSessions} buổi` : ''}</div>
            <div class="text-xs mt-0.5">${w.message}</div>
          </li>`)}
      </ul>
      <p class="text-xs text-amber-800 mt-3">Bạn vẫn có thể mua tiếp nếu muốn.</p>
    </section>`;
}

function summary(s) {
  const p = s.pkg;
  const pv = s.preview;
  const start = pv?.startDate ? new Date(pv.startDate) : new Date();
  const end = pv?.endDate ? new Date(pv.endDate) : new Date(start.getTime() + p.durationDays * 86400000);
  // BE nối gói mới sau gói đang có -> bắt đầu ở tương lai = gia hạn nối tiếp
  const isRenewal = start.getTime() - Date.now() > 60000;
  return html`
    <aside class="lg:sticky lg:top-24 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="order-summary">
      <div class="p-6 bg-brand-dark text-white relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand/30"></div>
        <div class="relative">
          <div class="text-xs font-bold uppercase tracking-widest text-brand-lime">Đơn hàng</div>
          <div class="font-display text-3xl leading-none font-extrabold mt-1.5">${p.packageName}</div>
          <div class="text-sm text-emerald-100 mt-0.5">${p.durationDays} ngày · ${packageKind(p)}</div>
          <div class="text-xs text-white/70 mt-1">Áp dụng: ${packageScope(p)}</div>
        </div>
      </div>
      <div class="p-6">
        <div class="divide-y divide-slate-100">
          ${row('Loại giao dịch', isRenewal ? 'Gia hạn nối tiếp' : 'Đăng ký mới')}
          ${row('Bắt đầu', html`<span data-testid="new-start-date">${date(start)}</span>`)}
          ${row('Hết hạn', html`<span data-testid="new-end-date">${date(end)}</span>`)}
          ${row('Đơn giá', money(p.price))}
          ${row('Phí giao dịch', html`<span class="text-emerald-600">Miễn phí</span>`)}
        </div>
        <div class="flex justify-between items-end mt-4 pt-4 border-t-2 border-dashed border-slate-200">
          <span class="font-bold text-slate-700">Tổng thanh toán</span>
          <span class="text-3xl font-black text-slate-900" data-testid="total">${money(p.price)}</span>
        </div>
        ${isRenewal ? html`
          <div class="mt-4 text-xs rounded-xl bg-emerald-50 text-emerald-800 p-3 flex gap-2">
            ${icon('info', 'w-4 h-4 shrink-0')}<span>Gói mới tự bắt đầu ngày ${date(start)}, nối tiếp sau gói bạn đang có.</span>
          </div>` : ''}
        ${s.payError ? html`
          <div class="mt-4 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3 flex gap-2" role="alert" data-testid="pay-error">
            ${icon('alert-triangle', 'w-4 h-4 shrink-0 mt-0.5')}<span>${s.payError}</span>
          </div>` : ''}
        <label class="flex items-start gap-2.5 mt-5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="agree" data-action="agree" class="mt-0.5 rounded" ${s.agree ? 'checked' : ''} />
            <span>Tôi đồng ý với điều khoản sử dụng dịch vụ và chính sách hoàn tiền của trung tâm.</span>
          </label>
          <button type="button" data-action="pay" data-testid="pay-button" ${s.agree && !s.busy ? '' : raw('disabled')}
            class="btn w-full mt-5 !py-3.5 !text-base bg-brand-dark text-white hover:bg-emerald-800 shadow-lg shadow-emerald-600/20">
            ${s.busy ? html`<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Đang chuyển sang VNPay...`
              : html`${icon('lock', 'w-4 h-4')} Thanh toán ${money(p.price)} qua VNPay`}
          </button>
          <p class="text-[11px] text-slate-400 text-center mt-3">Bạn sẽ được chuyển sang cổng VNPay để chọn phương thức và nhập thông tin.</p>
      </div>
    </aside>`;
}

function view(s) {
  const me = s.me || {};
  return html`
    <a href="#/member/packages" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-5">${icon('arrow-left', 'w-4 h-4')} Quay lại chọn gói</a>
    ${checkoutSteps(1)}
    <div class="grid lg:grid-cols-5 gap-6 items-start">
      <div class="lg:col-span-3 space-y-6">
        ${warningsBox(s.preview)}
        <section class="rounded-3xl bg-white border border-slate-200 shadow-sm p-6" data-testid="pay-methods">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-900 flex items-center gap-2">${icon('wallet', 'w-5 h-5 text-emerald-600')} Phương thức thanh toán</h2>
            <span class="flex items-center gap-1 text-xs text-slate-400">qua ${vnpayMark('text-xs')}</span>
          </div>
          <p class="text-sm text-slate-600">Sau khi bấm thanh toán, bạn chọn một trong các cách sau ngay trên trang VNPay:</p>
          <div class="grid sm:grid-cols-3 gap-3 mt-3">
            ${PAY_OPTIONS.map(([ic, t]) => html`
              <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <span class="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center border border-slate-200">${icon(ic, 'w-5 h-5')}</span>
                <div class="font-bold text-sm text-slate-900 mt-3">${t}</div>
              </div>`)}
          </div>
          <div class="mt-4 flex items-start gap-2 text-xs text-slate-500">
            ${icon('lock', 'w-3.5 h-3.5 shrink-0 mt-0.5')} Thông tin thẻ được nhập trực tiếp trên cổng VNPay (chuẩn bảo mật PCI DSS), trung tâm không lưu trữ dữ liệu thẻ của bạn.
          </div>
        </section>
        ${testCard(s)}
        <section class="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-900 flex items-center gap-2">${icon('user-round', 'w-5 h-5 text-emerald-600')} Thông tin người mua</h2>
            <a href="#/member/profile" class="text-xs font-bold text-emerald-600 hover:underline">Chỉnh sửa</a>
          </div>
          <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm" data-testid="buyer-info">
            <div><dt class="text-slate-500 text-xs">Họ và tên</dt><dd class="font-semibold mt-0.5">${me.firstName} ${me.lastName}</dd></div>
            <div><dt class="text-slate-500 text-xs">Mã hội viên</dt><dd class="font-semibold mt-0.5">#${me.memberId}</dd></div>
            <div><dt class="text-slate-500 text-xs">Email</dt><dd class="font-semibold mt-0.5 break-all">${me.email}</dd></div>
            <div><dt class="text-slate-500 text-xs">Số điện thoại</dt><dd class="font-semibold mt-0.5">${phoneText(me.phone)} <span class="text-slate-400 font-normal">· ${genderLabel(me.gender)}</span></dd></div>
          </dl>
        </section>
      </div>
      <div class="lg:col-span-2">${summary(s)}</div>
    </div>`;
}

export default function Checkout(el, { params, navigate }) {
  async function createPayment(ctx) {
    const { pkg } = ctx.state;
    ctx.set({ busy: true, payError: null });
    try {
      const res = await vnpayApi.createUrl(pkg.packageId);
      window.location.assign(res.paymentUrl);
    } catch (err) {
      const payError = err.code === 'ERR_PAYMENT_409'
        ? 'Bạn đang có một giao dịch VNPay chưa hoàn tất. Hãy hoàn tất giao dịch đó hoặc thử lại sau 15 phút.'
        : err.message;
      ctx.set({ busy: false, payError });
      if (err.code !== 'ERR_PAYMENT_409') toastError(err);
    }
  }

  const dispose = mountPage(el, {
    state: { agree: false, busy: false, payError: null },
    load: async () => {
      const res = await settle({
        pkg: [() => packageApi.get(params.id), null],
        me: [memberApi.me, null],
        preview: [() => memberApi.purchasePreview(params.id), null]
      });
      if (res.pkgError) throw res.pkgError;
      if (res.pkg.status !== 'ACTIVE') throw new Error('Gói tập này hiện không còn mở bán.');
      return res;
    },
    view,
    actions: {
      agree: (t, e, ctx) => ctx.set({ agree: t.checked, payError: null }),
      pay: (t, e, ctx) => {
        if (ctx.state.agree && !ctx.state.busy) createPayment(ctx);
      },
      copy: async btn => {
        try {
          await navigator.clipboard.writeText(btn.dataset.value);
          toast(`Đã copy: ${btn.dataset.value}`, 'info');
        } catch {
          toast('Trình duyệt không cho copy, hãy chọn và copy thủ công.', 'warning');
        }
      }
    }
  });

  refreshIcons();
  return dispose;
}
