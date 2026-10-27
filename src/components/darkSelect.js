import { html, icon } from '../core/dom.js';

// Ô chọn dạng thả xuống cho nền tối (trang đăng nhập / đăng ký).
// Danh sách <select> gốc của trình duyệt luôn nền trắng nên tự vẽ: nút bấm + danh sách kính mờ.
// Giá trị nằm trong <input type="hidden" name=...> nên readForm / FormData đọc như ô bình thường.
export function darkSelect(name, options, { label, placeholder = 'Chọn', value = '' } = {}) {
  const current = options.find(o => String(o.value) === String(value));
  return html`
    <div>
      <span class="block text-sm leading-5 font-medium text-white/85 mb-2" id="${name}-label">${label}</span>
      <div class="relative" data-field-wrap data-dark-select data-testid="${name}-select">
        <input type="hidden" name="${name}" value="${current ? current.value : ''}" />
        <button type="button" class="input ds-trigger flex items-center justify-between gap-2 text-left" data-ds-trigger
          aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${name}-label">
          <span data-ds-text class="${current ? '' : 'text-white/40'}">${current ? current.label : placeholder}</span>
          <span class="text-white/55 transition-transform" data-ds-chevron>${icon('chevron-down', 'w-4 h-4')}</span>
        </button>
        <ul role="listbox" aria-labelledby="${name}-label" data-ds-list
          class="ds-panel hidden absolute z-30 left-0 right-0 mt-2">
          ${options.map(o => html`
            <li>
              <button type="button" role="option" data-ds-option data-value="${o.value}" aria-selected="${String(o.value) === String(value)}"
                class="ds-opt">
                ${o.label}<span class="${String(o.value) === String(value) ? '' : 'invisible'}" data-ds-check>${icon('check', 'w-4 h-4')}</span>
              </button>
            </li>`)}
        </ul>
      </div>
    </div>`;
}

// Gắn hành vi cho mọi darkSelect trong root; trả về hàm gỡ sự kiện khi rời trang
export function mountDarkSelects(root) {
  const boxes = [...root.querySelectorAll('[data-dark-select]')];
  const parts = box => ({
    hidden: box.querySelector('input[type=hidden]'),
    trigger: box.querySelector('[data-ds-trigger]'),
    list: box.querySelector('[data-ds-list]'),
    chevron: box.querySelector('[data-ds-chevron]'),
    options: [...box.querySelectorAll('[data-ds-option]')]
  });

  const setOpen = (box, open) => {
    const { trigger, list, chevron, options } = parts(box);
    list.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
    chevron.style.transform = open ? 'rotate(180deg)' : '';
    if (open) (options.find(o => o.getAttribute('aria-selected') === 'true') || options[0]).focus();
  };

  const pick = (box, opt) => {
    const { hidden, trigger, options } = parts(box);
    hidden.value = opt.dataset.value;
    const text = trigger.querySelector('[data-ds-text]');
    text.textContent = opt.textContent.trim();
    text.classList.remove('text-white/40');
    options.forEach(o => {
      const on = o === opt;
      o.setAttribute('aria-selected', String(on));
      o.querySelector('[data-ds-check]').classList.toggle('invisible', !on);
    });
    // đã chọn thì bỏ lỗi "Vui lòng chọn..." đang hiện dưới ô
    box.nextElementSibling?.classList.contains('field-error') && box.nextElementSibling.remove();
    setOpen(box, false);
    trigger.focus();
  };

  const onClick = e => {
    const box = e.target.closest('[data-dark-select]');
    // bấm ra ngoài -> đóng mọi danh sách đang mở
    boxes.filter(b => b !== box).forEach(b => setOpen(b, false));
    if (!box) return;
    if (e.target.closest('[data-ds-trigger]')) setOpen(box, parts(box).list.classList.contains('hidden'));
    const opt = e.target.closest('[data-ds-option]');
    if (opt) pick(box, opt);
  };

  const onKey = e => {
    const box = e.target.closest?.('[data-dark-select]');
    if (!box) return;
    const { list, options, trigger } = parts(box);
    const open = !list.classList.contains('hidden');
    const i = options.indexOf(document.activeElement);
    if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(box, false); trigger.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(box, true); else options[Math.min(i + 1, options.length - 1)].focus(); }
    else if (e.key === 'ArrowUp' && open) { e.preventDefault(); options[Math.max(i - 1, 0)].focus(); }
    else if (e.key === 'Tab' && open) setOpen(box, false);
  };

  document.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKey);
  };
}
