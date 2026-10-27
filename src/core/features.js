// Bật / tắt các phần giao diện đang chờ BE (đánh số theo FE-TODO.md).
// BE bổ sung API nào thì đổi cờ tương ứng thành true, không phải sửa màn hình.
export const FEATURES = {
  // Trợ lý AI của hội viên: BE main đã có (POST /ai/chat, GET /ai/conversations...)
  ai: true,
  // #11 Lịch sử check-in: GET /receptionist/members/{id}/check-ins, GET /members/me/check-ins (BE main đã có)
  checkInHistory: true,
  // #10 Hồ sơ nhân viên: GET/PUT /users/me (BE main đã có)
  staffProfileApi: true,
  // #9 Lễ tân sửa thông tin hội viên: PUT /receptionist/members/{id} (BE main đã có)
  receptionEditMember: true
};
