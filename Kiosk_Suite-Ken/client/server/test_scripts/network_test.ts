import { networkInterfaces } from "os";

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object
// console.log(nets);
// const netsobj = Object.create(nets);
for (const name of Object.keys(nets)) {
	const netobj = Object.create(nets);
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
console.log(results);