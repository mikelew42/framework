import app, { el, div, h1, p, style } from '/app.js';
import DragDrop from './DragDrop.js';
import { ux } from '/app.js';

app.$root.ac('page');
style(`
.page { padding: 32px; max-width: 700px; display: flex; flex-direction: column; gap: 36px; }
.demo-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9a9a94; margin-bottom: 12px; }

/* Simple list */
.dd-list { display: flex; flex-direction: column; gap: 6px; }
.dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 8px;
    font-size: 13px;
    color: #1b1b19;
    cursor: grab;
    user-select: none;
}
.dd-item:active { cursor: grabbing; }
.dd-item .material-icons { color: #c0c0ba; font-size: 18px; flex-shrink: 0; }

/* Handle-only variant */
.dd-item-handle { cursor: grab; color: #c0c0ba; }
.dd-item-handle:active { cursor: grabbing; }

/* Card list */
.dd-cards { display: flex; flex-direction: column; gap: 8px; }
.dd-card {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 10px;
    user-select: none;
}
.dd-card-handle {
    color: #c0c0ba; cursor: grab; font-size: 20px;
    flex-shrink: 0;
}
.dd-card-handle:active { cursor: grabbing; }
.dd-card-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
}
.dd-card-body { flex: 1; }
.dd-card-title { font-size: 13px; font-weight: 500; color: #1b1b19; }
.dd-card-desc  { font-size: 11.5px; color: #9a9a94; margin-top: 1px; }
`);

h1('DragDrop');
p('Sortable list reordering via pointer drag. No extra libraries.');

// ── Simple drag-whole-item list ───────────────────────────────────────────────

div.c('', () => {
    el.c('div', 'demo-label', 'Drag to reorder (whole item is handle)');

    const log = el.c('div', '');
    log.el.style.cssText = 'font-size:12px;color:#9a9a94;margin-bottom:8px;min-height:16px;';

    const labels = ['Home', 'About', 'Services', 'Portfolio', 'Blog', 'Contact'];
    const list = div.c('dd-list');

    labels.forEach(lbl => {
        const item = el.c('div', 'dd-item');
        item.el.innerHTML = `<span class="material-icons">drag_indicator</span>${lbl}`;
    });

    new DragDrop({
        container: list.el,
        on_reorder: (items, from, to) => {
            const names = items.map(el => el.textContent.trim()).join(', ');
            log.el.textContent = `Moved from ${from} → ${to}: [${names}]`;
            ux.toast(`Reordered: ${from} → ${to}`, { type: 'success' });
        },
    });
});

// ── Handle-only drag ──────────────────────────────────────────────────────────

div.c('', () => {
    el.c('div', 'demo-label', 'Drag handle only (click other parts freely)');

    const cards = [
        { icon: 'image',      color: '#f0eeff', label: 'Background Image', desc: 'Full-width hero photo' },
        { icon: 'title',      color: '#e8f9f0', label: 'Headline',         desc: 'H1 text block' },
        { icon: 'text_fields',color: '#fef3e2', label: 'Paragraph',        desc: 'Body copy section' },
        { icon: 'smart_button',color: '#fce8e7', label: 'Call to Action',  desc: 'Primary CTA button' },
        { icon: 'view_module',color: '#e6f2ff', label: 'Feature Grid',     desc: '3-column icon list' },
    ];

    const list = div.c('dd-cards');

    cards.forEach(({ icon, color, label, desc }) => {
        const card = el.c('div', 'dd-card');
        card.el.innerHTML = `
            <span class="material-icons dd-card-handle">drag_indicator</span>
            <div class="dd-card-icon" style="background:${color}">${icon}</div>
            <div class="dd-card-body">
                <div class="dd-card-title">${label}</div>
                <div class="dd-card-desc">${desc}</div>
            </div>
        `;
        // Fix icon text (plain text → material-icons)
        const icon_el = card.el.querySelector('.dd-card-icon');
        icon_el.textContent = '';
        const ic = document.createElement('span');
        ic.className = 'material-icons';
        ic.textContent = icon;
        ic.style.cssText = 'font-size:18px;color:#5b57d6;';
        icon_el.appendChild(ic);
    });

    new DragDrop({
        container: list.el,
        handle:    '.dd-card-handle',
        on_reorder: (items, from, to) => {
            const names = items.map(el => el.querySelector('.dd-card-title')?.textContent || '').join(', ');
            ux.toast(`Reordered: ${from} → ${to}`);
        },
    });

    el.c('p', '').el.style.cssText = 'font-size:12px;color:#9a9a94;margin-top:8px;';
    el.c('p', '').el.textContent = 'Only the ⠿ handle activates drag. Click elsewhere on cards freely.';
});
