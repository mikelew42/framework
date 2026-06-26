import app, { el, div, h1, p, style } from '/app.js';
import ColorPicker from './ColorPicker.js';
import { ux, ui } from '/app.js';

app.$root.ac('page');
style(`
.page { padding: 32px; }
.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.demo-card { border: 1px solid #ececea; border-radius: 10px; padding: 16px; background: #fff; }
.demo-card h2 { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9a9a94; margin: 0 0 12px; }
`);

h1('ColorPicker');
p('Full HSL color picker widget. Use standalone or inside a Popover.');

div.c('demo-grid', () => {

    // ── Inline ────────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('h2', '', 'Inline');
        const out = el.c('div', '');
        out.el.style.cssText = 'font-size:12px;font-family:monospace;color:#5b57d6;margin-top:10px;';

        const picker = new ColorPicker({
            value: '#5b57d6',
            on_change: v => { out.el.textContent = v; },
        });
        out.el.textContent = '#5B57D6';
        div.c('').el.appendChild(picker.el);
        div.c('').el.appendChild(out.el);
    });

    // ── With alpha ────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('h2', '', 'With alpha channel');
        const out = el.c('div', '');
        out.el.style.cssText = 'font-size:12px;font-family:monospace;color:#5b57d6;margin-top:10px;';

        const picker = new ColorPicker({
            value: '#e07a2f',
            alpha: true,
            on_change: v => { out.el.textContent = v; },
        });
        out.el.textContent = '#E07A2F';
        div.c('').el.appendChild(picker.el);
        div.c('').el.appendChild(out.el);
    });

    // ── Inside a Popover ──────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('h2', '', 'Inside ux.popover()');

        const swatch = el.c('div', '');
        let cur_color = '#2d8a5a';
        Object.assign(swatch.el.style, {
            width: '80px', height: '80px', borderRadius: '10px',
            background: cur_color, cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.1)',
            transition: 'background 0.1s',
        });

        const picker = new ColorPicker({
            value: cur_color,
            on_change: v => {
                cur_color = v;
                swatch.el.style.background = v;
            },
        });

        const pop = ux.popover({
            trigger:   swatch.el,
            content:   picker,
            placement: 'bottom-start',
            offset:    8,
        });
        swatch.el.addEventListener('click', () => pop.toggle());

        el.c('p', '').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:8px 0 0;';
        const note = el.c('p', '');
        note.el.style.cssText = 'font-size:12px;color:#9a9a94;margin:4px 0 0;';
        note.el.textContent = 'Click the swatch to open the picker popover.';
    });

    // ── Bound to ui.color swatch row ──────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('h2', '', 'API');
        const pre = el.c('pre', '');
        pre.el.style.cssText = 'font-size:11px;font-family:monospace;color:#1b1b19;line-height:1.7;margin:0;white-space:pre-wrap;';
        pre.el.textContent = `const picker = new ColorPicker({
    value: '#5b57d6',
    alpha: false,
    on_change: v => console.log(v),
});

picker.val()           // → '#5b57d6'
picker.val('#ff0000')  // set value

// Use with popover:
const pop = ux.popover({
    trigger:   swatch_el,
    content:   picker,
    placement: 'bottom-start',
});
swatch_el.addEventListener('click', () => pop.toggle());`;
    });

});
