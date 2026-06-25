import Item6 from "../6/Item6.js";

export default class Item7 extends Item6 {
    constructor(...args) {
        super(...args);
        this._computes = [];
    }

    compute(key, deps, fn) {
        this._computes.push({ key, deps, fn });
        this.data[key] = fn(...deps.map(d => this.data[d]));
        return this;
    }

    set(key, val) {
        const pre = {};
        for (const { key: ckey } of this._computes) pre[ckey] = this.data[ckey];

        super.set(key, val);

        for (const { key: ckey, deps, fn } of this._computes) {
            if (!deps.includes(key)) continue;
            const newVal = fn(...deps.map(d => this.data[d]));
            if (newVal !== pre[ckey]) {
                this.data[ckey] = newVal;
                // this.emit instead of direct listeners — respects batch() in Item6
                this.emit('change', ckey, newVal, pre[ckey]);
            }
        }
        return this;
    }
}
