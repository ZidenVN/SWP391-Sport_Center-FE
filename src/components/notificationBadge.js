import { memberApi } from '../api/endpoints.js';
import { session } from '../core/session.js';
import { countUnread } from './memberAlerts.js';

const MIN_INTERVAL_MS = 30000;
let lastFetch = 0;
let inflight = null;

export function setNotificationBadge(count) {
  document.querySelectorAll('[data-notification-count]').forEach(el => {
    el.textContent = count > 9 ? '9+' : String(count);
    el.classList.toggle('hidden', !count);
  });
  const bell = document.getElementById('notif-bell');
  if (bell) bell.setAttribute('aria-label', count ? `Thông báo (${count} chưa đọc)` : 'Thông báo');
}

// Cập nhật số thông báo chưa đọc (chỉ cho Member), tự giãn cách để không gọi API mỗi lần chuyển trang
export function refreshNotificationBadge({ force = false } = {}) {
  if (session.role() !== 'MEMBER') return Promise.resolve();
  if (!force && (inflight || Date.now() - lastFetch < MIN_INTERVAL_MS)) return inflight || Promise.resolve();
  lastFetch = Date.now();
  // BE đếm sẵn số chưa đọc; endpoint cũ lỗi thì đếm từ danh sách
  inflight = memberApi.unreadNotificationCount()
    .then(r => Number(r?.count) || 0)
    .catch(() => memberApi.notifications().then(countUnread))
    .then(setNotificationBadge)
    .catch(() => { /* không làm phiền người dùng nếu lỗi badge */ })
    .finally(() => { inflight = null; });
  return inflight;
}
