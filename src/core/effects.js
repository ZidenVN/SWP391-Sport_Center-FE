// Gợn sóng khi bấm nút (thêm / sửa / xóa / lưu...) — dùng chung cho mọi vai trò.
// Hiệu ứng hover theo từng loại nút nằm ở css/styles.css (mục "HIỆU ỨNG NÚT").
const BUTTONS = '.btn-ghost, .btn-primary, .btn-secondary, .btn-danger';

export function initButtonEffects() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest?.(BUTTONS);
    if (!btn || btn.disabled || btn.closest('.auth-glass')) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'btn-ripple';
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - r.left - size / 2}px`;
    dot.style.top = `${e.clientY - r.top - size / 2}px`;
    btn.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  });
}
