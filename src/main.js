import { configureClient } from './api/client.js';
import { session } from './core/session.js';
import { startRouter } from './core/router.js';
import { toast } from './core/ui.js';
import { applyTheme } from './core/theme.js';
import { initSelectBoxes } from './core/selectBox.js';
import { initDatePickers } from './core/datePicker.js';
import { initButtonEffects } from './core/effects.js';
import { onNotification, stopRealtime } from './core/realtime.js';
import { refreshNotificationBadge } from './components/notificationBadge.js';

// áp dụng sáng / tối trước khi vẽ trang để không nháy màu
applyTheme();

configureClient({
  getToken: () => session.token(),
  onUnauthorized: () => {
    if (!session.isLoggedIn()) return;
    stopRealtime();
    session.end();
    toast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 'warning');
    window.location.hash = '#/login';
  }
});

// VNPay redirect về http://host/payment-result?vnp_... (đường dẫn thật, không phải hash)
// -> chuyển thành route hash của SPA, giữ nguyên query để gửi lại cho BE xác thực.
const path = window.location.pathname;
if (/\/payment-result\/?$/.test(path)) {
  const base = path.replace(/payment-result\/?$/, '');
  window.history.replaceState(null, '', `${base}#/member/payment-result${window.location.search}`);
}

// thông báo đẩy realtime: hiện toast, cập nhật chuông, báo trang đang mở tải lại danh sách
onNotification(n => {
  toast((n.content || '').slice(0, 160), 'info', n.title || 'Thông báo mới');
  refreshNotificationBadge({ force: true });
  window.dispatchEvent(new CustomEvent('sc:notification', { detail: n }));
});

initSelectBoxes();
initDatePickers();
initButtonEffects();
startRouter();
