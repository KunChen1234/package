"use strict";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import TagScan from "./Components/TagScan/TagScan";
import packageJson from "../package.json";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import UserManagement from "./Components/UserManagement/UserManagement";

ReactDOM.render(
	<React.StrictMode>
		<div className="flex flex-col min-h-screen">
		<Header />
			<main className="flex-grow bg-black text-white">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<App />} />
						<Route path="/tag-scan" element={<TagScan />} />
						<Route path="/usermanagement" element={<UserManagement/>}/>
						{/* <Route path="/error" element={<Error />}/> */}
					</Routes>
				</BrowserRouter>
			</main>
			<Footer version={packageJson.version} />

		</div>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
