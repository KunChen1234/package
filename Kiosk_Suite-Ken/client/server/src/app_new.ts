// "use strict";
// /**
//  * Main File for the Kiosk Backend system
//  */
// // Set env to production if no env variable is set
// import parser from "./args_parser";
// const args = parser(process.argv);
// if (args.node_env && typeof args.node_env === "string") {
// 	process.env.NODE_ENV = args.node_env;
// } else if (!process.env.NODE_ENV) {
// 	process.env.NODE_ENV = "production";
// }
// import { EventEmitter } from "node:events";
// import * as dotenv from "dotenv"; // Module allows loading of the .env file
// dotenv.config({ debug: true }); // Loads the options stored in the local .env file
// import SerialPort from "serialport";
// import { Server, Socket } from "socket.io";
// import http from "http";
// import { networkInterfaces } from "os";
// import { DeviceInfo, PrismaClient, RfidTags, Users } from "@prisma/client";
// // import readline from "readline";
// import shortUUID from "short-uuid";
// import nodeConfig from "config";
// import parseData from "./parseData";
// import sleep from "./sleep";
// import setConfigs from "./config";
// // import WsClient from "../types/websocket";
// const id = setConfigs(); // Call setConfigs
// import setLogger from "./logger";
// const logger = setLogger();
// logger.info("New Instance Created");
// // Create a new prisma client to connect to the database
// const prisma = new PrismaClient();
// let currentUser: string | null = null;

// interface RoobuckTag {
// 	MAC: string;
// 	SN: string;
// }
// /* Define interfaces for the socket.io websocket. All events emitted and received
//  * must be of the types, which are cattegorised as one of the following:
//  * server -> client
//  * client -> server
//  * server -> server
//  * We also define the socketData interface to associate an id and time of connection
//  * for the clients.
//  */
// interface ServerToClientEvents {
// 	noArg: () => void;
// 	sendId: (clientId: string) => void;
// 	userScanData: (
// 		tagData: Users,
// 		associatedDevices: DeviceInfo[]
// 	) => void;
// 	assetScanData: (devices: DeviceInfo[]) => void;
// }
// interface ClientToServerEvents {
// 	hello: () => void;
// 	connection_error: (err: unknown) => void;
// 	removeDevice: (
// 		serialNumber: string,
// 		devices: DeviceInfo[]
// 	) => void;
// 	shutdown: (callback: (arg0: boolean) => void) => void;
// }
// interface InterServerEvents {
// 	ping: () => void;
// }
// interface SocketData {
// 	id: string;
// 	timeOfConnection: Date;
// }

// const internalEvents = new EventEmitter;

// // We create a type WsClient to simplify references to the client typing using the
// // above interfaces.

// type WsClient = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
// // type WsServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

// /**
//  * Opens the USB port for communication
//  * @param {string} port The name of the USB port the scanner is connected 
//  * @returns {SerialPort} The SerialPort object to interface with the NFC scanner
//  */
// function openComPort(port: string): SerialPort {
// 	const comPort = new SerialPort(port, (err: Error | null | undefined) => {
// 		if (err) {
// 			console.error(err.message);
// 			console.log("Unable to open serial port, exiting");
// 			process.exit(1);
// 		}
// 	});
// 	return comPort;
// }

// /**
//  * Error callback to handle errors generated in serial communication
//  * @param {Error | null | undefined} err The error object generated.
//  * @returns 
//  */
// function spErrCB(err: Error | null | undefined): void {
// 	if (err) {
// 		console.error(err.message);
// 		console.log("Unable to write to SerialPort");
// 	}
// 	return;
// }

// /**
//  * Write command to NFC scanner and await the data returned.
//  * @param {SerialPort} comPort SerialPort object connected to the USB NFC reader
//  * @param {string} command The command to write to the NFC reader as buffer converted to a hex string
//  * @returns {Buffer | Error | null | undefined} Buffer of the result from the reader. Otherwise Error or null if command failed.
//  */
// async function command(comPort: SerialPort, command: string, dataParser: SerialPort.parsers.Delimiter): Promise<Buffer | Error | null | undefined> {
// 	// Pipe the data through a parser until it finds the "\r" character. 
// 	// const dataParser = comPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
// 	console.log("Promise Made");
// 	return new Promise((resolve) => {
// 		comPort.write(command);
// 		dataParser.once("data", (data: Buffer) => {
// 			console.log("Promise Resolved");
// 			resolve(data);
// 		});
// 		// dataParser.once("error", (err: Error | null | undefined) => {
// 		// 	spErrCB(err);
// 		// 	console.log("Promise Rejected")
// 		// 	reject(err);
// 		// });
// 	});
// }

