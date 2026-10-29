import { html, icon } from '../core/dom.js';
import { date, daysUntil } from '../core/format.js';

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

// ---- Thông báo chưa đọc: BE trả cờ read theo từng tài khoản (đọc ở máy nào cũng đồng bộ) ----
export const isUnread = n => !n.read;

export function countUnread(items) {
  return (items || []).filter(isUnread).length;
}
