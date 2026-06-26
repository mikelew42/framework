# WebEditor Demo

Pre-built layout demonstrating all v1 element types and features.
Open at: `http://localhost/framework/ext/WebEditor/demo/`

## What's in the demo

The canvas loads a realistic multi-section page layout:

| Section | Demonstrates |
|---------|-------------|
| **Hero** | Dark bg frame, H1 heading with tight tracking, badge frame, primary + ghost buttons |
| **Features** | Three-column card grid, H2/H3 headings, fill-width text, nested frames |
| **Divider** | Horizontal rule element |
| **Image + text** | Image placeholder (upload in props), H2, text, secondary button, row alignment |
| **Form** | Card frame with shadow, three inputs (text + email), submit button |
| **Shortcuts** | Dark section, three-column list using monospace font family |

## Things to try

1. **Select any element** — click it, inspect the Props panel on the right
2. **Inline edit** — double-click any heading, text, or button label to edit in-place
3. **Layers panel** — switch the left sidebar to "Layers" tab; click to select nodes
4. **Drag elements** — drag from the Elements tab to the canvas; drag nodes to reorder
5. **Right-click** — context menu on any canvas node (Duplicate, Wrap, Delete)
6. **Zoom** — Ctrl+= / Ctrl+− or the zoom bar at the bottom-right of the canvas
7. **Grid** — click the "Grid" button in the zoom bar for alignment dots
8. **Keyboard** — Ctrl+Z/Y (undo/redo), Ctrl+D (duplicate), Ctrl+G (wrap in frame), arrow keys (navigate tree)
9. **Image upload** — select the image placeholder, click "Upload" in the Props panel
10. **Font family** — select a text or heading node; Props panel has a Font section

## Notes

- Changes auto-save to `demo.json` after 1.5s of inactivity
- `demo.json` is the source of truth; edits persist across reloads
- To reset: delete `demo.json` or restore it from git (`git checkout -- demo.json`)
