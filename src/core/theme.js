// Chế độ sáng / tối cho phần giao diện sau đăng nhập (mọi vai trò).
// Lưu lựa chọn trong trình duyệt; lần đầu theo cài đặt hệ điều hành. Màu tối do CSS html.theme-dark (css/styles.css) đảm nhận.
const KEY = 'sc_theme';

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* bỏ qua */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const isDark = () => document.documentElement.classList.contains('theme-dark');

export function applyTheme(theme = getTheme()) {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('theme-dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  refreshCharts();
}

export function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  try { localStorage.setItem(KEY, next); } catch { /* bỏ qua */ }
  // chuyển màu mượt trong lúc đổi chế độ
  document.documentElement.classList.add('theme-switching');
  applyTheme(next);
  setTimeout(() => document.documentElement.classList.remove('theme-switching'), 400);
  return next;
}

// ---- Biểu đồ (Chart.js): màu chữ, lưới theo chế độ ----
export function chartTheme() {
  return isDark()
    ? { text: '#c9d6cf', grid: 'rgba(255,255,255,0.08)' }
    : { text: '#64748b', grid: '#ECEFE8' };
}

export function styleChart(chart) {
  const t = chartTheme();
  const o = chart.options;
  if (o.plugins?.legend?.labels) o.plugins.legend.labels.color = t.text;
  Object.values(o.scales || {}).forEach(sc => {
    sc.ticks = { ...(sc.ticks || {}), color: t.text };
    if (sc.grid && sc.grid.display !== false) sc.grid.color = t.grid;
  });
}

function refreshCharts() {
  const Chart = window.Chart;
  if (!Chart?.instances) return;
  Object.values(Chart.instances).forEach(c => { styleChart(c); c.update('none'); });
}
