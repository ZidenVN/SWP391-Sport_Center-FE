import { html } from "../../core/dom.js";
import { mountPage } from "../../core/page.js";
import { pageHeader, emptyState, withBusy } from "../../core/ui.js";
import { http } from "../../api/client.js";
import { session } from "../../core/session.js";

import {
  workflowState,
  workflowLoaded,
  workflowView,
  workflowActions,
  workflowAfterRender,
} from "../../components/planWorkflow.js";

export default function PlanWorkflow(el, route) {
  const coach = session.role() === "COACH";
  const notices = route.path === "/coach/notifications";

  return mountPage(el, {
    state: {
      ...workflowState(coach),
      notices: [],
    },

    load: async (ctx) =>
      notices
        ? {
            notices: await http.get("/plan-workflow/notifications"),
          }
        : workflowLoaded(
            await http.get("/plan-workflow"),
            ctx.state,
            coach,
            route.params.id,
          ),

    view: (s) => html`
      ${pageHeader(
        notices ? "Thông báo" : coach ? "Duyệt giáo án" : "Giáo án của tôi",
        notices
          ? "Thông báo từ học viên và hệ thống."
          : "Theo dõi trạng thái và phản hồi theo từng học viên.",
      )}
      ${notices
        ? html`
            <button
              type="button"
              class="btn-secondary mb-4"
              data-action="reload"
            >
              Tải lại
            </button>

            ${s.__error
              ? html`
                  <p role="alert">Không tải được thông báo mới. Hãy thử lại.</p>
                `
              : ""}

            <div class="space-y-4">
              ${s.notices.length
                ? s.notices.map(
                    (n) => html`
                      <article class="card p-5 space-y-2">
                        <h2 class="font-bold">
                          ${n.read ? "" : "● "} ${n.title}
                        </h2>

                        <p class="whitespace-pre-line">${n.content}</p>

                        ${/^\/coach\/plan-reviews\/\d+$/.test(n.actionUrl || "")
                          ? html`
                              <a
                                class="btn-primary btn-sm"
                                href="#${n.actionUrl}"
                              >
                                Xem bài cần duyệt
                              </a>
                            `
                          : ""}
                        ${!n.read
                          ? html`
                              <button
                                type="button"
                                class="btn-secondary btn-sm"
                                data-action="read"
                                data-id="${n.notificationId}"
                              >
                                Đã đọc
                              </button>
                            `
                          : ""}
                      </article>
                    `,
                  )
                : emptyState("Chưa có thông báo", "bell")}
            </div>
          `
        : workflowView(s, coach)}
    `,

    afterRender: workflowAfterRender,

    actions: {
      ...workflowActions(coach),

      read: async (button, event, ctx) => {
        const ok = await withBusy(button, async () => {
          await http.patch(
            `/plan-workflow/notifications/${button.dataset.id}/read`,
          );
          return true;
        });

        if (!ok) return;

        await ctx.reload();

        const { refreshNotificationBadge } =
          await import("../../components/notificationBadge.js");

        await refreshNotificationBadge({
          force: true,
        });
      },
    },
  });
}
