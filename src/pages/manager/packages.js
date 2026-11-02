import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, textarea } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi, subjectApi } from '../../api/endpoints.js';
import { money, badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';
import { packageScope } from '../../components/billing.js';

// Gói tập theo BE (MembershipPackageRequestDTO):
// - MEMBERSHIP: vào trung tâm, không gắn môn. Kích hoạt ở lần check-in đầu hoặc khi đăng ký lớp.
// - CLASS: gói lớp, gắn đúng 1 môn (subjectId). Mỗi lần đăng ký lớp dùng 1 gói lớp đang chờ, cùng môn và cùng thời hạn với lớp.
// Gói đã có người mua chỉ sửa được tên, mô tả, giá, trạng thái (BE trả ERR_PACKAGE_409).
const TYPES = [
  ['MEMBERSHIP', 'Membership', 'Vào trung tâm, kích hoạt ở lần check-in đầu'],
  ['CLASS', 'Gói lớp', 'Học 1 lớp của 1 môn, thời hạn bằng thời hạn lớp']
];
const subjectIdOf = p => p.subject?.subjectId ?? p.subjectId ?? null;

function form(s, p = {}) {
  const type = p.packageType === 'CLASS' ? 'CLASS' : 'MEMBERSHIP';
  const chosen = String(subjectIdOf(p) ?? '');
  return html`
    ${field('Tên gói', input('packageName', { value: p.packageName, required: true, placeholder: 'VD: Membership 1 tháng / Yoga 30 ngày' }))}
    ${field('Loại gói', html`
      <div class="grid sm:grid-cols-2 gap-2" role="radiogroup" data-field-wrap data-testid="package-type">
        ${TYPES.map(([v, label, hint]) => html`
          <label class="cursor-pointer">
            <input type="radio" name="packageType" value="${v}" class="peer sr-only" ${type === v ? 'checked' : ''} />
            <span class="block h-full rounded-xl border-2 border-brand-line p-3 peer-checked:border-brand-dark peer-checked:bg-brand-sand/60">
              <span class="block text-sm font-bold">${label}</span>
              <span class="block text-xs text-slate-500 mt-0.5">${hint}</span>
            </span>
          </label>`)}
      </div>`)}
    <div class="grid grid-cols-2 gap-3">
      ${field('Số ngày', input('durationDays', { type: 'number', value: p.durationDays, required: true, attrs: 'min="1"' }), html`<span data-duration-hint>${type === 'CLASS' ? 'Lớp của môn này chỉ mở đúng các thời hạn đang bán' : ''}</span>`)}
      ${field('Giá (₫)', input('price', { type: 'number', value: p.price, required: true, attrs: 'min="0" step="1000"' }))}
    </div>
    <div data-class-only class="${type === 'CLASS' ? '' : 'hidden'}">
      ${field('Môn của gói lớp', html`
        <div class="flex flex-wrap gap-2" data-field-wrap data-testid="package-subjects">
          ${s.subjects.map(x => html`
            <label class="cursor-pointer">
              <input type="radio" name="subjectId" value="${x.subjectId}" class="peer sr-only" ${chosen === String(x.subjectId) ? 'checked' : ''} />
              <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-brand-line text-sm font-semibold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">${x.subjectName}</span>
            </label>`)}
        </div>`, 'Chọn đúng 1 môn')}
    </div>
    ${field('Mô tả', textarea('description', p.description, { rows: 2, placeholder: 'Quyền lợi của gói...' }))}
    ${p.packageId ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">Gói đã có người mua chỉ sửa được tên, mô tả và giá.</div>` : ''}`;
}

function validator(s) {
  return d => {
    const e = requireFields(d, ['packageName', 'durationDays', 'price']);
    if (d.durationDays && Number(d.durationDays) < 1) e.durationDays = 'Tối thiểu 1 ngày';
    if (d.price && Number(d.price) < 0) e.price = 'Giá không hợp lệ';
    if (d.packageType === 'CLASS' && !d.subjectId) e.subjectId = s.subjects.length ? 'Gói lớp phải chọn 1 môn' : 'Chưa có bộ môn nào, hãy tạo bộ môn trước';
    return e;
  };
}

const payload = (d, p = {}) => ({
  packageName: d.packageName,
  durationDays: Number(d.durationDays),
  price: Number(d.price),
  description: d.description || '',
  packageType: d.packageType,
  subjectId: d.packageType === 'CLASS' ? Number(d.subjectId) : null,
  // PUT ghi đè status -> luôn gửi kèm trạng thái hiện tại
  status: p.status || 'ACTIVE'
});

// đổi loại gói -> ẩn/hiện ô chọn môn
function mountTypeSwitch(modal) {
  const formEl = modal.el.querySelector('form');
  const update = () => {
    const isClass = readForm(formEl).packageType === 'CLASS';
    formEl.querySelector('[data-class-only]').classList.toggle('hidden', !isClass);
    formEl.querySelector('[data-duration-hint]').textContent = isClass ? 'Lớp của môn này chỉ mở đúng các thời hạn đang bán' : '';
  };
  formEl.addEventListener('change', update);
}

function view(s) {
  const list = s.packages
    .filter(p => matches(s.keyword, [p.packageName, p.description, p.subject?.subjectName]))
    .sort((a, b) => (a.status === 'INACTIVE') - (b.status === 'INACTIVE') || a.durationDays - b.durationDays);
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${pageHeader('Gói tập', 'Quản lý các gói hội viên đang bán',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm gói</button>`)}
    <div class="card">
      <div class="p-4 border-b border-slate-100">${searchBox(s.keyword, 'Tìm gói tập, môn...')}</div>
      ${list.length ? html`${table({
        columns: [{ label: 'Gói' }, { label: 'Loại / Môn' }, { label: 'Thời hạn' }, { label: 'Giá', cls: 'text-right' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: page.content.map(p => [
          html`<div class="font-semibold">${p.packageName}</div><div class="text-xs text-slate-500 max-w-xs truncate">${p.description || ''}</div>`,
          html`<div class="text-xs font-bold ${p.packageType === 'CLASS' ? 'text-emerald-700' : 'text-sky-700'}">${p.packageType === 'CLASS' ? 'Gói lớp' : 'Membership'}</div><div class="text-xs text-slate-500 max-w-[14rem]">${packageScope(p)}</div>
            ${p.packageType === 'CLASS' && !p.subject ? html`<div class="text-[11px] font-bold text-rose-600 mt-0.5" data-testid="pkg-warning">Chưa gắn môn, hội viên không đặt lớp được</div>` : ''}`,
          html`${p.durationDays} ngày`,
          html`<b>${money(p.price)}</b>`,
          p.status === 'INACTIVE' ? badge('INACTIVE', 'Ngừng bán') : badge('ACTIVE', 'Đang bán'),
          rowActions(p.packageId, { removeLabel: 'Ngừng bán', removeIcon: 'archive', remove: p.status !== 'INACTIVE' })
        ])
      })}${pagination(page, { unit: 'gói' })}` : emptyState('Chưa có gói tập', 'package')}
    </div>`;
}

export default function ManagerPackages(el) {
  return mountPage(el, {
    state: { keyword: '', subjects: [], pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => {
      const [packages, subjects] = await Promise.all([packageApi.list(), subjectApi.list().catch(() => [])]);
      return { packages, subjects: subjects.filter(x => x.status !== 'INACTIVE') };
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm gói tập', size: 'max-w-xl', fields: form(ctx.state), validate: validator(ctx.state), success: 'Đã thêm gói tập',
        onMount: mountTypeSwitch,
        submit: d => packageApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${p.packageName}`, size: 'max-w-xl', fields: form(ctx.state, p), validate: validator(ctx.state), success: 'Đã cập nhật gói tập',
          onMount: mountTypeSwitch,
          submit: d => packageApi.update(p.packageId, payload(d, p)), onDone: () => ctx.reload()
        });
      },
      remove: async (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        if (await confirmAction(`Ngừng bán gói "${p.packageName}"?\nGói sẽ không còn hiện cho hội viên mua mới; hội viên đã mua vẫn dùng đến hết hạn.`,
          () => packageApi.remove(p.packageId), { confirmText: 'Ngừng bán', success: 'Đã ngừng bán gói' })) ctx.reload();
      }
    }
  });
}
