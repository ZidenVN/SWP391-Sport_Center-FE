import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, select, tabs, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { staffApi } from '../../api/endpoints.js';
import { badge, fullName, genderLabel, date } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
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
      ${field('Giới tính', select('gender', GENDER_OPTIONS, (r.gender || 'FEMALE').toUpperCase()))}
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

function view(s) {
  const count = st => s.staff.filter(r => !st || r.status === st).length;
  const list = s.staff
    .filter(r => !s.tab || r.status === s.tab)
    .filter(r => matches(s.keyword, [fullName(r), r.email, r.phone]));
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${pageHeader('Nhân viên lễ tân', 'Tạo tài khoản, cập nhật thông tin và khóa / mở nhân viên lễ tân',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('user-plus', 'w-4 h-4')} Thêm lễ tân</button>`)}
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
      ${tabs([
        { id: '', label: 'Tất cả', count: count('') },
        { id: 'ACTIVE', label: 'Đang làm', count: count('ACTIVE') },
        { id: 'INACTIVE', label: 'Đã khóa', count: count('INACTIVE') }
      ], s.tab)}
      <div class="mb-5">${searchBox(s.keyword, 'Tìm tên, email, SĐT...')}</div>
    </div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="staff-list">
        ${page.content.map(r => html`
          <div class="card p-5 ${r.status === 'INACTIVE' ? 'opacity-70' : ''}" data-testid="staff-card" data-id="${r.userId}">
            <div class="flex items-start gap-3">
              ${memberAvatar(r, 'w-12 h-12 text-lg')}
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2"><span class="font-bold truncate">${fullName(r)}</span>${badge(r.status, r.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa')}</div>
                <div class="text-xs text-slate-500 mt-0.5">#${r.userId}${r.createdAt ? ` · Tạo ${date(r.createdAt)}` : ''}</div>
              </div>
            </div>
            <div class="mt-4 space-y-1.5 text-sm text-slate-600">
              <div class="flex items-center gap-2">${icon('mail', 'w-3.5 h-3.5 text-slate-400')} <span class="truncate">${r.email}</span></div>
              <div class="flex items-center gap-2">${icon('phone', 'w-3.5 h-3.5 text-slate-400')} ${r.phone || '—'} · ${genderLabel(r.gender)}</div>
            </div>
            <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-brand-line/60">
              <button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${r.userId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>
              <button type="button" class="btn-ghost btn-sm ${r.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}" data-action="toggle" data-id="${r.userId}" data-testid="row-toggle">
                ${icon(r.status === 'ACTIVE' ? 'lock' : 'unlock', 'w-3.5 h-3.5')} ${r.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
              </button>
            </div>
          </div>`)}
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
