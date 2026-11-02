import { html, icon } from '../../core/dom.js';
import { tabs, table, emptyState, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { coachApi } from '../../api/endpoints.js';
import { badge, date, dateTime, weekday, timeRange, fullName, genderLabel, toDate, phoneText } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { planList } from '../../components/training.js';
import { openPlanForm, openNotifyForm } from '../../components/coachForms.js';
import { subjectColor, classImage } from '../../components/classCard.js';

const ATTENDANCE = [
  { id: 'PRESENT', label: 'Có mặt', on: 'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600' },
  { id: 'LATE', label: 'Muộn', on: 'peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500' },
  { id: 'ON_LEAVE', label: 'Có phép', on: 'peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500' },
  { id: 'ABSENT', label: 'Vắng', on: 'peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-600' }
];

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

function hero(c) {
  const pct = c.maxCapacity ? Math.round((c.currentEnrolled / c.maxCapacity) * 100) : 0;
  return html`
    <a href="#/coach/schedule" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-3">${icon('arrow-left', 'w-4 h-4')} Lịch dạy</a>
    <div class="rounded-3xl p-6 pt-24 sm:pt-28 bg-gradient-to-br ${subjectColor(c.subjectName)} text-white mb-6 relative overflow-hidden" data-testid="class-hero">
      <!-- ảnh lớp (imageUrl từ GET /coaches/me/schedules, null -> ảnh mặc định theo môn) -->
      <div class="absolute inset-0">${classImage(c)}</div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
      <div class="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div class="text-xs font-bold uppercase tracking-widest opacity-80">${weekday(c.startTime)} · ${date(c.startTime)}</div>
          <h1 class="text-2xl font-extrabold mt-1">${c.subjectName}</h1>
          <div class="text-sm opacity-90 mt-1 flex flex-wrap gap-x-4">
            <span class="flex items-center gap-1">${icon('clock', 'w-4 h-4')} ${timeRange(c.startTime, c.endTime)}</span>
            <span class="flex items-center gap-1">${icon('map-pin', 'w-4 h-4')} ${c.roomName}</span>
          </div>
        </div>
        <div class="md:w-80">
          <div class="flex justify-between text-xs opacity-90 mb-1"><span>Sĩ số</span><b>${c.currentEnrolled}/${c.maxCapacity}</b></div>
          <div class="h-2 rounded-full bg-white/25 overflow-hidden"><div class="h-full bg-white" style="width:${pct}%"></div></div>
          <div class="flex gap-2 mt-4">
            <button type="button" class="btn btn-sm whitespace-nowrap bg-white text-slate-900 hover:bg-white/90" data-action="new-plan">${icon('clipboard-plus', 'w-3.5 h-3.5')} Giao giáo án</button>
            <button type="button" class="btn btn-sm whitespace-nowrap bg-white/20 text-white hover:bg-white/30" data-action="notify-class">${icon('send', 'w-3.5 h-3.5')} Thông báo</button>
          </div>
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

// dải chọn buổi: mỗi buổi 1 nút, buổi đang chọn tô đậm, buổi hoãn / bù có nhãn
function sessionPicker(s) {
  return html`
    <div class="mb-4" data-testid="session-picker">
      <div class="text-xs font-bold text-slate-500 mb-2">Chọn buổi (${s.sessions.length} buổi)</div>
      <div class="flex gap-2 overflow-x-auto pb-1">
        ${s.sessions.map((x, i) => {
          const on = x.sessionId === s.session?.sessionId;
          const past = toDate(x.endTime) < new Date();
          return html`
            <button type="button" data-action="pick-session" data-id="${x.sessionId}"
              class="shrink-0 rounded-2xl border px-3 py-2 text-left text-xs transition ${on ? 'border-brand-dark bg-brand-dark text-white' : 'border-brand-line bg-white/70 hover:border-[#469B7E]'} ${x.status === 'POSTPONED' ? 'opacity-70' : ''}">
              <span class="block font-bold">Buổi ${i + 1} · ${weekday(x.startTime)} ${date(x.startTime).slice(0, 5)}</span>
              <span class="block ${on ? 'text-white/80' : 'text-slate-500'}">${timeRange(x.startTime, x.endTime)}${x.status === 'POSTPONED' ? ' · Hoãn' : x.type === 'MAKEUP' ? ' · Bù' : past ? ' · Đã qua' : ''}</span>
            </button>`;
        })}
      </div>
    </div>`;
}

function attendanceTab(s) {
  if (!s.sessions.length) return emptyState('Lớp chưa có buổi nào bạn dạy', 'calendar-x');
  if (!s.sessionRoster.length) return html`${sessionPicker(s)}${emptyState('Buổi này chưa có học viên để điểm danh', 'clipboard-check')}`;
  const marked = Object.fromEntries(s.attendances.map(a => [a.memberId, a]));
  const win = attendanceWindow(s.session);
  return html`
    ${sessionPicker(s)}
    ${!win.open ? html`
      <div class="mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 flex gap-2" data-testid="attendance-closed">
        ${icon('clock', 'w-4 h-4 shrink-0 mt-0.5')} ${win.reason}
      </div>` : win.closesAt ? html`
      <div class="mb-4 text-xs text-slate-500 flex items-center gap-1.5">${icon('clock', 'w-3.5 h-3.5')} Điểm danh được tới ${dateTime(win.closesAt)}</div>` : ''}
    <form class="card" data-action="save-attendance" data-testid="attendance-form" novalidate>
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div class="text-sm text-slate-600">
          ${s.attendances.length ? html`Đã điểm danh <b>${s.attendances.length}</b>/${s.sessionRoster.length} học viên` : 'Chưa điểm danh buổi này'}
          <div class="text-xs text-slate-400">${weekday(s.session.startTime)} ${date(s.session.startTime)} · ${timeRange(s.session.startTime, s.session.endTime)}${s.session.substitute ? ` · bạn dạy thay ${s.session.mainCoachName || ''}` : ''}</div>
        </div>
        <button type="button" class="btn-secondary btn-sm" data-action="all-present">${icon('check-check', 'w-3.5 h-3.5')} Tất cả có mặt</button>
      </div>
      <div class="divide-y divide-slate-100">
        ${s.sessionRoster.map(m => {
          const cur = marked[m.memberId]?.status || 'PRESENT';
          return html`
            <div class="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3" data-testid="attendance-row">
              <div class="flex items-center gap-3 lg:w-64 shrink-0">
                ${memberAvatar(m, 'w-9 h-9 text-sm')}
                <div class="min-w-0"><div class="font-semibold truncate">${fullName(m)}</div><div class="text-xs text-slate-500">${phoneText(m.phone)}</div></div>
              </div>
              <div class="flex flex-wrap gap-2" role="radiogroup">
                ${ATTENDANCE.map(a => html`
                  <label class="cursor-pointer">
                    <input type="radio" class="peer sr-only" name="status-${m.memberId}" value="${a.id}" ${cur === a.id ? 'checked' : ''} />
                    <span class="inline-block px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:border-slate-300 ${a.on}">${a.label}</span>
                  </label>`)}
              </div>
              <input class="input lg:flex-1" name="note-${m.memberId}" placeholder="Ghi chú (tùy chọn)" value="${marked[m.memberId]?.note || ''}" />
            </div>`;
        })}
      </div>
      <div class="flex justify-end px-5 py-4 border-t border-slate-100">
        <button type="submit" class="btn-primary" data-testid="attendance-submit" ${win.open ? '' : 'disabled'}>${icon('save', 'w-4 h-4')} Lưu điểm danh</button>
      </div>
    </form>
    ${s.attendances.length ? html`
      <div class="card mt-5" data-testid="attendance-result">
        <div class="px-5 py-4 font-bold border-b border-slate-100">Kết quả đã lưu</div>
        ${table({
          columns: [{ label: 'Học viên' }, { label: 'Trạng thái' }, { label: 'Ghi chú' }, { label: 'Lúc ghi nhận' }],
          rows: s.attendances.map(a => [a.memberName, badge(a.status), a.note || '—', dateTime(a.markedAt)])
        })}
      </div>` : ''}`;
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
    ${hero(s.session || s.cls)}
    ${tabs([
      { id: 'roster', label: 'Học viên', count: s.roster.length },
      { id: 'attendance', label: 'Điểm danh' },
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
    state: { tab: query?.tab || (query?.session ? 'attendance' : 'roster'), sessionId: query?.session || null },
    load: async ctx => {
      const data = await settle({
        schedules: [() => coachApi.schedules(), []],
        roster: [() => coachApi.roster(classId), []],
        plans: [() => coachApi.classPlans(classId), []],
        notifications: [() => coachApi.classNotifications(classId), []]
      });
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
        preset: { targetType: 'CLASS', targetId: classId, label: `lớp ${ctx.state.cls.subjectName}` },
        onDone: () => { ctx.state.tab = 'plans'; ctx.reload(); }
      }),
      'notify-class': (t, e, ctx) => openNotifyForm({
        title: `Gửi thông báo cho lớp ${ctx.state.cls.subjectName}`,
        send: payload => coachApi.notifyClass(classId, payload),
        onDone: () => { ctx.state.tab = 'notifications'; ctx.reload(); }
      })
    }
  });
}
