import { View, div } from '/framework/core/View/View.js';
import App from '/framework/core/App/App.js';
import is from '../../util/is/is.js';

App.stylesheet(import.meta, 'Test3.css');

export default class Test3 {
    constructor(...args) {
        this.tests = [];
        this.results = [];
        this._running = false;
        Object.assign(this, ...args);
        this.initialize();
    }

    initialize() {
        if (!this.parent && this.capture !== false) Test3.captor?.add(this);

        // children auto_run if parent is auto_running, or is currently executing its fn
        if (this.parent) this.auto_run = !!(this.parent.auto_run || this.parent._running);
        else this.auto_run = !this.is_test_file();

        if (this.auto_run) {
            this._auto_ran = true;
            if (typeof window !== 'undefined') this.render();
            else this.run();
        }
        return this;
    }

    // Stack-trace check — only called for root tests (no parent).
    is_test_file() {
        return /\.(?:node\.)?test\.js/.test(new Error().stack);
    }

    get name() { return this._name ?? this.class?.name; }
    set name(v) { this._name = v; }

    add(arg, fn) {
        if (arg instanceof Test3) {
            this.tests.push(arg);
            arg.parent = this;
        } else {
            this.tests.push(new Test3({
                _name: is.str(arg) ? arg : undefined,
                value: fn ?? (is.fn(arg) ? arg : undefined),
                parent: this
            }));
        }
        return this;
    }

    run() {
        this.run_self();
        this.run_children();
        return this;
    }

    // Execute value fn with self as captor — children created here auto_run via _running flag.
    run_self() {
        this.results = [];
        if (!this.value) return;
        this._running = true;
        Test3.set_captor(this);
        try { this.value(this); }
        catch(e) { this.fail(`Threw: ${e.message}`); }
        Test3.restore_captor();
        this._running = false;
    }

    // Run any children that didn't already auto_run during run_self().
    run_children() {
        for (const child of this.tests)
            if (!child._auto_ran) child.run();
        return this;
    }

    assert(condition, message) {
        const r = { pass: !!condition, message: message ?? String(condition) };
        this.results.push(r);
        if (this.view) this.render_assertion(r);
        return condition;
    }

    render_assertion(r) {
        div.c('t3-assert ' + (r.pass ? 'pass' : 'fail'), r.message);
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

    // Idempotent — auto_run children call this from initialize() and set their view.
    // Explicit render (test files, page) calls this once on the root.
    render() {
        if (typeof window === 'undefined') return this;
        if (this.view) return this;
        this.view = div.c('t3-test', () => {
            div.c('t3-bar', this.name ?? '(unnamed)');
            div.c('t3-results', () => { this.run_self(); });
            div.c('t3-children', () => {
                for (const child of this.tests)
                    if (!child.view) child.render();
            });
        });
        this.view.ac(this.passed ? 'pass' : 'fail');
        return this;
    }

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

Object.assign(Test3, {
    captor: null,
    previous_captors: [],
    set_captor(t) { this.previous_captors.push(this.captor); this.captor = t; },
    restore_captor() { this.captor = this.previous_captors.pop(); }
});

// test(Class)                       — root for a class
// test("label", fn)                 — labeled test
// test(Class, InheritedTest, fn)    — variadic: pre-built tests run before own fn
export function test(arg, ...rest) {
    const fn    = rest.find(r => is.fn(r) && !is.class(r));
    const inherited = rest.filter(r => r instanceof Test3);
    return new Test3({
        class: is.class(arg) ? arg : undefined,
        _name: is.str(arg)   ? arg : undefined,
        value: fn ?? (!is.class(arg) && is.fn(arg) ? arg : undefined),
        tests: inherited  // available in tests[] before initialize() triggers auto_run
    });
}

export function assert(condition, message) {
    return Test3.captor?.assert(condition, message);
}

export { Test3 };
