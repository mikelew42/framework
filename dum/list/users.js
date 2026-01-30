import List from "/framework/ext/List/List.js";
import { ul, li, div } from "/framework/core/View/View.js";

const users = new List();

users.add(
	"Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk",
	"Black Widow", "Hawkeye", "Black Panther", "Doctor Strange", "Scarlet Witch",
	"Ant-Man", "Wasp", "Vision", "Falcon", "Winter Soldier",
	"Star-Lord", "Gamora", "Groot", "Rocket", "Drax"
);

// Pick n random items from the list
users.pick = function(n = 1) {
	const shuffled = [...this.children].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, n);
};

// Render n random users as ul > li
users.render = function(n = 3) {
	return ul.c("dum list users", () => {
		for (const user of this.pick(n)) {
			li(user);
		}
	});
};

export { users };
export default users;
