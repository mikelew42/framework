import Base from "../../core/Base/Base.js";
import Socket from "../../ext/Socket/Socket.js";
import is from "../../lib/is.js";

const socket = Socket.singleton();

/**
 * 
 * Pass in multiple "path/strings", split them and concat them all.
 */
// function parts(){
// 	const ret = [];
// 	for (const arg of arguments){
// 		ret.push(...arg.split("/").filter(Boolean));
// 	}
// 	return ret;
// }

export default class File extends Base {

	initialize(){
		if (!this.name)
			throw "Must provide file.name";


		// 2 variants: user path and window path
		// if window path, we need to chop off the fake part
		// if user path, we need to concat the parts, after chop

		// const parts = window.location.pathname.split("/").filter(Boolean);

		// if /path/fake
		// if (!window.location.pathname.endsWith("/")){
		// 	parts.pop(); // remove last part, which is the fake.page.js part
		// }

		if (this.path){
			console.log("file.path", this.path);
			this.path = this.path.split("/").filter(Boolean);
			console.log("new path", this.path);
		}

		
		// window.location.pathname might be
			//  "/"
			//  "/fake"
			//  "/real/" 

		
		
		// pass `meta: import.meta` for script-relative file
		// if (this.meta){
		// 	this.url = this.meta.resolve("./" + (this.path ?? "") + this.name);
		// 	this.full = new URL(this.url).pathname;
		// } else {
			this.full = (this.path ? this.path.join("/") + "/" : "") + this.name;
			this.url = window.location.origin + "/" + this.full;
		// }
		console.log("File (", this.path, this.name, this.full,   ") => ", this.url);
		
		// if (this.path)
		// 	console.log("path", this.path);
		// console.log("full", this.full);
		// console.log("url", this.url);


		if (!this.constructor.socket)
			this.constructor.socket = socket;

		this.send = this.send.bind(this);
		this.load = this.load.bind(this);

		this.ready = Promise.all([
				this.constructor.socket.ready,
				new Promise(res => this._res = res) // resolved when load()
			]).then(() => this); // for file = await new File().ready

		this.fetch();
	}

	// fetching is relative to the current URL, not this file
	fetch(){
		console.log("fetching file", this.url);
		fetch(this.url).then(response => {
			// console.log("response", response);

			if (response.ok){
				response.json().then(data => this.load(data));

			} else if (response.statusText == "Not Found"){
				// create an empty json file
				this.data = this.data || {};
				this.save();
				// TODO: we need to this._res() to allow saving, even when the file doesn't exist
				// for now, we just refresh, and the saving will happen on the next pass...


				//	Maybe I was going to await this.ready before saving?
				//  Or maybe the component needs this to resolve, so it can resolve, so it can work? (await component.ready)
				//  Before this resolves, the component waits
				//  I'm not sure if this._res() below even gets called? I think this.save() might trigger a reload?

					// I have no idea what this comment means...
					// I'm thinking that this .save() call is not awaited at all, so we're not even sure the socket is ready..
					// unless no Files or Components are used until app.ready?  hard to say...
					// Maybe ALL socket requests could await this.ready?
						// just to prevent quick-before-socket-connection saves?

				/**
				 * The problem here, is that the saving doesn't have a response.
				 * I'm not sure we really need to wait for the response, but the thing is, the file.ready never resolves for these newly written files.
				 * Can we just this.res?
				 */
				this._res();

			} else {
				throw "Fetch response not ok: " + response.statusText;
			}
		});
	}

	load(data){
		this.data = data;
		console.log("file loaded", this.full);
		this._res?.(); // very strange syntax, resolves the ready promise, if it has been created.  might not want to call this multiple times?  but the file is only loaded once...?
			// now that _res is always defined, this ? can go, but i'll leave it here as a reference for this strange syntax
	}

	// stringify(data){
	// 	this.data = JSON.stringify(data, null, 4);
	// 	this.save();
	// }

	save(){
		if (!this.saving)
			this.saving = setTimeout(this.send, 0);
	}

	send(){
		console.log("writing file", this.full);
		this.constructor.socket.rpc("write", this.full, JSON.stringify(this.data, null, 4));
		this.saving = false;
	}
}

/*
Might we need framework-relative files AND path-relative files?

framework/
	Thing/
		Thing.js
		data.json

path/
	index.js
	thing.json

Maybe Thing.js, even when imported from any arbitrary path, might want to save something to it's own data.json.

But it also might want to create a thing.json at the current path, in order to save path-relative data.

*/