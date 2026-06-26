// Modal — promise-based dialog overlay.
//
// Usage:
//   import Modal from '/framework/ux/Modal/Modal.js';
//
//   // Confirm dialog
//   const ok = await Modal.confirm({ title: 'Delete item?', body: 'Cannot be undone.', ok: 'Delete' });
//   if (ok) item.delete();
//
//   // Alert
//   await Modal.alert('Something went wrong.', { type: 'error' });
//
//   // Prompt
//   const name = await Modal.prompt('Rename to:', current_name);
//
//   // Custom content (returns Promise<any>, resolved by calling resolve(value))
//   const result = await Modal.open(myView, {
//       title: 'Settings',
//       resolve_on_backdrop: true,
//   });

import { style } from '../../core/View/View.js';

style(`
.modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
}
.modal-backdrop.in { opacity: 1; }

.modal-box {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    padding: 24px;
    min-width: 320px;
    max-width: 480px;
    width: calc(100vw - 48px);
    transform: scale(0.96) translateY(-8px);
    transition: transform 0.15s;
    font-family: system-ui, sans-serif;
}
.modal-backdrop.in .modal-box { transform: scale(1) translateY(0); }

.modal-title {
    font-size: 15px;
    font-weight: 700;
    color: #1b1b19;
    margin: 0 0 8px;
}
.modal-body {
    font-size: 13.5px;
    color: #6b6b66;
    line-height: 1.5;
    margin-bottom: 20px;
}
.modal-body.error   { color: #b52a1e; }
.modal-body.warning { color: #8a5c00; }

.modal-input {
    font-family: inherit;
    font-size: 14px;
    border: 1px solid #e6e6e3;
    border-radius: 7px;
    padding: 7px 10px;
    background: #fafafa;
    color: #1b1b19;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;
}
.modal-input:focus { border-color: #5b57d6; background: #fff; }

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.modal-btn {
    font-family: inherit; font-size: 13px; font-weight: 500;
    padding: 7px 16px; border-radius: 7px;
    border: 1px solid #e6e6e3;
    background: #fff; color: #1b1b19;
    cursor: pointer; transition: background 0.1s;
}
.modal-btn:hover { background: #f4f4f3; }
.modal-btn.primary { background: #5b57d6; color: #fff; border-color: #5b57d6; }
.modal-btn.primary:hover { background: #4b47c6; }
.modal-btn.danger  { background: #c0392b; color: #fff; border-color: #c0392b; }
.modal-btn.danger:hover  { background: #a93226; }
`);

function _make_backdrop(resolve_fn, { resolve_on_backdrop = false } = {}) {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    if (resolve_on_backdrop) bd.addEventListener('click', e => {
        if (e.target === bd) resolve_fn(null);
    });
    document.body.appendChild(bd);
    requestAnimationFrame(() => requestAnimationFrame(() => bd.classList.add('in')));
    return bd;
}

function _close(bd, resolve_fn, value) {
    bd.classList.remove('in');
    setTimeout(() => bd.remove(), 160);
    resolve_fn(value);
}

// Open a custom modal. Returns Promise resolved with whatever value you pass to resolve().
// opts: { title, resolve_on_backdrop }
function open(content, { title = '', resolve_on_backdrop = true } = {}) {
    return new Promise(resolve => {
        const bd = _make_backdrop(v => _close(bd, resolve, v), { resolve_on_backdrop });
        const box = document.createElement('div');
        box.className = 'modal-box';
        bd.appendChild(box);

        if (title) {
            const t = document.createElement('h2');
            t.className = 'modal-title';
            t.textContent = title;
            box.appendChild(t);
        }

        // Attach content
        if (content && content.el) box.appendChild(content.el);
        else if (content instanceof HTMLElement) box.appendChild(content);
        else if (typeof content === 'string') {
            const p = document.createElement('p');
            p.className = 'modal-body';
            p.textContent = content;
            box.appendChild(p);
        }

        // Expose resolve to content so custom UIs can close the modal
        box._resolve = v => _close(bd, resolve, v);
    });
}

