import { ROUTES, PROFILE_BY_ROLE } from '../routes.js';
import { session } from './session.js';
import { html, render, icon } from './dom.js';
import { roleLabel } from './format.js';
import { refreshNotificationBadge } from '../components/notificationBadge.js';
import { brandMark } from '../components/brand.js';
import { authApi } from '../api/endpoints.js';
import { isDark, toggleTheme } from './theme.js';
import { startRealtime, stopRealtime } from './realtime.js';

// Một bộ nhận diện cho mọi vai trò: khung kính mờ tone sáng (glass) trên nền mảnh kính nhạt, điểm nhấn xanh rừng + vàng chanh
const SIDEBAR_BG = 'glass-panel';
const AVATAR = 'bg-brand-lime text-brand-dark';

function navItems(role) {
  return ROUTES.filter(r => r.nav && r.roles?.includes(role));
}

// Thu gọn sidebar (chỉ còn cột biểu tượng) — nhớ theo trình duyệt
const COLLAPSE_KEY = 'sc_sidebar_collapsed';
const isCollapsed = () => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } };

function navLink(route) {
  return html`
    <a href="#${route.path}" data-nav="${route.path}" title="${route.nav.label}"
      class="nav-link sb-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-white/80 hover:text-brand-dark transition-colors">
      <span class="relative shrink-0">${icon(route.nav.icon, 'w-[18px] h-[18px]')}
        ${route.path === '/member/notifications' ? html`<span data-notification-count class="sb-dot hidden absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold items-center justify-center"></span>` : ''}</span>
      <span class="sb-text flex-1 truncate">${route.nav.label}</span>
      ${route.path === '/member/notifications' ? html`<span data-notification-count class="sb-text hidden min-w-5 h-5 px-1.5 rounded-full bg-brand-dark text-brand-lime text-[11px] font-bold flex items-center justify-center"></span>` : ''}
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
    <!-- nút thu gọn / mở rộng nằm trên mép phải -->
    <button type="button" id="sidebar-collapse" class="sb-collapse hidden lg:flex" aria-label="Thu gọn menu"><span class="sb-grip" aria-hidden="true"><i></i><i></i><i></i></span>${icon('chevron-left', 'w-4 h-4 sb-chev')}</button>
    <div class="px-5 pt-4 shrink-0">
      <a href="#/" class="sb-brand flex items-center gap-2.5 mt-1" title="Sport Center">
        ${brandMark('w-9 h-9 ring-1 ring-white shadow-md shrink-0')}
        <span class="sb-text min-w-0 leading-none">
          <span class="block font-display font-extrabold text-2xl tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-brand-dark to-brand">SPORT CENTER</span>
          <span class="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-deep mt-1" data-testid="sb-role">${roleLabel(role)}</span>
        </span>
      </a>
    </div>
    <div class="mx-3 mt-4 h-px bg-gradient-to-r from-transparent via-brand-line to-transparent shrink-0"></div>
    <nav class="relative px-3 pb-3 pt-3 space-y-3 overflow-y-auto flex-1" aria-label="Điều hướng" data-sb-nav>
      <!-- viên chọn trượt tới mục đang chọn (vị trí do setActiveNav tính) -->
      <span class="sb-indicator" aria-hidden="true"></span>
      ${groups.map((g, i) => html`
        <div class="space-y-1 ${i ? 'pt-3 border-t border-white/80' : ''}">
          <div class="sb-text px-3.5 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">${g.name || 'Menu'}</div>
          ${g.items.map(navLink)}
        </div>`)}
    </nav>
    <!-- đăng xuất cố định ở đáy sidebar (mọi vai trò) -->
    <div class="px-3 pb-4 pt-3 shrink-0 border-t border-white/80">
      <button type="button" id="logout-btn" data-testid="menu-logout" title="Đăng xuất" class="sb-logout sb-item">
        <span class="sb-logout-icon" data-logout-icon>${icon('power', 'w-[18px] h-[18px]')}</span>
        <span class="sb-text flex-1 min-w-0 text-left leading-tight">
          <span class="block text-sm font-bold" data-logout-label>Đăng xuất</span>
        </span>
        <span class="sb-text sb-logout-arrow">${icon('arrow-right', 'w-4 h-4')}</span>
      </button>
    </div>`;
}

