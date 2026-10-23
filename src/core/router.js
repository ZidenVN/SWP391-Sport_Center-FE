import { matchRoute, HOME_BY_ROLE } from '../routes.js';
import { session } from './session.js';
import { renderShell, setActiveNav } from './layout.js';
import { render, html } from './dom.js';
import { loading, errorState } from './ui.js';
import { refreshNotificationBadge } from '../components/notificationBadge.js';

let renderSeq = 0;
let cleanup = null;

export function currentPath() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = hash.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)), search: qs ? `?${qs}` : '' };
}

export function navigate(path, { replace = false } = {}) {
  const target = `#${path}`;
  if (window.location.hash === target) {
    handleRoute();
  } else if (replace) {
    window.history.replaceState(null, '', target);
    handleRoute();
  } else {
    window.location.hash = target;
  }
}

export function homePath() {
  return HOME_BY_ROLE[session.role()] || '/login';
}

export async function handleRoute() {
  const seq = ++renderSeq;
  const { path, query, search } = currentPath();
  const matched = matchRoute(path);
  const loggedIn = session.isLoggedIn();

  if (!matched) {
    navigate(loggedIn ? homePath() : '/login', { replace: true });
    return;
  }
  const { route, params } = matched;
  if (route.public && loggedIn) {
    navigate(homePath(), { replace: true });
    return;
  }
  if (!route.public && !route.open && !loggedIn) {
    // nhớ trang đang muốn vào (vd: trang kết quả VNPay) để quay lại sau khi đăng nhập
    sessionStorage.setItem('sc_after_login', path + search);
    navigate('/login', { replace: true });
    return;
  }
  if (loggedIn && route.roles && !route.roles.includes(session.role())) {
    navigate(homePath(), { replace: true });
    return;
  }

  if (cleanup) {
    try { cleanup(); } catch { /* bỏ qua */ }
    cleanup = null;
  }

  const root = document.getElementById('app-root');
  let container;
  if (route.public || !loggedIn) {
    container = root;
    root.dataset.shell = '';
  } else {
    container = renderShell(root);
    setActiveNav(route.navParent || route.path);
  }
  render(container, loading());
  window.scrollTo(0, 0);

  try {
    const mod = await route.load();
    if (seq !== renderSeq) return;
    const ctx = { params, query, search, navigate, path, loggedIn };
    const result = await mod.default(container, ctx);
    if (seq !== renderSeq) {
      if (typeof result === 'function') result();
      return;
    }
    if (typeof result === 'function') cleanup = result;
    if (loggedIn && !route.public && route.path !== '/member/notifications') refreshNotificationBadge();
  } catch (err) {
    console.error(err);
    if (seq === renderSeq) render(container, html`<div class="p-6">${errorState(err)}</div>`);
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
