
// =========================================================================
// ERD RELATIONAL RESOLVERS (Resolves foreign keys strictly per ERD)
// =========================================================================

function resolveMember(m) {
  if (!m) return null;
  const memberId = m.memberId || m.id || 'MEM101';
  const data = (typeof appState !== 'undefined' && appState.data) ? appState.data : (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA : {});
  const subscriptions = data.subscriptions || (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.subscriptions : []) || [];
  const packages = data.packages || (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.packages : []) || [];

  // Link Member with Subscriptions table
  const memberSubs = subscriptions.filter(s => s.memberId === memberId);
  const activeSub = memberSubs.find(s => s.status === 'ACTIVE') || memberSubs[0];

  let pkg = null;
  if (activeSub) {
    pkg = packages.find(p => (p.packageId || p.id) === activeSub.packageId);
  }
  if (!pkg && m.packageId) {
    pkg = packages.find(p => (p.packageId || p.id) === m.packageId);
  }

  const packageName = (pkg ? (pkg.packageName || pkg.name) : null) || m.activePackage || 'Standard Gym & Cardio';
  const startDate = (activeSub ? activeSub.startDate : null) || m.startDate || '2026-08-01';
  const endDate = (activeSub ? activeSub.endDate : null) || m.endDate || '2026-11-01';
  const status = m.status || (activeSub ? activeSub.status : 'ACTIVE');

  let fullName = m.name;
  if (!fullName) {
    if (m.lastName || m.firstName) {
      fullName = `${m.lastName || ''} ${m.firstName || ''}`.trim();
    } else {
      fullName = 'Hội viên';
    }
  }

  const defaultAvatars = {
    MEM101: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    MEM102: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    MEM103: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    MEM104: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  };
  const avatar = m.avatar || defaultAvatars[memberId] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const defaultPhones = {
    MEM101: '0912345678',
    MEM102: '0987654321',
    MEM103: '0905123987',
    MEM104: '0934567890'
  };
  const phone = m.phone || defaultPhones[memberId] || '0912345678';

  const defaultInbody = {
    MEM101: { weight: 52, height: 162, bodyFat: 21.5, muscleMass: 24.2, bmi: 19.8 },
    MEM102: { weight: 72, height: 175, bodyFat: 17.0, muscleMass: 35.8, bmi: 23.5 },
    MEM103: { weight: 49, height: 158, bodyFat: 23.0, muscleMass: 21.0, bmi: 19.6 },
    MEM104: { weight: 78, height: 180, bodyFat: 15.5, muscleMass: 40.2, bmi: 24.1 }
  };
  const inbody = m.inbody || defaultInbody[memberId] || { weight: 60, height: 168, bodyFat: 18.0, muscleMass: 30.0, bmi: 21.0 };

  return {
    ...m,
    id: memberId,
    memberId: memberId,
    name: fullName,
    firstName: m.firstName || fullName.split(' ').slice(-1)[0] || '',
    lastName: m.lastName || fullName.split(' ').slice(0, -1).join(' ') || '',
    email: m.email || `${memberId.toLowerCase()}@sportscenter.vn`,
    phone: phone,
    avatar: avatar,
    activePackage: packageName,
    packageId: activeSub ? activeSub.packageId : (pkg ? (pkg.packageId || pkg.id) : 'PKG01'),
    startDate: startDate,
    endDate: endDate,
    status: status,
    trainingGoal: m.trainingGoal || 'Rèn luyện sức khỏe và thể lực dẻo dai',
    inbody: inbody
  };
}

const SUBJECT_IMAGE_MAP = {
  SUB01: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80', // Yoga
  SUB02: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80', // Boxing
  SUB03: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80', // Zumba
  SUB04: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80'  // Pilates
};

