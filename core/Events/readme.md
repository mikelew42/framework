# Events

Base class (and mixin) for on/off/once/emit/clear event subscriptions — both on instances and on the class itself (static).

## Usage

```js
class Thing extends Events {}

// instance events
const t = new Thing();
t.on("change", val => console.log(val));
t.emit("change", 42);

// static (class-level) events
Thing.on("created", item => console.log(item));
Thing.emit("created", t);
```

## Static isolation

Each subclass gets its own static event map. `class Foo extends Events {}` and `class Bar extends Events {}` do not share listeners, and neither leaks into the base `Events` class.

This works via a `static get events()` getter that lazily creates `_events` as an own property of whichever class is accessed. Without this, all subclasses would inherit and share the same `Events.events = {}` object.

## API

Both instance and static versions expose the same five methods:

| Method | Description |
|---|---|
| `on(event, fn)` | Subscribe |
| `off(event, fn)` | Unsubscribe |
| `once(event, fn)` | Subscribe for one call, then auto-remove |
| `emit(event, ...args)` | Fire all listeners |
| `clear(event)` | Remove all listeners for an event |

## Open questions

- Should `emit` return a value (e.g. `false` if any listener returned `false`)? Useful for cancelable events.
- Worth adding `Events.mixin` as a convenience for adding events to a class that already extends something else?