// Confirm dialog → Promise<boolean>
function confirm({ title = 'Are you sure?', body = '', ok = 'Confirm', cancel = 'Cancel', danger = false } = {}) {
    return new Promise(resolve => {
        const bd = _make_backdrop(() => _close(bd, resolve, false));
        const box = document.createElement('div');
        box.className = 'modal-box';
        bd.appendChild(box);

        const t = document.createElement('h2');
        t.className = 'modal-title';
        t.textContent = title;
        box.appendChild(t);

        if (body) {
            const p = document.createElement('p');
            p.className = 'modal-body';
            p.textContent = body;
            box.appendChild(p);
        }

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const cancel_btn = document.createElement('button');
        cancel_btn.className = 'modal-btn';
        cancel_btn.textContent = cancel;
        cancel_btn.addEventListener('click', () => _close(bd, resolve, false));

        const ok_btn = document.createElement('button');
        ok_btn.className = 'modal-btn ' + (danger ? 'danger' : 'primary');
        ok_btn.textContent = ok;
        ok_btn.addEventListener('click', () => _close(bd, resolve, true));

        actions.appendChild(cancel_btn);
        actions.appendChild(ok_btn);
        box.appendChild(actions);

        // Focus ok for keyboard: Enter = confirm, Escape = cancel
        ok_btn.focus();
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { document.removeEventListener('keydown', esc); _close(bd, resolve, false); }
            if (e.key === 'Enter')  { document.removeEventListener('keydown', esc); _close(bd, resolve, true); }
        });
    });
}

// Alert dialog (single OK button) → Promise<void>
function alert(msg, { title = '', type = '' } = {}) {
    return new Promise(resolve => {
        const bd = _make_backdrop(() => _close(bd, resolve, undefined));
        const box = document.createElement('div');
        box.className = 'modal-box';
        bd.appendChild(box);

        if (title) {
            const t = document.createElement('h2');
            t.className = 'modal-title';
            t.textContent = title;
            box.appendChild(t);
        }

        const p = document.createElement('p');
        p.className = 'modal-body' + (type ? ' ' + type : '');
        p.textContent = msg;
        box.appendChild(p);

        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        const ok = document.createElement('button');
        ok.className = 'modal-btn primary';
        ok.textContent = 'OK';
        ok.addEventListener('click', () => _close(bd, resolve, undefined));
        actions.appendChild(ok);
        box.appendChild(actions);
        ok.focus();
        document.addEventListener('keydown', function h(e) {
            if (e.key === 'Escape' || e.key === 'Enter') {
                document.removeEventListener('keydown', h);
                _close(bd, resolve, undefined);
            }
        });
    });
}

// Prompt dialog → Promise<string|null>  (null = cancelled)
function prompt(label = '', default_val = '') {
    return new Promise(resolve => {
        const bd = _make_backdrop(() => _close(bd, resolve, null));
        const box = document.createElement('div');
        box.className = 'modal-box';
        bd.appendChild(box);

        if (label) {
            const t = document.createElement('h2');
            t.className = 'modal-title';
            t.textContent = label;
            box.appendChild(t);
        }

        const inp = document.createElement('input');
        inp.className = 'modal-input';
        inp.value = default_val;
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter')  { e.preventDefault(); _close(bd, resolve, inp.value); }
            if (e.key === 'Escape') { e.preventDefault(); _close(bd, resolve, null); }
        });
        box.appendChild(inp);

        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        const cancel_btn = document.createElement('button');
        cancel_btn.className = 'modal-btn';
        cancel_btn.textContent = 'Cancel';
        cancel_btn.addEventListener('click', () => _close(bd, resolve, null));
        const ok_btn = document.createElement('button');
        ok_btn.className = 'modal-btn primary';
        ok_btn.textContent = 'OK';
        ok_btn.addEventListener('click', () => _close(bd, resolve, inp.value));
        actions.appendChild(cancel_btn);
        actions.appendChild(ok_btn);
        box.appendChild(actions);

        requestAnimationFrame(() => { inp.focus(); inp.select(); });
    });
}

const Modal = { open, confirm, alert, prompt };
export default Modal;
export { open, confirm, alert, prompt };
