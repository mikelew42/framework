import Item4 from '../4/Item4.test.js';
import Item5 from './Item5.js';
import Test0 from '../../Test/0/Test0.js';

Item5.test = new Test0({ class: Item5, _name: 'Item5' });
Item5.test.add(Item4.test);

Item5.test
    .add("on / emit", t => {
        const item = new Item5();
        const log = [];
        item.on('custom', x => log.push(x));
        item.emit('custom', 'hello');
        t.assert(log.length === 1, "listener called");
        t.assert(log[0] === 'hello', "correct value");
    })
    .add("off removes listener", t => {
        const item = new Item5();
        const log = [];
        const fn = x => log.push(x);
        item.on('x', fn);
        item.emit('x', 1);
        item.off('x', fn);
        item.emit('x', 2);
        t.assert(log.length === 1, "only one emission after off");
    })
    .add("set emits 'change' with key, val, old", t => {
        const item = new Item5({ data: { x: 0 } });
        const log = [];
        item.on('change', (key, val, old) => log.push({ key, val, old }));
        item.set('x', 42);
        t.assert(log.length === 1, "change fired");
        t.assert(log[0].key === 'x', "key is x");
        t.assert(log[0].val === 42, "val is 42");
        t.assert(log[0].old === 0, "old is 0");
    })
    .add("set does not emit 'change' for no-op (same value)", t => {
        const item = new Item5({ data: { x: 5 } });
        const log = [];
        item.on('change', () => log.push(true));
        item.set('x', 5);
        t.assert(log.length === 0, "no event for same value");
    })
    .add("multiple listeners on 'change'", t => {
        const item = new Item5();
        const a = [], b = [];
        item.on('change', (key, val) => a.push(val));
        item.on('change', (key, val) => b.push(val));
        item.set('n', 1);
        item.set('n', 2);
        t.assert(a.length === 2, "listener a fired twice");
        t.assert(b.length === 2, "listener b fired twice");
        t.assert(a[1] === 2, "second value is 2");
    })
    .add("change on new key (undefined old)", t => {
        const item = new Item5();
        const log = [];
        item.on('change', (key, val, old) => log.push(old));
        item.set('brand_new', 'hello');
        t.assert(log[0] === undefined, "old value is undefined for new key");
    })
    .add("listeners are per-instance", t => {
        const a = new Item5();
        const b = new Item5();
        const logA = [], logB = [];
        a.on('change', () => logA.push(1));
        b.on('change', () => logB.push(1));
        a.set('x', 1);
        t.assert(logA.length === 1, "a's listener fired");
        t.assert(logB.length === 0, "b's listener did not fire");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item5.test.run();
    Item5.test.print();
}

export default Item5;
