import Item1 from "../1/Item1.js";

export default class Item2 extends Item1 {
    constructor(...args) {
        super(...args);
        this.items = this.items || [];
    }

    add(...children) {
        for (const child of children) {
            child.parent = this;
            this.items.push(child);
        }
        return this;
    }

    remove(child) {
        const i = this.items.indexOf(child);
        if (i !== -1) {
            this.items.splice(i, 1);
            if (child.parent === this) delete child.parent;
        }
        return this;
    }

    toJSON() {
        return { ...this.data, items: this.items };
    }
}
