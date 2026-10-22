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
        ${plans.map(p => html`
          <div class="relative rounded-3xl bg-white border ${p.packageId === best ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-slate-200'} p-6 flex flex-col shadow-sm">
            ${p.packageId === best ? html`<span class="absolute -top-3 left-6 px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase">Tiết kiệm nhất</span>` : ''}
            <div class="flex justify-between items-center">
              <span class="font-bold">${p.packageName}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100">${p.durationDays} ngày</span>
            </div>
            <div class="text-3xl font-black mt-4">${money(p.price)}</div>
            <div class="text-xs text-slate-500 mt-1">≈ ${money(Math.round(p.price / p.durationDays))} / ngày</div>
            <p class="text-sm text-slate-600 mt-4 flex-1">${p.description || ''}</p>
            <button type="button" class="btn bg-teal-600 text-white hover:bg-teal-700 mt-6 w-full" data-action="sell" data-id="${p.packageId}">${icon('package-plus', 'w-4 h-4')} Bán gói này</button>
          </div>`)}
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
