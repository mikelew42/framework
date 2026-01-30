import app, { div, h1, h2, h3, p, section } from "/app.js";
import animals from "./animals.js";
import users from "./users.js";

app.$root.ac("page");

h1("Dum Lists");
p("List-based dummy data for prototyping.");

section(() => {
	h2("Animals");
	p("Random animals from the list:");
	animals.render(5);
});

section(() => {
	h2("Users (Superheroes)");
	p("Random superhero names:");
	users.render(5);
});

section(() => {
	h2("Usage");
	h3("Import");
	p("Import the list you need:");
	
	h3("Pick Random");
	p("Use `.pick(n)` to get an array of n random items.");
	
	h3("Render");
	p("Use `.render(n)` to render n items as a `ul > li` structure.");
});
