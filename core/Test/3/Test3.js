import { View, div } from '/framework/core/View/View.js';
import App from '/framework/core/App/App.js';
import is from '../../util/is/is.js';

App.stylesheet(import.meta, 'Test3.css');

export default class Test3 {
    constructor(...args) {
        this.tests = [];
        this.results = [];
        this.assign(...args);
    }

    assign(...args) {
        return Object.assign(this, ...args);
    }

    get name() { return this._name ?? this.class?.name; }
    set name(v) { this._name = v; }

    // add(existingTest) or add("label", fn) or add(fn)
    add(arg, fn) {
        if (arg instanceof Test3) {
            this.tests.push(arg);
        } else {
            this.tests.push(new Test3({
                _name: typeof arg === 'string' ? arg : undefined,
                value: typeof arg === 'function' ? arg : fn
            }));
        }
        return this;
    }

    // run all fns, store results — no render
    run() {
        this.results = [];
        if (this.value) {
            Test3.set_captor(this);
            try { this.value(this); }
            catch(e) { this.fail(`Threw: ${e.message}`); }
            Test3.restore_captor();
        }
        for (const child of this.tests) child.run();
        return this;
    }

    assert(condition, message) {
        this.results.push({ pass: !!condition, message: message ?? String(condition) });
        return condition;
    }

    fail(message) {
        this.results.push({ pass: false, message });
        return this;
    }

    get passed() {
        if (this.results.some(r => !r.pass)) return false;
        return this.tests.every(t => t.passed);
    }

    get failed() { return !this.passed; }

    // print results to console — for Node / run-all.mjs
    report() {
        this._print(0);
        if (typeof process !== 'undefined' && this.failed) process.exitCode = 1;
        return this;
    }

    _print(depth) {
        const pad = '  '.repeat(depth);
        console.log(`${pad}${this.passed ? '✓' : '✗'} ${this.name ?? '(unnamed)'}`);
        for (const r of this.results)
            console.log(`${pad}  ${r.pass ? '·' : '✗'} ${r.message}`);
        for (const child of this.tests) child._print(depth + 1);
    }

    // run + render with View (browser, visual debugger)
    // each child fn runs synchronously, so breakpoints show partial state live
    render() {
        if (typeof window === 'undefined') return this;

        this.view = div.c('t3-test');
        View.set_captor(this.view);

        div.c('t3-name', this.name ?? '(unnamed)');

        if (this.value) {
            Test3.set_captor(this);
            try { this.value(this); }
            catch(e) { this.fail(`Threw: ${e.message}`); }
            Test3.restore_captor();

            for (const r of this.results)
                div.c('t3-assert ' + (r.pass ? 'pass' : 'fail'), r.message);
        }

        for (const child of this.tests) child.render();

        View.restore_captor();
        this.view.ac(this.passed ? 'pass' : 'fail');

        return this;
    }

    // run + compact one-line summary (browser)
    summarize() {
        if (typeof window === 'undefined') return this;
        const pass = this._count(true), total = this._count();
        div.c('t3-summary ' + (this.passed ? 'pass' : 'fail'),
            `${this.name ?? '(unnamed)'} — ${pass}/${total}`);
        return this;
    }

    _count(passing) {
        let n = passing === undefined
            ? this.results.length
            : this.results.filter(r => r.pass === passing).length;
        for (const child of this.tests) n += child._count(passing);
        return n;
    }
}

// Static captor — mirrors View.captor pattern
Object.assign(Test3, {
    captor: null,
    previous_captors: [],
    set_captor(t) {
        this.previous_captors.push(this.captor);
        this.captor = t;
    },
    restore_captor() {
        this.captor = this.previous_captors.pop();
    }
});

// test(Class)       — root test for a class; sets Test3.captor, returns it
// test("label", fn) — labeled child under current captor
// test(Class)          — sticky root for a class; sets captor for the file's lifetime
// test(Class, scope)   — scoped root; sets captor, runs scope(), restores captor
// test("label", scope) — scoped label root (when no captor exists)
// test("label", fn)    — child test with fn as test body (when captor is set)
// test(fn)             — unlabeled child test
// test("label")        — labeled child, or sticky label root if no captor
export function test(arg, fn) {
    // constructable → root test
    if (is.class(arg)) {
        const t = new Test3({ class: arg });
        Test3.set_captor(t);
        if (fn) try { fn(); } finally { Test3.restore_captor(); }
        return t;
    }

    const name = typeof arg === 'string' ? arg : undefined;

    // node context (no captors) + label + fn → scoped label root
    // fn is the scope body (populates children), NOT the test body
    if (!Test3.captor && !View.captor && name && fn) {
        const t = new Test3({ _name: name });
        Test3.set_captor(t);
        try { fn(); } finally { Test3.restore_captor(); }
        return t;
    }

    // child test — fn is the test body
    const child = new Test3({
        _name: name,
        value: typeof arg === 'function' ? arg : fn
    });
    if (Test3.captor) {
        Test3.captor.add(child);
    } else {
        Test3.set_captor(child);       // no captor → sticky label root
    }
    return child;
}

// global assert — routes to the currently running test
export function assert(condition, message) {
    return Test3.captor?.assert(condition, message);
}

export { Test3 };
