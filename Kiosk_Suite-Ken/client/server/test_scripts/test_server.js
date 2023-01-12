#!/usr/bin/env node
"use strict";
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
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const uuid_1 = require("uuid");
const httpServer = http_1.default.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const wsServer = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
function loopForever(i) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`New Loop! i is ${i}`);
        if (typeof i !== "number") {
            console.error("Input must be number!");
            return;
        }
        else {
            // client.send({"i": i, "ts": new Date()}, (err: unknown) => {
            // 	console.error(err);
            //     console.error("Unable to send packet");
            // });
            console.log(wsServer.engine.clientsCount);
            i++;
            setTimeout(() => {
                loopForever(i);
            }, 10000);
        }
    });
}
wsServer.on("connect", function (client) {
    console.log(`New Client ${client.id} connected!`);
    // client.emit("noArg");
    // client.on("event", (event) => {
    // 	console.log(event);
    // });
    client.data.id = (0, uuid_1.v4)();
    client.data.timeOfConnection = new Date();
    console.log(`New id ${client.data.id} generated at ${client.data.timeOfConnection.toLocaleString()}`);
    client.on("fakeTag", (fakeTag) => {
        console.log(JSON.stringify(fakeTag));
        client.emit("userScanData", fakeTag);
    });
    client.on("disconnect", () => {
        console.log(`Client ${client.id} disconnected`);
    });
});
wsServer.engine.on("connection_error", console.error);
loopForever(0);
wsServer.listen(14000);
//# sourceMappingURL=test_server.js.map