// Quiz làm quen cho hội viên mới + gợi ý gói tập / lớp học.
// Bộ câu hỏi và trạng thái "đã làm" lấy từ BE (quizApi); BE bắt buộc làm xong mới tự đặt lớp được.
// Chỉ hỏi các câu BE trả về; lưu bản sao câu trả lời ở localStorage để hiện lại phần gợi ý (BE không trả lại câu trả lời cũ).

const KEY = email => `sc_quiz_${(email || '').toLowerCase()}`;
const PENDING = email => `sc_quiz_pending_${(email || '').toLowerCase()}`;

const read = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* private mode: bỏ qua */ }
};

export const quizStore = {
  // { answers, completedAt } hoặc { skippedAt }
  get: email => read(KEY(email)),
  save: (email, answers) => { write(KEY(email), { answers, completedAt: new Date().toISOString() }); write(PENDING(email), null); },
  skip: email => { write(KEY(email), { ...(read(KEY(email)) || {}), skippedAt: new Date().toISOString() }); write(PENDING(email), null); },
  // đánh dấu ngay khi đăng ký xong để lần đăng nhập đầu luôn mở quiz
  markPending: email => write(PENDING(email), true),
  answers: email => read(KEY(email))?.answers || null
};

// Mở quiz sau đăng nhập khi BE báo chưa làm, trừ khi hội viên đã bấm "Bỏ qua" (vừa đăng ký thì luôn mở).
// completed = null (không hỏi được BE): chỉ mở khi vừa đăng ký hoặc chưa từng làm / bỏ qua trên máy này.
export function shouldAskQuiz(email, completed) {
  if (completed === true) return false;
  if (read(PENDING(email))) return true;
  const rec = read(KEY(email));
  return completed === false ? !rec?.skippedAt : !rec;
}

// ===== Bộ câu hỏi từ BE -> các bước của quiz =====
// Câu hệ thống: HEIGHT + WEIGHT gộp 1 bước (kèm BMI), TRAINING_GOAL là câu chọn 1 có mã trùng id trong GOALS.
// Câu Quản lý tự thêm: mỗi câu 1 bước.
export const QUIZ_CODES = { height: 'HEIGHT', weight: 'WEIGHT', goal: 'TRAINING_GOAL' };
const SYSTEM_CODES = Object.values(QUIZ_CODES);
export const byCode = (questions, code) => (questions || []).find(q => q.code === code) || null;

export function quizSteps(questions) {
  const list = questions || [];
  const steps = [];
  if (byCode(list, QUIZ_CODES.height) || byCode(list, QUIZ_CODES.weight)) steps.push({ kind: 'body', label: 'Chỉ số cơ thể' });
  if (byCode(list, QUIZ_CODES.goal)) steps.push({ kind: 'goal', label: 'Mục tiêu', question: byCode(list, QUIZ_CODES.goal) });
  list.filter(q => !SYSTEM_CODES.includes(q.code)).forEach(q => steps.push({ kind: 'custom', label: 'Thêm về bạn', question: q }));
  return steps;
}

// option của câu mục tiêu ứng với 1 mục trong GOALS (so mã, không có mã thì so nội dung)
export const goalOption = (question, goalId) => (question?.options || []).find(o =>
  (o.code || '').toLowerCase() === goalId || o.content === find(GOALS, goalId)?.label) || null;
export const goalIdOf = option => [...GOALS, OTHER_GOAL].find(g => g.id === (option?.code || '').toLowerCase() || g.label === option?.content)?.id || null;

// Tên mục tiêu để hiển thị: chọn "Khác" thì là chữ hội viên tự nhập
export const goalLabel = a => (a?.goal === OTHER_GOAL.id ? String(a.goalText || '').trim() : find(GOALS, a?.goal)?.label) || '';

// Mục tiêu đã lưu trong hồ sơ -> { goal, goalText }: khớp nhãn gợi ý thì lấy id, còn lại là "Khác" + chữ tự nhập
export function goalFromProfile(text) {
  const t = String(text || '').trim();
  if (!t || t === 'Chưa cập nhật') return { goal: undefined, goalText: '' };
  const g = GOALS.find(x => x.label === t);
  return g ? { goal: g.id, goalText: '' } : { goal: OTHER_GOAL.id, goalText: t };
}

