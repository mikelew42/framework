// Sheet — slide-in drawer from any side. Backdrop closes on click.
//
// Usage:
//   import Sheet from '/framework/ux/Sheet/Sheet.js';
//
//   const sheet = new Sheet({
//       content:  myView,         // View or HTMLElement
//       side:     'right',        // 'left' | 'right' | 'bottom' | 'top'
//       size:     320,            // px (width for left/right, height for top/bottom)
//       title:    'Settings',     // optional header title
//       on_close: () => {},       // optional callback when closed
//   });
//
//   sheet.open();
//   sheet.close();
//   sheet.toggle();
//   sheet.destroy();

import { style } from '../../core/View/View.js';

style(`
.ux-sheet-backdrop {
    position: fixed; inset: 0; z-index: 8500;
    background: rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.22s;
    pointer-events: none;
}
.ux-sheet-backdrop.open {
    opacity: 1;
    pointer-events: auto;
}

.ux-sheet {
    position: fixed; z-index: 8501;
    background: #fff;
    box-shadow: 0 4px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Side-specific sizing and off-screen positions */
.ux-sheet.right  { top: 0; right: 0; bottom: 0; transform: translateX(100%); }
.ux-sheet.left   { top: 0; left: 0;  bottom: 0; transform: translateX(-100%); }
.ux-sheet.bottom { left: 0; right: 0; bottom: 0; transform: translateY(100%); border-radius: 12px 12px 0 0; }
.ux-sheet.top    { left: 0; right: 0; top: 0;    transform: translateY(-100%); border-radius: 0 0 12px 12px; }

.ux-sheet.open { transform: translate(0); }

.ux-sheet-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid #ececea;
    flex-shrink: 0;
}
.ux-sheet-title {
    font-size: 14px; font-weight: 600; color: #1b1b19;
}
.ux-sheet-close {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border: none; background: transparent; border-radius: 6px;
    cursor: pointer; color: #9a9a94; font-size: 20px;
    transition: background 0.1s;
}
.ux-sheet-close:hover { background: #f4f4f3; color: #1b1b19; }

.ux-sheet-body {
    flex: 1; overflow: auto;
}

/* Drag handle for bottom sheets */
.ux-sheet-grip {
    width: 36px; height: 4px;
    background: #e0e0de; border-radius: 2px;
    margin: 10px auto 0; flex-shrink: 0;
}
`);

export default class Sheet {
    constructor({
        content,
        side      = 'right',
        size      = 320,
        title,
        on_close,
    } = {}) {
        this._side     = side;
        this._size     = size;
        this._on_close = on_close;
        this._open     = false;
        this._build(content, title);
    }

    _build(content, title) {
        // Backdrop
        this._backdrop = document.createElement('div');
        this._backdrop.className = 'ux-sheet-backdrop';
        this._backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this._backdrop);

        // Sheet
        this._el = document.createElement('div');
        this._el.className = `ux-sheet ${this._side}`;

        // Size
        if (this._side === 'left' || this._side === 'right') {
            this._el.style.width = this._size + 'px';
        } else {
            this._el.style.height = this._size + 'px';
        }

        // Grip (for bottom/top sheets)
        if (this._side === 'bottom' || this._side === 'top') {
            const grip = document.createElement('div');
            grip.className = 'ux-sheet-grip';
            this._el.appendChild(grip);
        }

        // Header (if title given)
        if (title) {
            const header = document.createElement('div');
            header.className = 'ux-sheet-header';

            const title_el = document.createElement('div');
            title_el.className = 'ux-sheet-title';
            title_el.textContent = title;

            const close_btn = document.createElement('button');
            close_btn.className = 'ux-sheet-close';
            const ic = document.createElement('span');
            ic.className = 'material-icons';
            ic.textContent = 'close';
            close_btn.appendChild(ic);
            close_btn.addEventListener('click', () => this.close());

            header.append(title_el, close_btn);
            this._el.appendChild(header);
        }

        // Body
        const body = document.createElement('div');
        body.className = 'ux-sheet-body';
        if (content) {
            if (content.el)                      body.appendChild(content.el);
            else if (content instanceof HTMLElement) body.appendChild(content);
            else                                 body.textContent = content;
        }
        this._el.appendChild(body);
        this._body = body;

        document.body.appendChild(this._el);

        // Keyboard close
        this._key_handler = e => { if (e.key === 'Escape' && this._open) this.close(); };
        document.addEventListener('keydown', this._key_handler);
    }

    open() {
        if (!this._open) {
            this._open = true;
            requestAnimationFrame(() => {
                this._backdrop.classList.add('open');
                this._el.classList.add('open');
            });
        }
        return this;
    }

    close() {
        if (this._open) {
            this._open = false;
            this._backdrop.classList.remove('open');
            this._el.classList.remove('open');
            if (this._on_close) this._on_close();
        }
        return this;
    }

    toggle() {
        return this._open ? this.close() : this.open();
    }

    // Replace body content
    set_content(content) {
        this._body.innerHTML = '';
        if (content && content.el)             this._body.appendChild(content.el);
        else if (content instanceof HTMLElement) this._body.appendChild(content);
        else                                   this._body.textContent = content ?? '';
        return this;
    }

    destroy() {
        this.close();
        this._backdrop.remove();
        this._el.remove();
        document.removeEventListener('keydown', this._key_handler);
    }
}
