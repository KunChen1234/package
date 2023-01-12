"use strict";
/**
 * Main File for the Kiosk Backend system
 */
// Set env to production if no env variable is set
import parser from "./args_parser";
const args = parser(process.argv);
if (args.node_env && typeof args.node_env === "string") {
    process.env.NODE_ENV = args.node_env;
} else if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
}
import { EventEmitter } from "node:events";
import * as dotenv from "dotenv"; // Module allows loading of the .env file
dotenv.config({ debug: true }); // Loads the options stored in the local .env file
import { Server, Socket } from "socket.io";
import http from "http";
import { networkInterfaces } from "os";
import { PrismaClient } from "@prisma/client";
// import readline from "readline";
import shortUUID from "short-uuid";
import nodeConfig from "config";
// import setConfigs from "./config";
// import WsClient from "../types/websocket";
// const id = setConfigs(); // Call setConfigs
import setLogger from "./logger";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./wsEvent";
import { openComPort, readTag } from "@roobuck-rnd/nfc_tools";
import SelectPersonInfoByID from "./database_function/User_select";
import { PeopleInfoTag } from "./typeguards/PeopleInfoTag";
import Tag_parser from "./parseData";

import io from "socket.io-client"
import { TagBoardInfo } from "./typeguards/TagBoardInfo";
import LoginInfoForSaving from "./typeguards/FormUsedForSaveLoginInfo";
import Login from "./database_function/saveDataInLoginTable";
import checkLamp from "./database_function/checkLamp";
import connectDb from "./IsdatabaseConnect";
import getLoginInfoByID from "./database_function/checkUser";
import { cli } from "winston/lib/winston/config";
import logout from "./database_function/Logout";
import updateSignInInfo from "./database_function/updateLoginInfo";



const socketToTagboardServer = io("http://localhost:8080", {
    // withCredentials: true,
    extraHeaders: {
        "roobuck-client": "Kiosk"
    }
});

const logger = setLogger("app_new1.js");
logger.info("New Instance Created");
// Create a new prisma client to connect to the database
const prisma = new PrismaClient();
let currentUser: string | null = null;

interface RoobuckTag {
    MAC: string;
    SN: string;
}


const internalEvents = new EventEmitter;

// We create a type WsClient to simplify references to the client typing using the
// above interfaces.

type WsClient = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
// type WsServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>


/**
 * Error callback to handle errors generated in serial communication
 * @param {Error | null | undefined} err The error object generated.
 * @returns 
 */
function spErrCB(err: Error | null | undefined): void {
    if (err) {
        console.error(err.message);
        console.log("Unable to write to SerialPort");
    }
    return;
}

function httpCB(req: http.IncomingMessage, res: http.ServerResponse) {
    // Callback for receiving an HTTP request
    // Default behaviour is to return error code 404
    logger.info(`${new Date()} Received request for ${req.url}`);
    res.writeHead(404);
    res.end();
}

function wsConnectCB(client: WsClient) {
    client.data.id = shortUUID.uuid();
    client.data.timeOfConnection = new Date();
    logger.info(`New id ${client.data.id} generated at ${client.data.timeOfConnection.toLocaleString()}`);
    // client.on("removeDevice", async (serialNumber: string, devices: DeviceInfo[]) => {
    //     logger.debug("Remove Device");
    //     if (currentUser) {
    //         devices = devices.filter(obj => {
    //             return obj.serialNumber !== serialNumber;
    //         });
    //         const rfidList: (string)[] = devices.flatMap(obj => {
    //             return obj.rfid ? [obj.rfid] : [];
    //         });
    //         const user = await prisma.users.update({
    //             where: {
    //                 userId: currentUser
    //             },
    //             data: {
    //                 associatedDevices: rfidList
    //             }
    //         });
    //         logger.debug(JSON.stringify(user));
    //         client.emit("assetScanData", devices);
    //     }
    // });
    client.on("getNewSignInInfo", (userInfo, deviceInfo) => {
        console.log("get info from client")
        // logger.debug(userInfo);
        // logger.debug(deviceInfo);
    })
    client.on("disconnect", () => {
        logger.info(`Client ${client.data.id} disconnected`);
    });
    client.on("shutdown", (callback: (arg0: boolean) => void) => {
        callback(true);
        logger.info("Shutdown request received. Closing.");
        internalEvents.emit("shutdown");
    });
}
function wsConnectErrorCB(err: Error) {
    logger.error(err.message);
    // logger.info(err.req);      // the request object  
    // logger.info(err.code);     // the error code, for example 1  
    // logger.info(err.message);  // the error message, for example "Session ID unknown"  
    // logger.info(err.context);
}

function getIp(): string {
    const nets = networkInterfaces();
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
    let nwInterface: string;
    console.log(nodeConfig.get("nwInterface"));
    if (nodeConfig.get("nwInterface") && typeof nodeConfig.get("nwInterface") === "string") {
        nwInterface = nodeConfig.get("nwInterface");
    } else {
        nwInterface = "eth0";
    }
    let ipAddress: string;
    if (results[nwInterface]) {
        ipAddress = results[nwInterface][0];
    } else {
        logger.error(`Network Interface ${nwInterface} not found.`);
        ipAddress = "0.0.0.0";
    }
    logger.debug(`This machine is: ${ipAddress}`);
    return ipAddress;
}

