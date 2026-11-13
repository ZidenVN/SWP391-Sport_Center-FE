import { html, icon, readForm } from '../core/dom.js';
import { openModal, field, input, select, textarea, withBusy, toast, showFormErrors, dateTimeInput } from '../core/ui.js';
import { coachApi } from '../api/endpoints.js';
import { isoDate, isoLocalMinute, fullName, date, isPlaceholderPhone, toDate } from '../core/format.js';

const submitRow = text => html`
  <div class="flex justify-end gap-2 pt-2">
    <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
    <button type="submit" class="btn-primary">${text}</button>
  </div>`;

function required(form, keys) {
  const data = readForm(form);
  const errors = {};
  keys.forEach(k => { if (!data[k]) errors[k] = 'Không được để trống'; });
  showFormErrors(form, { fields: errors });
  return Object.keys(errors).length ? null : data;
}

// Giao giáo án. preset: { targetType, targetId } khi đã biết giao cho ai (từ trang lớp / học viên).
// classes, members: danh sách để chọn khi chưa có preset.
// values: điền sẵn nội dung (vd từ gợi ý AI), HLV vẫn sửa được trước khi giao
export function openPlanForm({ preset, classes = [], members = [], values = {}, onDone }) {
  const due = new Date(Date.now() + 28 * 86400000);
  const st = { targetType: preset?.targetType || (classes.length ? 'CLASS' : 'INDIVIDUAL'), classFilter: '' };
  const classLabel = c => `${c.subjectName} #${c.classId} · ${date(c.startTime)} → ${date(c.endTime)}`;
  // lớp của học viên (m.classes từ loadMyStudents), chỉ tính các lớp đang có trong danh sách chọn
  const classIds = new Set(classes.map(c => String(c.classId)));
  const classesOf = m => (m.classes || []).filter(c => classIds.has(String(c.classId)));

  const targetField = () => {
    if (preset) return '';
    const typeField = field('Giao cho', select('targetType', [{ value: 'CLASS', label: 'Cả lớp' }, { value: 'INDIVIDUAL', label: 'Một học viên' }], st.targetType));
    if (st.targetType === 'CLASS') {
      const opts = classes.map(c => ({ value: c.classId, label: classLabel(c) }));
      return html`
        <div class="grid sm:grid-cols-2 gap-3">
          ${typeField}
          ${field('Lớp', select('targetId', opts, '', { placeholder: opts.length ? 'Chọn...' : 'Chưa có dữ liệu' }))}
        </div>`;
    }
    // 1 học viên: chọn lớp trước để lọc, tên lớp hiện kèm trong lựa chọn học viên
    const inClass = st.classFilter ? members.filter(m => classesOf(m).some(c => String(c.classId) === st.classFilter)) : members;
    const opts = inClass.map(m => {
      const cls = classesOf(m).map(c => `${c.subjectName} #${c.classId}`).join(', ');
      return { value: m.memberId, label: `${fullName(m)} · ${isPlaceholderPhone(m.phone) ? m.email : m.phone}${cls && !st.classFilter ? ` · ${cls}` : ''}` };
    });
    return html`
      <div class="grid sm:grid-cols-2 gap-3">
        ${typeField}
        ${field('Lớp', select('classFilter', [{ value: '', label: 'Tất cả lớp' }, ...classes.map(c => ({ value: c.classId, label: classLabel(c) }))], st.classFilter))}
      </div>
      ${field('Học viên', select('targetId', opts, '', { placeholder: opts.length ? 'Chọn...' : 'Lớp này chưa có học viên' }))}`;
  };

  const body = () => html`
    <form data-action="save" class="space-y-4" novalidate data-testid="plan-form">
      ${targetField()}
      ${field('Tên giáo án', input('planName', { value: values.planName || '', required: true, placeholder: 'VD: Giảm mỡ 30 ngày' }))}
      ${field('Nội dung bài tập', textarea('exerciseDetails', values.exerciseDetails || '', { rows: values.exerciseDetails ? 10 : 4, required: true, placeholder: 'VD: Squat 4x12, Plank 3x60s...' }))}
      ${(preset?.targetType || st.targetType) === 'INDIVIDUAL' ? html`
        <div class="flex flex-wrap items-center gap-2 -mt-2">
          <button type="button" class="btn-secondary btn-sm" data-action="ai-suggest" data-testid="plan-ai-suggest">${icon('sparkles', 'w-3.5 h-3.5')} Gợi ý bằng AI</button>
          <span class="text-[11px] text-slate-400">Soạn nháp từ mục tiêu, BMI và các buổi tập gần nhất của học viên — bạn sửa lại trước khi giao</span>
        </div>` : ''}
      <div class="grid sm:grid-cols-2 gap-3">
        ${field('Thời lượng', input('duration', { value: values.duration || '', placeholder: 'VD: 4 tuần' }))}
        ${field('Hạn hoàn thành', input('dueDate', { type: 'date', value: isoDate(due), attrs: `min="${isoDate(new Date())}"` }))}
      </div>
      ${submitRow('Giao giáo án')}
    </form>`;

  const modal = openModal({
    title: preset?.label ? `Giao giáo án cho ${preset.label}` : 'Giao giáo án mới',
    size: 'max-w-xl',
    body: body(),
    actions: {
      // AI chỉ điền nháp vào ô nội dung (thay nội dung cũ), HLV sửa rồi bấm Giao như bình thường
      'ai-suggest': async btn => {
        const form = btn.closest('form');
        const memberId = preset?.targetType === 'INDIVIDUAL' ? preset.targetId : form.elements.targetId?.value;
        if (!memberId) { showFormErrors(form, { fields: { targetId: 'Chọn học viên để AI gợi ý' } }); return; }
        const res = await withBusy(btn, () => coachApi.aiSuggest(memberId));
        if (!res) return;
        form.elements.exerciseDetails.value = res.suggestion;
        form.elements.exerciseDetails.rows = 12;
        toast('AI đã soạn nháp — hãy kiểm tra và sửa trước khi giao', 'info');
      },
      save: async form => {
        const data = required(form, preset ? ['planName', 'exerciseDetails'] : ['planName', 'exerciseDetails', 'targetId']);
        if (!data) return;
        // không cho đặt hạn trong quá khứ (BE cũng chặn, ERR_PLAN_003)
        if (data.dueDate && data.dueDate < isoDate(new Date())) {
          showFormErrors(form, { fields: { dueDate: 'Hạn hoàn thành không được ở trong quá khứ' } });
          return;
        }
        const payload = {
          planName: data.planName,
          exerciseDetails: data.exerciseDetails,
          duration: data.duration || null,
          dueDate: data.dueDate || null,
          targetType: preset?.targetType || st.targetType,
          targetId: Number(preset?.targetId || data.targetId)
        };
        const plan = await withBusy(form, () => coachApi.createPlan(payload));
        if (plan) { toast(`Đã giao giáo án "${plan.planName}"`); modal.close(); onDone?.(plan); }
      }
    }
  });
  // đổi loại đối tượng (cả lớp / 1 học viên) -> vẽ lại form, giữ phần đã gõ
  modal.el.addEventListener('change', e => {
    if (e.target.name !== 'targetType' && e.target.name !== 'classFilter') return;
    const keep = readForm(modal.el.querySelector('form'));
    if (e.target.name === 'targetType') { st.targetType = e.target.value; st.classFilter = ''; } else st.classFilter = e.target.value;
    modal.setBody(body());
    Object.entries(keep).forEach(([k, v]) => {
      const box = modal.el.querySelector(`[name="${k}"]`);
      if (box && !['targetType', 'targetId', 'classFilter'].includes(k)) box.value = v;
    });
  });
  return modal;
}

