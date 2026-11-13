import { html } from '../core/dom.js';
import { GOALS, OTHER_GOAL, GOAL_TEXT_MAX, goalFromProfile, goalTextError } from '../core/quiz.js';

// Chọn mục tiêu tập luyện: 5 mục gợi ý + "Khác" (tự nhập, tối đa 100 ký tự).
// Dùng chung cho hồ sơ hội viên và form của lễ tân; ô tự nhập chỉ hiện khi chọn "Khác" (CSS group-has, không cần JS).
const OTHER_VALUE = '__other__';

// Không bọc bằng field(): field() là <label>, lồng các <label> radio vào sẽ khiến bấm tiêu đề tự chọn mục đầu tiên
export function goalPicker(current, { disabled = false, cols = 'sm:grid-cols-2 xl:grid-cols-3', label = 'Mục tiêu tập luyện', hint = '' } = {}) {
  const { goal, goalText } = goalFromProfile(current);
  const isOther = goal === OTHER_GOAL.id;
  const options = [
    ...GOALS.map(g => ({ value: g.label, title: g.label, hint: g.hint, checked: goal === g.id })),
    { value: OTHER_VALUE, title: OTHER_GOAL.label, hint: OTHER_GOAL.hint, checked: isOther, other: true }
  ];
  const ro = disabled ? 'disabled' : '';
  return html`
    <div class="group/goal">
      <span class="field-label block text-xs font-bold text-slate-600 mb-1">${label}</span>
      <div class="grid ${cols} gap-2.5" role="radiogroup" data-field-wrap data-testid="goal-options">
        ${options.map(o => html`
          <label class="${disabled ? 'cursor-default' : 'cursor-pointer'}">
            <input type="radio" name="trainingGoal" value="${o.value}" class="peer sr-only ${o.other ? 'goal-other' : ''}" ${o.checked ? 'checked' : ''} ${ro} />
            <span class="block h-full rounded-2xl border border-brand-line bg-white px-4 py-3 transition-colors peer-checked:bg-brand-dark peer-checked:border-brand-dark peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
              <span class="block text-sm font-extrabold">${o.title}</span>
              <span class="block text-[11px] opacity-70 mt-0.5">${o.hint}</span>
            </span>
          </label>`)}
      </div>
      <div class="hidden group-has-[.goal-other:checked]/goal:block mt-3" data-testid="goal-other-wrap">
        <input class="input" name="trainingGoalOther" maxlength="${GOAL_TEXT_MAX}" placeholder="VD: Chuẩn bị chạy marathon"
          value="${isOther ? goalText : ''}" ${ro} data-testid="goal-other-text" />
      </div>
      ${hint ? html`<span class="field-hint block text-[11px] text-slate-400 mt-1">${hint}</span>` : ''}
    </div>`;
}

// Đọc mục tiêu từ form (readForm) -> { value, errors }; lỗi gắn vào đúng ô để showFormErrors hiển thị
export function readGoal(data, { required = true } = {}) {
  const picked = data.trainingGoal;
  if (!picked) return { value: '', errors: required ? { trainingGoal: 'Vui lòng chọn mục tiêu tập luyện' } : {} };
  if (picked !== OTHER_VALUE) return { value: picked, errors: {} };
  const text = String(data.trainingGoalOther || '').trim();
  const msg = goalTextError(OTHER_GOAL.id, text);
  return { value: text, errors: msg ? { trainingGoalOther: msg } : {} };
}
