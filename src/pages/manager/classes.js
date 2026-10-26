import { html, icon, render, readForm } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, textarea, tabs, openModal, dateTimeInput, timeInput, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, subjectApi, roomApi, coachAdminApi } from '../../api/endpoints.js';
import { badge, date, weekday, timeRange, toDate, isoLocalMinute, isoDate, fullName } from '../../core/format.js';
import { subjectColor, classImage, classImageUrl } from '../../components/classCard.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';
import { calendarGrid, calendarToolbar, viewModeTabs, loadCalendarClasses, scrollTimeGrid, MANAGER_LEGEND, classWhen, whenLine } from '../../components/classCalendar.js';

// Lớp học của Quản lý: xem dạng lịch Tuần (khung giờ) / Tháng hoặc bảng Danh sách theo tab trạng thái.
const MODE_KEY = 'sc_manager_classes_mode';
const savedMode = () => { try { return localStorage.getItem(MODE_KEY); } catch { return null; } };

// ===== Ảnh lớp: bắt buộc khi tạo, tuỳ chọn khi sửa (không chọn = giữ ảnh cũ). BE nhận jpg/jpeg/png/webp/heic/heif, tối đa 10MB =====
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const IMAGE_MAX = 10 * 1024 * 1024;
const hasFile = f => f && typeof f === 'object' && f.size > 0;
const fileExt = f => (f.name.includes('.') ? f.name.split('.').pop() : '').toLowerCase();

function imageField(c = {}, { required }) {
  const current = c.classId ? classImageUrl(c) : '';
  return field(required ? 'Ảnh lớp' : 'Ảnh lớp (tuỳ chọn)', html`
    <div data-field-wrap>
      <label class="group relative flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-line hover:border-brand/60 bg-brand-cream/40 p-3 cursor-pointer transition-colors" data-testid="image-picker">
        <span class="w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400" data-image-preview>
          ${current ? html`<img src="${current}" alt="" class="w-full h-full object-cover" />` : icon('image-plus', 'w-7 h-7')}
        </span>
        <span class="min-w-0 text-sm">
          <span class="block font-semibold text-slate-700" data-image-name>${current ? (c.imageUrl ? 'Ảnh hiện tại của lớp' : 'Lớp chưa có ảnh (đang dùng ảnh mặc định)') : 'Bấm để chọn ảnh'}</span>
          <span class="block text-xs text-slate-500 mt-0.5">JPG, PNG, WEBP, HEIC · tối đa 10MB${required ? '' : ' · không chọn sẽ giữ ảnh cũ'}</span>
        </span>
        <input type="file" name="image" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif" class="sr-only" data-testid="image-input" />
      </label>
    </div>`);
}

// kiểm tra file ở FE trước khi gửi (BE vẫn kiểm tra lại)
function imageErrors(d, required) {
  if (!hasFile(d.image)) return required ? { image: 'Vui lòng chọn ảnh cho lớp' } : {};
  if (!IMAGE_EXT.includes(fileExt(d.image))) return { image: 'Chỉ nhận ảnh JPG, JPEG, PNG, WEBP, HEIC hoặc HEIF' };
  if (d.image.size > IMAGE_MAX) return { image: `Ảnh nặng ${(d.image.size / 1024 / 1024).toFixed(1)}MB, tối đa 10MB` };
  return {};
}

// xem trước ảnh vừa chọn (HEIC: trình duyệt không xem trước được, chỉ hiện tên file)
function mountImagePicker(modal) {
  const inputEl = modal.el.querySelector('[data-testid=image-input]');
  if (!inputEl) return;
  let url = '';
  inputEl.addEventListener('change', () => {
    const file = inputEl.files?.[0];
    const box = modal.el.querySelector('[data-image-preview]');
    const name = modal.el.querySelector('[data-image-name]');
    if (url) URL.revokeObjectURL(url);
    url = '';
    if (!file) return;
    name.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    if (['heic', 'heif'].includes(fileExt(file))) {
      render(box, html`<span class="text-[11px] font-bold text-slate-500 text-center px-2">HEIC<br />không xem trước được</span>`);
    } else {
      url = URL.createObjectURL(file);
      render(box, html`<img src="${url}" alt="" class="w-full h-full object-cover" data-testid="image-preview-img" />`);
    }
    // chọn lại ảnh thì xoá thông báo lỗi cũ ngay dưới ô ảnh
    const wrap = inputEl.closest('[data-field-wrap]');
    if (wrap.nextElementSibling?.classList.contains('field-error')) wrap.nextElementSibling.remove();
  });
}

