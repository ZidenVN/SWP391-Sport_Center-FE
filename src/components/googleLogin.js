import { html, icon, raw } from '../core/dom.js';
import { authApi } from '../api/endpoints.js';
import { startSession } from '../pages/auth/login.js';

// Client ID OAuth của Google (không phải bí mật: luôn lộ ra trình duyệt) -> để sẵn mặc định cho cả nhóm pull về chạy được ngay.
// Muốn dùng client khác: đặt VITE_GOOGLE_CLIENT_ID trong FE/.env.local (đặt rỗng = tắt đăng nhập Google).
// Phải trùng google.client-id của BE, và origin http://localhost:5173 phải được khai báo trong Google Cloud Console.
const DEFAULT_GOOGLE_CLIENT_ID = '697959735326-e09tvkscoo8peprq2s428mgr8urp64rj.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID = (import.meta.env || {}).VITE_GOOGLE_CLIENT_ID ?? DEFAULT_GOOGLE_CLIENT_ID;

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise = null;

function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  gsiPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google) : reject(new Error('Không tải được Google Sign-In')));
    s.onerror = () => { gsiPromise = null; reject(new Error('Không tải được Google Sign-In, kiểm tra kết nối mạng')); };
    document.head.appendChild(s);
  });
  return gsiPromise;
}

const ERROR_TEXT = {
  401: 'Tài khoản Google không hợp lệ hoặc chưa xác minh email',
  403: 'Tài khoản đã bị khóa, vui lòng liên hệ trung tâm'
};

// Logo chữ G nhiều màu chuẩn của Google
const GOOGLE_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

// Khung "hoặc" + nút Google kính trong suốt đồng bộ với thẻ đăng nhập.
// BE (POST /auth/google { token }) xác minh ID token, nên phải dùng nút Sign In With Google (google.accounts.id, iframe)
// để nhận credential. Nút iframe không đổi màu được -> vẽ nút kính riêng, đặt nút thật của Google phủ lên trên
// gần như trong suốt và kéo giãn vừa khít: người dùng thấy nút kính, cú bấm vẫn vào nút Google.
export function googleSection(label = 'hoặc', buttonText = 'Đăng nhập bằng Google') {
  if (!GOOGLE_CLIENT_ID) {
    return import.meta.env?.DEV ? html`
      <div class="mt-6 rounded-xl border border-dashed border-white/25 p-3 text-xs text-white/60 flex gap-2" data-testid="google-missing">
        ${icon('info', 'w-4 h-4 shrink-0')}
        <span>Đăng nhập Google chưa bật: thêm <code class="font-mono">VITE_GOOGLE_CLIENT_ID</code> vào <code class="font-mono">FE/.env.local</code> rồi chạy lại Vite.</span>
      </div>` : '';
  }
  return html`
    <div class="flex items-center gap-3 my-6 text-xs font-semibold text-white/50">
      <span class="h-px flex-1 bg-white/20"></span>${label}<span class="h-px flex-1 bg-white/20"></span>
    </div>
    <div id="google-btn" data-testid="google-btn" data-text="${buttonText.startsWith('Đăng ký') ? 'signup_with' : 'signin_with'}" class="google-glass group relative w-full h-12">
      <div class="google-glass-face absolute inset-0 rounded-full flex items-center justify-center gap-3 text-[0.95rem] font-semibold text-white/90 pointer-events-none">
        <span class="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">${raw(GOOGLE_G)}</span>
        <span data-google-text>${buttonText}</span>
      </div>
      <div data-google-hit class="absolute left-0 top-0 origin-top-left opacity-[0.01] overflow-hidden" aria-hidden="false"></div>
    </div>`;
}

// Email trong ID token (AuthResponse của BE không có email) — chỉ để hiển thị, việc xác thực do BE làm
function emailFromIdToken(credential) {
  try {
    const part = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(part), ch => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)).email || '';
  } catch {
    return '';
  }
}

// Vẽ nút Google và xử lý đăng nhập. onError(message) để trang tự hiện lỗi, onSuccess() sau khi đã có session.
export async function mountGoogleButton(root, { onSuccess, onError }) {
  const box = root.querySelector('#google-btn');
  if (!box || !GOOGLE_CLIENT_ID) return;
  try {
    const google = await loadGsi();
    if (!box.isConnected) return;
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: 'popup',
      callback: async resp => {
        if (!resp?.credential) { onError('Đăng nhập Google bị hủy hoặc không được cấp quyền'); return; }
        try {
          const auth = await authApi.google({ token: resp.credential });
          await startSession(auth, auth.email || emailFromIdToken(resp.credential));
          onSuccess();
        } catch (err) {
          onError(ERROR_TEXT[err.status] || (err.status >= 500 ? 'Máy chủ không xác minh được tài khoản Google (Client ID của BE và FE phải trùng nhau)' : err.message) || 'Đăng nhập Google thất bại');
        }
      }
    });
    const hit = box.querySelector('[data-google-hit]');
    google.accounts.id.renderButton(hit, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: box.dataset.text,
      logo_alignment: 'center',
      locale: 'vi',
      width: Math.min(400, Math.max(200, Math.round(box.clientWidth || 320)))
    });
    // kéo giãn nút thật (tối đa 400px) cho phủ kín nút kính, kể cả khi đổi cỡ màn hình
    const fit = () => {
      const w = hit.offsetWidth;
      const h = hit.offsetHeight;
      if (w && h) hit.style.transform = `scale(${box.clientWidth / w}, ${box.clientHeight / h})`;
    };
    new MutationObserver(fit).observe(hit, { childList: true, subtree: true });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
    setTimeout(fit, 300);
    box.dataset.ready = '1';
  } catch (err) {
    const text = box.querySelector('[data-google-text]');
    if (text) text.textContent = 'Không tải được Google Sign-In';
    onError(err.message);
  }
}
