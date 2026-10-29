// Quiz làm quen cho hội viên mới + gợi ý gói tập / lớp học.
// Bộ câu hỏi và trạng thái "đã làm" lấy từ BE (quizApi); BE bắt buộc làm xong mới tự đặt lớp được.
// Khung giờ rảnh, số buổi / tuần, thời gian gắn bó chỉ dùng để gợi ý ở FE (BE không có) nên vẫn lưu localStorage
// cùng bản sao câu trả lời (BE không trả lại câu trả lời cũ).

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
  answers: email => read(KEY(email))?.answers || null,
  // combo hội viên đã chọn (chờ BE có API đăng ký combo)
  chooseCombo: (email, combo) => write(KEY(email), { ...(read(KEY(email)) || {}), combo: { id: combo.id, name: combo.name, price: combo.price, chosenAt: new Date().toISOString() } }),
  combo: email => read(KEY(email))?.combo || null
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
// Câu Quản lý tự thêm: mỗi câu 1 bước. Cuối cùng là 2 bước sở thích chỉ dùng ở FE.
export const QUIZ_CODES = { height: 'HEIGHT', weight: 'WEIGHT', goal: 'TRAINING_GOAL' };
const SYSTEM_CODES = Object.values(QUIZ_CODES);
export const byCode = (questions, code) => (questions || []).find(q => q.code === code) || null;

export function quizSteps(questions) {
  const list = questions || [];
  const steps = [];
  if (byCode(list, QUIZ_CODES.height) || byCode(list, QUIZ_CODES.weight)) steps.push({ kind: 'body', label: 'Chỉ số cơ thể' });
  if (byCode(list, QUIZ_CODES.goal)) steps.push({ kind: 'goal', label: 'Mục tiêu', question: byCode(list, QUIZ_CODES.goal) });
  list.filter(q => !SYSTEM_CODES.includes(q.code)).forEach(q => steps.push({ kind: 'custom', label: 'Thêm về bạn', question: q }));
  steps.push({ kind: 'slots', label: 'Khung giờ' }, { kind: 'commitment', label: 'Thời gian gắn bó' });
  return steps;
}

// option của câu mục tiêu ứng với 1 mục trong GOALS (so mã, không có mã thì so nội dung)
export const goalOption = (question, goalId) => (question?.options || []).find(o =>
  (o.code || '').toLowerCase() === goalId || o.content === find(GOALS, goalId)?.label) || null;
export const goalIdOf = option => GOALS.find(g => g.id === (option?.code || '').toLowerCase() || g.label === option?.content)?.id || null;

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
  if (step.kind === 'slots') return validateAnswers(a, 3);
  if (step.kind === 'commitment') return validateAnswers(a, 4);
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
    if (q.code === QUIZ_CODES.goal) return { questionId: q.questionId, optionIds: [goalOption(q, a.goal)?.optionId].filter(Boolean) };
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

export const SLOTS = [
  { id: 'early', label: 'Sáng sớm', range: '05:00 – 08:00', from: 5, to: 8, icon: 'sunrise' },
  { id: 'morning', label: 'Buổi sáng', range: '08:00 – 11:00', from: 8, to: 11, icon: 'sun' },
  { id: 'noon', label: 'Buổi trưa', range: '11:00 – 14:00', from: 11, to: 14, icon: 'coffee' },
  { id: 'afternoon', label: 'Buổi chiều', range: '14:00 – 17:00', from: 14, to: 17, icon: 'cloud-sun' },
  { id: 'evening', label: 'Buổi tối', range: '17:00 – 22:00', from: 17, to: 22, icon: 'moon' }
];

export const FREQUENCIES = [
  { id: 'low', label: '1 – 2 buổi / tuần' },
  { id: 'mid', label: '3 – 4 buổi / tuần' },
  { id: 'high', label: '5 buổi trở lên' }
];

