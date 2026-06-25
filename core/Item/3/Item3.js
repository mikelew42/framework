import Item2 from "../2/Item2.js";

export default class Item3 extends Item2 {
    get path() {
        if (!this.parent) return this.get('name') ?? 'root';
        const idx = this.parent.items?.indexOf(this) ?? '?';
        return `${this.parent.path}.${idx}`;
    }

    apply_server_delta(patch) {
        for (const [key, val] of Object.entries(patch)) {
            if (key in this._dirty) continue;
            this.data[key] = val;
        }
    }

    delta(patch) {
        return { jspath: this.path, patch: patch ?? { ...this._dirty }, ts: Date.now() };
    }
}
