import { app, h2, el, div, test, View, p } from "/app.js";
import HashRouter from "../HashRouter/HashRouter.js";
import HashPager, { page } from "./HashPager.js";

app.$root.ac("pad");
el("style", `
    .pager {  display: flex; gap: 1em;  }

    .pager > .buttons { min-width: 10em; }

    .pager > .pages { flex: 1 1 0%; display: flex; gap: 1em; }

    .pager > .pages > * { flex: 1 2 0%; }

    /* .page.active { outline: 1px solid red; }
    .button.active { outline: 1px solid red; } */

    
    .page > .buttons { margin-bottom: 2em; }
    .page > .buttons .button { margin-bottom: 0.5em; background: rgba(0,0,0,0.1); padding: 0.75em 1em; }

    .page { background: white; padding: 2em; max-width: 40em; min-width: 30em; flex: 1 1 0%; }

    .hash-route .children { padding-left: 2em; }
    .hash-route .bar { cursor: pointer; }
    .hash-router { margin: 1em; background: white; }
    .hash-route { margin-bottom: 0.5em; padding: 0.5em; }

`);

el("h1", "class HashPager");
// const root = new HashPager();
// debugger;

// !!! The root HashPager is created (and rendered) automatically via get_captor

page("Test", tpg => {
    p("It seems we're going to need to fix the activate/deactivate logic.  When we exit a deep page, should we deactivate all active ancestors?  We can't do that blindly, because we're not sure if an ancestor is being activated...");
    p("Now, we could deactivate all, and then activate the new active's ancestors?");
    p("While that would probably work, it's also a lot of extra work:  When you'd switch between siblings, on a deep page, it would deactivate all ancestors, and then reactivate them all again, which doesn't make sense...  I know I solved this problem years ago, just don't remember exactly how.")
}).make(3).activate();


// root.view.content.append(() => {
//     p("In order to get the layout to split properly, we need all columns in the same flex container.");
//     p("Unfortunately, that's a pretty big shift in structure.  It shouldn't be terribly hard to do, but definitely changes things.");
//     h2("Responsiveness")
//     p("What happens when you run out of space?  Either by opening too many columns, or shrinking the window?");
//     p("Basically, you'd want the parent columns to hide, so you can see the deepest item.  And then you could close out of the sub pages in order to reveal the parents in succession.");
//     p("The problem with this, is that it will require some sophisticated JS logic to manage the layout.  I don't believe CSS can do this.");
//     p("I was hoping that horizontal scrolling could help here.  And it might.  But it's not going to be easily responsive.")
// });

// root.one = root.add("One", one => {
page("One", one => {
    h2("Page One");
    p("Yo, what up Eric?");
    app.checklist("One", "Two", "Three", "Four")
    lorem();
    page("A", () => p("You are on Sub One - A"));
    page("B", () => p("You are on Sub One - B"));
});

// root.two = root.add("Two", two => {
page("Two", two => {
    h2("Page Two");
    p("It looks like scroll restoration will be an issue with client side rendering.  See /test/scroll/ and /test/scroll/scroll.html for a raw test.");
    page("A", () => p("You are on Sub 2 - A"));
    page("B", () => p("You are on Sub 2 - B"));
});

HashPager.pager.make(5);

// HashRouter.singleton().debug();

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