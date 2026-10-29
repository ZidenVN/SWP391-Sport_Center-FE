import { html, icon, refreshIcons } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, textarea, tabs } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { quizAdminApi } from '../../api/endpoints.js';
import { badge } from '../../core/format.js';
import { openFormModal, confirmAction, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

// Bộ câu hỏi khảo sát hội viên làm sau lần đăng nhập đầu (GET/POST/PUT /quiz-questions, quyền MANAGE_QUIZ).
// Hội viên phải trả lời đủ mọi câu đang dùng mới tự đặt lớp được. Câu hệ thống (chiều cao, cân nặng, mục tiêu)
// ghi vào hồ sơ hội viên nên không sửa / ẩn được. Ẩn câu = DELETE (giữ câu trả lời cũ), khôi phục = PATCH .../restore.
const TYPES = [
  { value: 'SINGLE', label: 'Chọn 1 đáp án', icon: 'circle-dot' },
  { value: 'MULTIPLE', label: 'Chọn nhiều đáp án', icon: 'list-checks' },
  { value: 'NUMBER', label: 'Nhập số', icon: 'hash' },
  { value: 'TEXT', label: 'Nhập văn bản', icon: 'type' }
];
const typeOf = v => TYPES.find(t => t.value === v) || TYPES[0];
const hasOptions = type => type === 'SINGLE' || type === 'MULTIPLE';

// một dòng đáp án trong form; i là số thứ tự duy nhất trong form (không phải thứ tự hiển thị)
const optionRow = (i, o = {}) => html`
  <div class="flex items-start gap-2" data-option-row>
    <input type="hidden" name="opt_id_${i}" value="${o.optionId ?? ''}" />
    <input class="input flex-1" name="opt_content_${i}" value="${o.content ?? ''}" placeholder="Nội dung đáp án" maxlength="255" />
    <input class="input w-28" name="opt_code_${i}" value="${o.code ?? ''}" placeholder="Mã (tùy chọn)" maxlength="50" />
    <button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 mt-1" data-remove-option title="Xóa đáp án">${icon('x', 'w-4 h-4')}</button>
  </div>`;

function form(q = {}, nextOrder = 1) {
  const type = q.type || 'SINGLE';
  const options = (q.options || []).filter(o => o.status !== 'INACTIVE');
  const rows = options.length ? options : [{}, {}];
  return html`
    ${field('Nội dung câu hỏi', textarea('content', q.content, { rows: 2, required: true, placeholder: 'VD: Bạn từng tập môn nào trước đây?' }))}
    <div class="grid grid-cols-2 gap-3">
      ${field('Loại câu', select('type', TYPES, type, { required: true }))}
      ${field('Thứ tự hiển thị', input('displayOrder', { type: 'number', value: q.displayOrder ?? nextOrder, required: true, attrs: 'min="1"' }))}
    </div>
    ${field('Mã câu hỏi', input('code', { value: q.code, placeholder: 'VD: EXPERIENCE (tùy chọn, không trùng)', attrs: 'maxlength="50"' }), 'Dùng để nhận diện câu khi xuất dữ liệu; bỏ trống nếu không cần')}
    <div data-number-config class="${type === 'NUMBER' ? '' : 'hidden'}">
      <div class="grid grid-cols-3 gap-3">
        ${field('Nhỏ nhất', input('minValue', { type: 'number', value: q.minValue, attrs: 'step="any"' }))}
        ${field('Lớn nhất', input('maxValue', { type: 'number', value: q.maxValue, attrs: 'step="any"' }))}
        ${field('Đơn vị', input('unit', { value: q.unit, placeholder: 'VD: giờ', attrs: 'maxlength="20"' }))}
      </div>
    </div>
    <div data-option-config class="${hasOptions(type) ? '' : 'hidden'}">
      <div class="text-sm font-semibold text-slate-700 mb-1.5">Đáp án <span class="font-normal text-slate-500">(ít nhất 2)</span></div>
      <div class="space-y-2" data-option-list>${rows.map((o, i) => optionRow(i, o))}</div>
      <button type="button" class="btn-secondary btn-sm mt-2" data-add-option>${icon('plus', 'w-3.5 h-3.5')} Thêm đáp án</button>
      <p class="text-xs text-rose-600 mt-1.5 hidden" data-error="options"></p>
      ${q.questionId && (q.options || []).some(o => o.status === 'INACTIVE') ? html`<p class="text-xs text-slate-500 mt-1.5">Đáp án đã có hội viên chọn mà bị xóa sẽ được ẩn (giữ lịch sử), không xóa hẳn.</p>` : ''}
    </div>`;
}

// đổi loại câu thì hiện ô cấu hình tương ứng; thêm / xóa dòng đáp án
function mountForm(modal) {
  const formEl = modal.el.querySelector('form');
  let seq = formEl.querySelectorAll('[data-option-row]').length;
  const sync = () => {
    const type = formEl.type.value;
    formEl.querySelector('[data-number-config]').classList.toggle('hidden', type !== 'NUMBER');
    formEl.querySelector('[data-option-config]').classList.toggle('hidden', !hasOptions(type));
  };
  formEl.type.addEventListener('change', sync);
  formEl.addEventListener('click', e => {
    if (e.target.closest('[data-add-option]')) {
      formEl.querySelector('[data-option-list]').insertAdjacentHTML('beforeend', String(optionRow(seq++)));
      refreshIcons();
      formEl.querySelector('[data-option-list] [data-option-row]:last-child input[name^="opt_content_"]')?.focus();
    }
    const rm = e.target.closest('[data-remove-option]');
    if (rm) rm.closest('[data-option-row]').remove();
  });
}

// gom các dòng đáp án theo thứ tự trên form
function readOptions(d) {
  return Object.keys(d)
    .filter(k => k.startsWith('opt_content_'))
    .map(k => k.slice('opt_content_'.length))
    .map(i => ({ optionId: d[`opt_id_${i}`] ? Number(d[`opt_id_${i}`]) : undefined, content: d[`opt_content_${i}`], code: d[`opt_code_${i}`] || null }));
}

function validate(d) {
  const e = {};
  if (!d.content) e.content = 'Không được để trống';
  if (!(Number(d.displayOrder) >= 1)) e.displayOrder = 'Từ 1 trở lên';
  if (d.type === 'NUMBER' && d.minValue !== undefined && d.maxValue !== undefined && Number(d.minValue) > Number(d.maxValue)) e.maxValue = 'Phải lớn hơn hoặc bằng giá trị nhỏ nhất';
  return e;
}

const payload = d => ({
  content: d.content,
  type: d.type,
  code: d.code || null,
  displayOrder: Number(d.displayOrder),
  minValue: d.type === 'NUMBER' && d.minValue !== undefined ? Number(d.minValue) : null,
  maxValue: d.type === 'NUMBER' && d.maxValue !== undefined ? Number(d.maxValue) : null,
  unit: d.type === 'NUMBER' ? d.unit || null : null,
  options: hasOptions(d.type) ? readOptions(d) : []
});

// openFormModal chỉ báo lỗi theo tên ô; đáp án là danh sách nên kiểm riêng trước khi gửi
function submitWith(run) {
  return async d => {
    const errorEl = document.querySelector('[data-option-config] [data-error="options"]');
    if (hasOptions(d.type) && readOptions(d).length < 2) {
      errorEl.textContent = 'Cần ít nhất 2 đáp án có nội dung';
      errorEl.classList.remove('hidden');
      return undefined;
    }
    errorEl?.classList.add('hidden');
    return run(payload(d));
  };
}

function answerCell(q) {
  if (q.type === 'NUMBER') {
    const range = q.minValue != null || q.maxValue != null ? `${q.minValue ?? '…'} – ${q.maxValue ?? '…'}` : 'Không giới hạn';
    return html`<span class="text-sm text-slate-600">${range}${q.unit ? ` ${q.unit}` : ''}</span>`;
  }
  if (q.type === 'TEXT') return html`<span class="text-sm text-slate-400">Câu trả lời tự do</span>`;
  const active = (q.options || []).filter(o => o.status !== 'INACTIVE');
  return html`
    <div class="flex flex-wrap gap-1 max-w-sm">
      ${active.map(o => html`<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-sand text-slate-700">${o.content}</span>`)}
      ${active.length < (q.options || []).length ? html`<span class="text-[11px] text-slate-400">+${q.options.length - active.length} đã ẩn</span>` : ''}
    </div>`;
}

function view(s) {
  const count = st => s.questions.filter(q => !st || q.status === st).length;
  const list = s.questions
    .filter(q => !s.tab || q.status === s.tab)
    .filter(q => matches(s.keyword, [q.content, q.code, ...(q.options || []).map(o => o.content)]));
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${pageHeader('Câu hỏi khảo sát', 'Hội viên trả lời sau lần đăng nhập đầu, bắt buộc xong mới tự đặt lớp được. Mọi câu đang dùng đều bắt buộc.',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm câu hỏi</button>`)}
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
      ${tabs([
        { id: 'ACTIVE', label: 'Đang dùng', count: count('ACTIVE') },
        { id: 'INACTIVE', label: 'Đã ẩn', count: count('INACTIVE') },
        { id: '', label: 'Tất cả', count: count('') }
      ], s.tab)}
      <div class="mb-5">${searchBox(s.keyword, 'Tìm câu hỏi, mã, đáp án...')}</div>
    </div>
    <div class="card" data-testid="quiz-table">
      ${list.length ? html`${table({
        columns: [{ label: '#', cls: 'w-12' }, { label: 'Câu hỏi' }, { label: 'Loại', cls: 'whitespace-nowrap' }, { label: 'Đáp án / giới hạn' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: page.content.map(q => [
          html`<span class="font-mono text-xs text-slate-500">${q.displayOrder}</span>`,
          html`<div class="font-semibold">${q.content}</div>
            <div class="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-slate-500">
              ${q.code ? html`<span class="font-mono">${q.code}</span>` : ''}
              ${q.systemQuestion ? html`<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700" title="Ghi vào hồ sơ hội viên, không sửa / ẩn được">${icon('lock', 'w-3 h-3')} Hệ thống</span>` : ''}
            </div>`,
          html`<span class="inline-flex items-center gap-1.5 text-sm">${icon(typeOf(q.type).icon, 'w-3.5 h-3.5 text-slate-400')} ${typeOf(q.type).label}</span>`,
          answerCell(q),
          q.status === 'ACTIVE' ? badge('ACTIVE', 'Đang dùng') : badge('INACTIVE', 'Đã ẩn'),
          html`
            <div class="flex justify-end gap-1">
              ${q.systemQuestion ? '' : html`<button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${q.questionId}" title="Sửa" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')}</button>`}
              ${q.systemQuestion ? '' : q.status === 'ACTIVE'
                ? html`<button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" data-action="hide" data-id="${q.questionId}" title="Ẩn câu hỏi" data-testid="row-hide">${icon('eye-off', 'w-3.5 h-3.5')}</button>`
                : html`<button type="button" class="btn-ghost btn-sm text-emerald-700 hover:bg-emerald-50" data-action="restore" data-id="${q.questionId}" title="Dùng lại" data-testid="row-restore">${icon('rotate-ccw', 'w-3.5 h-3.5')}</button>`}
            </div>`
        ])
      })}${pagination(page, { unit: 'câu hỏi' })}` : emptyState(s.questions.length ? 'Không có câu hỏi phù hợp' : 'Chưa có câu hỏi', 'clipboard-list')}
    </div>`;
}

export default function ManagerQuiz(el) {
  const find = (ctx, id) => ctx.state.questions.find(q => String(q.questionId) === id);
  const nextOrder = ctx => Math.max(0, ...ctx.state.questions.map(q => q.displayOrder || 0)) + 1;
  return mountPage(el, {
    state: { tab: 'ACTIVE', keyword: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => ({ questions: await quizAdminApi.list() }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab, pageNo: 0 }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm câu hỏi khảo sát', size: 'max-w-xl', fields: form({}, nextOrder(ctx)), validate, success: 'Đã thêm câu hỏi',
        onMount: mountForm,
        submit: submitWith(p => quizAdminApi.create(p)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const q = find(ctx, t.dataset.id);
        openFormModal({
          title: `Sửa câu hỏi #${q.displayOrder}`, size: 'max-w-xl', fields: form(q), validate, success: 'Đã cập nhật câu hỏi',
          onMount: mountForm,
          submit: submitWith(p => quizAdminApi.update(q.questionId, p)), onDone: () => ctx.reload()
        });
      },
      hide: async (t, e, ctx) => {
        const q = find(ctx, t.dataset.id);
        if (await confirmAction(`Ẩn câu hỏi "${q.content}"?\nHội viên làm khảo sát từ giờ sẽ không thấy câu này; câu trả lời cũ vẫn được giữ.`,
          () => quizAdminApi.hide(q.questionId), { confirmText: 'Ẩn câu hỏi', success: 'Đã ẩn câu hỏi' })) ctx.reload();
      },
      restore: async (t, e, ctx) => {
        const q = find(ctx, t.dataset.id);
        if (await confirmAction(`Dùng lại câu hỏi "${q.content}"?\nCâu này sẽ bắt buộc với mọi hội viên làm khảo sát từ giờ.`,
          () => quizAdminApi.restore(q.questionId), { title: 'Dùng lại câu hỏi', confirmText: 'Dùng lại', success: 'Đã dùng lại câu hỏi' })) ctx.reload();
      }
    }
  });
}
