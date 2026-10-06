import { apiClient } from './apiClient.js';

export const packageApi = {
  getAll: () => apiClient.get('/packages'),
  getById: (id) => apiClient.get(`/packages/${id}`),
  create: (payload) => apiClient.post('/packages', payload),
  update: (id, payload) => apiClient.put(`/packages/${id}`, payload),
  delete: (id) => apiClient.delete(`/packages/${id}`)
};

export function normalizePackage(pkg) {
  if (!pkg) return null;
  const id = pkg.packageId || pkg.id;
  const name = pkg.packageName || pkg.name || 'Gói Tập';
  return {
    ...pkg,
    id: id,
    packageId: id,
    name: name,
    packageName: name,
    price: Number(pkg.price || 0),
    durationDays: Number(pkg.durationDays || 30),
    description: pkg.description || '',
    status: (pkg.status || 'ACTIVE').toUpperCase(),
    popular: pkg.popular || false,
    features: pkg.features || [
      'Tập luyện tự do toàn bộ hệ thống phòng tập',
      'Tủ đồ cá nhân thông minh & phòng tắm nóng lạnh',
      'Hỗ trợ đo chỉ số thể trạng InBody định kỳ'
    ]
  };
}

export async function syncPackagesWithBackend(force = false) {
  try {
    const apiPackages = await packageApi.getAll();
    if (Array.isArray(apiPackages)) {
      const normalized = apiPackages.map(p => normalizePackage(p));
      if (typeof appState !== 'undefined' && appState.data) {
        if (normalized.length > 0) {
          appState.data.packages = normalized;
        }
        appState.packagesLoadedFromApi = true;
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[syncPackagesWithBackend] Cannot fetch from BE:', err.message);
  }
  return (typeof appState !== 'undefined' && appState.data && appState.data.packages) ? appState.data.packages : [];
}

if (typeof window !== 'undefined') {
  window.packageApi = packageApi;
  window.normalizePackage = normalizePackage;
  window.syncPackagesWithBackend = syncPackagesWithBackend;
}
