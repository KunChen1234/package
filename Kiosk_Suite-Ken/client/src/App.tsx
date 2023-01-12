"use strict";
import React, { useEffect, useState } from "react";
// import useWebSocket, { ReadyState } from "react-use-websocket";

import "./App.css";
import Home from "./Components/Home/Home";
import Loading from "./Components/Loading/Loading";
import DeviceTable from "./Components/TagScan/DeviceTable/DeviceTable";
import TagScan from "./Components/TagScan/TagScan";
import useSocket from "./context/socket";
// import io from "./types/socket";

function App() {
	const socket = useSocket();
	
	// const params = useParams();
	const [connStatus, setConnStatus] = useState(socket.connected);

	useEffect(() => {
		socket?.on("connect", () => {
			setConnStatus(socket.connected);
		});

		socket?.on("disconnect", () => {
			console.log("disconnected");
			setConnStatus(socket.connected);
		});

	
		return function socketCleanup() {
			socket?.removeAllListeners("PersonnelInfo");
			socket?.removeAllListeners("disconnect");
			socket?.removeAllListeners("connect");
			return;
		};
	}, [connStatus, socket]);


	if (connStatus) {
		return (
			<div className="">
				<Home />
			</div>
		);
	} else {
		return (
			<Loading />
		);
	}
}

export default App;