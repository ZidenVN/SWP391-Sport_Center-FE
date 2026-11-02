import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, statCard, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { receptionApi } from '../../api/endpoints.js';
import { fullName, phoneText, time, date, isoDate, badge, daysUntil } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openSellPackage } from '../../components/sellPackage.js';

// Điểm danh hội viên khi đến trung tâm: tìm -> Check-in (POST /receptionist/members/{id}/check-ins)
// -> báo gói còn hạn + lớp hôm nay. Mỗi hội viên tính 1 lượt / ngày, cần gói còn hiệu lực, chỉ Lễ tân được check-in (BE kiểm tra).

// một gói còn hiệu lực: tên, loại, hạn (gói lớp kèm tên lớp đang học)
function subLine(name, endDate, className, type) {
  const daysLeft = daysUntil(endDate);
  const warn = daysLeft !== null && daysLeft <= 7;
  return html`
    <div class="mt-1 first:mt-0" data-testid="checkin-sub">
      <div class="font-bold">${name || '—'}${type ? html` <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 align-middle">${type === 'CLASS' ? 'Gói lớp' : 'Membership'}</span>` : ''}</div>
      <div class="text-xs ${warn ? 'text-brand-lime font-bold' : 'text-white/70'}">Hết hạn ${date(endDate)}${daysLeft !== null ? ` · còn ${Math.max(0, daysLeft)} ngày` : ''}${className ? ` · lớp ${className}` : ''}${warn ? ', nhắc khách gia hạn' : ''}</div>
    </div>`;
}

function resultPanel(s) {
  if (s.last) {
    const c = s.last;
    // BE trả mọi gói đang hiệu lực (gói tự do + gói lớp có thể song song); bản cũ chỉ có packageName / subscriptionEndDate
    const subs = (c.activeSubscriptions || []).length
      ? c.activeSubscriptions
      : [{ packageName: c.packageName, endDate: c.subscriptionEndDate }];
    const warn = subs.some(x => { const d = daysUntil(x.endDate); return d !== null && d <= 7; });
    return html`
      <div class="rounded-2xl bg-brand-dark text-white p-5 mt-4" data-testid="checkin-success">
        <div class="flex items-center gap-3">
          <span class="w-11 h-11 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('check', 'w-6 h-6')}</span>
          <div class="min-w-0">
            <div class="font-display text-2xl font-extrabold leading-none">${c.memberName}</div>
            <div class="text-sm text-white/70 mt-1">Check-in lúc ${time(c.checkInTime)} · ${phoneText(c.phone)}</div>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
          <div class="rounded-xl bg-white/10 p-3">
            <div class="text-white/60 text-xs">${subs.length > 1 ? `${subs.length} gói đang dùng` : 'Gói đang dùng'}</div>
            ${subs.map(x => subLine(x.packageName, x.endDate, x.currentClassName, x.packageType))}
          </div>
          <div class="rounded-xl bg-white/10 p-3" data-testid="checkin-classes">
            <div class="text-white/60 text-xs">Kiểu check-in</div>
            ${c.checkInType === 'CLASS'
              ? html`<div class="font-semibold">Vào học lớp ${c.className || ''}${c.sessionStartTime ? ` · ${time(c.sessionStartTime)}` : ''}</div><div class="text-xs text-white/70">Membership đã hết hạn, chỉ vào đúng giờ buổi học của lớp</div>`
              : html`<div class="font-semibold">Sử dụng cơ sở vật chất</div><div class="text-xs text-white/70">${c.className ? `Có buổi lớp ${c.className}${c.sessionStartTime ? ` lúc ${time(c.sessionStartTime)}` : ''}` : 'Membership còn hạn'}</div>`}
          </div>
        </div>
        ${warn ? html`<a href="#/reception/members/${c.memberId}" class="btn-lime btn-sm mt-4">${icon('refresh-cw', 'w-3.5 h-3.5')} Gia hạn cho khách</a>` : ''}
      </div>`;
  }
  if (s.failed) {
    const noPackage = s.failed.code === 'ERR_SUBSCRIPTION_001';
    return html`
      <div class="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-4 mt-4 flex flex-col sm:flex-row sm:items-center gap-3" data-testid="checkin-error">
        ${icon('alert-circle', 'w-5 h-5 shrink-0')}
        <div class="flex-1 text-sm"><b>${s.failed.memberName}:</b> ${s.failed.message}</div>
        ${noPackage ? html`<button type="button" class="btn-primary btn-sm" data-action="sell" data-id="${s.failed.memberId}" data-testid="checkin-sell">${icon('package-plus', 'w-3.5 h-3.5')} Bán gói</button>` : ''}
      </div>`;
  }
  return '';
}

function searchPanel(s) {
  const searching = s.keyword.trim().length >= 2;
  const doneIds = new Map(s.isToday ? s.today.map(c => [c.memberId, c]) : []);
  return html`
    <div class="card p-5 min-w-0">
      <div class="font-bold mb-3">Tìm hội viên</div>
      <div class="relative">
        <span class="absolute left-3 top-3 text-slate-400">${icon('search', 'w-5 h-5')}</span>
        <input class="input pl-11 !py-3 !text-base" name="keyword" data-action="search" data-live value="${s.keyword}" autofocus
          placeholder="Tên, số điện thoại hoặc email..." autocomplete="off" data-testid="checkin-search" />
      </div>
      ${searching ? html`
        <div class="mt-3 divide-y divide-brand-line/60" data-testid="checkin-results">
          ${s.searching ? html`<div class="py-4 text-sm text-slate-500">Đang tìm...</div>` : s.results.length ? s.results.map(m => {
            const done = doneIds.get(m.memberId);
            return html`
              <div class="flex items-center gap-3 py-3" data-testid="checkin-row">
                ${memberAvatar(m, 'w-10 h-10 text-sm')}
                <div class="min-w-0 flex-1">
                  <div class="font-semibold truncate">${fullName(m)}</div>
                  <div class="text-xs text-slate-500 truncate">${phoneText(m.phone)} · ${m.email}</div>
                </div>
                ${m.status === 'INACTIVE' ? badge('INACTIVE', 'Đã khóa') : ''}
                ${done
                  ? html`<span class="text-xs font-bold text-emerald-700 whitespace-nowrap">${icon('check-circle-2', 'w-4 h-4 inline')} Đã vào ${time(done.checkInTime)}</span>`
                  : html`<button type="button" class="btn-primary btn-sm whitespace-nowrap" data-action="checkin" data-id="${m.memberId}" data-testid="checkin-btn">${icon('log-in', 'w-3.5 h-3.5')} Check-in</button>`}
              </div>`;
          }) : html`<div class="py-4 text-sm text-slate-500">Không tìm thấy hội viên "${s.keyword}"</div>`}
        </div>` : html`<p class="text-xs text-slate-500 mt-2">Gõ ít nhất 2 ký tự. Mỗi hội viên được tính 1 lượt mỗi ngày.</p>`}
      ${resultPanel(s)}
    </div>`;
}

function todayPanel(s) {
  return html`
    <div class="card min-w-0" data-testid="checkin-today">
      <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-line/60">
        <div class="font-bold">${s.isToday ? 'Lượt đến hôm nay' : `Lượt đến ngày ${date(s.date)}`} <span class="text-slate-400 font-semibold">(${s.today.length})</span></div>
        <input type="date" class="input !w-auto !py-1.5 text-sm" name="date" data-action="date" value="${s.date}" max="${isoDate(new Date())}" />
      </div>
      ${s.today.length ? html`
        <div class="divide-y divide-brand-line/60 max-h-[32rem] overflow-y-auto">
          ${s.today.map(c => html`
            <a href="#/reception/members/${c.memberId}" class="flex items-center gap-3 px-5 py-3 hover:bg-brand-cream/70" data-testid="checkin-item">
              <span class="font-display text-xl font-extrabold text-brand-dark w-14 shrink-0">${time(c.checkInTime)}</span>
              <div class="min-w-0 flex-1">
                <div class="font-semibold truncate">${c.memberName}</div>
                <div class="text-xs text-slate-500 truncate">${phoneText(c.phone)}${c.receptionistName ? ` · ${c.receptionistName}` : ''}${c.packageName ? ` · ${c.packageName}` : ''}</div>
              </div>
              ${icon('chevron-right', 'w-4 h-4 text-slate-300')}
            </a>`)}
        </div>` : emptyState(s.isToday ? 'Chưa có lượt check-in nào hôm nay' : 'Không có lượt check-in nào', 'door-open')}
    </div>`;
}

function view(s) {
  const hours = s.today.map(c => new Date(c.checkInTime).getHours());
  const peak = hours.length ? Object.entries(hours.reduce((m, h) => ({ ...m, [h]: (m[h] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0] : null;
  return html`
    ${pageHeader('Check-in', 'Điểm danh hội viên khi đến trung tâm')}
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      ${statCard(s.isToday ? 'Lượt đến hôm nay' : 'Lượt đến trong ngày', s.today.length, 'door-open', 'emerald')}
      ${statCard('Giờ đông nhất', peak ? `${peak[0]}h` : '—', 'clock', 'emerald', peak ? `${peak[1]} lượt` : '')}
      ${statCard('Lượt gần nhất', s.today[0] ? time(s.today[0].checkInTime) : '—', 'user-check', 'emerald', s.today[0]?.memberName || '')}
    </div>
    <div class="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
      ${searchPanel(s)}
      ${todayPanel(s)}
    </div>`;
}

export default function ReceptionCheckIn(el) {
  let timer = null;
  const today = isoDate(new Date());
  return mountPage(el, {
    state: { keyword: '', results: [], searching: false, date: today, isToday: true, last: null, failed: null },
    load: async ctx => ({ today: await receptionApi.checkInsByDate(ctx.state.date) }),
    view,
    actions: {
      search: (t, e, ctx) => {
        ctx.state.keyword = t.value;
        clearTimeout(timer);
        const kw = t.value.trim();
        if (kw.length < 2) {
          ctx.set({ results: [], searching: false });
          return;
        }
        ctx.set({ searching: true });
        timer = setTimeout(async () => {
          try {
            const results = await receptionApi.search(kw);
            if (ctx.state.keyword.trim() === kw) ctx.set({ results, searching: false });
          } catch (err) {
            ctx.set({ results: [], searching: false });
            toast(err.message, 'error');
          }
        }, 300);
      },
      checkin: async (btn, e, ctx) => {
        const m = ctx.state.results.find(x => String(x.memberId) === btn.dataset.id);
        btn.disabled = true;
        try {
          const res = await receptionApi.checkIn(m.memberId);
          toast(`Đã check-in ${fullName(m)}`);
          // về lại hôm nay để thấy lượt vừa ghi
          ctx.state.date = today;
          ctx.state.isToday = true;
          ctx.state.last = res;
          ctx.state.failed = null;
          ctx.reload();
        } catch (err) {
          ctx.set({ last: null, failed: { memberId: m.memberId, memberName: fullName(m), message: err.message, code: err.code } });
        }
      },
      sell: (btn, e, ctx) => {
        const m = ctx.state.results.find(x => String(x.memberId) === btn.dataset.id);
        openSellPackage({ member: m, onDone: () => ctx.set({ failed: null }) });
      },
      date: (t, e, ctx) => {
        ctx.state.date = t.value || today;
        ctx.state.isToday = ctx.state.date === today;
        ctx.reload();
      }
    }
  });
}
