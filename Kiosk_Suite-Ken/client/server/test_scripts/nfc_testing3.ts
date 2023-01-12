import SerialPort from "serialport";
import { PrismaClient } from "@prisma/client";
import parser from "../src/args_parser";
import sleep from "../src/sleep";
import readline from "readline";

// Define Global Scoped Variables

interface RoobuckTag {
	SN: string;
	MAC: string;
}

// eslint-disable-next-line prefer-const
let runLoop = true;
let pending = false;
let readTag = false;
let tagId: string | null = null;
const prisma = new PrismaClient();
const args = parser(process.argv);
let _port: string;
if (args.port && typeof args.port === "string") {
	_port = args.port;
} else {
	_port = "COM1";
}
const port = new SerialPort(_port);
const dataParser = port.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
port.on("open", () => {
	console.log("Port Opened");
});
dataParser.on("data", parseData);


function spErrCB(err: Error | null | undefined): void {
	if (err) {
		console.error(err.message);
		console.log("Unable to write to SerialPort");
	}
	return;
}

async function parseData(data: Buffer) {
	console.log("Data Received");
	console.log(`FreshData: ${data}`);
	pending = true;
	if (data && Buffer.isBuffer(data) && data.subarray(0, 4).toString() === "0001" && data.length > 4) {
		if (readTag && tagId) {
			console.log("Updating Tags With Values");
			readTag = false;
			if (data.subarray(0, 4).toString() === "0001") {
				console.log(true);
			}
			let datastr = data.toString();
			console.log(`Data: ${datastr}`);
			console.log(`len: ${datastr.length}`);

			data = Buffer.from(datastr, "hex");
			// console.log(tmp);
			const index = data.toString().indexOf("}");
			datastr = data.subarray(12, index + 1).toString();
			let dataObj: RoobuckTag | null = null;
			try {
				dataObj = JSON.parse(datastr);

			} catch (err) {
				console.error("Not Roobuck Tag");
			}
			if (!dataObj || !dataObj["MAC"] || !dataObj["SN"]) {
				console.error("Bad Tag Read");
				pending = false;
				tagId = null;
				port.write("0407646009F401F401\r", spErrCB);
				return;
			}
			if (dataObj && dataObj["MAC"] && typeof dataObj["MAC"] === "string") {
				let lastChar = dataObj["MAC"][dataObj["MAC"].length - 1];
				console.log(`Last Character: ${lastChar}`);
				lastChar = (parseInt(lastChar, 16) - 2).toString(16);
				dataObj["MAC"] = dataObj["MAC"].substring(0, dataObj["MAC"].length - 1) + lastChar.toUpperCase();
			}
			console.log(dataObj);
			if (dataObj["MAC"] && dataObj["SN"]) {
				console.log("RFID AND SN Exist");
				const tag = await prisma.rfidTags.upsert({
					where: {
						rfidTagId: tagId
					},
					update: {
						lastScannedTime: new Date(),
						lastScannedLocation: "Roobuck Lab"
					},
					create: {
						rfidTagId: tagId,
						tagType: "Test Tag",
						serialNumber: dataObj["SN"],
						macAddress: dataObj["MAC"],
						lastScannedTime: new Date(),
						lastScannedLocation: "Roobuck Lab"
					}
				});
				port.write("0407646009F401F401\r", spErrCB); // Sound Beeper
				console.log(tag);
			}
			tagId = null;
		} else {
			tagId = data.toString();
			// Add tag to database
			console.log("Creating Tags");
			const tag = await prisma.rfidTags.findFirst({
				where: {
					rfidTagId: tagId
				}
			});
			if (tag && (tag.tagType === "idCard" || tag.tagType === "Roobuck Caplamp" || tag.tagType === "Test Tag")) {
				port.write("0407646009F401F401\r", spErrCB);
			} else {
				readTag = true;
			}
			console.log(tag);
		}
	}
	pending = false;
	return;
}

async function main(): Promise<void> {
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	
	process.stdin.on("keypress", (str, key) => {
		console.log(str);
		if (key.name === "q") {
			runLoop = false;
			console.log("Ending Process. Precess CTRL+C to exit.");
		} else if (key.name === "c" && key.ctrl === true) {
			console.log("Exiting...");
			process.exit(0);
		}
		
	});

	// eslint-disable-next-line no-constant-condition
	while (runLoop) {
		console.log("loop");
		console.log(pending);
		if (readTag) {
			port.write("20020410\r", spErrCB);
			console.log(`Write Tag: ${readTag}, tagId: ${tagId}`);
			setTimeout(() => {
				readTag = false;
				tagId = null;
			}, 5000);
			await sleep(5000);
		} else if (pending) {
			console.log("PENDING");
			console.log(pending);
			await sleep(500);
		} else {
			await sleep(500);
			if (!pending) {
				console.log("SEARCH TAGS");
				port.write("050010\r", spErrCB);
				await sleep(2500);
			}
		}
	}
	return;
}

main();
