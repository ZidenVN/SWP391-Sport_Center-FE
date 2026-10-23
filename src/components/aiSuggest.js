import { html, icon, readForm } from '../core/dom.js';
import { openModal, field, input, select, table, toast } from '../core/ui.js';
import { coachApi } from '../api/endpoints.js';
import { fullName } from '../core/format.js';
import { openPlanForm } from './coachForms.js';

// HLV xin AI gợi ý 1 buổi tập cho học viên (dựa trên mục tiêu, điểm danh, kết quả, giáo án cũ),
// xem lại rồi chuyển thành giáo án (vẫn sửa được trước khi giao).
const LEVELS = [
  { value: '', label: 'Tự động theo lịch sử tập' },
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung bình' },
  { value: 'ADVANCED', label: 'Nâng cao' }
];
const LEVEL_LABEL = { BEGINNER: 'Cơ bản', INTERMEDIATE: 'Trung bình', ADVANCED: 'Nâng cao' };
const MINUTES = [30, 45, 60, 75, 90].map(v => ({ value: v, label: `${v} phút` }));

// Văn bản giáo án gửi cho học viên
export function planText(plan) {
  const lines = [];
  if (plan.warmup?.length) lines.push('Khởi động:', ...plan.warmup.map(x => `- ${x}`), '');
  lines.push('Bài chính:', ...plan.exercises.map((e, i) => `${i + 1}. ${e.name}: ${e.sets} hiệp x ${e.reps}${e.rest && e.rest !== '-' ? `, nghỉ ${e.rest}` : ''}${e.note ? ` (${e.note})` : ''}`));
  if (plan.cooldown?.length) lines.push('', 'Giãn cơ:', ...plan.cooldown.map(x => `- ${x}`));
  if (plan.advice?.length) lines.push('', 'Lưu ý:', ...plan.advice.map(x => `- ${x}`));
  return lines.join('\n');
}

export function openAiSuggest({ member, onAssigned }) {
  const st = { form: { focus: '', level: '', sessionMinutes: '60' }, busy: false, result: null };

  const formView = () => html`
    <form data-action="generate" class="space-y-4" novalidate data-testid="ai-form">
      <div class="rounded-xl bg-brand-sand/70 p-3 text-sm flex gap-2">
        ${icon('target', 'w-4 h-4 shrink-0 mt-0.5 text-brand-deep')}
        <span><b>Mục tiêu học viên:</b> ${member.trainingGoal || 'Chưa cập nhật'}. AI dùng thêm lịch sử điểm danh, kết quả tập và giáo án đã giao.</span>
      </div>
      ${field('Trọng tâm buổi tập', input('focus', { value: st.form.focus, placeholder: 'Bỏ trống để AI tự chọn theo mục tiêu, VD: sức bền, chân và mông...', attrs: 'maxlength="200"' }))}
      <div class="grid sm:grid-cols-2 gap-3">
        ${field('Trình độ', select('level', LEVELS, st.form.level))}
        ${field('Thời lượng', select('sessionMinutes', MINUTES, st.form.sessionMinutes))}
      </div>
      <div class="flex justify-end gap-2 pt-1">
        <button type="button" data-action="cancel" class="btn-secondary">Đóng</button>
        <button type="submit" class="btn-primary" data-testid="ai-generate" ${st.busy ? 'disabled' : ''}>
          ${st.busy ? html`<span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> AI đang soạn buổi tập...` : html`${icon('sparkles', 'w-4 h-4')} Tạo gợi ý`}
        </button>
      </div>
    </form>`;

  const listBlock = (title, items, ic) => (items?.length ? html`
    <div>
      <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1.5">${icon(ic, 'w-3.5 h-3.5')} ${title}</div>
      <ul class="text-sm space-y-1">${items.map(x => html`<li class="flex gap-2"><span class="text-brand mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0"></span><span>${x}</span></li>`)}</ul>
    </div>` : '');

  const resultView = () => {
    const r = st.result;
    const p = r.plan;
    return html`
      <div class="space-y-5" data-testid="ai-result">
        <div class="rounded-2xl bg-brand-dark text-white p-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${r.source === 'CLAUDE' ? 'bg-brand-lime text-brand-dark' : 'bg-white/15'}" data-testid="ai-source">
              ${r.source === 'CLAUDE' ? `Claude AI` : 'Gợi ý tự động'}
            </span>
            <span class="text-xs text-white/60">${LEVEL_LABEL[r.level] || r.level} · ${r.sessionMinutes} phút</span>
          </div>
          <div class="font-display text-3xl font-extrabold leading-tight text-brand-lime mt-2" data-testid="ai-title">${p.title}</div>
          <p class="text-sm text-white/75 mt-1">${p.summary}</p>
          <div class="flex flex-wrap gap-1.5 mt-3">${(r.basedOn || []).map(b => html`<span class="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">${b}</span>`)}</div>
        </div>
        ${listBlock('Khởi động', p.warmup, 'flame')}
        <div class="rounded-2xl border border-brand-line overflow-hidden" data-testid="ai-exercises">
          ${table({
            columns: [{ label: '#' }, { label: 'Bài tập' }, { label: 'Hiệp', cls: 'whitespace-nowrap' }, { label: 'Lần / thời gian' }, { label: 'Nghỉ', cls: 'whitespace-nowrap' }, { label: 'Ghi chú' }],
            rows: p.exercises.map((e, i) => [String(i + 1), html`<b>${e.name}</b>`, e.sets, e.reps, e.rest, html`<span class="text-xs text-slate-500">${e.note || ''}</span>`])
          })}
        </div>
        <div class="grid sm:grid-cols-2 gap-5">
          ${listBlock('Giãn cơ', p.cooldown, 'wind')}
          ${listBlock('Lưu ý cho HLV', p.advice, 'shield-check')}
        </div>
        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" class="btn-secondary" data-action="again" data-testid="ai-again">${icon('rotate-ccw', 'w-4 h-4')} Tạo lại</button>
          <button type="button" class="btn-primary" data-action="assign" data-testid="ai-assign">${icon('clipboard-plus', 'w-4 h-4')} Giao làm giáo án</button>
        </div>
      </div>`;
  };

  const modal = openModal({
    title: `Gợi ý bài tập bằng AI · ${fullName(member)}`,
    size: 'max-w-3xl',
    body: formView(),
    actions: {
      generate: async form => {
        if (st.busy) return;
        const d = readForm(form);
        st.form = { focus: d.focus || '', level: d.level || '', sessionMinutes: d.sessionMinutes || '60' };
        st.busy = true;
        modal.setBody(formView());
        try {
          st.result = await coachApi.aiSuggest(member.memberId, {
            focus: st.form.focus.trim() || undefined,
            level: st.form.level || undefined,
            sessionMinutes: Number(st.form.sessionMinutes)
          });
          st.busy = false;
          modal.setBody(resultView());
        } catch (err) {
          st.busy = false;
          modal.setBody(formView());
          toast(err.message, 'error');
        }
      },
      again: () => modal.setBody(formView()),
      assign: () => {
        const r = st.result;
        modal.close();
        openPlanForm({
          preset: { targetType: 'INDIVIDUAL', targetId: member.memberId, label: fullName(member) },
          values: { planName: r.plan.title.slice(0, 100), exerciseDetails: planText(r.plan), duration: `${r.sessionMinutes} phút/buổi` },
          onDone: onAssigned
        });
      }
    }
  });
  return modal;
}
