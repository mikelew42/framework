// Toast — global notification overlay.
//
// Usage:
//   import Toast from '/framework/ux/Toast/Toast.js';
//   Toast.show('Saved!');
//   Toast.show('File not found', { type: 'error' });
//   Toast.show('Check your input', { type: 'warning', duration: 4000 });
//   Toast.show('3 items deleted', { type: 'success', action: { label: 'Undo', on_click: () => ... }});
//
// Or via ux namespace:  ux.toast('Saved!')

import { style } from '../../core/View/View.js';

style(`
.toast-wrap {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    align-items: center;
    pointer-events: none;
}
.toast {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1b1b19;
    color: #fff;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 13.5px;
    font-weight: 500;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(12px) scale(0.97);
    transition: opacity 0.18s, transform 0.18s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    max-width: 420px;
    min-width: 160px;
    user-select: none;
}
.toast.in { opacity: 1; transform: translateY(0) scale(1); }
.toast.success { background: #1e6e47; }
.toast.error   { background: #b52a1e; }
.toast.warning { background: #8a5c00; }
.toast-msg { flex: 1; line-height: 1.4; }
.toast-action {
    font-family: inherit;
    font-size: 0.85em;
    font-weight: 700;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.35);
    color: #fff;
    border-radius: 5px;
    padding: 3px 9px;
    cursor: pointer;
    flex: none;
    white-space: nowrap;
}
.toast-action:hover { background: rgba(255,255,255,0.15); }
.toast-close {
    font-family: inherit;
    font-size: 16px;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.55);
    cursor: pointer;
    padding: 0 0 0 4px;
    flex: none;
    line-height: 1;
}
.toast-close:hover { color: #fff; }
`);

let _container = null;

function _get_container() {
    if (!_container) {
        _container = document.createElement('div');
        _container.className = 'toast-wrap';
        document.body.appendChild(_container);
    }
    return _container;
}

// show(msg, opts) → the toast HTMLElement (for early dismissal)
// opts: { type: 'success'|'error'|'warning'|'', duration: ms, action: {label, on_click} }
function show(msg, { type = '', duration = 2800, action = null } = {}) {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');

    const msg_el = document.createElement('span');
    msg_el.className = 'toast-msg';
    msg_el.textContent = msg;
    el.appendChild(msg_el);

    if (action) {
        const btn = document.createElement('button');
        btn.className = 'toast-action';
        btn.textContent = action.label;
        btn.addEventListener('click', () => {
            action.on_click?.();
            dismiss();
        });
        el.appendChild(btn);
    }

    const close_btn = document.createElement('button');
    close_btn.className = 'toast-close';
    close_btn.textContent = '×';
    close_btn.addEventListener('click', dismiss);
    el.appendChild(close_btn);

    _get_container().appendChild(el);

    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));

    let timer = setTimeout(dismiss, duration);

    function dismiss() {
        clearTimeout(timer);
        el.classList.remove('in');
        setTimeout(() => el.remove(), 200);
    }

    return { el, dismiss };
}

const Toast = { show };
export default Toast;
export { show };
