import { ROUTES, PROFILE_BY_ROLE } from '../routes.js';
import { session } from './session.js';
import { html, render, icon } from './dom.js';
import { roleLabel } from './format.js';
import { refreshNotificationBadge } from '../components/notificationBadge.js';
import { brandMark } from '../components/brand.js';
import { syncPermissions } from '../components/permissionSync.js';

// Một bộ nhận diện cho mọi vai trò, cùng tông trang giới thiệu: nền xanh rừng, điểm nhấn vàng chanh
const SIDEBAR_BG = 'bg-brand-dark';
const AVATAR = 'bg-brand-lime text-brand-dark';

function navItems(role) {
  return ROUTES.filter(r => r.nav && r.roles?.includes(role));
}

function navLink(route) {
  return html`
    <a href="#${route.path}" data-nav="${route.path}"
      class="nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors">
      ${icon(route.nav.icon, 'w-4 h-4 shrink-0')}<span class="flex-1">${route.nav.label}</span>
      ${route.path === '/member/notifications' ? html`<span data-notification-count class="hidden min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center"></span>` : ''}
    </a>`;
}

function sidebar(role) {
  const items = navItems(role);
  const groups = [];
  items.forEach(item => {
    const name = item.nav.group || '';
    let g = groups.find(x => x.name === name);
    if (!g) groups.push(g = { name, items: [] });
    g.items.push(item);
  });
  return html`
    <div class="flex items-center gap-3 px-4 h-16 shrink-0">
      ${brandMark('w-10 h-10 ring-1 ring-white/20')}
      <div>
        <div class="font-display font-extrabold text-xl tracking-wide text-white leading-none">SPORT CENTER</div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-brand-lime mt-0.5">${roleLabel(role)}</div>
      </div>
    </div>
    <nav class="px-3 pb-3 space-y-4 overflow-y-auto flex-1" aria-label="Điều hướng">
      ${groups.map(g => html`
        <div class="space-y-1">
          ${g.name ? html`<div class="px-3.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">${g.name}</div>` : ''}
          ${g.items.map(navLink)}
        </div>`)}
    </nav>`;
}

export function renderShell(root) {
  const s = session.get();
  const role = s.role;
  if (root.dataset.shell === role && root.querySelector('#page')) {
    return root.querySelector('#page');
  }
  root.dataset.shell = role;
  render(root, html`
    <div class="min-h-screen flex gap-0 lg:gap-3 lg:p-3">
      <aside id="sidebar" class="hidden lg:flex fixed lg:sticky top-0 lg:top-3 z-30 h-screen lg:h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col ${SIDEBAR_BG} lg:rounded-3xl shadow-xl">
        ${sidebar(role)}
      </aside>
      <div id="sidebar-backdrop" class="hidden fixed inset-0 z-20 bg-slate-900/40 lg:hidden"></div>
      <div class="flex-1 min-w-0 flex flex-col gap-3 px-3 pt-3 lg:px-0 lg:pt-0">
        <header class="sticky top-3 z-10 h-16 shrink-0 bg-white rounded-2xl shadow-sm border border-brand-line/70 flex items-center justify-between px-4 sm:px-6">
          <button type="button" id="menu-toggle" class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100" aria-label="Mở menu">${icon('menu', 'w-5 h-5')}</button>
          <div class="hidden lg:block"></div>
          <div class="flex items-center gap-3">
            ${role === 'MEMBER' ? html`
              <a href="#/member/notifications" id="notif-bell" class="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Thông báo" title="Thông báo">
                ${icon('bell', 'w-5 h-5')}
                <span data-notification-count class="hidden absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center"></span>
              </a>` : ''}
            <div class="relative">
              <button type="button" id="profile-trigger" class="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors" aria-haspopup="true" aria-expanded="false">
                <div class="text-right leading-tight hidden sm:block">
                  <div class="text-sm font-bold text-slate-900" data-testid="current-user">${s.fullName || s.email}</div>
                  <div class="text-[11px] text-slate-500">${s.email || ''}</div>
                </div>
                <div data-testid="current-avatar" class="w-9 h-9 rounded-full ${AVATAR} flex items-center justify-center font-extrabold text-sm shrink-0">
                  ${(s.firstName || s.email || '?').charAt(0).toUpperCase()}
                </div>
                <span class="text-slate-400">${icon('chevron-down', 'w-4 h-4')}</span>
              </button>
              <div id="profile-menu" class="hidden absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white rounded-2xl shadow-lg border border-slate-200/70 py-1.5 z-20" role="menu">
                <a href="#${PROFILE_BY_ROLE[role] || '/profile'}" data-testid="menu-profile" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  ${icon('user', 'w-4 h-4 text-slate-400')} Thông tin cá nhân
                </a>
                <div class="h-px bg-slate-100 my-1"></div>
                <button type="button" id="logout-btn" data-testid="menu-logout" role="menuitem"
                  class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                  ${icon('log-out', 'w-4 h-4')} Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>
        <main id="page" class="flex-1 pb-6 max-w-7xl w-full mx-auto"></main>
      </div>
    </div>
  `);

  const aside = root.querySelector('#sidebar');
  const backdrop = root.querySelector('#sidebar-backdrop');
  const toggle = open => {
    aside.classList.toggle('hidden', !open);
    aside.classList.toggle('flex', open);
    backdrop.classList.toggle('hidden', !open);
  };
  root.querySelector('#menu-toggle').addEventListener('click', () => toggle(aside.classList.contains('hidden')));
  backdrop.addEventListener('click', () => toggle(false));
  aside.addEventListener('click', e => {
    if (e.target.closest('a') && window.innerWidth < 1024) toggle(false);
  });
  const trigger = root.querySelector('#profile-trigger');
  const menu = root.querySelector('#profile-menu');
  const setMenu = open => {
    menu.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger.addEventListener('click', e => { e.stopPropagation(); setMenu(menu.classList.contains('hidden')); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  root.querySelector('#logout-btn').addEventListener('click', () => {
    session.end();
    window.location.hash = '#/login';
  });
  // shell mới dựng lại -> badge đang trống, lấy số chưa đọc ngay không chờ giãn cách
  refreshNotificationBadge({ force: true });
  return root.querySelector('#page');
}

export function setActiveNav(path) {
  syncPermissions();
  document.querySelectorAll('[data-nav]').forEach(a => {
    const active = path === a.dataset.nav || path.startsWith(`${a.dataset.nav}/`);
    a.classList.toggle('bg-brand-lime', active);
    a.classList.toggle('text-brand-dark', active);
    a.classList.toggle('hover:bg-white/10', !active);
    a.classList.toggle('hover:text-white', !active);
    a.classList.toggle('text-white/70', !active);
    a.setAttribute('aria-current', active ? 'page' : 'false');
  });
}
