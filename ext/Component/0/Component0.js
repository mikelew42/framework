import File from "../../File/0/File0.js";
import util from "/framework/lib/util.js";
import is from "/framework/lib/is.js";

export default class Component0 {
    constructor(...args){
        this.assign(...args);
        this.instantiate();
        this.initialize();
    }

    assign(...args){
        return Object.assign(this, ...args);
    }

    instantiate() {
		this.instantiate_component();
    }

	instantiate_component(){
        this.name = this.name || util.slug(this.type);
		this.type = this.constructor.name;

        // this.constructor.track(this);

		if (this.parent)
			this.setup();

		this.ready = this.load();
	}

    initialize() {}

	/**
	 * Are these base components always attached to a FileComponent or LocalComponent?
	 */
	async load(){
		if (!this.data){
			this.data = {
				name: this.name,
				type: this.type
			};
		}
		
		console.warn("Implement load() in subclass");

		return this;
	}

	save(){
		this.saver.save();
	}

	
	set(name, value){
		if (!this.data){
			throw new Error("Cannot .set() component properties before .ready");
		}

		if (is.pojo(name)){
			for (const prop in name){
				this.set(prop, name[prop]); // requires debounce
			}
		} else if (value?.setup){
			value.setup(this, name);
			this.changed();
		} else {
			const current = this.data[name];

			if (current?.set){
				console.warn("set(name, value) ?") // not sure this is used
				current.set(value);
			} else {
				if (current !== value){
					this.data[name] = value;	
					this.changed();
				}
			}
		}

		// this.changed();
		
		return this;
	}

	changed(){
		this.save();
	}
	
	get(name){
		const value = this.data[name];
		if (value?.get)
			return value.get(); // ? what type of instance is this?
		else
			return value;
	}

	/**
	 * set("child", child) => child.setup()  OR
	 * new Component({ parent }) => setup()
	 */
	setup(parent, name){
		if (parent)
			this.parent = parent;

		if (name)
			this.name = name;
		
		this.parent.data[this.name] = this.data;
		this.saver = this.parent.saver;
	}

	async delete(){
		return this.file.delete();
	}

	static meta(){
		return import.meta;
	}

	static track(instance){
		this.instances.push(instance);
	}

	static get instances(){
		return this._instances || (this._instances = []);
	}
}