# Dum Components

Placeholder components for rapid prototyping.

## Creating New Components

### Rules

1. **Minimal styling** - Gray/neutral only, no design opinions
2. **Progressive adaptability** - Work for all use cases, simple to complex
3. **CSS classes as interface** - Use `.c("class")` modifier, not options objects
4. **Append `...args`** - Allow content to be passed in
5. **Return the view** - Enable chaining

### Template

```js
import { View } from "/framework/core/View/View.js";

function thing(...args) {
	return new View()
		.ac("dum dum-thing")
		.append(...args);
}

thing.c = function(classes, ...args) {
	return thing(...args).ac(classes);
};

export { thing };
export default thing;
```

### Usage Pattern

```js
thing()                      // basic
thing.c("modifier")          // with class
thing("content")             // with content
thing.c("mod", "content")    // both
thing().attr("width", "200") // chainable
```
