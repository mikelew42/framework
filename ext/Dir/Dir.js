import Base from "../../core/Base/Base.js";
import Socket from "../../ext/Socket/Socket.js";
import is from "../../lib/is.js";
import File from "../File/File.js";

const socket = Socket.singleton();


export default class Dir extends Base {

	initialize(){
		// if (!this.name)
		// 	throw "Must provide dir.name";

		// if (this.path)
		// 	this.path = this.path + "/";

		// pass `meta: import.meta` for script-relative file
		if (this.meta){
			this.url = this.meta.resolve("./" + (this.path ?? "") + this.name);
			this.full = new URL(this.url).pathname;
		} else {
			this.full = (this.path ?? "") + this.name;
			this.url = window.location.origin + "/" + this.full + "/";
		}

		console.log("dir (path, name, full, url) - (", this.path, this.name, this.full, this.url, ")");
		// debugger;

			// don't think we're using this.url?

		if (!this.constructor.socket)
			this.constructor.socket = socket;

		// this.send = this.send.bind(this);
		this.load = this.load.bind(this);

		this.ready = Promise.all([
				this.constructor.socket.ready,
				new Promise(res => this._res = res) // resolved when load()
			]).then(() => this); // for file = await new File().ready()

		this.load(); // this is needed to mkdir
	}

	async load(){
		console.log("loading dir", this.full);
		const data = await this.constructor.socket.ls(this.full);
		this._res()
		// console.log("dir data", this.full, data);
	}

	rm(){
		this.constructor.socket.rm(this.full);
	}

	file(name, opts){
		// if filename.ext, we use this.filename
		// might be a problem if you have filename.ext1 and filename.ext2
		return this[remove_ext(name)] = new File({ 
			name,
			meta: this.meta, // might be undefined
			path: this.path ? this.path + this.name : this.name
		}, opts);
	}

	dir(name){
		return this[name] = new Dir({ name, meta: this.meta, 
			path: this.path ? this.path + this.name : this.name
		});
	}
}




function remove_ext(name){
	return name.split(".")[0];
}