import { html, raw, render, bindActions, refreshIcons, icon } from './dom.js';

// ---------- Toast ----------
const TOAST_STYLES = {
  success: 'bg-emerald-700',
  error: 'bg-rose-600',
  info: 'bg-brand-dark',
  warning: 'bg-amber-600'
};

export function toast(message, type = 'success', title) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className = `toast flex items-start gap-3 p-4 rounded-xl shadow-lg text-white mb-3 animate-fade-in ${TOAST_STYLES[type] || TOAST_STYLES.info}`;
  el.innerHTML = String(html`
    <div class="flex-1 min-w-0">
      ${title ? html`<div class="font-bold text-sm">${title}</div>` : ''}
      <div class="text-sm opacity-95 whitespace-pre-line break-words">${message}</div>
    </div>
    <button type="button" class="opacity-70 hover:opacity-100 text-lg leading-none" aria-label="Đóng">&times;</button>
  `);
  el.querySelector('button').addEventListener('click', () => el.remove());
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, type === 'error' ? 6000 : 3500);
}

export function toastError(err, fallback = 'Có lỗi xảy ra, vui lòng thử lại') {
  toast(err?.message || fallback, 'error');
}

// ---------- Modal ----------
// openModal({ title, body, actions, size, onMount }) -> { el, close }
// body là html``; actions: handler map cho data-action bên trong modal.
export function openModal({ title, body, actions = {}, size = 'max-w-lg', onClose, onMount }) {
  const host = document.getElementById('modal-root');
  const wrapper = document.createElement('div');
  wrapper.className = 'fixed inset-0 z-40 flex items-start sm:items-center justify-center p-4 overflow-y-auto';
  wrapper.setAttribute('role', 'dialog');
  wrapper.setAttribute('aria-modal', 'true');
  render(wrapper, html`
    <div class="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm" data-action="__close"></div>
    <div class="relative w-full ${size} bg-white rounded-3xl shadow-2xl border border-brand-line my-8 animate-fade-in">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 class="font-display font-extrabold text-brand-dark text-2xl leading-none">${title}</h3>
        <button type="button" data-action="__close" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Đóng">${icon('x', 'w-5 h-5')}</button>
      </div>
      <div class="px-6 py-5 modal-body">${body}</div>
    </div>
  `);
  host.appendChild(wrapper);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    unbind();
    document.removeEventListener('keydown', onKey);
    wrapper.remove();
    if (onClose) onClose();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  const unbind = bindActions(wrapper, { ...actions, __close: close, cancel: close });

  const setBody = content => {
    render(wrapper.querySelector('.modal-body'), content);
  };
  const modal = { el: wrapper, close, setBody };
  const first = wrapper.querySelector('input:not([type=hidden]), select, textarea');
  if (first) first.focus();
  if (onMount) onMount(modal);
  return modal;
}

export function confirmDialog(message, { title = 'Xác nhận', confirmText = 'Đồng ý', danger = false } = {}) {
  return new Promise(resolve => {
    let answered = false;
    const modal = openModal({
      title,
      size: 'max-w-md',
      body: html`
        <p class="text-sm text-slate-600 whitespace-pre-line">${message}</p>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
          <button type="button" data-action="ok" class="${danger ? 'btn-danger' : 'btn-primary'}">${confirmText}</button>
        </div>
      `,
      actions: {
        ok: () => { answered = true; modal.close(); resolve(true); }
      },
      onClose: () => { if (!answered) resolve(false); }
    });
  });
}

// Chạy action async trên một nút: khoá nút + hiện spinner, bắt lỗi ra toast
export async function withBusy(button, fn) {
  const btn = button && button.tagName === 'FORM' ? button.querySelector('[type=submit]') : button;
  if (btn) {
    if (btn.disabled) return undefined;
    btn.disabled = true;
    btn.dataset.label = btn.innerHTML;
    btn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin align-middle"></span>';
  }
  try {
    return await fn();
  } catch (err) {
    showFormErrors(button, err);
    toastError(err);
    return undefined;
  } finally {
    if (btn && btn.isConnected) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.label;
      refreshIcons();
    }
  }
}

// Hiện lỗi validation (400 dạng {field: message}) ngay dưới ô input tương ứng
export function showFormErrors(formOrButton, err) {
  const form = formOrButton?.tagName === 'FORM' ? formOrButton : formOrButton?.closest?.('form');
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  if (!err?.fields) return;
  Object.entries(err.fields).forEach(([name, msg]) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    const p = document.createElement('p');
    p.className = 'field-error text-xs text-rose-600 mt-1';
    p.textContent = msg;
    // nhóm nút chọn (radio) / ô có icon -> báo lỗi dưới cả khối, không chèn vào giữa làm lệch icon
    const anchor = input.closest('[role=radiogroup], [data-field-wrap]') || input;
    anchor.insertAdjacentElement('afterend', p);
  });
}

// ---------- Khối hiển thị dùng chung ----------
export function loading(text = 'Đang tải dữ liệu...') {
  return html`
    <div class="flex items-center justify-center py-16 text-slate-500 text-sm gap-3" data-state="loading">
      <span class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>${text}
    </div>`;
}

