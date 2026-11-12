import { html, icon, readForm } from '../../core/dom.js';
import { tabs, emptyState, field, input, textarea } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { packageApi, subjectApi, reportApi } from '../../api/endpoints.js';
import { money, badge, isoDate } from '../../core/format.js';
import { defaultClassImage } from '../../components/classCard.js';
import { openFormModal, requireFields, confirmAction, matches, searchBox } from '../../components/crud.js';

// Gói tập theo BE (MembershipPackageRequestDTO):
// - MEMBERSHIP: vào trung tâm, không gắn môn. Kích hoạt ở lần check-in đầu hoặc khi đăng ký lớp.
// - CLASS: gói lớp, gắn đúng 1 môn (subjectId). Mỗi lần đăng ký lớp dùng 1 gói lớp đang chờ, cùng môn và cùng thời hạn với lớp.
// Gói đã có người mua chỉ sửa được tên, mô tả, giá, trạng thái (BE trả ERR_PACKAGE_409).
const TYPES = [
  ['MEMBERSHIP', 'Membership', 'Vào trung tâm, kích hoạt khi check-in / đăng ký lớp lần đầu (tối đa 14 ngày)'],
  ['CLASS', 'Gói lớp', 'Học 1 lớp của 1 môn, thời hạn bằng thời hạn lớp']
];
const subjectIdOf = p => p.subject?.subjectId ?? p.subjectId ?? null;

