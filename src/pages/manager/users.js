import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, tabs, statCard, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { userApi, roleApi } from '../../api/endpoints.js';
import { badge, fullName, genderLabel, roleLabel, phoneText } from '../../core/format.js';
import { session } from '../../core/session.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';

const ROLE_TABS = ['ALL', 'MEMBER', 'RECEPTIONIST', 'COACH', 'CENTER_MANAGER'];
const ROLE_BADGE = {
  MEMBER: 'bg-sky-50 text-sky-700',
  RECEPTIONIST: 'bg-teal-50 text-teal-700',
  COACH: 'bg-amber-50 text-amber-700',
  CENTER_MANAGER: 'bg-violet-50 text-violet-700'
};

const isSelf = u => (u.email || '').toLowerCase() === (session.get()?.email || '').toLowerCase();

function editForm(u) {
  return html`
    <div class="grid grid-cols-2 gap-3">
      ${field('Họ', input('firstName', { value: u.firstName, required: true }))}
      ${field('Tên', input('lastName', { value: u.lastName, required: true }))}
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${field('Giới tính', select('gender', GENDER_OPTIONS, (u.gender || '').toUpperCase(), { placeholder: 'Chọn' }))}
      ${field('Số điện thoại', input('phone', { type: 'tel', value: u.phone, required: true }))}
    </div>
    ${field('Email', input('email', { type: 'email', value: u.email, required: true }))}`;
}

function validateEdit(d) {
  const e = requireFields(d, ['firstName', 'lastName', 'phone', 'email']);
  if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone)) e.phone = 'Số điện thoại không hợp lệ';
  return e;
}

function view(s) {
  const count = r => s.users.filter(u => u.roleName === r).length;
  const list = s.users
    .filter(u => s.tab === 'ALL' || u.roleName === s.tab)
    .filter(u => !s.status || u.status === s.status)
    .filter(u => matches(s.keyword, [fullName(u), u.email, u.phone, u.id]))
    .sort((a, b) => b.id - a.id);
  return html`
    ${pageHeader('Tài khoản', 'Toàn bộ tài khoản trong hệ thống: sửa thông tin, đổi vai trò, khóa / mở khóa')}
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${statCard('Tổng tài khoản', s.users.length, 'users', 'emerald')}
      ${statCard('Hội viên', count('MEMBER'), 'user', 'sky')}
      ${statCard('Nhân viên', s.users.length - count('MEMBER'), 'briefcase', 'violet')}
      ${statCard('Đang bị khóa', s.users.filter(u => u.status === 'INACTIVE').length, 'lock', 'rose')}
    </div>
    <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
      ${tabs(ROLE_TABS.map(r => ({ id: r, label: r === 'ALL' ? 'Tất cả' : roleLabel(r), count: r === 'ALL' ? s.users.length : count(r) })), s.tab)}
      <div class="flex flex-col sm:flex-row gap-2 mb-5">
        <select class="input sm:w-40" name="status" data-action="status">
          <option value="">Mọi trạng thái</option>
          <option value="ACTIVE" ${s.status === 'ACTIVE' ? 'selected' : ''}>Hoạt động</option>
          <option value="INACTIVE" ${s.status === 'INACTIVE' ? 'selected' : ''}>Đã khóa</option>
        </select>
        ${searchBox(s.keyword, 'Tìm tên, email, SĐT...')}
      </div>
    </div>
    <div class="card" data-testid="user-table">
      ${list.length ? table({
        columns: [{ label: 'Tài khoản' }, { label: 'Liên hệ' }, { label: 'Vai trò' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: list.map(u => [
          html`<div class="flex items-center gap-3">${memberAvatar(u, 'w-9 h-9 text-sm')}<div><div class="font-semibold">${fullName(u)} ${isSelf(u) ? html`<span class="text-[10px] font-bold text-slate-400">(bạn)</span>` : ''}</div><div class="text-xs text-slate-500">#${u.id} · ${genderLabel(u.gender)}</div></div></div>`,
          html`<div class="text-sm">${u.email}</div><div class="text-xs text-slate-500">${phoneText(u.phone)}</div>`,
          html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.roleName] || 'bg-slate-100 text-slate-600'}">${roleLabel(u.roleName)}</span>`,
          badge(u.status, u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'),
          html`
            <div class="flex justify-end gap-1">
              <button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${u.id}" title="Sửa thông tin" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')}</button>
              ${isSelf(u) ? '' : html`
                <button type="button" class="btn-ghost btn-sm" data-action="role" data-id="${u.id}" title="Đổi vai trò" data-testid="row-role">${icon('shield', 'w-3.5 h-3.5')}</button>
                <button type="button" class="btn-ghost btn-sm ${u.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}" data-action="toggle" data-id="${u.id}" title="${u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}" data-testid="row-toggle">${icon(u.status === 'ACTIVE' ? 'lock' : 'unlock', 'w-3.5 h-3.5')}</button>`}
            </div>`
        ])
      }) : emptyState('Không có tài khoản phù hợp', 'users')}
    </div>`;
}

export default function ManagerUsers(el) {
  return mountPage(el, {
    state: { tab: 'ALL', keyword: '', status: '' },
    load: async () => {
      const [users, roles] = await Promise.all([userApi.list(), roleApi.list()]);
      return { users, roles };
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      status: (t, e, ctx) => ctx.set({ status: t.value }),
      edit: (t, e, ctx) => {
        const u = ctx.state.users.find(x => String(x.id) === t.dataset.id);
        openFormModal({
          title: `Sửa tài khoản ${fullName(u)}`, fields: editForm(u), validate: validateEdit, success: 'Đã cập nhật tài khoản',
          submit: d => userApi.update(u.id, { ...u, ...d }), onDone: () => ctx.reload()
        });
      },
      role: (t, e, ctx) => {
        const u = ctx.state.users.find(x => String(x.id) === t.dataset.id);
        // HLV cần hồ sơ HLV riêng -> tạo ở màn Huấn luyện viên, không đổi vai trò sang COACH ở đây
        const options = ctx.state.roles
          .filter(r => r.roleName !== 'COACH')
          .map(r => ({ value: r.roleId, label: r.description || roleLabel(r.roleName) }));
        openFormModal({
          title: `Đổi vai trò ${fullName(u)}`,
          fields: html`
            <div class="text-sm text-slate-600">Vai trò hiện tại: <b>${roleLabel(u.roleName)}</b></div>
            ${field('Vai trò mới', select('roleId', options, u.roleId, { required: true }))}
            <div class="text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">
              Quyền thay đổi ngay ở lần đăng nhập sau. Muốn thêm Huấn luyện viên, hãy tạo ở màn <a href="#/manager/coaches" class="font-bold underline">Huấn luyện viên</a>.
            </div>`,
          validate: d => requireFields(d, ['roleId']), success: 'Đã đổi vai trò', submitText: 'Đổi vai trò',
          submit: d => userApi.assignRole(u.id, d.roleId), onDone: () => ctx.reload()
        });
      },
      toggle: async (t, e, ctx) => {
        const u = ctx.state.users.find(x => String(x.id) === t.dataset.id);
        const locking = u.status === 'ACTIVE';
        if (await confirmAction(
          locking ? `Khóa tài khoản ${fullName(u)} (${u.email})? Tài khoản sẽ không đăng nhập được.` : `Mở khóa tài khoản ${fullName(u)}?`,
          () => userApi.toggleStatus(u.id),
          { confirmText: locking ? 'Khóa' : 'Mở khóa', success: locking ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản' }
        )) ctx.reload();
      }
    }
  });
}
