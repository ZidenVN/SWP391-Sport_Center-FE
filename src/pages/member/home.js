import { html, icon } from '../../core/dom.js';
import { pageHeader, statCard, emptyState } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi, quizApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { date, dateTime, time, daysUntil, weekday, timeRange, badge, isPlaceholderPhone, toDate } from '../../core/format.js';
import { coachLink, openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { expiryBanner, isUnread } from '../../components/memberAlerts.js';
import { memberSmartCard, openCheckinCodeModal } from '../../components/membershipCard.js';
import { quizStore } from '../../core/quiz.js';

// Gói còn dùng được: đang chạy và chưa hết hạn (BE: hết hạn = ACTIVE + endDate < now), hoặc đang chờ kích hoạt
const usable = x => x.status === 'WAITING_ACTIVATION' || (x.status === 'ACTIVE' && (!x.endDate || toDate(x.endDate) >= new Date()));
const isClass = x => x.packageType === 'CLASS';
const byEnd = (p, q) => String(p.endDate || '9').localeCompare(String(q.endDate || '9'));

// Thẻ Gói lớp: mỗi gói 1 dòng — đang học lớp nào, hoặc chưa chọn lớp (chờ kích hoạt)
function classPackageLine(x) {
  const waiting = x.status === 'WAITING_ACTIVATION';
  const left = waiting ? null : daysUntil(x.endDate);
  return html`
    <li class="flex items-center gap-3 py-3" data-testid="class-package-line">
      <span class="w-10 h-10 rounded-xl ${waiting ? 'bg-amber-50 text-amber-600' : 'bg-[#1E9E64]/10 text-[#156B45]'} flex items-center justify-center shrink-0">${icon(waiting ? 'ticket' : 'dumbbell', 'w-5 h-5')}</span>
      <div class="min-w-0 flex-1">
        <div class="text-sm font-bold truncate">${x.subjectName || x.packageName}</div>
        <div class="text-xs text-slate-500 truncate">${waiting
          ? 'Chưa chọn lớp · ngày bắt đầu tính khi lớp bắt đầu'
          : x.currentClassName
            ? `Đang học ${x.currentClassName}${x.classStartDate ? ` · ${date(x.classStartDate).slice(0, 5)} → ${date(x.classEndDate || x.endDate)}` : ''}`
            : `Đến ${date(x.endDate)}`}</div>
      </div>
      ${waiting
        ? html`<a href="#/member/classes" class="btn-primary btn-sm whitespace-nowrap">Chọn lớp</a>`
        : html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">${left > 0 ? `Còn ${left} ngày` : 'Hết hôm nay'}</span>`}
    </li>`;
}

function classPackagesCard(list, hasMembership) {
  const sorted = [...list].sort((p, q) => (p.status === 'WAITING_ACTIVATION') - (q.status === 'WAITING_ACTIVATION') || byEnd(p, q));
  const waiting = list.filter(x => x.status === 'WAITING_ACTIVATION').length;
  return html`
    <div class="card p-6 h-full flex flex-col" data-testid="class-packages-card">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-500">${icon('calendar-check', 'w-4 h-4')} Gói lớp</div>
          <div class="font-display text-3xl font-extrabold leading-tight text-brand-dark mt-1">${list.length ? `${list.length} gói lớp` : 'Chưa có gói lớp'}</div>
        </div>
        ${waiting ? html`<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold whitespace-nowrap">${waiting} chưa chọn lớp</span>` : ''}
      </div>
      ${list.length ? html`
        <ul class="divide-y divide-slate-100 mt-2 flex-1">${sorted.slice(0, 3).map(classPackageLine)}</ul>
        ${list.length > 3 ? html`<a href="#/member/schedule" class="text-xs font-bold text-emerald-600 hover:underline mt-1">+${list.length - 3} gói khác · xem lớp đã đăng ký</a>` : ''}` : html`
        <p class="text-sm text-slate-600 mt-2 flex-1">Mỗi gói lớp dùng cho 1 lớp cùng môn, cùng thời hạn.${hasMembership ? '' : ' Cần có Membership trước khi mua.'}</p>
        <a href="#/member/packages" class="btn-secondary mt-5 self-start">${icon('plus', 'w-4 h-4')} Mua gói lớp</a>`}
    </div>`;
}

// Chưa làm khảo sát (BE bắt buộc trước khi tự đặt lớp): luôn nhắc. Đã làm: chỉ nhắc lại gợi ý khi chưa có gói
function quizBanner(current) {
  const completed = session.get()?.quizCompleted;
  const done = completed ?? Boolean(quizStore.answers(session.get()?.email));
  if (!done) {
    return html`
      <a href="#/member/onboarding" class="mb-5 flex items-center gap-3 rounded-2xl bg-brand-dark p-4 text-white hover:bg-brand-deep" data-testid="quiz-banner">
        <span class="w-10 h-10 rounded-xl bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('clipboard-list', 'w-5 h-5')}</span>
        <span class="flex-1 text-sm"><b>Hoàn thành khảo sát để đặt lớp</b><br /><span class="text-white/70">Vài câu hỏi về chỉ số cơ thể, mục tiêu và khung giờ — nhận luôn gói tập, lớp học hợp với bạn.</span></span>
        ${icon('chevron-right', 'w-5 h-5')}
      </a>`;
  }
  if (current) return '';
  return html`
    <a href="#/member/onboarding" class="mb-5 flex items-center gap-3 rounded-2xl bg-brand-dark p-4 text-white hover:bg-brand-deep" data-testid="quiz-banner">
      <span class="w-10 h-10 rounded-xl bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-5 h-5')}</span>
      <span class="flex-1 text-sm">${done
        ? html`<b>Xem lại gói tập gợi ý cho bạn</b><br /><span class="text-white/70">Dựa trên chỉ số cơ thể, mục tiêu và khung giờ bạn đã chọn.</span>`
        : html`<b>Chưa biết chọn gói nào?</b><br /><span class="text-white/70">Trả lời 4 câu hỏi nhanh để nhận gói tập và lớp học hợp với bạn.</span>`}</span>
      ${icon('chevron-right', 'w-5 h-5')}
    </a>`;
}

function view(s) {
  // chào bằng tên (lastName), không phải họ (firstName)
  const name = session.get()?.lastName || session.get()?.firstName || '';
  const upcoming = (s.schedule || []).filter(r => r.status === 'SCHEDULED' && toDate(r.endTime) >= new Date()).sort((a, b) => toDate(a.startTime) - toDate(b.startTime)).slice(0, 4);
  const notis = (s.notifications || []).slice(0, 4);
  const p = s.progress;
  const subs = (s.subscriptions || []).filter(usable);
  const memberships = subs.filter(x => !isClass(x));
  const classPackages = subs.filter(isClass);
  // nhắc gia hạn theo Membership hết hạn muộn nhất
  const latestMembership = memberships.filter(x => x.status === 'ACTIVE').sort(byEnd).at(-1) || null;
  return html`
    ${pageHeader(`Xin chào, ${name}!`, upcoming.length ? `Buổi tiếp theo: ${upcoming[0].subjectName} lúc ${time(upcoming[0].startTime)}, ${weekday(upcoming[0].startTime)} ${date(upcoming[0].startTime)}` : 'Chưa có buổi tập nào sắp tới, chọn một lớp để bắt đầu')}
    ${s.me && isPlaceholderPhone(s.me.phone) ? html`
      <a href="#/member/profile" class="mb-5 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900 hover:bg-sky-100" data-testid="complete-profile">
        <span class="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">${icon('user-pen', 'w-5 h-5')}</span>
        <span class="flex-1 text-sm"><b>Hoàn thiện hồ sơ</b><br />Thêm số điện thoại để lễ tân và HLV liên hệ được với bạn.</span>
        ${icon('chevron-right', 'w-5 h-5')}
      </a>` : ''}
    ${expiryBanner(latestMembership)}
    ${quizBanner(subs.length > 0)}
    <div class="grid xl:grid-cols-[1.35fr_1fr] gap-6">
      ${memberSmartCard(s.subscriptions || [], { me: s.me, progress: s.progress, checkIns: s.checkIns, inPackagesPage: false })}
      ${classPackagesCard(classPackages, memberships.length > 0)}
    </div>
    <div class="grid sm:grid-cols-3 gap-4 mt-6">
      ${statCard('Buổi học sắp tới', upcoming.length, 'calendar-clock', 'emerald')}
      ${statCard('Buổi đã tập', p?.totalSessionAttended ?? 0, 'flame', 'orange')}
      ${statCard('Giáo án đang tập', p?.inProgressPlans ?? 0, 'clipboard-list', 'emerald')}
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <section class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold">Lịch tập sắp tới</h2>
          <a href="#/member/schedule" class="text-xs font-bold text-emerald-600 hover:underline">Xem tất cả</a>
        </div>
        ${upcoming.length ? html`
          <ul class="divide-y divide-slate-100">
            ${upcoming.map(r => html`
              <li class="py-3 flex items-center gap-4">
                <div class="w-14 text-center shrink-0">
                  <div class="text-[11px] font-bold text-slate-400 uppercase">${weekday(r.startTime)}</div>
                  <div class="text-lg font-extrabold">${date(r.startTime).slice(0, 5)}</div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-semibold truncate">${r.subjectName}</div>
                  <div class="text-xs text-slate-500">${timeRange(r.startTime, r.endTime)} · ${r.roomName} · ${coachLink(r)}</div>
                </div>
              </li>`)}
          </ul>` : html`
          ${emptyState('Bạn chưa đặt lớp nào sắp diễn ra', 'calendar')}
          <div class="text-center"><a href="#/member/classes" class="btn-primary btn-sm">Đặt lớp ngay</a></div>`}
      </section>

      <section class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold">Thông báo mới</h2>
          <a href="#/member/notifications" class="text-xs font-bold text-emerald-600 hover:underline">Xem tất cả</a>
        </div>
        ${notis.length ? html`
          <ul class="space-y-3">
            ${notis.map(n => html`
              <li class="flex gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">${icon('bell', 'w-4 h-4')}</div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold">${isUnread(n) ? html`<span class="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1 align-middle" title="Chưa đọc"></span>` : ''}${n.title} ${badge(n.targetType)}</div>
                  <div class="text-xs text-slate-500 line-clamp-2">${n.content}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">${dateTime(n.sendDate)}</div>
                </div>
              </li>`)}
          </ul>` : emptyState('Chưa có thông báo', 'bell-off')}
      </section>
    </div>`;
}

export default function MemberHome(el) {
  return mountPage(el, {
    load: async () => {
      const res = await settle({
        subscriptions: [memberApi.subscriptions, []],
        schedule: [memberApi.schedule, []],
        notifications: [memberApi.notifications, []],
        progress: [memberApi.progress, null],
        checkIns: [memberApi.checkIns, []],
        me: [memberApi.me, null],
        quiz: [quizApi.status, null]
      });
      // banner khảo sát đọc trạng thái trong session
      if (res.quiz) session.update({ quizCompleted: Boolean(res.quiz.completed) });
      return res;
    },
    view,
    actions: {
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      'checkin-code': btn => openCheckinCodeModal({
        memberCode: btn.dataset.memberCode,
        memberName: btn.dataset.memberName,
        packageName: btn.dataset.packageName,
        validity: btn.dataset.validity
      })
    }
  });
}
