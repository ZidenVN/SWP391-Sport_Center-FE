import { defineConfig } from 'vite';
import os from 'os';

const DEV_PORT = 5173;

// IP LAN của máy chạy dev server: điện thoại cùng Wi-Fi quét QR thanh toán sẽ quay về địa chỉ này
// Ưu tiên 192.168.x (Wi-Fi/LAN thường gặp), sau đó 10.x, cuối cùng 172.16-31.x (hay là card ảo WSL/Hyper-V)
function lanAddress() {
  const priority = [/^192\.168\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./];
  const all = Object.values(os.networkInterfaces()).flat()
    .filter(net => net && net.family === 'IPv4' && !net.internal)
    .map(net => net.address);
  for (const re of priority) {
    const hit = all.find(a => re.test(a));
    if (hit) return hit;
  }
  return null;
}

const lan = lanAddress();

export default defineConfig({
  base: './',
  define: {
    __DEV_LAN_ORIGIN__: JSON.stringify(lan ? `http://${lan}:${DEV_PORT}` : '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: DEV_PORT,
    // cổng 5173 bận thì báo lỗi luôn thay vì lặng lẽ chạy 5174: Google (origin đã khai báo) và CORS của BE chỉ nhận đúng 5173
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Trình duyệt gọi /api cùng origin với dev server nên không cần CORS. Bỏ header Origin để BE
        // không từ chối khi mở FE qua IP LAN (vd điện thoại quét QR), vì CORS của BE chỉ cho localhost.
        configure: proxy => {
          proxy.on('proxyReq', proxyReq => proxyReq.removeHeader('origin'));
        }
      }
    }
  }
});
