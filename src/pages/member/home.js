import { html, icon } from '../../core/dom.js';
import { pageHeader, statCard, emptyState } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { date, dateTime, daysUntil, weekday, timeRange, badge, isPlaceholderPhone } from '../../core/format.js';
import { coachLink, openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { expiryBanner, isUnread } from '../../components/memberAlerts.js';
import { quizStore } from '../../core/quiz.js';

function subscriptionCard(sub) {
  if (!sub) {
    return html`
      <div class="card p-6 bg-brand-sand border-0" data-testid="no-subscription">
        <div class="text-sm font-semibold text-slate-600">Gói tập hiện tại</div>
        <div class="font-display text-3xl font-extrabold leading-tight text-brand-dark mt-1">Bạn chưa có gói tập còn hiệu lực</div>
        <p class="text-sm text-slate-600 mt-2">Mua gói để bắt đầu đặt lớp và tập luyện.</p>
        <a href="#/member/packages" class="btn-primary mt-5">${icon('package', 'w-4 h-4')} Xem gói tập</a>
      </div>`;
  }
  const left = daysUntil(sub.endDate);
  return html`
    <div class="card p-6 bg-brand-dark text-white border-0 relative overflow-hidden" data-testid="current-subscription">
      <div class="absolute -right-14 -bottom-16 w-36 h-36 rounded-full bg-brand/25"></div>
      <div class="relative">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-sm text-white/60">Gói tập hiện tại</div>
          <div class="font-display text-4xl font-extrabold leading-none text-brand-lime mt-1">${sub.packageName}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-brand-lime text-brand-dark text-xs font-extrabold whitespace-nowrap">${left > 0 ? `Còn ${left} ngày` : 'Hết hạn hôm nay'}</span>
      </div>
      <div class="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div><div class="text-white/50 text-xs">Bắt đầu</div><div class="font-semibold">${date(sub.startDate)}</div></div>
        <div><div class="text-white/50 text-xs">Hết hạn</div><div class="font-semibold">${date(sub.endDate)}</div></div>
      </div>
      <a href="#/member/packages" class="btn-lime mt-5">${icon('refresh-cw', 'w-4 h-4')} Gia hạn</a>
      </div>
    </div>`;
}

// Chưa có gói: mời làm quiz, hoặc nhắc lại gợi ý nếu đã làm
function quizBanner(current) {
  if (current) return '';
  const done = Boolean(quizStore.answers(session.get()?.email));
  const combo = quizStore.combo(session.get()?.email);
  if (combo) {
    return html`
      <a href="#/member/onboarding" class="mb-5 flex items-center gap-3 rounded-2xl bg-brand-dark p-4 text-white hover:bg-brand-deep" data-testid="quiz-banner">
        <span class="w-10 h-10 rounded-xl bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('heart-handshake', 'w-5 h-5')}</span>
        <span class="flex-1 text-sm"><b>Combo bạn đã chọn: ${combo.name}</b> · ${Math.round(combo.price / 1000)}k/tháng<br /><span class="text-white/70">Xem lịch tập xen kẽ gợi ý và các lựa chọn khác.</span></span>
        ${icon('chevron-right', 'w-5 h-5')}
      </a>`;
  }
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
  const name = session.get()?.firstName || '';
  const upcoming = (s.schedule || []).filter(r => r.status === 'REGISTERED').slice(0, 4);
  const notis = (s.notifications || []).slice(0, 4);
  const p = s.progress;
  return html`
    ${pageHeader(`Xin chào, ${name}!`, 'Tổng quan hoạt động tập luyện của bạn')}
    ${s.me && isPlaceholderPhone(s.me.phone) ? html`
      <a href="#/member/profile" class="mb-5 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900 hover:bg-sky-100" data-testid="complete-profile">
        <span class="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">${icon('user-pen', 'w-5 h-5')}</span>
        <span class="flex-1 text-sm"><b>Hoàn thiện hồ sơ</b><br />Thêm số điện thoại để lễ tân và HLV liên hệ được với bạn.</span>
        ${icon('chevron-right', 'w-5 h-5')}
      </a>` : ''}
    ${expiryBanner(s.current)}
    ${quizBanner(s.current)}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">${subscriptionCard(s.current)}</div>
      <div class="lg:col-span-2 grid sm:grid-cols-3 gap-4 content-start">
        ${statCard('Lớp sắp tới', upcoming.length, 'calendar-check', 'emerald')}
        ${statCard('Buổi đã tập', p?.totalSessionAttended ?? 0, 'flame', 'orange')}
        ${statCard('Giáo án đang tập', p?.inProgressPlans ?? 0, 'clipboard-list', 'emerald')}
      </div>
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
    load: () => settle({
      current: [memberApi.currentSubscription, null],
      schedule: [memberApi.schedule, []],
      notifications: [memberApi.notifications, []],
      progress: [memberApi.progress, null],
      me: [memberApi.me, null]
    }),
    view,
    actions: { 'coach-info': btn => openCoachInfo(coachFromButton(btn)) }
  });
}
