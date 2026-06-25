import Item5 from "../5/Item5.js";

export default class Item6 extends Item5 {
    once(event, fn) {
        const wrapper = (...args) => {
            fn(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
        return this;
    }

    async save() {
        const result = await super.save();
        this.emit('save');
        return result;
    }

    // Queues 'change' events during a batch. Uses Map so only the net change per key
    // is emitted — intermediate values are dropped, original 'old' is preserved.
    emit(event, ...args) {
        if (this._batching && event === 'change') {
            const [key, val, old] = args;
            if (!this._queued_changes.has(key)) {
                this._queued_changes.set(key, { val, old });  // keep original old
            } else {
                this._queued_changes.get(key).val = val;       // update final val only
            }
            return this;
        }
        return super.emit(event, ...args);
    }

    batch(fn) {
        if (this._batching) {
            fn();
            return this;
        }
        this._batching = true;
        this._queued_changes = new Map();
        try {
            fn();
        } finally {
            this._batching = false;
            const changes = this._queued_changes;
            this._queued_changes = null;
            changes.forEach(({ val, old }, key) => super.emit('change', key, val, old));
        }
        return this;
    }
}
