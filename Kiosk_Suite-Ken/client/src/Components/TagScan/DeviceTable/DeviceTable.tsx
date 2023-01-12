import React from "react";
import useSocket from "../../../context/socket";

interface Props {
	tableName: string
	buttonName: string
	className: string
	data?: io.DeviceInfo;
	remove:()=>void;
}

function DeviceTable(props: Props) {
	const socket = useSocket();
	function removeDevice(serialNumber: string, data?: io.DeviceInfo[]) {
		socket?.emit("removeDevice", serialNumber, data);
		return;
	}
	if (props.data) {
		return (
			<div className=" min-w-full overflow-auto">
				<table className="table-fixed h-9 overflow-hidden justify-content content-center min-w-full">
					<thead className="bg-gray-500">
						<tr>
							<th colSpan={3}>{props.tableName}</th>
						</tr>
						<tr>
							{/* <th>Device ID</th> */}
							<th>Serial Number</th>
							<th>MAC Address</th>
							<th>Unpair?</th>
						</tr>
					</thead>
					<tbody className="h-9 overflow-y-hidden text-white" >
						<tr key="">
							{/* <td className="text-center"><strong>{listValue.deviceId}</strong></td> */}
							<td className="text-center"><strong>{props.data.SN}</strong></td>
							<td className="text-center"><strong>{props.data.MAC}</strong></td>
							<td className="text-center">
								<button
									className="p-2 bg-roobuck-onyx max-w-sm mx-auto rounded-xl shadow-lg space-x-4 hover:bg-neutral-800 active:bg-neutral-900"
									onClick={props.remove}
								>
									{props.buttonName}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	} else {
		return (
			<div className=" min-w-full overflow-auto">
				<table className="table-fixed h-9 justify-content content-center min-w-full ">
					<thead className="bg-gray-500">
						<tr>
							<th colSpan={4}>{props.tableName}</th>
						</tr>
						<tr>
							{/* <th>Device ID</th> */}
							<th>Serial Number</th>
							<th>MAC Address</th>
							<th>Unpair?</th>
						</tr>
					</thead>
				</table>
			</div>
		);
	}
}

export default DeviceTable;