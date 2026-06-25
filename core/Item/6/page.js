import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item6 from "./Item6.test.js";
import LocalStorageSaver from "/framework/ext/LocalStorageSaver/LocalStorageSaver.js";

app.$root.ac("page");

h1("Item6 — once, save events, batch");
p("Adds `once(event, fn)` for single-fire listeners, a `'save'` event after every `save()` call, and `batch(fn)` for bulk updates. Inside a batch, `'change'` events are queued and fired at the end — only the net change per key is emitted, so intermediate values are silently dropped.");

await Item6.test.run();
new Test1.View({ suite: Item6.test }).render();

// Live demo: batch edits + save status
h1("Live demo");

el("style", `
    .i6-demo { font-family: sans-serif; max-width: 30em; margin: 1em; }
    .i6-field { margin: 0.5em 0; }
    .i6-field label { display: block; font-weight: bold; font-size: 0.85em; color: #555; }
    .i6-field input { width: 100%; padding: 0.4em; box-sizing: border-box; }
    .i6-status { font-size: 0.85em; margin-top: 0.5em; font-family: monospace; color: #666; }
    .i6-log { margin-top: 0.5em; font-family: monospace; font-size: 0.8em; max-height: 5em; overflow: auto; background: #f5f5f5; padding: 0.4em; }
`);

const note = new Item6({ saver: new LocalStorageSaver({ key: 'i6-demo' }) });
await note.ready;

let statusEl, logEl;

div.c("i6-demo", () => {
    for (const key of ['title', 'body', 'tags']) {
        div.c("i6-field", () => {
            el("label", key);
            const input = el("input");
            input.el.value = note.get(key) || '';
            input.el.addEventListener("input", e => note.set(key, e.target.value));
        });
    }

    statusEl = div.c("i6-status", "ready");
    logEl = div.c("i6-log", "— no events yet —");

    note.on('change', (key, val) => {
        logEl.el.innerHTML = `<div>change: ${key} = ${JSON.stringify(val)}</div>` + logEl.el.innerHTML;
    });

    note.on('save', () => {
        statusEl.el.textContent = `saved at ${new Date().toLocaleTimeString()}`;
    });

    el("button", "Batch set all fields").el.addEventListener("click", () => {
        // All three change events are deferred and fired together
        note.batch(() => {
            note.set('title', 'Batched title');
            note.set('body', 'Set in one batch');
            note.set('tags', 'batch, demo');
        });
    });

    el("button", "Save").el.addEventListener("click", async () => {
        statusEl.el.textContent = 'saving…';
        await note.save();
    });

    el("button", "Delete").el.addEventListener("click", async () => {
        await note.delete();
        statusEl.el.textContent = 'deleted';
    });
});
