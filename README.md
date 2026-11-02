# GIAO DIỆN FRONTEND - HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ THAO
### Đồ án môn học SWP391 - FA26 (Topic 04 - Giảng viên MinhTTH5)

---

## 🌟 Cách mở và chạy giao diện
1. Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt nào (Google Chrome, Microsoft Edge, Firefox, Brave...).
2. Không cần cài đặt `node_modules` hay chạy lệnh phức tạp! (Đã tích hợp sẵn Tailwind CSS, Lucide Icons, Chart.js qua CDN).

---

## 🎯 Tính năng nổi bật trên giao diện:
- **Thanh chuyển đổi vai trò nhanh (Role Switcher Bar)** ở thanh trên cùng:
  - 👑 **Center Manager / Admin**: Dashboard KPI doanh thu, biểu đồ phân tích 6 tháng, Quản lý tài khoản (Users & RBAC), Quản lý Gói tập (Pricing), Quản lý Lớp học & Phòng tập, Hóa đơn & Xuất báo cáo Excel.
  - 📋 **Receptionist (Lễ tân)**: Quầy Check-in cửa siêu tốc, Đăng ký hội viên mới tại quầy, Bán gói tập (POS) & xuất hóa đơn, Đặt/hủy lớp hộ học viên.
  - 🏋️‍♂️ **Coach (Huấn luyện viên)**: Xem lịch giảng dạy theo tuần, Điểm danh học viên theo lớp (Present/Absent), Theo dõi chỉ số InBody & ghi nhận tiến độ, **AI thiết kế giáo án tập luyện**.
  - 🏃 **Member (Học viên)**: Dashboard thời hạn thẻ VIP, Lịch lớp & Đặt chỗ 1-Click (1-Click Booking), Đăng ký gói tập với Mockup quét mã QR chuyển khoản, Lịch sử điểm danh & chỉ số thể lực, **AI Assistant Chatbot 24/7** & **AI Gợi ý bài tập**.
- **Interactive UI**: Đầy đủ Toast Notifications thông báo, Popup Modal, QR Code Generator, Print Invoice Dialog, Chatbot Widget tương tác mượt mà!

---

## 📁 Cấu trúc thư mục:
- `index.html`: File giao diện chính.
- `css/styles.css`: Hiệu ứng giao diện, font chữ Plus Jakarta Sans, glassmorphism.
- `js/mockData.js`: Dữ liệu mẫu phong phú (Hội viên, Gói tập, Huấn luyện viên, Lớp học, Lịch sử check-in, Hóa đơn).
- `js/app.js`: Logic điều khiển giao diện, chuyển tab, phân quyền, xử lý đặt lịch, check-in, thanh toán và trợ lý AI.tẻ