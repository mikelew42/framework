# WebApp2 — Panel Persistence + Animated Collapse + Keyboard Shortcuts

Extends WebApp1. Adds three things every real app needs: panel widths that survive refresh, smooth animated collapse with toggle buttons in the header, and keyboard shortcuts to show/hide panels.

---

## What this adds over WebApp1

| Feature | Description |
|---------|-------------|
| **Panel persistence** | Panel widths saved to `localStorage` keyed by `app_id`. Restored on next load. Collapsed state also persisted. |
| **Animated collapse** | Panels collapse/expand with a CSS `width` transition instead of instant `display:none`. A `collapsed` class on the panel root drives the animation. |
| **Collapse buttons** | `.collapse_btn_left()` / `.collapse_btn_right()` → header icon buttons that toggle and animate the panel. Arrows flip direction. |
| **Keyboard shortcuts** | Pass `left_key` / `right_key` options (e.g. `'ctrl+\\'`). WebApp2 calls `Keys.bind()` automatically. |

---

## Constructor options (adds to WebApp1)

```js
const webapp = new WebApp2({
    // All WebApp0 + WebApp1 options, plus:
    app_id:      'my-editor',   // key for localStorage (required for persistence)
    left_key:    'ctrl+\\',     // shortcut to toggle left panel
    right_key:   'ctrl+shift+\\', // shortcut to toggle right panel
    transition:  200,           // collapse animation ms (default 180)
});
```

---

## New methods

```js
// Toggle with animation — these do the right thing
webapp.toggle_left();   // was inherited (instant hide), now animated
webapp.toggle_right();

// Returns an icon button (already bound; just append to header)
const left_toggle = webapp.collapse_btn_left();   // → HTMLButtonElement
const right_toggle = webapp.collapse_btn_right();
webapp.header.el.prepend(left_toggle);
webapp.header_right.el.appendChild(right_toggle);
```

---

## CSS changes

Panels get `transition: width 180ms ease` and `overflow: hidden` during animation. A `.wa-panel-collapsed` class is toggled — this sets `width: 0`.

```css
.wa-panel { transition: width 180ms ease; overflow: hidden; }
.wa-panel.wa-panel-collapsed { width: 0 !important; padding: 0; border: none; }
.wa-resize-handle { transition: opacity 0.1s; }
.wa-resize-handle.hidden { opacity: 0; pointer-events: none; }
```

Resize handles fade out when their panel is collapsed, preventing the user from dragging a zero-width panel.

---

## Persistence design

```js
// Storage key per panel:
//   `wa:${app_id}:left_w`   → number (px)
//   `wa:${app_id}:right_w`  → number (px)
//   `wa:${app_id}:left_col` → 'true' | 'false'
//   `wa:${app_id}:right_col`→ 'true' | 'false'

// Saved: after every resize drag (debounced 300ms) + on collapse toggle
// Loaded: in constructor, before first render
```

Uses plain `localStorage` (no `LocalStorageSaver` — these are UI preferences, not domain data).

---

## Animated collapse detail

The tricky part: `display:none` can't be animated. The pattern:

1. On collapse: add `.wa-panel-collapsed` (width → 0), add `.hidden` to the adjacent resize handle.
2. After transition ends: set `overflow: hidden` (already set, so panel content is clipped at 0 width).
3. On expand: remove `.wa-panel-collapsed`, restore handle visibility.

The collapse button icon flips: `chevron_left` ↔ `chevron_right` for left panel, mirrored for right.

---

## Open questions

- **Should the collapse button live in the panel header or the app header?** App header is more standard (VS Code), but panel header (like Figma) keeps it self-contained. Current plan: app header via `.collapse_btn_left()` method, but consumer decides where to append it.
- **Double-click to reset width?** WebApp1's resize handle doesn't support this. Could add a `dblclick` handler on the handle that restores `default_width`. Worth adding here or in a patch to WebApp1?
- **Breakpoint collapse** — auto-collapse left panel when main area < N px? Useful for responsive tool apps. Could be WebApp3 or an opt-in flag here.
- **Multiple `app_id` instances on one page** — currently localStorage keys are keyed by `app_id`. If two WebApp2 instances share an `app_id`, they'll fight. Document this; don't solve it now.

---

## Implementation plan

1. Copy WebApp1 constructor signature, call `super(opts)`.
2. In constructor: read localStorage if `app_id` provided; apply stored widths/collapsed state.
3. Override `toggle_left()` / `toggle_right()` to animate + persist.
4. Override the `pointermove` handler in `_make_handle()` to debounce-persist width changes.
5. Add `collapse_btn_left()` / `collapse_btn_right()` returning bound `<button>` elements.
6. If `left_key` or `right_key` provided: import Keys and bind.

WebApp2.js should be under 120 lines by leaning on `super`.

---

## page.js plan

Same shell layout as WebApp1/page.js. Add:
- Collapse toggle buttons in the header
- A note in the status bar showing stored panel widths (to prove persistence is working)
- Keyboard shortcut display: `Ctrl+\` / `Ctrl+Shift+\` labels
- Resize, collapse, reload, confirm widths were restored
