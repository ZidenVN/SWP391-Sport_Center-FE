import { html, icon } from '../../core/dom.js';

export function authLayout(title, subtitle, content) {
  return html`
    <div class="min-h-screen grid lg:grid-cols-2">
      <div class="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-black">SC</div>
          <div class="font-extrabold tracking-tight">SPORT CENTER</div>
        </div>
        <div class="space-y-6 max-w-md">
          <h2 class="text-4xl font-extrabold leading-tight">Quản lý trung tâm thể thao trong một nơi.</h2>
          <ul class="space-y-3 text-emerald-100 text-sm">
            <li class="flex items-center gap-3">${icon('calendar-check', 'w-5 h-5')} Đặt lớp, xem lịch tập và tiến độ cá nhân</li>
            <li class="flex items-center gap-3">${icon('credit-card', 'w-5 h-5')} Mua và gia hạn gói tập qua VNPay</li>
            <li class="flex items-center gap-3">${icon('clipboard-list', 'w-5 h-5')} HLV điểm danh, giao giáo án, ghi nhận kết quả</li>
            <li class="flex items-center gap-3">${icon('bar-chart-3', 'w-5 h-5')} Báo cáo hội viên, lớp học và doanh thu</li>
          </ul>
        </div>
        <div class="text-xs text-emerald-200">SWP391 · Sports Center Management System</div>
      </div>
      <div class="flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md">
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">SC</div>
            <div class="font-extrabold tracking-tight">SPORT CENTER</div>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900">${title}</h1>
          <p class="text-sm text-slate-500 mt-1 mb-8">${subtitle}</p>
          ${content}
        </div>
      </div>
    </div>`;
}
