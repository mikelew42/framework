import app, { h1, p, div, el, pre } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item0 from "./Item0.test.js";

app.$root.ac("page");

h1("Item0 — get/set, dirty tracking, saver delegation");
p("The base domain object. Wraps a `data` object with `get(key)` / `set(key, val)`, tracks dirty keys, and delegates persistence to a swappable `saver`. No async, no events — just the minimal shape every higher level builds on.");

el("style", `
    .i0-demo { font-family: sans-serif; max-width: 32em; margin: 1em 0; }
    .i0-row { display: flex; gap: 0.5em; align-items: center; margin: 0.4em 0; }
    .i0-row label { width: 5em; font-size: 0.85em; color: #555; }
    .i0-row input { flex: 1; padding: 0.3em; font-size: 0.9em; }
    .i0-box { margin: 0.8em 0; padding: 0.5em 0.8em; background: #f5f5f5; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
    .i0-box .label { color: #888; font-size: 0.8em; margin-bottom: 0.3em; }
    .i0-dirty { color: #a60; }
    .i0-btns { display: flex; gap: 0.5em; margin: 0.5em 0; }
    .i0-log { margin-top: 0.5em; font-family: monospace; font-size: 0.8em; color: #555; max-height: 5em; overflow: auto; }
`);

const item = new Item0({ data: { name: 'Alice', role: 'editor' } });

// Stub saver so we can show what gets sent
const calls = [];
item.saver = {
    save(item, patch) { calls.unshift(`save(patch: ${JSON.stringify(patch)})`); refresh_log(); }
};

let data_el, dirty_el, log_el;

div.c("i0-demo", () => {
    for (const key of ['name', 'role']) {
        div.c("i0-row", () => {
            el("label", key);
            const input = el("input");
            input.el.value = item.get(key) || '';
            input.el.addEventListener("input", () => {
                item.set(key, input.el.value);
                refresh();
            });
        });
    }

    data_el  = div.c("i0-box", () => { div.c("label", "item.data"); div(); });
    dirty_el = div.c("i0-box", () => { div.c("label", "item._dirty"); div.c("i0-dirty"); });
    log_el   = div.c("i0-log");

    div.c("i0-btns", () => {
        el("button", "save()").el.addEventListener("click", () => { item.save(); refresh(); });
        el("button", "auto_save(500ms)").el.addEventListener("click", () => item.auto_save(500));
    });

    refresh();
});

function refresh() {
    data_el.el.children[1].textContent  = JSON.stringify(item.data);
    dirty_el.el.children[1].textContent = JSON.stringify(item._dirty) || '{}';
}
function refresh_log() {
    log_el.el.innerHTML = calls.slice(0, 8).map(c => `<div>${c}</div>`).join('');
}

h1("Tests");
await Item0.test.run();
new Test1.View({ suite: Item0.test }).render();
