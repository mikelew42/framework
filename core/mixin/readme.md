# mixin

Compose multiple classes into one without a class hierarchy.

## Usage

```js
import mixin from "/framework/core/mixin/mixin.js";

class Thing extends mixin(Three, Two, One) {}
```

- Last argument is the **base class** (extended via `extends`)
- Earlier arguments are mixed in; **first argument wins** (highest priority)
- Both instance methods (prototype) and static members are copied

## Why

JS single inheritance means you can't `extends A, B, C`. `mixin()` copies prototype
descriptors onto a fresh subclass of the base, giving you the method composition
without the diamond-problem complexity of deep prototype chains.

## Caveats

- `instanceof` only works for the base class — not the mixed-in sources
- `super` calls inside mixed-in methods refer to the base, not the source's own parent
- Getters/setters are preserved (copied via `getOwnPropertyDescriptor`)

## Open questions

- Should `mixin()` with a single class (no sources) just return it unchanged?
- Worth supporting a version that preserves `instanceof` via Symbols?
