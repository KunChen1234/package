import React, { useEffect, useState } from "react";
import useSocket from "../../context/socket";
import Error from "../Error/Error";

function Loading() {
	const [errorIsVisible, setErrorIsVisible] = useState(false);
	const socket = useSocket();
	useEffect(() => {
		const timerID = setInterval( () => {
			if (!socket.connected) {
				setErrorIsVisible(true);
			}
		}, 10000 );
		// console.log("Clock Updated");
		return function clockCleanup() {
			clearInterval(timerID);
		};
	});

	return(
		<div>
			<h1 className={
				`text-3xl \
				content-center \
				z-30 \
				h-2/6 \
				w-2/12 \
				mx-auto \
				p-5 \
				absolute \
				top-1/2 \
				left-1/2 \
				transform \
				-translate-x-1/2 \
				-translate-y-1/2 \
				${!errorIsVisible ? "visible" : "invisible"}`
			}>
				Loading...
			</h1>
			<Error visible={errorIsVisible} message={"Could not establish connection."}/>
		</div>
	);
}

export default Loading;