// câu trả lời câu tự thêm nằm ở answers.extra[questionId]: chuỗi số / chuỗi văn bản / mảng optionId
export function validateStep(step, a, questions) {
  if (step.kind === 'body') {
    const errors = {};
    [['height', QUIZ_CODES.height, 'chiều cao'], ['weight', QUIZ_CODES.weight, 'cân nặng']].forEach(([key, code, label]) => {
      const q = byCode(questions, code);
      if (!q) return;
      const v = Number(a[key]);
      if (a[key] === undefined || a[key] === '') errors[key] = `Nhập ${label}`;
      else if (!Number.isFinite(v) || (q.minValue != null && v < q.minValue) || (q.maxValue != null && v > q.maxValue)) {
        errors[key] = `${label[0].toUpperCase()}${label.slice(1)} từ ${q.minValue ?? '…'} đến ${q.maxValue ?? '…'} ${q.unit || ''}`.trim();
      }
    });
    return errors;
  }
  if (step.kind === 'goal') return validateAnswers(a, 2);
  const q = step.question;
  const v = a.extra?.[q.questionId];
  if (q.type === 'NUMBER') {
    if (v === undefined || v === '') return { extra: 'Nhập một con số' };
    const n = Number(v);
    if (!Number.isFinite(n) || (q.minValue != null && n < q.minValue) || (q.maxValue != null && n > q.maxValue)) {
      return { extra: `Nhập số từ ${q.minValue ?? '…'} đến ${q.maxValue ?? '…'}${q.unit ? ` ${q.unit}` : ''}` };
    }
    return {};
  }
  if (q.type === 'TEXT') return String(v || '').trim() ? (String(v).trim().length > 1000 ? { extra: 'Tối đa 1000 ký tự' } : {}) : { extra: 'Vui lòng trả lời câu này' };
  return Array.isArray(v) && v.length ? {} : { extra: q.type === 'MULTIPLE' ? 'Chọn ít nhất một lựa chọn' : 'Chọn một lựa chọn' };
}

// body cho PUT /members/me/quiz: đủ mọi câu BE đang ACTIVE
export function quizPayload(questions, a) {
  return (questions || []).map(q => {
    if (q.code === QUIZ_CODES.height) return { questionId: q.questionId, numberValue: Number(a.height) };
    if (q.code === QUIZ_CODES.weight) return { questionId: q.questionId, numberValue: Number(a.weight) };
    if (q.code === QUIZ_CODES.goal) return {
      questionId: q.questionId, optionIds: [goalOption(q, a.goal)?.optionId].filter(Boolean),
      ...(a.goal === OTHER_GOAL.id ? { textValue: String(a.goalText || '').trim() } : {})
    };
    const v = a.extra?.[q.questionId];
    if (q.type === 'NUMBER') return { questionId: q.questionId, numberValue: Number(v) };
    if (q.type === 'TEXT') return { questionId: q.questionId, textValue: String(v || '').trim() };
    return { questionId: q.questionId, optionIds: (v || []).map(Number) };
  });
}

export const GOALS = [
  { id: 'lose', label: 'Giảm cân, giảm mỡ', icon: 'flame', hint: 'Đốt calo, cải thiện vóc dáng', keywords: ['gym', 'thể hình', 'boxing', 'cardio', 'aerobic', 'zumba', 'hiit', 'bơi'] },
  { id: 'gain', label: 'Tăng cơ, tăng sức mạnh', icon: 'dumbbell', hint: 'Tập tạ, xây dựng cơ bắp', keywords: ['gym', 'thể hình', 'boxing', 'crossfit'] },
  { id: 'flex', label: 'Dẻo dai, cải thiện tư thế', icon: 'person-standing', hint: 'Giãn cơ, giảm đau mỏi lưng vai', keywords: ['yoga', 'pilates', 'stretch', 'giãn cơ'] },
  { id: 'relax', label: 'Giảm căng thẳng', icon: 'leaf', hint: 'Thư giãn, ngủ ngon hơn', keywords: ['yoga', 'thiền', 'pilates', 'bơi'] },
  { id: 'health', label: 'Duy trì sức khỏe', icon: 'heart-pulse', hint: 'Vận động đều đặn mỗi tuần', keywords: [] }
];
// Nhãn GOALS phải khớp option câu TRAINING_GOAL ở BE (DataInitializer). "Khác" (mã OTHER) để hội viên tự nhập.
export const OTHER_GOAL = { id: 'other', label: 'Khác', icon: 'pencil', hint: 'Tự nhập mục tiêu của bạn', keywords: [] };
export const GOAL_TEXT_MAX = 100;

