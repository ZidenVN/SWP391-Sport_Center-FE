import { html, icon } from '../../core/dom.js';
import { pageHeader, tabs } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { date, dateTime, time, toDate, classCode } from '../../core/format.js';
import { FEATURES } from '../../core/features.js';

// Tập luyện của hội viên: Tiến độ (mục tiêu, buổi tới, chuyên cần 8 tuần, nhận xét HLV) · Giáo án · Kết quả tập.
// Số liệu lấy từ /members/me/progress, workout-plans, workout-results, attendances, schedule.

const WEEK = 7 * 86400000;
const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const attended = a => a.status === 'PRESENT' || a.status === 'LATE';
const isDone = p => p.status === 'COMPLETED';

function emptyBlock(iconName, title, text, action = '') {
  return html`
    <div class="flex flex-col items-center text-center gap-2.5 py-8 px-3">
      <span class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">${icon(iconName, 'w-6 h-6')}</span>
      <b class="text-[15px] text-slate-900">${title}</b>
      <p class="text-sm text-slate-500 max-w-sm">${text}</p>
      ${action}
    </div>`;
}

const eyebrow = (text, cls = 'text-slate-500') => html`<div class="text-[11px] font-bold uppercase tracking-widest ${cls}">${text}</div>`;

function cardHead(title, link = '') {
  return html`<div class="flex items-center justify-between gap-3 mb-4"><h3 class="font-bold text-[15px]">${title}</h3>${link}</div>`;
}

const headLink = (label, attrs) => html`<button type="button" class="text-sm font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1" ${attrs}>${label} ${icon('arrow-right', 'w-3.5 h-3.5')}</button>`;