// lỗi ảnh của BE (ERR_IMG_001..003) hiện ngay dưới ô chọn ảnh; ERR_IMG_004 (Cloudinary lỗi) chỉ báo, cho thử lại
const attachImageError = err => {
  if (/^ERR_IMG_00[123]$/.test(err?.code || '')) err.fields = { ...(err.fields || {}), image: err.message };
  return err;
};

function form(s, c = {}) {
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setHours(8, 0, 0, 0);
  const start = c.startTime || tomorrow;
  const end = c.endTime || new Date(toDate(start).getTime() + 90 * 60000);
  return html`
    ${field('Bộ môn', select('subjectId', s.subjects.filter(x => x.status !== 'INACTIVE').map(x => ({ value: x.subjectId, label: x.subjectName })), c.subjectId, { required: true, placeholder: 'Chọn bộ môn' }))}
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Huấn luyện viên', select('coachId', s.coaches.map(x => ({ value: x.coachId, label: `${fullName(x)}${x.speciality ? ` · ${x.speciality}` : ''}` })), c.coachId, { required: true, placeholder: 'Chọn HLV' }))}
      ${field('Phòng', select('roomId', s.rooms.filter(r => r.status === 'AVAILABLE').map(r => ({ value: r.roomId, label: `${r.roomName} (tối đa ${r.capacity})` })), c.roomId, { required: true, placeholder: 'Chọn phòng' }))}
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Bắt đầu', dateTimeInput('startTime', isoLocalMinute(start), { required: true }))}
      ${field('Kết thúc', dateTimeInput('endTime', isoLocalMinute(end), { required: true }))}
    </div>
    ${field('Sĩ số tối đa', input('maxCapacity', { type: 'number', value: c.maxCapacity || 20, required: true, attrs: 'min="1"' }), 'Không vượt quá sức chứa của phòng')}
    ${imageField(c, { required: false })}`;
}

function validator(s) {
  return d => {
    const e = requireFields(d, ['subjectId', 'coachId', 'roomId', 'startTime', 'endTime', 'maxCapacity']);
    if (d.startTime && d.endTime && d.endTime <= d.startTime) e.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    const room = s.rooms.find(r => String(r.roomId) === d.roomId);
    if (room && Number(d.maxCapacity) > room.capacity) e.maxCapacity = `Phòng chỉ chứa tối đa ${room.capacity} người`;
    if (d.maxCapacity && Number(d.maxCapacity) < 1) e.maxCapacity = 'Tối thiểu 1 học viên';
    return { ...e, ...imageErrors(d, false) };
  };
}

const payload = d => ({
  subjectId: Number(d.subjectId),
  coachId: Number(d.coachId),
  roomId: Number(d.roomId),
  maxCapacity: Number(d.maxCapacity),
  startTime: `${d.startTime}:00`,
  endTime: `${d.endTime}:00`
});

// ===== Mở lớp lặp lại: từ ngày bắt đầu tới ngày kết thúc, vào các thứ đã chọn, cùng khung giờ =====
// BE chỉ tạo từng buổi (POST /classes) -> FE tạo lần lượt từng buổi trong khoảng ngày.
const MAX_SESSIONS = 60;
const WEEKDAY_OPTS = [[1, 'T2'], [2, 'T3'], [3, 'T4'], [4, 'T5'], [5, 'T6'], [6, 'T7'], [0, 'CN']];
const SHORT_DAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const pad = n => String(n).padStart(2, '0');
const parseDay = v => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d); };

// các ngày (yyyy-MM-dd) sẽ mở buổi; không có ngày kết thúc = 1 buổi
function sessionDates(d) {
  if (!d.startDate) return [];
  if (!d.endDate) return [d.startDate];
  const days = WEEKDAY_OPTS.filter(([n]) => d[`day${n}`]).map(([n]) => n);
  const out = [];
  for (let x = parseDay(d.startDate), end = parseDay(d.endDate); x <= end && out.length <= MAX_SESSIONS; x.setDate(x.getDate() + 1)) {
    if (days.includes(x.getDay())) out.push(isoDate(x));
  }
  return out;
}

