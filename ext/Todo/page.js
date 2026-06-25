import app, { h1, div, el, p, CollectionSaver } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import TodoItem from "./TodoItem.test.js";
import TodoList from "./TodoList.js";

app.$root.ac("page");

el("style", `
    .todo-app { font-family: sans-serif; max-width: 32em; margin: 1em; }
    .todo-add { display: flex; gap: 0.5em; margin-bottom: 1em; }
    .todo-add input { flex: 1; padding: 0.5em; font-size: 1em; }
    .todo-add select { padding: 0.5em; }
    .todo-item { display: flex; align-items: center; gap: 0.5em; padding: 0.4em 0; border-bottom: 1px solid #eee; }
    .todo-item input[type=checkbox] { cursor: pointer; }
    .todo-item .label { flex: 1; }
    .todo-item.done .label { text-decoration: line-through; color: #999; }
    .todo-item[data-priority=high] { border-left: 3px solid red; padding-left: 0.4em; }
    .todo-item[data-priority=low]  { border-left: 3px solid #aaa; padding-left: 0.4em; }
    .todo-meta { font-size: 0.8em; color: #888; margin: 0.8em 0; }
    .todo-tabs { display: flex; gap: 0.5em; margin-bottom: 0.5em; }
    .todo-tabs button { padding: 0.3em 0.8em; cursor: pointer; }
    .todo-tabs button.active { font-weight: bold; text-decoration: underline; }
`);

h1("Todo App — Item7 + List4 + CollectionSaver");
p("Data persists to /data/todos.json via CollectionSaver.");

const saver = new CollectionSaver({ path: '/data/todos.json', item_class: TodoItem });
const todos = new TodoList();

await saver.load(todos);

const active   = todos.active;
const done_list = todos.done_items;
const by_priority = todos.by_priority;

const persist = () => saver.save(todos);
todos.on('add',    persist);
todos.on('remove', persist);

function render_item(todo) {
    const row = div.c("todo-item");
    row.el.dataset.priority = todo.get('priority');
    if (todo.get('done')) row.el.classList.add('done');

    const cb = el("input");
    cb.el.type = 'checkbox';
    cb.el.checked = todo.get('done');
    cb.el.addEventListener("change", () => { todo.toggle(); persist(); });

    const label = div.c("label", todo.get('label'));

    const del = el("button", "×");
    del.el.addEventListener("click", () => todos.remove(todo));

    row.el.append(cb.el, label.el, del.el);

    todo.on('change', (key, val) => {
        if (key === 'label') label.el.textContent = val;
        if (key === 'done') { cb.el.checked = val; row.el.classList.toggle('done', val); }
    });

    return row;
}

div.c("todo-app", () => {
    div.c("todo-add", () => {
        const input = el("input");
        input.el.placeholder = "New task…";
        const priority_sel = el("select");
        for (const prio of ['normal', 'high', 'low']) {
            const opt = el("option", prio);
            opt.el.value = prio;
            priority_sel.el.append(opt.el);
        }
        el("button", "Add").el.addEventListener("click", () => {
            const title = input.el.value.trim();
            if (!title) return;
            todos.append(new TodoItem({ data: { title, priority: priority_sel.el.value } }));
            input.el.value = '';
        });
        input.el.addEventListener("keydown", e => {
            if (e.key === 'Enter') document.querySelector('.todo-add button').click();
        });
    });

    const stats = div.c("todo-meta");
    function update_stats() {
        stats.el.textContent = `${active.children.length} active · ${done_list.children.length} done`;
    }
    todos.on('add', update_stats);
    todos.on('remove', update_stats);
    update_stats();

    let current_container;

    function set_view(list, btn_el) {
        [...document.querySelectorAll('.todo-tabs button')].forEach(b => b.classList.remove('active'));
        btn_el.classList.add('active');
        current_container.el.innerHTML = '';
        list.each(todo => current_container.el.append(render_item(todo).el));
    }

    div.c("todo-tabs", () => {
        const all_btn   = el("button", "All").el;
        const act_btn   = el("button", "Active").el;
        const done_btn  = el("button", "Done").el;
        const pri_btn   = el("button", "By Priority").el;
        all_btn.classList.add('active');
        all_btn.addEventListener("click",  () => set_view(todos,      all_btn));
        act_btn.addEventListener("click",  () => set_view(active,     act_btn));
        done_btn.addEventListener("click", () => set_view(done_list,  done_btn));
        pri_btn.addEventListener("click",  () => set_view(by_priority, pri_btn));
    });

    current_container = div();
    todos.each(todo => current_container.el.append(render_item(todo).el));
    todos.on('add', todo => current_container.el.append(render_item(todo).el));
});

h1("Test suite");
await TodoItem.test.run();
new Test1.View({ suite: TodoItem.test }).render();
