import { app, el, div, h1, test, View, p, Base, code } from "../../../app.js";
import CodeEditor from "./CodeEditor.js"
app.$root.ac("page");

h1("class CodeEditor");

p.c("intro", "This is the code editor, clearly.");

p("I think my typography is getting a little complicated.");

p(code("This is an inline code element."));

code.edit(`div("hello world")`)
// new CodeEditor({ code: "this isn't proper code" });
// debugger;
code.edit(`div("test")`);
code.edit(`code.edit("div('quote quote quote')")`)

p("For some crazy reason, when erroneous code goes in, subsequent `code.edit()` calls are skipped?  Maybe there's something fundamental about catching errors that I don't understand?  Maybe with async code?")

// code.edit(`err`); 
// uncomment this, and it will render, with an error, but then the block below fails... for reason unknown to me

code.edit(`div("this should work fine")`)

const a = "a";

code.eval(`console.log("the value of a is", a);`, code => eval(code));