import { html, icon } from '../core/dom.js';
import { date, daysUntil, toDate } from '../core/format.js';
import { session } from '../core/session.js';

export const EXPIRY_WARNING_DAYS = 7;

// Banner nhắc gia hạn khi gói còn <= 7 ngày (tính ở FE từ endDate, không phụ thuộc job của BE)
export function expiryBanner(sub) {
  if (!sub) return '';
  const left = daysUntil(sub.endDate);
  if (left === null || left > EXPIRY_WARNING_DAYS) return '';
  return html`
    <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex flex-wrap items-center gap-3" data-testid="expiry-banner" role="alert">
      ${icon('alarm-clock', 'w-5 h-5 shrink-0')}
      <span class="flex-1">
        Gói <b>${sub.packageName}</b> ${left <= 0 ? 'hết hạn hôm nay' : html`còn <b>${left} ngày</b>`} (hết hạn ${date(sub.endDate)}). Gia hạn để không bị gián đoạn việc đặt lớp.
      </span>
      <a href="#/member/packages" class="btn-primary btn-sm">Gia hạn ngay</a>
    </div>`;
}

// ---- Thông báo chưa đọc: lưu mốc "đã xem" theo từng thiết bị ----
const seenKey = () => `sc_notifications_seen_at:${session.get()?.email || ''}`;

function seenAt() {
  try {
    return Number(localStorage.getItem(seenKey()) || 0);
  } catch {
    return 0;
  }
}

export function markNotificationsSeen(items) {
  const newest = Math.max(0, ...(items || []).map(n => toDate(n.sendDate)?.getTime() || 0));
  try {
    localStorage.setItem(seenKey(), String(Math.max(newest, seenAt())));
  } catch { /* bỏ qua */ }
}

export function countUnread(items) {
  const since = seenAt();
  return (items || []).filter(n => (toDate(n.sendDate)?.getTime() || 0) > since).length;
}

export function isUnread(n) {
  return (toDate(n.sendDate)?.getTime() || 0) > seenAt();
}
