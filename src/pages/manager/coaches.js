import { html, icon } from '../../core/dom.js';
import { emptyState, field, input, select, tabs, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { coachAdminApi, classApi, userApi, subjectApi } from '../../api/endpoints.js';
import { fullName, genderLabel, toDate } from '../../core/format.js';
import { subjectColor } from '../../components/classCard.js';
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

const initials = c => `${(c.firstName || '?').charAt(0)}${(c.lastName || '').charAt(0)}`.toUpperCase();

// ô số liệu trên banner
const kpi = (label, value, note, cls = 'bg-white/95 text-brand-dark') => html`
  <div class="rounded-2xl p-4 min-w-0 ${cls}">
    <div class="text-xs font-bold opacity-70">${label}</div>
    <div class="font-display text-4xl font-extrabold leading-none mt-1.5">${value}${note ? html`<span class="text-lg opacity-60"> ${note}</span>` : ''}</div>
  </div>`;

function banner(rows) {
  const active = rows.filter(r => r.status === 'ACTIVE');
  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white mb-6" data-testid="coach-banner">
      <img src="/landing/gym-floor.jpg" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_55%]" />
      <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand-dark/35"></span>
      <div class="relative p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[.25em] text-brand-lime">Nhân sự</div>
            <h1 class="font-display text-5xl sm:text-6xl font-extrabold leading-none mt-1">ĐỘI NGŨ HLV</h1>
            <p class="text-sm text-white/75 mt-1">Tạo tài khoản, gắn môn dạy và khóa / mở huấn luyện viên</p>
          </div>
          <button type="button" class="btn-lime !py-3" data-action="create" data-testid="create">${icon('user-plus', 'w-4 h-4')} Thêm HLV</button>
        </div>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-7" data-testid="coach-kpis">
          ${kpi('Đang hoạt động', active.length, `/ ${rows.length} HLV`, 'bg-brand-lime text-brand-dark')}
          ${kpi('Có lớp sắp tới', active.filter(r => r.upcoming > 0).length)}
          ${kpi('Lớp sắp tới cần dạy', active.reduce((n, r) => n + r.upcoming, 0))}
          ${kpi('Chưa gắn môn', rows.filter(r => !subjectsOf(r.c).length).length, '', 'bg-white text-brand-dark border-l-4 border-orange-500')}
        </div>
      </div>
    </div>`;
}

const statTile = (n, label, hot) => html`
  <div class="rounded-2xl px-3.5 py-3 ${hot ? 'bg-brand-dark text-white' : 'bg-brand-sand/70 text-brand-dark'}">
    <div class="font-display text-4xl font-extrabold leading-none ${hot ? 'text-brand-lime' : n ? '' : 'text-slate-400'}">${n}</div>
    <div class="text-[10px] font-extrabold uppercase tracking-wider mt-1 ${hot ? 'text-white/80' : 'text-slate-500'}">${label}</div>
  </div>`;

function coachCard({ c, status, upcoming, total }) {
  const subjects = subjectsOf(c);
  const locked = status === 'INACTIVE';
  const main = subjects[0]?.subjectName;
  return html`
    <div class="card overflow-hidden ${locked ? 'opacity-60' : ''}" data-testid="coach-card">
      <div class="relative h-28 p-4 overflow-hidden ${main ? `bg-gradient-to-br ${subjectColor(main)}` : 'bg-slate-400'}">
        ${main ? html`<span class="absolute -right-1 top-6 font-display text-7xl font-extrabold uppercase leading-none text-white/15 whitespace-nowrap select-none" aria-hidden="true">${main}</span>` : ''}
        <div class="relative flex items-start justify-between gap-2">
          <div class="flex flex-wrap gap-1.5">
            ${subjects.length
              ? subjects.map(x => html`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">${x.subjectName}</span>`)
              : html`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-600 text-white">Chưa gắn môn, chưa xếp lớp được</span>`}
          </div>
          <span class="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${locked ? 'bg-white text-slate-600' : 'bg-[#D7F25B] text-[#0E2A20]'}">${locked ? 'Đã khóa' : '● Hoạt động'}</span>
        </div>
      </div>
      <div class="px-5 pb-5">
        <div class="relative -mt-9 w-[72px] h-[72px] rounded-[22px] bg-[#173F31] text-[#D7F25B] border-4 border-white flex items-center justify-center font-display text-3xl font-extrabold">${initials(c)}</div>
        <div class="font-display text-[28px] font-extrabold uppercase leading-none text-brand-dark mt-2.5 break-words">${fullName(c)}</div>
        <div class="text-xs text-slate-500 mt-1">${genderLabel(c.gender)} · ${c.phone || '—'}</div>
        <div class="text-xs text-slate-500 mt-2 truncate" title="${c.email}">${c.email}</div>
        <div class="grid grid-cols-2 gap-2.5 mt-4">
          ${statTile(upcoming, 'Lớp sắp tới', upcoming > 0)}
          ${statTile(total, 'Tổng lớp', false)}
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button type="button" class="btn-sm btn-secondary flex-1" data-action="edit" data-id="${c.coachId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa hồ sơ</button>
          ${locked
            ? html`<button type="button" class="btn-sm btn-primary flex-1" data-action="toggle" data-id="${c.coachId}" data-testid="row-toggle">${icon('unlock', 'w-3.5 h-3.5')} Mở khóa</button>`
            : html`<button type="button" class="btn-sm btn-ghost flex-1 text-orange-700 border border-orange-200 hover:bg-orange-50" data-action="toggle" data-id="${c.coachId}" data-testid="row-toggle">${icon('lock', 'w-3.5 h-3.5')} Khóa tài khoản</button>`}
        </div>
      </div>
    </div>`;
}

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
    ${banner(rows)}
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
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="coach-list">
        ${page.content.map(coachCard)}
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
