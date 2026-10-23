import { html, render, icon } from '../core/dom.js';
import { openModal, loading, emptyState, errorState } from '../core/ui.js';
import { receptionApi } from '../api/endpoints.js';
import { fullName, phoneText } from '../core/format.js';

export function memberAvatar(m, size = 'w-10 h-10 text-sm') {
  return html`<span class="${size} rounded-full bg-brand-dark text-brand-lime font-bold flex items-center justify-center shrink-0">${(m.firstName || '?').charAt(0).toUpperCase()}</span>`;
}

// bỏ dấu để gõ "nguyen" vẫn ra "Nguyễn"
const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

// Hộp chọn hội viên: mở ra là thấy danh sách, gõ tên / SĐT / email để lọc. onPick(member) có thể trả Promise.
export function openMemberPicker({ title = 'Chọn hội viên', onPick }) {
  let all = null;
  let results = [];
  let keyword = '';

  const listView = () => html`
    <div class="text-xs text-slate-500 mb-2">${keyword.trim() ? `${results.length} kết quả` : `${all.length} hội viên`}</div>
    <ul class="divide-y divide-slate-100 max-h-80 overflow-y-auto -mx-2" data-testid="picker-results">
      ${results.map(m => html`
        <li>
          <button type="button" data-action="pick" data-id="${m.memberId}" class="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 text-left">
            ${memberAvatar(m, 'w-9 h-9 text-sm')}
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-sm">${fullName(m)}</span>
              <span class="block text-xs text-slate-500 truncate">#${m.memberId} · ${phoneText(m.phone)} · ${m.email}</span>
            </span>
            ${icon('chevron-right', 'w-4 h-4 text-slate-400')}
          </button>
        </li>`)}
    </ul>`;

  const setResults = content => render(modal.el.querySelector('#picker-body'), content);

  function filter() {
    const kw = norm(keyword.trim());
    results = !kw ? all : all.filter(m => [fullName(m), m.phone, m.email, m.memberId].some(v => norm(v).includes(kw)));
    setResults(results.length
      ? listView()
      : emptyState(all.length ? `Không tìm thấy hội viên "${keyword.trim()}"` : 'Chưa có hội viên nào', 'user-x'));
  }

  async function load() {
    setResults(loading('Đang tải hội viên...'));
    try {
      all = (await receptionApi.allMembers()).filter(m => m.status !== 'INACTIVE');
      filter();
    } catch (err) {
      setResults(errorState(err, 'retry'));
    }
  }

  const modal = openModal({
    title,
    body: html`
      <div class="relative mb-4">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="pickerKeyword" data-action="type" data-live placeholder="Lọc theo tên, số điện thoại hoặc email..." autocomplete="off" />
      </div>
      <div id="picker-body"></div>`,
    actions: {
      // ô nhập còn bắn 'change' khi mất focus (lúc bấm chọn) -> không render lại kẻo nuốt mất cú click
      type: input => {
        if (input.value === keyword) return;
        keyword = input.value;
        if (all) filter();
      },
      pick: async btn => {
        const m = results.find(x => String(x.memberId) === btn.dataset.id);
        modal.close();
        if (onPick) await onPick(m);
      },
      retry: () => load()
    }
  });
  load();
  return modal;
}
