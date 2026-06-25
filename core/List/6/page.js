import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import List6 from "./List6.test.js";
import Item5 from "/framework/core/Item/5/Item5.js";

app.$root.ac("page");

h1("List6 — group_by / group_by_reactive");
p("`group_by(fn)` partitions items into a Map of sub-lists by group key (static snapshot). `group_by_reactive(fn, watch_keys?)` keeps the Map live: when a watched key changes on an item, it moves to the new group automatically. Empty groups are deleted from the Map.");

await List6.test.run();
new Test1.View({ suite: List6.test }).render();

h1("Live demo — kanban board");
p("Tasks grouped by status. Drag is not wired but status changes via buttons move items reactively.");

el("style", `
    .kanban { display: flex; gap: 1em; font-family: sans-serif; }
    .lane { flex: 1; background: #f5f5f5; padding: 0.5em; border-radius: 4px; min-width: 8em; }
    .lane h3 { margin: 0 0 0.4em; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; }
    .card { background: white; border: 1px solid #ddd; border-radius: 3px; padding: 0.4em; margin: 0.3em 0; font-size: 0.9em; }
    .card-actions { display: flex; gap: 0.3em; margin-top: 0.3em; }
    .card-actions button { font-size: 0.75em; padding: 0.1em 0.4em; cursor: pointer; }
`);

const STATUSES = ['todo', 'in-progress', 'done'];
const tasks = new List6();

const seed = [
    { title: 'Design API', status: 'done' },
    { title: 'Write tests', status: 'in-progress' },
    { title: 'Implement Item8', status: 'done' },
    { title: 'Build List6', status: 'in-progress' },
    { title: 'Write docs', status: 'todo' },
    { title: 'Ship it', status: 'todo' },
];
seed.forEach(d => tasks.append(new Item5({ data: d })));

const by_status = tasks.group_by_reactive(t => t.data.status, ['status']);

const lanes = {};
div.c("kanban", () => {
    STATUSES.forEach(status => {
        div.c("lane", () => {
            el("h3", status);
            const container = div();
            lanes[status] = container;

            const group = by_status.get(status);
            if (group) {
                group.each(task => container.el.appendChild(make_card(task).el));
                group.on('add', task => container.el.appendChild(make_card(task).el));
                group.on('remove', task => {
                    const card = container.el.querySelector(`[data-title="${task.data.title}"]`);
                    card?.remove();
                });
            }
        });
    });
});

function make_card(task) {
    const card = div.c("card");
    card.el.dataset.title = task.data.title;
    div(task.data.title).append_to(card);
    div.c("card-actions", () => {
        STATUSES.filter(s => s !== task.data.status).forEach(s => {
            el("button", `→ ${s}`).el.addEventListener("click", () => {
                task.set('status', s);
            });
        });
    }).append_to(card);
    return card;
}

p("(Clicking '→ status' moves the card to a different lane using group_by_reactive)");
