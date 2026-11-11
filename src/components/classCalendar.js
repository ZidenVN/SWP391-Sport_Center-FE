import { html, icon } from '../core/dom.js';
import { isoDate, time, toDate, weekday, date, timeRange } from '../core/format.js';
import { classApi } from '../api/endpoints.js';

// Lịch lớp học dạng tháng / tuần (như Google Calendar): mỗi ô ngày có các thẻ lớp, bấm thẻ để xem chi tiết.
// state cần: mode ('month' | 'week'), calOffset (số tháng/tuần lệch so với hiện tại), subjectId
// Mỗi trang truyền stateOf(c) -> 1 trong các trạng thái của TONES (màu thẻ) + chú thích màu (legend).

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const SHORT_WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_NAMES =['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const CHIP_COLORS = [
  'bg-sky-100 text-sky-800 hover:bg-sky-200',
  'bg-violet-100 text-violet-800 hover:bg-violet-200',
  'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'bg-rose-100 text-rose-800 hover:bg-rose-200',
  'bg-teal-100 text-teal-800 hover:bg-teal-200'
];
const MONTH_CHIPS = 3;

const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = d => addDays(startOfDay(d), -((new Date(d).getDay() + 6) % 7));
const sameDay = (a, b) => isoDate(a) === isoDate(b);

export const chipColor = subjectId => CHIP_COLORS[Math.abs(Number(subjectId) || 0) % CHIP_COLORS.length];

// Khoảng ngày hiển thị: tháng = đủ các tuần chứa tháng đó (bắt đầu thứ 2); tuần = 7 ngày
export function calendarRange(mode, offset) {
  const today = new Date();
  if (mode === 'week') {
    const start = addDays(mondayOf(today), offset * 7);
    return { start, end: addDays(start, 6), anchor: start };
  }
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const start = mondayOf(first);
  const end = addDays(mondayOf(last), 6);
  return { start, end, anchor: first };
}