// Lỗi của ô tự nhập khi chọn "Khác" (dùng chung cho quiz, hồ sơ, lễ tân)
export function goalTextError(goal, text) {
  if (goal !== OTHER_GOAL.id) return null;
  const t = String(text || '').trim();
  if (!t) return 'Nhập mục tiêu của bạn';
  return t.length > GOAL_TEXT_MAX ? `Tối đa ${GOAL_TEXT_MAX} ký tự` : null;
}

export const find = (list, id) => list.find(x => x.id === id);

// Ngưỡng BMI cho người châu Á (WHO khu vực Tây Thái Bình Dương)
export function bmiInfo(heightCm, weightKg) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!h || !w) return null;
  const value = Math.round((w / (h * h)) * 10) / 10;
  if (value < 18.5) return { value, label: 'Thiếu cân', tone: 'sky' };
  if (value < 23) return { value, label: 'Cân đối', tone: 'emerald' };
  if (value < 25) return { value, label: 'Thừa cân nhẹ', tone: 'amber' };
  return { value, label: 'Thừa cân', tone: 'rose' };
}

export function validateAnswers(a, step) {
  const errors = {};
  if (step === 1) {
    const h = Number(a.height);
    const w = Number(a.weight);
    if (!a.height) errors.height = 'Nhập chiều cao';
    else if (!(h >= 120 && h <= 230)) errors.height = 'Chiều cao từ 120 đến 230 cm';
    if (!a.weight) errors.weight = 'Nhập cân nặng';
    else if (!(w >= 30 && w <= 250)) errors.weight = 'Cân nặng từ 30 đến 250 kg';
  }
  if (step === 2 && !a.goal) errors.goal = 'Chọn một mục tiêu';
  if (step === 2 && goalTextError(a.goal, a.goalText)) errors.goalText = goalTextError(a.goal, a.goalText);
  return errors;
}

// Gợi ý gói Membership: chỉ dựa trên dữ liệu BE (giá, thời hạn) -> gói có chi phí mỗi ngày thấp nhất, rồi đến gói ngắn hơn
export function recommendPackage(answers, packages) {
  const plans = (packages || []).filter(p => p.status === 'ACTIVE' && p.durationDays > 0 && p.packageType !== 'CLASS');
  if (!answers || !plans.length) return null;
  const perDay = p => p.price / p.durationDays;
  const ranked = [...plans].sort((a, b) => perDay(a) - perDay(b) || a.durationDays - b.durationDays);
  const best = ranked[0];
  const reasons = [
    `Chi phí thấp nhất trong các gói đang bán: khoảng ${Math.round(perDay(best) / 1000)}k mỗi ngày, dùng trong ${best.durationDays} ngày.`,
    'Gói kích hoạt khi bạn check-in hoặc đăng ký lớp lần đầu, chậm nhất 14 ngày sau khi thanh toán.',
    'Có Membership mới mua được các gói lớp theo môn.'
  ];
  return { best, others: ranked.slice(1), reasons };
}

// Bộ môn hợp mục tiêu (so tên môn với từ khóa); mục tiêu "duy trì sức khỏe" hợp với mọi môn
export function matchSubjects(answers, subjects) {
  const goal = find(GOALS, answers?.goal);
  const active = (subjects || []).filter(s => s.status !== 'INACTIVE');
  if (!goal || !goal.keywords.length) return active;
  const hit = active.filter(s => goal.keywords.some(k => (s.subjectName || '').toLowerCase().includes(k)));
  return hit.length ? hit : active;
}

