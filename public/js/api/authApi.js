import { apiClient } from './apiClient.js';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  sendOtp: (email) => apiClient.post('/auth/send-otp', { email }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  logout: () => apiClient.post('/auth/logout')
};
