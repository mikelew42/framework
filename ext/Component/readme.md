# Component (legacy)

`Component` is the old persistence layer. It works but mixes concerns: UI, transport, identity, and domain logic are tangled together. New code should use `Item` instead.

**Do not extend Component in new code.** This directory is kept for backwards compatibility.

---

## Migration: Component → Item

Below is a before/after showing how to convert common patterns.

### 1. FileComponent → Item1 + FileSaver

**Before:**
```js
import FileComponent from "/framework/ext/Component/File/FileComponent.js";

class MyThing extends FileComponent {
    static path = '/data/my-thing.json';
    
    initialize() {
        this.value = this.data.value ?? 0;
    }
    
    increment() {
        this.data.value = (this.data.value ?? 0) + 1;
        this.changed();
    }
}

const thing = new MyThing({ name: 'counter' });
await thing.ready;
```

**After:**
```js
import Item from "/framework/core/Item/Item.js";
import FileSaver from "/framework/ext/File/FileSaver.js";

class MyThing extends Item {
    increment() {
        this.set('value', (this.get('value') ?? 0) + 1);
        this.save();
    }
}

const thing = new MyThing({ saver: new FileSaver({ path: '/data/my-thing.json' }) });
await thing.ready;
```

Key differences:
- No inheritance from `FileComponent` — just inject a `FileSaver`
- Use `item.set(key, val)` instead of `this.data[key] = val`
- Use `item.save()` instead of `this.changed()`
- `item.ready` semantics are the same

---

### 2. ListComponent → Item4 + FileSaver (or CollectionSaver)

**Before:**
```js
import ListComponent from "/framework/ext/List/Component/ListComponent.js";

class StepList extends ListComponent {
    // children are typed by item.type
    get_Type(item) {
        return Step;
    }
}

const list = new StepList({ name: 'steps' });
await list.ready;
list.append(new Step({ data: { title: 'First step' } }));
```

**After (per-item files):**
```js
import Item from "/framework/core/Item/Item.js";
import FileSaver from "/framework/ext/File/FileSaver.js";
import List from "/framework/core/List/List.js";

class Step extends Item {}

const steps = new List();
// Give each item its own file:
const step = new Step({ data: { title: 'First step' } });
step.saver = new FileSaver({ path: '/data/steps/1.json' });
steps.append(step);
await step.save();
```

**After (all items in one file, simpler):**
```js
import { List, CollectionSaver } from "/app.js";
import Step from "./Step.js";

const steps = new List();
const saver = new CollectionSaver({ path: '/data/steps.json', item_class: Step });

await saver.load(steps);

steps.on('add',    () => saver.save(steps));
steps.on('remove', () => saver.save(steps));

steps.append(new Step({ data: { title: 'First step' } }));
```

---

### 3. `this.changed()` / `this.update()` — updating views

**Before:**
```js
// Component triggers view re-render via changed()
this.data.title = 'new';
this.changed();  // triggers update() → re-renders views
```

**After (reactive binding via Item5):**
```js
// Item5.set() emits 'change' — views respond directly
item.set('title', 'new');

// In page.js:
const display = div.c("title", item.get('title'));
item.on('change', (key, val) => {
    if (key === 'title') display.el.textContent = val;
});

// Or with bind.js:
import { bind_text } from "/framework/ext/Bind/bind.js";
bind_text(display.el, item, 'title');  // stays in sync automatically
```

---

### 4. `child.setup(parent)` — parent/saver inheritance

**Before:**
```js
// Component.setup() inherits parent's saver
child.setup(parent);  // sets child.parent, child.saver = parent.saver
parent.set('child', child);  // also registers data link
```

**After:**
```js
// Item automatically inherits saver via parent chain:
child.parent = parent;
// child.saver === parent.saver  (resolved dynamically)

// Or pass saver explicitly:
child.saver = new FileSaver({ path: '/data/child.json' });
```

---

### 5. `toJSON()` — serialization

Both old and new implement `toJSON()`:

```js
// Component0:
toJSON() { return this.data; }

// Item0 (same):
toJSON() { return this.data; }

// Item with children (Item2/Item4):
toJSON() { return { ...this.data, items: this.items }; }
```

No change needed here — both work with `JSON.stringify`.

---

## What NOT to migrate

- `ext/Directory/Directory.js` — server-side watcher, no relation to Component. Keep as-is.
- `ext/Dir/Dir.js` — used as a path factory for the old File system. New code uses FileSaver directly with explicit paths.
- Any working pages that use FileComponent and aren't being actively changed — the old system still works.

## When to migrate

Migrate a Component when you need:
- Reactive field updates (`item.on('change', ...)`)
- Multiple persistence backends (swap out the Saver)
- Undo/redo (`Item9`)
- Schema validation (`Item8`)
- Derived/filtered views (`List5–8`)
