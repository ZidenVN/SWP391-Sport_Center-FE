import { html } from '../core/dom.js';

// Logo Sport Center dùng chung toàn dự án (ảnh gốc: public/brand/logo-*.png, đã cắt bo góc trong suốt)
export const LOGO_SRC = '/brand/logo-128.png';

export function brandMark(cls = 'w-9 h-9') {
  return html`<img src="${LOGO_SRC}" alt="Sport Center" width="128" height="128" class="${cls} rounded-[22%] shrink-0 object-cover" />`;
}
