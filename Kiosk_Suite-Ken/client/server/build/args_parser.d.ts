interface Args {
    "_": string[];
    [key: string]: string | boolean | string[];
}
/**
 * Parses arguments from an array of strings into key:value sorted object.
 * @param {string[]} argv - Array of arguments, typically process.argv
 * @returns {Args} Object containing key:value formatted arguments
 */
export default function parser(argv: Array<string>): Args;
export {};
