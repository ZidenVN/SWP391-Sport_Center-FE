import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, tabs } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, subjectApi, roomApi, coachAdminApi } from '../../api/endpoints.js';
import { badge, date, weekday, timeRange, toDate, isoLocalMinute, fullName } from '../../core/format.js';
import { subjectColor } from '../../components/classCard.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';

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

function view(s) {
  const now = new Date();
  const list = s.classes
    .filter(c => s.tab === 'ALL' || (s.tab === 'UPCOMING' ? toDate(c.endTime) >= now : toDate(c.endTime) < now))
    .filter(c => !s.subject || c.subjectName === s.subject)
    .filter(c => matches(s.keyword, [c.subjectName, c.coachName, c.roomName]))
    .sort((a, b) => (s.tab === 'PAST' ? -1 : 1) * (toDate(a.startTime) - toDate(b.startTime)));
  const upcoming = s.classes.filter(c => toDate(c.endTime) >= now).length;
  const subjects = [...new Set(s.classes.map(c => c.subjectName))].sort();
  return html`
    ${pageHeader('Lớp học', 'Xếp lịch lớp, phân công HLV và phòng tập',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('calendar-plus', 'w-4 h-4')} Mở lớp mới</button>`)}
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
      ${tabs([
        { id: 'UPCOMING', label: 'Sắp diễn ra', count: upcoming },
        { id: 'PAST', label: 'Đã kết thúc', count: s.classes.length - upcoming },
        { id: 'ALL', label: 'Tất cả', count: s.classes.length }
      ], s.tab)}
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
          const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
          return [
            html`<div class="flex items-center gap-3"><span class="w-2 h-9 rounded-full bg-gradient-to-b ${subjectColor(c.subjectName)}"></span><div><div class="font-semibold">${c.subjectName}</div><div class="text-xs text-slate-500">#${c.classId}</div></div></div>`,
            html`<div class="text-sm font-semibold">${weekday(c.startTime)}, ${date(c.startTime)}</div><div class="text-xs text-slate-500">${timeRange(c.startTime, c.endTime)}</div>`,
            c.coachName,
            c.roomName,
            html`<div class="w-24"><div class="text-xs font-semibold mb-1">${c.currentEnrolled}/${c.maxCapacity}</div><div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-[#469B7E]" style="width:${pct}%"></div></div></div>`,
            toDate(c.endTime) < now ? html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Đã kết thúc</span>` : badge(c.availableSeats > 0 ? c.status : 'FULL'),
            rowActions(c.classId, {
              removeLabel: 'Hủy lớp', removeIcon: 'calendar-x',
              extra: html`<button type="button" class="btn-ghost btn-sm" data-action="coach" data-id="${c.classId}" title="Đổi HLV" data-testid="row-coach">${icon('user-cog', 'w-3.5 h-3.5')}</button>`
            })
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
      remove: async (t, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === t.dataset.id);
        const msg = `Hủy lớp ${c.subjectName} (${date(c.startTime)} ${timeRange(c.startTime, c.endTime)})?${c.currentEnrolled ? `\n${c.currentEnrolled} học viên đã đăng ký sẽ bị hủy chỗ và nhận thông báo.` : ''}`;
        if (await confirmAction(msg, () => classApi.remove(c.classId), { confirmText: 'Hủy lớp', success: 'Đã hủy lớp' })) ctx.reload();
      }
    }
  });
}
