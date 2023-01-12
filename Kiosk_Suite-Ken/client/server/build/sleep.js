"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Use await sleep(ms) in async function to pause that function for the specified amount of time
 * @param {number} ms time to sleep for in milliseconds
 * @returns
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.default = sleep;
//# sourceMappingURL=sleep.js.map