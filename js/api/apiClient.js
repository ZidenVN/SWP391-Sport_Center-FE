// Base API Client: Configured for Backend Integration (Spring Boot / REST API)
// Reads backend URL from Vite environment variables (VITE_API_BASE_URL)

export const getApiBaseUrl = () => {
  let envUrl = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      envUrl = import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // import.meta might not be supported in some environments
  }

  if (!envUrl && typeof window !== 'undefined' && window.API_BASE_URL) {
    envUrl = window.API_BASE_URL;
  }
  if (!envUrl && typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
    envUrl = process.env.VITE_API_BASE_URL;
  }
  if (!envUrl) {
    envUrl = 'http://localhost:8080/api/v1';
  }

  return envUrl.replace(/\/+$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to build full request URL
 */
function buildUrl(endpoint, params = {}) {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const urlStr = `${base}${path}`;
  
  const queryKeys = Object.keys(params);
  if (queryKeys.length > 0) {
    const urlObj = new URL(urlStr);
    queryKeys.forEach(k => urlObj.searchParams.append(k, params[k]));
    return urlObj.toString();
  }
  return urlStr;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30s timeout for heavy backend queries / DB cold starts

/**
 * Robust fetch wrapper with timeout support to prevent infinite loading
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Máy chủ không phản hồi kịp thời trong ${timeoutMs / 1000}s (Timeout). Vui lòng kiểm tra kết nối Backend!`);
      timeoutError.name = 'TimeoutError';
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function getAuthHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token');
    const isDemo = localStorage.getItem('is_demo_session') === 'true';
    if (token && (!isDemo || token.startsWith('eyJ'))) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

function handleApiError(res, data, endpoint) {
  const errMsg = (data && (data.message || data.error || data.detail)) || `HTTP error! status: ${res.status}`;
  const error = new Error(errMsg);
  error.status = res.status;
  error.data = data;
  error.endpoint = endpoint;

  // Check 401 Unauthorized on protected routes (excluding login and register)
  if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    console.warn(`[apiClient] 401 Unauthorized on ${endpoint}.`);
    if (typeof window !== 'undefined' && typeof window.handleSessionExpired === 'function') {
      window.handleSessionExpired();
    }
  }
  // 403 Forbidden, 500, etc. MUST NOT clear session or trigger logout
  return error;
}

export const apiClient = {
  getBaseUrl: getApiBaseUrl,

  async get(endpoint, params = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const fullUrl = buildUrl(endpoint, params);
    try {
      const res = await fetchWithTimeout(fullUrl, {
        headers: getAuthHeaders()
      }, timeoutMs);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw handleApiError(res, data, endpoint);
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.get] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async post(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetchWithTimeout(fullUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      }, timeoutMs);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw handleApiError(res, data, endpoint);
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.post] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async put(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetchWithTimeout(fullUrl, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      }, timeoutMs);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw handleApiError(res, data, endpoint);
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.put] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async patch(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetchWithTimeout(fullUrl, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      }, timeoutMs);
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : text;
      } catch (e) {
        data = text;
      }
      if (!res.ok) {
        throw handleApiError(res, typeof data === 'object' ? data : { message: data }, endpoint);
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.patch] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async delete(endpoint, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetchWithTimeout(fullUrl, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }, timeoutMs);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw handleApiError(res, data, endpoint);
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.delete] ${endpoint} error:`, err.message);
      throw err;
    }
  }
};
