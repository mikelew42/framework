# HashPager/2

Subclassing experiment. Demonstrates (and exposes) the extensibility problem with
`HashPager`'s singleton/captor design.

---

## What It Does

Subclasses `HashPager`, overrides `render()` — almost identically to the parent's render.
The content is functionally the same as `HashPager/page.js`; the *point* of this file was
to figure out whether you could subclass `HashPager` and have the whole system use your
subclass's render.

---

## The Extensibility Problem

`HashPager`'s singleton (`HashPager.pager`) and captor (`HashPager.captor`) are attached to
the *base class*. If you subclass it, the inherited `page()` helper constructs
`get_captor().constructor` — but `get_captor()` lazily creates a base-class singleton if
none exists, which may or may not be the subclass.

The workaround in this file:

```js
_HashPager.pager = new HashPager({ get_captured: false, label: "pager" });
_HashPager.pager.initialize_pager();
_HashPager.set_captor(_HashPager.pager);
```

The comment: *"wow that wasn't easy to figure out... this is the only way to extend this whole thing?"*

This manual setup replaces the auto-created singleton with the subclassed version, then
manually sets the captor so `page()` will use the subclass. It works but it's fragile —
three lines of manual plumbing the consumer shouldn't need to know about.

---

## What the Render Override Adds

Almost nothing — the render in `2/page.js` is near-identical to the parent. This suggests
the experiment was more about figuring out *how to extend at all* than introducing new
rendering behavior.

---

## Diagnosis

The singleton/captor on the *base class* is the root of the extensibility problem. Two cleaner approaches:

1. **Class-level inheritance**: use `static pager` and `static captor` properly with
   `this.pager` instead of `HashPager.pager`, so subclasses get their own static scope.

2. **Constructor injection**: don't use a singleton at all — pass the pager container in
   explicitly. Removes magic but makes the API more verbose.

Option 1 is simpler and fits the existing patterns.

---

## Status

Proof-of-concept / diagnostic. Not a real variant — it doesn't add features, just shows
the pain point.

---

## Recommendation

Don't promote this to a standalone module. Instead, fix the static inheritance in `HashPager`
so `class MyPager extends HashPager {}` just works without manual plumbing. Once that's fixed,
this file can be removed.
