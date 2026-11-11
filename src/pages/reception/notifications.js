import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, toast, confirmDialog } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { receptionApi } from '../../api/endpoints.js';
import { fullName, phoneText, dateTime } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { matches } from '../../components/crud.js';

// Lễ tân gửi thông báo: POST /receptionist/notifications
//   MEMBERS + memberIds (mọi id phải là hội viên đang hoạt động) | ALL_ACTIVE (mọi hội viên đang hoạt động)
// Hội viên nhận ngay qua realtime và thấy trong mục Thông báo với nhãn "Từ trung tâm".
const TITLE_MAX = 100;
const CONTENT_MAX = 1000;
const LIST_LIMIT = 50;

// mẫu soạn nhanh cho các tình huống hay gặp ở quầy
const TEMPLATES = [
  { label: 'Nghỉ lễ', title: 'Lịch nghỉ lễ của trung tâm', content: 'Trung tâm tạm nghỉ từ ngày ... đến hết ngày .... Các lớp trong thời gian này được dời sang tuần sau. Chúc bạn kỳ nghỉ vui vẻ!' },
  { label: 'Bảo trì', title: 'Thông báo bảo trì phòng tập', content: 'Phòng ... tạm đóng để bảo trì vào ngày ... từ ... đến .... Mong bạn thông cảm và sắp xếp lịch tập phù hợp.' },
  { label: 'Ưu đãi', title: 'Ưu đãi gia hạn gói tập', content: 'Gia hạn gói tập trước ngày ... để nhận ưu đãi .... Liên hệ quầy lễ tân để được tư vấn.' },
  { label: 'Đồ thất lạc', title: 'Đồ thất lạc tại trung tâm', content: 'Quầy lễ tân đang giữ ... được tìm thấy tại .... Nếu là đồ của bạn, vui lòng đến quầy để nhận lại.' }
];

const isActive = m => (m.status || 'ACTIVE') === 'ACTIVE';

function recipientPanel(s, active) {
  const picked = new Set(s.picked);
  const list = active.filter(m => matches(s.keyword, [fullName(m), m.email, m.phone, String(m.memberId)]));
  const shown = list.slice(0, LIST_LIMIT);
  const allShownPicked = shown.length > 0 && shown.every(m => picked.has(m.memberId));
  return html`
    <div class="rounded-2xl border border-brand-line/70 bg-white/60 overflow-hidden" data-testid="recipient-panel">
      <div class="p-3 border-b border-brand-line/60 flex flex-col sm:flex-row sm:items-center gap-2">
        <div class="relative flex-1">
          <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
          <input class="input pl-9" name="keyword" data-action="search" data-live value="${s.keyword}" placeholder="Tìm tên, SĐT, email..." autocomplete="off" />
        </div>
        <button type="button" class="btn-secondary btn-sm whitespace-nowrap" data-action="pick-shown" ${shown.length ? '' : 'disabled'}>
          ${icon(allShownPicked ? 'square-minus' : 'square-check', 'w-3.5 h-3.5')} ${allShownPicked ? 'Bỏ chọn' : 'Chọn'} ${shown.length} đang hiện
        </button>
      </div>
      ${s.picked.length ? html`
        <div class="px-3 py-2 border-b border-brand-line/60 flex flex-wrap items-center gap-1.5 bg-brand-sand/40" data-testid="picked-chips">
          ${s.picked.map(id => s.byId[id]).filter(Boolean).map(m => html`
            <span class="inline-flex items-center gap-1 rounded-full bg-white border border-brand-line pl-2.5 pr-1 py-0.5 text-xs font-semibold text-brand-dark">
              ${fullName(m)}
              <button type="button" class="w-4 h-4 rounded-full hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center" data-action="toggle" data-member="${m.memberId}" aria-label="Bỏ ${fullName(m)}">${icon('x', 'w-3 h-3')}</button>
            </span>`)}
          <button type="button" class="text-xs font-bold text-rose-600 hover:underline ml-1" data-action="clear">Bỏ chọn hết</button>
        </div>` : ''}
      <div class="max-h-80 overflow-y-auto divide-y divide-brand-line/50">
        ${shown.length ? shown.map(m => html`
          <label class="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-brand-sand/50 has-[:checked]:bg-[#1E9E64]/5">
            <input type="checkbox" class="rounded accent-[#1E9E64]" data-action="toggle" data-member="${m.memberId}" ${picked.has(m.memberId) ? 'checked' : ''} />
            ${memberAvatar(m, 'w-8 h-8 text-xs')}
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold truncate">${fullName(m)}</span>
              <span class="block text-xs text-slate-500 truncate">#${m.memberId} · ${phoneText(m.phone)} · ${m.email}</span>
            </span>
          </label>`) : emptyState(s.keyword ? 'Không tìm thấy hội viên đang hoạt động phù hợp' : 'Chưa có hội viên đang hoạt động', 'users')}
      </div>
      ${list.length > LIST_LIMIT ? html`<div class="px-3 py-2 text-xs text-slate-500 border-t border-brand-line/60">Đang hiện ${LIST_LIMIT}/${list.length} hội viên, gõ để tìm thêm.</div>` : ''}
    </div>`;
}

