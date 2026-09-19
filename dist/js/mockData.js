/**
 * Mock Data for Sports Center Management System (SWP391 - FA26 Topic 4)
 * Synchronized for all 4 roles: Member, Receptionist, Coach, Manager
 */

const INITIAL_DATA = {
  demoAccounts: [
    {
      role: 'MANAGER',
      roleLabel: 'Center Manager (Quản lý Admin)',
      email: 'manager@sportscenter.vn',
      password: '123',
      name: 'Nguyễn Văn Quản Lý',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      desc: 'Quản trị nhân sự, gói tập & doanh thu'
    },
    {
      role: 'RECEPTIONIST',
      roleLabel: 'Receptionist (Lễ tân Quầy POS & Cổng)',
      email: 'letan@sportscenter.vn',
      password: '123',
      name: 'Lê Ngọc Lễ Tân',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      desc: 'Quét thẻ check-in cổng & Bán gói POS'
    },
    {
      role: 'COACH',
      roleLabel: 'Coach (Huấn luyện viên)',
      email: 'coach.nam@sportscenter.vn',
      password: '123',
      name: 'Trần Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      desc: 'Lịch dạy hôm nay & Điểm danh lớp'
    },
    {
      role: 'MEMBER',
      roleLabel: 'Member (Hội viên Khách hàng)',
      email: 'trang.pham@gmail.com',
      password: '123',
      name: 'Phạm Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Khám phá lớp, đặt chỗ & Mua gói tập'
    }
  ],
  packages: [
    {
      packageId: 'PKG01',
      id: 'PKG01',
      packageName: 'Standard Gym & Cardio',
      name: 'Standard Gym & Cardio',
      type: 'GYM',
      durationDays: 30,
      price: 650000,
      description: 'Tập luyện tự do tại khu vực Gym máy tạ & Cardio không giới hạn giờ tập.'
    },
    {
      packageId: 'PKG02',
      id: 'PKG02',
      packageName: 'VIP All-Access Pass',
      name: 'VIP All-Access Pass',
      type: 'VIP',
      durationDays: 90,
      price: 2450000,
      description: 'Toàn quyền sử dụng Gym, lớp Yoga, Boxing, phòng xông hơi Sauna & tủ đồ cá nhân.'
    },
    {
      packageId: 'PKG03',
      id: 'PKG03',
      packageName: 'Yoga & Pilates Master',
      name: 'Yoga & Pilates Master',
      type: 'YOGA',
      durationDays: 60,
      price: 1800000,
      description: 'Chuyên sâu các lớp Vinyasa Yoga, Hatha Yoga và Pilates Reformer cùng HLV.'
    },
    {
      packageId: 'PKG04',
      id: 'PKG04',
      packageName: 'Personal Training (PT 1-1) 12 Buổi',
      name: 'Personal Training (PT 1-1) 12 Buổi',
      type: 'PT',
      durationDays: 45,
      price: 4800000,
      description: 'HLV cá nhân thiết kế giáo án riêng, đo InBody theo dõi chỉ số dinh dưỡng.'
    }
  ],
  members: [
    {
      memberId: 'MEM101',
      id: 'MEM101',
      firstName: 'Thu Trang',
      lastName: 'Phạm',
      name: 'Phạm Thu Trang',
      email: 'trang.pham@gmail.com',
      trainingGoal: 'Giảm mỡ, tăng cơ săn chắc',
      status: 'ACTIVE'
    },
    {
      memberId: 'MEM102',
      id: 'MEM102',
      firstName: 'Tiến Dũng',
      lastName: 'Nguyễn',
      name: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@gmail.com',
      trainingGoal: 'Tăng cường sức mạnh cơ bắp & boxing',
      status: 'ACTIVE'
    },
    {
      memberId: 'MEM103',
      id: 'MEM103',
      firstName: 'Minh Châu',
      lastName: 'Hoàng',
      name: 'Hoàng Minh Châu',
      email: 'chau.hoang@gmail.com',
      trainingGoal: 'Tập Yoga dẻo dai & giải tỏa stress',
      status: 'EXPIRED'
    },
    {
      memberId: 'MEM104',
      id: 'MEM104',
      firstName: 'Quốc Bảo',
      lastName: 'Vũ',
      name: 'Vũ Quốc Bảo',
      email: 'bao.vu@gmail.com',
      trainingGoal: 'Rèn luyện sức bền & tim mạch',
      status: 'ACTIVE'
    }
  ],
  subjects: [
    { subjectId: 'SUB01', subjectName: 'Yoga', description: 'Rèn luyện sự dẻo dai, nhịp thở và cân bằng thân tâm' },
    { subjectId: 'SUB02', subjectName: 'Boxing', description: 'Đốt mỡ cường độ cao, phản xạ tự vệ và rèn luyện thể lực' },
    { subjectId: 'SUB03', subjectName: 'Zumba', description: 'Vũ đạo sôi động trên nền nhạc Latin, giải tỏa căng thẳng' },
    { subjectId: 'SUB04', subjectName: 'Pilates', description: 'Tăng cường sức mạnh cơ trọng tâm, điều chỉnh tư thế cột sống' }
  ],
  rooms: [
    { roomId: 'RM01', roomName: 'Studio A (Yoga & Pilates)', capacity: 20, status: 'AVAILABLE' },
    { roomId: 'RM02', roomName: 'Ring Room B (Boxing & Combat)', capacity: 15, status: 'AVAILABLE' },
    { roomId: 'RM03', roomName: 'Main Gym Floor (Cardio & Tạ)', capacity: 40, status: 'AVAILABLE' },
    { roomId: 'RM04', roomName: 'Studio C (Pilates Reformer)', capacity: 12, status: 'AVAILABLE' }
  ],
  // STRICT ERD: Only ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status
  classes: [
    {
      classId: 'CLS01',
      id: 'CLS01',
      subjectId: 'SUB01',
      roomId: 'RM01',
      coachId: 'COACH',
      scheduleTime: 'Thứ 2, 4, 6 | 07:00 - 08:15',
      maxCapacity: 20,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS02',
      id: 'CLS02',
      subjectId: 'SUB02',
      roomId: 'RM02',
      coachId: 'COACH',
      scheduleTime: 'Thứ 3, 5, 7 | 18:00 - 19:15',
      maxCapacity: 15,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS03',
      id: 'CLS03',
      subjectId: 'SUB03',
      roomId: 'RM01',
      coachId: 'COACH_02',
      scheduleTime: 'Thứ 2, 4, 6 | 19:30 - 20:30',
      maxCapacity: 25,
      status: 'ACTIVE'
    },
    {
      classId: 'CLS04',
      id: 'CLS04',
      subjectId: 'SUB04',
      roomId: 'RM04',
      coachId: 'COACH_03',
      scheduleTime: 'Thứ 3, 5, Chủ Nhật | 09:00 - 10:00',
      maxCapacity: 12,
      status: 'ACTIVE'
    }
  ],
  classPlans: [
    { classPlanId: 'CP01', classId: 'CLS01', content: 'Khởi động kéo giãn (10p) - Chuỗi Vinyasa Flow (45p) - Thư giãn Savasana (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP02', classId: 'CLS02', content: 'Nhảy dây & gập bụng (10p) - Tổ hợp đấm Pad Work & né đòn (45p) - Cooldown (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP03', classId: 'CLS03', content: 'Warmup nhịp điệu Salsa (10p) - Vũ đạo Merengue & Reggaeton (45p) - Giãn cơ (15p)', createDate: '2026-08-01' },
    { classPlanId: 'CP04', classId: 'CLS04', content: 'Tư thế nằm cân chỉnh xương chậu (10p) - Bài tập lò xo máy Reformer (45p) - Thả lỏng (15p)', createDate: '2026-08-01' }
  ],
  classEnrollments: [
    { classEnrollmentId: 'ENR01', classId: 'CLS01', memberId: 'MEM101', enrollDate: '2026-08-01', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR02', classId: 'CLS01', memberId: 'MEM103', enrollDate: '2026-08-05', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR03', classId: 'CLS01', memberId: 'MEM104', enrollDate: '2026-08-10', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR04', classId: 'CLS02', memberId: 'MEM102', enrollDate: '2026-08-02', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR05', classId: 'CLS02', memberId: 'MEM104', enrollDate: '2026-08-03', status: 'CONFIRMED' },
    { classEnrollmentId: 'ENR06', classId: 'CLS03', memberId: 'MEM101', enrollDate: '2026-08-04', status: 'CONFIRMED' }
  ],
  classAttendances: [
    { attendanceId: 'ATT01', classEnrollmentId: 'ENR01', classId: 'CLS01', memberId: 'MEM101', attendedDate: '2026-09-18', status: 'PRESENT' },
    { attendanceId: 'ATT02', classEnrollmentId: 'ENR02', classId: 'CLS01', memberId: 'MEM103', attendedDate: '2026-09-18', status: 'ABSENT' },
    { attendanceId: 'ATT03', classEnrollmentId: 'ENR03', classId: 'CLS01', memberId: 'MEM104', attendedDate: '2026-09-18', status: 'PRESENT' },
    { attendanceId: 'ATT04', classEnrollmentId: 'ENR04', classId: 'CLS02', memberId: 'MEM102', attendedDate: '2026-09-19', status: 'PRESENT' },
    { attendanceId: 'ATT05', classEnrollmentId: 'ENR05', classId: 'CLS02', memberId: 'MEM104', attendedDate: '2026-09-19', status: 'PRESENT' }
  ],
  workoutResults: [
    { resultId: 'RES01', memberId: 'MEM101', classId: 'CLS01', activityDetails: 'Vinyasa Flow 60 phút', coachFeedback: 'Tập dẻo dai, giữ nhịp thở đều', loggedDate: '2026-09-18' },
    { resultId: 'RES02', memberId: 'MEM104', classId: 'CLS01', activityDetails: 'Vinyasa Flow 60 phút', coachFeedback: 'Thể lực cải thiện đáng kể', loggedDate: '2026-09-18' },
    { resultId: 'RES03', memberId: 'MEM102', classId: 'CLS02', activityDetails: 'Boxing Combat 60 phút', coachFeedback: 'Đấm lực tốt, phản xạ nhanh', loggedDate: '2026-09-19' }
  ],
  subscriptions: [
    {
      subscriptionId: 'SUB101',
      id: 'SUB101',
      memberId: 'MEM101',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE'
    },
    {
      subscriptionId: 'SUB102',
      id: 'SUB102',
      memberId: 'MEM102',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE'
    },
    {
      subscriptionId: 'SUB103',
      id: 'SUB103',
      memberId: 'MEM103',
      packageId: 'PKG03',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'EXPIRED'
    },
    {
      subscriptionId: 'SUB104',
      id: 'SUB104',
      memberId: 'MEM104',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE'
    }
  ],
  payments: [
    {
      paymentId: 'PMT1001',
      id: 'INV1001',
      subscriptionId: 'SUB101',
      amount: 2450000,
      paymentMethod: 'VNPAY_QR',
      paymentDate: '2026-08-01',
      status: 'PAID'
    },
    {
      paymentId: 'PMT1002',
      id: 'INV1002',
      subscriptionId: 'SUB102',
      amount: 650000,
      paymentMethod: 'CASH',
      paymentDate: '2026-08-15',
      status: 'PAID'
    },
    {
      paymentId: 'PMT1003',
      id: 'INV1003',
      subscriptionId: 'SUB104',
      amount: 4800000,
      paymentMethod: 'CREDIT_CARD',
      paymentDate: '2026-08-20',
      status: 'PAID'
    }
  ],
  centerCheckIns: [
    {
      checkInId: 'CHK501',
      id: 'LOG501',
      memberId: 'MEM101',
      receptionistId: 'REC01',
      checkInTime: '2026-09-19 06:45'
    },
    {
      checkInId: 'CHK502',
      id: 'LOG502',
      memberId: 'MEM102',
      receptionistId: 'REC01',
      checkInTime: '2026-09-19 07:10'
    },
    {
      checkInId: 'CHK503',
      id: 'LOG503',
      memberId: 'MEM103',
      receptionistId: 'REC01',
      checkInTime: '2026-09-19 08:30'
    }
  ]
};

if (typeof window !== 'undefined') { window.INITIAL_DATA = INITIAL_DATA; }
if (typeof globalThis !== 'undefined') { globalThis.INITIAL_DATA = INITIAL_DATA; }
if (typeof module !== 'undefined' && module.exports) { module.exports = INITIAL_DATA; }
