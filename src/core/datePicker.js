// Ô chọn ngày tự vẽ cho mọi <input type="date"> trong app + popup (mọi vai trò).
// Lịch gốc của trình duyệt không chỉnh giao diện được nên vẽ lại theo tông web (cùng kiểu ô chọn ở selectBox.js).
// <input type="date"> gốc vẫn nằm trong ô (ẩn) và giữ giá trị yyyy-MM-dd -> readForm, validate, min/max,
// sự kiện input/change của các trang giữ nguyên. Hai ô Từ/Đến cùng form thì tô khoảng ngày ở giữa.
// <input type="month"> dùng chung lịch này nhưng chỉ có bảng tháng / năm, giá trị dạng yyyy-MM.
const SKIP = ".auth-glass, [data-native-date]";
const SELECTOR = "input[type=date], input[type=month]";
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
// cặp tên ô Từ -> Đến đang dùng trong app
const RANGE_PAIRS = [
  ["from", "to"],
  ["fromDate", "toDate"],
  ["startDate", "endDate"],
];
let panel = null; // lịch đang mở { el, input, trigger, view, cursor }

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoMonth = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
// yyyy-MM-dd hoặc yyyy-MM (ô tháng, lấy ngày 1)
const parse = (v) => {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(v || "");
  return m ? new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) : null;
};
const isMonth = (input) => input.type === "month";
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// sang tháng khác nhưng giữ ngày trong giới hạn tháng đó (31/01 + 1 tháng = 28/02)
const addMonths = (d, n) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return new Date(
    t.getFullYear(),
    t.getMonth(),
    Math.min(
      d.getDate(),
      new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(),
    ),
  );
};
const label = (d) =>
  d
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    : "dd/mm/yyyy";
const monthLabel = (d) =>
  d ? `Tháng ${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "mm/yyyy";

function bounds(input) {
  return { min: parse(input.min), max: parse(input.max) };
}
const outOfRange = (d, { min, max }) => (min && d < min) || (max && d > max);

// ô còn lại của cặp Từ/Đến (cùng form / cùng khối cha)
function partnerOf(input) {
  const scope =
    input.form ||
    input.closest("form, [data-field-wrap]")?.parentElement ||
    document;
  for (const [a, b] of RANGE_PAIRS) {
    if (input.name === a)
      return {
        other: scope.querySelector(`input[type=date][name="${b}"]`),
        isStart: true,
      };
    if (input.name === b)
      return {
        other: scope.querySelector(`input[type=date][name="${a}"]`),
        isStart: false,
      };
  }
  return null;
}

function syncLabel(input) {
  const trigger = input.closest(".sc-dp");
  if (!trigger) return;
  const d = parse(input.value);
  trigger.querySelector(".sc-dp-label").textContent = isMonth(input)
    ? monthLabel(d)
    : label(d);
  trigger.classList.toggle("is-empty", !d);
  trigger.classList.toggle("is-disabled", input.disabled);
  trigger.tabIndex = input.disabled ? -1 : 0;
  trigger.setAttribute("aria-disabled", String(input.disabled));
}

function enhance(input) {
  if (input.dataset.scDp || input.closest(SKIP)) return;
  input.dataset.scDp = "1";
  const trigger = document.createElement("div");
  // ô bấm nhận luôn class của input (độ rộng, .input, mt-1...) để giữ bố cục cũ
  trigger.className = `${input.className} sc-dp`;
  trigger.setAttribute("role", "button");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute(
    "aria-label",
    input.getAttribute("aria-label") ||
      (isMonth(input) ? "Chọn tháng" : "Chọn ngày"),
  );
  trigger.dataset.fieldWrap = "";
  trigger.innerHTML =
    '<span class="sc-dp-label"></span><span class="sc-dp-ic" aria-hidden="true"></span>';
  input.replaceWith(trigger);
  trigger.appendChild(input);
  input.tabIndex = -1;
  input.classList.add("sc-dp-native");

  // code gán .value trực tiếp -> cập nhật chữ hiển thị
  const desc = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  );
  Object.defineProperty(input, "value", {
    configurable: true,
    get() {
      return desc.get.call(this);
    },
    set(v) {
      desc.set.call(this, v);
      syncLabel(this);
    },
  });
  input.addEventListener("change", () => syncLabel(input));
  new MutationObserver(() => syncLabel(input)).observe(input, {
    attributes: true,
    attributeFilter: ["disabled", "value"],
  });
  syncLabel(input);
}

function close(focus = false) {
  if (!panel) return;
  const { el, trigger } = panel;
  trigger.setAttribute("aria-expanded", "false");
  trigger.classList.remove("is-open");
  el.classList.add("is-leaving");
  setTimeout(() => el.remove(), 120);
  if (focus) trigger.focus();
  panel = null;
}

function place() {
  if (!panel) return;
  const { el, trigger } = panel;
  const r = trigger.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const below = innerHeight - r.bottom - 8;
  const up = below < h && r.top - 8 > below;
  el.style.left = `${Math.max(8, Math.min(r.left, innerWidth - w - 8))}px`;
  el.style.top = up ? "" : `${r.bottom + 6}px`;
  el.style.bottom = up ? `${innerHeight - r.top + 6}px` : "";
  el.classList.toggle("is-up", up);
}

function dayGrid() {
  const { input, cursor } = panel;
  const value = parse(input.value);
  const today = new Date();
  const lim = bounds(input);
  // khoảng Từ -> Đến để tô nền
  const pair = partnerOf(input);
  const otherVal = parse(pair?.other?.value);
  const [rs, re] =
    value && otherVal
      ? pair.isStart
        ? [value, otherVal]
        : [otherVal, value]
      : [null, null];
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = addDays(first, -((first.getDay() + 6) % 7)); // tuần bắt đầu thứ 2
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const cls = ["sc-dp-day"];
    if (d.getMonth() !== cursor.getMonth()) cls.push("is-out");
    if (sameDay(d, today)) cls.push("is-today");
    if (sameDay(d, value)) cls.push("is-selected");
    if (sameDay(d, cursor)) cls.push("is-cursor");
    if (i % 7 === 6) cls.push("is-sun");
    if (rs && re && rs <= re) {
      if (d > rs && d < re) cls.push("in-range");
      if (sameDay(d, rs)) cls.push("range-start");
      if (sameDay(d, re)) cls.push("range-end");
    }
    const off = outOfRange(d, lim);
    if (off) cls.push("is-disabled");
    cells.push(
      `<button type="button" class="${cls.join(" ")}" data-date="${iso(d)}" ${off ? "disabled" : ""} tabindex="-1" aria-label="${label(d)}">${d.getDate()}</button>`,
    );
  }
  return `<div class="sc-dp-week">${WEEKDAYS.map((w, i) => `<span class="${i === 6 ? "is-sun" : ""}">${w}</span>`).join("")}</div><div class="sc-dp-days">${cells.join("")}</div>`;
}

function monthGrid() {
  const { input, cursor } = panel;
  const value = parse(input.value);
  const now = new Date();
  const lim = isMonth(input) ? bounds(input) : {}; // ô ngày: chọn tháng chỉ để chuyển trang, không chặn
  return `<div class="sc-dp-grid">${MONTHS.map((m, i) => {
    const cls = ["sc-dp-cell"];
    if (
      value &&
      value.getFullYear() === cursor.getFullYear() &&
      value.getMonth() === i
    )
      cls.push("is-selected");
    if (now.getFullYear() === cursor.getFullYear() && now.getMonth() === i)
      cls.push("is-today");
    if (isMonth(input) && cursor.getMonth() === i) cls.push("is-cursor");
    const off = outOfRange(new Date(cursor.getFullYear(), i, 1), lim);
    if (off) cls.push("is-disabled");
    return `<button type="button" class="${cls.join(" ")}" data-month="${i}" ${off ? "disabled" : ""}>${m}</button>`;
  }).join("")}</div>`;
}

function yearGrid() {
  const { input, cursor } = panel;
  const value = parse(input.value);
  const from = cursor.getFullYear() - (cursor.getFullYear() % 12);
  return `<div class="sc-dp-grid">${Array.from(
    { length: 12 },
    (_, i) => from + i,
  )
    .map((y) => {
      const cls = ["sc-dp-cell"];
      if (value?.getFullYear() === y) cls.push("is-selected");
      if (new Date().getFullYear() === y) cls.push("is-today");
      return `<button type="button" class="${cls.join(" ")}" data-year="${y}">${y}</button>`;
    })
    .join("")}</div>`;
}

function draw() {
  if (!panel) return;
  const { el, view, cursor, input } = panel;
  const y = cursor.getFullYear();
  const from = y - (y % 12);
  const title =
    view === "days"
      ? `${MONTHS[cursor.getMonth()]}, ${y}`
      : view === "months"
        ? `Năm ${y}`
        : `${from} – ${from + 11}`;
  const lim = bounds(input);
  const todayOff = outOfRange(
    isMonth(input) ? startOfMonth(new Date()) : parse(iso(new Date())),
    lim,
  );
  el.innerHTML = `
    <div class="sc-dp-head">
      <button type="button" class="sc-dp-nav" data-nav="-1" aria-label="Trước"><span class="sc-dp-arrow is-left"></span></button>
      <button type="button" class="sc-dp-title" data-zoom aria-label="Chọn tháng / năm">${title}<span class="sc-dp-caret"></span></button>
      <button type="button" class="sc-dp-nav" data-nav="1" aria-label="Sau"><span class="sc-dp-arrow"></span></button>
    </div>
    <div class="sc-dp-body is-${view}">${view === "days" ? dayGrid() : view === "months" ? monthGrid() : yearGrid()}</div>
    <div class="sc-dp-foot">
      ${input.required ? "<span></span>" : '<button type="button" class="sc-dp-link is-muted" data-clear>Xóa</button>'}
      <button type="button" class="sc-dp-link" data-today ${todayOff ? "disabled" : ""}>${isMonth(input) ? "Tháng này" : "Hôm nay"}</button>
    </div>`;
}

function choose(value) {
  const { input, trigger } = panel;

  if (value && outOfRange(parse(value), bounds(input))) {
    return;
  }
  if (input.value !== value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  // đã chọn thì bỏ lỗi đang hiện dưới ô
  const err = trigger.nextElementSibling;
  if (err?.classList.contains("field-error") && value) err.remove();
  close(true);
}

function open(trigger) {
  const input = trigger.querySelector(SELECTOR);
  if (!input || input.disabled) return;
  close();
  const el = document.createElement("div");
  el.className = "sc-dp-panel";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", isMonth(input) ? "Chọn tháng" : "Chọn ngày");
  // popup đang mở thì gắn trong popup để không bị lớp phủ chặn
  (trigger.closest("#modal-root") || document.body).appendChild(el);
  const value = parse(input.value);
  const { min, max } = bounds(input);
  let cursor = value || new Date();
  if (min && cursor < min) cursor = min;
  if (max && cursor > max) cursor = max;
  panel = { el, input, trigger, view: homeView(input), cursor };
  trigger.setAttribute("aria-expanded", "true");
  trigger.classList.add("is-open");
  draw();
  place();
  el.addEventListener("pointerdown", (e) => e.preventDefault()); // giữ focus ở ô bấm
  el.addEventListener("click", onPanelClick);
}

// ô tháng không có bảng ngày: mở và quay về bảng tháng
const homeView = (input) => (isMonth(input) ? "months" : "days");
const valueOf = (input, d) => (isMonth(input) ? isoMonth(d) : iso(d));

function onPanelClick(e) {
  if (!panel) return;
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  const p = panel;
  if (b.dataset.date) return choose(b.dataset.date);
  if (b.hasAttribute("data-today")) return choose(valueOf(p.input, new Date()));
  if (b.hasAttribute("data-clear")) return choose("");
  if (b.dataset.nav) {
    const n = Number(b.dataset.nav);
    p.cursor =
      p.view === "days"
        ? addMonths(p.cursor, n)
        : addMonths(p.cursor, n * (p.view === "months" ? 12 : 144));
  } else if (b.hasAttribute("data-zoom")) {
    p.view =
      p.view === "days"
        ? "months"
        : p.view === "months"
          ? "years"
          : homeView(p.input);
  } else if (b.dataset.month) {
    p.cursor = new Date(
      p.cursor.getFullYear(),
      Number(b.dataset.month),
      Math.min(p.cursor.getDate(), 28),
    );
    if (isMonth(p.input)) return choose(isoMonth(p.cursor));
    p.view = "days";
  } else if (b.dataset.year) {
    p.cursor = new Date(
      Number(b.dataset.year),
      p.cursor.getMonth(),
      Math.min(p.cursor.getDate(), 28),
    );
    p.view = "months";
  }
  draw();
  place();
}

// phím trên ô đang mở: mũi tên đi ngày / tuần, PageUp/PageDown đổi tháng, Enter chọn, Esc đóng
function moveCursor(next) {
  const lim = bounds(panel.input);
  if (outOfRange(isMonth(panel.input) ? startOfMonth(next) : next, lim)) return;
  panel.cursor = next;
  panel.view = homeView(panel.input);
  panel.el.classList.add("is-kbd"); // chỉ hiện ô con trỏ khi đang đi bằng phím
  draw();
}

export function initDatePickers() {
  const scan = (root) => {
    if (root.matches?.(SELECTOR)) enhance(root);
    root.querySelectorAll?.(SELECTOR).forEach(enhance);
  };
  scan(document.body);
  new MutationObserver((muts) =>
    muts.forEach((m) =>
      m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n)),
    ),
  ).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".sc-dp");
    // nút trong lịch có thể đã bị vẽ lại (đổi tháng) trước khi click lan tới đây -> xét theo đường đi của sự kiện
    if (!trigger) {
      if (!e.composedPath().includes(panel?.el)) close();
      return;
    }
    e.preventDefault(); // không để <label> bọc ngoài bấm hộ lần nữa
    if (panel?.trigger === trigger) close();
    else open(trigger);
  });
  document.addEventListener(
    "keydown",
    (e) => {
      const trigger = e.target.closest?.(".sc-dp");
      if (!trigger) return;
      const isOpen = panel?.trigger === trigger;
      if (!isOpen) {
        if (["Enter", " ", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          open(trigger);
        }
        return;
      }
      const c = panel.cursor;
      if (isMonth(panel.input)) {
        // bảng tháng 3 cột: trái/phải 1 tháng, lên/xuống 3 tháng
        const mStep = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: -3,
          ArrowDown: 3,
          PageUp: -12,
          PageDown: 12,
        }[e.key];
        if (mStep) {
          e.preventDefault();
          moveCursor(addMonths(c, mStep));
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose(isoMonth(c));
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close(true);
        } else if (e.key === "Tab") close();
        return;
      }
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
        e.key
      ];
      if (step) {
        e.preventDefault();
        moveCursor(addDays(c, step));
      } else if (e.key === "PageUp" || e.key === "PageDown") {
        e.preventDefault();
        moveCursor(addMonths(c, e.key === "PageUp" ? -1 : 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        moveCursor(addDays(c, -((c.getDay() + 6) % 7)));
      } else if (e.key === "End") {
        e.preventDefault();
        moveCursor(addDays(c, 6 - ((c.getDay() + 6) % 7)));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(iso(c));
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close(true);
      } // không đóng luôn popup
      else if (e.key === "Tab") close();
    },
    true,
  );
  addEventListener("resize", () => close());
  document.addEventListener(
    "scroll",
    (e) => {
      if (panel && !panel.el.contains(e.target)) close();
    },
    true,
  );
  addEventListener("hashchange", () => close());
}
