import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, textarea, tabs } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, subjectApi, roomApi, coachAdminApi } from '../../api/endpoints.js';
import { badge, date, weekday, timeRange, toDate, isoLocalMinute, fullName } from '../../core/format.js';
import { subjectColor } from '../../components/classCard.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';

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
      ${field('Bắt đầu', input('startTime', { type: 'datetime-local', value: isoLocalMinute(start), required: true }))}
      ${field('Kết thúc', input('endTime', { type: 'datetime-local', value: isoLocalMinute(end), required: true }))}
    </div>
    ${field('Sĩ số tối đa', input('maxCapacity', { type: 'number', value: c.maxCapacity || 20, required: true, attrs: 'min="1"' }), 'Không vượt quá sức chứa của phòng')}`;
}

function validator(s) {
  return d => {
    const e = requireFields(d, ['subjectId', 'coachId', 'roomId', 'startTime', 'endTime', 'maxCapacity']);
    if (d.startTime && d.endTime && d.endTime <= d.startTime) e.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    const room = s.rooms.find(r => String(r.roomId) === d.roomId);
    if (room && Number(d.maxCapacity) > room.capacity) e.maxCapacity = `Phòng chỉ chứa tối đa ${room.capacity} người`;
    if (d.maxCapacity && Number(d.maxCapacity) < 1) e.maxCapacity = 'Tối thiểu 1 học viên';
    return e;
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

// Nhóm theo trạng thái thật của BE: OPENING (sắp diễn ra / đã qua giờ nhưng chưa chốt), COMPLETED, CANCELLED
function phase(c, now = new Date()) {
  if (c.status === 'CANCELLED') return 'CANCELLED';
  if (c.status === 'COMPLETED') return 'DONE';
  return toDate(c.endTime) < now ? 'PENDING' : 'UPCOMING';
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

function view(s) {
  const now = new Date();
  const count = id => s.classes.filter(c => id === 'ALL' || phase(c, now) === id).length;
  const list = s.classes
    .filter(c => s.tab === 'ALL' || phase(c, now) === s.tab)
    .filter(c => !s.subject || c.subjectName === s.subject)
    .filter(c => matches(s.keyword, [c.subjectName, c.coachName, c.roomName]))
    .sort((a, b) => (s.tab === 'UPCOMING' ? 1 : -1) * (toDate(a.startTime) - toDate(b.startTime)));
  const subjects = [...new Set(s.classes.map(c => c.subjectName))].sort();
  const pending = count('PENDING');
  return html`
    ${pageHeader('Lớp học', 'Xếp lịch lớp, phân công HLV và phòng tập',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('calendar-plus', 'w-4 h-4')} Mở lớp mới</button>`)}
    ${pending ? html`
      <div class="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3 mb-5 flex items-center gap-2" data-testid="pending-hint">
        ${icon('clock', 'w-4 h-4 shrink-0')}<span>Có ${pending} buổi đã qua giờ nhưng chưa chốt, vào tab <b>Chờ chốt buổi</b> rồi bấm <b>Hoàn thành</b></span>
      </div>` : ''}
    <div>
      ${tabs(TABS.map(([id, label]) => ({ id, label, count: count(id) })), s.tab)}
      <div class="flex flex-col sm:flex-row gap-2 mb-5">
        <select class="input sm:w-48" name="subject" data-action="subject">
          <option value="">Tất cả bộ môn</option>
          ${subjects.map(n => html`<option ${n === s.subject ? 'selected' : ''}>${n}</option>`)}
        </select>
        ${searchBox(s.keyword, 'Tìm môn, HLV, phòng...')}
      </div>
    </div>
    <div class="card" data-testid="class-table">
      ${list.length ? table({
        columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'HLV' }, { label: 'Phòng' }, { label: 'Sĩ số' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: list.map(c => {
          const ph = phase(c, now);
          const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
          return [
            html`<div class="flex items-center gap-3"><span class="w-2 h-9 rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span><div><div class="font-semibold">${c.subjectName}</div><div class="text-xs text-slate-500">#${c.classId}</div></div></div>`,
            html`<div class="text-sm font-semibold">${weekday(c.startTime)}, ${date(c.startTime)}</div><div class="text-xs text-slate-500">${timeRange(c.startTime, c.endTime)}</div>`,
            c.coachName,
            c.roomName,
            html`<div class="w-24"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity}</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${pct}%"></div></div></div>`,
            statusCell(c, ph),
            actionsCell(c, ph)
          ];
        })
      }) : emptyState('Không có lớp phù hợp', 'calendar-x')}
    </div>`;
}

export default function ManagerClasses(el) {
  return mountPage(el, {
    state: { tab: 'UPCOMING', keyword: '', subject: '' },
    load: async () => {
      const [classes, subjects, rooms, coaches] = await Promise.all([classApi.list(), subjectApi.list(), roomApi.list(), coachAdminApi.list()]);
      return { classes, subjects, rooms, coaches };
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      subject: (t, e, ctx) => ctx.set({ subject: t.value }),
      create: (t, e, ctx) => openFormModal({
        title: 'Mở lớp mới', size: 'max-w-xl', fields: form(ctx.state), validate: validator(ctx.state),
        success: 'Đã mở lớp mới', submitText: 'Mở lớp',
        submit: d => classApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        openFormModal({
          title: `Sửa lớp ${c.subjectName} #${c.classId}`, size: 'max-w-xl', fields: html`
            ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Lớp đã có ${c.currentEnrolled} học viên — đổi giờ hoặc phòng sẽ tự gửi thông báo cho họ.</div>` : ''}
            ${form(ctx.state, c)}`,
          validate: validator(ctx.state), success: 'Đã cập nhật lớp',
          submit: d => classApi.update(c.classId, payload(d)), onDone: () => ctx.reload()
        });
      },
      coach: (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        openFormModal({
          title: `Đổi HLV lớp ${c.subjectName}`,
          fields: field('Huấn luyện viên mới', select('coachId', ctx.state.coaches.map(x => ({ value: x.coachId, label: `${fullName(x)}${x.speciality ? ` · ${x.speciality}` : ''}` })), c.coachId, { required: true })),
          validate: d => requireFields(d, ['coachId']), success: 'Đã đổi huấn luyện viên', submitText: 'Đổi HLV',
          submit: d => classApi.assignCoach(c.classId, d.coachId), onDone: () => ctx.reload()
        });
      },
      // hủy lớp: giữ lại trong lịch sử (tab Đã hủy), BE hủy chỗ và báo cho học viên kèm lý do
      cancel: (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        openFormModal({
          title: `Hủy lớp ${c.subjectName} #${c.classId}`,
          fields: html`
            <div class="text-sm text-slate-600">${weekday(c.startTime)}, ${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName}</div>
            ${c.currentEnrolled ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">${c.currentEnrolled} học viên đã đăng ký sẽ bị hủy chỗ và nhận thông báo.</div>` : ''}
            ${field('Lý do hủy', textarea('reason', '', { rows: 3, placeholder: 'VD: HLV nghỉ ốm, phòng bảo trì...' }), 'Gửi kèm trong thông báo cho học viên')}`,
          validate: d => (String(d.reason || '').length > 500 ? { reason: 'Tối đa 500 ký tự' } : {}),
          submitText: 'Hủy lớp', success: 'Đã hủy lớp',
          submit: d => classApi.cancel(c.classId, String(d.reason || '').trim() || undefined), onDone: () => ctx.reload()
        });
      },
      complete: async (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        const msg = `Xác nhận lớp ${c.subjectName} (${date(c.startTime)} ${timeRange(c.startTime, c.endTime)}) đã diễn ra xong?`;
        if (await confirmAction(msg, () => classApi.complete(c.classId), { title: 'Chốt buổi học', confirmText: 'Hoàn thành', success: 'Đã ghi nhận lớp hoàn thành' })) ctx.reload();
      },
      // chỉ cho lớp chưa ai đăng ký (tạo nhầm): xóa khỏi danh sách
      remove: async (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        const msg = `Xóa lớp ${c.subjectName} (${date(c.startTime)} ${timeRange(c.startTime, c.endTime)})? Lớp chưa có học viên nên sẽ bị xóa khỏi danh sách.`;
        if (await confirmAction(msg, () => classApi.remove(c.classId), { confirmText: 'Xóa lớp', success: 'Đã xóa lớp' })) ctx.reload();
      }
    }
  });
}
