import { html, icon, render } from '../core/dom.js';
import { field } from '../core/ui.js';

// Ô chọn ảnh dùng chung (ảnh lớp, ảnh bộ môn): bắt buộc khi tạo, tuỳ chọn khi sửa (không chọn = giữ ảnh cũ).
// BE nhận jpg/jpeg/png/webp/heic/heif, tối đa 10MB.
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const IMAGE_MAX = 10 * 1024 * 1024;
export const hasFile = f => f && typeof f === 'object' && f.size > 0;
const fileExt = f => (f.name.includes('.') ? f.name.split('.').pop() : '').toLowerCase();

// label: tên ô; currentUrl: ảnh đang hiển thị khi sửa (rỗng khi tạo); currentText: chú thích cho ảnh đang có
export function imageField({ label, required, currentUrl = '', currentText = '' }) {
  return field(required ? label : `${label} (tuỳ chọn)`, html`
    <div data-field-wrap>
      <label class="group relative flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-line hover:border-brand/60 bg-brand-cream/40 p-3 cursor-pointer transition-colors" data-testid="image-picker">
        <span class="w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400" data-image-preview>
          ${currentUrl ? html`<img src="${currentUrl}" alt="" class="w-full h-full object-cover" />` : icon('image-plus', 'w-7 h-7')}
        </span>
        <span class="min-w-0 text-sm">
          <span class="block font-semibold text-slate-700" data-image-name>${currentUrl ? currentText : 'Bấm để chọn ảnh'}</span>
          <span class="block text-xs text-slate-500 mt-0.5">JPG, PNG, WEBP, HEIC · tối đa 10MB${required ? '' : ' · không chọn sẽ giữ ảnh cũ'}</span>
        </span>
        <input type="file" name="image" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif" class="sr-only" data-testid="image-input" />
      </label>
    </div>`);
}

// kiểm tra file ở FE trước khi gửi (BE vẫn kiểm tra lại)
export function imageErrors(d, required, missingMessage = 'Vui lòng chọn ảnh') {
  if (!hasFile(d.image)) return required ? { image: missingMessage } : {};
  if (!IMAGE_EXT.includes(fileExt(d.image))) return { image: 'Chỉ nhận ảnh JPG, JPEG, PNG, WEBP, HEIC hoặc HEIF' };
  if (d.image.size > IMAGE_MAX) return { image: `Ảnh nặng ${(d.image.size / 1024 / 1024).toFixed(1)}MB, tối đa 10MB` };
  return {};
}

// xem trước ảnh vừa chọn (HEIC: trình duyệt không xem trước được, chỉ hiện tên file)
export function mountImagePicker(modal) {
  const inputEl = modal.el.querySelector('[data-testid=image-input]');
  if (!inputEl) return;
  let url = '';
  inputEl.addEventListener('change', () => {
    const file = inputEl.files?.[0];
    const box = modal.el.querySelector('[data-image-preview]');
    const name = modal.el.querySelector('[data-image-name]');
    if (url) URL.revokeObjectURL(url);
    url = '';
    if (!file) return;
    name.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    if (['heic', 'heif'].includes(fileExt(file))) {
      render(box, html`<span class="text-[11px] font-bold text-slate-500 text-center px-2">HEIC<br />không xem trước được</span>`);
    } else {
      url = URL.createObjectURL(file);
      render(box, html`<img src="${url}" alt="" class="w-full h-full object-cover" data-testid="image-preview-img" />`);
    }
    // chọn lại ảnh thì xoá thông báo lỗi cũ ngay dưới ô ảnh
    const wrap = inputEl.closest('[data-field-wrap]');
    if (wrap.nextElementSibling?.classList.contains('field-error')) wrap.nextElementSibling.remove();
  });
}

// lỗi ảnh của BE (ERR_IMG_001..003) hiện ngay dưới ô chọn ảnh; ERR_IMG_004 (Cloudinary lỗi) chỉ báo, cho thử lại
export const attachImageError = err => {
  if (/^ERR_IMG_00[123]$/.test(err?.code || '')) err.fields = { ...(err.fields || {}), image: err.message };
  return err;
};
