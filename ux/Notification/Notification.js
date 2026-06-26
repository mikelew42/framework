// Notification — notification center with bell button and unread badge.
//
// Usage:
//   import Notification from '/framework/ux/Notification/Notification.js';
//
//   // Render a bell button anywhere (e.g. app header)
//   header.appendChild(Notification.bell());
//
//   // Add a notification
//   Notification.add({
//       title:   'File saved',
//       body:    'document.txt was saved successfully.',
//       type:    'success',   // '' | 'success' | 'error' | 'warning'
//       icon:    'save',      // Material Icons name
//       time:    new Date(),
//       on_click: () => {},   // optional click handler
//   });
//
//   // Also fires a toast automatically (pass toast: false to suppress)
//   Notification.add({ title: 'Alert', body: '...', toast: false });
//
//   Notification.clear();
//   Notification.unread_count();   // → number

import { style } from '../../core/View/View.js';
import Toast from '../Toast/Toast.js';

style(`
/* Bell button */
.notif-bell-wrap {
    position: relative; display: inline-flex; align-items: center;
}
.notif-bell {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border: none; background: transparent; border-radius: 7px;
    cursor: pointer; color: #1b1b19; font-size: 20px;
    transition: background 0.1s;
}
.notif-bell:hover { background: #f0f0ee; }
.notif-bell .material-icons { font-size: 20px; }

.notif-badge {
    position: absolute; top: 2px; right: 2px;
    min-width: 15px; height: 15px;
    background: #b52a1e; color: #fff;
    border-radius: 8px; font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px; line-height: 1;
    pointer-events: none;
    opacity: 0; transform: scale(0.5);
    transition: opacity 0.15s, transform 0.15s;
}
.notif-badge.visible { opacity: 1; transform: scale(1); }

/* Notification panel (shown as a popover) */
.notif-panel {
    width: 320px;
    display: flex; flex-direction: column;
    max-height: 420px;
}
.notif-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid #f0f0ee;
    flex-shrink: 0;
}
.notif-panel-title {
    font-size: 13px; font-weight: 600; color: #1b1b19;
}
.notif-panel-clear {
    font-size: 11.5px; color: #9a9a94;
    border: none; background: transparent; cursor: pointer; padding: 0;
}
.notif-panel-clear:hover { color: #1b1b19; }

.notif-list {
    flex: 1; overflow-y: auto;
}
.notif-empty {
    padding: 28px 14px;
    text-align: center; font-size: 13px; color: #9a9a94;
}

.notif-item {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 10px 14px;
    border-bottom: 1px solid #f8f8f7;
    cursor: pointer; transition: background 0.07s;
}
.notif-item:hover { background: #fafafa; }
.notif-item.unread { background: #f8f8ff; }
.notif-item.unread:hover { background: #f0f0ff; }

.notif-item-icon {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
}
.notif-item-icon.success { background: #e8f9f0; color: #2d8a5a; }
.notif-item-icon.error   { background: #fce8e7; color: #b52a1e; }
.notif-item-icon.warning { background: #fef3e2; color: #d97706; }
.notif-item-icon.default { background: #f0f0ee; color: #6b6b66; }

.notif-item-body { flex: 1; min-width: 0; }
.notif-item-title { font-size: 12.5px; font-weight: 500; color: #1b1b19; }
.notif-item-text  { font-size: 11.5px; color: #6b6b66; margin-top: 1px; line-height: 1.4; }
.notif-item-time  { font-size: 10.5px; color: #b0b0aa; margin-top: 3px; }

.notif-item-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #5b57d6;
    flex-shrink: 0; margin-top: 5px;
}
`);

// ── Helpers ───────────────────────────────────────────────────────────────────

function _relative_time(date) {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
}

// ── Singleton state ───────────────────────────────────────────────────────────

const _items = [];
let _next_id = 1;
let _bell_el = null;
let _badge_el = null;
let _panel_el = null;
let _list_el  = null;
let _pop      = null;

function _update_badge() {
    const unread = _items.filter(n => n.unread).length;
    if (!_badge_el) return;
    _badge_el.textContent = unread > 9 ? '9+' : String(unread);
    _badge_el.classList.toggle('visible', unread > 0);
}

