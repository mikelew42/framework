import File from "../File/File.js";
import Dir from "../Dir/Dir.js";
import Socket from "../../ext/Socket/Socket.js";
import is from "../../lib/is.js";


const socket = Socket.singleton();
// File.socket = Dir.socket = socket;

export default class Component {

	// constructor(...args){
	// 	this.instantiate(...args).catch(e => {
	// 		console.error("new " + this.constructor.name + "().instantiate()", e)
	// 	});
	// 	// surprisingly, this makes the console log errors in a different (better?) order (the order in which they occur)
	// }

	constructor(...args){
		this.instantiate(...args);
	}

	instantiate(...args){
		this.config(...args);
		this.load(); // load the file

			// if we await comp.ready, will initialize() run first or after?
			// hopefully they run in the order they are added, which I think would run this first...

			// Nope, seems like the external await runs first, not sure why

		// this.initialize(); // then initialize 
			// moved this to the file.ready.then

		/* The whole point of async here was to get initialize() to run AFTER data, but BEFORE ready?
		Well, it didn't work.  Not it basically does/should :D */
	}

	initialize(){} // leave empty for extension
		// can be async, doesn't have to be? see load -> await this.initialize()
		// this is so that initialize can do async things, like load children
		// it's also so we can await component.ready, initialize() will run, then we can render
	
	config(...args){
		this.name = this.constructor.name.toLowerCase();
		this.classname = this.constructor.name;

		// this is a hack, please figure out a better way
		if (!this.constructor.socket)
			this.constructor.socket = socket;

		this.File = this.constructor.File; // so load_file() works on the Class
			// can't do new this.constructor.File on the class, the constructor prop doesn't exist

		this.constructor?.track(this);

		this.assign(...args);
	}

	load(){
		if (!this.data){
			this.load_file();
			this.ready = this.file.ready.then(async () => {
				this.data = this.file.data;
				this.saver = this.file;
				await this.initialize();
				return this;
			});
			
		}  else {
			this.saver = this.parent.saver;
		}// assume if data is present, it's from a parent component
	}
  
	load_file(){
		this.file = new this.File(this.file || {
			name: this.name + ".json",
			path: this.path || (window.location.hash ? window.location.hash.substring(1) : "")
		});
	}

	set(name, value){
		if (is.pojo(name)){
			for (const prop in name){
				this.set(prop, name[prop]);
			}
		} else if (value?.setup){
			console.warn("is this used?");
			value.setup(this, name);
		} else {
			const current = this.data[name];

			if (current?.set){
				console.warn("set(name, value) ?") // not sure this is used
				current.set(value);
			} else {
				if (this.data[name] !== value){
					this.data[name] = value;	
					this.changed();
				}
			}
		}

		// this.changed();
		
		return this;
	}

	async setup(parent, name){
		this.parent = parent;
		this.name = name; // overrides own name?
			// can thing.name be different than parent["name"] = thing?
		
		await this.parent.ready;
		await this.ready;
		this.parent.data[name] = this.data;
		console.warn("huh?"); // i'm not sure this logically makes sense?
			// does the data come from the parent? or...?
	}

	get(name){
		const value = this.data[name];
		if (value?.get)
			return value.get(); // ? what type of instance is this?
		else
			return value;
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	changed(){
		this.save();

		if (this.update && !this.updating){
			this.updating = setTimeout(() => {
				this.updating = false;
				this.update();
			}, 0);
		}
	}

    save(){
        this.saver.save();
    }

	static config(){
		this.instances = [];

		this.file = {
			name: this.name + "s.json",
			meta: this.meta()
		};
	}

	// this needs to be rewritten in each file
	static meta(){
		return import.meta;
	}

	static track(instance){
		this.instances.push(instance);
		// this.emit("new", instance);
	}
}

Component.File = File; // 1

// Component.assign = Component.prototype.assign;
// Component.save = Component.prototype.save;
// Component.get = Component.prototype.get;
// Component.set = Component.prototype.set;
// Component.instantiate = Component.prototype.instantiate;
// Component.initialize = Component.prototype.initialize;
// Component.load = Component.prototype.load;
// Component.load_file = Component.prototype.load_file;

const methods = Object.getOwnPropertyNames(Component.prototype);

for (const prop of methods){
	const value = Component.prototype[prop];
	if (is.fn(value))
		Component[prop] = value;
}

// Component.instantiate(); // 2 // shared /framework/ can't save...
Component.instances = []; // for now...

// // dir need to create files
// class Dir extends Array {
// 	file(name){
// 		const file = new File({ name });
// 		this.push(file);
// 		return file;
// 	}
// }

// Component.instances = new Dir();