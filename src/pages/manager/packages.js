import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, tabs, emptyState, field, input, textarea } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi, subjectApi } from '../../api/endpoints.js';
import { money, badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';

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

const isClass = p => p.packageType === 'CLASS';
const subjectName = p => p.subject?.subjectName || p.subjectName || '';
// thời hạn dễ đọc: 30 -> 1 tháng, 90 -> 3 tháng, 365 -> 1 năm
function durationText(days) {
  if (days % 365 === 0) return `${days / 365} năm`;
  if (days % 30 === 0) return `${days / 30} tháng`;
  return `${days} ngày`;
}

const STATUS_TABS = [['ACTIVE', 'Đang bán'], ['INACTIVE', 'Ngừng bán'], ['', 'Tất cả']];

// Thẻ gói kiểu bảng giá subscription: giá to, thời hạn, quyền lợi (mỗi dòng mô tả = 1 quyền lợi)
function planCard(p, featured) {
  const off = p.status === 'INACTIVE';
  const perDay = p.durationDays ? Math.round(p.price / p.durationDays) : 0;
  // mô tả thường viết "A, B, C." -> mỗi ý 1 dòng quyền lợi
  const perks = String(p.description || '').split(/\r?\n|;|,\s+|\.\s+/)
    .map(x => x.trim().replace(/\.$/, '')).filter(Boolean)
    .map(x => x[0].toUpperCase() + x.slice(1));
  const scope = [isClass(p) ? `Học 1 lớp môn ${subjectName(p) || '—'}` : 'Ra vào trung tâm, dùng cơ sở vật chất',
    isClass(p) ? 'Hết hạn theo ngày kết thúc của lớp' : 'Kích hoạt khi check-in hoặc vào lớp lần đầu',
    ...perks];
  return html`
    <div class="relative flex flex-col rounded-3xl p-6 min-w-0 transition-shadow hover:shadow-lg ${featured && !off ? 'bg-brand-dark text-white ring-2 ring-brand-lime' : 'card'} ${off ? 'opacity-60' : ''}" data-testid="plan-card">
      ${featured && !off ? html`<span class="absolute -top-3 left-6 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold">Tiết kiệm nhất</span>` : ''}
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[11px] font-extrabold uppercase tracking-widest ${featured && !off ? 'text-brand-lime' : isClass(p) ? 'text-emerald-700' : 'text-sky-700'}">${isClass(p) ? `Gói lớp${subjectName(p) ? ` · ${subjectName(p)}` : ''}` : 'Membership'}</div>
          <div class="font-display text-2xl font-extrabold leading-tight mt-1 break-words">${p.packageName}</div>
        </div>
        ${off ? badge('INACTIVE', 'Ngừng bán') : badge('ACTIVE', 'Đang bán')}
      </div>
      <div class="mt-5 flex items-end gap-1.5">
        <span class="text-3xl font-black tracking-tight">${money(p.price)}</span>
        <span class="text-sm pb-1 ${featured && !off ? 'text-white/70' : 'text-slate-500'}">/ ${durationText(p.durationDays)}</span>
      </div>
      <div class="text-xs mt-1 ${featured && !off ? 'text-white/60' : 'text-slate-400'}">${p.durationDays} ngày · ≈ ${money(perDay)}/ngày</div>
      <ul class="mt-5 space-y-2 text-sm flex-1">
        ${scope.map(x => html`<li class="flex gap-2"><span class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${featured && !off ? 'bg-brand-lime text-brand-dark' : 'bg-brand-sand text-brand-deep'}">${icon('check', 'w-3 h-3')}</span><span class="min-w-0 break-words">${x}</span></li>`)}
      </ul>
      ${isClass(p) && !p.subject && !p.subjectName ? html`<div class="mt-3 text-[11px] font-bold text-rose-600" data-testid="pkg-warning">Chưa gắn môn, hội viên không đặt lớp được</div>` : ''}
      <div class="mt-6 flex gap-2">
        <button type="button" class="btn-sm flex-1 ${featured && !off ? 'btn bg-brand-lime text-brand-dark hover:brightness-95' : 'btn-secondary'}" data-action="edit" data-id="${p.packageId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>
        ${off
          ? html`<button type="button" class="btn-sm btn-secondary flex-1" data-action="restore" data-id="${p.packageId}" data-testid="row-restore">${icon('rotate-ccw', 'w-3.5 h-3.5')} Bán lại</button>`
          : html`<button type="button" class="btn-sm btn-ghost text-rose-600 hover:bg-rose-50 ${featured ? '!text-rose-300 hover:!bg-white/10' : ''}" data-action="remove" data-id="${p.packageId}" title="Ngừng bán" data-testid="row-remove">${icon('archive', 'w-3.5 h-3.5')}</button>`}
      </div>
    </div>`;
}

// gói rẻ nhất tính theo ngày trong 1 nhóm (cần từ 2 gói đang bán)
function bestIn(list) {
  const on = list.filter(p => p.status !== 'INACTIVE' && p.durationDays > 0);
  if (on.length < 2) return null;
  return on.reduce((a, b) => (b.price / b.durationDays < a.price / a.durationDays ? b : a)).packageId;
}

function planGrid(title, sub, list) {
  if (!list.length) return '';
  const best = bestIn(list);
  return html`
    <section class="mb-8">
      <div class="flex items-end justify-between mb-4"><div><div class="font-bold text-lg">${title}</div>${sub ? html`<div class="text-xs text-slate-500">${sub}</div>` : ''}</div><span class="text-xs text-slate-500">${list.length} gói</span></div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 pt-3">${list.map(p => planCard(p, p.packageId === best))}</div>
    </section>`;
}

function view(s) {
  const all = s.packages;
  const list = all
    .filter(p => !s.status || (s.status === 'INACTIVE' ? p.status === 'INACTIVE' : p.status !== 'INACTIVE'))
    .filter(p => s.type === 'ALL' || (s.type === 'CLASS') === isClass(p))
    .filter(p => matches(s.keyword, [p.packageName, p.description, subjectName(p)]))
    .sort((a, b) => a.durationDays - b.durationDays || a.price - b.price);
  const memberships = list.filter(p => !isClass(p));
  // gói lớp gom theo môn
  const bySubject = {};
  list.filter(isClass).forEach(p => (bySubject[subjectName(p) || 'Chưa gắn môn'] ||= []).push(p));
  const active = all.filter(p => p.status !== 'INACTIVE');
  const stat = (label, value, ic) => html`
    <div class="card rounded-3xl p-4 flex items-center gap-3 min-w-0">
      <span class="w-10 h-10 rounded-xl bg-brand-sand text-brand-deep flex items-center justify-center shrink-0">${icon(ic, 'w-5 h-5')}</span>
      <div class="min-w-0"><div class="text-xs text-slate-500">${label}</div><div class="text-xl font-extrabold truncate">${value}</div></div>
    </div>`;
  return html`
    ${pageHeader('Gói tập', 'Bảng giá các gói hội viên đang bán',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm gói</button>`)}
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      ${stat('Đang bán', `${active.length} gói`, 'package-check')}
      ${stat('Membership', active.filter(p => !isClass(p)).length, 'id-card')}
      ${stat('Gói lớp', active.filter(isClass).length, 'users')}
      ${stat('Ngừng bán', all.length - active.length, 'archive')}
    </div>
    <div class="card p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3 [&_[role=tablist]]:mb-0">
      ${tabs([['ALL', 'Tất cả loại'], ['MEMBERSHIP', 'Membership'], ['CLASS', 'Gói lớp']].map(([id, label]) => ({ id, label })), s.type, 'type')}
      ${tabs(STATUS_TABS.map(([id, label]) => ({ id, label })), s.status, 'status')}
      <div class="lg:ml-auto lg:w-72">${searchBox(s.keyword, 'Tìm gói tập, môn...')}</div>
    </div>
    ${list.length ? html`
      ${planGrid('Membership', 'Vào trung tâm, bắt buộc có trước khi mua gói lớp', memberships)}
      ${Object.keys(bySubject).sort((a, b) => a.localeCompare(b, 'vi')).map(k => planGrid(`Gói lớp · ${k}`, 'Mỗi gói dùng cho 1 lớp cùng môn, cùng thời hạn', bySubject[k]))}`
      : html`<div class="card">${emptyState(all.length ? 'Không có gói khớp bộ lọc' : 'Chưa có gói tập', 'package')}</div>`}`;
}

export default function ManagerPackages(el) {
  return mountPage(el, {
    state: { keyword: '', subjects: [], type: 'ALL', status: 'ACTIVE' },
    load: async () => {
      const [packages, subjects] = await Promise.all([packageApi.list(), subjectApi.list().catch(() => [])]);
      return { packages, subjects: subjects.filter(x => x.status !== 'INACTIVE') };
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      type: (t, e, ctx) => ctx.set({ type: t.dataset.tab }),
      status: (t, e, ctx) => ctx.set({ status: t.dataset.tab }),
      restore: async (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        const d = { ...p, packageType: p.packageType, subjectId: subjectIdOf(p) };
        if (await confirmAction(`Bán lại gói "${p.packageName}"?\nHội viên sẽ thấy và mua được gói này.`,
          () => packageApi.update(p.packageId, payload(d, { status: 'ACTIVE' })), { confirmText: 'Bán lại', success: 'Đã mở bán lại gói' })) ctx.reload();
      },
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
