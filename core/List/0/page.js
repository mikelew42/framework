import app, { el, div, h1, test, assert } from "/app.js";
import List0 from "./List0.js";

app.$root.ac("page");

h1("List0");

test("append / each", t => {
    const list = new List0();
    list.append("a", "b", "c");
    const out = [];
    list.each(child => out.push(child));
    assert(out.length === 3);
    assert(out[0] === "a");
    assert(out[2] === "c");
});

test("add is alias for append", t => {
    const list = new List0();
    list.add(1, 2);
    assert(list.children.length === 2);
});

test("children start empty", t => {
    const list = new List0();
    assert(list.children.length === 0);
});

test("adopt sets parent", t => {
    const parent = new List0();
    const child = new List0();
    parent.append(child);
    assert(child.parent === parent);
});

test("remove child", t => {
    const list = new List0();
    const a = new List0({ name: "a" });
    const b = new List0({ name: "b" });
    list.append(a, b);
    list.remove(a);
    assert(list.children.length === 1);
    assert(list.children[0] === b);
});

test("remove self from parent", t => {
    const parent = new List0();
    const child = new List0();
    parent.append(child);
    child.remove();
    assert(parent.children.length === 0);
});

test("find", t => {
    const list = new List0();
    list.append("x", "y", "z");
    assert(list.find(c => c === "y") === "y");
});

test("index_of", t => {
    const list = new List0();
    const a = {}, b = {};
    list.append(a, b);
    assert(list.index_of(b) === 1);
});

test("insert at index", t => {
    const list = new List0();
    list.append("a", "c");
    list.insert("b", 1);
    assert(list.children[1] === "b");
    assert(list.children[2] === "c");
});

test("map returns new List0", t => {
    const list = new List0();
    list.append(1, 2, 3);
    const doubled = list.map(n => n * 2);
    assert(doubled instanceof List0);
    assert(doubled.children[0] === 2);
    assert(doubled.children[2] === 6);
});

test("clone is shallow by default", t => {
    const list = new List0();
    list.append("a", "b");
    const copy = list.clone();
    assert(copy !== list);
    assert(copy.children !== list.children);
    assert(copy.children[0] === list.children[0]);
});

test("walk visits all descendants", t => {
    const root = new List0();
    const child = new List0();
    root.append(child);
    child.append("leaf");
    const visited = [];
    root.walk(n => visited.push(n));
    assert(visited.length === 2); // child + "leaf"
});

test("Symbol.iterator", t => {
    const list = new List0();
    list.append("x", "y");
    const out = [...list];
    assert(out.length === 2);
    assert(out[1] === "y");
});

test("render requires View", t => {
    const list = new List0({ name: "test" });
    list.append("one", "two");
    list.render();
});
