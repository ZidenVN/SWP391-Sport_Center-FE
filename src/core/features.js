// Bật / tắt các phần giao diện đang chờ BE (đánh số theo FE-TODO.md).
// BE bổ sung API nào thì đổi cờ tương ứng thành true, không phải sửa màn hình.
export const FEATURES = {
  // #13 Trợ lý AI (Member) và gợi ý bài tập AI (Coach): BE main chưa có, nhóm chưa chốt
  ai: false,
  // #11 Lịch sử check-in: GET /receptionist/members/{id}/check-ins, GET /members/me/check-ins
  checkInHistory: false,
  // #10 Hồ sơ nhân viên: GET/PUT /users/me
  staffProfileApi: false,
  // #9 Lễ tân sửa thông tin hội viên: PUT /receptionist/members/{id}
  receptionEditMember: false
};