export function emptyState(text, iconName = 'inbox') {
  return html`
    <div class="flex flex-col items-center justify-center py-12 text-slate-400 text-sm gap-2" data-state="empty">
      ${icon(iconName, 'w-8 h-8')}<span>${text}</span>
    </div>`;
}

export function errorState(err, retryAction = 'reload') {
  return html`
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-start gap-3" data-state="error">
      ${icon('alert-triangle', 'w-5 h-5 shrink-0')}
      <div class="flex-1">
        <div class="font-bold">Không tải được dữ liệu</div>
        <div class="mt-0.5">${err?.message || 'Lỗi không xác định'}</div>
      </div>
      <button type="button" data-action="${retryAction}" class="btn-secondary !py-1">Thử lại</button>
    </div>`;
}

export function pageHeader(title, subtitle, actions = '') {
  return html`
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-4xl font-extrabold tracking-tight leading-none text-brand-dark">${title}</h1>
        ${subtitle ? html`<p class="text-sm text-slate-500 mt-1">${subtitle}</p>` : ''}
      </div>
      <div class="flex flex-wrap gap-2">${actions}</div>
    </div>`;
}

// màu icon: amber/rose giữ nghĩa cảnh báo, còn lại theo tông thương hiệu (nền kem, icon xanh rừng)
const STAT_TONES = { amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600' };

export function statCard(label, value, iconName, color = 'emerald', hint = '') {
  return html`
    <div class="card p-5 flex items-start gap-4 rounded-3xl">
      <div class="w-12 h-12 rounded-2xl ${STAT_TONES[color] || 'bg-brand-sand text-brand-deep'} flex items-center justify-center shrink-0">${icon(iconName, 'w-5 h-5')}</div>
      <div class="min-w-0">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">${label}</div>
        <div class="font-display text-3xl font-extrabold text-brand-dark mt-0.5 truncate">${value}</div>
        ${hint ? html`<div class="text-xs text-slate-500 mt-0.5">${hint}</div>` : ''}
      </div>
    </div>`;
}

// tabs: [{ id, label, count? }] — kiểu chip bo tròn, đồng bộ với tông bo tròn của sidebar/nút
export function tabs(items, active, action = 'tab') {
  return html`
    <div class="inline-flex flex-wrap gap-1 bg-brand-sand rounded-full p-1 mb-5" role="tablist">
      ${items.map(t => html`
        <button type="button" role="tab" data-action="${action}" data-tab="${t.id}" aria-selected="${t.id === active}"
          class="px-4 py-2 text-sm font-bold whitespace-nowrap rounded-full transition-colors ${t.id === active ? 'bg-brand-dark text-white shadow-sm' : 'text-slate-600 hover:text-brand-dark'}">
          ${t.label}${t.count !== undefined ? html` <span class="ml-1 text-xs px-1.5 py-0.5 rounded-full ${t.id === active ? 'bg-brand-lime text-brand-dark' : 'bg-white/70'}">${t.count}</span>` : ''}
        </button>`)}
    </div>`;
}

// table({ columns: [{label, cls?}], rows: [[cell,...]], empty })
export function table({ columns, rows, empty = 'Chưa có dữ liệu' }) {
  if (!rows.length) return emptyState(empty);
  return html`
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wide text-slate-500 bg-brand-cream">
            ${columns.map(c => html`<th class="px-5 py-3 font-bold ${c.cls || ''}">${c.label}</th>`)}
          </tr>
        </thead>
        <tbody class="divide-y divide-brand-line/60">
          ${rows.map(r => html`<tr class="hover:bg-brand-cream/70 transition-colors">${r.map((cell, i) => html`<td class="px-5 py-3.5 align-middle ${columns[i]?.cls || ''}">${cell}</td>`)}</tr>`)}
        </tbody>
      </table>
    </div>`;
}

// ---------- Form fields ----------
export function field(label, input, hint = '') {
  return html`
    <label class="block">
      <span class="block text-xs font-bold text-slate-600 mb-1">${label}</span>
      ${input}
      ${hint ? html`<span class="block text-[11px] text-slate-400 mt-1">${hint}</span>` : ''}
    </label>`;
}

export function input(name, { type = 'text', value = '', required = false, placeholder = '', attrs = '' } = {}) {
  return html`<input class="input" name="${name}" type="${type}" value="${value ?? ''}" placeholder="${placeholder}" ${required ? raw('required') : ''} ${raw(attrs)} />`;
}

export function select(name, options, selected, { required = false, placeholder } = {}) {
  return html`
    <select class="input" name="${name}" ${required ? raw('required') : ''}>
      ${placeholder ? html`<option value="">${placeholder}</option>` : ''}
      ${options.map(o => html`<option value="${o.value}" ${String(o.value) === String(selected ?? '') ? raw('selected') : ''}>${o.label}</option>`)}
    </select>`;
}

export function textarea(name, value = '', { rows = 3, required = false, placeholder = '' } = {}) {
  return html`<textarea class="input" name="${name}" rows="${rows}" placeholder="${placeholder}" ${required ? raw('required') : ''}>${value ?? ''}</textarea>`;
}

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' }
];

export function formActions(submitText = 'Lưu') {
  return html`
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
      <button type="submit" class="btn-primary">${submitText}</button>
    </div>`;
}

export { html, raw, render, icon, bindActions };
