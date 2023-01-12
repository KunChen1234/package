#!/usr/bin/env node
import { Server } from "socket.io";
import http from "http";
import { v4 as uuid } from "uuid";

interface deviceData {
	serialNumber: string;
	macAddress: string;
	deviceId: string;
}

interface ServerToClientEvents {
	noArg: () => void;
	userScanData: (
		tagData: {
			userName: string,
			userId: string,
			associatedDevices: string[]
		}
	) => void;
	assetScanData: (
		rfidTagData: string,
		assetType: string,
		lastScannedTime: Date,
		lastScannedLocation: string,
		serialNumber?: string,
		macAddress?: string,
		assignedUser?: string
	) => void;
}
interface ClientToServerEvents {
	hello: () => void;
	fakeTag: (
		fakeTag: {
			userName: string,
			userId: string,
			associatedDevices: string[]
		}
	) => void;
	removeDevice: (serialNumber: string, data: deviceData[]) => deviceData[];
}
interface InterServerEvents {
	ping: () => void;
}
interface SocketData {
	id: string;
	timeOfConnection: Date;
}

const httpServer = http.createServer(function (request, response) {
	console.log((new Date()) + " Received request for " + request.url);
	response.writeHead(404);
	response.end();
});

const wsServer = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
});

async function loopForever(i: number): Promise<void> {
	console.log(`New Loop! i is ${i}`);
	console.log(Array.from(wsServer.sockets.sockets.keys()));
	if (typeof i !== "number") {
		console.error("Input must be number!");
		return;
	} else {
		// client.send({"i": i, "ts": new Date()}, (err: unknown) => {
		// 	console.error(err);
		//     console.error("Unable to send packet");
		// });
		console.log(wsServer.engine.clientsCount);
		i++;
		setTimeout(() => {
			loopForever(i);
		}, 1000);
	}
}

wsServer.on("connect", function (client) {
	console.log(`New Client ${client.id} connected!`);
	// client.emit("noArg");
	// client.on("event", (event) => {
	// 	console.log(event);
	// });
	client.data.id = uuid();
	client.data.timeOfConnection = new Date();
	console.log(`New id ${client.data.id} generated at ${client.data.timeOfConnection.toLocaleString()}`);
	client.on("fakeTag", (fakeTag) => {
		console.log(JSON.stringify(fakeTag));
		client.emit("userScanData", fakeTag);
	});
	client.on("removeDevice", (serialNumber: string, data: deviceData[]) => {
		console.log(serialNumber);
		data.filter(item => item.serialNumber !== serialNumber);
		return data;
	});
	client.on("disconnect", () => {
		console.log(`Client ${client.id} disconnected`);
	});
});

wsServer.engine.on("connection_error", console.error);
loopForever(0);
wsServer.listen(14000);