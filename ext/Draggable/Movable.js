import Draggable from "./Draggable.js";
import List from "../List/List.js";

export default class Movable extends Draggable {
    instantiate(...args){
        this.assign(...args);
        this.instantiate_draggable();
        this.instantiate_movable();
        this.initialize();
    }

    instantiate_movable(){
        // console.log("set", this.view.el, this);
        Draggable.register(this.view.el, this);

    }
    start(e){
        this.startX = e.clientX;
        this.startY = e.clientY;
    }
    move(e){
        this.view.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
    
        this.target(e);
    }
    target(e){
        if (e.target === this.last_target)
            return;

        Draggable.lookup(this.last_target)?.view?.rc("dragover");
        Draggable.lookup(e.target)?.view?.ac("dragover");
        
        e.target.classList.add("dragtarget");
        this.last_target?.classList.remove("dragtarget");
        this.last_target = e.target;
    }
    
    drop_check(e){
        this.drop_target_draggable = Draggable.lookup(e.target);
        
        if (this.drop_target_draggable){
            return true;
        } else {
            delete this.drop_target_draggable;
            return false;
        }
            
    }
    drop(e){
        this.list.remove();
        this.drop_target_draggable.list.append(this.list);
        delete this.drop_target_draggable;
    }
    stop(e){
        Draggable.lookup(this.last_target)?.view?.rc("dragover");
        delete this.last_target; // prob doesn't matter
        this.view.el.style.transform = "";
    }

}

Movable.List = class MovableList extends List {}
Movable.List.View = class MovableListView extends Movable.List.View {
    render(){
        super.render();
        this.draggable = new Movable({
            view: this,
            handle: this.bar,
            list: this.list
        });
    }
}
