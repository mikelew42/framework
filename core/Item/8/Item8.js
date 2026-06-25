import Item7 from "../7/Item7.js";

const COERCE = {
    Number:  v => { const n = Number(v); if (isNaN(n)) throw new TypeError(`expected number, got: ${v}`); return n; },
    String:  v => String(v),
    Boolean: v => {
        if (typeof v === 'boolean') return v;
        if (v === 'true')  return true;
        if (v === 'false') return false;
        throw new TypeError(`expected boolean, got: ${v}`);
    },
    Array:   v => { if (!Array.isArray(v)) throw new TypeError(`expected array, got: ${typeof v}`); return v; },
    Object:  v => { if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new TypeError(`expected object, got: ${typeof v}`); return v; },
};

export default class Item8 extends Item7 {
    constructor(...args) {
        super(...args);
        this._schema = {};
    }

    schema(def) {
        for (const [key, type] of Object.entries(def)) {
            // Built-in types (Number, String, etc.) resolve via COERCE by name;
            // any other function is treated as a custom coercer.
            const fn = typeof type === 'function' && !COERCE[type.name]
                ? type
                : COERCE[type.name] ?? null;
            if (!fn) throw new Error(`Unknown schema type for key "${key}": ${type}`);
            this._schema[key] = fn;
        }
        return this;
    }

    set(key, val) {
        const coerce = this._schema[key];
        if (coerce) {
            try {
                val = coerce(val);
            } catch (err) {
                this.emit('error', key, val, err);
                return this;
            }
        }
        return super.set(key, val);
    }
}