function view(s) {
  const active = s.members.filter(isActive);
  const all = s.mode === 'ALL_ACTIVE';
  const count = all ? active.length : s.picked.length;
  return html`
    ${pageHeader('Gửi thông báo', 'Gửi tin tới một vài hội viên hoặc toàn bộ hội viên đang hoạt động. Hội viên nhận ngay trên ứng dụng.')}
    <div class="grid lg:grid-cols-5 gap-6">
      <form class="card p-5 lg:col-span-3 space-y-5" data-action="send" novalidate data-testid="notify-form">
        <div>
          <div class="field-label text-xs font-bold text-slate-600 mb-2">Người nhận</div>
          <div class="grid sm:grid-cols-2 gap-2" role="radiogroup">
            ${[
              ['MEMBERS', 'user-check', 'Chọn hội viên', 'Gửi cho từng người cụ thể'],
              ['ALL_ACTIVE', 'users', 'Tất cả hội viên', `${active.length} hội viên đang hoạt động`]
            ].map(([id, ic, label, hint]) => html`
              <button type="button" role="radio" aria-checked="${s.mode === id}" data-action="mode" data-mode="${id}" data-testid="mode-${id}"
                class="flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${s.mode === id ? 'border-[#1E9E64] bg-[#1E9E64]/10 ring-2 ring-[#1E9E64]/20' : 'border-brand-line bg-white/60 hover:border-[#1E9E64]/60'}">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.mode === id ? 'bg-brand-dark text-brand-lime' : 'bg-brand-sand text-brand-deep'}">${icon(ic, 'w-4 h-4')}</span>
                <span><span class="block text-sm font-bold text-brand-dark">${label}</span><span class="block text-xs text-slate-500">${hint}</span></span>
              </button>`)}
          </div>
        </div>
        ${all ? html`
          <div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 flex gap-2">${icon('megaphone', 'w-4 h-4 mt-0.5 shrink-0')} Thông báo sẽ gửi tới <b>${active.length}</b> hội viên đang hoạt động. Hội viên đã khóa không nhận.</div>`
          : recipientPanel(s, active)}
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="field-label text-xs font-bold text-slate-600">Mẫu soạn nhanh</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${TEMPLATES.map((t, i) => html`<button type="button" class="rounded-full border border-brand-line bg-white/70 px-3 py-1 text-xs font-semibold text-brand-deep hover:border-[#1E9E64] hover:bg-[#1E9E64]/10" data-action="template" data-index="${i}">${t.label}</button>`)}
          </div>
        </div>
        <label class="block">
          <span class="flex items-center justify-between mb-1"><span class="field-label text-xs font-bold text-slate-600">Tiêu đề</span><span class="text-[11px] text-slate-400" data-count="title">${s.title.length}/${TITLE_MAX}</span></span>
          <input class="input" name="title" maxlength="${TITLE_MAX}" value="${s.title}" data-action="draft" data-live placeholder="VD: Lịch nghỉ lễ 2/9" data-testid="notify-title" />
        </label>
        <label class="block">
          <span class="flex items-center justify-between mb-1"><span class="field-label text-xs font-bold text-slate-600">Nội dung</span><span class="text-[11px] text-slate-400" data-count="content">${s.content.length}/${CONTENT_MAX}</span></span>
          <textarea class="input" name="content" rows="6" maxlength="${CONTENT_MAX}" data-action="draft" data-live placeholder="Nội dung hội viên sẽ đọc..." data-testid="notify-content">${s.content}</textarea>
        </label>
        <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <span class="text-sm text-slate-500">Sẽ gửi tới <b class="text-brand-dark" data-testid="recipient-count">${count}</b> hội viên</span>
          <button type="submit" class="btn-primary" data-testid="notify-send" ${s.sending ? 'disabled' : ''}>
            ${icon(s.sending ? 'loader-2' : 'send', `w-4 h-4 ${s.sending ? 'animate-spin' : ''}`)} ${s.sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>

      <div class="lg:col-span-2 space-y-6">
        <section class="card p-5">
          <h2 class="font-bold mb-3 flex items-center gap-2">${icon('smartphone', 'w-4 h-4 text-[#1E9E64]')} Hội viên sẽ thấy</h2>
          <div class="rounded-2xl border border-emerald-200 ring-2 ring-emerald-100 bg-white/80 p-4 flex gap-3" data-testid="notify-preview">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">${icon('message-square-text', 'w-5 h-5')}</div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500"></span><span class="font-bold break-words" data-preview="title">${s.title || 'Tiêu đề thông báo'}</span></div>
              <p class="text-sm text-slate-700 mt-1 whitespace-pre-line break-words" data-preview="content">${s.content || 'Nội dung thông báo sẽ hiện ở đây.'}</p>
              <div class="text-xs text-slate-400 mt-2">Từ trung tâm · vừa xong</div>
            </div>
          </div>
        </section>
        <section class="card p-5">
          <h2 class="font-bold mb-3 flex items-center gap-2">${icon('history', 'w-4 h-4 text-[#1E9E64]')} Đã gửi trong phiên này</h2>
          ${s.sent.length ? html`
            <ul class="space-y-3" data-testid="sent-log">
              ${s.sent.map(x => html`
                <li class="rounded-xl bg-brand-sand/50 p-3">
                  <div class="text-sm font-semibold break-words">${x.title}</div>
                  <div class="text-xs text-slate-500 mt-0.5">${dateTime(x.at)} · ${x.all ? 'Tất cả hội viên' : 'Hội viên chọn'} · <b class="text-brand-dark">${x.count}</b> người nhận</div>
                </li>`)}
            </ul>` : html`<p class="text-sm text-slate-500">Chưa gửi thông báo nào.</p>`}
        </section>
      </div>
    </div>`;
}

const clearFieldError = (form, name) => form?.querySelector(`[name="${name}"]`)?.closest('label')?.querySelector('.field-error')?.remove();

function showError(form, name, message) {
  const el = form.querySelector(`[name="${name}"]`);
  const box = el.closest('label');
  box.querySelector('.field-error')?.remove();
  box.insertAdjacentHTML('beforeend', `<span class="field-error block text-xs text-rose-600 mt-1"></span>`);
  box.querySelector('.field-error').textContent = message;
  el.focus();
}

export default function ReceptionNotifications(el) {
  return mountPage(el, {
    state: { mode: 'MEMBERS', keyword: '', picked: [], title: '', content: '', sending: false, sent: [] },
    load: async () => {
      const members = await receptionApi.allMembers();
      return { members, byId: Object.fromEntries(members.map(m => [m.memberId, m])) };
    },
    view,
    actions: {
      mode: (t, e, ctx) => ctx.set({ mode: t.dataset.mode }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      toggle: (t, e, ctx) => {
        const id = Number(t.dataset.member);
        const picked = ctx.state.picked.includes(id) ? ctx.state.picked.filter(x => x !== id) : [...ctx.state.picked, id];
        ctx.set({ picked });
      },
      'pick-shown': (t, e, ctx) => {
        const s = ctx.state;
        const shown = s.members.filter(isActive).filter(m => matches(s.keyword, [fullName(m), m.email, m.phone, String(m.memberId)])).slice(0, LIST_LIMIT).map(m => m.memberId);
        const allPicked = shown.every(id => s.picked.includes(id));
        ctx.set({ picked: allPicked ? s.picked.filter(id => !shown.includes(id)) : [...new Set([...s.picked, ...shown])] });
      },
      clear: (t, e, ctx) => ctx.set({ picked: [] }),
      // gõ tiêu đề / nội dung: chỉ cập nhật bộ đếm + xem trước, không vẽ lại cả trang
      draft: (t, e, ctx) => {
        ctx.state[t.name] = t.value;
        const max = t.name === 'title' ? TITLE_MAX : CONTENT_MAX;
        const counter = ctx.el.querySelector(`[data-count="${t.name}"]`);
        if (counter) counter.textContent = `${t.value.length}/${max}`;
        const preview = ctx.el.querySelector(`[data-preview="${t.name}"]`);
        if (preview) preview.textContent = t.value || (t.name === 'title' ? 'Tiêu đề thông báo' : 'Nội dung thông báo sẽ hiện ở đây.');
        if (t.value.trim()) clearFieldError(t.form, t.name);
      },
      template: (t, e, ctx) => {
        const tpl = TEMPLATES[Number(t.dataset.index)];
        ctx.set({ title: tpl.title, content: tpl.content });
      },
      send: async (form, e, ctx) => {
        e.preventDefault();
        const s = ctx.state;
        if (s.sending) return;
        const title = s.title.trim();
        const content = s.content.trim();
        const all = s.mode === 'ALL_ACTIVE';
        if (!all && !s.picked.length) {
          toast('Chọn ít nhất 1 hội viên nhận thông báo', 'warning');
          return;
        }
        if (!title) return showError(form, 'title', 'Nhập tiêu đề thông báo');
        if (!content) return showError(form, 'content', 'Nhập nội dung thông báo');
        const total = all ? s.members.filter(isActive).length : s.picked.length;
        if (all && !(await confirmDialog(`Gửi "${title}" tới ${total} hội viên đang hoạt động?`, { title: 'Gửi cho tất cả hội viên', confirmText: 'Gửi' }))) return;
        ctx.set({ sending: true });
        try {
          const res = await receptionApi.sendNotification(all
            ? { title, content, targetMode: 'ALL_ACTIVE' }
            : { title, content, targetMode: 'MEMBERS', memberIds: s.picked });
          const n = res?.recipientCount ?? total;
          toast(`Đã gửi thông báo tới ${n} hội viên`, 'success');
          ctx.set({ sending: false, title: '', content: '', picked: [], sent: [{ title, count: n, all, at: new Date().toISOString() }, ...s.sent].slice(0, 10) });
        } catch (err) {
          ctx.set({ sending: false });
          toast(err.message, 'error');
        }
      }
    }
  });
}
