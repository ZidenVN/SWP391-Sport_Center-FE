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

// Thời gian hiển thị: lớp nhiều ngày ghi "27/10 → 31/10 · 08:00 – 09:00 mỗi ngày"
export function classWhen(c) {
  if (!isMultiDay(c)) return null;
  const s = toDate(c.startTime);
  const e = toDate(c.endTime);
  const dm = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const days = Math.round((startOfDay(e) - startOfDay(s)) / 86400000) + 1;
  return { range: `${dm(s)} → ${dm(e)}/${e.getFullYear()}`, clock: `${time(c.startTime)} – ${time(c.endTime)} mỗi ngày`, days };
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
  const out = [];
  const total = Math.round((startOfDay(e) - startOfDay(s)) / 86400000) + 1;
  for (let d = startOfDay(s), i = 1; d <= e; d = addDays(d, 1), i++) {
    out.push({ ...c, startTime: `${isoDate(d)}T${clock(s)}`, endTime: `${isoDate(d)}T${clock(e)}`, dayIndex: i, dayTotal: total });
  }
  return out;
}

// trạng thái của 1 lớp với hội viên: registered | open | closed
export function chipState(c, registeredIds, isBookable) {
  if (registeredIds.has(c.classId)) return 'registered';
  return isBookable(c) ? 'open' : 'closed';
}

