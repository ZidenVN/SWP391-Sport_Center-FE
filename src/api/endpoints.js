// Toàn bộ API của BE (xem Docs/API_FE.md). Mỗi hàm trả về Promise của body đã parse.
import { http, download } from './client.js';

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }, { auth: false }),
  register: payload => http.post('/auth/register', payload, { auth: false }),
  // payload: { token } (ID token) hoặc { accessToken } (nút Google tự thiết kế)
  google: payload => http.post('/auth/google', payload, { auth: false }),
  // đổi mật khẩu: BE trả token mới, token cũ bị vô hiệu
  changePassword: (currentPassword, newPassword) => http.put('/auth/change-password', { currentPassword, newPassword }),
  // vô hiệu token phía server (token lộ ra ngoài cũng không dùng được nữa)
  logout: () => http.post('/auth/logout', undefined, { handle401: false })
};

export const userApi = {
  // chỉ Quản lý; BE trả trang { content, totalElements, totalPages, number, size }
  // query: { keyword, role (CENTER_MANAGER|COACH|RECEPTIONIST|MEMBER), status (ACTIVE|INACTIVE), page (từ 0), size (tối đa 100) }
  page: query => http.get('/users', query),
  // hồ sơ của chính nhân viên (Lễ tân / HLV / Quản lý); email không đổi được
  me: () => http.get('/users/me'),
  updateMe: payload => http.put('/users/me', payload),
  list: query => http.get('/users', { size: 100, ...query }).then(page => page.content || []),
  get: id => http.get(`/users/${id}`),
  update: (id, payload) => http.put(`/users/${id}`, payload),
  toggleStatus: id => http.patch(`/users/${id}/status`),
  assignRole: (userId, roleId) => http.patch(`/users/${userId}/role/${roleId}`)
};

export const roleApi = {
  list: () => http.get('/roles'),
  permissionsOf: id => http.get(`/roles/${id}/permissions`),
  setPermissions: (id, permissionIds) => http.put(`/roles/${id}/permissions`, permissionIds),
  allPermissions: () => http.get('/permissions')
};

export const auditApi = {
  list: (page = 0, size = 20) => http.get('/admin/audit-logs', { page, size })
};

export const coachAdminApi = {
  list: () => http.get('/coaches'),
  get: id => http.get(`/coaches/${id}`),
  create: payload => http.post('/coaches', payload),
  update: (id, payload) => http.put(`/coaches/${id}`, payload),
  deactivate: id => http.delete(`/coaches/${id}`)
};

export const packageApi = {
  list: () => http.get('/packages'),
  get: id => http.get(`/packages/${id}`),
  create: payload => http.post('/packages', payload),
  update: (id, payload) => http.put(`/packages/${id}`, payload),
  remove: id => http.delete(`/packages/${id}`)
};

export const roomApi = {
  list: () => http.get('/rooms'),
  create: payload => http.post('/rooms', payload),
  update: (id, payload) => http.put(`/rooms/${id}`, payload),
  remove: id => http.delete(`/rooms/${id}`)
};

export const subjectApi = {
  list: () => http.get('/subjects'),
  create: payload => http.post('/subjects', payload),
  update: (id, payload) => http.put(`/subjects/${id}`, payload),
  remove: id => http.delete(`/subjects/${id}`)
};

// BE main trả DANH SÁCH gói đang hiệu lực (gói tự do / gói lớp theo buổi có thể song song).
// Các màn hình dùng 1 gói "hiện tại": lấy gói hết hạn muộn nhất, kèm cả danh sách ở .all; không có gói -> null.
function pickCurrent(list) {
  if (!Array.isArray(list)) return list || null;
  if (!list.length) return null;
  const sorted = [...list].sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  return { ...sorted[0], all: sorted };
}

function classForm(payload, image) {
  const fd = new FormData();
  fd.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (image) fd.append('image', image);
  return fd;
}

