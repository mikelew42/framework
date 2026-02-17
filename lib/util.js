function pad2(n){
    return n.toString().padStart(2, '0');
}

const util = {
    tid(){
        const now = new Date();
        return now.getFullYear() + "-" +
            pad2(now.getMonth() + 1) + "-" +
            pad2(now.getDate()) + "@" +
            pad2(now.getHours()) + "." +
            pad2(now.getMinutes()) + "." +
            pad2(now.getSeconds()) + "." + now.getMilliseconds();
    },
	promise(){
		let resolve, reject;
		const promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});
		promise.resolve = resolve;
		promise.reject = reject;
		return promise;
	},
	// url(...args) {
	// 	// 1. Determine the initial base
	// 	let base = (args[0]?.url) ? args[0].url : document.baseURI;
	// 	const startIndex = (args[0]?.url) ? 1 : 0;

	// 	let finalUrl = new URL('', base);

	// 	for (let i = startIndex; i < args.length; i++) {
	// 		let segment = args[i];

	// 		// 2. If it's not the last argument, ensure it ends with a slash 
	// 		// so the next segment is appended rather than replacing it.
	// 		if (i < args.length - 1 && !segment.endsWith('/')) {
	// 		segment += '/';
	// 		}

	// 		finalUrl = new URL(segment, finalUrl);
	// 	}

	// 	return finalUrl;
	// }
	url(...args) {
		// 1. Filter out falsey values and find the base
		const cleanArgs = args.filter(Boolean);
		const hasMeta = cleanArgs[0]?.url;
		
		let finalUrl = new URL(hasMeta ? cleanArgs[0].url : document.baseURI);
		const startIndex = hasMeta ? 1 : 0;

		// 2. Iterate and ensure intermediate segments have trailing slashes
		for (let i = startIndex; i < cleanArgs.length; i++) {
			let segment = cleanArgs[i];
			if (i < cleanArgs.length - 1 && !segment.endsWith('/')) segment += '/';
			finalUrl = new URL(segment, finalUrl);
		}

		return finalUrl;
	},
	slug(str){
		return str
			.replace(/([a-z])([A-Z0-9])/g, '$1-$2') // Lowercase followed by Caps/Digit
			.replace(/([0-9])([a-zA-Z])/g, '$1-$2') // Digit followed by Letter
			.toLowerCase();
	},
	/**
	 * Standalone Mixin Function
	 * Usage: class NewClass extends mixin(BaseClass, One, Two, Three) {}
	 */
	mixin(Base, ...sources) {
		// 1. Create the class that extends the specific Base
		class Mixed extends Base {}

		// 2. Iterate through sources (Left -> Right)
		// 'Two' overrides 'One'; 'Three' overrides 'Two'
		for (const source of sources) {
			
			// 3. Capture all keys (including non-enumerable class methods)
			const props = Object.getOwnPropertyNames(source.prototype);

			for (const prop of props) {
				// 4. Skip constructor to preserve Base/Mixed initialization
				if (prop === "constructor") continue;

				// 5. Copy the property descriptor exactly
				const descriptor = Object.getOwnPropertyDescriptor(source.prototype, prop);
				Object.defineProperty(Mixed.prototype, prop, descriptor);
			}
		}

		return Mixed;
	}
};

export default util;
export { util };