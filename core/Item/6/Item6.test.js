import Item5 from '../5/Item5.test.js';
import Item6 from './Item6.js';
import Test0 from '../../Test/0/Test0.js';

Item6.test = new Test0({ class: Item6, _name: 'Item6' });
Item6.test.add(Item5.test);

Item6.test
    .add("once fires exactly once", t => {
        const item = new Item6();
        let count = 0;
        item.once('x', () => count++);
        item.emit('x');
        item.emit('x');
        item.emit('x');
        t.assert(count === 1, "listener called exactly once");
    })
    .add("on('save') fires after save()", async t => {
        const saves = [];
        const saver = { save(item, patch) { saves.push({ ...patch }); } };
        const item = new Item6({ saver });
        const log = [];
        item.on('save', () => log.push('saved'));
        item.set('x', 1);
        await item.save();
        t.assert(log.length === 1, "save event fired");
        t.assert(saves.length === 1, "saver.save called");
    })
    .add("on('save') fires even with no dirty keys", async t => {
        const item = new Item6();
        const log = [];
        item.on('save', () => log.push(true));
        await item.save();
        t.assert(log.length === 1, "save event fires even when nothing dirty");
    })
    .add("batch defers change events", t => {
        const item = new Item6();
        const log = [];
        item.on('change', (key, val) => log.push({ key, val }));
        item.batch(() => {
            item.set('a', 1);
            item.set('b', 2);
            item.set('c', 3);
            t.assert(log.length === 0, "no events during batch");
        });
        t.assert(log.length === 3, "all events fired after batch");
        t.assert(log[0].key === 'a', "first change is a");
        t.assert(log[2].val === 3, "third value is 3");
    })
    .add("batch: no-op sets don't fire change", t => {
        const item = new Item6({ data: { x: 5 } });
        const log = [];
        item.on('change', () => log.push(true));
        item.batch(() => {
            item.set('x', 5); // no-op
            item.set('x', 5); // no-op
        });
        t.assert(log.length === 0, "no events for no-op sets");
    })
    .add("batch: nested batch calls don't double-wrap", t => {
        const item = new Item6();
        const log = [];
        item.on('change', (key, val) => log.push(val));
        item.batch(() => {
            item.set('a', 1);
            item.batch(() => { item.set('b', 2); }); // inner batch — no-op guard
            item.set('c', 3);
        });
        t.assert(log.length === 3, "all 3 changes fired after outer batch");
    })
    .add("once + save event interaction", async t => {
        const saver = { save() {} };
        const item = new Item6({ saver });
        const log = [];
        item.once('save', () => log.push('first'));
        item.on('save', () => log.push('each'));
        item.set('x', 1);
        await item.save();
        await item.save();
        t.assert(log[0] === 'first', "once fired first save");
        t.assert(log[1] === 'each', "on fired first save");
        t.assert(log.length === 3, "total: once(1) + on(2) = 3");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item6.test.run();
    Item6.test.print();
}

export default Item6;
