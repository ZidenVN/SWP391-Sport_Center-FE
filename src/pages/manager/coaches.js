import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, select, tabs, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { coachAdminApi, classApi, userApi, subjectApi } from '../../api/endpoints.js';
import { badge, fullName, genderLabel, toDate } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';
import { paginate, pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';

// BE: HLV dạy các môn trong subjectIds (ít nhất 1); lọc HLV theo môn khi mở lớp / dạy thay
const subjectsOf = c => c.subjects || [];
const subjectText = c => subjectsOf(c).map(x => x.subjectName).join(', ');

function form(subjects, c = {}) {
  const edit = Boolean(c.coachId);
  const chosen = new Set(subjectsOf(c).map(x => String(x.subjectId)));
  return html`
    <div class="grid grid-cols-2 gap-3">
      ${field('Họ', input('firstName', { value: c.firstName, required: true }))}
      ${field('Tên', input('lastName', { value: c.lastName, required: true }))}
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${field('Giới tính', select('gender', GENDER_OPTIONS, c.gender || 'MALE'))}
      ${field('Số điện thoại', input('phone', { type: 'tel', value: c.phone, required: true }))}
    </div>
    ${field('Email đăng nhập', input('email', { type: 'email', value: c.email, required: true }))}
    ${field('Môn dạy', html`
      <div class="flex flex-wrap gap-2" data-field-wrap data-testid="coach-subjects">
        ${subjects.map(x => html`
          <label class="cursor-pointer">
            <input type="checkbox" name="subject_${x.subjectId}" value="1" class="peer sr-only" ${chosen.has(String(x.subjectId)) ? 'checked' : ''} />
            <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-brand-line text-sm font-semibold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">${x.subjectName}</span>
          </label>`)}
      </div>`, subjects.length ? 'Chọn ít nhất 1 môn. HLV chỉ được xếp vào lớp của các môn này' : 'Chưa có bộ môn nào, hãy tạo bộ môn trước')}
    ${edit ? '' : field('Mật khẩu', input('password', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }),
      'Tối thiểu 6 ký tự, gửi cho HLV để đăng nhập lần đầu')}`;
}

const pickedSubjects = (subjects, d) => subjects.filter(x => d[`subject_${x.subjectId}`]).map(x => x.subjectId);

function validator(subjects, edit) {
  return d => {
    const e = requireFields(d, edit ? ['firstName', 'lastName', 'email', 'phone'] : ['firstName', 'lastName', 'email', 'phone', 'password']);
    if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone)) e.phone = 'Số điện thoại không hợp lệ';
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.email = 'Email không hợp lệ';
    if (d.password && d.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!pickedSubjects(subjects, d).length && subjects[0]) e[`subject_${subjects[0].subjectId}`] = 'Chọn ít nhất 1 môn dạy';
    return e;
  };
}

// tạo: gửi password; sửa: BE không nhận password (CoachUpdateRequestDTO)
const payload = (subjects, d, edit) => ({
  firstName: d.firstName, lastName: d.lastName, gender: d.gender, phone: d.phone, email: d.email,
  subjectIds: pickedSubjects(subjects, d), ...(edit ? {} : { password: d.password })
});

const LOAD_OPTIONS = [['', 'Mọi lịch dạy'], ['BUSY', 'Có lớp sắp tới'], ['FREE', 'Chưa có lớp sắp tới'], ['NONE', 'Chưa từng dạy lớp']];
const SORT_OPTIONS = [['name', 'Tên A → Z'], ['upcoming', 'Nhiều lớp sắp tới nhất'], ['total', 'Nhiều lớp nhất']];

const statTile = (n, label, ic, tone) => html`
  <div class="coach-stat ${tone} ${n ? '' : 'is-zero'}">
    <span class="coach-stat-ic">${icon(ic, 'w-4 h-4')}</span>
    <div><div class="coach-stat-num">${n}</div><div class="coach-stat-label">${label}</div></div>
  </div>`;

