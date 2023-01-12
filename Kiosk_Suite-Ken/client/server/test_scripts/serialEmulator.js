const SerialPort = require('serialport');
const EmulatedDeviceSerialBinding = require('./EmulatedDeviceSerialBinding.js');
SerialPort.Binding = EmulatedDeviceSerialBinding;

// Setup a new mock serial device that can be the target
EmulatedDeviceSerialBinding.createPort('/dev/ROBOT', {
    echo: true,
    readyData: '\r\nhostname@user:~$ ' // This will append a 'prompt' to the end of each response (like a linux terminal would)
});

function main() {
	// DO Something
}