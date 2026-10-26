import { raw, esc } from './dom.js';

// Markdown tối giản cho câu trả lời của AI: **đậm**, *nghiêng*, `mã`, tiêu đề #, danh sách gạch đầu dòng / đánh số, đoạn văn.
// An toàn: escape toàn bộ HTML trước rồi mới thêm thẻ, nên không bao giờ render HTML thô từ câu trả lời.
function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

export function renderMarkdown(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let list = null; // { type: 'ul' | 'ol', items: [] }
  let para = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join('<br />')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.type} class="${list.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-5 space-y-1">${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
    list = null;
  };
  for (const line of lines) {
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const h = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const type = ul ? 'ul' : 'ol';
      if (list && list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push((ul || ol)[1]);
    } else if (h) {
      flushPara(); flushList();
      out.push(`<p class="font-bold">${inline(h[1])}</p>`);
    } else if (!line.trim()) {
      flushPara(); flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara(); flushList();
  return raw(`<div class="md space-y-2">${out.join('')}</div>`);
}
