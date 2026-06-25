# Item8 — Schema / Type Coercion

Adds `schema(def)` to define field types. When `set(key, val)` is called on a schema'd key, the value is coerced to the declared type before being stored. Invalid values emit `'error'` and leave the field unchanged.

## Why

`Item7.set()` is untyped: `item.set('price', '42')` stores the string `'42'`, not the number `42`. UI inputs always produce strings; persistence round-trips can silently corrupt number/boolean fields. Item8 fixes this at the model layer.

## API

```js
item.schema({ key: Type })
```

| Type value | Behavior |
|---|---|
| `Number` | Calls `Number(val)`, throws on NaN |
| `String` | Calls `String(val)` — never fails |
| `Boolean` | Accepts `true/false` or `'true'/'false'` strings |
| `Array` | Validates `Array.isArray(val)`, throws otherwise |
| `Object` | Validates plain object (not null, not array) |
| `fn(val)` | Custom coercer — returns coerced value or throws |

## Example

```js
class Product extends Item8 {
    constructor(...args) {
        super(...args);
        this.schema({ price: Number, qty: Number, name: String, active: Boolean });
        this.compute('subtotal', ['price', 'qty'], (p, q) => p * q);
    }
}

const p = new Product({ data: { price: 0, qty: 0, name: '', active: false } });
p.on('error', (key, val, err) => console.warn(`invalid ${key}:`, err.message));

p.set('price', '9.99');   // → 9.99 (number)
p.set('qty', '3');        // → 3 (number)
p.get('subtotal');        // → 29.97 (computed)
p.set('active', 'true');  // → true (boolean)
p.set('price', 'oops');   // → 'error' fired, price unchanged
```

## Error handling

When coercion fails, `item.emit('error', key, val, err)` fires and `set()` returns `this` without modifying `item.data`. Subscribe to `'error'` to show validation messages in the UI.

## Notes

- `schema()` is fluent — returns `this` for chaining.
- Keys not in the schema are untyped — `set()` behaves as in Item7.
- Schema + `compute()` compose cleanly: coercion runs first, then computed deps recalculate.
- Schema + `batch()` compose cleanly: coercion runs at set-time; batch deduplication applies to the coerced values.
- Custom coercers receive the raw value and must return the coerced value or throw.
