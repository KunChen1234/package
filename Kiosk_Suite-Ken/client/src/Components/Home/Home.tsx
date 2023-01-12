import React, { useEffect, useState } from "react";
import useSocket from "../../context/socket";
import Error from "../Error/Error";
import Waring_AlreadyLogin from "../Warning/Warning";
import { useNavigate } from "react-router-dom";

function Home() {
	// props.sendMessageCB is SendJsonMessage;
	const socket = useSocket();
	const [errorVisibility, setErrorVisibility] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();
	const [connStatus, setConnStatus] = useState(socket.connected);
	useEffect(() => {
		socket.on("disconnect", () => {
			console.log("Disconnected");
			setErrorMessage("Connection Lost. Please Restart Service.");
			setErrorVisibility(true);
		});
		socket.on("connect", () => {
			console.log("Connected");
			setErrorMessage("");
			setErrorVisibility(false);
		});
		socket?.on("PersonnelInfo", (msg) => {
			navigate("/tag-scan", { state: { userData: msg, associatedDevices: undefined, conn: connStatus } });
		});
		socket?.on("userManagement", (msg) => {
			console.log("already login")
			console.log(msg)
			console.log(msg.lamp.MAC)
			navigate("/usermanagement", {
				state: {
					userData: msg.person, Devices: {
						MAC: msg.lamp.MAC,
						SN: msg.lamp.SN
					}, conn: connStatus
				}
			});
		})
		return function socketCleanup() {
			socket?.removeAllListeners("connect");
			socket?.removeAllListeners("disconnect");
			socket?.removeAllListeners("userAlreadyLogin");
		};
	});

	function wsSend() {
		console.log("Button Clicked");
	}
	return (
		<div className=" pt-40 text-center ">
			<Error visible={errorVisibility} message={errorMessage} />
			<h1 className=" text-5xl ">Welcome!</h1>
			<h2 className=" text-4xl ">Scan ID Card to Begin.</h2>
			<div className=" p-20 " >
				<button
					className=" p-2 bg-roobuck-onyx max-w-sm mx-auto rounded-xl shadow-lg space-x-4 hover:bg-neutral-800 active:bg-neutral-900 "
					onClick={wsSend}
				>
					User Management
				</button>
			</div>
		</div>
	);
}

export default Home;