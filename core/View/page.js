import app, { el, div, View, h1, h2, h3, p, is, test, Test } from "../../../app.js";

app.$root.ac("page");

h1("class View");

Test.controls();


test("create a view using new", t => {

    const view = new View();
    view.text("text content").ac("css-class");

});

test("some examples", t => {
    // There are a small handful of element functions (h1, h2, h3, p, div).
    // el("tag", "content") is the generic element function that can be used to create any element.


    // <div>This is a div.</div>
    el("div", "This is a div.") 

    // <div>This is a div.</div>
    div("This is a div."); 

    // <div id="cool" class="one two">This is a div.</div>
    div("This is a div.").attr("id", "cool").ac("one two");


    // The `.c()` extension method is a shorthand for creating elements with arguments: classes then content.
    // div.c("blue", "This is a div."); is equivalent to
    // div("This is a div.").ac("blue"); 
    // This is only so that you don't have to add the class at the end of the content.
    // If you have p("Many ... lines ... of content here").ac("intro"), is harder to read.

    // <div class="one two">This is a div.</div>   
    div.c("one two", "This is a div."); 
    
    // <h1 class="main">Main Heading</h1>
    h1.c("main", "Main Heading"); 

    // <p class="intro">This is an intro paragraph.</p>
    p.c("intro", "This is an intro paragraph."); 

    // <button class="big">Click Me!</button>
    el.c("button", "big", "Click Me!");

    // I'm not sure I love the `.c` system, but it works.
});

test("shorthand, append features", t => {

    const list = div.c("custom-list", {
        one: "one",
        two: "two",
        three: {
            name: "three",
            children(){
                div("3.1");
                div("3.2");
                div("3.3");

                if (true){
                    div("3.4");
                } else {
                    div("nope");
                }

                for (let i = 5; i < 15; i++){
                    div("3." + i);
                }
            }
        }
    });

    /*
    
    Append an object, and properties will be upgraded to elements, defaulting to the same tag as the parent, usually a div.

    */

    // Also, the property names are added as classes, and also used as references, so you can access the sub-elements like this

    list.two.style("color", "red");

    list.three.children.style("padding-left", "1em");

});