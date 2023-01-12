"use strict";
import React, { useEffect, useState } from "react";

interface Props {
	visible: boolean;
	message: string;
}

function Error(props: Props) {
	// const state = location.state as State;
	const [isVisible, setIsVesible] = useState(props.visible);
	
	useEffect(()=>{
		setIsVesible(props.visible);
		console.log(`error component rerenderered. visible: ${isVisible}`);
		console.log(`Props input: ${props.visible}`);
	}, [props.visible]);

	// function closeMessage() {
	// 	setIsVesible(false);
	// }
	return (
		<div className={`overflow-auto \
			z-30 \
			h-2/6 \
			w-2/12 \
			mx-auto \
			p-5 \
			border-5 \
			border-red-900 \
			rounded-xl \
			bg-white \
			text-center \
			text-black \
			content-center \
			absolute \
			top-1/2 \
			left-1/2 \
			transform \
			-translate-x-1/2 \
			-translate-y-1/2 \
			${isVisible ? "visible" : "invisible"}`
		}>
			<h1 className=" text-3xl font-bold text-red-900 ">Error</h1>
			<p>{props.message}</p>
			{/* <button onClick={closeMessage}>OK</button> */}
		</div>
	);
}

export default Error;