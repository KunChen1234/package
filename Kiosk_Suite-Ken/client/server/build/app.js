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
const dotenv = __importStar(require("dotenv")); // Module allows loading of the .env file
dotenv.config({ debug: true }); // Loads the options stored in the local .env file
const serialport_1 = __importDefault(require("serialport"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const os_1 = require("os");
const client_1 = require("@prisma/client");
const readline_1 = __importDefault(require("readline"));
const short_uuid_1 = __importDefault(require("short-uuid"));
const config_1 = __importDefault(require("config"));
const parseData_1 = __importDefault(require("./parseData"));
const sleep_1 = __importDefault(require("./sleep"));
const config_2 = __importDefault(require("./config"));
// import WsClient from "../types/websocket";
(0, config_2.default)(); // Call setConfigs
const logger_1 = __importDefault(require("./logger"));
const logger = (0, logger_1.default)();
logger.info("New Instance Created");
// Create a new prisma client to connect to the database
const prisma = new client_1.PrismaClient();
let currentUser = null;
// type WsServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
/**
 * Opens the USB port for communication
 * @param {string} port The name of the USB port the scanner is connected
 * @returns {SerialPort} The SerialPort object to interface with the NFC scanner
 */
function openComPort(port) {
    const comPort = new serialport_1.default(port, (err) => {
        if (err) {
            logger.error(err.message);
            logger.info("Unable to open serial port, exiting");
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let tcpPort;
        // Use the TCP Port defined in runtime args. If not defined use preset 14000
        let runLoop = true;
        let pending = false;
        let readTag = false;
        let tag = null;
        let tagId = null;
        // TODO #2 Compare runtime args and envvars, move default to envvar.
        if ((args.tcpPort) && (typeof (args.tcpPort) === "string")) {
            tcpPort = parseInt(args.tcpPort);
        }
        else {
            tcpPort = 14000;
        }
        const nets = (0, os_1.networkInterfaces)();
        const results = Object.create(null); // Or just '{}', an empty object
        // Loop over interfaces to select the current IPv4 Network.
        for (const name of Object.keys(nets)) {
            const netobj = Object.create(nets); // Keeps typescript happy, must be run here inside the loop
            for (const net of netobj[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === "IPv4" && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        let nwInterface;
        console.log(config_1.default.get("nwInterface"));
        if (config_1.default.get("nwInterface") && typeof config_1.default.get("nwInterface") === "string") {
            nwInterface = config_1.default.get("nwInterface");
        }
        else {
            nwInterface = "eth0";
        }
        let ipAddress;
        if (results[nwInterface]) {
            ipAddress = results[nwInterface][0];
        }
        else {
            logger.error(`Network Interface ${nwInterface} not found.`);
            ipAddress = "0.0.0.0";
        }
        logger.debug(`This machine is: ${ipAddress}`);
        yield connectDb(prisma);
        const httpServer = http_1.default.createServer(httpCB);
        httpServer.listen(tcpPort, () => {
            logger.debug(`${new Date()} Server is listening on port ${tcpPort}`);
        });
        const wsServer = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        wsServer.on("connect", wsConnectCB);
        wsServer.engine.on("connection_error", wsConnectErrorCB);
        let _port;
        if (config_1.default.get("comPort") && typeof config_1.default.get("comPort") === "string") {
            _port = config_1.default.get("comPort");
        }
        else {
            _port = "COM1";
        }
        const comPort = openComPort(_port);
        const dataParser = comPort.pipe(new serialport_1.default.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
        comPort.on("open", () => {
            console.log("Port Opened");
        });
        dataParser.on("data", (data) => __awaiter(this, void 0, void 0, function* () {
            pending = true;
            [tagId, readTag, tag] = yield (0, parseData_1.default)(data, readTag, tagId, ipAddress, prisma, comPort);
            logger.debug(`${tagId}, ${tag}, ${readTag}`);
            if (tag && currentUser && (tag.tagType === "Test Tag" || tag.tagType === "Caplamp")) {
                const userData = yield prisma.users.update({
                    where: {
                        userId: currentUser
                    },
                    data: {
                        associatedDevices: {
                            push: tag.rfidTagId
                        }
                    }
                });
                const devices = yield prisma.deviceInfo.findMany({
                    where: {
                        rfid: { in: userData.associatedDevices }
                    }
                });
                logger.info("Posting Asset Data");
                wsServer.emit("assetScanData", devices);
                tag = null;
                tagId = null;
            }
            else if (tag && tagId && tag.tagType === "idCard") {
                const userData = yield prisma.users.findUnique({
                    where: {
                        idTag: tagId
                    }
                });
                if (userData) {
                    const associatedDevices = yield prisma.deviceInfo.findMany({
                        where: {
                            rfid: { in: userData.associatedDevices }
                        }
                    });
                    currentUser = userData.userId;
                    logger.info("Posting User Data");
                    wsServer.emit("userScanData", userData, associatedDevices);
                }
                tag = null;
                tagId = null;
            }
            pending = false;
        }));
        readline_1.default.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on("keypress", (str, key) => {
            logger.debug(str);
            if (key.name === "q") {
                runLoop = false;
                console.log("Ending Process. Precess CTRL+C to exit.");
            }
            else if (key.name === "c" && key.ctrl === true) {
                logger.info("Exiting...");
                process.exit(0);
            }
        });
        while (runLoop) {
            console.log("loop");
            console.log(pending);
            console.log(Array.from(wsServer.sockets.sockets.keys()));
            if (readTag) {
                comPort.write("20020410\r", spErrCB);
                console.log(`Write Tag: ${readTag}, tagId: ${tagId}`);
                setTimeout(() => {
                    readTag = false;
                    tagId = null;
                }, 5000);
                yield (0, sleep_1.default)(5000);
            }
            else if (pending) {
                console.log("PENDING");
                console.log(pending);
                yield (0, sleep_1.default)(500);
            }
            else {
                yield (0, sleep_1.default)(500);
                if (!pending) {
                    console.log("SEARCH TAGS");
                    comPort.write("050010\r", spErrCB); // Search for NFC tags
                    yield (0, sleep_1.default)(2500);
                }
            }
        }
        return;
    });
}
// function errorCallback(err: Error | null | undefined) {
// 	if (err) {
// 		logger.error(err.message);
// 	}
// }
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
}
function wsConnectErrorCB(err) {
    logger.error(err.message);
    // logger.info(err.req);      // the request object  
    // logger.info(err.code);     // the error code, for example 1  
    // logger.info(err.message);  // the error message, for example "Session ID unknown"  
    // logger.info(err.context);
}
main();
//# sourceMappingURL=app.js.map