export const classApi = {
  list: () => http.get('/classes'),
  // tìm lớp có lọc + phân trang: { fromDate, toDate (yyyy-MM-dd), subjectId, coachId, roomId, status (OPENING|CANCELLED|COMPLETED), available, page, size }
  search: query => http.get('/classes/search', query),
  get: id => http.get(`/classes/${id}`),
  // multipart: part "data" là JSON lớp, part "image" là file ảnh (tạo lớp bắt buộc, sửa lớp không gửi = giữ ảnh cũ)
  create: (payload, image) => http.post('/classes', classForm(payload, image)),
  update: (id, payload, image) => http.put(`/classes/${id}`, classForm(payload, image)),
  assignCoach: (classId, coachId) => http.put(`/classes/${classId}/coach/${coachId}`),
  // hủy lớp: giữ lịch sử, hủy các đăng ký và báo học viên; xóa chỉ dùng cho lớp tạo nhầm
  cancel: (id, reason) => http.patch(`/classes/${id}/cancel`, { reason }),
  complete: id => http.patch(`/classes/${id}/complete`),
  remove: id => http.delete(`/classes/${id}`)
};

export const memberApi = {
  me: () => http.get('/members/me'),
  updateMe: payload => http.put('/members/me', payload),
  subscriptions: () => http.get('/members/me/subscriptions'),
  currentSubscription: () => http.get('/members/me/subscriptions/current').then(pickCurrent),
  // trước khi thanh toán: ngày bắt đầu / hết hạn dự kiến + cảnh báo gói trùng khu tập
  purchasePreview: packageId => http.get('/members/me/subscriptions/preview', { packageId }),
  payments: () => http.get('/members/me/payments'),
  invoice: paymentId => http.get(`/members/me/payments/${paymentId}/invoice`),
  register: classId => http.post('/members/me/registrations', { classId }),
  cancel: registrationId => http.delete(`/members/me/registrations/${registrationId}`),
  registrations: () => http.get('/members/me/registrations'),
  schedule: () => http.get('/members/me/schedule'),
  workoutPlans: () => http.get('/members/me/workout-plans'),
  workoutResults: () => http.get('/members/me/workout-results'),
  progress: () => http.get('/members/me/progress'),
  notifications: () => http.get('/members/me/notifications'),
  unreadNotificationCount: () => http.get('/members/me/notifications/unread-count'),
  markNotificationRead: notificationId => http.patch(`/members/me/notifications/${notificationId}/read`),
  markAllNotificationsRead: () => http.patch('/members/me/notifications/read-all'),
  // lịch sử điểm danh theo từng buổi học
  attendances: () => http.get('/members/me/attendances'),
  // lịch sử check-in của hội viên
  checkIns: () => http.get('/members/me/check-ins'),
  classWorkoutPlans: classId => http.get(`/coaches/classes/${classId}/workout-plans`),
  profileById: memberId => http.get(`/members/${memberId}`)
};

// Khảo sát (quiz) của hội viên: phải làm xong mới tự đặt lớp được (BE trả ERR_QUIZ_008).
// Câu hệ thống HEIGHT / WEIGHT / TRAINING_GOAL được BE ghi thẳng vào hồ sơ hội viên.
export const quizApi = {
  questions: () => http.get('/members/me/quiz/questions'),
  // { completed, completedAt }
  status: () => http.get('/members/me/quiz/status'),
  // answers: [{ questionId, optionIds?, numberValue?, textValue? }] — phải trả lời đủ mọi câu đang ACTIVE; làm lại thì ghi đè
  submit: answers => http.put('/members/me/quiz', { answers })
};

