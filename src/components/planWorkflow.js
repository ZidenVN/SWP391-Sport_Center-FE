import { html, raw, icon } from "../core/dom.js";
import { emptyState, withBusy, toast } from "../core/ui.js";
import { http } from "../api/client.js";

const API = "/plan-workflow";

const names = {
  IN_PROGRESS: "Đang thực hiện",
  PENDING_REVIEW: "Chờ duyệt",
  NEEDS_REVISION: "Cần làm lại",
  COMPLETED: "Đã hoàn thành",
  ACCEPT: "Đã xác nhận",
  REDO: "Yêu cầu làm lại",
};

const text = (value) => names[value] || value || "Chưa cập nhật";

const day = (value) =>
  value ? value.split("-").reverse().join("/") : "Chưa có hạn";

const stamp = (value) =>
  value ? `${day(value.slice(0, 10))}, ${value.slice(11, 16)}` : "Chưa báo";

const latest = (p) => (p.attempts || []).at(-1);

const norm = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const same = (a, b) => String(a) === String(b);

const unique = (rows, key) => [
  ...new Map(rows.map((p) => [String(p[key]), p])).values(),
];

const today = () => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type) => parts.find((p) => p.type === type).value;

  return `${part("year")}-${part("month")}-${part("day")}`;
};

const badge = (p) => html`
  <span class="pw-status pw-${p.status}"> ${text(p.status)} </span>
`;

const pill = (label, action, value, active) => html`
  <button
    type="button"
    class="pw-pill ${active ? "is-active" : ""}"
    data-action="${action}"
    data-value="${value}"
    aria-pressed="${active ? "true" : "false"}"
  >
    ${label}
  </button>
`;

const dropdown = (name, rows, key, label, value, action) => html`
  <select
    class="input"
    name="${name}"
    data-action="${action}"
    ${rows.length ? "" : raw("disabled")}
  >
    ${rows.length
      ? rows.map(
          (p) => html`
            <option
              value="${p[key]}"
              ${same(p[key], value) ? raw("selected") : ""}
            >
              ${p[label]}
            </option>
          `,
        )
      : html`<option value="">Chưa có dữ liệu</option>`}
  </select>
`;

export function workflowState(coach = false) {
  return {
    wfItems: [],
    wfMode: coach ? "CLASS" : "ALL",
    wfClass: "",
    wfPlan: "",
    wfStatus: "ALL",
    wfKeyword: "",
    wfOpenId: null,
    wfDrafts: {},
    wfInitialized: false,
    wfSaving: false,
  };
}

export function workflowLoaded(items, s, coach = false, requestedId = null) {
  if (items.some((p) => p.planId == null)) {
    throw new Error("API thiếu planId. Hãy cập nhật BE trước.");
  }

  let mode = s.wfMode;
  let classId = s.wfClass;
  let planId = s.wfPlan;

  const id = s.wfInitialized ? s.wfOpenId : requestedId;

  const opened = items.find((p) => same(p.memberPlanId, id));

  if (!s.wfInitialized && requestedId && !opened) {
    throw new Error("Không tìm thấy giáo án hoặc bạn không có quyền xem.");
  }

  if (!s.wfInitialized && opened) {
    mode = opened.classId == null ? "PERSONAL" : "CLASS";
    classId = String(opened.classId ?? "");
    planId = String(opened.planId);
  }

  const classes = unique(
    items.filter((p) => p.classId != null),
    "classId",
  );

  if (!classes.some((p) => same(p.classId, classId))) {
    classId = String(classes[0]?.classId ?? "");
  }

  if (coach && !classes.length) {
    mode = "PERSONAL";
  }

  const plans = unique(
    items.filter((p) => p.classId != null && same(p.classId, classId)),
    "planId",
  );

  if (!plans.some((p) => same(p.planId, planId))) {
    planId = "";
  }

  return {
    wfItems: items,
    wfMode: mode,
    wfClass: classId,
    wfPlan: planId,
    wfOpenId: opened ? String(id) : null,
    wfInitialized: true,
  };
}

