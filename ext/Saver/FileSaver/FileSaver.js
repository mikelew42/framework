import Socket from "../../Socket/Socket.js";

const socket = Socket.singleton();

// Phase 1: save() writes the full item.data snapshot. The patch argument is
// received but intentionally ignored — delta writes are a Phase 2 concern.
export default class FileSaver {
    constructor(opts = {}) {
        Object.assign(this, opts);
    }

    async load(item) {
        const response = await fetch(this.path);
        if (response.ok) {
            item.data = await response.json();
        } else {
            item.data = item.data || {};
        }
    }

    save(item, patch) {
        // Debounce: if a write is in flight, queue one more write for when it
        // finishes. Callers further behind collapse into that one queued write.
        if (this._saving) {
            this._pending = true;
            return this._promise;
        }
        this._saving = true;
        this._promise = this._write(item).finally(() => {
            this._saving = false;
            if (this._pending) {
                this._pending = false;
                this.save(item, {});
            }
        });
        return this._promise;
    }

    async _write(item) {
        const payload = typeof item.toJSON === 'function' ? item.toJSON() : item.data;
        await socket.async_rpc("write", this.path, JSON.stringify(payload, null, 2));
    }

    async delete(item) {
        await socket.async_rpc("rm", this.path);
    }
}
