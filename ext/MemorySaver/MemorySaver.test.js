import MemorySaver from './MemorySaver.js';
import Item1 from '/framework/core/Item/1/Item1.js';
import Test0 from '/framework/core/Test/0/Test0.js';

const suite = new Test0({ _name: 'MemorySaver' });

suite
    .add("load with initial data populates item.data", async t => {
        const saver = new MemorySaver({ name: 'Alice', score: 10 });
        const item = new Item1();
        await saver.load(item);
        t.assert(item.data.name === 'Alice', "name loaded");
        t.assert(item.data.score === 10, "score loaded");
    })
    .add("load without initial data is a no-op", async t => {
        const saver = new MemorySaver();
        const item = new Item1({ data: { x: 42 } });
        await saver.load(item);
        t.assert(item.data.x === 42, "item.data unchanged when no initial");
    })
    .add("save stores a snapshot of item.data", async t => {
        const saver = new MemorySaver();
        const item = new Item1({ data: { n: 1 } });
        await saver.save(item, { n: 1 });
        t.assert(saver.data.n === 1, "save stores data");
        item.data.n = 99; // mutate item.data directly
        t.assert(saver.data.n === 1, "saved copy is independent (not a reference)");
    })
    .add("save increments save_count", async t => {
        const saver = new MemorySaver();
        const item = new Item1({ data: {} });
        await saver.save(item, {});
        await saver.save(item, {});
        t.assert(saver.save_count === 2, "save_count is 2");
    })
    .add("delete clears data and sets deleted flag", async t => {
        const saver = new MemorySaver({ x: 1 });
        const item = new Item1({ data: { x: 1 } });
        await saver.delete(item);
        t.assert(saver.data === null, "data is null after delete");
        t.assert(saver.deleted === true, "deleted flag set");
    })
    .add("save after delete clears deleted flag", async t => {
        const saver = new MemorySaver();
        const item = new Item1({ data: { x: 1 } });
        await saver.delete(item);
        t.assert(saver.deleted === true, "deleted after delete");
        await saver.save(item, { x: 1 });
        t.assert(saver.deleted === false, "deleted reset after save");
    })
    .add("load snapshot is independent of original initial", async t => {
        const initial = { count: 0 };
        const saver = new MemorySaver(initial);
        const item = new Item1();
        await saver.load(item);
        initial.count = 999; // mutate original
        t.assert(item.data.count === 0, "item.data not affected by mutating initial");
    })
    .add("round-trip: save then load in fresh item", async t => {
        const saver = new MemorySaver();
        const item1 = new Item1({ data: { msg: 'hello' } });
        await saver.save(item1, { msg: 'hello' });
        const item2 = new Item1();
        await saver.load(item2);
        t.assert(item2.data.msg === 'hello', "round-trip works");
    })
    .add("works with Item1.saver integration", async t => {
        const saver = new MemorySaver({ x: 7 });
        const item = new Item1({ saver });
        await item.load();
        t.assert(item.get('x') === 7, "load() populates via saver");
        item.set('x', 99);
        await item.save();
        t.assert(saver.data.x === 99, "save() writes via saver");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await suite.run();
    suite.print();
}

export { suite };
export default MemorySaver;
