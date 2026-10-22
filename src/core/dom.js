// Tiện ích dựng HTML an toàn: mọi giá trị chèn vào html`` đều được escape,
// trừ khi đã là kết quả của html`` hoặc raw().

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, ch => ESCAPES[ch]);
}

export function raw(value) {
  return new SafeHtml(value === null || value === undefined ? '' : String(value));
}

function serialize(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join('');
  return esc(value);
}

export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) out += serialize(values[i]);
  });
  return new SafeHtml(out);
}

export function render(el, content) {
  el.innerHTML = serialize(content);
  refreshIcons();
}

export function refreshIcons() {
  if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

export function icon(name, cls = 'w-4 h-4') {
  return html`<i data-lucide="${name}" class="${cls}"></i>`;
}

// Gắn handler theo data-action, dùng chung cho mọi page:
// <button data-action="save" data-id="3"> -> handlers.save(el, event)
export function bindActions(root, handlers) {
  const onEvent = (event) => {
    const target = event.target.closest('[data-action]');
    if (!target || !root.contains(target)) return;
    const name = target.dataset.action;
    const handler = handlers[name];
    if (!handler) return;
    const isFormSubmit = event.type === 'submit';
    const isClick = event.type === 'click' && target.tagName !== 'FORM' && target.tagName !== 'SELECT' && target.tagName !== 'INPUT';
    const isChange = event.type === 'change' && (target.tagName === 'SELECT' || target.tagName === 'INPUT');
    const isInput = event.type === 'input' && target.dataset.live !== undefined;
    if (!(isFormSubmit || isClick || isChange || isInput)) return;
    if (isFormSubmit || target.tagName === 'A') event.preventDefault();
    handler(target, event);
  };
  root.addEventListener('click', onEvent);
  root.addEventListener('submit', onEvent);
  root.addEventListener('change', onEvent);
  root.addEventListener('input', onEvent);
  return () => {
    root.removeEventListener('click', onEvent);
    root.removeEventListener('submit', onEvent);
    root.removeEventListener('change', onEvent);
    root.removeEventListener('input', onEvent);
  };
}

// Đọc form thành object; ô rỗng -> bỏ qua để không ghi đè dữ liệu bằng chuỗi rỗng
export function readForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    const v = typeof value === 'string' ? value.trim() : value;
    if (v !== '') data[key] = v;
  });
  return data;
}
