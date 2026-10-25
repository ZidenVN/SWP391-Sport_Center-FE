import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, confirmDialog, withBusy, toast, openModal } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { classApi, memberApi, subjectApi } from '../../api/endpoints.js';
import { classCard, isBookable } from '../../components/classCard.js';
import { date, weekday, timeRange, toDate } from '../../core/format.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { classSearchQuery, classFilterBar, classPager, filterByKeyword, classSearchActions } from '../../components/classSearch.js';
import { calendarGrid, calendarToolbar, viewModeTabs, loadCalendarClasses, chipState, scrollTimeGrid } from '../../components/classCalendar.js';

// Lớp học của hội viên: xem dạng lịch Tháng / Tuần hoặc Danh sách (GET /classes/search, FE-TODO #7).
const PAGE_SIZE = 12;
const MODE_KEY = 'sc_member_classes_mode';

// Ngày học phải nằm trong 1 gói đang hiệu lực (gói hiện tại hoặc gói gia hạn nối tiếp) — giống luật của BE
function covered(s, c) {
  const start = toDate(c.startTime);
  return (s.subscriptions || []).some(x => x.status === 'ACTIVE' && toDate(x.startDate) <= start && start <= toDate(x.endDate));
}

function footerFor(s, c, reg) {
  if (reg) {
    return html`
      <span class="mr-auto text-xs font-bold text-emerald-600 flex items-center gap-1">${icon('check-circle-2', 'w-4 h-4')} Đã đăng ký</span>
      <button type="button" class="btn-secondary btn-sm" data-action="cancel-booking" data-id="${reg.registrationId}">Hủy</button>`;
  }
  if (isBookable(c) && !s.current) return html`<a href="#/member/packages" class="btn-secondary btn-sm" data-testid="need-package">${icon('package', 'w-3.5 h-3.5')} Cần mua gói để đặt</a>`;
  if (isBookable(c) && !covered(s, c)) return html`<span class="mr-auto text-xs text-amber-700">Gói hết hạn trước ngày học</span><a href="#/member/packages" class="btn-secondary btn-sm" data-testid="need-renew">Gia hạn</a>`;
  if (isBookable(c)) return html`<button type="button" class="btn-primary btn-sm" data-action="book" data-id="${c.classId}">${icon('plus', 'w-3.5 h-3.5')} Đặt lớp</button>`;
  return html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`;
}

const myRegistrations = s => new Map(s.registrations.filter(r => r.status === 'REGISTERED').map(r => [r.classId, r]));

function subjectSelect(s) {
  return html`
    <select class="input sm:w-56" name="subject" data-action="subject" data-testid="cal-subject">
      <option value="">Tất cả bộ môn</option>
      ${s.subjects.map(x => html`<option value="${x.subjectId}" ${String(x.subjectId) === String(s.subjectId) ? 'selected' : ''}>${x.subjectName}</option>`)}
    </select>`;
}

function listView(s) {
  const mine = myRegistrations(s);
  const list = filterByKeyword(s.page?.content || [], s.keyword);
  return html`
    ${classFilterBar(s)}
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => classCard(c, footerFor(s, c, mine.get(c.classId))))}
      </div>
      ${classPager(s.page)}` : emptyState(s.keyword?.trim() ? 'Không có lớp phù hợp từ khóa trong trang này' : 'Không có lớp nào trong tuần này, thử tuần sau hoặc đổi bộ môn', 'calendar-x')}`;
}

function calendarView(s) {
  const mine = myRegistrations(s);
  return html`
    ${calendarToolbar(s)}
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      ${subjectSelect(s)}
      <span class="text-sm text-slate-500" data-testid="cal-summary">${s.calClasses.length} lớp · ${s.calClasses.filter(c => mine.has(c.classId)).length} lớp bạn đã đăng ký</span>
    </div>
    ${calendarGrid(s, s.calClasses, { stateOf: c => chipState(c, mine, isBookable) })}`;
}

