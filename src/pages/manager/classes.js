import { html, icon, render, readForm } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, textarea, tabs, openModal, timeInput, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, subjectApi, roomApi, coachAdminApi, packageApi } from '../../api/endpoints.js';
import { openClassSessions } from '../../components/classSessions.js';
import { badge, date, weekday, timeRange, toDate, isoDate, fullName, classCode } from '../../core/format.js';
import { subjectColor, classImage, classImageUrl } from '../../components/classCard.js';
import { courseOf, courseBlock, courseInline } from '../../components/courseSchedule.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';
import { imageField, imageErrors, mountImagePicker, attachImageError, hasFile } from '../../components/imageField.js';
import { calendarGrid, calendarToolbar, viewModeTabs, loadCalendarClasses, scrollTimeGrid, MANAGER_LEGEND, classWhen, whenLine } from '../../components/classCalendar.js';

// Lớp học của Quản lý: xem dạng lịch Tuần (khung giờ) / Tháng hoặc bảng Danh sách theo tab trạng thái.
const MODE_KEY = 'sc_manager_classes_mode';
const savedMode = () => { try { return localStorage.getItem(MODE_KEY); } catch { return null; } };

// Ảnh lớp: bắt buộc khi tạo, tuỳ chọn khi sửa (ô chọn ảnh dùng chung ở components/imageField.js)
const classImageField = (c = {}, { required }) => imageField({
  label: 'Ảnh lớp', required,
  currentUrl: c.classId ? classImageUrl(c) : '',
  currentText: c.imageUrl ? 'Ảnh hiện tại của lớp' : 'Lớp chưa có ảnh (đang dùng ảnh mặc định)'
});

// ===== Lớp = 1 khoá học có lịch cố định: ngày bắt đầu + thời hạn khoá + các thứ trong tuần + khung giờ =====
// BE tạo toàn bộ buổi trong 1 request: trùng phòng/HLV ở bất kỳ buổi nào thì không tạo gì.
// Thời hạn khoá chỉ chọn trong các thời hạn đang có gói lớp bán cho môn đó (GET /packages/class-durations).
const WEEKDAY_OPTS = [[1, 'T2'], [2, 'T3'], [3, 'T4'], [4, 'T5'], [5, 'T6'], [6, 'T7'], [0, 'CN']];
const DAY_CODE = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; // theo Date.getDay()
const SHORT_DAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const pad = n => String(n).padStart(2, '0');
const parseDay = v => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d); };
const hhmm = t => (t ? String(t).slice(0, 5) : '');

const checkedDays = d => WEEKDAY_OPTS.filter(([n]) => d[`day${n}`]).map(([n]) => n);
// [1, 3, 5] -> "MON,WED,FRI" (định dạng BE nhận)
const daysOfWeekOf = d => checkedDays(d).map(n => DAY_CODE[n]).join(',');
// "MON,WED" (hoặc "MONDAY" của lớp tạo theo kiểu cũ) -> [1, 3]
const parseDaysOfWeek = v => (v || '').split(/[,;\s]+/).map(t => DAY_CODE.indexOf(t.slice(0, 3).toUpperCase())).filter(n => n >= 0);

// ngày cuối khoá giống BE: startDate + durationDays - 1
function lastDayOf(d) {
  const x = parseDay(d.startDate);
  x.setDate(x.getDate() + Number(d.durationDays) - 1);
  return x;
}

// các ngày (yyyy-MM-dd) sẽ có buổi học
function sessionDates(d) {
  if (!d.startDate || !d.durationDays) return [];
  const days = checkedDays(d);
  const out = [];
  for (let x = parseDay(d.startDate), end = lastDayOf(d); x <= end; x.setDate(x.getDate() + 1)) {
    if (days.includes(x.getDay())) out.push(isoDate(x));
  }
  return out;
}

// lịch trên form khác lịch hiện tại của lớp (sửa lớp)
function scheduleChanged(c, d) {
  return d.startDate !== c.startDate
    || Number(d.durationDays) !== c.durationDays
    || checkedDays(d).sort().join() !== parseDaysOfWeek(c.daysOfWeek).sort().join()
    || d.startClock !== hhmm(c.startClock)
    || d.endClock !== hhmm(c.endClock);
}

// HLV dạy được môn (coach.subjects từ BE); chọn HLV khác môn thì BE trả ERR_CLASS_400_COACH_SUBJECT
const teaches = (coach, subjectId) => (coach.subjects || []).some(x => String(x.subjectId) === String(subjectId));
const coachOptions = list => list.map(x => ({ value: x.coachId, label: `${fullName(x)}${(x.subjects || []).length ? ` · ${x.subjects.map(m => m.subjectName).join(', ')}` : ''}` }));