function _render_list() {
    if (!_list_el) return;
    _list_el.innerHTML = '';

    if (!_items.length) {
        const empty = document.createElement('div');
        empty.className = 'notif-empty';
        empty.textContent = 'No notifications';
        _list_el.appendChild(empty);
        return;
    }

    _items.slice().reverse().forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item' + (n.unread ? ' unread' : '');

        const icon_wrap = document.createElement('div');
        icon_wrap.className = `notif-item-icon ${n.type || 'default'}`;
        const ic = document.createElement('span');
        ic.className = 'material-icons';
        ic.textContent = n.icon || (n.type === 'success' ? 'check_circle' : n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'notifications');
        icon_wrap.appendChild(ic);

        const body = document.createElement('div');
        body.className = 'notif-item-body';
        const title = document.createElement('div');
        title.className = 'notif-item-title';
        title.textContent = n.title;
        body.appendChild(title);
        if (n.body) {
            const text = document.createElement('div');
            text.className = 'notif-item-text';
            text.textContent = n.body;
            body.appendChild(text);
        }
        const time_el = document.createElement('div');
        time_el.className = 'notif-item-time';
        time_el.textContent = _relative_time(n.time);
        body.appendChild(time_el);

        const dot = document.createElement('div');
        dot.className = 'notif-item-dot';
        dot.style.opacity = n.unread ? '1' : '0';

        item.append(icon_wrap, body, dot);
        item.addEventListener('click', () => {
            n.unread = false;
            _update_badge();
            _render_list();
            if (n.on_click) n.on_click(n);
        });

        _list_el.appendChild(item);
    });
}

function _ensure_panel() {
    if (_panel_el) return;

    _panel_el = document.createElement('div');
    _panel_el.className = 'notif-panel';

    const header = document.createElement('div');
    header.className = 'notif-panel-header';
    const title = document.createElement('div');
    title.className = 'notif-panel-title';
    title.textContent = 'Notifications';
    const clear_btn = document.createElement('button');
    clear_btn.className = 'notif-panel-clear';
    clear_btn.textContent = 'Clear all';
    clear_btn.addEventListener('click', () => { Notification.clear(); _render_list(); _update_badge(); });
    header.append(title, clear_btn);

    _list_el = document.createElement('div');
    _list_el.className = 'notif-list';

    _panel_el.append(header, _list_el);
}

// ── Public API ────────────────────────────────────────────────────────────────

const Notification = {
    // Returns a bell button element with badge — mount in your header
    bell() {
        const wrap = document.createElement('div');
        wrap.className = 'notif-bell-wrap';

        const btn = document.createElement('button');
        btn.className = 'notif-bell';
        const ic = document.createElement('span');
        ic.className = 'material-icons';
        ic.textContent = 'notifications';
        btn.appendChild(ic);

        _badge_el = document.createElement('span');
        _badge_el.className = 'notif-badge';
        wrap.append(btn, _badge_el);

        _bell_el = btn;
        _update_badge();

        // Lazy import Popover to avoid circular dependency issues
        btn.addEventListener('click', async () => {
            if (!_pop) {
                const { default: Popover } = await import('../Popover/Popover.js');
                _ensure_panel();
                _render_list();
                _pop = new Popover({
                    trigger:   btn,
                    content:   _panel_el,
                    placement: 'bottom-end',
                    offset:    8,
                });
            } else {
                _render_list();
            }
            _pop.toggle();
            // Mark all as read when opening
            if (_pop._open) {
                setTimeout(() => {
                    _items.forEach(n => n.unread = false);
                    _update_badge();
                    _render_list();
                }, 600);
            }
        });

        return wrap;
    },

    // Add a notification. Returns the notification object.
    add({ title = '', body = '', type = '', icon, time, on_click, toast = true } = {}) {
        const n = { id: _next_id++, title, body, type, icon, time: time || new Date(), on_click, unread: true };
        _items.push(n);
        _update_badge();

        if (toast) {
            Toast.show(title + (body ? `: ${body}` : ''), { type, duration: 3000 });
        }
        return n;
    },

    clear() {
        _items.length = 0;
        _update_badge();
    },

    unread_count() {
        return _items.filter(n => n.unread).length;
    },
};

export default Notification;
