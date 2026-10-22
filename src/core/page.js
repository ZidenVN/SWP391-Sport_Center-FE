import { render, bindActions } from './dom.js';
import { loading, errorState } from './ui.js';

// Khung chung cho 1 trang:
//   load(ctx)  -> Promise<object> gộp vào state (gọi lúc mount và khi reload)
//   view(state, ctx) -> html``
//   actions: { name: (target, event, ctx) => ... } gắn qua data-action
// ctx: { state, el, set(patch), reload(), rerender() }
export function mountPage(el, { state = {}, load, view, actions = {} }) {
  let disposed = false;
  const ctx = { state, el, set, reload, rerender };

  function rerender() {
    if (disposed) return;
    // giữ focus + vị trí con trỏ của ô đang gõ (ô tìm kiếm) qua các lần render lại
    const active = document.activeElement;
    const focusKey = active && el.contains(active) && active.name ? active.name : null;
    const selStart = focusKey && typeof active.selectionStart === 'number' ? active.selectionStart : null;

    if (state.__loading && !state.__loaded) render(el, loading());
    else if (state.__error && !state.__loaded) render(el, errorState(state.__error));
    else render(el, view(state, ctx));

    if (focusKey) {
      const next = el.querySelector(`[name="${focusKey}"]`);
      if (next) {
        next.focus();
        if (selStart !== null && typeof next.setSelectionRange === 'function') {
          try { next.setSelectionRange(selStart, selStart); } catch { /* input type không hỗ trợ */ }
        }
      }
    }
  }

  function set(patch) {
    Object.assign(state, patch);
    rerender();
  }

  async function reload() {
    if (!load) {
      state.__loaded = true;
      rerender();
      return;
    }
    state.__loading = true;
    if (!state.__loaded) rerender();
    try {
      const data = await load(ctx);
      if (disposed) return;
      Object.assign(state, data || {});
      state.__error = null;
      state.__loaded = true;
    } catch (err) {
      if (disposed) return;
      console.error(err);
      state.__error = err;
    } finally {
      state.__loading = false;
    }
    rerender();
  }

  const wrapped = { reload: () => reload() };
  Object.entries(actions).forEach(([name, fn]) => {
    wrapped[name] = (target, event) => fn(target, event, ctx);
  });
  const unbind = bindActions(el, wrapped);
  reload();

  return () => {
    disposed = true;
    unbind();
  };
}

// Gọi nhiều API song song, API nào lỗi thì trả fallback thay vì làm hỏng cả trang
export async function settle(entries) {
  const keys = Object.keys(entries);
  const results = await Promise.allSettled(keys.map(k => entries[k][0]()));
  const out = {};
  results.forEach((r, i) => {
    const [, fallback] = entries[keys[i]];
    out[keys[i]] = r.status === 'fulfilled' ? r.value : fallback;
    if (r.status === 'rejected') out[`${keys[i]}Error`] = r.reason;
  });
  return out;
}
