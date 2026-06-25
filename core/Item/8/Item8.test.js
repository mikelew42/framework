import Item7 from '../7/Item7.test.js';
import Item8 from './Item8.js';
import Test0 from '../../Test/0/Test0.js';

Item8.test = new Test0({ class: Item8, _name: 'Item8' });
Item8.test.add(Item7.test);

Item8.test
    .add("schema() is fluent (returns item)", t => {
        const item = new Item8({ data: {} });
        t.assert(item.schema({ n: Number }) === item, "fluent");
    })
    .add("Number coercion: string → number", t => {
        const item = new Item8({ data: {} });
        item.schema({ price: Number });
        item.set('price', '42.5');
        t.assert(item.get('price') === 42.5, "string coerced to number");
    })
    .add("Number coercion: number passthrough", t => {
        const item = new Item8({ data: {} });
        item.schema({ n: Number });
        item.set('n', 7);
        t.assert(item.get('n') === 7, "number passes through");
    })
    .add("Number coercion: invalid → error event, no update", t => {
        const item = new Item8({ data: { n: 0 } });
        item.schema({ n: Number });
        const errors = [];
        item.on('error', (key, val, err) => errors.push({ key, val, err }));
        item.set('n', 'not-a-number');
        t.assert(errors.length === 1, "error event fired");
        t.assert(errors[0].key === 'n', "error key is 'n'");
        t.assert(item.get('n') === 0, "value unchanged after error");
    })
    .add("String coercion: number → string", t => {
        const item = new Item8({ data: {} });
        item.schema({ label: String });
        item.set('label', 42);
        t.assert(item.get('label') === '42', "number coerced to string");
    })
    .add("Boolean coercion: 'true'/'false' strings", t => {
        const item = new Item8({ data: {} });
        item.schema({ done: Boolean });
        item.set('done', 'true');
        t.assert(item.get('done') === true, "'true' → true");
        item.set('done', 'false');
        t.assert(item.get('done') === false, "'false' → false");
    })
    .add("Boolean coercion: actual boolean passthrough", t => {
        const item = new Item8({ data: {} });
        item.schema({ done: Boolean });
        item.set('done', true);
        t.assert(item.get('done') === true, "true passes through");
        item.set('done', false);
        t.assert(item.get('done') === false, "false passes through");
    })
    .add("Boolean coercion: arbitrary string → error", t => {
        const item = new Item8({ data: { done: false } });
        item.schema({ done: Boolean });
        const errors = [];
        item.on('error', (key) => errors.push(key));
        item.set('done', 'yes'); // not 'true' or 'false'
        t.assert(errors.length === 1, "error fired for 'yes'");
        t.assert(item.get('done') === false, "value unchanged");
    })
    .add("Array coercion: validates array, rejects non-array", t => {
        const item = new Item8({ data: { tags: [] } });
        item.schema({ tags: Array });
        item.set('tags', ['a', 'b']);
        t.assert(Array.isArray(item.get('tags')), "array accepted");
        const errors = [];
        item.on('error', () => errors.push(1));
        item.set('tags', 'not-an-array');
        t.assert(errors.length === 1, "string rejected");
    })
    .add("Object coercion: validates object, rejects non-object", t => {
        const item = new Item8({ data: { meta: {} } });
        item.schema({ meta: Object });
        item.set('meta', { x: 1 });
        t.assert(typeof item.get('meta') === 'object', "object accepted");
        const errors = [];
        item.on('error', () => errors.push(1));
        item.set('meta', 42);
        t.assert(errors.length === 1, "number rejected");
        item.set('meta', null);
        t.assert(errors.length === 2, "null rejected");
        item.set('meta', [1, 2]);
        t.assert(errors.length === 3, "array rejected (use Array type instead)");
    })
    .add("custom coercer function", t => {
        const item = new Item8({ data: {} });
        item.schema({ percent: v => Math.min(100, Math.max(0, Number(v))) });
        item.set('percent', 150);
        t.assert(item.get('percent') === 100, "clamped to 100");
        item.set('percent', -10);
        t.assert(item.get('percent') === 0, "clamped to 0");
        item.set('percent', 50);
        t.assert(item.get('percent') === 50, "50 passes through");
    })
    .add("schema keys without schema entry pass through unchanged", t => {
        const item = new Item8({ data: {} });
        item.schema({ n: Number });
        item.set('untyped', 'anything');
        t.assert(item.get('untyped') === 'anything', "unschema'd key is untouched");
    })
    .add("schema + compute() work together", t => {
        const item = new Item8({ data: { price: 0, qty: 0 } });
        item.schema({ price: Number, qty: Number });
        item.compute('total', ['price', 'qty'], (p, q) => p * q);
        item.set('price', '10');
        item.set('qty', '3');
        t.assert(item.get('price') === 10, "price coerced");
        t.assert(item.get('qty') === 3, "qty coerced");
        t.assert(item.get('total') === 30, "total computed from coerced values");
    })
    .add("schema + batch() deduplication still works", t => {
        const item = new Item8({ data: { n: 0 } });
        item.schema({ n: Number });
        const changes = [];
        item.on('change', (key, val) => changes.push({ key, val }));
        item.batch(() => {
            item.set('n', '1');
            item.set('n', '2');
        });
        const n_changes = changes.filter(c => c.key === 'n');
        t.assert(n_changes.length === 1, "batched n fires once");
        t.assert(n_changes[0].val === 2, "final coerced value is 2");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item8.test.run();
    Item8.test.print();
}

export default Item8;
