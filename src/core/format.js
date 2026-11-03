import { html } from './dom.js';

const moneyFmt = new Intl.NumberFormat('vi-VN');

export function money(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${moneyFmt.format(Number(value))} ₫`;
}

// BE trả giờ VN không kèm timezone ("2026-11-10T08:30:00") -> new Date() hiểu là giờ máy, đúng với người dùng VN
export function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pad = n => String(n).padStart(2, '0');

export function date(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function time(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function dateTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${date(value)} ${time(value)}`;
}

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function weekday(value) {
  const d = toDate(value);
  return d ? WEEKDAYS[d.getDay()] : '';
}

export function timeRange(start, end) {
  return `${time(start)} – ${time(end)}`;
}

export function isFuture(value) {
  const d = toDate(value);
  return d ? d.getTime() > Date.now() : false;
}

export function isToday(value) {
  const d = toDate(value);
  if (!d) return false;
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function daysUntil(value) {
  const d = toDate(value);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

// yyyy-MM-dd cho input[type=date] và query report
export function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// yyyy-MM-ddTHH:mm cho input[type=datetime-local]
export function isoLocalMinute(value) {
  const d = toDate(value);
  if (!d) return '';
  return `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fullName(obj) {
  if (!obj) return '';
  return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
}

const GENDER_LABELS = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
export const genderLabel = g => GENDER_LABELS[(g || '').toUpperCase()] || g || '—';

const ROLE_LABELS = {
  CENTER_MANAGER: 'Quản lý',
  RECEPTIONIST: 'Lễ tân',
  COACH: 'Huấn luyện viên',
  MEMBER: 'Hội viên'
};
export const roleLabel = r => ROLE_LABELS[r] || r || '—';

const PAYMENT_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
  E_WALLET: 'Ví điện tử',
  VNPAY: 'VNPay'
};
export const paymentMethodLabel = m => PAYMENT_METHOD_LABELS[m] || m || '—';

// [label, màu tailwind] theo từng giá trị status của BE
const STATUS = {
  ACTIVE: ['Hoạt động', 'emerald'],
  INACTIVE: ['Ngừng', 'slate'],
  AVAILABLE: ['Sẵn sàng', 'emerald'],
  MAINTENANCE: ['Bảo trì', 'amber'],
  OPENING: ['Đang mở', 'emerald'],
  FULL: ['Đầy', 'rose'],
  LOW_ATTENDANCE: ['Ít học viên', 'amber'],
  REGISTERED: ['Đã đăng ký', 'indigo'],
  CANCELLED: ['Đã hủy', 'slate'],
  PENDING: ['Chờ thanh toán', 'amber'],
  COMPLETED: ['Hoàn tất', 'emerald'],
  REFUNDED: ['Đã hoàn tiền', 'violet'],
  FAILED: ['Thất bại', 'rose'],
  OPEN: ['Chờ xử lý', 'amber'],
  RESOLVED: ['Đã xử lý', 'emerald'],
  IN_PROGRESS: ['Đang thực hiện', 'indigo'],
  PRESENT: ['Có mặt', 'emerald'],
  ABSENT: ['Vắng', 'rose'],
  LATE: ['Đến muộn', 'amber'],
  ON_LEAVE: ['Nghỉ phép', 'sky'],
  INDIVIDUAL: ['Cá nhân', 'violet'],
  CLASS: ['Cả lớp', 'sky'],
  SYSTEM: ['Hệ thống', 'amber'],
  SCHEDULE_CHANGE: ['Đổi lịch', 'amber'],
  CLASS_CANCELLED: ['Lớp bị hủy', 'rose'],
  STAFF_MESSAGE: ['Từ trung tâm', 'indigo'],
  CLASS_STOPPED: ['Lớp dừng', 'rose'],
  CLASS_UPDATED: ['Đổi lịch lớp', 'amber'],
  SESSION_POSTPONED: ['Hoãn buổi', 'amber'],
  MAKEUP_SESSION_SCHEDULED: ['Buổi bù', 'violet'],
  COACH_SUBSTITUTE: ['HLV dạy thay', 'sky'],
  SUBSCRIPTION_REFUNDED: ['Hoàn tiền', 'violet'],
  ISSUE_REPORT_CREATED: ['Sự cố mới', 'amber'],
  ISSUE_REPORT_UPDATED: ['Phản hồi sự cố', 'sky'],
  ISSUE_REPORT_ESCALATED: ['Chuyển Quản lý', 'violet'],
  CLASS_REMINDER: ['Nhắc lịch học', 'sky'],
  CLASS_SWITCHED: ['Đổi lớp', 'sky'],
  SUBSCRIPTION_ACTIVATED: ['Gói đã kích hoạt', 'emerald'],
  SUBSCRIPTION_EXPIRING: ['Gói sắp hết hạn', 'amber'],
  PAYMENT_NEEDS_REVIEW: ['Cần kiểm tra giao dịch', 'rose'],
  // mô hình gói / buổi học mới
  WAITING_ACTIVATION: ['Chờ kích hoạt', 'sky'],
  STOPPED: ['Đã dừng', 'rose'],
  SCHEDULED: ['Sắp diễn ra', 'sky'],
  POSTPONED: ['Đã hoãn', 'amber'],
  DONE: ['Đã học', 'emerald'],
  // báo cáo sự cố
  REJECTED: ['Từ chối', 'rose'],
  // loại buổi
  MAKEUP: ['Buổi bù', 'violet']
};

const BADGE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20'
};

export function statusLabel(value) {
  return (STATUS[value] || [value || '—'])[0];
}

export function badge(value, labelOverride) {
  const [label, color] = STATUS[value] || [value || '—', 'slate'];
  return html`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ring-inset ${BADGE_CLASSES[color]}">${labelOverride || label}</span>`;
}

// Tài khoản tạo qua Google chưa có SĐT: BE lưu tạm "GG_<số>" vì cột phone bắt buộc
export const isPlaceholderPhone = phone => /^GG_/.test(phone || '');
export const phoneText = phone => (!phone || isPlaceholderPhone(phone) ? 'Chưa có SĐT' : phone);