// Quản lý: soạn bộ câu hỏi khảo sát (quyền MANAGE_QUIZ). Câu hệ thống không sửa / ẩn được.
// payload: { content, type (NUMBER|SINGLE|MULTIPLE|TEXT), code, minValue, maxValue, unit, displayOrder, options: [{ optionId?, content, code }] }
export const quizAdminApi = {
  list: () => http.get('/quiz-questions'),
  create: payload => http.post('/quiz-questions', payload),
  update: (id, payload) => http.put(`/quiz-questions/${id}`, payload),
  hide: id => http.delete(`/quiz-questions/${id}`),
  restore: id => http.patch(`/quiz-questions/${id}/restore`)
};

// Trợ lý AI của hội viên. BE có thể mất tới 1–2 phút khi chuyển sang model dự phòng -> chờ tối đa 150 giây.
export const aiApi = {
  chat: (conversationId, message) => http.post('/ai/chat', { conversationId, message }, { timeoutMs: 150000 }),
  conversations: () => http.get('/ai/conversations'),
  messages: id => http.get(`/ai/conversations/${id}/messages`)
};

export const vnpayApi = {
  // BE main chỉ nhận packageId; vnp_ReturnUrl do BE cấu hình (vnpay.return-url), phương thức chọn trên trang VNPay
  createUrl: packageId => http.post('/payments/vnpay/create-url', undefined, { query: { packageId } }),
  // trạng thái 1 giao dịch: dò trong lịch sử thanh toán (BE chưa có API riêng)
  paymentStatus: async paymentId => (await http.get('/members/me/payments')).find(p => p.paymentId === paymentId) || null,
  // query là nguyên chuỗi "?vnp_...=..." VNPay trả về
  callback: query => http.get(`/payments/vnpay/callback${query.startsWith('?') ? query : `?${query}`}`, undefined, { auth: false })
};

export const receptionApi = {
  search: keyword => http.get('/receptionist/members', { keyword }),
  // keyword trống: BE trả mọi hội viên (keyword để thẳng trong đường dẫn vì client bỏ tham số rỗng)
  allMembers: async () => (await http.get('/receptionist/members?keyword=')).sort((a, b) => b.memberId - a.memberId),
  updateMember: (memberId, payload) => http.put(`/receptionist/members/${memberId}`, payload),
  member: id => http.get(`/receptionist/members/${id}`),
  registerWalkIn: payload => http.post('/receptionist/members', payload),
  subscribe: (memberId, packageId, paymentMethod) => http.post(`/receptionist/members/${memberId}/subscriptions`, { packageId, paymentMethod }),
  // trước khi bán tại quầy: ngày hiệu lực dự kiến + cảnh báo gói trùng khu tập
  purchasePreview: (memberId, packageId) => http.get(`/receptionist/members/${memberId}/subscriptions/preview`, { packageId }),
  subscriptions: memberId => http.get(`/receptionist/members/${memberId}/subscriptions`),
  currentSubscription: memberId => http.get(`/receptionist/members/${memberId}/subscriptions/current`).then(pickCurrent),
  payments: memberId => http.get(`/receptionist/members/${memberId}/payments`),
  invoice: paymentId => http.get(`/receptionist/payments/${paymentId}/invoice`),
  // bán gói tạo giao dịch PENDING; lễ tân xác nhận đã thu thì gói mới ACTIVE
  confirmPayment: (paymentId, payload) => http.patch(`/receptionist/payments/${paymentId}/confirm`, payload),
  cancelPayment: (paymentId, reason) => http.patch(`/receptionist/payments/${paymentId}/cancel`, { reason }),
  register: (memberId, classId) => http.post(`/receptionist/members/${memberId}/registrations`, { classId }),
  cancel: (memberId, registrationId) => http.delete(`/receptionist/members/${memberId}/registrations/${registrationId}`),
  registrations: memberId => http.get(`/receptionist/members/${memberId}/registrations`),
  createTicket: (memberId, content) => http.post('/receptionist/tickets', { memberId, content }),
  tickets: memberId => http.get('/receptionist/tickets', memberId ? { memberId } : undefined),
  resolveTicket: ticketId => http.patch(`/receptionist/tickets/${ticketId}/resolve`),
  // danh sách giao dịch tại quầy (lọc ngày, trạng thái, phương thức, từ khóa), có phân trang
  allPayments: query => http.get('/receptionist/payments', query),
  // điểm danh hội viên khi đến trung tâm (không có body)
  checkIn: memberId => http.post(`/receptionist/members/${memberId}/check-ins`),
  checkInsByDate: date => http.get('/receptionist/check-ins', date ? { date } : undefined),
  memberCheckIns: memberId => http.get(`/receptionist/members/${memberId}/check-ins`),
  // targetMode: MEMBERS (kèm memberIds) | ALL_ACTIVE -> { recipientCount }
  sendNotification: payload => http.post('/receptionist/notifications', payload)
};

