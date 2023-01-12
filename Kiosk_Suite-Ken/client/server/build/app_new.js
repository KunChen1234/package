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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main File for the Kiosk Backend system
 */
// Set env to production if no env variable is set
const args_parser_1 = __importDefault(require("./args_parser"));
const args = (0, args_parser_1.default)(process.argv);
if (args.node_env && typeof args.node_env === "string") {
    process.env.NODE_ENV = args.node_env;
}
else if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
}
const node_events_1 = require("node:events");
const dotenv = __importStar(require("dotenv")); // Module allows loading of the .env file
dotenv.config({ debug: true }); // Loads the options stored in the local .env file
const serialport_1 = __importDefault(require("serialport"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const client_1 = require("@prisma/client");
// import readline from "readline";
const short_uuid_1 = __importDefault(require("short-uuid"));
const config_1 = __importDefault(require("config"));
const config_2 = __importDefault(require("./config"));
// import WsClient from "../types/websocket";
const id = (0, config_2.default)(); // Call setConfigs
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)();
logger.info("New Instance Created");
// Create a new prisma client to connect to the database
const prisma = new client_1.PrismaClient();
let currentUser = null;
const internalEvents = new node_events_1.EventEmitter;
// type WsServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
/**
 * Opens the USB port for communication
 * @param {string} port The name of the USB port the scanner is connected
 * @returns {SerialPort} The SerialPort object to interface with the NFC scanner
 */
function openComPort(port) {
    const comPort = new serialport_1.default(port, (err) => {
        if (err) {
            console.error(err.message);
            console.log("Unable to open serial port, exiting");
            process.exit(1);
        }
    });
    return comPort;
}
/**
 * Error callback to handle errors generated in serial communication
 * @param {Error | null | undefined} err The error object generated.
 * @returns
 */
function spErrCB(err) {
    if (err) {
        console.error(err.message);
        console.log("Unable to write to SerialPort");
    }
    return;
}
/**
 * Write command to NFC scanner and await the data returned.
 * @param {SerialPort} comPort SerialPort object connected to the USB NFC reader
 * @param {string} command The command to write to the NFC reader as buffer converted to a hex string
 * @returns {Buffer | Error | null | undefined} Buffer of the result from the reader. Otherwise Error or null if command failed.
 */
function command(comPort, command, dataParser) {
    return __awaiter(this, void 0, void 0, function* () {
        // Pipe the data through a parser until it finds the "\r" character. 
        // const dataParser = comPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
        console.log("Promise Made");
        return new Promise((resolve) => {
            comPort.write(command);
            dataParser.once("data", (data) => {
                console.log("Promise Resolved");
                resolve(data);
            });
            // dataParser.once("error", (err: Error | null | undefined) => {
            // 	spErrCB(err);
            // 	console.log("Promise Rejected")
            // 	reject(err);
            // });
        });
    });
}
/**
 *
 * @param {SerialPort} comPort The SerialPort object connected to the TWN4 scanner
 * @returns {Boolean} Boolean of whether a tag was detected or not. On an unresolvable output False is returned
 */
function scanTag(comPort, dataParser) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            comPort.write("050010\r");
            dataParser.once("data", (data) => {
                if (data.subarray(0, 4).toString() === "0001") {
                    resolve({ result: true, tagId: data.subarray(4, data.length).toString() });
                }
                else if (data.subarray(0, 4).toString() === "0000") {
                    resolve({ result: false, tagId: null });
                }
                else {
                    console.error("Unable to resolve output.");
                    // console.log("Promise Rejected");
                    reject("Unable to resolve output.");
                }
            });
        });
    });
}
function asyncRead(comPort, dataParser) {
    return __awaiter(this, void 0, void 0, function* () {
        yield command(comPort, "041007\r", dataParser);
        yield command(comPort, "041101\r", dataParser);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const { result, tagId } = yield scanTag(comPort, dataParser);
                if (result && tagId) {
                    yield command(comPort, "041107\r", dataParser);
                    const data = yield command(comPort, "20020420\r", dataParser); // Read data encoded in tag
                    if (data && Buffer.isBuffer(data) && data.subarray(0, 4).toString() === "0001" && data.length > 4) {
                        const converted = Buffer.from(data.toString(), "hex");
                        const start = converted.toString().indexOf("{");
                        const end = converted.toString().lastIndexOf("}");
                        const strCon = converted.subarray(start, end + 1).toString("utf8").replace(/\0/g, "");
                        try {
                            return [tagId, JSON.parse(strCon)];
                        }
                        catch (err) {
                            yield command(comPort, "0407646006E3000400\r", dataParser); // Short high Beep
                            yield command(comPort, "0407646004F401F401\r", dataParser); // long low Beep
                            yield command(comPort, "041207\r", dataParser);
                            console.error(err);
                        }
                    }
                    else {
                        yield command(comPort, "0407646006E3000400\r", dataParser); // Short high Beep
                        yield command(comPort, "0407646004F401F401\r", dataParser); // long low Beep
                        yield command(comPort, "041207\r", dataParser);
                        console.log("Failed to Read Tag data");
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    });
}
function isRoobuckTag(obj) {
    if (obj && typeof obj === "object") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parse = obj;
        return parse && typeof parse === "object" && !Array.isArray(parse) &&
            parse.MAC && typeof parse.MAC === "string" && parse.SN &&
            typeof parse.SN === "string";
    }
    else {
        return false;
    }
}
function connectDb(prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        //Connect to the database
        yield prisma.$connect().then(() => {
            logger.debug("Connected To the Database");
        }).catch((err) => {
            logger.error(err.message);
            logger.info("Unable to connect to database. Disconnecting");
            process.exit(1);
        });
        return;
    });
}
function httpCB(req, res) {
    // Callback for receiving an HTTP request
    // Default behaviour is to return error code 404
    logger.info(`${new Date()} Received request for ${req.url}`);
    res.writeHead(404);
    res.end();
}
function wsConnectCB(client) {
    client.data.id = short_uuid_1.default.uuid();
    client.data.timeOfConnection = new Date();
    logger.info(`New id ${client.data.id} generated at ${client.data.timeOfConnection.toLocaleString()}`);
    client.on("removeDevice", (serialNumber, devices) => __awaiter(this, void 0, void 0, function* () {
        logger.debug("Remove Device");
        if (currentUser) {
            devices = devices.filter(obj => {
                return obj.serialNumber !== serialNumber;
            });
            const rfidList = devices.flatMap(obj => {
                return obj.rfid ? [obj.rfid] : [];
            });
            const user = yield prisma.users.update({
                where: {
                    userId: currentUser
                },
                data: {
                    associatedDevices: rfidList
                }
            });
            logger.debug(JSON.stringify(user));
            client.emit("assetScanData", devices);
        }
    }));
    client.on("disconnect", () => {
        logger.info(`Client ${client.data.id} disconnected`);
    });
    client.on("shutdown", (callback) => {
        callback(true);
        logger.info("Shutdown request received. Closing.");
        internalEvents.emit("shutdown");
    });
}
function wsConnectErrorCB(err) {
    logger.error(err.message);
    // logger.info(err.req);      // the request object  
    // logger.info(err.code);     // the error code, for example 1  
    // logger.info(err.message);  // the error message, for example "Session ID unknown"  
    // logger.info(err.context);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = (0, args_parser_1.default)(process.argv);
        let port;
        let tcpPort;
        if (args["port"] && typeof args["port"] === "string") {
            port = args["port"];
            logger.info("COM Port loaded from runtime arguments");
        }
        else if (config_1.default.get("comPort") && typeof config_1.default.get("comPort") === "string") {
            logger.info("COM Port loaded from configurations");
            port = config_1.default.get("comPort");
        }
        else {
            logger.warn("No configuration set for COM Port. Using default port (COM17) instead.");
            port = "COM17";
        }
        if ((args.tcpPort) && (typeof (args.tcpPort) === "string")) {
            tcpPort = parseInt(args.tcpPort);
            logger.info("TCP Port loaded from arguments.");
            if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
                tcpPort = 14400;
                logger.warn("Unable to pass TCP Port, using default 14400 instead.");
            }
        }
        else if (config_1.default.get("tcpPort") && typeof config_1.default.get("tcpPort") === "string") {
            tcpPort = config_1.default.get("tcpPort");
            logger.info("TCP Port loaded from configuration file.");
            if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
                tcpPort = 14400;
                logger.warn("Unable to pass TCP Port, using default 14400 instead.");
            }
        }
        else {
            logger.warn("TCP Port not configured. Using default instead");
            tcpPort = 14000;
        }
        yield connectDb(prisma);
        const httpServer = http_1.default.createServer(httpCB);
        httpServer.listen(tcpPort, () => {
            logger.debug(`${new Date()} Server is listening on port ${tcpPort}`);
        });
        const wsServer = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "http://localhost:14001",
                methods: ["GET", "POST"]
            }
        });
        const comPort = openComPort(port);
        // comPort.setMaxListeners(20);
        const dataParser = comPort.pipe(new serialport_1.default.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
        // dataParser.setMaxListeners(20);
        let runLoop = true;
        comPort.on("open", () => __awaiter(this, void 0, void 0, function* () {
            internalEvents.on("shutdown", () => {
                logger.info("Close command received. Exiting.");
                runLoop = false;
            });
            // eslint-disable-next-line no-constant-condition
            while (runLoop) {
                const [tagId, tagData] = yield asyncRead(comPort, dataParser);
                if (tagData && isRoobuckTag(tagData)) {
                    const tag = yield prisma.rfidTags.upsert({
                        where: {
                            rfidTagId: tagId
                        },
                        update: {
                            lastScannedTime: new Date(),
                            lastScannedLocation: `Kiosk_${id}`
                        },
                        create: {
                            rfidTagId: tagId,
                            tagType: "Test Tag",
                            serialNumber: tagData["SN"],
                            macAddress: tagData["MAC"],
                            lastScannedTime: new Date(),
                            lastScannedLocation: `Kiosk_${id}`
                        }
                    });
                    if (tag.createdAt === tag.updatedAt) {
                        logger.info("Roobuck tag added into database");
                    }
                }
                else if (tagData) {
                    // Do Something Else
                }
                else {
                    logger.error("Tag read failed");
                }
            }
        }));
        comPort.on("data", (data) => {
            console.log(data);
        });
        comPort.on("error", spErrCB);
        wsServer.on("connect", wsConnectCB);
        wsServer.engine.on("connection_error", wsConnectErrorCB);
        return;
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=app_new.js.map