const SerialPort = require('@serialport/stream')
const MockBinding = require('@serialport/binding-mock')
const Readline = require('@serialport/parser-readline')
// Issues converting these to ES modules, keep as es5 require syntax
const EmulatedDeviceSerialBinding = require('./EmulatedDeviceSerialBinding.js');
SerialPort.Binding = EmulatedDeviceSerialBinding;

// Setup a new mock serial device that can be the target
async function main () {
	EmulatedDeviceSerialBinding.createPort('/dev/ROBOT', {
	    echo: true,
    	readyData: '\r\nhostname@user:~$ ' // This will append a 'prompt' to the end of each response (like a linux terminal would)
	});

	// // Create a port and enable the echo and recording.
	// MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
	const port = new SerialPort('/dev/ROBOT')

	/* Add some action for incoming data. For example,
	** print each incoming line in uppercase */
	const parser = new Readline()
	port.pipe(parser).on('data', (line) => {
		console.log("New Data Received")
		console.log(line.toUpperCase())
	});

	// wait for port to open...
	port.on('open', () => {
  	// ...then test by simulating incoming data
		port.binding.emitData(
			Buffer.from("Hello, world!\nThis is a test script...\n", "utf-8")
	  	);
		setTimeout(() => {
			port.binding.emitData(
				Buffer.from("cr0123456789ab\n", "utf-8")
			)
		}, 20000)
	});

}

main();