"use strict";
/* Args Parser
 * V1.0.1
 * Argument parser for Node.JS
 * Input: An array of strings.
 * Output: Object. First element has key "_" and contains an array of argumnets
 * without flags.
 * 
 * Method:
 * 	Elements in array are iterated over. If the element starts with the "-" 
 * 	character then it is treated as a flag, witht he following element as its
 * 	value (unless it begins with a "-", in which case the key is given a 
 * 	boolean "true" value)
 */

interface Args {
	// Interface that will define the object we will parse our arguments into
	// The "_" key is a string of all arguments not associated with a particular
	// key
	// All arguments with a key are saved as kay: value pairs with types of 
	// strings, booleans. Array of string type is only used for the "_" generic
	// key
	"_": string[];
	[key: string]: string | boolean | string[];
}
/**
 * Parses arguments from an array of strings into key:value sorted object.
 * @param {string[]} argv - Array of arguments, typically process.argv
 * @returns {Args} Object containing key:value formatted arguments
 */
export default function parser(argv: Array<string>): Args {
	if (!Array.isArray(argv)) {
		// If input is not an array, throw an error
		throw new Error("Input must be an array");
	}
	

	// Declare the parsedArgs object with an empty array on the "_" key.
	// Args are parsed into either the "_" array or as new key: value pairs
	const parsedArgs: Args = {
		"_": []
	};

	// Iterate over all arguments in input array. If the value begins with
	// "-" or "--" then remove the hyphens and load it and the subsequent value
	// as a key: value pair. If the argument does not begin with a hyphen it is
	// added to the "_" array.
	for (let i = 0; i<argv.length; i++) {
		// If first character is a "-"
		if (argv[i][0] === "-") {
			// If the next argument does not begin with "-"
			if (argv[i+1][0] !== "-") {
				if (argv[i][1] === "-") {
					// Remove hyphens and save into object as key: value pair
					parsedArgs[argv[i].slice(2).toLowerCase()] = argv[i+1];
				}
				else {
					// Remove hyphens and save into object as key: value pair
					parsedArgs[argv[i].slice(1).toLowerCase()] = argv[i+1];
				}	
				// increase iterator to skip over the values saved in the object
				i++;
			} else {
				// If the argument is proceeded by another argument starting
				// with "-" then add it as a key with the boolean true as
				// its value
				if (argv[i][1] === "-") {
					// Replace hyphens and save true value
					parsedArgs[argv[i].slice(2).toLowerCase()] = true;
				}
				else {
					// Replace hyphens and save true value
					parsedArgs[argv[i].slice(1).toLowerCase()] = true;
				}
			}
		} else {
			// Otherwise add to the "_" array.
			parsedArgs._.push(argv[i]);
		}
	}
	return parsedArgs;
}