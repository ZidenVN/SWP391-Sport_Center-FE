import { html, raw, icon, refreshIcons } from '../../core/dom.js';
import { toast, toastError } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, memberApi, vnpayApi } from '../../api/endpoints.js';
import { money, date, genderLabel, phoneText } from '../../core/format.js';
import { checkoutSteps, renewalWindow, vnpayMark } from '../../components/billing.js';

const QR_TTL_MS = 15 * 60 * 1000; // VNPay giữ giao dịch 15 phút
const POLL_MS = 3000;

const METHODS = [
  { id: 'VNBANK', icon: 'landmark', title: 'Thẻ ATM / Tài khoản ngân hàng', text: 'NCB, Vietcombank, BIDV, Techcombank...' },
  { id: 'INTCARD', icon: 'credit-card', title: 'Thẻ quốc tế', text: 'Visa, Mastercard, JCB, AMEX' },
  { id: 'QR', icon: 'scan-qr-code', title: 'Quét mã QR', text: 'Thanh toán bằng điện thoại của bạn' }
];

// Thẻ test của VNPay sandbox (chỉ hiện khi chạy dev)
const TEST_CARD = { number: '9704198526191432198', holder: 'NGUYEN VAN A', issued: '07/15', bank: 'NCB', otp: '123456' };

// Địa chỉ điện thoại truy cập được để VNPay trả kết quả về (dev: IP LAN, production: chính domain)
function phoneOrigin() {
  const host = window.location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return window.location.origin;
  // eslint-disable-next-line no-undef
  return typeof __DEV_LAN_ORIGIN__ !== 'undefined' && __DEV_LAN_ORIGIN__ ? __DEV_LAN_ORIGIN__ : null;
}

