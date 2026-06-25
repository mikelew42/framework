import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List7 from "./List7.test.js";
import Item5 from "/framework/core/Item/5/Item5.js";

app.$root.ac("page");

h1("List7 — sort_reactive");
p("`sort_reactive(compareFn, watch_keys?)` maintains a live sorted list that re-sorts when watched keys change on any item. When a key changes, the item is removed from its current position and re-inserted at the correct sorted index. Extends the static `sort()` from List3.");

await List7.test.run();
new Test1.View({ suite: List7.test }).render();

h1("Live demo — reactive sorted leaderboard");
p("Scores update in real time. The sorted list re-orders on every change.");

el("style", `
    .board { font-family: sans-serif; max-width: 28em; margin: 1em; }
    .board-row { display: flex; align-items: center; gap: 0.5em; padding: 0.3em 0; border-bottom: 1px solid #eee; }
    .rank { width: 2em; text-align: right; color: #888; font-size: 0.85em; }
    .name { flex: 1; }
    .score { font-weight: bold; width: 3em; text-align: right; }
    .adj { display: flex; gap: 0.2em; }
    .adj button { font-size: 0.75em; padding: 0.1em 0.4em; cursor: pointer; }
`);

const players = new List7();
const seed = [
    { name: 'Alice', score: 120 },
    { name: 'Bob', score: 85 },
    { name: 'Carol', score: 200 },
    { name: 'Dave', score: 60 },
    { name: 'Eve', score: 145 },
];
seed.forEach(d => players.append(new Item5({ data: d })));

// Sorted high → low score
const sorted = players.sort_reactive((a, b) => b.data.score - a.data.score, ['score']);

div.c("board", () => {
    const rows = [];

    const render_rows = () => {
        rows.forEach(r => r.el.remove());
        rows.length = 0;
        sorted.each((player, idx) => {
            const row = div.c("board-row");
            div.c("rank", `${idx + 1}.`).append_to(row);
            div.c("name", player.data.name).append_to(row);
            const score_el = div.c("score", player.data.score).el;
            row.el.appendChild(score_el);
            player.on('change', (key, val) => { if (key === 'score') score_el.textContent = val; });
            div.c("adj", () => {
                el("button", "+10").el.addEventListener("click", () => player.set('score', player.data.score + 10));
                el("button", "−10").el.addEventListener("click", () => player.set('score', player.data.score - 10));
            }).append_to(row);
            rows.push(row);
        });
    };

    render_rows();
    sorted.on('add', () => render_rows());
    sorted.on('remove', () => render_rows());
});
