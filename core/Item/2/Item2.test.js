import Item1 from "../1/Item1.test.js";
import Item2 from "./Item2.js";
import Test0 from "../../Test/0/Test0.js";

class MemorySaver {
    constructor(initial = {}) { this.data = initial; this.saves = []; }
    async load(item) { item.data = { ...this.data }; }
    save(item, patch) { this.saves.push(JSON.parse(JSON.stringify(item))); }
    async delete(item) {}
}

Item2.test = new Test0({ class: Item2 });
Item2.test.add(Item1.test);

Item2.test
    .add("add sets parent on child", t => {
        const parent = new Item2();
        const child = new Item2();
        parent.add(child);
        t.assert(child.parent === parent, "child.parent === parent");
    })
    .add("saver inherited from parent", t => {
        const saver = new MemorySaver();
        const parent = new Item2({ saver });
        const child = new Item2();
        parent.add(child);
        t.assert(child.saver === saver, "child inherits parent.saver");
    })
    .add("add multiple children", t => {
        const root = new Item2();
        const a = new Item2();
        const b = new Item2();
        root.add(a, b);
        t.assert(root.items.length === 2, "two children");
    })
    .add("remove child", t => {
        const root = new Item2();
        const a = new Item2();
        root.add(a);
        root.remove(a);
        t.assert(root.items.length === 0, "items empty after remove");
        t.assert(!a.parent, "parent cleared");
    })
    .add("toJSON includes items", t => {
        const root = new Item2({ data: { name: "root" } });
        const child = new Item2({ data: { name: "child" } });
        root.add(child);
        const json = JSON.stringify(root);
        const parsed = JSON.parse(json);
        t.assert(parsed.name === "root", "root data preserved");
        t.assert(Array.isArray(parsed.items), "items array present");
        t.assert(parsed.items[0].name === "child", "child data present");
    })
    .add("nested saver inheritance (grandchild)", t => {
        const saver = new MemorySaver();
        const root = new Item2({ saver });
        const child = new Item2();
        const grandchild = new Item2();
        root.add(child);
        child.add(grandchild);
        t.assert(grandchild.saver === saver, "grandchild inherits saver from root");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Item2.test.run();
    Item2.test.print();
}

export default Item2;
