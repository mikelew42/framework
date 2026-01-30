import View from "./View.js";

// Global shared structures
const resizeHandlers = new WeakMap(); // Map<Element, Set<Callback>>

const elementToView = new WeakMap();

const sharedObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const callbacks = resizeHandlers.get(entry.target);
    const view = elementToView.get(entry.target);
    if (callbacks) {
      // Pass the entry to the callback
      callbacks.forEach((cb) => cb(view, entry));
    }
  }
});

// API:
// resize(cb)        -> Add listener
// resize(false)     -> Remove ALL listeners (teardown)
// resize(cb, false) -> Remove SPECIFIC listener
View.prototype.resize = function(callback, shouldAdd = true){
    
    // CASE 1: Teardown all (resize(false))
    if (callback === false) {
      this._teardownResize();
      return;
    }

    // CASE 2: Remove specific (resize(cb, false))
    if (shouldAdd === false) {
      const callbacks = resizeHandlers.get(this.el);
      if (callbacks) {
        callbacks.delete(callback);
        // If that was the last one, stop observing entirely
        if (callbacks.size === 0) {
          this._teardownResize();
        }
      }
      return;
    }

    // CASE 3: Add Listener (resize(cb))
    let callbacks = resizeHandlers.get(this.el);
    
    // If we aren't tracking this element yet, start now
    if (!callbacks) {
      callbacks = new Set();
      resizeHandlers.set(this.el, callbacks);
      sharedObserver.observe(this.el);

      // Register this view instance in our lookup map
      elementToView.set(this.el, this);
    }

    callbacks.add(callback);
};

  // Helper to clean up the WeakMap and unobserve
View.prototype._teardownResize = function() {
    // Only unobserve if we were actually observing
    if (resizeHandlers.has(this.el)) {
      sharedObserver.unobserve(this.el);
      resizeHandlers.delete(this.el);
      elementToView.delete(this.el); // Clean up the view reference
    }
};