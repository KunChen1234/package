import SerialPort from "serialport";
import parser from "../src/args_parser";

function spErrCB(err: Error | null | undefined): void {
	if (err) {
		console.error(err.message);
		console.log("Unable to write to SerialPort");
	}
	return;
}

function sleep(ms: number): Promise<unknown> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function parseData(data: Buffer | string | null): string | null {
	console.log(data);
	if (data && Buffer.isBuffer(data)) {
		if (data.subarray(0, 4).toString() === "0001") {
			console.log(true);
		}

		data = data.toString();
		// console.log(`Data: ${data}`);
		console.log(`len: ${data.length}`);

		data = Buffer.from(data, "hex");
		// console.log(tmp);
		const index = data.toString().indexOf("}");
		data = data.subarray(12, index+1).toString();
		console.log(`Len: ${data.length}`);
		console.log(data);
		try {
			const tmp = JSON.parse(data);
			console.log(tmp);
			return data;
		} catch (err) {
			console.error("Not Roobuck Tag");
			return null;
		}
		
	} else if (data && typeof data === "string") {
		console.log("String");
		const tmp = Buffer.from(data, "hex");
		return tmp.toString();
	} else {
		return null;
	}
}

// async function readCard(port: SerialPort): Promise<string | null> {
// 	port.write(Buffer.from("20020410\r"));
// 	const cardData = await (port.on("readable", (): string | null => {
// 		const cardData = parseData(port.read());
// 		return cardData;
// 	}));
// 	return cardData;
// }

async function main(): Promise<void> {
	const args = parser(process.argv);
	let _port: string;
	if (args.port && typeof args.port === "string") {
		_port = args.port;
	} else {
		_port = "COM1";
	}
	const port = new SerialPort(_port, {
		baudRate: 9600
	}, function (err: Error | null | undefined): void {
		if (err) {
			console.error(err.message);
			port.close;
		}
		return;
	});

	// port.on("data", (data: Buffer) => {
	// 	console.log("Data Received");
	// 	if (data.toString().slice(0, 4) === "0001") {
	// 		console.log(true);
	// 	}
	// 	// data = data.subarray(4);
	// 	data = Buffer.from(data.toString(), "hex");
	// 	console.log(data.toString());
	// });
	const dataParser = port.pipe(new SerialPort.parsers.Delimiter({ delimiter: "\r", includeDelimiter: false }));
	dataParser.on("data", (data) => {
		const tmp = parseData(data);
		console.log(tmp);
	});

	port.on("error", (err: Error) => {
		console.error(err.message);
	});

	port.on("open", async () => {
		console.log("NFC Scanner Connected");
		// console.log("Get UID");
		port.write(Buffer.from("0008\r"), spErrCB);
		await sleep(1000);
		// console.log(parseData(port.read(16)));
		await sleep(1000);
		console.log("Search Tags");
		port.write(Buffer.from("050010\r"), spErrCB);
		await sleep(1000);
		// console.log(parseData(port.read()));
		await sleep(2000);
		// console.log("Read NTAG Counter");
		// port.write(Buffer.from("2003\r"), spErrCB);
		// await sleep(2000);
		console.log("Read NTAG");
		port.write(Buffer.from("20020410\r"), spErrCB);
		await sleep(1000);
		// console.log(parseData(port.read()));
		// console.log("SNEP Init");
		// port.write(Buffer.from("1800\r"), spErrCB);
		// await sleep(1000);
		// console.log("GET SNEP Conenction State");
		// port.write(Buffer.from("1801\r"), spErrCB);
		// readCard(port);
	});
	return;
}

main();