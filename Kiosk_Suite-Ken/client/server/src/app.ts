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
// import * as dotenv from "dotenv"; // Module allows loading of the .env file
// dotenv.config({ debug: true }); // Loads the options stored in the local .env file
// import SerialPort from "serialport";
// import { Server, Socket } from "socket.io";
// import http from "http";
// import { networkInterfaces } from "os";
// import { DeviceInfo, PrismaClient, RfidTags, Users } from "@prisma/client";
// import readline from "readline";
// import shortUUID from "short-uuid";
// import nodeConfig from "config";
// import parseData from "./parseData";
// import sleep from "./sleep";
// import setConfigs from "./config";
// // import WsClient from "../types/websocket";
// setConfigs(); // Call setConfigs
// import setLogger from "./logger";
// const logger = setLogger();
// logger.info("New Instance Created");
// // Create a new prisma client to connect to the database
// const prisma = new PrismaClient();
// let currentUser: string | null = null;

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
// }
// interface InterServerEvents {
// 	ping: () => void;
// }
// interface SocketData {
// 	id: string;
// 	timeOfConnection: Date;
// }

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
// 			logger.error(err.message);
// 			logger.info("Unable to open serial port, exiting");
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

// async function main(): Promise<void> {
// 	let tcpPort: number;
// 	// Use the TCP Port defined in runtime args. If not defined use preset 14000

// 	let runLoop = true;
// 	let pending = false;
// 	let readTag = false;
// 	let tag: RfidTags | null = null;
// 	let tagId: string | null = null;
// 	// TODO #2 Compare runtime args and envvars, move default to envvar.
// 	if ((args.tcpPort) && (typeof (args.tcpPort) === "string")) {
// 		tcpPort = parseInt(args.tcpPort);
// 	} else {
// 		tcpPort = 14000;
// 	}

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

// 	await connectDb(prisma);

// 	const httpServer = http.createServer(httpCB);
// 	httpServer.listen(tcpPort, () => {
// 		logger.debug(`${new Date()} Server is listening on port ${tcpPort}`);
// 	});
// 	const wsServer = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
// 		cors: {
// 			origin: "http://localhost:3000",
// 			methods: ["GET", "POST"]
// 		}
// 	});
// 	wsServer.on("connect", wsConnectCB);

// 	wsServer.engine.on("connection_error", wsConnectErrorCB);
// 	let _port: string;
// 	if (nodeConfig.get("comPort") && typeof nodeConfig.get("comPort") === "string") {
// 		_port = nodeConfig.get("comPort");
// 	} else {
// 		_port = "COM1";
// 	}
// 	const comPort = openComPort(_port);
// 	const dataParser = comPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
// 	comPort.on("open", () => {
// 		console.log("Port Opened");
// 	});
// 	dataParser.on("data", async (data) => {
// 		pending = true;
// 		[tagId, readTag, tag] = await parseData(data, readTag, tagId, ipAddress, prisma, comPort);
// 		logger.debug(`${tagId}, ${tag}, ${readTag}`);
// 		if (tag && currentUser && (tag.tagType === "Test Tag" || tag.tagType === "Caplamp")) {
// 			const userData = await prisma.users.update({
// 				where: {
// 					userId: currentUser
// 				},
// 				data: {
// 					associatedDevices: {
// 						push: tag.rfidTagId
// 					}
// 				}
// 			});
// 			const devices = await prisma.deviceInfo.findMany({
// 				where: {
// 					rfid: { in: userData.associatedDevices }
// 				}
// 			});
// 			logger.info("Posting Asset Data");
// 			wsServer.emit("assetScanData", devices);
// 			tag = null;
// 			tagId = null;
// 		} else if (tag && tagId && tag.tagType === "idCard") {
// 			const userData = await prisma.users.findUnique({
// 				where: {
// 					idTag: tagId
// 				}
// 			});
// 			if (userData) {
// 				const associatedDevices = await prisma.deviceInfo.findMany({
// 					where: {
// 						rfid: { in: userData.associatedDevices }
// 					}
// 				});
// 				currentUser = userData.userId;
// 				logger.info("Posting User Data");
// 				wsServer.emit("userScanData", userData, associatedDevices);
// 			}
// 			tag = null;
// 			tagId = null;
// 		}
// 		pending = false;
// 	});

// 	readline.emitKeypressEvents(process.stdin);
// 	process.stdin.setRawMode(true);

// 	process.stdin.on("keypress", (str, key) => {
// 		logger.debug(str);
// 		if (key.name === "q") {
// 			runLoop = false;
// 			console.log("Ending Process. Precess CTRL+C to exit.");
// 		} else if (key.name === "c" && key.ctrl === true) {
// 			logger.info("Exiting...");
// 			process.exit(0);
// 		}

// 	});

// 	while (runLoop) {
// 		/**
// 		 * const tagData = await readTag();
// 		 * // DO Something -> check if roobuck tag or ID Card
// 		 * // Record Scan to DB
// 		 * // use Websockets to transmit to frontend
// 		 * // Await second tag scan
// 		 * // Record Scan to DB
// 		 * // Associate ID CArd and Roobuck Tag in Database
// 		 * // Clear tags scanned, returtn to top
// 		 */

// 		// const results = await readTag();
// 		if (results) {
// 			//DO Things
// 		}

// 		console.log("loop");
// 		console.log(pending);
// 		console.log(Array.from(wsServer.sockets.sockets.keys()));
// 		if (readTag) {
// 			comPort.write("20020410\r", spErrCB);
// 			console.log(`Write Tag: ${readTag}, tagId: ${tagId}`);
// 			setTimeout(() => {
// 				readTag = false;
// 				tagId = null;
// 			}, 5000);
// 			await sleep(5000);
// 		} else if (pending) {
// 			console.log("PENDING");
// 			console.log(pending);
// 			await sleep(500);
// 		} else {
// 			await sleep(500);
// 			if (!pending) {
// 				console.log("SEARCH TAGS");
// 				comPort.write("050010\r", spErrCB); // Search for NFC tags
// 				await sleep(2500);
// 			}
// 		}
// 	}
// 	return;
// }

// // function errorCallback(err: Error | null | undefined) {
// // 	if (err) {
// // 		logger.error(err.message);
// // 	}
// // }

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
// }
// function wsConnectErrorCB(err: Error) {
// 	logger.error(err.message);
// 	// logger.info(err.req);      // the request object  
// 	// logger.info(err.code);     // the error code, for example 1  
// 	// logger.info(err.message);  // the error message, for example "Session ID unknown"  
// 	// logger.info(err.context);
// }

// main();
