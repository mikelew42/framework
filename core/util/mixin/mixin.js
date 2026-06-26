// mixin(...classes) — compose multiple classes into one.
// Last class is the base (extended). Earlier classes override it, first wins.
// Usage: class Thing extends mixin(Three, Two, One) {}

function mixin(...classes) {
    const Base = classes[classes.length - 1];
    const sources = classes.slice(0, -1).reverse();

    class Mixed extends Base {}

    for (const source of sources) {
        for (const prop of Object.getOwnPropertyNames(source.prototype)) {
            if (prop === "constructor") continue;
            Object.defineProperty(
                Mixed.prototype,
                prop,
                Object.getOwnPropertyDescriptor(source.prototype, prop)
            );
        }
        for (const prop of Object.getOwnPropertyNames(source)) {
            if (prop === "prototype" || prop === "name" || prop === "length") continue;
            Object.defineProperty(
                Mixed,
                prop,
                Object.getOwnPropertyDescriptor(source, prop)
            );
        }
    }

    return Mixed;
}

export default mixin;
export { mixin };
