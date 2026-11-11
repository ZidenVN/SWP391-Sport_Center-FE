import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, confirmDialog, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { classApi, memberApi, subjectApi, quizApi, packageApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { isBookable } from '../../components/classCard.js';
import { classPhotoCard, openClassDetail } from '../../components/classPhotoCard.js';
import { date, timeRange } from '../../core/format.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { withDurations, waitingClassPackages, matchingPackages, neededPackageText, pickPackage } from '../../components/classPackages.js';
import { classSearchQuery, classFilterBar, classPager, filterByKeyword, classSearchActions } from '../../components/classSearch.js';

// Tìm & đặt lớp qua GET /classes/search (lọc + phân trang ở BE, FE-TODO #7): xem theo tuần, lọc bộ môn, chỉ lớp còn chỗ.
// Lịch các buổi đã đăng ký nằm ở mục "Lịch tập của tôi".
const PAGE_SIZE = 12;

// BE chặn tự đặt lớp khi chưa làm khảo sát (ERR_QUIZ_008) -> báo lỗi rồi đưa tới trang khảo sát
const QUIZ_REQUIRED = 'ERR_QUIZ_008';
const quizPending = s => s.quiz?.completed === false;
function register(classId, subscriptionId) {
  return memberApi.register(classId, subscriptionId).catch(err => {
    if (err.code === QUIZ_REQUIRED) {
      session.update({ quizCompleted: false });
      setTimeout(() => { location.hash = '#/member/onboarding'; }, 1200);
    }
    throw err;
  });
}

function footerFor(s, c, reg) {
  if (reg) {
    return html`
      <span class="mr-auto text-xs font-bold text-emerald-600 flex items-center gap-1">${icon('check-circle-2', 'w-4 h-4')} Đã đăng ký</span>
      <button type="button" class="btn-secondary btn-sm" data-action="cancel-booking" data-id="${reg.registrationId}">Hủy</button>`;
  }
  if (isBookable(c) && !matchingPackages(s.subscriptions, c).length) return html`<span class="mr-auto text-xs text-amber-700" data-testid="need-package-text">${neededPackageText(c)}</span><a href="#/member/packages" class="btn-secondary btn-sm" data-testid="need-package">${icon('package', 'w-3.5 h-3.5')} Mua gói</a>`;
  if (isBookable(c) && quizPending(s)) return html`<span class="mr-auto text-xs text-amber-700">Cần làm khảo sát trước khi đặt lớp</span><a href="#/member/onboarding" class="btn-primary btn-sm" data-testid="need-quiz">${icon('clipboard-list', 'w-3.5 h-3.5')} Làm khảo sát</a>`;
  if (isBookable(c)) return html`<button type="button" class="btn-primary w-full sm:w-auto justify-center" data-action="book" data-id="${c.classId}" data-testid="detail-book">${icon('plus', 'w-4 h-4')} Đặt lớp này</button>`;
  return html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`;
}

function view(s) {
  const mine = new Map(s.registrations.filter(r => r.status === 'REGISTERED').map(r => [r.classId, r]));
  const list = filterByKeyword(s.page?.content || [], s.keyword);
  return html`
    ${pageHeader('Lớp học', 'Tìm lớp hợp môn, hợp giờ và giữ chỗ trước khi lớp kín',
      html`<a href="#/member/schedule" class="btn-secondary" data-testid="to-schedule">${icon('calendar-days', 'w-4 h-4')} Lịch tập của tôi</a>`)}
    ${waitingClassPackages(s.subscriptions).length ? html`
      <div class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-center gap-3" data-testid="waiting-packages">
        ${icon('ticket', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Bạn có <b>${waitingClassPackages(s.subscriptions).length}</b> gói lớp đang chờ: ${waitingClassPackages(s.subscriptions).map(x => `${x.subjectName || x.packageName}${x.durationDays ? ` ${x.durationDays} ngày` : ''}`).join(', ')}. Chọn lớp cùng môn, cùng thời hạn để đăng ký.</span>
      </div>` : html`
      <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3" data-testid="no-class-package">
        ${icon('alert-circle', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Mỗi lớp cần 1 gói lớp cùng môn và cùng thời hạn. Bạn chưa có gói lớp nào đang chờ dùng.</span>
        <a href="#/member/packages" class="btn-primary btn-sm">Mua gói lớp</a>
      </div>`}
    ${quizPending(s) ? html`
      <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3" data-testid="quiz-required-banner">
        ${icon('clipboard-list', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Bạn cần hoàn thành khảo sát (chiều cao, cân nặng, mục tiêu...) trước khi tự đặt lớp.</span>
        <a href="#/member/onboarding" class="btn-primary btn-sm">Làm khảo sát</a>
      </div>` : ''}
    ${classFilterBar(s)}
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => classPhotoCard(c, { registered: mine.has(c.classId) }))}
      </div>
      ${classPager(s.page)}` : emptyView(s, mine)}`;
}

// trống: nói rõ lý do (mặc định chỉ hiện lớp còn đặt được) và chỉ đường tiếp theo
function emptyView(s, mine) {
  if (s.keyword?.trim()) return emptyState('Không có lớp khớp từ khóa trong tuần này', 'calendar-x');
  const text = s.showAll ? 'Tuần này không có lớp nào, thử tuần sau hoặc đổi bộ môn' : 'Tuần này không còn lớp nào nhận đăng ký. Bật "Hiện cả lớp đã qua / hết chỗ" để xem toàn bộ, hoặc thử tuần sau.';
  return html`
    ${emptyState(text, 'calendar-x')}
    ${mine.size ? html`<div class="-mt-6 mb-6 text-center"><a href="#/member/schedule" class="btn-secondary btn-sm" data-testid="empty-to-schedule">${icon('calendar-days', 'w-4 h-4')} Xem lớp bạn đã đăng ký</a></div>` : ''}`;
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
        subscriptions: [memberApi.subscriptions, []],
        packages: [packageApi.list, []],
        quiz: [quizApi.status, null]
      });
      if (res.pageError) throw res.pageError;
      res.subscriptions = withDurations(res.subscriptions, res.packages);
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
              const sub = await pickPackage(matchingPackages(s.subscriptions, c), c);
              if (!sub) return;
              const res = await withBusy(b, () => register(c.classId, sub.subscriptionId));
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
        const options = matchingPackages(ctx.state.subscriptions, c);
        if (!options.length) { toast(neededPackageText(c), 'warning'); return; }
        const sub = await pickPackage(options, c);
        if (!sub) return;
        const ok = await confirmDialog(`Đặt lớp ${c.subjectName}\n${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName}\nDùng gói: ${sub.packageName}`, { title: 'Xác nhận đặt lớp', confirmText: 'Đặt lớp' });
        if (!ok) return;
        const res = await withBusy(btn, () => register(c.classId, sub.subscriptionId));
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
