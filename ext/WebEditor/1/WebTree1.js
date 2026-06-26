import WebTree0 from '../0/WebTree0.js';

// WebTree1 — extends WebTree0 with new node kinds:
//   image, heading, button, divider, input, columns (pre-built 2-col frame)
// Also adds: duplicate(id) instance method

export default class WebTree1 extends WebTree0 {

    // --- new static factories ---

    static new_input(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'input',
            label: 'Input',
            placeholder: 'Enter text…',
            input_type: 'text',  // 'text' | 'email' | 'number' | 'password'
            radius: 6,
            w: { mode: 'fill' },
            h: { mode: 'hug' },
        }, extra || {});
    }

    static new_image(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'image',
            label: 'Image',
            w: { mode: 'fill' },
            h: { mode: 'fixed', px: 200 },
            radius: 0,
            fit: 'cover',
            src: null,
        }, extra || {});
    }

    static new_heading(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'heading',
            label: 'Heading',
            text: 'Heading',
            level: 1,            // 1 | 2 | 3
            size: 32,
            weight: 700,
            color: '#1b1b19',
            w: { mode: 'hug' },
            h: { mode: 'hug' },
        }, extra || {});
    }

    static new_button(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'button',
            label: 'Button',
            text: 'Button',
            variant: 'primary',  // 'primary' | 'secondary' | 'ghost'
            radius: 8,
            w: { mode: 'hug' },
            h: { mode: 'hug' },
        }, extra || {});
    }

    static new_divider(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'divider',
            label: 'Divider',
            color: '#ececea',
            w: { mode: 'fill' },
            h: { mode: 'fixed', px: 1 },
        }, extra || {});
    }

    // --- instance methods ---

    // Wrap the selected node in a new frame, inserted at the same position.
    // The original node becomes the only child of the new frame.
    // Returns the new frame node so the caller can select it.
    wrap_in_frame(id) {
        if (!id || id === 'root') return null;
        const tree = WebTree1.clone(this.data.tree);
        const node = WebTree1.find(tree, id);
        if (!node) return null;
        const parent = WebTree1.parent_of(tree, id);
        if (!parent) return null;
        const idx = parent.children.findIndex(c => c.id === id);

        // Create a wrapper frame that inherits the node's sizing
        const wrapper = WebTree1.new_frame({
            label: 'Frame',
            w: { ...node.w },
            h: { ...node.h },
            children: [node],
        });
        // The wrapped node fills its new parent
        node.w = { mode: 'fill' };
        node.h = { mode: 'fill' };

        parent.children.splice(idx, 1, wrapper);
        this.set('tree', tree);
        return wrapper;
    }

    // Clone the selected node and insert it right after the original
    duplicate(id) {
        if (!id || id === 'root') return this;
        const tree = WebTree1.clone(this.data.tree);
        const node = WebTree1.find(tree, id);
        if (!node) return this;
        const parent = WebTree1.parent_of(tree, id);
        if (!parent) return this;
        const idx = parent.children.findIndex(c => c.id === id);
        const copy = WebTree1.clone(node);
        // Re-assign all ids in the clone to avoid collisions
        WebTree1.walk(copy, n => { n.id = WebTree1.uid(); });
        parent.children.splice(idx + 1, 0, copy);
        this.set('tree', tree);
        return copy; // return the clone so callers can select it
    }

    // Creates a 2-column row frame with two fill-width child frames
    static new_columns(extra) {
        return Object.assign({
            id: WebTree1.uid(),
            kind: 'frame',
            label: 'Columns',
            w: { mode: 'fill' },
            h: { mode: 'hug' },
            dir: 'row',
            gap: 16,
            pad: 0,
            bg: 'transparent',
            radius: 0,
            children: [
                WebTree1.new_frame({ label: 'Column', w: { mode: 'fill' }, h: { mode: 'hug' } }),
                WebTree1.new_frame({ label: 'Column', w: { mode: 'fill' }, h: { mode: 'hug' } }),
            ],
        }, extra || {});
    }
}
