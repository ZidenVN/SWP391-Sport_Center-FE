import { html, icon, readForm } from '../../core/dom.js';
import { tabs, table, openModal, field, input, select, textarea, GENDER_OPTIONS, showFormErrors, toast, confirmDialog, withBusy } from '../../core/ui.js';
import { mountPage, settle } from '../../core/page.js';
import { receptionApi } from '../../api/endpoints.js';
import { fullName, genderLabel, badge, money, date, dateTime, timeRange, daysUntil, isFuture, paymentMethodLabel, toDate, phoneText } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openSellPackage } from '../../components/sellPackage.js';
import { openBookClass } from '../../components/bookClass.js';
import { openInvoice } from '../../components/invoice.js';
import { latestActive } from '../../components/billing.js';

function membershipCard(s) {
  const latest = latestActive(s.subscriptions);
  if (!s.current) {
    return html`
      <div class="rounded-2xl p-5 bg-rose-50 border border-rose-200" data-testid="membership-card" data-active="false">
        <div class="flex items-center gap-2 text-rose-700 font-bold">${icon('alert-circle', 'w-5 h-5')} Chưa có gói còn hiệu lực</div>
        <p class="text-sm text-rose-700/80 mt-1">${latest ? `Gói kế tiếp bắt đầu ${date(latest.startDate)}.` : 'Hội viên cần mua gói trước khi đặt lớp.'}</p>
        <button type="button" class="btn bg-rose-600 text-white hover:bg-rose-700 mt-4 w-full" data-action="sell">${icon('package-plus', 'w-4 h-4')} Bán gói</button>
      </div>`;
  }
  const left = daysUntil(latest.endDate);
  const warn = left <= 7;
  return html`
    <div class="rounded-2xl p-5 ${warn ? 'bg-amber-50 border border-amber-200' : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'}" data-testid="membership-card" data-active="true">
      <div class="text-xs font-bold uppercase tracking-wide ${warn ? 'text-amber-700' : 'text-teal-50'}">Gói đang dùng</div>
      <div class="text-lg font-extrabold mt-1">${s.current.packageName}</div>
      <div class="text-sm mt-1 ${warn ? 'text-amber-800' : 'text-teal-50'}">Tập được đến <b>${date(latest.endDate)}</b> · còn ${left} ngày</div>
      ${warn ? html`<div class="text-xs font-bold text-amber-700 mt-2">Sắp hết hạn — gợi ý khách gia hạn</div>` : ''}
      <button type="button" class="btn mt-4 w-full ${warn ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-white/20 hover:bg-white/30 text-white'}" data-action="sell">${icon('refresh-cw', 'w-4 h-4')} Gia hạn</button>
    </div>`;
}

function subsTab(s) {
  const subs = [...s.subscriptions].sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
  return table({
    columns: [{ label: 'Gói' }, { label: 'Hiệu lực' }, { label: 'Số tiền', cls: 'text-right' }, { label: 'Thanh toán' }, { label: 'Trạng thái' }],
    rows: subs.map(x => [
      html`<span class="font-semibold">${x.packageName}</span>`,
      html`${date(x.startDate)} → ${date(x.endDate)}`,
      money(x.amount),
      html`${paymentMethodLabel(x.paymentMethod)} ${x.paymentStatus ? badge(x.paymentStatus) : ''}`,
      badge(x.status)
    ]),
    empty: 'Hội viên chưa mua gói nào'
  });
}

