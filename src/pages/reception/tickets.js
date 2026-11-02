import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, tabs, table, openModal, field, textarea, showFormErrors, toast, withBusy, statCard } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { receptionApi } from '../../api/endpoints.js';
import { dateTime, badge, fullName, phoneText } from '../../core/format.js';
import { openMemberPicker } from '../../components/memberPicker.js';

function view(s) {
  const kw = s.keyword.toLowerCase();
  const list = s.tickets
    .filter(t => s.tab === 'ALL' || t.status === s.tab)
    .filter(t => !kw || [t.content, t.memberName, String(t.memberId)].some(v => (v || '').toLowerCase().includes(kw)))
    .sort((a, b) => String(b.createdDate).localeCompare(String(a.createdDate)));
  const open = s.tickets.filter(t => t.status === 'OPEN').length;
  return html`
    ${pageHeader('Yêu cầu hỗ trợ', 'Ghi nhận và xử lý yêu cầu của hội viên', html`
      <button type="button" class="btn bg-brand-dark text-white hover:bg-emerald-800" data-action="new" data-testid="new-ticket">${icon('plus', 'w-4 h-4')} Ghi nhận yêu cầu</button>`)}
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      ${statCard('Đang chờ xử lý', open, 'inbox', 'amber')}
      ${statCard('Đã xử lý', s.tickets.length - open, 'check-circle-2', 'emerald')}
      ${statCard('Tổng yêu cầu', s.tickets.length, 'life-buoy', 'sky')}
    </div>
    <div class="card">
      <div class="px-4 pt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div class="flex-1">${tabs([
          { id: 'OPEN', label: 'Chờ xử lý', count: open },
          { id: 'RESOLVED', label: 'Đã xử lý', count: s.tickets.length - open },
          { id: 'ALL', label: 'Tất cả', count: s.tickets.length }
        ], s.tab)}</div>
        <div class="relative md:w-72 mb-5">
          <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
          <input class="input pl-9" name="keyword" data-action="search" data-live value="${s.keyword}" placeholder="Tìm theo hội viên, nội dung..." />
        </div>
      </div>
      <div data-testid="ticket-table">
        ${table({
          columns: [{ label: 'Hội viên' }, { label: 'Nội dung' }, { label: 'Tạo lúc' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
          rows: list.map(t => [
            html`<a href="#/reception/members/${t.memberId}" class="font-semibold hover:text-teal-700">${t.memberName}</a><div class="text-xs text-slate-500">#${t.memberId}</div>`,
            html`<span class="whitespace-pre-line">${t.content}</span>`,
            html`<span class="whitespace-nowrap">${dateTime(t.createdDate)}</span>`,
            badge(t.status),
            t.status === 'OPEN' ? html`<button type="button" class="btn-ghost btn-sm text-emerald-700 whitespace-nowrap" data-action="resolve" data-id="${t.ticketId}" data-testid="resolve-${t.ticketId}">${icon('check', 'w-3.5 h-3.5')} Đã xử lý</button>` : ''
          ]),
          empty: s.tab === 'OPEN' ? 'Không còn yêu cầu nào đang chờ 🎉' : 'Không có yêu cầu nào'
        })}
      </div>
    </div>`;
}

function contentModal(member, onCreated) {
  const modal = openModal({
    title: `Ghi nhận yêu cầu của ${fullName(member)}`,
    body: html`
      <form data-action="create" class="space-y-4" novalidate data-testid="ticket-form">
        <div class="text-sm text-slate-500">#${member.memberId} · ${phoneText(member.phone)}</div>
        ${field('Nội dung yêu cầu', textarea('content', '', { rows: 4, required: true, placeholder: 'VD: Thẻ tập bị lỗi, cần cấp lại...' }), 'Tối đa 2000 ký tự')}
        <div class="flex justify-end gap-2"><button type="button" data-action="cancel" class="btn-secondary">Hủy</button><button type="submit" class="btn bg-brand-dark text-white hover:bg-emerald-800">Ghi nhận</button></div>
      </form>`,
    actions: {
      create: async form => {
        const { content } = readForm(form);
        if (!content) { showFormErrors(form, { fields: { content: 'Vui lòng nhập nội dung' } }); return; }
        if (content.length > 2000) { showFormErrors(form, { fields: { content: 'Nội dung tối đa 2000 ký tự' } }); return; }
        const res = await withBusy(form, () => receptionApi.createTicket(member.memberId, content));
        if (res) { toast('Đã ghi nhận yêu cầu hỗ trợ'); modal.close(); onCreated(res); }
      }
    }
  });
}

export default function ReceptionTickets(el) {
  return mountPage(el, {
    state: { tab: 'OPEN', keyword: '' },
    load: async () => ({ tickets: await receptionApi.tickets() }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      new: (t, e, ctx) => openMemberPicker({
        title: 'Yêu cầu hỗ trợ của hội viên nào?',
        onPick: member => contentModal(member, () => { ctx.set({ tab: 'OPEN' }); ctx.reload(); })
      }),
      resolve: async (btn, e, ctx) => {
        const res = await withBusy(btn, () => receptionApi.resolveTicket(btn.dataset.id));
        if (res) { toast('Đã đánh dấu đã xử lý'); ctx.reload(); }
      }
    }
  });
}
