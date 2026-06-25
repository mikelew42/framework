import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item2 from "./Item2.test.js";

app.$root.ac("page");

h1("Item2 — parent-child tree");
p("Adds an `items` array for parent-child relationships. `add(...children)` sets each child's parent; `remove(child)` clears it. Children inherit `saver` from the parent chain — set once at the root, all descendants share it. `toJSON()` serializes the whole tree.");

el("style", `
    .i2-demo { font-family: sans-serif; max-width: 36em; margin: 1em 0; }
    .i2-tree { font-family: monospace; font-size: 0.85em; padding: 0.5em; background: #f5f5f5; border-radius: 4px; }
    .i2-node { padding: 0.15em 0; }
    .i2-children { margin-left: 1.5em; border-left: 2px solid #ccc; padding-left: 0.5em; }
    .i2-key { color: #008; }
    .i2-val { color: #060; }
    .i2-btns { display: flex; gap: 0.5em; flex-wrap: wrap; margin: 0.5em 0; }
    .i2-saver { font-family: monospace; font-size: 0.8em; color: #555; margin-top: 0.5em; }
`);

const root = new Item2({ data: { name: 'Root' } });
const saves = [];
root.saver = {
    save(item, patch) { saves.unshift(`${item.data.name}: ${JSON.stringify(patch)}`); refresh_saver(); }
};

let tree_el, saver_log;

div.c("i2-demo", () => {
    tree_el   = div.c("i2-tree");
    saver_log = div.c("i2-saver", "— no saves yet —");

    div.c("i2-btns", () => {
        el("button", "Add child to root").el.addEventListener("click", () => {
            const n = root.items.length + 1;
            root.add(new Item2({ data: { name: `Child ${n}` } }));
            refresh();
        });
        el("button", "Add grandchild").el.addEventListener("click", () => {
            if (!root.items.length) return;
            const child = root.items[0];
            child.add(new Item2({ data: { name: `GC ${child.items.length + 1}` } }));
            refresh();
        });
        el("button", "Remove last child").el.addEventListener("click", () => {
            if (root.items.length) root.remove(root.items[root.items.length - 1]);
            refresh();
        });
        el("button", "Save root").el.addEventListener("click", () => {
            root.set('ts', Date.now()); root.save();
        });
        el("button", "Save child (inherits saver)").el.addEventListener("click", () => {
            if (!root.items.length) return;
            root.items[0].set('ts', Date.now()); root.items[0].save();
        });
    });

    refresh();
});

function render_node(item, container_el) {
    const node = document.createElement('div');
    node.className = 'i2-node';
    node.innerHTML = `<span class="i2-key">${item.data.name}</span> — parent: <span class="i2-val">${item.parent?.data?.name ?? 'null'}</span>`;
    container_el.appendChild(node);
    if (item.items.length) {
        const kids = document.createElement('div');
        kids.className = 'i2-children';
        item.items.forEach(c => render_node(c, kids));
        container_el.appendChild(kids);
    }
}

function refresh() {
    tree_el.el.innerHTML = '';
    render_node(root, tree_el.el);
}

function refresh_saver() {
    saver_log.el.innerHTML = saves.slice(0, 5).map(s => `<div>${s}</div>`).join('');
}

h1("Tests");
await Item2.test.run();
new Test1.View({ suite: Item2.test }).render();