// c = lớp đang sửa ({} khi mở lớp mới)
function classFields(s, c = {}) {
  const tomorrow = new Date(Date.now() + 86400000);
  const picked = c.daysOfWeek ? parseDaysOfWeek(c.daysOfWeek) : [tomorrow.getDay()];
  // lúc đầu chỉ có thời hạn hiện tại của lớp; danh sách thật nạp theo môn trong mountSchedule
  const durations = c.durationDays ? [{ value: c.durationDays, label: `${c.durationDays} ngày` }] : [];
  return html`
    ${field('Bộ môn', select('subjectId', s.subjects.filter(x => x.status !== 'INACTIVE').map(x => ({ value: x.subjectId, label: x.subjectName })), c.subjectId, { required: true, placeholder: 'Chọn bộ môn' }))}
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Huấn luyện viên', select('coachId', coachOptions(c.subjectId ? s.coaches.filter(x => teaches(x, c.subjectId)) : []), c.coachId, { required: true, placeholder: c.subjectId ? 'Chọn HLV' : 'Chọn bộ môn trước' }), 'Chỉ hiện HLV dạy môn đã chọn')}
      ${field('Phòng', select('roomId', s.rooms.filter(r => r.status === 'AVAILABLE').map(r => ({ value: r.roomId, label: `${r.roomName} (tối đa ${r.capacity})` })), c.roomId, { required: true, placeholder: 'Chọn phòng' }))}
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Ngày bắt đầu', input('startDate', { type: 'date', value: c.startDate || isoDate(tomorrow), required: true,
        // BE chỉ nhận ngày sau hôm nay; lớp đã bắt đầu thì giữ ngày cũ, không đặt min để vẫn hiện đúng
        attrs: c.startDate && c.startDate < isoDate(tomorrow) ? '' : `min="${isoDate(tomorrow)}"` }))}
      ${field('Thời hạn khoá', select('durationDays', durations, c.durationDays, { required: true, placeholder: 'Chọn bộ môn trước' }), 'Chỉ có các thời hạn đang bán gói lớp của môn này')}
    </div>
    ${field('Học vào các thứ', html`
      <div class="flex flex-wrap gap-2" data-field-wrap data-testid="repeat-days">
        ${WEEKDAY_OPTS.map(([n, label]) => html`
          <label class="cursor-pointer">
            <input type="checkbox" name="day${n}" value="1" class="peer sr-only" ${picked.includes(n) ? 'checked' : ''} />
            <span class="inline-flex w-11 h-9 items-center justify-center rounded-lg border border-brand-line text-sm font-bold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">${label}</span>
          </label>`)}
      </div>`)}
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Giờ bắt đầu', timeInput('startClock', hhmm(c.startClock) || '08:00'))}
      ${field('Giờ kết thúc', timeInput('endClock', hhmm(c.endClock) || '09:30'))}
    </div>
    ${field('Sĩ số tối đa', input('maxCapacity', { type: 'number', value: c.maxCapacity || 20, required: true, attrs: 'min="1"' }), 'Không vượt quá sức chứa của phòng')}
    ${classImageField(c, { required: !c.classId })}
    <div class="sc-note rounded-2xl p-3.5 text-sm text-slate-700 flex gap-2.5" data-testid="session-preview"></div>`;
}

// original = lớp đang sửa; không truyền khi mở lớp mới
function classValidator(s, original) {
  return d => {
    const e = requireFields(d, ['subjectId', 'coachId', 'roomId', 'startDate', 'durationDays', 'startClock', 'endClock', 'maxCapacity']);
    if (d.startClock && d.endClock && d.endClock <= d.startClock) e.endClock = 'Giờ kết thúc phải sau giờ bắt đầu';
    // sửa lớp mà giữ nguyên lịch thì không kiểm tra lại ngày (lớp có thể đã bắt đầu)
    if (!original || scheduleChanged(original, d)) {
      if (d.startDate && d.startDate <= isoDate(new Date())) e.startDate = 'Ngày bắt đầu phải từ ngày mai trở đi';
      if (!checkedDays(d).length) e.day1 = 'Chọn ít nhất 1 thứ trong tuần';
      else if (d.startDate && d.durationDays && !sessionDates(d).length) e.day1 = 'Không có buổi nào rơi vào các thứ đã chọn trong thời hạn này';
    }
    const room = s.rooms.find(r => String(r.roomId) === d.roomId);
    if (room && Number(d.maxCapacity) > room.capacity) e.maxCapacity = `Phòng chỉ chứa tối đa ${room.capacity} người`;
    if (d.maxCapacity && Number(d.maxCapacity) < 1) e.maxCapacity = 'Tối thiểu 1 học viên';
    return { ...e, ...imageErrors(d, !original, 'Vui lòng chọn ảnh cho lớp') };
  };
}

