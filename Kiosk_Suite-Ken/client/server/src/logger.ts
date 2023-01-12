import winston, { createLogger, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { mkdirSync, existsSync } from "fs";
import { normalize } from "path";
import nodeConfig from "config";

/**
 * Set up winston logger to print to file. If NODE_ENV = development debug will print to console.
 * @returns {winston.Logger} logger object to log to files and console
 */
function setLogger(name: string): winston.Logger {

	const env = process.env.NODE_ENV;

	const logDir = normalize(`${__dirname}/../../logs`);
	if (!existsSync(logDir)) {
		mkdirSync(logDir);
	}

	const infoTransport: DailyRotateFile = new DailyRotateFile({
		filename: `${logDir}/qa_testing_server-${nodeConfig.has("shortId") ? nodeConfig.get("shortId") : ""}-%DATE%.log`,
		datePattern: "YYYY-MM-DD",
		zippedArchive: true,
		maxSize: "20m",
		maxFiles: "14d",
		// "json": true,
		// "level": env === "development" ? "debug" : "info"
	});

	const logLevel = env === "development" ? "debug" : "info";

	const logger = createLogger({
		// level: "info",
		level: logLevel,
		format: format.combine(
			format.timestamp(),
			format.prettyPrint()
		),
		defaultMeta: { service: name },
		transports: [
			infoTransport
		],
	});


	// If we're not in production then log to the `console` with the format:
	// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `

	if (env === "development") {
		console.log("Making console logger");
		logger.add(new winston.transports.Console({
			format: winston.format.simple(),
			consoleWarnLevels: ["debug"]
		}));
		logger.debug("In Development Mode");
	}

	infoTransport.on("rotate", function (oldFilename, newFilename) {
		logger.info(`Changing Files from ${oldFilename} to ${newFilename}`);
	});
	return logger;
}
export default setLogger;