import Item8 from "../8/Item8.js";

export default class Item9 extends Item8 {
    constructor(...args) {
        super(...args);
        this._history = [];
        this._future  = [];
    }

    checkpoint() {
        this._history.push(this._deep_clone(this.data));
        this._future = [];  // new checkpoint clears redo stack
        return this;
    }

    // JSON round-trip instead of shallow copy — handles nested objects and arrays.
    _deep_clone(data) {
        try { return JSON.parse(JSON.stringify(data)); } catch { return { ...data }; }
    }

    async save() {
        this.checkpoint();
        return super.save();
    }

    get can_undo() { return this._history.length > 0; }
    get can_redo() { return this._future.length > 0; }

    undo() {
        if (!this._history.length) return this;
        this._future.push(this._deep_clone(this.data));
        this._restore(this._history.pop());
        this.emit('undo');
        return this;
    }

    redo() {
        if (!this._future.length) return this;
        this._history.push(this._deep_clone(this.data));
        this._restore(this._future.pop());
        this.emit('redo');
        return this;
    }

    // Bypasses schema coercion — values were already valid when snapshotted.
    _restore(snapshot) {
        const current = this.data;
        const all_keys = new Set([...Object.keys(current), ...Object.keys(snapshot)]);
        this.batch(() => {
            for (const key of all_keys) {
                const old_val = current[key];
                const new_val = snapshot[key];
                if (old_val !== new_val) {
                    this.data[key] = new_val;
                    this.emit('change', key, new_val, old_val);
                }
            }
        });
    }
}
