# mixin

Compose multiple classes into one. Last class is the base (what you extend). Earlier classes override it — first argument wins on conflicts.

```js
import { mixin } from '/framework/core.js';

class Thing extends mixin(Three, Two, One) {}
// One is base, Two overrides One, Three overrides both
```

## What it copies

- All instance methods from each class's `prototype` (except `constructor`)
- All static members (except `prototype`, `name`, `length`)
- Getters and setters are preserved via `Object.getOwnPropertyDescriptor`

## What it doesn't do

- Does not call constructors of mixed-in classes — only the base class constructor runs
- Does not handle `super` calls from mixed-in methods — they resolve against the base

## Priority rule

`mixin(A, B, C)` → C is the base, B overrides C, A overrides both. The first argument has the highest priority.

## Subclasses can override

```js
class Thing extends mixin(A, B) {
    method() { return "Thing"; }  // wins over A and B
}
```
