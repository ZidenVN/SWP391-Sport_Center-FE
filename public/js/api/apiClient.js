// Base API Client: Configured for future Backend Integration (Spring Boot / Express / .NET)
// Base URL can be configured via environment or window.API_BASE_URL

const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) || 'http://localhost:8080/api';

export const apiClient = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    // In demo / mock mode: if backend is not available, we return null or fallback
    try {
      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient.get] ${endpoint} mock fallback:`, err.message);
      return null;
    }
  },

  async post(endpoint, body = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient.post] ${endpoint} mock fallback:`, err.message);
      return null;
    }
  },

  async put(endpoint, body = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient.put] ${endpoint} mock fallback:`, err.message);
      return null;
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient.delete] ${endpoint} mock fallback:`, err.message);
      return null;
    }
  }
};
