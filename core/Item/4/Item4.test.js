import Item3 from '../3/Item3.test.js';
import Item4 from './Item4.js';
import Test0 from '../../Test/0/Test0.js';
import List1 from '../../List/1/List1.js';

Item4.test = new Test0({ class: Item4, _name: 'Item4' });
Item4.test.add(Item3.test);

Item4.test
    .add("items is a List1 instance", t => {
        const item = new Item4();
        t.assert(item.items instanceof List1, "item.items instanceof List1");
    })
    .add("add sets parent to Item, not List", t => {
        const parent = new Item4();
        const child = new Item4();
        parent.add(child);
        t.assert(child.parent === parent, "child.parent === parent Item4");
        t.assert(child.parent !== parent.items, "child.parent is not the List");
    })
    .add("saver inherited via parent chain", t => {
        const saves = [];
        const saver = { save: (item, patch) => saves.push(patch) };
        const parent = new Item4({ saver });
        const child = new Item4();
        parent.add(child);
        t.assert(child.saver === saver, "child inherits saver from parent Item4");
    })
    .add("'add' event fires when child added", t => {
        const parent = new Item4();
        const log = [];
        parent.items.on('add', (item, idx) => log.push({ item, idx }));
        const child = new Item4();
        parent.add(child);
        t.assert(log.length === 1, "one add event fired");
        t.assert(log[0].item === child, "event item is the child");
        t.assert(log[0].idx === 0, "child is at index 0");
    })
    .add("'remove' event fires when child removed", t => {
        const parent = new Item4();
        const child = new Item4();
        parent.add(child);
        const log = [];
        parent.items.on('remove', (item, idx) => log.push({ item, idx }));
        parent.remove(child);
        t.assert(log.length === 1, "one remove event");
        t.assert(log[0].item === child, "event item is the child");
        t.assert(log[0].idx === 0, "was at index 0");
    })
    .add("remove clears child.parent", t => {
        const parent = new Item4();
        const child = new Item4();
        parent.add(child);
        parent.remove(child);
        t.assert(child.parent === undefined, "child.parent cleared after remove");
    })
    .add("items.each() works after add", t => {
        const parent = new Item4();
        parent.add(new Item4(), new Item4(), new Item4());
        const collected = [];
        parent.items.each(c => collected.push(c));
        t.assert(collected.length === 3, "each visits 3 children");
    })
    .add("toJSON includes items array", t => {
        const parent = new Item4({ data: { name: "root" } });
        const child = new Item4({ data: { x: 1 } });
        parent.add(child);
        const json = JSON.stringify(parent);
        const obj = JSON.parse(json);
        t.assert(obj.name === "root", "root data preserved");
        t.assert(Array.isArray(obj.items), "items is an array");
        t.assert(obj.items[0].x === 1, "child data in items");
    })
    .add("child.remove() fires remove on parent.items", t => {
        const parent = new Item4();
        const child = new Item4();
        parent.add(child);
        const log = [];
        parent.items.on('remove', item => log.push(item));
        child.remove();
        t.assert(log.length === 1, "remove fired on parent.items");
        t.assert(log[0] === child, "removed child");
        t.assert(parent.items.children.length === 0, "parent.items empty");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item4.test.run();
    Item4.test.print();
}

export default Item4;
