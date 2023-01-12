import React from "react";

interface Props {
	version: string
}

function Footer(props: Props) {
	return(
		<footer className=" sticky inset-x-0 bottom-0 bg-roobuck-blue text-white shadow-lg grid grid-cols-2 p-2 ">
			<p className=" text-left text-sm ">Roobuck Pty Ltd </p>
			<p className=" text-right text-sm ">V {props.version} </p>
		</footer>
	);
}

export default Footer;