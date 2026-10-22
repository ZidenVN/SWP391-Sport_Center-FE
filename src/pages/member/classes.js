import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, confirmDialog, withBusy, toast } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { classApi, memberApi } from '../../api/endpoints.js';
import { classCard, isBookable } from '../../components/classCard.js';
import { date, timeRange, toDate } from '../../core/format.js';
import { openCoachInfo, coachFromButton } from '../../components/coachInfo.js';
import { expiryBanner } from '../../components/memberAlerts.js';

function filtered(s) {
  const kw = (s.keyword || '').toLowerCase();
  return s.classes
    .filter(c => !s.subject || c.subjectName === s.subject)
    .filter(c => !kw || [c.subjectName, c.coachName, c.roomName].some(v => (v || '').toLowerCase().includes(kw)))
    .filter(c => s.showAll || isBookable(c))
    .sort((a, b) => (toDate(a.startTime) - toDate(b.startTime)));
}

function view(s) {
  const myActive = new Map(s.registrations.filter(r => r.status === 'REGISTERED').map(r => [r.classId, r]));
  const subjects = [...new Set(s.classes.map(c => c.subjectName))].sort();
  const list = filtered(s);
  return html`
    ${pageHeader('Lớp học', 'Chọn lớp phù hợp và đặt chỗ chỉ với một cú nhấp')}
    ${!s.current ? html`
      <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3">
        ${icon('alert-circle', 'w-5 h-5 shrink-0')}
        <span class="flex-1">Bạn cần có gói tập còn hiệu lực để đặt lớp.</span>
        <a href="#/member/packages" class="btn-primary btn-sm">Mua gói</a>
      </div>` : expiryBanner(s.current)}
    <div class="card p-4 mb-5 flex flex-col md:flex-row gap-3 md:items-center">
      <div class="relative flex-1">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="keyword" data-action="search" data-live placeholder="Tìm theo môn, HLV, phòng..." value="${s.keyword || ''}" />
      </div>
      <select class="input md:w-56" name="subject" data-action="subject">
        <option value="">Tất cả bộ môn</option>
        ${subjects.map(n => html`<option ${n === s.subject ? 'selected' : ''}>${n}</option>`)}
      </select>
      <label class="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
        <input type="checkbox" name="showAll" data-action="toggle-all" ${s.showAll ? 'checked' : ''} class="rounded" /> Hiện cả lớp đã qua / hết chỗ
      </label>
    </div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="class-list">
        ${list.map(c => {
          const reg = myActive.get(c.classId);
          let footer;
          if (reg) {
            footer = html`
              <span class="mr-auto text-xs font-bold text-indigo-600 flex items-center gap-1">${icon('check-circle-2', 'w-4 h-4')} Đã đăng ký</span>
              <button type="button" class="btn-secondary btn-sm" data-action="cancel-booking" data-id="${reg.registrationId}">Hủy</button>`;
          } else if (isBookable(c)) {
            footer = html`<button type="button" class="btn-primary btn-sm" data-action="book" data-id="${c.classId}">${icon('plus', 'w-3.5 h-3.5')} Đặt lớp</button>`;
          } else {
            footer = html`<span class="text-xs text-slate-400">Không nhận đăng ký</span>`;
          }
          return classCard(c, footer);
        })}
      </div>` : emptyState(s.classes.length ? 'Không có lớp phù hợp bộ lọc' : 'Hiện chưa có lớp học nào', 'calendar-x')}`;
}

export default function MemberClasses(el) {
  return mountPage(el, {
    state: { keyword: '', subject: '', showAll: false },
    load: async () => {
      const res = await settle({
        classes: [classApi.list, null],
        registrations: [memberApi.registrations, []],
        current: [memberApi.currentSubscription, null]
      });
      if (res.classesError) throw res.classesError;
      return res;
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      subject: (t, e, ctx) => ctx.set({ subject: t.value }),
      'toggle-all': (t, e, ctx) => ctx.set({ showAll: t.checked }),
      'coach-info': btn => openCoachInfo(coachFromButton(btn)),
      book: async (btn, e, ctx) => {
        const c = ctx.state.classes.find(x => String(x.classId) === btn.dataset.id);
        const ok = await confirmDialog(`Đặt lớp ${c.subjectName}\n${date(c.startTime)} · ${timeRange(c.startTime, c.endTime)} · ${c.roomName}`, { title: 'Xác nhận đặt lớp', confirmText: 'Đặt lớp' });
        if (!ok) return;
        const res = await withBusy(btn, () => memberApi.register(c.classId));
        if (res) {
          toast(`Đã đặt lớp ${c.subjectName}`);
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
