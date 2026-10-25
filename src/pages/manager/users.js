import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, select, tabs, statCard, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { userApi } from '../../api/endpoints.js';
import { badge, fullName, genderLabel, roleLabel, phoneText } from '../../core/format.js';
import { session } from '../../core/session.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openFormModal, requireFields, confirmAction, searchBox } from '../../components/crud.js';

const ROLE_TABS = ['ALL', 'MEMBER', 'RECEPTIONIST', 'COACH', 'CENTER_MANAGER'];
const ROLE_BADGE = {
  MEMBER: 'bg-sky-50 text-sky-700',
  RECEPTIONIST: 'bg-teal-50 text-teal-700',
  COACH: 'bg-amber-50 text-amber-700',
  CENTER_MANAGER: 'bg-violet-50 text-violet-700'
};
const PAGE_SIZE = 20;

const isSelf = u => (u.email || '').toLowerCase() === (session.get()?.email || '').toLowerCase();

function editForm(u) {
  return html`
    <div class="grid grid-cols-2 gap-3">
      ${field('Họ', input('firstName', { value: u.firstName, required: true, attrs: 'maxlength="50"' }))}
      ${field('Tên', input('lastName', { value: u.lastName, required: true, attrs: 'maxlength="50"' }))}
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${field('Giới tính', select('gender', GENDER_OPTIONS, (u.gender || '').toUpperCase(), { placeholder: 'Chọn' }))}
      ${field('Số điện thoại', input('phone', { type: 'tel', value: u.phone, required: true }))}
    </div>
    ${field('Email', input('email', { type: 'email', value: u.email, required: true }))}`;
}

function validateEdit(d) {
  const e = requireFields(d, ['firstName', 'lastName', 'phone', 'email']);
  if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone.trim())) e.phone = 'Số điện thoại không hợp lệ';
  if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = 'Email không hợp lệ';
  return e;
}

function pager(page) {
  if (!page || page.totalPages <= 1) return '';
  const n = page.number;
  return html`
    <div class="flex items-center justify-between px-5 py-3 border-t border-brand-line/60 text-sm" data-testid="pager">
      <span class="text-slate-500">Trang ${n + 1}/${page.totalPages} · ${page.totalElements} tài khoản</span>
      <div class="flex gap-2">
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n - 1}" ${n <= 0 ? 'disabled' : ''}>${icon('chevron-left', 'w-3.5 h-3.5')} Trước</button>
        <button type="button" class="btn-secondary btn-sm" data-action="page" data-page="${n + 1}" ${n + 1 >= page.totalPages ? 'disabled' : ''}>Sau ${icon('chevron-right', 'w-3.5 h-3.5')}</button>
      </div>
    </div>`;
}

// Lọc + phân trang ở BE (GET /users?keyword&role&status&page&size); số trên tab và thẻ thống kê cũng lấy từ BE
function view(s) {
  const c = s.counts || {};
  const list = s.page?.content || [];
  return html`
    ${pageHeader('Tài khoản', 'Toàn bộ tài khoản trong hệ thống: sửa thông tin, khóa / mở khóa. Thêm nhân viên ở mục Huấn luyện viên / Lễ tân')}
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${statCard('Tổng tài khoản', c.ALL ?? '—', 'users', 'emerald')}
      ${statCard('Hội viên', c.MEMBER ?? '—', 'user', 'sky')}
      ${statCard('Nhân viên', c.ALL != null && c.MEMBER != null ? c.ALL - c.MEMBER : '—', 'briefcase', 'violet')}
      ${statCard('Đang bị khóa', c.INACTIVE ?? '—', 'lock', 'rose')}
    </div>
    <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
      ${tabs(ROLE_TABS.map(r => ({ id: r, label: r === 'ALL' ? 'Tất cả' : roleLabel(r), count: c[r] ?? undefined })), s.tab)}
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
      ${list.length ? html`${table({
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
                <button type="button" class="btn-ghost btn-sm ${u.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}" data-action="toggle" data-id="${u.id}" title="${u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}" data-testid="row-toggle">${icon(u.status === 'ACTIVE' ? 'lock' : 'unlock', 'w-3.5 h-3.5')}</button>`}
            </div>`
        ])
      })}${pager(s.page)}` : emptyState('Không có tài khoản phù hợp', 'users')}
    </div>`;
}

export default function ManagerUsers(el) {
  let timer = null;
  const find = (ctx, id) => (ctx.state.page?.content || []).find(x => String(x.id) === id);
  return mountPage(el, {
    state: { tab: 'ALL', keyword: '', status: '', pageNo: 0 },
    load: async ctx => {
      const s = ctx.state;
      const query = {
        keyword: s.keyword.trim() || undefined,
        role: s.tab === 'ALL' ? undefined : s.tab,
        status: s.status || undefined,
        page: s.pageNo,
        size: PAGE_SIZE
      };
      // đếm bằng totalElements, mỗi lần chỉ lấy 1 dòng
      const total = q => userApi.page({ ...q, size: 1 }).then(p => p.totalElements).catch(() => null);
      const [page, ALL, MEMBER, RECEPTIONIST, COACH, CENTER_MANAGER, INACTIVE] = await Promise.all([
        userApi.page(query), total({}), total({ role: 'MEMBER' }), total({ role: 'RECEPTIONIST' }),
        total({ role: 'COACH' }), total({ role: 'CENTER_MANAGER' }), total({ status: 'INACTIVE' })
      ]);
      return { page, counts: { ALL, MEMBER, RECEPTIONIST, COACH, CENTER_MANAGER, INACTIVE } };
    },
    view,
    actions: {
      tab: (t, e, ctx) => { ctx.state.tab = t.dataset.tab; ctx.state.pageNo = 0; ctx.reload(); },
      // gõ xong 350ms mới hỏi BE, tránh gọi theo từng phím
      search: (t, e, ctx) => {
        ctx.state.keyword = t.value;
        clearTimeout(timer);
        timer = setTimeout(() => { ctx.state.pageNo = 0; ctx.reload(); }, 350);
      },
      status: (t, e, ctx) => { ctx.state.status = t.value; ctx.state.pageNo = 0; ctx.reload(); },
      page: (t, e, ctx) => { ctx.state.pageNo = Math.max(0, Number(t.dataset.page)); ctx.reload(); },
      edit: (t, e, ctx) => {
        const u = find(ctx, t.dataset.id);
        openFormModal({
          title: `Sửa tài khoản ${fullName(u)}`, fields: editForm(u), validate: validateEdit, success: 'Đã cập nhật tài khoản',
          submit: d => userApi.update(u.id, {
            firstName: d.firstName.trim(), lastName: d.lastName.trim(), gender: d.gender || undefined,
            email: d.email.trim(), phone: d.phone.trim()
          }),
          onDone: () => ctx.reload()
        });
      },
      toggle: async (t, e, ctx) => {
        const u = find(ctx, t.dataset.id);
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
