export default class Item0 {
    constructor(opts = {}) {
        const { data, parent, saver } = opts;
        this.data = data || {};
        this.parent = parent || null;
        if (saver) this._saver = saver;
        this._dirty = {};
        this._save_timer = null;
    }

    get saver() {
        return this._saver ?? this.parent?.saver ?? null;
    }

    set saver(s) {
        this._saver = s;
    }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        if (this.data[key] === val) return this;
        this.data[key] = val;
        this._dirty[key] = val;
        return this;
    }

    save() {
        if (!this.saver) return;
        const keys = Object.keys(this._dirty);
        if (!keys.length) return;
        const patch = { ...this._dirty };
        this._dirty = {};  // clear BEFORE async send so mid-flight set()s aren't lost
        this.saver.save(this, patch);
    }

    auto_save(ms = 500) {
        clearTimeout(this._save_timer);
        this._save_timer = setTimeout(() => this.save(), ms);
        return this;
    }

    toJSON() {
        return this.data;
    }
}
