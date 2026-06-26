import View, { style } from '../../core/View/View.js';

style(`
.ux-tabs { display: flex; flex-direction: column; }

.ux-tab-bar {
    display: flex;
    border-bottom: 1px solid #ececea;
    flex: none;
    overflow-x: auto;
}
.ux-tab {
    padding: 0.55em 1em;
    font-size: 0.85em;
    font-weight: 500;
    color: #9a9a94;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    user-select: none;
    white-space: nowrap;
    transition: color 0.1s;
}
.ux-tab:hover { color: #1b1b19; }
.ux-tab.active { color: #5b57d6; border-bottom-color: #5b57d6; }

.ux-tab-content { flex: 1; position: relative; min-height: 0; }
.ux-tab-panel { display: none; height: 100%; }
.ux-tab-panel.active { display: block; }
`);

// Create a bare View without joining the captor system
function mk(tag = 'div', cls = '') {
    const v = new View({ capture: false, tag });
    if (cls) v.ac(cls);
    return v;
}

// Tabs — a tabbed container View.
//
// Usage:
//   new Tabs({ tabs: [{ label: 'A', content: someView }, ...], active_index: 0 })
//   tabs.select(1)          // switch tab by index
//   tabs.active()           // → current index
//   tabs.add({ label, content }) // append a tab at runtime
//
// Or use the factory shorthand: ux.tabs([...])

export default class Tabs extends View {
    constructor(...args) {
        super(...args);
    }

    render() {
        this.ac('ux-tabs');
        this._bar     = mk('div', 'ux-tab-bar');
        this._content = mk('div', 'ux-tab-content');
        this.append(this._bar, this._content);

        this._tab_els = [];
        this._panels  = [];
        this._cur     = this.active_index ?? 0;

        (this.tabs || []).forEach((def, i) => this._add_tab(def, i));
        this._apply(this._cur);
    }

    _add_tab(def, i) {
        const tab = mk('span', 'ux-tab');
        tab.el.textContent = def.label ?? `Tab ${i + 1}`;
        tab.el.addEventListener('click', () => this.select(i));
        this._bar.append(tab);
        this._tab_els.push(tab);

        const panel = mk('div', 'ux-tab-panel');
        const c = def.content;
        if (c) {
            if (c.el)                    panel.append(c);
            else if (typeof c === 'function') panel.append_fn(c);
            else                         panel.el.appendChild(c);
        }
        this._content.append(panel);
        this._panels.push(panel);
    }

    _apply(i) {
        this._cur = i;
        this._tab_els.forEach((t, idx) => t.el.classList.toggle('active', idx === i));
        this._panels.forEach( (p, idx) => p.el.classList.toggle('active', idx === i));
    }

    select(i) {
        this._apply(i);
        return this;
    }

    active() { return this._cur; }

    // Append a tab at runtime after initial render
    add(def) {
        const i = this._tab_els.length;
        this._add_tab(def, i);
        return this;
    }
}
