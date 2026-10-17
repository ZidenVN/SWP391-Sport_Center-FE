import { apiClient } from './apiClient.js';

export const classApi = {
  // Lấy danh sách tất cả các lớp học
  getAll: () => apiClient.get('/classes'),

  // Lấy chi tiết lớp học theo ID
  getById: (id) => apiClient.get(`/classes/${id}`),

  // Tạo lớp học mới
  // Payload: { maxCapacity, scheduleTime, coachId, roomId, subjectId }
  create: (payload) => apiClient.post('/classes', payload),

  // Cập nhật thông tin lớp học
  update: (id, payload) => apiClient.put(`/classes/${id}`, payload),

  // Xóa / Hủy lớp học
  delete: (id) => apiClient.delete(`/classes/${id}`),

  // Phân công Huấn Luyện Viên cho lớp
  assignCoach: (classId, coachId) => apiClient.put(`/classes/${classId}/coach/${coachId}`)
};

export const roomApi = {
  getAll: () => apiClient.get('/rooms'),
  getById: (id) => apiClient.get(`/rooms/${id}`),
  create: (payload) => apiClient.post('/rooms', payload),
  update: (id, payload) => apiClient.put(`/rooms/${id}`, payload),
  delete: (id) => apiClient.delete(`/rooms/${id}`)
};

export const subjectApi = {
  getAll: () => apiClient.get('/subjects'),
  getById: (id) => apiClient.get(`/subjects/${id}`),
  create: (payload) => apiClient.post('/subjects', payload),
  update: (id, payload) => apiClient.put(`/subjects/${id}`, payload),
  delete: (id) => apiClient.delete(`/subjects/${id}`)
};

export function normalizeSportClass(cls) {
  if (!cls) return null;
  const id = cls.classId || cls.id;
  
  // Liên kết thông tin theo quan hệ ERD (Subject, Room, Coach)
  let resolved = null;
  if (typeof resolveClass === 'function') {
    resolved = resolveClass(cls);
  } else if (typeof window !== 'undefined' && typeof window.resolveClass === 'function') {
    resolved = window.resolveClass(cls);
  }

  // Format schedule time nếu là LocalDateTime từ BE (e.g. 2026-10-20T18:00:00)
  let timeDisplay = cls.scheduleTime || resolved?.scheduleTime || '18:00 - 19:30';
  if (typeof timeDisplay === 'string' && timeDisplay.includes('T')) {
    try {
      const dt = new Date(timeDisplay);
      if (!isNaN(dt.getTime())) {
        const timePart = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const datePart = dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        timeDisplay = `${timePart} (${datePart})`;
      }
    } catch (e) {
      // fallback
    }
  }

  const subjectName = cls.subjectName || (cls.subject && cls.subject.subjectName) || resolved?.category || cls.category || 'Thể Thao';
  const roomName = cls.roomName || (cls.room && cls.room.roomName) || resolved?.room || 'Phòng Studio A';
  const coachName = cls.coachName || (cls.coach && `${cls.coach.firstName || ''} ${cls.coach.lastName || ''}`.trim()) || resolved?.coach || 'Huấn Luyện Viên';
  const title = cls.className || resolved?.title || `${subjectName} - ${roomName}`;

  return {
    ...cls,
    id: id,
    classId: id,
    title: title,
    className: title,
    category: subjectName.toUpperCase(),
    subjectName: subjectName,
    subjectId: cls.subjectId || (cls.subject && cls.subject.subjectId),
    room: roomName,
    roomName: roomName,
    roomId: cls.roomId || (cls.room && cls.room.roomId),
    coach: coachName,
    coachName: coachName,
    coachId: cls.coachId || (cls.coach && (cls.coach.userId || cls.coach.coachId)),
    scheduleTime: timeDisplay,
    capacity: cls.maxCapacity || resolved?.capacity || 20,
    maxCapacity: cls.maxCapacity || resolved?.capacity || 20,
    enrolled: cls.enrolledCount || cls.enrolled || resolved?.enrolled || 0,
    status: (cls.status || 'ACTIVE').toUpperCase()
  };
}

/**
 * Đồng bộ toàn bộ dữ liệu Lớp học, Phòng tập và Bộ môn từ Backend
 */
export async function syncClassesWithBackend(force = false) {
  if (!force && typeof appState !== 'undefined' && appState.classesLoadedFromApi && appState.data?.classes?.length) {
    return appState.data.classes;
  }

  try {
    // 1. Tải song song Rooms, Subjects, Classes từ Backend
    const [roomsRes, subjectsRes, classesRes] = await Promise.allSettled([
      roomApi.getAll(),
      subjectApi.getAll(),
      classApi.getAll()
    ]);

    if (typeof appState !== 'undefined' && appState.data) {
      if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value) && roomsRes.value.length > 0) {
        appState.data.rooms = roomsRes.value;
      }
      if (subjectsRes.status === 'fulfilled' && Array.isArray(subjectsRes.value) && subjectsRes.value.length > 0) {
        appState.data.subjects = subjectsRes.value;
      }
      if (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) {
        const normalized = classesRes.value.map(c => normalizeSportClass(c));
        if (normalized.length > 0) {
          appState.data.classes = normalized;
        }
        appState.classesLoadedFromApi = true;
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[syncClassesWithBackend] Cannot fetch from BE:', err.message);
  }

  return (typeof appState !== 'undefined' && appState.data && appState.data.classes) ? appState.data.classes : [];
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.classApi = classApi;
  _g.roomApi = roomApi;
  _g.subjectApi = subjectApi;
  _g.normalizeSportClass = normalizeSportClass;
  _g.syncClassesWithBackend = syncClassesWithBackend;
}
