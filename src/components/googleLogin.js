import { html, icon, raw } from '../core/dom.js';
import { authApi } from '../api/endpoints.js';
import { startSession } from '../pages/auth/login.js';

// Client ID OAuth của Google (không phải bí mật: luôn lộ ra trình duyệt) -> để sẵn mặc định cho cả nhóm pull về chạy được ngay.
// Muốn dùng client khác: đặt VITE_GOOGLE_CLIENT_ID trong FE/.env.local (đặt rỗng = tắt đăng nhập Google).
// Phải trùng google.client-id của BE, và origin http://localhost:5173 phải được khai báo trong Google Cloud Console.
const DEFAULT_GOOGLE_CLIENT_ID = '292845719554-mj6mhmh4snhmghljufj8iqg66mgktgvf.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID = (import.meta.env || {}).VITE_GOOGLE_CLIENT_ID ?? DEFAULT_GOOGLE_CLIENT_ID;

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise = null;

function loadGsi() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  gsiPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.onload = () => (window.google?.accounts?.oauth2 ? resolve(window.google) : reject(new Error('Không tải được Google Sign-In')));
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

// Khung "hoặc" + nút Google tự thiết kế (nền trong, viền mảnh như các ô nhập).
// Không dùng nút iframe của Google: nút đó không đổi được màu và không được phép làm trong suốt / che đi.
// Thay vào đó dùng luồng OAuth (token client) của Google: Google cho phép nút riêng, bấm sẽ mở cửa sổ chọn tài khoản Google.
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
    <button type="button" id="google-btn" data-testid="google-btn" disabled
      class="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 text-[0.95rem] font-semibold text-white/90 transition-colors hover:bg-white/10 hover:border-white/30 focus:outline-none focus-visible:border-[#D7F25B]/70 focus-visible:ring-2 focus-visible:ring-[#D7F25B]/25 disabled:opacity-60 disabled:cursor-wait">
      <span class="w-7 h-7 rounded-full bg-white flex items-center justify-center">${raw(GOOGLE_G)}</span>
      <span data-google-text>${buttonText}</span>
    </button>`;
}

// Gắn hành vi cho nút Google. onError(message) để trang tự hiện lỗi, onSuccess() sau khi đã có session.
export async function mountGoogleButton(root, { onSuccess, onError }) {
  const btn = root.querySelector('#google-btn');
  if (!btn || !GOOGLE_CLIENT_ID) return;
  const label = btn.querySelector('[data-google-text]');
  const idleText = label.textContent;
  const setBusy = busy => {
    btn.disabled = busy;
    label.textContent = busy ? 'Đang đăng nhập...' : idleText;
  };
  try {
    // tải sẵn script trước khi bấm: cửa sổ Google phải mở ngay trong cú bấm, nếu chờ tải mới mở thì trình duyệt chặn popup
    const google = await loadGsi();
    if (!btn.isConnected) return;
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: async resp => {
        if (resp.error) { setBusy(false); onError('Đăng nhập Google bị hủy hoặc không được cấp quyền'); return; }
        try {
          // BE tự hỏi Google để xác minh access token thuộc đúng Client ID của app rồi mới đăng nhập
          const auth = await authApi.google({ accessToken: resp.access_token });
          await startSession(auth, auth.email);
          onSuccess();
        } catch (err) {
          setBusy(false);
          onError(ERROR_TEXT[err.status] || err.message || 'Đăng nhập Google thất bại');
        }
      },
      // đóng cửa sổ Google giữa chừng / popup bị chặn
      error_callback: err => {
        setBusy(false);
        if (err?.type === 'popup_failed_to_open') onError('Trình duyệt chặn cửa sổ đăng nhập Google, hãy cho phép popup rồi thử lại');
      }
    });
    btn.disabled = false;
    btn.addEventListener('click', () => {
      setBusy(true);
      client.requestAccessToken();
    });
  } catch (err) {
    onError(err.message);
  }
}
