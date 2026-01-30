import List from "/framework/ext/List/List.js";
import { ul, li } from "/framework/core/View/View.js";

const animals = new List();

animals.add(
	"zebra", "lion", "elephant", "giraffe", "penguin",
	"dolphin", "tiger", "panda", "koala", "kangaroo",
	"wolf", "eagle", "falcon", "bear", "fox",
	"rabbit", "deer", "owl", "whale", "shark"
);

// Pick n random items from the list
animals.pick = function(n = 1) {
	const shuffled = [...this.children].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, n);
};

// Render n random animals as ul > li
animals.render = function(n = 3) {
	return ul.c("dum list animals", () => {
		for (const animal of this.pick(n)) {
			li(animal);
		}
	});
};

export { animals };
export default animals;
