import Base from "../../core/Base/Base.js";

import { el, div, icon } from "../../core/View/View.js";

export default class File extends Base {
    render_nav(){
        div.c("file", this.label || this.name).click(() => {
            window.location.hash = "/" + this.full.replace(".page.js", "");
            window.location.reload();
        })
    }
}