// /**
//  * 
//  * @param {SerialPort} comPort The SerialPort object connected to the TWN4 scanner
//  * @returns {Boolean} Boolean of whether a tag was detected or not. On an unresolvable output False is returned
//  */
// async function scanTag(comPort: SerialPort, dataParser: SerialPort.parsers.Delimiter): Promise<{ result: boolean, tagId: string | null }> {
// 	return new Promise((resolve, reject) => {
// 		comPort.write("050010\r");
// 		dataParser.once("data", (data: Buffer) => {
// 			if (data.subarray(0, 4).toString() === "0001") {
// 				resolve({ result: true, tagId: data.subarray(4, data.length).toString() });
// 			} else if (data.subarray(0, 4).toString() === "0000") {
// 				resolve({ result: false, tagId: null });
// 			} else {
// 				console.error("Unable to resolve output.");
// 				// console.log("Promise Rejected");
// 				reject("Unable to resolve output.");
// 			}
// 		});
// 	});
// }

// async function asyncRead(comPort: SerialPort, dataParser: SerialPort.parsers.Delimiter): Promise<[string, unknown]> {
// 	await command(comPort, "041007\r", dataParser);
// 	await command(comPort, "041101\r", dataParser);
// 	// eslint-disable-next-line no-constant-condition
// 	while (true) {
// 		try {
// 			const { result, tagId } = await scanTag(comPort, dataParser);
// 			if (result && tagId) {
// 				await command(comPort, "041107\r", dataParser);
// 				const data = await command(comPort, "20020420\r", dataParser); // Read data encoded in tag
// 				if (data && Buffer.isBuffer(data) && data.subarray(0, 4).toString() === "0001" && data.length > 4) {
// 					const converted = Buffer.from(data.toString(), "hex");
// 					const start = converted.toString().indexOf("{");
// 					const end = converted.toString().lastIndexOf("}");
// 					const strCon = converted.subarray(start, end + 1).toString("utf8").replace(/\0/g, "");
// 					try {
// 						return [tagId, JSON.parse(strCon)];
// 					} catch (err) {
// 						await command(comPort, "0407646006E3000400\r", dataParser); // Short high Beep
// 						await command(comPort, "0407646004F401F401\r", dataParser); // long low Beep
// 						await command(comPort, "041207\r", dataParser);
// 						console.error(err);
// 					}
// 				} else {
// 					await command(comPort, "0407646006E3000400\r", dataParser); // Short high Beep
// 					await command(comPort, "0407646004F401F401\r", dataParser); // long low Beep
// 					await command(comPort, "041207\r", dataParser);
// 					console.log("Failed to Read Tag data");
// 				}
// 			}
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	}
// }

// function isRoobuckTag(obj: unknown): obj is RoobuckTag {
// 	if (obj && typeof obj === "object") {
// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 		const parse = obj as Record<string, any>;
// 		return parse && typeof parse === "object" && !Array.isArray(parse) &&
// 			parse.MAC && typeof parse.MAC === "string" && parse.SN &&
// 			typeof parse.SN === "string";
// 	} else {
// 		return false;
// 	}
// }

// async function connectDb(prisma: PrismaClient): Promise<void> {
// 	//Connect to the database
// 	await prisma.$connect().then(() => {
// 		logger.debug("Connected To the Database");
// 	}).catch((err: Error) => {
// 		logger.error(err.message);
// 		logger.info("Unable to connect to database. Disconnecting");
// 		process.exit(1);
// 	});
// 	return;
// }

// function httpCB(req: http.IncomingMessage, res: http.ServerResponse) {
// 	// Callback for receiving an HTTP request
// 	// Default behaviour is to return error code 404
// 	logger.info(`${new Date()} Received request for ${req.url}`);
// 	res.writeHead(404);
// 	res.end();
// }

// function wsConnectCB(client: WsClient) {
// 	client.data.id = shortUUID.uuid();
// 	client.data.timeOfConnection = new Date();
// 	logger.info(`New id ${client.data.id} generated at ${client.data.timeOfConnection.toLocaleString()}`);
// 	client.on("removeDevice", async (serialNumber: string, devices: DeviceInfo[]) => {
// 		logger.debug("Remove Device");
// 		if (currentUser) {
// 			devices = devices.filter(obj => {
// 				return obj.serialNumber !== serialNumber;
// 			});
// 			const rfidList: (string)[] = devices.flatMap(obj => {
// 				return obj.rfid ? [obj.rfid] : [];
// 			});
// 			const user = await prisma.users.update({
// 				where: {
// 					userId: currentUser
// 				},
// 				data: {
// 					associatedDevices: rfidList
// 				}
// 			});
// 			logger.debug(JSON.stringify(user));
// 			client.emit("assetScanData", devices);
// 		}
// 	});
// 	client.on("disconnect", () => {
// 		logger.info(`Client ${client.data.id} disconnected`);
// 	});
// 	client.on("shutdown", (callback: (arg0: boolean) => void) => {
// 		callback(true);
// 		logger.info("Shutdown request received. Closing.");
// 		internalEvents.emit("shutdown");
// 	});
// }
// function wsConnectErrorCB(err: Error) {
// 	logger.error(err.message);
// 	// logger.info(err.req);      // the request object  
// 	// logger.info(err.code);     // the error code, for example 1  
// 	// logger.info(err.message);  // the error message, for example "Session ID unknown"  
// 	// logger.info(err.context);
// }

