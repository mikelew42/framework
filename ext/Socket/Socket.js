import Events from "../../core/Events/Events.js";

export default class Socket extends Events {
	static singleton() {
		if (!this._instance) {
			this._instance = new this();
		}
		return this._instance;
	}
	initialize() {
		this.protocol = window.location.protocol === "https:" ? "wss" : "ws";
		this.requests = [];
		this.fails = 0;

		this.connect();
	}
	connect() {
		this.ws = new WebSocket(this.protocol + "://" + window.location.host);
		this.ws.addEventListener("open", () => this.open());
		this.ws.addEventListener("message", res => this.message(res));
		this.ws.addEventListener("close", () => {
			console.log("Socket closed");
			// setTimeout(() => this.connect(), 0);
			// this.connect(); // strangely this works.  
		});
		this.ws.addEventListener("error", err => {
			console.log("Socket error:", err, this.fails + " fails.");

			if (this.fails <= 3) {
				console.log("Attempting to reconnect in 1 second.");
				this.fails++;
				setTimeout(() => this.connect(), 1000);
			}
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

/*

await socket.request() -> fulfills with response

request(){
	this.send({ request, id })

	this.response = new Promise()
}

*/