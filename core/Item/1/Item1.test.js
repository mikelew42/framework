import Item0 from '../0/Item0.test.js';
import Item1 from './Item1.js';
import Test0 from '../../Test/0/Test0.js';

class MemorySaver {
    constructor(initial = {}) {
        this.data = initial;
        this.saves = [];
        this.deleted = false;
    }
    async load(item) { item.data = { ...this.data }; }
    save(item, patch) { this.saves.push({ ...patch }); }
    async delete(item) { this.deleted = true; }
}

Item1.test = new Test0({ class: Item1 });

// Inherit the full Item0 contract — Item1 must satisfy all Item0 tests.
// Note: Item0 tests hardcode `new Item0(...)` internally, so they exercise
// the Item0 class directly rather than Item1. This verifies the shared contract
// code is intact. True substitutability testing (Item0.test.run({ Item: Item1 }))
// would require Item0's test fns to accept an args.Item param — that's a gap
// to address in a future Test upgrade.
Item1.test.add(Item0.test);

Item1.test
    .add("ready resolves", async t => {
        const item = new Item1();
        await item.ready;
        t.assert(true, 'ready resolved without throwing');
    })
    .add("saver.load populates data", async t => {
        const saver = new MemorySaver({ x: 42 });
        const item = new Item1({ saver });
        await item.ready;
        t.assert(item.get("x") === 42, 'item.get("x") === 42 after load');
    })
    .add("no saver — ready resolves immediately", async t => {
        const item = new Item1();
        await item.ready;
        t.assert(true, 'ready resolved with no saver');
    })
    .add("save returns Promise", t => {
        const saver = new MemorySaver();
        const item = new Item1({ saver });
        item.set("a", 1);
        const p = item.save();
        t.assert(p instanceof Promise, 'save() returns a Promise');
    })
    .add("save returns Promise when no dirty keys", t => {
        const saver = new MemorySaver();
        const item = new Item1({ saver });
        const p = item.save();
        t.assert(p instanceof Promise, 'save() with empty dirty returns a Promise');
    })
    .add("save returns Promise with no saver", t => {
        const item = new Item1();
        const p = item.save();
        t.assert(p instanceof Promise, 'save() with no saver returns a Promise');
    })
    .add("delete calls saver.delete", async t => {
        const saver = new MemorySaver();
        const item = new Item1({ saver });
        await item.delete();
        t.assert(saver.deleted === true, 'saver.deleted === true after delete()');
    })
    .add("delete is no-op without saver", async t => {
        const item = new Item1();
        await item.delete();
        t.assert(true, 'delete() resolved with no saver');
    })
    .add("load replaces data", async t => {
        const saver = new MemorySaver({ a: 1 });
        const item = new Item1({ data: { b: 2 }, saver });
        await item.ready;
        t.assert(item.get("a") === 1, 'loaded key "a" present');
        t.assert(item.get("b") === undefined, 'original key "b" replaced by load');
    })
    .add("save patch sent after load", async t => {
        const saver = new MemorySaver({ x: 1 });
        const item = new Item1({ saver });
        await item.ready;
        item.set("y", 99);
        await item.save();
        t.assert(saver.saves.length === 1, 'saver.save called once');
        t.assert(saver.saves[0].y === 99, 'patch contains set key');
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item1.test.run();
    Item1.test.print();
}

export default Item1;
