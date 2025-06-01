import Base from "../Base/Base.js";
import Events from "../Events/Events.js";
import { el, div, View, h1, h2, h3, p, is, icon } from "../View/View.js";
import Test, { test } from "../Test/Test.js";


export default class App extends Base {

	initialize(){
		this.initialize_ready();
	}

	initialize_ready(){
		this.ready = new Promise(resolve => {
			window.addEventListener("load", () => {
				console.log("window.load");
				this.initialize_body();
				resolve(this);
			}); 
		});
	}

	initialize_body(){
		this.$body = View.body().init();
	}

}

export { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };