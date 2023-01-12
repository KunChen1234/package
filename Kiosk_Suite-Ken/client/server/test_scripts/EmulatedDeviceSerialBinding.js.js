const MockSerialBinding = require('@serialport/binding-mock');

class EmulatedDeviceSerialBinding extends MockSerialBinding {
    constructor(opt = {}) {
        super(opt);
    }

    // THIS IS THE METHOD THAT GETS TRIGGERED WHEN THE CODE TO TEST WRITES TO A DEVICE
    async write(buffer) {
        // Use this method to detect the supported commands and emulate a response
        const cmd = Buffer.from(buffer).toString();

        let response = 'Unknown Command!'; // Default response

        // Custom logic here to determine the proper response

        super.emitData(response);
    }
}

module.exports = EmulatedDeviceSerialBinding;