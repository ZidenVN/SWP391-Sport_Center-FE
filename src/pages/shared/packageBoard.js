import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState, tabs } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi } from '../../api/endpoints.js';
import { money } from '../../core/format.js';
import { bestValueId, packageKind, subjectNameOf } from '../../components/billing.js';
import { openMemberPicker } from '../../components/memberPicker.js';
import { openSellPackage } from '../../components/sellPackage.js';

// Bảng giá tại quầy: tách Membership (vào trung tâm) và Gói lớp (theo môn); hội viên phải có Membership mới mua được gói lớp
const isClass = p => p.packageType === 'CLASS';

function priceCard(p, hot) {
  // cùng kiểu bảng giá trang giới thiệu: gói tiết kiệm nhất nền xanh rừng + vàng chanh
  return html`
    <div class="relative rounded-3xl p-6 flex flex-col ${hot ? 'bg-brand-dark text-white shadow-2xl shadow-brand-dark/20' : 'bg-white border border-brand-line shadow-sm'}" data-testid="price-card">
      ${hot ? html`<span class="absolute -top-3 left-6 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase">Tiết kiệm nhất</span>` : ''}
      <div class="flex justify-between items-center gap-2">
        <span class="font-bold">${p.packageName}</span>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${hot ? 'bg-white/15' : 'bg-brand-sand'}">${p.durationDays} ngày</span>
      </div>
      <div class="text-xs font-bold mt-1 ${hot ? 'text-brand-lime/80' : 'text-[#156B45]'}">${packageKind(p)}</div>
      <div class="font-display text-5xl font-extrabold mt-3 ${hot ? 'text-brand-lime' : 'text-brand-dark'}">${money(p.price)}</div>
      <div class="text-xs mt-1 ${hot ? 'text-white/60' : 'text-slate-500'}">≈ ${money(Math.round(p.price / p.durationDays))} / ngày</div>
      <p class="text-sm mt-4 flex-1 ${hot ? 'text-white/75' : 'text-slate-600'}">${p.description || ''}</p>
      <button type="button" class="${hot ? 'btn-lime' : 'btn-primary'} mt-6 w-full" data-action="sell" data-id="${p.packageId}">${icon('package-plus', 'w-4 h-4')} Bán gói này</button>
    </div>`;
}

const grid = list => {
  const best = bestValueId(list);
  return html`<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-3" data-testid="price-board">${list.map(p => priceCard(p, p.packageId === best))}</div>`;
};

const note = (ic, text) => html`
  <div class="flex items-start gap-3 rounded-2xl bg-brand-sand/70 p-4 text-sm text-slate-700 mb-4">
    <span class="w-9 h-9 rounded-xl bg-brand-dark text-brand-lime flex items-center justify-center shrink-0">${icon(ic, 'w-4 h-4')}</span>
    <span class="pt-1.5">${text}</span>
  </div>`;

function classView(list) {
  if (!list.length) return emptyState('Chưa có gói lớp đang mở bán', 'calendar-x');
  const bySubject = new Map();
  list.forEach(p => {
    if (!bySubject.has(subjectNameOf(p))) bySubject.set(subjectNameOf(p), []);
    bySubject.get(subjectNameOf(p)).push(p);
  });
  return html`
    ${note('calendar-check', html`Mỗi <b>gói lớp</b> dùng cho 1 lớp cùng môn, cùng thời hạn. Khách phải có <b>Membership</b> trước; bán xong vào hồ sơ hội viên để đặt lớp hộ.`)}
    <div class="space-y-10">
      ${[...bySubject.entries()].map(([name, items]) => html`
        <section data-testid="class-subject-group">
          <h3 class="font-display text-2xl font-extrabold text-brand-dark mb-1 flex items-center gap-2">${icon('dumbbell', 'w-5 h-5 text-brand')} ${name}
            <span class="text-sm font-sans font-semibold text-slate-400">${items.length} gói</span></h3>
          ${grid(items)}
        </section>`)}
    </div>`;
}

function view(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays || a.price - b.price);
  const memberships = plans.filter(p => !isClass(p));
  // gói lớp chưa gắn môn không dùng được để đăng ký lớp -> không đưa ra bán
  const classPlans = plans.filter(p => isClass(p) && subjectNameOf(p))
    .sort((a, b) => subjectNameOf(a).localeCompare(subjectNameOf(b), 'vi') || a.durationDays - b.durationDays);
  return html`
    ${pageHeader('Bảng giá gói tập', 'Tư vấn khách và bán gói ngay tại quầy')}
    ${plans.length ? html`
      <div data-testid="package-tabs">${tabs([
        { id: 'MEMBERSHIP', label: 'Membership', count: memberships.length },
        { id: 'CLASS', label: 'Gói lớp', count: classPlans.length }
      ], s.tab)}</div>
      ${s.tab === 'CLASS' ? classView(classPlans) : memberships.length ? html`
        ${note('door-open', html`<b>Membership</b> là gói vào trung tâm, dùng cơ sở vật chất. Kích hoạt ở lần check-in đầu tiên và là điều kiện để mua gói lớp.`)}
        ${grid(memberships)}` : emptyState('Chưa có gói Membership đang mở bán', 'package')}`
      : emptyState('Chưa có gói tập đang mở bán', 'package')}`;
}

export default function PackageBoard(el) {
  return mountPage(el, {
    state: { tab: 'MEMBERSHIP' },
    load: async () => ({ packages: await packageApi.list() }),
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      sell: btn => openMemberPicker({
        title: 'Bán gói cho hội viên nào?',
        onPick: member => openSellPackage({ member, packageId: btn.dataset.id })
      })
    }
  });
}
