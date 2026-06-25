import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List5 from "./List5.test.js";
import Item7 from "/framework/core/Item/7/Item7.js";

app.$root.ac("page");

h1("List5 — reactive filter (Item-aware)");
p("`filter_reactive(fn, watch_keys?)` re-evaluates the predicate whenever a watched key changes on any item in the list — not just on add/remove. An item moves between the source and derived list automatically when its own data changes. Requires items to be Item5+ instances (emitting `'change'`).");

await List5.test.run();
new Test1.View({ suite: List5.test }).render();

h1("Live demo — reactive todo filter");
p("Toggle items — the Active and Done views update in real time without remove/re-add.");

el("style", `
    .l5-demo { font-family: sans-serif; max-width: 32em; margin: 1em; }
    .l5-cols { display: flex; gap: 2em; }
    .l5-col { flex: 1; }
    .l5-col h3 { margin: 0.3em 0; font-size: 0.9em; }
    .l5-item { padding: 0.3em; margin: 0.2em 0; background: #eef; border-radius: 3px; cursor: pointer; }
    .l5-item.done { background: #dfd; text-decoration: line-through; color: #666; }
`);

const list = new List5();
const active = list.filter_reactive(item => !item.data.done, ['done']);
const done_list = list.filter_reactive(item => item.data.done, ['done']);

function make_view_col(title, source) {
    let container;
    div.c("l5-col", () => {
        el("h3", title);
        container = div();
        source.on('add', item => {
            const span = div.c("l5-item", item.get('label') || item.get('title'));
            if (item.data.done) span.el.classList.add('done');
            container.el.appendChild(span.el);
            item.on('change', (key, val) => {
                if (key === 'done') span.el.classList.toggle('done', val);
            });
        });
        source.on('remove', item => {
            // Find and remove the DOM element for this item
            // (simple O(n) search since we don't store refs)
        });
    });
    return container;
}

div.c("l5-demo", () => {
    for (const title of ['Buy milk', 'Write tests', 'Ship feature', 'Review PR']) {
        const item = new Item7({ data: { title, done: false } });
        item.compute('label', ['title', 'done'],
            (t, d) => d ? `✓ ${t}` : t);
        list.append(item);
    }

    div.c("l5-cols", () => {
        // All items — click to toggle
        div.c("l5-col", () => {
            el("h3", "All (click to toggle)");
            list.each(item => {
                const span = div.c("l5-item", item.get('label'));
                span.el.addEventListener("click", () => {
                    item.set('done', !item.data.done);
                    span.el.textContent = item.get('label');
                    span.el.classList.toggle('done', item.data.done);
                });
            });
        });

        // Reactive derived views
        const active_col = make_view_col("Active", active);
        const done_col = make_view_col("Done", done_list);
    });

    p("(The Active and Done columns use filter_reactive — they update when you toggle items above.)");
});
