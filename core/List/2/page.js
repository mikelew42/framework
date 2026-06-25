import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List2 from "./List2.test.js";

app.$root.ac("page");

h1("List2 — derived / filtered lists");
p("`filter(fn)` (alias `derive(fn)`) creates a snapshot-derived list that stays in sync as items are added or removed. The derived list subscribes to the source's `'add'`/`'remove'` events and re-evaluates the predicate on each change. Items move between lists automatically.");

await List2.test.run();
new Test1.View({ suite: List2.test }).render();

// Live demo
h1("Live demo");
p("Append numbers. The derived list auto-updates in real time.");

el("style", `
    .l2-col { display: inline-block; vertical-align: top; margin: 0.5em 1em; font-family: monospace; }
    .l2-col h3 { margin: 0.3em 0; }
    .l2-item { padding: 0.2em 0.5em; background: #eef; border-radius: 3px; margin: 0.2em 0; }
`);

const source = new List2();
let n = 0;

// Build two derived views
const evens = source.filter(x => x % 2 === 0);
const odds  = source.filter(x => x % 2 !== 0);

function make_col(title, list) {
    return div.c("l2-col", () => {
        el("h3", title);
        const items_el = div();
        list.on('add', item => {
            const span = el("span").ac("l2-item");
            span.el.textContent = item;
            items_el.el.appendChild(span.el);
        });
        list.on('remove', item => {
            for (const child of [...items_el.el.children]) {
                if (child.textContent == item) { items_el.el.removeChild(child); break; }
            }
        });
    });
}

div(() => {
    make_col("All", source);
    make_col("Evens", evens);
    make_col("Odds", odds);
});

el("button", "Add number").el.addEventListener("click", () => source.append(++n));
el("button", "Remove first").el.addEventListener("click", () => {
    if (source.children.length) source.remove(source.children[0]);
});
