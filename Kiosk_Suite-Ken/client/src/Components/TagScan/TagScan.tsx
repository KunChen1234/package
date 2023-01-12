import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSocket from "../../context/socket";
import Waring_AlreadyLogin from "../Warning/Warning";
import TableButton from "./DeviceTable/DeviceTable";
import UserTag from "./UserTag";

interface State {
	conn: boolean
	userData: io.UserIdTag
	associatedDevices: io.DeviceInfo[]
}

function TagScan() {

	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as State;
	const [userData, setUserData] = useState(state.userData);
	const [deviceInfo, setDeviceInfo] = useState<io.DeviceInfo>();
	const socket = useSocket();
	const [warningVisibility, setWarningVisibility] = useState<boolean>(false);
	const [warning, setWarning] = useState<string>("adasfsgasdfgasdfgasdf");

	useEffect(() => {
		socket?.on("LampAlreadyLogin", (msg) => {
			if (msg) {
				setWarningVisibility(true);
				setWarning("Device has already been used!");
			}
		})
		socket?.on("PersonnelInfo", (msg) => {
			console.log(msg);
			setUserData(msg);
			console.log(msg.ID);
		});
		socket?.on("LampInfo", (msg) => {
			setDeviceInfo(msg);
			console.log(msg);
		});
		return function socketCleanup() {
			socket?.removeAllListeners("LampAlreadyLogin");
			socket?.removeAllListeners("PersonnelInfo");
			socket?.removeAllListeners("LampInfo");
		};
	}, [socket, deviceInfo, userData]);
	// useEffect(() => {
	// 	const timerID = setInterval(() => returnHome(), 30000);
	// 	return function cleanup() {
	// 		clearInterval(timerID);
	// 	};
	// });

	function returnHome() {
		navigate("/");
	}

	function Submit() {
		if (!warningVisibility) {
			if (userData != null && deviceInfo != null) {
				socket.emit("getNewSignInInfo", userData, deviceInfo);
				navigate("/");
			}
			else {
				setWarningVisibility(true);
				setWarning("No ID Card or Devices!")
			}

		}
	}
	function closeWaringPop() {
		setDeviceInfo(undefined);
		setWarningVisibility(false);
	}
	return (
		<div className="min-h-full">
			<button onClick={returnHome}>Home</button>
			<Waring_AlreadyLogin close={() => closeWaringPop()} warning={warning} warningIsVisible={warningVisibility}></Waring_AlreadyLogin>
			<div className="flex flex-col min-h-[30rem]">
				<div className="flex-grow p-5 grid grid-cols-2 gap-4 ">
					<h1 className="col-span-2 row-start-1 text-center text-3xl"><strong>Scan Device to Pair</strong></h1>
					<div className=" row-start-3  text-center justify-center">

						{/* <table className="w-[20rem] justify-center content-center ">
							<thead className="bg-gray-500">
								<tr>
									<th colSpan={2}>User Information</th>
								</tr>
							</thead>
							<tbody >
								<tr>
									<td><strong>Name:</strong></td>
									<td className="text-right">{userData.firstName + "" + userData.lastName}</td>
								</tr>
								<tr>
									<td><strong>User ID:</strong></td>
									<td className="text-right">{userData.ID}</td>
								</tr>
							</tbody>
						</table> */}
						{UserTag(userData)}
					</div>
					<div className=" row-start-3 content-center justify-center ">
						<TableButton
							buttonName="Unpair Device"
							tableName="Associated Devices"
							data={deviceInfo}
							className=""
							remove={()=>setDeviceInfo(undefined)}
						/>
					</div>
				</div>
			</div>
			<div className="bottom-0 content-center justify-center text-center">
				<button
					className=" p-2 bg-roobuck-onyx max-w-sm mx-auto rounded-xl shadow-lg space-x-4 hover:bg-neutral-800 active:bg-neutral-900 content-center"
					onClick={Submit}
				>
					Finish
				</button>
			</div>
		</div>
	);
}

export default TagScan;