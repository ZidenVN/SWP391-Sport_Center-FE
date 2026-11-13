import { html, icon } from '../../core/dom.js';
import { tabs, table, emptyState, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { coachApi, classApi } from '../../api/endpoints.js';
import { badge, date, dateTime, weekday, timeRange, fullName, genderLabel, toDate, phoneText, isoDate, classCode } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { planList } from '../../components/training.js';
import { openPlanForm, openNotifyForm } from '../../components/coachForms.js';
import { subjectColor, classImage } from '../../components/classCard.js';
import { courseOf, courseInline } from '../../components/courseSchedule.js';

const ATTENDANCE = [
  { id: 'PRESENT', label: 'Có mặt', on: 'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600' },
  { id: 'ABSENT', label: 'Vắng', on: 'peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-600' }
];
// chỉ điểm danh Có mặt / Vắng; bản ghi cũ "Muộn" tính là có mặt, "Có phép" tính là vắng
const attendanceChoice = status => (status === 'LATE' ? 'PRESENT' : status === 'ON_LEAVE' ? 'ABSENT' : status || 'PRESENT');

// Điểm danh theo TỪNG BUỔI (sessionId lấy từ GET /coaches/me/schedules).
// Khung giờ giống BE (app.attendance.*): mở trước giờ học 15 phút, đóng sau giờ kết thúc 24 giờ; buổi hoãn / hủy thì không
const ATTENDANCE_OPEN_MINUTES_BEFORE = 15;
const ATTENDANCE_CLOSE_HOURS_AFTER = 24;
function attendanceWindow(c, now = new Date()) {
  if (!c) return { open: false, reason: 'Chọn buổi học để điểm danh.' };
  if (c.status === 'POSTPONED') return { open: false, reason: 'Buổi này đã bị hoãn, không điểm danh.' };
  if (c.status === 'CANCELLED' || c.classStatus === 'CANCELLED') return { open: false, reason: 'Buổi / lớp đã bị hủy, không thể điểm danh.' };
  if (c.classStatus === 'STOPPED') return { open: false, reason: 'Lớp đã dừng, không thể điểm danh.' };
  const opensAt = new Date(toDate(c.startTime).getTime() - ATTENDANCE_OPEN_MINUTES_BEFORE * 60000);
  const closesAt = new Date(toDate(c.endTime).getTime() + ATTENDANCE_CLOSE_HOURS_AFTER * 3600000);
  if (now < opensAt) return { open: false, reason: `Chưa tới giờ điểm danh — mở lúc ${dateTime(opensAt)} (trước giờ học ${ATTENDANCE_OPEN_MINUTES_BEFORE} phút).` };
  if (now > closesAt) return { open: false, reason: `Đã quá thời gian điểm danh (đóng ${ATTENDANCE_CLOSE_HOURS_AFTER} giờ sau khi lớp kết thúc, lúc ${dateTime(closesAt)}).` };
  return { open: true, closesAt };
}

// Đầu trang: ảnh nhỏ (không đè chữ lên ảnh), tên + mã lớp, 1 dòng lịch cả khóa + phòng, bên phải là sĩ số và nút
function hero(c, s) {
  const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
  const course = courseOf(s.info, s.sessions.map(x => x.startTime));
  return html`
    <a href="#/coach/schedule" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-3">${icon('arrow-left', 'w-4 h-4')} Lịch dạy</a>
    <div class="card p-5 mb-5 flex flex-col lg:flex-row lg:items-center gap-5" data-testid="class-hero">
      <!-- ảnh lớp (imageUrl từ GET /coaches/me/schedules, null -> ảnh mặc định theo môn) -->
      <div class="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br ${subjectColor(c.subjectName)}">${classImage(c)}</div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="font-display text-3xl font-extrabold text-brand-dark leading-none">${c.subjectName}</h1>
          <span class="px-2.5 py-1 rounded-full bg-brand-sand text-brand-deep text-xs font-bold" data-testid="class-code">${classCode(c)}</span>
          ${s.info?.status ? badge(s.info.status) : ''}
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          ${courseInline(s.info || c, { course })}
          ${s.sessions.length ? html`<span>${s.sessions.length} buổi</span>` : ''}
          <span class="flex items-center gap-1">${icon('map-pin', 'w-4 h-4')} ${c.roomName}</span>
        </div>
      </div>
      <div class="lg:w-72 shrink-0">
        <div class="flex justify-between text-xs text-slate-500 mb-1"><span>Sĩ số</span><b class="text-slate-900">${c.currentEnrolled}/${c.maxCapacity}</b></div>
        <div class="h-2 rounded-full bg-brand-sand overflow-hidden"><div class="h-full bg-[#1E9E64]" style="width:${pct}%"></div></div>
        <div class="flex gap-2 mt-3">
          <button type="button" class="btn-secondary btn-sm whitespace-nowrap" data-action="new-plan">${icon('clipboard-plus', 'w-3.5 h-3.5')} Giao giáo án</button>
          <button type="button" class="btn-primary btn-sm whitespace-nowrap" data-action="notify-class">${icon('send', 'w-3.5 h-3.5')} Thông báo</button>
        </div>
      </div>
    </div>`;
}

function rosterTab(s) {
  if (!s.roster.length) return emptyState('Lớp chưa có học viên đăng ký', 'users');
  return html`
    <div class="card" data-testid="roster">
      ${table({
        columns: [{ label: 'Học viên' }, { label: 'Liên hệ' }, { label: 'Mục tiêu tập luyện' }, { label: 'Đăng ký' }, { label: '', cls: 'text-right' }],
        rows: s.roster.map(m => [
          html`<div class="flex items-center gap-3">${memberAvatar(m, 'w-9 h-9 text-sm')}<div><div class="font-semibold">${fullName(m)}</div><div class="text-xs text-slate-500">${genderLabel(m.gender)}</div></div></div>`,
          html`<div class="text-sm">${phoneText(m.phone)}</div><div class="text-xs text-slate-500">${m.email}</div>`,
          html`<span class="text-sm text-slate-600">${m.trainingGoal || '—'}</span>`,
          html`<span class="text-xs text-slate-500">${date(m.enrolledDate)}</span>`,
          html`<a href="#/coach/members/${m.memberId}" class="btn-ghost btn-sm">Hồ sơ ${icon('chevron-right', 'w-3.5 h-3.5')}</a>`
        ])
      })}
    </div>`;
}

// nhãn trạng thái của 1 buổi trong cột chọn buổi
function sessionTag(x) {
  if (x.status === 'POSTPONED') return ['Hoãn', 'bg-amber-100 text-amber-700'];
  if (x.type === 'MAKEUP') return ['Buổi bù', 'bg-sky-100 text-sky-700'];
  const start = toDate(x.startTime), end = toDate(x.endTime), now = new Date();
  if (start.toDateString() === now.toDateString()) return ['Hôm nay', 'bg-brand-lime text-brand-dark'];
  return end < now ? ['Đã qua', 'bg-brand-sand text-slate-500'] : ['Sắp tới', 'bg-brand-sand text-slate-600'];
}

// cột chọn buổi: số buổi to, ngày + giờ, nhãn trạng thái; buổi đang chọn có viền xanh
function sessionPicker(s) {
  return html`
    <div data-testid="session-picker">
      <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Buổi học (${s.sessions.length})</div>
      <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:max-h-[640px] lg:overflow-y-auto pb-1 lg:pr-1">
        ${s.sessions.map((x, i) => {
          const on = x.sessionId === s.session?.sessionId;
          const [tag, tagCls] = sessionTag(x);
          return html`
            <button type="button" data-action="pick-session" data-id="${x.sessionId}" aria-pressed="${on}"
              class="shrink-0 lg:w-full flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 text-left transition ${on ? 'border-[#1E9E64] ring-1 ring-[#1E9E64]' : 'border-brand-line hover:border-[#1E9E64]/60'} ${x.status === 'POSTPONED' ? 'opacity-70' : ''}">
              <span class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-display text-xl font-extrabold ${on ? 'bg-brand-dark text-brand-lime' : 'bg-brand-sand text-brand-dark'}">${i + 1}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-bold whitespace-nowrap">${weekday(x.startTime)} · ${date(x.startTime).slice(0, 5)}</span>
                <span class="block text-xs text-slate-500 whitespace-nowrap">${timeRange(x.startTime, x.endTime)}</span>
              </span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tagCls}">${tag}</span>
            </button>`;
        })}
      </div>
    </div>`;
}

