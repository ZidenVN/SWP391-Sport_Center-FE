import { html, icon } from '../../core/dom.js';
import { pageHeader, table, emptyState, field, input, textarea } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi } from '../../api/endpoints.js';
import { money, badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';

function form(p = {}) {
  return html`
    ${field('Tên gói', input('packageName', { value: p.packageName, required: true, placeholder: 'VD: Gói 3 Tháng' }))}
    <div class="grid grid-cols-2 gap-3">
      ${field('Số ngày', input('durationDays', { type: 'number', value: p.durationDays, required: true, attrs: 'min="1"' }))}
      ${field('Giá (₫)', input('price', { type: 'number', value: p.price, required: true, attrs: 'min="0" step="1000"' }))}
    </div>
    ${field('Mô tả', textarea('description', p.description, { rows: 3, placeholder: 'Quyền lợi của gói...' }))}`;
}

function validate(d) {
  const e = requireFields(d, ['packageName', 'durationDays', 'price']);
  if (d.durationDays && Number(d.durationDays) < 1) e.durationDays = 'Tối thiểu 1 ngày';
  if (d.price && Number(d.price) < 0) e.price = 'Giá không hợp lệ';
  return e;
}

const payload = d => ({
  packageName: d.packageName,
  durationDays: Number(d.durationDays),
  price: Number(d.price),
  description: d.description || '',
  // PUT ghi đè status -> luôn gửi kèm, nếu không gói bị status null
  status: 'ACTIVE'
});

function view(s) {
  const list = s.packages
    .filter(p => matches(s.keyword, [p.packageName, p.description]))
    .sort((a, b) => a.durationDays - b.durationDays);
  return html`
    ${pageHeader('Gói tập', 'Quản lý các gói hội viên đang bán',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm gói</button>`)}
    <div class="card">
      <div class="p-4 border-b border-slate-100">${searchBox(s.keyword, 'Tìm gói tập...')}</div>
      ${list.length ? table({
        columns: [{ label: 'Gói' }, { label: 'Thời hạn' }, { label: 'Giá', cls: 'text-right' }, { label: 'Giá / ngày', cls: 'text-right' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
        rows: list.map(p => [
          html`<div class="font-semibold">${p.packageName}</div><div class="text-xs text-slate-500 max-w-xs truncate">${p.description || ''}</div>`,
          `${p.durationDays} ngày`,
          html`<b>${money(p.price)}</b>`,
          money(Math.round(p.price / p.durationDays)),
          badge('ACTIVE', 'Đang bán'),
          rowActions(p.packageId, { removeLabel: 'Ngừng bán', removeIcon: 'archive' })
        ])
      }) : emptyState('Chưa có gói tập', 'package')}
    </div>`;
}

export default function ManagerPackages(el) {
  return mountPage(el, {
    state: { keyword: '' },
    load: async () => ({ packages: await packageApi.list() }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm gói tập', fields: form(), validate, success: 'Đã thêm gói tập',
        submit: d => packageApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${p.packageName}`, fields: form(p), validate, success: 'Đã cập nhật gói tập',
          submit: d => packageApi.update(p.packageId, payload(d)), onDone: () => ctx.reload()
        });
      },
      remove: async (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        if (await confirmAction(`Ngừng bán gói "${p.packageName}"?\nGói sẽ không còn hiện cho hội viên mua mới; hội viên đã mua vẫn dùng đến hết hạn.`,
          () => packageApi.remove(p.packageId), { confirmText: 'Ngừng bán', success: 'Đã ngừng bán gói' })) ctx.reload();
      }
    }
  });
}
