import { html, render, icon } from '../../core/dom.js';

// Trang tạm cho các màn đang được phát triển
export default function ComingSoon(el) {
  render(el, html`
    <div class="card p-10 text-center max-w-lg mx-auto mt-10">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">${icon('hammer', 'w-7 h-7')}</div>
      <h1 class="text-xl font-extrabold mt-4">Màn hình đang được phát triển</h1>
      <p class="text-sm text-slate-500 mt-2">Chức năng này sẽ có trong bản cập nhật tiếp theo.</p>
    </div>`);
}
