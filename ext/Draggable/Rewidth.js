import Draggable from "./Draggable.js";
import { el, div } from "../../core/View/View.js"

export default class Rewidth extends Draggable {
    // view: this.viewport.handle,
    // viewport: this.viewport,
    initialize(){
        this.reset = this.reset.bind(this);
        this.view.on("contextmenu", this.reset);
    }

    start(e){
        // console.log("dragstart");
        this.startX = e.clientX;
        this.startWidth = this.viewport.el.offsetWidth;
    }

    move(e){
        // console.log("moving");
        this.viewport.el.style.width = `${this.startWidth + e.clientX - this.startX}px`;
    }

    stop(){
        // console.log("dragend");
        this.view.off("contextmenu", this.reset);
    }

    reset(e){
        e.preventDefault();
        // console.log("reset");
        this.viewport.el.style.width = "";
    }
}

export function rewidth(...args){
    return div.c("viewport", viewport => {
        viewport.append(...args);
        viewport.handle = div.c("handle");

        new Rewidth({
            view: viewport.handle,
            viewport: viewport
        });
    });
}

rewidth.c = function(cls, ...args){
    return div.c("viewport", viewport => {
        viewport.append(...args);
        viewport.handle = div.c("handle");

        new Rewidth({
            view: viewport.handle,
            viewport: viewport
        });
    }).ac(cls);
}