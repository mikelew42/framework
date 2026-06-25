import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List0 from "./List0.test.js";

app.$root.ac("page");

h1("List0 — ordered collection with traversal");
p("The foundational ordered collection. `append(item)` / `insert(item, idx)` / `remove(item)` manage the `children` array and set each item's `parent`. `each(fn)`, `find(fn)`, `walk(fn)` traverse the tree. `map(fn)` returns a new List. `Symbol.iterator` makes it `for...of` friendly. No events yet — that's List1.");

el("style", `
    .l0-demo { font-family: sans-serif; max-width: 32em; margin: 1em 0; }
    .l0-chips { min-height: 2.5em; padding: 0.4em; background: #f5f5f5; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    .l0-chip { display: inline-block; padding: 0.2em 0.5em; background: #ddf; border-radius: 3px; margin: 0.15em; }
    .l0-output { font-family: monospace; font-size: 0.85em; color: #333; margin: 0.4em 0; padding: 0.3em 0.5em; background: #f9f9f9; border-radius: 3px; }
    .l0-btns { display: flex; gap: 0.5em; flex-wrap: wrap; margin: 0.5em 0; }
`);

const list = new List0();
const items = ['apple', 'banana', 'cherry', 'date'];
items.forEach(x => list.append(x));

let chips_el, output_el;

div.c("l0-demo", () => {
    chips_el  = div.c("l0-chips");
    output_el = div.c("l0-output");

    div.c("l0-btns", () => {
        el("button", "Insert 'fig' at 0").el.addEventListener("click", () => {
            list.insert('fig', 0); refresh();
        });
        el("button", "Append 'grape'").el.addEventListener("click", () => {
            list.append('grape'); refresh();
        });
        el("button", "Remove first").el.addEventListener("click", () => {
            if (list.children.length) { list.remove(list.children[0]); refresh(); }
        });
        el("button", "find > 'c'").el.addEventListener("click", () => {
            const found = list.find(x => x > 'c');
            output_el.el.textContent = `find(x > 'c') → "${found}"`;
        });
        el("button", "map to upper").el.addEventListener("click", () => {
            const mapped = list.map(x => x.toUpperCase());
            output_el.el.textContent = `map(upper) → [${mapped.children.join(', ')}]`;
        });
        el("button", "for...of").el.addEventListener("click", () => {
            const result = [];
            for (const item of list) result.push(item);
            output_el.el.textContent = `for...of → [${result.join(', ')}]`;
        });
    });

    refresh();
});

function refresh() {
    chips_el.el.innerHTML = '';
    list.each(item => {
        const chip = document.createElement('span');
        chip.className = 'l0-chip';
        chip.textContent = item;
        chips_el.el.appendChild(chip);
    });
    output_el.el.textContent = `children.length = ${list.children.length}`;
}

h1("Tests");
await List0.test.run();
new Test1.View({ suite: List0.test }).render();
