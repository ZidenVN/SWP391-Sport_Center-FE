// Ô chọn tự vẽ cho mọi <select class="input"> trong app + popup (mọi vai trò).
// Danh sách thả xuống gốc của trình duyệt không chỉnh màu được nên vẽ lại theo tông web.
// <select> gốc vẫn nằm trong ô (trong suốt) -> readForm, validate, sự kiện change của các trang giữ nguyên.
const SKIP = '.auth-glass, [data-native-select]';
let panel = null; // danh sách đang mở { el, select, trigger, items, active }

// mục trống dạng 'Chọn ...' là chữ gợi ý (mờ); 'Tất cả ...' là lựa chọn thật
const isPlaceholder = o => !o || (o.value === '' && /^chọn/i.test(o.textContent.trim()));
const optionsOf = select => [...select.options].filter(o => !o.hidden);

function syncLabel(select) {
  const trigger = select.closest('.sc-dd');
  if (!trigger) return;
  const opt = select.options[select.selectedIndex];
  const label = trigger.querySelector('.sc-dd-label');
  label.textContent = opt ? opt.textContent.trim() : '';
  trigger.classList.toggle('is-empty', isPlaceholder(opt));
  trigger.classList.toggle('is-disabled', select.disabled);
  trigger.tabIndex = select.disabled ? -1 : 0;
  trigger.setAttribute('aria-disabled', String(select.disabled));
}

function enhance(select) {
  if (select.dataset.scDd || select.multiple || select.closest(SKIP)) return;
  select.dataset.scDd = '1';
  const trigger = document.createElement('div');
  // ô bấm nhận luôn class của select (độ rộng, .input...) để giữ bố cục cũ
  trigger.className = `${select.className} sc-dd`;
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.dataset.fieldWrap = '';
  if (select.getAttribute('aria-label')) trigger.setAttribute('aria-label', select.getAttribute('aria-label'));
  trigger.innerHTML = '<span class="sc-dd-label"></span><span class="sc-dd-chev" aria-hidden="true"></span>';
  select.replaceWith(trigger);
  trigger.appendChild(select);
  select.tabIndex = -1;
  select.classList.add('sc-dd-native');

  // code gán .value / selectedIndex trực tiếp -> cập nhật chữ hiển thị
  for (const prop of ['value', 'selectedIndex']) {
    const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
    Object.defineProperty(select, prop, {
      configurable: true,
      get() { return desc.get.call(this); },
      set(v) { desc.set.call(this, v); syncLabel(this); }
    });
  }
  select.addEventListener('change', () => syncLabel(select));
  new MutationObserver(() => syncLabel(select)).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'selected'] });
  syncLabel(select);
}

function close(focus = false) {
  if (!panel) return;
  const { el, trigger } = panel;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.classList.remove('is-open');
  el.classList.add('is-leaving');
  setTimeout(() => el.remove(), 120);
  if (focus) trigger.focus();
  panel = null;
}

function setActive(i) {
  if (!panel) return;
  const { items } = panel;
  if (!items.length) return;
  panel.active = Math.max(0, Math.min(items.length - 1, i));
  items.forEach((it, k) => it.classList.toggle('is-active', k === panel.active));
  items[panel.active].scrollIntoView({ block: 'nearest' });
}

function place() {
  if (!panel) return;
  const { el, trigger } = panel;
  const r = trigger.getBoundingClientRect();
  const below = innerHeight - r.bottom - 8;
  const above = r.top - 8;
  const h = Math.min(el.scrollHeight, 280);
  const up = below < Math.min(h, 200) && above > below;
  el.style.left = `${Math.max(8, Math.min(r.left, innerWidth - Math.max(r.width, 160) - 8))}px`;
  el.style.minWidth = `${r.width}px`;
  el.style.maxHeight = `${Math.max(120, Math.min(280, up ? above : below))}px`;
  el.style.top = up ? '' : `${r.bottom + 6}px`;
  el.style.bottom = up ? `${innerHeight - r.top + 6}px` : '';
  el.classList.toggle('is-up', up);
}

function choose(i) {
  const { select, opts } = panel;
  const opt = opts[i];
  if (!opt || opt.disabled) return;
  if (select.value !== opt.value) {
    select.value = opt.value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  // đã chọn thì bỏ lỗi "Vui lòng chọn..." đang hiện dưới ô
  const err = panel.trigger.nextElementSibling;
  if (err?.classList.contains('field-error') && opt.value !== '') err.remove();
  close(true);
}

function open(trigger) {
  const select = trigger.querySelector('select');
  if (!select || select.disabled) return;
  close();
  const opts = optionsOf(select);
  const el = document.createElement('div');
  el.className = 'sc-dd-panel';
  el.setAttribute('role', 'listbox');
  opts.forEach((o, i) => {
    const it = document.createElement('div');
    it.className = `sc-dd-opt${o.selected ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}${isPlaceholder(o) ? ' is-placeholder' : ''}`;
    it.setAttribute('role', 'option');
    it.setAttribute('aria-selected', String(o.selected));
    it.dataset.i = i;
    it.innerHTML = '<span class="sc-dd-opt-text"></span><span class="sc-dd-check" aria-hidden="true"></span>';
    it.firstChild.textContent = o.textContent.trim();
    el.appendChild(it);
  });
  // popup đang mở thì gắn trong popup để không bị lớp phủ chặn
  (trigger.closest('#modal-root') || document.body).appendChild(el);
  panel = { el, select, trigger, opts, items: [...el.children], active: 0 };
  trigger.setAttribute('aria-expanded', 'true');
  trigger.classList.add('is-open');
  place();
  setActive(Math.max(0, opts.findIndex(o => o.selected)));
  el.addEventListener('pointerdown', e => e.preventDefault()); // giữ focus ở ô bấm
  el.addEventListener('click', e => { const it = e.target.closest('.sc-dd-opt'); if (it) choose(+it.dataset.i); });
  el.addEventListener('pointermove', e => { const it = e.target.closest('.sc-dd-opt'); if (it && +it.dataset.i !== panel?.active) setActive(+it.dataset.i); });
}

export function initSelectBoxes() {
  const scan = root => {
    if (root.matches?.('select.input')) enhance(root);
    root.querySelectorAll?.('select.input').forEach(enhance);
  };
  scan(document.body);
  new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && scan(n))))
    .observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', e => {
    const trigger = e.target.closest('.sc-dd');
    if (!trigger) { if (!e.target.closest('.sc-dd-panel')) close(); return; }
    e.preventDefault(); // không để <label> bọc ngoài bấm hộ lần nữa
    if (panel?.trigger === trigger) close(); else open(trigger);
  });
  document.addEventListener('keydown', e => {
    const trigger = e.target.closest?.('.sc-dd');
    if (!trigger) return;
    const isOpen = panel?.trigger === trigger;
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key) && !isOpen) { e.preventDefault(); open(trigger); return; }
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(panel.active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(panel.active - 1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(panel.items.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(panel.active); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); } // không đóng luôn popup
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1) { // gõ chữ cái -> nhảy tới mục bắt đầu bằng chữ đó
      const k = e.key.toLowerCase();
      const n = panel.opts.length;
      for (let s = 1; s <= n; s++) { const i = (panel.active + s) % n; if (panel.opts[i].textContent.trim().toLowerCase().startsWith(k)) { setActive(i); break; } }
    }
  }, true);
  addEventListener('resize', () => close());
  document.addEventListener('scroll', e => { if (panel && !panel.el.contains(e.target)) close(); }, true);
  addEventListener('hashchange', () => close());
}
