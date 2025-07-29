"use client";

import { useEffect, useState } from "react";

const DIGITS = {
	"0": [1, 2, 3, 5, 6, 7],
	"1": [2, 3],
	"2": [1, 2, 4, 5, 7],
	"3": [1, 2, 3, 4, 7],
	"4": [2, 3, 4, 6],
	"5": [1, 3, 4, 6, 7],
	"6": [1, 3, 4, 5, 6, 7],
	"7": [1, 2, 3],
	"8": [1, 2, 3, 4, 5, 6, 7],
	"9": [1, 2, 3, 4, 6, 7],
};

function SevenSegmentDigit({ value }: { value: string }) {
	const segments = DIGITS[value as keyof typeof DIGITS] || [];
	return (
		<div className="seven-segment-digit">
			{[1, 2, 3, 4, 5, 6, 7].map((segment) => (
				<span
					key={segment}
					className={segments.includes(segment) ? "on" : ""}
				/>
			))}
		</div>
	);
}

function Colon() {
	return (
		<div className="seven-segment-colon">
			<span />
			<span />
		</div>
	);
}

export function Clock() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const hours = time.getHours().toString().padStart(2, "0");
	const minutes = time.getMinutes().toString().padStart(2, "0");
	const seconds = time.getSeconds().toString().padStart(2, "0");

	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center bg-[#000B14]">
			<div className="scale-[0.35] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.85] 2xl:scale-100">
				<div className="seven-segment-display">
					<SevenSegmentDigit value={hours[0]} />
					<SevenSegmentDigit value={hours[1]} />
					<Colon />
					<SevenSegmentDigit value={minutes[0]} />
					<SevenSegmentDigit value={minutes[1]} />
					<Colon />
					<SevenSegmentDigit value={seconds[0]} />
					<SevenSegmentDigit value={seconds[1]} />
				</div>
			</div>
			<div className="mt-8 font-mono text-muted-foreground/60">
				{time.toLocaleDateString("en-GB", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
				})}
			</div>
		</div>
	);
}
