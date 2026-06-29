import app, { el, div, p, h1, style } from '/app.js';
import Draggable1 from './Draggable1.js';

app.$root.ac('page');

style(`
.page { padding: 32px; max-width: 680px; display: flex; flex-direction: column; gap: 28px; }
.demo { border: 1px solid #ececea; border-radius: 10px; padding: 20px; background: #fff; }
.demo-title { font-size: 11px; font-weight: 700; color: #9a9a94;
    text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px; }

.card {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.4em 1em; border-radius: 8px;
    background: #ededfc; border: 2px solid #5b57d6;
    color: #5b57d6; font-size: 13px; font-weight: 500;
    user-select: none; cursor: grab;
    transition: box-shadow 0.1s;
}
.card.dragging { cursor: grabbing; box-shadow: 0 4px 16px rgba(91,87,214,0.18); }
.card.drag-handle { touch-action: none; }

.zone {
    flex: 1; min-height: 80px; border-radius: 8px;
    border: 2px dashed #d6d6d2; background: #fafafa;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #aaa; gap: 6px; flex-wrap: wrap;
    padding: 12px; transition: border-color 0.1s, background 0.1s;
}
.zone.drag-over { border-color: #5b57d6; background: #f0f0fd; }
.zones { display: flex; gap: 12px; }

.log { font-size: 11px; color: #9a9a94; font-family: monospace; margin-top: 10px; min-height: 1.4em; }

.resize-target {
    display: flex; align-items: center;
    height: 64px; width: 220px;
    background: #fafafa; border: 1px solid #e6e6e3; border-radius: 8px;
    position: relative;
}
.resize-inner { flex: 1; font-size: 12px; color: #9a9a94; padding: 0 14px; }
.resize-grip {
    position: absolute; right: -5px; top: 50%; transform: translateY(-50%);
    width: 10px; height: 32px; border-radius: 5px;
    background: #5b57d6; cursor: ew-resize;
}
.resize-grip:hover { background: #4b47c6; }
`);

h1('Draggable1');
p('Extends Draggable0. Adds a drop-target system: every instance auto-registers as a target. Document events instead of Pointer Capture so `e.target` reflects what is under the cursor.');

// ── 1. Basic drop — drag a card between zones ─────────────────────────────────

div.c('demo', () => {
    el('p', 'Basic drop — drag the card into a zone').ac('demo-title');

    const log = div.c('log', '—');

    let left_d, right_d;

    div.c('zones', () => {
        const left  = div.c('zone', 'zone A');
        const right = div.c('zone', 'zone B');
        const card  = div.c('card', 'drag me');
        left.append(card);

        left_d = new Draggable1({
            view: left,
            enter(d, e) { left.ac('drag-over');  log.text('enter: zone A'); },
            leave(d, e) { left.rc('drag-over'); },
        });

        right_d = new Draggable1({
            view: right,
            enter(d, e) { right.ac('drag-over'); log.text('enter: zone B'); },
            leave(d, e) { right.rc('drag-over'); },
        });

        new Draggable1({
            view: card,
            drop_check(target, e) { return target === left_d || target === right_d; },
            drop(target, e) {
                target.view.append(card);
                log.text(`dropped into ${target === left_d ? 'zone A' : 'zone B'}`);
            },
        });
    });
});

// ── 2. Filtered drop — drop_check rejects certain targets ─────────────────────

div.c('demo', () => {
    el('p', 'Filtered drop — only the green zone accepts').ac('demo-title');
    p('`drop_check` on the dragging card decides which targets are valid. The red zone fires `enter` but `drop_check` rejects it.');

    const log = div.c('log', '—');

    div.c('zones', () => {
        const accept = div.c('zone', '✓ accept').style('border-color', '#22a06b');
        const reject = div.c('zone', '✗ reject').style('border-color', '#e34935');
        const card   = div.c('card', 'filtered card');
        accept.append(card);

        const accept_d = new Draggable1({
            view: accept,
            enter(d, e) { accept.ac('drag-over'); log.text('hovering accept'); },
            leave(d, e) { accept.rc('drag-over'); },
        });

        const reject_d = new Draggable1({
            view: reject,
            enter(d, e) { reject.style('border-color', '#e34935'); log.text('hovering reject (will not drop)'); },
            leave(d, e) { reject.style('border-color', '#e34935'); },
        });

        new Draggable1({
            view: card,
            drop_check(target, e) { return target === accept_d; },
            drop(target, e) {
                target.view.append(card);
                log.text('dropped ✓');
            },
        });
    });
});

// ── 3. Backwards compat — resize handle (drop_check returns false) ────────────

div.c('demo', () => {
    el('p', 'Backwards compat — resize (no drop)').ac('demo-title');
    p('`drop_check` returns `false` so no drop logic runs. Draggable0-style resize inside Draggable1.');

    div.c('resize-target', target => {
        div.c('resize-inner', 'resize →');
        const grip = div.c('resize-grip');

        new Draggable1({
            handle: grip,
            view:   grip,         // register grip as target (drop_check rejects self anyway)
            drop_check()  { return false; },
            start()       { this.start_w = target.el.offsetWidth; },
            move(dx)      { target.el.style.width = Math.max(80, this.start_w + dx) + 'px'; },
        });
    });
});
