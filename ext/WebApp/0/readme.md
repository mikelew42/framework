# WebApp0

Base three-panel shell. No domain logic — pure layout.

## Files

| File | Role |
|------|------|
| `WebApp0.js` | Shell: header + left + main + right |
| `page.js` | Demo: all ui controls + tabs in a real layout |

## What it does

- Full-viewport layout: header bar (48px) + three panels below
- Left / right panels: fixed-width, scrollable, flex column
- Main: flex-grow, overflow auto, position relative (for absolutely positioned canvases)
- Header: logo+icon | separator | [toolbar buttons] | spacer | [right actions]

## What it doesn't do

- No domain data — consumers bring their own Items/Lists
- No routing — consumers handle navigation
- No keyboard shortcuts — consumers add their own

## Open questions

- Should panels support animated resize? (draggable divider)
- Should there be a bottom status bar panel?
