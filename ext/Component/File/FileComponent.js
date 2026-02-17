import Component0 from "../0/Component0.js";

import File from "../../File/0/File0.js";
import util from "/framework/lib/util.js";
import is from "/framework/lib/is.js";

export default class FileComponent extends Component0 {

	async load(){
		if (!this.data){
			this.load_file({ 
				data: { 
					name: this.name,
					type: this.type
				} 
			});
			await this.file.ready;
			this.data = this.file.data;
			this.saver = this.file;

			this.instantiate_children();
		}
		
		return this;
	}

	load_file(...args){
		this.file = new File({
			name: this.name + ".json",
			path: this.path
		}, ...args);
	}

	instantiate_children(){
		for (const name in this.data){
			const data = this.data[name];
			if (data?.type){
				const Type = this.constructor.types.find(t => t.name === data.type);
				if (Type){
					const instance = new Type({ parent: this, data, name });
					this[name] = instance;
				} else {
					console.warn("Component type not found:", data.type);
				}
			}
		}
	}
}

FileComponent.types = [];
FileComponent.types.push(FileComponent, Component0);