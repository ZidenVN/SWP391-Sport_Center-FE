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

export const apiClient = {
  getBaseUrl: getApiBaseUrl,

  async get(endpoint, params = {}) {
    const fullUrl = buildUrl(endpoint, params);
    try {
      const res = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error((data && (data.message || data.error)) || `HTTP error! status: ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.get] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async post(endpoint, body = {}) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error((data && (data.message || data.error || data.detail)) || `HTTP error! status: ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.post] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async put(endpoint, body = {}) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error((data && (data.message || data.error || data.detail)) || `HTTP error! status: ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.put] ${endpoint} error:`, err.message);
      throw err;
    }
  },

  async delete(endpoint) {
    const fullUrl = buildUrl(endpoint);
    try {
      const res = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error((data && (data.message || data.error)) || `HTTP error! status: ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      console.warn(`[apiClient.delete] ${endpoint} error:`, err.message);
      throw err;
    }
  }
};
