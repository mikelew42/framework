import app, { el, div, h1, test, assert, util } from "/app.js";

class A {
	methodA(){
		return "A";
	}
}

class B {
	methodB(){
		return "B";
	}
}

div.c("page", () => {
	h1("Mixin");

	test("2", t => {
		class Combo extends util.mixin(A, B){
			method(){
				return this.methodA() + " " + this.methodB();
			}
		}
		assert(new Combo().method() === "A B");
	});

	test("1", t => {
		assert(util.mixin);
	});
});

// export default page("Page Title", () => {})
// export default new Page("Page Title", () => {})