import { session } from '../core/session.js';
import { userApi } from '../api/endpoints.js';

// Quyền trong phiên lấy lúc đăng nhập; Quản lý đổi phân quyền thì BE áp dụng ngay
// -> FE hỏi lại quyền hiện tại (giãn cách 15s khi chuyển trang) để menu / nút khớp với BE mà không cần đăng nhập lại.
const MIN_GAP = 15000;
let lastSync = 0;
let inflight = null;

const same = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

export function syncPermissions({ force = false } = {}) {
  if (!session.isLoggedIn()) return Promise.resolve();
  if (inflight) return inflight;
  if (!force && Date.now() - lastSync < MIN_GAP) return Promise.resolve();
  inflight = userApi.myPermissions()
    .then(perms => {
      lastSync = Date.now();
      if (Array.isArray(perms) && !same(perms, session.get()?.permissions || [])) session.update({ permissions: perms });
    })
    .catch(() => {})
    .finally(() => { inflight = null; });
  return inflight;
}
