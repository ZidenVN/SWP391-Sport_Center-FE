import { html, icon } from "../../core/dom.js";
import {
  pageHeader,
  table,
  emptyState,
  statCard,
  select,
} from "../../core/ui.js";
import { mountPage } from "../../core/page.js";
import {
  fullName,
  genderLabel,
  toDate,
  phoneText,
  date, classCode } from "../../core/format.js";
import { memberAvatar } from "../../components/memberPicker.js";
import { loadMyStudents } from "../../components/coachForms.js";

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

function view(s) {
  const kw = norm(s.keyword.trim());
  const list = s.students
    .filter(
      (m) =>
        !s.classId || m.classes.some((c) => String(c.classId) === s.classId),
    )
    .filter(
      (m) =>
        !kw ||
        [fullName(m), m.phone, m.email, m.trainingGoal].some((v) =>
          norm(v).includes(kw),
        ),
    );
  const withGoal = s.students.filter(
    (m) => m.trainingGoal && m.trainingGoal !== "Chưa cập nhật",
  ).length;
  const now = new Date();
  return html` ${pageHeader(
      "Học viên",
      "Học viên đang theo học các lớp bạn phụ trách",
    )}
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      ${statCard("Tổng học viên", s.students.length, "users", "emerald")}
      ${statCard("Đã có mục tiêu", withGoal, "target", "amber")}
      ${statCard(
        "Lớp đang dạy",
        s.classes.filter((c) => toDate(c.endTime) >= now).length,
        "calendar-days",
        "sky",
      )}
    </div>
    <div class="card p-4 mb-5">
      <label class="block mb-3">
        Lọc theo lớp
        ${select(
          "classId",
          [
            { value: "", label: "Tất cả lớp" },
            ...s.classes.map((c) => ({
              value: String(c.classId),
              label: `${c.subjectName} ${classCode(c)}`,
            })),
          ],
          s.classId,
        )}
      </label>

      <div class="relative">
        <span class="absolute left-3 top-2.5 text-slate-400"
          >${icon("search", "w-4 h-4")}</span
        >
        <input
          class="input pl-9"
          name="keyword"
          data-action="search"
          data-live
          placeholder="Tìm theo tên, SĐT, email, mục tiêu..."
          value="${s.keyword}"
        />
      </div>
    </div>
    <div class="card" data-testid="student-table">
      ${list.length
        ? table({
            columns: [
              { label: "Học viên" },
              { label: "Liên hệ" },
              { label: "Mục tiêu tập luyện" },
              { label: "Lớp" },
              { label: "", cls: "text-right" },
            ],
            rows: list.map((m) => [
              html`<div class="flex items-center gap-3">
                ${memberAvatar(m, "w-9 h-9 text-sm")}
                <div>
                  <div class="font-semibold">${fullName(m)}</div>
                  <div class="text-xs text-slate-500">
                    #${m.memberId} · ${genderLabel(m.gender)}
                  </div>
                </div>
              </div>`,
              html`<div class="text-sm">${phoneText(m.phone)}</div>
                <div class="text-xs text-slate-500">${m.email}</div>`,
              html`<span class="text-sm text-slate-600"
                >${m.trainingGoal || "—"}</span
              >`,
              html`<div class="flex flex-col gap-1.5">
                ${m.classes.map((c) => {
                  const over = toDate(c.endTime) < now;
                  return html`<div
                    class="flex items-center gap-2 min-w-0"
                    data-testid="student-class"
                  >
                    <span
                      class="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${over
                        ? "bg-slate-100 text-slate-500"
                        : "bg-brand-sand text-brand-deep"}"
                      >${c.subjectName} ${classCode(c)}</span
                    >
                    <span class="text-xs text-slate-500 whitespace-nowrap"
                      >${date(c.startTime)} →
                      ${date(c.endTime)}${over ? " · đã kết thúc" : ""}</span
                    >
                  </div>`;
                })}
              </div>`,
              html`<a
                href="#/coach/members/${m.memberId}"
                class="btn-ghost btn-sm"
                data-testid="student-detail"
                >Chi tiết ${icon("chevron-right", "w-3.5 h-3.5")}</a
              >`,
            ]),
          })
        : emptyState(
            s.students.length
              ? "Không có học viên phù hợp"
              : "Chưa có học viên nào đăng ký lớp của bạn",
            "users",
          )}
    </div>`;
}

export default function CoachStudents(el) {
  return mountPage(el, {
    state: {
      keyword: "",
      classId: "",
    },

    load: () => loadMyStudents(),

    view,

    afterRender: (st, ctx) => {
      const classSelect = ctx.el.querySelector('[name="classId"]');

      classSelect?.addEventListener("change", (e) => {
        ctx.set({
          classId: e.target.value,
        });
      });
    },

    actions: {
      search: (t, e, ctx) => {
        ctx.set({
          keyword: t.value,
        });
      },
    },
  });
}
