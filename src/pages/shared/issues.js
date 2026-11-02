import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, tabs, table, emptyState, openModal, field, input, textarea, showFormErrors, toast, withBusy, confirmDialog, statCard } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { issueApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { dateTime, roleLabel, phoneText } from '../../core/format.js';
import { pagination, pagerActions, DEFAULT_PAGE_SIZE } from '../../components/pagination.js';
import { openFormModal } from '../../components/crud.js';

// Báo cáo sự cố (POST /issue-reports, GET /issue-reports/my, /issue-reports?...):
// - Hội viên / HLV: gửi báo cáo + xem báo cáo của mình, rút báo cáo khi còn OPEN
// - Lễ tân: xử lý báo cáo ở quầy (desk RECEPTION), chuyển lên Quản lý; vẫn gửi được báo cáo của mình
// - Quản lý: xử lý mọi báo cáo (lọc theo nơi nhận)

// danh mục theo vai trò người gửi (enum IssueReportCategory của BE)
const CATEGORIES = {
  MEMBER: [
    ['MEMBER_FACILITY', 'Cơ sở vật chất / thiết bị hỏng', 'RECEPTION', 'wrench'],
    ['MEMBER_HYGIENE', 'Vệ sinh', 'RECEPTION', 'sparkles'],
    ['MEMBER_COACH_CLASS', 'Phản ánh HLV / lớp', 'MANAGER', 'message-square-warning'],
    ['MEMBER_PACKAGE_PAYMENT', 'Gói tập / thanh toán', 'RECEPTION', 'credit-card'],
    ['MEMBER_OTHER', 'Khác', 'RECEPTION', 'circle-help']
  ],
  COACH: [
    ['COACH_ROOM_EQUIPMENT', 'Thiết bị trong phòng hỏng', 'MANAGER', 'wrench'],
    ['COACH_SESSION_INCIDENT', 'Sự cố trong buổi học', 'MANAGER', 'siren'],
    ['COACH_ROOM_ISSUE', 'Phòng học có vấn đề', 'MANAGER', 'door-open'],
    ['COACH_OTHER', 'Khác', 'MANAGER', 'circle-help']
  ],
  RECEPTIONIST: [
    ['RECEPTION_FACILITY', 'Cơ sở vật chất', 'MANAGER', 'wrench'],
    ['RECEPTION_SYSTEM_PAYMENT', 'Lỗi hệ thống / thanh toán', 'MANAGER', 'monitor-x'],
    ['RECEPTION_MEMBER_VIOLATION', 'Hội viên vi phạm nội quy', 'MANAGER', 'shield-alert'],
    ['RECEPTION_OTHER', 'Khác', 'MANAGER', 'circle-help']
  ]
};
const ALL_CATEGORIES = Object.values(CATEGORIES).flat();
const categoryLabel = r => r.categoryLabel || ALL_CATEGORIES.find(c => c[0] === r.category)?.[1] || r.category;

const DESK = { RECEPTION: 'Lễ tân', MANAGER: 'Quản lý' };
const STATUS = {
  OPEN: ['Mới gửi', 'bg-amber-50 text-amber-700 ring-amber-600/20'],
  IN_PROGRESS: ['Đang xử lý', 'bg-sky-50 text-sky-700 ring-sky-600/20'],
  RESOLVED: ['Đã xử lý', 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'],
  REJECTED: ['Từ chối', 'bg-rose-50 text-rose-700 ring-rose-600/20'],
  CANCELLED: ['Đã rút', 'bg-slate-100 text-slate-600 ring-slate-500/20']
};
const statusBadge = st => html`<span class="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset whitespace-nowrap ${(STATUS[st] || STATUS.OPEN)[1]}">${(STATUS[st] || [st])[0]}</span>`;
const closed = r => ['RESOLVED', 'REJECTED', 'CANCELLED'].includes(r.status);
const TITLE_MAX = 100;

// ---------- Gửi báo cáo ----------
function openReportForm(role, onDone) {
  const cats = CATEGORIES[role] || [];
  const modal = openModal({
    title: 'Gửi báo cáo sự cố',
    size: 'max-w-xl',
    body: html`
      <form data-action="submit-report" class="space-y-4" novalidate data-testid="issue-form">
        ${field('Loại sự cố', html`
          <div class="grid sm:grid-cols-2 gap-2" data-field-wrap role="radiogroup">
            ${cats.map(([id, label, desk, ic], i) => html`
              <label class="cursor-pointer">
                <input type="radio" name="category" value="${id}" class="peer sr-only" ${i === 0 ? 'checked' : ''} />
                <span class="flex items-center gap-2.5 h-full rounded-xl border-2 border-brand-line p-2.5 peer-checked:border-brand-dark peer-checked:bg-brand-sand/60">
                  <span class="w-8 h-8 rounded-lg bg-white text-[#469B7E] flex items-center justify-center shrink-0">${icon(ic, 'w-4 h-4')}</span>
                  <span class="min-w-0"><span class="block text-sm font-bold leading-tight">${label}</span><span class="block text-[11px] text-slate-500">${DESK[desk]} xử lý</span></span>
                </span>
              </label>`)}
          </div>`)}
        ${field('Tiêu đề', input('title', { required: true, placeholder: 'VD: Máy chạy số 3 bị kẹt băng', attrs: `maxlength="${TITLE_MAX}"` }), `Tối đa ${TITLE_MAX} ký tự`)}
        ${field('Mô tả chi tiết', textarea('content', '', { rows: 4, required: true, placeholder: 'Mô tả sự cố, vị trí, thời gian...' }))}
        ${field('Ảnh minh hoạ (tuỳ chọn)', html`<input type="file" name="image" accept="image/*" class="input !py-2 file:mr-3 file:rounded-full file:border-0 file:bg-brand-sand file:px-3 file:py-1 file:text-xs file:font-bold" data-testid="issue-image" />`, 'Ảnh JPG / PNG, tối đa 10MB')}
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
          <button type="submit" class="btn-primary" data-testid="issue-submit">${icon('send', 'w-4 h-4')} Gửi báo cáo</button>
        </div>
      </form>`,
    actions: {
      'submit-report': async form => {
        const d = readForm(form);
        const image = form.querySelector('[name=image]').files[0];
        const errors = {};
        if (!d.category) errors.category = 'Chọn loại sự cố';
        if (!d.title) errors.title = 'Nhập tiêu đề';
        else if (d.title.length > TITLE_MAX) errors.title = `Tối đa ${TITLE_MAX} ký tự`;
        if (!d.content) errors.content = 'Nhập nội dung';
        if (image && image.size > 10 * 1024 * 1024) errors.image = 'Ảnh tối đa 10MB';
        if (image && !image.type.startsWith('image/')) errors.image = 'Chỉ nhận file ảnh';
        showFormErrors(form, { fields: errors });
        if (Object.keys(errors).length) return;
        const res = await withBusy(form, () => issueApi.create({ category: d.category, title: d.title, content: d.content }, image));
        if (res) {
          toast('Đã gửi báo cáo, bạn sẽ nhận thông báo khi có phản hồi');
          modal.close();
          onDone?.();
        }
      }
    }
  });
}

// ---------- Báo cáo của tôi ----------
function myReports(list) {
  if (!list.length) return emptyState('Bạn chưa gửi báo cáo sự cố nào', 'shield-check');
  const sorted = [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return html`
    <div class="space-y-3" data-testid="my-reports">
      ${sorted.map(r => html`
        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2"><span class="font-bold">${r.title}</span>${statusBadge(r.status)}</div>
              <div class="text-xs text-slate-500 mt-0.5">#${r.reportId} · ${categoryLabel(r)} · ${DESK[r.desk] || r.desk} xử lý · ${dateTime(r.createdAt)}</div>
            </div>
            ${r.status === 'OPEN' ? html`<button type="button" class="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" data-action="withdraw" data-id="${r.reportId}" data-testid="withdraw">${icon('undo-2', 'w-3.5 h-3.5')} Rút báo cáo</button>` : ''}
          </div>
          <p class="text-sm text-slate-700 mt-2 whitespace-pre-line">${r.content}</p>
          ${r.imageUrl ? html`<a href="${r.imageUrl}" target="_blank" rel="noopener" class="inline-block mt-2"><img src="${r.imageUrl}" alt="Ảnh sự cố" class="h-24 rounded-xl border border-brand-line object-cover" /></a>` : ''}
          ${r.response ? html`
            <div class="mt-3 rounded-xl bg-brand-sand/60 p-3 text-sm">
              <div class="text-xs font-bold text-brand-deep mb-0.5">${icon('message-circle-reply', 'w-3.5 h-3.5 inline -mt-0.5')} Phản hồi${r.handledByName ? ` từ ${r.handledByName}` : ''}</div>
              <div class="whitespace-pre-line text-slate-700">${r.response}</div>
            </div>` : ''}
        </div>`)}
    </div>`;
}

// ---------- Xử lý (Lễ tân / Quản lý) ----------
function handleFilters(s, isManager) {
  const cats = isManager ? ALL_CATEGORIES : ALL_CATEGORIES.filter(c => c[2] === 'RECEPTION');
  return html`
    <div class="flex flex-col lg:flex-row lg:flex-wrap gap-2 p-4 border-b border-slate-100" data-testid="issue-filters">
      ${isManager ? html`
        <select class="input lg:w-40" name="desk" data-action="filter">
          <option value="">Mọi nơi nhận</option>
          ${Object.entries(DESK).map(([v, l]) => html`<option value="${v}" ${s.filters.desk === v ? 'selected' : ''}>${l} xử lý</option>`)}
        </select>` : ''}
      <select class="input lg:w-56" name="category" data-action="filter">
        <option value="">Mọi loại sự cố</option>
        ${cats.map(([v, l, , ]) => html`<option value="${v}" ${s.filters.category === v ? 'selected' : ''}>${l} (${roleLabel(v.startsWith('MEMBER') ? 'MEMBER' : v.startsWith('COACH') ? 'COACH' : 'RECEPTIONIST')})</option>`)}
      </select>
      <input class="input lg:w-40" type="date" name="fromDate" value="${s.filters.fromDate}" data-action="filter" aria-label="Từ ngày" ${s.filters.toDate ? `max="${s.filters.toDate}"` : ''} />
      <input class="input lg:w-40" type="date" name="toDate" value="${s.filters.toDate}" data-action="filter" aria-label="Đến ngày" ${s.filters.fromDate ? `min="${s.filters.fromDate}"` : ''} />
      <div class="relative flex-1 min-w-[12rem]">
        <span class="absolute left-3 top-2.5 text-slate-400">${icon('search', 'w-4 h-4')}</span>
        <input class="input pl-9" name="keyword" data-action="keyword" data-live value="${s.filters.keyword}" placeholder="Tìm tiêu đề, nội dung, người gửi..." />
      </div>
    </div>`;
}

function handleView(s, isManager) {
  const page = s.page || {};
  const rows = page.content || [];
  return html`
    ${tabs([['', 'Tất cả'], ['OPEN', 'Mới gửi'], ['IN_PROGRESS', 'Đang xử lý'], ['RESOLVED', 'Đã xử lý'], ['REJECTED', 'Từ chối'], ['CANCELLED', 'Đã rút']]
      .map(([id, label]) => ({ id, label, count: id ? s.counts[id] : s.counts.ALL })), s.statusTab, 'status-tab')}
    <div class="card" data-testid="issue-table">
      ${handleFilters(s, isManager)}
      ${rows.length ? html`${table({
        columns: [{ label: 'Sự cố' }, { label: 'Người gửi' }, { label: 'Nơi xử lý' }, { label: 'Trạng thái' }, { label: 'Người xử lý' }, { label: 'Gửi lúc' }, { label: '', cls: 'text-right' }],
        rows: rows.map(r => [
          html`<div class="font-semibold max-w-xs truncate">${r.title}</div><div class="text-xs text-slate-500">#${r.reportId} · ${categoryLabel(r)}</div>`,
          html`<div class="text-sm font-semibold">${r.reporterName || '—'}</div><div class="text-xs text-slate-500">${roleLabel(r.reporterRole)}${r.reporterPhone ? ` · ${phoneText(r.reporterPhone)}` : ''}</div>`,
          html`<span class="text-xs font-bold px-2 py-0.5 rounded-full ${r.desk === 'MANAGER' ? 'bg-violet-50 text-violet-700' : 'bg-teal-50 text-teal-700'}">${DESK[r.desk] || r.desk}</span>`,
          statusBadge(r.status),
          handlerCell(r),
          html`<span class="text-xs whitespace-nowrap">${dateTime(r.createdAt)}</span>`,
          html`<div class="flex justify-end"><button type="button" class="btn-ghost btn-sm" data-action="open-report" data-id="${r.reportId}" data-testid="open-report">${icon(viewOnly(r, isManager) ? 'eye' : 'clipboard-pen', 'w-3.5 h-3.5')} ${viewOnly(r, isManager) ? 'Xem' : 'Xử lý'}</button></div>`
        ])
      })}${pagination(page, { unit: 'báo cáo' })}` : emptyState('Không có báo cáo phù hợp', 'shield-check')}
    </div>`;
}

// Lễ tân chỉ xử lý báo cáo ở quầy; báo cáo đã chuyển lên Quản lý thì chỉ xem để theo dõi
const viewOnly = (r, isManager) => closed(r) || (!isManager && r.desk !== 'RECEPTION');
const RESPONSE_MAX = 1000;
const REASON_MAX = 500;

// Người xử lý cuối cùng; báo cáo lễ tân đã chuyển lên thì ghi thêm người chuyển
function handlerCell(r) {
  return html`<div class="text-sm">${r.handledByName ? html`<b>${r.handledByName}</b>` : html`<span class="text-slate-400">Chưa có</span>`}</div>
    ${r.escalatedByName ? html`<div class="text-xs text-slate-500">Chuyển lên: ${r.escalatedByName}</div>` : ''}`;
}

function reportDetail(r, { canAct, canEscalate }) {
  return html`
    <div class="space-y-4" data-testid="issue-detail">
      <div class="flex flex-wrap items-center gap-2">${statusBadge(r.status)}<span class="text-xs text-slate-500">#${r.reportId} · ${categoryLabel(r)} · ${DESK[r.desk] || r.desk} xử lý</span></div>
      <div>
        <div class="font-display text-2xl font-extrabold text-brand-dark leading-tight">${r.title}</div>
        <p class="text-sm text-slate-700 mt-1 whitespace-pre-line">${r.content}</p>
      </div>
      ${r.imageUrl ? html`<a href="${r.imageUrl}" target="_blank" rel="noopener"><img src="${r.imageUrl}" alt="Ảnh sự cố" class="max-h-64 rounded-2xl border border-brand-line object-contain" /></a>` : ''}
      <div class="grid sm:grid-cols-2 gap-3 text-sm rounded-2xl bg-brand-sand/60 p-3">
        <div><div class="text-xs text-slate-500">Người gửi</div><b>${r.reporterName || '—'}</b> <span class="text-xs text-slate-500">(${roleLabel(r.reporterRole)})</span></div>
        <div><div class="text-xs text-slate-500">Liên hệ</div>${phoneText(r.reporterPhone)}${r.reporterEmail ? html`<div class="text-xs text-slate-500">${r.reporterEmail}</div>` : ''}</div>
        <div><div class="text-xs text-slate-500">Gửi lúc</div>${dateTime(r.createdAt)}</div>
        <div><div class="text-xs text-slate-500">Người xử lý</div>${r.handledByName ? html`<b>${r.handledByName}</b><div class="text-xs text-slate-500">${dateTime(r.handledAt)}</div>` : html`<span class="text-slate-400">Chưa có</span>`}</div>
        ${r.escalatedByName ? html`<div><div class="text-xs text-slate-500">Chuyển lên Quản lý</div><b>${r.escalatedByName}</b><div class="text-xs text-slate-500">${dateTime(r.escalatedAt)}</div></div>` : ''}
        ${r.escalateReason ? html`<div class="sm:col-span-2"><div class="text-xs text-slate-500">Lý do chuyển (nội bộ)</div><div class="whitespace-pre-line">${r.escalateReason}</div></div>` : ''}
      </div>
      ${r.response ? html`<div class="rounded-xl border border-brand-line p-3 text-sm"><div class="text-xs font-bold text-slate-500 mb-0.5">${closed(r) ? 'Phản hồi' : 'Phản hồi gần nhất'}${r.handledByName ? ` · ${r.handledByName}` : ''}</div><div class="whitespace-pre-line">${r.response}</div></div>` : ''}
      ${closed(r) ? '' : actionBar(r, { canAct, canEscalate })}
    </div>`;
}

// Nút theo trạng thái: Mới gửi -> Nhận xử lý / Từ chối; Đang xử lý -> Gửi cập nhật / Hoàn tất / Từ chối
function actionBar(r, { canAct, canEscalate }) {
  if (!canAct) {
    return html`<div class="rounded-xl bg-violet-50 text-violet-800 text-sm p-3 flex gap-2">${icon('info', 'w-4 h-4 shrink-0 mt-0.5')}<span>Báo cáo đã chuyển lên Quản lý, bạn chỉ xem để theo dõi. Kết quả sẽ hiện ở đây khi Quản lý xử lý xong.</span></div>`;
  }
  const btn = (action, ic, label, cls = 'btn-secondary') => html`<button type="button" class="${cls}" data-action="${action}" data-testid="${action}">${icon(ic, 'w-4 h-4')} ${label}</button>`;
  return html`
    <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
      ${canEscalate ? btn('escalate', 'arrow-up-right', 'Chuyển lên Quản lý') : ''}
      ${btn('reject', 'x-circle', 'Từ chối', 'btn-secondary text-rose-600 hover:bg-rose-50')}
      ${r.status === 'OPEN'
        ? btn('accept', 'hand', 'Nhận xử lý', 'btn-primary')
        : html`${btn('update', 'message-square-plus', 'Gửi cập nhật')}${btn('resolve', 'check-circle-2', 'Hoàn tất', 'btn-primary')}`}
    </div>`;
}

// Mỗi hành động 1 popup riêng: đóng báo cáo (Hoàn tất / Từ chối) bắt buộc phản hồi mới và có câu xác nhận
const RESPOND = {
  IN_PROGRESS: { title: 'Nhận xử lý', submitText: 'Gửi', success: 'Đã cập nhật báo cáo', required: false },
  RESOLVED: { title: 'Hoàn tất báo cáo', submitText: 'Hoàn tất', success: 'Đã hoàn tất báo cáo', required: true, closes: true },
  REJECTED: { title: 'Từ chối báo cáo', submitText: 'Từ chối', success: 'Đã từ chối báo cáo', required: true, closes: true }
};

function openReport(id, role, onChange) {
  let report = null;
  const respond = status => {
    const cfg = RESPOND[status];
    // đang xử lý mà gửi thêm cập nhật thì bắt buộc có nội dung (BE chặn gửi lại cùng trạng thái không kèm phản hồi)
    const required = cfg.required || report.status === status;
    const title = report.status === 'IN_PROGRESS' && status === 'IN_PROGRESS' ? 'Gửi cập nhật cho người gửi' : cfg.title;
    openFormModal({
      title: `${title} #${report.reportId}`,
      fields: html`
        ${cfg.closes ? html`<div class="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">Báo cáo sẽ được đóng và gửi kết quả cho người báo cáo. Sau khi đóng không chỉnh sửa được nữa.</div>` : ''}
        ${field(required ? 'Phản hồi cho người gửi' : 'Ghi chú cho người gửi (tuỳ chọn)', textarea('response', '', { rows: 4, placeholder: status === 'REJECTED' ? 'Lý do từ chối...' : 'Người gửi nhận được thông báo kèm nội dung này' }), `Tối đa ${RESPONSE_MAX} ký tự`)}`,
      validate: d => {
        const text = String(d.response || '').trim();
        if (required && !text) return { response: status === 'REJECTED' ? 'Nhập lý do từ chối để báo cho người gửi' : 'Nhập phản hồi cho người gửi' };
        return text.length > RESPONSE_MAX ? { response: `Tối đa ${RESPONSE_MAX} ký tự` } : {};
      },
      submitText: cfg.submitText, success: cfg.success,
      submit: d => issueApi.setStatus(report.reportId, status, String(d.response || '').trim() || undefined),
      onDone: () => { modal.close(); onChange(); }
    });
  };
  const modal = openModal({
    title: 'Báo cáo sự cố',
    size: 'max-w-2xl',
    body: html`<div class="py-10 text-center text-slate-400 text-sm">Đang tải...</div>`,
    actions: {
      accept: () => respond('IN_PROGRESS'),
      update: () => respond('IN_PROGRESS'),
      resolve: () => respond('RESOLVED'),
      reject: () => respond('REJECTED'),
      // lễ tân chuyển báo cáo ở quầy lên Quản lý, lý do tuỳ chọn
      escalate: () => openFormModal({
        title: `Chuyển báo cáo #${report.reportId} lên Quản lý`,
        fields: field('Lý do chuyển', textarea('reason', '', { rows: 3, placeholder: 'VD: cần duyệt chi phí sửa chữa, vượt quyền quầy...' }), `Tuỳ chọn, tối đa ${REASON_MAX} ký tự. Chỉ Quản lý thấy, người gửi không nhận thông báo khi chuyển cấp`),
        validate: d => (String(d.reason || '').length > REASON_MAX ? { reason: `Tối đa ${REASON_MAX} ký tự` } : {}),
        submitText: 'Chuyển lên', success: 'Đã chuyển báo cáo lên Quản lý',
        submit: d => issueApi.escalate(report.reportId, d.reason || undefined),
        onDone: () => { modal.close(); onChange(); }
      })
    }
  });
  issueApi.get(id)
    .then(r => {
      report = r;
      const canAct = role === 'CENTER_MANAGER' || r.desk === 'RECEPTION';
      modal.setBody(reportDetail(r, { canAct, canEscalate: role === 'RECEPTIONIST' && r.desk === 'RECEPTION' }));
    })
    .catch(err => { modal.close(); toast(err.message, 'error'); });
}

// ---------- Trang ----------
const EMPTY_FILTERS = { desk: '', category: '', fromDate: '', toDate: '', keyword: '' };

export default function IssuesPage(el) {
  const role = session.role();
  const canHandle = role === 'RECEPTIONIST' || role === 'CENTER_MANAGER';
  const canSubmit = role !== 'CENTER_MANAGER';
  const isManager = role === 'CENTER_MANAGER';
  let timer = null;
  let page = null;
  const onPush = () => page?.reload();
  window.addEventListener('sc:notification', onPush);

  const dispose = mountPage(el, {
    state: { tab: canHandle ? 'handle' : 'mine', statusTab: '', filters: { ...EMPTY_FILTERS }, pageNo: 0, pageSize: DEFAULT_PAGE_SIZE, counts: {}, mine: [] },
    load: async ctx => {
      page = ctx;
      const s = ctx.state;
      const out = {};
      if (canSubmit) out.mine = await issueApi.mine().catch(() => []);
      if (canHandle) {
        const f = s.filters;
        const base = { desk: f.desk || undefined, category: f.category || undefined, fromDate: f.fromDate || undefined, toDate: f.toDate || undefined, keyword: f.keyword.trim() || undefined };
        const count = status => issueApi.list({ ...base, status, size: 1 }).then(p => p.totalElements).catch(() => undefined);
        const [list, ALL, OPEN, IN_PROGRESS, RESOLVED, REJECTED, CANCELLED] = await Promise.all([
          issueApi.list({ ...base, status: s.statusTab || undefined, page: s.pageNo, size: s.pageSize }),
          count(undefined), count('OPEN'), count('IN_PROGRESS'), count('RESOLVED'), count('REJECTED'), count('CANCELLED')
        ]);
        Object.assign(out, { page: list, counts: { ALL, OPEN, IN_PROGRESS, RESOLVED, REJECTED, CANCELLED } });
      }
      return out;
    },
    view: s => {
      const openMine = s.mine.filter(r => !closed(r)).length;
      return html`
        ${pageHeader(canHandle ? 'Sự cố & phản ánh' : 'Báo cáo sự cố',
          canHandle ? (isManager ? 'Báo cáo từ hội viên, HLV và lễ tân. Lễ tân chuyển lên những việc vượt quyền quầy.' : 'Xử lý báo cáo gửi về quầy lễ tân, chuyển lên Quản lý khi cần.') : 'Thiết bị hỏng, vệ sinh, phản ánh... gửi trực tiếp tới bộ phận phụ trách',
          canSubmit ? html`<button type="button" class="btn-primary" data-action="new-report" data-testid="new-report">${icon('siren', 'w-4 h-4')} Gửi báo cáo</button>` : '')}
        ${canHandle ? html`
          <div class="grid sm:grid-cols-3 gap-4 mb-6">
            ${statCard('Mới gửi', s.counts.OPEN ?? '—', 'inbox', 'amber')}
            ${statCard('Đang xử lý', s.counts.IN_PROGRESS ?? '—', 'loader', 'sky')}
            ${statCard('Đã xử lý', s.counts.RESOLVED ?? '—', 'check-circle-2', 'emerald')}
          </div>` : ''}
        ${canHandle && canSubmit ? html`<div>${tabs([{ id: 'handle', label: 'Cần xử lý', count: s.counts.OPEN }, { id: 'mine', label: 'Tôi đã gửi', count: openMine || undefined }], s.tab)}</div>` : ''}
        ${s.tab === 'handle' && canHandle ? handleView(s, isManager) : myReports(s.mine)}`;
    },
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      'status-tab': (t, e, ctx) => { ctx.state.statusTab = t.dataset.tab; ctx.state.pageNo = 0; ctx.reload(); },
      filter: (t, e, ctx) => { ctx.state.filters[t.name] = t.value; ctx.state.pageNo = 0; ctx.reload(); },
      keyword: (t, e, ctx) => {
        ctx.state.filters.keyword = t.value;
        clearTimeout(timer);
        timer = setTimeout(() => { ctx.state.pageNo = 0; ctx.reload(); }, 350);
      },
      ...pagerActions({ server: true }),
      'new-report': (t, e, ctx) => openReportForm(role, () => { if (canHandle) ctx.state.tab = 'mine'; ctx.reload(); }),
      'open-report': (t, e, ctx) => openReport(t.dataset.id, role, () => ctx.reload()),
      withdraw: async (btn, e, ctx) => {
        if (!(await confirmDialog('Rút báo cáo này? Bộ phận xử lý sẽ không nhận được nữa.', { title: 'Rút báo cáo', confirmText: 'Rút báo cáo', danger: true }))) return;
        const res = await withBusy(btn, () => issueApi.cancel(btn.dataset.id));
        if (res !== undefined) { toast('Đã rút báo cáo'); ctx.reload(); }
      }
    }
  });
  return () => {
    window.removeEventListener('sc:notification', onPush);
    clearTimeout(timer);
    dispose();
  };
}