function createForm(s) {
  const tomorrow = new Date(Date.now() + 86400000);
  return html`
    ${field('Bộ môn', select('subjectId', s.subjects.filter(x => x.status !== 'INACTIVE').map(x => ({ value: x.subjectId, label: x.subjectName })), '', { required: true, placeholder: 'Chọn bộ môn' }))}
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Huấn luyện viên', select('coachId', s.coaches.map(x => ({ value: x.coachId, label: `${fullName(x)}${x.speciality ? ` · ${x.speciality}` : ''}` })), '', { required: true, placeholder: 'Chọn HLV' }))}
      ${field('Phòng', select('roomId', s.rooms.filter(r => r.status === 'AVAILABLE').map(r => ({ value: r.roomId, label: `${r.roomName} (tối đa ${r.capacity})` })), '', { required: true, placeholder: 'Chọn phòng' }))}
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Ngày bắt đầu', input('startDate', { type: 'date', value: isoDate(tomorrow), required: true }))}
      ${field('Ngày kết thúc', input('endDate', { type: 'date' }), 'Để trống nếu chỉ mở 1 buổi')}
    </div>
    <div data-repeat class="hidden">
      ${field('Lặp vào các thứ', html`
        <div class="flex flex-wrap gap-2" data-field-wrap data-testid="repeat-days">
          ${WEEKDAY_OPTS.map(([n, label]) => html`
            <label class="cursor-pointer">
              <input type="checkbox" name="day${n}" value="1" class="peer sr-only" ${n === tomorrow.getDay() ? 'checked' : ''} />
              <span class="inline-flex w-11 h-9 items-center justify-center rounded-lg border border-brand-line text-sm font-bold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">${label}</span>
            </label>`)}
        </div>`)}
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      ${field('Giờ bắt đầu', timeInput('startClock', '08:00'))}
      ${field('Giờ kết thúc', timeInput('endClock', '09:30'))}
    </div>
    ${field('Sĩ số tối đa', input('maxCapacity', { type: 'number', value: 20, required: true, attrs: 'min="1"' }), 'Không vượt quá sức chứa của phòng')}
    ${imageField({}, { required: true })}
    <div class="rounded-xl bg-brand-sand/70 p-3 text-sm text-slate-700 flex gap-2" data-testid="session-preview"></div>`;
}

function createValidator(s) {
  return d => {
    const e = requireFields(d, ['subjectId', 'coachId', 'roomId', 'startDate', 'startClock', 'endClock', 'maxCapacity']);
    if (d.startClock && d.endClock && d.endClock <= d.startClock) e.endClock = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (d.startDate && d.startClock && new Date(`${d.startDate}T${d.startClock}`) < new Date()) e.startDate = 'Buổi đầu tiên đã qua giờ, chọn ngày hoặc giờ sau hiện tại';
    if (d.endDate) {
      if (d.startDate && d.endDate < d.startDate) e.endDate = 'Ngày kết thúc phải từ ngày bắt đầu trở đi';
      else if (!WEEKDAY_OPTS.some(([n]) => d[`day${n}`])) e.day1 = 'Chọn ít nhất 1 thứ trong tuần';
      else {
        const n = sessionDates(d).length;
        if (!n) e.day1 = 'Không có buổi nào rơi vào các thứ đã chọn trong khoảng ngày này';
        if (n > MAX_SESSIONS) e.endDate = `Tối đa ${MAX_SESSIONS} buổi mỗi lần, hãy rút ngắn khoảng ngày`;
      }
    }
    const room = s.rooms.find(r => String(r.roomId) === d.roomId);
    if (room && Number(d.maxCapacity) > room.capacity) e.maxCapacity = `Phòng chỉ chứa tối đa ${room.capacity} người`;
    if (d.maxCapacity && Number(d.maxCapacity) < 1) e.maxCapacity = 'Tối thiểu 1 học viên';
    return { ...e, ...imageErrors(d, true) };
  };
}

