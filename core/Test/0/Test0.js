// Node-compatible — no View/DOM imports.
// Rendering is handled by Test1+.

export default class Test0 {
    constructor(...args) {
        this.results = [];
        this.tests = new Test0.List();
        this.assign(...args);
    }

    assign(...args) {
        return Object.assign(this, ...args);
    }

    get name() {
        return this._name ?? this.class?.name;
    }

    set name(v) { this._name = v; }

    // add(name, fn)      — add a named leaf test
    // add(other_test)    — add a whole Test0 suite as a child
    add(name, fn) {
        if (name instanceof Test0) {
            this.tests.append(name);
        } else {
            this.tests.append(new Test0({ _name: name, value: fn }));
        }
        return this;
    }

    // args are passed as second argument to each test function.
    // Use to swap out the class under test:
    //   Item0.test.run({ Item: Item1 })
    async run(args) {
        this.results = [];
        if (this.value) {
            try {
                await this.value(this, args ?? {});
            } catch(e) {
                this.fail(`Threw: ${e.message}`);
            }
        }
        for (const child of this.tests.children) {
            await child.run(args);
        }
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
        let ok = true;
        this.tests.each(child => { if (!child.passed) ok = false; });
        return ok;
    }

    get failed() { return !this.passed; }

    // Flat array of all failing leaf results, with test name context.
    get failures() {
        const out = [];
        this._collect_failures(out, []);
        return out;
    }

    _collect_failures(out, path) {
        const here = [...path, this.name];
        this.results.forEach(r => { if (!r.pass) out.push({ path: here, message: r.message }); });
        this.tests.each(child => child._collect_failures(out, here));
    }

    // Human-readable summary, works in Node (console) or as a string.
    summary(depth = 0) {
        const indent = '  '.repeat(depth);
        const icon = this.passed ? '✓' : '✗';
        const lines = [`${indent}${icon} ${this.name}`];
        this.results.forEach(r => {
            lines.push(`${indent}  ${r.pass ? '·' : '✗'} ${r.message}`);
        });
        this.tests.each(child => lines.push(child.summary(depth + 1)));
        return lines.join('\n');
    }

    print() {
        console.log(this.summary());
        if (typeof process !== 'undefined' && this.failed) process.exitCode = 1;
        return this;
    }
}

// Minimal list — no View imports so Test0 stays Node-runnable.
// Upgraded to a real List0 subclass in Test1.
class Test0List {
    constructor() { this.children = []; }

    append(child) {
        this.children.push(child);
        return this;
    }

    each(fn) {
        for (let i = 0; i < this.children.length; i++) fn(this.children[i], i);
        return this;
    }

    get length() { return this.children.length; }
}

Test0.List = Test0List;