async function main() {
    const args = parser(process.argv);
    let tcpPort: number;
    if ((args.tcpPort) && (typeof (args.tcpPort) === "string")) {
        tcpPort = parseInt(args.tcpPort);
        logger.info("TCP Port loaded from arguments.");
        if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
            tcpPort = 14400;
            logger.warn("Unable to pass TCP Port, using default 14400 instead.");
        }
    } else if (nodeConfig.get("tcpPort") && typeof nodeConfig.get("tcpPort") === "number") {
        tcpPort = nodeConfig.get("tcpPort");
        logger.info("TCP Port loaded from configuration file.");
        if (isNaN(tcpPort) || tcpPort < 1024 || tcpPort > 65535) {
            tcpPort = 14400;
            logger.warn("Unable to pass TCP Port, using default 14400 instead.");
        }
    } else {
        logger.warn("TCP Port not configured. Using default instead");
        tcpPort = 14000;
    }
    await connectDb(prisma);

    // const tcpPort = 14000;
    const httpServer = http.createServer(httpCB);
    httpServer.listen(tcpPort, () => {
        logger.debug(`${new Date()} Server is listening on port ${tcpPort}`);
    });
    const wsServer = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
        cors: {
            origin: "http://localhost:5000",
            methods: ["GET", "POST"]
        }
    });

    wsServer.on("connect", (client) => {
        /**
         * After client click "finish" button, all information will be saved in Login Table.
         */
        client.on("getNewSignInInfo", async (userInfo, deviceInfo) => {

            if (userInfo.ID && deviceInfo.MAC && deviceInfo.SN) {
                var date = new Date();
                var dateForSave = Intl.DateTimeFormat("en-UK", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
                var time = Intl.DateTimeFormat("en-UK", { hour: "2-digit", minute: "2-digit" }).format(date);
                var loginInfo: LoginInfoForSaving = {
                    userID: userInfo.ID,
                    LoginTime: dateForSave,
                    LampMAC: deviceInfo.MAC,
                    LampSN: deviceInfo.SN,
                    isDayShift: undefined
                }
                logger.debug("loginInfo");
                console.log(loginInfo)
                if (time >= "04:00:00" && time <= "16:00:00") {
                    loginInfo.isDayShift = true;
                }
                else {
                    loginInfo.isDayShift = false;
                }
                await Login(loginInfo, prisma);
                socketToTagboardServer.emit("newUserLogin", loginInfo.LampSN);
            }

        });
        client.on("updateSignInInfo", async (userInfo, deviceInfo) => {

            if (userInfo.ID && deviceInfo.MAC && deviceInfo.SN) {
                var date = new Date();
                var dateForSave = Intl.DateTimeFormat("en-UK", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
                var time = Intl.DateTimeFormat("en-UK", { hour: "2-digit", minute: "2-digit" }).format(date);
                var loginInfo: LoginInfoForSaving = {
                    userID: userInfo.ID,
                    LoginTime: dateForSave,
                    LampMAC: deviceInfo.MAC,
                    LampSN: deviceInfo.SN,
                    isDayShift: undefined
                }
                if (time >= "04:00:00" && time <= "16:00:00") {
                    loginInfo.isDayShift = true;
                }
                else {
                    loginInfo.isDayShift = false;
                }
                await updateSignInInfo(loginInfo, prisma);
                socketToTagboardServer.emit("newUserLogin", loginInfo.LampSN);
            }

        });
        // Logout From user management
        client.on("Logout", async (msg) => {
            await logout(prisma, msg);
            socketToTagboardServer.emit("Logout");
        })
    })





    var loop = true;
    const serialport = await openComPort();
    const path = serialport[0];
    const dataParser = serialport[1];
    while (loop) {
        if (dataParser) {
            var resultOfScanner = await readTag(path, dataParser);
            if (resultOfScanner) {
                var result = JSON.parse(Tag_parser(resultOfScanner));
                // console.log(result);
                if (result.ID) {

                    /*
                    *get information from database
                    */
                    var loginInfo = await getLoginInfoByID(prisma, result.ID);
                    if (loginInfo) {
                        // logger.debug("Already Login");
                        const user: TagBoardInfo = {
                            person: {
                                ID: loginInfo.userID.toString(),
                                section: loginInfo.User?.areaName,
                                firstName: loginInfo.User?.firstName,
                                lastName: loginInfo.User?.lastName,
                                job: loginInfo.User?.job,
                                photo: loginInfo.User?.photo,
                                departmentName: loginInfo.User?.departmentName
                            },
                            lamp: { SN: loginInfo.LampSN.toString(), MAC: loginInfo.LampMAC.toString(), Bssid: null, ChargingStatus: null, updateTime: undefined }
                        }
                        wsServer.emit("userManagement", user);
                    }
                    else {
                        var dataFromdatabase = await SelectPersonInfoByID(prisma, result.ID);
                        //  && CheckID
                        if (dataFromdatabase) {
                            // var date = new Date()
                            var newpeople: PeopleInfoTag = {
                                ID: dataFromdatabase.userID,
                                section: dataFromdatabase.areaName,
                                lastName: dataFromdatabase.lastName,
                                firstName: dataFromdatabase.firstName,
                                departmentName: dataFromdatabase.departmentName,
                                photo: dataFromdatabase.photo,
                                job: dataFromdatabase.job
                            }
                            // console.log(newpeople)
                            wsServer.emit("PersonnelInfo", newpeople);
                        }
                        else {
                            logger.debug("Get people information from database failed!");
                        }
                    }
                }
                if (result.MAC && result.SN) {
                    wsServer.emit("LampInfo", result);
                    var checkIfLampUsed = await checkLamp(prisma, result.MAC, result.SN);
                    if (!checkIfLampUsed) {
                        wsServer.emit("LampAlreadyLogin", true);
                    }
                }
            }
            dataParser.removeAllListeners();
        }
    }


    wsServer.engine.on("connection_error", wsConnectErrorCB);
    return;
}

if (require.main === module) {
    main();
}