function view(s) {
  return html`
    ${pageHeader('Lớp học', 'Chọn lớp phù hợp và đặt chỗ chỉ với một cú nhấp', viewModeTabs(s.mode))}
    ${!s.current ? html`
      <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3">
        ${icon('alert-circle', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Bạn cần có gói tập còn hiệu lực để đặt lớp.</span>
        <a href="#/member/packages" class="btn-primary btn-sm">Mua gói</a>
      </div>` : expiryBanner(s.current)}
    ${s.mode === 'list' ? listView(s) : calendarView(s)}`;
}

// Chi tiết 1 lớp (bấm thẻ trên lịch) hoặc danh sách lớp của 1 ngày
function classDetail(s, c, mine) {
  const reg = mine.get(c.classId);
  const st = chipState(c, mine, isBookable);
  return html`
    <div class="rounded-2xl border border-brand-line p-4" data-testid="cal-detail" data-class-id="${c.classId}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${c.subjectName}</div>
          <div class="text-sm text-slate-500">${weekday(c.startTime)}, ${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${st === 'registered' ? 'bg-brand-dark text-brand-lime' : st === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
          ${st === 'registered' ? 'Đã đăng ký' : st === 'open' ? `Còn ${c.availableSeats} chỗ` : c.availableSeats <= 0 ? 'Hết chỗ' : 'Không nhận đăng ký'}</span>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div class="flex items-center gap-2 text-slate-600">${icon('user-round', 'w-4 h-4 text-slate-400')} <button type="button" class="font-semibold hover:underline" data-action="coach-info" data-coach-id="${c.coachId}" data-coach-name="${c.coachName}">${c.coachName}</button></div>
        <div class="flex items-center gap-2 text-slate-600">${icon('map-pin', 'w-4 h-4 text-slate-400')} ${c.roomName}</div>
        <div class="flex items-center gap-2 text-slate-600">${icon('users', 'w-4 h-4 text-slate-400')} ${c.currentEnrolled}/${c.maxCapacity} học viên</div>
      </div>
      <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">${footerFor(s, c, reg)}</div>
    </div>`;
}

function openClassModal(ctx, classes, title) {
  const s = ctx.state;
  const mine = myRegistrations(s);
  const modal = openModal({
    title,
    size: 'max-w-xl',
    body: html`<div class="space-y-3 max-h-[70vh] overflow-y-auto">${classes.map(c => classDetail(s, c, mine))}</div>`,
    actions: {
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      book: async btn => { if (await bookClass(btn, ctx)) modal.close(); },
      'cancel-booking': async btn => { if (await cancelBooking(btn, ctx)) modal.close(); }
    }
  });
}

async function bookClass(btn, ctx) {
  const s = ctx.state;
  const c = [...(s.page?.content || []), ...(s.calClasses || [])].find(x => String(x.classId) === btn.dataset.id);
  const ok = await confirmDialog(`Đặt lớp ${c.subjectName}\n${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName}`, { title: 'Xác nhận đặt lớp', confirmText: 'Đặt lớp' });
  if (!ok) return false;
  const res = await withBusy(btn, () => memberApi.register(c.classId));
  if (!res) return false;
  toast(`Đã đặt lớp ${c.subjectName}`);
  ctx.reload();
  return true;
}

async function cancelBooking(btn, ctx) {
  const ok = await confirmDialog('Bạn chắc chắn muốn hủy đăng ký lớp này?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true });
  if (!ok) return false;
  const res = await withBusy(btn, () => memberApi.cancel(btn.dataset.id));
  if (!res) return false;
  toast('Đã hủy đăng ký lớp');
  ctx.reload();
  return true;
}

const savedMode = () => { try { return localStorage.getItem(MODE_KEY); } catch { return null; } };

export default function MemberClasses(el, { query } = {}) {
  return mountPage(el, {
    // ?subject=<tên môn> từ trang giới thiệu -> lọc sẵn bộ môn (đổi tên ra id sau khi tải danh sách môn)
    state: {
      mode: ['week', 'month', 'list'].includes(savedMode()) ? savedMode() : 'week',
      calOffset: 0,
      calClasses: [],
      keyword: '', subjectId: '', subjectName: query?.subject || '', showAll: false, week: 0, pageNo: 0, subjects: []
    },
    load: async ctx => {
      const s = ctx.state;
      if (!s.subjects.length) {
        s.subjects = (await subjectApi.list().catch(() => [])).filter(x => x.status !== 'INACTIVE');
        if (s.subjectName && !s.subjectId) s.subjectId = s.subjects.find(x => x.subjectName === s.subjectName)?.subjectId || '';
      }
      const res = await settle({
        page: [() => (s.mode === 'list' ? classApi.search(classSearchQuery(s, PAGE_SIZE)) : null), null],
        calClasses: [() => (s.mode === 'list' ? [] : loadCalendarClasses(s)), null],
        registrations: [memberApi.registrations, []],
        current: [memberApi.currentSubscription, null],
        subscriptions: [memberApi.subscriptions, []]
      });
      if (res.pageError) throw res.pageError;
      if (res.calClassesError) throw res.calClassesError;
      return res;
    },
    view,
    afterRender: (s, ctx) => scrollTimeGrid(ctx.el),
    actions: {
      ...classSearchActions,
      'view-mode': (t, e, ctx) => {
        const mode = t.dataset.mode;
        if (mode === ctx.state.mode) return;
        try { localStorage.setItem(MODE_KEY, mode); } catch { /* bỏ qua */ }
        ctx.state.mode = mode;
        ctx.state.calOffset = 0;
        ctx.state.pageNo = 0;
        ctx.reload();
      },
      'cal-nav': (t, e, ctx) => {
        const d = Number(t.dataset.delta);
        ctx.state.calOffset = d === 0 ? 0 : ctx.state.calOffset + d;
        ctx.reload();
      },
      'cal-class': (t, e, ctx) => {
        const c = ctx.state.calClasses.find(x => String(x.classId) === t.dataset.id);
        if (c) openClassModal(ctx, [c], 'Chi tiết lớp học');
      },
      'cal-day': (t, e, ctx) => {
        const list = ctx.state.calClasses
          .filter(c => toDate(c.startTime).toDateString() === new Date(`${t.dataset.date}T00:00:00`).toDateString())
          .sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
        if (list.length) openClassModal(ctx, list, `Lớp ngày ${date(list[0].startTime)}`);
      },
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      book: (btn, e, ctx) => bookClass(btn, ctx),
      'cancel-booking': (btn, e, ctx) => cancelBooking(btn, ctx)
    }
  });
}
