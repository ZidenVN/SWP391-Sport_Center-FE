import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, field, input, select, GENDER_OPTIONS } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { coachAdminApi, classApi, userApi } from '../../api/endpoints.js';
import { badge, fullName, genderLabel, toDate } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';

function form(c = {}) {
  const edit = Boolean(c.coachId);
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
    ${field('Chuyên môn', input('specialty', { value: c.speciality, placeholder: 'VD: Yoga, Gym, Boxing' }))}
    ${field(edit ? 'Mật khẩu mới' : 'Mật khẩu', input('password', { type: 'password', required: !edit, attrs: 'autocomplete="new-password"' }),
      edit ? 'Bỏ trống nếu không đổi mật khẩu' : 'Tối thiểu 6 ký tự, gửi cho HLV để đăng nhập lần đầu')}`;
}

function validator(edit) {
  return d => {
    const e = requireFields(d, edit ? ['firstName', 'lastName', 'email', 'phone'] : ['firstName', 'lastName', 'email', 'phone', 'password']);
    if (d.phone && !/^(0|\+84)[0-9]{9}$/.test(d.phone)) e.phone = 'Số điện thoại không hợp lệ';
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.email = 'Email không hợp lệ';
    if (d.password && d.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    return e;
  };
}

const payload = d => ({
  firstName: d.firstName, lastName: d.lastName, gender: d.gender, phone: d.phone,
  email: d.email, specialty: d.specialty || null, password: d.password || null
});

function view(s) {
  const now = new Date();
  const list = s.coaches.filter(c => matches(s.keyword, [fullName(c), c.email, c.phone, c.speciality]));
  return html`
    ${pageHeader('Huấn luyện viên', 'Tạo tài khoản, cập nhật hồ sơ và khóa / mở HLV',
      html`<button type="button" class="btn-primary" data-action="create" data-testid="create">${icon('user-plus', 'w-4 h-4')} Thêm HLV</button>`)}
    <div class="mb-5">${searchBox(s.keyword, 'Tìm tên, email, chuyên môn...')}</div>
    ${list.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="coach-list">
        ${list.map(c => {
          const status = s.statusById[c.coachId] || 'ACTIVE';
          const classes = s.classes.filter(x => x.coachId === c.coachId);
          const upcoming = classes.filter(x => toDate(x.endTime) >= now).length;
          return html`
            <div class="card p-5 ${status === 'INACTIVE' ? 'opacity-70' : ''}" data-testid="coach-card">
              <div class="flex items-start gap-3">
                ${memberAvatar(c, 'w-12 h-12 text-lg')}
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2"><span class="font-bold truncate">${fullName(c)}</span>${badge(status, status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa')}</div>
                  <div class="text-xs font-semibold text-[#2F6B55] mt-0.5">${c.speciality || 'Chưa có chuyên môn'}</div>
                </div>
              </div>
              <div class="mt-4 space-y-1.5 text-sm text-slate-600">
                <div class="flex items-center gap-2">${icon('mail', 'w-3.5 h-3.5 text-slate-400')} <span class="truncate">${c.email}</span></div>
                <div class="flex items-center gap-2">${icon('phone', 'w-3.5 h-3.5 text-slate-400')} ${c.phone || '—'} · ${genderLabel(c.gender)}</div>
              </div>
              <div class="grid grid-cols-2 gap-2 mt-4 text-center">
                <div class="rounded-xl bg-slate-50 py-2"><div class="text-lg font-extrabold">${upcoming}</div><div class="text-[11px] text-slate-500">Lớp sắp tới</div></div>
                <div class="rounded-xl bg-slate-50 py-2"><div class="text-lg font-extrabold">${classes.length}</div><div class="text-[11px] text-slate-500">Tổng lớp</div></div>
              </div>
              <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-slate-100">
                <button type="button" class="btn-ghost btn-sm" data-action="edit" data-id="${c.coachId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>
                <button type="button" class="btn-ghost btn-sm ${status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}" data-action="toggle" data-id="${c.coachId}" data-testid="row-toggle">
                  ${icon(status === 'ACTIVE' ? 'lock' : 'unlock', 'w-3.5 h-3.5')} ${status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                </button>
              </div>
            </div>`;
        })}
      </div>` : emptyState('Chưa có huấn luyện viên', 'medal')}`;
}

export default function ManagerCoaches(el) {
  return mountPage(el, {
    state: { keyword: '' },
    load: async () => {
      const [coaches, classes, users] = await Promise.all([coachAdminApi.list(), classApi.list().catch(() => []), userApi.list({ role: 'COACH' }).catch(() => [])]);
      return { coaches, classes, statusById: Object.fromEntries(users.map(u => [u.id, u.status])) };
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm huấn luyện viên', fields: form(), validate: validator(false), success: 'Đã tạo tài khoản HLV',
        submit: d => coachAdminApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const c = ctx.state.coaches.find(x => String(x.coachId) === t.dataset.id);
        openFormModal({
          title: `Sửa HLV ${fullName(c)}`, fields: form(c), validate: validator(true), success: 'Đã cập nhật HLV',
          submit: d => coachAdminApi.update(c.coachId, payload(d)), onDone: () => ctx.reload()
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