function scope(s, coach) {
  return s.wfItems.filter((p) =>
    s.wfMode === "PERSONAL"
      ? p.classId == null
      : s.wfMode === "CLASS"
        ? p.classId != null &&
          same(p.classId, s.wfClass) &&
          (!coach || !s.wfPlan || same(p.planId, s.wfPlan))
        : true,
  );
}

function draft(s, p) {
  const key = `${p.status}:${latest(p)?.submissionId ?? 0}`;

  if (s.wfDrafts[p.memberPlanId]?.key !== key) {
    s.wfDrafts[p.memberPlanId] = {
      key,
      note: "",
      decision: "ACCEPT",
      feedback: "",
      newDueDate: "",
    };
  }

  return s.wfDrafts[p.memberPlanId];
}

function history(p) {
  return html`
    <details class="pw-history">
      <summary>Lịch sử báo hoàn thành (${p.attempts.length})</summary>

      ${p.attempts.length
        ? [...p.attempts].reverse().map(
            (a) => html`
              <article>
                <b> Lần ${a.attempt} · ${stamp(a.submittedAt)} </b>

                <p class="${a.late ? "pw-late" : "pw-ontime"}">
                  ${a.late ? "Nộp trễ" : "Đúng hạn"} · Hạn tại lần báo:
                  ${day(a.dueDateAtSubmission)}
                </p>

                <p class="pw-pre">Ghi chú: ${a.memberNote || "Không có"}</p>

                <p>
                  ${text(a.decision)}
                  ${a.reviewedAt ? ` · ${stamp(a.reviewedAt)}` : ""}
                </p>

                ${a.coachFeedback
                  ? html` <p class="pw-pre">Coach: ${a.coachFeedback}</p> `
                  : ""}
                ${a.extendedDueDate
                  ? html` <p>Gia hạn đến ${day(a.extendedDueDate)}</p> `
                  : ""}
              </article>
            `,
          )
        : html`<p>Chưa có lần báo nào.</p>`}
    </details>
  `;
}

