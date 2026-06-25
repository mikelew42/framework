import Item7 from '/framework/core/Item/7/Item7.test.js';
import TodoItem from './TodoItem.js';
import TodoList from './TodoList.js';
import Test0 from '/framework/core/Test/0/Test0.js';

TodoItem.test = new Test0({ class: TodoItem, _name: 'TodoItem' });
TodoItem.test.add(Item7.test);

TodoItem.test
    .add("done defaults to false", t => {
        const todo = new TodoItem({ data: { title: 'Buy milk' } });
        t.assert(todo.get('done') === false, "done is false by default");
    })
    .add("priority defaults to 'normal'", t => {
        const todo = new TodoItem({ data: { title: 'Task' } });
        t.assert(todo.get('priority') === 'normal', "priority is normal");
    })
    .add("label computed from title + done", t => {
        const todo = new TodoItem({ data: { title: 'Write tests' } });
        t.assert(todo.get('label') === 'Write tests', "label = title when not done");
        todo.set('done', true);
        t.assert(todo.get('label') === '✓ Write tests', "label prefixed when done");
    })
    .add("toggle() flips done", t => {
        const todo = new TodoItem({ data: { title: 'Task' } });
        todo.toggle();
        t.assert(todo.get('done') === true, "done is true after toggle");
        todo.toggle();
        t.assert(todo.get('done') === false, "done is false after second toggle");
    })
    .add("toggle() fires 'change' for done and label", t => {
        const todo = new TodoItem({ data: { title: 'Task' } });
        const log = [];
        todo.on('change', (key, val) => log.push({ key, val }));
        todo.toggle();
        const done_evt = log.find(e => e.key === 'done');
        const label_evt = log.find(e => e.key === 'label');
        t.assert(done_evt?.val === true, "done changed to true");
        t.assert(label_evt?.val === '✓ Task', "label updated to checked");
    })
    .add("label defaults to '(untitled)' with no title", t => {
        const todo = new TodoItem();
        t.assert(todo.get('label') === '(untitled)', "no title → (untitled)");
        todo.set('done', true);
        t.assert(todo.get('label') === '✓ (untitled)', "done + no title");
    });

// TodoList tests (in same file — it uses TodoItem, no separate class)
const TodoListTest = new Test0({ _name: 'TodoList' });
TodoItem.test.add(TodoListTest);

const mkItem = (title, done = false, priority = 'normal') =>
    new TodoItem({ data: { title, done, priority } });

TodoListTest
    .add("active filter", t => {
        const list = new TodoList();
        list.append(mkItem('A'), mkItem('B', true), mkItem('C'));
        const active = list.active;
        t.assert(active.children.length === 2, "two active items");
        t.assert(active.children.every(t => !t.data.done), "all active are not done");
    })
    .add("done_items filter", t => {
        const list = new TodoList();
        list.append(mkItem('A', true), mkItem('B'), mkItem('C', true));
        t.assert(list.done_items.children.length === 2, "two done items");
    })
    .add("by_priority sort", t => {
        const list = new TodoList();
        list.append(
            mkItem('Low task', false, 'low'),
            mkItem('High task', false, 'high'),
            mkItem('Normal task', false, 'normal')
        );
        const sorted = list.by_priority;
        t.assert(sorted.children[0].get('title') === 'High task', "high first");
        t.assert(sorted.children[1].get('title') === 'Normal task', "normal second");
        t.assert(sorted.children[2].get('title') === 'Low task', "low last");
    })
    .add("active list updates when item toggled", t => {
        const list = new TodoList();
        const task = mkItem('Task A');
        list.append(task);
        const active = list.active;
        t.assert(active.children.length === 1, "initially active");

        // Toggle the item to done — but this doesn't trigger an 'add'/'remove' on list!
        // The derived filter only updates on list add/remove, not item mutation.
        // This tests the KNOWN limitation.
        task.set('done', true);
        t.assert(active.children.length === 1, "active still 1 (mutation not reactive in filter)");
        // To update filter, remove and re-add:
        list.remove(task);
        t.assert(active.children.length === 0, "active 0 after remove");
        list.append(task);
        t.assert(active.children.length === 0, "active still 0 (item.done = true)");
    })
    .add("active updates on new item append", t => {
        const list = new TodoList();
        const active = list.active;
        list.append(mkItem('New task'));
        t.assert(active.children.length === 1, "active updates on append");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await TodoItem.test.run();
    TodoItem.test.print();
}

export default TodoItem;
