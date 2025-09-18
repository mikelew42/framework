import { app, el, div, test, View, p, Base } from "../../app.dev.js";
import HashRouter from "./HashRouter.js";
import Tabs, { tabs, tab } from "./HashTabs.js";
import Socket from "/framework/ext/Socket/Socket.js";


Socket.singleton();

    
View.body().init().ac("type1");

el("style", `
    * { margin:0; padding: 0; box-sizing: border-box; }
    body { background: #eee; }
        
    .card { padding: 1em; max-width: 20em; background: white; margin-bottom: 1em;  }    
    
    .type1 { 
        h1, h2, h3 {
            margin-bottom: 0.5em;
        }
        p { margin-bottom: 1em; }
    }

    .hash-route .children { padding-left: 2em; }
    .hash-route .bar { cursor: pointer; }
    .hash-router { margin-bottom: 1em; }
`);

el("h1", "class HashRouter");

const router = HashRouter.singleton();



function lorem(){
    p("Lorem ipsum dolor sit amet consectetur. Non pellentesque cum ipsum pretium nibh id elementum nunc sagittis. Id auctor neque donec ultrices lectus facilisis at vulputate. Nisl eget sapien sit tellus.")
}


// div(el("a", "one").attr("href", "#/one/").ac("nav-link"));
// div(el("a", "two").attr("href", "#/two/").ac("nav-link"));
// div(el("a", "three").attr("href", "#/three/").ac("nav-link"));

p("It looks like scroll restoration will be an issue with client side rendering.  See /test/scroll/ and /test/scroll/scroll.html for a raw test.");


// router.add({
//     path: "One",
//     initialize(){
//         this.button = div.c("button", "One").click(() => this.go());
//         this.content = div.c("content", "You are on page One").hide();
//     },
//     activate(){
//         this.content.show();
//         this.button.ac("active");
//     },
//     deactivate(){
//         this.content.hide();
//         this.button.rc("active");
//     }
// });

// router.add("two", route => {
//     div("You are on page Two");
//     div(el("a", "sub").attr("href", "#/two/sub/").ac("nav-link"));

//     route.add("sub", () => {
//         div("You are on sub-page Two/Sub");
//     });
// });

// router.add({
//     path: "Two",
//     initialize(){
//         this.button = div.c("button", "Two").click(() => this.go());
//         this.content = div.c("content", () => {
//             el("h3", "Page Two");
//             this.add({
//                 path: "Sub",
//                 initialize(){
//                     this.button = div.c("button", "Sub").click(() => this.go());
//                     this.content = div.c("content", () => {
//                         el("h3", "Page Two Sub");
//                         lorem();
//                     }).hide();
//                 },
//                 activate(){
//                     this.content.show();
//                     this.button.ac("active");
//                 },
//                 deactivate(){
//                     this.content.hide();
//                     this.button.rc("active");
//                 }
//             });
//         }).hide();
//     },
//     activate(){
//         this.content.show();
//         this.button.ac("active");
//     },
//     deactivate(){
//         this.content.hide();
//         this.button.rc("active");
//     }
// });

// router.add("three", () => {
//     div("You are on page Three");
// });

// router.add({
//     path: "four",
//     initialize(){
//         this.view = div("You are on page Four").hide();
//     },
//     activate(){
//         this.view.show();
//     },
//     deactivate(){
//         this.view.hide();
//     }
// });

// div.c("card", () => {
//     router.debug();
// });

tabs.c("white horizontal", () => {
    tab("Tab 1", () => {
        el("h1", "This is Tab 1");
        el("p", "Welcome to Tab 1");
        tabs.c("light vertical", () => {
            tab("Sub 1", "This is Sub Tab 1");
            tab("Sub 2", "This is Sub Tab 2");
            tab("Sub 3", "This is Sub Tab 3");
        });        
        el("h1", "This is Tab 1");
        el("p", "Welcome to Tab 1");
        tabs.c("light vertical", () => {
            tab("Sub 4", "This is Sub Tab 4");
            tab("Sub 5", "This is Sub Tab 5");
            tab("Sub 6", "This is Sub Tab 6");
        });
    });
    tab("Tab 2", "This is Tab 2");
    tab("Tab 3", "This is Tab 3");
});


// const tibs = new Tabs();
// tibs.view.ac("white vertical");
// tibs.add("Tabs", () => {
//     el("h1", "Tabs");
//     el("p", "Can we have another set of tabs?");
//     p("Yes, but only one 'bookmark' will work on refresh.");
//     const horizontal = new Tabs();
//     horizontal.view.ac("light horizontal");
//     horizontal.add("Horizontal", () => {
//         el("h2", "This is Horizontal Tab 1");
//         p("Gotta work on these blocks.");
//     });
//     horizontal.add("Horizontal 2", "This is Horizontal Tab 2");
//     horizontal.add("Horizontal 3", "This is Horizontal Tab 3");
//     const subs = new Tabs();
//     subs.view.ac("light vertical");
//     subs.add("Vertical", () => {
//         el("h2", "This is Subtab 1");
//         el("p", "Welcome to Subtab 1");
//         const subsubs = new Tabs();
//         subsubs.view.ac("white horizontal");
//         subsubs.add("Subsubtab 1", "This is Subsubtab 1");
//         subsubs.add("Subsubtab 2", "This is Subsubtab 2");
//         subsubs.add("Subsubtab 3", "This is Subsubtab 3");
//     });
//     subs.add("Subtab 2", "This is Subtab 2");
//     subs.add("Subtab 3", "This is Subtab 3");

//     const subs2 = new Tabs();
//     subs2.view.ac("light vertical");
//     subs2.add("Subtab 4", () => {
//         el("h2", "This is Subtab 1");
//         el("p", "Welcome to Subtab 1");
//         const subsubs = new Tabs();
//         subsubs.view.ac("white horizontal");
//         subsubs.add("Subsubtab 1", "This is Subsubtab 1");
//         subsubs.add("Subsubtab 2", "This is Subsubtab 2");
//         subsubs.add("Subsubtab 3", "This is Subsubtab 3");
//     });
//     subs2.add("Subtab 5", "This is Subtab 2");
//     subs2.add("Subtab 6", "This is Subtab 3");
// });
// tibs.add("Layout", () => {
//     el("h1", "Layout");
//     const layouts = new Tabs();
//     layouts.view.ac("light horizontal");
//     layouts.add("Flexbox", () => {
//         const flex = new Tabs();
//         flex.view.ac("white vertical");
//         flex.add("Flex 1", "This is Flex 1");
//         flex.add("Flex 2", "This is Flex 2");
//     });
// });
// tibs.add("Tab 3", "This is the content of Tab 3");
// tibs.view.buttons.append(el("a", "/test/").attr("href", "/test/"));

HashRouter.router.debug();
/**
 * 

route.add({
		path: "whatever",
		initialize(){
				this.render();
		},
		activate(){
				this.view.ac("active");
		}
});

// or

route.add({
		path: "whatever",
		activate(){
				if (!this.view)
						this.render()
				
				this.view.ac("active");
		}
});


Router Use Cases:

Tabs
Expandos
Accordions
Modal
Scroll Spy
Dropdown
Navigation
Workflow
Wizard
Paging (linking, swapping)
Tests

Any time we want a page to be able to load data, without having to create a bunch of actual sub pages (real routes),
we can use hash routes.

I need to figure out how to coordinate router with view.
Generally, the route can just be route.go(), activate(), and deactivate();

However, we don't want to have to code out each of these... It should be easier?

HashTabs use routes

 */