// Khung điểm danh của buổi đang chọn: thông báo giờ mở/đóng, đếm nhanh, bảng học viên thẳng cột, nút lưu ở cuối
function attendancePanel(s) {
  if (!s.sessionRoster.length) return emptyState('Buổi này chưa có học viên để điểm danh', 'clipboard-check');
  const marked = Object.fromEntries(s.attendances.map(a => [a.memberId, a]));
  const win = attendanceWindow(s.session);
  const idx = s.sessions.findIndex(x => x.sessionId === s.session.sessionId) + 1;
  const present = s.attendances.filter(a => attendanceChoice(a.status) === 'PRESENT').length;
  const absent = s.attendances.length - present;
  const lastMarked = s.attendances.map(a => a.markedAt).filter(Boolean).sort().at(-1);
  return html`
    <form class="card overflow-hidden" data-action="save-attendance" data-testid="attendance-form" novalidate>
      <div class="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">Điểm danh · Buổi ${idx}</div>
          <div class="text-sm text-slate-500">${weekday(s.session.startTime)}, ${date(s.session.startTime)} · ${timeRange(s.session.startTime, s.session.endTime)} · ${s.session.roomName}${s.session.substitute ? ` · bạn dạy thay ${s.session.mainCoachName || ''}` : ''}</div>
        </div>
        <button type="button" class="btn-secondary btn-sm" data-action="all-present" ${win.open ? '' : 'disabled'}>${icon('check-check', 'w-3.5 h-3.5')} Tất cả có mặt</button>
      </div>
      <div class="px-5 pb-4 space-y-3">
        ${win.open
          ? html`<div class="rounded-xl bg-emerald-50 text-emerald-800 text-sm px-3 py-2 flex items-center gap-2" data-testid="attendance-open">${icon('circle-check', 'w-4 h-4 shrink-0')} Đang mở điểm danh · sửa được tới ${dateTime(win.closesAt)}</div>`
          : html`<div class="rounded-xl bg-amber-50 text-amber-800 text-sm px-3 py-2 flex items-center gap-2" data-testid="attendance-closed">${icon('clock', 'w-4 h-4 shrink-0')} ${win.reason}</div>`}
        <div class="flex flex-wrap gap-2 text-xs font-bold" data-testid="attendance-summary">
          <span class="px-2.5 py-1 rounded-full bg-emerald-600 text-white">Có mặt ${present}</span>
          <span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">Vắng ${absent}</span>
          <span class="px-2.5 py-1 rounded-full bg-brand-sand text-slate-600">Chưa điểm danh ${s.sessionRoster.length - s.attendances.length}</span>
        </div>
      </div>
      <div class="hidden lg:flex items-center gap-4 px-5 py-2 bg-brand-cream text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <span class="flex-1">Học viên</span><span class="w-[168px]">Trạng thái</span><span class="w-56">Ghi chú</span>
      </div>
      <div class="divide-y divide-slate-100">
        ${s.sessionRoster.map(m => {
          const cur = attendanceChoice(marked[m.memberId]?.status);
          return html`
            <div class="px-5 py-3.5 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4" data-testid="attendance-row">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                ${memberAvatar(m, 'w-10 h-10 text-sm')}
                <div class="min-w-0">
                  <div class="font-semibold truncate">${fullName(m)}</div>
                  <div class="text-xs text-slate-500 truncate">${phoneText(m.phone)}${m.trainingGoal && m.trainingGoal !== 'Chưa cập nhật' ? ` · Mục tiêu: ${m.trainingGoal}` : ''}</div>
                </div>
              </div>
              <div class="inline-flex w-fit lg:w-[168px] gap-1 p-1 rounded-full bg-brand-sand" role="radiogroup">
                ${ATTENDANCE.map(a => html`
                  <label class="cursor-pointer flex-1">
                    <input type="radio" class="peer sr-only" name="status-${m.memberId}" value="${a.id}" ${cur === a.id ? 'checked' : ''} ${win.open ? '' : 'disabled'} />
                    <span class="block text-center px-3 py-1.5 rounded-full border border-transparent text-xs font-bold text-slate-500 ${a.on}">${a.label}</span>
                  </label>`)}
              </div>
              <input class="input lg:w-56 !py-1.5" name="note-${m.memberId}" placeholder="Ghi chú (tùy chọn)" value="${marked[m.memberId]?.note || ''}" ${win.open ? '' : 'disabled'} />
            </div>`;
        })}
      </div>
      <div class="flex flex-wrap items-center justify-end gap-3 px-5 py-4 bg-brand-cream">
        <span class="text-xs text-slate-500">${lastMarked ? `Đã lưu lúc ${dateTime(lastMarked)}` : 'Chưa lưu điểm danh buổi này'}</span>
        <button type="submit" class="btn-primary" data-testid="attendance-submit" ${win.open ? '' : 'disabled'}>${icon('save', 'w-4 h-4')} Lưu điểm danh</button>
      </div>
    </form>`;
}

