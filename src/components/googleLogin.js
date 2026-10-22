import { html, icon } from '../core/dom.js';
import { authApi } from '../api/endpoints.js';
import { startSession } from '../pages/auth/login.js';

// Client ID OAuth của Google, đặt trong FE/.env.local: VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
// (phải trùng GOOGLE_CLIENT_ID của BE, và origin http://localhost:5173 phải được khai báo trong Google Cloud Console)
export const GOOGLE_CLIENT_ID = (import.meta.env || {}).VITE_GOOGLE_CLIENT_ID || '';

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

// email nằm trong phần payload của ID token (JWT) -> lưu vào session như đăng nhập thường
function emailFromCredential(credential) {
  try {
    const part = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(part).split('').map(c => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
    return JSON.parse(json).email || '';
  } catch {
    return '';
  }
}

const ERROR_TEXT = {
  401: 'Tài khoản Google không hợp lệ hoặc chưa xác minh email',
  403: 'Tài khoản đã bị khóa, vui lòng liên hệ trung tâm'
};

// Khung chứa nút: "hoặc" + nút Google. Chưa cấu hình client ID thì chỉ hiện ghi chú khi chạy dev.
export function googleSection(label = 'hoặc') {
  if (!GOOGLE_CLIENT_ID) {
    return import.meta.env?.DEV ? html`
      <div class="mt-6 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500 flex gap-2" data-testid="google-missing">
        ${icon('info', 'w-4 h-4 shrink-0')}
        <span>Đăng nhập Google chưa bật: thêm <code class="font-mono">VITE_GOOGLE_CLIENT_ID</code> vào <code class="font-mono">FE/.env.local</code> rồi chạy lại Vite.</span>
      </div>` : '';
  }
  return html`
    <div class="flex items-center gap-3 my-6 text-xs font-semibold text-slate-400">
      <span class="h-px flex-1 bg-slate-200"></span>${label}<span class="h-px flex-1 bg-slate-200"></span>
    </div>
    <div id="google-btn" class="flex justify-center min-h-[44px]" data-testid="google-btn"></div>`;
}

// Gắn nút Google vào #google-btn. onError(message) để trang tự hiện lỗi, onSuccess() sau khi đã có session.
export async function mountGoogleButton(root, { onSuccess, onError, text = 'signin_with' }) {
  const box = root.querySelector('#google-btn');
  if (!box || !GOOGLE_CLIENT_ID) return;
  try {
    const google = await loadGsi();
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: 'popup',
      callback: async ({ credential }) => {
        try {
          const auth = await authApi.google(credential);
          await startSession(auth, emailFromCredential(credential));
          onSuccess();
        } catch (err) {
          onError(ERROR_TEXT[err.status] || err.message || 'Đăng nhập Google thất bại');
        }
      }
    });
    if (!box.isConnected) return;
    google.accounts.id.renderButton(box, {
      type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text,
      logo_alignment: 'center', locale: 'vi', width: Math.min(box.clientWidth || 360, 400)
    });
  } catch (err) {
    onError(err.message);
  }
}
