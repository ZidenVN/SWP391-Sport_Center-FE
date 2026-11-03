import { html, raw, icon } from '../core/dom.js';
import { date } from '../core/format.js';

// Gói ACTIVE có ngày hết hạn xa nhất (khi đã gia hạn nối tiếp sẽ có nhiều gói ACTIVE)
export function latestActive(subscriptions) {
  return (subscriptions || [])
    .filter(s => s.status === 'ACTIVE')
    .sort((a, b) => String(b.endDate).localeCompare(String(a.endDate)))[0] || null;
}

// Môn của gói lớp: gói đang bán có p.subject (object), gói đã mua có p.subjectName
export const subjectNameOf = p => p?.subject?.subjectName || p?.subjectName || '';
export const isClassPackage = p => p?.packageType === 'CLASS';

// Phạm vi gói: MEMBERSHIP = vào trung tâm; CLASS = 1 lớp của 1 môn
export function packageScope(p) {
  if (!isClassPackage(p)) return 'Vào trung tâm, kích hoạt ở lần check-in đầu';
  return subjectNameOf(p) ? `1 lớp môn ${subjectNameOf(p)}` : 'Chưa gắn môn';
}

// Gói WAITING_ACTIVATION chưa có ngày bắt đầu / hết hạn (BE chỉ gán khi check-in, vào lớp hoặc sau 14 ngày)
export const validityText = (x, fmt = date) => x?.startDate
  ? `${fmt(x.startDate)} → ${fmt(x.endDate)}`
  : x?.status === 'WAITING_ACTIVATION' ? 'Chờ kích hoạt' : '—';

// Cảnh báo gói trùng của BE: gói đang chờ kích hoạt không có daysLeft
export const warningTitle = w => `${w.packageName} · ${w.daysLeft != null ? `còn ${w.daysLeft} ngày` : 'chờ kích hoạt'}`;

// Nhãn ngắn loại gói: "Membership", "Gói lớp · Yoga"
export function packageKind(p) {
  if (!isClassPackage(p)) return 'Membership';
  return subjectNameOf(p) ? `Gói lớp · ${subjectNameOf(p)}` : 'Gói lớp';
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
        const dot = err ? 'bg-rose-600 text-white' : done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500';
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
