import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/framework/app.js";

Test.controls();

/**
 
app.use(socket); => app.ready gets rebuilt with app.ready + socket.ready?

app.ready = Promise.all([app.ready, socket.ready]);

 */

test("is the app ready?", async t => {
    console.log("before");
    await app.ready;
    console.log("after");
});

test("this is a test2", t => {
    h1("this is a test");
    h2("this is a test");
    h3("this is a test");
    p("this is a test");
    div("this is a test");
});