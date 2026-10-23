import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { dateTime, badge } from '../../core/format.js';
import { isUnread, markNotificationsSeen } from '../../components/memberAlerts.js';
import { setNotificationBadge } from '../../components/notificationBadge.js';

const STYLE = {
  CLASS: ['users', 'bg-sky-50 text-sky-600'],
  INDIVIDUAL: ['user', 'bg-violet-50 text-violet-600'],
  SYSTEM: ['megaphone', 'bg-amber-50 text-amber-600'],
  // thông báo tự động của BE khi lớp đổi giờ / phòng hoặc bị hủy
  SCHEDULE_CHANGE: ['calendar-clock', 'bg-amber-50 text-amber-600'],
  CLASS_CANCELLED: ['calendar-x', 'bg-rose-50 text-rose-600']
};

function view(s) {
  return html`
    ${pageHeader('Thông báo', 'Thông báo từ huấn luyện viên và hệ thống (đổi lịch lớp, gói sắp hết hạn...)')}
    ${s.items.length ? html`
      <div class="space-y-3" data-testid="notification-list">
        ${s.items.map(n => {
          const [ic, cls] = STYLE[n.targetType] || STYLE.INDIVIDUAL;
          const unread = s.unreadIds.has(n.notificationId);
          return html`
            <div class="card p-5 flex gap-4 ${unread ? 'ring-2 ring-emerald-100 border-emerald-200' : ''}" data-testid="notification" data-unread="${unread}">
              <div class="w-10 h-10 rounded-xl ${cls} flex items-center justify-center shrink-0">${icon(ic, 'w-5 h-5')}</div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  ${unread ? html`<span class="w-2 h-2 rounded-full bg-rose-500" title="Mới"></span>` : ''}
                  <span class="font-bold">${n.title}</span>${badge(n.targetType)}
                  ${n.targetType === 'CLASS' ? html`<span class="text-xs text-slate-500">Lớp ${n.targetName}</span>` : ''}
                </div>
                <p class="text-sm text-slate-700 mt-1 whitespace-pre-line">${n.content}</p>
                <div class="text-xs text-slate-400 mt-2">${dateTime(n.sendDate)}</div>
              </div>
            </div>`;
        })}
      </div>` : emptyState('Bạn chưa có thông báo nào', 'bell-off')}`;
}

export default function MemberNotifications(el) {
  return mountPage(el, {
    load: async () => {
      const items = await memberApi.notifications();
      // ghi nhận "mới" trước khi đánh dấu đã xem, để lần này vẫn hiện chấm đỏ
      const unreadIds = new Set(items.filter(isUnread).map(n => n.notificationId));
      markNotificationsSeen(items);
      setNotificationBadge(0);
      return { items, unreadIds };
    },
    view
  });
}
