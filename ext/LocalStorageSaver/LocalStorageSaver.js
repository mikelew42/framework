export default class LocalStorageSaver {
    constructor(opts = {}) {
        Object.assign(this, opts);
    }

    load(item) {
        const raw = localStorage.getItem(this.key);
        item.data = raw ? JSON.parse(raw) : (item.data || {});
    }

    save(item, patch) {
        localStorage.setItem(this.key, JSON.stringify(item.data));
    }

    delete(item) {
        localStorage.removeItem(this.key);
    }
}