function attendanceTab(s) {
  if (!s.sessions.length) return emptyState('Lớp chưa có buổi nào bạn dạy', 'calendar-x');
  return html`
    <div class="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
      ${sessionPicker(s)}
      <div>${attendancePanel(s)}</div>
    </div>`;
}

function notificationsTab(s) {
  if (!s.notifications.length) return emptyState('Chưa gửi thông báo nào cho lớp này', 'bell-off');
  const sorted = [...s.notifications].sort((a, b) => String(b.sendDate).localeCompare(String(a.sendDate)));
  return html`
    <div class="space-y-3" data-testid="class-notifications">
      ${sorted.map(n => html`
        <div class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="font-bold">${n.title}</div>
            <span class="text-xs text-slate-400 whitespace-nowrap">${dateTime(n.sendDate)}</span>
          </div>
          <p class="text-sm text-slate-600 mt-1 whitespace-pre-line">${n.content}</p>
        </div>`)}
    </div>`;
}

function view(s) {
  if (!s.cls) return emptyState('Không tìm thấy lớp hoặc bạn không phụ trách lớp này', 'calendar-x');
  const body = {
    roster: () => rosterTab(s),
    attendance: () => attendanceTab(s),
    plans: () => planList(s.plans, { emptyText: 'Chưa giao giáo án nào cho lớp' }),
    notifications: () => notificationsTab(s)
  }[s.tab]();
  return html`
    ${hero(s.session || s.cls, s)}
    ${tabs([
      { id: 'attendance', label: 'Điểm danh' },
      { id: 'roster', label: 'Học viên', count: s.roster.length },
      { id: 'plans', label: 'Giáo án lớp', count: s.plans.length },
      { id: 'notifications', label: 'Thông báo', count: s.notifications.length }
    ], s.tab)}
    ${body}`;
}