function qrSvg(text) {
  if (!window.qrcode) return null;
  const qr = window.qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

function row(label, value) {
  return html`<div class="flex justify-between gap-4 py-2 text-sm"><span class="text-slate-500">${label}</span><span class="font-semibold text-right">${value}</span></div>`;
}

function methodTiles(s) {
  const locked = Boolean(s.qr);
  return html`
    <div class="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Phương thức thanh toán">
      ${METHODS.map(m => {
        const on = s.method === m.id;
        return html`
          <button type="button" role="radio" aria-checked="${on}" data-action="method" data-method="${m.id}" data-testid="method-${m.id}" ${locked ? raw('disabled') : ''}
            class="relative text-left rounded-2xl border-2 p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${on ? 'border-emerald-600 bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}">
            <span class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 ${on ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'} flex items-center justify-center">
              ${on ? html`<span class="w-2 h-2 rounded-full bg-white"></span>` : ''}
            </span>
            <span class="w-10 h-10 rounded-xl ${on ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'} flex items-center justify-center">${icon(m.icon, 'w-5 h-5')}</span>
            <div class="font-bold text-sm text-slate-900 mt-3 pr-4">${m.title}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${m.text}</div>
          </button>`;
      })}
    </div>`;
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
  if (!import.meta.env?.DEV || s.method === 'INTCARD') return '';
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

function qrPanel(s) {
  const q = s.qr;
  if (!q) return '';
  const svg = qrSvg(q.url);
  const status = q.status;
  return html`
    <section style="scroll-margin-top: 88px" class="rounded-3xl bg-white border-2 border-emerald-600 shadow-lg shadow-emerald-600/10 p-6" id="qr-panel" data-testid="qr-panel" data-status="${status}">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-extrabold text-slate-900 flex items-center gap-2">${icon('scan-qr-code', 'w-5 h-5 text-emerald-600')} Quét mã để thanh toán</h2>
        ${status === 'WAITING' ? html`
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
            ${icon('timer', 'w-3.5 h-3.5')} <span data-countdown>15:00</span>
          </span>` : ''}
      </div>
      <div class="grid md:grid-cols-2 gap-6 items-center">
        <div class="relative mx-auto w-full max-w-[300px]">
          <div class="rounded-3xl p-4 bg-white border border-slate-200 shadow-sm ${status !== 'WAITING' ? 'opacity-20 blur-[2px]' : ''}">
            <div class="aspect-square [&>svg]:w-full [&>svg]:h-full" data-testid="qr-code">${svg ? raw(svg) : html`<div class="h-full flex items-center justify-center text-xs text-slate-400 text-center p-4">Không tải được thư viện QR. Dùng nút "Mở trên máy này".</div>`}</div>
            <div class="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500">${vnpayMark('text-sm')} <span>· ${money(s.pkg.price)}</span></div>
          </div>
          ${status === 'WAITING' ? html`<span class="absolute inset-x-6 top-6 h-0.5 bg-emerald-500/70 rounded qr-scanline"></span>` : ''}
          ${status !== 'WAITING' ? html`
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
              <span class="w-12 h-12 rounded-full ${status === 'EXPIRED' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center">${icon(status === 'EXPIRED' ? 'clock-alert' : 'x-circle', 'w-6 h-6')}</span>
              <span class="text-sm font-bold">${status === 'EXPIRED' ? 'Mã đã hết hạn' : 'Thanh toán không thành công'}</span>
            </div>` : ''}
        </div>
        <div>
          ${status === 'WAITING' ? html`
            <ol class="space-y-3 text-sm text-slate-700">
              ${[
                ['Mở camera hoặc app ngân hàng trên điện thoại', 'smartphone'],
                ['Quét mã QR bên cạnh để mở trang thanh toán VNPay', 'scan-line'],
                ['Nhập thẻ & OTP trên điện thoại, trang này sẽ tự cập nhật', 'badge-check']
              ].map(([t, ic], i) => html`
                <li class="flex gap-3">
                  <span class="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">${i + 1}</span>
                  <span class="pt-1">${t}</span>
                </li>`)}
            </ol>
            <div class="mt-5 flex items-center gap-2 text-sm text-emerald-700 font-semibold" data-testid="qr-waiting">
              <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span> Đang chờ bạn thanh toán...
            </div>
            ${!q.reachable ? html`
              <p class="mt-4 text-xs rounded-xl bg-amber-50 text-amber-800 p-3">Không xác định được IP mạng LAN của máy chủ dev. Điện thoại vẫn thanh toán được, nhưng sẽ không tự quay về trang kết quả; trang này vẫn tự cập nhật khi thanh toán xong.</p>` : html`
              <p class="mt-4 text-[11px] text-slate-400">Điện thoại cần dùng chung Wi-Fi với máy tính để quay về trang kết quả.</p>`}
            <div class="flex flex-wrap gap-2 mt-5">
              <a href="${q.url}" class="btn-secondary btn-sm" data-testid="open-here">${icon('external-link', 'w-3.5 h-3.5')} Mở trên máy này</a>
            </div>` : html`
            <p class="text-sm text-slate-600">${status === 'EXPIRED'
              ? 'Mã QR chỉ có hiệu lực 15 phút. Tạo mã mới để tiếp tục.'
              : 'Giao dịch bị hủy hoặc thất bại tại VNPay. Bạn có thể thử lại.'}</p>
            <button type="button" class="btn-primary mt-4" data-action="new-qr">${icon('refresh-cw', 'w-4 h-4')} Tạo mã mới</button>`}
        </div>
      </div>
    </section>`;
}

function summary(s) {
  const p = s.pkg;
  const win = renewalWindow(s.subscriptions, p.durationDays);
  const isQr = s.method === 'QR';
  return html`
    <aside class="lg:sticky lg:top-24 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="order-summary">
      <div class="p-6 bg-brand-dark text-white relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand/30"></div>
        <div class="relative">
          <div class="text-xs font-bold uppercase tracking-widest text-brand-lime">Đơn hàng</div>
          <div class="font-display text-3xl leading-none font-extrabold mt-1.5">${p.packageName}</div>
          <div class="text-sm text-emerald-100 mt-0.5">${p.durationDays} ngày tập</div>
        </div>
      </div>
      <div class="p-6">
        <div class="divide-y divide-slate-100">
          ${row('Loại giao dịch', win.isRenewal ? 'Gia hạn nối tiếp' : 'Đăng ký mới')}
          ${row('Bắt đầu', date(win.start))}
          ${row('Hết hạn', html`<span data-testid="new-end-date">${date(win.end)}</span>`)}
          ${row('Đơn giá', money(p.price))}
          ${row('Phí giao dịch', html`<span class="text-emerald-600">Miễn phí</span>`)}
        </div>
        <div class="flex justify-between items-end mt-4 pt-4 border-t-2 border-dashed border-slate-200">
          <span class="font-bold text-slate-700">Tổng thanh toán</span>
          <span class="text-3xl font-black text-slate-900" data-testid="total">${money(p.price)}</span>
        </div>
        ${win.isRenewal ? html`
          <div class="mt-4 text-xs rounded-xl bg-emerald-50 text-emerald-800 p-3 flex gap-2">
            ${icon('info', 'w-4 h-4 shrink-0')}<span>Gói hiện tại còn đến ${date(win.latest.endDate)}. Gói mới tự bắt đầu ngay sau đó.</span>
          </div>` : ''}
        ${s.payError ? html`
          <div class="mt-4 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3 flex gap-2" role="alert" data-testid="pay-error">
            ${icon('alert-triangle', 'w-4 h-4 shrink-0 mt-0.5')}<span>${s.payError}</span>
          </div>` : ''}
        ${s.qr ? html`
          <div class="mt-5 text-sm rounded-xl bg-slate-50 p-3 text-slate-600 flex gap-2">${icon('scan-qr-code', 'w-4 h-4 shrink-0 mt-0.5')} Đang chờ thanh toán qua mã QR bên trái.</div>` : html`
          <label class="flex items-start gap-2.5 mt-5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="agree" data-action="agree" class="mt-0.5 rounded" ${s.agree ? 'checked' : ''} />
            <span>Tôi đồng ý với điều khoản sử dụng dịch vụ và chính sách hoàn tiền của trung tâm.</span>
          </label>
          <button type="button" data-action="pay" data-testid="pay-button" ${s.agree && !s.busy ? '' : raw('disabled')}
            class="btn w-full mt-5 !py-3.5 !text-base bg-brand-dark text-white hover:bg-emerald-800 shadow-lg shadow-emerald-600/20">
            ${s.busy ? html`<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> ${isQr ? 'Đang tạo mã...' : 'Đang chuyển sang VNPay...'}`
              : isQr ? html`${icon('scan-qr-code', 'w-4 h-4')} Tạo mã QR thanh toán` : html`${icon('lock', 'w-4 h-4')} Thanh toán ${money(p.price)}`}
          </button>
          <p class="text-[11px] text-slate-400 text-center mt-3">${isQr ? 'Mã QR có hiệu lực 15 phút.' : 'Bạn sẽ được chuyển sang cổng VNPay để nhập thông tin thẻ.'}</p>`}
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
        ${qrPanel(s)}
        <section class="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-900 flex items-center gap-2">${icon('wallet', 'w-5 h-5 text-emerald-600')} Phương thức thanh toán</h2>
            <span class="flex items-center gap-1 text-xs text-slate-400">qua ${vnpayMark('text-xs')}</span>
          </div>
          ${methodTiles(s)}
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
  let pollTimer = null;
  let tickTimer = null;

  const stopTimers = () => {
    clearInterval(pollTimer);
    clearInterval(tickTimer);
    pollTimer = tickTimer = null;
  };

  function startWatching(ctx) {
    stopTimers();
    const q = ctx.state.qr;
    const tick = () => {
      const left = Math.max(0, q.expiresAt - Date.now());
      const node = el.querySelector('[data-countdown]');
      if (node) node.textContent = `${String(Math.floor(left / 60000)).padStart(2, '0')}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
      if (left <= 0) {
        stopTimers();
        ctx.set({ qr: { ...q, status: 'EXPIRED' } });
      }
    };
    tick();
    tickTimer = setInterval(tick, 1000);
    pollTimer = setInterval(async () => {
      try {
        const p = await vnpayApi.paymentStatus(q.paymentId);
        if (p?.status === 'COMPLETED') {
          stopTimers();
          toast('Thanh toán thành công!');
          navigate(`/member/payment-result?paymentId=${q.paymentId}`);
        } else if (p && (p.status === 'FAILED' || p.status === 'CANCELLED')) {
          stopTimers();
          ctx.set({ qr: { ...q, status: 'FAILED' } });
        }
      } catch { /* mạng chập chờn: thử lại ở lần sau */ }
    }, POLL_MS);
  }

  async function createPayment(ctx) {
    const { pkg, method } = ctx.state;
    ctx.set({ busy: true, payError: null });
    try {
      if (method === 'QR') {
        const origin = phoneOrigin();
        // điện thoại mở thẳng form thẻ ngân hàng; thanh toán xong VNPay trả về IP LAN thay vì localhost
        const res = await vnpayApi.createUrl(pkg.packageId, { bankCode: 'VNBANK', returnUrl: origin ? `${origin}/payment-result` : undefined });
        ctx.set({ busy: false, qr: { url: res.paymentUrl, paymentId: res.paymentId, expiresAt: Date.now() + QR_TTL_MS, status: 'WAITING', reachable: Boolean(origin) } });
        startWatching(ctx);
        el.querySelector('#qr-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const res = await vnpayApi.createUrl(pkg.packageId, { bankCode: method });
        window.location.assign(res.paymentUrl);
      }
    } catch (err) {
      const payError = err.code === 'ERR_PAYMENT_409'
        ? 'Bạn đang có một giao dịch VNPay chưa hoàn tất. Hãy hoàn tất giao dịch đó hoặc thử lại sau 15 phút.'
        : err.message;
      ctx.set({ busy: false, payError });
      if (err.code !== 'ERR_PAYMENT_409') toastError(err);
    }
  }

  const dispose = mountPage(el, {
    state: { agree: false, busy: false, payError: null, method: 'VNBANK', qr: null },
    load: async () => {
      const res = await settle({
        pkg: [() => packageApi.get(params.id), null],
        me: [memberApi.me, null],
        subscriptions: [memberApi.subscriptions, []]
      });
      if (res.pkgError) throw res.pkgError;
      if (res.pkg.status !== 'ACTIVE') throw new Error('Gói tập này hiện không còn mở bán.');
      return res;
    },
    view,
    actions: {
      method: (t, e, ctx) => ctx.set({ method: t.dataset.method, payError: null }),
      agree: (t, e, ctx) => ctx.set({ agree: t.checked, payError: null }),
      pay: (t, e, ctx) => {
        if (ctx.state.agree && !ctx.state.busy) createPayment(ctx);
      },
      'new-qr': (t, e, ctx) => {
        ctx.set({ qr: null });
        createPayment(ctx);
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
  return () => {
    stopTimers();
    dispose();
  };
}