// sửa lớp mà giữ nguyên lịch: không gửi các trường lịch -> BE giữ nguyên các buổi học
function classPayload(d, original) {
  const base = { subjectId: Number(d.subjectId), coachId: Number(d.coachId), roomId: Number(d.roomId), maxCapacity: Number(d.maxCapacity) };
  if (original && !scheduleChanged(original, d)) return base;
  return { ...base, startDate: d.startDate, durationDays: Number(d.durationDays), daysOfWeek: daysOfWeekOf(d), startClock: d.startClock, endClock: d.endClock };
}

// nạp thời hạn khoá theo môn + cập nhật ô "Sẽ mở N buổi"
function mountSchedule(modal, original) {
  const form = modal.el.querySelector('form');
  const durationEl = form.querySelector('select[name=durationDays]');
  const coachEl = form.querySelector('select[name=coachId]');
  let loadedSubject;
  let coachSubject = original?.subjectId ? String(original.subjectId) : '';
  // đổi môn -> nạp lại HLV dạy môn đó (GET /coaches?subjectId=)
  const loadCoaches = async subjectId => {
    if (subjectId === coachSubject) return;
    coachSubject = subjectId;
    const keep = coachEl.value;
    const list = subjectId ? await coachAdminApi.list(subjectId).catch(() => []) : [];
    if (coachSubject !== subjectId) return;
    const active = list.filter(x => (x.status || 'ACTIVE') === 'ACTIVE');
    const placeholder = !subjectId ? 'Chọn bộ môn trước' : active.length ? 'Chọn HLV' : 'Chưa có HLV dạy môn này';
    coachEl.replaceChildren(new Option(placeholder, ''), ...coachOptions(active).map(o => new Option(o.label, o.value)));
    coachEl.value = active.some(x => String(x.coachId) === keep) ? keep : '';
  };
  const update = () => {
    const d = readForm(form);
    const dates = sessionDates(d);
    const label = v => { const x = parseDay(v); return `${SHORT_DAY[x.getDay()]} ${pad(x.getDate())}/${pad(x.getMonth() + 1)}`; };
    const box = form.querySelector('[data-testid=session-preview]');
    render(box, dates.length
      ? html`${icon('calendar-check', 'w-4 h-4 shrink-0 mt-0.5 text-brand')}<span><b data-testid="session-count">Khoá ${d.durationDays} ngày · ${dates.length} buổi</b>${d.startClock && d.endClock ? ` · ${d.startClock} – ${d.endClock}` : ''} · đến ${date(isoDate(lastDayOf(d)))}<br /><span class="text-slate-500">${dates.slice(0, 8).map(label).join(', ')}${dates.length > 8 ? ', …' : ''}</span></span>`
      : html`${icon('info', 'w-4 h-4 shrink-0 mt-0.5 text-slate-400')}<span class="text-slate-500">Chọn bộ môn, ngày bắt đầu, thời hạn khoá và các thứ để xem các buổi sẽ mở</span>`);
  };
  const loadDurations = async subjectId => {
    if (subjectId === loadedSubject) return;
    loadedSubject = subjectId;
    const keep = durationEl.value;
    const list = subjectId ? await packageApi.classDurations(subjectId).catch(() => []) : [];
    if (loadedSubject !== subjectId) return; // đã đổi sang môn khác trong lúc chờ
    const opts = [...new Set(list)].sort((a, b) => a - b);
    // lớp đang sửa có thể mang thời hạn đã ngừng bán: vẫn giữ để không đổi lịch ngoài ý muốn
    if (original?.durationDays && String(original.subjectId) === subjectId && !opts.includes(original.durationDays)) opts.push(original.durationDays);
    const placeholder = !subjectId ? 'Chọn bộ môn trước' : opts.length ? 'Chọn thời hạn' : 'Môn này chưa có gói lớp đang bán';
    durationEl.replaceChildren(new Option(placeholder, ''), ...opts.map(n => new Option(`${n} ngày`, n)));
    durationEl.value = opts.map(String).includes(keep) ? keep : '';
    update();
  };
  // đợi ô ẩn giờ:phút cập nhật xong (nghe ở document) rồi mới tính
  const later = () => setTimeout(() => { const sid = readForm(form).subjectId; loadDurations(sid); loadCoaches(sid); update(); }, 0);
  form.addEventListener('input', later);
  form.addEventListener('change', later);
  loadDurations(readForm(form).subjectId);
  update();
}

