import { app, el, div, test, View } from "../../app.dev.js";
import List from "./List.js";


function animals(){
    const list = new List();
    for (const animal of ["antelope", "bear", "cat", "dog", "elephant", 
        "frog", "giraffe", "hippo", "iguana", "jaguar",  "koala", "lion",
        "monkey", "newt", "owl", "pig", "quail", "rabbit", "sheep",
        "tiger", "urchin", "vulture", "wolf", "xerus", "yak", "zebra"]){
            list.append(animal);
    }
    return list;
}

test("new List", t => {
    t.view.ac("gray");
    
    const list = new List({
        name: "list"
        // render(){
        //     div.c("list", () => {
        //         this.each(child => {
        //             div.c("list-item", child);
        //         });
        //     });
        // }
    });
    // list.add("item 1");
    // list.add("item 2");
    // list.add("item 3");
    // list.add("item 4");
    list.add(1, 2, 3, 4)
    list.render();

    // list.find()
    
    const list2 = list.map(item => item.toString().toUpperCase());
    list2.log();

    list.log();
    console.log(list.children === list2.children); // false, but same items
});

test("animals", t => {
    t.view.ac("gray");
    const list = animals();
    list.append(animals());
    list.render();
});

Array.prototype.render = function(){
    div.c("array-view", () => {
        div.c("name", this.name);
        div.c("items", () => {
            for (const item of this){
                div.c("item", item);
            }
        });
    });
}

test("render array?", t => {
    const arr = [1, true, "three"];
    arr.name = "arr";
    arr.render();
});