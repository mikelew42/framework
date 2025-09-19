import { app, el, div, test, View, is } from "/app.js";
import Draggable from "./Draggable.js";
import Movable from "./Movable.js";
import Previewable from "./Previewable.js";
import Sortable from "./Sortable.js";
import __List from "../List/List.js";


class _List extends __List {

}

// tricky placeholder
class List1 extends _List {}
List1.View = class ListView extends _List.View {
    render_child(child){
        new Draggable({
            view: div.c("list-item", child),
            start(e){
                this.startX = e.clientX;
		        this.startY = e.clientY;
                this.placeholder = this.view.clone().ac("drag-placeholder");
                this.placeholder_wrapper = div.c("drag-placeholder-wrapper").append(this.placeholder);
                this.view.el.before(this.placeholder_wrapper.el);
                this.placeholder_wrapper.el.parentNode.style.position = "relative";
            },
            move(e){
                this.placeholder.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
            },
            stop(e){
                // gc?
                // this.placeholder_wrapper?.el.parentNode.style.position = "";
                // this.placeholder_wrapper?.remove();
                console.log("dragend");
            }
        });
	}
}

// basic following
class List2 extends _List {}
List2.View = class List2View extends _List.View {
    render_child(child){
        new Draggable({
            view: div.c("list-item", child),
            start(e){
                this.startX = e.clientX;
		        this.startY = e.clientY;

                this.wrapper;
            },
            move(e){
                this.view.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
            },
            stop(e){
                this.view.el.style.transform = "";
            }
        });
    }
}


// nesting, actual moving
class List3 extends _List {

}
List3.View = class List3View extends _List.View {
    render(){
		this.ac("list");
		this.bar = div.c("list-bar", () => {
			this.name = div.c("list-name", this.list.name || "unnamed list");
			// this.edit, this.delete, this.add
		});
		this.children = div.c("list-children");

        this.draggable = new Movable({
            view: this,
            handle: this.bar,
            list: this.list,
            // initialize(){
            //     // console.log("set", this.view.el, this);
            //     Draggable.register(this.view.el, this);

            // },
            // start(e){
            //     this.startX = e.clientX;
            //     this.startY = e.clientY;

            //     this.wrapper;
            // },
            // move(e){
            //     this.view.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
            
            //     this.target(e);
            // },
            // target(e){
            //     if (e.target === this.last_target)
            //         return;

            //     Draggable.lookup(this.last_target)?.view?.rc("drag-target");
            //     Draggable.lookup(e.target)?.view?.ac("drag-target");
                
            //     this.last_target = e.target;
            // },
            // drop(e){
            //     let drop_target_draggable = Draggable.lookup(e.target);
                
            //     if (drop_target_draggable){
            //         this.list.remove();
            //         drop_target_draggable.list.append(this.list);
            //     }
            // },
            // stop(e){
            //     Draggable.lookup(this.last_target)?.view?.rc("drag-target");
            //     delete this.last_target; // prob doesn't matter
            //     this.view.el.style.transform = "";
            // }
        });

		this.update();
	}
    // render_child(child){
    //     let list_view = this;
    //     div.c("list-item", child)
    // }
}

// var last_mouse_target;
// document.addEventListener("mousemove", e => {
//     if (e.target !== last_mouse_target){
//         last_mouse_target?.classList.remove("mousemovetarget");
//         e.target.classList.add("mousemovetarget");
//         last_mouse_target = e.target;
//     }
// });

el("h1", "Draggable");

el("style", `

`);

test("Sortable.List spaced", t => {
    el("button", "Debug").click(() => {
        t.view.tc("debug");
    });
    const list = new Sortable.List({ name: "Root" });
    list.append(new Sortable.List({ name: "Step 1" }));
    list.append(new Sortable.List({ name: "Step 2" }));
    list.append(new Sortable.List({ name: "Step 3" }));
    list.append(new Sortable.List({ name: "Step 4" }));
    list.append(new Sortable.List({ name: "Step 5" }));
    list.append(Sortable.List.make_deep(2));
    list.render();
});

test("Sortable.List", t => {
    const list = new Sortable.List({ name: "Root" });
    list.append(new Sortable.List({ name: "Step 1" }));
    list.append(new Sortable.List({ name: "Step 2" }));
    list.append(new Sortable.List({ name: "Step 3" }));
    list.append(new Sortable.List({ name: "Step 4" }));
    list.append(new Sortable.List({ name: "Step 5" }));
    list.append(Sortable.List.make_deep(2));
    list.render();
});

test("Previewable.List", t => {
    const list = new Previewable.List({ name: "Root" });
    list.append(new Previewable.List({ name: "Step 1" }));
    list.append(new Previewable.List({ name: "Step 2" }));
    list.append(new Previewable.List({ name: "Step 3" }));
    list.append(new Previewable.List({ name: "Step 4" }));
    list.append(new Previewable.List({ name: "Step 5" }));
    list.append(Previewable.List.make_deep(2));
    list.render();
});

test("Movable.List", t => {
    const list = Movable.List.make_deep(3);
    list.render();
});
test("movable with List", t => {
    const list = List3.make_deep(3);
    list.render();
});

test("follow", t => {
    const list = new List2();
    list.append("One");
    list.append("Two");
    list.append("Three");
    list.render();
});

test("placeholder", t => {
    const list = new List1();
    list.append("One");
    list.append("Two");
    list.append("Three");
    list.render();
})

test("basic", t => {
    new Draggable({
        view: div("drag me"),
        start(){
            console.log("dragstart");
        },
        stop(){
            console.log("dragend");
        }
    });
});

// test("flextest", t => {
//     div("hi");
//     div("hi").ac("flex");
// });

// test("layout", t => {
//     div.c("test-wrap", () => {
//         div("one");
//         div("two").style({
//             "position": "absolute",
//             "width": "100%"
//         });
//         div("three");
//     });
// })
