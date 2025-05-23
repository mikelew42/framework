import Base from "/framework/Base/Base.js";
import Events from "/framework/Events/Events.js";
import { el, div, View, h1, h2, h3, p, is, icon } from "/framework/View/View.js";
import Test, { test } from "/framework/Test/Test.js";


export default class App extends Base {

	initialize(){
		this.initialize_ready();
	}

	initialize_ready(){
		this.ready = new Promise(resolve => {
			window.addEventListener("load", () => {
				this.initialize_body();
				resolve(this);
			}); 
		});
	}

	initialize_body(){
		this.body = View.body().init();
	}
}

export { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };

class Thing {
	jump(){
		console.log("jumping");
	}
}

var thing = new Thing();
var thing2 = new Thing();


thing.name = "yo";

thing.jump();

var obj = { prop: 123, prop2: 456 };
obj.prop; // 123