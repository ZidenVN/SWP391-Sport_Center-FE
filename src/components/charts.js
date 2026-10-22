import { money } from '../core/format.js';

// Bảng màu dùng chung cho biểu đồ, cùng tông màu thương hiệu
export const CHART_COLORS = ['#469B7E', '#F59E0B', '#0EA5E9', '#F43F5E', '#8B5CF6', '#64748B'];

// Chart.js nạp kiểu defer từ CDN -> đợi có window.Chart rồi mới vẽ
function whenChartReady() {
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise(resolve => {
    const t = setInterval(() => {
      if (window.Chart) { clearInterval(t); resolve(window.Chart); }
    }, 50);
  });
}

// Vẽ lên canvas có id; canvas cũ bị render lại thì hủy chart cũ để không rò bộ nhớ
export async function drawChart(root, id, config) {
  const Chart = await whenChartReady();
  const canvas = root.querySelector(`#${id}`);
  if (!canvas) return null;
  Chart.getChart(canvas)?.destroy();
  return new Chart(canvas, {
    ...config,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family: 'Plus Jakarta Sans', weight: '600' }, boxWidth: 12 } } },
      ...config.options
    }
  });
}

export function revenueLine(points) {
  return {
    type: 'line',
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: 'Doanh thu',
        data: points.map(p => p.value),
        borderColor: CHART_COLORS[0],
        backgroundColor: 'rgba(70,155,126,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS[0]
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => money(c.parsed.y) } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => `${(v / 1e6).toLocaleString('vi-VN')}tr` }, grid: { color: '#F1F5F9' } },
        x: { grid: { display: false } }
      }
    }
  };
}

export function doughnut(labels, values, { formatter = money } = {}) {
  return {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: CHART_COLORS, borderWidth: 0 }] },
    options: {
      cutout: '68%',
      plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.label}: ${formatter(c.parsed)}` } } }
    }
  };
}

export function bars(labels, values, label, { color = CHART_COLORS[0], max } = {}) {
  return {
    type: 'bar',
    data: { labels, datasets: [{ label, data: values, backgroundColor: color, borderRadius: 8, maxBarThickness: 36 }] },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } }
    }
  };
}
