import Item1 from '/framework/core/Item/1/Item1.js';
import FileSaver from './FileSaver.js';
import Socket from '/framework/ext/Socket/Socket.js';
import Test0 from '/framework/core/Test/0/Test0.js';

// Stub fetch using the Socket stub's in-memory store so load() round-trips through one store.
global.fetch = async (path) => {
    const data = Socket._store.get(path);
    if (data !== undefined) {
        return { ok: true, json: async () => JSON.parse(data) };
    }
    return { ok: false, status: 404 };
};

FileSaver.test = new Test0({ _name: 'FileSaver' });

FileSaver.test
    .add("save writes to socket store", async t => {
        Socket._clear();
        const item = new Item1({ data: { x: 0 } });
        const saver = new FileSaver({ path: '/data/test.json' });
        item.set('x', 2);
        await saver.save(item, item._dirty);
        const stored = Socket._store.get('/data/test.json');
        t.assert(stored !== undefined, "file written to store");
        t.assert(JSON.parse(stored).x === 2, "correct value stored");
    })
    .add("load reads from socket store via fetch", async t => {
        Socket._clear();
        Socket._store.set('/data/load-test.json', JSON.stringify({ name: "Alice" }));
        const item = new Item1({ data: {} });
        const saver = new FileSaver({ path: '/data/load-test.json' });
        await saver.load(item);
        t.assert(item.data.name === 'Alice', 'item.data.name === "Alice"');
    })
    .add("load with missing file leaves data as {}", async t => {
        Socket._clear();
        const item = new Item1({ data: {} });
        const saver = new FileSaver({ path: '/data/missing.json' });
        await saver.load(item);
        t.assert(typeof item.data === 'object', "item.data is an object");
        t.assert(Object.keys(item.data).length === 0, "item.data is empty {}");
    })
    .add("delete removes from socket store", async t => {
        Socket._clear();
        Socket._store.set('/data/del-test.json', '{}');
        const item = new Item1({ data: {} });
        const saver = new FileSaver({ path: '/data/del-test.json' });
        await saver.delete(item);
        t.assert(!Socket._store.has('/data/del-test.json'), "file removed from store");
    })
    .add("Item1 + FileSaver round-trip: set then save then load", async t => {
        Socket._clear();
        const saver = new FileSaver({ path: '/data/rt.json' });
        const item = new Item1({ saver });
        await item.ready;  // load called — nothing in store yet, data = {}
        item.set('color', 'blue');
        await item.save();
        // Now load into a fresh item
        const item2 = new Item1({ saver });
        await item2.ready;
        t.assert(item2.get('color') === 'blue', 'loaded saved value');
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await FileSaver.test.run();
    FileSaver.test.print();
}

export default FileSaver;
