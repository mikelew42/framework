import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item1 from "./Item1.test.js";

app.$root.ac("page");

h1("Item1 — async load/save lifecycle");
p("Adds a `ready` promise that resolves after `saver.load(item)` completes, so you can `await item.ready` before reading data. `save()` and `delete()` now return Promises. The constructor kicks off loading immediately.");

el("style", `
    .i1-demo { font-family: sans-serif; max-width: 32em; margin: 1em 0; }
    .i1-row { display: flex; gap: 0.5em; align-items: center; margin: 0.4em 0; }
    .i1-row label { width: 5em; font-size: 0.85em; color: #555; }
    .i1-row input { flex: 1; padding: 0.3em; }
    .i1-status { font-family: monospace; font-size: 0.85em; padding: 0.4em 0.7em; background: #f5f5f5; border-radius: 4px; margin: 0.5em 0; }
    .i1-btns { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .i1-store { font-family: monospace; font-size: 0.8em; color: #555; margin-top: 0.5em; }
`);

// A simple async in-memory saver so we can demo the lifecycle
class DemoSaver {
    constructor() { this._store = null; }
    async load(item) {
        await new Promise(r => setTimeout(r, 300)); // simulate async fetch
        if (this._store) Object.assign(item.data, this._store);
    }
    async save(item) {
        await new Promise(r => setTimeout(r, 150));
        this._store = { ...item.data };
    }
    async delete() {
        await new Promise(r => setTimeout(r, 100));
        this._store = null;
    }
}

const saver = new DemoSaver();
let item = new Item1({ data: { name: '', note: '' }, saver });
let status_el, store_el;

div.c("i1-demo", () => {
    status_el = div.c("i1-status", "loading…");
    store_el  = div.c("i1-store", "saver._store: null");

    for (const key of ['name', 'note']) {
        div.c("i1-row", () => {
            el("label", key);
            const input = el("input");
            item.ready.then(() => { input.el.value = item.get(key) || ''; });
            input.el.addEventListener("input", () => item.set(key, input.el.value));
        });
    }

    div.c("i1-btns", () => {
        el("button", "save()").el.addEventListener("click", async () => {
            status_el.el.textContent = 'saving…';
            await item.save();
            status_el.el.textContent = 'saved ✓';
            store_el.el.textContent = `saver._store: ${JSON.stringify(saver._store)}`;
        });

        el("button", "reload (new Item1)").el.addEventListener("click", async () => {
            status_el.el.textContent = 'loading…';
            item = new Item1({ data: {}, saver });
            await item.ready;
            status_el.el.textContent = 'ready ✓';
            for (const input of document.querySelectorAll('.i1-row input')) {
                const key = input.closest('.i1-row').querySelector('label').textContent;
                input.value = item.get(key) || '';
            }
        });

        el("button", "delete()").el.addEventListener("click", async () => {
            status_el.el.textContent = 'deleting…';
            await item.delete();
            status_el.el.textContent = 'deleted ✓';
            store_el.el.textContent = `saver._store: null`;
        });
    });
});

item.ready.then(() => { status_el.el.textContent = 'ready ✓'; });

h1("Tests");
await Item1.test.run();
new Test1.View({ suite: Item1.test }).render();