// function getIp(): string {
// 	const nets = networkInterfaces();
// 	const results = Object.create(null); // Or just '{}', an empty object
// 	// Loop over interfaces to select the current IPv4 Network.
// 	for (const name of Object.keys(nets)) {
// 		const netobj = Object.create(nets); // Keeps typescript happy, must be run here inside the loop
// 		for (const net of netobj[name]) {
// 			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
// 			if (net.family === "IPv4" && !net.internal) {
// 				if (!results[name]) {
// 					results[name] = [];
// 				}
// 				results[name].push(net.address);
// 			}
// 		}
// 	}
// 	let nwInterface: string;
// 	console.log(nodeConfig.get("nwInterface"));
// 	if (nodeConfig.get("nwInterface") && typeof nodeConfig.get("nwInterface") === "string") {
// 		nwInterface = nodeConfig.get("nwInterface");
// 	} else {
// 		nwInterface = "eth0";
// 	}
// 	let ipAddress: string;
// 	if (results[nwInterface]) {
// 		ipAddress = results[nwInterface][0];
// 	} else {
// 		logger.error(`Network Interface ${nwInterface} not found.`);
// 		ipAddress = "0.0.0.0";
// 	}
// 	logger.debug(`This machine is: ${ipAddress}`);
// 	return ipAddress;
// }
// async function main() {
// 	const args = parser(process.argv);
// 	let port: string;
// 	let tcpPort: number;
// 	if (args["port"] && typeof args["port"] === "string") {
// 		port = args["port"];
// 		logger.info("COM Port loaded from runtime arguments");
// 	} else if (nodeConfig.get("comPort") && typeof nodeConfig.get("comPort") === "string") {
// 		logger.info("COM Port loaded from configurations");
// 		port = nodeConfig.get("comPort");
// 	} else {
// 		logger.warn("No configuration set for COM Port. Using default port (COM17) instead.");
// 		port = "COM17";
// 	}
// 	if ((args.tcpPort) && (typeof (args.tcpPort) === "string")) {
// 		tcpPort = parseInt(args.tcpPort);
// 		logger.info("TCP Port loaded from arguments.");
// 		if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
// 			tcpPort = 14400;
// 			logger.warn("Unable to pass TCP Port, using default 14400 instead.");
// 		}
// 	} else if (nodeConfig.get("tcpPort") && typeof nodeConfig.get("tcpPort") === "string") {
// 		tcpPort = nodeConfig.get("tcpPort");
// 		logger.info("TCP Port loaded from configuration file.");
// 		if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
// 			tcpPort = 14400;
// 			logger.warn("Unable to pass TCP Port, using default 14400 instead.");
// 		}
// 	} else {
// 		logger.warn("TCP Port not configured. Using default instead");
// 		tcpPort = 14000;
// 	}
// 	const ipAddress = getIp();
// 	await connectDb(prisma);

// 	const httpServer = http.createServer(httpCB);
// 	httpServer.listen(tcpPort, () => {
// 		logger.debug(`${new Date()} Server is listening on port ${tcpPort}`);
// 	});
// 	const wsServer = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
// 		cors: {
// 			origin: "http://localhost:14001",
// 			methods: ["GET", "POST"]
// 		}
// 	});

// 	const comPort = openComPort(port);
// 	// comPort.setMaxListeners(20);
// 	const dataParser = comPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
// 	// dataParser.setMaxListeners(20);
// 	let runLoop = true;
// 	comPort.on("open", async () => {
// 		internalEvents.on("shutdown", () => {
// 			logger.info("Close command received. Exiting.");
// 			runLoop = false;
// 		});
// 		// eslint-disable-next-line no-constant-condition
// 		while (runLoop) {
// 			const [tagId, tagData] = await asyncRead(comPort, dataParser);
// 			if (tagData && isRoobuckTag(tagData)) {
// 				const tag = await prisma.rfidTags.upsert({
// 					where: {
// 						rfidTagId: tagId
// 					},
// 					update: {
// 						lastScannedTime: new Date(),
// 						lastScannedLocation: `Kiosk_${id}`
// 					},
// 					create: {
// 						rfidTagId: tagId,
// 						tagType: "Roobuck Asset Tag",
// 						serialNumber: tagData["SN"],
// 						macAddress: tagData["MAC"],
// 						lastScannedTime: new Date(),
// 						lastScannedLocation: `Kiosk_${id}`
// 					}
// 				});
// 				if (tag.createdAt === tag.updatedAt) {
// 					logger.info("Roobuck tag added into database");
// 				}
// 				//Add to scan log;
// 				await prisma.rfidScanLog.create({
// 					data: {
// 						scannerId: `kiosk_${id}`,
// 						rfidTagId: tagId,
// 						ipAddress: ipAddress
// 					}
// 				});

// 			} else if (tagData) {
// 				// Do Something Else
// 			} else {
// 				logger.error("Tag read failed");
// 			}
// 		}
// 	});
// 	comPort.on("data", (data) => {
// 		console.log(data);
// 	});
// 	comPort.on("error", spErrCB);

// 	wsServer.on("connect", wsConnectCB);

// 	wsServer.engine.on("connection_error", wsConnectErrorCB);
// 	return;
// }

// if (require.main === module) {
// 	main();
// }
