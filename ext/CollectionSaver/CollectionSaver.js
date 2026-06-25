import Socket from "/framework/ext/Socket/Socket.js";
import Item9 from "/framework/core/Item/9/Item9.js";

const socket = Socket.singleton();

export default class CollectionSaver {
    constructor(opts = {}) {
        Object.assign(this, opts);
        this.item_class = this.item_class ?? Item9;
        this._saving = false;
        this._pending_list = null;
    }

    async load(list) {
        const res = await fetch(this.path);
        if (!res.ok) return;
        const arr = await res.json();
        if (!Array.isArray(arr)) return;
        arr.forEach(data => {
            const item = new this.item_class({ data });
            list.append(item);
        });
    }

    save(list) {
        if (this._saving) {
            this._pending_list = list;
            return this._promise;
        }
        this._saving = true;
        this._promise = this._write(list).finally(() => {
            this._saving = false;
            if (this._pending_list) {
                const pending = this._pending_list;
                this._pending_list = null;
                this.save(pending);
            }
        });
        return this._promise;
    }

    async _write(list) {
        const arr = list.children.map(item =>
            typeof item.toJSON === 'function' ? item.toJSON() : (item.data ?? item)
        );
        await socket.async_rpc("write", this.path, JSON.stringify(arr, null, 2));
    }

    async delete() {
        await socket.async_rpc("rm", this.path);
    }
}
