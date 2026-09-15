/**
 * Mock Data for Sports Center Management System (SWP391 - FA26 Topic 4)
 * Focus: 3 MUST-HAVE FLOWS
 * 1. User & Membership Management
 * 2. Class Booking & Schedule Management
 * 3. Payment & Financial Report Management
 */

const INITIAL_DATA = {
  demoAccounts: [
    {
      role: 'MANAGER',
      roleLabel: 'Center Manager (Quản lý / Admin)',
      email: 'manager@sportscenter.vn',
      password: '123',
      name: 'Nguyễn Văn Quản Lý',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      desc: 'Toàn quyền quản trị nhân sự, gói tập, lớp học và báo cáo tài chính'
    },
    {
      role: 'RECEPTIONIST',
      roleLabel: 'Receptionist (Nhân viên Lễ tân)',
      email: 'letan@sportscenter.vn',
      password: '123',
      name: 'Lê Ngọc Lễ Tân',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      desc: 'Tiếp đón khách, check-in, đăng ký hội viên, bán gói tập & xuất hóa đơn tại quầy'
    },
    {
      role: 'COACH',
      roleLabel: 'Coach (Huấn luyện viên)',
      email: 'coach.nam@sportscenter.vn',
      password: '123',
      name: 'Trần Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      desc: 'Quản lý lịch dạy lớp học và danh sách học viên đăng ký'
    },
    {
      role: 'MEMBER',
      roleLabel: 'Member (Học viên / Khách hàng)',
      email: 'trang.pham@gmail.com',
      password: '123',
      name: 'Phạm Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      desc: 'Mua gói tập, đặt chỗ lớp học trực tuyến và xem lịch cá nhân'
    }
  ],

  packages: [
    {
      id: 'PKG01',
      name: 'Standard Gym & Cardio',
      durationDays: 30,
      price: 650000,
      description: 'Truy cập không giới hạn khu vực Gym & Cardio từ 6h00 đến 22h00 hàng ngày.',
      features: ['Tập luyện tự do toàn bộ máy Gym', 'Miễn phí tủ đồ & phòng tắm nóng lạnh', 'Đo chỉ số InBody miễn phí 1 lần/tháng', 'Nước uống lọc miễn phí'],
      popular: false,
      color: 'blue'
    },
    {
      id: 'PKG02',
      name: 'VIP All-Access Pass',
      durationDays: 90,
      price: 2450000,
      description: 'Gói toàn diện tập luyện Gym + tất cả lớp Yoga, Zumba, Boxing và dịch vụ xông hơi Sauna.',
      features: ['Không giới hạn Gym + Yoga + Boxing + Zumba', 'Miễn phí phòng xông hơi khô & ướt (Sauna)', 'Khăn tập & tủ đồ VIP riêng', 'Tặng 2 buổi kèm 1-1 cùng Huấn luyện viên'],
      popular: true,
      color: 'amber'
    },
    {
      id: 'PKG03',
      name: 'Yoga & Pilates Master',
      durationDays: 30,
      price: 1200000,
      description: 'Dành riêng cho tín đồ Yoga, Thiền định và Pilates với giảng viên quốc tế.',
      features: ['Tham gia tối đa 20 lớp Yoga & Pilates/tháng', 'Thảm tập cao cấp được khử trùng sẵn', 'Trà thảo mộc thanh lọc cơ thể sau mỗi buổi', 'Ưu tiên đặt chỗ lớp sớm'],
      popular: false,
      color: 'emerald'
    },
    {
      id: 'PKG04',
      name: 'Personal Training (PT 1-1) 12 Buổi',
      durationDays: 45,
      price: 4800000,
      description: 'Kèm riêng 1-1 cùng HLV chuyên nghiệp, thiết kế thực đơn và giáo án riêng biệt.',
      features: ['12 buổi kèm 1-1 (60 phút/buổi)', 'Lên giáo án dinh dưỡng & bài tập chi tiết', 'Đo InBody và theo dõi chỉ số hàng tuần', 'Cam kết đạt mục tiêu thể hình'],
      popular: false,
      color: 'rose'
    }
  ],

  sports: [
    { id: 'SP01', name: 'Fitness & Gym', icon: 'dumbbell' },
    { id: 'SP02', name: 'Yoga & Meditation', icon: 'flower-2' },
    { id: 'SP03', name: 'Boxing & Muay Thai', icon: 'swords' },
    { id: 'SP04', name: 'Zumba & Dance Fit', icon: 'music' },
    { id: 'SP05', name: 'Pilates Reformer', icon: 'activity' }
  ],

  rooms: [
    { id: 'RM01', name: 'Studio A (Yoga & Pilates)', capacity: 20, location: 'Tầng 2' },
    { id: 'RM02', name: 'Studio B (Boxing & Combat)', capacity: 16, location: 'Tầng 2' },
    { id: 'RM03', name: 'Main Gym Floor', capacity: 60, location: 'Tầng 1' },
    { id: 'RM04', name: 'Dance & GroupX Room', capacity: 25, location: 'Tầng 3' }
  ],

  coaches: [
    {
      id: 'COA01',
      name: 'Trần Hoàng Nam',
      email: 'coach.nam@sportscenter.vn',
      phone: '0988776655',
      specialty: 'Fitness & Boxing',
      rating: 4.9,
      experience: '6 năm kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'COA02',
      name: 'Lê Thu Hà',
      email: 'ha.le@sportscenter.vn',
      phone: '0912334455',
      specialty: 'Yoga Master & Meditation',
      rating: 5.0,
      experience: '8 năm kinh nghiệm quốc tế',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'COA03',
      name: 'Đặng Minh Đức',
      email: 'duc.dang@sportscenter.vn',
      phone: '0933445566',
      specialty: 'Pilates & Body Recomposition',
      rating: 4.8,
      experience: '5 năm kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],

  classes: [
    {
      id: 'CLS01',
      name: 'Vinyasa Flow Yoga',
      sportId: 'SP02',
      sportName: 'Yoga & Meditation',
      coachId: 'COA02',
      coachName: 'Lê Thu Hà',
      roomId: 'RM01',
      roomName: 'Studio A (Yoga & Pilates)',
      time: '07:00 - 08:15',
      days: 'Thứ 2, 4, 6',
      maxCapacity: 20,
      bookedCount: 14,
      level: 'Mọi trình độ',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
      description: 'Chuỗi động tác kết hợp nhịp thở giúp giải tỏa căng thẳng và tăng cường độ dẻo dai toàn diện.'
    },
    {
      id: 'CLS02',
      name: 'Muay Thai & Kick Boxing',
      sportId: 'SP03',
      sportName: 'Boxing & Muay Thai',
      coachId: 'COA01',
      coachName: 'Trần Hoàng Nam',
      roomId: 'RM02',
      roomName: 'Studio B (Boxing & Combat)',
      time: '18:00 - 19:15',
      days: 'Thứ 3, 5, 7',
      maxCapacity: 16,
      bookedCount: 15,
      level: 'Trung bình - Nâng cao',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80',
      description: 'Đốt cháy 700+ calo với những đòn đấm, đá, gối chuẩn kỹ thuật Muay Thái.'
    },
    {
      id: 'CLS03',
      name: 'HIIT Fat Burn & Strength',
      sportId: 'SP01',
      sportName: 'Fitness & Gym',
      coachId: 'COA01',
      coachName: 'Trần Hoàng Nam',
      roomId: 'RM03',
      roomName: 'Main Gym Floor',
      time: '19:30 - 20:30',
      days: 'Thứ 2, 4, 6',
      maxCapacity: 25,
      bookedCount: 18,
      level: 'Mọi trình độ',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      description: 'Tập luyện cường độ cao ngắt quãng giúp tăng nhịp tim, đốt mỡ tối đa sau buổi tập.'
    },
    {
      id: 'CLS04',
      name: 'Pilates Core Alignment',
      sportId: 'SP05',
      sportName: 'Pilates Reformer',
      coachId: 'COA03',
      coachName: 'Đặng Minh Đức',
      roomId: 'RM01',
      roomName: 'Studio A (Yoga & Pilates)',
      time: '17:30 - 18:30',
      days: 'Thứ 3, 5, CN',
      maxCapacity: 12,
      bookedCount: 10,
      level: 'Cơ bản - Phục hồi',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      description: 'Tăng cường sức mạnh nhóm cơ lõi (Core), chỉnh dáng thẳng lưng và giảm đau mỏi vai gáy.'
    }
  ],

  members: [
    {
      id: 'MEM101',
      name: 'Phạm Thu Trang',
      email: 'trang.pham@gmail.com',
      phone: '0977112233',
      activePackage: 'VIP All-Access Pass',
      packageId: 'PKG02',
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      gender: 'Nữ',
      dob: '2002-05-14',
      address: 'Quận Cầu Giấy, Hà Nội'
    },
    {
      id: 'MEM102',
      name: 'Nguyễn Tiến Dũng',
      email: 'tiendung@gmail.com',
      phone: '0908889999',
      activePackage: 'Standard Gym & Cardio',
      packageId: 'PKG01',
      startDate: '2026-08-15',
      endDate: '2026-09-15',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      gender: 'Nam',
      dob: '1998-11-20',
      address: 'Quận Nam Từ Liêm, Hà Nội'
    },
    {
      id: 'MEM103',
      name: 'Hoàng Bích Ngọc',
      email: 'ngoc.hoang@yahoo.com',
      phone: '0912445566',
      activePackage: 'Yoga & Pilates Master',
      packageId: 'PKG03',
      startDate: '2026-07-10',
      endDate: '2026-08-10',
      status: 'EXPIRED',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      gender: 'Nữ',
      dob: '2001-08-09',
      address: 'Quận Ba Đình, Hà Nội'
    },
    {
      id: 'MEM104',
      name: 'Vũ Quốc Bảo',
      email: 'bao.vu@fpt.edu.vn',
      phone: '0945678910',
      activePackage: 'Personal Training (PT 1-1) 12 Buổi',
      packageId: 'PKG04',
      startDate: '2026-08-20',
      endDate: '2026-10-05',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      gender: 'Nam',
      dob: '1999-03-25',
      address: 'Quận Đống Đa, Hà Nội'
    }
  ],

  myBookings: [
    {
      id: 'BKG01',
      classId: 'CLS01',
      className: 'Vinyasa Flow Yoga',
      coachName: 'Lê Thu Hà',
      roomName: 'Studio A (Yoga & Pilates)',
      date: 'Thứ 4, 07:00 - 08:15',
      status: 'CONFIRMED'
    },
    {
      id: 'BKG02',
      classId: 'CLS03',
      className: 'HIIT Fat Burn & Strength',
      coachName: 'Trần Hoàng Nam',
      roomName: 'Main Gym Floor',
      date: 'Thứ 6, 19:30 - 20:30',
      status: 'CONFIRMED'
    }
  ],

  recentInvoices: [
    {
      id: 'INV-2026-089',
      memberName: 'Phạm Thu Trang',
      memberId: 'MEM101',
      packageName: 'VIP All-Access Pass (3 Tháng)',
      amount: 2450000,
      method: 'Chuyển khoản QR (PayOS/VNPay)',
      date: '01/08/2026 10:15',
      createdBy: 'Online Banking',
      status: 'PAID'
    },
    {
      id: 'INV-2026-090',
      memberName: 'Nguyễn Tiến Dũng',
      memberId: 'MEM102',
      packageName: 'Standard Gym & Cardio (1 Tháng)',
      amount: 650000,
      method: 'Tiền mặt tại quầy',
      date: '15/08/2026 14:30',
      createdBy: 'Lê Ngọc Lễ Tân',
      status: 'PAID'
    },
    {
      id: 'INV-2026-091',
      memberName: 'Vũ Quốc Bảo',
      memberId: 'MEM104',
      packageName: 'Personal Training (PT 1-1) 12 Buổi',
      amount: 4800000,
      method: 'Thẻ tín dụng / POS',
      date: '20/08/2026 09:00',
      createdBy: 'Lê Ngọc Lễ Tân',
      status: 'PAID'
    }
  ]
};

if (typeof window !== 'undefined') { window.INITIAL_DATA = INITIAL_DATA; }
if (typeof globalThis !== 'undefined') { globalThis.INITIAL_DATA = INITIAL_DATA; }
if (typeof module !== 'undefined' && module.exports) { module.exports = INITIAL_DATA; }