// mở lớp: 1 request duy nhất, BE trả lỗi thì không có buổi nào được tạo
async function createClass(d) {
  const res = await classApi.create(classPayload(d), d.image).catch(err => { throw attachImageError(err); });
  toast(`Đã mở lớp ${sessionDates(d).length} buổi, từ ${date(d.startDate)} đến ${date(isoDate(lastDayOf(d)))}`);
  return res;
}

// Nhóm theo trạng thái thật của BE: OPENING (sắp diễn ra / đã qua giờ nhưng chưa chốt), COMPLETED, CANCELLED
function phase(c, now = new Date()) {
  if (c.status === 'CANCELLED' || c.status === 'STOPPED') return 'CANCELLED';
  if (c.status === 'COMPLETED') return 'DONE';
  return toDate(c.endTime) < now ? 'PENDING' : 'UPCOMING';
}

// màu thẻ trên lịch theo giai đoạn của lớp
function stateOf(c, now = new Date()) {
  const ph = phase(c, now);
  if (ph === 'UPCOMING') return c.availableSeats > 0 ? 'open' : 'closed';
  return { PENDING: 'pending', DONE: 'done', CANCELLED: 'cancelled' }[ph];
}

// lớp đã có buổi đầu diễn ra: không hủy được nữa (ERR_CLASS_400_CANCEL_STARTED), chỉ dừng lớp
const started = (c, now = new Date()) => toDate(c.firstSessionAt || c.startTime) <= now;
// lớp mở theo lịch cố định mới có danh sách buổi
const hasSessions = c => Boolean(c.daysOfWeek || c.totalSessions);

const TABS = [['UPCOMING', 'Sắp diễn ra'], ['PENDING', 'Chờ chốt buổi'], ['DONE', 'Đã hoàn thành'], ['CANCELLED', 'Đã hủy'], ['ALL', 'Tất cả']];

function statusCell(c, ph) {
  if (ph === 'PENDING') return html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">Chờ chốt</span>`;
  if (ph === 'UPCOMING') return badge(c.availableSeats > 0 ? c.status : 'FULL');
  return badge(c.status);
}

function actionsCell(c, ph) {
  const btn = (action, ic, title, cls = '') => html`<button type="button" class="btn-ghost btn-sm ${cls}" data-action="${action}" data-id="${c.classId}" title="${title}" data-testid="row-${action}">${icon(ic, 'w-3.5 h-3.5')}</button>`;
  if (ph === 'UPCOMING') {
    return html`<div class="flex justify-end gap-1">
      ${hasSessions(c) ? btn('sessions', 'list-checks', 'Buổi học') : ''}
      ${btn('coach', 'user-cog', 'Đổi HLV')}
      ${btn('edit', 'pencil', 'Sửa lớp')}
      ${started(c) ? btn('stop', 'octagon-x', 'Dừng lớp', 'text-rose-600 hover:bg-rose-50') : btn('cancel', 'calendar-x', 'Hủy lớp', 'text-rose-600 hover:bg-rose-50')}
      ${c.currentEnrolled || started(c) ? '' : btn('remove', 'trash-2', 'Xóa lớp tạo nhầm', 'text-rose-600 hover:bg-rose-50')}
    </div>`;
  }
  if (ph === 'PENDING') {
    return html`<div class="flex justify-end gap-1">${hasSessions(c) ? btn('sessions', 'list-checks', 'Buổi học') : ''}<button type="button" class="btn-primary btn-sm" data-action="complete" data-id="${c.classId}" data-testid="row-complete">${icon('check', 'w-3.5 h-3.5')} Hoàn thành</button></div>`;
  }
  return hasSessions(c) ? html`<div class="flex justify-end">${btn('sessions', 'list-checks', 'Buổi học')}</div>` : '';
}

