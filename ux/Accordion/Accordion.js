// Accordion — collapsible sections View.
//
// Usage:
//   new Accordion({ sections: [
//     { label: 'Typography', content: myView, open: true },
//     { label: 'Layout',     content: otherView },
//   ]})
//
// Or via ux:  ux.accordion([...])
//
// Methods:
//   .open(i)   — open section by index
//   .close(i)  — close section by index
//   .toggle(i) — toggle section by index
//   .open_all() / .close_all()
//   .add({ label, content, open }) — append a section at runtime

import View, { style } from '../../core/View/View.js';

style(`
.ux-accordion { display: flex; flex-direction: column; }

.ux-acc-section { border-bottom: 1px solid #f0f0ee; }

.ux-acc-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.55em 0.9em;
    cursor: pointer;
    user-select: none;
    font-size: 0.75em;
    font-weight: 600;
    color: #6b6b66;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
}
.ux-acc-header:hover { color: #1b1b19; }
.ux-acc-arrow {
    font-size: 1.3em;
    line-height: 1;
    transition: transform 0.15s;
    color: #b0b0a8;
    margin-left: auto;
    flex: none;
}
.ux-acc-section.open .ux-acc-arrow { transform: rotate(90deg); }

.ux-acc-body {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.2s ease;
}
.ux-acc-section.open .ux-acc-body { max-height: 2000px; }
.ux-acc-body-inner { padding: 0 0 0.5em; }
`);

function mk(tag = 'div', cls = '') {
    const v = new View({ capture: false, tag });
    if (cls) v.ac(cls);
    return v;
}

export default class Accordion extends View {
    constructor(...args) {
        super(...args);
    }

    render() {
        this.ac('ux-accordion');
        this._sections = [];
        (this.sections || []).forEach((def, i) => this._add_section(def, i));
    }

    _add_section({ label = '', content = null, open = false } = {}) {
        const i = this._sections.length;

        const section = mk('div', 'ux-acc-section');
        if (open) section.ac('open');

        // Header button
        const header = mk('button', 'ux-acc-header');
        const label_span = document.createElement('span');
        label_span.textContent = label;
        const arrow = document.createElement('span');
        arrow.className = 'material-icons ux-acc-arrow';
        arrow.textContent = 'chevron_right';
        header.el.appendChild(label_span);
        header.el.appendChild(arrow);
        header.el.addEventListener('click', () => this.toggle(i));

        // Body (collapses via max-height transition)
        const body = mk('div', 'ux-acc-body');
        const inner = mk('div', 'ux-acc-body-inner');
        if (content) {
            if (content.el) inner.append(content);
            else if (typeof content === 'function') inner.append_fn(content);
            else inner.el.appendChild(content);
        }
        body.append(inner);

        section.append(header, body);
        this.append(section);

        this._sections.push({ section, header, body });
    }

    _set(i, open) {
        const s = this._sections[i];
        if (!s) return;
        s.section.el.classList.toggle('open', open);
    }

    open(i)   { this._set(i, true);  return this; }
    close(i)  { this._set(i, false); return this; }
    toggle(i) {
        const s = this._sections[i];
        if (s) this._set(i, !s.section.el.classList.contains('open'));
        return this;
    }

    open_all()  { this._sections.forEach((_, i) => this.open(i));  return this; }
    close_all() { this._sections.forEach((_, i) => this.close(i)); return this; }

    add(def) {
        this._add_section(def);
        return this;
    }
}
