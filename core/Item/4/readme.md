# Item4 — Reactive Children (List1)

Upgrades `this.items` from a plain array to a `List1` subclass, giving reactive add/remove events and all List0 traversal methods.

## What it adds over Item3

```js
// item.items is now a List1
parent.items.on('add', (child, idx) => updateUI(child, idx));
parent.items.on('remove', (child, idx) => removeUI(idx));

parent.add(child);      // fires items.emit('add', child, 0)
parent.remove(child);   // fires items.emit('remove', child, 0)

parent.items.each(c => ...);   // List0 traversal
parent.items.find(c => ...);   // List0 find
```

## Key Design Decisions

- `child.parent` is set to the Item4 (not the List). Item4.List overrides `adopt()` as a no-op; Item4.add() handles parent assignment.
- Saver inheritance still works via `child.parent.saver` → the parent Item4's saver.
- `child.remove()` (no-arg self-remove) calls `child.parent.remove(child)` — Item4.remove() handles the undefined-arg case.
- `toJSON()` returns `{ ...this.data, items: this.items.children }` (the plain array), not the List1 wrapper.

## Usage

```js
const tree = new Item4({ saver: new FileSaver({ path: "/data/tree.json" }) });
await tree.ready;

const node = new Item4({ data: { label: "chapter 1" } });
tree.add(node);           // fires tree.items 'add' event

tree.items.on('add', (child, idx) => {
    // re-render the nav when children change
});

tree.items.each(child => console.log(child.get("label")));
```

## `Item4.List`

`Item4.List` is a `List1` subclass with `adopt()` overridden to be a no-op. It is the only change from `List1`. Use it when you need a reactive list of Items where parent assignment is managed by the Item, not the List.
