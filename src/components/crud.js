import { html, icon, readForm } from '../core/dom.js';
import { openModal, withBusy, toast, showFormErrors, confirmDialog } from '../core/ui.js';

// Hộp form dùng chung cho các màn quản lý.
// fields: html`` các ô nhập; validate(data) -> { field: 'lỗi' }; submit(data) -> Promise kết quả
export function openFormModal({ title, fields, submitText = 'Lưu', size = 'max-w-lg', validate, submit, success, onDone, onMount }) {
  const modal = openModal({
    title,
    size,
    onMount,
    body: html`
      <form data-action="save" class="space-y-4" novalidate data-testid="crud-form">
        ${fields}
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
          <button type="submit" class="btn-primary" data-testid="crud-submit">${submitText}</button>
        </div>
      </form>`,
    actions: {
      save: async form => {
        const data = readForm(form);
        const errors = validate ? validate(data) : {};
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const res = await withBusy(form, () => submit(data));
        if (res !== undefined) {
          if (success) toast(success);
          modal.close();
          onDone?.(res);
        }
      }
    }
  });
  return modal;
}

// Kiểm tra nhanh các ô bắt buộc
export function requireFields(data, keys) {
  const errors = {};
  keys.forEach(k => { if (data[k] === undefined || data[k] === '') errors[k] = 'Không được để trống'; });
  return errors;
}

// Xác nhận rồi gọi API xóa/khóa; trả true nếu thành công
export async function confirmAction(message, run, { title = 'Xác nhận', confirmText = 'Xóa', success } = {}) {
  const ok = await confirmDialog(message, { title, confirmText, danger: true });
  if (!ok) return false;
  try {
    await run();
    if (success) toast(success);
    return true;
  } catch (err) {
    toast(err.message, 'error');
    return false;
  }
}

// Nút sửa / xóa ở cuối dòng bảng
export function rowActions(id, { edit = true, remove = true, removeLabel = 'Xóa', removeIcon = 'trash-2', extra = '' } = {}) {
  return html`
    <div class="flex justify-end gap-1">
      ${extra}
      ${edit ? html`<button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${id}" title="Sửa" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')}</button>` : ''}
      ${remove ? html`<button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" data-action="remove" data-id="${id}" title="${removeLabel}" data-testid="row-remove">${icon(removeIcon, 'w-3.5 h-3.5')}</button>` : ''}
    </div>`;
}

const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
export const matches = (kw, values) => !kw.trim() || values.some(v => norm(v).includes(norm(kw.trim())));

export function searchBox(value, placeholder = 'Tìm kiếm...') {
  return html`
    <div class="relative w-full md:w-72">
      <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
      <input class="input pl-9" name="keyword" data-action="search" data-live placeholder="${placeholder}" value="${value}" />
    </div>`;
}
