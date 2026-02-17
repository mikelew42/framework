import Socket from "/framework/ext/Socket/Socket.js";
import util from "/framework/lib/util.js";

const socket = Socket.singleton();

export default class File0 {

	constructor(...args){
		this.assign(...args);
		this.instantiate();
		this.initialize();
	}

    assign(...args){
		return Object.assign(this, ...args);
	}

	instantiate() {
		if (!this.name) throw "Must provide file.name";

		let url = util.url(this.meta, this.path, this.name);
		this.url = url.href;
		this.full = url.pathname;

		this.ready = this.fetch();
	}

	initialize() {}

	async fetch() {
		try {
			const response = await fetch(this.url);
			if (response.ok) {
				this.data = await response.json();
			} else {
				throw new Error(`Fetch response not ok: ${response.status} ${response.statusText}`);
			}
		} catch (e){
			console.error("Fetch failed:", e);
			this.data = this.data || {};
			await this.send();
		}
		return this;
	}

	async save(){
		// await Promise.resolve(); // await changes the synchronicity of the function
		// if we want file.save() -> await file.ready; synchronously, we can't await...
		// console.log("file.save()")
		if (!this.saving){
			this.saving = true;
			// console.log("queue file save");
			return this.ready = Promise.resolve().then(() => this.send()).then(() => this);
		} else {
			return this.ready;
		}
	}

	async send() {
		try {
			console.log("writing file", this.full, this.data);
			const response = await socket.async_rpc("write", 
				this.full, JSON.stringify(this.data, null, 4) );
			console.log("wrote file", this.full, response);
			return response;
		} catch (e){
			console.error("Send failed:", e);
		} finally {
			console.log("saving file done", this.full);
			this.saving = false;
		}
	}

	async delete() {
		const response = await socket.async_rpc("rm", this.full);
		console.log(response);
		return response;
	}
}