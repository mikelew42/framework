import app, { div, h1, test, assert } from "/app.js";
import Test0 from "./Test0.js";

app.$root.ac("page");

h1("Test0");

// Verify Test0 itself using the legacy test() helper so results appear in browser.
// These are also a specification of Test0's contract for use in Test1+.

test("add leaf / run / passed", t => {
    const suite = new Test0({ _name: "example" });
    suite.add("always passes", (t2) => { t2.assert(true); });
    suite.run();
    assert(suite.passed);
    assert(suite.tests.length === 1);
});

test("failed assertion marks suite as failed", t => {
    const suite = new Test0({ _name: "example" });
    suite.add("always fails", (t2) => { t2.assert(false, "nope"); });
    suite.run();
    assert(suite.failed);
    assert(suite.failures.length === 1);
    assert(suite.failures[0].message === "nope");
});

test("name falls back to class.name", t => {
    class MyThing {}
    const suite = new Test0({ class: MyThing });
    assert(suite.name === "MyThing");
});

test("explicit _name overrides class.name", t => {
    class MyThing {}
    const suite = new Test0({ class: MyThing, _name: "override" });
    assert(suite.name === "override");
});

test("add suite inherits child tests", t => {
    const inner = new Test0({ _name: "inner" });
    inner.add("inner test", (t2) => { t2.assert(true); });

    const outer = new Test0({ _name: "outer" });
    outer.add(inner);
    outer.run();
    assert(outer.passed);
    assert(outer.tests.length === 1);
});

test("run passes args to test fn", t => {
    const suite = new Test0({ _name: "contract" });
    suite.add("uses arg", (t2, { value } = {}) => { t2.assert(value === 42); });
    suite.run({ value: 42 });
    assert(suite.passed);
});

test("run passes args down to child suites", t => {
    const child = new Test0({ _name: "child" });
    child.add("sees arg", (t2, { flag } = {}) => { t2.assert(flag === true); });

    const parent = new Test0({ _name: "parent" });
    parent.add(child);
    parent.run({ flag: true });
    assert(parent.passed);
});

test("thrown error recorded as failure", t => {
    const suite = new Test0({ _name: "throws" });
    suite.add("explodes", () => { throw new Error("boom"); });
    suite.run();
    assert(suite.failed);
    assert(suite.failures[0].message.includes("boom"));
});

test("summary returns string", t => {
    const suite = new Test0({ _name: "summary-test" });
    suite.add("ok", (t2) => { t2.assert(true, "it works"); });
    suite.run();
    const s = suite.summary();
    assert(typeof s === "string");
    assert(s.includes("✓"));
});

test("class-attached pattern", t => {
    class Dummy {}
    Dummy.test = new Test0({ class: Dummy });
    Dummy.test.add("dummy works", (t2) => { t2.assert(true); });
    Dummy.test.run();
    assert(Dummy.test.passed);
    assert(Dummy.test.name === "Dummy");
});
