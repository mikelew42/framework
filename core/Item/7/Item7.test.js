import Item6 from '../6/Item6.test.js';
import Item7 from './Item7.js';
import Test0 from '../../Test/0/Test0.js';

Item7.test = new Test0({ class: Item7, _name: 'Item7' });
Item7.test.add(Item6.test);

Item7.test
    .add("compute — initial value set at registration", t => {
        const item = new Item7({ data: { first: 'Alice', last: 'Smith' } });
        item.compute('full', ['first', 'last'], (f, l) => `${f} ${l}`);
        t.assert(item.get('full') === 'Alice Smith', 'initial computed value');
    })
    .add("compute — updates when dependency changes", t => {
        const item = new Item7({ data: { a: 1, b: 2 } });
        item.compute('sum', ['a', 'b'], (a, b) => a + b);
        item.set('a', 10);
        t.assert(item.get('sum') === 12, 'sum updated after a changed');
    })
    .add("compute — 'change' fires for computed key", t => {
        const item = new Item7({ data: { x: 1, y: 1 } });
        item.compute('product', ['x', 'y'], (x, y) => x * y);
        const log = [];
        item.on('change', (key, val) => log.push({ key, val }));
        item.set('x', 5);
        const prod_event = log.find(e => e.key === 'product');
        t.assert(prod_event !== undefined, "'change' fired for product");
        t.assert(prod_event.val === 5, "product is 5 (5 * 1)");
    })
    .add("compute — no change event if computed value unchanged", t => {
        const item = new Item7({ data: { a: 5, b: 0 } });
        item.compute('result', ['a', 'b'], (a, b) => b === 0 ? 0 : a / b);
        const log = [];
        item.on('change', (key) => log.push(key));
        item.set('a', 99); // result = 0 (still, since b is still 0)
        t.assert(!log.includes('result'), "no change event for result when still 0");
        t.assert(log.includes('a'), "change event for a itself");
    })
    .add("compute — old value passed to 'change' listener", t => {
        const item = new Item7({ data: { n: 2 } });
        item.compute('square', ['n'], n => n * n);
        const log = [];
        item.on('change', (key, val, old) => {
            if (key === 'square') log.push({ val, old });
        });
        item.set('n', 3);
        t.assert(log[0].old === 4, "old value is 4 (2²)");
        t.assert(log[0].val === 9, "new value is 9 (3²)");
    })
    .add("compute — two computed fields from same dep", t => {
        const item = new Item7({ data: { n: 3 } });
        item.compute('square', ['n'], n => n * n);
        item.compute('cube', ['n'], n => n * n * n);
        item.set('n', 4);
        t.assert(item.get('square') === 16, "4² = 16");
        t.assert(item.get('cube') === 64, "4³ = 64");
    })
    .add("compute — multi-dep field", t => {
        const item = new Item7({ data: { price: 10, qty: 3, discount: 2 } });
        item.compute('total', ['price', 'qty', 'discount'],
            (p, q, d) => p * q - d);
        t.assert(item.get('total') === 28, "10 * 3 - 2 = 28");
        item.set('qty', 5);
        t.assert(item.get('total') === 48, "10 * 5 - 2 = 48");
    })
    .add("compute — respects batch()", t => {
        const item = new Item7({ data: { a: 0, b: 0 } });
        item.compute('sum', ['a', 'b'], (a, b) => a + b);
        const log = [];
        item.on('change', (key, val) => log.push({ key, val }));
        item.batch(() => {
            item.set('a', 3);
            item.set('b', 4);
            t.assert(log.length === 0, "no events during batch");
        });
        const sum_events = log.filter(e => e.key === 'sum');
        t.assert(sum_events.length === 1, "sum fires exactly once (net change)");
        t.assert(sum_events[0].val === 7, "final sum is 7");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item7.test.run();
    Item7.test.print();
}

export default Item7;
