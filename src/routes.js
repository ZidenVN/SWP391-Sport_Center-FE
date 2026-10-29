// Khai báo route. nav: hiện trên sidebar; roles: role nào được vào.
import { FEATURES } from './core/features.js';

export const HOME_BY_ROLE = {
  MEMBER: '/member/home',
  RECEPTIONIST: '/reception/members',
  COACH: '/coach/schedule',
  CENTER_MANAGER: '/manager/dashboard'
};

// nơi menu "Thông tin cá nhân" ở header trỏ tới, theo từng vai trò
export const PROFILE_BY_ROLE = {
  MEMBER: '/member/profile',
  RECEPTIONIST: '/profile',
  COACH: '/profile',
  CENTER_MANAGER: '/profile'
};

const M = ['MEMBER'];
const R = ['RECEPTIONIST'];
const C = ['COACH'];
const CM = ['CENTER_MANAGER'];

export const ROUTES = [
  // trang giới thiệu khi chưa đăng nhập; đã đăng nhập thì router tự chuyển về trang chủ theo vai trò
  { path: '/', public: true, load: () => import('./pages/landing.js') },
  { path: '/login', public: true, load: () => import('./pages/auth/login.js') },
  { path: '/register', public: true, load: () => import('./pages/auth/register.js') },
  // hồ sơ cá nhân dùng chung cho Lễ tân/HLV/Quản lý, vào từ menu ở header (không có trong sidebar)
  { path: '/profile', roles: [...R, ...C, ...CM], load: () => import('./pages/shared/myProfile.js') },
  // đổi mật khẩu cho mọi vai trò, vào từ menu tài khoản ở header
  { path: '/account/password', roles: [...M, ...R, ...C, ...CM], load: () => import('./pages/shared/changePassword.js') },

  // ----- Member -----
  { path: '/member/home', roles: M, nav: { label: 'Tổng quan', icon: 'layout-dashboard' }, load: () => import('./pages/member/home.js') },
  { path: '/member/classes', roles: M, nav: { label: 'Lớp học', icon: 'calendar-plus' }, load: () => import('./pages/member/classes.js') },
  { path: '/member/schedule', roles: M, nav: { label: 'Lịch tập của tôi', icon: 'calendar-check' }, load: () => import('./pages/member/schedule.js') },
  { path: '/member/packages', roles: M, nav: { label: 'Gói tập', icon: 'package' }, load: () => import('./pages/member/packages.js') },
  { path: '/member/training', roles: M, nav: { label: 'Tập luyện', icon: 'dumbbell' }, load: () => import('./pages/member/training.js') },
  // Trợ lý AI chỉ dành cho hội viên (BE chặn 403 với vai khác) -> menu chỉ có ở vai hội viên
  ...(FEATURES.ai ? [{ path: '/member/assistant', roles: M, nav: { label: 'Trợ lý AI', icon: 'sparkles' }, load: () => import('./pages/member/assistant.js') }] : []),
  { path: '/member/payments', roles: M, nav: { label: 'Thanh toán', icon: 'receipt' }, load: () => import('./pages/member/payments.js') },
  { path: '/member/notifications', roles: M, nav: { label: 'Thông báo', icon: 'bell' }, load: () => import('./pages/member/notifications.js') },
  { path: '/member/profile', roles: M, nav: { label: 'Hồ sơ', icon: 'user' }, load: () => import('./pages/member/profile.js') },
  { path: '/member/onboarding', roles: M, navParent: '/member/packages', load: () => import('./pages/member/onboarding.js') },
  { path: '/member/checkout/:id', roles: M, navParent: '/member/packages', load: () => import('./pages/member/checkout.js') },
  // open: vào được cả khi chưa đăng nhập (điện thoại quét QR thanh toán xong được VNPay chuyển về đây)
  { path: '/member/payment-result', roles: M, open: true, navParent: '/member/packages', load: () => import('./pages/member/paymentResult.js') },

  // ----- Receptionist -----
  { path: '/reception/members', roles: R, nav: { label: 'Hội viên', icon: 'users' }, load: () => import('./pages/reception/members.js') },
  { path: '/reception/checkin', roles: R, nav: { label: 'Check-in', icon: 'scan-line' }, load: () => import('./pages/reception/checkin.js') },
  { path: '/reception/members/:id', roles: R, load: () => import('./pages/reception/memberDetail.js') },
  { path: '/reception/payments', roles: R, nav: { label: 'Giao dịch', icon: 'receipt' }, load: () => import('./pages/reception/payments.js') },
  { path: '/reception/tickets', roles: R, nav: { label: 'Yêu cầu hỗ trợ', icon: 'life-buoy' }, load: () => import('./pages/reception/tickets.js') },
  { path: '/reception/classes', roles: R, nav: { label: 'Lịch lớp học', icon: 'calendar-days' }, load: () => import('./pages/shared/classBoard.js') },
  { path: '/reception/packages', roles: R, nav: { label: 'Bảng giá gói tập', icon: 'package' }, load: () => import('./pages/shared/packageBoard.js') },

  // ----- Coach -----
  { path: '/coach/schedule', roles: C, nav: { label: 'Lịch dạy', icon: 'calendar-days' }, load: () => import('./pages/coach/schedule.js') },
  { path: '/coach/classes/:id', roles: C, navParent: '/coach/schedule', load: () => import('./pages/coach/classDetail.js') },
  { path: '/coach/students', roles: C, nav: { label: 'Học viên', icon: 'users' }, load: () => import('./pages/coach/students.js') },
  { path: '/coach/members/:id', roles: C, navParent: '/coach/students', load: () => import('./pages/coach/memberDetail.js') },
  { path: '/coach/plans', roles: C, nav: { label: 'Giáo án', icon: 'clipboard-list' }, load: () => import('./pages/coach/plans.js') },

  // ----- Center Manager -----
  { path: '/manager/dashboard', roles: CM, nav: { label: 'Tổng quan', icon: 'layout-dashboard' }, load: () => import('./pages/manager/dashboard.js') },
  { path: '/manager/reports', roles: CM, nav: { label: 'Báo cáo', icon: 'bar-chart-3' }, load: () => import('./pages/manager/reports.js') },
  { path: '/manager/payments', roles: CM, nav: { label: 'Giao dịch', icon: 'receipt' }, load: () => import('./pages/manager/payments.js') },
  { path: '/manager/classes', roles: CM, nav: { label: 'Lớp học', icon: 'calendar-days', group: 'Vận hành' }, load: () => import('./pages/manager/classes.js') },
  { path: '/manager/packages', roles: CM, nav: { label: 'Gói tập', icon: 'package', group: 'Vận hành' }, load: () => import('./pages/manager/packages.js') },
  { path: '/manager/rooms', roles: CM, nav: { label: 'Phòng tập', icon: 'door-open', group: 'Vận hành' }, load: () => import('./pages/manager/rooms.js') },
  { path: '/manager/subjects', roles: CM, nav: { label: 'Bộ môn', icon: 'book-open', group: 'Vận hành' }, load: () => import('./pages/manager/subjects.js') },
  { path: '/manager/quiz', roles: CM, nav: { label: 'Câu hỏi khảo sát', icon: 'clipboard-list', group: 'Vận hành' }, load: () => import('./pages/manager/quiz.js') },
  { path: '/manager/coaches', roles: CM, nav: { label: 'Huấn luyện viên', icon: 'medal', group: 'Nhân sự' }, load: () => import('./pages/manager/coaches.js') },
  { path: '/manager/staff', roles: CM, nav: { label: 'Lễ tân', icon: 'concierge-bell', group: 'Nhân sự' }, load: () => import('./pages/manager/staff.js') },
  { path: '/manager/users', roles: CM, nav: { label: 'Tài khoản', icon: 'users', group: 'Nhân sự' }, load: () => import('./pages/manager/users.js') },
  { path: '/manager/roles', roles: CM, nav: { label: 'Phân quyền', icon: 'shield-check', group: 'Hệ thống' }, load: () => import('./pages/manager/roles.js') },
  { path: '/manager/audit', roles: CM, nav: { label: 'Nhật ký thao tác', icon: 'history', group: 'Hệ thống' }, load: () => import('./pages/manager/audit.js') }
];

export function matchRoute(path) {
  const parts = path.split('/').filter(Boolean);
  for (const route of ROUTES) {
    const rp = route.path.split('/').filter(Boolean);
    if (rp.length !== parts.length) continue;
    const params = {};
    const ok = rp.every((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
        return true;
      }
      return seg === parts[i];
    });
    if (ok) return { route, params };
  }
  return null;
}