function detail(s, p, coach) {
  const a = latest(p);
  const d = draft(s, p);
  const redo = d.decision === "REDO";

  return html`
    <dialog
      class="pw-panel"
      data-wf-detail
      data-native-select
      data-native-date
      aria-label="Chi tiết giáo án"
    >
      <div class="pw-panel-head">
        <h2>${coach ? `Duyệt bài · ${p.memberName}` : p.planName}</h2>

        <button
          type="button"
          class="btn-ghost"
          data-action="wf-close"
          aria-label="Đóng chi tiết"
        >
          ${icon("x")}
        </button>
      </div>

      <div class="pw-panel-body">
        ${coach ? html`<h3>${p.planName}</h3>` : ""}

        <p>${p.className} · HLV ${p.coachName}</p>

        ${badge(p)}

        <h3>Bài tập</h3>
        <p class="pw-pre">${p.exerciseDetails}</p>

        <h3>Hạn hoàn thành</h3>
        <b>${day(p.dueDate)}</b>

        <p class="pw-muted">Hạn tính đến hết ngày, theo giờ Việt Nam.</p>

        ${p.overdue
          ? html` <p class="pw-late">Quá hạn, chưa báo hoàn thành.</p> `
          : ""}
        ${d.error
          ? html`
              <div class="pw-note" role="alert">
                <p>${d.error}</p>

                <button
                  type="button"
                  class="btn-secondary btn-sm"
                  data-action="wf-reload"
                >
                  Tải lại dữ liệu
                </button>
              </div>
            `
          : ""}
        ${a
          ? html`
              <div class="pw-note">
                <b> Lần ${a.attempt} · ${stamp(a.submittedAt)} </b>

                <p class="${a.late ? "pw-late" : "pw-ontime"}">
                  ${a.late ? "Nộp trễ" : "Đúng hạn"}
                </p>

                <p class="pw-pre">
                  Ghi chú học viên: ${a.memberNote || "Không có"}
                </p>

                ${a.coachFeedback
                  ? html`
                      <p class="pw-pre"><b>Coach:</b> ${a.coachFeedback}</p>
                    `
                  : ""}
              </div>
            `
          : ""}
        ${coach && p.status === "PENDING_REVIEW" && a
          ? html`
              <form
                data-action="wf-review"
                data-id="${p.memberPlanId}"
                data-submission="${a.submissionId}"
                class="pw-form"
              >
                <label>
                  Xử lý

                  <select
                    class="input"
                    name="decision"
                    data-action="wf-decision"
                  >
                    <option value="ACCEPT" ${!redo ? raw("selected") : ""}>
                      Xác nhận hoàn thành
                    </option>

                    <option value="REDO" ${redo ? raw("selected") : ""}>
                      Yêu cầu làm lại
                    </option>
                  </select>
                </label>

                <label>
                  ${redo
                    ? "Lý do yêu cầu làm lại *"
                    : "Nhận xét (không bắt buộc)"}

                  <textarea
                    class="input"
                    name="feedback"
                    rows="3"
                    maxlength="2000"
                    data-action="wf-edit"
                    data-live
                    ${redo ? raw("required") : ""}
                  >
${d.feedback}</textarea
                  >
                </label>

                ${redo
                  ? html`
                      <label>
                        Gia hạn (không bắt buộc)

                        <input
                          class="input"
                          type="date"
                          name="newDueDate"
                          value="${d.newDueDate}"
                          min="${p.dueDate > today() ? p.dueDate : today()}"
                          data-action="wf-edit"
                        />
                      </label>
                    `
                  : ""}

                <button type="submit" class="btn-primary">Lưu phản hồi</button>
              </form>
            `
          : ""}
        ${!coach &&
        p.dueDate &&
        ["IN_PROGRESS", "NEEDS_REVISION"].includes(p.status)
          ? html`
              <form
                data-action="wf-submit"
                data-id="${p.memberPlanId}"
                data-attempt="${p.attempts.length + 1}"
                class="pw-form"
              >
                <label>
                  Ghi chú hoàn thành (không bắt buộc)

                  <textarea
                    class="input"
                    name="note"
                    rows="3"
                    maxlength="2000"
                    data-action="wf-edit"
                    data-live
                  >
${d.note}</textarea
                  >
                </label>

                <p class="pw-muted">
                  Báo cáo tự xác nhận. Coach sẽ xem và phản hồi.
                </p>

                <button type="submit" class="btn-primary">
                  ${p.status === "NEEDS_REVISION"
                    ? "Báo hoàn thành lại"
                    : "Báo hoàn thành"}
                </button>
              </form>
            `
          : ""}
        ${!coach && p.status === "PENDING_REVIEW"
          ? html` <p class="pw-note">Đã gửi báo cáo, đang chờ Coach duyệt.</p> `
          : ""}
        ${history(p)}
      </div>
    </dialog>
  `;
}

