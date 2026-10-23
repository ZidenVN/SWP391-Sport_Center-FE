import { html, icon } from '../../core/dom.js';
import { pageHeader, emptyState } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { packageApi } from '../../api/endpoints.js';
import { money } from '../../core/format.js';
import { bestValueId } from '../../components/billing.js';
import { openMemberPicker } from '../../components/memberPicker.js';
import { openSellPackage } from '../../components/sellPackage.js';

function view(s) {
  const plans = s.packages.filter(p => p.status === 'ACTIVE').sort((a, b) => a.durationDays - b.durationDays);
  const best = bestValueId(plans);
  return html`
    ${pageHeader('Bảng giá gói tập', 'Tư vấn khách và bán gói ngay tại quầy')}
    ${plans.length ? html`
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-3" data-testid="price-board">
        ${plans.map(p => {
          // cùng kiểu bảng giá trang giới thiệu: gói tiết kiệm nhất nền xanh rừng + vàng chanh
          const hot = p.packageId === best;
          return html`
          <div class="relative rounded-3xl p-6 flex flex-col ${hot ? 'bg-brand-dark text-white shadow-2xl shadow-brand-dark/20' : 'bg-white border border-brand-line shadow-sm'}">
            ${hot ? html`<span class="absolute -top-3 left-6 px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[11px] font-extrabold uppercase">Tiết kiệm nhất</span>` : ''}
            <div class="flex justify-between items-center">
              <span class="font-bold">${p.packageName}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${hot ? 'bg-white/15' : 'bg-brand-sand'}">${p.durationDays} ngày</span>
            </div>
            <div class="font-display text-5xl font-extrabold mt-4 ${hot ? 'text-brand-lime' : 'text-brand-dark'}">${money(p.price)}</div>
            <div class="text-xs mt-1 ${hot ? 'text-white/60' : 'text-slate-500'}">≈ ${money(Math.round(p.price / p.durationDays))} / ngày</div>
            <p class="text-sm mt-4 flex-1 ${hot ? 'text-white/75' : 'text-slate-600'}">${p.description || ''}</p>
            <button type="button" class="${hot ? 'btn-lime' : 'btn-primary'} mt-6 w-full" data-action="sell" data-id="${p.packageId}">${icon('package-plus', 'w-4 h-4')} Bán gói này</button>
          </div>`;
        })}
      </div>` : emptyState('Chưa có gói tập đang mở bán', 'package')}`;
}

export default function PackageBoard(el) {
  return mountPage(el, {
    load: async () => ({ packages: await packageApi.list() }),
    view,
    actions: {
      sell: btn => openMemberPicker({
        title: 'Bán gói cho hội viên nào?',
        onPick: member => openSellPackage({ member, packageId: btn.dataset.id })
      })
    }
  });
}
