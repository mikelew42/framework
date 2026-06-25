import CollectionSaver from './CollectionSaver.js';
import Item9 from '/framework/core/Item/9/Item9.js';
import StubSocket from '/framework/ext/Socket/Socket.js';
import List8 from '/framework/core/List/8/List8.js';
import Test0 from '/framework/core/Test/0/Test0.js';

// Set up fetch mock backed by Socket stub
const orig_fetch = global.fetch;
global.fetch = async (url) => {
    const data = StubSocket._store.get(url);
    if (data === undefined) return { ok: false, status: 404 };
    return { ok: true, json: async () => JSON.parse(data) };
};

const suite = new Test0({ _name: 'CollectionSaver' });

suite
    .add("save() writes a JSON array to the path", async t => {
        StubSocket._clear();
        const list = new List8();
        list.append(new Item9({ data: { x: 1 } }), new Item9({ data: { x: 2 } }));
        const saver = new CollectionSaver({ path: '/data/col.json' });
        await saver.save(list);
        const raw = StubSocket._store.get('/data/col.json');
        t.assert(raw !== undefined, "file written");
        const arr = JSON.parse(raw);
        t.assert(Array.isArray(arr), "is array");
        t.assert(arr.length === 2, "two items");
        t.assert(arr[0].x === 1, "first item data");
        t.assert(arr[1].x === 2, "second item data");
    })
    .add("load() appends items from the JSON array", async t => {
        StubSocket._clear();
        StubSocket._store.set('/data/load.json',
            JSON.stringify([{ n: 10 }, { n: 20 }, { n: 30 }]));
        const list = new List8();
        const saver = new CollectionSaver({ path: '/data/load.json' });
        await saver.load(list);
        t.assert(list.children.length === 3, "three items loaded");
        t.assert(list.children[0].get('n') === 10, "first item n=10");
        t.assert(list.children[2].get('n') === 30, "last item n=30");
    })
    .add("load() uses item_class for instantiation", async t => {
        StubSocket._clear();
        class MyItem extends Item9 { is_mine() { return true; } }
        StubSocket._store.set('/data/cls.json', JSON.stringify([{ v: 1 }]));
        const list = new List8();
        const saver = new CollectionSaver({ path: '/data/cls.json', item_class: MyItem });
        await saver.load(list);
        t.assert(list.children[0] instanceof MyItem, "item is MyItem");
        t.assert(list.children[0].is_mine(), "has MyItem methods");
    })
    .add("load() with missing file — no-op", async t => {
        StubSocket._clear();
        const list = new List8();
        const saver = new CollectionSaver({ path: '/data/missing.json' });
        await saver.load(list); // should not throw
        t.assert(list.children.length === 0, "list remains empty");
    })
    .add("save() then load() round-trip", async t => {
        StubSocket._clear();
        const list1 = new List8();
        list1.append(
            new Item9({ data: { label: 'A', done: false } }),
            new Item9({ data: { label: 'B', done: true } })
        );
        const saver = new CollectionSaver({ path: '/data/rt.json' });
        await saver.save(list1);
        const list2 = new List8();
        await saver.load(list2);
        t.assert(list2.children.length === 2, "two items in round-trip");
        t.assert(list2.children[0].get('label') === 'A', "label A");
        t.assert(list2.children[1].get('done') === true, "done=true preserved");
    })
    .add("save() with empty list writes empty array", async t => {
        StubSocket._clear();
        const list = new List8();
        const saver = new CollectionSaver({ path: '/data/empty.json' });
        await saver.save(list);
        const arr = JSON.parse(StubSocket._store.get('/data/empty.json'));
        t.assert(Array.isArray(arr), "is array");
        t.assert(arr.length === 0, "empty array");
    })
    .add("delete() removes the file", async t => {
        StubSocket._clear();
        StubSocket._store.set('/data/del.json', '[]');
        const saver = new CollectionSaver({ path: '/data/del.json' });
        await saver.delete();
        t.assert(!StubSocket._store.has('/data/del.json'), "file removed");
    })
    .add("auto-save pattern: on('add') triggers save", async t => {
        StubSocket._clear();
        const list = new List8();
        const saver = new CollectionSaver({ path: '/data/auto.json' });
        list.on('add', () => saver.save(list));
        list.append(new Item9({ data: { v: 42 } }));
        await saver._promise; // wait for the debounced write
        const arr = JSON.parse(StubSocket._store.get('/data/auto.json'));
        t.assert(arr.length === 1, "one item saved");
        t.assert(arr[0].v === 42, "v=42 saved");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await suite.run();
    suite.print();
}

global.fetch = orig_fetch;

export { suite };
export default CollectionSaver;
