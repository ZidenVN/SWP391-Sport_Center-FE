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
  // không dùng items-center: popup cao hơn màn hình sẽ bị cắt phần trên, không cuộn lên được.
  // my-auto vẫn căn giữa khi popup ngắn, còn popup dài thì cuộn được từ đầu
  wrapper.className = 'fixed inset-0 z-40 flex items-start justify-center p-4 overflow-y-auto';
  wrapper.setAttribute('role', 'dialog');
  wrapper.setAttribute('aria-modal', 'true');
  render(wrapper, html`
    <div class="sc-backdrop fixed inset-0" data-action="__close"></div>
    <div class="sc-modal relative w-full ${size} my-auto">
      <div class="sc-modal-head">
        <h3 class="sc-modal-title font-display font-extrabold text-2xl leading-none">${title}</h3>
        <button type="button" data-action="__close" class="sc-modal-close" aria-label="Đóng">${icon('x', 'w-4 h-4')}</button>
      </div>
      <div class="px-6 pt-4 pb-6 modal-body">${body}</div>
    </div>
  `);
  host.appendChild(wrapper);
  refreshIcons(); // render() chạy khi popup chưa gắn vào trang nên icon chưa được vẽ

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    unbind();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', close);
    wrapper.remove();
    if (onClose) onClose();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  // popup nằm ngoài vùng trang (#modal-root): đổi trang thì phải tự đóng, không sẽ đè lên trang mới
  window.addEventListener('hashchange', close);
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
    btn.querySelectorAll('.btn-ripple').forEach(n => n.remove()); // không lưu gợn sóng vào nhãn nút
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
// Icon chờ: người chạy trên máy chạy bộ (chuyển động bằng CSS .sc-run-* trong css/styles.css).
// width: px (cao = 3/4 rộng); tone: class màu, để trống thì lấy màu chữ của chỗ đặt (vd nút nền đậm -> trắng)
export function runnerIcon(width = 56, tone = 'text-brand-dark') {
  return html`
      <svg class="sc-run shrink-0 ${tone}" viewBox="0 0 120 90" width="${width}" height="${Math.round(width * 0.75)}" aria-hidden="true"
        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <line x1="14" y1="77" x2="102" y2="68" stroke-width="8"/>
        <line class="sc-run-belt" x1="20" y1="76.4" x2="96" y2="68.6" stroke-width="2"/>
        <line x1="22" y1="82" x2="30" y2="82" stroke-width="4"/>
        <line x1="88" y1="75" x2="96" y2="75" stroke-width="4"/>
        <line x1="100" y1="68" x2="109" y2="33" stroke-width="6"/>
        <line x1="109" y1="33" x2="116" y2="26" stroke-width="6"/>
        <line x1="107" y1="40" x2="93" y2="40" stroke-width="5"/>
        <g class="sc-run-body">
          <polyline class="sc-run-arm sc-run-back" points="55,26 51,37 59,42" stroke-width="7"/>
          <polyline class="sc-run-leg sc-run-back" points="50,44 55,57 50,70" stroke-width="8"/>
          <line x1="56" y1="22" x2="50" y2="44" stroke-width="11"/>
          <circle cx="59" cy="11" r="7" fill="currentColor" stroke="none"/>
          <polyline class="sc-run-leg" points="50,44 55,57 50,70" stroke-width="8"/>
          <polyline class="sc-run-arm" points="55,26 51,37 59,42" stroke-width="7"/>
        </g>
      </svg>`;
}

export function loading(text = 'Đang tải dữ liệu...') {
  return html`
    <div class="flex items-center justify-center py-16 text-slate-500 text-sm gap-3" data-state="loading" role="status" aria-live="polite">
      ${runnerIcon()}${text}
    </div>`;
}

export function emptyState(text, iconName = 'inbox') {
  return html`
    <div class="flex flex-col items-center justify-center py-12 text-slate-500 text-sm gap-2" data-state="empty">
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
        ${subtitle ? html`<p class="text-sm text-slate-600 mt-1">${subtitle}</p>` : ''}
      </div>
      <div class="flex flex-wrap gap-2">${actions}</div>
    </div>`;
}

