import app, { el, div, h1, p, style } from '/app.js';
import Splitter from './Splitter.js';

app.$root.ac('page');
style(`
.page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
.demo-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9a9a94; margin-bottom: 10px; }
.demo-h {
    display: flex; height: 240px;
    border: 1px solid #e6e6e3; border-radius: 10px; overflow: hidden;
    background: #fff;
}
.demo-panel {
    background: #fafafa; overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #9a9a94;
}
.demo-main {
    flex: 1; background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: #c0c0ba;
}
.demo-v {
    display: flex; flex-direction: column; height: 300px;
    border: 1px solid #e6e6e3; border-radius: 10px; overflow: hidden;
    background: #fff;
}
.demo-panel-top {
    background: #fafafa; height: 120px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #9a9a94;
}
`);

h1('Splitter');
p('Drag-to-resize handle. Uses Pointer Capture API — works even when dragging outside the element.');

// ── Horizontal (left + right panels) ─────────────────────────────────────────

div.c('', () => {
    el.c('div', 'demo-label', 'Horizontal — drag to resize left and right panels');

    const wrap = document.createElement('div');
    wrap.className = 'demo-h';

    const left_el = document.createElement('div');
    left_el.className = 'demo-panel';
    left_el.style.width = '200px';
    left_el.textContent = 'Left (200px)';

    const main_el = document.createElement('div');
    main_el.className = 'demo-main';
    main_el.textContent = 'Main content';

    const right_el = document.createElement('div');
    right_el.className = 'demo-panel';
    right_el.style.width = '160px';
    right_el.textContent = 'Right (160px)';

    const sp_left = new Splitter({
        target:    left_el,
        direction: 'horizontal',
        side:      'right',
        min:       80,
        max:       400,
        on_resize: w => { left_el.textContent = `Left (${Math.round(w)}px)`; },
    }).default_size(200);

    const sp_right = new Splitter({
        target:    right_el,
        direction: 'horizontal',
        side:      'left',
        min:       80,
        max:       300,
        on_resize: w => { right_el.textContent = `Right (${Math.round(w)}px)`; },
    }).default_size(160);

    wrap.append(left_el, sp_left.el, main_el, sp_right.el, right_el);
    div.c('').el.appendChild(wrap);

    el.c('p', '').el.style.cssText = 'font-size:12px;color:#9a9a94;margin-top:8px;';
    el.c('p', '').el.textContent = 'Double-click a handle to reset to its default size.';
});

// ── Vertical (top panel) ──────────────────────────────────────────────────────

div.c('', () => {
    el.c('div', 'demo-label', 'Vertical — drag to resize top panel');

    const wrap = document.createElement('div');
    wrap.className = 'demo-v';

    const top_el = document.createElement('div');
    top_el.className = 'demo-panel-top';
    top_el.textContent = 'Top panel (120px)';

    const bottom_el = document.createElement('div');
    bottom_el.className = 'demo-main';
    bottom_el.style.flex = '1';
    bottom_el.textContent = 'Bottom panel';

    const sp = new Splitter({
        target:    top_el,
        direction: 'vertical',
        side:      'bottom',
        min:       60,
        max:       220,
        on_resize: h => { top_el.textContent = `Top panel (${Math.round(h)}px)`; },
    }).default_size(120);

    wrap.append(top_el, sp.el, bottom_el);
    div.c('').el.appendChild(wrap);
});
