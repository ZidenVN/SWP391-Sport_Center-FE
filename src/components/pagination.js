import { html, icon } from '../core/dom.js';

// Phân trang dùng chung cho các màn quản lý: số dòng mỗi trang 5/10/20/100 + nút số trang.
// page có dạng Page của Spring: { content, number, size, totalElements, totalPages }
//   - BE đã phân trang: truyền thẳng page BE trả về, gọi API với { page: s.pageNo, size: s.pageSize }
//   - danh sách lấy hết một lần: paginate(list, s.pageNo, s.pageSize) cắt ở FE
// Nút có data-action="page" (data-page) và select data-action="page-size" -> dùng pagerActions() để gắn handler.
export const PAGE_SIZES = [5, 10, 20, 100];
export const DEFAULT_PAGE_SIZE = 10;

export function paginate(list, pageNo = 0, size = DEFAULT_PAGE_SIZE) {
  const totalElements = list.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const number = Math.min(Math.max(0, pageNo), totalPages - 1);
  return { content: list.slice(number * size, number * size + size), number, size, totalElements, totalPages };
}

// số trang hiển thị: luôn có trang đầu, cuối và 1 trang mỗi bên trang hiện tại; chỗ bị lược là '…'
function pageNumbers(current, total) {
  const keep = new Set([0, total - 1, current - 1, current, current + 1].filter(n => n >= 0 && n < total));
  const out = [];
  [...keep].sort((a, b) => a - b).forEach((n, i, arr) => {
    if (i && n - arr[i - 1] > 1) out.push(n - arr[i - 1] === 2 ? n - 1 : null);
    out.push(n);
  });
  return out;
}

// standalone: true khi đặt riêng dưới lưới thẻ (không nằm trong card bảng) -> tự bọc card, bỏ viền trên
export function pagination(page, { unit = 'mục', standalone = false } = {}) {
  if (!page || !page.totalElements) return '';
  const n = page.number || 0;
  const size = page.size || DEFAULT_PAGE_SIZE;
  const total = Math.max(1, page.totalPages || 1);
  const from = n * size + 1;
  const to = Math.min(page.totalElements, n * size + size);
  const nav = (target, disabled, content, label) => html`
    <button type="button" class="btn-secondary btn-sm !px-2.5" data-action="page" data-page="${target}" ${disabled ? 'disabled' : ''} aria-label="${label}" title="${label}">${content}</button>`;
  return html`
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-3 text-sm ${standalone ? 'card mt-5' : 'border-t border-brand-line/60'}" data-testid="pager">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500">
        <span>Hiển thị <b class="text-slate-800">${from}–${to}</b> / <b class="text-slate-800">${page.totalElements}</b> ${unit}</span>
        <label class="flex items-center gap-2">
          <span>Mỗi trang</span>
          <select class="input !w-auto !py-1.5 !pl-3 !pr-8 text-sm" name="pageSize" data-action="page-size" data-testid="page-size">
            ${PAGE_SIZES.map(v => html`<option value="${v}" ${v === size ? 'selected' : ''}>${v}</option>`)}
          </select>
        </label>
      </div>
      ${total > 1 ? html`
        <div class="flex flex-wrap items-center gap-1">
          ${nav(n - 1, n <= 0, icon('chevron-left', 'w-3.5 h-3.5'), 'Trang trước')}
          ${pageNumbers(n, total).map(p => p === null
            ? html`<span class="px-1.5 text-slate-400">…</span>`
            : html`<button type="button" class="btn-sm min-w-[2.25rem] ${p === n ? 'btn bg-brand-dark text-white' : 'btn-secondary'}" data-action="page" data-page="${p}" ${p === n ? 'aria-current="page"' : ''}>${p + 1}</button>`)}
          ${nav(n + 1, n + 1 >= total, icon('chevron-right', 'w-3.5 h-3.5'), 'Trang sau')}
        </div>` : ''}
    </div>`;
}

// handler cho nút trang + chọn số dòng. server: true -> tải lại từ BE, false -> chỉ vẽ lại
export function pagerActions({ server = false } = {}) {
  const go = (ctx, patch) => {
    Object.assign(ctx.state, patch);
    if (server) ctx.reload(); else ctx.rerender();
      };
  return {
    page: (t, e, ctx) => go(ctx, { pageNo: Math.max(0, Number(t.dataset.page) || 0) }),
    'page-size': (t, e, ctx) => go(ctx, { pageSize: Number(t.value) || DEFAULT_PAGE_SIZE, pageNo: 0 })
  };
}
