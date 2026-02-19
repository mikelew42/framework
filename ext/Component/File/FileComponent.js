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

			this.instantiate_data();
		}
		
		return this;
	}

	load_file(...args){
		this.file = new File({
			name: this.name + ".json",
			path: this.path
		}, ...args);
	}
}