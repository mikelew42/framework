import app, { div, h1, h2, h3, p, a, button, section, code } from "/app.js";
import { image } from "./image/image.js";
import dum from "./dum.js";

app.$root.ac("page");

h1("Dum");
p("Quick dummy content for rapid prototyping.");

h2(code("dum()"), " Usage");
p("Wrap elements in `dum()` to auto-fill them with lorem ipsum based on tag type.");

section(() => {

    h3("Basic Card");
    code.eval(
`dum(h2(), p(), button.c("prim"));`, code => eval(code));

});

section(() => {

    h3("With Image");
    code.eval(
`div.c("flex auto gap zoom-50", () => {
    for (let i = 0; i < 3; i++) {
        dum(image.c("ar-16-9"), h3(), p());
    }
});`, code => eval(code));

});

h3("Multiple Paragraphs");
dum(h2(), p(), p(), p());
