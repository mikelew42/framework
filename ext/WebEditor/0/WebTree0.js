import Item9 from '/framework/core/Item/9/Item9.js';

let _uid_counter = 0;

export default class WebTree0 extends Item9 {
    constructor(...args) {
        super(...args);
        if (!this.data.tree) {
            this.data.tree = WebTree0.new_frame({
                id: 'root',
                label: 'Page',
                w: { mode: 'fill' },
                h: { mode: 'hug' },
            });
        }
        if (this.data.selected === undefined) {
            this.data.selected = null;
        }
    }

    // --- static helpers ---

    static uid() {
        return 'n' + Date.now().toString(36) + (++_uid_counter).toString(36);
    }

    static new_frame(extra) {
        return Object.assign({
            id: WebTree0.uid(),
            kind: 'frame',
            label: 'Frame',
            w: { mode: 'hug' },
            h: { mode: 'hug' },
            dir: 'col',
            gap: 16,
            pad: 16,
            bg: 'transparent',
            radius: 0,
            children: [],
        }, extra || {});
    }

    static new_text(extra) {
        return Object.assign({
            id: WebTree0.uid(),
            kind: 'text',
            label: 'Text',
            text: 'Hello',
            size: 16,
            weight: 400,
            color: '#1b1b19',
            w: { mode: 'hug' },
            h: { mode: 'hug' },
        }, extra || {});
    }

    static clone(node) {
        return JSON.parse(JSON.stringify(node));
    }

    static walk(node, fn, parent = null) {
        fn(node, parent);
        if (node.children) node.children.forEach(c => WebTree0.walk(c, fn, node));
    }

    static find(root, id) {
        let found = null;
        WebTree0.walk(root, n => { if (n.id === id) found = n; });
        return found;
    }

    static parent_of(root, id) {
        let found = null;
        WebTree0.walk(root, (n, p) => { if (n.id === id) found = p; });
        return found;
    }

    // --- instance methods ---

    select(id) {
        const old = this.data.selected;
        this.data.selected = id;
        this.emit('change', 'selected', id, old);
    }

    insert(node, parent_id, index) {
        const tree = WebTree0.clone(this.data.tree);
        const parent = WebTree0.find(tree, parent_id);
        if (!parent || !parent.children) return this;
        const i = index == null ? parent.children.length : Math.max(0, Math.min(parent.children.length, index));
        parent.children.splice(i, 0, node);
        this.set('tree', tree);
        return this;
    }

    remove(id) {
        if (id === 'root') return this;
        const tree = WebTree0.clone(this.data.tree);
        const parent = WebTree0.parent_of(tree, id);
        if (!parent) return this;
        parent.children = parent.children.filter(c => c.id !== id);
        this.set('tree', tree);
        return this;
    }

    move(id, parent_id, index) {
        if (id === 'root' || id === parent_id) return this;
        const tree = WebTree0.clone(this.data.tree);
        const moving = WebTree0.find(tree, id);
        if (!moving) return this;
        // prevent dropping into own descendant
        let is_descendant = false;
        WebTree0.walk(moving, n => { if (n.id === parent_id) is_descendant = true; });
        if (is_descendant) return this;
        const old_parent = WebTree0.parent_of(tree, id);
        if (!old_parent) return this;
        const from = old_parent.children.findIndex(c => c.id === id);
        const new_parent = WebTree0.find(tree, parent_id);
        if (!new_parent || !new_parent.children) return this;
        let to = index == null ? new_parent.children.length : index;
        const [item] = old_parent.children.splice(from, 1);
        if (old_parent === new_parent && from < to) to--;
        to = Math.max(0, Math.min(new_parent.children.length, to));
        new_parent.children.splice(to, 0, item);
        this.set('tree', tree);
        return this;
    }

    update(id, patch) {
        const tree = WebTree0.clone(this.data.tree);
        const node = WebTree0.find(tree, id);
        if (!node) return this;
        Object.assign(node, patch);
        this.set('tree', tree);
        return this;
    }

    set_mode(id, dim, mode, px) {
        const tree = WebTree0.clone(this.data.tree);
        const node = WebTree0.find(tree, id);
        if (!node) return this;
        node[dim] = { mode };
        if (mode === 'fixed' && px != null) node[dim].px = px;
        this.set('tree', tree);
        return this;
    }
}
