import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, textarea, select } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { subjectApi } from '../../api/endpoints.js';
import { subjectColor } from '../../components/classCard.js';
import { openFormModal, requireFields, confirmAction, rowActions, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

// areaAccess: OPEN = có khu tập chung (gói tự do của môn vào được), CLASS_ONLY = chỉ học theo lớp (chỉ gói lớp của môn)
export const AREA_ACCESS = [
  { value: 'OPEN', label: 'Có khu tập tự do', hint: 'Gói tự do và gói lớp của môn đều vào tập được (VD: Gym, Bơi)' },
  { value: 'CLASS_ONLY', label: 'Chỉ học theo lớp', hint: 'Chỉ hội viên có gói lớp của môn mới vào được (VD: Boxing)' }
];
const areaLabel = v => AREA_ACCESS.find(a => a.value === v)?.label || 'Có khu tập tự do';

const form = (s = {}) => html`
  ${field('Tên bộ môn', input('subjectName', { value: s.subjectName, required: true, placeholder: 'VD: Boxing' }))}
  ${field('Khu tập', select('areaAccess', AREA_ACCESS, s.areaAccess || 'OPEN', { required: true }), 'Có khu tập tự do: gói tự do vào được · Chỉ học theo lớp: chỉ gói lớp của môn')}
  ${field('Mô tả', textarea('description', s.description, { rows: 3, placeholder: 'Giới thiệu ngắn về bộ môn' }))}`;

const validate = d => requireFields(d, ['subjectName']);
const payload = d => ({ subjectName: d.subjectName, description: d.description || '', areaAccess: d.areaAccess || 'OPEN' });

function view(s) {
  const list = s.subjects.filter(x => x.status !== 'INACTIVE' && matches(s.keyword, [x.subjectName, x.description]));
  const page = paginate(list, s.pageNo, s.pageSize);
  return html`
    ${pageHeader('Bộ môn', 'Các môn thể thao trung tâm đang mở lớp',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Thêm bộ môn</button>`)}
    <div class="mb-5">${searchBox(s.keyword, 'Tìm bộ môn...')}</div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="subject-list">
        ${page.content.map(x => html`
          <div class="card overflow-hidden flex flex-col" data-testid="subject-card">
            <div class="h-2 bg-gradient-to-r ${subjectColor(x.subjectName)}"></div>
            <div class="p-5 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <div class="font-bold text-lg">${x.subjectName}</div>
                <span class="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${x.areaAccess === 'CLASS_ONLY' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}" data-testid="area-access">${areaLabel(x.areaAccess)}</span>
              </div>
              <p class="text-sm text-slate-600 mt-1 flex-1">${x.description || 'Chưa có mô tả'}</p>
              <div class="mt-4">${rowActions(x.subjectId)}</div>
            </div>
          </div>`)}
      </div>${pagination(page, { unit: 'bộ môn', standalone: true })}` : emptyState('Chưa có bộ môn', 'book-open')}`;
}

export default function ManagerSubjects(el) {
  return mountPage(el, {
    state: { keyword: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => ({ subjects: await subjectApi.list() }),
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm bộ môn', fields: form(), validate, success: 'Đã thêm bộ môn',
        submit: d => subjectApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const x = ctx.state.subjects.find(y => String(y.subjectId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${x.subjectName}`, fields: form(x), validate, success: 'Đã cập nhật bộ môn',
          submit: d => subjectApi.update(x.subjectId, payload(d)), onDone: () => ctx.reload()
        });
      },
      remove: async (t, e, ctx) => {
        const x = ctx.state.subjects.find(y => String(y.subjectId) === t.dataset.id);
        if (await confirmAction(`Xóa bộ môn "${x.subjectName}"?`, () => subjectApi.remove(x.subjectId), { success: 'Đã xóa bộ môn' })) ctx.reload();
      }
    }
  });
}
