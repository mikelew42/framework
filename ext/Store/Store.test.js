import Store from './Store.js';
import Item9 from '/framework/core/Item/9/Item9.js';
import Test0 from '/framework/core/Test/0/Test0.js';

// Store uses FileSaver which needs a Socket. The Socket stub is already registered
// via the loader (scripts/stubs/Socket.js). But FileSaver also calls fetch() for load().
// Set up a minimal fetch mock backed by the socket stub.
import StubSocket from '/framework/ext/Socket/Socket.js';

const orig_fetch = global.fetch;
global.fetch = async (url) => {
    const data = StubSocket._store.get(url);
    if (data === undefined) return { ok: false, status: 404 };
    return { ok: true, json: async () => JSON.parse(data) };
};

const suite = new Test0({ _name: 'Store' });

suite
    .add("item() returns the same instance on repeated calls", t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        const a = store.item('settings');
        const b = store.item('settings');
        t.assert(a === b, "same instance");
    })
    .add("item() creates different instances for different names", t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        const a = store.item('settings');
        const b = store.item('user');
        t.assert(a !== b, "different instances");
    })
    .add("item() uses custom ItemClass", t => {
        StubSocket._clear();
        class MyItem extends Item9 {}
        const store = new Store({ dir: '/data/' });
        const m = store.item('custom', MyItem);
        t.assert(m instanceof MyItem, "is instance of MyItem");
    })
    .add("item() constructs with correct path", t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        const item = store.item('settings');
        t.assert(item.saver?.path === '/data/settings.json', "saver path correct");
    })
    .add("item() trailing slash in dir is normalized", t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data' });
        const item = store.item('notes');
        t.assert(item.saver?.path === '/data/notes.json', "path normalized");
    })
    .add("names returns registered keys", t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        store.item('a'); store.item('b'); store.item('c');
        t.assert(store.names.includes('a'), "a in names");
        t.assert(store.names.includes('b'), "b in names");
        t.assert(store.names.length === 3, "three names");
    })
    .add("save_all() writes all items to their paths", async t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        const settings = store.item('settings');
        const profile  = store.item('profile');
        settings.set('theme', 'dark');
        profile.set('name', 'Alice');
        await store.save_all();
        const s_raw = StubSocket._store.get('/data/settings.json');
        const p_raw = StubSocket._store.get('/data/profile.json');
        t.assert(s_raw !== undefined, "settings written");
        t.assert(p_raw !== undefined, "profile written");
        t.assert(JSON.parse(s_raw).theme === 'dark', "settings.theme=dark");
        t.assert(JSON.parse(p_raw).name === 'Alice', "profile.name=Alice");
    })
    .add("load_all() populates all items from their paths", async t => {
        StubSocket._clear();
        // Pre-populate the stub store
        StubSocket._store.set('/data/settings.json', JSON.stringify({ theme: 'light', version: 2 }));
        StubSocket._store.set('/data/user.json', JSON.stringify({ name: 'Bob', role: 'admin' }));
        const store = new Store({ dir: '/data/' });
        store.item('settings'); store.item('user');
        await store.load_all();
        t.assert(store.item('settings').get('theme') === 'light', "settings loaded");
        t.assert(store.item('user').get('name') === 'Bob', "user loaded");
    })
    .add("load_all() for missing paths — item.data stays empty", async t => {
        StubSocket._clear();
        const store = new Store({ dir: '/data/' });
        store.item('missing');
        await store.load_all(); // should not throw
        t.assert(typeof store.item('missing').data === 'object', "data is object");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await suite.run();
    suite.print();
}

global.fetch = orig_fetch;

export { suite };
export default Store;
