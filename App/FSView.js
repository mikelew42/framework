import { el, div, View, h1, h2, h3, p, is, Base, icon } from "../View/View.js";

View.stylesheet("/framework/App/fs.css");
export default class FSView extends View {
	render(){
		this.bar = div.c("bar", icon("file_copy"), "File System");
		this.children = div.c("children", () => {
			this.files(this.data);
		});
	}

	files(files){
		if (!files?.length) return;
		for (const fd of files){
			if (fd.type == "file"){
				this.file(fd);
			} else {
				this.dir(fd);
			}
		}
	}

	file(fd){
		div.c("file", icon("insert_drive_file"), fd.name);
	}

	dir(fd){
		const $dir = div.c("dir", {
			bar: {
				folder_icon: icon("folder"), 
				name: div(fd.name, icon("add")), 
				link_icon: icon("chevron_right")
			},
			children: div(() => {
				this.files(fd.children);
			}).style("display", "none")
		});

		$dir.bar.name.click(() => {
			$dir.children.ac("yes").toggle();
		});

		$dir.bar.link_icon.click(() => {
			window.location = fd.full;
		});
	}
}