# Test3 — The Blessed Test Class

Test3 is the single unified test primitive for this framework. Use it for all new tests.

## Quick Usage

```js
// MyClass.node.test.js
import MyClass from './MyClass.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

export default MyClass.test = test(MyClass, () => {

test("does the thing", () => {
    const obj = new MyClass({ capture: false });
    assert(obj.value === 1, "default value");
});

test("handles edge case", () => {
    assert(true, "placeholder");
});

}); // end MyClass.test
```

Run in Node:
```
node --import ./scripts/register.mjs path/to/MyClass.node.test.js
```

Or via run-all:
```
node --import ./scripts/register.mjs scripts/run-all.mjs
```

Browser: import the test object and call `.render()`:
```js
import test_obj from "./MyClass.node.test.js";
test_obj.render();
```

---

## Core Design

### `test(arg, ...rest)` — the helper

```js
test(MyClass, fn)          // root for a class; name from MyClass.name
test("label", fn)          // labeled root or child
test(fn)                   // unlabeled child
test(MyClass, Other.test, fn)  // variadic: inherited suite runs before own fn
```

`test()` is just `new Test3({ ... })`. All the logic lives in `initialize()`.

### Constructor → `initialize()`

Every `new Test3(...)` calls `initialize()`, which:
1. **Captures to captor** — if `Test3.captor` is set (we're inside a running parent's value fn), adds self as a child. Skip with `capture: false`.
2. **Sets `auto_run`** — root tests check `is_test_file()` (stack trace on `.test.js` → `false`). Children inherit from parent: `parent.auto_run || parent._running`.
3. **Auto-runs** — if `auto_run`, calls `render()` in browser or `run()` in Node immediately.

### `auto_run` cascade

Children created inside a value fn see `parent._running = true` → `auto_run = true` → run/render immediately and synchronously. This gives console.group-style cascade.

Pre-built tests added before run (`add()`, variadic) have `auto_run = false` at add-time → deferred to `run_children()`.

### `run()` / `run_self()` / `run_children()`

```
run()
  run_self()         — executes value fn; children capture + auto_run inline
  run_children()     — runs anything with _auto_ran = false (pre-built, deferred)
```

`run_children()` skips children where `_auto_ran = true` to avoid double-running.

### `render()` — idempotent

`if (this.view) return this` at the top. Auto-run children call `render()` inline from `initialize()`, setting their `view`. The parent's child loop checks `!child.view` to skip already-rendered children.

Structure:
```
t3-test
  t3-bar        ← name
  t3-results    ← run_self() runs here; asserts + UI render inline in order
  t3-children   ← explicit-render children (those that didn't auto_render)
```

### `assert()` — dual output

```js
assert(condition, message)
```

Always pushes to `this.results` (for Node reporting). Also calls `render_assertion()` inline if `this.view` is set (browser path), so assertions appear in DOM order as the fn runs.

### `capture: false` — isolation escape hatch

When creating a Test3 instance as a fixture inside a test body (to test Test3 internals), pass `capture: false` to prevent it from being captured as a real child:

```js
test("run catches errors", () => {
    const t = new Test3({ capture: false, value: () => { throw new Error("boom"); } });
    t.run();
    assert(t.failed, "thrown error → failed");
});
```

### Class inheritance — variadic `test()`

```js
// Class2.node.test.js
import Class1 from '../1/Class1.node.test.js';

export default Class2.test = test(Class2, Class1.test, () => {
    test("class2-specific", () => { assert(true); });
});
```

`Class1.test` is pushed to `tests[]` before `initialize()` runs. When `Class2.test.run()` is called, `run_children()` picks up `Class1.test` (not `_auto_ran`) and runs it, verifying the contract is preserved.

---

## Flags

| Flag | Set where | Purpose |
|------|-----------|---------|
| `auto_run` | `initialize()` | Whether this test runs immediately on creation |
| `_running` | `run_self()` | Transient — true while value fn executes; children read this |
| `_auto_ran` | `initialize()` | Permanent — marks tests that auto-ran; `run_children()` skips these |
| `capture` | constructor arg | Pass `false` to prevent capture to Test3.captor |

---

## What's Still Pending

- **Async** — `run_self()` is synchronous. `await this.value(this)` would unblock FileSaver / debounce tests. Not yet implemented.
- **`add(suite)` from Test0** — composable contract inheritance via explicit `.add()` call. Currently done via variadic `test()` instead.
- **`run(args)` substitution** — `Test0.test.run({ Item: Item1 })` for contract parametrization. Not yet implemented.

---

## Files

- `Test3.js` — implementation
- `Test3.node.test.js` — Test3 tests itself
- `Test3.css` — minimal styles
- `page.js` — demo: auto_run inline + explicit render
- `readme.md` — this file
