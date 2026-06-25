import Item0 from "../0/Item0.js";

export default class Item1 extends Item0 {
    constructor(...args) {
        super(...args);
        this.ready = this.load();
    }

    async load() {
        if (this.saver?.load) await this.saver.load(this);
        return this;
    }

    save() {
        if (!this.saver) return Promise.resolve();
        const keys = Object.keys(this._dirty);
        if (!keys.length) return Promise.resolve();
        const patch = { ...this._dirty };
        this._dirty = {};
        return Promise.resolve(this.saver.save(this, patch));
    }

    async delete() {
        if (this.saver?.delete) await this.saver.delete(this);
    }
}
