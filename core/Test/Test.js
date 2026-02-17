import View, { el, div, is } from "../View/View.js";
import { rewidth } from "../../ext/Draggable/Rewidth.js";

View.stylesheet(import.meta, "Test.css");


export default class Test {
	constructor(...args){
		Object.assign(this, ...args);

		// console.log("test fn.toString()", this.value.toString());
		this.assertion_count = 0;

		// const regex = /assert\s*\(\s*(.+?)\s*\)/g;
		const regex = /assert\s*\(\s*([\s\S]+?)\s*\)(?=\s*;?\s*$|;)/gm;
		this.assertion_conditions = [...this.value.toString().matchAll(regex)].map(match => match[1]);

		// console.log(this.assertion_conditions);

	}
	
	render(){
		this.view = div.c("test", {
			name: div().backtick_append(this.name).click(this.activate.bind(this)),
			container: rewidth()
		});

		this.should_run() && this.run();

		this.match() && this.view.ac("active");
	}

	activate(){
		window.location.hash = this.name;
		window.location.reload();
	}

	run(){
		console.group(this.name);
		Test.set_captor(this);
		View.set_captor(this.view.container);
		this.view.ac("ran");

		if (this.value)
			this.value(this);
		else 
			console.warn("no test.fn");

		Test.restore_captor();
		View.restore_captor();
		console.groupEnd();
	}

	should_run(){
		return !window.location.hash || this.match();
	}

	match(){
		return decodeURI(window.location.hash.substring(1)) === this.name;
	}

	assign(){
		return Object.assign(this, ...arguments);
	}

	assert(condition, message){
		const condition_code = this.assertion_conditions[this.assertion_count];
		
		if (!message)
			message = condition_code;

		if (!is.bool(condition))
			message += " = " + condition;

		if (condition){
			console.log("Assertion:", message || condition_code, " Passed");
			this.view.container.append(div.c("test-assert passed", message || condition_code || "Assertion passed."));
		} else {
			console.error("Assertion:", message || condition_code || "Assertion failed.", "Failed");
			this.view.container.append(div.c("test-assert failed", message || condition_code || "Assertion failed."));
		}
		this.assertion_count++;
		return condition; // if (assert(whatever)) ??
	}
}

export function test(name, value, arg){
	return new Test({ name, value, arg }).render();
}

Object.assign(Test, {
	previous_captors: [],
	set_captor(test){
		this.previous_captors.push(this.captor);
		this.captor = test;
	},
	restore_captor(){
		this.captor = this.previous_captors.pop();
	},
	controls(){
		var controls = div().ac("test-controls").append({
			reset: el("button", "reset").click(function(){
				Test.reset();
			})
		});
		// document.body.appendChild(controls.el);
	},
	reset(){
		window.location.href = window.location.href.split('#')[0];
	},
	init(){
		Test.controls();
		const body = new View({ el: document.body });
		View.set_captor(body);
	}
});

export { Test };
export function assert(condition, message){
	return Test.captor.assert(condition, message);
}
// Test.init();