// Lớp sắp tới: môn hợp mục tiêu xếp trước, rồi đến các lớp khác; trong mỗi nhóm lớp gần nhất trước
export function recommendClasses(answers, classes, subjects, limit = 6) {
  const subjectIds = new Set(matchSubjects(answers, subjects).map(s => s.subjectId));
  const future = (classes || []).filter(c => new Date(c.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const matched = future.filter(c => subjectIds.has(c.subjectId));
  const list = [...matched, ...future.filter(c => !subjectIds.has(c.subjectId))].slice(0, limit);
  return { list, exact: matched.length };
}

export function bmiAdvice(bmi, goal) {
  if (!bmi) return '';
  if (bmi.value < 18.5 && goal === 'lose') return 'BMI của bạn đang thấp, nên ưu tiên tăng cơ và ăn đủ chất thay vì giảm cân.';
  if (bmi.value < 18.5) return 'Kết hợp tập sức mạnh với chế độ ăn đủ đạm để tăng cân lành mạnh.';
  if (bmi.value >= 25 && goal !== 'lose') return 'BMI hơi cao: nên thêm 1–2 buổi cardio mỗi tuần bên cạnh mục tiêu chính.';
  if (bmi.value >= 23) return 'Kết hợp cardio và tập sức mạnh sẽ giúp bạn về mức cân đối nhanh hơn.';
  return 'Chỉ số đang cân đối, hãy duy trì tập đều đặn để giữ phong độ.';
}

// ===== Combo bộ môn cá nhân hóa =====
// BE không có gói combo: combo chỉ là gợi ý ghép môn, mỗi môn mua 1 gói lớp thật (giá lấy từ BE).
// Nhóm môn chỉ dùng để chọn môn hợp mục tiêu và ghi nhãn.
export const SUBJECT_CATEGORIES = {
  strength: { label: 'Sức mạnh', keywords: ['gym', 'thể hình', 'crossfit', 'tạ'] },
  cardio: { label: 'Đốt mỡ', keywords: ['boxing', 'zumba', 'aerobic', 'hiit', 'bơi', 'cardio', 'kickfit'] },
  mind: { label: 'Dẻo dai', keywords: ['yoga', 'pilates', 'thiền', 'stretch'] },
  other: { label: 'Kỹ năng', keywords: [] }
};

// trọng số mỗi nhóm môn theo mục tiêu
const GOAL_WEIGHT = {
  lose: { cardio: 3, strength: 2, mind: 1, other: 1 },
  gain: { strength: 3, cardio: 2, mind: 1, other: 1 },
  flex: { mind: 3, strength: 1.5, cardio: 1, other: 1 },
  relax: { mind: 3, cardio: 1.5, strength: 0.5, other: 1 },
  health: { strength: 2, mind: 2, cardio: 2, other: 1.5 }
};
const ROLE_TEXT = {
  strength: 'xây cơ, tăng trao đổi chất',
  cardio: 'đốt mỡ, tăng sức bền tim mạch',
  mind: 'giãn cơ, phục hồi và giảm chấn thương',
  other: 'đổi gió, tạo hứng thú tập luyện'
};
// mã thứ BE dùng trong daysOfWeek ("MON,WED,FRI"), theo thứ tự T2 -> CN
export const DAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function subjectCategory(subject) {
  const name = (subject?.subjectName || '').toLowerCase();
  const hit = Object.entries(SUBJECT_CATEGORIES).find(([, c]) => c.keywords.some(k => name.includes(k)));
  return hit ? hit[0] : 'other';
}

// Gói lớp đang bán của 1 môn: ưu tiên thời hạn gần 30 ngày nhất, cùng thời hạn thì rẻ hơn
export function classPackageFor(subject, packages) {
  const list = (packages || []).filter(p => p.packageType === 'CLASS' && p.status === 'ACTIVE'
    && (p.subject?.subjectId ?? p.subjectId) === subject.subjectId);
  return list.sort((a, b) => Math.abs(a.durationDays - 30) - Math.abs(b.durationDays - 30) || a.price - b.price)[0] || null;
}

// ===== Lớp thật cho từng môn trong combo =====
// Lớp có lịch cố định (daysOfWeek + giờ + ngày bắt đầu/kết thúc). BE chỉ cho đăng ký lớp cùng môn
// và cùng thời hạn với gói lớp (durationDays), lớp chưa bắt đầu và còn chỗ.
export const classDays = c => (c.daysOfWeek
  ? String(c.daysOfWeek).split(',').map(d => d.trim().slice(0, 3).toUpperCase())
  : [DAY_CODES[(new Date(c.startTime).getDay() + 6) % 7]]);
const minutes = t => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + m; };
const clockOf = d => { const x = new Date(d); return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`; };
const classSpan = c => ({
  from: minutes(c.startClock || clockOf(c.startTime)),
  to: minutes(c.endClock || clockOf(c.endTime)),
  start: new Date(c.startDate || c.startTime),
  end: new Date(c.endDate ? `${c.endDate}T23:59:59` : c.endTime)
});

// 2 lớp trùng lịch: có chung thứ học, giờ giao nhau và khoảng ngày giao nhau
export function classesClash(a, b) {
  const da = classDays(a);
  if (!classDays(b).some(d => da.includes(d))) return false;
  const x = classSpan(a);
  const y = classSpan(b);
  return x.from < y.to && y.from < x.to && x.start <= y.end && y.start <= x.end;
}

export function joinableClasses(pkg, classes) {
  const now = new Date();
  return (classes || [])
    .filter(c => c.subjectId === (pkg.subject?.subjectId ?? pkg.subjectId) && c.status === 'OPENING'
      && (c.availableSeats ?? 1) > 0 && new Date(c.firstSessionAt || c.startTime) > now
      && (c.durationDays == null || c.durationDays === pkg.durationDays))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

// mỗi môn chọn lớp sớm nhất không trùng lịch với lớp đã chọn của môn trước
function pickClasses(items) {
  const picked = [];
  return items.map(it => {
    const free = it.classes.find(c => picked.every(p => !classesClash(p, c)));
    const cls = free || it.classes[0] || null;
    if (cls) picked.push(cls);
    return { ...it, cls, clash: Boolean(cls && !free) };
  });
}

// Trả về tối đa 3 combo, combo đầu là phù hợp nhất. Chỉ ghép môn đang có gói lớp bán.
export function buildCombos(answers, subjects, classes, packages) {
  const pkgOf = new Map((subjects || []).map(s => [s.subjectId, classPackageFor(s, packages)]));
  const list = (subjects || []).filter(s => s.status !== 'INACTIVE' && pkgOf.get(s.subjectId));
  if (!answers || list.length < 2) return [];
  const weight = { ...(GOAL_WEIGHT[answers.goal] || GOAL_WEIGHT.health) };
  const bmi = bmiInfo(answers.height, answers.weight);
  if (bmi?.value >= 25) weight.cardio += 1;
  if (bmi?.value < 18.5) weight.strength += 1;
  const w = s => weight[subjectCategory(s)] ?? 1;
  const groups = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) groups.push([list[i], list[j]]);
  }
  const classesOf = new Map(list.map(s => [s.subjectId, joinableClasses(pkgOf.get(s.subjectId), classes)]));
  const scored = groups.map(g => {
    const cats = new Set(g.map(subjectCategory));
    // ưu tiên môn hợp mục tiêu + các môn khác nhóm (vd sức mạnh + dẻo dai) + môn đang có lớp mở để đăng ký ngay
    const withClass = g.filter(s => classesOf.get(s.subjectId).length).length;
    const score = g.reduce((t, s) => t + w(s), 0) / g.length + (cats.size - 1) * 0.9 + withClass * 0.6;
    return { g, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ g }, idx) => {
    const ordered = [...g].sort((a, b) => w(b) - w(a));
    const items = pickClasses(ordered.map(s => ({ subject: s, pkg: pkgOf.get(s.subjectId), classes: classesOf.get(s.subjectId) })));
    const withCls = items.filter(x => x.cls);
    // lịch tuần ghép từ các lớp đã chọn: mỗi thứ học môn nào
    const week = DAY_CODES
      .map(code => ({ code, subjects: withCls.filter(x => classDays(x.cls).includes(code)).map(x => x.subject.subjectName) }))
      .filter(d => d.subjects.length);
    const sessionsPerWeek = withCls.reduce((n, x) => n + classDays(x.cls).length, 0);
    const reasons = ordered.map(s => `${s.subjectName}: ${ROLE_TEXT[subjectCategory(s)]}.`);
    if (withCls.length === items.length) {
      reasons.push(items.some(x => x.clash)
        ? 'Các lớp đang mở của 2 môn trùng giờ nhau, nên chọn lớp khác khi đăng ký.'
        : `Lịch theo lớp đang mở: ${sessionsPerWeek} buổi/tuần, các lớp không trùng giờ.`);
    }
    items.filter(x => !x.cls).forEach(x => reasons.push(`${x.subject.subjectName} chưa có lớp ${x.pkg.durationDays} ngày đang mở, mua gói rồi đăng ký khi có lớp mới.`));
    return {
      id: ordered.map(s => s.subjectId).join('-'),
      name: ordered.map(s => s.subjectName).join(' + '),
      subjects: ordered,
      items, // [{ subject, pkg, classes, cls, clash }] gói lớp thật + lớp gợi ý của từng môn
      price: items.reduce((sum, x) => sum + x.pkg.price, 0), // tổng nếu mua đủ các gói lớp
      sessionsPerWeek, // 0 khi chưa môn nào có lớp mở
      week,
      reasons,
      best: idx === 0
    };
  });
}
