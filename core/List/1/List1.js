import List0 from "../0/List0.js";

export default class List1 extends List0 {
    instantiate() {
        super.instantiate();
        this._listeners = {};
    }

    on(event, fn) {
        (this._listeners[event] ??= []).push(fn);
        return this;
    }

    off(event, fn) {
        const arr = this._listeners[event];
        if (arr) this._listeners[event] = arr.filter(l => l !== fn);
        return this;
    }

    emit(event, ...args) {
        this._listeners[event]?.forEach(fn => fn(...args));
        return this;
    }

    append(...items) {
        const start = this.children.length;
        super.append(...items);
        items.forEach((item, i) => this.emit('add', item, start + i));
        return this;
    }

    insert(child, index) {
        const idx = index ?? this.children.length;
        super.insert(child, idx);
        this.emit('add', child, idx);
        return this;
    }

    remove(child) {
        if (child) {
            const idx = this.children.indexOf(child);
            super.remove(child);
            if (idx !== -1) this.emit('remove', child, idx);
        } else {
            super.remove();
        }
        return this;
    }
}
