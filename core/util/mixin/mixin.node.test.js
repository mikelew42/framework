import mixin from './mixin.js';
import { test, assert } from '../../Test/3/Test3.js';

export default mixin.test = test("mixin");

test("first arg wins on method conflict", () => {
    class One { greet() { return "one"; } }
    class Two { greet() { return "two"; } }
    class Three { greet() { return "three"; } }
    class Thing extends mixin(Three, Two, One) {}
    assert(new Thing().greet() === "three", "Three (first) wins");
});

test("methods from all sources available", () => {
    class A { a() { return "a"; } }
    class B { b() { return "b"; } }
    class C { c() { return "c"; } }
    class Thing extends mixin(A, B, C) {}
    const obj = new Thing();
    assert(obj.a() === "a", "a()");
    assert(obj.b() === "b", "b()");
    assert(obj.c() === "c", "c()");
});

test("last arg is the base class", () => {
    class Base { base() { return "base"; } }
    class Extra { extra() { return "extra"; } }
    class Thing extends mixin(Extra, Base) {}
    assert(new Thing().base() === "base",   "base method available");
    assert(new Thing().extra() === "extra", "mixed-in method available");
    assert(new Thing() instanceof Base,     "instanceof Base");
});

test("priority: first arg overrides later", () => {
    class Low  { val() { return "low"; } }
    class Mid  { val() { return "mid"; } }
    class High { val() { return "high"; } }
    class Thing extends mixin(High, Mid, Low) {}
    assert(new Thing().val() === "high", "High (first) wins");
});

test("static members copied, first wins", () => {
    class A { static type = "A"; }
    class B { static type = "B"; }
    class Thing extends mixin(A, B) {}
    assert(Thing.type === "A", "first arg static wins");
});

test("subclass can override mixed methods", () => {
    class A { method() { return "A"; } }
    class B { method() { return "B"; } }
    class Thing extends mixin(A, B) {
        method() { return "Thing"; }
    }
    assert(new Thing().method() === "Thing", "own method wins over mixin");
});

test("single class — passthrough", () => {
    class Base { val() { return 1; } }
    class Thing extends mixin(Base) {}
    assert(new Thing().val() === 1, "works with one class");
    assert(new Thing() instanceof Base, "instanceof Base");
});

test("getter/setter copied from mixin", () => {
    class HasGetter {
        get doubled() { return this._x * 2; }
        set doubled(v) { this._x = v / 2; }
    }
    class Thing extends mixin(HasGetter, class {}) {}
    const obj = new Thing();
    obj.doubled = 10;
    assert(obj.doubled === 10, "getter/setter round-trips");
    assert(obj._x === 5, "setter stored half");
});
