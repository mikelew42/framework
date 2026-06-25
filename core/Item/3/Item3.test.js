import Item2 from "../2/Item2.test.js";
import Item3 from "./Item3.js";
import Test0 from "../../Test/0/Test0.js";

Item3.test = new Test0({ class: Item3 });
Item3.test.add(Item2.test);

Item3.test
    .add("path — root item uses 'root'", t => {
        const item = new Item3();
        t.assert(item.path === 'root', "item.path === 'root'");
    })
    .add("path — root item uses name if set", t => {
        const item = new Item3({ data: { name: 'myItem' } });
        t.assert(item.path === 'myItem', "item.path === 'myItem'");
    })
    .add("path — child uses parent.path + index", t => {
        const root = new Item3();
        const child = new Item3();
        root.add(child);
        t.assert(child.path === 'root.0', `child.path === 'root.0' (got '${child.path}')`);
    })
    .add("path — grandchild", t => {
        const root = new Item3();
        const child = new Item3();
        const grandchild = new Item3();
        root.add(child);
        child.add(grandchild);
        t.assert(grandchild.path === 'root.0.0', `grandchild.path === 'root.0.0' (got '${grandchild.path}')`);
    })
    .add("apply_server_delta — applies non-dirty fields", t => {
        const item = new Item3();
        item.data.x = 0;
        item.apply_server_delta({ x: 1, y: 2 });
        t.assert(item.data.x === 1, "x updated to 1");
        t.assert(item.data.y === 2, "y updated to 2");
    })
    .add("apply_server_delta — skips dirty fields", t => {
        const item = new Item3();
        item.set('x', 99);
        item.apply_server_delta({ x: 1, y: 2 });
        t.assert(item.data.x === 99, "x stays 99 (was dirty)");
        t.assert(item.data.y === 2, "y applied (not dirty)");
    })
    .add("delta() — returns jspath, patch, ts", t => {
        const item = new Item3();
        const d = item.delta({ a: 1 });
        t.assert(d.jspath === 'root', `d.jspath === 'root' (got '${d.jspath}')`);
        t.assert(d.patch.a === 1, "d.patch.a === 1");
        t.assert(typeof d.ts === 'number', "d.ts is a number");
    })
    .add("delta() — ts is recent", t => {
        const before = Date.now();
        const item = new Item3();
        const d = item.delta({ b: 2 });
        const after = Date.now();
        t.assert(d.ts >= before && d.ts <= after + 100, `ts is recent (${d.ts})`);
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item3.test.run();
    Item3.test.print();
}

export default Item3;
