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
		this.instantiate_data();
    }

	instantiate_component(){
        this.name = this.name || util.slug(this.constructor.name);
		this.type = this.constructor.name;

        // this.constructor.track(this);

		if (this.parent)
			this.setup(this.parent);

		// base component doesn't need to load?
		this.ready = this.load();
	}

    initialize(){}

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
		} else {
			const current = this.data[name];

			if (current !== value){
				this.data[name] = value;

				if (value?.setup){
					value.setup(this, name);
				}

				this.changed();
			}
		}

		// this.changed();
		
		return this;
	}

	changed(){
		this.save();
	}
	
	get(name){
		return this.data[name];
	}

	/**
	 * set("child", child) => child.setup()  OR
	 * new Component({ parent }) => setup()
	 */
	setup(parent, name){
		console.log("setup", this, name, parent);
		if (name)
			this.name = name;

		if (parent){
			this.parent = parent;
			this.saver = this.parent.saver;
		} else {
			console.warn("must provide parent");
		}
	}

	instantiate_data(){
		for (const name in this.data){
			const data = this.data[name];
			if (data?.type){
				const Type = this.constructor.get_Type(data.type);
				// this[name] = new Type({ data, name, parent: this });
				this.data[name] = new Type({ data, name, parent: this });
			}
		}
	}

	/**
	 * This is important.  The JSON data gets instantiated, and those instances
	 * live in the data object.  When we save, the root data object (which holds
	 * all the nested data objects) gets JSON.stringified.  These instances use 
	 * this method to only pass their .data.
	 */
	toJSON(){
		// debugger;
		return this.data;
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

	// get_Type("Thing") => returns class Thing
	static get_Type(type){
		return this.types.find(t => t.name === type);
	}
}

Component0.types = [];
Component0.types.push(Component0);