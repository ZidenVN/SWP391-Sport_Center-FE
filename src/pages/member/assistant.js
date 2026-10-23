import { html, icon, raw } from '../../core/dom.js';
import { pageHeader } from '../../core/ui.js';
import { mountPage } from '../../core/page.js';
import { memberApi } from '../../api/endpoints.js';
import { session } from '../../core/session.js';

// Trợ lý AI cho hội viên: hỏi về lịch tập, lớp còn chỗ, gói tập, bài tập. BE trả lời bằng Claude
// (khi có API key) hoặc bộ trả lời tự động dựa trên dữ liệu thật; lịch sử trò chuyện giữ trong phiên trình duyệt.
const KEY = 'sc_ai_chat';
const STARTERS = ['Lịch tập sắp tới của tôi?', 'Lớp nào còn chỗ tuần này?', 'Gói tập giá bao nhiêu?', 'Tôi nên tập gì cho mục tiêu của mình?'];
const MAX_HISTORY = 10;

function loadHistory() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    return saved && saved.email === session.get()?.email ? saved.messages : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ email: session.get()?.email, messages: messages.slice(-30) }));
  } catch {
    // trình duyệt chặn lưu trữ: vẫn trò chuyện được, chỉ mất lịch sử khi tải lại
  }
}

const SOURCE = { CLAUDE: 'Claude AI', RULES: 'Trợ lý tự động' };

// Hiện xuống dòng + gạch đầu dòng; nội dung đã được escape bởi html``
function formatReply(text) {
  return String(text).split('\n').map(line => html`<span class="block ${line.trim() ? '' : 'h-2'}">${line}</span>`);
}

function bubble(m) {
  if (m.role === 'user') {
    return html`
      <div class="flex justify-end" data-testid="chat-user">
        <div class="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-md bg-brand-dark text-white px-4 py-2.5 text-sm whitespace-pre-line">${m.content}</div>
      </div>`;
  }
  return html`
    <div class="flex gap-3" data-testid="chat-assistant">
      <span class="w-9 h-9 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-4 h-4')}</span>
      <div class="max-w-[85%] sm:max-w-[75%]">
        <div class="rounded-2xl rounded-tl-md px-4 py-2.5 text-sm ${m.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white border border-brand-line'}">${formatReply(m.content)}</div>
        ${m.source ? html`<div class="text-[11px] text-slate-400 mt-1" data-testid="chat-source">${SOURCE[m.source] || m.source}</div>` : ''}
      </div>
    </div>`;
}

function view(s) {
  const name = session.get()?.firstName || '';
  const lastAssistant = [...s.messages].reverse().find(m => m.role === 'assistant' && m.suggestions?.length);
  const chips = s.messages.length ? (lastAssistant?.suggestions || []) : STARTERS;
  return html`
    ${pageHeader('Trợ lý AI', 'Hỏi nhanh về lịch tập, lớp học, gói tập và bài tập phù hợp',
      s.messages.length ? html`<button type="button" class="btn-secondary" data-action="clear" data-testid="chat-clear">${icon('rotate-ccw', 'w-4 h-4')} Cuộc trò chuyện mới</button>` : '')}
    <div class="card flex flex-col h-[calc(100vh-15rem)] min-h-[28rem]" data-testid="chat">
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" data-chat-scroll>
        ${bubble({ role: 'assistant', content: `Chào ${name}! Mình là trợ lý của Sport Center. Mình có thể xem lịch tập, lớp còn chỗ, gói tập của bạn và gợi ý bài tập theo mục tiêu. Bạn cần hỏi gì?` })}
        ${s.messages.map(bubble)}
        ${s.busy ? html`
          <div class="flex gap-3" data-testid="chat-typing">
            <span class="w-9 h-9 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center shrink-0">${icon('sparkles', 'w-4 h-4')}</span>
            <div class="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-brand-line text-sm text-slate-500 flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span> Đang soạn câu trả lời...
            </div>
          </div>` : ''}
      </div>
      <div class="border-t border-brand-line/60 p-3 sm:p-4">
        ${chips.length && !s.busy ? html`
          <div class="flex flex-wrap gap-2 mb-3" data-testid="chat-chips">
            ${chips.map(q => html`<button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-sand text-brand-dark hover:bg-brand-lime" data-action="ask" data-q="${q}">${q}</button>`)}
          </div>` : ''}
        <form class="flex items-end gap-2" data-action="send" novalidate>
          <textarea class="input resize-none !py-2.5" name="message" rows="1" maxlength="1000" placeholder="Nhập câu hỏi... (Enter để gửi)" data-testid="chat-input" ${s.busy ? raw('disabled') : ''}></textarea>
          <button type="submit" class="btn-primary !px-4 !py-2.5 shrink-0" data-testid="chat-send" aria-label="Gửi" ${s.busy ? raw('disabled') : ''}>${icon('send', 'w-4 h-4')}</button>
        </form>
        <p class="text-[11px] text-slate-400 mt-2">Trợ lý có thể nhầm lẫn; thông tin về gói và lịch học hãy kiểm tra lại ở các mục tương ứng hoặc hỏi lễ tân.</p>
      </div>
    </div>`;
}

export default function MemberAssistant(el) {
  async function ask(ctx, text) {
    const message = String(text || '').trim();
    if (!message || ctx.state.busy) return;
    const history = ctx.state.messages.filter(m => !m.error).slice(-MAX_HISTORY).map(m => ({ role: m.role, content: m.content }));
    ctx.set({ messages: [...ctx.state.messages, { role: 'user', content: message }], busy: true });
    try {
      const res = await memberApi.aiChat({ message, history });
      ctx.state.messages = [...ctx.state.messages, { role: 'assistant', content: res.reply, source: res.source, suggestions: res.suggestions }];
    } catch (err) {
      ctx.state.messages = [...ctx.state.messages, { role: 'assistant', content: err.message || 'Không gửi được câu hỏi, vui lòng thử lại.', error: true }];
    }
    saveHistory(ctx.state.messages);
    ctx.set({ busy: false });
    el.querySelector('[data-testid=chat-input]')?.focus();
  }

  return mountPage(el, {
    state: { messages: loadHistory(), busy: false },
    view,
    afterRender: () => {
      const box = el.querySelector('[data-chat-scroll]');
      if (box) box.scrollTop = box.scrollHeight;
      const input = el.querySelector('[data-testid=chat-input]');
      if (input && !input.dataset.bound) {
        input.dataset.bound = '1';
        // Enter gửi, Shift+Enter xuống dòng
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            input.form.requestSubmit();
          }
        });
      }
    },
    actions: {
      send: (form, e, ctx) => {
        const text = form.message.value;
        form.message.value = '';
        ask(ctx, text);
      },
      ask: (btn, e, ctx) => ask(ctx, btn.dataset.q),
      clear: (t, e, ctx) => {
        saveHistory([]);
        ctx.set({ messages: [] });
      }
    }
  });
}
