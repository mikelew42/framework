import app, { el, div, p, h1, style } from '/app.js';
import Draggable0 from './Draggable0.js';

app.$root.ac('page');

style(`
.page { padding: 32px; max-width: 680px; display: flex; flex-direction: column; gap: 28px; }
.demo { border: 1px solid #ececea; border-radius: 10px; padding: 20px; background: #fff; }
.demo-title { font-size: 11px; font-weight: 700; color: #9a9a94;
    text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px; }
.drag-pill {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.4em 1em; border-radius: 8px;
    background: #ededfc; border: 2px solid #5b57d6;
    color: #5b57d6; font-size: 13px; font-weight: 500;
    user-select: none; cursor: grab;
    transition: box-shadow 0.1s;
}
.drag-pill.dragging { cursor: grabbing; box-shadow: 0 4px 16px rgba(91,87,214,0.2); }
.drag-pill.drag-handle { touch-action: none; }
.drag-area {
    position: relative; height: 100px;
    background: #fafafa; border: 1px dashed #e6e6e3; border-radius: 8px;
    overflow: hidden;
}
.resize-target {
    display: flex; align-items: center;
    height: 64px; width: 220px;
    background: #fafafa; border: 1px solid #e6e6e3; border-radius: 8px;
    position: relative; overflow: visible;
}
.resize-inner { flex: 1; font-size: 12px; color: #9a9a94; padding: 0 14px; }
.resize-grip {
    position: absolute; right: -5px; top: 50%; transform: translateY(-50%);
    width: 10px; height: 32px; border-radius: 5px;
    background: #5b57d6; cursor: ew-resize;
}
.resize-grip:hover { background: #4b47c6; }
.log { font-size: 11px; color: #9a9a94; font-family: monospace; margin-top: 10px; min-height: 1.4em; }
`);

h1('Draggable0');
p('Minimal pointer lifecycle. Pointer Capture — no document listeners. Hooks: `start(e)`, `move(dx, dy, e)`, `stop(dx, dy, e)`.');
p('Pass hooks as constructor opts or override in a subclass. `this` inside the hook is the Draggable0 instance.');

// ── 1. Basic — callback style ─────────────────────────────────────────────────

div.c('demo', () => {
    el('p', 'Basic — hooks as opts').ac('demo-title');

    const pill = div.c('drag-pill', 'drag me');
    const log  = div.c('log', '—');

    new Draggable0({
        view: pill,
        start()          { log.text('start'); },
        move(dx, dy)     { log.text(`move  Δx:${dx}  Δy:${dy}`); },
        stop(dx, dy)     { log.text(`stop  Δx:${dx}  Δy:${dy}`); },
    });
});

// ── 2. Free move — translate accumulates across drags ────────────────────────

div.c('demo', () => {
    el('p', 'Free move — translate accumulates across drags').ac('demo-title');

    const area = div.c('drag-area');
    const pill = div.c('drag-pill', 'drag me').style({ position: 'absolute', top: '16px', left: '16px' });
    area.append(pill);

    let tx = 0, ty = 0;

    new Draggable0({
        view: pill,
        move(dx, dy) {
            pill.style('transform', `translate(${tx + dx}px, ${ty + dy}px)`);
        },
        stop(dx, dy) {
            tx += dx; ty += dy;
            pill.style('transform', `translate(${tx}px, ${ty}px)`);
        },
    });
});

// ── 3. Resize — separate handle element, horizontal axis only ─────────────────

div.c('demo', () => {
    el('p', 'Resize — separate handle, horizontal axis').ac('demo-title');

    div.c('resize-target', target => {
        div.c('resize-inner', 'resize →');
        const grip = div.c('resize-grip');

        new Draggable0({
            handle: grip,           // only the grip registers pointerdown
            start()  { this.start_width = target.el.offsetWidth; },
            move(dx) { target.el.style.width = Math.max(80, this.start_width + dx) + 'px'; },
        });
    });
});

// ── 4. Subclass — Scrubber ────────────────────────────────────────────────────

div.c('demo', () => {
    el('p', 'Subclass — Scrubber (horizontal drag → number)').ac('demo-title');
    p('Extend `Draggable0` and override the hooks. Constructor opts become instance properties.');

    class Scrubber extends Draggable0 {
        start()  { this.start_val = this.value ?? 0; }
        move(dx) {
            this.value = Math.round(this.start_val + dx * (this.step ?? 1));
            if (this.on_change) this.on_change(this.value);
        }
    }

    const knob = div.c('drag-pill', '0').style({ cursor: 'ew-resize', minWidth: '3.5em' });

    new Scrubber({
        view: knob,
        value: 0,
        step: 1,
        on_change(v) { knob.text(String(v)); },
    });
});