function resolveClass(c) {
  if (!c) return null;
  const classId = c.classId || c.id;
  const data = (typeof appState !== 'undefined' && appState.data) ? appState.data : (typeof DEFAULT_DATA !== 'undefined' ? DEFAULT_DATA : {});
  const subjects = data.subjects || [];
  const rooms = data.rooms || [];
  const coaches = data.coaches || [];
  const classPlans = data.classPlans || [];
  const classEnrollments = data.classEnrollments || [];
  const classAttendances = data.classAttendances || [];
  const workoutResults = data.workoutResults || [];
  const members = data.members || [];

  const sub = subjects.find(s => s.subjectId === c.subjectId || s.id === c.subjectId || s.subjectName === c.category) || {
    subjectId: c.subjectId || 'SUB01',
    subjectName: c.category || 'Thể Thao',
    description: 'Lớp học rèn luyện thể lực và sức khỏe'
  };

  const rm = rooms.find(r => r.roomId === c.roomId || r.id === c.roomId || r.roomName === c.room || r.name === c.room) || {
    roomId: c.roomId || 'RM01',
    roomName: c.room || 'Phòng Studio A',
    capacity: c.maxCapacity || 20
  };

  const co = coaches.find(ch => ch.coachId === c.coachId || ch.id === c.coachId) || {
    coachId: c.coachId || 'COACH',
    name: c.coachName || 'Trần Hoàng Nam',
    specialty: 'Huấn luyện viên chuyên nghiệp'
  };

  const plan = classPlans.find(p => p.classId === classId) || {
    content: sub.description || 'Khởi động (10p) - Bài tập chính (45p) - Phục hồi (15p)'
  };

  const enrollments = classEnrollments.filter(e => e.classId === classId && e.status !== 'CANCELLED');
  const attendees = enrollments.map(enr => {
    const rawMem = members.find(m => (m.memberId || m.id) === enr.memberId);
    const mem = resolveMember(rawMem) || { name: 'Học viên', phone: '0912345678', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' };
    const attRecord = classAttendances.find(a => a.classEnrollmentId === enr.classEnrollmentId || (a.classId === classId && a.memberId === enr.memberId));
    const resRecord = workoutResults.find(w => w.memberId === enr.memberId && w.classId === classId);
    return {
      id: enr.memberId,
      enrollmentId: enr.classEnrollmentId,
      name: mem.name,
      phone: mem.phone,
      avatar: mem.avatar,
      attended: attRecord ? (attRecord.status === 'PRESENT' || attRecord.status === true) : false,
      note: resRecord ? resRecord.coachFeedback : (attRecord?.note || '')
    };
  });

  const scheduleTime = c.scheduleTime || 'Thứ 2, 4, 6 | 07:00 - 08:15';
  const parts = scheduleTime.split('|');
  const daysPart = parts[0] ? parts[0].trim() : 'Thứ 2, 4, 6';
  const timePart = parts[1] ? parts[1].trim() : (c.time || '07:00 - 08:15');

  const image = c.image || SUBJECT_IMAGE_MAP[sub.subjectId] || SUBJECT_IMAGE_MAP.SUB01;

  return {
    // Exact ERD attributes on Classes entity
    classId: classId,
    id: classId,
    subjectId: sub.subjectId,
    roomId: rm.roomId,
    coachId: co.coachId,
    scheduleTime: scheduleTime,
    maxCapacity: c.maxCapacity || 20,
    status: c.status || 'ACTIVE',

    // Relational attributes resolved from foreign keys
    category: sub.subjectName,
    subjectName: sub.subjectName,
    title: `${sub.subjectName} (${timePart})`,
    description: sub.description,
    syllabus: plan.content,
    room: rm.roomName || rm.name,
    roomName: rm.roomName || rm.name,
    coachName: co.name || `${co.firstName || ''} ${co.lastName || ''}`.trim(),
    coachSpecialty: co.specialty,
    days: daysPart,
    time: timePart,
    image: image,
    bookedSeats: enrollments.length,
    bookedCount: enrollments.length,
    attendees: attendees
  };
}

// Attach to global for browser onclick compatibility and test runners
const _targetGlobal = (typeof window !== "undefined") ? window : (typeof globalThis !== "undefined" ? globalThis : null);
if (_targetGlobal) {
  if (typeof resolveMember !== 'undefined') _targetGlobal.resolveMember = resolveMember;
  if (typeof resolveClass !== 'undefined') _targetGlobal.resolveClass = resolveClass;
  if (typeof SUBJECT_IMAGE_MAP !== 'undefined') _targetGlobal.SUBJECT_IMAGE_MAP = SUBJECT_IMAGE_MAP;
}
