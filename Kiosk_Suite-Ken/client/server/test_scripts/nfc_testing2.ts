import SerialPort from "serialport";
import parser from "../src/args_parser";
import sleep from "../src/sleep";

function spErrCB(err: Error | null | undefined): void {
	if (err) {
		console.error(err.message);
		console.log("Unable to write to SerialPort");
	}
	return;
}

function parseData(data: Buffer | string | null): string | null {
	console.log(data);
	if (data && Buffer.isBuffer(data)) {
		// console.log("Buffer");
		if (data.subarray(0,4).toString() === "0001") {
			console.log(true);
		}
		
		data = data.toString();
		// console.log(`Data: ${data}`);
		console.log(`len: ${data.length}`);
		
		data = Buffer.from(data, "hex");
		// console.log(tmp);
		console.log(data.subarray(12,13).toString());
		if (data.subarray(12,13).toString() === "{") {
			console.log("Caplamp");
		} else {
			console.log("Other Tag");
		}
		data = data.toString();
		// eslint-disable-next-line no-control-regex
		return data.replace(/[^\x00-\x7F]/g, "");
	} else if (data && typeof data === "string") {
		console.log("String");
		const tmp = Buffer.from(data, "hex").toString();
		// eslint-disable-next-line no-control-regex
		return tmp.replace(/[^\x00-\x7F]/g, "");
	} else {
		return null;
	}
}

async function main(): Promise<void> {
	let tagReady = false;
	// eslint-disable-next-line prefer-const
	let breakLoop = false;
	const args = parser(process.argv);
	let _port: string;
	if (args.port && typeof args.port === "string") {
		_port = args.port;
	} else {
		_port = "COM1";
	}
	const port = new SerialPort(_port);
	const dataParser = port.pipe(new SerialPort.parsers.Delimiter({delimiter: "\r", includeDelimiter: false}));
	port.on("open", () => {
		console.log("Port Opened");
	});
	dataParser.on("data", (data) => {
		// const data = port.read();
		if (!tagReady && Buffer.isBuffer(data) && data.subarray(0,4).toString() === "0001") {
			tagReady = true;
		} else if (tagReady && Buffer.isBuffer(data) && data.subarray(0,4).toString() === "0001") {
			tagReady = false;
			console.log(data.toString());
			console.log(parseData(data));
		} else {
			if (data && Buffer.isBuffer(data) && data.subarray(0,4).toString() !== "0000") {
				console.log(`Data not parsed: ${data.toString()}`);
			}
		}
	});
	// eslint-disable-next-line no-constant-condition
	while(true) {
		// DO SOMETHING
		console.log("loop");
		if (tagReady) {
			// console.log(scanResult);
			port.write("20020410\r", spErrCB);
			await sleep (5000);
		} else if (breakLoop) {
			break;
		}else {
			port.write("050010\r", spErrCB);
			await sleep(1500);
		}
	}
	return;
}

main();