function view(s) {
  const now = new Date();
  // số lớp mỗi HLV, tính một lần cho cả lọc, sắp xếp và hiển thị
  const stats = c => {
    const classes = s.classes.filter(x => x.coachId === c.coachId);
    return { total: classes.length, upcoming: classes.filter(x => toDate(x.endTime) >= now).length };
  };
  const statusOf = c => s.statusById[c.coachId] || 'ACTIVE';
  const rows = s.coaches.map(c => ({ c, status: statusOf(c), ...stats(c) }));
  const count = st => rows.filter(r => !st || r.status === st).length;

  const list = rows
    .filter(r => !s.tab || r.status === s.tab)
    .filter(r => !s.specialty || (s.specialty === '-' ? !subjectsOf(r.c).length : subjectsOf(r.c).some(x => String(x.subjectId) === s.specialty)))
    .filter(r => !s.load || (s.load === 'BUSY' ? r.upcoming > 0 : s.load === 'FREE' ? r.upcoming === 0 : r.total === 0))
    .filter(r => matches(s.keyword, [fullName(r.c), r.c.email, r.c.phone, subjectText(r.c)]))
    .sort((a, b) => (s.sort === 'upcoming' ? b.upcoming - a.upcoming : s.sort === 'total' ? b.total - a.total : 0)
      || fullName(a.c).localeCompare(fullName(b.c), 'vi'));
  const page = paginate(list, s.pageNo, s.pageSize);
  const filtered = s.tab || s.specialty || s.load || s.keyword.trim();
  return html`
    ${pageHeader('Huấn luyện viên', 'Tạo tài khoản, cập nhật hồ sơ và khóa / mở HLV',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('user-plus', 'w-4 h-4')} Thêm HLV</button>`)}
    <div>
      ${tabs([
        { id: '', label: 'Tất cả', count: count('') },
        { id: 'ACTIVE', label: 'Hoạt động', count: count('ACTIVE') },
        { id: 'INACTIVE', label: 'Đã khóa', count: count('INACTIVE') }
      ], s.tab)}
      <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mb-5" data-testid="coach-filters">
        <select class="input sm:w-48" name="specialty" data-action="specialty">
          <option value="">Mọi môn dạy</option>
          ${s.subjects.map(x => html`<option value="${x.subjectId}" ${s.specialty === String(x.subjectId) ? 'selected' : ''}>${x.subjectName}</option>`)}
          <option value="-" ${s.specialty === '-' ? 'selected' : ''}>Chưa gắn môn</option>
        </select>
        <select class="input sm:w-48" name="load" data-action="workload">
          ${LOAD_OPTIONS.map(([v, l]) => html`<option value="${v}" ${s.load === v ? 'selected' : ''}>${l}</option>`)}
        </select>
        <select class="input sm:w-52" name="sort" data-action="sort">
          ${SORT_OPTIONS.map(([v, l]) => html`<option value="${v}" ${s.sort === v ? 'selected' : ''}>${l}</option>`)}
        </select>
        ${searchBox(s.keyword, 'Tìm tên, email, môn dạy...')}
      </div>
    </div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="coach-list">
        ${page.content.map(({ c, status, upcoming, total }) => {
          return html`
            <div class="card p-5 ${status === 'INACTIVE' ? 'opacity-70' : ''}" data-testid="coach-card">
              <div class="flex items-start gap-3">
                ${memberAvatar(c, 'w-12 h-12 text-lg')}
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2"><span class="font-bold truncate">${fullName(c)}</span>${badge(status, status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa')}</div>
                  ${subjectsOf(c).length ? html`
                    <div class="flex flex-wrap gap-1 mt-1">${subjectsOf(c).map(x => html`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#469B7E]/10 text-[#2F6B55]">${x.subjectName}</span>`)}</div>`
                    : html`<div class="text-xs font-semibold text-rose-600 mt-0.5">Chưa gắn môn, chưa xếp lớp được</div>`}
                </div>
              </div>
              <div class="mt-4 space-y-1.5 text-sm text-slate-600">
                <div class="flex items-center gap-2">${icon('mail', 'w-3.5 h-3.5 text-slate-400')} <span class="truncate">${c.email}</span></div>
                <div class="flex items-center gap-2">${icon('phone', 'w-3.5 h-3.5 text-slate-400')} ${c.phone || '—'} · ${genderLabel(c.gender)}</div>
              </div>
              <div class="grid grid-cols-2 gap-2 mt-4">
                ${statTile(upcoming, 'Lớp sắp tới', 'calendar-clock', 'is-hot')}
                ${statTile(total, 'Tổng lớp', 'layers', 'is-soft')}
              </div>
              <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-slate-100">
                <button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${c.coachId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>
                <button type="button" class="btn-ghost btn-sm ${status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}" data-action="toggle" data-id="${c.coachId}" data-testid="row-toggle">
                  ${icon(status === 'ACTIVE' ? 'lock' : 'unlock', 'w-3.5 h-3.5')} ${status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                </button>
              </div>
            </div>`;
        })}
      </div>${pagination(page, { unit: 'HLV', standalone: true })}` : emptyState(filtered && s.coaches.length ? 'Không có HLV phù hợp bộ lọc' : 'Chưa có huấn luyện viên', 'medal')}`;
}