export function workflowView(s, coach = false) {
  const classes = unique(
    s.wfItems.filter((p) => p.classId != null),
    "classId",
  );

  const plans = unique(
    s.wfItems.filter((p) => p.classId != null && same(p.classId, s.wfClass)),
    "planId",
  );

  const rows = scope(s, coach);

  const filtered = rows.filter(
    (p) =>
      (s.wfStatus === "ALL" || p.status === s.wfStatus) &&
      norm(`${p.memberName} ${p.planName} ${p.className}`).includes(
        norm(s.wfKeyword.trim()),
      ),
  );

  const opened = s.wfItems.find((p) => same(p.memberPlanId, s.wfOpenId));

  const classView = coach && s.wfMode === "CLASS";
  const singlePlan = classView && Boolean(s.wfPlan);
  const first = rows[0];

  const dueDates = [...new Set(rows.map((p) => p.dueDate))];

  const actionText = (p) =>
    coach
      ? p.status === "PENDING_REVIEW"
        ? "Xem và duyệt"
        : "Xem lịch sử"
      : {
          IN_PROGRESS: "Báo hoàn thành",
          PENDING_REVIEW: "Xem lần đã báo",
          NEEDS_REVISION: "Xem yêu cầu",
          COMPLETED: "Xem kết quả",
        }[p.status] || "Xem";

  return html`
    <section class="pw">
      <div class="pw-layout ${opened ? "has-detail" : ""}">
        <div class="pw-main">
          <div class="pw-toolbar">
            ${!coach
              ? pill("Tất cả", "wf-mode", "ALL", s.wfMode === "ALL")
              : ""}
            ${coach
              ? pill("Giáo án lớp", "wf-mode", "CLASS", s.wfMode === "CLASS")
              : ""}
            ${pill(
              coach ? "Giáo án cá nhân" : "Cá nhân",
              "wf-mode",
              "PERSONAL",
              s.wfMode === "PERSONAL",
            )}
            ${!coach
              ? classes.map((p) =>
                  pill(
                    p.className,
                    "wf-class",
                    p.classId,
                    s.wfMode === "CLASS" && same(s.wfClass, p.classId),
                  ),
                )
              : ""}

            <button
              type="button"
              class="btn-secondary btn-sm pw-refresh"
              data-action="wf-reload"
            >
              Tải lại
            </button>
          </div>

          ${s.wfItemsError || s.__error
            ? html`
                <p class="pw-note" role="alert">
                  Không tải được dữ liệu mới. Bấm Tải lại để thử lại.
                </p>
              `
            : ""}
          ${classView
            ? html`
                <div class="pw-selects">
                  <label>
                    Lớp
                    ${dropdown(
                      "wfClass",
                      classes,
                      "classId",
                      "className",
                      s.wfClass,
                      "wf-class",
                    )}
                  </label>

                  <label>
                    Giáo án
                    ${dropdown(
                      "wfPlan",
                      [
                        {
                          planId: "",
                          planName: "Tất cả giáo án",
                        },
                        ...plans,
                      ],
                      "planId",
                      "planName",
                      s.wfPlan,
                      "wf-plan",
                    )}
                  </label>
                </div>
              `
            : ""}
          ${singlePlan && first
            ? html`
                <div class="card pw-summary">
                  <h2>${first.planName}</h2>

                  <p class="pw-pre">${first.exerciseDetails}</p>

                  <p class="pw-muted">
                    ${dueDates.length === 1
                      ? `Hạn: ${day(first.dueDate)}`
                      : "Hạn theo từng học viên"}
                    · ${rows.length} học viên ·
                    ${rows.filter((p) => p.status === "PENDING_REVIEW").length}
                    chờ duyệt ·
                    ${rows.filter((p) => p.status === "COMPLETED").length} hoàn
                    thành
                  </p>
                </div>
              `
            : ""}
          ${!coach
            ? html`
                <p class="pw-muted">
                  ${s.wfMode === "CLASS"
                    ? classes.find((p) => same(p.classId, s.wfClass))?.className
                    : "Giáo án của tôi"}
                  · Chỉ hiển thị giáo án và trạng thái của bạn.
                </p>
              `
            : ""}

          <div class="pw-toolbar">
            ${[
              "ALL",
              "PENDING_REVIEW",
              "IN_PROGRESS",
              "NEEDS_REVISION",
              "COMPLETED",
            ].map((status) =>
              pill(
                `${status === "ALL" ? "Tất cả" : text(status)} (${
                  rows.filter((p) => status === "ALL" || p.status === status)
                    .length
                })`,
                "wf-status",
                status,
                s.wfStatus === status,
              ),
            )}

            <input
              class="input pw-search"
              name="wfKeyword"
              data-action="wf-search"
              data-live
              placeholder="${coach
                ? "Tìm học viên, giáo án..."
                : "Tìm giáo án..."}"
              value="${s.wfKeyword}"
            />
          </div>

          <div class="card pw-table-wrap">
            ${filtered.length
              ? html`
                  <table class="pw-table">
                    <thead>
                      <tr>
                        <th>${coach ? "Học viên" : "Giáo án"}</th>
                        <th>${coach ? "Lần báo / Hạn" : "Hạn hoàn thành"}</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${filtered.map((p) => {
                        const a = latest(p);

                        return html`
                          <tr
                            class="${same(p.memberPlanId, s.wfOpenId)
                              ? "is-selected"
                              : ""}"
                          >
                            <td>
                              <b> ${coach ? p.memberName : p.planName} </b>

                              ${coach && !singlePlan
                                ? html` <small> ${p.planName} </small> `
                                : ""}
                              ${!classView
                                ? html`
                                    <small>
                                      ${p.className} · HLV ${p.coachName}
                                    </small>
                                  `
                                : ""}
                            </td>

                            <td>
                              ${coach
                                ? html`
                                    <span> ${stamp(a?.submittedAt)} </span>

                                    ${a
                                      ? html`
                                          <small
                                            class="${a.late
                                              ? "pw-late"
                                              : "pw-ontime"}"
                                          >
                                            ${a.late ? "Nộp trễ" : "Đúng hạn"}
                                          </small>
                                        `
                                      : ""}

                                    <small> Hạn: ${day(p.dueDate)} </small>
                                  `
                                : day(p.dueDate)}
                            </td>

                            <td>
                              ${badge(p)}
                              ${p.overdue
                                ? html`
                                    <small class="pw-late">
                                      Quá hạn, chưa báo
                                    </small>
                                  `
                                : ""}
                            </td>

                            <td>
                              <button
                                type="button"
                                class="${p.status === "PENDING_REVIEW" && coach
                                  ? "btn-primary"
                                  : "btn-secondary"} btn-sm"
                                data-action="wf-open"
                                data-id="${p.memberPlanId}"
                              >
                                ${actionText(p)}
                              </button>
                            </td>
                          </tr>
                        `;
                      })}
                    </tbody>
                  </table>
                `
              : emptyState(
                  s.wfItems.length
                    ? "Không có giáo án phù hợp"
                    : "Chưa có giáo án để theo dõi",
                  "clipboard-list",
                )}
          </div>
        </div>

        ${opened ? detail(s, opened, coach) : ""}
      </div>
    </section>
  `;
}

