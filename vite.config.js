import { defineConfig } from 'vite';

const DEV_PORT = 5173;

export default defineConfig({
  base: './',
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
