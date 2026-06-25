import Test0 from "../0/Test0.js";
import List0 from "../../List/0/List0.js";
import { View, details, summary, div } from "/framework/core/View/View.js";
import App from "/framework/core/App/App.js";

App.stylesheet(import.meta, "Test1.css");

export default class Test1 extends Test0 {
    constructor(...args) {
        super(...args);
        const existing = this.tests.children ?? [];
        this.tests = new Test1.List();
        existing.forEach(c => this.tests.append(c));
    }
}

class Test1List extends List0 {}
Test1List.View = null;

class Test1View extends View {
    get tag() { return 'details'; }

    initialize() {
        this.append(this.render);
    }

    render() {
        const passed = this.suite.passed;
        this.ac('t1-suite ' + (passed ? 'pass' : 'fail'));
        if (!passed) this.el.open = true;

        const pass_count = this.suite.results.filter(r => r.pass).length;
        const total      = this.suite.results.length;
        const count_str  = total ? ` (${pass_count}/${total})` : '';
        summary.c('t1-name', (this.suite.name || '(unnamed)') + count_str);

        this.suite.results.forEach(r =>
            div.c('t1-assert ' + (r.pass ? 'pass' : 'fail'), r.message)
        );
        this.suite.tests.each(child =>
            new Test1View({ suite: child }).render()
        );
    }
}

Test1.List = Test1List;
Test1.View = Test1View;
