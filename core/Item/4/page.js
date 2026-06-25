import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item4 from "./Item4.test.js";

app.$root.ac("page");

h1("Item4 — reactive List children");
p("Replaces the plain `items` array with a reactive `List1` instance. Now `add()` and `remove()` emit `'add'`/`'remove'` events, enabling views to stay in sync automatically. The child's `parent` is the Item4, not the List — saver inheritance still works through the item parent chain.");

el("style", `
    .i4-demo { font-family: sans-serif; max-width: 32em; margin: 1em 0; }
    .i4-list { font-family: monospace; font-size: 0.85em; padding: 0.5em; background: #f5f5f5; border-radius: 4px; min-height: 2em; }
    .i4-chip { display: inline-block; padding: 0.2em 0.5em; background: #ddf; border-radius: 3px; margin: 0.2em; cursor: pointer; }
    .i4-log  { font-family: monospace; font-size: 0.8em; color: #555; margin-top: 0.4em; max-height: 5em; overflow: auto; }
    .i4-btns { display: flex; gap: 0.5em; flex-wrap: wrap; margin: 0.5em 0; }
`);

const parent = new Item4({ data: { name: 'Parent' } });
const saves = [];
parent.saver = { save(item) { saves.unshift(`${item.data.name} saved`); } };

let list_el, log_el;

div.c("i4-demo", () => {
    p("Each chip shows child name and its parent (should always be 'Parent', not 'List').");
    list_el = div.c("i4-list", "(empty — add some children)");
    log_el  = div.c("i4-log", "— no events yet —");

    parent.items.on('add', (child, idx) => {
        log_el.el.innerHTML = `<div>add: ${child.data.name} at index ${idx}</div>` + log_el.el.innerHTML;
        refresh();
    });
    parent.items.on('remove', (child) => {
        log_el.el.innerHTML = `<div>remove: ${child.data.name}  parent cleared: ${child.parent === null}</div>` + log_el.el.innerHTML;
        refresh();
    });

    let n = 0;
    div.c("i4-btns", () => {
        el("button", "Add child").el.addEventListener("click", () => {
            const child = new Item4({ data: { name: `Child ${++n}` } });
            parent.add(child);
        });
        el("button", "Remove first").el.addEventListener("click", () => {
            if (parent.items.children.length) parent.remove(parent.items.children[0]);
        });
        el("button", "Save child (inherits saver)").el.addEventListener("click", () => {
            if (!parent.items.children.length) return;
            parent.items.children[0].set('ts', Date.now());
            parent.items.children[0].save();
            log_el.el.innerHTML = `<div>${saves[0]}</div>` + log_el.el.innerHTML;
        });
    });
});

function refresh() {
    const children = parent.items.children;
    if (!children.length) { list_el.el.textContent = '(empty)'; return; }
    list_el.el.innerHTML = '';
    children.forEach(child => {
        const chip = document.createElement('span');
        chip.className = 'i4-chip';
        chip.textContent = `${child.data.name}  (parent: ${child.parent?.data?.name ?? 'null'})`;
        list_el.el.appendChild(chip);
    });
}

h1("Tests");
await Item4.test.run();
new Test1.View({ suite: Item4.test }).render();
