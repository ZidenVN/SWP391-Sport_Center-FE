import { html, raw, icon } from '../core/dom.js';
import { toDate } from '../core/format.js';

// Gói ACTIVE có ngày hết hạn xa nhất (khi đã gia hạn nối tiếp sẽ có nhiều gói ACTIVE)
export function latestActive(subscriptions) {
  return (subscriptions || [])
    .filter(s => s.status === 'ACTIVE')
    .sort((a, b) => String(b.endDate).localeCompare(String(a.endDate)))[0] || null;
}

// Giống logic BE: còn gói thì gói mới bắt đầu ngay khi gói xa nhất hết hạn, không thì bắt đầu từ bây giờ
export function renewalWindow(subscriptions, durationDays) {
  const latest = latestActive(subscriptions);
  const now = new Date();
  const latestEnd = latest ? toDate(latest.endDate) : null;
  const isRenewal = Boolean(latestEnd && latestEnd > now);
  const start = isRenewal ? latestEnd : now;
  const end = new Date(start.getTime() + durationDays * 86400000);
  return { start, end, isRenewal, latest };
}

// Gói rẻ nhất tính theo ngày (chỉ đánh dấu khi có từ 2 gói trở lên)
export function bestValueId(packages) {
  if (!packages || packages.length < 2) return null;
  const best = [...packages].filter(p => p.durationDays > 0)
    .sort((a, b) => a.price / a.durationDays - b.price / b.durationDays)[0];
  return best ? best.packageId : null;
}

const STEPS = ['Chọn gói', 'Thanh toán', 'Hoàn tất'];

// current: 0..2; failed: bước cuối hiển thị lỗi
export function checkoutSteps(current, { failed = false } = {}) {
  return html`
    <ol class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold mb-8" aria-label="Các bước thanh toán">
      ${STEPS.map((label, i) => {
        const done = i < current || (i === current && i === STEPS.length - 1 && !failed);
        const active = i === current;
        const err = failed && active;
        const dot = err ? 'bg-rose-600 text-white' : done ? 'bg-emerald-600 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500';
        return html`
          <li class="flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}" ${active ? raw('aria-current="step"') : ''}>
            <span class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${dot}">
              ${err ? icon('x', 'w-4 h-4') : done ? icon('check', 'w-4 h-4') : i + 1}
            </span>
            <span class="${active || done ? 'text-slate-900' : 'text-slate-400'} whitespace-nowrap">${label}</span>
            ${i < STEPS.length - 1 ? html`<span class="flex-1 h-0.5 rounded ${i < current ? 'bg-emerald-500' : 'bg-slate-200'} min-w-4"></span>` : ''}
          </li>`;
      })}
    </ol>`;
}

export function vnpayMark(size = 'text-base') {
  return html`<span class="font-black tracking-tight ${size}"><span class="text-[#005BAA]">VN</span><span class="text-[#ED1C24]">PAY</span></span>`;
}

// Mã phản hồi của VNPay (vnp_ResponseCode) -> lý do dễ hiểu cho người dùng
const VNPAY_REASONS = {
  '07': 'Giao dịch bị nghi ngờ gian lận, vui lòng liên hệ ngân hàng.',
  '09': 'Thẻ/tài khoản chưa đăng ký dịch vụ InternetBanking.',
  10: 'Xác thực thông tin thẻ/tài khoản sai quá 3 lần.',
  11: 'Đã hết thời gian chờ thanh toán (15 phút).',
  12: 'Thẻ/tài khoản đang bị khóa.',
  13: 'Nhập sai mã OTP.',
  24: 'Bạn đã hủy giao dịch tại cổng VNPay.',
  51: 'Tài khoản không đủ số dư.',
  65: 'Tài khoản đã vượt hạn mức giao dịch trong ngày.',
  75: 'Ngân hàng thanh toán đang bảo trì.',
  79: 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
  99: 'Lỗi không xác định từ cổng thanh toán.'
};

export function vnpayReason(code) {
  if (!code) return null;
  return VNPAY_REASONS[code] || VNPAY_REASONS[Number(code)] || `Mã phản hồi VNPay: ${code}`;
}
