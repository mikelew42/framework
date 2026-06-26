import mixin from './mixin.js';
import Test0 from '../Test/0/Test0.js';

mixin.test = new Test0({ _name: "mixin" });

mixin.test
    .add("basic method composition", t => {
        class One { greet() { return "one"; } }
        class Two { greet() { return "two"; } }
        class Three { greet() { return "three"; } }

        class Thing extends mixin(Three, Two, One) {}
        t.assert(new Thing().greet() === "three", "first arg (Three) wins");
    })
    .add("methods from all sources available", t => {
        class A { a() { return "a"; } }
        class B { b() { return "b"; } }
        class C { c() { return "c"; } }

        class Thing extends mixin(A, B, C) {}
        const obj = new Thing();
        t.assert(obj.a() === "a", "a()");
        t.assert(obj.b() === "b", "b()");
        t.assert(obj.c() === "c", "c()");
    })
    .add("last arg is the base class", t => {
        class Base { base() { return "base"; } }
        class Extra { extra() { return "extra"; } }

        class Thing extends mixin(Extra, Base) {}
        t.assert(new Thing().base() === "base", "base method available");
        t.assert(new Thing().extra() === "extra", "mixed-in method available");
        t.assert(new Thing() instanceof Base, "instanceof Base");
    })
    .add("priority: first arg overrides later args", t => {
        class Low  { val() { return "low"; } }
        class Mid  { val() { return "mid"; } }
        class High { val() { return "high"; } }

        class Thing extends mixin(High, Mid, Low) {}
        t.assert(new Thing().val() === "high", "High (first) wins over Mid and Low");
    })
    .add("static members are copied", t => {
        class A { static type = "A"; }
        class B { static type = "B"; }

        class Thing extends mixin(A, B) {}
        t.assert(Thing.type === "A", "first arg static wins");
    })
    .add("subclass can override mixed methods", t => {
        class A { method() { return "A"; } }
        class B { method() { return "B"; } }

        class Thing extends mixin(A, B) {
            method() { return "Thing"; }
        }
        t.assert(new Thing().method() === "Thing", "own method wins over mixin");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await mixin.test.run();
    mixin.test.print();
}

export default mixin;