// Màu theo trạng thái: chip (lịch tháng), card (lịch tuần), dot (chấm trên điện thoại), sub (dòng sĩ số)
const TONES = {
  registered: { chip: 'bg-brand-dark text-brand-lime hover:bg-brand-deep', card: 'bg-brand-dark text-white border-brand-dark hover:bg-brand-deep', dot: 'bg-brand-dark', sub: 'text-brand-lime', legend: 'bg-brand-dark' },
  open: { chip: '', card: 'bg-cyan-50 text-slate-800 border-cyan-200 hover:bg-cyan-100', dot: 'bg-sky-400', sub: 'text-cyan-700', legend: 'bg-sky-200' },
  pending: { chip: 'bg-amber-100 text-amber-800 hover:bg-amber-200', card: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100', dot: 'bg-amber-400', sub: 'text-amber-700', legend: 'bg-amber-300' },
  done: { chip: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', card: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100', dot: 'bg-emerald-400', sub: 'text-emerald-700', legend: 'bg-emerald-200' },
  closed: { chip: 'bg-slate-100 text-slate-400 hover:bg-slate-200', card: 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100', dot: 'bg-slate-300', sub: '', legend: 'bg-slate-200' },
  cancelled: { chip: 'bg-rose-50 text-rose-400 line-through hover:bg-rose-100', card: 'bg-rose-50 text-rose-400 border-rose-200 hover:bg-rose-100 line-through', dot: 'bg-rose-300', sub: '', legend: 'bg-rose-200' }
};

const statusText = (c, st) => ({
  registered: 'Đã đăng ký', pending: 'Chờ chốt buổi', done: 'Hoàn thành', cancelled: 'Đã hủy'
}[st] || (c.availableSeats <= 0 ? 'Hết chỗ' : `Còn ${c.availableSeats} chỗ`));

// chú thích màu: [[trạng thái, nhãn], ...]
export const MEMBER_LEGEND = [['registered', 'Đã đăng ký'], ['open', 'Còn nhận đăng ký'], ['closed', 'Đã qua / hết chỗ']];
export const MANAGER_LEGEND = [['open', 'Sắp diễn ra'], ['closed', 'Đã đủ chỗ'], ['pending', 'Chờ chốt buổi'], ['done', 'Đã hoàn thành']];

function chip(c, st, compact) {
  const cls = st === 'open' ? chipColor(c.subjectId) : TONES[st].chip;
  return html`
    <button type="button" data-action="cal-class" data-id="${c.classId}" data-testid="cal-chip" title="${c.subjectName} · ${time(c.startTime)}–${time(c.endTime)} · ${c.roomName}"
      class="w-full text-left rounded-md px-2 ${compact ? 'py-1' : 'py-1.5'} text-[11px] font-semibold leading-tight truncate transition-colors ${cls}">
      ${st === 'registered' ? icon('check', 'w-3 h-3 inline -mt-0.5') : ''} <span class="opacity-80">${time(c.startTime)}</span> ${c.subjectName}
      ${compact ? '' : html`<div class="font-normal opacity-75 truncate">${c.dayTotal ? `Ngày ${c.dayIndex}/${c.dayTotal} · ` : ''}${c.coachName} · ${c.roomName}</div>`}
    </button>`;
}

const legendBar = items => html`
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500" data-testid="cal-legend">
    ${items.map(([st, label]) => html`<span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded ${TONES[st].legend}"></span> ${label}</span>`)}
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
  const isWeek = s.mode === 'week';
  if (isWeek) {
    return html`
      ${weekAgenda(days, byDay, stateOf, today)}
      ${timeGrid(days, byDay, stateOf, today)}
      <div class="mt-3">${legendBar(legend)}</div>`;
  }
  return html`
    <div class="card overflow-hidden ${isWeek ? 'hidden sm:block' : ''}" data-testid="class-calendar" data-mode="${s.mode}">
      <div class="grid grid-cols-7 border-b border-brand-line/70 bg-brand-cream/60">
        ${WEEKDAYS.map((w, i) => html`<div class="px-1 sm:px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-600 text-center sm:text-left ${i ? 'border-l border-brand-line/50' : ''}"><span class="sm:hidden">${SHORT_WEEKDAYS[i]}</span><span class="hidden sm:inline">${w}</span>${isWeek ? html`<span class="ml-1 font-normal text-slate-400">${days[i].getDate()}/${days[i].getMonth() + 1}</span>` : ''}</div>`)}
      </div>
      <div class="grid grid-cols-7">
        ${days.map((d, i) => {
          const list = byDay.get(isoDate(d)) || [];
          const outside = !isWeek && d.getMonth() !== anchor.getMonth();
          const isToday = sameDay(d, today);
          const past = startOfDay(d) < startOfDay(today);
          const mine = list.filter(c => stateOf(c) === 'registered').length;
          const shown = isWeek ? list : list.slice(0, MONTH_CHIPS);
          return html`
            <div class="relative ${isWeek ? 'min-h-[22rem]' : 'min-h-[6.5rem] sm:min-h-[8.5rem]'} p-1.5 sm:p-2 flex flex-col gap-1 ${i % 7 ? 'border-l' : ''} ${i >= 7 ? 'border-t' : ''} border-brand-line/50 ${outside ? 'bg-slate-50/70' : past ? 'bg-white' : 'bg-white'} ${isToday ? 'ring-2 ring-inset ring-brand/50 bg-brand-lime/10' : ''}"
              data-testid="cal-day" data-date="${isoDate(d)}">
              <!-- màn nhỏ: chấm màu + bấm cả ô để xem danh sách lớp trong ngày -->
              ${list.length ? html`
                <button type="button" class="sm:hidden absolute inset-0" data-action="cal-day" data-date="${isoDate(d)}" aria-label="Xem lớp ngày ${isoDate(d)}"></button>
                <div class="sm:hidden flex flex-wrap gap-1 mt-1 pointer-events-none">
                  ${list.slice(0, 6).map(c => html`<span class="w-2 h-2 rounded-full ${TONES[stateOf(c)].dot}"></span>`)}
                </div>` : ''}
              <div class="hidden sm:flex flex-col gap-1">
                ${shown.map(c => chip(c, stateOf(c), !isWeek))}
                ${list.length > shown.length ? html`<button type="button" data-action="cal-day" data-date="${isoDate(d)}" class="text-left text-[11px] font-bold text-brand-deep hover:underline px-1" data-testid="cal-more">+${list.length - shown.length} lớp khác</button>` : ''}
              </div>
              <div class="mt-auto flex items-end justify-between pt-1 pointer-events-none">
                <span class="hidden sm:flex text-[11px] text-slate-400 items-center gap-1">${list.length ? html`${icon('calendar-days', 'w-3 h-3')} ${list.length}` : ''}${mine ? html`<span class="ml-1 text-brand-deep font-bold">· ${mine} của bạn</span>` : ''}</span>
                <span class="font-display text-lg sm:text-2xl font-extrabold leading-none ${isToday ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-dark text-brand-lime flex items-center justify-center text-base sm:text-lg' : outside ? 'text-slate-300' : 'text-slate-700'}">${String(d.getDate()).padStart(2, '0')}</span>
              </div>
            </div>`;
        })}
      </div>
    </div>
    <div class="mt-3">${legendBar(legend)}</div>`;
}

// ===== Lịch tuần dạng khung giờ (cột giờ bên trái, thẻ lớp đặt theo giờ bắt đầu/kết thúc) =====
const HOUR_PX = 72;
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

function timeCard(x, st, fromHour) {
  const c = x.c;
  const top = ((x.s - fromHour * 60) / 60) * HOUR_PX;
  const height = Math.max(((x.e - x.s) / 60) * HOUR_PX - 6, 30);
  const width = 100 / x.lanes;
  // thẻ hẹp (đang chia làn) chỉ hiện tên môn + giờ; thẻ đủ rộng và cao mới hiện HLV, phòng, sĩ số
  const narrow = x.lanes > 1;
  const roomy = height >= 70 && !narrow;
  return html`
    <button type="button" data-action="cal-class" data-id="${c.classId}" data-testid="cal-chip"
      class="absolute rounded-xl border px-2.5 py-1.5 text-left overflow-hidden shadow-sm transition-colors flex flex-col justify-start ${TONES[st].card}"
      style="top:${top + 3}px;height:${height}px;left:calc(${x.lane * width}% + 4px);width:calc(${width}% - 8px)"
      title="${c.subjectName} · ${time(c.startTime)} – ${time(c.endTime)} · ${c.coachName} · ${c.roomName}">
      <div class="text-xs font-bold leading-tight ${narrow ? 'line-clamp-2 break-words' : 'truncate'}">${st === 'registered' ? html`${icon('check', 'w-3 h-3 inline -mt-0.5 text-brand-lime')} ` : ''}${c.subjectName}</div>
      <div class="text-[11px] leading-tight mt-0.5 ${st === 'registered' ? 'text-white/70' : 'opacity-80'}">${narrow ? time(c.startTime) : `${time(c.startTime)} – ${time(c.endTime)}`}${c.dayTotal && !narrow ? ` · Ngày ${c.dayIndex}/${c.dayTotal}` : ''}</div>
      ${roomy ? html`
        <div class="text-[11px] leading-tight mt-1 truncate ${st === 'registered' ? 'text-white/70' : 'opacity-75'}">${c.coachName} · ${c.roomName}</div>
        <div class="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold ${TONES[st].sub}">
          ${icon('users', 'w-3 h-3')} ${c.currentEnrolled}/${c.maxCapacity} · ${statusText(c, st)}
        </div>` : ''}
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
      class="absolute rounded-xl border border-dashed border-brand/50 bg-white/90 text-brand-deep text-xs font-bold hover:bg-brand-sand flex flex-col items-center justify-center leading-tight"
      style="top:${top + 3}px;height:${((x.e - x.s) / 60) * HOUR_PX - 6}px;left:calc(${x.lane * width}% + 4px);width:calc(${width}% - 8px)">+${x.more}<span class="font-semibold">lớp</span></button>`;
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
  return html`
    <div class="card overflow-hidden hidden sm:block" data-testid="class-calendar" data-mode="week">
      <!-- tiêu đề nằm chung khung cuộn (sticky) để cột tiêu đề và cột lịch luôn cùng bề rộng, kể cả khi có thanh cuộn -->
      <div class="overflow-y-auto max-h-[70vh]" data-testid="time-grid-scroll" data-scroll="${Math.round(scrollTo)}">
      <div class="sticky top-0 z-20 grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-brand-line/70 bg-white">
        <div></div>
        ${days.map((d, i) => {
          const isToday = sameDay(d, today);
          return html`
            <div class="px-2 py-3 text-center border-l border-brand-line/50">
              <div class="text-[11px] font-bold uppercase tracking-wide ${isToday ? 'text-brand' : 'text-slate-400'}">${WEEKDAYS[i]}</div>
              <div class="font-display text-2xl font-extrabold leading-none mt-1 ${isToday ? 'inline-flex w-9 h-9 items-center justify-center rounded-full bg-brand-dark text-brand-lime text-lg' : 'text-slate-700'}">${String(d.getDate()).padStart(2, '0')}</div>
            </div>`;
        })}
      </div>
        <div class="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] relative" style="height:${hours.length * HOUR_PX}px">
          <div class="relative">
            ${hours.map((h, i) => html`<div class="absolute right-2 text-[11px] font-semibold text-slate-400 -translate-y-1/2" style="top:${i * HOUR_PX}px">${i ? hourLabel(h) : ''}</div>`)}
          </div>
          ${days.map(d => {
            const isToday = sameDay(d, today);
            const placed = layoutDay(byDay.get(isoDate(d)) || []);
            return html`
              <div class="relative border-l border-brand-line/50 ${isToday ? 'bg-brand-lime/5' : ''}" data-testid="cal-day" data-date="${isoDate(d)}">
                ${hours.map((h, i) => html`<div class="absolute inset-x-0 border-t border-brand-line/40" style="top:${i * HOUR_PX}px"></div>`)}
                ${visibleCards(placed).map(x => (x.more
                  ? moreCard(x, d, fromHour)
                  : timeCard(x, stateOf(x.c), fromHour)))}
                ${isToday && nowMin >= fromHour * 60 && nowMin <= toHour * 60 ? html`
                  <div class="absolute inset-x-0 z-10 pointer-events-none" style="top:${((nowMin - fromHour * 60) / 60) * HOUR_PX}px" data-testid="now-line">
                    <div class="h-0.5 bg-rose-500"></div><div class="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  </div>` : ''}
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
    <div class="sm:hidden space-y-3" data-testid="week-agenda">
      ${days.map(d => {
        const list = byDay.get(isoDate(d)) || [];
        const isToday = sameDay(d, today);
        return html`
          <div class="card p-3 flex gap-3 ${isToday ? 'ring-2 ring-brand/50' : ''}">
            <div class="w-12 shrink-0 text-center">
              <div class="text-[11px] font-bold uppercase text-slate-400">${SHORT_WEEKDAYS[(d.getDay() + 6) % 7]}</div>
              <div class="font-display text-2xl font-extrabold leading-none ${isToday ? 'text-brand' : 'text-slate-700'}">${String(d.getDate()).padStart(2, '0')}</div>
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              ${list.length ? list.map(c => chip(c, stateOf(c), false)) : html`<div class="text-xs text-slate-400 py-2">Không có lớp</div>`}
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
        <div class="text-xs font-bold uppercase tracking-widest text-brand">Hôm nay</div>
        <div class="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark leading-none mt-1" data-testid="cal-today">${DAY_NAMES[today.getDay()]}, ${today.getDate()} tháng ${today.getMonth() + 1}</div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="btn-secondary btn-sm" data-action="cal-nav" data-delta="0">Hôm nay</button>
        <button type="button" class="btn-secondary btn-sm" data-action="cal-nav" data-delta="-1" aria-label="Trước">${icon('chevron-left', 'w-4 h-4')}</button>
        <div class="font-bold text-sm min-w-[9.5rem] text-center" data-testid="cal-title">${calendarTitle(s.mode, s.calOffset)}</div>
        <button type="button" class="btn-secondary btn-sm" data-action="cal-nav" data-delta="1" aria-label="Sau">${icon('chevron-right', 'w-4 h-4')}</button>
      </div>
    </div>`;
}

// tab chế độ xem: Tuần | Tháng | Danh sách
export function viewModeTabs(mode) {
  const items = [['week', 'Tuần', 'calendar-range'], ['month', 'Tháng', 'calendar-days'], ['list', 'Danh sách', 'layout-grid']];
  return html`
    <div class="inline-flex rounded-xl bg-brand-sand/80 p-1" role="tablist" data-testid="view-modes">
      ${items.map(([id, label, ic]) => html`
        <button type="button" role="tab" aria-selected="${mode === id}" data-action="view-mode" data-mode="${id}" data-testid="mode-${id}"
          class="px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ${mode === id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-800'}">${icon(ic, 'w-4 h-4')} ${label}</button>`)}
    </div>`;
}
