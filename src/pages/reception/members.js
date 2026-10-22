import { html, icon, readForm } from '../../core/dom.js';
import { pageHeader, table, openModal, field, input, select, textarea, GENDER_OPTIONS, showFormErrors, toast, emptyState } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { receptionApi } from '../../api/endpoints.js';
import { fullName, genderLabel, badge } from '../../core/format.js';
import { memberAvatar } from '../../components/memberPicker.js';
import { openSellPackage } from '../../components/sellPackage.js';

function view(s) {
  const list = s.keyword.trim().length >= 2 ? s.results : s.all;
  const searching = s.keyword.trim().length >= 2;
  return html`
    ${pageHeader('Hội viên', 'Tra cứu, đăng ký mới và bán gói tại quầy', html`
      <button type="button" class="btn bg-teal-600 text-white hover:bg-teal-700" data-action="walk-in" data-testid="walk-in-btn">${icon('user-plus', 'w-4 h-4')} Đăng ký hội viên mới</button>`)}
    <div class="card p-4 mb-5">
      <div class="relative">
        <span class="absolute left-3 top-3 text-slate-400">${icon('search', 'w-5 h-5')}</span>
        <input class="input pl-11 !py-3 !text-base" name="keyword" data-action="search" data-live value="${s.keyword}"
          placeholder="Tìm theo tên, số điện thoại hoặc email..." autocomplete="off" data-testid="member-search" />
      </div>
      <div class="text-xs text-slate-500 mt-2">
        ${searching ? (s.searching ? 'Đang tìm...' : `Tìm thấy ${list.length} hội viên`) : `Tổng ${s.all.length} hội viên · gõ ít nhất 2 ký tự để tìm`}
      </div>
    </div>
    <div class="card" data-testid="member-table">
      ${list.length ? table({
        columns: [{ label: 'Hội viên' }, { label: 'Số điện thoại' }, { label: 'Giới tính' }, { label: 'Tài khoản' }, { label: '', cls: 'text-right' }],
        rows: list.map(m => [
          html`<a href="#/reception/members/${m.memberId}" class="flex items-center gap-3 group" data-testid="member-row">
            ${memberAvatar(m)}
            <span class="min-w-0"><span class="block font-semibold group-hover:text-teal-700">${fullName(m)}</span><span class="block text-xs text-slate-500 truncate">#${m.memberId} · ${m.email}</span></span>
          </a>`,
          html`<span class="font-mono text-sm">${m.phone}</span>`,
          genderLabel(m.gender),
          badge(m.status),
          html`<div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary btn-sm" data-action="sell" data-id="${m.memberId}">${icon('package-plus', 'w-3.5 h-3.5')} Bán gói</button>
            <a href="#/reception/members/${m.memberId}" class="btn-ghost btn-sm">Chi tiết ${icon('chevron-right', 'w-3.5 h-3.5')}</a>
          </div>`
        ])
      }) : emptyState(searching ? `Không tìm thấy hội viên "${s.keyword}"` : 'Chưa có hội viên nào', 'users')}
    </div>`;
}

function walkInForm() {
  return html`
    <form data-action="create" class="space-y-4" novalidate data-testid="walk-in-form">
      <div class="grid grid-cols-2 gap-3">
        ${field('Họ', input('firstName', { required: true, placeholder: 'Trần' }))}
        ${field('Tên', input('lastName', { required: true, placeholder: 'Bình' }))}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${field('Giới tính', select('gender', GENDER_OPTIONS, '', { required: true, placeholder: 'Chọn' }))}
        ${field('Số điện thoại', input('phone', { type: 'tel', required: true, placeholder: '0912345678' }))}
      </div>
      ${field('Email', input('email', { type: 'email', required: true, placeholder: 'khach@example.com' }), 'Dùng để hội viên đăng nhập')}
      ${field('Mục tiêu tập luyện', textarea('trainingGoal', '', { rows: 2, placeholder: 'VD: Giảm cân, tăng cơ...' }))}
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" data-action="cancel" class="btn-secondary">Hủy</button>
        <button type="submit" class="btn bg-teal-600 text-white hover:bg-teal-700">Tạo hội viên</button>
      </div>
    </form>`;
}

