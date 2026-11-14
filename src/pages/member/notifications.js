import { html, icon } from "../../core/dom.js";
import { pageHeader, emptyState, tabs, toast } from "../../core/ui.js";
import { mountPage } from "../../core/page.js";
import { memberApi } from "../../api/endpoints.js";
import { dateTime, badge } from "../../core/format.js";
import { isUnread, countUnread } from "../../components/memberAlerts.js";
import { setNotificationBadge } from "../../components/notificationBadge.js";

const STYLE = {
  CLASS: ["users", "bg-sky-50 text-sky-600"],
  INDIVIDUAL: ["user", "bg-violet-50 text-violet-600"],
  SYSTEM: ["megaphone", "bg-amber-50 text-amber-600"],
  // thông báo tự động của BE khi lớp đổi giờ / phòng hoặc bị hủy
  SCHEDULE_CHANGE: ["calendar-clock", "bg-amber-50 text-amber-600"],
  CLASS_CANCELLED: ["calendar-x", "bg-rose-50 text-rose-600"],
  // lễ tân gửi từ quầy (1 / nhiều / mọi hội viên)
  STAFF_MESSAGE: ["message-square-text", "bg-indigo-50 text-indigo-600"],
  CLASS_STOPPED: ["octagon-x", "bg-rose-50 text-rose-600"],
  CLASS_UPDATED: ["calendar-clock", "bg-amber-50 text-amber-600"],
  SESSION_POSTPONED: ["calendar-x", "bg-amber-50 text-amber-600"],
  MAKEUP_SESSION_SCHEDULED: ["calendar-plus", "bg-violet-50 text-violet-600"],
  COACH_SUBSTITUTE: ["user-cog", "bg-sky-50 text-sky-600"],
  SUBSCRIPTION_REFUNDED: ["undo-2", "bg-violet-50 text-violet-600"],
  ISSUE_REPORT_CREATED: ["siren", "bg-amber-50 text-amber-600"],
  ISSUE_REPORT_UPDATED: ["message-circle-reply", "bg-sky-50 text-sky-600"],
  ISSUE_REPORT_ESCALATED: ["arrow-up-right", "bg-violet-50 text-violet-600"],
  CLASS_REMINDER: ["alarm-clock", "bg-sky-50 text-sky-600"],
  CLASS_SWITCHED: ["arrow-left-right", "bg-sky-50 text-sky-600"],
  SUBSCRIPTION_ACTIVATED: ["badge-check", "bg-emerald-50 text-emerald-600"],
  SUBSCRIPTION_EXPIRING: ["hourglass", "bg-amber-50 text-amber-600"],
};

// BE: category STAFF = HLV / nhân viên gửi (có senderName), SYSTEM = hệ thống tự gửi
const senderText = (n) =>
  n.category === "STAFF" && n.senderName ? `Từ ${n.senderName}` : "Hệ thống";

