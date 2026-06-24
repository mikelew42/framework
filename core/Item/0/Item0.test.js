import Item0 from './Item0.js';
import Test0 from '../../Test/0/Test0.js';

class MemorySaver {
    constructor() { this.saves = []; }
    save(item, patch) { this.saves.push({ item, patch, ts: Date.now() }); }
}

Item0.test = new Test0({ class: Item0 });

Item0.test
    .add("get / set", t => {
        const item = new Item0({ data: { name: "Alice" } });
        t.assert(item.get("name") === "Alice", 'get("name") === "Alice"');
        item.set("name", "Bob");
        t.assert(item.get("name") === "Bob", 'get after set === "Bob"');
    })
    .add("set marks dirty", t => {
        const item = new Item0();
        item.set("x", 1).set("y", 2);
        t.assert(item._dirty.x === 1, '_dirty.x === 1');
        t.assert(item._dirty.y === 2, '_dirty.y === 2');
    })
    .add("no-op set does not dirty", t => {
        const item = new Item0({ data: { x: 1 } });
        item.set("x", 1);
        t.assert(Object.keys(item._dirty).length === 0, 'same value: _dirty stays empty');
    })
    .add("save sends patch to saver", t => {
        const saver = new MemorySaver();
        const item = new Item0({ saver });
        item.set("a", 1).set("b", 2);
        item.save();
        t.assert(saver.saves.length === 1, 'saver called once');
        t.assert(saver.saves[0].patch.a === 1, 'patch.a === 1');
        t.assert(saver.saves[0].patch.b === 2, 'patch.b === 2');
    })
    .add("save clears dirty", t => {
        const saver = new MemorySaver();
        const item = new Item0({ saver });
        item.set("a", 1);
        item.save();
        t.assert(Object.keys(item._dirty).length === 0, '_dirty empty after save');
    })
    .add("double save only sends once per dirty batch", t => {
        const saver = new MemorySaver();
        const item = new Item0({ saver });
        item.set("a", 1);
        item.save();
        item.save(); // nothing dirty
        t.assert(saver.saves.length === 1, 'second save is no-op');
    })
    .add("no saver — save is a no-op", t => {
        const item = new Item0();
        item.set("x", 99);
        item.save();
        t.assert(item._dirty.x === 99, '_dirty not cleared when no saver');
    })
    .add("saver inheritance from parent", t => {
        const saver = new MemorySaver();
        const parent = new Item0({ saver });
        const child = new Item0({ parent });
        t.assert(child.saver === saver, 'child.saver === parent.saver');
    })
    .add("child saver overrides parent", t => {
        const parent_saver = new MemorySaver();
        const child_saver = new MemorySaver();
        const parent = new Item0({ saver: parent_saver });
        const child = new Item0({ parent, saver: child_saver });
        child.set("x", 1);
        child.save();
        t.assert(child_saver.saves.length === 1, 'child saver fired');
        t.assert(parent_saver.saves.length === 0, 'parent saver not fired');
    })
    .add("toJSON returns data", t => {
        const item = new Item0({ data: { foo: "bar" } });
        t.assert(JSON.stringify(item) === '{"foo":"bar"}', 'JSON.stringify uses data');
    });

// auto_save is async (setTimeout) — needs async run() support in Test1.
// See core/Test/readme.md.

export default Item0;
