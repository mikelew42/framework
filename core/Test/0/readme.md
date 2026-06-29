# Test0 — Node-Compatible Test Runner

> **Status:** Stable, 26 suites passing. Will be superseded by a fixed Test3 (the unified class) — but never deleted. The `async run(args)` design and `add(suite)` contract inheritance will carry forward directly into the unified class.

The foundational test suite class. Runs in Node (no DOM, no View) and is the building block for class-attached progressive test contracts.

## API

```js
import Test0 from "/framework/core/Test/0/Test0.js";

const suite = new Test0({ _name: 'MyClass' });

suite.add("does the thing", async t => {
    const obj = new MyClass();
    t.assert(obj.value === 42, "value is 42");
    t.assert(typeof obj.name === 'string', "name is a string");
});

await suite.run();   // async — awaits each test fn in sequence
suite.print();       // logs to console; sets process.exitCode = 1 on failure
```

## Composable contract inheritance

Suites can contain other suites:

```js
// In MyClass1.test.js:
import MyClass0 from "../0/MyClass0.test.js";   // imported for its .test suite

class MyClass1Test extends Test0 {}
MyClass1.test = new MyClass1Test({ class: MyClass1 });
MyClass1.test.add(MyClass0.test);  // inherit lower contract
MyClass1.test.add("additional MyClass1 behavior", t => { ... });
```

Running `MyClass1.test` checks both MyClass0's contract AND MyClass1's additions.

## Class-attached suites

```js
// In MyClass.test.js:
import MyClass from "./MyClass.js";
import Test0 from "/framework/core/Test/0/Test0.js";

MyClass.test = new Test0({ class: MyClass });
MyClass.test.add("...", t => { ... });

export default MyClass;  // re-export with .test attached
```

Higher levels import from `MyClass.test.js`, not `MyClass.js`, to get the suite:

```js
import MyClass from "./MyClass.test.js";
// MyClass.test is now available
MyClass0.test.add(MyClass.test);  // inherit contract
```

## Running in Node

```sh
node --import ./scripts/register.mjs public/framework/core/Item/0/Item0.test.js
```

Exit 0 = all passed. Exit 1 = at least one failure.

## What Test1 adds

`Test1` adds a `Test1.View` browser renderer that renders the suite tree with pass/fail CSS. It's a superset of `Test0` — all `Test0` suites are compatible.

---

## Status

**Fully viable. Foundation of all 26 Node suites. No known issues.**

All 26 framework class tests use Test0 as their data layer. The async `run(args)` contract is the right choice — async test bodies (auto_save, debounce, FileSaver) work correctly. The `add(suite)` composition pattern for contract inheritance is well-established and working.

Test3 explored dropping Test0 in favor of a unified class. Test3 was sync-only, which would break async tests. Test0 stays.

---

## File Naming Conventions

**Current:** Most files use `*.test.js` + a self-execute guard:
```js
// At the bottom of MyClass.test.js:
if (typeof process !== 'undefined' && process.argv[1] === ...) {
    await suite.run();
    suite.print();
}
```
The guard is needed because `run-all.mjs` spawns these as subprocess.

**Future:** Prefer `*.node.test.js` for new test files. The runner imports these directly and calls `.run().report()` without spawning. No guard boilerplate needed. Default export is always the test object.

Both formats work today. Migrate old files opportunistically.

---

## Watcher / Incremental Runner (planned, not built)

Convention-based: `Foo.js` changes → run `Foo.test.js`. Higher-level suites (e.g. `Item9.test.js` imports `Item8.test.js`) run naturally when any level changes.

```sh
# manual: run a single suite
node --import ./scripts/register.mjs public/framework/core/Item/5/Item5.test.js

# all suites (serial, ~few seconds)
node scripts/run-all.mjs
```

A `scripts/watch.mjs` using chokidar could watch `public/framework/**/*.js` and spawn the corresponding `.test.js` on change. Not built yet — see the parent readme for the full design trade-off (convention-based vs. full import graph tracking via Vitest).

---

## Resolved

- **Runner script location** — `scripts/` at repo root. `scripts/loader.mjs` maps `/framework/...` imports. `scripts/register.mjs` loads the loader via `module.register()`.
- **Exit code on failure** — `Test0.print()` sets `process.exitCode = 1` when any test fails (Node-safe: guards on `typeof process`). Zero exit = all green.
- **`run()` is async** — `Test0.run()` is `async` and awaits each test function. Async test bodies (e.g. `auto_save` debounce tests) work correctly.
- **`run(args)` for contract testing** — args passed as second param to each test function without mutating the suite:
  ```js
  Item0.test.run({ Item: Item1 });  // verify Item1 satisfies Item0's contract
  ```
- **Test3 regression** — Test3 was sync-only. Test0's async run() is a deliberate design choice that must be preserved in any future unification.

## Known Bug: run-all.mjs line 38

`run-all.mjs` calls `suite.run().report()` on `*.node.test.js` files. Since `Test0.run()` is async (returns a Promise), `.report()` is called on the Promise object — not on the suite. Currently harmless because the only `.node.test.js` file uses Test3's synchronous `run()`. Will silently fail to report when a real Test0-based `.node.test.js` is added.

Fix: `await suite.run(); suite.report();`

## Decisions

- **`report()` not `print()`** — rename `print()` to `report()` in Test0 before Test2 inherits the ambiguity. `report()` is more general (doesn't imply console-only), and Test3 already used that name. Both do the same thing: print summary to console, set `process.exitCode = 1` on failure.
- **Pure constructor** — do not run or render in the constructor. Construction captures configuration; `run()` and `render()` trigger execution. Test3 violated this by running `initialize()` with side effects during `new Test3()`, which is why it needed `is_test_file()` detection.

## Open Questions

- Playwright track for DOM/UI tests: who starts the browser? (Claude can run `npx playwright` if installed — defer until needed.)
- Full import graph tracking (so a change to `Item5.js` triggers `Item5.test.js` through `Item9.test.js`) — requires either Vitest or a custom graph builder.
