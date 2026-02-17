import Socket from "/framework/ext/Socket/Socket.js";
import util from "/framework/lib/util.js";
import File from "/framework/ext/File/0/File0.js";

const socket = Socket.singleton();

export default class Dir0 {

	constructor(...args){
		this.assign(...args);
		this.instantiate();
		this.initialize();
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	instantiate() {
		if (!this.name) throw "Must provide dir.name";

		let url = util.url(this.meta, this.path, this.name);
		this.url = url.href;
		this.full = url.pathname;

		this.ready = this.load();
	}

	initialize() {}

	async load(){
		console.log("loading dir", this.full);
		this.data = await socket.ls(this.full);
		console.log("dir data", this.full, this.data);
		return this;
	}

	file(name, opts){
		// if filename.ext, we use this.filename
		// might be a problem if you have filename.ext1 and filename.ext2
		// return this[remove_ext(name)] = new File({ 
		return new File({ 
			name,
			meta: this.meta, // might be undefined
			path: this.path ? this.path + this.name : this.name
		}, opts);
	}

	dir(name){
		return this[name] = new this.constructor({ name, meta: this.meta, 
			path: this.path ? this.path + this.name : this.name
		});
	}

	async delete() {
		const response = await socket.async_rpc("rm", this.full);
		console.log(response);
		return response;
	}
}

// function remove_ext(name){
// 	return name.split(".")[0];
// }