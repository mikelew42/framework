import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List3 from "./List3.test.js";

app.$root.ac("page");

h1("List3 — sorted derived lists");
p("`sort(compareFn)` creates a sorted snapshot that stays in sync: when items are added it finds the correct insertion index via binary-style scan; removes propagate too. Combine with `filter()` to get a live sorted-filtered view in one chain.");

await List3.test.run();
new Test1.View({ suite: List3.test }).render();

// Live demo
h1("Live demo");
p("Click to add random numbers. All three derived views update in real time.");

el("style", `
    .l3-cols { display: flex; gap: 1.5em; margin: 1em 0; font-family: monospace; }
    .l3-col h3 { margin: 0.2em 0; font-size: 0.95em; }
    .l3-item { padding: 0.15em 0.4em; background: #eef; border-radius: 3px; margin: 0.15em 0; }
`);

const source = new List3();
const asc_view    = source.sort((a, b) => a - b);
const desc_view   = source.sort((a, b) => b - a);
const evens_asc   = source.filter(n => n % 2 === 0).sort((a, b) => a - b);

function make_col(title, list) {
    let container;
    div.c("l3-col", () => {
        el("h3", title);
        container = div();
        list.on('add', item => {
            const span = el("span").ac("l3-item");
            span.el.textContent = item;
            // find correct insertion position
            const idx = list.children.indexOf(item);
            if (idx >= container.el.children.length) {
                container.el.appendChild(span.el);
            } else {
                container.el.insertBefore(span.el, container.el.children[idx]);
            }
        });
        list.on('remove', item => {
            for (const c of [...container.el.children]) {
                if (c.textContent == item) { container.el.removeChild(c); break; }
            }
        });
    });
}

div.c("l3-cols", () => {
    make_col("All (insertion order)", source);
    make_col("Sorted ↑", asc_view);
    make_col("Sorted ↓", desc_view);
    make_col("Evens ↑", evens_asc);
});

el("button", "Add random").el.addEventListener("click", () => {
    source.append(Math.floor(Math.random() * 20) + 1);
});
el("button", "Remove first").el.addEventListener("click", () => {
    if (source.children.length) source.remove(source.children[0]);
});