function paymentsTab(s) {
  const pays = [...s.payments].sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate)));
  return table({
    columns: [{ label: 'Mã' }, { label: 'Gói' }, { label: 'Số tiền', cls: 'text-right' }, { label: 'Phương thức' }, { label: 'Thời gian' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
    rows: pays.map(p => [
      html`<span class="font-mono text-xs">#${p.paymentId}</span>`,
      p.packageName,
      money(p.amount),
      paymentMethodLabel(p.paymentMethod),
      dateTime(p.paymentDate),
      badge(p.status),
      p.status === 'COMPLETED' ? html`<button type="button" class="btn-ghost btn-sm" data-action="invoice" data-id="${p.paymentId}" data-testid="invoice-btn">${icon('printer', 'w-3.5 h-3.5')} Hóa đơn</button>` : ''
    ]),
    empty: 'Chưa có giao dịch'
  });
}

function classesTab(s) {
  const regs = [...s.registrations].sort((a, b) => toDate(b.startTime) - toDate(a.startTime));
  return html`
    <div class="flex justify-end p-4 pb-0">
      <button type="button" class="btn-secondary btn-sm" data-action="book">${icon('calendar-plus', 'w-3.5 h-3.5')} Đặt lớp hộ</button>
    </div>
    ${table({
      columns: [{ label: 'Lớp' }, { label: 'Thời gian' }, { label: 'Phòng' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
      rows: regs.map(r => [
        html`<div class="font-semibold">${r.subjectName}</div><div class="text-xs text-slate-500">HLV ${r.coachName}</div>`,
        html`${date(r.startTime)}<div class="text-xs text-slate-500">${timeRange(r.startTime, r.endTime)}</div>`,
        r.roomName,
        badge(r.status),
        r.status === 'REGISTERED' && isFuture(r.startTime)
          ? html`<button type="button" class="btn-ghost btn-sm text-rose-600" data-action="cancel-reg" data-id="${r.registrationId}" data-testid="cancel-reg">Hủy</button>` : ''
      ]),
      empty: 'Chưa đăng ký lớp nào'
    })}`;
}

function ticketsTab(s) {
  const list = [...s.tickets].sort((a, b) => String(b.createdDate).localeCompare(String(a.createdDate)));
  return html`
    <div class="flex justify-end p-4 pb-0">
      <button type="button" class="btn-secondary btn-sm" data-action="new-ticket">${icon('plus', 'w-3.5 h-3.5')} Tạo yêu cầu</button>
    </div>
    ${table({
      columns: [{ label: 'Nội dung' }, { label: 'Tạo lúc' }, { label: 'Trạng thái' }, { label: '', cls: 'text-right' }],
      rows: list.map(t => [
        html`<span class="whitespace-pre-line">${t.content}</span>`,
        dateTime(t.createdDate),
        badge(t.status),
        t.status === 'OPEN' ? html`<button type="button" class="btn-ghost btn-sm text-emerald-700" data-action="resolve" data-id="${t.ticketId}">${icon('check', 'w-3.5 h-3.5')} Đã xử lý</button>` : ''
      ]),
      empty: 'Chưa có yêu cầu hỗ trợ'
    })}`;
}

function view(s) {
  const m = s.member;
  const upcoming = s.registrations.filter(r => r.status === 'REGISTERED' && isFuture(r.startTime)).length;
  const openTickets = s.tickets.filter(t => t.status === 'OPEN').length;
  return html`
    <a href="#/reception/members" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-5">${icon('arrow-left', 'w-4 h-4')} Danh sách hội viên</a>
    <div class="grid lg:grid-cols-3 gap-6">
      <section class="card p-6 lg:col-span-2" data-testid="member-profile">
        <div class="flex flex-wrap items-start gap-4">
          ${memberAvatar(m, 'w-16 h-16 text-2xl')}
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-2xl font-extrabold">${fullName(m)}</h1>${badge(m.status)}
            </div>
            <div class="text-sm text-slate-500 mt-0.5">Mã hội viên #${m.memberId}</div>
          </div>
          <button type="button" class="btn-secondary btn-sm" data-action="edit">${icon('pencil', 'w-3.5 h-3.5')} Sửa thông tin</button>
        </div>
        <dl class="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div><dt class="text-xs text-slate-500">Số điện thoại</dt><dd class="font-semibold font-mono">${phoneText(m.phone)}</dd></div>
          <div class="sm:col-span-2"><dt class="text-xs text-slate-500">Email</dt><dd class="font-semibold break-all">${m.email}</dd></div>
          <div><dt class="text-xs text-slate-500">Giới tính</dt><dd class="font-semibold">${genderLabel(m.gender)}</dd></div>
          <div class="sm:col-span-2"><dt class="text-xs text-slate-500">Mục tiêu tập luyện</dt><dd class="font-semibold">${m.trainingGoal || '—'}</dd></div>
        </dl>
        <div class="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-100">
          <button type="button" class="btn bg-teal-600 text-white hover:bg-teal-700" data-action="sell" data-testid="detail-sell">${icon('package-plus', 'w-4 h-4')} Bán / gia hạn gói</button>
          <button type="button" class="btn-secondary" data-action="book" data-testid="detail-book">${icon('calendar-plus', 'w-4 h-4')} Đặt lớp hộ</button>
          <button type="button" class="btn-secondary" data-action="new-ticket" data-testid="detail-ticket">${icon('life-buoy', 'w-4 h-4')} Ghi nhận yêu cầu</button>
        </div>
      </section>
      <div>${membershipCard(s)}</div>
    </div>

    <div class="card mt-6">
      <div class="px-4 pt-2">
        ${tabs([
          { id: 'subs', label: 'Gói tập', count: s.subscriptions.length },
          { id: 'payments', label: 'Thanh toán', count: s.payments.length },
          { id: 'classes', label: 'Lớp học', count: upcoming },
          { id: 'tickets', label: 'Hỗ trợ', count: openTickets }
        ], s.tab)}
      </div>
      <div data-testid="tab-${s.tab}">
        ${s.tab === 'subs' ? subsTab(s) : ''}
        ${s.tab === 'payments' ? paymentsTab(s) : ''}
        ${s.tab === 'classes' ? classesTab(s) : ''}
        ${s.tab === 'tickets' ? ticketsTab(s) : ''}
      </div>
    </div>`;
}

function editForm(m) {
  return html`
    <form data-action="save" class="space-y-4" novalidate>
      <div class="grid grid-cols-2 gap-3">
        ${field('Họ', input('firstName', { value: m.firstName, required: true }))}
        ${field('Tên', input('lastName', { value: m.lastName, required: true }))}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${field('Giới tính', select('gender', GENDER_OPTIONS, (m.gender || '').toUpperCase(), { required: true }))}
        ${field('Số điện thoại', input('phone', { type: 'tel', value: m.phone, required: true }))}
      </div>
      ${field('Email', input('email', { type: 'email', value: m.email, required: true }))}
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
        <button type="submit" class="btn bg-teal-600 text-white hover:bg-teal-700">Lưu</button>
      </div>
    </form>`;
}

export default function ReceptionMemberDetail(el, { params, query }) {
  const id = params.id;
  return mountPage(el, {
    state: { tab: query.tab || 'subs' },
    load: async () => {
      const res = await settle({
        member: [() => receptionApi.member(id), null],
        subscriptions: [() => receptionApi.subscriptions(id), []],
        current: [() => receptionApi.currentSubscription(id), null],
        payments: [() => receptionApi.payments(id), []],
        registrations: [() => receptionApi.registrations(id), []],
        tickets: [() => receptionApi.tickets(id), []]
      });
      if (res.memberError) throw res.memberError;
      return res;
    },
    view,
    actions: {
      tab: (t, e, ctx) => ctx.set({ tab: t.dataset.tab }),
      sell: (t, e, ctx) => openSellPackage({ member: ctx.state.member, onDone: () => ctx.reload() }),
      book: (t, e, ctx) => openBookClass({ member: ctx.state.member, onDone: () => ctx.reload() }),
      invoice: btn => openInvoice(() => receptionApi.invoice(btn.dataset.id)),
      'cancel-reg': async (btn, e, ctx) => {
        if (!(await confirmDialog('Hủy đăng ký lớp này cho hội viên?', { title: 'Hủy đăng ký', confirmText: 'Hủy đăng ký', danger: true }))) return;
        const res = await withBusy(btn, () => receptionApi.cancel(id, btn.dataset.id));
        if (res) { toast('Đã hủy đăng ký lớp'); ctx.reload(); }
      },
      'new-ticket': (t, e, ctx) => {
        const modal = openModal({
          title: `Ghi nhận yêu cầu của ${fullName(ctx.state.member)}`,
          body: html`
            <form data-action="create-ticket" class="space-y-4" novalidate>
              ${field('Nội dung yêu cầu', textarea('content', '', { rows: 4, required: true, placeholder: 'VD: Thẻ tập bị lỗi, cần cấp lại...' }))}
              <div class="flex justify-end gap-2"><button type="button" data-action="cancel" class="btn-secondary">Hủy</button><button type="submit" class="btn bg-teal-600 text-white hover:bg-teal-700">Ghi nhận</button></div>
            </form>`,
          actions: {
            'create-ticket': async form => {
              const { content } = readForm(form);
              if (!content) { showFormErrors(form, { fields: { content: 'Vui lòng nhập nội dung' } }); return; }
              const res = await withBusy(form, () => receptionApi.createTicket(Number(id), content));
              if (res) { toast('Đã ghi nhận yêu cầu hỗ trợ'); modal.close(); ctx.set({ tab: 'tickets' }); ctx.reload(); }
            }
          }
        });
      },
      resolve: async (btn, e, ctx) => {
        const res = await withBusy(btn, () => receptionApi.resolveTicket(btn.dataset.id));
        if (res) { toast('Đã đánh dấu đã xử lý'); ctx.reload(); }
      },
      edit: (t, e, ctx) => {
        const m = ctx.state.member;
        const modal = openModal({
          title: 'Sửa thông tin hội viên',
          body: editForm(m),
          actions: {
            save: async form => {
              const data = readForm(form);
              const errors = {};
              ['firstName', 'lastName', 'gender', 'phone', 'email'].forEach(k => { if (!data[k]) errors[k] = 'Không được để trống'; });
              if (data.phone && !/^(0|\+84)[0-9]{9}$/.test(data.phone)) errors.phone = 'Số điện thoại không hợp lệ';
              showFormErrors(form, { fields: errors });
              if (Object.keys(errors).length) return;
              const res = await withBusy(form, () => receptionApi.updateMember(m.memberId, data));
              if (res) { toast('Đã cập nhật thông tin'); modal.close(); ctx.reload(); }
            }
          }
        });
      }
    }
  });
}
