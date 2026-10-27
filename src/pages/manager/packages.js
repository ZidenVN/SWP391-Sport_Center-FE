import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, textarea } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi, subjectApi } from '../../api/endpoints.js';
import { money, badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';
import { packageScope } from '../../components/billing.js';

// Gói tập theo BE main (MembershipPackageRequestDTO):
// - FREE (tự do): vào khu tập chung, không đăng ký lớp. Gắn tối đa 1 môn có khu tập tự do, bỏ trống = toàn trung tâm. Không có số buổi.
// - CLASS (theo lớp): đăng ký lớp của các môn đã chọn (ít nhất 1 môn), có thể giới hạn số buổi (bỏ trống = không giới hạn).
// Gói đã có người mua chỉ sửa được tên, mô tả, giá, trạng thái (BE trả ERR_PACKAGE_409).
const TYPES = [
  ['CLASS', 'Gói theo lớp', 'Đăng ký lớp của các môn đã chọn, có thể giới hạn số buổi'],
  ['FREE', 'Gói tập tự do', 'Vào khu tập chung, không đăng ký lớp']
];

function form(s, p = {}) {
  const type = p.packageType || 'CLASS';
  const chosen = new Set((p.subjects || []).map(x => String(x.subjectId)));
  return html`
    ${field('Tên gói', input('packageName', { value: p.packageName, required: true, placeholder: 'VD: Gym + Yoga 1 tháng' }))}
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
      ${field('Số ngày', input('durationDays', { type: 'number', value: p.durationDays, required: true, attrs: 'min="1"' }))}
      ${field('Giá (₫)', input('price', { type: 'number', value: p.price, required: true, attrs: 'min="0" step="1000"' }))}
    </div>
    <div data-class-only class="${type === 'CLASS' ? '' : 'hidden'}">
      ${field('Số buổi', input('sessionLimit', { type: 'number', value: p.sessionLimit ?? '', attrs: 'min="1"', placeholder: 'Bỏ trống = không giới hạn' }), 'Mỗi lần đăng ký lớp trừ 1 buổi, hủy lớp được hoàn buổi')}
    </div>
    ${field('Môn áp dụng', html`
      <div class="flex flex-wrap gap-2" data-field-wrap data-testid="package-subjects">
        ${s.subjects.map(x => html`
          <label class="cursor-pointer" data-area="${x.areaAccess || 'OPEN'}">
            <input type="checkbox" name="subject_${x.subjectId}" value="1" class="peer sr-only" ${chosen.has(String(x.subjectId)) ? 'checked' : ''} />
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-line text-sm font-semibold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">
              ${x.subjectName}${x.areaAccess === 'CLASS_ONLY' ? html`<span class="text-[10px] opacity-70">· chỉ lớp</span>` : ''}
            </span>
          </label>`)}
      </div>`, html`<span data-subject-hint>${type === 'CLASS' ? 'Chọn ít nhất 1 môn' : 'Chọn tối đa 1 môn có khu tập tự do, bỏ trống = toàn trung tâm'}</span>`)}
    ${field('Mô tả', textarea('description', p.description, { rows: 2, placeholder: 'Quyền lợi của gói...' }))}
    ${p.packageId ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">Gói đã có người mua chỉ sửa được tên, mô tả và giá.</div>` : ''}`;
}

const chosenSubjects = (s, d) => s.subjects.filter(x => d[`subject_${x.subjectId}`]);

function validator(s) {
  return d => {
    const e = requireFields(d, ['packageName', 'durationDays', 'price']);
    if (d.durationDays && Number(d.durationDays) < 1) e.durationDays = 'Tối thiểu 1 ngày';
    if (d.price && Number(d.price) < 0) e.price = 'Giá không hợp lệ';
    const subs = chosenSubjects(s, d);
    const firstSubject = s.subjects[0] ? `subject_${s.subjects[0].subjectId}` : 'packageName';
    if (d.packageType === 'CLASS') {
      if (!subs.length) e[firstSubject] = 'Gói theo lớp phải áp dụng cho ít nhất 1 môn';
      if (d.sessionLimit && Number(d.sessionLimit) < 1) e.sessionLimit = 'Số buổi tối thiểu là 1';
    } else {
      if (subs.length > 1) e[firstSubject] = 'Gói tự do chỉ áp dụng cho tối đa 1 môn';
      else if (subs[0]?.areaAccess === 'CLASS_ONLY') e[firstSubject] = `${subs[0].subjectName} chỉ học theo lớp, không bán gói tự do`;
    }
    return e;
  };
}

const payload = (s, d, p = {}) => ({
  packageName: d.packageName,
  durationDays: Number(d.durationDays),
  price: Number(d.price),
  description: d.description || '',
  packageType: d.packageType,
  sessionLimit: d.packageType === 'CLASS' && d.sessionLimit ? Number(d.sessionLimit) : null,
  subjectIds: chosenSubjects(s, d).map(x => x.subjectId),
  // PUT ghi đè status -> luôn gửi kèm trạng thái hiện tại
  status: p.status || 'ACTIVE'
});

// đổi loại gói -> ẩn/hiện ô số buổi và đổi gợi ý môn
function mountTypeSwitch(modal) {
  const formEl = modal.el.querySelector('form');
  const update = () => {
    const type = readForm(formEl).packageType;
    formEl.querySelector('[data-class-only]').classList.toggle('hidden', type !== 'CLASS');
    formEl.querySelector('[data-subject-hint]').textContent = type === 'CLASS' ? 'Chọn ít nhất 1 môn' : 'Chọn tối đa 1 môn có khu tập tự do, bỏ trống = toàn trung tâm';
  };
  formEl.addEventListener('change', update);
}

function view(s) {
  const list = s.packages
    .filter(p => matches(s.keyword, [p.packageName, p.description, ...(p.subjects || []).map(x => x.subjectName)]))
    .sort((a, b) => (a.status === 'INACTIVE') - (b.status === 'INACTIVE') || a.durationDays - b.durationDays);
  return html`
    ${pageHeader('Gói tập', 'Quản lý các gói hội viên đang bán',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm gói</button>`)}
    <div class="card">
      <div class="p-4 border-b border-slate-100">${searchBox(s.keyword, 'Tìm gói tập, môn...')}</div>
      ${list.length ? table({
        columns: [{ label: 'Gói' }, { label: 'Loại / Môn áp dụng' }, { label: 'Thời hạn' }, { label: 'Giá', cls: 'text-right' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: list.map(p => [
          html`<div class="font-semibold">${p.packageName}</div><div class="text-xs text-slate-500 max-w-xs truncate">${p.description || ''}</div>`,
          html`<div class="text-xs font-bold ${p.packageType === 'FREE' ? 'text-sky-700' : 'text-emerald-700'}">${p.packageType === 'FREE' ? 'Tập tự do' : 'Theo lớp'}</div><div class="text-xs text-slate-500 max-w-[14rem]">${packageScope(p)}</div>
            ${p.packageType === 'CLASS' && !(p.subjects || []).length ? html`<div class="text-[11px] font-bold text-rose-600 mt-0.5" data-testid="pkg-warning">Chưa gắn môn — hội viên không đặt lớp được</div>` : ''}`,
          html`${p.durationDays} ngày${p.sessionLimit ? html`<div class="text-xs text-slate-500">${p.sessionLimit} buổi</div>` : ''}`,
          html`<b>${money(p.price)}</b>`,
          p.status === 'INACTIVE' ? badge('INACTIVE', 'Ngừng bán') : badge('ACTIVE', 'Đang bán'),
          rowActions(p.packageId, { removeLabel: 'Ngừng bán', removeIcon: 'archive', remove: p.status !== 'INACTIVE' })
        ])
      }) : emptyState('Chưa có gói tập', 'package')}
    </div>`;
}

export default function ManagerPackages(el) {
  return mountPage(el, {
    state: { keyword: '', subjects: [] },
    load: async () => {
      const [packages, subjects] = await Promise.all([packageApi.list(), subjectApi.list().catch(() => [])]);
      return { packages, subjects: subjects.filter(x => x.status !== 'INACTIVE') };
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm gói tập', size: 'max-w-xl', fields: form(ctx.state), validate: validator(ctx.state), success: 'Đã thêm gói tập',
        onMount: mountTypeSwitch,
        submit: d => packageApi.create(payload(ctx.state, d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${p.packageName}`, size: 'max-w-xl', fields: form(ctx.state, p), validate: validator(ctx.state), success: 'Đã cập nhật gói tập',
          onMount: mountTypeSwitch,
          submit: d => packageApi.update(p.packageId, payload(ctx.state, d, p)), onDone: () => ctx.reload()
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
