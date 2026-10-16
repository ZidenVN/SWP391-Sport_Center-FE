import { apiClient } from './apiClient.js';
import { packageApi } from './packageApi.js';
import { userApi } from './userApi.js';
import { coachApi, syncCoachesWithBackend, normalizeCoach } from './coachApi.js';

export { packageApi, userApi, coachApi, syncCoachesWithBackend, normalizeCoach };

export const memberApi = {
  getProfile: () => apiClient.get('/members/me'),
  updateProfile: (profileData) => apiClient.put('/members/me', profileData),
  getClasses: (params) => apiClient.get('/classes', params),
  getPackages: () => packageApi.getAll(),
  bookClass: (classId) => apiClient.post('/member/bookings', { classId }),
  cancelBooking: (classId) => apiClient.delete(`/member/bookings/${classId}`),
  checkoutPackage: (payload) => apiClient.post('/member/checkout', payload),
  getFitnessStats: (memberId) => apiClient.get(`/member/fitness/${memberId}`),
  createSupportTicket: (ticket) => apiClient.post('/member/tickets', ticket)
};

export const receptionApi = {
  scanGate: (barcode) => apiClient.post('/reception/gate/scan', { barcode }),
  posCheckout: (payload) => apiClient.post('/reception/pos/checkout', payload),
  lookupMember: (query) => apiClient.get('/reception/members/lookup', { query }),
  renewMember: (payload) => apiClient.post('/reception/members/renew', payload),
  resolveTicket: (ticketId, reply) => apiClient.put(`/reception/tickets/${ticketId}/resolve`, { reply }),
  rejectTicket: (ticketId, reason) => apiClient.put(`/reception/tickets/${ticketId}/reject`, { reason })
};

export const managerApi = {
  getDashboardStats: () => apiClient.get('/manager/dashboard'),
  getPackages: () => packageApi.getAll(),
  createPackage: (pkg) => packageApi.create(pkg),
  updatePackage: (id, pkg) => packageApi.update(id, pkg),
  deletePackage: (id) => packageApi.delete(id),
  createClass: (cls) => apiClient.post('/classes', cls),
  getAuditLogs: (params) => apiClient.get('/manager/audit-logs', params)
};
