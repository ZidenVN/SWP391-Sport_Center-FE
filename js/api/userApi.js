import { apiClient } from './apiClient.js';

export const userApi = {
  // Lấy toàn bộ danh sách User từ Backend
  getAll: () => apiClient.get('/users'),

  // Lấy chi tiết 1 user
  getById: (id) => apiClient.get(`/users/${id}`),

  // Cập nhật thông tin cơ bản của user (firstName, lastName, email, gender, phone)
  update: (id, payload) => apiClient.put(`/users/${id}`, payload),

  // Khóa / Mở khóa tài khoản (toggle status ACTIVE <-> INACTIVE)
  toggleStatus: (id) => apiClient.patch(`/users/${id}/status`),

  // Đổi vai trò / phân quyền user (assign roleId)
  assignRole: (userId, roleId) => apiClient.patch(`/users/${userId}/role/${roleId}`),

  // Lấy danh sách toàn bộ các Role trong hệ thống
  getRoles: () => apiClient.get('/roles')
};

export function normalizeUser(u) {
  if (!u) return null;
  const id = u.userId || u.id;
  const firstName = u.firstName || '';
  const lastName = u.lastName || '';
  const fullName = `${lastName} ${firstName}`.trim() || u.name || 'Người Dùng';
  const roleName = (u.role && (u.role.roleName || u.role.name)) || (typeof u.role === 'string' ? u.role : 'MEMBER');

  return {
    ...u,
    id: id,
    userId: id,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    email: u.email || '',
    phone: u.phone || '',
    gender: u.gender || 'Nam',
    status: (u.status || 'ACTIVE').toUpperCase(),
    roleName: roleName.toUpperCase(),
    roleId: u.role?.roleId || (roleName === 'ADMIN' || roleName === 'CENTER_MANAGER' ? 1 : 4),
    createdAt: u.createdAt || u.createAt || ''
  };
}

export async function syncUsersWithBackend(force = false) {
  if (!force && typeof appState !== 'undefined' && appState.usersLoadedFromApi && appState.backendUsers?.length) {
    return appState.backendUsers;
  }
  try {
    // 1. Tải danh sách Roles từ Backend để lấy đúng roleId (1, 2, 3, 4...)
    try {
      const apiRoles = await userApi.getRoles();
      if (Array.isArray(apiRoles) && typeof appState !== 'undefined') {
        appState.availableRoles = apiRoles;
      }
    } catch (e) {
      // Fallback nếu role endpoint chưa có quyền
    }

    // 2. Tải danh sách Users
    const apiUsers = await userApi.getAll();
    if (Array.isArray(apiUsers)) {
      const normalized = apiUsers.map(u => normalizeUser(u));
      if (typeof appState !== 'undefined') {
        appState.backendUsers = normalized;
        appState.usersLoadedFromApi = true;
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[syncUsersWithBackend] Cannot fetch users from BE:', err.message);
  }
  return (typeof appState !== 'undefined' && appState.backendUsers) ? appState.backendUsers : [];
}

if (typeof window !== 'undefined') {
  window.userApi = userApi;
  window.normalizeUser = normalizeUser;
  window.syncUsersWithBackend = syncUsersWithBackend;
}
