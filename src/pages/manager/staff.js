import { html, icon } from '../../core/dom.js';
import { emptyState, field, input, select, tabs, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { staffApi } from '../../api/endpoints.js';
import { fullName, genderLabel, date, toDate } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

// Quản lý nhân viên lễ tân: GET/POST/PUT /manager/receptionists, khóa / mở qua PATCH .../status
function form(r = {}) {
  const edit = Boolean(r.userId);
  return html`
    <div class="grid grid-cols-2 gap-3">
      ${field('Họ', input('firstName', { value: r.firstName, required: true, attrs: 'maxlength="50"' }))}
      ${field('Tên', input('lastName', { value: r.lastName, required: true, attrs: 'maxlength="50"' }))}
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${field('Giới tính', select('gender', GENDER_OPTIONS, (r.gender || 'FEMALE').toUpperCase(), { required: true }))}
      ${field('Số điện thoại', input('phone', { type: 'tel', value: r.phone, required: true, attrs: 'inputmode="tel" maxlength="12"' }))}
    </div>
    ${field('Email đăng nhập', input('email', { type: 'email', value: r.email, required: true }))}
    ${edit ? '' : field('Mật khẩu', input('password', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'Từ 6 đến 64 ký tự, gửi cho nhân viên để đăng nhập lần đầu')}`;
}

function validator(edit) {
  return d => {
    const e = requireFields(d, edit ? ['firstName', 'lastName', 'gender', 'email', 'phone'] : ['firstName', 'lastName', 'gender', 'email', 'phone', 'password']);
    if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone.trim())) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0 (hoặc +84)';
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = 'Email không hợp lệ';
    if (!edit && d.password && (d.password.length < 6 || d.password.length > 64)) e.password = 'Mật khẩu từ 6 đến 64 ký tự';
    return e;
  };
}

const payload = d => ({
  firstName: d.firstName.trim(), lastName: d.lastName.trim(), gender: d.gender,
  phone: d.phone.trim(), email: d.email.trim(), ...(d.password ? { password: d.password } : {})
});

const initials = r => `${(r.firstName || '?').charAt(0)}${(r.lastName || '').charAt(0)}`.toUpperCase();

// ô số liệu trên banner (cùng kiểu trang Huấn luyện viên)
const kpi = (label, value, note, cls = 'bg-white/95 text-brand-dark') => html`
  <div class="rounded-2xl p-4 min-w-0 ${cls}">
    <div class="text-xs font-bold opacity-70">${label}</div>
    <div class="font-display text-4xl font-extrabold leading-none mt-1.5">${value}${note ? html`<span class="text-lg opacity-60"> ${note}</span>` : ''}</div>
  </div>`;

