import winston from "winston";
/**
 * Set up winston logger to print to file. If NODE_ENV = development debug will print to console.
 * @returns {winston.Logger} logger object to log to files and console
 */
declare function setLogger(): winston.Logger;
export default setLogger;