export function workflowAfterRender(s, ctx) {
  const panel = ctx.el.querySelector("[data-wf-detail]");

  if (!panel || panel.open) return;

  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();

      if (!ctx.state.wfSaving) {
        ctx.set({ wfOpenId: null });
      }
    }
  });

  panel.addEventListener("cancel", (e) => {
    e.preventDefault();

    if (!ctx.state.wfSaving) {
      ctx.set({ wfOpenId: null });
    }
  });

  if (window.matchMedia("(max-width: 1279px)").matches) {
    panel.showModal();
  } else {
    panel.show();
  }
}

export function workflowActions(coach = false) {
  const guarded = (fn) => (t, e, ctx) => {
    if (!ctx.state.wfSaving) {
      return fn(t, e, ctx);
    }
  };

  async function save(form, ctx, path, payload, message) {
    if (ctx.state.wfSaving) return;

    ctx.state.wfSaving = true;

    try {
      const p = ctx.state.wfItems.find((p) =>
        same(p.memberPlanId, form.dataset.id),
      );

      const d = draft(ctx.state, p);
      d.error = "";

      const result = await withBusy(form, async () => {
        try {
          return await http.post(`${API}/${form.dataset.id}/${path}`, payload);
        } catch (err) {
          d.error = err.message || "Không lưu được. Hãy thử lại.";
          throw err;
        }
      });

      if (!result) {
        ctx.rerender();
        return;
      }

      delete ctx.state.wfDrafts[form.dataset.id];

      ctx.state.wfItems = ctx.state.wfItems.map((p) =>
        same(p.memberPlanId, result.memberPlanId) ? result : p,
      );

      if (ctx.state.plans) {
        ctx.state.plans = ctx.state.plans.map((p) =>
          same(p.memberPlanId, result.memberPlanId)
            ? {
                ...p,
                status: result.status,
                dueDate: result.dueDate,
              }
            : p,
        );
      }

      toast(message);
      ctx.rerender();
      await ctx.reload();
    } finally {
      ctx.state.wfSaving = false;
    }
  }

  return {
    "wf-mode": guarded((t, e, ctx) => {
      const patch = {
        wfMode: t.dataset.value,
        wfPlan: "",
        wfStatus: "ALL",
        wfOpenId: null,
        wfKeyword: "",
      };

      ctx.set({
        ...patch,
        ...workflowLoaded(ctx.state.wfItems, { ...ctx.state, ...patch }, coach),
      });
    }),

    "wf-class": guarded((t, e, ctx) => {
      const patch = {
        wfMode: "CLASS",
        wfClass: t.value || t.dataset.value,
        wfPlan: "",
        wfStatus: "ALL",
        wfOpenId: null,
        wfKeyword: "",
      };

      ctx.set({
        ...patch,
        ...workflowLoaded(ctx.state.wfItems, { ...ctx.state, ...patch }, coach),
      });
    }),

    "wf-plan": guarded((t, e, ctx) =>
      ctx.set({
        wfPlan: t.value,
        wfStatus: "ALL",
        wfOpenId: null,
        wfKeyword: "",
      }),
    ),

    "wf-status": guarded((t, e, ctx) =>
      ctx.set({
        wfStatus: t.dataset.value,
      }),
    ),

    "wf-search": guarded((t, e, ctx) =>
      ctx.set({
        wfKeyword: t.value,
      }),
    ),

    "wf-open": guarded((t, e, ctx) =>
      ctx.set({
        wfOpenId: t.dataset.id,
      }),
    ),

    "wf-close": guarded((t, e, ctx) =>
      ctx.set({
        wfOpenId: null,
      }),
    ),

    "wf-reload": guarded((t, e, ctx) => withBusy(t, () => ctx.reload())),

    "wf-edit": (t, e, ctx) => {
      const p = ctx.state.wfItems.find((p) =>
        same(p.memberPlanId, t.closest("form").dataset.id),
      );

      if (p) {
        draft(ctx.state, p)[t.name] = t.value;
      }
    },

    "wf-decision": guarded((t, e, ctx) => {
      const p = ctx.state.wfItems.find((p) =>
        same(p.memberPlanId, t.closest("form").dataset.id),
      );

      if (!p) return;

      const d = draft(ctx.state, p);
      d.decision = t.value;

      if (t.value === "ACCEPT") {
        d.newDueDate = "";
      }

      ctx.rerender();
    }),

    "wf-submit": (form, e, ctx) =>
      save(
        form,
        ctx,
        "submit",
        {
          attempt: Number(form.dataset.attempt),
          note: form.elements.note.value.trim() || null,
        },
        "Đã báo hoàn thành, đang chờ Coach duyệt",
      ),

    "wf-review": (form, e, ctx) => {
      const decision = form.elements.decision.value;

      const feedback = form.elements.feedback.value.trim() || null;

      const newDueDate =
        decision === "REDO" ? form.elements.newDueDate?.value || null : null;

      if (decision === "REDO" && !feedback) {
        return toast("Cần ghi lý do yêu cầu làm lại", "error");
      }

      return save(
        form,
        ctx,
        "review",
        {
          submissionId: Number(form.dataset.submission),
          decision,
          feedback,
          newDueDate,
        },
        "Đã lưu phản hồi",
      );
    },
  };
}
