import { html, icon } from '../core/dom.js';
import { openModal, loading, errorState, emptyState, field, select, textarea, input, timeInput } from '../core/ui.js';
import { sessionApi, coachAdminApi } from '../api/endpoints.js';
import { badge, date, weekday, timeRange, toDate, fullName, isoDate, classCode } from '../core/format.js';
import { openFormModal, requireFields } from './crud.js';

// Quản lý buổi học của 1 lớp (Quản lý): GET /classes/{id}/sessions
// - Hoãn buổi chưa diễn ra (PATCH /sessions/{id}/postpone, bắt buộc lý do)
// - HLV dạy thay cho buổi chưa diễn ra (PATCH /sessions/{id}/substitute), chỉ HLV dạy đúng môn
// - Thêm buổi bù cho buổi đã hoãn (POST /classes/{id}/makeup-sessions); BE tự gia hạn gói lớp của học viên

const isUpcoming = x => x.status === 'SCHEDULED' && toDate(x.startTime) > new Date();
const coachLabel = c => `${fullName(c)}${(c.subjects || []).length ? ` · ${c.subjects.map(x => x.subjectName).join(', ')}` : ''}`;

function sessionRow(x, i, sessions) {
  const makeup = sessions.find(m => m.makeupForSessionId === x.sessionId);
  const madeUpFor = x.makeupForSessionId ? sessions.findIndex(m => m.sessionId === x.makeupForSessionId) : -1;
  return html`
    <li class="rounded-2xl border border-brand-line bg-white/70 p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${x.status === 'POSTPONED' || x.status === 'CANCELLED' ? 'opacity-80' : ''}" data-testid="session-row">
      <div class="w-14 shrink-0 text-center rounded-xl ${x.type === 'MAKEUP' ? 'bg-violet-50 text-violet-700' : 'bg-brand-sand text-brand-deep'} py-1.5">
        <div class="text-[10px] font-bold uppercase">${x.type === 'MAKEUP' ? 'Bù' : `Buổi ${i + 1}`}</div>
        <div class="text-sm font-black leading-tight">${date(x.startTime).slice(0, 5)}</div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
          ${weekday(x.startTime)} · ${timeRange(x.startTime, x.endTime)} ${badge(x.status)}
          ${x.type === 'MAKEUP' && madeUpFor >= 0 ? html`<span class="text-[11px] text-violet-700">bù cho buổi ${madeUpFor + 1}</span>` : ''}
          ${makeup ? html`<span class="text-[11px] text-emerald-700">đã có buổi bù ${date(makeup.startTime).slice(0, 5)}</span>` : ''}
        </div>
        <div class="text-xs text-slate-500">HLV ${x.coachName} · ${x.roomName}</div>
        ${x.note ? html`<div class="text-xs text-slate-500 italic mt-0.5">${x.note}</div>` : ''}
      </div>
      <div class="flex flex-wrap sm:justify-end gap-1 shrink-0">
        ${isUpcoming(x) ? html`
          <button type="button" class="btn-ghost btn-sm" data-action="substitute" data-id="${x.sessionId}" data-testid="session-substitute">${icon('user-cog', 'w-3.5 h-3.5')} Dạy thay</button>
          <button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" data-action="postpone" data-id="${x.sessionId}" data-testid="session-postpone">${icon('calendar-x', 'w-3.5 h-3.5')} Hoãn</button>` : ''}
        ${x.status === 'POSTPONED' && !makeup ? html`
          <button type="button" class="btn-ghost btn-sm text-emerald-700 hover:bg-emerald-50" data-action="makeup" data-id="${x.sessionId}" data-testid="session-makeup">${icon('calendar-plus', 'w-3.5 h-3.5')} Thêm buổi bù</button>` : ''}
      </div>
    </li>`;
}

// c: lớp (SportClassResponseDTO); rooms: danh sách phòng; onChange: tải lại trang khi có thay đổi
export function openClassSessions({ cls: c, rooms = [], onChange }) {
  let sessions = [];
  let changed = false;
  let coaches = null;
  const coachesOfSubject = async () => {
    coaches = coaches || await coachAdminApi.list(c.subjectId).catch(() => []);
    return coaches;
  };

  const body = () => {
    const regular = sessions.filter(x => x.type !== 'MAKEUP');
    const n = st => sessions.filter(x => x.status === st).length;
    return html`
      <div class="flex flex-wrap gap-2 text-xs mb-3">
        <span class="px-2.5 py-1 rounded-full bg-brand-sand font-bold text-brand-deep">${regular.length} buổi chính</span>
        ${n('POSTPONED') ? html`<span class="px-2.5 py-1 rounded-full bg-amber-50 font-bold text-amber-700">${n('POSTPONED')} buổi hoãn</span>` : ''}
        ${sessions.length > regular.length ? html`<span class="px-2.5 py-1 rounded-full bg-violet-50 font-bold text-violet-700">${sessions.length - regular.length} buổi bù</span>` : ''}
        ${n('DONE') ? html`<span class="px-2.5 py-1 rounded-full bg-emerald-50 font-bold text-emerald-700">${n('DONE')} đã học</span>` : ''}
      </div>
      ${sessions.length ? html`
        <ul class="space-y-2 max-h-[60vh] overflow-y-auto pr-1" data-testid="session-list">
          ${regular.map(x => sessionRow(x, regular.indexOf(x), sessions))}
          ${sessions.filter(x => x.type === 'MAKEUP').map(x => sessionRow(x, 0, regular.concat(sessions.filter(m => m.type === 'MAKEUP'))))}
        </ul>` : emptyState('Lớp chưa có buổi học nào (lớp tạo theo kiểu cũ)', 'calendar-x')}`;
  };

  const load = async () => {
    try {
      sessions = (await sessionApi.list(c.classId)).sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
      modal.setBody(body());
    } catch (err) {
      modal.setBody(errorState(err));
    }
  };
  const done = () => { changed = true; load(); };
  const find = id => sessions.find(x => String(x.sessionId) === id);

  const modal = openModal({
    title: `Buổi học · ${c.subjectName} ${classCode(c)}`,
    size: 'max-w-3xl',
    body: loading(),
    onClose: () => { if (changed) onChange?.(); },
    actions: {
      postpone: btn => {
        const x = find(btn.dataset.id);
        openFormModal({
          title: `Hoãn buổi ${date(x.startTime)} · ${timeRange(x.startTime, x.endTime)}`,
          fields: html`
            <div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Học viên của lớp nhận thông báo hoãn buổi. Sau đó có thể thêm buổi bù cho buổi này.</div>
            ${field('Lý do hoãn', textarea('reason', '', { rows: 3, required: true, placeholder: 'VD: HLV ốm, phòng bảo trì...' }))}`,
          validate: d => {
            const e = requireFields(d, ['reason']);
            if (String(d.reason || '').length > 500) e.reason = 'Tối đa 500 ký tự';
            return e;
          },
          submitText: 'Hoãn buổi', success: 'Đã hoãn buổi học',
          submit: d => sessionApi.postpone(x.sessionId, d.reason.trim()),
          onDone: done
        });
      },
      substitute: async btn => {
        const x = find(btn.dataset.id);
        const list = (await coachesOfSubject()).filter(k => k.coachId !== x.coachId && (k.status || 'ACTIVE') === 'ACTIVE');
        openFormModal({
          title: `HLV dạy thay buổi ${date(x.startTime)} · ${timeRange(x.startTime, x.endTime)}`,
          fields: html`
            <div class="text-sm text-slate-600">HLV hiện tại: <b>${x.coachName}</b>. Chỉ hiện HLV dạy môn ${c.subjectName}.</div>
            ${field('HLV dạy thay', select('coachId', list.map(k => ({ value: k.coachId, label: coachLabel(k) })), '', { required: true, placeholder: list.length ? 'Chọn HLV' : 'Không có HLV nào khác dạy môn này' }))}
            ${field('Ghi chú', textarea('note', '', { rows: 2, placeholder: 'Tùy chọn, hiện cho học viên' }))}`,
          validate: d => requireFields(d, ['coachId']),
          submitText: 'Gán dạy thay', success: 'Đã gán HLV dạy thay',
          submit: d => sessionApi.substitute(x.sessionId, Number(d.coachId), d.note || undefined),
          onDone: done
        });
      },
      makeup: async btn => {
        const x = find(btn.dataset.id);
        const list = (await coachesOfSubject()).filter(k => (k.status || 'ACTIVE') === 'ACTIVE');
        const tomorrow = isoDate(new Date(Date.now() + 86400000));
        const clock = t => String(t).slice(11, 16);
        openFormModal({
          title: `Thêm buổi bù cho buổi ${date(x.startTime)}`,
          size: 'max-w-xl',
          fields: html`
            <div class="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3">Gói lớp của học viên được tự gia hạn thêm cho buổi bù.</div>
            ${field('Ngày học bù', input('date', { type: 'date', value: tomorrow, required: true, attrs: `min="${isoDate(new Date())}"` }))}
            <div class="grid sm:grid-cols-2 gap-3">
              ${field('Giờ bắt đầu', timeInput('startClock', clock(x.startTime)))}
              ${field('Giờ kết thúc', timeInput('endClock', clock(x.endTime)))}
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              ${field('Phòng', select('roomId', rooms.filter(r => r.status === 'AVAILABLE' || r.roomId === x.roomId).map(r => ({ value: r.roomId, label: r.roomName })), x.roomId, { required: true }))}
              ${field('HLV', select('coachId', list.map(k => ({ value: k.coachId, label: coachLabel(k) })), x.coachId, { required: true }))}
            </div>
            ${field('Ghi chú', textarea('note', '', { rows: 2, placeholder: 'Tùy chọn' }))}`,
          validate: d => {
            const e = requireFields(d, ['date', 'startClock', 'endClock', 'roomId', 'coachId']);
            if (d.startClock && d.endClock && d.endClock <= d.startClock) e.endClock = 'Giờ kết thúc phải sau giờ bắt đầu';
            if (d.date && d.startClock && new Date(`${d.date}T${d.startClock}`) <= new Date()) e.date = 'Buổi bù phải ở tương lai';
            return e;
          },
          submitText: 'Thêm buổi bù', success: 'Đã thêm buổi bù',
          submit: d => sessionApi.makeup(c.classId, {
            postponedSessionId: x.sessionId,
            startTime: `${d.date}T${d.startClock}:00`,
            endTime: `${d.date}T${d.endClock}:00`,
            roomId: Number(d.roomId),
            coachId: Number(d.coachId),
            note: d.note || undefined
          }),
          onDone: done
        });
      }
    }
  });
  load();
  return modal;
}
