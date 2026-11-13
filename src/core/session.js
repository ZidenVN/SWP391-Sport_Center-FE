// Phiên đăng nhập: lưu token + thông tin user trong localStorage.
const KEY = "sc_session";

let current = load();
const listeners = new Set();

function load() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || "null");

    if (!s || !s.token || isExpired(s.token)) return null;

    return s;
  } catch {
    return null;
  }
}

function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const payload = decodeJwt(token);
  return Boolean(payload?.exp && payload.exp * 1000 <= Date.now());
}

function persist() {
  try {
    if (current) {
      sessionStorage.setItem(KEY, JSON.stringify(current));
    } else {
      sessionStorage.removeItem(KEY);
    }
  } catch {
    // Nếu trình duyệt không cho lưu storage, vẫn giữ phiên trong bộ nhớ.
  }

  listeners.forEach((fn) => fn(current));
}

export const session = {
  get: () => current,
  token: () => current?.token || null,
  role: () => current?.role || null,
  isLoggedIn: () => Boolean(current),
  can: (permission) => Boolean(current?.permissions?.includes(permission)),

  // auth: AuthResponse từ /auth/login
  start(auth, email) {
    current = {
      token: auth.token,
      role: auth.role,
      permissions: auth.permissions || [],
      firstName: auth.firstName,
      lastName: auth.lastName,
      fullName:
        auth.fullName ||
        [auth.firstName, auth.lastName].filter(Boolean).join(" "),
      email,
      packageName: auth.packageName || null,
      memberId: null,
    };
    persist();
    return current;
  },

  update(patch) {
    if (!current) return;
    current = { ...current, ...patch };
    persist();
  },

  end() {
    current = null;
    persist();
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