// Popup trên lịch: nút có chữ cho dễ bấm (bảng dùng nút icon cho gọn)
function detailActions(c, ph) {
  const btn = (action, ic, label, cls = 'btn-secondary') => html`<button type="button" class="${cls} btn-sm" data-action="${action}" data-id="${c.classId}" data-testid="detail-${action}">${icon(ic, 'w-3.5 h-3.5')} ${label}</button>`;
  if (ph === 'UPCOMING') {
    return html`<div class="flex flex-wrap justify-end gap-2">
      ${hasSessions(c) ? btn('sessions', 'list-checks', 'Buổi học') : ''}
      ${btn('coach', 'user-cog', 'Đổi HLV')}
      ${btn('edit', 'pencil', 'Sửa lớp')}
      ${started(c) ? btn('stop', 'octagon-x', 'Dừng lớp', 'btn-secondary text-rose-600 hover:bg-rose-50') : btn('cancel', 'calendar-x', 'Hủy lớp', 'btn-secondary text-rose-600 hover:bg-rose-50')}
      ${c.currentEnrolled || started(c) ? '' : btn('remove', 'trash-2', 'Xóa lớp', 'btn-secondary text-rose-600 hover:bg-rose-50')}
    </div>`;
  }
  if (ph === 'PENDING') return html`<div class="flex flex-wrap justify-end gap-2">${hasSessions(c) ? btn('sessions', 'list-checks', 'Buổi học') : ''}${btn('complete', 'check', 'Hoàn thành buổi', 'btn-primary')}</div>`;
  return hasSessions(c) ? html`<div class="flex justify-end">${btn('sessions', 'list-checks', 'Buổi học')}</div>` : '';
}

// Mỗi tab là 1 truy vấn GET /classes/search (lọc + phân trang ở BE, FE-TODO #7)
function tabQuery(tab, today) {
  return {
    UPCOMING: { status: 'OPENING', fromDate: today },
    // đã qua giờ nhưng chưa chốt: lớp OPENING tới hôm nay, lọc thêm giờ kết thúc ở FE
    PENDING: { status: 'OPENING', toDate: today },
    DONE: { status: 'COMPLETED' },
    CANCELLED: { status: 'CANCELLED' },
    ALL: {}
  }[tab];
}

const subjectSelect = (s, testid) => html`
  <select class="input sm:w-56" name="subject" data-action="subject" data-testid="${testid}">
    <option value="">Tất cả bộ môn</option>
    ${s.subjects.map(x => html`<option value="${x.subjectId}" ${String(x.subjectId) === String(s.subjectId) ? 'selected' : ''}>${x.subjectName}</option>`)}
  </select>`;

function listView(s) {
  const now = new Date();
  const count = id => s.counts?.[id];
  // từ khóa lọc trong trang đang xem (API tìm lớp chưa có tham số từ khóa)
  const list = s.classes.filter(c => matches(s.keyword, [classCode(c), c.subjectName, c.coachName, c.roomName]));
  // tab Chờ chốt lấy hết rồi cắt ở FE, các tab khác BE đã phân trang
  const page = s.tab === 'PENDING' ? paginate(list, s.pageNo, s.pageSize) : s.page;
  const rowsOf = s.tab === 'PENDING' ? page.content : list;
  return html`
    <div>
      ${tabs(TABS.map(([id, label]) => ({ id, label, count: count(id) })), s.tab)}
      <div class="flex flex-col sm:flex-row gap-2 mb-5">
        ${subjectSelect(s, 'list-subject')}
        ${searchBox(s.keyword, 'Lọc mã lớp, môn, HLV, phòng...')}
      </div>
    </div>
    <div class="card" data-testid="class-table">
      ${list.length ? html`${table({
        columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'HLV' }, { label: 'Phòng' }, { label: 'Sĩ số' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: rowsOf.map(c => {
          const ph = phase(c, now);
          const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
          return [
            html`<div class="flex items-center gap-3"><div class="w-14 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-100">${classImage(c)}</div><div><div class="font-semibold">${c.subjectName}</div><div class="text-xs text-slate-500">${classCode(c)}${c.imageUrl ? '' : ' · ảnh mặc định'}</div></div></div>`,
            classWhen(c)
              ? html`<div class="text-sm font-semibold">${classWhen(c).range}</div><div class="mt-1">${c.daysOfWeek ? courseInline(c, { dates: false }) : html`<span class="text-xs text-slate-500">${classWhen(c).clock} · ${classWhen(c).days} ngày</span>`}</div>`
              : html`<div class="text-sm font-semibold">${weekday(c.startTime)}, ${date(c.startTime)}</div><div class="text-xs text-slate-500">${timeRange(c.startTime, c.endTime)}</div>`,
            c.coachName,
            c.roomName,
            html`<div class="w-24"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity}</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#1E9E64]" style="width:${pct}%"></div></div></div>`,
            statusCell(c, ph),
            actionsCell(c, ph)
          ];
        })
      })}${pagination(page, { unit: 'lớp' })}` : emptyState('Không có lớp phù hợp', 'calendar-x')}
    </div>`;
}

