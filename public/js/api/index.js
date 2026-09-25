import { apiClient } from './apiClient.js';

export const memberApi = {
  getClasses: (params) => apiClient.get('/member/classes', params),
  getPackages: () => apiClient.get('/member/packages'),
  bookClass: (classId) => apiClient.post('/member/bookings', { classId }),
  cancelBooking: (classId) => apiClient.delete(`/member/bookings/${classId}`),
  checkoutPackage: (payload) => apiClient.post('/member/checkout', payload),
  getFitnessStats: (memberId) => apiClient.get(`/member/fitness/${memberId}`),
  updateProfile: (profileData) => apiClient.put('/member/profile', profileData),
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

export const coachApi = {
  getTodaySchedule: (coachId) => apiClient.get(`/coach/schedule/today/${coachId}`),
  getStudents: (coachId) => apiClient.get(`/coach/students/${coachId}`),
  markAttendance: (classId, studentId, attended) => apiClient.post('/coach/attendance', { classId, studentId, attended }),
  assignWorkoutPlan: (payload) => apiClient.post('/coach/workout-plans', payload)
};

export const managerApi = {
  getDashboardStats: () => apiClient.get('/manager/dashboard'),
  createPackage: (pkg) => apiClient.post('/manager/packages', pkg),
  createClass: (cls) => apiClient.post('/manager/classes', cls),
  getAuditLogs: (params) => apiClient.get('/manager/audit-logs', params)
};
