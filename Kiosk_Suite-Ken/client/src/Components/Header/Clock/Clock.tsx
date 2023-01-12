import React, { useEffect, useState } from "react";
interface Props {
	timer: number
}

function Clock(props: Props) {
	const [date, setDate] = useState(new Date());
	useEffect(() => {
		const timerID = setInterval( () => tick(), props.timer );
		// console.log("Clock Updated");
		return function clockCleanup() {
			clearInterval(timerID);
		};
	});
	function tick() {
		setDate(new Date());
		// console.log(`Time is ${date}`);
	}
	
	return (
		<div className="Clock">
			<h3>{new Intl.DateTimeFormat("en-UK", {year: "numeric", month: "2-digit",day: "2-digit", hour: "2-digit", minute: "2-digit"}).format(date)}</h3>
		</div>
	);
}

export default Clock;