export function renderShell(root) {
  const s = session.get();
  const role = s.role;
  // thông báo đẩy realtime cho mọi vai trò (hội viên: thông báo; nhân viên: sự cố mới cần xử lý)
  startRealtime();
  if (root.dataset.shell === role && root.querySelector('#page')) {
    return root.querySelector('#page');
  }
  root.dataset.shell = role;
  render(root, html`
    <div class="app-shell min-h-screen flex gap-0 lg:gap-3 lg:p-3">
      <div class="app-bg" aria-hidden="true"></div>
      <aside id="sidebar" class="hidden lg:flex fixed lg:sticky top-0 lg:top-3 z-30 h-screen lg:h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col ${SIDEBAR_BG} lg:rounded-3xl sb ${isCollapsed() ? 'sb-collapsed' : ''}" data-testid="sidebar">
        ${sidebar(role)}
      </aside>
      <div id="sidebar-backdrop" class="hidden fixed inset-0 z-20 bg-slate-900/40 lg:hidden"></div>
      <div class="flex-1 min-w-0 flex flex-col gap-3 px-3 pt-3 lg:px-0 lg:pt-0">
        <header class="glass-panel sticky top-3 z-10 h-16 shrink-0 rounded-2xl flex items-center justify-between px-4 sm:px-6">
          <button type="button" id="menu-toggle" class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100" aria-label="Mở menu">${icon('menu', 'w-5 h-5')}</button>
          <div class="hidden lg:block"></div>
          <div class="flex items-center gap-3">
            <button type="button" id="theme-toggle" class="theme-toggle" data-testid="theme-toggle" aria-label="Đổi giao diện sáng / tối" title="Đổi giao diện sáng / tối">
              <span class="theme-toggle-knob">${icon('sun', 'w-4 h-4 theme-ic-sun')}${icon('moon', 'w-4 h-4 theme-ic-moon')}</span>
            </button>
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
                <a href="#/account/password" data-testid="menu-password" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  ${icon('key-round', 'w-4 h-4 text-slate-400')} Đổi mật khẩu
                </a>
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
  // menu trên điện thoại đang ẩn thì không đo được vị trí -> đặt lại viên chọn khi mở
  root.querySelector('#menu-toggle').addEventListener('click', () => { toggle(aside.classList.contains('hidden')); moveIndicator(aside.querySelector('.nav-active')); });
  backdrop.addEventListener('click', () => toggle(false));
  aside.addEventListener('click', e => {
    if (e.target.closest('a') && window.innerWidth < 1024) toggle(false);
  });
  // gợn sóng lan ra từ chỗ bấm trên mục menu
  aside.addEventListener('pointerdown', e => {
    const link = e.target.closest('.nav-link, #logout-btn');
    if (!link) return;
    const r = link.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const wave = document.createElement('span');
    wave.className = 'sb-ripple';
    wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    link.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
  const reposition = () => moveIndicator(aside.querySelector('.nav-active'));
  aside.addEventListener('transitionend', e => { if (e.target === aside) reposition(); });
  window.addEventListener('resize', reposition);
  // biểu tượng / font tải xong làm đổi chiều cao mục menu -> đặt lại viên chọn
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => reposition());
    aside.querySelectorAll('.nav-link').forEach(a => ro.observe(a));
  }
  document.fonts?.ready.then(reposition);
  // sáng / tối
  const themeBtn = root.querySelector('#theme-toggle');
  const syncThemeBtn = () => themeBtn.setAttribute('aria-pressed', String(isDark()));
  syncThemeBtn();
  themeBtn.addEventListener('click', () => { toggleTheme(); syncThemeBtn(); });
  // thu gọn / mở rộng (chỉ màn rộng)
  const collapseBtn = root.querySelector('#sidebar-collapse');
  const applyCollapse = on => {
    aside.classList.toggle('sb-collapsed', on);
    collapseBtn.setAttribute('aria-label', on ? 'Mở rộng menu' : 'Thu gọn menu');
  };
  applyCollapse(isCollapsed());
  collapseBtn.addEventListener('click', () => {
    const on = !aside.classList.contains('sb-collapsed');
    try { localStorage.setItem(COLLAPSE_KEY, on ? '1' : '0'); } catch { /* bỏ qua */ }
    applyCollapse(on);
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
  // gọi BE vô hiệu token trước; mất mạng / lỗi thì vẫn đăng xuất ở trình duyệt
  root.querySelector('#logout-btn').addEventListener('click', async e => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.classList.add('is-busy');
    const label = btn.querySelector('[data-logout-label]');
    if (label) label.textContent = 'Đang đăng xuất...';
    stopRealtime();
    await authApi.logout().catch(() => {});
    session.end();
    window.location.hash = '#/login';
  });
  // shell mới dựng lại -> badge đang trống, lấy số chưa đọc ngay không chờ giãn cách
  refreshNotificationBadge({ force: true });
  return root.querySelector('#page');
}

export function setActiveNav(path) {
  let current = null;
  document.querySelectorAll('[data-nav]').forEach(a => {
    const active = path === a.dataset.nav || path.startsWith(`${a.dataset.nav}/`);
    const was = a.classList.contains('nav-active');
    a.classList.toggle('nav-active', active);
    a.classList.toggle('hover:bg-white/80', !active);
    a.classList.toggle('hover:text-brand-dark', !active);
    a.classList.toggle('text-slate-600', !active);
    a.setAttribute('aria-current', active ? 'page' : 'false');
    if (active) current = a;
    // biểu tượng của mục vừa được chọn nảy 1 nhịp
    if (active && !was) {
      a.classList.remove('nav-pop');
      void a.offsetWidth;
      a.classList.add('nav-pop');
    }
  });
  moveIndicator(current);
}

// đặt viên chọn trùng vị trí mục đang chọn; lần đầu đặt thẳng, các lần sau trượt (CSS transition)
function moveIndicator(link) {
  const nav = document.querySelector('[data-sb-nav]');
  const bar = nav?.querySelector('.sb-indicator');
  if (!bar) return;
  if (!link) { bar.style.opacity = '0'; return; }
  const first = !bar.dataset.ready;
  if (first) bar.style.transition = 'none';
  bar.style.transform = `translateY(${link.offsetTop}px)`;
  bar.style.height = `${link.offsetHeight}px`;
  bar.style.opacity = '1';
  if (first) { void bar.offsetWidth; bar.style.transition = ''; bar.dataset.ready = '1'; }
}
