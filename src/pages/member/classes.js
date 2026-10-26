import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, confirmDialog, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { classApi, memberApi, subjectApi } from '../../api/endpoints.js';
import { isBookable } from '../../components/classCard.js';
import { classPhotoCard, openClassDetail } from '../../components/classPhotoCard.js';
import { date, timeRange, toDate } from '../../core/format.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { expiryBanner } from '../../components/memberAlerts.js';
import { classSearchQuery, classFilterBar, classPager, filterByKeyword, classSearchActions } from '../../components/classSearch.js';

// Tìm & đặt lớp qua GET /classes/search (lọc + phân trang ở BE, FE-TODO #7): xem theo tuần, lọc bộ môn, chỉ lớp còn chỗ.
// Lịch các buổi đã đăng ký nằm ở mục "Lịch tập của tôi".
const PAGE_SIZE = 12;

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
  if (isBookable(c)) return html`<button type="button" class="btn-primary w-full sm:w-auto justify-center" data-action="book" data-id="${c.classId}" data-testid="detail-book">${icon('plus', 'w-4 h-4')} Đặt lớp này</button>`;
  return html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`;
}

function view(s) {
  const mine = new Map(s.registrations.filter(r => r.status === 'REGISTERED').map(r => [r.classId, r]));
  const list = filterByKeyword(s.page?.content || [], s.keyword);
  return html`
    ${pageHeader('Lớp học', 'Chọn lớp phù hợp và đặt chỗ chỉ với một cú nhấp',
      html`<a href="#/member/schedule" class="btn-secondary" data-testid="to-schedule">${icon('calendar-days', 'w-4 h-4')} Lịch tập của tôi</a>`)}
    ${!s.current ? html`
      <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3">
        ${icon('alert-circle', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Bạn cần có gói tập còn hiệu lực để đặt lớp.</span>
        <a href="#/member/packages" class="btn-primary btn-sm">Mua gói</a>
      </div>` : expiryBanner(s.current)}
    ${classFilterBar(s)}
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => classPhotoCard(c, { registered: mine.has(c.classId) }))}
      </div>
      ${classPager(s.page)}` : emptyState(s.keyword?.trim() ? 'Không có lớp phù hợp từ khóa trong trang này' : 'Không có lớp nào trong tuần này, thử tuần sau hoặc đổi bộ môn', 'calendar-x')}`;
}

export default function MemberClasses(el, { query } = {}) {
  return mountPage(el, {
    // ?subject=<tên môn> từ trang giới thiệu -> lọc sẵn bộ môn (đổi tên ra id sau khi tải danh sách môn)
    state: { keyword: '', subjectId: '', subjectName: query?.subject || '', showAll: false, week: 0, pageNo: 0, subjects: [] },
    load: async ctx => {
      const s = ctx.state;
      if (!s.subjects.length) {
        s.subjects = (await subjectApi.list().catch(() => [])).filter(x => x.status !== 'INACTIVE');
        if (s.subjectName && !s.subjectId) s.subjectId = s.subjects.find(x => x.subjectName === s.subjectName)?.subjectId || '';
      }
      const res = await settle({
        page: [() => classApi.search(classSearchQuery(s, PAGE_SIZE)), null],
        registrations: [memberApi.registrations, []],
        current: [memberApi.currentSubscription, null],
        subscriptions: [memberApi.subscriptions, []]
      });
      if (res.pageError) throw res.pageError;
      return res;
    },
    view,
    actions: {
      ...classSearchActions,
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      // bấm thẻ: popup thông tin lớp + HLV; đặt / hủy ngay trong popup
      detail: (btn, e, ctx) => {
        const s = ctx.state;
        const c = s.page.content.find(x => String(x.classId) === btn.dataset.id);
        const reg = s.registrations.find(r => r.status === 'REGISTERED' && r.classId === c.classId);
        openClassDetail(c, {
          footer: footerFor(s, c, reg),
          actions: {
            book: async (b, modal) => {
              const res = await withBusy(b, () => memberApi.register(c.classId));
              if (res) { modal.close(); toast(`Đã đặt lớp ${c.subjectName} — xem trong Lịch tập của tôi`); ctx.reload(); }
            },
            'cancel-booking': async (b, modal) => {
              const ok = await confirmDialog('Bạn chắc chắn muốn hủy đăng ký lớp này?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true });
              if (!ok) return;
              const res = await withBusy(b, () => memberApi.cancel(b.dataset.id));
              if (res) { modal.close(); toast('Đã hủy đăng ký lớp'); ctx.reload(); }
            }
          }
        });
      },
      book: async (btn, e, ctx) => {
        const c = ctx.state.page.content.find(x => String(x.classId) === btn.dataset.id);
        const ok = await confirmDialog(`Đặt lớp ${c.subjectName}\n${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName}`, { title: 'Xác nhận đặt lớp', confirmText: 'Đặt lớp' });
        if (!ok) return;
        const res = await withBusy(btn, () => memberApi.register(c.classId));
        if (res) {
          toast(`Đã đặt lớp ${c.subjectName} — xem trong Lịch tập của tôi`);
          ctx.reload();
        }
      },
      'cancel-booking': async (btn, e, ctx) => {
        const ok = await confirmDialog('Bạn chắc chắn muốn hủy đăng ký lớp này?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true });
        if (!ok) return;
        const res = await withBusy(btn, () => memberApi.cancel(btn.dataset.id));
        if (res) {
          toast('Đã hủy đăng ký lớp');
          ctx.reload();
        }
      }
    }
  });
}
