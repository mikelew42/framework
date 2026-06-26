import View, { el, div, style } from '/framework/core/View/View.js';

// ─── Styles ───────────────────────────────────────────────────────────────────

style(`
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #1b1b19;
    overflow: hidden;
}

/* Root fills the viewport */
.wa-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: #f4f4f3;
}

/* Lew42 integration: stretch the root container */
.lew42 .root:has(.wa-root) {
    display: flex; flex-direction: column;
    flex: 1; overflow: hidden;
}
.lew42 .background:has(.wa-root) { overflow: hidden; }

/* Header bar */
.wa-header {
    height: 48px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    background: #fff;
    border-bottom: 1px solid #ececea;
    z-index: 10;
}
.wa-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
    text-decoration: none;
    color: inherit;
}
.wa-logo-icon {
    width: 24px; height: 24px;
    border-radius: 6px;
    background: #5b57d6;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.9);
}
.wa-logo-icon .material-icons { font-size: 15px; line-height: 1; }
.wa-title { font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }
.wa-sep { width: 1px; height: 20px; background: #ececea; margin: 0 2px; flex: none; }
.wa-spacer { flex: 1; }

/* Icon toolbar buttons (for .wa-header) */
.wa-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px;
    border-radius: 7px;
    border: 1px solid #e6e6e3;
    background: #fff;
    cursor: pointer;
    color: #6b6b66;
    transition: background 0.1s, color 0.1s;
    flex: none;
}
.wa-btn:hover:not(:disabled) { background: #f4f4f3; color: #1b1b19; }
.wa-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.wa-btn .material-icons { font-size: 18px; line-height: 1; }

/* Three-panel body */
.wa-panels {
    flex: 1;
    display: flex;
    min-height: 0;
}

/* Side panels */
.wa-panel {
    flex: none;
    background: #fff;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}
.wa-panel-left  { border-right: 1px solid #ececea; }
.wa-panel-right { border-left:  1px solid #ececea; }

/* Main content area */
.wa-main {
    flex: 1;
    min-width: 0;
    overflow: auto;
    position: relative;
    background: #f4f4f3;
}

/* Panel section heading */
.wa-panel-heading {
    font-size: 10.5px;
    font-weight: 600;
    color: #9a9a94;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 10px 12px 5px;
    flex: none;
}

/* Panel divider */
.wa-panel-divider { height: 1px; background: #f0f0ee; margin: 5px 0; flex: none; }
`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// View without captor participation
function mk(cls = '', tag = 'div') {
    const v = new View({ capture: false, tag });
    if (cls) v.ac(cls);
    return v;
}

// ─── WebApp0 ─────────────────────────────────────────────────────────────────
//
// A three-panel app shell: header | left sidebar | main | right sidebar.
//
// Constructor options:
//   icon        {string}  material-icons name for the header logo
//   title       {string}  app name shown in the header
//   left_width  {number}  left panel width in px (default 260); 0 = hidden
//   right_width {number}  right panel width in px (default 0 = hidden)
//
// Properties after construction:
//   .root         View   mount this into the page
//   .header       View   the top bar (append buttons/status to the left side)
//   .header_right View   right section of the header (save buttons, status, etc.)
//   .left         View   left sidebar panel (append ui controls / sections)
//   .main         View   center content area
//   .right        View   right sidebar panel
//
// Helper methods:
//   .btn(icon_name, title, on_click) → HTMLButtonElement   icon toolbar button
//   .sep()                           → View                vertical separator
//   .spacer()                        → View                flexible spacer

export default class WebApp0 {
    constructor({ icon: icon_name = null, title = '', left_width = 260, right_width = 0 } = {}) {
        this.root = mk('wa-root');
        this._build_header(icon_name, title);
        this._build_panels(left_width, right_width);
    }

    _build_header(icon_name, title) {
        const header = mk('wa-header');

        // Logo + title
        if (icon_name || title) {
            const logo = mk('wa-logo');
            if (icon_name) {
                const logo_icon = mk('wa-logo-icon');
                const ic = document.createElement('span');
                ic.className = 'material-icons';
                ic.textContent = icon_name;
                logo_icon.el.appendChild(ic);
                logo.append(logo_icon);
            }
            if (title) {
                const title_el = mk('wa-title', 'span');
                title_el.el.textContent = title;
                logo.append(title_el);
            }
            header.append(logo);
            header.append(this.sep());
        }

        // Right section (spacer + user content)
        const spacer  = mk('wa-spacer');
        this.header_right = mk('wa-header-right');
        // inner flex row for right-side header items
        this.header_right.el.style.cssText = 'display:flex;align-items:center;gap:8px;';
        header.append(spacer, this.header_right);

        this.header = header;
        this.root.append(header);
    }

    _build_panels(left_width, right_width) {
        const panels = mk('wa-panels');

        this.left = mk('wa-panel wa-panel-left');
        this.left.el.style.width = left_width + 'px';
        if (!left_width) this.left.hide();

        this.main = mk('wa-main');

        this.right = mk('wa-panel wa-panel-right');
        this.right.el.style.width = right_width + 'px';
        if (!right_width) this.right.hide();

        panels.append(this.left, this.main, this.right);
        this.root.append(panels);
    }

    // ── Convenience methods ──────────────────────────────────────────────────

    // Icon button for the header toolbar.
    // Returns a raw HTMLButtonElement (append to header.el or header_right.el).
    btn(icon_name, title_text = '', on_click) {
        const btn = document.createElement('button');
        btn.className = 'wa-btn';
        btn.title = title_text;
        const ic = document.createElement('span');
        ic.className = 'material-icons';
        ic.textContent = icon_name;
        btn.appendChild(ic);
        if (on_click) btn.addEventListener('click', on_click);
        return btn;
    }

    // Vertical separator for the header.
    sep() { return mk('wa-sep'); }

    // Flexible spacer for the header.
    spacer() { return mk('wa-spacer'); }

    // Show/hide panels
    show_left()  { this.left.show();  return this; }
    hide_left()  { this.left.hide();  return this; }
    show_right() { this.right.show(); return this; }
    hide_right() { this.right.hide(); return this; }
    toggle_left()  { this.left.toggle();  return this; }
    toggle_right() { this.right.toggle(); return this; }

    // Panel section heading
    heading(text) {
        const h = mk('wa-panel-heading', 'div');
        h.el.textContent = text;
        return h;
    }

    // Panel thin divider
    panel_divider() { return mk('wa-panel-divider'); }
}
