import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import LocalStorageSaver from './LocalStorageSaver.js';
import Item1 from '/framework/core/Item/1/Item1.js';
import Test0 from '/framework/core/Test/0/Test0.js';

// Inject localStorage stub into global scope before importing the saver
const __dir = path.dirname(fileURLToPath(import.meta.url));
const stubPath = pathToFileURL(path.resolve(__dir, '../../../../scripts/stubs/localStorage.js'));
const { default: localStorage_stub } = await import(stubPath.href);
global.localStorage = localStorage_stub;

const suite = new Test0({ _name: 'LocalStorageSaver' });

suite
    .add("save stores JSON to localStorage", t => {
        localStorage_stub._reset();
        const saver = new LocalStorageSaver({ key: 'test:item' });
        const item = new Item1({ data: { name: 'Alice' } });
        saver.save(item);
        const raw = localStorage_stub.getItem('test:item');
        t.assert(raw !== null, "key exists in localStorage");
        t.assert(JSON.parse(raw).name === 'Alice', "name serialized correctly");
    })
    .add("load reads JSON from localStorage", t => {
        localStorage_stub._reset();
        localStorage_stub.setItem('test:load', JSON.stringify({ score: 42 }));
        const saver = new LocalStorageSaver({ key: 'test:load' });
        const item = new Item1();
        saver.load(item);
        t.assert(item.data.score === 42, "score loaded correctly");
    })
    .add("load with missing key preserves item.data", t => {
        localStorage_stub._reset();
        const saver = new LocalStorageSaver({ key: 'missing:key' });
        const item = new Item1({ data: { x: 7 } });
        saver.load(item);
        t.assert(item.data.x === 7, "existing item.data preserved when no stored value");
    })
    .add("load with missing key and empty item.data returns {}", t => {
        localStorage_stub._reset();
        const saver = new LocalStorageSaver({ key: 'missing:key2' });
        const item = new Item1();
        saver.load(item);
        t.assert(typeof item.data === 'object', "item.data is an object");
    })
    .add("delete removes key from localStorage", t => {
        localStorage_stub._reset();
        localStorage_stub.setItem('test:del', JSON.stringify({ v: 1 }));
        const saver = new LocalStorageSaver({ key: 'test:del' });
        const item = new Item1({ data: { v: 1 } });
        saver.delete(item);
        t.assert(localStorage_stub.getItem('test:del') === null, "key removed");
    })
    .add("round-trip: save then load in fresh item", t => {
        localStorage_stub._reset();
        const saver = new LocalStorageSaver({ key: 'test:rt' });
        const item1 = new Item1({ data: { msg: 'hello', n: 3 } });
        saver.save(item1);
        const item2 = new Item1();
        saver.load(item2);
        t.assert(item2.data.msg === 'hello', "msg round-trips");
        t.assert(item2.data.n === 3, "n round-trips");
    })
    .add("overwrite: save twice uses latest data", t => {
        localStorage_stub._reset();
        const saver = new LocalStorageSaver({ key: 'test:ow' });
        const item = new Item1({ data: { v: 1 } });
        saver.save(item);
        item.data.v = 2;
        saver.save(item);
        const raw = JSON.parse(localStorage_stub.getItem('test:ow'));
        t.assert(raw.v === 2, "second save wins");
    })
    .add("multiple savers use different keys independently", t => {
        localStorage_stub._reset();
        const sa = new LocalStorageSaver({ key: 'ns:a' });
        const sb = new LocalStorageSaver({ key: 'ns:b' });
        const ia = new Item1({ data: { val: 'a' } });
        const ib = new Item1({ data: { val: 'b' } });
        sa.save(ia); sb.save(ib);
        const la = new Item1(); sa.load(la);
        const lb = new Item1(); sb.load(lb);
        t.assert(la.data.val === 'a', "a loads from ns:a");
        t.assert(lb.data.val === 'b', "b loads from ns:b");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await suite.run();
    suite.print();
}

export { suite };
export default LocalStorageSaver;
