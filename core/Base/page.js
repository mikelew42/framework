import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "../../../app.js";

Test.controls();


test("create an instance", t => {

    const base = new Base();

});


test("create an instance with overrides", t => {

    // Object properties are assigned to the instance, see Base.js line 7, 13
    const base = new Base({
        test: "test",
        method(){
            console.log("this is method()");
        }
    });

    base.method();
});


test("extend the class", t => {

    class Test extends Base {

        // constructor(){} // don't override constructor, see instantiate.md

        // instantiate(){}  // instantiate is the constructor, see instantiate.md, Base.js

        initialize(){
            // an emtpy method that is automatically called upon instantiation.
            // try to leave this empty if you want to extend the class again?
            console.log("called automatically");
        }

    }

    const test = new Test(); // initialize is "called automatically"

});

/**
 * You CAN override initialize() via new Base({ initialize(){} });
 * You CANNOT override instantiate() via new Base({ instantiate() {} });
 * 
 * Also, providing examples of basic JavaScript principles:
 * - how this works: initialize(){ this? } vs initialize: () => { this? }
 * - extension, inheritance, instanceof, prototype, static, props, constructor, etc
 * 
 * 
 * Why can't we override constructor?
 * The problem is something like, you can't call this.method() then super.constructor() or whatever.  Basically, the base constructor has to come first, which is a silly limitation.
 * So we use instantiate?  What if we don't need instantiate?  It's sometimes helpful...
 */