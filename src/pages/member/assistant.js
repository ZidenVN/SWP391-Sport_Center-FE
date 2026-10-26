import { html, icon, raw } from '../../core/dom.js';
import { pageHeader, toast } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { aiApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';
import { renderMarkdown } from '../../core/markdown.js';
import { dateTime, toDate } from '../../core/format.js';

// Trợ lý AI của hội viên (POST /ai/chat, GET /ai/conversations, GET /ai/conversations/{id}/messages).
// AI trả lời bằng dữ liệu thật của trung tâm; lịch sử trò chuyện lưu ở BE, chọn lại ở thanh bên.
const MAX_LEN = 2000;
const STARTERS = [
  'Trong 2 tuần tới có lớp Yoga nào còn chỗ không?',
  'Gói tập của tôi còn hạn tới khi nào?',
  'Lịch tập sắp tới của tôi?',
  'Tôi nên ăn gì để tăng cơ?'
];

// relative time ngắn cho thanh bên
function ago(value) {
  const d = toDate(value);
  if (!d) return '';
  const min = Math.round((Date.now() - d) / 60000);
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút trước`;
  if (min < 24 * 60) return `${Math.round(min / 60)} giờ trước`;
  return dateTime(value).slice(0, 10);
}

function sidebar(s) {
  return html`
    <aside class="lg:w-72 shrink-0 card p-3 flex flex-col lg:h-full min-h-0" data-testid="chat-sidebar">
      <button type="button" class="btn-primary w-full justify-center" data-action="new" data-testid="chat-new" ${s.busy ? raw('disabled') : ''}>${icon('message-square-plus', 'w-4 h-4')} Cuộc trò chuyện mới</button>
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2 px-1">Gần đây</div>
      <div class="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:flex-1 min-h-0 pb-1" data-testid="chat-conversations">
        ${s.conversations.length ? s.conversations.map(c => html`
          <button type="button" data-action="open" data-id="${c.conversationId}" data-testid="chat-conv" ${s.busy ? raw('disabled') : ''}
            class="text-left shrink-0 w-56 lg:w-full rounded-xl px-3 py-2.5 transition-colors ${String(c.conversationId) === String(s.activeId) ? 'bg-brand-dark text-white' : 'hover:bg-brand-sand'}">
            <div class="text-sm font-semibold truncate">${c.title || 'Cuộc trò chuyện'}</div>
            <div class="text-[11px] mt-0.5 ${String(c.conversationId) === String(s.activeId) ? 'text-white/60' : 'text-slate-400'}">${ago(c.updatedAt)}</div>
          </button>`) : html`<div class="text-xs text-slate-400 px-1 py-2">Chưa có cuộc trò chuyện nào</div>`}
      </div>
    </aside>`;
}

function bubble(m) {
  if (m.role === 'user') {
    return html`
      <div class="flex justify-end" data-testid="chat-user">
        <div class="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-md bg-brand-dark text-white px-4 py-2.5 text-sm whitespace-pre-line break-words">${m.content}</div>
      </div>`;
  }
  return html`
    <div class="flex gap-3" data-testid="chat-assistant">
      <span class="w-9 h-9 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-4 h-4')}</span>
      <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-md px-4 py-2.5 text-sm bg-white border border-brand-line break-words leading-relaxed">${renderMarkdown(m.content)}</div>
    </div>`;
}

// thông báo lỗi theo mã của BE: hết lượt (khoá ô nhập), quá tải / lỗi AI (cho gửi lại)
function errorBanner(s) {
  if (!s.error) return '';
  const canRetry = s.error.retry;
  return html`
    <div class="mx-4 sm:mx-6 mb-3 rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${s.error.code === 'ERR_AI_001' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-700'}" role="alert" data-testid="chat-error" data-code="${s.error.code || ''}">
      ${icon(s.error.code === 'ERR_AI_001' ? 'hourglass' : 'alert-triangle', 'w-4 h-4 shrink-0 mt-0.5')}
      <span class="flex-1">${s.error.message}</span>
      ${canRetry ? html`<button type="button" class="btn-secondary btn-sm shrink-0" data-action="retry" data-testid="chat-retry">${icon('rotate-cw', 'w-3.5 h-3.5')} Gửi lại</button>` : ''}
    </div>`;
}

function view(s) {
  const name = session.get()?.firstName || '';
  const locked = s.limitReached;
  return html`
    ${pageHeader('Trợ lý AI', 'Hỏi về lớp học, gói tập, lịch của bạn và tư vấn tập luyện, dinh dưỡng')}
    <div class="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-[32rem]">
      ${sidebar(s)}
      <div class="card flex-1 min-w-0 flex flex-col h-[calc(100vh-17rem)] min-h-[26rem] lg:h-auto" data-testid="chat">
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" data-chat-scroll>
          ${bubble({ role: 'model', content: `Chào **${name}**! Mình là trợ lý AI của Sport Center. Mình có thể tra lớp còn chỗ, gói tập và lịch của bạn, hoặc tư vấn tập luyện, dinh dưỡng. Bạn muốn hỏi gì?` })}
          ${s.loadingMessages ? html`<div class="text-sm text-slate-400 flex items-center gap-2" data-testid="chat-loading"><span class="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span> Đang tải cuộc trò chuyện...</div>` : s.messages.map(bubble)}
          ${s.busy ? html`
            <div class="flex gap-3" data-testid="chat-typing">
              <span class="w-9 h-9 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-4 h-4')}</span>
              <div class="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-brand-line text-sm text-slate-500 flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span> AI đang trả lời...
              </div>
            </div>` : ''}
        </div>
        ${errorBanner(s)}
        <div class="border-t border-brand-line/60 p-3 sm:p-4">
          ${!s.messages.length && !s.busy && !locked ? html`
            <div class="flex flex-wrap gap-2 mb-3" data-testid="chat-chips">
              ${STARTERS.map(q => html`<button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-sand text-brand-dark hover:bg-brand-lime" data-action="ask" data-q="${q}">${q}</button>`)}
            </div>` : ''}
          <form class="flex items-end gap-2" data-action="send" novalidate>
            <div class="flex-1 min-w-0">
              <textarea class="input resize-none !py-2.5" name="message" rows="1" maxlength="${MAX_LEN}" data-testid="chat-input"
                placeholder="${locked ? 'Bạn đã dùng hết lượt hỏi hôm nay' : 'Nhập câu hỏi... (Enter để gửi, Shift+Enter xuống dòng)'}" ${s.busy || locked ? raw('disabled') : ''}>${s.draft || ''}</textarea>
            </div>
            <button type="submit" class="btn-primary !px-4 !py-2.5 shrink-0" data-testid="chat-send" aria-label="Gửi" ${s.busy || locked ? raw('disabled') : ''}>${icon('send', 'w-4 h-4')}</button>
          </form>
          <div class="flex justify-between gap-3 text-[11px] text-slate-400 mt-2">
            <span>AI có thể nhầm lẫn — hãy kiểm tra lại thông tin gói và lịch ở các mục tương ứng.</span>
            <span data-testid="chat-count" class="shrink-0">${(s.draft || '').length}/${MAX_LEN}</span>
          </div>
        </div>
      </div>
    </div>`;
}

export default function MemberAssistant(el) {
  let lastQuestion = '';

  async function ask(ctx, text) {
    const message = String(text || '').trim();
    const s = ctx.state;
    if (!message || s.busy || s.limitReached) return;
    if (message.length > MAX_LEN) { toast(`Câu hỏi tối đa ${MAX_LEN} ký tự`, 'error'); return; }
    lastQuestion = message;
    // câu hỏi lỗi thì BE không lưu: chỉ hiện tạm, khi lỗi sẽ gỡ ra và trả lại vào ô nhập
    ctx.set({ messages: [...s.messages, { role: 'user', content: message, pending: true }], busy: true, error: null, draft: '' });
    try {
      const res = await aiApi.chat(s.activeId || null, message);
      const isNew = !s.activeId;
      ctx.state.activeId = res.conversationId;
      ctx.state.messages = [...ctx.state.messages.map(m => ({ ...m, pending: false })), { role: 'model', content: res.reply }];
      ctx.set({ busy: false });
      // cập nhật thanh bên (cuộc mới lên đầu / cuộc cũ đổi giờ)
      aiApi.conversations().then(list => ctx.set({ conversations: list || [] })).catch(() => {});
      if (isNew) toast('Đã bắt đầu cuộc trò chuyện mới');
    } catch (err) {
      ctx.state.messages = ctx.state.messages.filter(m => !m.pending);
      const code = err.code;
      if (code === 'ERR_AI_004') {
        // cuộc trò chuyện không còn: quay về cuộc mới, giữ lại câu hỏi để gửi lại
        toast(err.message, 'error');
        ctx.set({ busy: false, activeId: null, messages: [], draft: message, error: null });
        aiApi.conversations().then(list => ctx.set({ conversations: list || [] })).catch(() => {});
        return;
      }
      ctx.set({
        busy: false,
        draft: code === 'ERR_AI_001' ? '' : message,
        limitReached: code === 'ERR_AI_001',
        error: {
          code,
          message: err.message || 'Không gửi được câu hỏi, vui lòng thử lại.',
          // quá tải / lỗi AI / mạng / hết thời gian chờ: cho gửi lại
          retry: ['ERR_AI_002', 'ERR_AI_003', 'TIMEOUT', 'NETWORK'].includes(code) || err.status >= 500
        }
      });
    }
    el.querySelector('[data-testid=chat-input]')?.focus();
  }

  async function openConversation(ctx, id) {
    if (ctx.state.busy || String(id) === String(ctx.state.activeId)) return;
    ctx.set({ activeId: id, messages: [], loadingMessages: true, error: null });
    try {
      const list = await aiApi.messages(id);
      ctx.set({ messages: list || [], loadingMessages: false });
    } catch (err) {
      toast(err.message, 'error');
      ctx.set({ activeId: null, messages: [], loadingMessages: false });
    }
  }

  return mountPage(el, {
    state: { conversations: [], activeId: null, messages: [], busy: false, loadingMessages: false, error: null, limitReached: false, draft: '' },
    load: async () => ({ conversations: await aiApi.conversations().catch(() => []) }),
    view,
    afterRender: state => {
      const box = el.querySelector('[data-chat-scroll]');
      if (box) box.scrollTop = box.scrollHeight;
      const input = el.querySelector('[data-testid=chat-input]');
      if (input && !input.dataset.bound) {
        input.dataset.bound = '1';
        // Enter gửi, Shift+Enter xuống dòng; đếm ký tự trực tiếp (không vẽ lại cả trang)
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            input.form.requestSubmit();
          }
        });
        input.addEventListener('input', () => {
          // giữ nội dung đang gõ trong state để lần vẽ lại sau (thanh bên cập nhật...) không làm mất chữ
          state.draft = input.value;
          const count = el.querySelector('[data-testid=chat-count]');
          if (count) count.textContent = `${input.value.length}/${MAX_LEN}`;
        });
        if (!input.disabled) input.focus();
      }
    },
    actions: {
      send: (form, e, ctx) => {
        const text = form.message.value;
        if (!text.trim()) { toast('Hãy nhập câu hỏi trước khi gửi', 'error'); return; }
        ask(ctx, text);
      },
      ask: (btn, e, ctx) => ask(ctx, btn.dataset.q),
      retry: (btn, e, ctx) => ask(ctx, lastQuestion || ctx.state.draft),
      open: (btn, e, ctx) => openConversation(ctx, btn.dataset.id),
      new: (btn, e, ctx) => {
        if (ctx.state.busy) return;
        ctx.set({ activeId: null, messages: [], error: null, draft: '' });
      }
    }
  });
}
