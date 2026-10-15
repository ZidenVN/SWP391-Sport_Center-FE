// =========================================================================
// MANAGER FEATURE: DASHBOARD & REVENUE CHARTS
// =========================================================================

export function renderManagerDashboard() {
  const members = (appState.data && appState.data.members) ? appState.data.members : [];
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const invoices = (appState.data && appState.data.invoices) ? appState.data.invoices : [];
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const classes = (appState.data && appState.data.classes) ? appState.data.classes : [];

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(totalRevenue).toLocaleString()} <span class="text-xs font-normal text-slate-500">đ</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">&uarr; +14.8% so với tháng trước</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hội Viên Đang Hoạt Động</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${activeMembers} <span class="text-xs font-normal text-slate-500">/ ${members.length}</span></div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-1">Tỷ lệ duy trì thẻ: 85%</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt Check-in Hôm Nay</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${(appState.data?.checkinLogs || []).length * 15} <span class="text-xs font-normal text-slate-500">lượt</span></div>
          <div class="text-[11px] text-indigo-600 font-semibold mt-1">Giờ cao điểm: 18:00 - 20:00</div>
        </div>

        <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp Học Đang Mở</div>
          <div class="text-2xl font-black text-slate-900 mt-1">${classes.length} <span class="text-xs font-normal text-slate-500">lớp</span></div>
          <div class="text-[11px] text-slate-500 font-semibold mt-1">Tỷ lệ lấp đầy slot: 88%</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Biểu Đồ Xu Hướng Doanh Thu (7 Ngày Qua)</h3>
            <div class="text-xs text-slate-400">Doanh thu bán gói tập & thẻ hội viên</div>
          </div>
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Đơn vị: VNĐ</span>
        </div>
        <div class="h-64 relative">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

export function initChartsIfNeeded() {
  if (appState.currentRole !== 'MANAGER' || appState.currentTab !== 'dashboard') return;

  const tryRender = (retries = 5) => {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || typeof canvas.getContext !== 'function') return;

    if (typeof Chart === 'undefined') {
      if (retries > 0) {
        setTimeout(() => tryRender(retries - 1), 150);
      }
      return;
    }

    if (window._revenueChartInstance) {
      window._revenueChartInstance.destroy();
      window._revenueChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const dataValues = [12500000, 18200000, 15400000, 22100000, 28900000, 34500000, 31200000];

    window._revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh Thu Ngày (VNĐ)',
          data: dataValues,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => (context.parsed.y || 0).toLocaleString() + ' đ'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => (val / 1000000) + 'M'
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  };

  setTimeout(tryRender, 60);
}

const _g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
if (_g) {
  _g.renderManagerDashboard = renderManagerDashboard;
  _g.initChartsIfNeeded = initChartsIfNeeded;
}