function banner(staff) {
  const active = staff.filter(r => r.status === 'ACTIVE').length;
  const monthAgo = Date.now() - 30 * 86400000;
  const fresh = staff.filter(r => toDate(r.createdAt) >= monthAgo).length;
  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white mb-6" data-testid="staff-banner">
      <img src="/landing/gym.jpg" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_45%]" />
      <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand-dark/35"></span>
      <div class="relative p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[.25em] text-brand-lime">Nhân sự</div>
            <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-none mt-1">QUẦY LỄ TÂN</h1>
            <p class="text-sm text-white/75 mt-1">Tạo tài khoản, cập nhật thông tin và khóa / mở nhân viên lễ tân</p>
          </div>
          <button type="button" class="btn-lime !py-3" data-action="create" data-testid="create">${icon('user-plus', 'w-4 h-4')} Thêm lễ tân</button>
        </div>
        <div class="grid grid-cols-2 xl:grid-cols-3 gap-3 mt-7" data-testid="staff-kpis">
          ${kpi('Đang làm', active, `/ ${staff.length} nhân viên`, 'bg-brand-lime text-brand-dark')}
          ${kpi('Mới trong 30 ngày', fresh)}
          ${kpi('Đã khóa', staff.length - active, '', 'bg-white text-brand-dark border-l-4 border-orange-500')}
        </div>
      </div>
    </div>`;
}

const infoTile = (label, value, dark) => html`
  <div class="rounded-2xl px-3.5 py-3 min-w-0 ${dark ? 'bg-brand-dark text-white' : 'bg-brand-sand/70 text-brand-dark'}">
    <div class="font-display text-2xl font-extrabold leading-none truncate ${dark ? 'text-brand-lime' : ''}">${value}</div>
    <div class="text-[10px] font-extrabold uppercase tracking-wider mt-1 ${dark ? 'text-white/80' : 'text-slate-500'}">${label}</div>
  </div>`;

function staffCard(r) {
  const locked = r.status === 'INACTIVE';
  return html`
    <div class="card overflow-hidden ${locked ? 'opacity-60' : ''}" data-testid="staff-card" data-id="${r.userId}">
      <div class="relative h-24 p-4 overflow-hidden ${locked ? 'bg-slate-400' : 'bg-gradient-to-br from-[#173F31] to-[#156B45]'}">
        <span class="absolute -right-1 top-5 font-display text-7xl font-extrabold uppercase leading-none text-white/10 whitespace-nowrap select-none" aria-hidden="true">Lễ tân</span>
        <div class="relative flex items-start justify-between gap-2">
          <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">Lễ tân · #${r.userId}</span>
          <span class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${locked ? 'bg-white text-slate-600' : 'bg-[#D7F25B] text-[#0E2A20]'}">${locked ? 'Đã khóa' : '● Đang làm'}</span>
        </div>
      </div>
      <div class="px-5 pb-5">
        <div class="relative -mt-9 w-[72px] h-[72px] rounded-[22px] bg-[#173F31] text-[#D7F25B] border-4 border-white flex items-center justify-center font-display text-3xl font-extrabold">${initials(r)}</div>
        <div class="font-display text-[28px] font-extrabold uppercase leading-none text-brand-dark mt-2.5 break-words">${fullName(r)}</div>
        <div class="text-xs text-slate-500 mt-1">${genderLabel(r.gender)} · ${r.phone || '—'}</div>
        <div class="text-xs text-slate-500 mt-2 truncate" title="${r.email}">${r.email}</div>
        <div class="grid grid-cols-2 gap-2.5 mt-4">
          ${infoTile('Ngày vào làm', r.createdAt ? date(r.createdAt) : '—', !locked)}
          ${infoTile('Mã nhân viên', `#${r.userId}`, false)}
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button type="button" class="btn-sm btn-secondary flex-1" data-action="edit" data-id="${r.userId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa thông tin</button>
          ${locked
            ? html`<button type="button" class="btn-sm btn-primary flex-1" data-action="toggle" data-id="${r.userId}" data-testid="row-toggle">${icon('unlock', 'w-3.5 h-3.5')} Mở khóa</button>`
            : html`<button type="button" class="btn-sm btn-ghost flex-1 text-orange-700 border border-orange-200 hover:bg-orange-50" data-action="toggle" data-id="${r.userId}" data-testid="row-toggle">${icon('lock', 'w-3.5 h-3.5')} Khóa tài khoản</button>`}
        </div>
      </div>
    </div>`;
}

function view(s) {
  const count = st => s.staff.filter(r => !st || r.status === st).length;
  const list = s.staff
    .filter(r => !s.tab || r.status === s.tab)
    .filter(r => matches(s.keyword, [fullName(r), r.email, r.phone]));
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${banner(s.staff)}
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
      ${tabs([
        { id: '', label: 'Tất cả', count: count('') },
        { id: 'ACTIVE', label: 'Đang làm', count: count('ACTIVE') },
        { id: 'INACTIVE', label: 'Đã khóa', count: count('INACTIVE') }
      ], s.tab)}
      <div class="mb-5 lg:w-80">${searchBox(s.keyword, 'Tìm tên, email, SĐT...')}</div>
    </div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="staff-list">
        ${page.content.map(staffCard)}
      </div>${pagination(page, { unit: 'nhân viên', standalone: true })}` : emptyState(s.staff.length ? 'Không có nhân viên phù hợp' : 'Chưa có nhân viên lễ tân', 'concierge-bell')}`;
}

export default function ManagerStaff(el) {
  const find = ctx => id => ctx.state.staff.find(x => String(x.userId) === id);
  return mountPage(el, {
    state: { tab: '', keyword: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => ({ staff: (await staffApi.list()).sort((a, b) => b.userId - a.userId) }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab, pageNo: 0 }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm nhân viên lễ tân', fields: form(), validate: validator(false), success: 'Đã tạo tài khoản lễ tân',
        submit: d => staffApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const r = find(ctx)(t.dataset.id);
        openFormModal({
          title: `Sửa lễ tân ${fullName(r)}`, fields: form(r), validate: validator(true), success: 'Đã cập nhật nhân viên',
          submit: d => staffApi.update(r.userId, payload(d)), onDone: () => ctx.reload()
        });
      },
      toggle: async (t, e, ctx) => {
        const r = find(ctx)(t.dataset.id);
        const locking = r.status === 'ACTIVE';
        if (await confirmAction(
          locking ? `Khóa tài khoản ${fullName(r)}? Nhân viên sẽ không đăng nhập được.` : `Mở khóa tài khoản ${fullName(r)}?`,
          () => staffApi.toggleStatus(r.userId),
          { confirmText: locking ? 'Khóa' : 'Mở khóa', success: locking ? 'Đã khóa nhân viên' : 'Đã mở khóa nhân viên' }
        )) ctx.reload();
      }
    }
  });
}
