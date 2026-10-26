import { html, icon } from '../../core/dom.js';
import { pageHeader } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { session } from '../../core/session.js';
import { roleLabel } from '../../core/format.js';

// Hồ sơ cá nhân dùng chung cho Lễ tân / HLV / Quản lý.
// BE main chưa có GET/PUT /users/me (FE-TODO #10) -> hiện thông tin có trong phiên đăng nhập, chưa cho sửa.
// Khi BE bổ sung: thêm userApi.me / updateMe và bật FEATURES.staffProfileApi.
function view() {
  const u = session.get();
  const name = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  return html`
    ${pageHeader('Thông tin cá nhân', 'Thông tin tài khoản đang đăng nhập')}
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 text-center h-fit" data-testid="profile-card">
        <div class="w-20 h-20 mx-auto rounded-full bg-brand-dark text-brand-lime flex items-center justify-center text-3xl font-black">
          ${(u.firstName || u.email || '?').charAt(0).toUpperCase()}
        </div>
        <div class="font-display text-3xl leading-none font-extrabold text-brand-dark mt-3" data-testid="profile-name">${name}</div>
        ${u.email ? html`<div class="text-sm text-slate-500 mt-1">${u.email}</div>` : ''}
        <div class="text-xs font-bold uppercase tracking-wide text-brand-deep mt-1">${roleLabel(u.role)}</div>
      </div>
      <div class="card p-6 lg:col-span-2 space-y-4">
        <dl class="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt class="text-xs text-slate-500">Họ</dt><dd class="font-semibold">${u.firstName || '—'}</dd></div>
          <div><dt class="text-xs text-slate-500">Tên</dt><dd class="font-semibold">${u.lastName || '—'}</dd></div>
          <div><dt class="text-xs text-slate-500">Email đăng nhập</dt><dd class="font-semibold break-all">${u.email || '—'}</dd></div>
          <div><dt class="text-xs text-slate-500">Vai trò</dt><dd class="font-semibold">${roleLabel(u.role)}</dd></div>
          <div class="sm:col-span-2"><dt class="text-xs text-slate-500">Số quyền đang có</dt><dd class="font-semibold">${(u.permissions || []).length} quyền</dd></div>
        </dl>
        <div class="rounded-xl border border-brand-line bg-brand-sand/70 text-slate-600 p-3 text-sm flex gap-2" data-testid="profile-notice">
          ${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>Sửa họ tên, số điện thoại sẽ có khi hệ thống bổ sung chức năng. Cần đổi thông tin ngay, liên hệ Quản lý trung tâm.</span>
        </div>
        <div class="flex justify-end">
          <a href="#/account/password" class="btn-primary" data-testid="profile-password">${icon('key-round', 'w-4 h-4')} Đổi mật khẩu</a>
        </div>
      </div>
    </div>`;
}

export default function MyProfile(el) {
  return mountPage(el, { view });
}
