import Item9 from '/framework/core/Item/9/Item9.js';
import FileSaver from '/framework/ext/Saver/FileSaver/FileSaver.js';

export default class Store {
    constructor(opts = {}) {
        this.dir = opts.dir ?? '/data/';
        this.item_class = opts.item_class ?? Item9;
        this._registry = new Map();
    }

    item(name, ItemClass = this.item_class) {
        if (this._registry.has(name)) return this._registry.get(name);
        const path = this.dir.replace(/\/?$/, '/') + name + '.json';
        const instance = new ItemClass({ saver: new FileSaver({ path }) });
        this._registry.set(name, instance);
        return instance;
    }

    async load_all() {
        return Promise.all([...this._registry.values()].map(i => i.load()));
    }

    async save_all() {
        return Promise.all([...this._registry.values()].map(i => i.save()));
    }

    get names() { return [...this._registry.keys()]; }
}
