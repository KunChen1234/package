"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = __importDefault(require("config"));
/**
 * Set up winston logger to print to file. If NODE_ENV = development debug will print to console.
 * @returns {winston.Logger} logger object to log to files and console
 */
function setLogger() {
    const env = process.env.NODE_ENV;
    console.log(env);
    const logDir = (0, path_1.normalize)(`${__dirname}/../logs`);
    if (!(0, fs_1.existsSync)(logDir)) {
        (0, fs_1.mkdirSync)(logDir);
    }
    const infoTransport = new winston_daily_rotate_file_1.default({
        filename: `${logDir}/kiosk_${config_1.default.get("shortId")}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        // "json": true,
        // "level": env === "development" ? "debug" : "info"
    });
    // const logLevel = env === "development" ? "debug" : "info";
    const logger = (0, winston_1.createLogger)({
        level: "info",
        // level: logLevel,
        format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.prettyPrint()),
        defaultMeta: { service: "app.js" },
        transports: [
            infoTransport
        ],
    });
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (env === "development") {
        logger.add(new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
            consoleWarnLevels: ["debug"]
        }));
        logger.debug("In Development Mode");
    }
    infoTransport.on("rotate", function (oldFilename, newFilename) {
        logger.info(`Changing Files from ${oldFilename} to ${newFilename}`);
    });
    return logger;
}
exports.default = setLogger;
//# sourceMappingURL=logger.js.map