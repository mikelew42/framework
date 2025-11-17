import { app, h2, el, div, test, View, p } from "/app.js";
import HashRouter from "../HashRouter/HashRouter.js";
import HashPage, { page } from "./HashPage.js";

app.$root.ac("pad");
// el("style", `
//     * { margin:0; padding: 0; box-sizing: border-box; }
//     body { background: #eee; }
        
//     .card { padding: 1em; max-width: 20em; background: white; margin-bottom: 1em;  }    
    
//     .type1 { 
//         h1, h2, h3 {
//             margin-bottom: 0.5em;
//         }
//         p { margin-bottom: 1em; }
//     }

//     .hash-route .children { padding-left: 2em; }
//     .hash-route .bar { cursor: pointer; }
//     .hash-router { margin-bottom: 1em; }
// `);

el("h1", "class HashPage");
const root = new HashPage();
// debugger;
page("test", tpg => {
    p("this is inside test page?");
});


root.view.content.append(() => {
    p("In order to get the layout to split properly, we need all columns in the same flex container.");
    p("Unfortunately, that's a pretty big shift in structure.  It shouldn't be terribly hard to do, but definitely changes things.");
    h2("Responsiveness")
    p("What happens when you run out of space?  Either by opening too many columns, or shrinking the window?");
    p("Basically, you'd want the parent columns to hide, so you can see the deepest item.  And then you could close out of the sub pages in order to reveal the parents in succession.");
    p("The problem with this, is that it will require some sophisticated JS logic to manage the layout.  I don't believe CSS can do this.");
    p("I was hoping that horizontal scrolling could help here.  And it might.  But it's not going to be easily responsive.")
});

root.one = root.add("One", one => {
    h2("Page One");
    lorem();
    one.add("A", () => p("You are on Sub One - A"));
    one.add("B", () => p("You are on Sub One - B"));
});

root.two = root.add("Two", two => {
    h2("Page Two");
    p("It looks like scroll restoration will be an issue with client side rendering.  See /test/scroll/ and /test/scroll/scroll.html for a raw test.");
    two.add("A", () => p("You are on Sub 2 - A"));
    two.add("B", () => p("You are on Sub 2 - B"));
});

function lorem(){
    p("Lorem ipsum dolor sit amet consectetur. Non pellentesque cum ipsum pretium nibh id elementum nunc sagittis. Id auctor neque donec ultrices lectus facilisis at vulputate. Nisl eget sapien sit tellus.")
}

/**
 * These root (root.one, root.two) hash pages are hackily captured, via no parent and line 30 in HashPage.js.
 * 
 * The sub pages, are captured via HashRoute capturing.
 * 
 * We need to think about capturing in a consistent way, and allowing the root page to have other non-page hash routes, like hash tabs.
 * 
 * And so we want something more like:
 * 
 * page(pg => {
 *      section("Title", sec => {
 *          
 *      });
 *      page("Subpage", sub => {});
 * });
 

And we need a Pager to manage the columns:
- hide on mobile/small
- equalize width
- maybe ToC-ize (remove content, leaving headers as ToC nav)
    => just ac("toc") and use CSS to hide .section > .content


 */