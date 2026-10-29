import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, select } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { roomApi } from '../../api/endpoints.js';
import { badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

const STATUS_OPTIONS = [{ value: 'AVAILABLE', label: 'Sẵn sàng' }, { value: 'MAINTENANCE', label: 'Bảo trì' }];

const form = (r = {}) => html`
  ${field('Tên phòng', input('roomName', { value: r.roomName, required: true, placeholder: 'VD: Phòng Gym Tầng 1' }))}
  <div class="grid grid-cols-2 gap-3">
    ${field('Sức chứa', input('capacity', { type: 'number', value: r.capacity, required: true, attrs: 'min="1"' }))}
    ${field('Trạng thái', select('status', STATUS_OPTIONS, r.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'))}
  </div>`;

function validate(d) {
  const e = requireFields(d, ['roomName', 'capacity']);
  if (d.capacity && Number(d.capacity) < 1) e.capacity = 'Sức chứa tối thiểu 1';
  return e;
}

const payload = d => ({ roomName: d.roomName, capacity: Number(d.capacity), status: d.status || 'AVAILABLE' });

function view(s) {
  const list = s.rooms.filter(r => r.status !== 'INACTIVE' && matches(s.keyword, [r.roomName]));
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${pageHeader('Phòng tập', 'Phòng dùng để xếp lớp — sức chứa lớp không được vượt sức chứa phòng',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm phòng</button>`)}
    <div class="mb-5">${searchBox(s.keyword, 'Tìm phòng...')}</div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="room-list">
        ${page.content.map(r => html`
          <div class="card p-5" data-testid="room-card">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-11 h-11 rounded-2xl ${r.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600' : 'bg-[#469B7E]/10 text-[#2F6B55]'} flex items-center justify-center shrink-0">${icon('door-open', 'w-5 h-5')}</span>
                <div class="min-w-0"><div class="font-bold truncate">${r.roomName}</div><div class="text-xs text-slate-500">Mã #${r.roomId}</div></div>
              </div>
              ${badge(r.status)}
            </div>
            <div class="flex items-end justify-between mt-5">
              <div><div class="text-xs text-slate-500">Sức chứa</div><div class="text-2xl font-extrabold">${r.capacity}<span class="text-sm font-semibold text-slate-400"> người</span></div></div>
              ${rowActions(r.roomId)}
            </div>
          </div>`)}
      </div>${pagination(page, { unit: 'phòng', standalone: true })}` : emptyState('Chưa có phòng tập', 'door-open')}`;
}

export default function ManagerRooms(el) {
  return mountPage(el, {
    state: { keyword: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => ({ rooms: await roomApi.list() }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm phòng tập', fields: form(), validate, success: 'Đã thêm phòng',
        submit: d => roomApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const r = ctx.state.rooms.find(x => String(x.roomId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${r.roomName}`, fields: form(r), validate, success: 'Đã cập nhật phòng',
          submit: d => roomApi.update(r.roomId, payload(d)), onDone: () => ctx.reload()
        });
      },
      remove: async (t, e, ctx) => {
        const r = ctx.state.rooms.find(x => String(x.roomId) === t.dataset.id);
        if (await confirmAction(`Ngừng sử dụng phòng "${r.roomName}"?`, () => roomApi.remove(r.roomId), { success: 'Đã xóa phòng' })) ctx.reload();
      }
    }
  });
}