// Ghi / sửa kết quả buổi tập của 1 học viên
export function openResultForm({ member, result, onDone }) {
  const modal = openModal({
    title: result ? 'Sửa kết quả tập luyện' : `Ghi kết quả cho ${fullName(member)}`,
    size: 'max-w-xl',
    body: html`
      <form data-action="save" class="space-y-4" novalidate data-testid="result-form">
        ${field('Nội dung buổi tập', textarea('activityDetails', result?.activityDetails || '', { rows: 3, required: true, placeholder: 'VD: Squat 4x10 (60kg), chạy 3km' }))}
        ${field('Nhận xét của HLV', textarea('coachFeedback', result?.coachFeedback || '', { rows: 3, placeholder: 'VD: Đúng form, tuần sau tăng tạ' }))}
        ${field('Thời điểm tập', dateTimeInput('loggedDate', isoLocalMinute(result?.loggedDate || new Date()), { minuteStep: 1 }))}
        ${submitRow(result ? 'Lưu thay đổi' : 'Ghi kết quả')}
      </form>`,
    actions: {
      save: async form => {
        const data = required(form, ['activityDetails']);
        if (!data) return;
        const payload = {
          memberId: member.memberId,
          activityDetails: data.activityDetails,
          coachFeedback: data.coachFeedback || null,
          loggedDate: data.loggedDate ? `${data.loggedDate}:00` : null
        };
        const saved = await withBusy(form, () => result
          ? coachApi.updateResult(result.resultId, payload)
          : coachApi.recordResult(member.memberId, payload));
        if (saved) { toast(result ? 'Đã cập nhật kết quả' : 'Đã ghi kết quả buổi tập'); modal.close(); onDone?.(saved); }
      }
    }
  });
  return modal;
}

