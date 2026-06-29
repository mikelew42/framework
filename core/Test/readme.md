# Test — Design Doc

## Current State

**Test3 is the blessed class for all new tests.** Import it directly:

```js
import { test, assert } from '/framework/core/Test/3/Test3.js';
```

See [Test/3/readme.md](3/readme.md) for full usage and design notes.

**Existing suites (Test0/Test1)** — 26 Node suites and 21 Playwright tests all pass. They use `Test0` as their data layer and `Test1.View` for browser rendering. These are not being migrated; they stay as-is for compat.

**Legacy Original Test.js** — still used in a handful of older `page.js` files. Backward-compat forever; not re-exported from `app.js` as the default going forward.

---

## What Each Level Is

| Path | Role |
|------|------|
| `Original/Test.js` | First browser REPL runner. Sync, auto-renders, hash isolation. Legacy. |
| `0/Test0.js` | Node data layer. Async, composable `add(suite)`, contract substitution. Powers 26 existing suites. |
| `1/Test1.js` | Browser renderer extending Test0. `<details>/<summary>` tree, collapsible. Used by existing page.js files. |
| `3/Test3.js` | **Current blessed class.** Global captor, auto_run cascade, synchronous inline render. Use for all new tests. |

Test2 was skipped — Test3 started fresh with a cleaner design rather than extending Test0.

---

## What's Pending for Test3

Test3 is fully functional. One gap remains before it can fully replace Test0-based suites:

1. **Async** — `run_self()` is synchronous. `await this.value(this)` would unlock FileSaver / debounce tests. Currently you can't write `async t => { await item.load(); ... }` in a Test3 fn.

2. **Contract inheritance via `add(suite)`** — the variadic `test(Class, OtherClass.test, fn)` pattern works for composition, but doesn't handle Test0's `run(args)` substitution pattern: `Item0.test.run({ Item: Item1 })`.

3. **`run-all.mjs` latent bug** — line 38 is `suite.run().report()`. This works because Test3's `run()` is sync. When async is added, it must become `await suite.run(); suite.report();`.

---

## Goal: One `test()` That Just Works

```js
// .node.test.js — deferred, export for run-all.mjs
export default MyClass.test = test(MyClass, () => {
    test("does the thing", () => { assert(true); });
});

// page.js — auto-renders on creation
import test_obj from "./MyClass.node.test.js";
test_obj.render();
```

Same import. Same `test()`. Same fn. Browser or Node. No user decision about lifecycle.

---

## Roadmap

**Near-term:**
1. Make `run_self()` and `run()` async in Test3. Fix `run-all.mjs` line 38.
2. Confirm all existing `.node.test.js` files work under async run.

**Medium-term:**
3. Migrate existing 26 `.test.js` suites to `.node.test.js` + Test3 as they're touched.
4. Export `test`, `assert` from `app.js` pointing at Test3 (not legacy Original).

**Long-term:**
5. Drop spawn path from `run-all.mjs` once all suites are `.node.test.js`.
6. Test dashboard at `/dev/tests`.
