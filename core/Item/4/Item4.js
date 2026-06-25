import Item3 from "../3/Item3.js";
import List1 from "../../List/1/List1.js";

export default class Item4 extends Item3 {
    constructor(...args) {
        super(...args);
        // Item2/3 may have set this.items = [] via their constructors — migrate those first.
        const existing = Array.isArray(this.items) ? this.items : [];
        this.items = new Item4.List({ item: this });
        existing.forEach(c => this.add(c));
    }

    add(...children) {
        for (const child of children) {
            child.parent = this;
            this.items.append(child);
        }
        return this;
    }

    remove(child) {
        if (child === undefined) {
            if (this.parent) this.parent.remove(this);
            return this;
        }
        this.items.remove(child);
        if (child.parent === this) delete child.parent;
        return this;
    }

    toJSON() {
        return { ...this.data, items: this.items.children };
    }
}

// adopt() is a no-op: Item4.add() sets child.parent to the Item4, not the List.
// If List1 set child.parent = list, saver inheritance would break (list has no saver).
class Item4List extends List1 {
    adopt(child) {
        return this;
    }
}

Item4.List = Item4List;