export const COMMITMENTS = [
  { id: 'try', label: 'Tập thử trước', hint: 'Muốn trải nghiệm vài ngày rồi mới quyết định', icon: 'sparkles' },
  { id: 'month', label: 'Khoảng 1 tháng', hint: 'Tập một đợt ngắn để tạo thói quen', icon: 'calendar-days' },
  { id: 'long', label: 'Lâu dài', hint: 'Tập đều đặn nhiều tháng, ưu tiên tiết kiệm', icon: 'trophy' }
];

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
  if (step === 3) {
    if (!a.slots?.length) errors.slots = 'Chọn ít nhất một khung giờ';
    if (!a.frequency) errors.frequency = 'Chọn số buổi mỗi tuần';
  }
  if (step === 4 && !a.commitment) errors.commitment = 'Chọn thời gian bạn muốn gắn bó';
  return errors;
}

// Chấm điểm gói theo mức cam kết + tần suất tập; trả về gói gợi ý, các gói còn lại và lý do
export function recommendPackage(answers, packages) {
  const plans = (packages || []).filter(p => p.status === 'ACTIVE' && p.durationDays > 0);
  if (!answers || !plans.length) return null;
  const durations = plans.map(p => p.durationDays);
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const target = { try: min, month: 30, long: max }[answers.commitment] ?? 30;
  const perDay = p => p.price / p.durationDays;
  const cheapest = Math.min(...plans.map(perDay));
  const score = p => {
    let s = -Math.abs(p.durationDays - target) / Math.max(1, max - min || target);
    // tập nhiều buổi / lâu dài -> ưu tiên giá mỗi ngày rẻ
    if (answers.frequency === 'high' || answers.commitment === 'long') s += (cheapest / perDay(p)) * 0.3;
    return s;
  };
  const ranked = [...plans].sort((a, b) => score(b) - score(a) || perDay(a) - perDay(b));
  const best = ranked[0];
  const reasons = [];
  const commit = find(COMMITMENTS, answers.commitment);
  if (answers.commitment === 'try') reasons.push(`Bạn muốn tập thử trước: ${best.durationDays} ngày là đủ để làm quen lớp và huấn luyện viên.`);
  else if (answers.commitment === 'long') reasons.push(`Bạn muốn tập lâu dài: gói ${best.durationDays} ngày có chi phí mỗi ngày tốt nhất trong các lựa chọn phù hợp.`);
  else reasons.push(`Thời hạn ${best.durationDays} ngày khớp với mục tiêu "${commit?.label.toLowerCase()}" của bạn.`);
  const freq = find(FREQUENCIES, answers.frequency);
  if (freq) {
    const sessions = { low: 1.5, mid: 3.5, high: 5 }[answers.frequency];
    const total = Math.max(1, Math.round((best.durationDays / 7) * sessions));
    reasons.push(`Với ${freq.label.toLowerCase()}, bạn tập khoảng ${total} buổi trong thời hạn gói — chỉ ${Math.round(best.price / total / 1000)}k mỗi buổi.`);
  }
  reasons.push('Đặt lớp không giới hạn trong thời hạn gói, gói kích hoạt ngay sau khi thanh toán.');
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

export const inSlots = (answers, startTime) => {
  const hour = new Date(startTime).getHours();
  return (answers?.slots || []).some(id => {
    const s = find(SLOTS, id);
    return s && hour >= s.from && hour < s.to;
  });
};

// Lớp sắp tới hợp cả bộ môn lẫn khung giờ; thiếu thì nới dần điều kiện để luôn có gợi ý
export function recommendClasses(answers, classes, subjects, limit = 6) {
  const subjectIds = new Set(matchSubjects(answers, subjects).map(s => s.subjectId));
  const future = (classes || []).filter(c => new Date(c.startTime) > new Date());
  const bySubject = c => subjectIds.has(c.subjectId);
  const bySlot = c => inSlots(answers, c.startTime);
  const tiers = [future.filter(c => bySubject(c) && bySlot(c)), future.filter(bySlot), future.filter(bySubject)];
  const picked = [];
  for (const tier of tiers) {
    for (const c of tier) if (picked.length < limit && !picked.includes(c)) picked.push(c);
    if (picked.length >= limit) break;
  }
  return { list: picked, exact: tiers[0].length };
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
// BE chưa có gói combo: bảng giá dưới đây là giá tạm ở FE (giá/tháng của 1 môn ở mức 3–4 buổi/tuần).
// Khi BE có API combo, thay COMBO_PRICING/buildCombos bằng dữ liệu từ BE.
export const COMBO_PRICING = {
  category: {
    strength: { label: 'Sức mạnh', price: 300000, keywords: ['gym', 'thể hình', 'crossfit', 'tạ'] },
    cardio: { label: 'Đốt mỡ', price: 320000, keywords: ['boxing', 'zumba', 'aerobic', 'hiit', 'bơi', 'cardio', 'kickfit'] },
    mind: { label: 'Dẻo dai', price: 290000, keywords: ['yoga', 'pilates', 'thiền', 'stretch'] },
    other: { label: 'Kỹ năng', price: 300000, keywords: [] }
  },
  frequencyFactor: { low: 0.8, mid: 1, high: 1.2 },
  discount: { 2: 0.83, 3: 0.75 } // giảm khi ghép 2 / 3 môn
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
const SESSIONS = { low: 2, mid: 4, high: 6 };
const DAYS = { 2: ['Thứ 3', 'Thứ 6'], 4: ['Thứ 2', 'Thứ 4', 'Thứ 6', 'Chủ nhật'], 6: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'] };
const DAY_INDEX = { 'Chủ nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6 };

export function subjectCategory(subject) {
  const name = (subject?.subjectName || '').toLowerCase();
  const hit = Object.entries(COMBO_PRICING.category).find(([, c]) => c.keywords.some(k => name.includes(k)));
  return hit ? hit[0] : 'other';
}

const roundPrice = v => Math.round(v / 10000) * 10000;

function priceCombo(subjects, frequency) {
  const factor = COMBO_PRICING.frequencyFactor[frequency] ?? 1;
  const retail = roundPrice(subjects.reduce((sum, s) => sum + COMBO_PRICING.category[subjectCategory(s)].price, 0) * factor);
  const price = roundPrice(retail * (COMBO_PRICING.discount[subjects.length] ?? 1));
  return { retail, price, saving: retail - price, savingPct: Math.round(((retail - price) / retail) * 100) };
}

// Lịch tuần xen kẽ các môn; gắn lớp thật (nếu có) cùng môn, cùng thứ, trong khung giờ đã chọn
function weeklyPlan(subjects, answers, classes) {
  const n = SESSIONS[answers.frequency] || 4;
  const slots = (answers.slots || []).map(id => find(SLOTS, id)).filter(Boolean);
  return DAYS[n].map((day, i) => {
    const subject = subjects[i % subjects.length];
    const slot = slots.length ? slots[i % slots.length] : null;
    const cls = (classes || []).find(c => c.subjectId === subject.subjectId && new Date(c.startTime).getDay() === DAY_INDEX[day]
      && new Date(c.startTime) > new Date() && (!slot || inSlots({ slots: [slot.id] }, c.startTime)));
    return { day, subject, slot, cls };
  });
}

// Trả về tối đa 3 combo, combo đầu là phù hợp nhất
export function buildCombos(answers, subjects, classes) {
  const list = (subjects || []).filter(s => s.status !== 'INACTIVE');
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
  if (answers.frequency === 'high' && list.length >= 3) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) for (let k = j + 1; k < list.length; k++) groups.push([list[i], list[j], list[k]]);
  }
  const scored = groups.map(g => {
    const cats = new Set(g.map(subjectCategory));
    // ưu tiên môn hợp mục tiêu + các môn khác nhóm để tập xen kẽ (vd sức mạnh + dẻo dai)
    const score = g.reduce((t, s) => t + w(s), 0) / g.length + (cats.size - 1) * 0.9 + (g.length === 3 ? 0.3 : 0);
    return { g, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ g }, idx) => {
    const ordered = [...g].sort((a, b) => w(b) - w(a));
    const price = priceCombo(ordered, answers.frequency);
    const plan = weeklyPlan(ordered, answers, classes);
    const reasons = ordered.map(s => `${s.subjectName}: ${ROLE_TEXT[subjectCategory(s)]}.`);
    reasons.push(`Tập xen kẽ ${plan.length} buổi/tuần để cơ thể kịp phục hồi giữa các buổi.`);
    return {
      id: ordered.map(s => s.subjectId).join('-'),
      name: ordered.map(s => s.subjectName).join(' + '),
      subjects: ordered,
      sessionsPerWeek: plan.length,
      plan,
      reasons,
      best: idx === 0,
      ...price
    };
  });
}
