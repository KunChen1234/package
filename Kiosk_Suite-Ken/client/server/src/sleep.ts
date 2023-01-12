"use strict";
/**
 * Use await sleep(ms) in async function to pause that function for the specified amount of time
 * @param {number} ms time to sleep for in milliseconds
 * @returns 
 */
function sleep(ms: number): Promise<unknown> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export default sleep;