export default class Socket {
	static singleton() {
		if (!this._instance) {
			this._instance = new this();
		}
		return this._instance;
	}
	
	constructor(...args){
		this.assign(...args);
		this.initialize();
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	initialize() {
		this.protocol = window.location.protocol === "https:" ? "wss" : "ws";
		this.requests = [];

		this.connect();
	}
	connect() {
		this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		this.ws.addEventListener("open", () => this.open());
		this.ws.addEventListener("message", res => this.message(res));
		this.ws.addEventListener("close", () => {
			console.log("Socket closed");
		});
		this.ws.addEventListener("error", err => {
			console.log("Socket error");
		});

		this.ready = new Promise((res, rej) => {
			this._ready = res;
		});
	}
	open() {
		console.log("%cSocket connected.", "color: green; font-weight: bold;");
		// this.rpc("log", "connected!");
		this._ready();
	}
	// message recieved handler
	message(res) {
		// debugger;
		// console.log(res);
		const data = JSON.parse(res.data);

		// does the index exist
		if (data?.index in this.requests) {
			this.requests[data.index](data);
		} else {
			data.args = data.args || [];
			// console.log(data.method + "(", ...data.args, ")");
			if (this[data.method])
				this[data.method](...data.args);
		}
	}
	reload() {
		if (!window.$BLOCKRELOAD)
			window.location.reload();
		// debugger;
	}

	async send(obj) {
		console.log("sending", obj);
		await this.ready;
		this.ws.send(JSON.stringify(obj));
	}

	async request(obj) {
		this.response = new Promise(resolve => {
			obj.index = this.requests.push(resolve) - 1;
		});

		await this.ready;
		this.ws.send(JSON.stringify(obj));


		return this.response;
	}

	rpc(method, ...args) {
		this.send({ method, args })
	}

	ls(dir) {
		return this.request({ method: "ls", args: [dir] });
	}

	// ls_response(data){
	// 	new FSView({ data })
	// }

	cmd(res) {
		console.log("cmd response:", res);
	}

	write(filename, data) {
		this.rpc("write", filename, data);
	}

	log() {
		console.log(...arguments);
	}

	rm(dir) {
		return this.request({ method: "rm", args: [dir] });
	}
}