import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List8 from "./List8.test.js";
import Item5 from "/framework/core/Item/5/Item5.js";

app.$root.ac("page");

h1("List8 — index_by (O(1) lookup)");
p("`index_by(keyFn, watch_keys?)` returns a live Map from computed key → item. O(1) lookup by any derived key. Re-indexes on add/remove and when watched keys change. Last-write-wins on duplicate keys; the Map is cleaned up correctly on reassignment.");

await List8.test.run();
new Test1.View({ suite: List8.test }).render();

h1("Live demo — user directory with fast ID lookup");
p("Items are indexed by id. Type an ID to look up a user instantly (O(1)).");

el("style", `
    .dir { font-family: sans-serif; max-width: 28em; margin: 1em; }
    .dir-search { display: flex; gap: 0.5em; margin: 0.5em 0; }
    .dir-search input { flex: 1; padding: 0.4em; font-size: 0.9em; }
    .dir-result { padding: 0.4em; background: #f5f5f5; border-radius: 3px; font-size: 0.9em; min-height: 2em; }
    .dir-list { margin-top: 1em; }
    .dir-row { padding: 0.3em; border-bottom: 1px solid #eee; font-size: 0.85em; cursor: pointer; }
    .dir-row:hover { background: #eef; }
`);

const users = new List8();
const seed = [
    { id: 'u001', name: 'Alice',   role: 'admin' },
    { id: 'u002', name: 'Bob',     role: 'editor' },
    { id: 'u003', name: 'Carol',   role: 'viewer' },
    { id: 'u004', name: 'Dave',    role: 'editor' },
    { id: 'u005', name: 'Eve',     role: 'admin' },
];
seed.forEach(d => users.append(new Item5({ data: d })));

const by_id = users.index_by(u => u.data.id, ['id']);

div.c("dir", () => {
    div.c("dir-search", () => {
        const input = el("input");
        input.el.placeholder = "Enter user ID (e.g. u002)…";
        const result = div.c("dir-result", "—");
        input.el.addEventListener("input", () => {
            const user = by_id.get(input.el.value.trim());
            result.el.textContent = user
                ? `Found: ${user.data.name} (${user.data.role})`
                : input.el.value.trim() ? "Not found" : "—";
        });
    });

    div.c("dir-list", () => {
        users.each(user => {
            const row = div.c("dir-row", `${user.data.id} — ${user.data.name} (${user.data.role})`);
            row.el.addEventListener("click", () => {
                const input = document.querySelector('.dir-search input');
                if (input) { input.value = user.data.id; input.dispatchEvent(new Event('input')); }
            });
        });
    });
});
