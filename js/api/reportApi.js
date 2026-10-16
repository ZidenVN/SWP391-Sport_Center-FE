import { apiClient } from './apiClient.js';

export const reportApi = {
  // Lấy tổng quan Dashboard (Active Members, New Members, Classes Today, Revenue, Growth Rate)
  getOverview: () => apiClient.get('/manager/reports/overview'),

  // Lấy báo cáo doanh thu theo thời gian và danh mục
  getRevenue: (params = {}) => apiClient.get('/manager/reports/revenue', params),

  // Lấy báo cáo hội viên
  getMembersReport: (params = {}) => apiClient.get('/manager/reports/members', params),

  // Lấy báo cáo đăng ký lớp học
  getClassesReport: (params = {}) => apiClient.get('/manager/reports/classes', params)
};

export async function syncDashboardWithBackend() {
  try {
    const [overviewRes, revenueRes] = await Promise.allSettled([
      reportApi.getOverview(),
      reportApi.getRevenue()
    ]);

    if (typeof appState !== 'undefined') {
      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        appState.dashboardOverview = overviewRes.value;
        appState.dashboardLoadedFromApi = true;
      }
      if (revenueRes.status === 'fulfilled' && revenueRes.value) {
        appState.revenueReport = revenueRes.value;
      }
      return {
        overview: appState.dashboardOverview,
        revenue: appState.revenueReport
      };
    }
  } catch (err) {
    console.warn('[syncDashboardWithBackend] Cannot fetch reports from BE:', err.message);
  }
  return null;
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.reportApi = reportApi;
  _g.syncDashboardWithBackend = syncDashboardWithBackend;
}