// Đầu tuần (thứ Hai 00:00) chứa ngày d
function weekStart(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

// số buổi có mặt theo 8 tuần gần nhất (tuần cuối = tuần này) + chuỗi tuần liên tục + tổng giờ
function attendanceStats(attendances) {
  const thisWeek = weekStart(new Date()).getTime();
  const weeks = new Array(8).fill(0);
  let minutes = 0;
  attendances.filter(attended).forEach(a => {
    const start = toDate(a.startTime);
    if (!start) return;
    const idx = 7 - Math.round((thisWeek - weekStart(start).getTime()) / WEEK);
    if (idx >= 0 && idx < 8) weeks[idx]++;
    const end = toDate(a.endTime);
    if (end) minutes += Math.max(0, (end - start) / 60000);
  });
  // tuần này chưa tập thì vẫn tính chuỗi từ tuần trước
  let streak = 0;
  for (let i = weeks[7] ? 7 : 6; i >= 0 && weeks[i]; i--) streak++;
  const total = weeks.reduce((a, b) => a + b, 0);
  return { weeks, streak, avg: total / 8, hours: Math.round(minutes / 60), thisWeek: weeks[7] };
}

// ---------- Tiến độ ----------

function onboarding(s) {
  const steps = [
    { done: Boolean(s.current), title: 'Đăng ký gói tập', sub: s.current ? `${s.current.packageName} đã sẵn sàng` : 'Chọn Membership để vào trung tâm', href: '#/member/packages', cta: 'Chọn gói' },
    { done: s.attendances.some(attended) || s.nextSession != null, title: 'Đặt lớp đầu tiên', sub: 'HLV đánh giá thể trạng ngay buổi đầu', href: '#/member/classes', cta: 'Xem lớp học' },
    { done: s.plans.length > 0, title: 'Nhận giáo án từ HLV', sub: s.progress?.trainingGoal ? `Theo mục tiêu: ${s.progress.trainingGoal}` : 'Thiết kế theo mục tiêu của bạn', href: '#/member/classes', cta: 'Tìm lớp có HLV' }
  ];
  const doneCount = steps.filter(x => x.done).length;
  if (doneCount === steps.length) return '';
  return html`
    <div class="card rounded-3xl p-5">
      ${cardHead('Bắt đầu hành trình của bạn', eyebrow(`${doneCount}/${steps.length} hoàn thành`))}
      <div class="grid md:grid-cols-3 gap-3">
        ${steps.map((x, i) => html`
          <div class="flex gap-3 items-start p-3.5 rounded-2xl border ${x.done ? 'border-brand-line bg-white/80' : 'border-dashed border-brand-line bg-white/60'}">
            <span class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold ${x.done ? 'bg-brand-dark text-brand-lime' : 'bg-slate-100 text-slate-700'}">${x.done ? icon('check', 'w-3.5 h-3.5') : i + 1}</span>
            <div class="min-w-0">
              <b class="block text-[13.5px]">${x.title}</b>
              <span class="block text-xs text-slate-500">${x.sub}</span>
              ${x.done ? '' : html`<a href="${x.href}" class="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-deep hover:underline">${x.cta} ${icon('arrow-right', 'w-3 h-3')}</a>`}
            </div>
          </div>`)}
      </div>
    </div>`;
}

function goalCard(s) {
  const p = s.progress || {};
  const assigned = p.totalPlansAssigned ?? s.plans.length;
  const done = p.completedPlans ?? s.plans.filter(isDone).length;
  const pct = assigned ? Math.round((done / assigned) * 100) : 0;
  const coach = s.plans.find(x => x.coachName)?.coachName || s.nextSession?.coachName;
  const firstDay = [...s.attendances.map(a => a.startTime), ...s.plans.map(x => x.assignedDate)].filter(Boolean).sort()[0];
  const stat = (label, value) => html`<div><small class="block text-xs text-slate-500">${label}</small><b class="font-display text-2xl">${value}</b></div>`;
  return html`
    <div class="card rounded-3xl p-5 flex flex-col sm:flex-row gap-6 sm:items-center min-w-0">
      <div class="w-[132px] h-[132px] shrink-0 rounded-full grid place-items-center" style="background:conic-gradient(#1E9E64 ${pct * 3.6}deg, rgba(100,116,139,.15) 0)">
        <div class="w-[106px] h-[106px] rounded-full bg-white grid place-items-center text-center">
          <div><b class="font-display text-[32px] leading-none">${pct}%</b><small class="block text-[11px] text-slate-500">giáo án xong</small></div>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        ${eyebrow('Mục tiêu tập luyện')}
        <h2 class="text-[22px] font-bold mt-1 mb-2.5 break-words">${p.trainingGoal || 'Chưa đặt mục tiêu'}</h2>
        <div class="flex flex-wrap gap-x-6 gap-y-2">
          ${stat('Buổi đã tham gia', p.totalSessionAttended ?? 0)}
          ${stat('Giáo án', `${done}/${assigned}`)}
          ${stat('Đang thực hiện', p.inProgressPlans ?? s.plans.filter(x => !isDone(x)).length)}
          ${stat('Kết quả đã ghi', s.results.length)}
        </div>
        <div class="flex flex-wrap gap-2 mt-3.5">
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">${icon('calendar', 'w-3.5 h-3.5')} Từ ${firstDay ? date(firstDay) : '—'}</span>
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">${icon('user', 'w-3.5 h-3.5')} ${coach ? `HLV ${coach}` : 'Chưa có HLV phụ trách'}</span>
          <a href="#/member/onboarding?redo=1" class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium hover:text-slate-900">${icon('target', 'w-3.5 h-3.5')} Cập nhật mục tiêu</a>
        </div>
      </div>
    </div>`;
}

function nextCard(n) {
  const row = (ic, text) => html`<div class="flex items-center gap-2 text-[13px] text-white/85 mb-1.5">${icon(ic, 'w-4 h-4 text-brand-lime shrink-0')}<span class="min-w-0 truncate">${text}</span></div>`;
  const start = n && toDate(n.startTime);
  return html`
    <div class="rounded-3xl p-5 bg-brand-dark text-white relative overflow-hidden min-w-0">
      <div class="absolute -right-16 -top-16 w-52 h-52 rounded-full" style="background:radial-gradient(circle,rgba(215,242,91,.35),transparent 70%)"></div>
      <div class="relative">
        ${eyebrow('Buổi tập tiếp theo', 'text-brand-lime')}
        ${n ? html`
          <h3 class="text-xl font-bold mt-2 mb-3">${n.subjectName} <span class="text-sm font-semibold opacity-70 align-middle">${classCode(n)}</span>${n.type === 'MAKEUP' ? html` <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 align-middle">Buổi bù</span>` : ''}</h3>
          ${row('clock', `${WEEKDAYS[start.getDay()]}, ${date(n.startTime).slice(0, 5)} · ${time(n.startTime)} – ${time(n.endTime)}`)}
          ${row('map-pin', n.roomName || 'Chưa xếp phòng')}
          ${row('user', `HLV ${n.coachName || '—'}${n.substitute ? ' (dạy thay)' : ''}`)}` : html`
          <h3 class="text-xl font-bold mt-2 mb-3">Bạn chưa có lịch tập nào</h3>
          <p class="text-[13px] text-white/75">Đặt lớp đầu tiên để HLV đánh giá thể trạng và lên giáo án riêng cho bạn.</p>`}
        <div class="flex flex-wrap gap-2 mt-4">
          ${n
            ? html`<a href="#/member/schedule" class="btn-lime btn-sm">${icon('calendar-check', 'w-4 h-4')} Xem lịch tập</a>`
            : html`<a href="#/member/classes" class="btn-lime btn-sm">${icon('plus', 'w-4 h-4')} Đặt lớp ngay</a>`}
          <a href="#/member/classes" class="btn btn-sm bg-white/10 border border-white/15 text-white hover:bg-white/15">Xem lớp học</a>
        </div>
      </div>
    </div>`;
}

function kpi(ic, tone, label, value, sub, trend = '') {
  return html`
    <div class="card rounded-3xl p-5 flex flex-col gap-3.5 min-w-0">
      <div class="flex items-center justify-between">
        <span class="w-[42px] h-[42px] rounded-xl flex items-center justify-center ${tone}">${icon(ic, 'w-5 h-5')}</span>
        ${trend ? html`<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">${trend}</span>` : ''}
      </div>
      <div>${eyebrow(label)}<div class="font-display text-[40px] leading-none font-bold mt-1">${value}</div></div>
      <div class="text-[12.5px] text-slate-500 truncate">${sub}</div>
    </div>`;
}

function attendanceCard(st) {
  const max = Math.max(4, ...st.weeks);
  const meta = (ic, tone, label, value) => html`
    <div class="flex items-center gap-2.5"><span class="w-[34px] h-[34px] rounded-xl flex items-center justify-center ${tone}">${icon(ic, 'w-4 h-4')}</span><div><small class="block text-xs text-slate-500">${label}</small><b>${value}</b></div></div>`;
  return html`
    <div class="card rounded-3xl p-5 min-w-0">
      ${cardHead('Mức độ chuyên cần · 8 tuần', html`<a href="#/member/schedule" class="text-sm font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">Lịch tập ${icon('arrow-right', 'w-3.5 h-3.5')}</a>`)}
      ${st.weeks.some(Boolean) ? html`
        <div class="flex items-end gap-2 sm:gap-3 h-44 pt-2 border-b border-dashed border-brand-line" data-testid="attendance-chart">
          ${st.weeks.map((v, i) => html`
            <div class="flex-1 h-full flex flex-col items-center justify-end gap-1.5">
              <span class="text-xs font-semibold">${v}</span>
              <div class="w-full max-w-[38px] rounded-t-[10px] rounded-b ${i === 7 ? 'bg-brand-dark' : 'bg-brand-sand'}" style="height:${Math.max(v ? 6 : 2, (v / max) * 100)}%"></div>
            </div>`)}
        </div>
        <div class="flex gap-2 sm:gap-3 mt-2">${st.weeks.map((_, i) => html`<span class="flex-1 text-center text-[11px] text-slate-500 truncate">${i === 7 ? 'Tuần này' : `T-${7 - i}`}</span>`)}</div>
        <div class="flex flex-wrap gap-5 mt-4">
          ${meta('flame', 'bg-amber-50 text-amber-600', 'Chuỗi liên tục', `${st.streak} tuần`)}
          ${meta('activity', 'bg-brand-sand text-brand-deep', 'Trung bình', `${st.avg.toFixed(1).replace('.0', '')} buổi/tuần`)}
          ${meta('clock', 'bg-sky-50 text-sky-600', 'Tổng thời gian', `${st.hours} giờ`)}
        </div>` : emptyBlock('activity', 'Chưa có dữ liệu tập luyện', 'Biểu đồ chuyên cần hiện sau khi HLV điểm danh buổi học đầu tiên của bạn.')}
    </div>`;
}

function feedbackCard(s) {
  const latest = [...s.results].filter(r => r.coachFeedback).sort((a, b) => String(b.loggedDate).localeCompare(String(a.loggedDate)))[0];
  // BE trả chuỗi "Chưa có nhận xét nào" khi chưa có -> coi như trống
  const fromProgress = s.progress?.lastestCoachFeedback;
  const text = latest?.coachFeedback || (fromProgress && !/^Chưa có nhận xét/i.test(fromProgress) ? fromProgress : '');
  const coach = s.plans.find(x => x.coachName)?.coachName;
  return html`
    <div class="card rounded-3xl p-5 min-w-0">
      ${cardHead('Nhận xét gần nhất của HLV', text ? headLink('Tất cả', 'data-action="tab" data-tab="results"') : '')}
      ${text ? html`
        <div class="flex flex-col gap-3.5">
          <div class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-full bg-brand-dark text-brand-lime font-bold flex items-center justify-center">${(coach || 'H')[0].toUpperCase()}</span>
            <div><b>${coach ? `HLV ${coach}` : 'Huấn luyện viên'}</b><small class="block text-xs text-slate-500">${latest ? dateTime(latest.loggedDate) : ''}</small></div>
          </div>
          <blockquote class="rounded-2xl bg-slate-100 p-3.5 text-[13.5px] border-l-[3px] border-brand-lime whitespace-pre-line">${text}</blockquote>
          ${latest?.activityDetails ? html`<div class="text-xs text-slate-500 line-clamp-2">Buổi: ${latest.activityDetails}</div>` : ''}
        </div>` : emptyBlock('message-square', 'Chưa có nhận xét nào', 'Sau mỗi buổi tập, nhận xét và lời khuyên từ HLV sẽ xuất hiện ở đây.')}
    </div>`;
}

function progressTab(s) {
  const st = attendanceStats(s.attendances);
  const p = s.progress || {};
  const assigned = p.totalPlansAssigned ?? s.plans.length;
  const done = p.completedPlans ?? s.plans.filter(isDone).length;
  const doing = s.plans.find(x => !isDone(x));
  const coaches = new Set(s.plans.map(x => x.coachName).filter(Boolean)).size;
  return html`
    <div class="flex flex-col gap-5">
      ${onboarding(s)}
      <div class="grid lg:grid-cols-[1.6fr_1fr] gap-4">${goalCard(s)}${nextCard(s.nextSession)}</div>
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        ${kpi('calendar-check', 'bg-brand-sand text-brand-deep', 'Buổi đã tham gia', p.totalSessionAttended ?? 0,
          st.thisWeek ? `${st.thisWeek} buổi trong tuần này` : 'Chưa có buổi nào tuần này', st.thisWeek ? `+${st.thisWeek} tuần này` : '')}
        ${kpi('clipboard-list', 'bg-sky-50 text-sky-600', 'Giáo án được giao', assigned, coaches ? `Từ ${coaches} huấn luyện viên` : 'HLV giao sau buổi đầu')}
        ${kpi('loader', 'bg-amber-50 text-amber-600', 'Đang thực hiện', p.inProgressPlans ?? s.plans.filter(x => !isDone(x)).length, doing?.planName || '—')}
        ${kpi('check-circle-2', 'bg-emerald-50 text-emerald-600', 'Đã hoàn thành', done, assigned ? `Tỉ lệ hoàn thành ${Math.round((done / assigned) * 100)}%` : '—')}
      </div>
      <div class="grid lg:grid-cols-[1.6fr_1fr] gap-4">${attendanceCard(st)}${feedbackCard(s)}</div>
    </div>`;
}

// ---------- Giáo án ----------

// tiến độ theo thời gian: từ ngày giao tới hạn; giáo án xong = 100%
function planPct(p) {
  if (isDone(p)) return 100;
  const a = toDate(p.assignedDate);
  const d = toDate(p.dueDate);
  if (!a || !d || d <= a) return null;
  return Math.max(0, Math.min(100, Math.round(((Date.now() - a) / (d - a)) * 100)));
}

function plansTab(s) {
  if (!s.plans.length) {
    return html`<div class="card rounded-3xl">${emptyBlock('clipboard-list', 'Chưa có giáo án nào được giao',
      'Giáo án cá nhân hoá sẽ được HLV giao sau buổi học đầu tiên của bạn.',
      html`<a href="#/member/classes" class="btn-primary mt-1.5">${icon('plus', 'w-4 h-4')} Đặt lớp học</a>`)}</div>`;
  }
  const counts = { all: s.plans.length, doing: s.plans.filter(x => !isDone(x)).length, done: s.plans.filter(isDone).length };
  const list = s.plans
    .filter(p => s.planFilter === 'all' || (s.planFilter === 'done') === isDone(p))
    .sort((a, b) => isDone(a) - isDone(b) || String(b.assignedDate).localeCompare(String(a.assignedDate)));
  const seg = (id, label) => html`<button type="button" data-action="plan-filter" data-f="${id}" class="px-3 py-1.5 rounded-full text-[12.5px] font-semibold border ${s.planFilter === id ? 'bg-brand-dark text-white border-brand-dark' : 'border-brand-line bg-white/80 text-slate-600 hover:text-slate-900'}">${label} (${counts[id]})</button>`;
  return html`
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-1.5">${seg('all', 'Tất cả')}${seg('doing', 'Đang thực hiện')}${seg('done', 'Đã hoàn thành')}</div>
      ${list.length ? html`
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${list.map(p => {
            const pct = planPct(p);
            return html`
              <div class="card rounded-3xl p-5 flex flex-col gap-3 min-w-0" data-testid="plan-card">
                <div class="flex justify-between items-start gap-2.5">
                  <div class="min-w-0"><h4 class="font-bold text-base break-words">${p.planName}</h4>
                    <div class="text-xs text-slate-500 mt-0.5">${p.targetType === 'CLASS' ? `Giáo án lớp ${p.targetName || ''}` : 'Giáo án cá nhân'}</div></div>
                  <span class="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${isDone(p) ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">${isDone(p) ? 'Hoàn thành' : 'Đang tập'}</span>
                </div>
                <p class="text-[13px] text-slate-600 whitespace-pre-line line-clamp-4">${p.exerciseDetails}</p>
                ${pct != null ? html`
                  <div>
                    <div class="flex justify-between text-[12.5px] mb-1.5"><span class="text-slate-500">${isDone(p) ? 'Tiến độ' : 'Thời gian đã qua'}</span><b>${pct}%</b></div>
                    <div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-brand-dark" style="width:${pct}%"></div></div>
                  </div>` : ''}
                <div class="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-500 mt-auto">
                  <span class="inline-flex items-center gap-1">${icon('user', 'w-3.5 h-3.5')} ${p.coachName}</span>
                  ${p.duration ? html`<span class="inline-flex items-center gap-1">${icon('timer', 'w-3.5 h-3.5')} ${p.duration}</span>` : ''}
                  <span class="inline-flex items-center gap-1">${icon('calendar', 'w-3.5 h-3.5')} Giao ${date(p.assignedDate)}</span>
                  ${p.dueDate ? html`<span class="inline-flex items-center gap-1">${icon('flag', 'w-3.5 h-3.5')} Hạn ${date(p.dueDate)}</span>` : ''}
                </div>
              </div>`;
          })}
        </div>` : html`<div class="card rounded-3xl">${emptyBlock('clipboard-list', 'Không có giáo án', 'Không có giáo án nào ở mục này.')}</div>`}
    </div>`;
}

// ---------- Kết quả tập ----------

function resultsTab(s) {
  if (!s.results.length) {
    return html`<div class="card rounded-3xl">${emptyBlock('activity', 'Chưa có kết quả tập',
      'Kết quả từng buổi và nhận xét sẽ được HLV ghi lại tại đây để bạn theo dõi sự thay đổi.')}</div>`;
  }
  const sorted = [...s.results].sort((a, b) => String(b.loggedDate).localeCompare(String(a.loggedDate)));
  const withFeedback = sorted.filter(r => r.coachFeedback).length;
  const monthAgo = Date.now() - 30 * 86400000;
  const last30 = sorted.filter(r => toDate(r.loggedDate) >= monthAgo).length;
  const box = (label, value, sub) => html`<div class="card rounded-3xl p-5 min-w-0">${eyebrow(label)}<div class="font-display text-[40px] leading-none font-bold mt-1">${value}</div><div class="text-[12.5px] text-slate-500 mt-2 truncate">${sub}</div></div>`;
  return html`
    <div class="flex flex-col gap-4">
      <div class="grid sm:grid-cols-3 gap-4">
        ${box('Buổi được ghi nhận', sorted.length, `Gần nhất ${date(sorted[0].loggedDate)}`)}
        ${box('30 ngày qua', last30, 'buổi có kết quả')}
        ${box('Có nhận xét HLV', withFeedback, `${Math.round((withFeedback / sorted.length) * 100)}% số buổi`)}
      </div>
      <div class="card rounded-3xl p-5">
        ${cardHead('Lịch sử kết quả & nhận xét')}
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse" data-testid="result-table">
            <thead><tr class="text-left text-[11.5px] uppercase tracking-wider text-slate-500">
              <th class="font-bold py-2.5 px-3 border-b border-brand-line">Ngày</th>
              <th class="font-bold py-2.5 px-3 border-b border-brand-line">Nội dung buổi tập</th>
              <th class="font-bold py-2.5 px-3 border-b border-brand-line">Nhận xét HLV</th>
            </tr></thead>
            <tbody>
              ${sorted.map(r => html`
                <tr class="align-top" data-testid="result-item">
                  <td class="py-3.5 px-3 border-b border-brand-line/60 text-[13.5px] whitespace-nowrap">${date(r.loggedDate)}<div class="text-xs text-slate-400">${time(r.loggedDate)}</div></td>
                  <td class="py-3.5 px-3 border-b border-brand-line/60 text-[13.5px] font-semibold whitespace-pre-line">${r.activityDetails}</td>
                  <td class="py-3.5 px-3 border-b border-brand-line/60 text-[13.5px] text-slate-500 whitespace-pre-line">${r.coachFeedback || '—'}</td>
                </tr>`)}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function view(s) {
  return html`
    ${pageHeader('Tập luyện', 'Theo dõi tiến độ, giáo án và nhận xét từ huấn luyện viên', html`
      ${FEATURES.ai ? html`<a href="#/member/assistant" class="btn-secondary">${icon('sparkles', 'w-4 h-4')} Hỏi Trợ lý AI</a>` : ''}
      <a href="#/member/classes" class="btn-primary">${icon('plus', 'w-4 h-4')} Đặt lớp học</a>`)}
    ${tabs([
      { id: 'progress', label: 'Tiến độ' },
      { id: 'plans', label: 'Giáo án', count: s.plans.length },
      { id: 'results', label: 'Kết quả tập', count: s.results.length }
    ], s.tab)}
    ${s.tab === 'plans' ? plansTab(s) : s.tab === 'results' ? resultsTab(s) : progressTab(s)}`;
}

export default function MemberTraining(el, { query }) {
  return mountPage(el, {
    state: { tab: query.tab || 'progress', planFilter: 'all' },
    load: async () => {
      const d = await settle({
        progress: [memberApi.progress, null],
        plans: [memberApi.workoutPlans, []],
        results: [memberApi.workoutResults, []],
        attendances: [memberApi.attendances, []],
        schedule: [memberApi.schedule, []],
        current: [memberApi.currentSubscription, null]
      });
      const now = new Date();
      d.nextSession = (d.schedule || [])
        .filter(x => x.status !== 'POSTPONED' && toDate(x.startTime) > now)
        .sort((a, b) => toDate(a.startTime) - toDate(b.startTime))[0] || null;
      return d;
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'plan-filter': (t, e, ctx) => ctx.set({ planFilter: t.dataset.f })
    }
  });
}
