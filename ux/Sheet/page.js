import app, { el, div, h1, p, style } from '/app.js';
import { ux, ui } from '/app.js';

app.$root.ac('page');
style(`
.page { padding: 32px; max-width: 700px; display: flex; flex-direction: column; gap: 32px; }
.demo-row { display: flex; gap: 10px; flex-wrap: wrap; }
`);

h1('Sheet');
p('Slide-in drawer from any side. Backdrop closes on click, Escape closes on keyboard.');

// ── Side demos ────────────────────────────────────────────────────────────────

div.c('', () => {
    el.c('h2', '').el.textContent = 'Sides';

    const sides = [
        { side: 'right',  size: 320, label: 'Right sheet' },
        { side: 'left',   size: 280, label: 'Left sheet'  },
        { side: 'bottom', size: 300, label: 'Bottom sheet' },
        { side: 'top',    size: 200, label: 'Top sheet'   },
    ];

    div.c('demo-row', () => {
        sides.forEach(({ side, size, label }) => {
            const body = document.createElement('div');
            body.style.cssText = 'padding:24px;display:flex;flex-direction:column;gap:16px;';

            const heading = document.createElement('div');
            heading.style.cssText = 'font-weight:600;font-size:15px;';
            heading.textContent = label;
            body.appendChild(heading);

            const desc = document.createElement('p');
            desc.style.cssText = 'font-size:13px;color:#6b6b66;margin:0;';
            desc.textContent = `This is a ${side} sheet. Click outside or press Escape to close.`;
            body.appendChild(desc);

            // Some controls inside the sheet
            body.appendChild(ui.row('Name',  ui.input({ placeholder: 'Enter name…' })).el);
            body.appendChild(ui.row('Color', ui.color({ value: '#5b57d6' })).el);
            body.appendChild(ui.row('Size',  ui.scrub({ value: 16, min: 1, max: 200 })).el);
            body.appendChild(ui.divider().el);
            body.appendChild(ui.button({ label: 'Apply', variant: 'primary' }).el);

            const s = ux.sheet({ content: body, side, size, title: label });

            const btn = ui.button({ label: side.charAt(0).toUpperCase() + side.slice(1),
                on_click: () => s.open() });
            div.c('').el.appendChild(btn.el);
        });
    });
});

// ── Without title bar ─────────────────────────────────────────────────────────

div.c('', () => {
    el.c('h2', '').el.textContent = 'No title bar';

    const body = document.createElement('div');
    body.style.cssText = 'padding:24px;display:flex;flex-direction:column;gap:16px;';
    body.innerHTML = `<p style="font-size:13px;color:#6b6b66;margin:0;">
        Sheet without a title bar. Build your own header inside the content.</p>`;

    const custom_header = document.createElement('div');
    Object.assign(custom_header.style, {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', borderBottom: '1px solid #ececea',
    });
    custom_header.innerHTML = `<span style="font-weight:600">Custom header</span>`;
    const close_btn = document.createElement('button');
    close_btn.style.cssText = 'border:none;background:transparent;cursor:pointer;font-size:12px;color:#9a9a94;';
    close_btn.textContent = 'Close';

    const s_notitle = ux.sheet({ content: body, side: 'right', size: 300 });
    close_btn.addEventListener('click', () => s_notitle.close());
    custom_header.appendChild(close_btn);

    const btn = ui.button({ label: 'Open (no title)', on_click: () => s_notitle.open() });
    div.c('').el.appendChild(btn.el);
});

// ── API ───────────────────────────────────────────────────────────────────────

div.c('', () => {
    el.c('h2', '').el.textContent = 'API';
    const pre = el.c('pre', '');
    pre.el.style.cssText = 'font-size:11.5px;font-family:monospace;color:#1b1b19;line-height:1.7;margin:0;white-space:pre-wrap;background:#f4f4f3;border:1px solid #ececea;border-radius:8px;padding:14px 16px;';
    pre.el.textContent = `const s = ux.sheet({
    content:  myView,      // View | HTMLElement
    side:     'right',     // 'left' | 'right' | 'bottom' | 'top'
    size:     320,         // px
    title:    'Settings',  // optional header title
    on_close: () => {},    // optional callback
});

s.open();
s.close();
s.toggle();
s.set_content(newView);   // swap content
s.destroy();              // remove from DOM`;
});
