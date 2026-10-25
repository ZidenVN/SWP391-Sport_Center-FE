import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { classApi, receptionApi, subjectApi } from '../../api/endpoints.js';
import { classCard, isBookable } from '../../components/classCard.js';
import { openMemberPicker } from '../../components/memberPicker.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { fullName, isoDate } from '../../core/format.js';
import { classSearchQuery, classFilterBar, classPager, filterByKeyword, classSearchActions } from '../../components/classSearch.js';

// Lịch lớp của Lễ tân: tìm theo tuần qua GET /classes/search (FE-TODO #7), đặt chỗ hộ hội viên trên thẻ lớp.
const PAGE_SIZE = 12;

function view(s) {
  const list = filterByKeyword(s.page?.content || [], s.keyword);
  return html`
    ${pageHeader('Lịch lớp học', `${s.todayCount ?? 0} lớp diễn ra hôm nay · đặt chỗ hộ hội viên ngay trên thẻ lớp`)}
    ${classFilterBar(s)}
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => classCard(c, isBookable(c)
          ? html`<button type="button" class="btn bg-brand-dark text-white hover:bg-emerald-800 btn-sm" data-action="book" data-id="${c.classId}" data-testid="board-book-${c.classId}">${icon('user-plus', 'w-3.5 h-3.5')} Đặt cho hội viên</button>`
          : html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`))}
      </div>
      ${classPager(s.page)}` : emptyState('Không có lớp phù hợp trong tuần này', 'calendar-x')}`;
}

export default function ClassBoard(el) {
  return mountPage(el, {
    state: { keyword: '', subjectId: '', showAll: false, week: 0, pageNo: 0, subjects: [] },
    load: async ctx => {
      const s = ctx.state;
      const today = isoDate(new Date());
      const [page, todayPage, subjects] = await Promise.all([
        classApi.search(classSearchQuery(s, PAGE_SIZE)),
        classApi.search({ fromDate: today, toDate: today, size: 1 }).catch(() => null),
        s.subjects.length ? s.subjects : subjectApi.list().catch(() => [])
      ]);
      return { page, subjects, todayCount: todayPage?.totalElements };
    },
    view,
    actions: {
      ...classSearchActions,
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      book: (btn, e, ctx) => {
        const c = ctx.state.page.content.find(x => String(x.classId) === btn.dataset.id);
        openMemberPicker({
          title: `Đặt lớp ${c.subjectName} cho hội viên`,
          onPick: async member => {
            try {
              await receptionApi.register(member.memberId, c.classId);
              toast(`Đã đặt lớp ${c.subjectName} cho ${fullName(member)}`);
              ctx.reload();
            } catch (err) {
              toast(err.message, 'error', `Không đặt được cho ${fullName(member)}`);
            }
          }
        });
      }
    }
  });
}