function form(s, p = {}) {
  const type = p.packageType === 'CLASS' ? 'CLASS' : 'MEMBERSHIP';
  const chosen = String(subjectIdOf(p) ?? '');
  return html`
    ${field('Tên gói', input('packageName', { value: p.packageName, required: true, placeholder: 'VD: Membership 1 tháng / Yoga 30 ngày' }))}
    ${field('Loại gói', html`
      <div class="grid sm:grid-cols-2 gap-2" role="radiogroup" data-field-wrap data-testid="package-type">
        ${TYPES.map(([v, label, hint]) => html`
          <label class="cursor-pointer">
            <input type="radio" name="packageType" value="${v}" class="peer sr-only" ${type === v ? 'checked' : ''} />
            <span class="block h-full rounded-xl border-2 border-brand-line p-3 peer-checked:border-brand-dark peer-checked:bg-brand-sand/60">
              <span class="block text-sm font-bold">${label}</span>
              <span class="block text-xs text-slate-500 mt-0.5">${hint}</span>
            </span>
          </label>`)}
      </div>`)}
    <div class="grid grid-cols-2 gap-3">
      ${field('Số ngày', input('durationDays', { type: 'number', value: p.durationDays, required: true, attrs: 'min="1"' }), html`<span data-duration-hint>${type === 'CLASS' ? 'Lớp của môn này chỉ mở đúng các thời hạn đang bán' : ''}</span>`)}
      ${field('Giá (₫)', input('price', { type: 'number', value: p.price, required: true, attrs: 'min="0" step="1000"' }))}
    </div>
    <div data-class-only class="${type === 'CLASS' ? '' : 'hidden'}">
      ${field('Môn của gói lớp', html`
        <div class="flex flex-wrap gap-2" data-field-wrap data-testid="package-subjects">
          ${s.subjects.map(x => html`
            <label class="cursor-pointer">
              <input type="radio" name="subjectId" value="${x.subjectId}" class="peer sr-only" ${chosen === String(x.subjectId) ? 'checked' : ''} />
              <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-brand-line text-sm font-semibold text-slate-600 peer-checked:bg-brand-dark peer-checked:text-brand-lime peer-checked:border-brand-dark">${x.subjectName}</span>
            </label>`)}
        </div>`, 'Chọn đúng 1 môn')}
    </div>
    ${field('Mô tả', textarea('description', p.description, { rows: 2, placeholder: 'Quyền lợi của gói...' }))}
    ${p.packageId ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">Gói đã có người mua chỉ sửa được tên, mô tả và giá.</div>` : ''}`;
}

function validator(s) {
  return d => {
    const e = requireFields(d, ['packageName', 'durationDays', 'price']);
    if (d.durationDays && Number(d.durationDays) < 1) e.durationDays = 'Tối thiểu 1 ngày';
    if (d.price && Number(d.price) < 0) e.price = 'Giá không hợp lệ';
    if (d.packageType === 'CLASS' && !d.subjectId) e.subjectId = s.subjects.length ? 'Gói lớp phải chọn 1 môn' : 'Chưa có bộ môn nào, hãy tạo bộ môn trước';
    return e;
  };
}

const payload = (d, p = {}) => ({
  packageName: d.packageName,
  durationDays: Number(d.durationDays),
  price: Number(d.price),
  description: d.description || '',
  packageType: d.packageType,
  subjectId: d.packageType === 'CLASS' ? Number(d.subjectId) : null,
  // PUT ghi đè status -> luôn gửi kèm trạng thái hiện tại
  status: p.status || 'ACTIVE'
});

// đổi loại gói -> ẩn/hiện ô chọn môn
function mountTypeSwitch(modal) {
  const formEl = modal.el.querySelector('form');
  const update = () => {
    const isClass = readForm(formEl).packageType === 'CLASS';
    formEl.querySelector('[data-class-only]').classList.toggle('hidden', !isClass);
    formEl.querySelector('[data-duration-hint]').textContent = isClass ? 'Lớp của môn này chỉ mở đúng các thời hạn đang bán' : '';
  };
  formEl.addEventListener('change', update);
}

const isClass = p => p.packageType === 'CLASS';
const subjectName = p => p.subject?.subjectName || p.subjectName || '';

const MEMBERSHIP_PHOTOS = ['gym', 'gym-floor', 'swim', 'fitness', 'tennis'].map(x => `/landing/${x}.jpg`);
// ảnh gói: gói lớp theo môn; membership xoay vòng theo thứ tự thời hạn
function photoOf(p, all) {
  if (isClass(p)) return p.subject?.imageUrl || defaultClassImage(subjectName(p));
  const i = all.filter(x => !isClass(x)).sort((a, b) => a.durationDays - b.durationDays).indexOf(p);
  return MEMBERSHIP_PHOTOS[Math.max(0, i) % MEMBERSHIP_PHOTOS.length];
}

// doanh thu tháng: BE gom theo tên gói (revenueByPackage.categoryName)
const soldOf = (s, p) => (s.revenue?.revenueByPackage || []).find(x => x.categoryName === p.packageName);
const shortMoney = v => {
  const n = Number(v || 0);
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  return money(n);
};

function banner(s) {
  const all = s.packages;
  const active = all.filter(p => p.status !== 'INACTIVE');
  const growth = Number(s.overview?.revenueGrowthRate);
  const now = new Date();
  const month = `${String(now.getMonth() + 1).padStart(2, '0')} / ${now.getFullYear()}`;
  const totalMembers = s.members?.totalMembers ?? s.overview?.totalMembers;
  const expiringOrExpired = s.members?.expiredOrNoSubMembers;

  const kpi = (label, value, note, cls = 'bg-white text-brand-dark', valCls = 'text-brand-dark') => html`
    <div class="rounded-2xl p-4 sm:p-5 min-w-0 ${cls}">
      <div class="text-xs font-bold opacity-75">${label}</div>
      <div class="font-display text-4xl font-extrabold leading-none mt-1.5 truncate ${valCls}">${value}</div>
      <div class="text-xs font-bold mt-1.5 truncate">${note}</div>
    </div>`;

  return html`
    <div class="relative rounded-3xl overflow-hidden bg-brand-dark text-white mb-6" data-testid="packages-banner">
      <img src="/landing/gym.jpg" alt="" class="absolute inset-0 w-full h-full object-cover object-[center_40%]" />
      <span class="absolute inset-0 bg-gradient-to-b from-brand-dark/65 to-brand-dark/95"></span>
      <div class="relative p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[.25em] text-brand-lime">Tháng ${month}</div>
            <h1 class="font-display text-5xl font-extrabold leading-none mt-1">GÓI TẬP</h1>
            <p class="text-sm text-white/75 mt-1">${active.filter(p => !isClass(p)).length} membership · ${active.filter(isClass).length} gói lớp đang mở bán</p>
          </div>
          <button type="button" class="btn-lime !py-3" data-action="create" data-testid="create">${icon('plus', 'w-4 h-4')} Tạo gói mới</button>
        </div>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-7" data-testid="package-kpis">
          ${kpi(
            'Doanh thu gói tháng này',
            s.revenue ? shortMoney(s.revenue.totalRevenue) : '—',
            Number.isFinite(growth)
              ? html`<span class="text-brand-dark">${growth >= 0 ? '▲' : '▼'} ${Math.abs(growth).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% so với tháng trước</span>`
              : 'Chưa có số liệu so sánh',
            'bg-brand-lime text-brand-dark'
          )}
          ${kpi(
            'Gói đã bán',
            s.revenue ? s.revenue.totalTransactions : '—',
            s.revenue ? html`<span class="text-[#156B45]">▲ ${s.revenue.totalTransactions} gói</span> trong tháng` : 'Giao dịch thành công'
          )}
          ${kpi(
            'Hội viên đang hoạt động',
            s.overview?.totalActiveMembers ?? '—',
            totalMembers ? html`<span class="text-slate-500">trên ${totalMembers} tài khoản</span>` : html`<span class="text-slate-500">+${s.overview?.newMembersThisMonth ?? 0} mới tháng này</span>`
          )}
          ${expiringOrExpired != null
            ? kpi(
                'Sắp hết hạn / chưa gia hạn',
                expiringOrExpired,
                html`<a href="#/reception/notifications" class="text-orange-600 hover:underline">Gửi nhắc gia hạn →</a>`,
                'bg-white text-brand-dark border-l-4 border-orange-500',
                'text-orange-600'
              )
            : kpi(
                'Đang mở bán',
                `${active.length} gói`,
                html`<span class="text-orange-600">${all.length - active.length} gói ngừng bán</span>`,
                'bg-white text-brand-dark border-l-4 border-orange-500',
                'text-orange-600'
              )}
        </div>
      </div>
    </div>`;
}

// top 3 gói theo doanh thu tháng này
function topSellers(s) {
  const rows = [...(s.revenue?.revenueByPackage || [])].filter(x => Number(x.totalAmount) > 0)
    .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).slice(0, 3);
  if (!rows.length) return '';
  const max = Number(rows[0].totalAmount);
  return html`
    <section class="mb-6" data-testid="top-sellers">
      <h2 class="font-display text-3xl font-extrabold text-brand-dark leading-none uppercase">Bán chạy tháng này</h2>
      <p class="text-sm text-slate-500 mt-1 mb-4">Xếp theo doanh thu</p>
      <div class="grid md:grid-cols-3 gap-4">
        ${rows.map((r, i) => {
          const p = s.packages.find(x => x.packageName === r.categoryName);
          return html`
            <div class="relative h-48 rounded-3xl overflow-hidden bg-brand-dark text-white shadow-sm">
              <img src="${p ? photoOf(p, s.packages) : '/landing/gym-floor.jpg'}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              <span class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/70 to-brand-dark/20"></span>
              <span class="absolute right-4 top-1 font-display text-8xl font-extrabold leading-none ${i === 0 ? 'text-brand-lime' : 'text-white/85'}">#${i + 1}</span>
              <div class="absolute left-5 right-5 bottom-5">
                <div class="font-bold truncate">${r.categoryName}</div>
                <div class="flex items-baseline gap-3 mt-1">
                  <span class="font-display text-4xl font-extrabold leading-none text-brand-lime">${shortMoney(r.totalAmount)}</span>
                  <span class="text-sm text-white/75">${r.transactionCnt} gói</span>
                </div>
                <div class="h-1.5 rounded-full bg-white/20 mt-3 overflow-hidden">
                  <div class="h-full rounded-full bg-brand-lime" style="width:${Math.round(Number(r.totalAmount) / max * 100)}%"></div>
                </div>
              </div>
            </div>`;
        })}
      </div>
    </section>`;
}

function row(s, p, maxSold) {
  const off = p.status === 'INACTIVE';
  const sold = soldOf(s, p)?.transactionCnt || 0;
  const subText = p.description || (isClass(p) ? `Gói lớp${subjectName(p) ? ` · ${subjectName(p)}` : ''}` : 'Vào cửa tự do');
  return html`
    <tr class="${off ? 'opacity-60' : ''}" data-testid="plan-card">
      <td class="px-5 py-3.5">
        <div class="flex items-center gap-3.5 min-w-[250px]">
          <img src="${photoOf(p, s.packages)}" alt="" loading="lazy" class="w-14 h-11 rounded-xl object-cover shrink-0 border border-brand-line/60" />
          <div class="min-w-0">
            <div class="font-bold text-brand-dark break-words">${p.packageName}</div>
            <div class="text-xs text-slate-500 truncate max-w-xs" title="${subText}">${subText}</div>
            ${isClass(p) && !p.subject && !p.subjectName ? html`<div class="text-[11px] font-bold text-rose-600" data-testid="pkg-warning">Chưa gắn môn, hội viên không đặt lớp được</div>` : ''}
          </div>
        </div>
      </td>
      <td class="px-5 py-3.5 whitespace-nowrap">
        <div class="font-display text-2xl font-extrabold text-brand-dark leading-none">${money(p.price)}</div>
      </td>
      <td class="px-5 py-3.5 whitespace-nowrap text-slate-700 font-medium">${p.durationDays} ngày</td>
      <td class="px-5 py-3.5">
        <div class="flex items-center gap-3 min-w-[140px]">
          <div class="flex-1 h-2 rounded-full bg-brand-sand overflow-hidden">
            <div class="h-full rounded-full bg-brand" style="width:${maxSold ? Math.round((sold / maxSold) * 100) : 0}%"></div>
          </div>
          <b class="w-8 text-right text-brand-dark">${sold}</b>
        </div>
      </td>
      <td class="px-5 py-3.5">${off ? badge('INACTIVE', 'Ngừng bán') : badge('ACTIVE', 'Đang bán')}</td>
      <td class="px-5 py-3.5">
        <div class="flex gap-2 justify-end">
          <button type="button" class="btn-sm btn-secondary" data-action="edit" data-id="${p.packageId}" data-testid="row-edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa</button>
          ${off
            ? html`<button type="button" class="btn-sm btn-primary" data-action="restore" data-id="${p.packageId}" data-testid="row-restore">${icon('rotate-ccw', 'w-3.5 h-3.5')} Mở bán</button>`
            : html`<button type="button" class="btn-sm btn-ghost text-orange-700 border border-orange-200 hover:bg-orange-50" data-action="remove" data-id="${p.packageId}" title="Ngừng bán" data-testid="row-remove">${icon('archive', 'w-3.5 h-3.5')} Ngừng</button>`}
        </div>
      </td>
    </tr>`;
}

function view(s) {
  const all = s.packages;
  const activeList = all.filter(p => p.status !== 'INACTIVE');
  const inactiveList = all.filter(p => p.status === 'INACTIVE');
  const filter = s.filter || 'ALL';

  const list = all
    .filter(p => {
      if (filter === 'INACTIVE') return p.status === 'INACTIVE';
      if (filter === 'MEMBERSHIP') return !isClass(p) && p.status !== 'INACTIVE';
      if (filter === 'CLASS') return isClass(p) && p.status !== 'INACTIVE';
      return true;
    })
    .filter(p => matches(s.keyword, [p.packageName, p.description, subjectName(p)]))
    // gói đang bán lên trước, gói ngừng bán xuống cuối; membership trước, gói lớp sau
    .sort((a, b) => (a.status === 'INACTIVE') - (b.status === 'INACTIVE') || isClass(a) - isClass(b) || subjectName(a).localeCompare(subjectName(b), 'vi') || a.durationDays - b.durationDays || a.price - b.price);

  const maxSold = Math.max(0, ...list.map(p => soldOf(s, p)?.transactionCnt || 0));
  const cols = ['Gói', 'Giá', 'Thời hạn', 'Đã bán tháng này', 'Trạng thái', 'Thao tác'];

  const filterTabs = [
    { id: 'ALL', label: 'Tất cả', count: all.length },
    { id: 'MEMBERSHIP', label: 'Membership', count: activeList.filter(p => !isClass(p)).length },
    { id: 'CLASS', label: 'Gói lớp', count: activeList.filter(isClass).length },
    { id: 'INACTIVE', label: 'Ngừng bán', count: inactiveList.length }
  ];

  return html`
    ${banner(s)}
    ${topSellers(s)}
    <div class="card overflow-hidden rounded-3xl">
      <div class="p-4 flex flex-col lg:flex-row lg:items-center gap-3 border-b border-brand-line [&_[role=tablist]]:mb-0">
        ${tabs(filterTabs, filter, 'filter')}
        <div class="lg:ml-auto lg:w-72">${searchBox(s.keyword, 'Tìm gói theo tên...')}</div>
      </div>
      ${list.length ? html`
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-slate-500 bg-brand-cream">
                ${cols.map((c, i) => html`<th class="px-5 py-3 font-bold ${i === cols.length - 1 ? 'text-right' : ''}">${c}</th>`)}
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-line/60">${list.map(p => row(s, p, maxSold))}</tbody>
          </table>
        </div>`
        : emptyState(all.length ? 'Không có gói khớp bộ lọc' : 'Chưa có gói tập', 'package')}
    </div>`;
}

export default function ManagerPackages(el) {
  return mountPage(el, {
    state: { keyword: '', subjects: [], filter: 'ALL' },
    load: async () => {
      const now = new Date();
      const firstOfMonth = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
      const today = isoDate(now);
      const res = await settle({
        packages: [packageApi.list, null],
        subjects: [subjectApi.list, []],
        // số liệu báo cáo lỗi thì trang vẫn chạy, KPI hiện "—"
        overview: [reportApi.overview, null],
        members: [() => reportApi.members(firstOfMonth, today), null],
        revenue: [() => reportApi.revenue(firstOfMonth, today), null]
      });
      if (res.packagesError) throw res.packagesError;
      return { ...res, subjects: (res.subjects || []).filter(x => x.status !== 'INACTIVE') };
    },
    view,
    actions: {
      search: (t, e, ctx) => ctx.set({ keyword: t.value }),
      filter: (t, e, ctx) => ctx.set({ filter: t.dataset.tab }),
      restore: async (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        const d = { ...p, packageType: p.packageType, subjectId: subjectIdOf(p) };
        if (await confirmAction(`Mở bán lại gói "${p.packageName}"?\nHội viên sẽ thấy và mua được gói này.`,
          () => packageApi.update(p.packageId, payload(d, { status: 'ACTIVE' })), { confirmText: 'Mở bán', success: 'Đã mở bán lại gói' })) ctx.reload();
      },
      create: (t, e, ctx) => openFormModal({
        title: 'Thêm gói tập', size: 'max-w-xl', fields: form(ctx.state), validate: validator(ctx.state), success: 'Đã thêm gói tập',
        onMount: mountTypeSwitch,
        submit: d => packageApi.create(payload(d)), onDone: () => ctx.reload()
      }),
      edit: (t, e, ctx) => {
        const p = ctx.state.packages.find(x => String(x.packageId) === t.dataset.id);
        openFormModal({
          title: `Sửa ${p.packageName}`, size: 'max-w-xl', fields: form(ctx.state, p), validate: validator(ctx.state), success: 'Đã cập nhật gói tập',
          onMount: mountTypeSwitch,
          submit: d => packageApi.update(p.packageId, payload(d, p)), onDone: () => ctx.reload()
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
