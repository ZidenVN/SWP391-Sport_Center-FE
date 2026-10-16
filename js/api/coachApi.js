import { apiClient } from './apiClient.js';

/**
 * Coach API Client: Kết nối trực tiếp với CoachController của Backend Spring Boot
 * Base URL: /api/v1/coaches
 */
export const coachApi = {
  // 1. Lấy toàn bộ danh sách Huấn luyện viên từ Backend
  getAll: () => apiClient.get('/coaches'),

  // 2. Lấy thông tin chi tiết 1 Huấn luyện viên theo ID
  getById: (id) => apiClient.get(`/coaches/${id}`),

  // 3. Tạo mới Huấn luyện viên (Admin / Center Manager)
  // Payload: { firstName, lastName, gender, phone, email, password, specialty }
  create: (payload) => apiClient.post('/coaches', payload),

  // 4. Cập nhật thông tin Huấn luyện viên
  // Payload: { firstName, lastName, gender, phone, email, password, specialty }
  update: (id, payload) => apiClient.put(`/coaches/${id}`, payload),

  // 5. Xóa / Khóa tài khoản Huấn luyện viên (Soft delete -> status INACTIVE)
  delete: (id) => apiClient.delete(`/coaches/${id}`),

  // 6. Lấy lịch dạy của HLV (cho Coach portal)
  getMySchedules: () => apiClient.get('/coaches/me/schedules'),

  // 7. Lấy danh sách điểm danh lớp
  getClassAttendances: (classId) => apiClient.get(`/coaches/me/classes/${classId}/attendances`),

  // 8. Đánh dấu điểm danh học viên trong lớp
  markAttendance: (classId, payload) => apiClient.post(`/coaches/me/classes/${classId}/attendances`, payload),

  // Portal methods cho HLV
  getTodaySchedule: (coachId) => apiClient.get(`/coach/schedule/today/${coachId}`),
  getStudents: (coachId) => apiClient.get(`/coach/students/${coachId}`),
  assignWorkoutPlan: (payload) => apiClient.post('/coach/workout-plans', payload)
};

/**
 * Chuẩn hóa Coach trả về từ BE CoachResponseDTO sang Entity chuẩn của FE
 * BE Response: { coachId, firstName, lastName, email, phone, speciality }
 */
export function normalizeCoach(c) {
  if (!c) return null;
  const id = c.coachId || c.id || c.userId;
  const firstName = (c.firstName || '').trim();
  const lastName = (c.lastName || '').trim();
  const fullName = (lastName && firstName) ? `${lastName} ${firstName}` : (c.name || firstName || 'Huấn Luyện Viên');
  const specialty = c.speciality || c.specialty || 'Huấn luyện thể hình & sức khỏe';
  const gender = c.gender || (c.gender === 'FEMALE' ? 'FEMALE' : 'MALE');

  // Avatar mặc định thẩm mỹ dựa theo giới tính
  const femaleAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const maleAvatar = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80';
  const avatar = c.avatar || (gender === 'FEMALE' ? femaleAvatar : maleAvatar);

  return {
    ...c,
    id: String(id),
    coachId: id,
    userId: id,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    email: c.email || '',
    phone: c.phone || '',
    gender: gender,
    specialty: specialty,
    speciality: specialty,
    experience: c.experience || 'Nhiều năm kinh nghiệm giảng dạy',
    avatar: avatar,
    status: (c.status || 'ACTIVE').toUpperCase(),
    activeClassesCount: typeof c.activeClassesCount === 'number' ? c.activeClassesCount : 0
  };
}

/**
 * Đồng bộ danh sách Huấn luyện viên từ Backend vào appState
 */
export async function syncCoachesWithBackend(force = false) {
  if (!force && typeof appState !== 'undefined' && appState.coachesLoadedFromApi && appState.backendCoaches?.length) {
    return appState.backendCoaches;
  }

  try {
    const apiCoaches = await coachApi.getAll();
    if (Array.isArray(apiCoaches)) {
      const normalized = apiCoaches.map(c => normalizeCoach(c));
      if (typeof appState !== 'undefined') {
        appState.backendCoaches = normalized;
        appState.coachesLoadedFromApi = true;
        // Cập nhật vào appState.data.coaches để các màn hình khác (Member, Classes) cũng dùng dữ liệu mới nhất
        if (appState.data) {
          appState.data.coaches = normalized;
        }
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[syncCoachesWithBackend] Không thể tải danh sách HLV từ Backend:', err.message);
  }

  // Fallback về mock coaches nếu BE chưa có dữ liệu hoặc offline
  return (typeof appState !== 'undefined' && appState.backendCoaches) ? appState.backendCoaches : ((appState?.data?.coaches) || []);
}

if (typeof window !== 'undefined') {
  window.coachApi = coachApi;
  window.normalizeCoach = normalizeCoach;
  window.syncCoachesWithBackend = syncCoachesWithBackend;
}
