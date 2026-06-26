# Test0 — Node-Compatible Test Runner

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

## Watcher / Incremental Runner (planned, not built)

Convention-based: `Foo.js` changes → run `Foo.test.js`. Higher-level suites (e.g. `Item9.test.js` imports `Item8.test.js`) run naturally when any level changes.

```sh
# manual: run a single suite
node --import ./scripts/register.mjs public/framework/core/Item/5/Item5.test.js

# all suites (serial, ~few seconds)
node scripts/run-all.mjs
```

A `scripts/watch.mjs` using chokidar could watch `public/framework/**/*.js` and spawn the corresponding `.test.js` on change. Not built yet — see the parent readme for the full design trade-off (convention-based vs. full import graph tracking via Vitest).

## Resolved

- **Runner script location** — `scripts/` at repo root. `scripts/loader.mjs` maps `/framework/...` imports. `scripts/register.mjs` loads the loader via `module.register()`.
- **Exit code on failure** — `Test0.print()` sets `process.exitCode = 1` when any test fails (Node-safe: guards on `typeof process`). Zero exit = all green.
- **Main-guard pattern** — each `.test.js` ends with:
  ```js
  if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
      await suite.run();
      suite.print();
  }
  ```
  The `&&` short-circuits in the browser so `import('url')` is never evaluated.
- **`run()` is async** — `Test0.run()` is `async` and awaits each test function. Async test bodies (e.g. `auto_save` debounce tests) work correctly.
- **`run(args)` for contract testing** — args passed as second param to each test function without mutating the suite:
  ```js
  Item0.test.run({ Item: Item1 });  // verify Item1 satisfies Item0's contract
  ```

## Open Questions

- Playwright track for DOM/UI tests: who starts the browser? (Claude can run `npx playwright` if installed — defer until needed.)
- Servex DevSocket integration: message shape for test results — defer until DevSocket exists.
- Full import graph tracking (so a change to `Item5.js` triggers `Item5.test.js` through `Item9.test.js`) — requires either Vitest or a custom graph builder. See parent readme.