function calendarView(s) {
  const count = st => s.calClasses.filter(c => stateOf(c) === st).length;
  return html`
    ${calendarToolbar(s)}
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      ${subjectSelect(s, 'cal-subject')}
      <span class="text-sm text-slate-500" data-testid="cal-summary">${s.calClasses.length} lớp · ${count('open') + count('closed')} sắp diễn ra · ${count('pending')} chờ chốt</span>
    </div>
    ${calendarGrid(s, s.calClasses, { stateOf: c => stateOf(c), legend: MANAGER_LEGEND })}`;
}

function view(s) {
  const pending = s.counts?.PENDING;
  return html`
    ${pageHeader('Lớp học', 'Xếp lịch lớp, phân công HLV và phòng tập', html`
      <div class="flex flex-wrap items-center gap-2">
        ${viewModeTabs(s.mode)}
        <button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('calendar-plus', 'w-4 h-4')} Mở lớp mới</button>
      </div>`)}
    ${pending ? html`
      <div class="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3 mb-5 flex items-center gap-2" data-testid="pending-hint">
        ${icon('clock', 'w-4 h-4 shrink-0')}<span>Có ${pending} buổi đã qua giờ nhưng chưa chốt, ${s.mode === 'list'
          ? html`vào tab <b>Chờ chốt buổi</b> rồi bấm <b>Hoàn thành</b>`
          : html`là các thẻ <b>màu vàng</b> trên lịch, bấm vào thẻ rồi chọn <b>Hoàn thành buổi</b>`}</span>
      </div>` : ''}
    ${s.mode === 'list' ? listView(s) : calendarView(s)}`;
}

// Chi tiết lớp khi bấm thẻ trên lịch: thông tin + các thao tác như ở bảng
function classDetail(c) {
  const ph = phase(c);
  const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
  return html`
    <div class="rounded-2xl border border-brand-line overflow-hidden" data-testid="cal-detail" data-class-id="${c.classId}">
      <div class="h-36 sm:h-44 bg-slate-100">${classImage(c)}</div>
      <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <span class="w-2 h-11 rounded-full shrink-0 bg-gradient-to-b ${subjectColor(c.subjectName)}"></span>
          <div class="min-w-0">
            <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${c.subjectName} <span class="text-sm font-semibold text-slate-400">${classCode(c)}</span></div>
            <div class="text-sm text-slate-500">${whenLine(c)}</div>
          </div>
        </div>
        ${statusCell(c, ph)}
      </div>
      <div class="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <div class="flex items-center gap-2 text-slate-600">${icon('user-round', 'w-4 h-4 text-slate-400')} ${c.coachName}</div>
        <div class="flex items-center gap-2 text-slate-600">${icon('map-pin', 'w-4 h-4 text-slate-400')} ${c.roomName}</div>
        <div class="text-slate-600"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity} học viên</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#1E9E64]" style="width:${pct}%"></div></div></div>
      </div>
      <div class="mt-4">${courseBlock(courseOf(c))}</div>
      ${detailActions(c, ph) ? html`<div class="mt-4 pt-4 border-t border-slate-100">${detailActions(c, ph)}</div>` : ''}
      </div>
    </div>`;
}

// Popup chi tiết trên lịch: bấm thao tác thì đóng popup rồi chạy đúng thao tác của trang
function openDetail(ctx, classes, title, actions) {
  const run = name => (btn, e) => { modal.close(); actions[name](btn, e, ctx); };
  const modal = openModal({
    title,
    size: 'max-w-2xl',
    body: html`<div class="space-y-3 max-h-[70vh] overflow-y-auto">${classes.map(classDetail)}</div>`,
    actions: Object.fromEntries(['coach', 'edit', 'cancel', 'stop', 'sessions', 'remove', 'complete'].map(n => [n, run(n)]))
  });
}