// cập nhật ô "Sẽ mở N buổi" + hiện/ẩn chọn thứ khi đổi ngày
function mountSessionPreview(modal) {
  const form = modal.el.querySelector('form');
  const update = () => {
    const d = readForm(form);
    form.querySelector('[data-repeat]').classList.toggle('hidden', !d.endDate);
    const dates = sessionDates(d);
    const label = v => { const x = parseDay(v); return `${SHORT_DAY[x.getDay()]} ${pad(x.getDate())}/${pad(x.getMonth() + 1)}`; };
    const box = form.querySelector('[data-testid=session-preview]');
    render(box, dates.length
      ? html`${icon('calendar-check', 'w-4 h-4 shrink-0 mt-0.5 text-brand')}<span><b data-testid="session-count">Sẽ mở ${Math.min(dates.length, MAX_SESSIONS)}${dates.length > MAX_SESSIONS ? '+' : ''} buổi</b>${d.startClock && d.endClock ? ` · ${d.startClock} – ${d.endClock}` : ''}<br /><span class="text-slate-500">${dates.slice(0, 8).map(label).join(', ')}${dates.length > 8 ? ', …' : ''}</span></span>`
      : html`${icon('info', 'w-4 h-4 shrink-0 mt-0.5 text-slate-400')}<span class="text-slate-500">Chọn ngày bắt đầu${d.endDate ? ' và các thứ lặp lại' : ''} để xem các buổi sẽ mở</span>`);
  };
  // đợi ô ẩn giờ:phút cập nhật xong (nghe ở document) rồi mới tính
  const later = () => setTimeout(update, 0);
  form.addEventListener('input', later);
  form.addEventListener('change', later);
  update();
}

// tạo lần lượt từng buổi; buổi lỗi (trùng phòng/HLV...) bỏ qua và báo lại cuối cùng
async function createSessions(d) {
  const dates = sessionDates(d);
  const base = { subjectId: Number(d.subjectId), coachId: Number(d.coachId), roomId: Number(d.roomId), maxCapacity: Number(d.maxCapacity) };
  const failed = [];
  let ok = 0;
  for (const day of dates) {
    try {
      await classApi.create({ ...base, startTime: `${day}T${d.startClock}:00`, endTime: `${day}T${d.endClock}:00` }, d.image);
      ok++;
    } catch (err) {
      failed.push({ day, err });
    }
  }
  if (!ok) throw attachImageError(failed[0].err);
  if (failed.length) {
    toast(`${failed.map(f => date(f.day)).join(', ')}: ${failed[0].err.message}`, 'error', `Đã mở ${ok}/${dates.length} buổi, ${failed.length} buổi không mở được`);
  } else {
    toast(ok > 1 ? `Đã mở ${ok} buổi từ ${date(dates[0])} đến ${date(dates[dates.length - 1])}` : 'Đã mở lớp mới');
  }
  return { ok, failed };
}

// Nhóm theo trạng thái thật của BE: OPENING (sắp diễn ra / đã qua giờ nhưng chưa chốt), COMPLETED, CANCELLED
function phase(c, now = new Date()) {
  if (c.status === 'CANCELLED') return 'CANCELLED';
  if (c.status === 'COMPLETED') return 'DONE';
  return toDate(c.endTime) < now ? 'PENDING' : 'UPCOMING';
}

