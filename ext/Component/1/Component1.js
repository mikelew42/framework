import Component0 from "../0/Component0.js";

export default class Component1 extends Component0 {
	setup(parent, name){
		this.parent = parent;
		this.name = name;
		this.parent.data[name] = this.data;
	}
}