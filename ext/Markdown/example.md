# Markdown Renderer Demo

Welcome to the **Markdown Renderer**! This component allows you to easily render markdown content within the custom framework.

## Features
- Fetches `.md` files asynchronously.
- Renders directly to `View.el`.
- Uses `marked` from a CDN (ESM).

## Code Example
```javascript
new Markdown({ file: "example.md" }).render();
```

### Lists
1. Support for ordered lists
2. And unordered ones:
   - Nested items
   - Bold **text**
   - Italics *text*

### Quotes
> "Simplicity is the soul of efficiency." - Austin Freeman
