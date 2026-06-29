import app, { el, div, p, h1, h2, style } from '/app.js';
import Draggable2 from './Draggable2.js';

app.$root.ac('page');

style(`
.page { padding: 32px; max-width: 680px; display: flex; flex-direction: column; gap: 28px; }
.demo { border: 1px solid #ececea; border-radius: 10px; padding: 20px; background: #fff; }
.demo-title { font-size: 11px; font-weight: 700; color: #9a9a94;
    text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px; }

.sort-list { display: flex; flex-direction: column; gap: 6px; }

.sort-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    background: #ededfc; border: 2px solid #5b57d6;
    color: #5b57d6; font-size: 13px; font-weight: 500;
    user-select: none; cursor: grab;
    touch-action: none;
}
.sort-item.drag-handle { touch-action: none; }
.sort-item.dragging { pointer-events: none; }

.drag-ghost {
    opacity: 0.92; border-radius: 8px; cursor: grabbing;
    box-shadow: 0 6px 24px rgba(91,87,214,0.22);
}

.drag-placeholder {
    border-radius: 8px;
    background: #e8e8fc;
    border: 2px dashed #a09cf0;
}

.h-list { display: flex; flex-direction: row; gap: 6px; }
.h-item {
    padding: 10px 18px; border-radius: 8px;
    background: #fef3e2; border: 2px solid #e8a020;
    color: #8a5f10; font-size: 13px; font-weight: 500;
    user-select: none; cursor: grab; touch-action: none;
    white-space: nowrap;
}
.h-item.drag-handle { touch-action: none; }
.h-item.drag-ghost  { opacity: 0.92; cursor: grabbing;
    box-shadow: 0 6px 24px rgba(232,160,32,0.22); }
.h-item.drag-placeholder { background: #fef3e2; border: 2px dashed #e8c080; }

.log { font-size: 11px; color: #9a9a94; font-family: monospace;
    margin-top: 10px; min-height: 1.4em; white-space: nowrap; overflow: hidden; }
`);

h1('Draggable2');
p('Sortable list reordering. Ghost follows cursor; placeholder shows the landing slot. Extends Draggable1 — all drop hooks still work.');

// ── 1. Vertical sortable — DOM only ──────────────────────────────────────────

div.c('demo', () => {
    el('p', 'Vertical sort — DOM only (no data model)').ac('demo-title');
    p('Drag any row to reorder. No `list`/`item` needed — pure DOM.');

    div.c('sort-list', () => {
        ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'].forEach(name => {
            const row = div.c('sort-item', name);
            new Draggable2({ view: row });
        });
    });
});

// ── 2. Vertical sortable with List data model ─────────────────────────────────

div.c('demo', () => {
    el('p', 'Vertical sort — synced to a data list').ac('demo-title');
    p('Pass `list` and `item`. On drop, `list.remove(item)` + `list.insert(item, index)` run automatically. Log shows updated order.');

    const log = div.c('log', '—');

    const items = [
        { name: 'Task A' },
        { name: 'Task B' },
        { name: 'Task C' },
        { name: 'Task D' },
    ];

    // minimal list-compatible object (any obj with remove + insert works)
    const list = {
        children: items,
        remove(item) {
            const i = this.children.indexOf(item);
            if (i >= 0) this.children.splice(i, 1);
        },
        insert(item, index) {
            this.children.splice(index, 0, item);
            log.text('Order: ' + this.children.map(d => d.name).join(' → '));
        },
    };

    div.c('sort-list', () => {
        items.forEach(datum => {
            const row = div.c('sort-item', datum.name);
            new Draggable2({ view: row, list, item: datum });
        });
    });
});

// ── 3. Horizontal sortable ────────────────────────────────────────────────────

div.c('demo', () => {
    el('p', 'Horizontal sort — `horizontal: true`').ac('demo-title');
    p('Compares `clientX` to sibling midpoints instead of `clientY`.');

    div.c('h-list', () => {
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(name => {
            const chip = el.c('div', 'h-item', name);
            // ghost_class adds to clone's existing classes (h-item already there)
            // placeholder_class sets all classes on a fresh div
            new Draggable2({ view: chip, horizontal: true,
                ghost_class:       'drag-ghost',
                placeholder_class: 'h-item drag-placeholder',
            });
        });
    });
});

// ── 4. Custom ghost + placeholder classes ─────────────────────────────────────

div.c('demo', () => {
    el('p', 'Custom ghost style — `ghost_class` opt').ac('demo-title');
    p('Pass `ghost_class` and `placeholder_class` to control appearance.');

    style(`
    .green-item {
        padding: 10px 14px; border-radius: 8px;
        background: #e6f9f0; border: 2px solid #22a06b;
        color: #22a06b; font-size: 13px; font-weight: 500;
        user-select: none; cursor: grab; touch-action: none;
    }
    .green-ghost {
        opacity: 0.85; border-radius: 8px; cursor: grabbing;
        box-shadow: 0 6px 20px rgba(34,160,107,0.25);
        transform: rotate(2deg);
    }
    .green-placeholder {
        border-radius: 8px;
        background: transparent;
        border: 2px dashed #22a06b;
    }
    `);

    div.c('sort-list', () => {
        ['Broccoli', 'Carrot', 'Kale', 'Spinach'].forEach(name => {
            const row = el.c('div', 'green-item', name);
            new Draggable2({
                view:              row,
                ghost_class:       'green-ghost',
                placeholder_class: 'green-placeholder',
            });
        });
    });
});