function createdView(res) {
  const m = res.member;
  return html`
    <div class="text-center" data-testid="walk-in-success">
      <span class="mx-auto w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center">${icon('user-check', 'w-7 h-7')}</span>
      <div class="text-lg font-extrabold mt-3">Đã tạo hội viên ${fullName(m)}</div>
      <div class="text-sm text-slate-500">#${m.memberId} · ${m.email}</div>
    </div>
    <div class="mt-5 rounded-2xl bg-slate-900 text-white p-4">
      <div class="text-xs text-white/60">Mật khẩu tạm thời (chỉ hiện một lần, hãy đưa cho khách)</div>
      <div class="flex items-center justify-between gap-3 mt-1">
        <span class="font-mono text-2xl tracking-widest" data-testid="temp-password">${res.temporaryPassword}</span>
        <button type="button" class="btn-ghost btn-sm text-white hover:bg-white/10" data-action="copy-pass" data-value="${res.temporaryPassword}">${icon('copy', 'w-4 h-4')} Copy</button>
      </div>
    </div>
    <div class="flex flex-wrap justify-end gap-2 mt-6">
      <button type="button" class="btn-secondary" data-action="view-profile" data-id="${m.memberId}">Xem hồ sơ</button>
      <button type="button" class="btn bg-teal-600 text-white hover:bg-teal-700" data-action="sell-new" data-testid="sell-new">${icon('package-plus', 'w-4 h-4')} Bán gói ngay</button>
    </div>`;
}

export function validateWalkIn(d) {
  const e = {};
  ['firstName', 'lastName', 'gender', 'phone', 'email'].forEach(k => { if (!d[k]) e[k] = 'Không được để trống'; });
  if (d.phone && !/^0\d{9}$/.test(d.phone)) e.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = 'Email không hợp lệ';
  return e;
}

export default function ReceptionMembers(el) {
  let timer = null;
  const dispose = mountPage(el, {
    state: { keyword: '', results: [], searching: false },
    load: async () => ({ all: await receptionApi.allMembers() }),
    view,
    actions: {
      search: (t, e, ctx) => {
        ctx.state.keyword = t.value;
        clearTimeout(timer);
        if (t.value.trim().length < 2) {
          ctx.set({ results: [], searching: false });
          return;
        }
        ctx.set({ searching: true });
        const kw = t.value.trim();
        timer = setTimeout(async () => {
          try {
            const results = await receptionApi.search(kw);
            if (ctx.state.keyword.trim() === kw) ctx.set({ results, searching: false });
          } catch (err) {
            ctx.set({ results: [], searching: false });
            toast(err.message, 'error');
          }
        }, 300);
      },
      sell: (btn, e, ctx) => {
        const m = [...ctx.state.all, ...ctx.state.results].find(x => String(x.memberId) === btn.dataset.id);
        openSellPackage({ member: m });
      },
      'walk-in': (btn, e, ctx) => {
        let created = null;
        const modal = openModal({
          title: 'Đăng ký hội viên tại quầy',
          body: walkInForm(),
          actions: {
            create: async form => {
              const data = readForm(form);
              const errors = validateWalkIn(data);
              showFormErrors(form, { fields: errors });
              if (Object.keys(errors).length) return;
              const submit = form.querySelector('[type=submit]');
              submit.disabled = true;
              try {
                created = await receptionApi.registerWalkIn(data);
                modal.setBody(createdView(created));
                ctx.reload();
              } catch (err) {
                showFormErrors(form, err);
                toast(err.message, 'error');
                submit.disabled = false;
              }
            },
            'copy-pass': async b => {
              try { await navigator.clipboard.writeText(b.dataset.value); toast('Đã copy mật khẩu', 'info'); } catch { /* bỏ qua */ }
            },
            'view-profile': b => {
              modal.close();
              window.location.hash = `#/reception/members/${b.dataset.id}`;
            },
            'sell-new': () => {
              modal.close();
              openSellPackage({ member: created.member });
            }
          }
        });
      }
    }
  });
  return () => {
    clearTimeout(timer);
    dispose();
  };
}
