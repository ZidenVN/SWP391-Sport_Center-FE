import { html, readForm } from '../core/dom.js';
import { openModal, field, input, select, textarea, withBusy, toast, showFormErrors } from '../core/ui.js';
import { coachApi } from '../api/endpoints.js';
import { isoDate, isoLocalMinute, fullName, date, isPlaceholderPhone } from '../core/format.js';

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
export function openPlanForm({ preset, classes = [], members = [], onDone }) {
  const due = new Date(Date.now() + 28 * 86400000);
  const st = { targetType: preset?.targetType || (classes.length ? 'CLASS' : 'INDIVIDUAL') };

  const targetField = () => {
    if (preset) return '';
    const opts = st.targetType === 'CLASS'
      ? classes.map(c => ({ value: c.classId, label: `${c.subjectName} · ${date(c.startTime)}` }))
      : members.map(m => ({ value: m.memberId, label: `${fullName(m)} · ${isPlaceholderPhone(m.phone) ? m.email : m.phone}` }));
    return html`
      <div class="grid sm:grid-cols-2 gap-3">
        ${field('Giao cho', select('targetType', [{ value: 'CLASS', label: 'Cả lớp' }, { value: 'INDIVIDUAL', label: 'Một học viên' }], st.targetType))}
        ${field(st.targetType === 'CLASS' ? 'Lớp' : 'Học viên', select('targetId', opts, '', { placeholder: opts.length ? 'Chọn...' : 'Chưa có dữ liệu' }))}
      </div>`;
  };

  const body = () => html`
    <form data-action="save" class="space-y-4" novalidate data-testid="plan-form">
      ${targetField()}
      ${field('Tên giáo án', input('planName', { required: true, placeholder: 'VD: Giảm mỡ 30 ngày' }))}
      ${field('Nội dung bài tập', textarea('exerciseDetails', '', { rows: 4, required: true, placeholder: 'VD: Squat 4x12, Plank 3x60s...' }))}
      <div class="grid sm:grid-cols-2 gap-3">
        ${field('Thời lượng', input('duration', { placeholder: 'VD: 4 tuần' }))}
        ${field('Hạn hoàn thành', input('dueDate', { type: 'date', value: isoDate(due) }))}
      </div>
      ${submitRow('Giao giáo án')}
    </form>`;

  const modal = openModal({
    title: preset?.label ? `Giao giáo án cho ${preset.label}` : 'Giao giáo án mới',
    size: 'max-w-xl',
    body: body(),
    actions: {
      save: async form => {
        const data = required(form, preset ? ['planName', 'exerciseDetails'] : ['planName', 'exerciseDetails', 'targetId']);
        if (!data) return;
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
    if (e.target.name !== 'targetType') return;
    const keep = readForm(modal.el.querySelector('form'));
    st.targetType = e.target.value;
    modal.setBody(body());
    Object.entries(keep).forEach(([k, v]) => {
      const box = modal.el.querySelector(`[name="${k}"]`);
      if (box && k !== 'targetType' && k !== 'targetId') box.value = v;
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
        ${field('Thời điểm tập', input('loggedDate', { type: 'datetime-local', value: isoLocalMinute(result?.loggedDate || new Date()) }))}
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
export async function loadMyStudents() {
  const classes = await coachApi.schedules();
  const rosters = await Promise.all(classes.map(c => coachApi.roster(c.classId).catch(() => [])));
  const byId = new Map();
  rosters.forEach((roster, i) => roster.forEach(m => {
    const cur = byId.get(m.memberId) || { ...m, classes: [] };
    cur.classes.push(classes[i]);
    byId.set(m.memberId, cur);
  }));
  return { classes, students: [...byId.values()].sort((a, b) => fullName(a).localeCompare(fullName(b), 'vi')) };
}
