// HTTP client dùng chung cho toàn bộ FE.
// - Tự gắn Bearer token
// - Đọc response dạng text rồi mới parse JSON (BE có API trả text thuần)
// - Chuẩn hoá mọi kiểu lỗi của BE thành ApiError { status, code, message, fields }

const DEFAULT_TIMEOUT_MS = 30000;

export function getBaseUrl() {
  const env = import.meta.env || {};
  return (env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
}

export const useMock = () => (import.meta.env || {}).VITE_USE_MOCK === 'true';

export class ApiError extends Error {
  constructor({ status, code, message, fields, data }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.data = data;
  }
}

let tokenProvider = () => null;
let unauthorizedHandler = () => {};

export function configureClient({ getToken, onUnauthorized }) {
  if (getToken) tokenProvider = getToken;
  if (onUnauthorized) unauthorizedHandler = onUnauthorized;
}

function buildUrl(path, query) {
  let url = getBaseUrl() + (path.startsWith('/') ? path : `/${path}`);
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }
  return url;
}

function parseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const GENERIC_MESSAGES = {
  400: 'Dữ liệu gửi lên không hợp lệ',
  401: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!',
  403: 'Bạn không có quyền thực hiện thao tác này!',
  404: 'Không tìm thấy dữ liệu',
  409: 'Dữ liệu bị xung đột',
  500: 'Máy chủ gặp lỗi, vui lòng thử lại sau'
};

export function toApiError(status, data) {
  // (d) text thuần
  if (typeof data === 'string' && data.trim()) {
    return new ApiError({ status, code: `HTTP_${status}`, message: data, data });
  }
  if (data && typeof data === 'object') {
    // (a)(b) lỗi nghiệp vụ / auth: { status, error: "ERR_...", message }
    if (typeof data.error === 'string' && data.error.startsWith('ERR_')) {
      return new ApiError({ status, code: data.error, message: data.message || GENERIC_MESSAGES[status], data });
    }
    // (c) validation: { field: message }
    // (field có thể trùng tên "status"/"error" nên phân biệt theo kiểu dữ liệu, không theo tên)
    if (typeof data.status !== 'number' && data.timestamp === undefined) {
      const fields = data;
      const message = Object.values(fields).join('\n') || GENERIC_MESSAGES[status];
      return new ApiError({ status, code: 'VALIDATION', message, fields, data });
    }
  }
  // (e) lỗi mặc định của Spring (500, JSON sai...)
  return new ApiError({ status, code: `HTTP_${status}`, message: GENERIC_MESSAGES[status] || `Lỗi ${status}`, data });
}

async function doFetch(url, options, timeoutMs) {
  if (useMock()) {
    const { mockFetch } = await import('./mock/mockServer.js');
    const mocked = await mockFetch(url, options);
    if (mocked) return mocked;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError({ status: 408, code: 'TIMEOUT', message: `Máy chủ không phản hồi sau ${timeoutMs / 1000}s` });
    }
    throw new ApiError({ status: 0, code: 'NETWORK', message: 'Không kết nối được tới máy chủ. Kiểm tra Backend đã chạy chưa.' });
  } finally {
    clearTimeout(timer);
  }
}

export async function request(method, path, { query, body, timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, handle401 = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? tokenProvider() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await doFetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  }, timeoutMs);

  const data = parseBody(await res.text());
  if (!res.ok) {
    const error = toApiError(res.status, data);
    if (res.status === 401 && auth && token && handle401) unauthorizedHandler(error);
    throw error;
  }
  return data;
}

// Tải file (CSV...) từ API cần đăng nhập: fetch kèm token rồi lưu blob về máy
export async function download(path, query, filename) {
  const token = tokenProvider();
  const res = await doFetch(buildUrl(path, query), { headers: token ? { Authorization: `Bearer ${token}` } : {} }, DEFAULT_TIMEOUT_MS);
  if (!res.ok) {
    const error = toApiError(res.status, parseBody(await res.text()));
    if (res.status === 401 && token) unauthorizedHandler(error);
    throw error;
  }
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const http = {
  get: (path, query, opts) => request('GET', path, { ...opts, query }),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts)
};
