import app, { h1, p, div, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item3 from "./Item3.test.js";

app.$root.ac("page");

h1("Item3 — jspath addressing + delta");
p("Adds hierarchical path addressing. The `path` property computes a dot-notation address from the parent chain (`root.0.2`). `delta(patch)` wraps dirty changes into `{ jspath, patch, ts }` for transmission. `apply_server_delta(patch)` applies remote changes only to non-dirty keys — enabling optimistic updates without overwriting in-flight local edits.");

el("style", `
    .i3-demo { font-family: sans-serif; max-width: 36em; margin: 1em 0; }
    .i3-box  { font-family: monospace; font-size: 0.85em; padding: 0.5em 0.8em; background: #f5f5f5; border-radius: 4px; margin: 0.4em 0; }
    .i3-label { color: #888; font-size: 0.75em; }
    .i3-tree  { margin: 0.5em 0; }
    .i3-node  { padding: 0.1em 0; }
    .i3-children { margin-left: 1.5em; border-left: 2px solid #ddd; padding-left: 0.5em; }
    .i3-path { color: #008; font-weight: bold; }
    .i3-btns { display: flex; gap: 0.5em; flex-wrap: wrap; margin: 0.5em 0; }
`);

const root = new Item3({ data: { type: 'root', value: 0 } });
const child_a = new Item3({ data: { type: 'A', value: 10 } });
const child_b = new Item3({ data: { type: 'B', value: 20 } });
const grandchild = new Item3({ data: { type: 'C', value: 30 } });
root.add(child_a, child_b);
child_a.add(grandchild);

let tree_el, delta_el;

div.c("i3-demo", () => {
    div.c("i3-label", "Tree — each node shows its computed path:");
    tree_el = div.c("i3-tree");

    div.c("i3-label", "delta() output — what gets sent to the server:");
    delta_el = div.c("i3-box", "—");

    div.c("i3-btns", () => {
        el("button", "Set root.value = 99").el.addEventListener("click", () => {
            root.set('value', 99);
            delta_el.el.innerHTML = `<pre>${JSON.stringify(root.delta({ value: 99 }), null, 2)}</pre>`;
        });
        el("button", "Set grandchild.value = 42").el.addEventListener("click", () => {
            grandchild.set('value', 42);
            delta_el.el.innerHTML = `<pre>${JSON.stringify(grandchild.delta({ value: 42 }), null, 2)}</pre>`;
        });
        el("button", "Apply server delta to child_b").el.addEventListener("click", () => {
            // Simulate a remote update; if value is dirty locally it won't be overwritten
            child_b.apply_server_delta({ value: 999, type: 'updated' });
            refresh();
        });
    });

    refresh();
});

function render_node(item, el) {
    const node = document.createElement('div');
    node.className = 'i3-node';
    node.innerHTML = `<span class="i3-path">${item.path}</span>  type=${item.data.type}  value=${item.data.value}`;
    el.appendChild(node);
    if (item.items.length) {
        const kids = document.createElement('div');
        kids.className = 'i3-children';
        item.items.forEach(c => render_node(c, kids));
        el.appendChild(kids);
    }
}

function refresh() {
    tree_el.el.innerHTML = '';
    render_node(root, tree_el.el);
}

h1("Tests");
await Item3.test.run();
new Test1.View({ suite: Item3.test }).render();
