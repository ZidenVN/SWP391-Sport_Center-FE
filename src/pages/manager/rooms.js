import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, select, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { roomApi } from '../../api/endpoints.js';
import { badge } from '../../core/format.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';
import { defaultClassImage } from '../../components/classCard.js';
import { imageField, imageErrors, mountImagePicker, attachImageError, hasFile } from '../../components/imageField.js';

// Ảnh phòng: imageUrl do Quản lý tải lên (Cloudinary); phòng chưa có ảnh -> ảnh minh họa theo tên phòng
// (cùng bộ ảnh mặc định của lớp: gym, boxing, yoga, hồ bơi...)
const roomImageUrl = r => r.imageUrl || defaultClassImage(r.roomName);
const roomImage = r => html`<img src="${roomImageUrl(r)}" alt="${r.roomName}" loading="lazy" data-testid="room-image"
  onerror="this.onerror=null;this.src='${defaultClassImage(r.roomName)}'"
  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${r.status === 'MAINTENANCE' ? 'grayscale' : ''}" />`;

const roomImageField = r => imageField({
  label: 'Ảnh phòng',
  required: false,
  currentUrl: r.roomId ? roomImageUrl(r) : '',
  currentText: r.imageUrl ? 'Ảnh hiện tại — chọn ảnh khác để đổi' : 'Đang dùng ảnh minh họa — chọn ảnh để thay'
});

// lưu phòng xong mới tải ảnh (BE nhận ảnh qua API riêng); ảnh lỗi thì phòng vẫn đã lưu
async function saveImage(roomId, d) {
  if (!hasFile(d.image)) return;
  await roomApi.uploadImage(roomId, d.image).catch(err => { throw attachImageError(err); });
}

const STATUS_OPTIONS =[{ value: 'AVAILABLE', label: 'Sẵn sàng' }, { value: 'MAINTENANCE', label: 'Bảo trì' }];

const form = (r = {}) => html`
  ${roomImageField(r)}
  ${field('Tên phòng', input('roomName', { value: r.roomName, required: true, placeholder: 'VD: Phòng Gym Tầng 1' }))}
  <div class="grid grid-cols-2 gap-3">
    ${field('Sức chứa', input('capacity', { type: 'number', value: r.capacity, required: true, attrs: 'min="1"' }))}
    ${field('Trạng thái', select('status', STATUS_OPTIONS, r.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'))}
  </div>`;

function validate(d) {
  const e = requireFields(d, ['roomName', 'capacity']);
  if (d.capacity && Number(d.capacity) < 1) e.capacity = 'Sức chứa tối thiểu 1';
  return { ...e, ...imageErrors(d, false) };
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
          <div class="card overflow-hidden group" data-testid="room-card">
            <div class="relative h-36 overflow-hidden bg-slate-100">
              ${roomImage(r)}
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <span class="absolute top-3 right-3">${badge(r.status)}</span>
              ${r.status === 'MAINTENANCE' ? html`<span class="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-brand-dark text-[11px] font-bold">${icon('wrench', 'w-3 h-3')} Đang bảo trì</span>` : ''}
              <button type="button" data-action="edit" data-id="${r.roomId}" data-testid="room-change-image" title="Đổi ảnh phòng"
                class="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-brand-dark text-[11px] font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                ${icon('camera', 'w-3.5 h-3.5')} Đổi ảnh
              </button>
              <div class="absolute left-4 right-24 bottom-3 text-white min-w-0">
                <div class="font-display text-2xl font-extrabold leading-tight truncate">${r.roomName}</div>
                <div class="text-xs text-white/75">Mã #${r.roomId}</div>
              </div>
            </div>
            <div class="flex items-end justify-between p-5">
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
        title: 'Thêm phòng tập', fields: form(), validate, success: 'Đã thêm phòng', onMount: mountImagePicker,
        submit: async d => {
          const room = await roomApi.create(payload(d));
          // phòng đã tạo: lỗi ảnh chỉ báo, không tạo trùng phòng khi bấm lại
          await saveImage(room.roomId, d).catch(err => toast(`Đã thêm phòng nhưng chưa lưu được ảnh: ${err.message}`, 'warning'));
          return room;
        },
        onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const r = ctx.state.rooms.find(x => String(x.roomId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${r.roomName}`, fields: form(r), validate, success: 'Đã cập nhật phòng', onMount: mountImagePicker,
          submit: async d => {
            const room = await roomApi.update(r.roomId, payload(d));
            await saveImage(r.roomId, d);
            return room;
          },
          onDone: () => ctx.reload()
        });
      },
      remove: async (t, e, ctx) => {
        const r = ctx.state.rooms.find(x => String(x.roomId) === t.dataset.id);
        if (await confirmAction(`Ngừng sử dụng phòng "${r.roomName}"?`, () => roomApi.remove(r.roomId), { success: 'Đã xóa phòng' })) ctx.reload();
      }
    }
  });
}