export const coachApi = {
  schedules: () => http.get('/coaches/me/schedules'),
  roster: classId => http.get(`/coaches/me/classes/${classId}/roster`),
  member: memberId => http.get(`/coaches/members/${memberId}`),
  takeAttendance: (classId, records) => http.post(`/coaches/me/classes/${classId}/attendances`, { records }),
  attendances: classId => http.get(`/coaches/me/classes/${classId}/attendances`),
  createPlan: payload => http.post('/coaches/me/workout-plans', payload),
  myPlans: () => http.get('/coaches/me/workout-plans'),
  memberPlans: memberId => http.get(`/coaches/members/${memberId}/workout-plans`),
  // tiến độ giáo án cá nhân (memberPlanId có trong danh sách giáo án của học viên); status: IN_PROGRESS | COMPLETED
  setMemberPlanStatus: (memberPlanId, status) => http.patch(`/coaches/member-plans/${memberPlanId}/status`, undefined, { query: { status } }),
  classPlans: classId => http.get(`/coaches/classes/${classId}/workout-plans`),
  recordResult: (memberId, payload) => http.post(`/coaches/members/${memberId}/workout-results`, payload),
  memberResults: memberId => http.get(`/coaches/members/${memberId}/workout-results`),
  updateResult: (resultId, payload) => http.put(`/coaches/workout-results/${resultId}`, payload),
  memberProgress: memberId => http.get(`/coaches/members/${memberId}/progress`),
  notifyClass: (classId, payload) => http.post(`/coaches/classes/${classId}/notifications`, payload),
  notifyMember: (memberId, payload) => http.post(`/coaches/members/${memberId}/notifications`, payload),
  classNotifications: classId => http.get(`/coaches/classes/${classId}/notifications`)
};

// Quản lý: nhân viên lễ tân
export const staffApi = {
  list: query => http.get('/manager/receptionists', query),
  create: payload => http.post('/manager/receptionists', payload),
  update: (id, payload) => http.put(`/manager/receptionists/${id}`, payload),
  toggleStatus: id => http.patch(`/manager/receptionists/${id}/status`)
};

// Quản lý: toàn bộ giao dịch, xuất CSV, hoàn tiền
export const managerPaymentApi = {
  list: query => http.get('/manager/payments', query),
  exportCsv: (query, filename) => download('/manager/payments/export', query, filename),
  refund: (paymentId, reason) => http.patch(`/manager/payments/${paymentId}/refund`, { reason })
};

export const reportApi = {
  overview: () => http.get('/manager/reports/overview'),
  members: (fromDate, toDate) => http.get('/manager/reports/members', { fromDate, toDate }),
  classes: (fromDate, toDate) => http.get('/manager/reports/classes', { fromDate, toDate }),
  revenue: (fromDate, toDate) => http.get('/manager/reports/revenue', { fromDate, toDate })
};

// Dữ liệu cho trang giới thiệu khi chưa đăng nhập (BE mở GET công khai)
export const publicApi = {
  packages: () => http.get('/packages', undefined, { auth: false }),
  subjects: () => http.get('/subjects', undefined, { auth: false })
};