export default function ManagerClasses(el) {
  const findClass = (ctx, id) => ctx.state.classes.find(x => String(x.classId) === id);
  const actions = {
    'view-mode': (t, e, ctx) => {
      const mode = t.dataset.mode;
      if (mode === ctx.state.mode) return;
      try { localStorage.setItem(MODE_KEY, mode); } catch { /* bỏ qua */ }
      Object.assign(ctx.state, { mode, calOffset: 0, pageNo: 0, keyword: '' });
      ctx.reload();
    },
    'cal-nav': (t, e, ctx) => {
      const d = Number(t.dataset.delta);
      ctx.state.calOffset = d === 0 ? 0 : ctx.state.calOffset + d;
      ctx.reload();
    },
    'cal-class': (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      if (c) openDetail(ctx, [c], 'Chi tiết lớp học', actions);
    },
    'cal-day': (t, e, ctx) => {
      const list = ctx.state.classes
        .filter(c => isoDate(toDate(c.startTime)) === t.dataset.date)
        .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
      if (list.length) openDetail(ctx, list, `Lớp ngày ${date(list[0].startTime)}`, actions);
    },
    tab: (t, e, ctx) => { ctx.state.tab = t.dataset.tab; ctx.state.pageNo = 0; ctx.reload(); },
    search: (t, e, ctx) => ctx.set({ keyword: t.value }),
    subject: (t, e, ctx) => { ctx.state.subjectId = t.value; ctx.state.pageNo = 0; ctx.reload(); },
    ...pagerActions({ server: true }),
    create: (t, e, ctx) => openFormModal({
      title: 'Mở lớp mới', size: 'max-w-xl', fields: classFields(ctx.state), validate: classValidator(ctx.state),
      submitText: 'Mở lớp', onMount: modal => { mountSchedule(modal); mountImagePicker(modal); },
      submit: d => createClass(d), onDone: () => ctx.reload()
    }),
    edit: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Sửa lớp ${c.subjectName} ${classCode(c)}`, size: 'max-w-xl', fields: html`
          ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Lớp đã có ${c.currentEnrolled} học viên — đổi giờ hoặc phòng sẽ tự gửi thông báo cho họ.</div>` : ''}
          ${classFields(ctx.state, c)}`,
        validate: classValidator(ctx.state, c), success: 'Đã cập nhật lớp', onMount: modal => { mountSchedule(modal, c); mountImagePicker(modal); },
        // không chọn ảnh mới -> không gửi part image, BE giữ ảnh cũ
        submit: d => classApi.update(c.classId, classPayload(d, c), hasFile(d.image) ? d.image : undefined).catch(err => { throw attachImageError(err); }),
        onDone: () => ctx.reload()
      });
    },
    coach: async (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      const list = (await coachAdminApi.list(c.subjectId).catch(() => ctx.state.coaches.filter(x => teaches(x, c.subjectId))))
        .filter(x => (x.status || 'ACTIVE') === 'ACTIVE');
      openFormModal({
        title: `Đổi HLV lớp ${c.subjectName}`,
        fields: field('Huấn luyện viên mới', select('coachId', coachOptions(list), c.coachId, { required: true, placeholder: list.length ? 'Chọn HLV' : 'Chưa có HLV dạy môn này' }), `Chỉ hiện HLV dạy môn ${c.subjectName}`),
        validate: d => requireFields(d, ['coachId']), success: 'Đã đổi huấn luyện viên', submitText: 'Đổi HLV',
        submit: d => classApi.assignCoach(c.classId, d.coachId), onDone: () => ctx.reload()
      });
    },
    // hủy lớp: giữ lại trong lịch sử (tab Đã hủy), BE hủy chỗ và báo cho học viên kèm lý do
    cancel: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Hủy lớp ${c.subjectName} ${classCode(c)}`,
        fields: html`
          <div class="text-sm text-slate-600">${whenLine(c)} · ${c.roomName}</div>
          ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">${c.currentEnrolled} học viên đã đăng ký sẽ bị hủy chỗ và nhận thông báo.</div>` : ''}
          ${field('Lý do hủy', textarea('reason', '', { rows: 3, placeholder: 'VD: HLV nghỉ ốm, phòng bảo trì...' }), 'Gửi kèm trong thông báo cho học viên')}`,
        validate: d => (String(d.reason || '').length > 500 ? { reason: 'Tối đa 500 ký tự' } : {}),
        submitText: 'Hủy lớp', success: 'Đã hủy lớp',
        submit: d => classApi.cancel(c.classId, String(d.reason || '').trim() || undefined), onDone: () => ctx.reload()
      });
    },
    // dừng lớp đã bắt đầu: BE hoàn tiền theo tỉ lệ buổi chưa học và báo học viên
    stop: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Dừng lớp ${c.subjectName} ${classCode(c)}`,
        fields: html`
          <div class="text-sm text-slate-600">${whenLine(c)} · ${c.roomName}</div>
          <div class="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3">Lớp đã bắt đầu nên không hủy được. Dừng lớp sẽ hủy các buổi còn lại, ${c.currentEnrolled ? `hoàn tiền cho ${c.currentEnrolled} học viên theo số buổi chưa học` : 'hoàn tiền theo số buổi chưa học'} và gửi thông báo cho họ.</div>
          ${field('Lý do dừng lớp', textarea('reason', '', { rows: 3, required: true, placeholder: 'VD: HLV nghỉ dài hạn, phòng hỏng...' }), 'Bắt buộc, gửi kèm trong thông báo')}`,
        validate: d => {
          const err = requireFields(d, ['reason']);
          if (String(d.reason || '').length > 500) err.reason = 'Tối đa 500 ký tự';
          return err;
        },
        submitText: 'Dừng lớp', success: 'Đã dừng lớp và hoàn tiền cho học viên',
        submit: d => classApi.stop(c.classId, d.reason.trim()), onDone: () => ctx.reload()
      });
    },
    sessions: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openClassSessions({ cls: c, rooms: ctx.state.rooms, onChange: () => ctx.reload() });
    },
    complete: async (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      const msg = `Xác nhận lớp ${c.subjectName} (${date(c.startTime)} ${timeRange(c.startTime, c.endTime)}) đã diễn ra xong?`;
      if (await confirmAction(msg, () => classApi.complete(c.classId), { title: 'Chốt buổi học', confirmText: 'Hoàn thành', success: 'Đã ghi nhận lớp hoàn thành' })) ctx.reload();
    },
    // chỉ cho lớp chưa ai đăng ký (tạo nhầm): xóa khỏi danh sách
    remove: async (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      const msg = `Xóa lớp ${c.subjectName} (${date(c.startTime)} ${timeRange(c.startTime, c.endTime)})? Lớp chưa có học viên nên sẽ bị xóa khỏi danh sách.`;
      if (await confirmAction(msg, () => classApi.remove(c.classId), { confirmText: 'Xóa lớp', success: 'Đã xóa lớp' })) ctx.reload();
    }
  };

  return mountPage(el, {
    state: {
      mode: ['week', 'month', 'list'].includes(savedMode()) ? savedMode() : 'week',
      calOffset: 0, calClasses: [],
      tab: 'UPCOMING', keyword: '', subjectId: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE, subjects: [], rooms: [], coaches: []
    },
    load: async ctx => {
      const s = ctx.state;
      const today = isoDate(new Date());
      const now = new Date();
      const isList = s.mode === 'list';
      const base = { subjectId: s.subjectId || undefined };
      const search = (tab, extra) => classApi.search({ ...base, ...tabQuery(tab, today), ...extra });
      const total = tab => search(tab, { size: 1 }).then(p => p.totalElements).catch(() => undefined);
      // lớp chờ chốt thường ít: lấy hết rồi lọc giờ kết thúc để đếm đúng
      const pendingOf = page => (page?.content || []).filter(c => toDate(c.endTime) < now);
      const [page, calClasses, pendingPage, UPCOMING, DONE, CANCELLED, ALL, subjects, rooms, coaches] = await Promise.all([
        !isList || s.tab === 'PENDING' ? null : search(s.tab, { page: s.pageNo, size: s.pageSize }),
        // lớp đã hủy không hiện trên lịch (xem ở tab Đã hủy của Danh sách)
        isList ? [] : loadCalendarClasses(s),
        search('PENDING', { size: 100 }),
        total('UPCOMING'), total('DONE'), total('CANCELLED'), total('ALL'),
        s.subjects.length ? s.subjects : subjectApi.list(),
        s.rooms.length ? s.rooms : roomApi.list(),
        s.coaches.length ? s.coaches : coachAdminApi.list()
      ]);
      const pending = pendingOf(pendingPage);
      // các thao tác (sửa, hủy, chốt...) tìm lớp trong state.classes
      const classes = !isList ? calClasses
        : s.tab === 'PENDING' ? pending
          : s.tab === 'UPCOMING' ? (page?.content || []).filter(c => toDate(c.endTime) >= now)
            : (page?.content || []);
      return { page, calClasses, classes, subjects, rooms, coaches, counts: { UPCOMING, PENDING: pending.length, DONE, CANCELLED, ALL } };
    },
    view,
    afterRender: (st, ctx) => scrollTimeGrid(ctx.el),
    actions
  });
}
