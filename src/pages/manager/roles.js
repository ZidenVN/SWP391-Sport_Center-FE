import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, loading, withBusy, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { roleApi } from '../../api/endpoints.js';
import { roleLabel } from '../../core/format.js';

// Gom quyền theo nhóm chức năng để dễ dò
const GROUPS = [
  ['Gói tập & thanh toán', /PACKAGE|PAYMENT|SUBSCRI|REFUND/],
  ['Lớp học, phòng, bộ môn', /CLASS|ROOM|SUBJECT/],
  ['Điểm danh', /ATTENDANCE|CHECK_IN/],
  ['Tài khoản & phân quyền', /USER|ROLE|MEMBER|TICKET/],
  ['Cá nhân', /OWN_/]
];

function groupOf(p) {
  const g = GROUPS.find(([, re]) => re.test(p.permissionName));
  return g ? g[0] : 'Khác';
}

function permissionPanel(s) {
  const role = s.roles.find(r => r.roleId === s.roleId);
  if (!role) return emptyState('Chọn một vai trò', 'shield');
  if (s.loadingPerms) return loading('Đang tải quyền...');
  const locked = role.roleName === 'CENTER_MANAGER';
  const groups = {};
  s.permissions.forEach(p => { (groups[groupOf(p)] ||= []).push(p); });
  const order = [...GROUPS.map(g => g[0]), 'Khác'].filter(n => groups[n]);
  return html`
    <form data-action="save" data-testid="permission-form">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <div class="font-bold">${roleLabel(role.roleName)}</div>
          <div class="text-xs text-slate-500">Đang bật <b data-testid="perm-count">${s.granted.size}</b>/${s.permissions.length} quyền</div>
        </div>
        ${locked ? html`<span class="text-xs font-semibold rounded-full bg-slate-100 text-slate-500 px-3 py-1.5">${icon('lock', 'w-3.5 h-3.5 inline')} Quản lý luôn có toàn quyền</span>` : html`
          <div class="flex gap-2">
            <button type="button" class="btn-secondary btn-sm" data-action="reset">Hoàn tác</button>
            <button type="submit" class="btn-primary btn-sm" data-testid="perm-save" ${s.dirty ? '' : 'disabled'}>${icon('save', 'w-3.5 h-3.5')} Lưu phân quyền</button>
          </div>`}
      </div>
      <div class="p-5 grid md:grid-cols-2 gap-5">
        ${order.map(name => html`
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">${name}</div>
            <div class="space-y-1.5">
              ${groups[name].map(p => html`
                <label class="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5 ${locked ? 'opacity-70' : 'cursor-pointer hover:bg-slate-50'} has-[:checked]:border-[#469B7E] has-[:checked]:bg-[#469B7E]/5">
                  <input type="checkbox" class="mt-0.5 rounded accent-[#469B7E]" data-action="toggle-perm" data-id="${p.permissionId}" ${s.granted.has(p.permissionId) ? 'checked' : ''} ${locked ? 'disabled' : ''} />
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-slate-800">${p.description || p.permissionName}</span>
                    <span class="block text-[11px] font-mono text-slate-400">${p.permissionName}</span>
                  </span>
                </label>`)}
            </div>
          </div>`)}
      </div>
    </form>`;
}

function view(s) {
  return html`
    ${pageHeader('Phân quyền', 'Bật / tắt quyền cho từng vai trò. Người dùng nhận quyền mới ở lần đăng nhập sau.')}
    <div class="grid lg:grid-cols-[260px_1fr] gap-5">
      <div class="card p-2 h-fit" data-testid="role-list">
        ${s.roles.map(r => html`
          <button type="button" data-action="pick-role" data-id="${r.roleId}"
            class="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl ${r.roleId === s.roleId ? 'bg-[#469B7E] text-white' : 'hover:bg-slate-50'}">
            ${icon(r.roleName === 'CENTER_MANAGER' ? 'crown' : r.roleName === 'COACH' ? 'medal' : r.roleName === 'RECEPTIONIST' ? 'concierge-bell' : 'user', 'w-4 h-4 shrink-0')}
            <span class="min-w-0">
              <span class="block font-semibold text-sm">${roleLabel(r.roleName)}</span>
              <span class="block text-[11px] ${r.roleId === s.roleId ? 'text-white/80' : 'text-slate-400'}">${r.roleName}</span>
            </span>
          </button>`)}
      </div>
      <div class="card">${permissionPanel(s)}</div>
    </div>`;
}

export default function ManagerRoles(el) {
  async function loadRole(ctx, roleId) {
    ctx.set({ roleId, loadingPerms: true, dirty: false });
    try {
      const own = await roleApi.permissionsOf(roleId);
      const granted = new Set(own.map(p => p.permissionId));
      ctx.set({ granted, original: new Set(granted), loadingPerms: false });
    } catch (err) {
      toast(err.message, 'error');
      ctx.set({ loadingPerms: false, granted: new Set(), original: new Set() });
    }
  }

  let started = false;
  return mountPage(el, {
    state: { granted: new Set(), original: new Set(), dirty: false },
    load: async () => {
      const [roles, permissions] = await Promise.all([roleApi.list(), roleApi.allPermissions()]);
      return { roles, permissions };
    },
    view,
    afterRender: (s, ctx) => {
      // lần đầu vào trang: mở sẵn vai trò Lễ tân (vai trò hay chỉnh nhất)
      if (started || !s.roles?.length) return;
      started = true;
      const first = s.roles.find(r => r.roleName === 'RECEPTIONIST') || s.roles[0];
      setTimeout(() => loadRole(ctx, first.roleId));
    },
    actions: {
      'pick-role': (t, e, ctx) => loadRole(ctx, Number(t.dataset.id)),
      'toggle-perm': (t, e, ctx) => {
        const id = Number(t.dataset.id);
        if (t.checked) ctx.state.granted.add(id); else ctx.state.granted.delete(id);
        const { granted, original } = ctx.state;
        const dirty = granted.size !== original.size || [...granted].some(x => !original.has(x));
        ctx.set({ dirty });
      },
      reset: (t, e, ctx) => ctx.set({ granted: new Set(ctx.state.original), dirty: false }),
      save: async (form, e, ctx) => {
        const ids = [...ctx.state.granted];
        const res = await withBusy(form, () => roleApi.setPermissions(ctx.state.roleId, ids));
        if (res !== undefined) {
          toast('Đã lưu phân quyền');
          ctx.set({ original: new Set(ctx.state.granted), dirty: false });
        }
      }
    }
  });
}
