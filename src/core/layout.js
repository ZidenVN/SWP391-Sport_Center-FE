import { ROUTES } from '../routes.js';
import { session } from './session.js';
import { html, render, icon } from './dom.js';
import { roleLabel } from './format.js';
import { refreshNotificationBadge } from '../components/notificationBadge.js';

const ROLE_ACCENT = {
  MEMBER: 'from-blue-600 to-indigo-600',
  RECEPTIONIST: 'from-teal-500 to-emerald-600',
  COACH: 'from-orange-500 to-rose-500',
  CENTER_MANAGER: 'from-indigo-600 to-violet-600'
};

function navItems(role) {
  return ROUTES.filter(r => r.nav && r.roles?.includes(role));
}

function navLink(route) {
  return html`
    <a href="#${route.path}" data-nav="${route.path}"
      class="nav-link flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
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
    <div class="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr ${ROLE_ACCENT[role] || ROLE_ACCENT.MEMBER} text-white flex items-center justify-center font-black text-sm">SC</div>
      <div>
        <div class="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">SPORT CENTER</div>
        <div class="text-[11px] font-bold uppercase tracking-wider text-indigo-600">${roleLabel(role)}</div>
      </div>
    </div>
    <nav class="p-3 space-y-4 overflow-y-auto flex-1" aria-label="Điều hướng">
      ${groups.map(g => html`
        <div class="space-y-1">
          ${g.name ? html`<div class="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">${g.name}</div>` : ''}
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
    <div class="min-h-screen flex">
      <aside id="sidebar" class="hidden lg:flex fixed lg:sticky top-0 z-30 h-screen w-64 shrink-0 flex-col bg-white border-r border-slate-200">
        ${sidebar(role)}
      </aside>
      <div id="sidebar-backdrop" class="hidden fixed inset-0 z-20 bg-slate-900/40 lg:hidden"></div>
      <div class="flex-1 min-w-0 flex flex-col">
        <header class="sticky top-0 z-10 h-16 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <button type="button" id="menu-toggle" class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100" aria-label="Mở menu">${icon('menu', 'w-5 h-5')}</button>
          <div class="hidden lg:block"></div>
          <div class="flex items-center gap-3">
            ${role === 'MEMBER' ? html`
              <a href="#/member/notifications" id="notif-bell" class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Thông báo" title="Thông báo">
                ${icon('bell', 'w-5 h-5')}
                <span data-notification-count class="hidden absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center"></span>
              </a>` : ''}
            <div class="text-right leading-tight hidden sm:block">
              <div class="text-sm font-bold text-slate-900" data-testid="current-user">${s.fullName || s.email}</div>
              <div class="text-[11px] text-slate-500">${s.email || ''}</div>
            </div>
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr ${ROLE_ACCENT[role] || ROLE_ACCENT.MEMBER} text-white flex items-center justify-center font-bold text-sm">
              ${(s.firstName || s.email || '?').charAt(0).toUpperCase()}
            </div>
            <button type="button" id="logout-btn" class="ml-1 p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Đăng xuất" aria-label="Đăng xuất">${icon('log-out', 'w-5 h-5')}</button>
          </div>
        </header>
        <main id="page" class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"></main>
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
  root.querySelector('#logout-btn').addEventListener('click', () => {
    session.end();
    window.location.hash = '#/login';
  });
  // shell mới dựng lại -> badge đang trống, lấy số chưa đọc ngay không chờ giãn cách
  refreshNotificationBadge({ force: true });
  return root.querySelector('#page');
}

export function setActiveNav(path) {
  document.querySelectorAll('[data-nav]').forEach(a => {
    const active = path === a.dataset.nav || path.startsWith(`${a.dataset.nav}/`);
    a.classList.toggle('bg-indigo-50', active);
    a.classList.toggle('text-indigo-700', active);
    a.setAttribute('aria-current', active ? 'page' : 'false');
  });
}
