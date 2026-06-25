import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List4 from "./List4.test.js";

app.$root.ac("page");

h1("List4 — reactive transform");
p("`transform(fn)` creates a live mapped list — unlike the static `map()` from List0, this one stays in sync as items are added or removed. Uses an internal Map to remember source→transformed pairs for O(1) removal. Chain with `filter()` and `sort()` to build complex derived pipelines.");

await List4.test.run();
new Test1.View({ suite: List4.test }).render();

// Live demo: items → rendered label strings, filtered and sorted
h1("Live demo");
p("Append items. All derived views update automatically.");

el("style", `
    .l4-cols { display: flex; gap: 1.5em; flex-wrap: wrap; margin: 1em 0; font-family: monospace; }
    .l4-col h3 { margin: 0.2em 0; font-size: 0.9em; }
    .l4-item { padding: 0.2em 0.5em; background: #e8f4ff; border-radius: 3px; margin: 0.15em 0; }
`);

const items = new List4();
let counter = 0;

// Chain: filter evens → transform to label → sort alphabetically
const even_labels = items
    .filter(n => n % 2 === 0)
    .transform(n => `item-${n}`)
    .sort((a, b) => a.localeCompare(b));

const odd_squared = items
    .filter(n => n % 2 !== 0)
    .transform(n => n * n)
    .sort((a, b) => a - b);

function make_col(title, list) {
    div.c("l4-col", () => {
        el("h3", title);
        const container = div();
        list.on('add', (item, idx) => {
            const span = el("span").ac("l4-item");
            span.el.textContent = String(item);
            const refEl = container.el.children[idx];
            if (refEl) container.el.insertBefore(span.el, refEl);
            else container.el.appendChild(span.el);
        });
        list.on('remove', item => {
            for (const c of [...container.el.children]) {
                if (c.textContent === String(item)) { container.el.removeChild(c); break; }
            }
        });
    });
}

div.c("l4-cols", () => {
    make_col("Source", items);
    make_col("Evens → label → sorted", even_labels);
    make_col("Odds → squared → sorted ↑", odd_squared);
});

el("button", "Append next").el.addEventListener("click", () => items.append(++counter));
el("button", "Remove first").el.addEventListener("click", () => {
    if (items.children.length) items.remove(items.children[0]);
});
