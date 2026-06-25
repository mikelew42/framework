import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item5 from "./Item5.test.js";
import LocalStorageSaver from "/framework/ext/LocalStorageSaver/LocalStorageSaver.js";

app.$root.ac("page");

h1("Item5 — reactive field events");
p("Adds an event emitter: `on(event, fn)`, `off(event, fn)`, `emit()`. `set()` now emits a `'change'` event with `(key, newVal, oldVal)` whenever a value actually changes. This is the foundation for reactive UIs — bind a listener to `'change'` and your display always reflects current state.");

await Item5.test.run();
new Test1.View({ suite: Item5.test }).render();

// Live demo: fields react to item.set() in real time
h1("Live demo");
p("Any set() call on the item instantly updates the bound display.");

el("style", `
    .i5-demo { font-family: sans-serif; max-width: 30em; margin: 1em; }
    .i5-field { margin: 0.5em 0; }
    .i5-field label { display: block; font-weight: bold; font-size: 0.85em; color: #555; }
    .i5-field input, .i5-field textarea { width: 100%; padding: 0.4em; font-size: 1em; box-sizing: border-box; }
    .i5-display { margin-top: 1em; padding: 0.8em; background: #f5f5f5; border-radius: 4px; font-family: monospace; }
    .i5-display .field { color: #666; } .i5-display .val { color: #00a; }
`);

const note = new Item5({ saver: new LocalStorageSaver({ key: 'i5-demo-note' }) });
await note.ready;

div.c("i5-demo", () => {
    // Input fields
    for (const key of ['title', 'body']) {
        div.c("i5-field", () => {
            el("label", key);
            const input = el("input");
            input.el.value = note.get(key) || '';
            input.el.addEventListener("input", () => note.set(key, input.el.value));
        });
    }

    // Live bound display — updates whenever any field changes
    const display = div.c("i5-display");

    function refresh() {
        display.el.innerHTML = Object.entries(note.data)
            .map(([k, v]) => `<span class="field">${k}:</span> <span class="val">${JSON.stringify(v)}</span>`)
            .join('<br>') || '(empty)';
    }

    note.on('change', refresh);
    refresh();

    el("button", "Save").el.addEventListener("click", () => note.save());
    el("button", "Delete").el.addEventListener("click", async () => {
        await note.delete();
        for (const input of display.el.closest('.i5-demo').querySelectorAll('input')) {
            input.value = '';
        }
        refresh();
    });
});
