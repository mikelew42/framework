import app, { el, div, h1, assert } from "/app.js";
import mixin from "/framework/core/mixin/mixin.js";

div.c("page", () => {
    h1("Mixin (util compat)");

    // old page kept for compat — actual tests live in /framework/core/mixin/page.js

    class A { methodA(){ return "A"; } }
    class B { methodB(){ return "B"; } }

    el("div", () => {
        class Combo extends mixin(A, B){
            method(){ return this.methodA() + " " + this.methodB(); }
        }
        assert(new Combo().method() === "A B");
    });
});
