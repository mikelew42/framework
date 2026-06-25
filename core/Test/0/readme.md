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
