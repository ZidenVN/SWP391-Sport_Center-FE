import { session } from './session.js';

// Nhận thông báo realtime từ BE qua STOMP trên WebSocket thuần (endpoint /ws).
// BE xác thực ở frame CONNECT bằng header Authorization, rồi đẩy tới /user/queue/notifications.
// Tự viết STOMP tối giản (CONNECT / SUBSCRIBE / MESSAGE / heartbeat) để không thêm thư viện.

const DESTINATION = '/user/queue/notifications';
const NUL = '\0';
const HEARTBEAT_MS = 20000;
const MAX_RETRY_MS = 30000;

let ws = null;
let token = null;
let retryMs = 2000;
let retryTimer = null;
let beatTimer = null;
let stopped = true;
const listeners = new Set();

// /api/v1 (proxy của Vite) -> ws://<host hiện tại>/ws; URL tuyệt đối (vd Railway) -> wss://<host BE>/ws
function socketUrl() {
  const base = (import.meta.env?.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
  const url = new URL(base, window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  return url.toString();
}

const frame = (command, headers = {}, body = '') =>
  `${command}\n${Object.entries(headers).map(([k, v]) => `${k}:${v}`).join('\n')}\n\n${body}${NUL}`;

function parseFrame(raw) {
  const split = raw.indexOf('\n\n');
  const head = (split < 0 ? raw : raw.slice(0, split)).split('\n');
  const headers = {};
  head.slice(1).forEach(line => {
    const i = line.indexOf(':');
    if (i > 0 && !(line.slice(0, i) in headers)) headers[line.slice(0, i)] = line.slice(i + 1);
  });
  return { command: head[0], headers, body: split < 0 ? '' : raw.slice(split + 2) };
}

function onFrame(f) {
  if (f.command === 'CONNECTED') {
    retryMs = 2000;
    ws.send(frame('SUBSCRIBE', { id: 'sub-notifications', destination: DESTINATION }));
  } else if (f.command === 'MESSAGE') {
    let payload = null;
    try { payload = JSON.parse(f.body); } catch { return; }
    listeners.forEach(fn => { try { fn(payload); } catch { /* lỗi 1 listener không chặn listener khác */ } });
  } else if (f.command === 'ERROR') {
    // token hết hạn / bị vô hiệu: thôi kết nối lại tới khi đăng nhập lại
    stopped = true;
    ws?.close();
  }
}

function open() {
  clearTimeout(retryTimer);
  if (stopped || !session.isLoggedIn() || typeof WebSocket === 'undefined') return;
  token = session.token();
  let socket;
  try {
    socket = new WebSocket(socketUrl(), ['v12.stomp', 'v11.stomp']);
  } catch {
    scheduleRetry();
    return;
  }
  ws = socket;
  socket.onopen = () => {
    socket.send(frame('CONNECT', { 'accept-version': '1.2,1.1', host: window.location.hostname, 'heart-beat': `${HEARTBEAT_MS},0`, Authorization: `Bearer ${token}` }));
    clearInterval(beatTimer);
    beatTimer = setInterval(() => { if (socket.readyState === WebSocket.OPEN) socket.send('\n'); }, HEARTBEAT_MS);
  };
  socket.onmessage = e => {
    String(e.data).split(NUL).forEach(chunk => {
      const raw = chunk.replace(/^\n+/, '');
      if (raw) onFrame(parseFrame(raw));
    });
  };
  socket.onclose = () => {
    clearInterval(beatTimer);
    if (ws === socket) ws = null;
    scheduleRetry();
  };
}

function scheduleRetry() {
  if (stopped || !session.isLoggedIn()) return;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(open, retryMs);
  retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
}

// Gọi khi dựng khung trang đã đăng nhập; đổi tài khoản thì mở lại kết nối với token mới
export function startRealtime() {
  if (!stopped && ws && token === session.token()) return;
  stopRealtime();
  stopped = false;
  retryMs = 2000;
  open();
}

export function stopRealtime() {
  stopped = true;
  clearTimeout(retryTimer);
  clearInterval(beatTimer);
  const socket = ws;
  ws = null;
  if (socket) {
    try { if (socket.readyState === WebSocket.OPEN) socket.send(frame('DISCONNECT')); } catch { /* bỏ qua */ }
    socket.close();
  }
}

// fn(payload: NotificationResponseDTO) -> hàm hủy đăng ký
export function onNotification(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
