const DEFAULT_DATA = {
  demoAccounts: [
    {
      role: 'MANAGER',
      roleLabel: 'Center Manager (Quản lý Admin)',
      email: 'manager@sportscenter.vn',
      password: '123',
      name: 'Nguyễn Văn Quản Lý',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      desc: 'Toàn quyền quản trị nhân sự, gói tập, phòng tập và doanh thu'
    },
    {
      role: 'RECEPTIONIST',
      roleLabel: 'Receptionist (Lễ tân Quầy POS & Cổng)',
      email: 'letan@sportscenter.vn',
      password: '123',
      name: 'Lê Ngọc Lễ Tân',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      desc: 'Quét thẻ check-in cổng, bán gói POS & tra cứu hội viên tại quầy'
    },
    {
      role: 'COACH',
      roleLabel: 'Coach (Huấn luyện viên)',
      email: 'coach.nam@sportscenter.vn',
      password: '123',
      name: 'Trần Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      desc: 'Lịch dạy trong tuần, điểm danh lớp học & theo dõi thể lực học viên'
    },
    {
      role: 'MEMBER',
      roleLabel: 'Member (Hội viên Khách hàng)',
      email: 'trang.pham@gmail.com',
      password: '123',
      name: 'Phạm Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Khám phá lớp, đặt chỗ trước, mua gói tập & theo dõi tiến trình InBody'
    }
  ],
  packages: [
    {
      id: 'PKG01',
      name: 'Standard Gym & Cardio',
      durationDays: 30,
      price: 650000,
      description: 'Truy cập không giới hạn khu vực Gym & Cardio từ 6h00 đến 22h00 hàng ngày.',
      features: ['Tập luyện tự do toàn bộ máy Gym & Cardio', 'Tủ đồ thông minh & phòng tắm nóng lạnh', 'Đo InBody kiểm tra thể trạng 1 lần/tháng', 'Nước uống lọc tinh khiết miễn phí'],
      popular: false
    },
    {
      id: 'PKG02',
      name: 'VIP All-Access Pass',
      durationDays: 90,
      price: 2450000,
      description: 'Gói toàn diện Gym + tất cả các lớp Yoga, Zumba, Boxing và xông hơi Sauna.',
      features: ['Không giới hạn Gym + Yoga + Boxing + Zumba', 'Miễn phí phòng xông hơi khô & ướt Sauna', 'Khăn tập & tủ đồ VIP riêng biệt', 'Tặng 2 buổi kèm 1-1 cùng HLV chuyên nghiệp'],
      popular: true
    },
    {
      id: 'PKG03',
      name: 'Yoga & Pilates Master',
      durationDays: 30,
      price: 1200000,
      description: 'Dành riêng cho tín đồ Yoga, Thiền định và Pilates cùng giáo viên chứng chỉ quốc tế.',
      features: ['20 lớp Yoga & Pilates chuyên sâu/tháng', 'Thảm tập cao cấp kháng khuẩn chuẩn bị sẵn', 'Trà thảo mộc thanh lọc cơ thể sau buổi tập', 'Ưu tiên giữ chỗ lớp giờ cao điểm'],
      popular: false
    },
    {
      id: 'PKG04',
      name: 'Personal Training (PT 1-1) 12 Buổi',
      durationDays: 45,
      price: 4800000,
      description: 'Kèm riêng 1-1 cùng HLV cá nhân, thiết kế giáo án dinh dưỡng và thể lực riêng biệt.',
      features: ['12 buổi kèm 1-1 (60 phút/buổi)', 'Lên thực đơn & bài tập cá nhân hóa 100%', 'Theo dõi chỉ số InBody & vòng đo hàng tuần', 'Cam kết đạt mục tiêu thể hình theo lộ trình'],
      popular: false
    }
  ],
  members: [
    {
      id: 'MEM101',
      name: 'Phạm Thu Trang',
      email: 'trang.pham@gmail.com',
      phone: '0912345678',
      gender: 'Nữ',
      activePackage: 'VIP All-Access Pass',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE',
      trainingGoal: 'Giảm mỡ, tăng độ dẻo dai cơ thể',
      inbody: { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM102',
      name: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@gmail.com',
      phone: '0987654321',
      gender: 'Nam',
      activePackage: 'Standard Gym & Cardio',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE',
      trainingGoal: 'Tăng cơ, cải thiện sức mạnh ngực & vai',
      inbody: { weight: 72, height: 175, bodyFat: 17.0, muscleMass: 35.8, bmi: 23.5 },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM103',
      name: 'Hoàng Minh Châu',
      email: 'chau.hoang@gmail.com',
      phone: '0905123987',
      gender: 'Nữ',
      activePackage: 'Yoga & Pilates Master',
      packageId: 'PKG03',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'EXPIRED',
      trainingGoal: 'Chữa đau mỏi cổ vai gáy và thiền định',
      inbody: { weight: 49, height: 158, bodyFat: 23.0, muscleMass: 21.0, bmi: 19.6 },
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'MEM104',
      name: 'Vũ Quốc Bảo',
      email: 'bao.vu@gmail.com',
      phone: '0934567890',
      gender: 'Nam',
      activePackage: 'Personal Training (PT 1-1) 12 Buổi',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE',
      trainingGoal: 'Tập cường độ cao, rèn phản xạ Boxing',
      inbody: { weight: 78, height: 180, bodyFat: 15.5, muscleMass: 40.2, bmi: 24.1 },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  coaches: [
    {
      id: 'COACH',
      name: 'Trần Hoàng Nam',
      email: 'coach.nam@sportscenter.vn',
      phone: '0966778899',
      specialty: 'Boxing, Kickfit & Vinyasa Yoga',
      experience: '7 năm giảng dạy',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 3
    },
    {
      id: 'COACH_02',
      name: 'Nguyễn Hà My',
      email: 'hamy.nguyen@sportscenter.vn',
      phone: '0944556677',
      specialty: 'Zumba Dance & Aerobic Fitness',
      experience: '5 năm giảng dạy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 2
    },
    {
      id: 'COACH_03',
      name: 'Lê Quốc Huy',
      email: 'quochuy.le@sportscenter.vn',
      phone: '0933445566',
      specialty: 'Gym & Thể Hình Khoa Học',
      experience: '6 năm giảng dạy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 3
    },
    {
      id: 'COACH_04',
      name: 'Đặng Kim Ngân',
      email: 'kimngan.dang@sportscenter.vn',
      phone: '0911223344',
      specialty: 'Pilates Reformer & Cân Chỉnh Tư Thế',
      experience: '5 năm giảng dạy quốc tế',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      activeClassesCount: 2
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
  // STRICT ERD (Classes table: ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status)
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
  checkinLogs: [
    {
      id: 'LOG501',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      packageName: 'VIP All-Access Pass',
      time: 'Hôm nay 06:45',
      gate: 'Cổng 01 (Turnstile A)',
      status: 'VALID'
    },
    {
      id: 'LOG502',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      packageName: 'Standard Gym & Cardio',
      time: 'Hôm nay 07:10',
      gate: 'Cổng 02 (Turnstile B)',
      status: 'VALID'
    },
    {
      id: 'LOG503',
      memberId: 'MEM103',
      memberName: 'Hoàng Minh Châu',
      packageName: 'Yoga & Pilates Master',
      time: 'Hôm nay 08:30',
      gate: 'Cổng 01 (Turnstile A)',
      status: 'DENIED_EXPIRED'
    }
  ],
  invoices: [
    {
      id: 'INV1001',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      packageName: 'VIP All-Access Pass (90 Ngày)',
      amount: 2450000,
      paymentMethod: 'VNPAY_QR',
      date: '2026-08-01',
      status: 'PAID'
    },
    {
      id: 'INV1002',
      memberId: 'MEM102',
      memberName: 'Nguyễn Tiến Dũng',
      packageName: 'Standard Gym & Cardio (30 Ngày)',
      amount: 650000,
      paymentMethod: 'CASH',
      date: '2026-08-15',
      status: 'PAID'
    },
    {
      id: 'INV1003',
      memberId: 'MEM104',
      memberName: 'Vũ Quốc Bảo',
      packageName: 'Personal Training (PT 1-1) 12 Buổi',
      amount: 4800000,
      paymentMethod: 'CREDIT_CARD',
      date: '2026-08-20',
      status: 'PAID'
    }
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
  // STRICT ERD: WorkoutPlans
  workoutPlans: [
    {
      planId: 'WP01',
      id: 'WP01',
      planName: 'Lộ Trình Giảm Mỡ & Săn Chắc 30 Ngày',
      duration: '4 Tuần (3 buổi/tuần)',
      exercises: 'Khởi động dynamic stretch (10p) - High Knees, Jump Squat & Burpees (20p) - Plank & Mountain Climber (15p) - Cooldown thả lỏng (15p)',
      dueDate: '2026-10-20',
      createDate: '2026-09-18',
      coachId: 'COACH'
    },
    {
      planId: 'WP02',
      id: 'WP02',
      planName: 'Tăng Cơ Trọng Tâm & Sức Bền Boxing',
      duration: '6 Tuần (4 buổi/tuần)',
      exercises: 'Nhảy dây tốc độ cao (15p) - Đấm bao cát Heavy Bag & Shadow Boxing (30p) - Hít đất tạ & gập bụng (15p)',
      dueDate: '2026-10-31',
      createDate: '2026-09-15',
      coachId: 'COACH'
    }
  ],
  // STRICT ERD: MemberPlan associative entity
  memberPlans: [
    {
      memberPlanId: 'MP01',
      id: 'MP01',
      memberId: 'MEM101',
      planId: 'WP01',
      assignedDate: '2026-09-18',
      status: 'IN_PROGRESS'
    },
    {
      memberPlanId: 'MP02',
      id: 'MP02',
      memberId: 'MEM102',
      planId: 'WP02',
      assignedDate: '2026-09-15',
      status: 'IN_PROGRESS'
    }
  ],
  // STRICT ERD: SupportTickets
  supportTickets: [
    {
      ticketId: 'TCK101',
      id: 'TCK101',
      memberId: 'MEM101',
      memberName: 'Phạm Thu Trang',
      receptionistId: 'REC01',
      content: 'Em để quên bình nước giữ nhiệt màu hồng tại Studio A ca sáng hôm nay, nhờ quầy kiểm tra giúp em ạ.',
      createdDate: '2026-09-20 08:30',
      status: 'PENDING',
      response: ''
    },
    {
      ticketId: 'TCK102',
      id: 'TCK102',
      memberId: 'MEM103',
      memberName: 'Hoàng Minh Châu',
      receptionistId: 'REC01',
      content: 'Thẻ của tôi báo hết hạn nhưng tôi nhớ còn thời hạn đến cuối tháng, nhờ lễ tân tra cứu lại giúp.',
      createdDate: '2026-09-19 14:15',
      status: 'RESOLVED',
      response: 'Đã kiểm tra lại thông tin trên hệ thống, thẻ gói cũ của chị đã hết hạn ngày 31/07. Quầy đã hỗ trợ tư vấn gia hạn gói mới thành công.'
    }
  ],
  // STRICT ERD: Notifications
  notifications: [
    {
      notificationId: 'NOTIF01',
      id: 'NOTIF01',
      title: 'Nhắc Lịch Tập Sắp Tới',
      content: 'Buổi học Vinyasa Yoga của bạn sẽ bắt đầu lúc 07:00 ngày mai tại Studio A.',
      sentDate: '2026-09-21 06:30',
      targetType: 'ACCOUNT',
      targetId: 'MEM101',
      isRead: false
    },
    {
      notificationId: 'NOTIF02',
      id: 'NOTIF02',
      title: 'Gia Hạn Thẻ Thành Công',
      content: 'Thẻ VIP All-Access Pass của bạn đã được kích hoạt thành công, thời hạn sử dụng đến 01/11/2026.',
      sentDate: '2026-09-19 09:00',
      targetType: 'ACCOUNT',
      targetId: 'MEM101',
      isRead: true
    },
    {
      notificationId: 'NOTIF03',
      id: 'NOTIF03',
      title: 'Cập Nhật Giáo Án Lớp Boxing CLS02',
      content: 'HLV Trần Hoàng Nam đã cập nhật giáo án Pad Work nâng cao cho ca tập chiều nay.',
      sentDate: '2026-09-20 16:00',
      targetType: 'CLASS',
      targetId: 'CLS02',
      isRead: false
    },
    {
      notificationId: 'NOTIF04',
      id: 'NOTIF04',
      title: 'Yêu Cầu Hỗ Trợ Mới',
      content: 'Hội viên Phạm Thu Trang (MEM101) vừa gửi yêu cầu hỗ trợ tìm đồ để quên tại Studio A.',
      sentDate: '2026-09-20 08:31',
      targetType: 'ACCOUNT',
      targetId: 'REC01',
      isRead: false
    }
  ],
  // STRICT ERD: AuditLogs
  auditLogs: [
    {
      logId: 'AUD01',
      id: 'AUD01',
      actionType: 'CREATE_PACKAGE',
      targetTable: 'Packages',
      timestamp: '2026-09-20 10:15',
      details: 'Quản lý tạo mới gói tập Super VIP Pilates & Sauna (3.500.000 VND)',
      accountId: 'manager@sportscenter.vn'
    },
    {
      logId: 'AUD02',
      id: 'AUD02',
      actionType: 'RENEW_MEMBERSHIP',
      targetTable: 'Subscriptions',
      timestamp: '2026-09-19 15:30',
      details: 'Lễ tân gia hạn thẻ +30 ngày cho hội viên Phạm Thu Trang (MEM101)',
      accountId: 'letan@sportscenter.vn'
    },
    {
      logId: 'AUD03',
      id: 'AUD03',
      actionType: 'CREATE_CLASS',
      targetTable: 'Classes',
      timestamp: '2026-09-18 11:00',
      details: 'Phân công ca dạy lớp CLS04 (Pilates Reformer) cho HLV Lý Kim Ngân tại RM04',
      accountId: 'manager@sportscenter.vn'
    },
    {
      logId: 'AUD04',
      id: 'AUD04',
      actionType: 'ASSIGN_WORKOUT_PLAN',
      targetTable: 'WorkoutPlans',
      timestamp: '2026-09-18 09:30',
      details: 'HLV Trần Hoàng Nam gán lộ trình "Giảm Mỡ & Săn Chắc 30 Ngày" cho hội viên MEM101',
      accountId: 'coach.nam@sportscenter.vn'
    }
  ]
};

// Safe Data Normalizer
function getDataSource() {
  const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
  const initial = (typeof window !== 'undefined' && window.INITIAL_DATA) ? window.INITIAL_DATA : null;
  if (!initial) return base;

  return {
    demoAccounts: base.demoAccounts,
    packages: (initial.packages && initial.packages.length) ? initial.packages : base.packages,
    members: (initial.members && initial.members.length) ? initial.members : base.members,
    coaches: (initial.coaches && initial.coaches.length) ? initial.coaches : base.coaches,
    subjects: (initial.subjects && initial.subjects.length) ? initial.subjects : base.subjects,
    rooms: (initial.rooms && initial.rooms.length) ? initial.rooms : base.rooms,
    subscriptions: (initial.subscriptions && initial.subscriptions.length) ? initial.subscriptions : (base.subscriptions || []),
    payments: (initial.payments && initial.payments.length) ? initial.payments : (base.payments || []),
    workoutPlans: (initial.workoutPlans && initial.workoutPlans.length) ? initial.workoutPlans : (base.workoutPlans || []),
    memberPlans: (initial.memberPlans && initial.memberPlans.length) ? initial.memberPlans : (base.memberPlans || []),
    supportTickets: (initial.supportTickets && initial.supportTickets.length) ? initial.supportTickets : (base.supportTickets || []),
    notifications: (initial.notifications && initial.notifications.length) ? initial.notifications : (base.notifications || []),
    auditLogs: (initial.auditLogs && initial.auditLogs.length) ? initial.auditLogs : (base.auditLogs || []),
    // Strictly ERD fields: ClassID, SubjectID, RoomID, CoachID, ScheduleTime, MaxCapacity, Status
    classes: (initial.classes && initial.classes.length) ? initial.classes.map((c, i) => {
      const baseClass = base.classes[i % base.classes.length];
      return {
        classId: c.classId || c.id || ('CLS0' + (i + 1)),
        id: c.classId || c.id || ('CLS0' + (i + 1)),
        subjectId: c.subjectId || baseClass.subjectId,
        roomId: c.roomId || baseClass.roomId,
        coachId: c.coachId || baseClass.coachId,
        scheduleTime: c.scheduleTime || baseClass.scheduleTime,
        maxCapacity: c.maxCapacity || baseClass.maxCapacity,
        status: c.status || 'ACTIVE'
      };
    }) : base.classes,
    classPlans: (initial.classPlans && initial.classPlans.length) ? initial.classPlans : base.classPlans,
    classEnrollments: (initial.classEnrollments && initial.classEnrollments.length) ? initial.classEnrollments : base.classEnrollments,
    classAttendances: (initial.classAttendances && initial.classAttendances.length) ? initial.classAttendances : base.classAttendances,
    workoutResults: (initial.workoutResults && initial.workoutResults.length) ? initial.workoutResults : base.workoutResults,
    checkinLogs: (initial.checkinLogs && initial.checkinLogs.length) ? initial.checkinLogs : base.checkinLogs,
    checkInLogs: (initial.checkinLogs && initial.checkinLogs.length) ? initial.checkinLogs : base.checkinLogs,
    invoices: (initial.invoices && initial.invoices.length) ? initial.invoices : (initial.recentInvoices || base.invoices)
  };
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof getDataSource !== 'undefined') _targetGlobal.getDataSource = getDataSource;
  if (typeof DEFAULT_DATA !== 'undefined') _targetGlobal.DEFAULT_DATA = DEFAULT_DATA;
}
