import Test3, { test, assert } from './Test3.js';

export default Test3.test = test(Test3, () => {

test("assert records pass", () => {
    const t = new Test3({ _name: 'x', capture: false });
    t.assert(true, "yes");
    assert(t.results.length === 1, "one result");
    assert(t.results[0].pass === true, "pass=true");
});

test("assert records fail", () => {
    const t = new Test3({ _name: 'x', capture: false });
    t.assert(false, "no");
    assert(t.results[0].pass === false, "pass=false");

    test("sub test?", () => {
        assert(true);
    });
});

test("passed / failed getters", () => {
    const a = new Test3({ _name: 'a', capture: false });
    a.assert(true);
    assert(a.passed, "all pass → passed");

    const b = new Test3({ _name: 'b', capture: false });
    b.assert(false);
    assert(b.failed, "any fail → failed");
});

test("name from class", () => {
    const t = new Test3({ class: String, capture: false });
    assert(t.name === 'String', "name === class.name");
});

test("run() calls value fn", () => {
    let ran = false;
    const t = new Test3({ _name: 'x', capture: false, value: () => { ran = true; } });
    t.run();
    assert(ran, "fn called");
});

test("run() recurses into children", () => {
    const parent = new Test3({ _name: 'p', capture: false });
    let ran = false;
    parent.add("child", () => { ran = true; });
    parent.run();
    assert(ran, "child fn ran");
});

test("passed propagates from children", () => {
    const parent = new Test3({ _name: 'p', capture: false });
    parent.add("ok", t => t.assert(true));
    parent.run();
    assert(parent.passed, "passes when child passes");

    const parent2 = new Test3({ _name: 'p2', capture: false });
    parent2.add("bad", t => t.assert(false));
    parent2.run();
    assert(parent2.failed, "fails when child fails");
});

test("add() accepts existing Test3", () => {
    const child = new Test3({ _name: 'child', capture: false });
    child.assert(true, "ok");
    const parent = new Test3({ _name: 'parent', capture: false });
    parent.add(child);
    parent.run();
    assert(parent.tests.length === 1, "one child");
    assert(parent.passed, "parent inherits child pass");
});

test("fail() records a failure", () => {
    const t = new Test3({ _name: 'x', capture: false });
    t.fail("something broke");
    assert(t.results[0].pass === false, "fail recorded");
    assert(t.results[0].message === "something broke", "message preserved");
});

test("run() catches thrown errors", () => {
    const t = new Test3({ _name: 'x', capture: false, value: () => { throw new Error("boom"); } });
    t.run();
    assert(t.failed, "thrown error → failed");
    assert(t.results[0].message.includes("boom"), "error message captured");
});

test("global assert routes to captor", () => {
    assert(Test3.captor !== null, "captor is set while running");
});

}); // end Test3.test