// buổi mặc định: buổi đang trong giờ điểm danh, không thì buổi sắp tới gần nhất, không nữa thì buổi gần nhất đã qua
function defaultSession(sessions, wanted) {
  const byId = sessions.find(x => String(x.sessionId) === String(wanted));
  if (byId) return byId;
  const live = sessions.filter(x => x.status !== 'POSTPONED' && x.status !== 'CANCELLED');
  return live.find(x => attendanceWindow(x).open) || live.find(x => toDate(x.endTime) >= new Date()) || live[live.length - 1] || sessions[0] || null;
}

async function loadSession(sessionId, fallbackAttendances = []) {
  const data = await settle({
    sessionRoster: [() => coachApi.sessionRoster(sessionId), []],
    attendances: [() => coachApi.attendances(sessionId), fallbackAttendances]
  });
  return data;
}

export default function CoachClassDetail(el, { params, query }) {
  const classId = Number(params.id);
  return mountPage(el, {
    // điểm danh là việc coach làm mỗi buổi nên mở tab này trước
    state: { tab: query?.tab || 'attendance', sessionId: query?.session || null },
    load: async ctx => {
      const data = await settle({
        info: [() => classApi.get(classId), null],
        roster: [() => coachApi.roster(classId), []],
        plans: [() => coachApi.classPlans(classId), []],
        notifications: [() => coachApi.classNotifications(classId), []]
      });
      // Lịch dạy mặc định chỉ có hôm qua -> 30 ngày tới: lấy theo đúng thời gian của lớp để xem được lớp đã kết thúc
      // và các buổi đã qua (+30 ngày sau ngày kết thúc cho buổi học bù)
      const range = data.info?.startDate && data.info?.endDate
        ? { from: data.info.startDate, to: isoDate(new Date(toDate(`${data.info.endDate}T00:00:00`).getTime() + 30 * 86400000)) }
        : undefined;
      data.schedules = await coachApi.schedules(range).catch(() => []);
      const sessions = data.schedules.filter(c => c.classId === classId).sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
      const session = defaultSession(sessions, ctx.state.sessionId);
      const sessionData = session ? await loadSession(session.sessionId, ctx.state.attendances || []) : { sessionRoster: [], attendances: [] };
      return { ...data, ...sessionData, sessions, session, sessionId: session?.sessionId ?? null, cls: sessions[0] || null };
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'pick-session': async (t, e, ctx) => {
        const session = ctx.state.sessions.find(x => String(x.sessionId) === t.dataset.id);
        if (!session || session.sessionId === ctx.state.session?.sessionId) return;
        ctx.set({ session, sessionId: session.sessionId, sessionRoster: [], attendances: [] });
        ctx.set(await loadSession(session.sessionId));
      },
      'all-present': (t, e, ctx) => {
        ctx.el.querySelectorAll('input[type=radio][value=PRESENT]').forEach(r => { r.checked = true; });
      },
      'save-attendance': async (form, e, ctx) => {
        const fd = new FormData(form);
        const records = ctx.state.sessionRoster.map(m => ({
          memberId: m.memberId,
          status: fd.get(`status-${m.memberId}`) || 'PRESENT',
          note: (fd.get(`note-${m.memberId}`) || '').trim() || null
        }));
        const saved = await withBusy(form, () => coachApi.takeAttendance(ctx.state.session.sessionId, records));
        if (saved) {
          toast(`Đã lưu điểm danh ${saved.length} học viên`);
          ctx.state.attendances = saved;
          ctx.reload();
        }
      },
      'new-plan': (t, e, ctx) => openPlanForm({
        preset: { targetType: 'CLASS', targetId: classId, label: `lớp ${ctx.state.cls.subjectName} ${classCode(ctx.state.cls)}` },
        onDone: () => { ctx.state.tab = 'plans'; ctx.reload(); }
      }),
      'notify-class': (t, e, ctx) => openNotifyForm({
        title: `Gửi thông báo cho lớp ${ctx.state.cls.subjectName} ${classCode(ctx.state.cls)}`,
        send: payload => coachApi.notifyClass(classId, payload),
        onDone: () => { ctx.state.tab = 'notifications'; ctx.reload(); }
      })
    }
  });
}