// Gửi thông báo: send(payload) là hàm gọi API tương ứng (cả lớp / 1 học viên)
export function openNotifyForm({ title, send, onDone }) {
  const modal = openModal({
    title,
    body: html`
      <form data-action="save" class="space-y-4" novalidate data-testid="notify-form">
        ${field('Tiêu đề', input('title', { required: true, placeholder: 'VD: Nhắc bài tập về nhà' }))}
        ${field('Nội dung', textarea('content', '', { rows: 4, required: true, placeholder: 'VD: Tối nay nhớ giãn cơ 15 phút' }))}
        ${submitRow('Gửi thông báo')}
      </form>`,
    actions: {
      save: async form => {
        const data = required(form, ['title', 'content']);
        if (!data) return;
        const sent = await withBusy(form, () => send({ title: data.title, content: data.content }));
        if (sent) { toast('Đã gửi thông báo'); modal.close(); onDone?.(sent); }
      }
    }
  });
  return modal;
}

// BE không có API "học viên của tôi" -> gộp roster của mọi lớp HLV dạy, mỗi học viên kèm danh sách lớp
// BE trả lịch dạy theo từng BUỔI -> gom về từng lớp: startTime = buổi đầu, endTime = hết buổi cuối, sessionCount = số buổi
export function groupSessionsByClass(sessions) {
  const map = new Map();
  (sessions || []).forEach(x => {
    const c = map.get(x.classId);
    if (!c) { map.set(x.classId, { ...x, sessionCount: 1 }); return; }
    c.sessionCount++;
    if (toDate(x.startTime) < toDate(c.startTime)) c.startTime = x.startTime;
    if (toDate(x.endTime) > toDate(c.endTime)) c.endTime = x.endTime;
  });
  return [...map.values()].sort((a, b) => toDate(a.startTime) - toDate(b.startTime));
}

export async function loadMyStudents() {
  const classes = groupSessionsByClass(await coachApi.schedules());
  const rosters = await Promise.all(classes.map(c => coachApi.roster(c.classId).catch(() => [])));
  const byId = new Map();
  rosters.forEach((roster, i) => roster.forEach(m => {
    const cur = byId.get(m.memberId) || { ...m, classes: [] };
    cur.classes.push(classes[i]);
    byId.set(m.memberId, cur);
  }));
  return { classes, students: [...byId.values()].sort((a, b) => fullName(a).localeCompare(fullName(b), 'vi')) };
}
