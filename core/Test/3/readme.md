# Test3

One Test class. Global captor pattern. Works in Node and browser.

## API

```js
import Test3, { test, assert } from '/framework/core/Test/3/Test3.js';

export default Thing.test = test(Thing);   // root test, sets captor

test("does something", () => {
    const x = new Thing();
    assert(x.value === 42, "value is 42");
});

test("handles edge case", t => {
    t.assert(true, "can also use t.assert directly");
});
```

### `test()` signatures

| call | effect |
|------|--------|
| `test(Class)` | create root test for Class, set `Test3.captor`, return it |
| `test("label", fn)` | add labeled child to current captor, return it |
| `test(fn)` | add unlabeled child, return it |
| `test("label")` | add labeled child with no fn (grouping) |

### `test.add()` — contract inheritance

```js
Item1.test.add(Item0.test);   // inherit all of Item0's tests
Item1.test.add("extra", t => { ... });
```

### Output modes

| method | does |
|--------|------|
| `.run()` | run all fns, store results, no output |
| `.render()` | run + render with View (browser) |
| `.summarize()` | run + one-line pass/fail (browser) |
| `.report()` | print results to console; sets exit code on failure (Node) |

## File naming

`*.node.test.js` — node-compatible (no DOM/View). `run-all.mjs` picks these up.  
`*.test.js` — browser-only tests. Runner ignores them.

Default export is always the test object.

## run-all.mjs pattern

```js
const mod = await import(file);
mod.default.run();
mod.default.report();
```

## Visual debugger

`render()` runs each test fn synchronously and renders it immediately. Set a breakpoint inside a test fn — everything up to that point is already on screen. Step forward, watch more render.

## Captor note

`test(Class)` sets `Test3.captor` for the lifetime of that file's top-level execution. Subsequent `test()` calls in the same file add children to that captor. A new `test(Class)` in another file replaces the captor. Top-level `test("label", fn)` calls without a preceding `test(Class)` add to whatever captor was last set — document your test files carefully.

## What Test0 / Test1 had that Test3 drops

- **Async test fns** — Test3 is sync-only. Async tests stay on Test0 for now.
- `Test1.View` — replaced by `Test3.render()` / `Test3.summarize()`.
- `Test0.List` — children are a plain array; no List traversal needed here.