function view(s) {
  const unread = countUnread(s.items);
  const list = s.tab === "UNREAD" ? s.items.filter(isUnread) : s.items;
  return html` ${pageHeader(
    "Thông báo",
    "Thông báo từ trung tâm, huấn luyện viên và hệ thống (đổi lịch lớp, gói sắp hết hạn...)",
    html`<button
      type="button"
      class="btn-secondary"
      data-action="read-all"
      data-testid="read-all"
      ${unread ? "" : "disabled"}
    >
      ${icon("check-check", "w-4 h-4")} Đánh dấu đã đọc tất cả
    </button>`,
  )}
  ${tabs(
    [
      { id: "ALL", label: "Tất cả", count: s.items.length },
      { id: "UNREAD", label: "Chưa đọc", count: unread },
    ],
    s.tab,
  )}
  ${list.length
    ? html` <div class="space-y-3" data-testid="notification-list">
        ${list.map((n) => {
          const [ic, cls] = STYLE[n.targetType] || STYLE.INDIVIDUAL;
          const isNew = isUnread(n);
          return html` <div
            class="card p-5 flex gap-4 ${isNew
              ? "ring-2 ring-emerald-100 border-emerald-200 cursor-pointer"
              : ""}"
            data-testid="notification"
            data-unread="${isNew}"
            ${isNew
              ? html`data-action="read" data-notification="${n.notificationId}"
                title="Bấm để đánh dấu đã đọc"`
              : ""}
          >
            <div
              class="w-10 h-10 rounded-xl ${cls} flex items-center justify-center shrink-0"
            >
              ${icon(ic, "w-5 h-5")}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                ${isNew
                  ? html`<span
                      class="w-2 h-2 rounded-full bg-rose-500"
                      title="Chưa đọc"
                    ></span>`
                  : ""}
                <span class="font-bold ${isNew ? "" : "text-slate-700"}"
                  >${n.title}</span
                >${badge(n.targetType)}
                ${n.targetType === "CLASS"
                  ? html`<span class="text-xs text-slate-500"
                      >Lớp ${n.targetName}</span
                    >`
                  : ""}
              </div>
              <p class="text-sm text-slate-700 mt-1 whitespace-pre-line">
                ${n.content}
              </p>
              ${/^\/member\/plan-workflow\/\d+$/.test(n.actionUrl || "")
                ? html`
                    <a
                      class="btn-secondary btn-sm mt-2"
                      href="#${n.actionUrl}"
                      data-action="open-plan"
                    >
                      Xem phản hồi giáo án
                    </a>
                  `
                : ""}
              <div
                class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-2"
              >
                <span class="inline-flex items-center gap-1"
                  >${icon(
                    n.category === "STAFF" ? "user-round" : "bot",
                    "w-3.5 h-3.5",
                  )}
                  ${senderText(n)}</span
                >
                <span>${dateTime(n.sendDate)}</span>
                ${isNew
                  ? ""
                  : html`<span
                      class="inline-flex items-center gap-1 text-emerald-600"
                      >${icon("check-check", "w-3.5 h-3.5")} Đã đọc</span
                    >`}
              </div>
            </div>
          </div>`;
        })}
      </div>`
    : emptyState(
        s.tab === "UNREAD" && s.items.length
          ? "Bạn đã đọc hết thông báo"
          : "Bạn chưa có thông báo nào",
        "bell-off",
      )}`;
}

export default function MemberNotifications(el) {
  let page = null;
  // thông báo đẩy realtime khi đang mở trang: chèn lên đầu danh sách, không cần tải lại
  const onPush = (e) => {
    const n = e.detail;
    if (!page?.state.items || !n?.notificationId) return;
    if (page.state.items.some((x) => x.notificationId === n.notificationId))
      return;
    page.state.items.unshift({ ...n, read: false });
    setNotificationBadge(countUnread(page.state.items));
    page.rerender();
  };
  window.addEventListener("sc:notification", onPush);
  const dispose = mountPage(el, {
    state: { tab: "ALL" },
    load: async (ctx) => {
      page = ctx;
      const items = await memberApi.notifications();
      setNotificationBadge(countUnread(items));
      return { items };
    },
    view,
    actions: {
      "open-plan": (t) => {
        window.location.hash = t.getAttribute("href");
      },
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      // đổi giao diện ngay, lỗi thì trả lại trạng thái cũ
      read: async (t, e, ctx) => {
        const n = ctx.state.items.find(
          (x) => String(x.notificationId) === t.dataset.notification,
        );
        if (!n || n.read) return;
        n.read = true;
        setNotificationBadge(countUnread(ctx.state.items));
        ctx.rerender();
        try {
          await memberApi.markNotificationRead(n.notificationId);
        } catch (err) {
          n.read = false;
          setNotificationBadge(countUnread(ctx.state.items));
          ctx.rerender();
          toast(err.message, "error");
        }
      },
      "read-all": async (t, e, ctx) => {
        t.disabled = true;
        try {
          await memberApi.markAllNotificationsRead();
          ctx.state.items.forEach((n) => {
            n.read = true;
          });
          setNotificationBadge(0);
          ctx.rerender();
          toast("Đã đánh dấu đã đọc tất cả thông báo", "success");
        } catch (err) {
          t.disabled = false;
          toast(err.message, "error");
        }
      },
    },
  });
  return () => {
    window.removeEventListener("sc:notification", onPush);
    dispose();
  };
}
