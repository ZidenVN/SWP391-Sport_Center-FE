import { html, icon } from '../core/dom.js';
import { openModal } from '../core/ui.js';
import { date, money } from '../core/format.js';

// Mô hình gói lớp của BE: mỗi lần đăng ký lớp dùng 1 gói lớp đang chờ (WAITING_ACTIVATION, packageType CLASS)
// cùng môn và cùng thời hạn (durationDays) với lớp. Gói đã mua không có durationDays -> lấy từ danh sách gói.

export const isWaitingClassPackage = s => s.packageType === 'CLASS' && s.status === 'WAITING_ACTIVATION';

// gắn durationDays của gói vào từng gói đã mua
export function withDurations(subscriptions, packages) {
  const days = new Map((packages || []).map(p => [p.packageId, p.durationDays]));
  return (subscriptions || []).map(s => ({ ...s, durationDays: s.durationDays ?? days.get(s.packageId) ?? null }));
}

export const waitingClassPackages = subs => (subs || []).filter(isWaitingClassPackage);

// không biết thời hạn (gói đã ngừng bán nên không có trong danh sách gói) thì chỉ so môn, BE vẫn kiểm tra thời hạn
export function matchingPackages(subs, cls) {
  return waitingClassPackages(subs).filter(s =>
    String(s.subjectId) === String(cls.subjectId)
    && (cls.durationDays == null || s.durationDays == null || s.durationDays === cls.durationDays));
}

// gói lớp đang bán khớp môn + thời hạn của lớp (package trả về subject lồng, không có subjectId phẳng)
export const buyablePackages = (packages, cls) => (packages || []).filter(p =>
  p.packageType === 'CLASS' && p.status === 'ACTIVE'
  && String(p.subject?.subjectId) === String(cls.subjectId)
  && (cls.durationDays == null || p.durationDays === cls.durationDays));

// có membership (đang dùng hoặc chờ kích hoạt) mới được mua gói lớp
export const hasMembership = subs => (subs || []).some(x => x.packageType !== 'CLASS' && ['ACTIVE', 'WAITING_ACTIVATION'].includes(x.status));

export const neededPackageText =cls => `Cần gói ${cls.subjectName}${cls.durationDays ? ` ${cls.durationDays} ngày` : ''}`;

// 1 gói khớp: dùng luôn; nhiều gói: cho chọn. Trả về subscription hoặc null nếu bỏ qua.
export function pickPackage(list, cls) {
  if (list.length <= 1) return Promise.resolve(list[0] || null);
  return new Promise(resolve => {
    let picked = null;
    const modal = openModal({
      title: `Chọn gói cho lớp ${cls.subjectName}`,
      body: html`
        <p class="text-sm text-slate-600 mb-3">Bạn có ${list.length} gói lớp phù hợp. Gói được chọn sẽ gắn với lớp này.</p>
        <div class="space-y-2" data-testid="package-choices">
          ${list.map(s => html`
            <button type="button" data-action="choose" data-id="${s.subscriptionId}"
              class="w-full text-left rounded-2xl border border-brand-line bg-white/70 px-4 py-3 hover:border-[#1E9E64] hover:bg-[#1E9E64]/5 flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-brand-sand text-brand-deep flex items-center justify-center shrink-0">${icon('ticket', 'w-4 h-4')}</span>
              <span class="flex-1 min-w-0">
                <span class="block font-bold text-sm">${s.packageName}</span>
                <span class="block text-xs text-slate-500">#${s.subscriptionId}${s.durationDays ? ` · ${s.durationDays} ngày` : ''}${s.paidAt ? ` · mua ${date(s.paidAt)}` : ''}${s.amount != null ? ` · ${money(s.amount)}` : ''}</span>
              </span>
              ${icon('chevron-right', 'w-4 h-4 text-slate-400')}
            </button>`)}
        </div>`,
      actions: {
        choose: t => {
          picked = list.find(s => String(s.subscriptionId) === t.dataset.id) || null;
          modal.close();
        }
      },
      onClose: () => resolve(picked)
    });
  });
}