// màu thẻ trên lịch theo giai đoạn của lớp
function stateOf(c, now = new Date()) {
  const ph = phase(c, now);
  if (ph === 'UPCOMING') return c.availableSeats > 0 ? 'open' : 'closed';
  return { PENDING: 'pending', DONE: 'done', CANCELLED: 'cancelled' }[ph];
}

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
      ${btn('coach', 'user-cog', 'Đổi HLV')}
      ${btn('edit', 'pencil', 'Sửa lớp')}
      ${btn('cancel', 'calendar-x', 'Hủy lớp', 'text-rose-600 hover:bg-rose-50')}
      ${c.currentEnrolled ? '' : btn('remove', 'trash-2', 'Xóa lớp tạo nhầm', 'text-rose-600 hover:bg-rose-50')}
    </div>`;
  }
  if (ph === 'PENDING') {
    return html`<div class="flex justify-end"><button type="button" class="btn-primary btn-sm" data-action="complete" data-id="${c.classId}" data-testid="row-complete">${icon('check', 'w-3.5 h-3.5')} Hoàn thành</button></div>`;
  }
  return '';
}

// Popup trên lịch: nút có chữ cho dễ bấm (bảng dùng nút icon cho gọn)
function detailActions(c, ph) {
  const btn = (action, ic, label, cls = 'btn-secondary') => html`<button type="button" class="${cls} btn-sm" data-action="${action}" data-id="${c.classId}" data-testid="detail-${action}">${icon(ic, 'w-3.5 h-3.5')} ${label}</button>`;
  if (ph === 'UPCOMING') {
    return html`<div class="flex flex-wrap justify-end gap-2">
      ${btn('coach', 'user-cog', 'Đổi HLV')}
      ${btn('edit', 'pencil', 'Sửa lớp')}
      ${btn('cancel', 'calendar-x', 'Hủy lớp', 'btn-secondary text-rose-600 hover:bg-rose-50')}
      ${c.currentEnrolled ? '' : btn('remove', 'trash-2', 'Xóa lớp', 'btn-secondary text-rose-600 hover:bg-rose-50')}
    </div>`;
  }
  if (ph === 'PENDING') return html`<div class="flex justify-end">${btn('complete', 'check', 'Hoàn thành buổi', 'btn-primary')}</div>`;
  return '';
}

// Mỗi tab là 1 truy vấn GET /classes/search (lọc + phân trang ở BE, FE-TODO #7)
const PAGE_SIZE = 20;
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

function pager(page) {
  if (!page || page.totalPages <= 1) return '';
  const n = page.number;
  return html`
    <div class="flex items-center justify-between px-5 py-3 border-t border-brand-line/60 text-sm" data-testid="pager">
      <span class="text-slate-500">Trang ${n + 1}/${page.totalPages} · ${page.totalElements} lớp</span>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n - 1}" ${n <= 0 ? 'disabled' : ''}>${icon('chevron-left', 'w-3.5 h-3.5')} Trước</button>
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n + 1}" ${n + 1 >= page.totalPages ? 'disabled' : ''}>Sau ${icon('chevron-right', 'w-3.5 h-3.5')}</button>
      </div>
    </div>`;
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
  const list = s.classes.filter(c => matches(s.keyword, [c.subjectName, c.coachName, c.roomName]));
  return html`
    <div>
      ${tabs(TABS.map(([id, label]) => ({ id, label, count: count(id) })), s.tab)}
      <div class="flex flex-col sm:flex-row gap-2 mb-5">
        ${subjectSelect(s, 'list-subject')}
        ${searchBox(s.keyword, 'Lọc môn, HLV, phòng trong trang...')}
      </div>
    </div>
    <div class="card" data-testid="class-table">
      ${list.length ? html`${table({
        columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'HLV' }, { label: 'Phòng' }, { label: 'Sĩ số' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: list.map(c => {
          const ph = phase(c, now);
          const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
          return [
            html`<div class="flex items-center gap-3"><div class="w-14 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-100">${classImage(c)}</div><div><div class="font-semibold">${c.subjectName}</div><div class="text-xs text-slate-500">#${c.classId}${c.imageUrl ? '' : ' · ảnh mặc định'}</div></div></div>`,
            classWhen(c)
              ? html`<div class="text-sm font-semibold">${classWhen(c).range}</div><div class="text-xs text-slate-500">${classWhen(c).clock} · ${classWhen(c).days} ngày</div>`
              : html`<div class="text-sm font-semibold">${weekday(c.startTime)}, ${date(c.startTime)}</div><div class="text-xs text-slate-500">${timeRange(c.startTime, c.endTime)}</div>`,
            c.coachName,
            c.roomName,
            html`<div class="w-24"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity}</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${pct}%"></div></div></div>`,
            statusCell(c, ph),
            actionsCell(c, ph)
          ];
        })
      })}${s.tab === 'PENDING' ? '' : pager(s.page)}` : emptyState('Không có lớp phù hợp', 'calendar-x')}
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
            <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${c.subjectName} <span class="text-sm font-semibold text-slate-400">#${c.classId}</span></div>
            <div class="text-sm text-slate-500">${whenLine(c)}</div>
          </div>
        </div>
        ${statusCell(c, ph)}
      </div>
      <div class="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <div class="flex items-center gap-2 text-slate-600">${icon('user-round', 'w-4 h-4 text-slate-400')} ${c.coachName}</div>
        <div class="flex items-center gap-2 text-slate-600">${icon('map-pin', 'w-4 h-4 text-slate-400')} ${c.roomName}</div>
        <div class="text-slate-600"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity} học viên</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${pct}%"></div></div></div>
      </div>
      ${ph === 'UPCOMING' || ph === 'PENDING' ? html`<div class="mt-4 pt-4 border-t border-slate-100">${detailActions(c, ph)}</div>` : ''}
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
    actions: Object.fromEntries(['coach', 'edit', 'cancel', 'remove', 'complete'].map(n => [n, run(n)]))
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
    page: (t, e, ctx) => { ctx.state.pageNo = Math.max(0, Number(t.dataset.page)); ctx.reload(); },
    create: (t, e, ctx) => openFormModal({
      title: 'Mở lớp mới', size: 'max-w-xl', fields: createForm(ctx.state), validate: createValidator(ctx.state),
      submitText: 'Mở lớp', onMount: modal => { mountSessionPreview(modal); mountImagePicker(modal); },
      submit: d => createSessions(d), onDone: () => ctx.reload()
    }),
    edit: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Sửa lớp ${c.subjectName} #${c.classId}`, size: 'max-w-xl', fields: html`
          ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Lớp đã có ${c.currentEnrolled} học viên — đổi giờ hoặc phòng sẽ tự gửi thông báo cho họ.</div>` : ''}
          ${form(ctx.state, c)}`,
        validate: validator(ctx.state), success: 'Đã cập nhật lớp', onMount: mountImagePicker,
        // không chọn ảnh mới -> không gửi part image, BE giữ ảnh cũ
        submit: d => classApi.update(c.classId, payload(d), hasFile(d.image) ? d.image : undefined).catch(err => { throw attachImageError(err); }),
        onDone: () => ctx.reload()
      });
    },
    coach: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Đổi HLV lớp ${c.subjectName}`,
        fields: field('Huấn luyện viên mới', select('coachId', ctx.state.coaches.map(x => ({ value: x.coachId, label: `${fullName(x)}${x.speciality ? ` · ${x.speciality}` : ''}` })), c.coachId, { required: true })),
        validate: d => requireFields(d, ['coachId']), success: 'Đã đổi huấn luyện viên', submitText: 'Đổi HLV',
        submit: d => classApi.assignCoach(c.classId, d.coachId), onDone: () => ctx.reload()
      });
    },
    // hủy lớp: giữ lại trong lịch sử (tab Đã hủy), BE hủy chỗ và báo cho học viên kèm lý do
    cancel: (t, e, ctx) => {
      const c = findClass(ctx, t.dataset.id);
      openFormModal({
        title: `Hủy lớp ${c.subjectName} #${c.classId}`,
        fields: html`
          <div class="text-sm text-slate-600">${whenLine(c)} · ${c.roomName}</div>
          ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">${c.currentEnrolled} học viên đã đăng ký sẽ bị hủy chỗ và nhận thông báo.</div>` : ''}
          ${field('Lý do hủy', textarea('reason', '', { rows: 3, placeholder: 'VD: HLV nghỉ ốm, phòng bảo trì...' }), 'Gửi kèm trong thông báo cho học viên')}`,
        validate: d => (String(d.reason || '').length > 500 ? { reason: 'Tối đa 500 ký tự' } : {}),
        submitText: 'Hủy lớp', success: 'Đã hủy lớp',
        submit: d => classApi.cancel(c.classId, String(d.reason || '').trim() || undefined), onDone: () => ctx.reload()
      });
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
      tab: 'UPCOMING', keyword: '', subjectId: '', pageNo: 0, subjects: [], rooms: [], coaches: []
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
        !isList || s.tab === 'PENDING' ? null : search(s.tab, { page: s.pageNo, size: PAGE_SIZE }),
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
