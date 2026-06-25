import List0 from './List0.js';
import Test0 from '../../Test/0/Test0.js';

List0.test = new Test0({ class: List0 });

List0.test
    .add("children start empty", t => {
        const list = new List0();
        t.assert(list.children.length === 0, "children.length === 0");
    })
    .add("append / each", t => {
        const list = new List0();
        list.append("a", "b", "c");
        const out = [];
        list.each(c => out.push(c));
        t.assert(out.length === 3, "length === 3");
        t.assert(out[0] === "a", 'out[0] === "a"');
        t.assert(out[2] === "c", 'out[2] === "c"');
    })
    .add("add is alias for append", t => {
        const list = new List0();
        list.add(1, 2);
        t.assert(list.children.length === 2, "length === 2");
    })
    .add("adopt sets parent", t => {
        const parent = new List0();
        const child = new List0();
        parent.append(child);
        t.assert(child.parent === parent, "child.parent === parent");
    })
    .add("remove child", t => {
        const list = new List0();
        const a = new List0({ name: "a" });
        const b = new List0({ name: "b" });
        list.append(a, b);
        list.remove(a);
        t.assert(list.children.length === 1, "length === 1 after remove");
        t.assert(list.children[0] === b, "b is the remaining child");
    })
    .add("remove self from parent", t => {
        const parent = new List0();
        const child = new List0();
        parent.append(child);
        child.remove();
        t.assert(parent.children.length === 0, "parent.children empty after self-remove");
    })
    .add("find", t => {
        const list = new List0();
        list.append("x", "y", "z");
        t.assert(list.find(c => c === "y") === "y", 'find("y") === "y"');
    })
    .add("index_of", t => {
        const list = new List0();
        const a = {}, b = {};
        list.append(a, b);
        t.assert(list.index_of(b) === 1, "index_of(b) === 1");
    })
    .add("insert at index", t => {
        const list = new List0();
        list.append("a", "c");
        list.insert("b", 1);
        t.assert(list.children[1] === "b", 'children[1] === "b"');
        t.assert(list.children[2] === "c", 'children[2] === "c"');
    })
    .add("map returns new List0", t => {
        const list = new List0();
        list.append(1, 2, 3);
        const doubled = list.map(n => n * 2);
        t.assert(doubled instanceof List0, "result instanceof List0");
        t.assert(doubled.children[0] === 2, "doubled[0] === 2");
        t.assert(doubled.children[2] === 6, "doubled[2] === 6");
    })
    .add("clone is shallow", t => {
        const list = new List0();
        list.append("a", "b");
        const copy = list.clone();
        t.assert(copy !== list, "copy !== original");
        t.assert(copy.children !== list.children, "children array is new");
        t.assert(copy.children[0] === list.children[0], "elements are shared (shallow)");
    })
    .add("walk visits all descendants", t => {
        const root = new List0();
        const child = new List0();
        root.append(child);
        child.append("leaf");
        const visited = [];
        root.walk(n => visited.push(n));
        t.assert(visited.length === 2, "visited 2 nodes (child + leaf)");
    })
    .add("Symbol.iterator", t => {
        const list = new List0();
        list.append("x", "y");
        const out = [...list];
        t.assert(out.length === 2, "spread length === 2");
        t.assert(out[1] === "y", 'spread[1] === "y"');
    })
    .add("deduce returns first non-undefined", t => {
        const list = new List0();
        list.append("a", "b", "c");
        const result = list.deduce(c => c === "b" ? "found" : undefined);
        t.assert(result === "found", 'deduce found "b"');
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List0.test.run();
    List0.test.print();
}

export default List0;
