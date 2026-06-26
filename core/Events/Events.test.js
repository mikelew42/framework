import Events from './Events.js';
import Test0 from '../Test/0/Test0.js';

Events.test = new Test0({ class: Events });

Events.test
    // --- instance ---
    .add("instance on/emit", t => {
        const e = new Events();
        let got;
        e.on("ping", v => got = v);
        e.emit("ping", 42);
        t.assert(got === 42, "listener receives value");
    })
    .add("instance off removes listener", t => {
        const e = new Events();
        let count = 0;
        const fn = () => count++;
        e.on("x", fn);
        e.off("x", fn);
        e.emit("x");
        t.assert(count === 0, "listener not called after off");
    })
    .add("instance once fires exactly once", t => {
        const e = new Events();
        let count = 0;
        e.once("x", () => count++);
        e.emit("x");
        e.emit("x");
        t.assert(count === 1, "once fires exactly once");
    })
    .add("instance clear removes all listeners for event", t => {
        const e = new Events();
        let count = 0;
        e.on("x", () => count++);
        e.on("x", () => count++);
        e.clear("x");
        e.emit("x");
        t.assert(count === 0, "all listeners cleared");
    })
    .add("instance events isolated between instances", t => {
        const a = new Events();
        const b = new Events();
        let got_a = 0, got_b = 0;
        a.on("x", () => got_a++);
        b.on("x", () => got_b++);
        a.emit("x");
        t.assert(got_a === 1, "a listener fired");
        t.assert(got_b === 0, "b listener not fired");
    })

    // --- static ---
    .add("static on/emit", t => {
        class Foo extends Events {}
        let got;
        Foo.on("ping", v => got = v);
        Foo.emit("ping", 99);
        t.assert(got === 99, "static listener receives value");
        Foo.clear("ping");
    })
    .add("static events isolated between subclasses", t => {
        class A extends Events {}
        class B extends Events {}
        let a_count = 0, b_count = 0;
        A.on("tick", () => a_count++);
        B.on("tick", () => b_count++);
        A.emit("tick");
        t.assert(a_count === 1, "A listener fired");
        t.assert(b_count === 0, "B listener not fired by A.emit");
        A.clear("tick");
        B.clear("tick");
    })
    .add("static events don't leak to base Events class", t => {
        class Child extends Events {}
        let base_count = 0;
        Events.on("leak", () => base_count++);
        Child.emit("leak");
        t.assert(base_count === 0, "base Events not triggered by Child.emit");
        Events.clear("leak");
    })
    .add("static once fires exactly once", t => {
        class Foo extends Events {}
        let count = 0;
        Foo.once("x", () => count++);
        Foo.emit("x");
        Foo.emit("x");
        t.assert(count === 1, "static once fires exactly once");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await Events.test.run();
    Events.test.print();
}

export default Events;
