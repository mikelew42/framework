

class Module {

    constructor(...args){
		this.instantiate(...args);
	}

	instantiate(...args){
		this.assign(...args);
		this.initialize();
	}

	initialize(){}

	assign(...args){
		return Object.assign(this, ...args);
	}

    constructor(...args){
		this.instantiate(...args).catch(e => {
			console.error("new " + this.constructor.name + "().instantiate()", e)
		});
		// surprisingly, this makes the console log errors in a different (better?) order (the order in which they occur)
	}

	async instantiate(...args){
        this.assign(...args);
		await this.load(); // load the file
		await this.initialize(); // then initialize
	}

	initialize(){} // leave empty for extension

}