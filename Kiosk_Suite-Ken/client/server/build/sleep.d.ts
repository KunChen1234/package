/**
 * Use await sleep(ms) in async function to pause that function for the specified amount of time
 * @param {number} ms time to sleep for in milliseconds
 * @returns
 */
declare function sleep(ms: number): Promise<unknown>;
export default sleep;
