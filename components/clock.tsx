"use client";

import { useEffect, useState } from "react";

export function Clock() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center space-y-8 p-8">
			<div className="text-center">
				<div className="text-6xl font-bold tabular-nums tracking-tighter md:text-8xl lg:text-9xl">
					{time.toLocaleTimeString("en-GB", {
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
						hour12: false,
					})}
				</div>
				<div className="mt-4 text-2xl text-muted-foreground md:text-3xl">
					{time.toLocaleDateString("en-GB", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</div>
			</div>
		</div>
	);
}
