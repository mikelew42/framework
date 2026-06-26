# Test Refactor → Test3

## What's wrong now

- Three classes (Test.js, Test0, Test1) with overlapping concerns.
- `.test.js` files export the class, not the test object — the file's whole purpose is the test object.
- `.add()` chains force indentation and are awkward to type.
- `run-all.mjs` spawns a child process per file, so each file has to self-execute via a guard. Fix the runner, the guard disappears.

---

## New design: one Test class, global captor

Same pattern as View. `Test.captor` is the currently active test. `test()` and `assert()` are global functions.

```js
// Events.node.test.js
import Events from './Events.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

export default Events.test = test(Events);

test("on/emit", t => {
    const e = new Events();
    let got;
    e.on("ping", v => got = v);
    e.emit("ping", 42);
    assert(got === 42, "listener receives value");
});

test("off removes listener", t => {
    // ...
});
```

### `test()` rules

- `test(Class)` — creates a root test for that class, sets `Test.captor`, returns it.
- `test("label", fn)` — creates a labeled child under `Test.captor`, returns it.
- `test(fn)` — same, no label. Labels are optional.
- `test("label")` — labeled child with no fn, for grouping.

Distinguishing `test(Class)` from `test(fn)`: check `fn.toString().startsWith('class')`. Classes declared with the `class` keyword always stringify this way in V8/browsers. This is a convention, not a hard guarantee — document it.

### `test.add()` still works

For contract inheritance (the class-progression pattern):

```js
Item1.test.add(Item0.test);  // inherit Item0's full contract
```

`add(arg, fn)` accepts either an existing Test instance or a `("label", fn)` pair.

### Capture-first

`test("label", fn)` captures the child — it does NOT run or render the fn. The caller decides what to do:

| method | what it does |
|--------|-------------|
| `.run()` | run all fns, store results, no render |
| `.render()` | run + render with View (browser, visual debugger) |
| `.summarize()` | run + compact pass/fail summary (browser) |
| `.report()` | run + print to console (Node) |

### Captor during run / render

When `render()` runs a test fn, it sets both `Test.captor` (so `assert()` routes to the right test) and `View.captor` (so any View elements created inside the fn auto-attach to the test's container). This is the visual debugger feature: step through a test fn in devtools and watch the UI build up synchronously.

`run()` only sets `Test.captor` — no View involvement, works in Node.

---

## File naming: `.node.test.js`

`*.node.test.js` — node-compatible (no DOM/View). `run-all.mjs` only picks these up.  
`*.test.js` — browser-only tests (may use View, DOM APIs). Runner ignores them.

`run-all.mjs` becomes:
```js
const mod = await import(file);   // *.node.test.js
await mod.default.run();
mod.default.report();
```

Default export is always the test object. No guard boilerplate in any file.

---

## Three contexts

- **Node / run-all.mjs** — imports `*.node.test.js`, calls `.run()` + `.report()`
- **Browser / page.js** — imports test files, calls `.render()` or `.summarize()`
- **Playwright** — drives the browser UI; useful for Claude during development. Role TBD.

---

## Notes on the capture-first model

Code at the top level of a `.node.test.js` file runs immediately at import time. The `test()` calls define children, but the fns are not called until `.run()` or `.render()`. This means:

- Any setup code between `test()` calls runs at import time, not between test executions.
- To get interleaved setup + test, wrap a sequence of `test()` calls inside a parent `test()` fn body.

---

## Future: separate test object from results

Right now the test object and its results are entangled. Separating them would allow:
- Run in Node, send results via WebSocket, render in the browser.
- Cache results keyed by file hash — skip unchanged files on re-run.

---

## Future: incremental / on-demand runs

- **File hashing** — save results by file hash, skip re-running unchanged tests.
- **Dependency tracking** — a base class change re-runs all tests that import it. Requires an import graph.
- Both are deferred. The hash cache is a prerequisite for on-demand to be useful.
