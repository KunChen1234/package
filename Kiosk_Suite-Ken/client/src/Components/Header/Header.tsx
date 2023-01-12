import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Clock from "./Clock/Clock";


function Header() {

	return (
		<header className=" bg-roobuck-blue text-white shadow-lg items-center ">
			<div className=" p-5 ">
				<h2 className="text-3xl text-center font-bold">Roobuck IoT Kiosk</h2>
				<div className="grid grid-cols-2 gap-4">
					{/* <div>
						<button className="text-left text-xl">Home</button>
					</div> */}
					<div className="text-right text-xl col-end-5"><Clock timer={10000} /></div>
				</div>
			</div>
		</header>
	);
}

export default Header;