// màu icon: amber/rose giữ nghĩa cảnh báo, còn lại theo tông thương hiệu (nền kem, icon xanh rừng)
const STAT_TONES = { amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600' };

export function statCard(label, value, iconName, color = 'emerald', hint = '') {
  return html`
    <div class="card stat-card p-5 flex items-start gap-4 rounded-3xl">
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
// Ô bắt buộc tự có dấu * (CSS): ô bên trong có thuộc tính required, hoặc truyền { required: true }
// cho ô chỉ kiểm tra bằng JS (select có giá trị mặc định, nhóm nút chọn, ô ngày tự viết...)
export function field(label, input, hint = '', { required = false } = {}) {
  return html`
    <label class="block ${required ? 'is-required' : ''}">
      <span class="field-label block text-xs font-bold text-slate-600 mb-1">${label}</span>
      ${input}
      ${hint ? html`<span class="field-hint block text-[11px] text-slate-400 mt-1">${hint}</span>` : ''}
    </label>`;
}

export function input(name, { type = 'text', value = '', required = false, placeholder = '', attrs = '' } = {}) {
  return html`<input class="input" name="${name}" type="${type}" value="${value ?? ''}" placeholder="${placeholder}" ${required ? raw('required') : ''} ${raw(attrs)} />`;
}

// Ngày + giờ kiểu 24h Việt Nam (ô datetime-local của trình duyệt hiện SA/CH theo máy, không ép 24h được).
// Gửi đi qua ô ẩn name=<name> dạng yyyy-MM-ddTHH:mm như datetime-local nên validate/payload giữ nguyên.
const pad2 = n => String(n).padStart(2, '0');
function clockSelects(hh, mm, minuteStep) {
  const minutes = [];
  for (let m = 0; m < 60; m += minuteStep) minutes.push(pad2(m));
  if (mm && !minutes.includes(mm)) minutes.push(mm);
  minutes.sort();
  const opt = (v, cur) => html`<option value="${v}" ${v === cur ? raw('selected') : ''}>${v}</option>`;
  return html`
    <div class="flex items-center gap-1.5">
      <select class="input !w-[5.5rem] !pl-3 !pr-8" data-dt-part="hour" aria-label="Giờ">
        ${Array.from({ length: 24 }, (_, h) => opt(pad2(h), hh))}
      </select>
      <span class="font-bold text-slate-400">:</span>
      <select class="input !w-[5.5rem] !pl-3 !pr-8" data-dt-part="minute" aria-label="Phút">
        ${minutes.map(m => opt(m, mm))}
      </select>
    </div>`;
}

export function dateTimeInput(name, value = '', { required = false, minuteStep = 5 } = {}) {
  const [d = '', t = ''] = String(value || '').split('T');
  const [hh = '', mm = ''] = t.split(':');
  return html`
    <div class="flex flex-wrap items-center gap-2" data-field-wrap data-dt24>
      <input type="hidden" name="${name}" value="${value || ''}" ${required ? raw('required') : ''} />
      <input class="input flex-1 min-w-[10rem]" type="date" value="${d}" data-dt-part="date" aria-label="Ngày" />
      ${clockSelects(hh, mm, minuteStep)}
    </div>`;
}

// Chỉ giờ:phút kiểu 24h, gửi đi dạng HH:mm
export function timeInput(name, value = '', { minuteStep = 5 } = {}) {
  const [hh = '', mm = ''] = String(value || '').split(':');
  return html`
    <div data-field-wrap data-dt24>
      <input type="hidden" name="${name}" value="${value || ''}" />
      ${clockSelects(hh, mm, minuteStep)}
    </div>`;
}

// ghép ngày/giờ/phút vào ô ẩn mỗi khi người dùng đổi
if (typeof document !== 'undefined') {
  const syncDateTime = e => {
    const wrap = e.target.closest?.('[data-dt24]');
    if (!wrap) return;
    const part = p => wrap.querySelector(`[data-dt-part="${p}"]`)?.value;
    const clock = `${part('hour')}:${part('minute')}`;
    const hasDate = wrap.querySelector('[data-dt-part="date"]');
    wrap.querySelector('input[type=hidden]').value = !hasDate ? clock : part('date') ? `${part('date')}T${clock}` : '';
  };
  document.addEventListener('change', syncDateTime);
  document.addEventListener('input', syncDateTime);
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
    <div class="modal-actions flex justify-end gap-2 pt-2">
      <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
      <button type="submit" class="btn-primary">${submitText}</button>
    </div>`;
}

export { html, raw, render, icon, bindActions };
