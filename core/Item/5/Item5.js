import Item4 from "../4/Item4.js";

export default class Item5 extends Item4 {
    constructor(...args) {
        super(...args);
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

    set(key, val) {
        const old = this.data[key];
        super.set(key, val);
        if (this.data[key] !== old) this.emit('change', key, val, old);
        return this;
    }
}
