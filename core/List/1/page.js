import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List1 from "./List1.test.js";

app.$root.ac("page");

h1("List1 — add/remove events");
p("Adds an event emitter to List0. `append()` and `insert()` emit `'add'(item, idx)`; `remove()` emits `'remove'(item, idx)`. Everything that reacts to list changes — derived lists, view bindings — subscribes here.");

await List1.test.run();
new Test1.View({ suite: List1.test }).render();

// Live demo: add/remove events driving DOM
h1("Live demo");

el("style", `
    .l1-demo { font-family: monospace; margin: 1em; }
    .l1-item { padding: 0.3em 0.6em; margin: 0.2em; background: #eef; border-radius: 4px; display: inline-block; }
    .l1-log  { margin-top: 1em; color: #555; font-size: 0.85em; max-height: 6em; overflow: auto; }
    .l1-log div { padding: 0.1em 0; }
`);

const list = new List1();
let logEl;

div.c("l1-demo", () => {
    const itemsEl = div.c("l1-items");
    logEl = div.c("l1-log");

    list.on('add', (item, idx) => {
        const span = el("span").ac("l1-item");
        span.textContent = item;
        itemsEl.el.insertBefore(span, itemsEl.el.children[idx]);
        logEl.el.innerHTML = `<div>+ added "${item}" at ${idx}</div>` + logEl.el.innerHTML;
    });

    list.on('remove', (item, idx) => {
        if (itemsEl.el.children[idx]) itemsEl.el.removeChild(itemsEl.el.children[idx]);
        logEl.el.innerHTML = `<div>− removed "${item}" from ${idx}</div>` + logEl.el.innerHTML;
    });

    el("button", "Append 'x'").el.addEventListener("click", () => list.append('x'));
    el("button", "Append 'y'").el.addEventListener("click", () => list.append('y'));
    el("button", "Insert 'z' at 0").el.addEventListener("click", () => list.insert('z', 0));
    el("button", "Remove first").el.addEventListener("click", () => {
        if (list.children.length) list.remove(list.children[0]);
    });
});