export function calendarTitle(mode, offset) {
  const { start, end, anchor } = calendarRange(mode, offset);
  if (mode === 'week') {
    const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`;
    return `${fmt(start)} – ${fmt(end)}/${end.getFullYear()}`;
  }
  return `Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`;
}

// Tải mọi lớp trong khoảng (API giới hạn 100 lớp/trang -> lấy lần lượt các trang)
// Lớp nhiều ngày (vd 27/10 08:00 -> 31/10 09:00) bắt đầu trước khoảng đang xem vẫn phải hiện,
// nên lùi ngày tìm thêm MULTI_DAY_LOOKBACK ngày rồi lọc lại theo giờ kết thúc.
const MULTI_DAY_LOOKBACK = 31;
export async function loadCalendarClasses(s, { includeCancelled = false } = {}) {
  const { start, end } = calendarRange(s.mode, s.calOffset);
  const query = { fromDate: isoDate(addDays(start, -MULTI_DAY_LOOKBACK)), toDate: isoDate(end), subjectId: s.subjectId || undefined, size: 100 };
  const all = [];
  for (let page = 0; page < 10; page++) {
    const res = await classApi.search({ ...query, page });
    all.push(...(res.content || []));
    if (res.last !== false || page + 1 >= (res.totalPages || 0)) break;
  }
  return all
    .filter(c => toDate(c.endTime) >= start)
    .filter(c => includeCancelled || c.status !== 'CANCELLED');
}

export const isMultiDay = c => isoDate(toDate(c.startTime)) !== isoDate(toDate(c.endTime));

// Mã thứ BE gửi trong daysOfWeek ("MON,WED,SUN"), cùng thứ tự với SHORT_WEEKDAYS (T2 → CN)
const DAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const codeOf = d => DAY_CODES[(d.getDay() + 6) % 7];
// lớp lịch cố định: Set các mã thứ học; lớp kiểu cũ (không có daysOfWeek) trả null = học mọi ngày
const classDays = c => (c.daysOfWeek ? new Set(String(c.daysOfWeek).split(',').map(d => d.trim().slice(0, 3).toUpperCase())) : null);

// Thời gian hiển thị: lớp nhiều ngày ghi "27/10 → 31/10 · 08:00 – 09:00 T2, T4" (lớp kiểu cũ: "mỗi ngày")
export function classWhen(c) {
  if (!isMultiDay(c)) return null;
  const s = toDate(c.startTime);
  const e = toDate(c.endTime);
  const dm = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const days = Math.round((startOfDay(e) - startOfDay(s)) / 86400000) + 1;
  const set = classDays(c);
  const which = set ? DAY_CODES.filter(code => set.has(code)).map(code => SHORT_WEEKDAYS[DAY_CODES.indexOf(code)]).join(', ') : 'mỗi ngày';
  return { range: `${dm(s)} → ${dm(e)}/${e.getFullYear()}`, clock: `${time(c.startTime)} – ${time(c.endTime)} ${which}`, days };
}

// 1 dòng thời gian cho popup/bảng: lớp 1 ngày "Thứ 3, 27/10/2026 · 08:00 – 09:00", lớp nhiều ngày ghi cả khoảng ngày
export function whenLine(c) {
  const m = classWhen(c);
  return m ? `${m.range} (${m.days} ngày) · ${m.clock}` : `${weekday(c.startTime)}, ${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)}`;
}

// Tách lớp nhiều ngày thành từng buổi theo ngày (cùng classId, cùng khung giờ) để vẽ lên lịch
function occurrences(c) {
  if (!isMultiDay(c)) return [c];
  const s = toDate(c.startTime);
  const e = toDate(c.endTime);
  const clock = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
  // giờ kết thúc trong ngày phải sau giờ bắt đầu, nếu không thì coi như 1 khối liền (qua đêm) và chỉ vẽ ngày đầu
  if (clock(e) <= clock(s)) return [c];
  const set = classDays(c);
  const out = [];
  for (let d = startOfDay(s); d <= e; d = addDays(d, 1)) {
    if (set && !set.has(codeOf(d))) continue; // chỉ vẽ các thứ lớp có học
    out.push({ ...c, startTime: `${isoDate(d)}T${clock(s)}`, endTime: `${isoDate(d)}T${clock(e)}`, dayIndex: out.length + 1 });
  }
  return out.map(o => ({ ...o, dayTotal: out.length }));
}

// trạng thái của 1 lớp với hội viên: registered | open | closed
export function chipState(c, registeredIds, isBookable) {
  if (registeredIds.has(c.classId)) return 'registered';
  return isBookable(c) ? 'open' : 'closed';
}

// Màu theo trạng thái: lớp CSS tone-* (css/styles.css, mục "LỊCH LỚP HỌC") đặt biến màu cho thẻ, chấm, chú thích
const TONES = {
  registered: 'tone-registered', open: 'tone-open', pending: 'tone-pending',
  done: 'tone-done', closed: 'tone-closed', cancelled: 'tone-cancelled',
  // buổi bị hoãn (lịch theo buổi của hội viên)
  postponed: 'tone-pending'
};

// lịch dạy của HLV không trả availableSeats -> tự tính từ sĩ số; thiếu cả hai thì không ghi số chỗ
const seatsLeft = c => c.availableSeats ?? (c.maxCapacity != null ? c.maxCapacity - (c.currentEnrolled ?? 0) : null);
const statusText = (c, st) => {
  const fixed = { registered: 'Đã đăng ký', pending: 'Chờ chốt buổi', done: 'Hoàn thành', cancelled: 'Đã hủy', postponed: 'Đã hoãn' }[st];
  if (fixed) return fixed;
  const left = seatsLeft(c);
  if (left == null) return '';
  return left <= 0 ? 'Hết chỗ' : `Còn ${left} chỗ`;
};

// chú thích màu: [[trạng thái, nhãn], ...]
export const MEMBER_LEGEND = [['registered', 'Đã đăng ký'], ['open', 'Còn nhận đăng ký'], ['closed', 'Đã qua / hết chỗ']];
export const MANAGER_LEGEND = [['open', 'Sắp diễn ra'], ['closed', 'Đã đủ chỗ'], ['pending', 'Chờ chốt buổi'], ['done', 'Đã hoàn thành']];

// thẻ lớp gọn (lịch tháng + danh sách theo ngày trên điện thoại)
function chip(c, st, compact) {
  return html`
    <button type="button" data-action="cal-class" data-id="${c.classId}" data-session="${c.sessionId ?? ''}" data-testid="cal-chip" title="${c.subjectName} · ${time(c.startTime)}–${time(c.endTime)} · ${c.roomName}"
      class="cal-chip ${TONES[st]} ${compact ? 'is-compact' : ''}">
      <span class="cal-chip-line"><span class="cal-chip-time">${time(c.startTime)}</span><span class="cal-chip-name">${st === 'registered' ? icon('check', 'w-3 h-3 inline -mt-0.5') : ''} ${c.subjectName}</span></span>
      ${compact ? '' : html`<span class="cal-chip-sub">${c.dayTotal ? `Buổi ${c.dayIndex}/${c.dayTotal} · ` : ''}${c.coachName} · ${c.roomName}</span>`}
    </button>`;
}

const legendBar = items => html`
  <div class="cal-legend" data-testid="cal-legend">
    ${items.map(([st, label]) => html`<span class="cal-legend-item ${TONES[st]}"><span class="cal-dot"></span>${label}</span>`)}
  </div>`;

// Lưới lịch. classes: lớp trong khoảng; stateOf(c): trạng thái màu của lớp; legend: chú thích màu
export function calendarGrid(s, classes, { stateOf, legend = MEMBER_LEGEND }) {
  const { start, end, anchor } = calendarRange(s.mode, s.calOffset);
  const today = new Date();
  const byDay = new Map();
  classes.flatMap(occurrences).sort((a, b) => toDate(a.startTime) - toDate(b.startTime)).forEach(c => {
    const key = isoDate(toDate(c.startTime));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(c);
  });
  const days = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(d);
  if (s.mode === 'week') {
    return html`
      ${weekAgenda(days, byDay, stateOf, today)}
      ${timeGrid(days, byDay, stateOf, today)}
      ${legendBar(legend)}`;
  }
  return html`
    <div class="card cal-shell overflow-hidden" data-testid="class-calendar" data-mode="${s.mode}">
      <div class="cal-month-head grid grid-cols-7">
        ${WEEKDAYS.map((w, i) => html`<div class="cal-month-wd ${i >= 5 ? 'is-weekend' : ''}"><span class="sm:hidden">${SHORT_WEEKDAYS[i]}</span><span class="hidden sm:inline">${w}</span></div>`)}
      </div>
      <div class="grid grid-cols-7">
        ${days.map((d, i) => {
          const list = byDay.get(isoDate(d)) || [];
          const outside = d.getMonth() !== anchor.getMonth();
          const isToday = sameDay(d, today);
          const past = startOfDay(d) < startOfDay(today);
          const mine = list.filter(c => stateOf(c) === 'registered').length;
          const shown = list.slice(0, MONTH_CHIPS);
          return html`
            <div class="cal-cell ${i % 7 ? 'has-l' : ''} ${i >= 7 ? 'has-t' : ''} ${outside ? 'is-outside' : ''} ${past ? 'is-past' : ''} ${isToday ? 'is-today' : ''} ${i % 7 >= 5 ? 'is-weekend' : ''}"
              style="--i:${i}" data-testid="cal-day" data-date="${isoDate(d)}">
              <div class="flex items-center justify-between gap-1 pointer-events-none">
                <span class="cal-cell-num">${String(d.getDate()).padStart(2, '0')}</span>
                ${list.length ? html`<span class="cal-cell-count hidden sm:inline-flex">${list.length} lớp${mine ? html` · <b>${mine} của bạn</b>` : ''}</span>` : ''}
              </div>
              <!-- màn nhỏ: chấm màu + bấm cả ô để xem danh sách lớp trong ngày -->
              ${list.length ? html`
                <button type="button" class="sm:hidden absolute inset-0" data-action="cal-day" data-date="${isoDate(d)}" aria-label="Xem lớp ngày ${isoDate(d)}"></button>
                <div class="sm:hidden flex flex-wrap gap-1 mt-1.5 pointer-events-none">
                  ${list.slice(0, 6).map(c => html`<span class="cal-dot ${TONES[stateOf(c)]}"></span>`)}
                </div>` : ''}
              <div class="hidden sm:flex flex-col gap-1 mt-1.5">
                ${shown.map(c => chip(c, stateOf(c), true))}
                ${list.length > shown.length ? html`<button type="button" data-action="cal-day" data-date="${isoDate(d)}" class="cal-more-link" data-testid="cal-more">+${list.length - shown.length} lớp khác</button>` : ''}
              </div>
            </div>`;
        })}
      </div>
    </div>
    ${legendBar(legend)}`;
}

// ===== Lịch tuần dạng khung giờ (cột giờ bên trái, thẻ lớp đặt theo giờ bắt đầu/kết thúc) =====
// 104px mỗi giờ: lớp 1 tiếng (98px) đủ chỗ hiện HLV, phòng (mỗi thứ 1 dòng), sĩ số như lớp 1 tiếng 30
const HOUR_PX = 104;
const minutesOf = d => d.getHours() * 60 + d.getMinutes();
const hourLabel = h => `${String(h).padStart(2, '0')}:00`;

// Xếp các lớp trùng giờ trong 1 ngày thành nhiều làn đặt cạnh nhau
function layoutDay(list) {
  // thẻ cao đúng thời lượng thật (09:00–10:30 kéo xuống nửa ô 10h); tối thiểu 30 phút để đọc được
  const items = list.map(c => {
    const s = minutesOf(toDate(c.startTime));
    return { c, s, e: Math.max(minutesOf(toDate(c.endTime)), s + 30) };
  })
    .sort((a, b) => a.s - b.s || b.e - a.e);
  const out = [];
  let cluster = [];
  let clusterEnd = -1;
  let clusterNo = 0;
  const flush = () => {
    const lanes = cluster.reduce((m, x) => Math.max(m, x.lane + 1), 1);
    cluster.forEach(x => out.push({ ...x, lanes, cluster: clusterNo }));
    clusterNo++;
    cluster = [];
  };
  items.forEach(it => {
    if (cluster.length && it.s >= clusterEnd) { flush(); clusterEnd = -1; }
    const used = new Set(cluster.filter(x => x.e > it.s).map(x => x.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ ...it, lane });
    clusterEnd = Math.max(clusterEnd, it.e);
  });
  if (cluster.length) flush();
  return out;
}

function timeCard(x, st, fromHour, order) {
  const c = x.c;
  const top = ((x.s - fromHour * 60) / 60) * HOUR_PX;
  const height = Math.max(((x.e - x.s) / 60) * HOUR_PX - 6, 30);
  const width = 100 / x.lanes;
  // thẻ hẹp (đang chia làn) chỉ hiện tên môn + giờ; thẻ đủ rộng và cao mới hiện HLV, phòng, sĩ số
  const narrow = x.lanes > 1;
  const roomy = height >= 92 && !narrow;
  const fill = c.maxCapacity ? Math.min(100, Math.round((c.currentEnrolled / c.maxCapacity) * 100)) : 0;
  return html`
    <button type="button" data-action="cal-class" data-id="${c.classId}" data-session="${c.sessionId ?? ''}" data-testid="cal-chip"
      class="cal-ev ${TONES[st]} ${narrow ? 'is-narrow' : ''}"
      style="top:${top + 3}px;height:${height}px;left:calc(${x.lane * width}% + 5px);width:calc(${width}% - 10px);--o:${order}"
      title="${c.subjectName} · ${time(c.startTime)} – ${time(c.endTime)} · ${c.coachName} · ${c.roomName}">
      <span class="cal-ev-head">
        <span class="cal-ev-title ${narrow ? 'line-clamp-2 break-words' : 'truncate'}">${st === 'registered' ? html`${icon('check', 'w-3 h-3 inline -mt-0.5')} ` : ''}${c.subjectName}</span>
        ${c.dayTotal && !narrow ? html`<span class="cal-ev-badge" title="Buổi ${c.dayIndex}/${c.dayTotal}">${c.dayIndex}/${c.dayTotal}</span>` : ''}
      </span>
      <span class="cal-ev-time">${icon('clock', 'w-3 h-3 shrink-0')}<span class="truncate">${narrow ? time(c.startTime) : `${time(c.startTime)} – ${time(c.endTime)}`}</span></span>
      ${roomy ? html`
        <span class="cal-ev-meta">${icon('user-round', 'w-3 h-3 shrink-0')}<span class="truncate">${c.coachName}</span></span>
        <span class="cal-ev-meta">${icon('map-pin', 'w-3 h-3 shrink-0')}<span class="truncate">${c.roomName}</span></span>
        <span class="cal-ev-status">${icon('users', 'w-3 h-3 shrink-0')}<span class="truncate">${c.maxCapacity ? `${c.currentEnrolled ?? 0}/${c.maxCapacity} · ` : ''}${statusText(c, st)}</span></span>
        <span class="cal-ev-meter" aria-hidden="true"><i style="width:${fill}%"></i></span>` : ''}
    </button>`;
}

// Quá MAX_LANES lớp trùng giờ: giữ (MAX_LANES - 1) làn đầu, phần còn lại gộp thành ô "+N lớp"
const MAX_LANES = 2;
function visibleCards(placed) {
  const out = [];
  const clusters = new Map();
  placed.forEach(x => {
    if (!clusters.has(x.cluster)) clusters.set(x.cluster, []);
    clusters.get(x.cluster).push(x);
  });
  clusters.forEach(items => {
    if (items[0].lanes <= MAX_LANES) { out.push(...items); return; }
    const keep = items.filter(x => x.lane < MAX_LANES - 1).map(x => ({ ...x, lanes: MAX_LANES }));
    const rest = items.filter(x => x.lane >= MAX_LANES - 1);
    out.push(...keep, { more: rest.length, s: Math.min(...rest.map(x => x.s)), e: Math.max(...rest.map(x => x.e)), lane: MAX_LANES - 1, lanes: MAX_LANES });
  });
  return out;
}

function moreCard(x, day, fromHour) {
  const top = ((x.s - fromHour * 60) / 60) * HOUR_PX;
  const width = 100 / x.lanes;
  return html`
    <button type="button" data-action="cal-day" data-date="${isoDate(day)}" data-testid="cal-more"
      class="cal-ev-more"
      style="top:${top + 3}px;height:${((x.e - x.s) / 60) * HOUR_PX - 6}px;left:calc(${x.lane * width}% + 5px);width:calc(${width}% - 10px)">+${x.more}<span>lớp</span></button>`;
}

function timeGrid(days, byDay, stateOf, today) {
  const all = days.flatMap(d => byDay.get(isoDate(d)) || []);
  // khung giờ hiển thị: tối thiểu 06:00–21:00, nới theo lớp sớm/muộn nhất trong tuần
  const fromHour = Math.min(6, ...all.map(c => toDate(c.startTime).getHours()));
  const toHour = Math.max(21, ...all.map(c => Math.ceil(minutesOf(toDate(c.endTime)) / 60)));
  const hours = [];
  for (let h = fromHour; h < toHour; h++) hours.push(h);
  const firstClass = all.length ? Math.min(...all.map(c => minutesOf(toDate(c.startTime)))) : 7 * 60;
  const scrollTo = Math.max(0, ((Math.min(firstClass, 8 * 60) - fromHour * 60) / 60) * HOUR_PX - 12);
  const nowMin = minutesOf(today);
  const showNow = days.some(d => sameDay(d, today)) && nowMin >= fromHour * 60 && nowMin <= toHour * 60;
  const nowTop = ((nowMin - fromHour * 60) / 60) * HOUR_PX;
  let order = 0;
  return html`
    <div class="card cal-shell overflow-hidden hidden sm:block" data-testid="class-calendar" data-mode="week">
      <!-- tiêu đề nằm chung khung cuộn (sticky) để cột tiêu đề và cột lịch luôn cùng bề rộng, kể cả khi có thanh cuộn -->
      <div class="cal-scroll overflow-y-auto max-h-[70vh]" data-testid="time-grid-scroll" data-scroll="${Math.round(scrollTo)}">
      <div class="cal-week-head sticky top-0 z-20 grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))]">
        <div class="cal-gutter-head">GMT+7</div>
        ${days.map((d, i) => {
          const isToday = sameDay(d, today);
          const count = (byDay.get(isoDate(d)) || []).length;
          return html`
            <div class="cal-day-head ${isToday ? 'is-today' : ''} ${i >= 5 ? 'is-weekend' : ''}">
              <div class="cal-day-wd">${WEEKDAYS[i]}</div>
              <div class="cal-day-num">${String(d.getDate()).padStart(2, '0')}</div>
              <div class="cal-day-count">${count ? `${count} lớp` : isToday ? 'Hôm nay' : html`&nbsp;`}</div>
            </div>`;
        })}
      </div>
        <div class="cal-week-body grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))] relative" style="height:${hours.length * HOUR_PX}px;--hour:${HOUR_PX}px">
          <div class="relative">
            ${hours.map((h, i) => html`<div class="cal-hour" style="top:${i * HOUR_PX}px">${i ? hourLabel(h) : ''}</div>`)}
            ${showNow ? html`<div class="cal-now-badge" style="top:${nowTop}px">${time(today)}</div>` : ''}
          </div>
          ${days.map((d, i) => {
            const isToday = sameDay(d, today);
            const placed = layoutDay(byDay.get(isoDate(d)) || []);
            return html`
              <div class="cal-col ${isToday ? 'is-today' : ''} ${i >= 5 ? 'is-weekend' : ''}" data-testid="cal-day" data-date="${isoDate(d)}">
                ${visibleCards(placed).map(x => (x.more
                  ? moreCard(x, d, fromHour)
                  : timeCard(x, stateOf(x.c), fromHour, order++)))}
                ${isToday && showNow ? html`
                  <div class="cal-now" style="top:${nowTop}px" data-testid="now-line"><span></span></div>` : ''}
              </div>`;
          })}
        </div>
      </div>
    </div>`;
}

// cuộn khung giờ tới lớp đầu tiên (gọi sau mỗi lần render)
export function scrollTimeGrid(root) {
  const box = root.querySelector('[data-testid=time-grid-scroll]');
  if (box && !box.dataset.scrolled) {
    box.scrollTop = Number(box.dataset.scroll) || 0;
    box.dataset.scrolled = '1';
  }
}

// Màn nhỏ ở chế độ tuần: 7 cột quá chật -> danh sách theo ngày
function weekAgenda(days, byDay, stateOf, today) {
  return html`
    <div class="sm:hidden space-y-2.5" data-testid="week-agenda">
      ${days.map(d => {
        const list = byDay.get(isoDate(d)) || [];
        const isToday = sameDay(d, today);
        return html`
          <div class="card cal-agenda ${isToday ? 'is-today' : ''}">
            <div class="cal-agenda-date">
              <div class="cal-day-wd">${SHORT_WEEKDAYS[(d.getDay() + 6) % 7]}</div>
              <div class="cal-day-num">${String(d.getDate()).padStart(2, '0')}</div>
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              ${list.length ? list.map(c => chip(c, stateOf(c), false)) : html`<div class="text-xs text-slate-400 py-2.5">Không có lớp</div>`}
            </div>
          </div>`;
      })}
    </div>`;
}

export function calendarToolbar(s) {
  const today = new Date();
  return html`
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
      <div>
        <div class="cal-eyebrow">Hôm nay</div>
        <div class="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark leading-none mt-2" data-testid="cal-today">${DAY_NAMES[today.getDay()]}, ${today.getDate()} tháng ${today.getMonth() + 1}</div>
      </div>
      <div class="cal-nav">
        <button type="button" class="cal-nav-today" data-action="cal-nav" data-delta="0">${icon('crosshair', 'w-3.5 h-3.5')} Hôm nay</button>
        <span class="cal-nav-sep" aria-hidden="true"></span>
        <button type="button" class="cal-nav-btn" data-action="cal-nav" data-delta="-1" aria-label="Trước">${icon('chevron-left', 'w-4 h-4')}</button>
        <div class="cal-nav-title" data-testid="cal-title">${calendarTitle(s.mode, s.calOffset)}</div>
        <button type="button" class="cal-nav-btn" data-action="cal-nav" data-delta="1" aria-label="Sau">${icon('chevron-right', 'w-4 h-4')}</button>
      </div>
    </div>`;
}

// tab chế độ xem: Tuần | Tháng | Danh sách
export function viewModeTabs(mode) {
  const items = [['week', 'Tuần', 'calendar-range'], ['month', 'Tháng', 'calendar-days'], ['list', 'Danh sách', 'layout-grid']];
  return html`
    <div class="cal-tabs" role="tablist" data-testid="view-modes">
      ${items.map(([id, label, ic]) => html`
        <button type="button" role="tab" aria-selected="${mode === id}" data-action="view-mode" data-mode="${id}" data-testid="mode-${id}"
          class="cal-tab ${mode === id ? 'is-active' : ''}">${icon(ic, 'w-4 h-4')} ${label}</button>`)}
    </div>`;
}