export default function ManagerCoaches(el) {
  return mountPage(el, {
    state: { tab: '', specialty: '', load: '', subjects: [], sort: 'name', keyword: '', pageNo: 0, pageSize: DEFAULT_PAGE_SIZE },
    load: async () => {
      const [coaches, classes, users, subjects] = await Promise.all([coachAdminApi.list(), classApi.list().catch(() => []), userApi.list({ role: 'COACH' }).catch(() => []), subjectApi.list().catch(() => [])]);
      return { coaches, classes, subjects: subjects.filter(x => x.status !== 'INACTIVE'), statusById: Object.fromEntries(users.map(u => [u.id, u.status])) };
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab, pageNo: 0 }),
      specialty: (t, e, ctx) => ctx.set({ specialty: t.value, pageNo: 0 }),
      workload: (t, e, ctx) => ctx.set({ load: t.value, pageNo: 0 }),
      sort: (t, e, ctx) => ctx.set({ sort: t.value, pageNo: 0 }),
      search: (t, e, ctx) => ctx.set({ keyword: t.value, pageNo: 0 }),
      ...pagerActions(),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm huấn luyện viên', fields: form(ctx.state.subjects), validate: validator(ctx.state.subjects, false), success: 'Đã tạo tài khoản HLV',
        submit: d => coachAdminApi.create(payload(ctx.state.subjects, d, false)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const c = ctx.state.coaches.find(x => String(x.coachId) === t.dataset.id);
        openFormModal({
          title: `Sửa HLV ${fullName(c)}`, fields: form(ctx.state.subjects, c), validate: validator(ctx.state.subjects, true), success: 'Đã cập nhật HLV',
          submit: d => coachAdminApi.update(c.coachId, payload(ctx.state.subjects, d, true)), onDone: () => ctx.reload()
        });
      },
      toggle: async (t, e, ctx) => {
        const c = ctx.state.coaches.find(x => String(x.coachId) === t.dataset.id);
        const locking = (ctx.state.statusById[c.coachId] || 'ACTIVE') === 'ACTIVE';
        if (await confirmAction(
          locking ? `Khóa tài khoản HLV ${fullName(c)}? HLV sẽ không đăng nhập được.` : `Mở khóa tài khoản HLV ${fullName(c)}?`,
          () => coachAdminApi.deactivate(c.coachId),
          { confirmText: locking ? 'Khóa' : 'Mở khóa', success: locking ? 'Đã khóa HLV' : 'Đã mở khóa HLV' }
        )) ctx.reload();
      }
    }
  });
}
